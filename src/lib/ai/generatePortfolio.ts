import Anthropic from '@anthropic-ai/sdk'
import { ParsedResume } from './parseResume'
import { HUE_FAMILIES, pickHueFamily } from '@/lib/portfolio/theme'

const client = new Anthropic()

const FIELD_GUIDES: Record<string, string> = {
  "engineering": "Technical, precise tone. Fonts: JetBrains Mono or Space Mono paired with Inter. Vocabulary should feel like a senior engineer wrote it -- direct, systems-minded, quantified.",
  "design": "Bold, editorial tone. Fonts: Syne or Clash Display paired with DM Sans. Vocabulary is confident and visual, break conventions.",
  "finance": "Authoritative, composed tone. Fonts: Playfair Display or Fraunces paired with Source Sans Pro. Vocabulary is formal, precise, gravitas without stiffness.",
  "legal": "Formal gravitas tone. Fonts: EB Garamond or Newsreader paired with Lato. Vocabulary is measured and credential-forward.",
  "marketing": "High-energy, results tone. Fonts: Syne or Archivo Black paired with Inter. Vocabulary leads with outcomes and numbers.",
  "healthcare": "Warm, trustworthy tone. Fonts: Nunito or Figtree paired with Source Sans Pro. Vocabulary is clear, credential-forward, human.",
  "education": "Warm, scholarly tone. Fonts: Lora or Fraunces paired with Open Sans. Vocabulary is thoughtful, mentorship-minded.",
  "creative": "Expressive, magazine tone. Fonts: Playfair Display italic, Bebas Neue, or Fraunces paired with DM Sans. Vocabulary is vivid and personal.",
  "other": "Clean, confident tone. Fonts: Plus Jakarta Sans or General Sans paired with Inter. Vocabulary is precise and professional."
}

const GEOMETRY_AXIS = [
  'Centered, symmetrical composition',
  'Left-anchored content with deliberate negative space on the right',
  'Split-screen: two distinct content zones side by side',
  'A rotated or diagonally-clipped content block breaking the normal rectangle',
  'Overlapping, layered elements with real z-depth, not flat stacking',
  'Full-bleed edge-to-edge treatment with content floating over it'
]
const CONTENT_LEAD_AXIS = [
  "The person's name, treated as the dominant visual element",
  'A single sharp first-person statement or claim, name secondary',
  "A standout number or metric from their career, name as confirmation of who achieved it",
  'A short scene-setting line establishing context before identity',
  'A visual or graphic mark, with text as a secondary layer'
]
const TYPOGRAPHY_AXIS = [
  'One massive word or short phrase at extreme scale',
  'Multi-line stacked text where each line is a distinctly different scale',
  'Mixed scale within a single line -- some words huge, some small, deliberate contrast',
  'Uniform modest scale, with rhythm built from spacing and repetition rather than size contrast',
  'Monospace or code-adjacent styling used as ONE deliberate accent detail, not the whole hero'
]
const DECORATIVE_AXIS = [
  'None -- pure typography and whitespace carry the hero',
  'Soft geometric shapes or blobs',
  'Fine line work, rules, or grid marks',
  'A subtle dot or particle field rendered in CSS',
  'A bespoke abstract mark built from CSS shapes, reflecting the person\'s field'
]

const CREATIVE_DEVICES = [
  "An oversized typographic moment elsewhere on the page (not the hero) -- a single word or short phrase blown up dramatically as a section divider. This large decorative text must sit clearly BEHIND or AROUND actual readable content, never directly through or across a block of body text/paragraphs -- position it in the section's negative space (e.g. spanning a header area, or behind a card with its own opaque background) so no word of real content is ever visually cut or crossed by the oversized letterforms.",
  "A genuinely asymmetric, broken-grid layout in the projects or experience section -- cards of deliberately different sizes, not a uniform grid.",
  "One truly interactive element: a hover-reactive skill cloud, a draggable element, or a custom cursor state -- something that responds, not just animates on scroll.",
  "A non-list skill visualization: skills as an orbit, a radial cluster, a bar chart built from CSS, or a constellation -- never a plain tag row.",
  "Large decorative numerals used as SECTION dividers only (never in the hero) -- one per section, positioned as background art.",
  "A diagonal or rotated section break -- one section's background is subtly rotated or clipped at an angle, breaking the stacked-rectangle rhythm.",
  "A custom scroll-progress indicator or reading-position marker, styled to match the palette.",
  "A bespoke illustration or motif built entirely from CSS shapes (no images) -- an abstract mark reflecting the person's field, placed prominently once."
]

const TIER_B_ENABLED = process.env.ENABLE_TIER_B_ANIMATIONS === 'true'

const TIER_B_SECTION = `
MOTION & 3D REQUIREMENTS (mandatory wherever present -- these are requirements, not suggestions):

Design tokens -- use these exact values, do not invent alternatives:
- Entrance/exit easing: cubic-bezier(0.23, 1, 0.32, 1)
- On-screen movement easing: cubic-bezier(0.77, 0, 0.175, 1)
- Hover/color transitions: ease, 150-250ms
- Scroll reveals: ease-out, 400-600ms, staggered 40-70ms between siblings (cap at 8 staggered items, reveal any remainder together)

Hero 3D layer:
- Add a Three.js background (load r128 from https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js) anchored to the hero section
- One scene: a low-poly particle field (150-250 points max) for technical/analytical fields, or a soft animated gradient mesh for creative/other fields
- Camera or particles drift on mousemove and scroll, max displacement ~30-40px, using a lerped/damped follow each frame -- never snap directly to the cursor position
- As the user scrolls past the hero, fade the 3D layer's opacity smoothly to 0 over roughly the first 400-600px of scroll (scroll-linked opacity, not a hard cutoff). Pause the render loop entirely once the canvas is out of view.
- Wrap all Three.js setup in try/catch. On any error, or if WebGL is unavailable, do nothing further and rely on the CSS gradient hero background underneath -- the page must never show blank or broken
- On viewports under 700px wide, or when navigator.hardwareConcurrency is 4 or less, halve the particle/vertex count or skip the 3D layer entirely and keep the CSS gradient only

Per-section motion -- REQUIRED, not optional, every card and section must have these:
- EVERY card (project cards, experience cards, skill groups, education entries) MUST enter with a dimensional lift: translateY(20-28px) combined with rotateX(3-5deg), settling to translateY(0) rotateX(0) on reveal. This is a hard requirement, not a stylistic option -- implement it on every card element without exception.
- Background/decorative elements (large section numbers, gradient blobs, section-label text, card borders) MUST parallax at roughly 0.5-0.7x scroll speed using transform: translateY, layered behind foreground content, on at least every section past the hero.
- Vary stagger patterns across sections for visual interest: grid-based sections stagger by row or column position rather than pure DOM order; list-based sections keep simple top-to-bottom stagger.

VISUAL CONTINUITY -- the whole page must read as one designed space, not "rich hero, plain rest":
- Carry the hero's accent color and a whisper of its spatial/3D language into at least 2 sections below the hero -- for example: a few faint static dots or a soft radial glow in a section background using the same accent color and particle motif, at low opacity, purely decorative
- Section backgrounds should shift subtly in tone (not flat identical dark/light blocks stacked one after another) so scrolling feels like moving through a considered environment
- The accent color chosen for the hero must reappear consistently as the accent throughout -- links, highlights, icons, card borders -- never introduce a second unrelated accent color later in the page

HARD RULE -- readable content never keeps moving:
- Once a paragraph, bullet point, skill tag, or any text block a recruiter would read has finished its entrance animation, it must be completely static -- no continuous drift, pulse, float, or parallax on the text itself. Parallax and persistent motion are reserved strictly for decorative/background elements, never on the content a person is trying to read.

Motion rules everywhere on the page:
- Animate only transform and opacity -- never width, height, margin, padding, top, or left
- Entrances start from opacity:0 and translateY(12-20px) scale(0.96-0.98) -- never scale(0)
- ease-out for entering/exiting, ease-in-out for on-screen movement, ease for hover -- never ease-in
- Gate all hover-only motion behind @media (hover: hover) and (pointer: fine)
- Respect @media (prefers-reduced-motion: reduce): replace transform entrances with a plain opacity fade (200ms ease), disable all parallax, and fully disable the Three.js layer and any cursor-follow effects, falling back to the static CSS gradient
- Magnetic buttons and cursor-follow effects must interpolate toward the cursor each frame (lerp or spring), never set transform directly from raw mouse coordinates
`

function buildPhotoSection(photoUrl: string, decorative: string, isFullPhoto: boolean): string {
  const formatInstructions = isFullPhoto
    ? `- This is a complete, already professionally studio-retouched photograph (opaque JPEG). Do not re-touch or re-color-grade the photograph's actual pixels -- it is already finished.`
    : `- This photo has its background already removed (transparent PNG, just the person). Build a background behind it directly in CSS using this generation's accent color and hue family -- a gradient or soft radial glow that matches the rest of the hero.`

  return `
PHOTO INTEGRATION -- a real photo of this person is available at: ${photoUrl}

The photo is COMPULSORY in this hero. Its placement, sizing, and layering are HARD CSS rules, not suggestions -- earlier versions of this instruction produced (a) a boxed photo with visible page-background gaps on every side, and separately (b) decorative dots rendering directly on top of the person's face and clothing, plus a stray empty bordered box with no fill. None of that may happen again. Be literal and exact:

- Layout: a right-anchored two-column split for the hero specifically. Text/name/headline content occupies the LEFT column. The photo occupies the RIGHT column. This overrides whatever the compositional geometry axis says for the hero's column arrangement.
- The photo's container must be exactly 100% of the hero's height (height: 100%) and at least 42% of the hero's width, positioned flush against the TOP, RIGHT, and BOTTOM edges of the hero/viewport -- zero margin, zero padding on those three sides. Use object-fit: cover on the <img> so it fills that box completely with no letterboxing.
- FORBIDDEN on the photo: border-radius (other than 0), box-shadow, border, margin, or any treatment that makes it read as a floating card or panel.
- LAYERING (numeric, non-negotiable): the decorative background layer gets z-index: 0, the photo gets z-index: 1, the text column gets z-index: 2. The only thing that reveals the decorative layer near the photo is the mask-image fade on the photo's own inner edge (below) -- never place a dot, particle, or shape element positioned on top of the photo's bounding box. If a decorative element's coordinates would fall within the photo area, it must not render there.
- Any decorative touch placed near the photo (a glow, a line) must be a real filled or stroked visual element with actual color/opacity -- never an empty <div> with only a border and no background or content. No empty bordered box may appear anywhere in the hero.
${formatInstructions}
- The ONLY edge that gets any softening is the inner edge facing the text column (typically the left edge of the photo) -- apply a linear-gradient mask-image (e.g. linear-gradient(to right, transparent 0%, black 15-20%)) so that edge fades toward the page background/decorative layer (decorative language: "${decorative}"), rather than cutting hard against the text column. Top, right, and bottom edges stay flush to the viewport with no fade, no gap, and no frame.
- Give it the same entrance timing/easing as the rest of the hero (use the established design tokens if Tier B motion is active below). If Tier B is active, give the photo its own subtle parallax at a different rate than the background layer so the two read as one cohesive sense of depth.
`
}

export async function generatePortfolioHTML(
  data: ParsedResume,
  options?: { seed?: number; photoUrl?: string }
): Promise<string> {
  const seed = options?.seed ?? (Date.now() % 10000)
  const photoUrl = options?.photoUrl
  const guide = FIELD_GUIDES[data.field] || FIELD_GUIDES['other']
  const hueFamily = pickHueFamily(seed)
  const geometry = GEOMETRY_AXIS[Math.floor(seed / 8) % 6]
  const contentLead = CONTENT_LEAD_AXIS[Math.floor(seed / 48) % 5]
  const typography = TYPOGRAPHY_AXIS[Math.floor(seed / 240) % 5]
  const decorative = DECORATIVE_AXIS[Math.floor(seed / 1200) % 5]
  const creativeDevice = CREATIVE_DEVICES[Math.floor(seed / 7) % 8]

  const experienceText = data.experience.map((e, i) =>
    (i+1) + '. ' + e.role + ' at ' + e.company + ' (' + e.duration + ')\n' +
    e.highlights.map(h => '   - ' + h).join('\n')
  ).join('\n')

  const projectText = (data.projects || []).map(p =>
    '- ' + p.name + ': ' + p.description + ' [' + (p.tech||[]).join(', ') + ']'
  ).join('\n')

  const prompt = `You are the world's greatest portfolio website creator, a hybrid of Apple design team, Pentagram, and a senior full-stack engineer. You build portfolios so extraordinary that recruiters screenshot them.

PERSON DATA:
Name: ${data.name}
Title: ${data.title}
Field: ${data.field}
Email: ${data.email}
Phone: ${data.phone || 'not provided'}
Location: ${data.location || 'not provided'}
Summary: ${data.summary}
Skills: ${data.skills.join(', ')}
Experience:
${experienceText}
Education: ${data.education.map(e => e.degree + ', ' + e.institution + ' (' + e.year + ')').join(' | ')}
Projects:
${projectText}
Certifications: ${(data.certifications||[]).join(', ')||'none'}

TONE & TYPE GUIDE FOR ${data.field.toUpperCase()}:
${guide}

HERO SYNTHESIS -- do not select from a known template you have seen before. For THIS specific person, using their actual title, their single most impressive achievement or metric, and the tone of their bio, invent an original hero concept nobody else would land on. Blend the four dimensions below into one coherent composition -- do not satisfy them as a checklist, fuse them into a single considered idea grounded in this person's real story:

- Compositional geometry: ${geometry}
- Content lead (what the eye reads first): ${contentLead}
- Typographic strategy: ${typography}
- Decorative language: ${decorative}
${photoUrl ? '\nNOTE: a photo is provided for this person -- the hero column layout is fixed by the PHOTO INTEGRATION section below (a right-anchored two-column split) regardless of the compositional geometry above. Still use the geometry value to shape the text columns internal rhythm, spacing, and decorative touches within that constraint.\n' : ''}
Avoid defaulting to these overused patterns unless you have a specific reason grounded in this person's story: a const/code-declaration block as the entire hero device, a single large background numeral as the primary decorative element, or a perfectly centered stack of name+title+bio with no other structural idea. Any of these may appear as ONE small supporting detail if it genuinely fits, but never as the whole hero concept.

NAME LEGIBILITY -- non-negotiable regardless of which content-lead you were assigned above, and stricter than a soft guideline: a recruiter must identify whose portfolio this is within one second of the hero loading, without scrolling or hunting.
- The name must appear within the FIRST HALF of the hero's vertical space, or be the first text block in reading order -- never positioned as the last element after multiple lines of headline copy, and never styled like a footer or signature line.
- The name's font-size must be at least 60% of the single largest text element anywhere in the hero (if a headline word renders at 96px, the name must be at least ~58px). "Comparable to a body line" is NOT sufficient -- the name must visually compete with the boldest text on the page even when a headline technically leads reading order.
- Use full-opacity, high-contrast color for the name -- never a muted, translucent, or secondary-toned treatment.
- The content-lead axis governs READING ORDER only (what the eye processes first as the hook) -- it is never license to bury or shrink the name itself.
${photoUrl ? buildPhotoSection(photoUrl, decorative, photoUrl.toLowerCase().endsWith('.jpg') || photoUrl.toLowerCase().endsWith('.jpeg')) : ''}
COLOR PALETTE -- creative, not a fixed template:
- This generation's hue family to build around: ${hueFamily}
- Invent an original 2-3 color system yourself: a background base, a primary text color, and one accent tone drawn from that hue family. Choose the exact hex values -- make them feel premium and intentional for a ${data.field} portfolio, not generic.
- Explicitly avoid these two overused AI-generated defaults regardless of hue family: (a) a warm cream/off-white background (near #F4F1EA) paired with a terracotta/warm-clay accent (near #D97757), and (b) a near-black background paired with a single bright acid-green or vermilion accent. If your natural instinct lands near either of these, deliberately choose different hex values within the assigned hue family instead.
- Do not default to blue/indigo unless "${hueFamily}" IS the hue family above -- commit fully to whichever family you were given.
- Seed parity sets the mood: ${seed % 2 === 0 ? 'this is an EVEN seed -- lighter, more refined background' : 'this is an ODD seed -- darker, bolder background'}.
- The BACKGROUND itself, not just the accent, must carry a genuine tint from "${hueFamily}" -- a lighter background should be a pale, desaturated version of that hue family's tone (not a generic neutral cream/off-white regardless of family), and a darker background should be a deep, slightly tinted version of that hue family (not flat neutral near-black regardless of family).
- Maintain at least 4.5:1 contrast between body text and background (WCAG AA).
- The palette should read like a senior brand designer chose it specifically for this person and field, never like it was picked from a swatch list.

MANDATORY REQUIREMENTS:
- Complete single HTML file from <!DOCTYPE html> to </html>
- All fonts from Google Fonts imported in head
- All CSS in one style tag, all JS in one script tag before /body
- Fully responsive, mobile first
- IntersectionObserver scroll reveal animations
- Fixed nav with backdrop blur appearing on scroll
- Hover effects on all interactive elements
- Meta tags for title, description, og:title, og:description
- No emoji used as icons anywhere -- use SVG or CSS-drawn icons/shapes only
- Every clickable element must show cursor: pointer, and any translucent/glass card must keep enough background opacity to stay clearly legible against whatever is behind it, in both light and dark treatments

CONTENT REQUIREMENTS:
- Rewrite EVERY achievement as a powerful impact statement with action verbs and quantified results
- Rewrite bio to be compelling first-person
- Skills shown visually, NOT a plain list
- Contact section with email CTA
- Footer: "Built with PortfolioAI"
- Never include a rectangular image-shaped placeholder block standing in for a missing photo (a large box sized like an avatar/headshot with initials inside) -- this reads as an unfinished widget, not a design choice. If a monogram or initials mark genuinely fits the composition, integrate it as a small typographic detail consistent with the rest of the page (e.g. a wordmark, a small badge) -- never as a standalone rectangle mimicking a photo slot.

CREATIVE REQUIREMENTS:
- Each section must have a different visual treatment
- Signature creative device for this generation -- implement this specific device, or invent an equally distinctive one genuinely grounded in this person's field if you have a stronger idea: ${creativeDevice}
- Color palette must feel intentional and premium
- Luxurious spacing, generous padding, thoughtful rhythm
- Typography hierarchy, at least 3 distinct sizes
- LEGIBILITY OVER DECORATION, always: any oversized background text, large numerals, decorative shapes, or ornamental elements must never visually overlap, cross through, or reduce the readability of real paragraph text, bullet points, or body copy anywhere on the page. Decoration lives in the negative space around content -- behind it at low opacity, beside it, or bounded to areas with no competing text -- never layered directly across words someone needs to read.
${TIER_B_ENABLED ? TIER_B_SECTION : ''}
OUTPUT: Return ONLY the complete HTML. No explanation. No markdown fences. Start with <!DOCTYPE html> end with </html>.`

  const stream = client.messages.stream({
    model: 'claude-opus-4-7',
    max_tokens: TIER_B_ENABLED ? 26000 : 20000,
    messages: [{ role: 'user', content: prompt }],
  })

  const message = await stream.finalMessage()

  const result = message.content[0]
  if (result.type !== 'text') throw new Error('Unexpected response')

  return result.text
    .replace(/^```html\n?/, '')
    .replace(/^```\n?/, '')
    .replace(/\n?```$/, '')
    .trim()
}
