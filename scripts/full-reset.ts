// FULL RESET + ANNOUNCEMENT EMAIL
//
//   npx tsx scripts/full-reset.ts preview          write the email to ./backups/email-preview.html/.txt (no env needed)
//   npx tsx scripts/full-reset.ts test [address]   send ONE copy of the email to yourself (default: sagarbmw1@gmail.com)
//   npx tsx scripts/full-reset.ts dry              count what exists + write a full JSON backup. Deletes nothing.  (default)
//   npx tsx scripts/full-reset.ts run              backup -> confirm -> email everyone -> delete (only if every email was accepted)
//
// `run` deletes every portfolio, stored photo, payment row, profiles row and auth
// user EXCEPT the owner accounts in OWNER_EMAILS (their login + profile survive,
// their portfolios/payments/photos are wiped like everyone else's).
// Irreversible once confirmed. The backup contains full rows (incl. html_content).

import { existsSync } from 'fs'
import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { createInterface } from 'readline/promises'
import { stdin, stdout } from 'process'

loadEnv({ path: existsSync('.env.local') ? '.env.local' : '.env' })

const MODE = (process.argv[2] || 'dry').toLowerCase()
const TEST_TO = process.argv[3] || 'sagarbmw1@gmail.com'

// Required for anything promotional in Canada (CASL): sender identity + mailing address.
const MAILING_ADDRESS = '1140 Hugh Allan Dr, Kamloops, BC V1S 1T2'
const OWNER_EMAILS = ['sagarbmw1@gmail.com', 'hello@portfolioai.company', 'sagar@portfolioai.company']
const BUCKET = 'portfolio-photos'
const FROM = 'Sagar <hello@portfolioai.company>'
const REPLY_TO = 'hello@portfolioai.company'
const SUBJECT = 'Your PortfolioAI account is being reset'
const SEND_DELAY_MS = 1200
const BACKUP_DIR = './backups'
const EMAILED_FILE = BACKUP_DIR + '/emailed.json'

// ---------------------------------------------------------------- email

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildEmail(rawName: string) {
  const name = rawName.trim() || 'there'
  const text = [
    `Hi ${name},`,
    '',
    "Sagar here, the founder of PortfolioAI. I've been rebuilding it: much better photo integration, cleaner layouts, and a more polished experience overall.",
    '',
    "To ship it properly I'm resetting the platform. That means your old account and portfolio are being deleted, and any photos you uploaded are removed too. You don't need to do anything.",
    '',
    'If you would like to try the new version, you can sign up again here (it takes about two minutes):',
    'https://portfolioai.company',
    '',
    'If you want a copy of your old portfolio, or have any questions, just reply to this email. It comes straight to me.',
    '',
    "Thanks for being one of the first people to try it. It's what made the rebuild possible.",
    '',
    'Sagar',
    'Founder, PortfolioAI',
    '',
    '--',
    'The AI Company, ' + MAILING_ADDRESS,
    'You are getting this one-time notice because you created a PortfolioAI account. Reply "unsubscribe" and I will not email you again.',
  ].join('\n')

  const p = 'margin:0 0 16px;'
  const html = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:24px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;">
<div style="max-width:560px;">
<p style="${p}">Hi ${esc(name)},</p>
<p style="${p}">Sagar here, the founder of PortfolioAI. I've been rebuilding it: much better photo integration, cleaner layouts, and a more polished experience overall.</p>
<p style="${p}">To ship it properly I'm resetting the platform. That means your old account and portfolio are being deleted, and any photos you uploaded are removed too. You don't need to do anything.</p>
<p style="${p}">If you would like to try the new version, you can sign up again here (it takes about two minutes): <a href="https://portfolioai.company" style="color:#8a6a2f;">portfolioai.company</a></p>
<p style="${p}">If you want a copy of your old portfolio, or have any questions, just reply to this email. It comes straight to me.</p>
<p style="${p}">Thanks for being one of the first people to try it. It's what made the rebuild possible.</p>
<p style="margin:0 0 24px;">Sagar<br>Founder, PortfolioAI</p>
<p style="margin:0;padding-top:14px;border-top:1px solid #e5e5e5;font-size:12px;color:#777;">The AI Company, ${esc(MAILING_ADDRESS)}<br>You are getting this one-time notice because you created a PortfolioAI account. Reply "unsubscribe" and I will not email you again.</p>
</div>
</body>
</html>`
  return { text, html }
}

function requireEmailConfig() {
  if (!process.env.RESEND_API_KEY) { console.error('Missing RESEND_API_KEY in your environment.'); process.exit(1) }
  if (MAILING_ADDRESS.startsWith('FILL IN')) {
    console.error('Edit MAILING_ADDRESS at the top of scripts/full-reset.ts first (a real mailing address is required in the footer).')
    process.exit(1)
  }
}

async function sendOne(resend: Resend, to: string, name: string): Promise<string | null> {
  const { text, html } = buildEmail(name)
  // Resend returns { data, error } and does NOT throw on API errors -- must check `error`.
  const { data, error } = await resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: SUBJECT,
    html,
    text,
    headers: { 'List-Unsubscribe': '<mailto:' + REPLY_TO + '?subject=unsubscribe>' },
  })
  if (error) return error.name + ': ' + error.message
  console.log('  accepted by Resend -> ' + to + ' (id ' + (data?.id ?? '?') + ')')
  return null
}

// ---------------------------------------------------------------- supabase helpers

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment.'); process.exit(1) }
  return createClient(url, key)
}
type Supa = ReturnType<typeof getSupabase>

async function listAllFiles(supabase: Supa, prefix = ''): Promise<string[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000 })
  if (error) { console.error('Storage list error at "' + prefix + '":', error.message); return [] }
  if (!data) return []
  let paths: string[] = []
  for (const entry of data) {
    const full = prefix ? prefix + '/' + entry.name : entry.name
    if (entry.id === null) paths = paths.concat(await listAllFiles(supabase, full))
    else paths.push(full)
  }
  return paths
}

async function listAllUsers(supabase: Supa) {
  let all: { id: string; email: string | null; created_at: string }[] = []
  let page = 1
  const perPage = 200
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) { console.error('listUsers error:', error.message); process.exit(1) }
    if (!data.users.length) break
    all = all.concat(data.users.map(u => ({ id: u.id, email: u.email ?? null, created_at: u.created_at })))
    if (data.users.length < perPage) break
    page++
  }
  return all
}

async function readTable(supabase: Supa, table: string) {
  const { data, error } = await supabase.from(table).select('*')
  if (error) { console.error('Failed to read ' + table + ':', error.message); process.exit(1) }
  return (data ?? []) as Record<string, unknown>[]
}

async function loadEmailed(): Promise<string[]> {
  try { return JSON.parse(await readFile(EMAILED_FILE, 'utf8')) as string[] } catch { return [] }
}

// ---------------------------------------------------------------- modes

async function preview() {
  await mkdir(BACKUP_DIR, { recursive: true })
  const { text, html } = buildEmail('Krinal')
  await writeFile(BACKUP_DIR + '/email-preview.html', html)
  await writeFile(BACKUP_DIR + '/email-preview.txt', text)
  console.log('Wrote ' + BACKUP_DIR + '/email-preview.html and .txt (subject: "' + SUBJECT + '")')
}

async function test() {
  requireEmailConfig()
  const resend = new Resend(process.env.RESEND_API_KEY)
  console.log('Sending ONE test email to ' + TEST_TO + ' ...')
  const err = await sendOne(resend, TEST_TO, 'Sagar')
  if (err) {
    console.error('FAILED: ' + err)
    console.error('If this says the domain is not verified: Resend dashboard -> Domains -> portfolioai.company must show Verified.')
    process.exit(1)
  }
  console.log('\nNow check it: open the email in Gmail -> ⋮ -> "Show original". SPF, DKIM and DMARC must all say PASS.')
  console.log('Also look at which folder it landed in (Inbox / Promotions / Spam).')
}

async function gatherAndBackup() {
  const supabase = getSupabase()
  console.log('Gathering current data (nothing is deleted in this step)...\n')
  const portfolios = await readTable(supabase, 'portfolios')
  const payments = await readTable(supabase, 'payments')
  const profiles = await readTable(supabase, 'profiles')
  const users = await listAllUsers(supabase)
  const filePaths = await listAllFiles(supabase)

  const isOwner = (e: string | null) => !!e && OWNER_EMAILS.includes(e)
  const nonOwnerUsers = users.filter(u => !isOwner(u.email))
  const ownerUsers = users.filter(u => isOwner(u.email))
  const nonOwnerIds = new Set(nonOwnerUsers.map(u => u.id))
  const nonOwnerPayments = payments.filter(p => nonOwnerIds.has(String(p.user_id)))

  console.log('Found:')
  console.log('  ' + portfolios.length + ' portfolios')
  console.log('  ' + payments.length + ' payment rows (' + nonOwnerPayments.length + ' belong to non-owner users)')
  console.log('  ' + filePaths.length + ' stored photo files')
  console.log('  ' + users.length + ' auth users (' + ownerUsers.length + ' owner preserved, ' + nonOwnerUsers.length + ' to be deleted)')
  if (nonOwnerPayments.length) console.log('  !! Some payment rows belong to real users -- make sure you really want those rows gone (Stripe keeps its own records).')
  console.log('')

  await mkdir(BACKUP_DIR, { recursive: true })
  const backupPath = BACKUP_DIR + '/full-reset-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json'
  await writeFile(backupPath, JSON.stringify({ exportedAt: new Date().toISOString(), portfolios, payments, profiles, users, storageFilePaths: filePaths }, null, 2))
  console.log('Full backup written to ' + backupPath + '\n')

  return { supabase, profiles, users, nonOwnerUsers, ownerUsers, filePaths, backupPath }
}

async function run() {
  requireEmailConfig()
  const { supabase, profiles, nonOwnerUsers, ownerUsers, filePaths, backupPath } = await gatherAndBackup()
  const nameById = new Map(profiles.map(p => [String(p.id), String(p.full_name ?? '')]))

  console.log('*** THIS PERMANENTLY DELETES ALL PORTFOLIOS, PAYMENTS AND PHOTOS, AND ' + nonOwnerUsers.length + ' USER ACCOUNT(S). ***')
  console.log('Emails are sent first. If ANY email is rejected, nothing is deleted.\n')
  const rl = createInterface({ input: stdin, output: stdout })
  const answer = await rl.question('Type DELETE ALL (exactly) to proceed, anything else aborts: ')
  rl.close()
  if (answer !== 'DELETE ALL') { console.log('Aborted. Nothing was changed.'); return }

  // ---- 1. emails
  const resend = new Resend(process.env.RESEND_API_KEY)
  const alreadyEmailed = new Set(await loadEmailed())
  const failed: string[] = []
  let sent = 0
  console.log('\nSending emails...')
  for (const user of nonOwnerUsers) {
    if (!user.email) continue
    if (alreadyEmailed.has(user.email)) { console.log('  skip (already emailed) ' + user.email); continue }
    const first = (nameById.get(user.id) || '').split(' ')[0]
    const err = await sendOne(resend, user.email, first)
    if (err) failed.push(user.email + ' -> ' + err)
    else { sent++; alreadyEmailed.add(user.email); await writeFile(EMAILED_FILE, JSON.stringify([...alreadyEmailed], null, 2)) }
    await new Promise(r => setTimeout(r, SEND_DELAY_MS))
  }
  console.log('Emails: ' + sent + ' sent, ' + failed.length + ' failed.')
  if (failed.length) {
    console.error('\nFAILED sends:\n  ' + failed.join('\n  '))
    console.error('\nNOTHING WAS DELETED. Fix the cause (usually domain verification in Resend) and run again;')
    console.error('users already emailed are remembered in ' + EMAILED_FILE + ' and will be skipped.')
    process.exit(1)
  }

  // ---- 2. deletion
  console.log('\nDeleting...')
  if (filePaths.length) {
    for (let i = 0; i < filePaths.length; i += 100) {
      const { error } = await supabase.storage.from(BUCKET).remove(filePaths.slice(i, i + 100))
      if (error) console.error('Storage removal error (continuing):', error.message)
    }
    console.log('Removed ' + filePaths.length + ' storage files.')
  }
  const NIL = '00000000-0000-0000-0000-000000000000'
  const delPay = await supabase.from('payments').delete().neq('id', NIL)
  console.log(delPay.error ? 'payments delete error (continuing): ' + delPay.error.message : 'Deleted all payments rows.')
  const delPf = await supabase.from('portfolios').delete().neq('id', NIL)
  console.log(delPf.error ? 'portfolios delete error (continuing): ' + delPf.error.message : 'Deleted all portfolios rows.')
  const ids = nonOwnerUsers.map(u => u.id)
  if (ids.length) {
    const delProf = await supabase.from('profiles').delete().in('id', ids)
    console.log(delProf.error ? 'profiles delete error (continuing): ' + delProf.error.message : 'Deleted ' + ids.length + ' profiles rows.')
  }
  let deleted = 0
  for (const u of nonOwnerUsers) {
    const { error } = await supabase.auth.admin.deleteUser(u.id)
    if (error) console.error('Failed to delete user ' + u.id + ':', error.message)
    else deleted++
  }
  console.log('Deleted ' + deleted + ' of ' + nonOwnerUsers.length + ' user accounts. Preserved: ' + ownerUsers.map(u => u.email).join(', '))
  console.log('\nDone. Backup: ' + backupPath)
}

async function main() {
  if (MODE === 'preview') return preview()
  if (MODE === 'test') return test()
  if (MODE === 'dry') { await gatherAndBackup(); console.log('Dry run complete. Nothing was deleted or sent.'); return }
  if (MODE === 'run') return run()
  console.error('Unknown mode "' + MODE + '". Use: preview | test | dry | run')
  process.exit(1)
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
