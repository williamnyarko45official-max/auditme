import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { plan, email, userId } = await req.json()

    if (!plan || !email || !userId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    if (!['pro', 'team'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const planCode = plan === 'pro'
      ? process.env.PAYSTACK_PLAN_CODE_PRO
      : process.env.PAYSTACK_PLAN_CODE_TEAM

    const amount = plan === 'pro' ? 14184 : 35460

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount,
        plan: planCode,
        currency: 'GHS',
        metadata: { user_id: userId, plan },
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/paystack/verify`,
      }),
    })

    const data = await res.json()
    if (!data.status) throw new Error(data.message || 'Paystack error')
    return NextResponse.json({ url: data.data.authorization_url })

  } catch (e: any) {
    console.error('Checkout error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}