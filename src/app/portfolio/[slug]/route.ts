export const runtime = 'nodejs'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // Use service role to fetch portfolio (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('portfolios')
    .select('id, html_content, views, is_published, user_id')
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
    await supabase.from('portfolios').update({ views: (data.views || 0) + 1 }).eq('id', data.id)
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }

  const pricingUrl = '/pricing?portfolio_id=' + portfolioId

  // OWNER view - full preview with bottom bar (let them see what they get)
  if (isOwner) {
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

  // VISITOR view (not owner, not paid) - show full hero then lock
  const visitorPaywall = `<style>
  html, body { overflow: hidden !important; }
  body { max-height: 100vh !important; position: relative; }
  
  /* Blur everything below the hero (first viewport) */
  body::after {
    content: "";
    position: fixed;
    top: 100vh; left: 0; right: 0; bottom: -100vh;
    background: #080806;
    z-index: 99996;
    pointer-events: none;
  }
  
  /* Gradient fade at bottom of hero */
  body::before {
    content: "";
    position: fixed;
    top: 75vh; left: 0; right: 0; height: 25vh;
    background: linear-gradient(to bottom, rgba(8,8,6,0) 0%, rgba(8,8,6,0.7) 40%, rgba(8,8,6,1) 100%);
    z-index: 99996;
    pointer-events: none;
  }
  
  #pai-wall {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99999;
    background: #0c0a08;
    border: 1px solid rgba(201,169,110,.4);
    border-radius: 8px;
    padding: 32px 40px;
    max-width: 480px;
    width: calc(100% - 40px);
    box-shadow: 0 24px 80px rgba(0,0,0,.6);
    font-family: 'DM Sans', sans-serif;
    text-align: center;
  }
  #pai-wall h2 {
    font-size: 22px; font-weight: 700; color: #f5f0e8;
    margin: 0 0 8px; letter-spacing: -.02em; line-height: 1.2;
  }
  #pai-wall p {
    font-size: 14px; color: rgba(245,240,232,.55);
    margin: 0 0 20px; line-height: 1.5;
  }
  #pai-wall p strong { color: #c9a96e; font-weight: 600; }
  #pai-pay {
    display: block; background: #c9a96e; color: #0c0a08;
    padding: 13px 28px; border-radius: 4px; font-size: 14px;
    font-weight: 700; text-decoration: none;
  }
  #pai-pay:hover { background: #dbb97e; }
  #pai-own {
    display: inline-block; font-size: 12px; color: rgba(245,240,232,.4);
    text-decoration: none; margin-top: 12px;
  }
  #pai-badge {
    display: inline-block; background: rgba(201,169,110,.1);
    border: 1px solid rgba(201,169,110,.25); color: #c9a96e;
    font-size: 10px; font-weight: 700; letter-spacing: .15em;
    text-transform: uppercase; padding: 5px 11px; border-radius: 2px; margin-bottom: 14px;
  }
  @media(max-width:600px){
    #pai-wall{padding:24px 20px;bottom:16px}
    #pai-wall h2{font-size:18px}
  }
</style>
<!-- watermark -->
<div id="pai-wall">
  <div id="pai-badge">Preview</div>
  <h2>Like what you see?</h2>
  <p>Build your own world-class portfolio from your resume. <strong>Free to try.</strong></p>
  <a id="pai-pay" href="/auth/signup">Build my own portfolio , Free</a>
  <a id="pai-own" href="/">Made with PortfolioAI →</a>
</div>
<!-- end watermark -->
<script>
  (function(){
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('scroll', function(){ window.scrollTo(0,0); });
    window.addEventListener('wheel', function(e){ e.preventDefault(); }, { passive: false });
    window.addEventListener('touchmove', function(e){ e.preventDefault(); }, { passive: false });
    document.addEventListener('keydown', function(e){
      if (['ArrowDown','ArrowUp','PageDown','PageUp','End','Home',' '].includes(e.key)) e.preventDefault();
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 's' || e.key === 'p')) e.preventDefault();
    });
    document.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  })();
</script>`

  html = html.includes('</body>') ? html.replace('</body>', visitorPaywall + '</body>') : html + visitorPaywall

  await supabase.from('portfolios').update({ views: (data.views || 0) + 1 }).eq('id', data.id)

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' }
  })
}