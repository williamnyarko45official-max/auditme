'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import AuditApp from '@/components/AuditApp'

function AuditPageInner() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        setLoading(false)
      }
    })

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) router.push('/login')
      else {
        setUser(session.user)
      }
    })

    return () => authSub.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#060608', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', color: '#555570' }}>
      ▋ loading...
    </div>
  )

  return <AuditApp user={user} />
}

export default function AuditPage() {
  return (
    <Suspense>
      <AuditPageInner />
    </Suspense>
  )
}
