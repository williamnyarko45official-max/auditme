'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const C = {
  bg: '#060608', surface: '#0d0d12', border: '#1a1a28',
  accent: '#00ff88', accentDim: 'rgba(0,255,136,0.08)',
  text: '#dde1f0', muted: '#555570',
}

const floatKeyframes = `
@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
@keyframes pulseGlow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
`

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

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <style>{floatKeyframes}</style>
      <div style={{ position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle at 50% 40%, rgba(0,255,136,0.06) 0%, rgba(0,150,255,0.02) 40%, transparent 70%)', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)', bottom: '10%', right: '15%', pointerEvents: 'none', animation: 'pulseGlow 4s ease-in-out infinite' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <a href="/" style={{ fontSize: 36, marginBottom: 8, display: 'inline-block', textDecoration: 'none', animation: 'float 5s ease-in-out infinite' }}>⚡</a>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: C.text, letterSpacing: '0.02em', marginTop: 4 }}>AUDITME</div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.muted, marginTop: 6, letterSpacing: '0.05em' }}>Production readiness for vibe coders</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #0d0d12 0%, #111118 100%)',
          border: '1px solid ' + C.border,
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,255,136,0.04)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <button onClick={handleGithub} style={{
            width: '100%', padding: '12px', background: '#24292e', color: '#fff',
            border: 'none', borderRadius: 8, fontFamily: "'Share Tech Mono', monospace",
            fontSize: 13, cursor: 'pointer', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            letterSpacing: '0.03em', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2f363d'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#24292e'; e.currentTarget.style.transform = 'translateY(0)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, ' + C.border + ', transparent)' }} />
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: C.muted, letterSpacing: '0.08em' }}>OR EMAIL</span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, ' + C.border + ', transparent)' }} />
          </div>

          <div style={{ display: 'flex', background: C.bg, borderRadius: 8, padding: 3, marginBottom: 20, border: '1px solid ' + C.border }}>
            {(['login', 'signup'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                  flex: 1, padding: '9px', borderRadius: 6, cursor: 'pointer',
                  fontFamily: "'Share Tech Mono', monospace", fontSize: 12, letterSpacing: '0.05em',
                  border: tab === t ? '1px solid rgba(0,255,136,0.2)' : '1px solid transparent',
                  background: tab === t ? 'linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,255,136,0.04))' : 'transparent',
                  color: tab === t ? C.accent : C.muted,
                  transition: 'all 0.2s',
              }}>
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <label style={{ fontSize: 10, color: C.muted, letterSpacing: '0.1em', display: 'block', marginBottom: 6, fontFamily: "'Share Tech Mono', monospace" }}>EMAIL</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
            style={{
              width: '100%', background: C.bg, border: '1px solid ' + C.border, borderRadius: 8,
              padding: '11px 14px', color: C.text, fontFamily: "'Share Tech Mono', monospace",
              fontSize: 13, outline: 'none', marginBottom: 16, transition: 'border-color 0.2s',
            }}
            onFocus={e => e.currentTarget.style.borderColor = C.accent}
            onBlur={e => e.currentTarget.style.borderColor = C.border} />

          <label style={{ fontSize: 10, color: C.muted, letterSpacing: '0.1em', display: 'block', marginBottom: 6, fontFamily: "'Share Tech Mono', monospace" }}>PASSWORD</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
            style={{
              width: '100%', background: C.bg, border: '1px solid ' + C.border, borderRadius: 8,
              padding: '11px 14px', color: C.text, fontFamily: "'Share Tech Mono', monospace",
              fontSize: 13, outline: 'none', marginBottom: 16, transition: 'border-color 0.2s',
            }}
            onFocus={e => e.currentTarget.style.borderColor = C.accent}
            onBlur={e => e.currentTarget.style.borderColor = C.border} />

          {msg && (
            <div style={{
              padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 16,
              fontFamily: "'Share Tech Mono', monospace",
              background: isError ? 'rgba(255,61,61,0.08)' : C.accentDim,
              color: isError ? '#ff3d3d' : C.accent,
              border: '1px solid ' + (isError ? 'rgba(255,61,61,0.2)' : 'rgba(0,255,136,0.2)'),
              lineHeight: 1.5,
            }}>
              {isError ? '⚠ ' : '✓ '}{msg}
            </div>
          )}

          <button onClick={handleEmailAuth} disabled={loading || !email || !password}
            style={{
              width: '100%', padding: 13, background: loading || !email || !password ? C.border : C.accent,
              color: loading || !email || !password ? C.muted : C.bg,
              border: 'none', borderRadius: 8,
              fontFamily: "'Share Tech Mono', monospace", fontSize: 13, fontWeight: 700,
              letterSpacing: '0.06em', cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: loading || !email || !password ? 'none' : '0 4px 16px rgba(0,255,136,0.25)',
            }}
            onMouseEnter={e => { if (!loading && email && password) { e.currentTarget.style.background = '#00cc6a'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
            onMouseLeave={e => { if (!loading && email && password) { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = 'translateY(0)' } }}>
            {loading ? '▋ Please wait...' : tab === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <a href="/" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.muted, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = C.accent}
            onMouseLeave={e => e.currentTarget.style.color = C.muted}>← Back to home</a>
        </div>
      </div>
    </div>
  )
}
