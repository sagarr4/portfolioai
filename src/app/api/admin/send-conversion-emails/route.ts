export const runtime = 'nodejs'
export const maxDuration = 60

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

function emailTemplate(name: string) {
  return {
    subject: `${name}, quick favor`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:6px;padding:40px;">
        <tr><td style="font-size:15px;line-height:1.6;color:#1a1a1a;">
          <p style="margin:0 0 16px;">Hey ${name},</p>
          
          <p style="margin:0 0 16px;">Sagar here. You signed up to PortfolioAI back when I was testing it out, and I wanted to drop you a personal note.</p>
          
          <p style="margin:0 0 16px;">Your portfolio is still sitting in preview mode. I am trying to hit my first 10 paying customers this week and was hoping you would help me out.</p>
          
          <p style="margin:0 0 16px;"><strong>$4.99 one time</strong>, no subscription. You get a live URL forever, no watermark, no expiry. Less than a coffee.</p>
          
          <p style="margin:0 0 24px;">
            <a href="https://portfolioai.company/dashboard" style="display:inline-block;background:#c9a96e;color:#1a1a1a;padding:14px 28px;border-radius:4px;font-weight:600;text-decoration:none;font-size:15px;">
              Publish my portfolio — $4.99
            </a>
          </p>
          
          <p style="margin:0 0 16px;">If money is tight or you are not interested, no pressure at all. But if you have 30 seconds and $5 to spare, this would genuinely mean a lot.</p>
          
          <p style="margin:0 0 16px;">Either way, thanks for being one of the early ones who tried it.</p>
          
          <p style="margin:0 0 8px;">Cheers,<br>Sagar</p>
          <p style="margin:0;color:#888;font-size:13px;">Founder, PortfolioAI</p>
          
          <p style="margin:32px 0 0;font-size:13px;color:#999;border-top:1px solid #eee;padding-top:16px;">
            P.S. Just hit reply if you have any questions, feedback, or just want to chat. This goes directly to my inbox.
          </p>
        </td></tr>
      </table>
      <p style="font-size:11px;color:#aaa;margin-top:16px;">
        portfolioai.company
      </p>
    </td></tr>
  </table>
</body>
</html>
    `
  }
}

export async function POST(request: Request) {
  // auth temporarily disabled for one-time send

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name')

  const sent: string[] = []
  const failed: string[] = []
  const skipped: string[] = []

  for (const profile of profiles || []) {
    if (!profile.email) continue
    if (profile.email === 'sagarbmw1@gmail.com') {
      skipped.push(profile.email + ' (owner)')
      continue
    }

    const { data: portfolios } = await supabase
      .from('portfolios').select('slug').eq('user_id', profile.id).limit(1)
    if (!portfolios?.[0]) {
      skipped.push(profile.email + ' (no portfolio)')
      continue
    }

    const { count: paymentCount } = await supabase
      .from('payments').select('*', { count: 'exact', head: true }).eq('user_id', profile.id)
    if ((paymentCount || 0) > 0) {
      skipped.push(profile.email + ' (already paid)')
      continue
    }

    const name = profile.full_name?.split(' ')[0] || 'there'
    const { subject, html } = emailTemplate(name)

    try {
      await resend.emails.send({
        from: 'Sagar <hello@portfolioai.company>',
        replyTo: 'sagarbmw1@gmail.com',
        to: profile.email,
        subject,
        html,
      })
      sent.push(profile.email)
      await new Promise(r => setTimeout(r, 600))
    } catch (err: any) {
      failed.push(profile.email + ': ' + err.message)
    }
  }

  return NextResponse.json({
    sent: sent.length,
    failed: failed.length,
    skipped: skipped.length,
    sentTo: sent,
    failedTo: failed,
  })
}
