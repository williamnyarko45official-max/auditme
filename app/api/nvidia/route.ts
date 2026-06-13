import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW = 60 * 60 * 1000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Max 10 audits per hour.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { userMsg, systemMsg } = body
    if (!userMsg || !systemMsg) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    if (typeof userMsg !== 'string' || typeof systemMsg !== 'string') {
      return NextResponse.json({ error: 'Invalid input types' }, { status: 400 })
    }
    if (userMsg.length > 100000) {
      return NextResponse.json({ error: 'Input too large' }, { status: 400 })
    }

    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-ultra',
        messages: [
          { role: 'system', content: systemMsg },
          { role: 'user', content: userMsg },
        ],
        temperature: 0.2,
        max_tokens: 3000,
      }),
    })

    if (!res.ok) {
      const e = await res.json()
      throw new Error(e.error?.message || 'NVIDIA API error')
    }

    const data = await res.json()
    return NextResponse.json({ result: data.choices[0].message.content })

  } catch (e: any) {
    console.error('NVIDIA error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}