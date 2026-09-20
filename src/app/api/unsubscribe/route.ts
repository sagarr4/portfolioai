export const runtime = 'nodejs'

import { createClient } from '@supabase/supabase-js'
import { verifyUnsubToken } from '@/lib/email/drip'

function page(title: string, body: string, status = 200) {
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>` +
    `<body style="margin:0;padding:48px 24px;font-family:Arial,Helvetica,sans-serif;background:#0c0a08;color:#f5f0e8;"><div style="max-width:440px;margin:0 auto;">` +
    `<h1 style="font-size:22px;margin:0 0 16px;">${title}</h1>${body}</div></body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8' } }
  )
}

function params(req: Request) {
  const url = new URL(req.url)
  return { u: url.searchParams.get('u') || '', t: url.searchParams.get('t') || '' }
}

// GET only shows a confirm button, so email-security link scanners that "click" links
// can't unsubscribe people by accident. The POST does the work (and is what the
// List-Unsubscribe-Post one-click header from Gmail/Yahoo hits).
export async function GET(req: Request) {
  const { u, t } = params(req)
  if (!verifyUnsubToken(u, t)) return page('This link is not valid', '<p>Reply to any of my emails and I will remove you by hand.</p>', 400)
  return page(
    'Unsubscribe from PortfolioAI emails?',
    `<form method="POST" action="/api/unsubscribe?u=${encodeURIComponent(u)}&t=${encodeURIComponent(t)}">` +
    `<button type="submit" style="background:#c9a96e;color:#1a1a1a;border:0;padding:14px 26px;border-radius:4px;font-weight:bold;font-size:15px;cursor:pointer;">Yes, unsubscribe me</button></form>`
  )
}

export async function POST(req: Request) {
  const { u, t } = params(req)
  if (!verifyUnsubToken(u, t)) return page('This link is not valid', '<p>Reply to any of my emails and I will remove you by hand.</p>', 400)
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { error } = await supabase.from('profiles').update({ email_unsubscribed_at: new Date().toISOString() }).eq('id', u)
  if (error) return page('Something went wrong', '<p>Please reply to any of my emails and I will remove you by hand.</p>', 500)
  return page('You are unsubscribed', '<p>You will not get any more marketing emails from PortfolioAI. Sorry to see you go.</p>')
}
