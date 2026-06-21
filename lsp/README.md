# @auditme/lsp

AuditMe LSP server — inline production-readiness diagnostics for your editor.

## What it catches (local, zero API calls)

**Secrets**: Stripe keys, AWS keys, GitHub tokens, Slack tokens, NVIDIA keys, hardcoded passwords/secrets/API keys/tokens

**Code smells**: console.log, console.error, TODO, FIXME, HACK, XXX, test.only, debugger, @ts-ignore, @ts-expect-error, eslint-disable

**Architecture**: deep relative imports, namespace imports, async functions without try/catch

## Full AI audit (requires NVIDIA_API_KEY)

The `auditme.fullAudit` command runs NVIDIA Nemotron on the current file and publishes diagnostics with score, summary, and prioritized issues.

## Usage

```bash
export NVIDIA_API_KEY=nvapi-...   # optional, for full audits
npx @auditme/lsp
```

### opencode

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

## Build from source

```bash
cd lsp && npm install && npm run build
node dist/server.js
```
