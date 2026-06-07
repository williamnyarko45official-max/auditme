import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10 // requests
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour

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
    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit check
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Max 10 audits per hour.' },
        { status: 429 }
      )
    }

    // Input validation
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

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: systemMsg,
      messages: [{ role: 'user', content: userMsg }],
    })

    const result = (message.content[0] as any).text
    return NextResponse.json({ result })

  } catch (e: any) {
    console.error('Analyze error:', e.message)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}