'use client'
import Link from 'next/link'

const C = {
  bg: '#060608', surface: '#0d0d12', border: '#1a1a28',
  accent: '#00ff88', text: '#dde1f0', muted: '#555570',
}

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '120px 24px 60px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: C.accent, textDecoration: 'none', marginBottom: 32, display: 'inline-block' }}>← Back</Link>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: C.text, marginBottom: 8, letterSpacing: '0.02em' }}>PRIVACY</h1>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 40, lineHeight: 1.6 }}>How we handle your data.</p>

        <div style={{ background: C.surface, border: '1px solid ' + C.border, borderRadius: 8, padding: 28, marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.accent, marginBottom: 8 }}>Data Collection</h2>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>We collect your email address and GitHub username when you sign up. When you audit a repo, we temporarily store the repository URL and the generated audit report. We never store your source code beyond the duration of the analysis.</p>
        </div>

        <div style={{ background: C.surface, border: '1px solid ' + C.border, borderRadius: 8, padding: 28, marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.accent, marginBottom: 8 }}>Data Sharing</h2>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>We do not sell your data. Your audit results are stored securely and only accessible by you. Payment processing is handled by Paystack — we never see your card details.</p>
        </div>

        <div style={{ background: C.surface, border: '1px solid ' + C.border, borderRadius: 8, padding: 28, marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.accent, marginBottom: 8 }}>Contact</h2>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>For privacy inquiries, email privacy@auditme.app. We respond within 48 hours.</p>
        </div>
      </div>
    </div>
  )
}
