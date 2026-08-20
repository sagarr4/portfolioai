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

  await supabase.from('portfolios')
    .update({ photo_original_url: originalUrlData.publicUrl })
    .eq('id', portfolioId)

  const seed = portfolio.seed ?? (new Date(portfolio.created_at).getTime() % 10000)
  const hueFamily = pickHueFamily(seed)

  const result = await processPhoto(buffer, mimeType, hueFamily)

  if (!result) {
    await supabase.from('portfolios').update({
      photo_enhanced_url: originalUrlData.publicUrl,
      photo_status: 'ready'
    }).eq('id', portfolioId)

    return NextResponse.json({ success: true, photoUrl: originalUrlData.publicUrl, enhanced: false })
  }

  const contentType = result.extension === 'jpg' ? 'image/jpeg' : 'image/png'
  const enhancedPath = user.id + '/' + portfolioId + '/enhanced.' + result.extension
  const { error: enhancedUploadError } = await supabase.storage
    .from('portfolio-photos')
    .upload(enhancedPath, result.buffer, { contentType, upsert: true })

  if (enhancedUploadError) {
    await supabase.from('portfolios').update({
      photo_enhanced_url: originalUrlData.publicUrl,
      photo_status: 'ready'
    }).eq('id', portfolioId)

    return NextResponse.json({ success: true, photoUrl: originalUrlData.publicUrl, enhanced: false })
  }

  const { data: enhancedUrlData } = supabase.storage
    .from('portfolio-photos')
    .getPublicUrl(enhancedPath)

  await supabase.from('portfolios').update({
    photo_enhanced_url: enhancedUrlData.publicUrl,
    photo_status: 'ready'
  }).eq('id', portfolioId)

  return NextResponse.json({ success: true, photoUrl: enhancedUrlData.publicUrl, enhanced: true, mode: result.mode })
}
