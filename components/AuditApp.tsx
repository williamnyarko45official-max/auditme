'use client'
import { canAudit, incrementAuditCount } from '@/lib/subscription'
import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchGithubCode } from '@/lib/github'
import { isPro } from '@/lib/subscription'
import { callNvidia, parseLLMResponse, SYSTEM_PROMPT } from '@/lib/llm'
import { useEffect } from 'react'

const DIFF_PROMPT = (issue: any, code: string) => `You are a senior engineer doing a precise code fix.

Look through the code below and find the EXACT lines that cause this issue.
Copy them verbatim into "before". Then write the fixed version in "after".

RULES:
- "before" must be real code copied exactly from the code below — never empty, never made up
- "after" must be the fixed replacement for exactly that code
- If you cannot find the exact lines, pick the most relevant snippet and fix it
- Never return empty strings for before or after

Issue: ${issue.title}
Description: ${issue.description}
File to look in: ${issue.affectedFile}

CODE:
${code.slice(0, 6000)}

Return ONLY this JSON (no markdown, no backticks):
{
  "filename": "<exact filename>",
  "explanation": "<1-2 sentences on what you found and changed>",
  "before": "<exact code copied from above — NEVER empty>",
  "after": "<fixed replacement code — NEVER empty>",
  "prTitle": "<git commit title>",
  "prDescription": "<2-3 sentence PR description>"
}`

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

export default function AuditApp({ user, subscription }: { user: any, subscription: any }) {
  const [mode, setMode] = useState<'github' | 'upload'>('github')
  const [githubUrl, setGithubUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState('')
  const [result, setResult] = useState<any>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [uploadedCode, setUploadedCode] = useState('')
  const [fileName, setFileName] = useState('')
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)
  const [diffs, setDiffs] = useState<Record<string, any>>({})
  const [copied, setCopied] = useState<Record<string, boolean>>({})
  const [fetchedCode, setFetchedCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [shareMsg, setShareMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [githubToken, setGithubToken] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setGithubToken(session?.provider_token || null)
    })
  }, [])
  const isGithubConnected = !!(user?.app_metadata?.providers?.includes('github') || githubToken)
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    setFileName(f.name)
    const r = new FileReader()
    r.onload = (ev) => setUploadedCode(ev.target?.result as string)
    r.readAsText(f)
  }

  const callLLM = async (userMsg: string, sysMsg: string) => {
    return callNvidia(userMsg, sysMsg)
  }

  const analyze = async () => {
    const { allowed, reason } = canAudit(subscription)
    if (!allowed) {
      setError(reason || 'Upgrade to Pro to continue auditing.')
      return
    }

    setError(''); setResult(null); setDiffs({}); setSavedId(null); setShareMsg('')
    setAnalyzing(true)

    try {
      let code = ''
      if (mode === 'github') {
        if (!githubUrl) throw new Error('Enter a GitHub repo URL')
        code = await fetchGithubCode(githubUrl, githubToken, setProgress)
      } else {
        if (!uploadedCode) throw new Error('Upload a file first')
        code = uploadedCode
      }
      setFetchedCode(code)
      setProgress('Running AI analysis...')

      const raw = await callLLM(`Analyze this code for production readiness:\n\n${code}`, SYSTEM_PROMPT)
      const parsed = parseLLMResponse(raw)
      setResult(parsed)

      setSaving(true)
      const { data, error: saveErr } = await supabase.from('audits').insert({
        user_id: user.id,
        repo_url: mode === 'github' ? githubUrl : fileName,
        score: parsed.score,
        result: parsed,
      }).select('id').single()
      if (!saveErr && data) setSavedId(data.id)
      setSaving(false)
      await incrementAuditCount(user.id, subscription)

    } catch (e: any) { setError(e.message) }
    setAnalyzing(false); setProgress('')
  }

  const generateDiff = async (issue: any) => {
    const id = issue.id
    setDiffs(d => ({ ...d, [id]: { loading: true } }))
    try {
      const raw = await callLLM(
        DIFF_PROMPT(issue, fetchedCode),
        'You generate precise code fixes. Return only valid JSON, no markdown.'
      )
      const parsed = parseLLMResponse(raw)
      setDiffs(d => ({ ...d, [id]: { loading: false, data: parsed } }))
    } catch {
      setDiffs(d => ({ ...d, [id]: { loading: false, error: 'Could not generate diff' } }))
    }
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(c => ({ ...c, [key]: true }))
    setTimeout(() => setCopied(c => ({ ...c, [key]: false })), 2000)
  }

  const shareReport = () => {
    if (!savedId) return
    const url = `${window.location.origin}/report/${savedId}`
    navigator.clipboard.writeText(url)
    setShareMsg('Link copied to clipboard!')
    setTimeout(() => setShareMsg(''), 3000)
  }

  const signOut = async () => { await supabase.auth.signOut() }

  const scoreColor = result ? (result.score >= 75 ? C.accent : result.score >= 50 ? C.warn : C.danger) : C.muted
  const counts = { critical: 0, warning: 0, pass: 0 } as Record<string, number>
  result?.issues?.forEach((i: any) => counts[i.severity]++)
  const proUser = isPro(subscription)

  const handleUpgrade = async (plan: 'pro' | 'team') => {
    try {
      const res = await fetch('/api/paystack/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          email: user.email,
          userId: user.id,
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(`Payment error: ${data.error}`)
    } catch (e: any) {
      alert(`Error: ${e.message}`)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px',
    padding: '12px 14px', color: C.text, fontFamily: "'Share Tech Mono', monospace",
    fontSize: '13px', outline: 'none', transition: 'border-color 0.2s',
  }

  const card = {
    background: 'linear-gradient(135deg, #0d0d12 0%, #111118 100%)',
    border: '1px solid ' + C.border,
    borderRadius: 12,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif", position: 'relative' }}>
      <div style={{ position: 'fixed', width: '800px', height: '800px', background: 'radial-gradient(circle at 50% 40%, rgba(0,255,136,0.04) 0%, rgba(0,150,255,0.015) 40%, transparent 70%)', top: '30%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{
        borderBottom: '1px solid ' + C.border, padding: '14px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(13,13,18,0.92)', backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <span style={{ fontSize: '20px' }}>⚡</span>
          <span style={{ color: C.accent, fontSize: '18px', fontWeight: 700, letterSpacing: '0.05em', fontFamily: "'Share Tech Mono', monospace" }}>AuditMe</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!proUser && (
            <button onClick={() => handleUpgrade('pro')}
              style={{ padding: '7px 14px', background: C.warnDim, color: C.warn, border: '1px solid rgba(255,209,102,0.3)', borderRadius: '6px', fontFamily: "'Share Tech Mono', monospace", fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,209,102,0.18)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = C.warnDim; e.currentTarget.style.transform = 'translateY(0)' }}>
              ⚡ Upgrade to Pro
            </button>
          )}
          {proUser && (
            <span style={{ fontSize: '11px', color: C.accent, background: C.accentDim, padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(0,255,136,0.2)', fontFamily: "'Share Tech Mono', monospace" }}>
              ✓ PRO
            </span>
          )}
          {savedId && (
            isPro(subscription) ? (
              <button onClick={shareReport} style={{ padding: '7px 14px', background: C.accentDim, color: C.accent, border: '1px solid rgba(0,255,136,0.25)', borderRadius: '6px', fontFamily: "'Share Tech Mono', monospace", fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,136,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.background = C.accentDim }}>
                {shareMsg || '🔗 Share Report'}
              </button>
            ) : (
              <button onClick={() => handleUpgrade('pro')} style={{ padding: '7px 14px', background: 'transparent', color: C.muted, border: '1px solid ' + C.border, borderRadius: '6px', fontFamily: "'Share Tech Mono', monospace", fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s' }}>
                🔒 Share (Pro)
              </button>
            )
          )}
          {saving && <span style={{ fontSize: '11px', color: C.muted, fontFamily: "'Share Tech Mono', monospace" }}>▋ saving...</span>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user?.user_metadata?.avatar_url && (
              <img src={user.user_metadata.avatar_url} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid ' + C.border }} />
            )}
            <span style={{ fontSize: '12px', color: C.muted }}>{user?.user_metadata?.user_name || user?.email?.split('@')[0]}</span>
            <button onClick={signOut} style={{ padding: '5px 10px', background: 'transparent', color: C.muted, border: '1px solid ' + C.border, borderRadius: '6px', fontFamily: "'Share Tech Mono', monospace", fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = C.danger; e.currentTarget.style.borderColor = C.danger + '44' }}
              onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border }}>
              out
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 20px', position: 'relative' }}>

        {/* GitHub banner */}
        {!isGithubConnected && (
          <div style={{ ...card, padding: '14px 20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', borderLeft: '3px solid ' + C.warn }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,209,102,0.4)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none' }}>
            <div>
              <div style={{ fontSize: '13px', color: C.warn, fontWeight: 600, marginBottom: '2px', fontFamily: "'Share Tech Mono', monospace" }}>🐙 Connect GitHub for private repos</div>
              <div style={{ fontSize: '12px', color: C.muted }}>Public repos work without auth.</div>
            </div>
            <button onClick={async () => supabase.auth.signInWithOAuth({ provider: 'github', options: { scopes: 'read:user repo', redirectTo: 'https://auditme.will-tech.site/audit' } })}
              style={{ padding: '8px 16px', background: C.warnDim, color: C.warn, border: '1px solid rgba(255,209,102,0.3)', borderRadius: '6px', fontFamily: "'Share Tech Mono', monospace", fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,209,102,0.18)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = C.warnDim; e.currentTarget.style.transform = 'translateY(0)' }}>
              Connect GitHub
            </button>
          </div>
        )}
        {/* Free tier counter */}
        {!isPro(subscription) && (
          <div style={{ marginTop: '10px', marginBottom: '20px', fontSize: '11px', color: C.muted, textAlign: 'center', fontFamily: "'Share Tech Mono', monospace" }}>
            {(() => {
              const now = new Date()
              const resetDate = subscription ? new Date(subscription.audit_count_reset) : null
              const sameMonth = resetDate && now.getMonth() === resetDate.getMonth()
              const count = sameMonth ? (subscription?.audit_count || 0) : 0
              const remaining = 3 - count
              return (
                <span style={{ color: remaining === 0 ? C.danger : remaining === 1 ? C.warn : C.muted }}>
                  {remaining === 0
                    ? '⚠ Free limit reached — '
                    : `${remaining}/3 free audits remaining this month — `}
                  <span onClick={() => handleUpgrade('pro')} style={{ color: C.accent, cursor: 'pointer', textDecoration: 'underline' }}>
                    Upgrade to Pro
                  </span>
                </span>
              )
            })()}
          </div>
        )}

        {/* Config card */}
        <div style={{ ...card, padding: '28px', marginBottom: '24px' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,136,0.15)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none' }}>

          {/* Mode toggle */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '10px', color: C.muted, letterSpacing: '0.1em', marginBottom: '10px', fontFamily: "'Share Tech Mono', monospace" }}>INPUT METHOD</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['github', 'upload'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  padding: '8px 18px', border: `1px solid ${mode === m ? C.accent : C.border}`, borderRadius: '8px',
                  background: mode === m ? C.accentDim : 'transparent',
                  color: mode === m ? C.accent : C.muted,
                  fontFamily: "'Share Tech Mono', monospace", fontSize: '12px', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { if (mode !== m) { e.currentTarget.style.borderColor = C.muted; e.currentTarget.style.color = C.text } }}
                  onMouseLeave={e => { if (mode !== m) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted } }}>
                  {m === 'github' ? '🐙 GitHub URL' : '📁 Upload File'}
                </button>
              ))}
            </div>
          </div>

          {mode === 'github' ? (
            <div>
              <input type="text" placeholder="https://github.com/username/repository" value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && analyze()} style={inp}
                onFocus={e => e.currentTarget.style.borderColor = C.accent}
                onBlur={e => e.currentTarget.style.borderColor = C.border} />
              <div style={{ fontSize: '11px', color: C.muted, marginTop: '6px', fontFamily: "'Share Tech Mono', monospace" }}>
                {isGithubConnected ? '✓ Private repos supported' : 'Public repos only — connect GitHub for private'}
              </div>
            </div>
          ) : (
            <div onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${C.border}`, borderRadius: '10px', padding: '32px', textAlign: 'center',
                cursor: 'pointer', background: C.bg, transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = C.accentDim }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bg }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
              <div style={{ fontSize: '13px', color: fileName ? C.accent : C.muted, fontFamily: "'Share Tech Mono', monospace" }}>{fileName || 'Click to upload (.js .ts .py .json .yaml)'}</div>
              <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFile} accept=".js,.ts,.jsx,.tsx,.py,.go,.txt,.env,.json,.yaml,.yml" />
            </div>
          )}

          <button onClick={analyze} disabled={analyzing}
            style={{
              width: '100%', marginTop: '18px', padding: '15px',
              background: analyzing ? C.border : C.accent,
              color: analyzing ? C.muted : C.bg,
              border: 'none', borderRadius: '8px',
              fontFamily: "'Share Tech Mono', monospace", fontSize: '14px', fontWeight: 700,
              letterSpacing: '0.08em', cursor: analyzing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: analyzing ? 'none' : '0 4px 20px rgba(0,255,136,0.2)',
            }}
            onMouseEnter={e => { if (!analyzing) { e.currentTarget.style.background = '#00cc6a'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,255,136,0.3)' } }}
            onMouseLeave={e => { if (!analyzing) { e.currentTarget.style.background = C.accent; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,255,136,0.2)' } }}>
            {analyzing ? `▋ ${progress || 'Analyzing...'}` : '⚡ AUDIT THIS CODE'}
          </button>

          {error && <div style={{ marginTop: '14px', padding: '12px 16px', background: C.dangerDim, border: '1px solid rgba(255,61,61,0.2)', borderRadius: '8px', fontSize: '12px', color: C.danger, fontFamily: "'Share Tech Mono', monospace" }}>⚠ {error}</div>}
        </div>

        {/* Results */}
        {result && (
          <div>
            {/* Score */}
            <div style={{
              ...card, padding: '28px', marginBottom: '16px',
              display: 'flex', alignItems: 'center', gap: '24px',
              borderLeft: '4px solid ' + scoreColor,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = scoreColor + '88'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{ textAlign: 'center', minWidth: '90px' }}>
                <div style={{ fontSize: '56px', fontWeight: 700, color: scoreColor, lineHeight: 1, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.02em' }}>{result.score}</div>
                <div style={{ fontSize: '10px', color: C.muted, marginTop: '2px', fontFamily: "'Share Tech Mono', monospace" }}>/ 100</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', color: C.muted, letterSpacing: '0.1em', marginBottom: '6px', fontFamily: "'Share Tech Mono', monospace" }}>PRODUCTION READINESS SCORE</div>
                <div style={{ fontSize: '13px', color: C.text, lineHeight: 1.65, marginBottom: '14px' }}>{result.summary}</div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {(['critical', 'warning', 'pass'] as const).map(s => (
                    <div key={s} style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                      <span style={{ fontSize: '22px', fontWeight: 700, color: SEV[s].color, fontFamily: "'Bebas Neue', sans-serif" }}>{counts[s]}</span>
                      <span style={{ fontSize: '11px', color: C.muted, textTransform: 'capitalize', fontFamily: "'Share Tech Mono', monospace" }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {result.topPriority && (
              <div style={{ background: C.dangerDim, border: '1px solid rgba(255,61,61,0.2)', borderRadius: '8px', padding: '14px 18px', marginBottom: '16px', fontSize: '13px', display: 'flex', gap: '10px' }}>
                <span>🚨</span>
                <div><span style={{ color: C.danger, fontWeight: 600, fontFamily: "'Share Tech Mono', monospace" }}>Fix first: </span><span>{result.topPriority}</span></div>
              </div>
            )}

            <div style={{ fontSize: '10px', color: C.muted, letterSpacing: '0.1em', marginBottom: '12px', fontFamily: "'Share Tech Mono', monospace" }}>ALL FINDINGS — click to expand</div>

            {(['critical', 'warning', 'pass'] as const).map(sev =>
              result.issues?.filter((i: any) => i.severity === sev).map((issue: any) => {
                const isOpen = expandedIssue === issue.id
                const diff = diffs[issue.id]
                const s = SEV[sev]
                return (
                  <div key={issue.id} style={{ marginBottom: '8px' }}>
                    <div onClick={() => setExpandedIssue(isOpen ? null : issue.id)}
                      style={{
                        background: C.surface, border: `1px solid ${isOpen ? s.color + '55' : C.border}`,
                        borderLeft: `4px solid ${s.color}`,
                        borderRadius: isOpen ? '10px 10px 0 0' : '10px',
                        padding: '14px 18px', cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { if (!isOpen) { e.currentTarget.style.borderColor = s.color + '33'; e.currentTarget.style.background = '#11111a' } }}
                      onMouseLeave={e => { if (!isOpen) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface } }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span>{s.icon}</span>
                          <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: "'Share Tech Mono', monospace" }}>{issue.title}</span>
                          <span style={{ fontSize: '10px', padding: '2px 8px', background: s.bg, color: s.color, borderRadius: '4px', fontFamily: "'Share Tech Mono', monospace" }}>{issue.category}</span>
                          {issue.affectedFile && issue.affectedFile !== 'general' && (
                            <span style={{ fontSize: '10px', color: C.muted, fontStyle: 'italic', fontFamily: "'Share Tech Mono', monospace" }}>{issue.affectedFile}</span>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: C.muted, transition: 'transform 0.2s' }}>{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{ background: C.surface2, border: '1px solid ' + s.color + '33', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '20px' }}>
                        <div style={{ fontSize: '13px', color: C.muted, lineHeight: 1.7, marginBottom: '16px' }}>{issue.description}</div>

                        {issue.diffBefore && issue.diffAfter && (
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '10px', color: C.muted, letterSpacing: '0.08em', marginBottom: '8px', fontFamily: "'Share Tech Mono', monospace" }}>QUICK PREVIEW</div>
                            <div style={{ background: C.bg, borderRadius: '8px', border: '1px solid ' + C.border, overflow: 'hidden', fontSize: '12px' }}>
                              <div style={{ padding: '6px 12px', borderBottom: '1px solid ' + C.border, fontSize: '10px', color: C.muted, display: 'flex', gap: '14px', fontFamily: "'Share Tech Mono', monospace" }}>
                                <span style={{ color: C.danger }}>− before</span><span style={{ color: C.accent }}>+ after</span>
                              </div>
                              <div style={{ padding: '8px 0', fontFamily: "'Share Tech Mono', monospace" }}>
                                {issue.diffBefore.split('\n').map((l: string, i: number) => <span key={i} style={{ display: 'block', padding: '1px 12px', background: 'rgba(255,61,61,0.06)', color: '#ff8888' }}>− {l}</span>)}
                                {issue.diffAfter.split('\n').map((l: string, i: number) => <span key={i} style={{ display: 'block', padding: '1px 12px', background: 'rgba(0,255,136,0.06)', color: '#88ffcc' }}>+ {l}</span>)}
                              </div>
                            </div>
                          </div>
                        )}

                        <div style={{ background: C.bg, borderRadius: '8px', padding: '14px 16px', border: '1px solid ' + C.border, marginBottom: '16px' }}>
                          <div style={{ fontSize: '10px', color: C.accent, letterSpacing: '0.08em', marginBottom: '6px', fontFamily: "'Share Tech Mono', monospace" }}>💡 HOW TO FIX</div>
                          <div style={{ fontSize: '12px', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: "'Share Tech Mono', monospace" }}>{issue.fix}</div>
                        </div>

                        {!diff && (
                          isPro(subscription) ? (
                            <button onClick={() => generateDiff(issue)} style={{ padding: '9px 18px', background: C.accentDim, color: C.accent, border: '1px solid rgba(0,255,136,0.3)', borderRadius: '8px', fontFamily: "'Share Tech Mono', monospace", fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,136,0.15)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                              onMouseLeave={e => { e.currentTarget.style.background = C.accentDim; e.currentTarget.style.transform = 'translateY(0)' }}>
                              🔧 Generate Copy-Ready Diff
                            </button>
                          ) : (
                            <div style={{ padding: '14px 18px', background: C.warnDim, border: '1px solid rgba(255,209,102,0.2)', borderRadius: '8px', fontSize: '12px', color: C.warn, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Share Tech Mono', monospace" }}>
                              <span>🔒 Copy-ready diffs are a Pro feature</span>
                              <button onClick={() => handleUpgrade('pro')} style={{ padding: '5px 14px', background: C.warn, color: C.bg, border: 'none', borderRadius: '6px', fontFamily: "'Share Tech Mono', monospace", fontSize: '11px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                Upgrade →
                              </button>
                            </div>
                          )
                        )}
                        {diff?.loading && <div style={{ fontSize: '12px', color: C.muted, fontFamily: "'Share Tech Mono', monospace" }}>▋ Generating fix...</div>}
                        {diff?.error && <div style={{ fontSize: '12px', color: C.danger, fontFamily: "'Share Tech Mono', monospace" }}>{diff.error}</div>}

                        {diff?.data && (
                          <div style={{ marginTop: '4px' }}>
                            <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: '8px', padding: '14px 16px', marginBottom: '12px' }}>
                              <div style={{ fontSize: '10px', color: C.accent, marginBottom: '8px', fontFamily: "'Share Tech Mono', monospace" }}>📋 PR INFO</div>
                              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px', fontFamily: "'Share Tech Mono', monospace" }}>{diff.data.prTitle}</div>
                              <div style={{ fontSize: '12px', color: C.muted, lineHeight: 1.6, marginBottom: '10px' }}>{diff.data.prDescription}</div>
                              <button onClick={() => copy(`${diff.data.prTitle}\n\n${diff.data.prDescription}`, `pr_${issue.id}`)} style={{ padding: '5px 12px', fontSize: '11px', background: 'transparent', color: C.muted, border: '1px solid ' + C.border, borderRadius: '6px', fontFamily: "'Share Tech Mono', monospace", cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = C.accent + '44'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                                {copied[`pr_${issue.id}`] ? '✓ Copied!' : 'Copy PR text'}
                              </button>
                            </div>

                            {[['before', '− REMOVE THIS', C.danger, 'rgba(255,61,61,0.06)', '#ff8888'], ['after', '+ REPLACE WITH', C.accent, 'rgba(0,255,136,0.06)', '#88ffcc']].map(([key, label, col, bg, tc]) => (
                              <div key={key} style={{ marginBottom: '10px' }}>
                                <div style={{ fontSize: '10px', color: col as string, letterSpacing: '0.07em', marginBottom: '6px', fontFamily: "'Share Tech Mono', monospace" }}>{label}</div>
                                <div style={{ position: 'relative' }}>
                                  <pre style={{ background: bg as string, border: '1px solid ' + (col as string) + '33', borderRadius: '8px', padding: '14px 16px', fontSize: '12px', overflowX: 'auto', color: tc as string, lineHeight: 1.6, margin: 0, fontFamily: "'Share Tech Mono', monospace" }}>
                                    {(diff.data as any)[key as string]}
                                  </pre>
                                  <button onClick={() => copy((diff.data as any)[key as string], `${key as string}_${issue.id}`)} style={{ position: 'absolute', top: '10px', right: '10px', padding: '4px 10px', fontSize: '10px', background: C.bg, color: C.muted, border: '1px solid ' + C.border, borderRadius: '6px', cursor: 'pointer', fontFamily: "'Share Tech Mono', monospace" }}>
                                    {copied[`${key as string}_${issue.id}`] ? '✓' : 'Copy'}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}

            <button onClick={() => { setResult(null); setError(''); setDiffs({}); setSavedId(null) }}
              style={{ marginTop: '20px', padding: '10px 20px', background: 'transparent', color: C.muted, border: '1px solid ' + C.border, borderRadius: '8px', fontFamily: "'Share Tech Mono', monospace", fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent + '44'; e.currentTarget.style.color = C.accent }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted }}>
              ← Analyze another repo
            </button>
          </div>
        )}

        {!result && !analyzing && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: C.muted }}>
            <div style={{ fontSize: '48px', marginBottom: '14px', opacity: 0.5 }}>🔍</div>
            <div style={{ fontSize: '15px', marginBottom: '8px', color: C.text, fontFamily: "'DM Sans', sans-serif" }}>Paste a GitHub URL or upload your code</div>
            <div style={{ fontSize: '12px', fontFamily: "'Share Tech Mono', monospace" }}>AuditMe finds every issue before your users do</div>
          </div>
        )}
      </div>
    </div>
  )
}
