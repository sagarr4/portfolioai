export const runtime = 'nodejs'
import { createClient } from '@/lib/supabase/server'
import { extractTextFromPdf } from '@/lib/ai/extractPdf'
import { parseResume } from '@/lib/ai/parseResume'
import { generatePortfolioHTML } from '@/lib/ai/generatePortfolio'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check plan limits
    const allowedEmails = (process.env.ALLOWED_EMAILS || '').split(',').map(e => e.trim())
    const isWhitelisted = allowedEmails.includes(user.email || '')

    if (!isWhitelisted) {
      const { data: profile } = await supabase
        .from('profiles').select('plan').eq('id', user.id).single()
      
      const plan = profile?.plan || 'free'
      const limits: Record<string, number> = { free: 1, pro: 3, team: 999 }
      const limit = limits[plan] || 1

      const { count } = await supabase
        .from('portfolios')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if ((count || 0) >= limit) {
        return NextResponse.json({ 
          error: 'UPGRADE_REQUIRED',
          message: plan === 'free' 
            ? 'Free plan allows 1 portfolio. Upgrade to Pro for 3 portfolios.'
            : 'You have reached your portfolio limit. Upgrade to Team for unlimited.',
          plan,
          limit
        }, { status: 403 })
      }
    }


    const formData = await request.formData()
    const file = formData.get('resume') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    if (file.type !== 'application/pdf') return NextResponse.json({ error: 'PDF only' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Max 5MB' }, { status: 400 })

    // Extract text from PDF
    const buffer = Buffer.from(await file.arrayBuffer())
    const text = await extractTextFromPdf(buffer)
    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: 'Could not read PDF text' }, { status: 400 })
    }

    // Parse with Claude Haiku
    const parsed = await parseResume(text)

    // Generate full portfolio HTML with Claude Sonnet
    const htmlContent = await generatePortfolioHTML(parsed)

    // Save to database
    const slug = parsed.name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50) + '-' + Date.now()

    const { data: portfolio, error: dbError } = await supabase
      .from('portfolios')
      .insert({
        user_id: user.id,
        title: parsed.name + "'s Portfolio",
        slug,
        field: parsed.field,
        field_confidence: parsed.field_confidence,
        theme: parsed.theme,
        portfolio_data: parsed,
        html_content: htmlContent,
        is_published: true,
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB error:', dbError)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({ success: true, portfolio, parsed })
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Failed to process resume' }, { status: 500 })
  }
}