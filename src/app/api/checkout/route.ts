import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, portfolio_id } = await request.json()

  // Single paid tier now -- 'bundle' is the internal type key kept
  // as-is since its Stripe Price ID is already correctly configured
  // for $9.99. Renaming it would mean touching Stripe config too;
  // reusing it keeps this a display-copy change, not a payments change.
  const priceMap: Record<string, string> = {
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