'use client'
import Link from 'next/link'

const C = {
  bg: '#060608', surface: '#0d0d12', border: '#1a1a28',
  accent: '#00ff88', text: '#dde1f0', muted: '#555570',
}

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '120px 24px 60px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: C.accent, textDecoration: 'none', marginBottom: 32, display: 'inline-block' }}>← Back</Link>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: C.text, marginBottom: 8, letterSpacing: '0.02em' }}>TERMS</h1>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 40, lineHeight: 1.6 }}>By using AuditMe you agree to these terms.</p>

        <div style={{ background: C.surface, border: '1px solid ' + C.border, borderRadius: 8, padding: 28, marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.accent, marginBottom: 8 }}>Service Usage</h2>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>AuditMe provides automated code analysis for production readiness. Results are for informational purposes and should not be the sole basis for security decisions. Always review AI-generated fixes before applying them.</p>
        </div>

        <div style={{ background: C.surface, border: '1px solid ' + C.border, borderRadius: 8, padding: 28, marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.accent, marginBottom: 8 }}>Subscriptions</h2>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>Paid plans billed monthly. Cancel anytime — access continues until the end of your billing period. Refunds provided within 14 days of purchase for annual plans.</p>
        </div>

        <div style={{ background: C.surface, border: '1px solid ' + C.border, borderRadius: 8, padding: 28, marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.accent, marginBottom: 8 }}>Limitation of Liability</h2>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>AuditMe is provided "as is" without warranty. We are not liable for damages arising from use of the service, including issues missed during analysis or issues introduced by applying generated fixes.</p>
        </div>
      </div>
    </div>
  )
}
