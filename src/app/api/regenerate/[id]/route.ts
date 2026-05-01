export const runtime = 'nodejs'
import { createClient } from '@/lib/supabase/server'
import { generatePortfolioHTML } from '@/lib/ai/generatePortfolio'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: portfolio } = await supabase
    .from('portfolios').select('*')
    .eq('id', id).eq('user_id', user.id).single()
  if (!portfolio) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const allowedEmails = (process.env.ALLOWED_EMAILS || '').split(',').map(e => e.trim())
  const isWhitelisted = allowedEmails.includes(user.email || '')

  if (!isWhitelisted) {
    const { data: profile } = await supabase
      .from('profiles').select('regen_credits').eq('id', user.id).single()
    const credits = profile?.regen_credits || 0
    if (credits <= 0) {
      return NextResponse.json({ 
        error: 'PAYMENT_REQUIRED',
        message: 'Purchase a new design for $3.99 to regenerate'
      }, { status: 402 })
    }
    await supabase.from('profiles')
      .update({ regen_credits: credits - 1 })
      .eq('id', user.id)
  }

  try {
    const parsed = portfolio.portfolio_data
    const htmlContent = await generatePortfolioHTML(parsed)
    const watermark = `<!-- watermark --><div id="portfolioai-watermark" style="position:fixed;bottom:0;left:0;right:0;z-index:99999;background:rgba(12,10,8,.96);border-top:1px solid rgba(201,169,110,.2);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;font-family:sans-serif;"><span style="font-size:13px;color:rgba(245,240,232,.6);">Preview only — <strong style="color:#c9a96e;">Launch for $4.99</strong> to share</span><a href="/pricing" style="background:#c9a96e;color:#0c0a08;padding:8px 20px;border-radius:3px;font-size:13px;font-weight:600;text-decoration:none;">Launch now</a></div><!-- end watermark -->`
    const html = htmlContent.includes('</body>') ? htmlContent.replace('</body>', watermark + '</body>') : htmlContent + watermark
    await supabase.from('portfolios')
      .update({ html_content: html, is_published: false })
      .eq('id', id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Regen error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}