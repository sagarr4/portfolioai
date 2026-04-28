import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export interface ParsedResume {
  name: string
  email: string
  phone?: string
  location?: string
  title: string
  summary: string
  field: 'engineering' | 'design' | 'finance' | 'legal' | 'marketing' | 'healthcare' | 'education' | 'creative' | 'other'
  field_confidence: number
  theme: 'dark-code' | 'visual-bold' | 'clean-serif' | 'editorial' | 'minimal'
  skills: string[]
  experience: {
    company: string
    role: string
    duration: string
    highlights: string[]
  }[]
  education: {
    institution: string
    degree: string
    year: string
  }[]
  projects?: {
    name: string
    description: string
    tech?: string[]
  }[]
  languages?: string[]
  certifications?: string[]
}

export async function parseResume(resumeText: string): Promise<ParsedResume> {
  const prompt = [
    'You are an expert resume parser. Analyze this resume and return a JSON object only.',
    'No explanation, no markdown, just raw JSON.',
    '',
    'Detect the professional field and assign one of:',
    'engineering, design, finance, legal, marketing, healthcare, education, creative, other',
    '',
    'Assign theme based on field:',
    'engineering -> dark-code, design -> visual-bold, finance/legal -> clean-serif, creative -> editorial, other -> minimal',
    '',
    'Return this exact JSON structure:',
    '{',
    '  "name": "full name",',
    '  "email": "email",',
    '  "phone": "phone or null",',
    '  "location": "city, country or null",',
    '  "title": "professional title",',
    '  "summary": "2-3 sentence professional summary in first person",',
    '  "field": "field value",',
    '  "field_confidence": 0.95,',
    '  "theme": "theme value",',
    '  "skills": ["skill1", "skill2"],',
    '  "experience": [{"company": "Name", "role": "Title", "duration": "Jan 2020 - Present", "highlights": ["achievement"]}],',
    '  "education": [{"institution": "University", "degree": "BSc CS", "year": "2019"}],',
    '  "projects": [{"name": "Project", "description": "what it does", "tech": ["React"]}],',
    '  "languages": ["English"],',
    '  "certifications": ["AWS Certified"]',
    '}',
    '',
    'Resume text:',
    resumeText
  ].join('\n')

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  const clean = content.text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as ParsedResume
}