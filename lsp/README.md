# AuditMe LSP Server

Inline production-readiness diagnostics for your coding agent. Light up security issues and code smells directly in your editor as you type.

## What it checks (local, instant — no API call)

**Secrets leaked in code:**
- Stripe live/test keys, AWS access keys, GitHub tokens, Slack tokens, NVIDIA API keys
- Hardcoded passwords, secrets, API keys, tokens

**Code smells:**
- `console.log` / `console.error` in production code
- `debugger` statements
- `test.only` left in test suites
- Unresolved `TODO`, `FIXME`, `HACK`, `XXX`
- `@ts-ignore` / `@ts-expect-error`
- `eslint-disable-next-line`
- Deep relative imports
- Async functions without try/catch

**Full AI audit (requires `NVIDIA_API_KEY`):**
A `auditme.fullAudit` command runs the full NVIDIA Nemotron analysis on the current file and publishes diagnostics with score, summary, and prioritized issues.

## Setup with opencode

Add to your `opencode.json`:

```json
{
  "lsp": {
    "auditme": {
      "command": ["node", "/path/to/auditme/lsp/dist/server.js"],
      "extensions": [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".env"]
    }
  }
}
```

With NVIDIA key for full audits:

```json
{
  "lsp": {
    "auditme": {
      "command": ["node", "/path/to/auditme/lsp/dist/server.js"],
      "extensions": [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".env"],
      "env": {
        "NVIDIA_API_KEY": "nvapi-..."
      }
    }
  }
}
```

The server must be built first:

```bash
cd lsp && npm install && npm run build
```
