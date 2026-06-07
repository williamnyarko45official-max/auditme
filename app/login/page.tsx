'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  const handleEmailAuth = async () => {
    setLoading(true); setMsg(''); setIsError(false)
    try {
      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/audit')
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMsg('Check your email to confirm your account!')
      }
    } catch (e: any) {
      setIsError(true); setMsg(e.message)
    }
    setLoading(false)
  }

  const handleGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'read:user repo',
        redirectTo: 'https://auditme.will-tech.site/audit',
      },
    })
  }

  const s = {
    page: { minHeight: '100vh', background: '#060608', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'monospace' } as React.CSSProperties,
    card: { width: '100%', maxWidth: '420px', background: '#0d0d12', border: '1px solid #1a1a28', borderRadius: '14px', padding: '32px' } as React.CSSProperties,
    input: { width: '100%', background: '#060608', border: '1px solid #1a1a28', borderRadius: '6px', padding: '11px 14px', color: '#dde1f0', fontFamily: 'monospace', fontSize: '13px', outline: 'none', marginBottom: '12px' } as React.CSSProperties,
    label: { fontSize: '11px', color: '#555570', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' } as React.CSSProperties,
  }

  return (
    <div style={s.page}>
      <div>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
          <div style={{ color: '#00ff88', fontSize: '22px', letterSpacing: '0.05em', fontWeight: 700 }}>AuditMe</div>
          <div style={{ color: '#555570', fontSize: '12px', marginTop: '4px' }}>Production readiness for vibe coders</div>
        </div>

        <div style={s.card}>
          {/* GitHub */}
          <button onClick={handleGithub} style={{ width: '100%', padding: '12px', background: '#24292e', color: '#fff', border: 'none', borderRadius: '6px', fontFamily: 'monospace', fontSize: '13px', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: '#1a1a28' }} />
            <span style={{ fontSize: '11px', color: '#555570' }}>or email</span>
            <div style={{ flex: 1, height: '1px', background: '#1a1a28' }} />
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', background: '#060608', borderRadius: '6px', padding: '3px', marginBottom: '20px' }}>
            {(['login', 'signup'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px', background: tab === t ? '#0d0d12' : 'transparent', color: tab === t ? '#dde1f0' : '#555570' }}>
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <label style={s.label}>EMAIL</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={s.input} onKeyDown={e => e.key === 'Enter' && handleEmailAuth()} />

          <label style={s.label}>PASSWORD</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={s.input} onKeyDown={e => e.key === 'Enter' && handleEmailAuth()} />

          {msg && (
            <div style={{ padding: '10px 14px', borderRadius: '6px', fontSize: '12px', marginBottom: '12px', background: isError ? 'rgba(255,61,61,0.08)' : 'rgba(0,255,136,0.08)', color: isError ? '#ff3d3d' : '#00ff88' }}>
              {msg}
            </div>
          )}

          <button onClick={handleEmailAuth} disabled={loading || !email || !password}
            style={{ width: '100%', padding: '12px', background: '#00ff88', color: '#060608', border: 'none', borderRadius: '6px', fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, cursor: 'pointer', opacity: loading || !email || !password ? 0.5 : 1 }}>
            {loading ? 'Please wait...' : tab === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </div>
      </div>
    </div>
  )
}