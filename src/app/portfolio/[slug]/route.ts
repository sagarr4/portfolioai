export const runtime = 'nodejs'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { applyBlurGate } from '@/lib/portfolio/blurGate'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Use service role to fetch portfolio (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('portfolios')
    .select('id, html_content, views, is_published, user_id, created_at')
    .eq('slug', slug)
    .single()

  if (error || !data || !data.html_content) {
    return new NextResponse('Portfolio not found', { status: 404 })
  }

  let html = data.html_content
  // strip em dashes from generated content
  html = html.split('—').join(',').split('–').join(',')
  const portfolioId = data.id

  // Check if viewer is the owner (logged in as same user)
  let isOwner = false
  try {
    const userSupabase = await createServerClient()
    const { data: { user } } = await userSupabase.auth.getUser()
    if (user && user.id === data.user_id) {
      isOwner = true
    }
  } catch {}

  html = html.split('opacity:0').join('opacity:1')
  html = html.split('visibility:hidden').join('visibility:visible')

  // PAID - show full clean version
  if (data.is_published) {
    const start = html.indexOf('<!-- watermark -->')
    const end = html.indexOf('<!-- end watermark -->')
    if (start > -1 && end > -1) {
      html = html.slice(0, start) + html.slice(end + 22)
    }
    
    // Polish: ensure canonical URL + OG sharing tags for paid portfolios
    const portfolioUrl = 'https://portfolioai.company/portfolio/' + slug
    const polishMeta = '<link rel="canonical" href="' + portfolioUrl + '">' +
      '<meta property="og:url" content="' + portfolioUrl + '">' +
      '<meta property="og:type" content="profile">' +
      '<meta name="twitter:card" content="summary_large_image">'
    
    if (html.includes('</head>') && !html.includes('og:url')) {
      html = html.replace('</head>', polishMeta + '</head>')
    }
    
    await supabase.from('portfolios').update({ views: (data.views || 0) + 1 }).eq('id', data.id)
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  }

  const pricingUrl = '/pricing?portfolio_id=' + portfolioId

  // OWNER view - full preview with bottom bar (let them see what they get)
  const portfolioAgeMs = Date.now() - new Date(data.created_at).getTime()
  const FIVE_MINUTES = 5 * 60 * 1000
  const isFreshlyGenerated = portfolioAgeMs < FIVE_MINUTES
  
  // Owner gets full preview for first 5 minutes (the "wow moment"), then blur kicks in
  if (isOwner && isFreshlyGenerated) {
    const ownerBar = `<style>
  body { padding-bottom: 80px; }
  #pai-bottom-bar {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 99999;
    background: rgba(12,10,8,0.96);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid rgba(201,169,110,.25);
    padding: 14px 24px;
    display: flex; align-items: center; justify-content: space-between;
    font-family: 'DM Sans', sans-serif; gap: 16px; flex-wrap: wrap;
  }
  #pai-bar-badge {
    background: rgba(201,169,110,.12); color: #c9a96e;
    font-size: 10px; font-weight: 700; letter-spacing: .12em;
    text-transform: uppercase; padding: 5px 10px; border-radius: 2px;
  }
  #pai-bar-msg { font-size: 13px; color: rgba(245,240,232,.7); }
  #pai-bar-msg strong { color: #c9a96e; font-weight: 600; }
  #pai-bar-btn {
    background: #c9a96e; color: #0c0a08;
    padding: 11px 24px; border-radius: 3px; font-size: 13px;
    font-weight: 700; text-decoration: none; white-space: nowrap;
  }
  @media (max-width: 600px) { #pai-bottom-bar { padding: 12px 16px; flex-direction: column; } }
</style>
<!-- watermark -->
<div id="pai-bottom-bar">
  <div style="display:flex;align-items:center;gap:12px;flex:1">
    <span id="pai-bar-badge">Your Preview</span>
    <span id="pai-bar-msg">This is how it looks. <strong>Publish for $4.99</strong> to share with recruiters.</span>
  </div>
  <a id="pai-bar-btn" href="${pricingUrl}">Publish for $4.99 →</a>
</div>
<!-- end watermark -->`

    html = html.includes('</body>') ? html.replace('</body>', ownerBar + '</body>') : html + ownerBar
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' }
    })
  }

  // EXPIRY CHECK: If unpaid portfolio is older than 72 hours, show expired page
  const portfolioAge = Date.now() - new Date(data.created_at).getTime()
  const EXPIRY_MS = 72 * 60 * 60 * 1000 // 72 hours
  
  if (portfolioAge > EXPIRY_MS) {
    const expiredPricingUrl = '/pricing?portfolio_id=' + portfolioId
    const expiredPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
  <title>Preview Expired - PortfolioAI</title>
  <meta name="robots" content="noindex, nofollow">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0c0a08;
      color: #f5f0e8;
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 480px;
      width: 100%;
      text-align: center;
    }
    .badge {
      display: inline-block;
      background: rgba(201,169,110,.1);
      border: 1px solid rgba(201,169,110,.25);
      color: #c9a96e;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .15em;
      text-transform: uppercase;
      padding: 6px 12px;
      border-radius: 2px;
      margin-bottom: 28px;
    }
    h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(36px, 6vw, 52px);
      font-weight: 700;
      line-height: 1.1;
      letter-spacing: -.03em;
      margin-bottom: 20px;
      color: #f5f0e8;
    }
    p {
      font-size: 16px;
      color: rgba(245,240,232,.55);
      line-height: 1.6;
      margin-bottom: 32px;
      font-weight: 300;
    }
    .accent { color: #c9a96e; font-weight: 600; }
    .btn {
      display: inline-block;
      background: #c9a96e;
      color: #0c0a08;
      padding: 16px 36px;
      border-radius: 4px;
      font-size: 15px;
      font-weight: 700;
      text-decoration: none;
      letter-spacing: .02em;
      transition: background .2s;
      margin-bottom: 16px;
    }
    .btn:hover { background: #dbb97e; }
    .footer-link {
      display: block;
      font-size: 13px;
      color: rgba(245,240,232,.35);
      text-decoration: none;
      margin-top: 32px;
    }
    .footer-link:hover { color: rgba(245,240,232,.6); }
    .divider {
      width: 40px;
      height: 1px;
      background: rgba(201,169,110,.3);
      margin: 28px auto;
    }
  </style>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="container">
    <div class="badge">Preview Expired</div>
    <h1>This preview has expired</h1>
    <p>The 72-hour preview window for this portfolio has ended. <span class="accent">Publish it for $4.99</span> to keep it live forever, share with recruiters, and remove all restrictions.</p>
    <a class="btn" href="${expiredPricingUrl}">Publish for $4.99 →</a>
    <div class="divider"></div>
    <a class="footer-link" href="/">Build your own portfolio at PortfolioAI →</a>
  </div>
</body>
</html>`
    
    await supabase.from('portfolios').update({ views: (data.views || 0) + 1 }).eq('id', data.id)
    return new NextResponse(expiredPage, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' }
    })
  }
  
  // VISITOR view (not owner, not paid) - show full hero then lock
  const ageHours = Math.floor((Date.now() - new Date(data.created_at).getTime()) / (1000 * 60 * 60))
  const hoursRemaining = Math.max(0, 72 - ageHours)
  const gatedHtml = applyBlurGate(html, portfolioId, hoursRemaining)

  await supabase.from('portfolios').update({ views: (data.views || 0) + 1 }).eq('id', data.id)

  return new NextResponse(gatedHtml, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' }
  })
}