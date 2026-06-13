'use client'
import Link from 'next/link'

const C = {
  bg: '#060608', surface: '#0d0d12', border: '#1a1a28',
  accent: '#00ff88', text: '#dde1f0', muted: '#555570',
}

export default function DocsPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '120px 24px 60px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: C.accent, textDecoration: 'none', marginBottom: 32, display: 'inline-block' }}>← Back</Link>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: C.text, marginBottom: 8, letterSpacing: '0.02em' }}>DOCS</h1>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 40, lineHeight: 1.6 }}>Everything you need to know about AuditMe.</p>

        <div style={{ background: C.surface, border: '1px solid ' + C.border, borderRadius: 8, padding: 28, marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.accent, marginBottom: 8 }}>Getting Started</h2>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 12 }}>Paste any public GitHub URL into the audit box and click "Audit This Code". You'll get a full production readiness report in under 60 seconds.</p>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>For private repos, connect your GitHub account. We request read-only access to your repositories.</p>
        </div>

        <div style={{ background: C.surface, border: '1px solid ' + C.border, borderRadius: 8, padding: 28, marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.accent, marginBottom: 8 }}>Audit Results</h2>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>Each audit returns a score from 0–100, a summary, and a list of issues grouped by severity. Click any issue to see a detailed explanation and suggested fix. Pro users can generate copy-ready code diffs.</p>
        </div>

        <div style={{ background: C.surface, border: '1px solid ' + C.border, borderRadius: 8, padding: 28, marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.accent, marginBottom: 8 }}>Plans & Limits</h2>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>Free tier: 3 audits per month, public repos only. Pro: unlimited audits, private repos, copy-ready diffs, and shareable reports. Team: everything in Pro plus 5 seats and priority support.</p>
        </div>
      </div>
    </div>
  )
}
