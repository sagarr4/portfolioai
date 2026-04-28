import Anthropic from '@anthropic-ai/sdk'
import { ParsedResume } from './parseResume'

const client = new Anthropic()

const FIELD_GUIDES: Record<string, string> = {
  "engineering": "Dark technical theme. JetBrains Mono + Inter fonts. Hero shows name with a code comment above it like \"// Senior Engineer\", title as a const declaration. Experience as timeline cards. Skills as terminal tags. Add animated grid background or blinking cursor. Color options by seed mod 4: 0=#050505+#3b82f6, 1=#0a0a0f+#6366f1, 2=#030712+#06b6d4, 3=#0c0a08+#f59e0b",
  "design": "Bold editorial theme. Syne or Clash Display font for headings, DM Sans body. Asymmetric layout, break the grid. Huge split typography hero. Large numbered experience items. Full-bleed project cards. CSS text outline effect on name. Color options by seed mod 4: 0=white+black+#ff3366, 1=#f5f0ff+#6d28d9, 2=#0f0f0f+white+#ff6b35, 3=#faf7f0+#1a1a1a+#e85d04",
  "finance": "Authoritative serif theme. Playfair Display + Source Sans Pro. Full-height left-aligned hero, gold horizontal rules, formal columns. Pull a strong quote as large italic blockquote. Three-column experience layout. Color options by seed mod 4: 0=#fafaf8+#1a1a1a+#b8960c, 1=#0f0f0f+#f5f0e8+#c9a96e, 2=#f8f6f0+#1e3a5f+#b8960c, 3=#1a1a1a+#f5f5f5+#d4af37",
  "legal": "Formal gravitas theme. EB Garamond + Lato. Centered formal hero, credentials prominently displayed, subtle watermark pattern. Color options by seed mod 4: 0=#f9f7f4+#1a1a2e+#8b7355, 1=#0e0e10+#f0ece4+#8b7355, 2=#f5f5f0+#2c3e50+#8b6914, 3=#1a1a1a+#f0ece4+#c9a96e",
  "marketing": "High energy results theme. Syne + Inter. Big career stats as hero numbers, gradient text on metrics. Bold colors. Color options by seed mod 4: 0=white+#ff4757+#2ed573, 1=#1a1a2e+#e94560, 2=#f8f9fa+#6c5ce7+#fd79a8, 3=#0d0d0d+#00d2ff+#ff6b6b",
  "healthcare": "Clean trustworthy theme. Nunito + Source Sans Pro. Credentials prominent, specialization badges, years of experience featured. Color options by seed mod 4: 0=#f0f8ff+#0077b6, 1=white+#2d6a4f+#74c69d, 2=#0a1628+#4cc9f0, 3=white+#7b2d8b+#e0aaff",
  "education": "Warm scholarly theme. Lora + Open Sans. Teaching philosophy quote in hero, subjects as visual grid. Color options by seed mod 4: 0=#fffdf7+#e76f51+#2a9d8f, 1=#1a1a2e+#e94560, 2=#f8f4e3+#3d405b+#e07a5f, 3=#1b4332+#74c69d+#f8f9fa",
  "creative": "Magazine editorial theme. Playfair Display italic or Bebas Neue + DM Sans. Full-bleed typographic hero, name at massive scale. Oversized section numbers. mix-blend-mode effects. Color options by seed mod 4: 0=#f5f0e8+#1a1a1a+#e85d04, 1=#0a0a0a+#f5f0e8+#ff6b6b, 2=#fff8f0+#2d00f7+#f20089, 3=#1a0a2e+#ff9f1c+#cbf3f0",
  "other": "Professional distinctive theme. Plus Jakarta Sans + Inter. Clean confident hero, gradient accent. Color options by seed mod 4: 0=white+#2563eb, 1=#0f0f0f+#3b82f6, 2=#fafaf9+#16a34a, 3=#1e1b4b+#818cf8"
}

export async function generatePortfolioHTML(data: ParsedResume): Promise<string> {
  const seed = Date.now() % 10000
  const guide = FIELD_GUIDES[data.field] || FIELD_GUIDES['other']
  
  const experienceText = data.experience.map((e, i) => 
    (i+1) + '. ' + e.role + ' at ' + e.company + ' (' + e.duration + ')\n' +
    e.highlights.map(h => '   - ' + h).join('\n')
  ).join('\n')

  const projectText = (data.projects || []).map(p =>
    '- ' + p.name + ': ' + p.description + ' [' + (p.tech||[]).join(', ') + ']'
  ).join('\n')

  const prompt = `You are the world's greatest portfolio website creator — a hybrid of Apple design team, Pentagram, and a senior full-stack engineer. You build portfolios so extraordinary that recruiters screenshot them.

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

DESIGN GUIDE FOR ${data.field.toUpperCase()} (seed ${seed}):
${guide}

Use seed ${seed} mod 4 to select the exact color palette from the options above.
Odd seeds = darker, bolder aesthetic. Even seeds = lighter, more refined.

MANDATORY REQUIREMENTS:
- Complete single HTML file from <!DOCTYPE html> to </html>
- All fonts from Google Fonts imported in head
- All CSS in one style tag, all JS in one script tag before /body
- Fully responsive, mobile first
- IntersectionObserver scroll reveal animations
- Fixed nav with backdrop blur appearing on scroll
- Hover effects on all interactive elements
- Meta tags for title, description, og:title, og:description

CONTENT REQUIREMENTS:
- Rewrite EVERY achievement as a powerful impact statement with action verbs and quantified results
- Rewrite bio to be compelling first-person
- Skills shown visually — NOT a plain list
- Contact section with email CTA
- Footer: "Built with PortfolioAI"
- No placeholder images — use CSS gradients, shapes, initials

CREATIVE REQUIREMENTS:
- Hero must be UNIQUE and memorable — not just name plus title plus bio
- Each section must have a different visual treatment
- Include at least one unexpected creative detail: oversized text, asymmetric layout, animated element, creative skill visualization, large background numbers
- Color palette must feel intentional and premium
- Luxurious spacing — generous padding, thoughtful rhythm
- Typography hierarchy — at least 3 distinct sizes

OUTPUT: Return ONLY the complete HTML. No explanation. No markdown fences. Start with <!DOCTYPE html> end with </html>.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    messages: [{ role: 'user', content: prompt }],
  })

  const result = message.content[0]
  if (result.type !== 'text') throw new Error('Unexpected response')
  
  return result.text
    .replace(/^```html\n?/, '')
    .replace(/^```\n?/, '')
    .replace(/\n?```$/, '')
    .trim()
}
