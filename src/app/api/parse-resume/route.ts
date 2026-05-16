export const runtime = 'nodejs'
import { createClient } from '@/lib/supabase/server'
import { extractTextFromPdf } from '@/lib/ai/extractPdf'
import { parseResume } from '@/lib/ai/parseResume'
import { generatePortfolioHTML } from '@/lib/ai/generatePortfolio'
import { NextResponse } from 'next/server'

const WATERMARK = '<!-- watermark --><div id="portfolioai-watermark" style="position:fixed;bottom:0;left:0;right:0;z-index:99999;background:rgba(12,10,8,.96);border-top:1px solid rgba(201,169,110,.2);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;font-family:sans-serif;gap:16px;"><span style="font-size:13px;color:rgba(245,240,232,.7);">Preview only — <strong style="color:#c9a96e;font-weight:600;">Launch for $4.99</strong> to share</span><a href="/pricing" style="background:#c9a96e;color:#0c0a08;padding:9px 22px;border-radius:3px;font-size:13px;font-weight:700;text-decoration:none;">Launch now</a></div><!-- end watermark -->'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // STRICT PAYMENT ENFORCEMENT
    const allowedEmails = (process.env.ALLOWED_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
    const userEmail = (user.email || '').toLowerCase()
    const isWhitelisted = allowedEmails.includes(userEmail)

    console.log('Upload check - User:', userEmail, 'Whitelisted:', isWhitelisted)

    if (!isWhitelisted) {
      // Count existing portfolios
      const { count: portfolioCount, error: countError } = await supabase
        .from('portfolios')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      console.log('Portfolio count for user:', portfolioCount, 'Error:', countError?.message)

      if ((portfolioCount || 0) >= 1) {
        // Check if user has ANY successful payment
        const { data: payments, error: payError } = await supabase
          .from('payments')
          .select('id, type')
          .eq('user_id', user.id)

        console.log('Payments found:', payments?.length, 'Error:', payError?.message)

        const hasAnyPayment = payments && payments.length > 0

        if (!hasAnyPayment) {
          return NextResponse.json({
            error: 'PAYMENT_REQUIRED',
            message: 'Launch your first portfolio for $4.99 before creating another one.',
          }, { status: 402 })
        }

        // Check plan limits for paid users
        const launchPayments = payments.filter(p => p.type === 'launch' || p.type === 'bundle').length
        const maxAllowed = launchPayments + 1 // 1 free + 1 per launch payment

        if ((portfolioCount || 0) >= maxAllowed) {
          return NextResponse.json({
            error: 'PAYMENT_REQUIRED',
            message: 'Launch this portfolio for $4.99 to create another one.',
          }, { status: 402 })
        }
      }
    }

    const formData = await request.formData()
    const file = formData.get('resume') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    if (file.type !== 'application/pdf') return NextResponse.json({ error: 'PDF only' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Max 5MB' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const text = await extractTextFromPdf(buffer)
    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: 'Could not read PDF text' }, { status: 400 })
    }

    const parsed = await parseResume(text)
    let htmlContent = await generatePortfolioHTML(parsed)

    htmlContent = htmlContent.includes('</body>')
      ? htmlContent.replace('</body>', WATERMARK + '</body>')
      : htmlContent + WATERMARK

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
        is_published: false,
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
