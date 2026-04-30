import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, portfolio_id } = await request.json()

  const priceMap: Record<string, string> = {
    launch: process.env.STRIPE_LAUNCH_PRICE_ID!,
    regen: process.env.STRIPE_REGEN_PRICE_ID!,
    bundle: process.env.STRIPE_BUNDLE_PRICE_ID!,
  }

  const priceId = priceMap[type]
  if (!priceId) return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email!,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'payment',
    success_url: process.env.NEXT_PUBLIC_APP_URL + '/api/payment-success?session_id={CHECKOUT_SESSION_ID}&portfolio_id=' + portfolio_id + '&type=' + type,
    cancel_url: process.env.NEXT_PUBLIC_APP_URL + '/dashboard/portfolio/' + portfolio_id + '?cancelled=true',
    metadata: { user_id: user.id, portfolio_id, type },
  })

  return NextResponse.json({ url: session.url })
}