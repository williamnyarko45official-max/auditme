'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { use } from 'react'
import { isPro } from '@/lib/subscription'

const C = {
  bg: '#060608', surface: '#0d0d12', surface2: '#111118',
  border: '#1a1a28', accent: '#00ff88', accentDim: 'rgba(0,255,136,0.08)',
  warn: '#ffd166', warnDim: 'rgba(255,209,102,0.08)',
  danger: '#ff3d3d', dangerDim: 'rgba(255,61,61,0.08)',
  text: '#dde1f0', muted: '#555570',
}

const SEV: Record<string, { color: string; bg: string; icon: string }> = {
  critical: { color: C.danger, bg: C.dangerDim, icon: '🔴' },
  warning: { color: C.warn, bg: C.warnDim, icon: '🟡' },
  pass: { color: C.accent, bg: C.accentDim, icon: '🟢' },
}

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [state, setState] = useState<'loading' | 'gate' | 'report'>('loading')
  const [report, setReport] = useState<any>(null)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setState('gate'); return }

      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) { setState('gate'); return }

      const isOwner = data.user_id === user.id
      if (isOwner) { setReport(data); setState('report'); return }

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (sub && isPro(sub)) { setReport(data); setState('report'); return }

      setState('gate')
    })()
  }, [id])

  if (state === 'loading') return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontFamily: "'Share Tech Mono', monospace", fontSize: 13 }}>
      ▋ loading...
    </div>
  )

  if (state === 'gate') return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🔒</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: C.text, marginBottom: 12, letterSpacing: '0.02em' }}>RESTRICTED</h1>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
          This report requires a Pro subscription to view. Sign in or upgrade to access it.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <a href="/login" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, fontWeight: 600, background: C.accent, color: C.bg, border: 'none', borderRadius: 8, padding: '12px 28px', textDecoration: 'none', letterSpacing: '0.06em', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#00cc6a' }}
            onMouseLeave={e => { e.currentTarget.style.background = C.accent }}>Sign In</a>
          <a href="/audit" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: C.muted, border: '1px solid ' + C.border, borderRadius: 8, padding: '12px 28px', textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}>Back Home</a>
        </div>
      </div>
    </div>
  )

  const result = report.result
  const scoreColor = result.score >= 75 ? C.accent : result.score >= 50 ? C.warn : C.danger

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif", padding: '48px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 18, color: C.accent, marginBottom: 4 }}>⚡ AuditMe Report</div>
          <div style={{ fontSize: 12, color: C.muted }}>{report.repo_url} · {new Date(report.created_at).toLocaleDateString()}</div>
        </div>

        <div style={{
          background: C.surface, border: '1px solid ' + scoreColor + '44',
          borderLeft: '4px solid ' + scoreColor,
          borderRadius: 12, padding: 28, marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 24,
        }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{result.score}</div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: '0.1em', fontFamily: "'Share Tech Mono', monospace", marginBottom: 6 }}>PRODUCTION READINESS SCORE</div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.65 }}>{result.summary}</div>
          </div>
        </div>

        {result.issues?.map((issue: any) => {
          const s = SEV[issue.severity] || SEV.warning
          return (
            <div key={issue.id} style={{ background: C.surface, border: '1px solid ' + C.border, borderLeft: '4px solid ' + s.color, borderRadius: 8, padding: '16px 20px', marginBottom: 8, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = s.color + '33'; e.currentTarget.style.background = C.surface2 }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <span>{s.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Share Tech Mono', monospace" }}>{issue.title}</span>
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 8 }}>{issue.description}</div>
              <div style={{ fontSize: 12, color: C.accent, fontFamily: "'Share Tech Mono', monospace" }}>Fix: {issue.fix}</div>
            </div>
          )
        })}

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <a href="/audit" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: C.accent, textDecoration: 'none', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>⚡ Audit your own repo at AuditMe</a>
        </div>
      </div>
    </div>
  )
}
