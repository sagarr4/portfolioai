export const runtime = 'nodejs'
export const maxDuration = 60

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { email24h, email3d, email7d } from '@/lib/email/templates'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const now = new Date()
  const h24 = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const h36 = new Date(now.getTime() - 36 * 60 * 60 * 1000)
  const h72 = new Date(now.getTime() - 72 * 60 * 60 * 1000)
  const h84 = new Date(now.getTime() - 84 * 60 * 60 * 1000)
  const h168 = new Date(now.getTime() - 168 * 60 * 60 * 1000)
  const h180 = new Date(now.getTime() - 180 * 60 * 60 * 1000)

  const sent = { e24: 0, e3d: 0, e7d: 0, errors: [] as string[] }

  // ===== 24 HOUR EMAIL =====
  // Users who signed up between 24-36 hours ago, have a portfolio, no payments, not yet emailed
  const { data: users24h } = await supabase
    .from('profiles')
    .select('id, email, full_name, created_at')
    .lt('created_at', h24.toISOString())
    .gt('created_at', h36.toISOString())
    .is('email_24h_sent', null)
    .limit(50)

  for (const user of users24h || []) {
    if (!user.email) continue
    if (user.email === 'sagarbmw1@gmail.com') continue

    const { data: portfolios } = await supabase
      .from('portfolios').select('slug').eq('user_id', user.id).limit(1)
    if (!portfolios?.[0]) continue

    const { count: paymentCount } = await supabase
      .from('payments').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if ((paymentCount || 0) > 0) continue

    const name = user.full_name?.split(' ')[0] || 'there'
    const url = 'https://portfolioai.company/dashboard'
    const { subject, html } = email24h(name, url)

    try {
      await resend.emails.send({
        from: 'Sagar <hello@portfolioai.company>',
        replyTo: 'sagarbmw1@gmail.com',
        to: user.email,
        subject,
        html,
      })
      await supabase.from('profiles')
        .update({ email_24h_sent: now.toISOString() })
        .eq('id', user.id)
      sent.e24++
      await new Promise(r => setTimeout(r, 500))
    } catch (err: any) {
      sent.errors.push('24h ' + user.email + ': ' + err.message)
    }
  }

  // ===== 3 DAY EMAIL =====
  const { data: users3d } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .lt('created_at', h72.toISOString())
    .gt('created_at', h84.toISOString())
    .is('email_3d_sent', null)
    .limit(50)

  for (const user of users3d || []) {
    if (!user.email) continue
    if (user.email === 'sagarbmw1@gmail.com') continue

    const { data: portfolios } = await supabase
      .from('portfolios').select('slug').eq('user_id', user.id).limit(1)
    if (!portfolios?.[0]) continue

    const { count: paymentCount } = await supabase
      .from('payments').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if ((paymentCount || 0) > 0) continue

    const name = user.full_name?.split(' ')[0] || 'there'
    const url = 'https://portfolioai.company/dashboard'
    const { subject, html } = email3d(name, url)

    try {
      await resend.emails.send({
        from: 'Sagar <hello@portfolioai.company>',
        replyTo: 'sagarbmw1@gmail.com',
        to: user.email,
        subject,
        html,
      })
      await supabase.from('profiles')
        .update({ email_3d_sent: now.toISOString() })
        .eq('id', user.id)
      sent.e3d++
      await new Promise(r => setTimeout(r, 500))
    } catch (err: any) {
      sent.errors.push('3d ' + user.email + ': ' + err.message)
    }
  }

  // ===== 7 DAY EMAIL =====
  const { data: users7d } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .lt('created_at', h168.toISOString())
    .gt('created_at', h180.toISOString())
    .is('email_7d_sent', null)
    .limit(50)

  for (const user of users7d || []) {
    if (!user.email) continue
    if (user.email === 'sagarbmw1@gmail.com') continue

    const { data: portfolios } = await supabase
      .from('portfolios').select('slug').eq('user_id', user.id).limit(1)
    if (!portfolios?.[0]) continue

    const { count: paymentCount } = await supabase
      .from('payments').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if ((paymentCount || 0) > 0) continue

    const name = user.full_name?.split(' ')[0] || 'there'
    const url = 'https://portfolioai.company/dashboard'
    const { subject, html } = email7d(name, url)

    try {
      await resend.emails.send({
        from: 'Sagar <hello@portfolioai.company>',
        replyTo: 'sagarbmw1@gmail.com',
        to: user.email,
        subject,
        html,
      })
      await supabase.from('profiles')
        .update({ email_7d_sent: now.toISOString() })
        .eq('id', user.id)
      sent.e7d++
      await new Promise(r => setTimeout(r, 500))
    } catch (err: any) {
      sent.errors.push('7d ' + user.email + ': ' + err.message)
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    sent
  })
}
