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
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify portfolio belongs to user
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('id, is_published')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!portfolio) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
  }

  // Whitelisted emails bypass payment check
  const allowedEmails = (process.env.ALLOWED_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  const isWhitelisted = allowedEmails.includes((user.email || '').toLowerCase())

  if (!isWhitelisted) {
    // CHECK PAYMENT - user must have a launch or bundle payment for this portfolio
    const { data: payments } = await supabase
      .from('payments')
      .select('id, type, portfolio_id')
      .eq('user_id', user.id)
      .in('type', ['launch', 'bundle'])

    if (!payments || payments.length === 0) {
      console.log('Publish blocked - no payments for user:', user.email)
      return NextResponse.redirect(
        new URL('/pricing?portfolio_id=' + id + '&reason=publish', request.url)
      )
    }

    // Count how many portfolios this user has already published
    const { count: publishedCount } = await supabase
      .from('portfolios')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_published', true)

    const launchPayments = payments.filter(p => p.type === 'launch').length
    const bundlePayments = payments.filter(p => p.type === 'bundle').length
    const maxPublishable = launchPayments + bundlePayments

    // If already published this portfolio, allow re-publish (idempotent)
    if (portfolio.is_published) {
      return NextResponse.redirect(new URL('/dashboard/portfolio/' + id, request.url))
    }

    // Block if user has reached their publish limit
    if ((publishedCount || 0) >= maxPublishable) {
      console.log('Publish blocked - limit reached. Published:', publishedCount, 'Max:', maxPublishable)
      return NextResponse.redirect(
        new URL('/pricing?portfolio_id=' + id + '&reason=publish_limit', request.url)
      )
    }
  }

  // PAYMENT VERIFIED - allow publish
  await supabase
    .from('portfolios')
    .update({ is_published: true })
    .eq('id', id)
    .eq('user_id', user.id)

  console.log('Portfolio published:', id, 'by:', user.email)
  return NextResponse.redirect(new URL('/dashboard/portfolio/' + id, request.url))
}
