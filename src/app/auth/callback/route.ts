import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // same-site paths only (blocks open redirects like //evil.com)
  const wanted = searchParams.get('next') || ''
  const next = wanted.startsWith('/') && !wanted.startsWith('//') ? wanted : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return NextResponse.redirect(`${origin}/auth/login`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
