const SECRET_PATTERNS = [
  { re: /(['"])sk_live_[A-Za-z0-9]{20,}\1/g, label: 'Stripe live secret key', sev: 'error' },
  { re: /(['"])sk_test_[A-Za-z0-9]{20,}\1/g, label: 'Stripe test secret key', sev: 'warning' },
  { re: /(['"])pk_live_[A-Za-z0-9]{20,}\1/g, label: 'Stripe live publishable key', sev: 'warning' },
  { re: /(['"])AKIA[0-9A-Z]{16}\1/g, label: 'AWS access key ID', sev: 'error' },
  { re: /(['"])ghp_[A-Za-z0-9]{36}\1/g, label: 'GitHub personal access token', sev: 'error' },
  { re: /(['"])gho_[A-Za-z0-9]{36}\1/g, label: 'GitHub OAuth access token', sev: 'error' },
  { re: /(['"])xox[bpsa]-[A-Za-z0-9-]{10,}\1/g, label: 'Slack token', sev: 'error' },
  { re: /(['"])nvapi-[A-Za-z0-9_-]{30,}\1/g, label: 'NVIDIA API key', sev: 'error' },
  { re: /password\s*[:=]\s*['"][^'"]+['"]/gi, label: 'Hardcoded password', sev: 'error' },
  { re: /secret\s*[:=]\s*['"][^'"]+['"]/gi, label: 'Hardcoded secret', sev: 'error' },
  { re: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, label: 'Hardcoded API key', sev: 'error' },
  { re: /token\s*[:=]\s*['"][A-Za-z0-9_-]{20,}['"]/g, label: 'Hardcoded token', sev: 'error' },
]

const CODE_SMELLS = [
  { re: /\bconsole\.log\s*\(/g, label: 'console.log left in production code', sev: 'warning' },
  { re: /\bconsole\.error\s*\(/g, label: 'console.error — use proper error logging instead', sev: 'info' },
  { re: /\bTODO\b/g, label: 'Unresolved TODO', sev: 'info' },
  { re: /\bFIXME\b/g, label: 'Unresolved FIXME', sev: 'warning' },
  { re: /\bHACK\b/g, label: 'Hack/workaround in code', sev: 'warning' },
  { re: /\bXXX\b/g, label: 'Marked issue in code', sev: 'info' },
  { re: /\.only\s*\(/g, label: 'test.only left in test suite', sev: 'warning' },
  { re: /debugger\s*;/g, label: 'debugger statement left in code', sev: 'error' },
  { re: /eslint-disable-next-line/g, label: 'eslint disable — consider fixing instead', sev: 'info' },
  { re: /@ts-ignore/g, label: '@ts-ignore suppresses type errors', sev: 'warning' },
  { re: /@ts-expect-error/g, label: '@ts-expect-error — verify still needed', sev: 'info' },
]

const IMPORT_SMELLS = [
  { re: /from\s+['"]\.\.\/\.\.\/\.\.\//g, label: 'Deep relative import — consider alias', sev: 'info' },
  { re: /import\s+\*\s+from/g, label: 'Namespace import — tree-shakeable?', sev: 'info' },
]

export interface Finding {
  file: string
  line: number
  column: number
  message: string
  severity: 'error' | 'warning' | 'info'
  length: number
}

export function runLocalChecks(filePath: string, text: string): Finding[] {
  const results: Finding[] = []
  const lines = text.split('\n')
  const allRules = [...SECRET_PATTERNS, ...CODE_SMELLS, ...IMPORT_SMELLS]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    for (const rule of allRules) {
      rule.re.lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = rule.re.exec(line)) !== null) {
        const idx = line.indexOf(match[0])
        results.push({
          file: filePath,
          line: i + 1,
          column: idx,
          message: rule.label,
          severity: rule.sev as any,
          length: match[0].length,
        })
      }
    }
  }

  return results
}
