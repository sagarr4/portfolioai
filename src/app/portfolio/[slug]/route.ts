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
  html, body { overflow: hidden !important; height: 100vh !important; }
  body::after {
    content: "";
    position: fixed;
    top: 70vh;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(8,8,6,0) 0%, rgba(8,8,6,0.6) 8%, rgba(8,8,6,0.98) 25%, #080806 100%);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
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
    box-shadow: 0 24px 80px rgba(0,0,0,.6);
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
  <div id="pai-badge">Preview Mode</div>
  <h2>Like what you see?</h2>
  <p>Publish your portfolio as a live URL for <strong>$4.99</strong> one time. Yours forever. No subscription.</p>
  <a id="pai-pay" href="${pricingUrl}">Publish for $4.99 →</a>
</div>
<script>
  (function(){
    // Lock scroll IMMEDIATELY - no scrolling at all on unpaid previews
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    window.addEventListener('scroll', function(e){
      window.scrollTo(0, 0);
    }, { passive: false });
    
    window.addEventListener('wheel', function(e){
      e.preventDefault();
    }, { passive: false });
    
    window.addEventListener('touchmove', function(e){
      e.preventDefault();
    }, { passive: false });
    
    document.addEventListener('keydown', function(e){
      if (['ArrowDown','ArrowUp','PageDown','PageUp','End','Home',' '].includes(e.key)) {
        e.preventDefault();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 's' || e.key === 'p')) {
        e.preventDefault();
      }
    });
    
    document.addEventListener('contextmenu', function(e){ e.preventDefault(); });
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