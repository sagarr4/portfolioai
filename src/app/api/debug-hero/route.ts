export const runtime = 'nodejs'
export const maxDuration = 60

import { createClient } from '@/lib/supabase/server'
import { generatePortfolioHTML } from '@/lib/ai/generatePortfolio'
import { ParsedResume } from '@/lib/ai/parseResume'
import { NextResponse } from 'next/server'

// Fixed fixture so every test run is comparable. If TS complains about
// missing fields on ParsedResume (e.g. field_confidence, theme), add
// whatever your real type requires -- check parseResume.ts.
const FIXTURE = {
  name: 'Sagar Prajapati',
  title: 'Software Developer',
  field: 'engineering',
  email: 'sagarbmw1@gmail.com',
  phone: '',
  location: 'Kamloops, BC',
  summary: 'I build production ML systems and end-to-end SaaS, from LLM integration and data pipelines to analytics and deployment.',
  skills: ['Python', 'PyTorch', 'Power BI', 'Docker', 'Next.js', 'Supabase'],
  experience: [
    {
      role: 'Jr. Application Developer',
      company: 'Scoopsense',
      duration: 'Oct 2022 - Aug 2023',
      highlights: [
        'Built and shipped internal tooling used across the engineering team',
        'Worked across the stack on production features end to end',
      ],
    },
  ],
  education: [
    { degree: 'Post-Baccalaureate Diploma, Applied Data Science', institution: 'Thompson Rivers University', year: '2025' },
  ],
  projects: [
    { name: 'PortfolioAI', description: 'AI-powered SaaS that converts PDF resumes into portfolio websites', tech: ['Next.js', 'Supabase', 'Stripe', 'Claude API'] },
  ],
  certifications: ['Oracle Cloud Infrastructure Data Science', 'NVIDIA Deep Learning'],
} as unknown as ParsedResume

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowedEmails = (process.env.ALLOWED_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  const userEmail = (user.email || '').toLowerCase()
  if (!allowedEmails.includes(userEmail)) {
    return NextResponse.json({ error: 'Not whitelisted for debug route' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const seedParam = searchParams.get('seed')
  const seed = seedParam ? parseInt(seedParam, 10) : Date.now() % 10000
  const photoUrl = searchParams.get('photoUrl') || undefined

  try {
    const html = await generatePortfolioHTML(FIXTURE, { seed, photoUrl })
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
  } catch (err) {
    console.error('debug-hero error:', err)
    return NextResponse.json({ error: 'Generation failed', detail: String(err) }, { status: 500 })
  }
}
