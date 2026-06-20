# AuditMe MCP Server

AI-powered code analysis that pairs with your coding agent. Drop this in any MCP-compatible client (Cursor, Windsurf, Claude Desktop, etc.) and your agent can audit code for production readiness on demand.

## Tools

| Tool | Description |
|------|-------------|
| `audit_code` | Analyze a raw code snippet. Pass `code` and optional `context` (filename, framework). |
| `audit_file` | Read and analyze a file from disk. Pass `filePath`. |
| `audit_github` | Fetch and analyze a public GitHub repo. Pass `url`. |

Each tool returns a production readiness score (0–100), a summary, and a prioritized list of issues with fixes.

## Quick Start

### 1. Set your NVIDIA API key

```bash
export NVIDIA_API_KEY=nvapi-...
```

Get one at [build.nvidia.com](https://build.nvidia.com) (free tier available).

### 2. Run the server

```bash
npx @auditme/mcp
```

### 3. Configure your MCP client

Add this to your MCP client config (Cursor, Windsurf, Claude Desktop, etc.):

```json
{
  "mcpServers": {
    "auditme": {
      "command": "npx",
      "args": ["@auditme/mcp"],
      "env": {
        "NVIDIA_API_KEY": "nvapi-..."
      }
    }
  }
}
```

Now your agent can call tools like:

> "Audit this code for production readiness"
> "Check this file for security issues"
> "Run an audit on the GitHub repo we're working on"

## Run from Source

```bash
git clone https://github.com/yourname/auditme.git
cd auditme/mcp
npm install
npm run build
NVIDIA_API_KEY=nvapi-... node dist/index.js
```
