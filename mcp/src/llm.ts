const NVIDIA_API_URL = 'https://ai.api.nvidia.com/v1/llm/llama-3_3-nemotron-super-49b-v1'

const SYSTEM_PROMPT = `You are AuditMe — a senior DevOps and security engineer.
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

export async function callNvidia(userMsg: string): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey) throw new Error('NVIDIA_API_KEY not set')

  const res = await fetch(NVIDIA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMsg },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`NVIDIA API error (${res.status}): ${text}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

export function parseLLMResponse(raw: string) {
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
