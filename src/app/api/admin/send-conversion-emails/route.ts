export const runtime = 'nodejs'
export const maxDuration = 60

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

function emailTemplate(name: string, portfolioUrl: string) {
  return {
    subject: `${name}, your portfolio is waiting`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0c0a08;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0a08;padding:48px 24px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#100e0a;border:1px solid rgba(245,240,232,.08);border-radius:6px;padding:48px 40px;">
        <tr><td>
          <div style="font-size:24px;font-weight:700;color:#f5f0e8;margin-bottom:8px;letter-spacing:-.02em;">
            Portfolio<span style="color:#c9a96e;">AI</span>
          </div>
          <div style="width:40px;height:2px;background:#c9a96e;margin:24px 0 32px;"></div>
          <h1 style="font-size:26px;font-weight:700;color:#f5f0e8;margin:0 0 16px;letter-spacing:-.02em;line-height:1.2;">
            Hey ${name},
          </h1>
          <p style="font-size:16px;color:rgba(245,240,232,.6);line-height:1.65;margin:0 0 20px;font-weight:300;">
            You uploaded your resume to PortfolioAI and our AI built you a world-class portfolio website.
          </p>
          <p style="font-size:16px;color:rgba(245,240,232,.6);line-height:1.65;margin:0 0 24px;font-weight:300;">
            But it is still locked in preview mode. For <strong style="color:#c9a96e;">just $4.99 one time</strong> you can publish it as a live URL, share it with recruiters, and use it to land your next job.
          </p>
          <p style="font-size:16px;color:rgba(245,240,232,.6);line-height:1.65;margin:0 0 24px;font-weight:300;">
            Less than a coffee. Yours forever.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr><td style="background:#c9a96e;border-radius:4px;">
              <a href="${portfolioUrl}" style="display:inline-block;padding:16px 32px;color:#0c0a08;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:.02em;">
                Publish my portfolio → $4.99
              </a>
            </td></tr>
          </table>
          <p style="font-size:14px;color:rgba(245,240,232,.4);line-height:1.6;margin:0 0 8px;font-weight:300;">
            One-time payment. No subscription. Yours forever.
          </p>
          <p style="font-size:14px;color:rgba(245,240,232,.4);line-height:1.6;margin:0;font-weight:300;">
            Questions? Just reply to this email.
          </p>
        </td></tr>
      </table>
      <p style="font-size:11px;color:rgba(245,240,232,.2);margin-top:24px;letter-spacing:.05em;">
        PortfolioAI · portfolioai.company<br>
        You received this because you created a portfolio. Reply STOP to unsubscribe.
      </p>
    </td></tr>
  </table>
</body>
</html>
    `
  }
}

export async function POST(request: Request) {
  // Secret check - only you can trigger this
  const auth = request.headers.get('authorization')
  if (auth !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get all unpaid users with portfolios
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

    // Has portfolio?
    const { data: portfolios } = await supabase
      .from('portfolios')
      .select('slug')
      .eq('user_id', profile.id)
      .limit(1)
    
    if (!portfolios?.[0]) {
      skipped.push(profile.email + ' (no portfolio)')
      continue
    }

    // Already paid?
    const { count: paymentCount } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)

    if ((paymentCount || 0) > 0) {
      skipped.push(profile.email + ' (already paid)')
      continue
    }

    const name = profile.full_name?.split(' ')[0] || 'there'
    const portfolioUrl = 'https://portfolioai.company/dashboard'
    const { subject, html } = emailTemplate(name, portfolioUrl)

    try {
      await resend.emails.send({
        from: 'Sagar from PortfolioAI <hello@portfolioai.company>',
        replyTo: 'sagarbmw1@gmail.com',
        to: profile.email,
        subject,
        html,
      })
      sent.push(profile.email)
      // Rate limit safety - 1 second between sends
      await new Promise(r => setTimeout(r, 1000))
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
    skippedFrom: skipped,
  })
}
