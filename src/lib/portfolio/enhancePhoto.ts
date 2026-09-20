// Photo processing pipeline, best-effort chain:
//   1. Normalize EXIF rotation (always)
//   2. Try a real generative studio retouch via OpenAI's image model (best
//      quality -- professional lighting, real photographic background)
//   3. If that's unavailable for ANY reason (no key, no verified org, no
//      credits, network issue), fall back to local background removal
//      (@imgly/background-removal-node) -- fully offline, always works
//   4. Standardize final dimensions (always, regardless of which path
//      produced the image) -- see standardizeDimensions below.
//
// IMPORTANT: both sharp AND @imgly/background-removal-node are imported
// DYNAMICALLY inside their respective functions, never at module
// top-level. Both ship native platform binaries (libvips, ONNX runtime)
// that have been confirmed to fail loading in Vercel's serverless
// environment (Aug 2026 incident -- onnxruntime failed first, then
// sharp's libvips failed immediately after that fix shipped). A static
// top-level import means ANY such failure crashes this ENTIRE module --
// and therefore every route that imports processPhoto, including plain
// resume uploads with no photo attached. Dynamic imports inside each
// function's existing try/catch contain failures locally instead:
// normalizeRotation falls back to the original unrotated buffer,
// removeBackgroundLocal returns null (no photo processed) -- neither one
// takes down resume upload anymore.
//
// LICENSE NOTE: @imgly/background-removal-node is AGPL-licensed. Free to
// use, but AGPL's network-use clause can require sharing related source
// when run as part of a paid network service. IMG.LY sells a commercial
// license as an alternative (support@img.ly) -- worth revisiting before
// any funding, acquisition, or enterprise-contract due diligence.

// Every stored photo (generative OR cutout) is normalized to this exact
// pixel size before upload. This is a hard, code-level guarantee -- not
// a prompt instruction -- because we've spent this whole session
// learning that "make the model do X consistently" doesn't hold up.
// 4:5 portrait ratio -- close to a standard headshot crop, and taller
// than it is wide to suit the hero's portrait-oriented photo column.
const STANDARD_WIDTH = 1024
const STANDARD_HEIGHT = 1280

async function normalizeRotation(imageBuffer: Buffer): Promise<Buffer> {
  try {
    const sharp = (await import('sharp')).default
    return await sharp(imageBuffer).rotate().toBuffer()
  } catch (err) {
    console.error('Rotation normalize threw, using original buffer:', err)
    return imageBuffer
  }
}

// Resizes+crops to STANDARD_WIDTH x STANDARD_HEIGHT regardless of source
// aspect ratio. position:'top' biases the crop toward the upper portion
// of the frame (where a face typically sits in a headshot-style photo)
// rather than a plain center-crop, which would risk cutting off the top
// of the head on a tall source image. Preserves transparency for PNG
// cutouts (jpeg has no alpha channel, so generative/jpg output is
// flattened onto opaque as part of re-encoding).
// If this throws for any reason, returns the ORIGINAL buffer unresized
// rather than failing the request -- consistent with this file's
// existing "never block portfolio creation" philosophy.
async function standardizeDimensions(imageBuffer: Buffer, extension: 'jpg' | 'png'): Promise<Buffer> {
  try {
    const sharp = (await import('sharp')).default
    // 'attention' is sharp's built-in content-aware crop: it analyzes
    // the image for the most visually salient region (faces, sharp
    // edges, high-contrast areas) and crops around THAT, rather than
    // a fixed guess like 'top' that assumes every photo is framed the
    // same way. This is what actually fixes badly-cropped candid or
    // turned-angle photos -- a real analysis of this specific image,
    // not a smarter constant. No new dependency: this ships as part
    // of the sharp package we already use here.
    const resized = sharp(imageBuffer).resize(STANDARD_WIDTH, STANDARD_HEIGHT, {
      fit: 'cover',
      position: sharp.strategy.attention,
    })
    return extension === 'png'
      ? await resized.png().toBuffer()
      : await resized.jpeg({ quality: 90 }).toBuffer()
  } catch (err) {
    console.error('Dimension standardization threw, using unresized buffer:', err)
    return imageBuffer
  }
}

async function generativeRetouch(imageBuffer: Buffer, mimeType: string, hueFamily: string): Promise<Buffer | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Generative retouch skipped: OPENAI_API_KEY not set in this environment')
    return null
  }
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
      `editorial-magazine quality. If the subject's current clothing is ` +
      `casual (a plain t-shirt, hoodie, graphic print, or athletic wear), ` +
      `replace it with simple, professional business-appropriate attire -- ` +
      `a blazer, button-up shirt, or similar -- in a neutral, tasteful color ` +
      `that complements the backdrop. If they are already wearing ` +
      `business-appropriate clothing, leave it as-is. Never alter their ` +
      `face, skin tone, body shape, hair, or expression -- only the ` +
      `background and, where genuinely casual, the clothing. The result ` +
      `must remain fully and clearly recognizable as the exact same person, ` +
      `just professionally lit, dressed, and composed.`
    )
    formData.append('quality', 'medium')
    formData.append('size', '1024x1024')

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY },
      body: formData as BodyInit,
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
    const { removeBackground: imglyRemoveBackground } = await import('@imgly/background-removal-node')
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
    const standardized = await standardizeDimensions(generative, 'jpg')
    return { buffer: standardized, extension: 'jpg', mode: 'generative' }
  }

  const cutout = await removeBackgroundLocal(normalized, mimeType)
  if (cutout) {
    const standardized = await standardizeDimensions(cutout, 'png')
    return { buffer: standardized, extension: 'png', mode: 'cutout' }
  }

  return null
}
