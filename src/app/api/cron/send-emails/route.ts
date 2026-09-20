export const runtime = 'nodejs'
export const maxDuration = 60

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { runDrip } from '@/lib/email/dripRunner'
import { renderDrip, dripHeaders, DRIP_LENGTH, FROM, REPLY_TO } from '@/lib/email/drip'

// Runs daily (vercel.json). Each user gets the next email of the DRIP sequence about
// every 2 days until they pay, unsubscribe, or finish the sequence. New signups are
// enrolled automatically (profiles.drip_step starts at 0).
//
//   ?dry=1                        list who WOULD be emailed, send nothing
//   ?test=you@x.com&step=3        send sample email #3 to that address only (&portfolio=0 for the no-portfolio version)
export async function GET(request: Request) {
  if (request.headers.get('authorization') !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(request.url)
  const resend = new Resend(process.env.RESEND_API_KEY)

  const testTo = url.searchParams.get('test')
  if (testTo) {
    const step = Math.min(Math.max(parseInt(url.searchParams.get('step') || '1', 10) || 1, 1), DRIP_LENGTH)
    const hasPortfolio = url.searchParams.get('portfolio') !== '0'
    const { subject, html, text } = renderDrip(step, { name: 'Sagar', hasPortfolio, userId: 'test-user' })
    const res = await resend.emails.send({ from: FROM, replyTo: REPLY_TO, to: testTo, subject, html, text, headers: dripHeaders('test-user') })
    return NextResponse.json({ test: true, step, to: testTo, error: res.error?.message ?? null, id: res.data?.id ?? null })
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const report = await runDrip({ supabase, resend, dryRun: url.searchParams.get('dry') === '1' })
  return NextResponse.json({ success: report.errors.length === 0, timestamp: new Date().toISOString(), ...report })
}
