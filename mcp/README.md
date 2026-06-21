# @auditme/mcp

AuditMe MCP server — gives your coding agent 3 native tools for production-readiness analysis.

## Tools

| Tool | Input | Returns |
|------|-------|---------|
| `audit_code` | `code` (string), `context` (optional filename) | Score 0-100, summary, prioritized issues with fixes |
| `audit_file` | `filePath` (absolute path) | Same |
| `audit_github` | `url` (GitHub repo URL) | Same, fetches up to 14 key files |

## Usage

```bash
export NVIDIA_API_KEY=nvapi-...
npx @auditme/mcp
```

Configure in your MCP client:

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

## Build from source

```bash
cd mcp && npm install && npm run build
node dist/index.js
```
