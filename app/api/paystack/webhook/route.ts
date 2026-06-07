import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-paystack-signature')
    const secret = process.env.PAYSTACK_SECRET_KEY!

    // Verify webhook signature
    const hash = crypto.createHmac('sha512', secret).update(body).digest('hex')
    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    const supabase = await createClient()

    if (event.event === 'subscription.create') {
      const { customer, plan, next_payment_date, subscription_code } = event.data
      await supabase.from('subscriptions').upsert({
        paystack_customer_code: customer.customer_code,
        paystack_subscription_code: subscription_code,
        plan: plan.name.toLowerCase().includes('team') ? 'team' : 'pro',
        status: 'active',
        current_period_end: next_payment_date,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'paystack_customer_code' })
    }

    if (event.event === 'subscription.disable' || event.event === 'subscription.expiry_card') {
      const { subscription_code } = event.data
      await supabase.from('subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('paystack_subscription_code', subscription_code)
    }

    if (event.event === 'invoice.payment_failed') {
      const { subscription } = event.data
      await supabase.from('subscriptions')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('paystack_subscription_code', subscription.subscription_code)
    }

    return NextResponse.json({ received: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}