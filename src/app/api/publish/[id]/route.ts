import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return publish(request, params)
}
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return publish(request, params)
}

async function publish(request: Request, params: Promise<{ id: string }>) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await supabase.from('portfolios')
    .update({ is_published: true })
    .eq('id', id)
    .eq('user_id', user.id)

  return NextResponse.redirect(new URL('/dashboard/portfolio/' + id, request.url))
}