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

const sections = [
  {
    title: 'Quick Start — MCP Server',
    body: [
      'AuditMe\'s MCP server adds code audit tools to your AI coding agent (Cursor, Windsurf, opencode, Claude Desktop). Your agent can call audit_code, audit_file, and audit_github as native tools.',
      'Set your NVIDIA_API_KEY in your environment (get one at https://build.nvidia.com).',
      codeBlock('# Add to ~/.cursor/mcp.json, opencode.json, or claude_desktop_config.json\n{\n  "mcpServers": {\n    "auditme": {\n      "command": "npx",\n      "args": ["-y", "@auditme/mcp"],\n      "env": {\n        "NVIDIA_API_KEY": "nvapi-..."\n      }\n    }\n  }\n}'),
      'Then restart your agent and ask it to audit your code. Example: "Run audit_github on https://github.com/username/repo".',
    ],
  },
  {
    title: 'Quick Start — LSP Server',
    body: [
      'The LSP server runs in your editor and provides real-time inline diagnostics. It catches secrets, console.log, debugger, TODO, FIXME, and missing try/catch patterns instantly — no API call needed.',
      codeBlock('# Add to opencode.json\n{\n  "lsp": {\n    "servers": [{\n      "name": "auditme",\n      "command": "npx",\n      "args": ["-y", "@auditme/lsp"]\n    }]\n  }\n}'),
      'With NVIDIA_API_KEY set in your environment, you also get the auditme.fullAudit command for on-demand AI analysis of any file.',
    ],
  },
  {
    title: 'Quick Start — CLI Tool',
    body: [
      'The CLI gives you four commands for terminal-based code analysis.',
      codeBlock('# Full NVIDIA audit of a public GitHub repo\nnpx @auditme/cli scan https://github.com/username/repo\n\n# Quick local checks on files (secrets, code smells)\nnpx @auditme/cli check src/**/*.ts\n\n# Watch a directory for changes\nnpx @auditme/cli watch src/\n\n# Generate config files\nnpx @auditme/cli init'),
    ],
  },
  {
    title: 'Quick Start — Web App',
    body: [
      'The web app at https://auditme-six.vercel.app lets you paste any public GitHub URL and get a scored report in under 60 seconds. No install required.',
      'Sign in with GitHub to access your audit history and saved reports.',
    ],
  },
  {
    title: 'VS Code Extension',
    body: [
      'The VS Code extension is built and ready for side-loading. It provides:',
      '  • Inline diagnostics on file open/save (local regex checks)',
      '  • "AuditMe: Full AI Audit" command for NVIDIA analysis',
      '  • Configurable NVIDIA API key via VS Code settings',
      'Install from the vscode/ directory or wait for the VS Code Marketplace listing.',
    ],
  },
  {
    title: 'NVIDIA API Key',
    body: [
      'Full AI audits require an NVIDIA API key. Get one for free at https://build.nvidia.com (the Nemotron model is included in the free tier).',
      'Set it as an environment variable:',
      codeBlock('export NVIDIA_API_KEY=nvapi-...'),
      'Or set it in your editor\'s config (e.g., auditme.nvidiaApiKey in VS Code settings).',
      'Without a key, local checks still work — secrets, console.log, debugger, TODO, and code smells are detected via regex with no API dependency.',
    ],
  },
  {
    title: 'Architecture',
    body: [
      'AuditMe has four integration surfaces powered by the same NVIDIA Nemotron engine:',
      '  • MCP Server — for AI coding agents (Cursor, Windsurf, opencode, Claude Desktop)',
      '  • LSP Server — for inline editor diagnostics (opencode, VS Code)',
      '  • CLI — for terminal and CI/CD pipelines',
      '  • Web App — for browser-based audits',
      '',
      'Local checks (secrets, code smells) run client-side with zero API calls. Full AI audits go through NVIDIA\'s Nemotron-3-Ultra model.',
      'All packages are open source at github.com/williamnyarko45official-max/auditme.',
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

      <div style={{ padding: '120px 24px 80px', maxWidth: 720, margin: '0 auto', position: 'relative' }}>
        <Link href="/" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: C.accent, textDecoration: 'none', marginBottom: 32, display: 'inline-block', transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>← Back</Link>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, color: C.text, marginBottom: 4, letterSpacing: '0.02em', background: 'linear-gradient(135deg, ' + C.accent + ' 0%, #00ccff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DOCS</h1>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 48, lineHeight: 1.6, fontFamily: "'Share Tech Mono', monospace" }}>Everything you need to add AuditMe to your coding agent.</p>

        {sections.map((section, i) => (
          <div key={i} style={cardHover}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(0,255,136,0.25)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = 'none' }}>
            <h2 style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: C.accent, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 20, height: 2, background: C.accent, display: 'inline-block' }} />
              {section.title}
            </h2>
            {section.body.map((p, j) => (
              <p key={j} style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: j < section.body.length - 1 ? 12 : 0 }}>{p}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
