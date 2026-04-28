export const runtime = 'nodejs'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!
  
  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return new NextResponse('Webhook error', { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const userId = session.metadata?.user_id
    const plan = session.metadata?.plan || 'pro'
    
    if (userId) {
      await supabase.from('profiles').update({
        plan,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
      }).eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as any
    await supabase.from('profiles')
      .update({ plan: 'free', stripe_subscription_id: null })
      .eq('stripe_subscription_id', sub.id)
  }

  return NextResponse.json({ received: true })
}