'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { use } from 'react'

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('audits')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setError('Report not found')
        else setReport(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div style={{ minHeight: '100vh', background: '#060608', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555570', fontFamily: 'monospace' }}>▋ loading report...</div>
  if (error) return <div style={{ minHeight: '100vh', background: '#060608', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff3d3d', fontFamily: 'monospace' }}>⚠ {error}</div>

  const result = report.result
  const scoreColor = result.score >= 75 ? '#00ff88' : result.score >= 50 ? '#ffd166' : '#ff3d3d'

  return (
    <div style={{ minHeight: '100vh', background: '#060608', color: '#dde1f0', fontFamily: 'monospace', padding: '48px 24px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ color: '#00ff88', fontSize: '18px', marginBottom: '4px' }}>⚡ AuditMe Report</div>
          <div style={{ color: '#555570', fontSize: '12px' }}>{report.repo_url} · {new Date(report.created_at).toLocaleDateString()}</div>
        </div>

        <div style={{ background: '#0d0d12', border: `1px solid ${scoreColor}44`, borderRadius: '12px', padding: '28px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ fontSize: '56px', fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{result.score}</div>
          <div>
            <div style={{ fontSize: '11px', color: '#555570', letterSpacing: '0.1em', marginBottom: '6px' }}>PRODUCTION READINESS SCORE</div>
            <div style={{ fontSize: '14px', color: '#dde1f0', lineHeight: 1.65 }}>{result.summary}</div>
          </div>
        </div>

        {result.issues?.map((issue: any) => (
          <div key={issue.id} style={{ background: '#0d0d12', border: '1px solid #1a1a28', borderLeft: `3px solid ${issue.severity === 'critical' ? '#ff3d3d' : issue.severity === 'warning' ? '#ffd166' : '#00ff88'}`, borderRadius: '6px', padding: '16px 20px', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{issue.title}</div>
            <div style={{ fontSize: '12px', color: '#555570', lineHeight: 1.6, marginBottom: '8px' }}>{issue.description}</div>
            <div style={{ fontSize: '12px', color: '#00ff88' }}>Fix: {issue.fix}</div>
          </div>
        ))}

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <a href="/audit" style={{ color: '#00ff88', fontSize: '12px', textDecoration: 'none' }}>⚡ Audit your own repo at AuditMe</a>
        </div>
      </div>
    </div>
  )
}