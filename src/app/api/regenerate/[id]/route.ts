export const runtime = 'nodejs'
import { createClient } from '@/lib/supabase/server'
import { generatePortfolioHTML } from '@/lib/ai/generatePortfolio'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: portfolio } = await supabase
    .from('portfolios').select('*')
    .eq('id', id).eq('user_id', user.id).single()

  if (!portfolio) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const parsed = portfolio.portfolio_data
    const htmlContent = await generatePortfolioHTML(parsed)
    await supabase.from('portfolios')
      .update({ html_content: htmlContent, is_published: false })
      .eq('id', id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Regen error:', err)
    return NextResponse.json({ error: 'Failed to regenerate' }, { status: 500 })
  }
}