'use client'
import Link from 'next/link'

const C = {
  bg: '#060608', surface: '#0d0d12', surface2: '#111118',
  border: '#1a1a28', accent: '#00ff88', accentDim: 'rgba(0,255,136,0.08)',
  text: '#dde1f0', muted: '#555570',
}

const cardHover = {
  background: 'linear-gradient(135deg, #0d0d12 0%, #111118 100%)',
  border: '1px solid ' + C.border,
  borderRadius: 12,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  padding: 28,
  marginBottom: 16,
}

const codeBlock = (code: string) => (
  <div style={{
    background: C.bg, border: '1px solid ' + C.border, borderRadius: 8,
    padding: '14px 16px', fontFamily: "'Share Tech Mono', monospace", fontSize: 12,
    lineHeight: 1.7, whiteSpace: 'pre', overflow: 'auto', color: C.muted, margin: '12px 0',
  }}>{code}</div>
)

const sectionHeader = (text: string) => (
  <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.accent, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ width: 20, height: 2, background: C.accent, display: 'inline-block' }} />
    {text}
  </h2>
)

const sections = [
  {
    title: 'Philosophy',
    body: [
      'AuditMe exists because the way we build software has changed. AI coding agents generate code at unprecedented speed, but they also introduce the same mistakes humans do — hardcoded secrets, missing error handling, debug artifacts, and insecure configurations — just faster.',
      'Traditional code review cannot keep pace with AI-generated code. AuditMe fills the gap by embedding production-readiness analysis directly into your development workflow:',
      '  • At the agent level — your AI coding tool calls AuditMe as a native MCP tool while it writes code',
      '  • At the editor level — inline diagnostics catch issues as you type',
      '  • At the terminal level — CLI commands for CI/CD and local development',
      '  • At the browser level — on-demand audits of any public repository',
      '',
      'Every surface uses the same NVIDIA Nemotron-3-Ultra engine for deep analysis, plus instant local regex checks that need zero API calls. Everything is free and open source.',
    ],
  },
  {
    title: 'Architecture Overview',
    body: [
      'AuditMe is organized as four independent packages under the @auditme npm scope, plus a VS Code extension:',
      '',
      '@auditme/mcp — MCP server for AI coding agents',
      '  Provides three tools (audit_code, audit_file, audit_github) that your agent calls as native actions. Runs over stdio transport. Uses NVIDIA Nemotron for all analysis. Configurable via standard MCP environment variables.',
      '',
      '@auditme/lsp — LSP server for inline editor diagnostics',
      '  Implements the Language Server Protocol. Registers textDocument/didOpen and didChange handlers for instant local checks. Exposes two commands: auditme.runLocalChecks and auditme.fullAudit (when NVIDIA key is present). No external dependencies for the 65+ regex patterns covering secrets, code smells, and anti-patterns.',
      '',
      '@auditme/cli — Terminal interface',
      '  Four commands: scan (full NVIDIA audit of a GitHub repo), check (local regex checks on files), watch (file watcher with chokidar), init (config generation). Supports colored terminal output with severity-coded formatting.',
      '',
      'Web app — Browser-based audits',
      '  Next.js application with Supabase auth. Paste a GitHub URL for instant scoring. Full report history for authenticated users. IP-rate-limited anonymous quick scans.',
      '',
      'VS Code extension — Editor integration',
      '  Wraps the LSP check patterns and NVIDIA API in a VS Code extension. Inline diagnostics on file open/save. auditme.fullAudit command with progress indicator. Configurable API key via VS Code settings.',
    ],
  },
  {
    title: 'MCP Server — Agent Integration Deep Dive',
    body: [
      'The MCP server is the primary interface for AI coding agents. It registers three tools:',
      '',
      'audit_code — Analyze a raw code snippet',
      '  Input: code (string), context (optional filename/framework). Returns score, summary, all issues with severity, description, and suggested fix. Use when your agent generates code and wants immediate feedback.',
      '',
      'audit_file — Analyze a local file',
      '  Input: filePath (absolute path). Reads the file from disk and sends it for analysis. Use when your agent needs to audit an existing file in the workspace.',
      '',
      'audit_github — Analyze a public GitHub repository',
      '  Input: url (GitHub repo URL). Fetches up to 14 key files (package.json, Dockerfile, configs, and source code by extension) via the GitHub API. Use when onboarding to a new codebase or auditing a dependency.',
      '',
      'All three tools return structured results with score (0-100), summary, prioritized issues, affected file paths, and copy-ready fix suggestions.',
      '',
      'Tool output format:',
      codeBlock('**Score: 72/100**\nSolid baseline but has critical security issues.\n\n🚨 **Priority:** Remove hardcoded API key in /src/config.js\n\n**Issues (6 found):**\n- [CRITICAL] **Hardcoded API Key** — Stripe secret key found in source\n  _File:_ src/config.js\n  _Fix:_ Move to environment variable and use process.env.STRIPE_SECRET_KEY\n- [WARNING] **console.log** — Debug logging in production code\n  _File:_ src/api/checkout.js\n  _Fix:_ Replace with structured logger'),
    ],
  },
  {
    title: 'LSP Server — Editor Integration Deep Dive',
    body: [
      'The LSP server provides two tiers of analysis:',
      '',
      'Tier 1 — Local regex checks (zero API calls)',
      '  65+ patterns across four categories:',
      '  • Secrets: Stripe keys (live/test), AWS access keys, GitHub tokens, Slack tokens, NVIDIA keys, hardcoded passwords/secrets/API keys/tokens',
      '  • Code smells: console.log, console.error, TODO, FIXME, HACK, XXX, test.only, debugger, eslint-disable, @ts-ignore, @ts-expect-error',
      '  • Import issues: deep relative imports, namespace imports',
      '  • File-level patterns: async functions without try/catch (multi-line regex), .env references, direct process.env access',
      '',
      'Tier 2 — Full NVIDIA audit (on demand)',
      '  Command: auditme.fullAudit. Sends the entire file to NVIDIA Nemotron for deep analysis. Returns file-scoped diagnostics with score, issues, and inline fix suggestions. Requires NVIDIA_API_KEY in environment.',
      '',
      'Server capabilities:',
      '  • TextDocumentSyncKind.Full (sends entire document on change)',
      '  • Registered commands: auditme.runLocalChecks, auditme.fullAudit',
      '  • Diagnostics source: "auditme" for easy filtering',
      '  • Severity mapping: error -> DiagnosticSeverity.Error, warning -> Warning, info -> Information',
      '',
      'Configuration:',
      codeBlock('# Environment variables\nNVIDIA_API_KEY=nvapi-...  # Optional: enables full AI audits'),
    ],
  },
  {
    title: 'CLI Reference',
    body: [
      'The CLI package (@auditme/cli) provides four commands for terminal-based code analysis.',
      '',
      'auditme scan <url>',
      '  Full NVIDIA audit of a public GitHub repository. Fetches key files, sends them to Nemotron, and displays a formatted report with score, priority, and all issues.',
      '  Output: colored score (red < 50, yellow < 75, green >= 75), severity-coded issues, fix suggestions.',
      '  Requires: NVIDIA_API_KEY',
      '',
      'auditme check [files...]',
      '  Runs local regex checks on specified files. No API calls. Detects secrets, code smells, and anti-patterns. Groups findings by file with line numbers.',
      '  Output: per-file findings grouped by severity.',
      '  No API key needed.',
      '',
      'auditme watch [directory]',
      '  Watches a directory tree for file changes using chokidar. On every change, runs local checks on the modified file. Ignores node_modules, .git, dist, build, .next.',
      '  Watched extensions: .js, .ts, .jsx, .tsx, .py, .go, .env, .json, .yaml, .yml',
      '  Output: real-time findings as files are saved.',
      '  Press Ctrl+C to stop.',
      '',
      'auditme init',
      '  Generates .auditmerc and .env files in the current directory with documentation and placeholders.',
      '  Output: configuration scaffolds.',
      '',
      'Exit codes: 0 on success, 1 on error.',
    ],
  },
  {
    title: 'VS Code Extension Reference',
    body: [
      'The VS Code extension (vscode/ directory) provides editor-native AuditMe integration.',
      '',
      'Activation events: onLanguage for JavaScript, TypeScript, JSX, TSX, Python, Go, JSON, YAML.',
      '',
      'Commands:',
      '  • AuditMe: Full AI Audit — Sends the currently open file to NVIDIA Nemotron for deep analysis. Shows a progress notification. If no API key is configured, prompts for one and saves it globally.',
      '  • AuditMe: Run Local Checks — Re-runs local regex checks on the currently open file.',
      '',
      'Configuration (VS Code settings):',
      '  • auditme.nvidiaApiKey (string) — NVIDIA API key for full audits. Empty by default.',
      '  • auditme.enableLocalChecks (boolean) — Enable inline diagnostics on file open/save. Default: true.',
      '',
      'Diagnostics are collected in the "auditme" diagnostic collection. Full audit results include a score diagnostic at line 0, plus per-issue diagnostics with severity mapping and fix suggestions.',
      '',
      'Build and package:',
      codeBlock('cd vscode\nnpm install\nnpm run build          # Compile TypeScript\nnpm run package        # Create .vsix file'),
    ],
  },
  {
    title: 'Web App Reference',
    body: [
      'The web app at https://auditme-six.vercel.app provides browser-based GitHub repository audits.',
      '',
      'Quick scan (anonymous):',
      '  • Paste a public GitHub URL in the landing page input',
      '  • IP-rate-limited to prevent abuse',
      '  • Returns score, summary, top priority, and top issues',
      '  • Full report requires sign-in',
      '',
      'Full audit (authenticated):',
      '  • Sign in with GitHub (Supabase auth)',
      '  • Paste any public GitHub URL',
      '  • Full scored report with all issues, categories, fixes, and diff suggestions',
      '  • Persistent report history at /report/[id]',
      '  • Reports are shareable by URL',
      '',
      'API endpoints:',
      '  • /api/quick-scan — POST with { url: string }. Anonymous, IP-rate-limited. Returns score, summary, topPriority, issues[].',
      '  • /api/nvidia — POST with { userMsg, systemMsg }. Requires authentication. Proxy to NVIDIA Nemotron.',
    ],
  },
  {
    title: 'CI/CD Integration',
    body: [
      'Use the CLI in CI/CD pipelines to gate deployments on code quality:',
      '',
      'GitHub Actions example:',
      codeBlock(`name: AuditMe Check
on: [pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx @auditme/cli check src/ --recursive
      - name: Full scan on main files
        if: github.ref == 'refs/heads/main'
        run: npx @auditme/cli scan https://github.com/\${{ github.repository }}
        env:
          NVIDIA_API_KEY: \${{ secrets.NVIDIA_API_KEY }}`),
      '',
      'Pre-commit hook example:',
      codeBlock(`#!/bin/sh
# .git/hooks/pre-commit
npx @auditme/cli check $(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(js|ts|jsx|tsx|py|go)$')
if [ $? -ne 0 ]; then
  echo "AuditMe found issues. Fix them before committing."
  exit 1
fi`),
      '',
      'The scan command is best suited for main branch checks (rate-limited by GitHub API). The check command is fast enough for pre-commit hooks since it uses local regex only.',
    ],
  },
  {
    title: 'Detection Patterns Reference',
    body: [
      'Local checks (no API key required) detect these patterns across all surfaces:',
      '',
      'Secrets (severity: error):',
      '  • Stripe live secret key — sk_live_ followed by 20+ characters',
      '  • Stripe test secret key — sk_test_ followed by 20+ characters',
      '  • AWS access key ID — AKIA followed by 16 alphanumeric characters',
      '  • GitHub personal access token — ghp_ followed by 36 characters',
      '  • GitHub OAuth token — gho_ followed by 36 characters',
      '  • Slack token — xox[bpsa]- followed by 10+ characters',
      '  • NVIDIA API key — nvapi- followed by 30+ characters',
      '  • Hardcoded password/secret/apiKey/token — any assignment pattern',
      '',
      'Code smells:',
      '  • console.log (warning) — especially dangerous in server-side code',
      '  • console.error (info) — use a structured logger instead',
      '  • TODO, FIXME, HACK, XXX (info/warning) — unresolved work items',
      '  • test.only (warning) — will skip all other tests',
      '  • debugger (error) — execution breakpoint left in production',
      '  • eslint-disable (info) — consider fixing the underlying issue',
      '  • @ts-ignore / @ts-expect-error (warning/info) — suppressed type errors',
      '',
      'Architecture:',
      '  • Deep relative imports (info) — import from ../../../../ suggests poor module structure',
      '  • Namespace imports (info) — import * may prevent tree-shaking',
      '',
      'The multi-line async/try-catch pattern (warning) detects async functions whose body lacks a catch clause. This is a file-level scan that runs across all lines.',
    ],
  },
  {
    title: 'Security Model',
    body: [
      'AuditMe takes a zero-trust approach to code analysis:',
      '',
      '  • Local checks run entirely client-side — no data leaves your machine. The 65+ regex patterns are embedded in the LSP and CLI packages.',
      '  • Full audits go directly to NVIDIA\'s API — the MCP, LSP, and CLI packages call api.nvidia.com directly using your key. AuditMe\'s servers never see your code.',
      '  • The web app fetches public GitHub data via the GitHub API and sends it to NVIDIA from the server. Your NVIDIA key is never sent to AuditMe\'s servers.',
      '  • Authentication is handled by Supabase (GitHub OAuth). No passwords stored.',
      '  • Quick scans are IP-rate-limited to prevent abuse of the proxy endpoint.',
      '',
      'What AuditMe does NOT do:',
      '  • Does not store or log any code it analyzes (except report IDs for authenticated web app users)',
      '  • Does not send code to third parties beyond NVIDIA',
      '  • Does not require repository write access',
      '  • Does not mine or train on your code',
    ],
  },
  {
    title: 'Troubleshooting',
    body: [
      'MCP server won\'t start:',
      '  • Ensure npx is installed and @auditme/mcp is published',
      '  • Check that NVIDIA_API_KEY is set in the environment or MCP config env block',
      '  • Run `npx @auditme/mcp` directly to see stderr output',
      '',
      'LSP server not showing diagnostics:',
      '  • Verify the server is configured in your editor\'s LSP settings',
      '  • Check the editor\'s LSP output panel for auditme logs',
      '  • Without NVIDIA_API_KEY, only local checks work (no full audit command)',
      '',
      'CLI scan fails with "NVIDIA_API_KEY not set":',
      '  • Run `export NVIDIA_API_KEY=nvapi-...` or set it in your shell profile',
      '  • Or run `auditme init` to generate a .env file',
      '',
      'Web app shows old content:',
      '  • Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)',
      '  • Wait for Vercel deploy to finish (check vercel.com dashboard)',
      '',
      'GitHub API rate limits:',
      '  • Unauthenticated GitHub API requests are limited to 60/hour',
      '  • For heavier use, set GITHUB_TOKEN in the environment',
      '  • The MCP/CLI scan commands fetch up to 14 files per scan',
    ],
  },
  {
    title: 'Contributing',
    body: [
      'All AuditMe packages are open source at github.com/williamnyarko45official-max/auditme.',
      '',
      'Local development:',
      codeBlock('git clone https://github.com/williamnyarko45official-max/auditme.git\ncd auditme\n\n# MCP server\ncd mcp && npm install && npm run build\n\n# LSP server\ncd ../lsp && npm install && npm run build\n\n# CLI\ncd ../cli && npm install && npm run build\n\n# VS Code extension\ncd ../vscode && npm install && npm run build\n\n# Web app\ncd .. && npm install && npx next dev'),
      '',
      'All packages share the same detection patterns. Adding a new regex pattern to cli/src/checks.ts should be mirrored in lsp/src/checks.ts and vscode/src/extension.ts.',
      'Pull requests welcome. Open an issue first for significant changes.',
    ],
  },
]

export default function DocsPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ position: 'fixed', width: '600px', height: '600px', background: 'radial-gradient(circle at 50% 40%, rgba(0,255,136,0.04) 0%, transparent 70%)', top: '20%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 48px', borderBottom: '1px solid ' + C.border, background: 'rgba(6,6,8,0.88)', backdropFilter: 'blur(16px)' }}>
        <Link href="/" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 18, color: C.accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.02em' }}>
          <span style={{ fontSize: 20 }}>⚡</span> auditme
        </Link>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['/docs', 'Docs'], ['/privacy', 'Privacy'], ['/terms', 'Terms']].map(([href, text]) => (
            <Link key={text} href={href} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: href === '/docs' ? C.accent : C.muted, textDecoration: 'none', letterSpacing: '0.05em', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = C.accent}
              onMouseLeave={e => e.currentTarget.style.color = href === '/docs' ? C.accent : C.muted}>{text}</Link>
          ))}
        </div>
      </nav>

      <div style={{ padding: '120px 24px 80px', maxWidth: 780, margin: '0 auto', position: 'relative' }}>
        <Link href="/" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: C.accent, textDecoration: 'none', marginBottom: 32, display: 'inline-block', transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>← Back</Link>

        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: C.text, marginBottom: 4, letterSpacing: '0.02em', background: 'linear-gradient(135deg, ' + C.accent + ' 0%, #00ccff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DOCS</h1>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 48, lineHeight: 1.6, fontFamily: "'Share Tech Mono', monospace" }}>The complete guide to AuditMe — philosophy, architecture, integration, and reference.</p>

        {sections.map((section, i) => (
          <div key={i} style={cardHover}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.25)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none' }}>
            {sectionHeader(section.title)}
            {section.body.map((p, j) => (
              <p key={j} style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: j < section.body.length - 1 ? 12 : 0, whiteSpace: 'pre-wrap' }}>{p}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
