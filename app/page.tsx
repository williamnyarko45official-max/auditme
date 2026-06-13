'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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

const stepIcons = [CodeIcon, SearchIcon, ShieldIcon, TrendingIcon]
const sectionLabels = ['SECURITY', 'ERROR HANDLING', 'CONFIGURATION', 'PERFORMANCE']

export default function LandingPage() {
  const router = useRouter()
  const [pricingOpen, setPricingOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'team' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [session, setSession] = useState<any>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s))
  }, [])

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

  const handleCheckout = async (plan: 'pro' | 'team') => {
    if (!session?.user) { router.push('/login'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/paystack/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email: session.user.email, userId: session.user.id }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError(data.error || 'Checkout failed')
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  const PricingModal = () => (
    <div onClick={() => setPricingOpen(false)}
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: 'linear-gradient(135deg, #0d0d12 0%, #111118 100%)', border: '1px solid ' + C.border, borderRadius: 20, padding: 40, maxWidth: 420, width: '90%', position: 'relative', boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,136,0.06)' }}>
        <button onClick={() => setPricingOpen(false)}
          style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid ' + C.border, borderRadius: '50%', width: 32, height: 32, color: C.muted, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.accentDim, border: '1px solid rgba(0,255,136,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>⚡</div>
          <div style={{ fontSize: 24, color: C.text, fontWeight: 700, marginBottom: 8 }}>Upgrade to {selectedPlan === 'pro' ? 'Pro' : 'Team'}</div>
          <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>
            {selectedPlan === 'pro'
              ? 'Unlimited audits, private repos, copy-ready diffs, and shareable reports.'
              : 'Everything in Pro plus 5 team seats, shared dashboard, and priority support.'}
          </div>
        </div>
        <button onClick={() => selectedPlan && handleCheckout(selectedPlan)} disabled={loading}
          style={{ width: '100%', padding: 15, background: loading ? C.border : C.accent, color: loading ? C.muted : C.bg, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.03em', transition: 'all 0.2s' }}>
          {loading ? 'Processing...' : 'Continue to Payment →'}
        </button>
        {error && <div style={{ marginTop: 12, padding: 12, background: C.dangerDim, border: '1px solid ' + C.danger + '33', borderRadius: 8, fontSize: 12, color: C.danger, textAlign: 'center' }}>{error}</div>}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, overflowX: 'hidden' }}>
      {pricingOpen && <PricingModal />}

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 48px', borderBottom: '1px solid ' + C.border, background: 'rgba(6,6,8,0.88)', backdropFilter: 'blur(16px)' }}>
        <a href="/" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 20, color: C.accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '0.02em' }}>
          <span style={{ fontSize: 24 }}>⚡</span> auditme
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[['#how', 'how it works'], ['#issues', 'what we catch'], ['#pricing', 'pricing']].map(([href, text]) => (
            <a key={text} href={href} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: C.muted, textDecoration: 'none', letterSpacing: '0.05em', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = C.accent}
              onMouseLeave={e => e.currentTarget.style.color = C.muted}>{text}</a>
          ))}
          <a href="/login" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, fontWeight: 600, background: C.accent, color: C.bg, border: 'none', borderRadius: 6, padding: '9px 20px', textDecoration: 'none', letterSpacing: '0.06em', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#00cc6a'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = 'translateY(0)' }}>START AUDITING →</a>
        </div>
      </nav>

      <div ref={heroRef} style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '200px 24px 100px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ position: 'absolute', width: '800px', height: '800px', background: 'radial-gradient(circle at 50% 40%, rgba(0,255,136,0.08) 0%, rgba(0,150,255,0.03) 40%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.accent, letterSpacing: '0.18em', background: C.accentDim, border: '1px solid rgba(0,255,136,0.2)', padding: '6px 16px', borderRadius: 4, marginBottom: 28, display: 'inline-block', textTransform: 'uppercase' }}>
          Production Readiness Analyzer
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(72px, 11vw, 130px)', lineHeight: 0.9, color: C.text, marginBottom: 12, letterSpacing: '0.015em' }}>
          YOUR CODE<br />IS NOT{' '}<span style={{ color: C.accent, textShadow: '0 0 40px rgba(0,255,136,0.3)' }}>READY.</span>
        </h1>
        <p style={{ fontSize: 18, color: C.muted, maxWidth: 560, lineHeight: 1.7, margin: '20px auto 40px' }}>
          Hardcoded secrets, zero error handling, and missing rate limiting are ticking time bombs in your production code. AuditMe finds them before your users do.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/login" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, fontWeight: 600, background: C.accent, color: C.bg, border: 'none', borderRadius: 8, padding: '15px 36px', letterSpacing: '0.06em', textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,255,136,0.25)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#00cc6a'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,255,136,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,255,136,0.25)' }}>
            ⚡ AUDIT MY REPO FREE
          </a>
          <a href="#how" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.muted, border: '1px solid ' + C.border, borderRadius: 8, padding: '15px 28px', textDecoration: 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M10 8l6 4-6 4V8z" /></svg>
            See how it works
          </a>
        </div>

        <div style={{ margin: '72px auto 0', maxWidth: 680, width: '100%', background: 'linear-gradient(135deg, #0d0d12 0%, #111118 100%)', border: '1px solid ' + C.border, borderRadius: 12, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,255,136,0.04)' }}>
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
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 5.5vw, 68px)', lineHeight: 0.93, color: C.text, marginBottom: 20, letterSpacing: '0.015em' }}>FROM REPO TO REPORT<br />IN UNDER 60 SECONDS.</h2>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 520, lineHeight: 1.7 }}>Paste your GitHub URL. Our AI scans every critical file. Get a scored report with prioritized fixes.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, marginTop: 56 }}>
          {[
            { num: '01', title: 'Connect Your Repo', icon: CodeIcon, body: 'Paste a public GitHub URL or connect your account for private repos. We read every critical file.' },
            { num: '02', title: 'AI Scans Your Code', icon: SearchIcon, body: 'Powered by NVIDIA Nemotron. We find security holes, missing error handling, bad config, and more.' },
            { num: '03', title: 'Get a Scored Report', icon: ShieldIcon, body: 'Every issue ranked by severity. Click any finding to see the exact fix with a copy-ready code diff.' },
            { num: '04', title: 'Ship With Confidence', icon: TrendingIcon, body: 'Fix the criticals, merge the diffs, re-audit. Ship knowing you won\'t get paged at 2 AM.' },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="reveal" style={{
                ...card3d, padding: '32px 28px', position: 'relative', cursor: 'default', opacity: 0, transform: 'translateY(24px)',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ' + (i * 0.1) + 's',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.3)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: 'rgba(0,255,136,0.06)', lineHeight: 1, position: 'absolute', top: 8, right: 16 }}>{s.num}</div>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: C.accentDim, border: '1px solid rgba(0,255,136,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon /></div>
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.text, marginBottom: 8, fontWeight: 600 }}>{s.title}</div>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{s.body}</p>
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

      <div id="pricing" style={sections}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.accent, letterSpacing: '0.18em', marginBottom: 12, textTransform: 'uppercase' }}>// Pricing</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 5.5vw, 68px)', lineHeight: 0.93, color: C.text, marginBottom: 20, letterSpacing: '0.015em' }}>PAY LESS THAN<br />YOUR BUG COSTS.</h2>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 480, lineHeight: 1.7 }}>One missed security issue costs more than a year of AuditMe. Start free, upgrade when you need more.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 48 }}>
          <div className="reveal" style={{
            ...card3d, padding: '36px 32px', opacity: 0, transform: 'translateY(24px)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.2)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none' }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.muted, letterSpacing: '0.12em', marginBottom: 16, textTransform: 'uppercase' }}>Free</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: C.text, lineHeight: 1, marginBottom: 4 }}>$0</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>forever, no card needed</div>
            <div style={{ marginBottom: 28, borderTop: '1px solid ' + C.border, paddingTop: 4 }}>
              {[['3 public repo audits / month', true], ['Full security scan', true], ['Scored report', true], ['Copy-ready diffs', false], ['Private repos', false]].map((f, i) => (
                <div key={i} style={{ fontSize: 14, color: C.muted, padding: '9px 0', borderBottom: '1px solid ' + C.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{f[0] as string}</span>
                  <span style={{ color: f[1] ? C.accent : '#333345', fontSize: 16 }}>{f[1] ? '✓' : '—'}</span>
                </div>
              ))}
            </div>
            <a href="/login" style={{ display: 'block', width: '100%', padding: 13, fontSize: 13, letterSpacing: '0.06em', fontWeight: 600, borderRadius: 8, background: 'transparent', color: C.muted, border: '1px solid ' + C.border, textAlign: 'center', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}>Start Free</a>
          </div>

          <div className="reveal" style={{
            position: 'relative', padding: '36px 32px', borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(0,255,136,0.04) 0%, rgba(0,0,0,0) 100%)',
            border: '1px solid rgba(0,255,136,0.35)', opacity: 0, transform: 'translateY(24px)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s',
            boxShadow: '0 0 40px rgba(0,255,136,0.06)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.6)'; e.currentTarget.style.boxShadow = '0 16px 50px rgba(0,255,136,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.35)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(0,255,136,0.06)' }}>
            <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, ' + C.accent + ' 0%, #00cc6a 100%)', color: C.bg, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', padding: '4px 16px', borderRadius: 20, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Most Popular</div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.accent, letterSpacing: '0.12em', marginBottom: 16, textTransform: 'uppercase' }}>Pro</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: C.text, lineHeight: 1, marginBottom: 4 }}>$12</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>per month, cancel anytime</div>
            <div style={{ marginBottom: 28, borderTop: '1px solid rgba(0,255,136,0.12)', paddingTop: 4 }}>
              {['Unlimited audits', 'Public + private repos', 'Copy-ready code diffs', 'PR title + description', 'Audit history', 'Shareable report links'].map((f, i) => (
                <div key={i} style={{ fontSize: 14, color: C.text, padding: '9px 0', borderBottom: '1px solid rgba(0,255,136,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{f}</span><span style={{ color: C.accent, fontSize: 16 }}>✓</span>
                </div>
              ))}
            </div>
            <button onClick={() => { setSelectedPlan('pro'); setPricingOpen(true) }}
              style={{ width: '100%', padding: 13, fontSize: 13, letterSpacing: '0.06em', fontWeight: 700, borderRadius: 8, border: 'none', background: C.accent, color: C.bg, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(0,255,136,0.25)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#00cc6a'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = 'translateY(0)' }}>Get Pro →</button>
          </div>

          <div className="reveal" style={{
            ...card3d, padding: '36px 32px', opacity: 0, transform: 'translateY(24px)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.2)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none' }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.muted, letterSpacing: '0.12em', marginBottom: 16, textTransform: 'uppercase' }}>Team</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: C.text, lineHeight: 1, marginBottom: 4 }}>$39</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>per month, up to 5 devs</div>
            <div style={{ marginBottom: 28, borderTop: '1px solid ' + C.border, paddingTop: 4 }}>
              {['Everything in Pro', '5 team seats', 'Shared audit dashboard', 'GitHub PR bot (coming soon)', 'Priority support', 'Custom checks'].map((f, i) => (
                <div key={i} style={{ fontSize: 14, color: C.text, padding: '9px 0', borderBottom: '1px solid ' + C.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{f}</span><span style={{ color: C.accent, fontSize: 16 }}>✓</span>
                </div>
              ))}
            </div>
            <button onClick={() => { setSelectedPlan('team'); setPricingOpen(true) }}
              style={{ width: '100%', padding: 13, fontSize: 13, letterSpacing: '0.06em', fontWeight: 600, borderRadius: 8, background: 'transparent', color: C.muted, border: '1px solid ' + C.border, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}>Get Team</button>
          </div>
        </div>
      </div>

      <div style={{ ...divide }} />

      <div style={{ textAlign: 'center', padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '800px', height: '400px', background: 'radial-gradient(ellipse at center bottom, rgba(0,255,136,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.accent, letterSpacing: '0.18em', marginBottom: 16, textTransform: 'uppercase' }}>// Ready?</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(48px, 8vw, 100px)', lineHeight: 0.9, color: C.text, marginBottom: 24, letterSpacing: '0.015em' }}>
          STOP GUESSING.<br />START <span style={{ color: C.accent, textShadow: '0 0 30px rgba(0,255,136,0.2)' }}>SHIPPING.</span>
        </h2>
        <p style={{ fontSize: 17, color: C.muted, maxWidth: 420, margin: '0 auto 40px', lineHeight: 1.7 }}>Paste your GitHub URL. Get your score in 60 seconds. Free, no card required.</p>
        <a href="/login" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 15, fontWeight: 700, background: C.accent, color: C.bg, border: 'none', borderRadius: 8, padding: '17px 44px', letterSpacing: '0.06em', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 24px rgba(0,255,136,0.3)', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#00cc6a'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,255,136,0.4)'  }}
          onMouseLeave={e => { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,255,136,0.3)'  }}>
          ⚡ Audit My Repo Now
        </a>
        <div style={{ marginTop: 20, fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.muted }}>No install. No CLI. No config. Just paste and go.</div>
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