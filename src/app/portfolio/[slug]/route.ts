export const runtime = 'nodejs'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('portfolios')
    .select('id, html_content, views, is_published')
    .eq('slug', slug)
    .single()

  if (error || !data || !data.html_content) {
    return new NextResponse('Portfolio not found', { status: 404 })
  }

  let html = data.html_content
  const portfolioId = data.id

  html = html.split('opacity:0').join('opacity:1')
  html = html.split('visibility:hidden').join('visibility:visible')

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

  const paywall = `<style>
  /* Limit body to first viewport height visually */
  body::after {
    content: "";
    position: fixed;
    top: 90vh;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(8,8,6,0) 0%, rgba(8,8,6,0.7) 10%, rgba(8,8,6,0.98) 25%, #080806 100%);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    z-index: 99997;
    pointer-events: none;
  }
  #pai-wall {
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99999;
    background: #0c0a08;
    border: 1px solid rgba(201,169,110,.4);
    border-radius: 8px;
    padding: 40px 48px;
    max-width: 520px;
    width: calc(100% - 40px);
    box-shadow: 0 24px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(201,169,110,.1);
    font-family: 'DM Sans', system-ui, sans-serif;
    text-align: center;
  }
  #pai-wall h2 {
    font-size: 24px;
    font-weight: 700;
    color: #f5f0e8;
    margin: 0 0 10px;
    letter-spacing: -.02em;
    line-height: 1.2;
  }
  #pai-wall p {
    font-size: 14px;
    color: rgba(245,240,232,.55);
    margin: 0 0 24px;
    line-height: 1.6;
    font-weight: 300;
  }
  #pai-wall p strong { color: #c9a96e; font-weight: 600; }
  #pai-pay {
    display: block;
    background: #c9a96e;
    color: #0c0a08;
    padding: 14px 28px;
    border-radius: 4px;
    font-size: 15px;
    font-weight: 700;
    text-decoration: none;
    letter-spacing: .02em;
    transition: background .2s;
  }
  #pai-pay:hover { background: #dbb97e; }
  #pai-own {
    display: inline-block;
    font-size: 12px;
    color: rgba(245,240,232,.35);
    text-decoration: none;
    margin-top: 14px;
    letter-spacing: .03em;
  }
  #pai-own:hover { color: rgba(245,240,232,.6); }
  #pai-badge {
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
    margin-bottom: 18px;
  }
  @media(max-width:600px){
    #pai-wall{padding:28px 24px;bottom:20px}
    #pai-wall h2{font-size:20px}
  }
</style>
<div id="pai-wall">
  <div id="pai-badge">✦ Preview Locked</div>
  <h2>Unlock your full portfolio</h2>
  <p>Launch it as a live URL for <strong>$4.99</strong>, one time, yours forever. Share with recruiters, add to LinkedIn, get hired faster.</p>
  <a id="pai-pay" href="${pricingUrl}">Launch my portfolio, $4.99 →</a>
  <a id="pai-own" href="/auth/signup">or build your own free</a>
</div>
<script>
  (function(){
    var maxScroll = window.innerHeight * 0.9;
    var locked = false;
    
    function lockScroll() {
      if (locked) return;
      locked = true;
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + window.scrollY + 'px';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    }
    
    function checkScroll() {
      if (window.scrollY >= maxScroll && !locked) {
        window.scrollTo({ top: maxScroll, behavior: 'instant' });
        lockScroll();
      }
    }
    
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('wheel', function(e) {
      if (window.scrollY >= maxScroll - 50) {
        e.preventDefault();
        lockScroll();
      }
    }, { passive: false });
    
    window.addEventListener('touchmove', function(e) {
      if (window.scrollY >= maxScroll - 50) {
        lockScroll();
      }
    }, { passive: true });
    
    // Disable right click
    document.addEventListener('contextmenu', function(e){ e.preventDefault(); });
    
    // Disable keyboard shortcuts
    document.addEventListener('keydown', function(e){
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 's' || e.key === 'p' || e.key === 'End')) {
        e.preventDefault();
      }
      if (e.key === 'End' || e.key === 'PageDown') {
        e.preventDefault();
      }
    });
  })();
</script>`

  if (html.includes('</body>')) {
    html = html.replace('</body>', paywall + '</body>')
  } else {
    html = html + paywall
  }

  await supabase.from('portfolios').update({ views: (data.views || 0) + 1 }).eq('id', data.id)

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' }
  })
}
