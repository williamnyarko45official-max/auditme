'use client'
import { useState, useEffect } from 'react'
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

export default function LandingPage() {
  const router = useRouter()
  const [pricingOpen, setPricingOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'team' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [session, setSession] = useState<any>(null)

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
    <div onClick={() => setPricingOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.surface, border: '1px solid ' + C.border, borderRadius: 16, padding: 40, maxWidth: 420, width: '90%', position: 'relative' }}>
        <button onClick={() => setPricingOpen(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: C.muted, fontSize: 20, cursor: 'pointer' }}>×</button>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⚡</div>
          <div style={{ fontSize: 22, color: C.text, fontWeight: 700 }}>Upgrade to {selectedPlan === 'pro' ? 'Pro' : 'Team'}</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 8, lineHeight: 1.6 }}>
            {selectedPlan === 'pro'
              ? 'Unlimited audits, private repos, copy-ready diffs, and shareable reports.'
              : 'Everything in Pro plus 5 team seats, shared dashboard, and priority support.'}
          </div>
        </div>
        <button onClick={() => selectedPlan && handleCheckout(selectedPlan)} disabled={loading}
          style={{ width: '100%', padding: 14, background: loading ? C.border : C.accent, color: loading ? C.muted : C.bg, border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.05em' }}>
          {loading ? 'Processing...' : loading ? '' : 'Continue to Payment \u2192'}
        </button>
        {error && <div style={{ marginTop: 12, padding: 10, background: C.dangerDim, border: '1px solid ' + C.danger + '33', borderRadius: 6, fontSize: 12, color: C.danger, textAlign: 'center' }}>{error}</div>}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, overflowX: 'hidden' }}>
      {pricingOpen && <PricingModal />}

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 48px', borderBottom: '1px solid ' + C.border, background: 'rgba(6,6,8,0.85)', backdropFilter: 'blur(12px)' }}>
        <a href="#" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 18, color: C.accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚡ <span style={{ color: C.muted }}>//</span> auditme
        </a>
        <ul style={{ display: 'flex', alignItems: 'center', gap: 28, listStyle: 'none', margin: 0, padding: 0 }}>
          <li><a href="#how" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: C.muted, textDecoration: 'none', letterSpacing: '0.05em' }}>how it works</a></li>
          <li><a href="#issues" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: C.muted, textDecoration: 'none', letterSpacing: '0.05em' }}>what we catch</a></li>
          <li><a href="#pricing" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: C.muted, textDecoration: 'none', letterSpacing: '0.05em' }}>pricing</a></li>
          <li><a href="/login" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, fontWeight: 600, background: C.accent, color: C.bg, border: 'none', borderRadius: 4, padding: '8px 18px', textDecoration: 'none', display: 'inline-block', letterSpacing: '0.06em' }}>START AUDITING \u2192</a></li>
        </ul>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '180px 24px 80px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.accent, letterSpacing: '0.15em', background: C.accentDim, border: '1px solid rgba(0,255,136,0.2)', padding: '5px 14px', borderRadius: 2, marginBottom: 24, display: 'inline-block' }}>
          // PRODUCTION READINESS ANALYZER
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(64px, 10vw, 120px)', lineHeight: 0.92, color: C.text, marginBottom: 8, letterSpacing: '0.02em' }}>
          YOUR CODE IS NOT <span style={{ color: C.accent }}>READY.</span>
        </h1>
        <p style={{ fontSize: 18, color: C.muted, maxWidth: 540, lineHeight: 1.65, margin: '20px auto 36px' }}>
          Hardcoded secrets, zero error handling, and missing rate limiting are ticking time bombs. AuditMe finds them before your users do.
        </p>
        <a href="/login" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, fontWeight: 600, background: C.accent, color: C.bg, border: 'none', borderRadius: 4, padding: '14px 32px', letterSpacing: '0.08em', textDecoration: 'none', display: 'inline-block' }}>
          ⚡ AUDIT MY REPO FREE
        </a>

        <div style={{ margin: '64px auto 0', maxWidth: 620, width: '100%', background: C.surface, border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
          <div style={{ background: '#111118', borderBottom: '1px solid ' + C.border, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28ca41' }} />
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.muted, marginLeft: 'auto' }}>auditme \u2014 scanning repo</span>
          </div>
          <div style={{ padding: '20px 24px', fontFamily: "'Share Tech Mono', monospace", fontSize: 13, lineHeight: 1.8, textAlign: 'left' }}>
            <div><span style={{ color: C.accent }}>$ </span><span style={{ color: C.text }}>auditme scan github.com/yourname/your-saas</span></div>
            <div style={{ color: C.muted }}>  \u2192 Fetching 14 key files...</div>
            <div style={{ color: C.muted }}>  \u2192 Running AI analysis...</div>
            <div style={{ marginTop: 8, color: C.danger, fontWeight: 700 }}>  SCORE: 34 / 100</div>
            <div style={{ marginTop: 8, color: C.danger }}>  \uD83D\uDD34 CRITICAL</div>
            <div style={{ color: C.warn }}>  \uD83D\uDFE1 WARNING</div>
            <div style={{ color: C.accent }}>  \uD83D\uDFE2 PASS</div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid ' + C.border, borderBottom: '1px solid ' + C.border, background: C.surface }}>
        <div style={{ ...sections, paddingTop: 48, paddingBottom: 48, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
          {[
            { num: '2.4K', label: 'REPOS AUDITED' },
            { num: '18K', label: 'BUGS CAUGHT BEFORE PROD' },
            { num: '94%', label: 'REPOS FAIL FIRST AUDIT' },
          ].map((s, i) => (
            <div key={i} className="reveal" style={{ textAlign: 'center', padding: '24px 40px', opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease ' + (i * 0.1) + 's' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: C.accent, lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.muted, letterSpacing: '0.1em', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div id="how" style={sections}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.accent, letterSpacing: '0.15em', marginBottom: 12 }}>// HOW IT WORKS</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 0.95, color: C.text, marginBottom: 16 }}>THREE STEPS. ZERO EXCUSES.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2, marginTop: 56, border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>
          {[
            { num: '01', title: 'CONNECT YOUR REPO', body: 'Paste a public GitHub URL or connect your GitHub account to audit private repos.' },
            { num: '02', title: 'AI SCANS YOUR CODE', body: 'Our AI engine analyzes your code for security holes, missing error handling, bad env config and more.' },
            { num: '03', title: 'GET A SCORED REPORT', body: 'Every issue ranked by severity with plain-English explanations and copy-ready diffs.' },
            { num: '04', title: 'SHIP WITH CONFIDENCE', body: 'Fix the criticals, merge the diffs, re-audit until your score hits green.' },
          ].map((s, i) => (
            <div key={i} className="reveal" style={{ background: C.surface, padding: '36px 28px', opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease ' + (i * 0.08) + 's' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: C.border, lineHeight: 1, marginBottom: 16 }}>{s.num}</div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: C.accent, marginBottom: 8 }}>{s.title}</div>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={divide} />

      <div id="issues" style={sections}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.accent, letterSpacing: '0.15em', marginBottom: 12 }}>// WHAT WE CATCH</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 0.95, color: C.text, marginBottom: 16 }}>THE STUFF THAT KILLS STARTUPS.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12, marginTop: 48 }}>
          {[
            { sev: 'critical', title: 'Hardcoded Secrets', desc: 'API keys, database passwords and tokens committed directly into your source code.' },
            { sev: 'critical', title: 'Missing Error Handling', desc: 'Async functions with no try/catch. API routes that crash when one request fails.' },
            { sev: 'critical', title: 'No Input Validation', desc: 'User input passed directly to your database. One malformed request away from data corruption.' },
            { sev: 'warning', title: 'Zero Rate Limiting', desc: 'Public endpoints with no throttling. A bot can hammer your API all day.' },
            { sev: 'warning', title: 'console.log in Production', desc: 'Debug logs printing user data, tokens or internal state to your server logs.' },
            { sev: 'warning', title: 'Missing CORS Config', desc: 'API wide open to any origin. Any website can make requests on behalf of your users.' },
            { sev: 'warning', title: 'No Environment Validation', desc: 'Your app boots fine locally but silently fails in production when an env var is missing.' },
            { sev: 'pass', title: 'We Celebrate Wins Too', desc: 'Good dependency hygiene, proper .gitignore, health endpoints \u2014 we track what you\'re doing right.' },
          ].map((issue, i) => {
            const sc = issue.sev === 'critical' ? C.danger : issue.sev === 'warning' ? C.warn : C.accent
            const sbg = issue.sev === 'critical' ? C.dangerDim : issue.sev === 'warning' ? C.warnDim : C.accentDim
            const badge = issue.sev === 'critical' ? '\uD83D\uDD34 CRITICAL' : issue.sev === 'warning' ? '\uD83D\uDFE1 WARNING' : '\uD83D\uDFE2 PASS'
            return (
              <div key={i} className="reveal" style={{ position: 'relative', background: C.surface, border: '1px solid ' + C.border, borderRadius: 6, padding: '20px 22px', overflow: 'hidden', opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease ' + (i * 0.06) + 's' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: sc }} />
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, letterSpacing: '0.1em', padding: '3px 8px', borderRadius: 3, marginBottom: 10, display: 'inline-block', background: sbg, color: sc }}>{badge}</div>
                <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: C.text, marginBottom: 6 }}>{issue.title}</div>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{issue.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div style={divide} />

      <div id="pricing" style={sections}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.accent, letterSpacing: '0.15em', marginBottom: 12 }}>// PRICING</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 0.95, color: C.text, marginBottom: 16 }}>PAY LESS THAN YOUR BUG COSTS.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 48 }}>
          <div className="reveal" style={{ background: C.surface, border: '1px solid ' + C.border, borderRadius: 8, padding: '32px 28px', opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.muted, letterSpacing: '0.1em', marginBottom: 12 }}>// FREE</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: C.text, lineHeight: 1, marginBottom: 4 }}>$0</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 24 }}>forever, no card needed</div>
            <div style={{ marginBottom: 28 }}>
              {[['3 public repo audits / month', true], ['Full security scan', true], ['Scored report', true], ['Copy-ready diffs', false], ['Private repos', false]].map((f, i) => (
                <div key={i} style={{ fontSize: 14, color: C.muted, padding: '7px 0', borderBottom: '1px solid ' + C.border, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{f[0] as string}</span>
                  <span style={{ color: f[1] ? C.accent : C.muted }}>{f[1] ? '\u2713' : '\u2014'}</span>
                </div>
              ))}
            </div>
            <a href="/login" style={{ display: 'block', width: '100%', padding: 12, fontSize: 12, letterSpacing: '0.08em', fontWeight: 600, borderRadius: 4, background: 'transparent', color: C.muted, border: '1px solid ' + C.border, textAlign: 'center', textDecoration: 'none' }}>START FOR FREE</a>
          </div>

          <div className="reveal" style={{ position: 'relative', background: 'rgba(0,255,136,0.03)', border: '1px solid rgba(0,255,136,0.4)', borderRadius: 8, padding: '32px 28px', boxShadow: '0 0 40px rgba(0,255,136,0.06)', opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
            <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: C.accent, color: C.bg, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>MOST POPULAR</div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.muted, letterSpacing: '0.1em', marginBottom: 12 }}>// PRO</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: C.text, lineHeight: 1, marginBottom: 4 }}>$12</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 24 }}>per month, cancel anytime</div>
            <div style={{ marginBottom: 28 }}>
              {['Unlimited audits', 'Public + private repos', 'Copy-ready code diffs', 'PR title + description', 'Audit history', 'Shareable report links'].map((f, i) => (
                <div key={i} style={{ fontSize: 14, color: C.muted, padding: '7px 0', borderBottom: '1px solid ' + C.border, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{f}</span><span style={{ color: C.accent }}>\u2713</span>
                </div>
              ))}
            </div>
            <button onClick={() => { setSelectedPlan('pro'); setPricingOpen(true) }} style={{ width: '100%', padding: 12, fontSize: 12, letterSpacing: '0.08em', fontWeight: 600, borderRadius: 4, border: 'none', background: C.accent, color: C.bg, cursor: 'pointer' }}>GET PRO \u2192</button>
          </div>

          <div className="reveal" style={{ background: C.surface, border: '1px solid ' + C.border, borderRadius: 8, padding: '32px 28px', opacity: 0, transform: 'translateY(20px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.muted, letterSpacing: '0.1em', marginBottom: 12 }}>// TEAM</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, color: C.text, lineHeight: 1, marginBottom: 4 }}>$39</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 24 }}>per month, up to 5 devs</div>
            <div style={{ marginBottom: 28 }}>
              {['Everything in Pro', '5 team seats', 'Shared audit dashboard', 'GitHub PR bot (coming soon)', 'Priority support', 'Custom checks'].map((f, i) => (
                <div key={i} style={{ fontSize: 14, color: C.muted, padding: '7px 0', borderBottom: '1px solid ' + C.border, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{f}</span><span style={{ color: C.accent }}>\u2713</span>
                </div>
              ))}
            </div>
            <button onClick={() => { setSelectedPlan('team'); setPricingOpen(true) }} style={{ width: '100%', padding: 12, fontSize: 12, letterSpacing: '0.08em', fontWeight: 600, borderRadius: 4, background: 'transparent', color: C.muted, border: '1px solid ' + C.border, cursor: 'pointer' }}>GET TEAM</button>
          </div>
        </div>
      </div>

      <div style={{ ...divide }} />

      <div style={{ textAlign: 'center', padding: '80px 24px 100px', borderTop: '1px solid ' + C.border }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: C.accent, letterSpacing: '0.15em', marginBottom: 12 }}>// READY?</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(42px, 7vw, 96px)', lineHeight: 0.92, color: C.text, marginBottom: 20 }}>STOP GUESSING. START <span style={{ color: C.accent }}>SHIPPING.</span></h2>
        <p style={{ fontSize: 17, color: C.muted, maxWidth: 400, margin: '0 auto 40px', lineHeight: 1.65 }}>Paste your GitHub URL. Get your score in 60 seconds. Free, no card required.</p>
        <a href="/login" style={{ fontSize: 15, fontWeight: 600, background: C.accent, color: C.bg, border: 'none', borderRadius: 4, padding: '16px 40px', letterSpacing: '0.08em', textDecoration: 'none', display: 'inline-block' }}>⚡ AUDIT MY REPO NOW</a>
        <div style={{ marginTop: 20, fontSize: 11, color: C.muted }}>No install. No CLI. No config. Just paste and go.</div>
      </div>

      <footer style={{ borderTop: '1px solid ' + C.border, padding: '28px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.surface }}>
        <div style={{ fontSize: 14, color: C.accent }}>⚡ auditme</div>
        <ul style={{ display: 'flex', gap: 24, listStyle: 'none', margin: 0, padding: 0 }}>
          {['docs', 'privacy', 'terms', 'twitter', 'github'].map(l => (
            <li key={l}><a href="#" style={{ fontSize: 11, color: C.muted, textDecoration: 'none', letterSpacing: '0.05em' }}>{l}</a></li>
          ))}
        </ul>
        <div style={{ fontSize: 11, color: C.muted }}>© 2026 AuditMe.</div>
      </footer>
    </div>
  )
}