'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { getUserSubscription } from '@/lib/subscription'
import { useRouter, useSearchParams } from 'next/navigation'
import AuditApp from '@/components/AuditApp'

function AuditPageInner() {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        const sub = await getUserSubscription(session.user.id)
        setSubscription(sub)
        setLoading(false)
      }
    })

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) router.push('/login')
      else {
        setUser(session.user)
        const sub = await getUserSubscription(session.user.id)
        setSubscription(sub)
      }
    })

    return () => authSub.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#060608', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: '#555570' }}>
      ▋ loading...
    </div>
  )

  const success = searchParams.get('success')
  const error = searchParams.get('error')

  return (
    <>
      {success && (
        <div style={{ background: 'rgba(0,255,136,0.1)', borderBottom: '1px solid rgba(0,255,136,0.2)', padding: '12px 24px', fontFamily: 'monospace', fontSize: '13px', color: '#00ff88', textAlign: 'center' }}>
          ✓ Payment successful! You are now on Pro. Welcome to the club.
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(255,61,61,0.1)', borderBottom: '1px solid rgba(255,61,61,0.2)', padding: '12px 24px', fontFamily: 'monospace', fontSize: '13px', color: '#ff3d3d', textAlign: 'center' }}>
          ⚠ Payment issue: {error.replace(/_/g, ' ')}. Try again or contact support.
        </div>
      )}
      <AuditApp user={user} subscription={subscription} />
    </>
  )
}

export default function AuditPage() {
  return (
    <Suspense>
      <AuditPageInner />
    </Suspense>
  )
}