export async function fetchGithubCode(url: string, onProgress?: (msg: string) => void): Promise<string> {
  const allowedPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/
  if (!allowedPattern.test(url.trim())) {
    throw new Error('Invalid GitHub URL. Format: https://github.com/username/repo')
  }

  const match = url.match(/github\.com\/([^/]+)\/([^/?#]+)/)
  if (!match) throw new Error('Invalid GitHub URL')
  const [, owner, repo] = match

  onProgress?.('Fetching repository tree...')

  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`
  )
  if (!treeRes.ok) {
    throw new Error(treeRes.status === 404 ? 'Repo not found or private' : 'GitHub API error')
  }

  const tree = await treeRes.json()

  const important = ['package.json','requirements.txt','.env.example','Dockerfile','docker-compose.yml','.gitignore']
  const codeExts = ['.js','.ts','.jsx','.tsx','.py','.go','.env']
  const skipDirs = ['node_modules','.git','dist','build','.next','vendor','__pycache__']

  const files = (tree.tree || [])
    .filter((f: any) => f.type === 'blob' && !skipDirs.some((d: string) => f.path.includes(d)))
    .filter((f: any) => important.some(i => f.path.endsWith(i)) || codeExts.some(e => f.path.endsWith(e)))
    .slice(0, 18)

  onProgress?.(`Reading ${files.length} files...`)

  let combined = `# Repo: ${owner}/${repo}\n\n`
  for (const f of files.slice(0, 14)) {
    try {
      const r = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${f.path}`
      )
      if (r.ok) {
        combined += `\n## ${f.path}\n\`\`\`\n${(await r.text()).slice(0, 2500)}\n\`\`\`\n`
      }
    } catch {}
  }

  return combined
}
