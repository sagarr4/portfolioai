export const runtime = 'nodejs'
export const maxDuration = 300

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { extractTextFromPdf } from '@/lib/ai/extractPdf'
import { parseResume } from '@/lib/ai/parseResume'
import { generatePortfolioHTML } from '@/lib/ai/generatePortfolio'
import { processPhoto } from '@/lib/portfolio/enhancePhoto'
import { pickHueFamily } from '@/lib/portfolio/theme'
import { NextResponse } from 'next/server'

const WATERMARK = '<!-- watermark --><div id="portfolioai-watermark" style="position:fixed;bottom:0;left:0;right:0;z-index:99999;background:rgba(12,10,8,.96);border-top:1px solid rgba(201,169,110,.2);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;font-family:sans-serif;gap:16px;"><span style="font-size:13px;color:rgba(245,240,232,.7);">Preview only, <strong style="color:#c9a96e;font-weight:600;">Launch for $4.99</strong> to share</span><a href="/pricing" style="background:#c9a96e;color:#0c0a08;padding:9px 22px;border-radius:3px;font-size:13px;font-weight:700;text-decoration:none;">Launch now</a></div><!-- end watermark -->'

export async function POST(request: Request) {
  const t0 = Date.now()
  const elapsed = () => ((Date.now() - t0) / 1000).toFixed(1) + 's'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const allowedEmails = (process.env.ALLOWED_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
    const userEmail = (user.email || '').toLowerCase()
    const isWhitelisted = allowedEmails.includes(userEmail)

    console.log('Upload check - User:', userEmail, 'Whitelisted:', isWhitelisted)

    if (!isWhitelisted) {
      const { count: portfolioCount, error: countError } = await supabase
        .from('portfolios')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      console.log('Portfolio count for user:', portfolioCount, 'Error:', countError?.message)

      if ((portfolioCount || 0) >= 1) {
        const { data: payments, error: payError } = await supabase
          .from('payments')
          .select('id, type')
          .eq('user_id', user.id)

        console.log('Payments found:', payments?.length, 'Error:', payError?.message)

        const hasAnyPayment = payments && payments.length > 0

        if (!hasAnyPayment) {
          return NextResponse.json({
            error: 'PAYMENT_REQUIRED',
            message: 'Launch your first portfolio for $4.99 before creating another one.',
          }, { status: 402 })
        }

        const launchPayments = payments.filter(p => p.type === 'launch' || p.type === 'bundle').length
        const maxAllowed = launchPayments + 1

        if ((portfolioCount || 0) >= maxAllowed) {
          return NextResponse.json({
            error: 'PAYMENT_REQUIRED',
            message: 'Launch this portfolio for $4.99 to create another one.',
          }, { status: 402 })
        }
      }
    }

    const formData = await request.formData()
    const file = formData.get('resume') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    if (file.type !== 'application/pdf') return NextResponse.json({ error: 'PDF only' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Max 5MB' }, { status: 400 })

    const photoFile = formData.get('photo') as File | null
    const hasValidPhoto = !!(photoFile && photoFile.size > 0 && photoFile.type.startsWith('image/') && photoFile.size <= 8 * 1024 * 1024)

    console.log('[timing] request parsed, photo attached:', hasValidPhoto, '-', elapsed())

    const buffer = Buffer.from(await file.arrayBuffer())
    const text = await extractTextFromPdf(buffer)
    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: 'Could not read PDF text' }, { status: 400 })
    }

    console.log('[timing] PDF text extracted -', elapsed())

    const parsed = await parseResume(text)

    console.log('[timing] resume parsed (Haiku) -', elapsed())

    const slug = parsed.name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50) + '-' + Date.now()

    const seed = Date.now() % 10000

    const { data: portfolio, error: dbError } = await supabase
      .from('portfolios')
      .insert({
        user_id: user.id,
        title: parsed.name + "'s Portfolio",
        slug,
        seed,
        field: parsed.field,
        field_confidence: parsed.field_confidence,
        theme: parsed.theme,
        portfolio_data: parsed,
        html_content: '',
        is_published: false,
      })
      .select()
      .single()

    if (dbError || !portfolio) {
      console.error('DB error:', dbError)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    console.log('[timing] portfolio row inserted -', elapsed())

    let photoUrl: string | undefined = undefined

    if (hasValidPhoto) {
      try {
        const serviceSupabase = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        await serviceSupabase.from('portfolios').update({ photo_status: 'processing' }).eq('id', portfolio.id)

        const photoBytes = await photoFile!.arrayBuffer()
        const photoBuffer = Buffer.from(photoBytes)
        const mimeType = photoFile!.type

        const originalPath = user.id + '/' + portfolio.id + '/original.jpg'
        const { error: uploadError } = await serviceSupabase.storage
          .from('portfolio-photos')
          .upload(originalPath, photoBuffer, { contentType: mimeType, upsert: true })

        if (!uploadError) {
          const { data: originalUrlData } = serviceSupabase.storage
            .from('portfolio-photos')
            .getPublicUrl(originalPath)

          await serviceSupabase.from('portfolios')
            .update({ photo_original_url: originalUrlData.publicUrl })
            .eq('id', portfolio.id)

          console.log('[timing] original photo uploaded -', elapsed())

          const hueFamily = pickHueFamily(seed)
          const result = await processPhoto(photoBuffer, mimeType, hueFamily)

          console.log('[timing] processPhoto finished, mode:', result?.mode ?? 'null', '-', elapsed())

          if (result) {
            const contentType = result.extension === 'jpg' ? 'image/jpeg' : 'image/png'
            const enhancedPath = user.id + '/' + portfolio.id + '/enhanced.' + result.extension
            const { error: enhancedUploadError } = await serviceSupabase.storage
              .from('portfolio-photos')
              .upload(enhancedPath, result.buffer, { contentType, upsert: true })

            if (!enhancedUploadError) {
              const { data: enhancedUrlData } = serviceSupabase.storage
                .from('portfolio-photos')
                .getPublicUrl(enhancedPath)
              photoUrl = enhancedUrlData.publicUrl
              await serviceSupabase.from('portfolios').update({
                photo_enhanced_url: photoUrl,
                photo_status: 'ready'
              }).eq('id', portfolio.id)
            } else {
              photoUrl = originalUrlData.publicUrl
              await serviceSupabase.from('portfolios').update({ photo_status: 'ready' }).eq('id', portfolio.id)
            }
          } else {
            photoUrl = originalUrlData.publicUrl
            await serviceSupabase.from('portfolios').update({ photo_status: 'ready' }).eq('id', portfolio.id)
          }

          console.log('[timing] photo pipeline fully done -', elapsed())
        } else {
          await serviceSupabase.from('portfolios').update({ photo_status: 'failed' }).eq('id', portfolio.id)
        }
      } catch (photoErr) {
        console.error('Initial-generation photo processing failed, continuing without photo:', photoErr)
      }
    }

    let htmlContent = await generatePortfolioHTML(parsed, { seed, photoUrl })

    console.log('[timing] Opus hero generation finished -', elapsed())

    htmlContent = htmlContent.includes('</body>')
      ? htmlContent.replace('</body>', WATERMARK + '</body>')
      : htmlContent + WATERMARK

    const { data: finalPortfolio, error: updateError } = await supabase
      .from('portfolios')
      .update({ html_content: htmlContent })
      .eq('id', portfolio.id)
      .select()
      .single()

    if (updateError) {
      console.error('DB update error:', updateError)
      return NextResponse.json({ error: 'Failed to save generated portfolio' }, { status: 500 })
    }

    console.log('[timing] TOTAL request time -', elapsed())

    return NextResponse.json({ success: true, portfolio: finalPortfolio, parsed })
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Failed to process resume' }, { status: 500 })
  }
}
