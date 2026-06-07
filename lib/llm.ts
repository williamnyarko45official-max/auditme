export const SYSTEM_PROMPT = `You are AuditMe — a senior DevOps and security engineer.
Return ONLY valid JSON (no markdown, no backticks):
{
  "score": <0-100>,
  "summary": "<2 sentence summary>",
  "issues": [{
    "id": "<unique id>",
    "category": "<Security|Error Handling|Environment Config|Performance|Dependencies|Code Quality>",
    "severity": "<critical|warning|pass>",
    "title": "<short title>",
    "description": "<plain English explanation>",
    "fix": "<concrete fix with example>",
    "affectedFile": "<filename or general>",
    "diffBefore": "<problematic snippet max 8 lines>",
    "diffAfter": "<fixed snippet max 8 lines>"
  }],
  "topPriority": "<most important thing to fix>"
}`

export async function callClaude(userMsg: string, systemMsg: string): Promise<string> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userMsg, systemMsg }),
  })
  if (!res.ok) {
    const e = await res.json()
    throw new Error(e.error || 'Claude API error')
  }
  const data = await res.json()
  return data.result
}

export async function callGroq(userMsg: string, systemMsg: string, groqKey: string): Promise<string> {
  const res = await fetch('/api/groq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userMsg, systemMsg, groqKey }),
  })
  if (!res.ok) {
    const e = await res.json()
    throw new Error(e.error || 'Groq API error')
  }
  const data = await res.json()
  return data.result
}

export function parseLLMResponse(raw: string) {
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}