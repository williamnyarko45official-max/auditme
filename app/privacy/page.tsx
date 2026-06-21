'use client'
import Link from 'next/link'

const C = {
  bg: '#060608', surface: '#0d0d12', surface2: '#111118',
  border: '#1a1a28', accent: '#00ff88', accentDim: 'rgba(0,255,136,0.08)',
  text: '#dde1f0', muted: '#555570',
}

const floatKeyframes = `
@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
`

const cardHover = {
  background: 'linear-gradient(135deg, #0d0d12 0%, #111118 100%)',
  border: '1px solid ' + C.border,
  borderRadius: 12,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  padding: 28,
  marginBottom: 16,
}

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{floatKeyframes}</style>
      <div style={{ position: 'fixed', width: '600px', height: '600px', background: 'radial-gradient(circle at 50% 40%, rgba(0,255,136,0.04) 0%, transparent 70%)', top: '20%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 48px', borderBottom: '1px solid ' + C.border, background: 'rgba(6,6,8,0.88)', backdropFilter: 'blur(16px)' }}>
        <Link href="/" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 18, color: C.accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.02em' }}>
          <span style={{ fontSize: 20 }}>⚡</span> auditme
        </Link>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['/docs', 'Docs'], ['/privacy', 'Privacy'], ['/terms', 'Terms']].map(([href, text]) => (
            <Link key={text} href={href} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: href === '/privacy' ? C.accent : C.muted, textDecoration: 'none', letterSpacing: '0.05em', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = C.accent}
              onMouseLeave={e => e.currentTarget.style.color = href === '/privacy' ? C.accent : C.muted}>{text}</Link>
          ))}
        </div>
      </nav>

      <div style={{ padding: '120px 24px 80px', maxWidth: 720, margin: '0 auto', position: 'relative' }}>
        <Link href="/" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: C.accent, textDecoration: 'none', marginBottom: 32, display: 'inline-block', transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>← Back</Link>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: C.text, marginBottom: 4, letterSpacing: '0.02em', background: 'linear-gradient(135deg, ' + C.accent + ' 0%, #00ccff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PRIVACY</h1>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 48, lineHeight: 1.6, fontFamily: "'Share Tech Mono', monospace" }}>How we handle your data.</p>

        {[
          { title: 'Data Collection', body: ['We collect your email address and GitHub username when you sign up. When you audit a repo, we temporarily store the repository URL and the generated audit report. We never store your source code beyond the duration of the analysis.'] },
          { title: 'Data Sharing', body: ['We do not sell your data. Your audit results are stored securely and only accessible by you. Code sent for analysis goes directly to NVIDIA\'s API — it never touches our servers. We do not train on or mine your code.'] },
          { title: 'Contact', body: ['For privacy inquiries, email privacy@auditme.app. We respond within 48 hours.'] },
        ].map((section, i) => (
          <div key={i} style={{
            ...cardHover,
            animation: 'float 5s ease-in-out infinite',
            animationDelay: (i * 0.3) + 's',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.25)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none' }}>
            <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.accent, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 20, height: 2, background: C.accent, display: 'inline-block' }} />
              {section.title}
            </h2>
            {section.body.map((p, j) => (
              <p key={j} style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{p}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
