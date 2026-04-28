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
    .select('id, html_content, views')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !data) return new NextResponse('Not found', { status: 404 })
  if (!data.html_content) return new NextResponse('No content', { status: 404 })

  await supabase.from('portfolios')
    .update({ views: (data.views || 0) + 1 })
    .eq('id', data.id)

  let html = data.html_content
  html = html.replace(/opacitys*:s*0/g, 'opacity:1')
  html = html.replace(/visibilitys*:s*hidden/g, 'visibility:visible')

  const safety = '<style>.reveal,.r,.fade-in,.slide-up,.animate,.hi,.hin,.hero-load{opacity:1!important;transform:none!important;visibility:visible!important}</style>'
  html = html.includes('</head>') ? html.replace('</head>', safety + '</head>') : safety + html

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })
}