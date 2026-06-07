import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get('reference')
    if (!reference) return NextResponse.redirect(new URL('/audit?error=no_reference', req.url))

    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    })

    const data = await res.json()
    if (!data.status || data.data.status !== 'success') {
      return NextResponse.redirect(new URL('/audit?error=payment_failed', req.url))
    }

    const { user_id, plan } = data.data.metadata
    const customerCode = data.data.customer.customer_code

    const supabase = await createClient()
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    await supabase.from('subscriptions').upsert({
      user_id,
      plan,
      paystack_customer_code: customerCode,
      status: 'active',
      current_period_end: periodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    return NextResponse.redirect(new URL('/audit?success=true', req.url))
  } catch (e: any) {
    return NextResponse.redirect(new URL('/audit?error=verify_failed', req.url))
  }
}