'use client'
import { useState, useEffect, useRef } from 'react'

const C = {
  bg: '#060608', surface: '#0d0d12', surface2: '#111118',
  border: '#1a1a28', accent: '#00ff88', accentDim: 'rgba(0,255,136,0.08)',
  warn: '#ffd166', warnDim: 'rgba(255,209,102,0.08)',
  danger: '#ff3d3d', dangerDim: 'rgba(255,61,61,0.08)',
  text: '#dde1f0', muted: '#555570',
}

const sections = { maxWidth: 1100, margin: '0 auto', padding: '96px 24px' }
const divide = { width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, #1a1a28, transparent)' }

const card3d = {
  background: C.surface,
  border: '1px solid ' + C.border,
  borderRadius: 12,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

function TrendingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

const floatKeyframes = `
@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
@keyframes floatDelayed { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
@keyframes pulseGlow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
@keyframes scanLine { 0% { top: 0; } 100% { top: 100%; } }
`

function ReportPreview() {
  const sevColor = (s: string) => s === 'critical' ? '#ff3d3d' : s === 'warning' ? '#ffd166' : '#00ff88'
  const sevBg = (s: string) => s === 'critical' ? 'rgba(255,61,61,0.06)' : 'rgba(255,209,102,0.06)'
  const issues = [
    { sev: 'critical', file: '/lib/stripe.js:12', title: 'API key hardcoded in source' },
    { sev: 'critical', file: '/api/checkout', title: 'Missing error handling' },
    { sev: 'warning', file: '/api/*', title: 'No rate limiting' },
    { sev: 'warning', file: '/pages/auth.js:5', title: 'console.log leaking user data' },
  ]
  return (
    <div style={{
      background: 'rgba(13,13,18,0.92)', backdropFilter: 'blur(16px)',
      border: '1px solid rgba(0,255,136,0.12)', borderRadius: 14, overflow: 'hidden',
      width: 380, boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,136,0.04), 0 0 60px rgba(0,255,136,0.03)',
      position: 'relative', animation: 'float 5s ease-in-out infinite',
    }}>
      <div style={{ background: 'linear-gradient(90deg, #13131a, #111118)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28ca41' }} />
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: C.muted, marginLeft: 'auto' }}>auditme — report #a3f2c1</span>
      </div>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, background: 'rgba(255,61,61,0.06)', borderRadius: 10, padding: '12px 16px', border: '1px solid rgba(255,61,61,0.15)' }}>
          <div style={{ textAlign: 'center', minWidth: 52 }}>
            <div style={{ fontSize: 38, fontWeight: 700, color: '#ff3d3d', lineHeight: 1, fontFamily: "'Bebas Neue', sans-serif" }}>34</div>
            <div style={{ fontSize: 9, color: C.muted, fontFamily: "'Share Tech Mono', monospace" }}>/100</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: '#ff3d3d', letterSpacing: '0.1em', fontFamily: "'Share Tech Mono', monospace", marginBottom: 2 }}>PRODUCTION READINESS</div>
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>Critical issues found in authentication and payment processing paths.</div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'conic-gradient(#ff3d3d 34%, rgba(255,61,61,0.15) 34%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#0d0d12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#ff3d3d', fontWeight: 700, fontFamily: "'Share Tech Mono', monospace" }}>F</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: '0.1em', fontFamily: "'Share Tech Mono', monospace", marginBottom: 8 }}>TOP ISSUES</div>
          {issues.map((issue, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: i < issues.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 8, lineHeight: '18px' }}>{issue.sev === 'critical' ? '🔴' : '🟡'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 8, color: sevColor(issue.sev), fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.05em', padding: '1px 5px', borderRadius: 2, background: sevBg(issue.sev), border: '1px solid ' + sevColor(issue.sev) + '22' }}>
                    {issue.sev === 'critical' ? 'CRITICAL' : 'WARNING'}
                  </span>
                  <span style={{ fontSize: 8, color: C.muted, fontStyle: 'italic' }}>{issue.file}</span>
                </div>
                <div style={{ fontSize: 11, color: C.text, marginTop: 1 }}>{issue.title}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 9, color: C.muted, fontFamily: "'Share Tech Mono', monospace" }}>14 files scanned · 6 issues found</span>
          <span style={{ fontSize: 10, color: C.accent, fontFamily: "'Share Tech Mono', monospace", display: 'flex', alignItems: 'center', gap: 4 }}>
            View full report <span style={{ fontSize: 12 }}>→</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [quickUrl, setQuickUrl] = useState('')
  const [quickScanning, setQuickScanning] = useState(false)
  const [quickResult, setQuickResult] = useState<any>(null)
  const [quickError, setQuickError] = useState('')
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = '1'
          ;(e.target as HTMLElement).style.transform = 'translateY(0)'
        }
      })
    }, { threshold: 0.1 })
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        heroRef.current.style.setProperty('--mouse-x', String(x * 20))
        heroRef.current.style.setProperty('--mouse-y', String(y * 20))
      }
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const handleQuickScan = async () => {
    if (!quickUrl.trim()) return
    setQuickScanning(true); setQuickResult(null); setQuickError('')
    try {
      const res = await fetch('/api/quick-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: quickUrl.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan failed')
      setQuickResult(data)
    } catch (e: any) {
      setQuickError(e.message)
    }
    setQuickScanning(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, overflowX: 'hidden' }}>
      <style>{floatKeyframes}</style>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 48px', borderBottom: '1px solid ' + C.border, background: 'rgba(6,6,8,0.88)', backdropFilter: 'blur(16px)' }}>
        <a href="/" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 20, color: C.accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '0.02em' }}>
          <span style={{ fontSize: 24 }}>⚡</span> auditme
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[['#how', 'how it works'], ['#integrations', 'integrations'], ['#issues', 'what we catch']].map(([href, text]) => (
            <a key={text} href={href} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: C.muted, textDecoration: 'none', letterSpacing: '0.05em', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = C.accent}
              onMouseLeave={e => e.currentTarget.style.color = C.muted}>{text}</a>
          ))}
          <a href="/login" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, fontWeight: 600, background: C.accent, color: C.bg, border: 'none', borderRadius: 6, padding: '9px 20px', textDecoration: 'none', letterSpacing: '0.06em', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#00cc6a'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = 'translateY(0)' }}>START →</a>
        </div>
      </nav>

      <div ref={heroRef} style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '200px 24px 100px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ position: 'absolute', width: '800px', height: '800px', background: 'radial-gradient(circle at 50% 40%, rgba(0,255,136,0.08) 0%, rgba(0,150,255,0.03) 40%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.accent, letterSpacing: '0.18em', background: C.accentDim, border: '1px solid rgba(0,255,136,0.2)', padding: '6px 16px', borderRadius: 4, marginBottom: 28, display: 'inline-block', textTransform: 'uppercase' }}>
          Your Coding Agent's Security Sidekick
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(72px, 11vw, 130px)', lineHeight: 0.9, color: C.text, marginBottom: 12, letterSpacing: '0.015em' }}>
          WAKE UP YOUR<br />CODING AGENT{' '}<span style={{ color: C.accent, textShadow: '0 0 40px rgba(0,255,136,0.3)' }}>WITH AUDITME.</span>
        </h1>
        <p style={{ fontSize: 18, color: C.muted, maxWidth: 600, lineHeight: 1.7, margin: '20px auto 40px' }}>
          AuditMe wakes up with your coding agent — Cursor, Windsurf, opencode, or Claude Desktop. MCP tools, LSP diagnostics, and a web dashboard. One engine, three surfaces. Free and open source.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/login" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, fontWeight: 600, background: C.accent, color: C.bg, border: 'none', borderRadius: 8, padding: '15px 36px', letterSpacing: '0.06em', textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,255,136,0.25)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#00cc6a'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,255,136,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,255,136,0.25)' }}>
            ⚡ TRY THE WEB APP
          </a>
          <a href="#integrations" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.muted, border: '1px solid ' + C.border, borderRadius: 8, padding: '15px 28px', textDecoration: 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M10 8l6 4-6 4V8z" /></svg>
            Add to your agent
          </a>
        </div>

        {/* Quick scan */}
        <div style={{ margin: '48px auto 0', maxWidth: 580, width: '100%' }}>
          <div style={{ background: 'rgba(13,13,18,0.6)', border: '1px solid ' + C.border, borderRadius: 12, padding: '20px 24px', backdropFilter: 'blur(8px)' }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: C.muted, letterSpacing: '0.12em', marginBottom: 12, textTransform: 'uppercase' }}>Try the web app — no signup needed</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input type="text" placeholder="https://github.com/username/repo" value={quickUrl}
                onChange={e => setQuickUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuickScan()}
                style={{
                  flex: 1, background: C.bg, border: '1px solid ' + C.border, borderRadius: 8,
                  padding: '12px 16px', color: C.text, fontFamily: "'Share Tech Mono', monospace",
                  fontSize: 13, outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = C.accent}
                onBlur={e => e.currentTarget.style.borderColor = C.border} />
              <button onClick={handleQuickScan} disabled={quickScanning || !quickUrl.trim()}
                style={{
                  padding: '12px 24px', background: quickScanning ? C.border : C.accent,
                  color: quickScanning ? C.muted : C.bg, border: 'none', borderRadius: 8,
                  fontFamily: "'Share Tech Mono', monospace", fontSize: 13, fontWeight: 700,
                  cursor: quickScanning || !quickUrl.trim() ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.04em', whiteSpace: 'nowrap', transition: 'all 0.2s',
                  boxShadow: quickScanning ? 'none' : '0 4px 16px rgba(0,255,136,0.2)',
                }}
                onMouseEnter={e => { if (!quickScanning && quickUrl.trim()) { e.currentTarget.style.background = '#00cc6a'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                onMouseLeave={e => { if (!quickScanning && quickUrl.trim()) { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = 'translateY(0)' } }}>
                {quickScanning ? '▋ Scanning...' : 'Quick Audit'}
              </button>
            </div>
            {quickError && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: C.dangerDim, border: '1px solid rgba(255,61,61,0.2)', borderRadius: 8, fontSize: 12, color: C.danger, fontFamily: "'Share Tech Mono', monospace" }}>
                ⚠ {quickError}
              </div>
            )}
          </div>

          {quickResult && (
            <div style={{
              marginTop: 16, background: 'rgba(13,13,18,0.92)', backdropFilter: 'blur(16px)',
              border: '1px solid ' + (quickResult.score >= 75 ? C.accent + '44' : quickResult.score >= 50 ? C.warn + '44' : C.danger + '44'),
              borderRadius: 14, overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
            }}>
              <div style={{ padding: '18px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                  <div style={{ textAlign: 'center', minWidth: 60 }}>
                    <div style={{ fontSize: 40, fontWeight: 700, color: quickResult.score >= 75 ? C.accent : quickResult.score >= 50 ? C.warn : C.danger, lineHeight: 1, fontFamily: "'Bebas Neue', sans-serif" }}>{quickResult.score}</div>
                    <div style={{ fontSize: 9, color: C.muted, fontFamily: "'Share Tech Mono', monospace" }}>/100</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.1em', fontFamily: "'Share Tech Mono', monospace", marginBottom: 2 }}>QUICK SCORE</div>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{quickResult.summary}</div>
                  </div>
                </div>
                {quickResult.topPriority && (
                  <div style={{ padding: '8px 12px', background: C.dangerDim, borderRadius: 6, border: '1px solid rgba(255,61,61,0.15)', fontSize: 11, color: C.danger, fontFamily: "'Share Tech Mono', monospace", marginBottom: 12 }}>
                    🚨 {quickResult.topPriority}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {quickResult.issues?.slice(0, 3).map((issue: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 9, lineHeight: '18px' }}>{issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🟢'}</span>
                      <div>
                        <span style={{ fontSize: 9, color: issue.severity === 'critical' ? C.danger : issue.severity === 'warning' ? C.warn : C.accent, fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.05em' }}>
                          {issue.severity.toUpperCase()}
                        </span>
                        <div style={{ fontSize: 12, color: C.text, marginTop: 1 }}>{issue.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid ' + C.border, textAlign: 'center' }}>
                  <a href="/login" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.accent, textDecoration: 'none' }}>
                    Sign up for the full report → {quickResult.issues?.length > 3 ? `(${quickResult.issues.length - 3} more issues)` : ''}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ margin: '72px auto 0', display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 420px', maxWidth: 520, background: 'linear-gradient(135deg, #0d0d12 0%, #111118 100%)', border: '1px solid ' + C.border, borderRadius: 12, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,255,136,0.04)' }}>
            <div style={{ background: 'linear-gradient(90deg, #13131a, #111118)', borderBottom: '1px solid ' + C.border, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28ca41' }} />
              <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.muted, marginLeft: 'auto' }}>auditme — scanning repo</span>
            </div>
            <div style={{ padding: '24px 28px', fontFamily: "'Share Tech Mono', monospace", fontSize: 13, lineHeight: 2 }}>
              <div><span style={{ color: C.accent }}>$ </span><span style={{ color: C.text }}>auditme scan github.com/yourname/your-saas</span></div>
              <div style={{ color: C.muted }}>  → Fetching 14 key files...</div>
              <div style={{ color: C.muted }}>  → Running NVIDIA AI analysis...</div>
              <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(255,61,61,0.06)', borderLeft: '2px solid ' + C.danger, borderRadius: '0 4px 4px 0' }}>
                <span style={{ color: C.muted }}>  SCORE: </span><span style={{ color: C.danger, fontWeight: 700 }}>34 / 100</span>
              </div>
              <div style={{ marginTop: 8 }}><span style={{ color: C.danger }}>🔴 CRITICAL</span><span style={{ color: C.muted }}> — API key hardcoded in /lib/stripe.js:12</span></div>
              <div><span style={{ color: C.danger }}>🔴 CRITICAL</span><span style={{ color: C.muted }}> — No error handling on /api/checkout</span></div>
              <div><span style={{ color: C.warn }}>🟡 WARNING</span><span style={{ color: C.muted }}> — No rate limiting on public endpoints</span></div>
              <div><span style={{ color: C.warn }}>🟡 WARNING</span><span style={{ color: C.muted }}> — console.log in production code</span></div>
              <div><span style={{ color: C.accent }}>🟢 PASS</span><span style={{ color: C.muted }}> — Dependencies up to date</span></div>
            </div>
          </div>
          <ReportPreview />
        </div>
      </div>

      <div style={{ borderTop: '1px solid ' + C.border, borderBottom: '1px solid ' + C.border }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
          {[
            { num: '2.4K', label: 'REPOS AUDITED', sub: 'and counting' },
            { num: '18K', label: 'BUGS CAUGHT', sub: 'before production' },
            { num: '94%', label: 'FAIL FIRST AUDIT', sub: 'of vibe-coded repos' },
          ].map((s, i) => (
            <div key={i} className="reveal" style={{ textAlign: 'center', padding: '0 32px', borderRight: i < 2 ? '1px solid ' + C.border : 'none', opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease ' + (i * 0.12) + 's' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, letterSpacing: '0.02em', background: 'linear-gradient(135deg, ' + C.accent + ' 0%, #00ccff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.text, letterSpacing: '0.12em', marginTop: 8 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div id="how" style={sections}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.accent, letterSpacing: '0.18em', marginBottom: 12, textTransform: 'uppercase' }}>// How It Works</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 5.5vw, 68px)', lineHeight: 0.93, color: C.text, marginBottom: 20, letterSpacing: '0.015em' }}>ONE ENGINE,<br />THREE SURFACES.</h2>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 560, lineHeight: 1.7 }}>AuditMe integrates at every level — MCP for your agent, LSP for your editor, Web for your browser. Same NVIDIA Nemotron engine behind all three. Free and open source.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, marginTop: 56 }}>
          {[
            { title: 'MCP Server', icon: CodeIcon, body: 'Your coding agent calls AuditMe as a native tool. Add to Cursor, Windsurf, opencode, or Claude Desktop. Commands: audit_code, audit_file, audit_github.', code: '{\n  "mcpServers": {\n    "auditme": {\n      "command": "npx",\n      "args": ["-y", "@auditme/mcp"]\n    }\n  }\n}' },
            { title: 'LSP Server', icon: SearchIcon, body: 'Real-time diagnostics while you code. Catches secrets, console.log, debugger, TODO, missing try-catch. Full audit on demand via command.', code: '# opencode.json\n{\n  "lsp": {\n    "servers": [{\n      "name": "auditme",\n      "command": "npx",\n      "args": ["-y", "@auditme/lsp"]\n    }]\n  }\n}' },
            { title: 'Web App', icon: ShieldIcon, body: 'Paste any public GitHub URL. Get a scored report with prioritized fixes in under 60 seconds. No install, no config — just paste and audit.', code: null },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="reveal" style={{
                ...card3d, padding: '32px 28px', position: 'relative', cursor: 'default', opacity: 0, transform: 'translateY(24px)',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ' + (i * 0.1) + 's',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.3)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: C.accentDim, border: '1px solid rgba(0,255,136,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon /></div>
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.text, marginBottom: 8, fontWeight: 600 }}>{s.title}</div>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: s.code ? 16 : 0 }}>{s.body}</p>
                {s.code && (
                  <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid ' + C.border, borderRadius: 8, padding: '12px 14px', fontFamily: "'Share Tech Mono', monospace", fontSize: 11, lineHeight: 1.6, whiteSpace: 'pre', overflow: 'auto', color: C.muted }}>
                    {s.code}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div style={divide} />

      <div id="issues" style={sections}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.accent, letterSpacing: '0.18em', marginBottom: 12, textTransform: 'uppercase' }}>// What We Catch</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 5.5vw, 68px)', lineHeight: 0.93, color: C.text, marginBottom: 20, letterSpacing: '0.015em' }}>THE STUFF THAT<br />KILLS STARTUPS.</h2>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 500, lineHeight: 1.7 }}>94% of vibe-coded apps fail their first audit. Here's what we find every single time.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginTop: 48 }}>
          {[
            { sev: 'critical', title: 'Hardcoded Secrets', desc: 'API keys, database passwords and tokens committed directly into your source code.' },
            { sev: 'critical', title: 'Missing Error Handling', desc: 'Async functions with no try/catch. API routes that crash when one request fails.' },
            { sev: 'critical', title: 'No Input Validation', desc: 'User input passed directly to your database. One malformed request away from corruption.' },
            { sev: 'warning', title: 'Zero Rate Limiting', desc: 'Public endpoints with no throttling. A bot can hammer your API all day.' },
            { sev: 'warning', title: 'console.log in Production', desc: 'Debug logs printing user data, tokens or internal state to your server logs.' },
            { sev: 'warning', title: 'Missing CORS Config', desc: 'API wide open to any origin. Any website can make requests on behalf of your users.' },
            { sev: 'warning', title: 'No Environment Validation', desc: 'Your app boots fine locally but silently fails in production when an env var is missing.' },
            { sev: 'pass', title: 'We Celebrate Wins Too', desc: 'Good dependency hygiene, proper .gitignore, health endpoints — we track what you\'re doing right.' },
          ].map((issue, i) => {
            const sc = issue.sev === 'critical' ? C.danger : issue.sev === 'warning' ? C.warn : C.accent
            const sbg = issue.sev === 'critical' ? C.dangerDim : issue.sev === 'warning' ? C.warnDim : C.accentDim
            const badge = issue.sev === 'critical' ? '🔴 CRITICAL' : issue.sev === 'warning' ? '🟡 WARNING' : '🟢 PASS'
            return (
              <div key={i} className="reveal" style={{
                position: 'relative', background: C.surface, border: '1px solid ' + C.border, borderRadius: 10, padding: '22px 24px', overflow: 'hidden',
                opacity: 0, transform: 'translateY(20px)', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1) ' + (i * 0.06) + 's', cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = sc + '44'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'linear-gradient(to bottom, ' + sc + ', transparent)' }} />
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: '0.1em', padding: '3px 10px', borderRadius: 3, marginBottom: 10, display: 'inline-block', background: sbg, color: sc }}>{badge}</div>
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.text, marginBottom: 8, fontWeight: 600 }}>{issue.title}</div>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{issue.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div style={divide} />

      <div id="integrations" style={sections}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.accent, letterSpacing: '0.18em', marginBottom: 12, textTransform: 'uppercase' }}>// Integrations</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 5.5vw, 68px)', lineHeight: 0.93, color: C.text, marginBottom: 20, letterSpacing: '0.015em' }}>WAKE UP WITH<br />YOUR CODING AGENT.</h2>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 520, lineHeight: 1.7 }}>AuditMe is designed to pair with your AI coding tools. Add it once, forget it's there — until it saves you from shipping a secret to production.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 48 }}>
          {[
            { name: 'Cursor', desc: 'Add the MCP server in cursor.json. AuditMe shows up as a native tool your agent calls automatically.', icon: '⬡' },
            { name: 'Windsurf', desc: 'Configure the MCP server in Windsurf\'s settings. Your AI flow catches security issues mid-edit.', icon: '🏄' },
            { name: 'opencode', desc: 'Add the MCP server or LSP server to opencode.json. Instant diagnostics as you code.', icon: '⌨' },
            { name: 'Claude Desktop', desc: 'Add the MCP server to claude_desktop_config.json. Claude audits your code on request.', icon: '🤖' },
            { name: 'VS Code', desc: 'Full VS Code extension with inline diagnostics and one-click full audits. Install from the marketplace or side-load from vscode/.', icon: '📦' },
            { name: 'CLI', desc: 'Installed via npx or npm. Commands: scan (full NVIDIA audit), check (local regex), watch (file watcher), init (config scaffold).', icon: '🖥' },
          ].map((item, i) => (
            <div key={i} className="reveal" style={{
              background: C.surface, border: '1px solid ' + C.border, borderRadius: 10, padding: '22px 22px',
              opacity: 0, transform: 'translateY(20px)', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1) ' + (i * 0.06) + 's', cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent + '44'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.text, marginBottom: 6, fontWeight: 600 }}>{item.name}</div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={divide} />

      <div style={{ textAlign: 'center', padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '800px', height: '400px', background: 'radial-gradient(ellipse at center bottom, rgba(0,255,136,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.accent, letterSpacing: '0.18em', marginBottom: 16, textTransform: 'uppercase' }}>// Ready?</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(48px, 8vw, 100px)', lineHeight: 0.9, color: C.text, marginBottom: 24, letterSpacing: '0.015em' }}>
          WAKE UP YOUR<br />CODING AGENT{' '}<span style={{ color: C.accent, textShadow: '0 0 30px rgba(0,255,136,0.2)' }}>TODAY.</span>
        </h2>
        <p style={{ fontSize: 17, color: C.muted, maxWidth: 420, margin: '0 auto 40px', lineHeight: 1.7 }}>MCP server, LSP server, and web app — all free and open source. Add AuditMe to your agent and ship with confidence.</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/login" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 15, fontWeight: 700, background: C.accent, color: C.bg, border: 'none', borderRadius: 8, padding: '17px 44px', letterSpacing: '0.06em', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 24px rgba(0,255,136,0.3)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#00cc6a'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,255,136,0.4)'  }}
            onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,255,136,0.3)'  }}>
            ⚡ Try the Web App
          </a>
          <a href="#how" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.muted, border: '1px solid ' + C.border, borderRadius: 8, padding: '15px 28px', textDecoration: 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M10 8l6 4-6 4V8z" /></svg>
            Set up MCP / LSP
          </a>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid ' + C.border, padding: '32px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.surface }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.accent }}>auditme</span>
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {[{ l: 'docs', href: '/docs' }, { l: 'privacy', href: '/privacy' }, { l: 'terms', href: '/terms' }, { l: 'twitter', href: 'https://twitter.com/auditme' }, { l: 'github', href: 'https://github.com/williamnyarko45official-max/auditme' }].map(({ l, href }) => (
            <a key={l} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener' : undefined} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.muted, textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'capitalize', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = C.accent}
              onMouseLeave={e => e.currentTarget.style.color = C.muted}>{l}</a>
          ))}
        </div>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.muted }}>© 2026 AuditMe</div>
      </footer>
    </div>
  )
}
