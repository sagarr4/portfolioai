export const runtime = 'nodejs'
export const maxDuration = 120

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { processPhoto } from '@/lib/portfolio/enhancePhoto'
import { pickHueFamily } from '@/lib/portfolio/theme'

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const userSupabase = await createServerClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const portfolioId = formData.get('portfolioId') as string
  const file = formData.get('photo') as File

  if (!portfolioId || !file) {
    return NextResponse.json({ error: 'Missing portfolioId or photo' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be under 8MB' }, { status: 400 })
  }

  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('id, user_id, created_at, seed')
    .eq('id', portfolioId)
    .single()

  if (!portfolio || portfolio.user_id !== user.id) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const mimeType = file.type

  await supabase.from('portfolios').update({ photo_status: 'processing' }).eq('id', portfolioId)

  // CACHE-BUSTING: original.jpg and enhanced.<ext> are FIXED, deterministic
  // paths per portfolio (upsert:true overwrites the same object every time
  // a new photo is uploaded). That means re-uploading produces the exact
  // same public URL as before -- which is exactly what lets a browser or
  // CDN keep serving the OLD cached image at that URL after the new file
  // has already overwritten it server-side. One timestamp per request,
  // appended to every URL we store/return, makes each upload's URL unique
  // so nothing can serve stale bytes under it. The storage object itself
  // ignores the query string -- it still resolves to the same file -- this
  // purely defeats caching.
  const cacheBust = Date.now()

  const originalPath = user.id + '/' + portfolioId + '/original.jpg'
  const { error: uploadError } = await supabase.storage
    .from('portfolio-photos')
    .upload(originalPath, buffer, { contentType: mimeType, upsert: true })

  if (uploadError) {
    await supabase.from('portfolios').update({ photo_status: 'failed' }).eq('id', portfolioId)
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
  }

  const { data: originalUrlData } = supabase.storage
    .from('portfolio-photos')
    .getPublicUrl(originalPath)
  const originalUrl = originalUrlData.publicUrl + '?v=' + cacheBust

  await supabase.from('portfolios')
    .update({ photo_original_url: originalUrl })
    .eq('id', portfolioId)

  const seed = portfolio.seed ?? (new Date(portfolio.created_at).getTime() % 10000)
  const hueFamily = pickHueFamily(seed)

  const result = await processPhoto(buffer, mimeType, hueFamily)

  if (!result) {
    await supabase.from('portfolios').update({
      photo_enhanced_url: originalUrl,
      photo_status: 'ready'
    }).eq('id', portfolioId)

    return NextResponse.json({ success: true, photoUrl: originalUrl, enhanced: false })
  }

  const contentType = result.extension === 'jpg' ? 'image/jpeg' : 'image/png'
  const enhancedPath = user.id + '/' + portfolioId + '/enhanced.' + result.extension
  const { error: enhancedUploadError } = await supabase.storage
    .from('portfolio-photos')
    .upload(enhancedPath, result.buffer, { contentType, upsert: true })

  if (enhancedUploadError) {
    await supabase.from('portfolios').update({
      photo_enhanced_url: originalUrl,
      photo_status: 'ready'
    }).eq('id', portfolioId)

    return NextResponse.json({ success: true, photoUrl: originalUrl, enhanced: false })
  }

  const { data: enhancedUrlData } = supabase.storage
    .from('portfolio-photos')
    .getPublicUrl(enhancedPath)
  const enhancedUrl = enhancedUrlData.publicUrl + '?v=' + cacheBust

  await supabase.from('portfolios').update({
    photo_enhanced_url: enhancedUrl,
    photo_status: 'ready'
  }).eq('id', portfolioId)

  return NextResponse.json({ success: true, photoUrl: enhancedUrl, enhanced: true, mode: result.mode })
}
