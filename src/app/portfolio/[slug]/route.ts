export const runtime = 'nodejs'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { slug } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data, error } = await supabase
    .from('portfolios')
    .select('id, html_content, views, slug, is_published')
    .eq('slug', slug)
    .single()

  if (error || !data || !data.html_content) {
    return new NextResponse('Portfolio not found', { status: 404 })
  }

  let html = data.html_content
  
  // Fix hidden elements
  html = html.replace(/opacity\s*:\s*0\b/g, 'opacity:1')
  html = html.replace(/visibility\s*:\s*hidden/g, 'visibility:visible')
  const safety = '<style>.reveal,.r,.fade-in,.slide-up,.animate,.hi,.hin,.hero-load{opacity:1!important;transform:none!important;visibility:visible!important}</style>'
  html = html.includes('</head>') ? html.replace('</head>', safety + '</head>') : safety + html

  if (!data.is_published) {
    // Add watermark for unpaid/preview
    if (!html.includes('portfolioai-watermark')) {
      const watermark = `<!-- watermark --><div id="portfolioai-watermark" style="position:fixed;bottom:0;left:0;right:0;z-index:99999;background:rgba(12,10,8,.96);border-top:1px solid rgba(201,169,110,.2);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;font-family:sans-serif;"><span style="font-size:13px;color:rgba(245,240,232,.6);">Preview only — <strong style="color:#c9a96e;">Launch for $4.99</strong> to share with recruiters</span><a href="/pricing" style="background:#c9a96e;color:#0c0a08;padding:8px 20px;border-radius:3px;font-size:13px;font-weight:600;text-decoration:none;">Launch now →</a></div><!-- end watermark -->`
      html = html.includes('</body>') ? html.replace('</body>', watermark + '</body>') : html + watermark
    }
    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }

  // Published - remove watermark and serve
  html = html.replace(/<!-- watermark -->[sS]*?<!-- end watermark -->/g, '')
  await supabase.from('portfolios')
    .update({ views: (data.views || 0) + 1 })
    .eq('id', data.id)

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600',
    }
  })
}