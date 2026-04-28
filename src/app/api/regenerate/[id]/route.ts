export const runtime = 'nodejs'
import { createClient } from '@/lib/supabase/server'
import { generatePortfolioHTML } from '@/lib/ai/generatePortfolio'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check ownership
  const { data: portfolio } = await supabase
    .from('portfolios').select('*')
    .eq('id', id).eq('user_id', user.id).single()

  if (!portfolio) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Rate limit: check regenerations in last 24 hours using updated_at
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('portfolios')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('updated_at', oneDayAgo)

  // Get plan limit
  const { data: profile } = await supabase
    .from('profiles').select('plan').eq('id', user.id).single()
  
  const regenLimits: Record<string, number> = { free: 3, pro: 10, team: 50 }
  const limit = regenLimits[profile?.plan || 'free']
  
  if ((count || 0) >= limit) {
    return NextResponse.json({ 
      error: 'Daily regeneration limit reached. Upgrade for more regenerations.',
      limit 
    }, { status: 429 })
  }

  try {
    const parsed = portfolio.portfolio_data
    const htmlContent = await generatePortfolioHTML(parsed)
    await supabase.from('portfolios')
      .update({ html_content: htmlContent, is_published: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Regen error:', err)
    return NextResponse.json({ error: 'Failed to regenerate' }, { status: 500 })
  }
}