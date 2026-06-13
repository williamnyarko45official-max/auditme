import { NextRequest, NextResponse } from 'next/server'

const ipLimit = new Map<string, { count: number; resetAt: number }>()
const IP_RATE_LIMIT = 5
const IP_RATE_WINDOW = 60 * 60 * 1000

const githubUrlPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/

const QUICK_PROMPT = `You are AuditMe. Analyze this code for production readiness.
Return ONLY valid JSON (no markdown, no backticks):
{
  "score": <0-100>,
  "summary": "<1 sentence>",
  "issues": [{
    "severity": "<critical|warning|pass>",
    "title": "<short title>",
    "description": "<1 sentence>"
  }],
  "topPriority": "<most important fix>"
}
Keep issues to max 5. Keep descriptions short.`

async function fetchGithubCode(url: string): Promise<string> {
  const match = url.match(/github\.com\/([^/]+)\/([^/?#]+)/)
  if (!match) throw new Error('Invalid GitHub URL')
  const [, owner, repo] = match

  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`
  )
  if (!treeRes.ok)
    throw new Error(treeRes.status === 404 ? 'Repo not found or private' : 'GitHub API error')

  const tree = await treeRes.json()
  const important = ['package.json','requirements.txt','.env.example','Dockerfile','docker-compose.yml','.gitignore']
  const codeExts = ['.js','.ts','.jsx','.tsx','.py','.go','.env']
  const skipDirs = ['node_modules','.git','dist','build','.next','vendor','__pycache__']

  const files = (tree.tree || [])
    .filter((f: any) => f.type === 'blob' && !skipDirs.some((d: string) => f.path.includes(d)))
    .filter((f: any) => important.some(i => f.path.endsWith(i)) || codeExts.some(e => f.path.endsWith(e)))
    .slice(0, 14)

  let combined = `# Repo: ${owner}/${repo}\n\n`
  for (const f of files) {
    try {
      const r = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${f.path}`)
      if (r.ok) combined += `\n## ${f.path}\n\`\`\`\n${(await r.text()).slice(0, 2500)}\n\`\`\`\n`
    } catch {}
  }
  return combined
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const entry = ipLimit.get(ip)
    const now = Date.now()
    if (entry && now < entry.resetAt) {
      if (entry.count >= IP_RATE_LIMIT) {
        return NextResponse.json({ error: 'Rate limit. Try again later.' }, { status: 429 })
      }
      entry.count++
    } else {
      ipLimit.set(ip, { count: 1, resetAt: now + IP_RATE_WINDOW })
    }

    const { url } = await req.json()
    if (!url || typeof url !== 'string' || !githubUrlPattern.test(url.trim())) {
      return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 })
    }

    const code = await fetchGithubCode(url.trim())

    if (code.length < 50) {
      return NextResponse.json({ error: 'No analyzable files found in that repo.' }, { status: 400 })
    }

    const nvRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-ultra',
        messages: [
          { role: 'system', content: QUICK_PROMPT },
          { role: 'user', content: `Repo: ${url}\n\nCode:\n${code.slice(0, 50000)}` },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    })

    if (!nvRes.ok) {
      const e = await nvRes.json()
      throw new Error(e.error?.message || 'NVIDIA API error')
    }

    const nvData = await nvRes.json()
    const raw = nvData.choices[0].message.content
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    return NextResponse.json({
      score: result.score,
      summary: result.summary,
      topPriority: result.topPriority,
      issues: (result.issues || []).slice(0, 5),
    })

  } catch (e: any) {
    console.error('Quick scan error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
