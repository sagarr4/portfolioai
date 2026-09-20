import { createHmac, timingSafeEqual } from 'crypto'

export const SITE = 'https://portfolioai.company'
export const ADDRESS = 'The AI Company, 1140 Hugh Allan Dr, Kamloops, BC V1S 1T2'
export const FROM = 'Sagar <hello@portfolioai.company>'
export const REPLY_TO = 'hello@portfolioai.company'
export const OWNER_EMAILS = ['sagarbmw1@gmail.com', 'hello@portfolioai.company', 'sagar@portfolioai.company']
// One email every ~2 days. The cron runs daily, so 47h (not 48h) avoids drifting to every 3 days.
export const GAP_HOURS = 47

export type DripCtx = { name: string; hasPortfolio: boolean; userId: string }
type DripStep = { subject: string; preheader: string; body: (c: DripCtx) => string[]; ps?: string }

// Rules for this copy: persuasive, but every claim must be true today (price, features,
// no invented numbers, no fake deadlines, no promise of a job). Edit freely, keep it honest.
const STEPS: DripStep[] = [
  {
    subject: 'Your dream job starts with a link',
    preheader: "One click. That's all it takes to be remembered.",
    body: c => [
      "Picture the moment: a hiring manager has a stack of applications open, and yours is the one they remember. Not because of a fancier font on a PDF. Because they clicked one link and, for the first time that day, it felt like meeting a person.",
      "That's what PortfolioAI builds. It takes your resume and turns it into a website designed for your profession, with your name, your story and your work front and centre.",
      c.hasPortfolio
        ? "Yours is already built and waiting in your dashboard. Publishing it is a one-time $9.99, and it goes live on its own public URL that you can put anywhere."
        : "Upload your resume and you get a free preview of your own site in a few minutes. You only pay if you love it and want it live.",
      "I can't promise anyone a job. Nobody honestly can. What I can do is make sure that when a door opens, what's behind it is the best version of you.",
      "Over the next couple of weeks I'll send you a short note every couple of days: ideas, and a few honest reasons this is worth doing. You can stop any time with the link at the bottom.",
    ],
    ps: "P.S. If you get stuck on anything, just reply. It comes straight to me.",
  },
  {
    subject: 'A resume says what you did. A portfolio shows who you are.',
    preheader: 'Be easy to remember.',
    body: () => [
      "A resume is a list. A good one, sure, but it's the same list every applicant sends, in the same format, in the same PDF.",
      "A portfolio site is different. It has a voice. It puts your strongest work first, tells your story in your own words, and gives people something to remember you by.",
      "The role you're picturing is at a company that will meet plenty of people who look identical on paper. The ones who get the call are often the ones who were easy to remember.",
      "Be easy to remember.",
    ],
  },
  {
    subject: 'Imagine the email you send next',
    preheader: 'Same message. A very different last line.',
    body: () => [
      "Think about your next job application. Now imagine that instead of \"Please find my resume attached\", your message ends with: \"Here's my portfolio\", followed by a clean link that's just yours.",
      "Same message, same effort. But now the person reading it can see who you are in seconds instead of decoding a PDF.",
      "It's a small change. Small changes at the right moment are how careers start to move.",
    ],
  },
  {
    subject: 'The first ten seconds',
    preheader: 'Design does a lot of the talking.',
    body: () => [
      "Whether we like it or not, people form an impression of a candidate very quickly, and design does a lot of the talking. A clean, confident site says \"this person cares about how they show up\" before anyone reads a single word.",
      "That's the whole idea behind PortfolioAI. You shouldn't need to be a designer or a developer to look like someone who has their act together. You already have the experience. We handle the presentation.",
    ],
  },
  {
    subject: 'What $9.99 actually buys',
    preheader: 'One payment. No subscription.',
    body: () => [
      "Let's be practical about it. Here's what the one-time $9.99 gets you:",
      "• Your own live, public portfolio URL, yours forever\n• No PortfolioAI watermark\n• A link you can share with recruiters, on LinkedIn, anywhere\n• No monthly fees, ever",
      "That's roughly the price of lunch, for something that works for you every day it's online. If it helps you land even one more conversation with a hiring manager, it has more than paid for itself.",
    ],
  },
  {
    subject: 'Done beats perfect',
    preheader: "The right opportunity won't wait for perfect.",
    body: () => [
      "A lot of people wait until their resume is \"perfect\" before they put themselves out there.",
      "Here's the thing: your experience is real today. The right opportunity doesn't check whether you felt ready. It just needs you to be findable and easy to say yes to.",
      "Get it live now, and let it start working for you while you keep improving everything else.",
    ],
  },
  {
    subject: 'Five places to put your link',
    preheader: 'One link, five open doors.',
    body: () => [
      "A portfolio only helps if people see it. Here are five places your link belongs:",
      "1. The top of your resume, next to your email\n2. Your LinkedIn About and Featured sections\n3. Your email signature\n4. The last line of every application and cold message\n5. Your GitHub or social bios",
      "Each one turns a passing glance into a proper look at who you are. Five doors, opened by one link.",
    ],
  },
  {
    subject: 'Everyone else sends a PDF',
    preheader: 'A quiet advantage.',
    body: () => [
      "Here's a quiet advantage: most applicants send exactly what's expected. A PDF. That's fine, and it's exactly why a thoughtful portfolio stands out without you having to be loud about it.",
      "No stunts. Just a clean, well-designed page that shows you took your own career seriously.",
      "That's the kind of first impression that gets a second look.",
    ],
  },
  {
    subject: 'Is it worth it? Honest answers',
    preheader: 'Straight answers to the usual questions.',
    body: () => [
      "A few questions I get, answered straight:",
      "• Is it just a template? No. Each portfolio is designed by AI for your profession, so it isn't a fill-in-the-blanks layout.\n• Do I need to code or design anything? No. Your resume is all it needs.\n• Will it cost me every month? No. It's a single one-time payment of $9.99.\n• What if I don't love it? You see your design before you pay, so you're never buying blind.",
      "If there's a question I haven't answered, reply and ask. I read every message.",
    ],
  },
  {
    subject: 'My last note (for now)',
    preheader: "I'll leave you to it after this one.",
    body: c => [
      "This is the last email in this series, so I'll keep it simple.",
      "You started this because you want something better: a role you're proud of, at a place that values what you bring. A strong first impression won't do the work for you, but it opens the door so your work can.",
      c.hasPortfolio
        ? "Your portfolio is built and waiting. Under ten dollars, one time, and it's live."
        : "Your free preview is a few minutes away. See it first, then decide.",
      "Whatever you decide, I'm rooting for you. And if you ever want to come back, the site will be here.",
    ],
  },
]

export const DRIP_LENGTH = STEPS.length

// ---------------------------------------------------------------- unsubscribe tokens

function secret() {
  const s = process.env.UNSUBSCRIBE_SECRET || process.env.CRON_SECRET
  if (!s) throw new Error('Set CRON_SECRET (or UNSUBSCRIBE_SECRET) so unsubscribe links can be signed.')
  return s
}
export function unsubToken(userId: string) {
  return createHmac('sha256', secret()).update(userId).digest('hex').slice(0, 32)
}
export function verifyUnsubToken(userId: string, token: string) {
  if (!userId || !token) return false
  try {
    const a = Buffer.from(unsubToken(userId))
    const b = Buffer.from(token)
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}
export function unsubUrl(userId: string) {
  return SITE + '/api/unsubscribe?u=' + encodeURIComponent(userId) + '&t=' + unsubToken(userId)
}
export function dripHeaders(userId: string) {
  return {
    'List-Unsubscribe': '<' + unsubUrl(userId) + '>, <mailto:' + REPLY_TO + '?subject=unsubscribe>',
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
}

// ---------------------------------------------------------------- rendering

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** step is 1-based (1..DRIP_LENGTH). */
export function renderDrip(step: number, ctx: DripCtx) {
  const s = STEPS[step - 1]
  if (!s) throw new Error('No drip email for step ' + step)
  const name = ctx.name.trim() || 'there'
  const paras = [ 'Hi ' + name + ',', ...s.body(ctx) ]
  const cta = ctx.hasPortfolio
    ? { label: 'Publish my portfolio', url: SITE + '/pricing' }
    : { label: 'Build my free preview', url: SITE + '/dashboard' }
  const unsub = unsubUrl(ctx.userId)
  const reason = 'You are getting this because you created a PortfolioAI account.'

  const text = [
    ...paras,
    cta.label + ': ' + cta.url,
    'Sagar\nFounder, PortfolioAI',
    ...(s.ps ? [s.ps] : []),
    '--\n' + ADDRESS + '\n' + reason + '\nUnsubscribe: ' + unsub,
  ].join('\n\n')

  const p = 'margin:0 0 16px;'
  const html = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:24px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#1a1a1a;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(s.preheader)}</span>
<div style="max-width:560px;">
${paras.map(t => `<p style="${p}">${esc(t).replace(/\n/g, '<br>')}</p>`).join('\n')}
<p style="margin:28px 0;"><a href="${cta.url}" style="display:inline-block;background:#c9a96e;color:#1a1a1a;padding:14px 26px;border-radius:4px;font-weight:bold;text-decoration:none;">${esc(cta.label)}</a></p>
<p style="margin:0 0 16px;">Sagar<br>Founder, PortfolioAI</p>
${s.ps ? `<p style="${p}">${esc(s.ps)}</p>` : ''}
<p style="margin:24px 0 0;padding-top:14px;border-top:1px solid #e5e5e5;font-size:12px;line-height:1.5;color:#777;">${esc(ADDRESS)}<br>${esc(reason)}<br><a href="${unsub}" style="color:#777;">Unsubscribe</a></p>
</div>
</body>
</html>`
  return { subject: s.subject, html, text }
}
