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
  const h24 = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const h72 = new Date(now.getTime() - 72 * 60 * 60 * 1000)
  const h168 = new Date(now.getTime() - 168 * 60 * 60 * 1000)

  const sent = { e24: 0, e3d: 0, e7d: 0, errors: [] as string[] }

  async function sendNudge(template: (n: string, u: string) => any, ageColumn: 'email_24h_sent' | 'email_3d_sent' | 'email_7d_sent', maxAgeDate: Date, counter: 'e24' | 'e3d' | 'e7d') {
    const { data: users } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .lt('created_at', maxAgeDate.toISOString())
      .is(ageColumn, null)
      .limit(50)

    for (const user of users || []) {
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
          .update({ [ageColumn]: now.toISOString() })
          .eq('id', user.id)
        sent[counter]++
        await new Promise(r => setTimeout(r, 500))
      } catch (err: any) {
        sent.errors.push(counter + ' ' + user.email + ': ' + err.message)
      }
    }
  }

  // Run in sequence: oldest cohort first (7d), then 3d, then 24h
  // This way users get the right email even if cron missed previous runs
  await sendNudge(email7d, 'email_7d_sent', h168, 'e7d')
  await sendNudge(email3d, 'email_3d_sent', h72, 'e3d')
  await sendNudge(email24h, 'email_24h_sent', h24, 'e24')

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    sent
  })
}
