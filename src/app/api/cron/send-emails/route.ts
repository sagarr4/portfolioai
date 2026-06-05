export const runtime = 'nodejs'
export const maxDuration = 60

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { email24h, email3d, email7d } from '@/lib/email/templates'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const now = new Date()
  const h24 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const h72 = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString()
  const h168 = new Date(now.getTime() - 168 * 60 * 60 * 1000).toISOString()

  const sent = { e24: 0, e3d: 0, e7d: 0, errors: [] as string[] }

  async function sendEmail(user: any, template: (n: string, u: string) => any, column: string, counter: 'e24' | 'e3d' | 'e7d') {
    if (!user.email) return
    if (user.email === 'sagarbmw1@gmail.com') return

    const { data: portfolios } = await supabase
      .from('portfolios').select('slug').eq('user_id', user.id).limit(1)
    if (!portfolios?.[0]) return

    const { count: paymentCount } = await supabase
      .from('payments').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    if ((paymentCount || 0) > 0) return

    const name = user.full_name?.split(' ')[0] || 'there'
    const url = 'https://portfolioai.company/dashboard'
    const { subject, html } = template(name, url)

    try {
      await resend.emails.send({
        from: 'Sagar <hello@portfolioai.company>',
        replyTo: 'sagarbmw1@gmail.com',
        to: user.email,
        subject,
        html,
      })
      await supabase.from('profiles')
        .update({ [column]: now.toISOString() })
        .eq('id', user.id)
      sent[counter]++
      await new Promise(r => setTimeout(r, 500))
    } catch (err: any) {
      sent.errors.push(counter + ' ' + user.email + ': ' + err.message)
    }
  }

  // 24h email: signed up 24-72h ago, no 24h/3d/7d email sent yet
  const { data: users24h } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .lt('created_at', h24)
    .gt('created_at', h72)
    .is('email_24h_sent', null)
    .is('email_3d_sent', null)
    .is('email_7d_sent', null)
    .limit(50)
  for (const u of users24h || []) await sendEmail(u, email24h, 'email_24h_sent', 'e24')

  // 3d email: signed up 72-168h ago, no 3d/7d sent yet (may have gotten 24h)
  const { data: users3d } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .lt('created_at', h72)
    .gt('created_at', h168)
    .is('email_3d_sent', null)
    .is('email_7d_sent', null)
    .limit(50)
  for (const u of users3d || []) await sendEmail(u, email3d, 'email_3d_sent', 'e3d')

  // 7d email: signed up >168h ago, no 7d sent yet
  const { data: users7d } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .lt('created_at', h168)
    .is('email_7d_sent', null)
    .limit(50)
  for (const u of users7d || []) await sendEmail(u, email7d, 'email_7d_sent', 'e7d')

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    sent
  })
}
