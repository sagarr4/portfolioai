// Adds the requestAnimationFrame crash-loop guard (see generatePortfolio.ts,
// id="pai-raf-safety") to portfolios that were published BEFORE that guard existed,
// without regenerating them or touching anything else on the page.
//
//   npx tsx scripts/backfill-raf-safety.ts dry   list which portfolios would change (default). Nothing written.
//   npx tsx scripts/backfill-raf-safety.ts run   backup -> apply -> save
//
// Idempotent: any portfolio whose html_content already contains id="pai-raf-safety" is
// skipped, so this is safe to run again later (e.g. after fixing something else here).

import { existsSync } from 'fs'
import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { writeFile, mkdir } from 'fs/promises'

loadEnv({ path: existsSync('.env.local') ? '.env.local' : '.env' })

const MODE = (process.argv[2] || 'dry').toLowerCase()
const MARKER = 'id="pai-raf-safety"'
const BACKUP_DIR = './backups'

const GUARD = `<script id="pai-raf-safety">
(function() {
  var nativeRAF = window.requestAnimationFrame.bind(window)
  var failCounts = new WeakMap()
  var warned = new WeakSet()
  window.requestAnimationFrame = function(cb) {
    if (typeof cb !== 'function') return nativeRAF(cb)
    if ((failCounts.get(cb) || 0) >= 3) return 0
    return nativeRAF(function(t) {
      try { cb(t) }
      catch (e) {
        failCounts.set(cb, (failCounts.get(cb) || 0) + 1)
        if (!warned.has(cb)) { warned.add(cb); console.warn('[PortfolioAI] an animation stopped itself after repeated errors:', e) }
      }
    })
  }
})();
</script>
`

function insertGuard(html: string): string | null {
  if (html.includes(MARKER)) return null // already patched
  if (html.includes('</head>')) return html.replace('</head>', GUARD + '</head>')
  if (html.includes('<head>')) return html.replace('<head>', '<head>\n' + GUARD)
  return GUARD + html // no <head> at all (shouldn't happen, but never skip silently)
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your environment.'); process.exit(1) }
  const supabase = createClient(url, key)

  const { data, error } = await supabase.from('portfolios').select('id, slug, html_content')
  if (error) { console.error('Failed to read portfolios:', error.message); process.exit(1) }
  const rows = (data ?? []) as { id: string; slug: string | null; html_content: string | null }[]

  const targets = rows
    .filter(r => typeof r.html_content === 'string' && r.html_content.length > 0)
    .map(r => ({ ...r, patched: insertGuard(r.html_content as string) }))
    .filter(r => r.patched !== null) as { id: string; slug: string | null; html_content: string; patched: string }[]

  console.log(rows.length + ' portfolios total, ' + targets.length + ' need the guard added.')
  if (!targets.length) { console.log('Nothing to do.'); return }
  for (const t of targets) console.log('  ' + (t.slug || t.id))

  if (MODE === 'dry') { console.log('\nDry run: nothing written. Run with "run" to apply.'); return }
  if (MODE !== 'run') { console.error('Unknown mode "' + MODE + '". Use: dry | run'); process.exit(1) }

  await mkdir(BACKUP_DIR, { recursive: true })
  const backupPath = BACKUP_DIR + '/raf-safety-backfill-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json'
  await writeFile(backupPath, JSON.stringify(targets.map(t => ({ id: t.id, slug: t.slug, html_content: t.html_content })), null, 2))
  console.log('Backup of original html_content written to ' + backupPath)

  let ok = 0
  for (const t of targets) {
    const { error: updErr } = await supabase.from('portfolios').update({ html_content: t.patched }).eq('id', t.id)
    if (updErr) console.error('  FAILED ' + (t.slug || t.id) + ': ' + updErr.message)
    else { ok++; console.log('  patched ' + (t.slug || t.id)) }
  }
  console.log('\nDone: ' + ok + ' of ' + targets.length + ' patched. Backup: ' + backupPath)
}

main().catch(err => { console.error('Unexpected error:', err); process.exit(1) })
