export const runtime = 'nodejs'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')
  const portfolioId = searchParams.get('portfolio_id')
  const type = searchParams.get('type')

  if (!sessionId || !portfolioId) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId)
  if (session.payment_status !== 'paid') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const userId = session.metadata?.user_id

  if (type === 'launch' || type === 'bundle') {
    // Publish the portfolio
    await supabase.from('portfolios')
      .update({ 
        is_published: true,
        html_content: await getHtmlWithoutWatermark(supabase, portfolioId)
      })
      .eq('id', portfolioId)

    // Give bundle users 3 regen credits
    if (type === 'bundle') {
      await supabase.from('profiles')
        .update({ regen_credits: 3 })
        .eq('id', userId)
    }
  }

  if (type === 'regen') {
    // Add 1 regen credit
    const { data: profile } = await supabase
      .from('profiles').select('regen_credits').eq('id', userId).single()
    const current = profile?.regen_credits || 0
    await supabase.from('profiles')
      .update({ regen_credits: current + 1 })
      .eq('id', userId)
  }

  // Record payment
  await supabase.from('payments').insert({
    user_id: userId,
    portfolio_id: portfolioId,
    type,
    amount: type === 'launch' ? 499 : type === 'regen' ? 399 : 999,
    stripe_session_id: sessionId,
  }).select()

  return NextResponse.redirect(new URL('/dashboard/portfolio/' + portfolioId + '?success=' + type, request.url))
}

async function getHtmlWithoutWatermark(supabase: any, portfolioId: string) {
  const { data } = await supabase
    .from('portfolios').select('html_content').eq('id', portfolioId).single()
  
  let html = data?.html_content || ''
  // Remove watermark
  html = html.replace(/<div[^>]*portfolioai-watermark[^>]*>.*?<\/div>/g, '')
  html = html.replace(/<!-- watermark -->.*?<!-- end watermark -->/g, '')
  return html
}
