import type { Finding } from './checks.js'

const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const GREEN = '\x1b[32m'
const CYAN = '\x1b[36m'
const RESET = '\x1b[0m'

export function formatScore(score: number): string {
  const color = score >= 75 ? GREEN : score >= 50 ? YELLOW : RED
  return `${BOLD}${color}Score: ${score}/100${RESET}`
}

export function formatFindings(findings: Finding[]): string {
  if (findings.length === 0) {
    return `  ${GREEN}✓${RESET} No issues found\n`
  }

  const byFile = new Map<string, Finding[]>()
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, [])
    byFile.get(f.file)!.push(f)
  }

  let out = ''
  for (const [file, issues] of byFile) {
    out += `\n${BOLD}${file}${RESET}\n`
    for (const issue of issues) {
      const icon = issue.severity === 'error' ? `${RED}✗${RESET}` : issue.severity === 'warning' ? `${YELLOW}⚠${RESET}` : `${CYAN}ℹ${RESET}`
      const sevLabel = issue.severity === 'error' ? `${RED}ERROR${RESET}` : issue.severity === 'warning' ? `${YELLOW}WARN${RESET}` : `${CYAN}INFO${RESET}`
      out += `  ${icon} ${sevLabel} ${issue.message} ${DIM}(line ${issue.line}:${issue.column})${RESET}\n`
    }
  }

  return out
}

export function formatAuditResult(result: any): string {
  const score = result.score ?? 0
  const lines = [
    '',
    `  ${'='.repeat(50)}`,
    `  ${formatScore(score)}`,
    `  ${DIM}${result.summary || ''}${RESET}`,
    `  ${'='.repeat(50)}`,
  ]

  if (result.topPriority) {
    lines.push(`  ${RED}🚨 Priority: ${result.topPriority}${RESET}`)
    lines.push(`  ${'='.repeat(50)}`)
  }

  const issues = result.issues || []
  if (issues.length > 0) {
    lines.push(`  ${BOLD}Issues (${issues.length} found):${RESET}`)
    for (const issue of issues) {
      const icon = issue.severity === 'critical' ? `${RED}🔴${RESET}` : issue.severity === 'warning' ? `${YELLOW}🟡${RESET}` : `${GREEN}🟢${RESET}`
      const file = issue.affectedFile ? ` ${DIM}(${issue.affectedFile})${RESET}` : ''
      lines.push(`  ${icon} ${BOLD}${issue.title}${RESET}${file}`)
      lines.push(`    ${DIM}${issue.description}${RESET}`)
      if (issue.fix) lines.push(`    ${CYAN}Fix:${RESET} ${DIM}${issue.fix}${RESET}`)
      if (issue.diffAfter) lines.push(`    ${GREEN}→${RESET} ${DIM}${issue.diffAfter}${RESET}`)
      lines.push('')
    }
  }

  lines.push(`  ${'='.repeat(50)}\n`)
  return lines.join('\n')
}

export function dim(s: string): string {
  return `${DIM}${s}${RESET}`
}
