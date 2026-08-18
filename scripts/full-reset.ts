// FULL DESTRUCTIVE RESET -- deletes every portfolio, every stored photo,
// every payment row, every profiles row, and every auth user account,
// EXCEPT the owner accounts listed in OWNER_EMAILS (which are preserved
// so you don't lock yourself out -- their portfolios/payments/photos are
// still wiped like everyone else's, just not their login or profile row).
// Before deleting, sends every other user a reset-announcement email via
// Resend. Irreversible once confirmed -- a full JSON backup is written
// to ./backups/ first.
//
// Run with: npx tsx scripts/full-reset.ts
// (install tsx first if you don't have it: npm install -D tsx)

import { existsSync } from 'fs'
import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { writeFile, mkdir } from 'fs/promises'
import { createInterface } from 'readline/promises'
import { stdin, stdout } from 'process'

loadEnv({ path: existsSync('.env.local') ? '.env.local' : '.env' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)
const BUCKET = 'portfolio-photos'

const OWNER_EMAILS = ['sagarbmw1@gmail.com', 'hello@portfolioai.company', 'sagar@portfolioai.company']

function emailTemplate(name: string) {
  return {
    subject: `${name}, we rebuilt your portfolio experience`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:6px;padding:40px;">
        <tr><td style="font-size:15px;line-height:1.6;color:#1a1a1a;">
          <p style="margin:0 0 16px;">Hey ${name},</p>

          <p style="margin:0 0 16px;">Sagar here. We've been heads-down rebuilding PortfolioAI -- much better photo integration, cleaner layouts, and a more polished overall experience across the board.</p>

          <p style="margin:0 0 16px;">As part of this upgrade we're resetting the platform's data, which means your previous portfolio and account are being removed. Sorry for the inconvenience -- but the new version is a real step up, and I'd love for you to come try it again.</p>

          <p style="margin:0 0 24px;">
            <a href="https://portfolioai.company" style="display:inline-block;background:#c9a96e;color:#1a1a1a;padding:14px 28px;border-radius:4px;font-weight:600;text-decoration:none;font-size:15px;">
              Try the new version →
            </a>
          </p>

          <p style="margin:0 0 16px;">Thanks for being one of the early ones who tried it -- it's what's making PortfolioAI better.</p>

          <p style="margin:0 0 8px;">Cheers,<br>Sagar</p>
          <p style="margin:0;color:#888;font-size:13px;">Founder, PortfolioAI</p>

          <p style="margin:32px 0 0;font-size:13px;color:#999;border-top:1px solid #eee;padding-top:16px;">
            P.S. Just hit reply if you have any questions or feedback. This goes directly to my inbox.
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

async function listAllFiles(prefix = ''): Promise<string[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 1000 })
  if (error) {
    console.error('Storage list error at prefix "' + prefix + '":', error.message)
    return []
  }
  if (!data) return []

  let paths: string[] = []
  for (const entry of data) {
    const fullPath = prefix ? prefix + '/' + entry.name : entry.name
    if (entry.id === null) {
      const nested = await listAllFiles(fullPath)
      paths = paths.concat(nested)
    } else {
      paths.push(fullPath)
    }
  }
  return paths
}

async function listAllUsers() {
  let allUsers: { id: string; email: string | null; created_at: string }[] = []
  let page = 1
  const perPage = 200
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) { console.error('listUsers error:', error.message); break }
    if (!data.users.length) break
    allUsers = allUsers.concat(data.users.map(u => ({ id: u.id, email: u.email ?? null, created_at: u.created_at })))
    if (data.users.length < perPage) break
    page++
  }
  return allUsers
}

async function main() {
  console.log('Gathering current data (nothing will be deleted yet)...\n')

  const { data: portfolios, error: portfoliosErr } = await supabase
    .from('portfolios')
    .select('id, user_id, slug, title, is_published, created_at')
  if (portfoliosErr) { console.error('Failed to read portfolios:', portfoliosErr.message); process.exit(1) }

  const { data: payments, error: paymentsErr } = await supabase
    .from('payments')
    .select('id, user_id, type, created_at')
  if (paymentsErr) { console.error('Failed to read payments:', paymentsErr.message); process.exit(1) }

  const { data: profiles, error: profilesErr } = await supabase
    .from('profiles')
    .select('id, email, full_name')
  if (profilesErr) { console.error('Failed to read profiles:', profilesErr.message); process.exit(1) }

  const users = await listAllUsers()
  const filePaths = await listAllFiles()

  const profileById = new Map((profiles ?? []).map(p => [p.id, p]))
  const nonOwnerUsers = users.filter(u => !u.email || !OWNER_EMAILS.includes(u.email))
  const ownerUsers = users.filter(u => u.email && OWNER_EMAILS.includes(u.email))

  console.log('Found:')
  console.log('  ' + (portfolios?.length ?? 0) + ' portfolios')
  console.log('  ' + (payments?.length ?? 0) + ' payment records')
  console.log('  ' + filePaths.length + ' stored photo files')
  console.log('  ' + users.length + ' user accounts (' + ownerUsers.length + ' owner account(s) will be PRESERVED, ' + nonOwnerUsers.length + ' will be deleted)')
  console.log('')

  await mkdir('./backups', { recursive: true })
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = './backups/full-reset-' + timestamp + '.json'
  await writeFile(backupPath, JSON.stringify({ exportedAt: new Date().toISOString(), portfolios, payments, profiles, users, storageFilePaths: filePaths }, null, 2))
  console.log('Backup written to ' + backupPath + '\n')

  console.log('*** THIS WILL PERMANENTLY DELETE ALL PORTFOLIOS, PAYMENTS, AND PHOTOS, ***')
  console.log('*** AND DELETE ' + nonOwnerUsers.length + ' USER ACCOUNT(S) (owner accounts preserved). ***')
  console.log('Every non-owner user with an email will also be sent a reset-announcement email BEFORE their account is deleted.')
  console.log('This cannot be undone (the JSON backup has the data, but nothing auto-restores from it).\n')

  const rl = createInterface({ input: stdin, output: stdout })
  const answer = await rl.question('Type DELETE ALL (exactly, case-sensitive) to proceed, or anything else to abort: ')
  rl.close()

  if (answer !== 'DELETE ALL') {
    console.log('Aborted. Nothing was deleted.')
    process.exit(0)
  }

  console.log('\nConfirmed. Sending emails first, then deleting...\n')

  const sent: string[] = []
  const failed: string[] = []
  const skipped: string[] = []

  for (const user of nonOwnerUsers) {
    if (!user.email) { skipped.push(user.id + ' (no email)'); continue }
    const name = profileById.get(user.id)?.full_name?.split(' ')[0] || 'there'
    const { subject, html } = emailTemplate(name)
    try {
      await resend.emails.send({
        from: 'Sagar <hello@portfolioai.company>',
        replyTo: 'hello@portfolioai.company',
        to: user.email,
        subject,
        html,
      })
      sent.push(user.email)
      await new Promise(r => setTimeout(r, 600))
    } catch (err: any) {
      failed.push(user.email + ': ' + err.message)
    }
  }
  console.log('Emails -- sent: ' + sent.length + ', failed: ' + failed.length + ', skipped: ' + skipped.length)
  if (failed.length) console.log('Failed sends:', failed)

  if (filePaths.length) {
    const { error: removeErr } = await supabase.storage.from(BUCKET).remove(filePaths)
    if (removeErr) console.error('Storage removal error (continuing):', removeErr.message)
    else console.log('Deleted ' + filePaths.length + ' storage files.')
  }

  const { error: delPaymentsErr } = await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delPaymentsErr) console.error('payments delete error (continuing):', delPaymentsErr.message)
  else console.log('Deleted all payments rows.')

  const { error: delPortfoliosErr } = await supabase.from('portfolios').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delPortfoliosErr) console.error('portfolios delete error (continuing):', delPortfoliosErr.message)
  else console.log('Deleted all portfolios rows.')

  const nonOwnerIds = nonOwnerUsers.map(u => u.id)
  if (nonOwnerIds.length) {
    const { error: delProfilesErr } = await supabase.from('profiles').delete().in('id', nonOwnerIds)
    if (delProfilesErr) console.error('profiles delete error (continuing):', delProfilesErr.message)
    else console.log('Deleted ' + nonOwnerIds.length + ' profiles rows (owner profile(s) preserved).')
  }

  let deletedUsers = 0
  for (const user of nonOwnerUsers) {
    const { error: delUserErr } = await supabase.auth.admin.deleteUser(user.id)
    if (delUserErr) console.error('Failed to delete user ' + user.id + ':', delUserErr.message)
    else deletedUsers++
  }
  console.log('Deleted ' + deletedUsers + ' of ' + nonOwnerUsers.length + ' non-owner user accounts. Owner account(s) preserved: ' + ownerUsers.map(u => u.email).join(', '))

  console.log('\nDone. Backup remains at ' + backupPath + ' for reference.')
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
