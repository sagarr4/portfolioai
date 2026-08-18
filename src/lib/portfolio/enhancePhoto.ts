// Photo processing pipeline, best-effort chain:
//   1. Normalize EXIF rotation (always)
//   2. Try a real generative studio retouch via OpenAI's image model (best
//      quality -- professional lighting, real photographic background)
//   3. If that's unavailable for ANY reason (no key, no verified org, no
//      credits, network issue), fall back to local background removal
//      (@imgly/background-removal-node) -- fully offline, always works
//
// LICENSE NOTE: @imgly/background-removal-node is AGPL-licensed. Free to
// use, but AGPL's network-use clause can require sharing related source
// when run as part of a paid network service. IMG.LY sells a commercial
// license as an alternative (support@img.ly) -- worth revisiting before
// any funding, acquisition, or enterprise-contract due diligence.

import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal-node'
import sharp from 'sharp'

async function normalizeRotation(imageBuffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(imageBuffer).rotate().toBuffer()
  } catch (err) {
    console.error('Rotation normalize threw, using original buffer:', err)
    return imageBuffer
  }
}

async function generativeRetouch(imageBuffer: Buffer, mimeType: string, hueFamily: string): Promise<Buffer | null> {
  if (!process.env.OPENAI_API_KEY) return null
  try {
    const formData = new FormData()
    const blob = new Blob([Uint8Array.from(imageBuffer)], { type: mimeType })
    formData.append('image', blob, 'photo.jpg')
    formData.append('model', 'gpt-image-2')
    formData.append(
      'prompt',
      `Professional studio headshot retouch. Keep this exact person's face, ` +
      `identity, and expression completely unchanged -- do not alter their ` +
      `features in any way. Apply professional studio lighting: soft, even, ` +
      `flattering. Replace the background entirely with a smooth, softly lit ` +
      `studio backdrop in the ${hueFamily} color family, subtly gradiented, ` +
      `editorial-magazine quality. The result must remain fully and clearly ` +
      `recognizable as the exact same person, just professionally lit and composed.`
    )
    formData.append('quality', 'medium')
    formData.append('size', '1024x1024')

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
      body: formData as any,
    })

    if (!response.ok) {
      console.error('Generative retouch API error:', await response.text())
      return null
    }

    const data = await response.json()
    const b64 = data?.data?.[0]?.b64_json
    if (!b64) { console.error('Generative retouch: no image data in response'); return null }
    return Buffer.from(b64, 'base64')
  } catch (err) {
    console.error('Generative retouch threw:', err)
    return null
  }
}

async function removeBackgroundLocal(imageBuffer: Buffer, mimeType: string): Promise<Buffer | null> {
  try {
    const blob = new Blob([Uint8Array.from(imageBuffer)], { type: mimeType })
    const resultBlob = await imglyRemoveBackground(blob)
    const arrayBuffer = await resultBlob.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (err) {
    console.error('Local background removal threw:', err)
    return null
  }
}

export type PhotoResult = { buffer: Buffer; extension: 'jpg' | 'png'; mode: 'generative' | 'cutout' }

export async function processPhoto(imageBuffer: Buffer, mimeType: string, hueFamily: string): Promise<PhotoResult | null> {
  const normalized = await normalizeRotation(imageBuffer)

  const generative = await generativeRetouch(normalized, mimeType, hueFamily)
  if (generative) {
    return { buffer: generative, extension: 'jpg', mode: 'generative' }
  }

  const cutout = await removeBackgroundLocal(normalized, mimeType)
  if (cutout) {
    return { buffer: cutout, extension: 'png', mode: 'cutout' }
  }

  return null
}
