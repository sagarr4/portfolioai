import Anthropic from '@anthropic-ai/sdk'
import { ParsedResume } from './parseResume'
import { pickHueFamily } from '@/lib/portfolio/theme'

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
  'A subtle dot-grid TEXTURE rendered as a single CSS background-image (a repeating radial-gradient or small inline SVG pattern set via background-image/background-size) applied to the hero section itself -- NEVER as many separate individually-positioned DOM elements (absolutely-positioned spans/divs); a background-image sits in the container\'s own paint layer so an opaque photo in normal DOM flow reliably covers it with zero per-element math. Do NOT draw connecting lines between points -- a network/constellation-graph look is banned. Give the element carrying this pattern the exact id \'pai-hero-decorative\'.',
  'A bespoke abstract mark built from CSS shapes, reflecting the person\'s field'
]

const CREATIVE_DEVICES = [
  "An oversized typographic moment elsewhere on the page (not the hero) -- a single word or short phrase blown up dramatically as a section divider. This large decorative text must sit clearly BEHIND or AROUND actual readable content, never directly through or across a block of body text, a card, an image, or any interactive element -- position it in the section's negative space so no word of real content is ever visually cut or crossed. HARD CONTAINMENT (same rule as the section numerals below): size this text in em, rem, or a percentage of its own section, never raw viewport units, and give the section overflow: hidden. It must never bleed past the left, right, top, or bottom edge of the viewport or its own section -- this has repeatedly rendered as giant text cut off at the screen edge, overlapping real cards and buttons.",
  "A genuinely asymmetric, broken-grid layout in the projects or experience section -- cards of deliberately different sizes, not a uniform grid.",
  "One truly interactive element: a hover-reactive skill cloud, a draggable element, or a custom cursor state -- something that responds, not just animates on scroll.",
  "A non-list skill visualization: skills as an orbit, a radial cluster, a bar chart built from CSS, or a constellation -- never a plain tag row. If you choose an orbital/radial layout specifically, compute exact positions -- angle = (360 / skillCount) * index in degrees, x = centerX + radius * cos(angle), y = centerY + radius * sin(angle) -- so every label sits precisely on ONE consistent radius, evenly spaced, with zero overlap. Use a second larger ring only if there are more than ~8 skills, splitting the list rather than crowding one ring. Every label must contain real skill text -- never render an empty or placeholder box. Shrink font-size or abbreviate rather than letting text overflow. If you are not fully confident you can compute clean, non-overlapping positions for this exact skill count, fall back to a bar chart or simple radial cluster instead -- a working simpler layout beats a broken ambitious one.",
  "Large decorative numerals used as SECTION dividers only (never in the hero) -- one per section, positioned as background art. HARD CONTAINMENT: the numeral must never exceed the width or height of its own section (size it in em, rem, or as a percentage of the section, never raw viewport units) and must never bleed past the viewport edge or overlap real body text.",
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
- CALL YOUR RESIZE HANDLER ONCE, IMMEDIATELY AFTER SETUP -- not only on the window resize event: define your resize/recalculate function, wire it to the resize listener as usual, AND ALSO invoke it directly once right after the renderer and camera are created, before starting the render loop. Reading canvas.clientWidth/clientHeight for the very first frame must happen after layout has settled, not at the exact synchronous moment the script executes (fonts and hydration may still be resolving mid-parse). Skipping this initial call is a common, confirmed cause of the particle field rendering confined to a small corner of the viewport instead of filling the hero -- the first frame locks in whatever stale or default canvas dimensions happened to be read before layout stabilized, and it only self-corrects if the visitor manually resizes their browser window.

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

The photo is COMPULSORY in this hero. Its placement, sizing, and layering are HARD CSS rules, not suggestions. Be literal and exact:

- Layout: a right-anchored two-column split for the hero specifically. Text/name/headline content occupies the LEFT column. The photo occupies the RIGHT column. This overrides whatever the compositional geometry axis says for the hero's column arrangement.
- The photo's container must be exactly 100% of the hero's height and exactly 38% of the hero's width -- an exact value, not a range, so crop framing stays consistent across generations. Position it flush against the TOP, RIGHT, and BOTTOM edges of the hero/viewport -- zero margin, zero padding on those three sides. Use object-fit: cover on the <img>, with object-position: 50% 20% so the face stays well-framed rather than cropping in tight on the chest/shoulders.
- HERO HEIGHT CAP: the hero SECTION itself must be capped to exactly 100vh (or 100svh) -- never taller, regardless of how much text content the left column holds, since the photo is height:100% of this same hero. As a hard ceiling, keep the tagline plus bio combined under roughly 220 characters of visible text -- if your draft copy is longer, cut it, don't rely on it visually fitting. A properly-framed, single-crop portrait matters more than fitting every line of bio copy inside the hero.
- MOBILE EXCEPTION TO THIS CAP: the rigid 100vh rule above exists specifically to stop the two-column desktop photo from stretching. Once your own mobile breakpoint collapses the layout to a single stacked column (photo becomes a background wash or fades out), that reason no longer applies. At and below your mobile breakpoint, override the hero to height: auto; min-height: 100vh (or 100svh) instead of the rigid height, so the section grows or shrinks to fit whatever the actual stacked content needs. Applying the rigid desktop height on mobile has produced a hero where real content ends partway down the screen followed by a stretch of dead empty space before the next section begins -- mobile height should follow content, not blindly inherit a constraint that only made sense for the two-column desktop case.
- NO GAP AT THE TOP: the photo must reach the absolute top of the page (y:0) with zero gap -- it renders BEHIND the nav bar, not below it. Make the nav bar position:fixed (or sticky) with a transparent or semi-transparent/blurred background, spanning full width, at a higher z-index than the hero. The photo column itself must have zero top offset/padding. The TEXT column (name, tagline, body copy) is the exception -- it must keep its own top padding/spacing roughly equal to the nav's height, and the first visible text element (eyebrow or name) must begin within roughly 90-110px of the top of the hero, never lower. Only the photo bleeds all the way to the top; the readable text never does.
- FORBIDDEN on the photo: border-radius (other than 0), box-shadow, border, margin, or any treatment that makes it read as a floating card or panel.
- LAYERING (numeric, non-negotiable): the decorative background layer gets z-index: 0, the photo gets z-index: 1, the text column gets z-index: 2. The only thing that reveals the decorative layer near the photo is the mask-image fade on the photo's own inner edge (below) -- never place a dot, particle, or shape element positioned on top of the photo's bounding box. If a decorative element's coordinates would fall within the photo area, it must not render there.
- REQUIRED ID (safety net, does not change your design): give the photo's <img> tag itself the exact id 'pai-hero-photo'. This lets a small enforcement stylesheet guarantee correct stacking/sizing even if something else in your generated CSS conflicts with the rules above.
- REQUIRED ID ON THE WRAPPER too: give the element that directly wraps that <img> (whatever div/container holds it) the exact id 'pai-hero-photo-wrap'. This is what lets the enforcement stylesheet guarantee the photo's column width specifically, closing a real gap where width alone has been drifting between generations.
- REQUIRED ID ON THE TEXT COLUMN: give the element that wraps the hero's entire text side (eyebrow, name, meta, everything in that column) the exact id 'pai-hero-column'. This lets the enforcement stylesheet guarantee it stays pinned to the top of the hero even if a vertical-centering layout choice elsewhere would otherwise push it down.
- Any decorative touch placed near the photo (a glow, a line) must be a real filled or stroked visual element with actual color/opacity -- never an empty <div> with only a border and no background or content. No empty bordered box may appear anywhere in the hero.
${formatInstructions}
- The ONLY edge that gets any softening is the inner edge facing the text column (typically the left edge of the photo) -- apply a linear-gradient mask-image (e.g. linear-gradient(to right, transparent 0%, black 15-20%)) so that edge fades toward the page background/decorative layer (decorative language: "${decorative}"), rather than cutting hard against the text column. Top, right, and bottom edges stay flush to the viewport with no fade, no gap, and no frame.
- Give it the same entrance timing/easing as the rest of the hero (use the established design tokens if Tier B motion is active below). If Tier B is active, give the photo its own subtle parallax at a different rate than the background layer so the two read as one cohesive sense of depth.
`
}

function buildNoPhotoMotionFloor(decorative: string): string {
  return `
NO-PHOTO HERO -- MOTION FLOOR (mandatory when no photo is provided):
Heroes without a photo have been coming out noticeably flatter and more static than photo heroes, because the PHOTO INTEGRATION instructions elsewhere in this prompt only apply when a photo exists. This section closes that gap and is equally mandatory.

- The hero must include at least ONE continuously-looping or scroll/load-triggered animated CSS element. A hero that is purely static typography with zero motion is not acceptable, regardless of which decorative-language axis below was assigned.
- If the decorative language is "None -- pure typography and whitespace carry the hero," compensate with typographic motion instead of a decorative shape: an animated gradient text-fill, a subtle word-by-word or letter-by-letter reveal on load, a soft breathing/pulse on one accent element, or an animated underline/highlight sweep -- something must visibly move.
- If the decorative language ("${decorative}") involves shapes, dots, lines, or a bespoke mark, that element must be genuinely animated (drift, rotate, pulse, or respond to scroll/mousemove) -- never rendered once and left completely static.
- This is a lightweight CSS-only requirement, independent of whether the Three.js Tier B system below is enabled -- it is the minimum motion bar for every hero, photo or not, and should never meaningfully add to generation time or token cost.
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
  // Detect .jpg/.jpeg even with a cache-busting query string appended
  // (e.g. '...enhanced.jpg?v=123') -- a plain endsWith check breaks the
  // moment any query string is present, silently misclassifying real
  // studio-retouched JPEGs as background-removed PNG cutouts.
  const photoIsJpg = !!photoUrl && /\.jpe?g(\?|$)/i.test(photoUrl)

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
Avoid defaulting to these overused patterns unless you have a specific reason grounded in this person's story: a const/code-declaration block as the entire hero device, a single large background numeral as the primary decorative element, a perfectly centered stack of name+title+bio with no other structural idea, or a particle-and-connecting-line network/constellation graph (scattered dots joined by faint lines, animated or static) used as the hero's background -- this specific pattern has repeatedly rendered as visual clutter overlapping the name and headline text and reads as a generic "AI/tech portfolio" template rather than something designed for this person. Any of these may appear as ONE small supporting detail if it genuinely fits, but never as the whole hero concept.

ONE DECORATIVE SYSTEM ONLY: the hero must use exactly one decorative system at a time, never two stacked simultaneously. If Tier B's Three.js particle layer is active (see MOTION & 3D REQUIREMENTS below, when present), it IS the hero's decorative system -- do not also render a separate CSS decorative-axis element (a dot grid, radar/orbit circles, fine line-work, or a bespoke shape) behind it at the same time. Choose one, not both.

NAME LEGIBILITY -- non-negotiable regardless of which content-lead you were assigned above, and stricter than a soft guideline: a recruiter must identify whose portfolio this is within one second of the hero loading, without scrolling or hunting.
- The name must appear within the FIRST HALF of the hero's vertical space, or be the first text block in reading order -- never positioned as the last element after multiple lines of headline copy, and never styled like a footer or signature line.
- HARD RULE, NO EXCEPTIONS: the name's font-size must be the single LARGEST text element anywhere in the hero -- not comparably large, not "at least 60%," the actual biggest text on the page. If the content-lead axis or a headline/lead line would otherwise render larger than the name, shrink that headline text (or increase the name's size) so the name always wins. This has been observed failing in real generations where a bold headline visually dominated over a much smaller name below it -- that specific failure is exactly what this rule exists to prevent.
- Use full-opacity, high-contrast color for the name -- never a muted, translucent, or secondary-toned treatment.
- REQUIRED ID (safety net): give the element containing the person's name itself the exact id 'pai-hero-name'. This lets a small enforcement stylesheet guarantee a minimum size even if something else in your generated CSS shrinks it relative to a headline.
- The content-lead axis governs READING ORDER only (what the eye processes first as the hook) -- it is never license to bury or shrink the name itself.
${photoUrl ? buildPhotoSection(photoUrl, decorative, photoIsJpg) : buildNoPhotoMotionFloor(decorative)}
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
- REQUIRED ID: give the nav's link list/container (whatever wraps About/Work/Stack/Projects/Contact) the exact id 'pai-nav-links'. A small enforcement stylesheet uses this to guarantee it's hidden on narrow viewports even if your own mobile media query doesn't fully suppress it.

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
- Generous, considered spacing and padding within a section's own content (between a heading and body, between cards, around text) -- but cap top/bottom SECTION padding itself at roughly 80-100px, never 120px or more. Two adjacent sections each using large section-level padding compounds directly (e.g. 140px + 140px = 280px of empty space before any header or margin is even added), and has repeatedly produced a visibly dead, contentless gap of 400px or more at real screen scale when scrolled to a section boundary -- generous should describe the rhythm and breathing room around content, not an ever-larger empty buffer between sections.
- Typography hierarchy, at least 3 distinct sizes
- LEGIBILITY OVER DECORATION, always: any oversized background text, large numerals, decorative shapes, or ornamental elements must never visually overlap, cross through, or reduce the readability of real paragraph text, bullet points, or body copy anywhere on the page. Decoration lives in the negative space around content -- behind it at low opacity, beside it, or bounded to areas with no competing text -- never layered directly across words someone needs to read.

MICRO-INTERACTIONS -- required throughout the page, not just on entrance:
- Nav links, buttons, and the primary CTA already need a hover transition -- extend that same care to elements that often get skipped: skill tags/pills, project tech-stack labels, footer links, and contact icons. Each needs SOME hover response (color shift, subtle background fill, underline draw, or a 1-2px lift) -- never a dead element with zero feedback under a cursor.
- At least ONE element on the page should have a more considered hover interaction beyond a plain color change -- a project card revealing a secondary detail on hover, a subtle image zoom, an icon that slides in. Keep it restrained and on-brand, not gimmicky.
- Gate all hover-only effects behind @media (hover: hover) and (pointer: fine), as already required elsewhere -- touch devices must never get a stuck hover state.

SCROLL-REVEAL VARIETY -- do not reuse one single reveal animation for every section:
- The existing translateY+rotateX card-lift pattern remains correct for project/experience/skill cards -- keep using it there.
- For at least two OTHER content types on the page, use a genuinely different reveal instead of that same lift -- e.g. a section headline with a clip-path wipe-in or per-word stagger, a hero stat counting up from 0, an image scaling in from 0.9 to 1 with a blur-to-sharp transition, or a divider line drawing itself left-to-right on scroll.
- Whichever styles you choose must still obey the existing motion rules already specified (opacity/transform only, ease-out timing, respects prefers-reduced-motion) -- this changes which patterns you use, not the constraints they operate within.

SCROLL-REVEAL TIMING -- content must never appear to sit in a blank gap while a visitor scrolls at normal or fast speed: your IntersectionObserver's rootMargin must trigger reveals BEFORE an element enters the visible viewport, not after. Use a positive bottom margin that extends the trigger zone downward past the viewport edge (e.g. rootMargin: '0px 0px 200px 0px'), never a threshold-only or negative-margin config that only fires once the element is already substantially visible. An element should be well into (or finished with) its reveal animation by the time a normally-scrolling visitor's eye actually reaches it -- never leave a large invisible (opacity:0) block sitting in its correct layout position for a stretch of scroll before it fades in, since that reads as a dead, empty section rather than content that hasn't arrived yet.
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

  let html = result.text
    .replace(/^```html\n?/, '')
    .replace(/^```\n?/, '')
    .replace(/\n?```$/, '')
    .trim()

  // CODE-LEVEL SAFETY NET -- this is not a prompt instruction, it is a
  // forced CSS override applied after generation. Prompt-only attempts
  // at guaranteeing photo/decorative-layer behavior failed repeatedly
  // across real tests this session (dots on photo, dots on text,
  // photo stretching/scroll-revealing different crops) even with very
  // explicit, numeric instructions. This guarantees the two specific
  // failures we've actually observed cannot happen, by construction,
  // regardless of what the model's own CSS contains. Harmless no-op if
  // the model didn't attach the ids (older cached HTML, etc).
  if (photoUrl) {
    const overrideStyle = `
<style id="pai-forced-layout-guarantees">
#pai-hero-photo {
  position: sticky !important;
  top: 0 !important;
  right: auto !important;
  bottom: auto !important;
  left: auto !important;
  height: 100vh !important;
  max-height: 100vh !important;
  width: 100% !important;
  object-fit: cover !important;
  z-index: 5 !important;
  margin: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  mask-image: linear-gradient(to right, transparent 0%, black 32%) !important;
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 32%) !important;
}
#pai-hero-decorative {
  z-index: 0 !important;
}
/* Forces the photo COLUMN's width directly -- width alone has kept
   drifting (or, in one real test, taking over the full hero) despite
   repeated prose changes, because nothing previously forced the
   wrapper itself. Anchored via position:absolute to the hero's own
   edges so it holds regardless of whatever layout system (grid,
   flex, floats) the model used for the two-column split. */
#pai-hero-photo-wrap {
  position: absolute !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 38% !important;
  height: 100% !important;
  overflow: hidden !important;
}
/* Forces the text column to pin to the TOP of the hero, not center
   vertically -- a prose rule against vertical-centering has now
   failed a second time in real tests, producing a large empty gap
   above the name/eyebrow. Only touches alignment, not sizing or
   overflow, so this can't reproduce the earlier photo/scrollbar
   regression from a different forced id. */
#pai-hero-column {
  justify-content: flex-start !important;
  align-content: flex-start !important;
}
/* Forced minimum name size -- a plain prose "must be the largest
   text" rule has now failed twice in real tests even when stated as
   a hard, unambiguous rule. This forces a large, H1-scale minimum
   regardless of what any other headline element renders at. */
#pai-hero-name {
  font-size: clamp(56px, 9vw, 140px) !important;
  font-weight: 800 !important;
  line-height: 1 !important;
  opacity: 1 !important;
  filter: none !important;
}
/* Force-hide any connecting-line/network-graph rendering, no matter
   what the model draws -- this specific pattern has repeatedly
   reappeared despite an explicit prompt-level ban. Covers the
   standard ways to draw a line between two points in SVG. */
#pai-hero-decorative line,
#pai-hero-decorative path[stroke],
#pai-hero-decorative polyline {
  display: none !important;
}
@media (max-width: 900px) {
  /* Mobile stacking: separates photo from text instead of layering
     the photo as an absolute full-bleed background (which has
     produced direct overlap). Pulls both into normal flow so they
     stack top-to-bottom in DOM order (photo first, text below) --
     no need to touch the hero section itself. The photo <img>'s
     desktop rule forces height:100vh, which would overflow this
     shorter mobile cell, so it's re-capped here too. */
  #pai-hero-photo-wrap {
    position: static !important;
    width: 100vw !important;
    margin-left: calc(50% - 50vw) !important;
    margin-right: calc(50% - 50vw) !important;
    padding: 0 !important;
    height: 50vh !important;
    max-height: 50vh !important;
    inset: auto !important;
  }
  #pai-hero-photo {
    position: static !important;
    top: auto !important;
    height: 100% !important;
    max-height: 100% !important;
    width: 100% !important;
  }
  #pai-hero-column {
    position: static !important;
    width: 100% !important;
    height: auto !important;
  }
}
</style>
`
    html = html.includes('</head>')
      ? html.replace('</head>', overrideStyle + '</head>')
      : html + overrideStyle
  }

  // ALWAYS-ON, not gated by photoUrl: (1) force-hides mobile nav
  // links if a generation's own media query fails to, (2) rescues
  // any scroll-reveal element still invisible 2s after load (e.g. a
  // short last section whose observer never fired), without killing
  // the normal animation for elements that work correctly.
  const alwaysOnSafety = `
<style id="pai-forced-global-safety">
@media (max-width: 900px) {
  #pai-nav-links { display: none !important; }
}
</style>
<script>
window.addEventListener('load', function() {
  if (window.innerWidth <= 900) {
    var pw = document.getElementById('pai-hero-photo-wrap');
    if (pw && pw.parentNode) { pw.parentNode.insertBefore(pw, pw.parentNode.firstChild); }
  }
  setTimeout(function() {
    document.querySelectorAll('.reveal:not(.in), .reveal-card:not(.in), .reveal-wipe:not(.in), .reveal-line:not(.in)').forEach(function(el) {
      el.classList.add('in');
    });
  }, 2000);
  // Position-based reveal (no IntersectionObserver). Chromium never fires
  // an observer for an element whose OWN clip-path fully clips it (the
  // common clip-path wipe-in headline), so those headings stayed invisible
  // forever and left big empty gaps between sections. Scroll position does
  // not care about clipping, so this reveals them as they near the viewport.
  var REVEAL_SEL = '[class*="reveal"],[class*="wipe"],[class*="word"],[class*="draw"],[class*="split"],[class*="stagger"]';
  var sweepQueued = false;
  function sweep() {
    sweepQueued = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll(REVEAL_SEL).forEach(function(el) {
      if (el.classList.contains('in')) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh + 200 && r.bottom > -200) el.classList.add('in');
    });
  }
  function queueSweep() {
    if (!sweepQueued) { sweepQueued = true; requestAnimationFrame(sweep); }
  }
  window.addEventListener('scroll', queueSweep, { passive: true });
  window.addEventListener('resize', queueSweep);
  setTimeout(sweep, 1200);
});
</script>
`
  html = html.includes('</head>')
    ? html.replace('</head>', alwaysOnSafety + '</head>')
    : html + alwaysOnSafety

  return html
}
