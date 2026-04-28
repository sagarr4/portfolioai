import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await request.json()
  const priceId = plan === 'team' 
    ? process.env.STRIPE_TEAM_PRICE_ID 
    : process.env.STRIPE_PRO_PRICE_ID

  const { data: profile } = await supabase
    .from('profiles').select('stripe_customer_id').eq('id', user.id).single()

  const session = await stripe.checkout.sessions.create({
    customer: profile?.stripe_customer_id || undefined,
    customer_email: !profile?.stripe_customer_id ? user.email : undefined,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: process.env.NEXT_PUBLIC_APP_URL + '/dashboard?upgraded=true',
    cancel_url: process.env.NEXT_PUBLIC_APP_URL + '/dashboard?cancelled=true',
    metadata: { user_id: user.id, plan },
  })

  return NextResponse.json({ url: session.url })
}