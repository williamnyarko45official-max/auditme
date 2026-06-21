# ⚡ AuditMe

**Your coding agent's security sidekick.** AuditMe wakes up with Cursor, Windsurf, opencode, or Claude Desktop and audits your code for production readiness — secrets, code smells, missing error handling, and more.

- **MCP server** — your agent calls `audit_code`, `audit_file`, `audit_github` as native tools
- **LSP server** — inline diagnostics while you code (65+ regex patterns, zero API calls)
- **CLI** — `auditme scan`, `auditme check`, `auditme watch`, `auditme init`
- **Web app** — paste any GitHub URL, get a scored report in 60 seconds
- **VS Code extension** — full editor integration with one-click full audits

All powered by **NVIDIA Nemotron-3-Ultra** for deep analysis. MIT licensed. Free.

## Quick Start

```bash
# Full audit of any public GitHub repo
npx @auditme/cli scan https://github.com/username/repo

# Local checks on files (no API needed)
npx @auditme/cli check src/**/*.ts

# Watch for changes
npx @auditme/cli watch src/
```

### MCP (for your coding agent)

```json
{
  "mcpServers": {
    "auditme": {
      "command": "npx",
      "args": ["-y", "@auditme/mcp"],
      "env": { "NVIDIA_API_KEY": "nvapi-..." }
    }
  }
}
```

### LSP (for inline diagnostics)

```json
{
  "lsp": {
    "servers": [{
      "name": "auditme",
      "command": "npx",
      "args": ["-y", "@auditme/lsp"]
    }]
  }
}
```

### Web

Go to [auditme-six.vercel.app](https://auditme-six.vercel.app), paste a GitHub URL, get a report.

## Packages

| Package | npm | Description |
|---------|-----|-------------|
| `@auditme/mcp` | [npm](https://npmjs.com/package/@auditme/mcp) | MCP server with 3 audit tools |
| `@auditme/lsp` | [npm](https://npmjs.com/package/@auditme/lsp) | LSP server for editor diagnostics |
| `@auditme/cli` | [npm](https://npmjs.com/package/@auditme/cli) | CLI: scan, check, watch, init |

## What it catches

- **Secrets**: Stripe keys, AWS keys, GitHub tokens, Slack tokens, hardcoded passwords
- **Code smells**: console.log, debugger, TODO, FIXME, test.only, @ts-ignore
- **Missing error handling**: async functions without try/catch
- **Config issues**: missing env validation, no rate limiting, open CORS

65+ regex patterns run locally with zero API calls. Full AI analysis available with NVIDIA_API_KEY.

## Architecture

```
┌─────────────┐  ┌─────────────┐  ┌──────────┐  ┌──────────┐
│   MCP       │  │   LSP       │  │   CLI    │  │ Web App  │
│  Server     │  │  Server     │  │          │  │          │
├─────────────┤  ├─────────────┤  ├──────────┤  ├──────────┤
│ audit_code  │  │ local regex │  │ scan     │  │ quick    │
│ audit_file  │  │ full audit  │  │ check    │  │ scan     │
│ audit_github│  │ command     │  │ watch    │  │ full     │
└──────┬──────┘  └──────┬──────┘  └────┬─────┘  └────┬─────┘
       │                │               │             │
       └────────────────┴───────────────┴─────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  NVIDIA Nemotron  │
                    │   (optional for   │
                    │   full analysis)  │
                    └───────────────────┘
```

## Local Development

```bash
git clone https://github.com/williamnyarko45official-max/auditme.git
cd auditme

# Web app
npm install && npx next dev

# MCP
cd mcp && npm install && npm run build

# LSP
cd lsp && npm install && npm run build

# CLI
cd cli && npm install && npm run build

# VS Code extension
cd vscode && npm install && npm run build
```

## License

MIT
