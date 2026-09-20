import type { SupabaseClient } from '@supabase/supabase-js'
import type { Resend } from 'resend'
import { DRIP_LENGTH, GAP_HOURS, FROM, REPLY_TO, OWNER_EMAILS, renderDrip, dripHeaders } from './drip'

type Row = { id: string; email: string | null; full_name: string | null; drip_step: number | null; drip_last_sent_at: string | null }

export type DripReport = {
  sent: { email: string; step: number }[]
  wouldSend: { email: string; step: number; hasPortfolio: boolean }[]
  stoppedBecausePaid: number
  errors: string[]
}

export async function runDrip(opts: {
  supabase: SupabaseClient
  resend: Resend
  now?: Date
  dryRun?: boolean
  maxSends?: number
  delayMs?: number
}): Promise<DripReport> {
  const { supabase, resend } = opts
  const now = opts.now ?? new Date()
  const maxSends = opts.maxSends ?? 40
  const delayMs = opts.delayMs ?? 600
  const cutoff = now.getTime() - GAP_HOURS * 3600 * 1000
  const report: DripReport = { sent: [], wouldSend: [], stoppedBecausePaid: 0, errors: [] }

  // Everyone still in the sequence: not unsubscribed, not finished. (Sized for hundreds of users;
  // move the due-date filter into SQL if this ever grows into the tens of thousands.)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, drip_step, drip_last_sent_at')
    .is('email_unsubscribed_at', null)
    .lt('drip_step', DRIP_LENGTH)
    .not('email', 'is', null)
    .limit(1000)
  if (error) { report.errors.push('profiles query: ' + error.message); return report }

  const due = ((data ?? []) as Row[])
    .filter(r => r.email && !OWNER_EMAILS.includes(r.email))
    .filter(r => !r.drip_last_sent_at || new Date(r.drip_last_sent_at).getTime() <= cutoff)
    .sort((a, b) => (a.drip_last_sent_at ? new Date(a.drip_last_sent_at).getTime() : 0) - (b.drip_last_sent_at ? new Date(b.drip_last_sent_at).getTime() : 0))

  let actions = 0
  for (const u of due) {
    if (actions >= maxSends) break
    const email = u.email as string

    // paying customers leave the sequence for good
    const pay = await supabase.from('payments').select('id', { count: 'exact', head: true }).eq('user_id', u.id)
    if ((pay.count ?? 0) > 0) {
      if (!opts.dryRun) await supabase.from('profiles').update({ drip_step: DRIP_LENGTH }).eq('id', u.id)
      report.stoppedBecausePaid++
      continue
    }

    const pf = await supabase.from('portfolios').select('id', { count: 'exact', head: true }).eq('user_id', u.id)
    const hasPortfolio = (pf.count ?? 0) > 0
    const step = (u.drip_step ?? 0) + 1

    if (opts.dryRun) { report.wouldSend.push({ email, step, hasPortfolio }); actions++; continue }

    const { subject, html, text } = renderDrip(step, { name: (u.full_name || '').split(' ')[0], hasPortfolio, userId: u.id })
    // Resend returns { error } instead of throwing -- must check it.
    const res = await resend.emails.send({ from: FROM, replyTo: REPLY_TO, to: email, subject, html, text, headers: dripHeaders(u.id) })
    actions++
    if (res.error) { report.errors.push(email + ' step ' + step + ': ' + res.error.message); continue }

    const upd = await supabase.from('profiles').update({ drip_step: step, drip_last_sent_at: now.toISOString() }).eq('id', u.id)
    if (upd.error) report.errors.push('update ' + email + ': ' + upd.error.message)
    report.sent.push({ email, step })
    if (delayMs) await new Promise(r => setTimeout(r, delayMs))
  }
  return report
}
