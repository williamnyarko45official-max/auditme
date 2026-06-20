import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { callNvidia, parseLLMResponse } from './llm.js'
import { fetchGithubCode } from './github.js'

const server = new McpServer(
  {
    name: 'auditme',
    version: '0.1.0',
    description: 'AuditMe MCP server — AI-powered code analysis for production readiness',
  },
  {
    capabilities: {
      tools: {},
    },
  },
)

server.registerTool(
  'audit_code',
  {
    title: 'Audit Code Snippet',
    description:
      'Analyze a raw code snippet for production readiness. Returns a score, summary, and prioritized issues with suggested fixes.',
    inputSchema: {
      code: z.string().min(1).describe('The code snippet to analyze'),
      context: z
        .string()
        .optional()
        .describe('Optional context like filename, framework, or language'),
    },
  },
  async ({ code, context }) => {
    try {
      const msg = context
        ? `Analyze this code for production readiness (${context}):\n\n${code}`
        : `Analyze this code for production readiness:\n\n${code}`
      const raw = await callNvidia(msg)
      const result = parseLLMResponse(raw)
      const summary = [
        `**Score: ${result.score}/100**`,
        result.summary,
        '',
        result.topPriority ? `🚨 **Priority:** ${result.topPriority}\n` : '',
        `**Issues (${result.issues?.length || 0} found):**`,
        ...(result.issues || []).map(
          (i: any) =>
            `- [${i.severity.toUpperCase()}] **${i.title}** — ${i.description}\n  _File:_ ${i.affectedFile || 'general'}\n  _Fix:_ ${i.fix}`,
        ),
      ].join('\n')

      return {
        content: [{ type: 'text', text: summary }],
      }
    } catch (e: any) {
      return {
        content: [{ type: 'text', text: `⚠ Audit failed: ${e.message}` }],
        isError: true,
      }
    }
  },
)

server.registerTool(
  'audit_file',
  {
    title: 'Audit a File',
    description:
      'Read and analyze a file from the local filesystem for production readiness issues.',
    inputSchema: {
      filePath: z.string().min(1).describe('Absolute path to the file to audit'),
    },
  },
  async ({ filePath }) => {
    try {
      const fs = await import('fs/promises')
      const code = await fs.readFile(filePath, 'utf-8')
      const msg = `Analyze this file (${filePath}) for production readiness:\n\n${code}`
      const raw = await callNvidia(msg)
      const result = parseLLMResponse(raw)
      const summary = [
        `**Score: ${result.score}/100**`,
        result.summary,
        '',
        result.topPriority ? `🚨 **Priority:** ${result.topPriority}\n` : '',
        `**Issues (${result.issues?.length || 0} found):**`,
        ...(result.issues || []).map(
          (i: any) =>
            `- [${i.severity.toUpperCase()}] **${i.title}** — ${i.description}\n  _File:_ ${i.affectedFile || 'general'}\n  _Fix:_ ${i.fix}`,
        ),
      ].join('\n')

      return {
        content: [{ type: 'text', text: summary }],
      }
    } catch (e: any) {
      return {
        content: [{ type: 'text', text: `⚠ Audit failed: ${e.message}` }],
        isError: true,
      }
    }
  },
)

server.registerTool(
  'audit_github',
  {
    title: 'Audit a GitHub Repository',
    description:
      'Fetch and analyze a public GitHub repository for production readiness issues.',
    inputSchema: {
      url: z
        .string()
        .url()
        .describe('GitHub repository URL (e.g. https://github.com/username/repo)'),
    },
  },
  async ({ url }) => {
    try {
      const code = await fetchGithubCode(url)
      const msg = `Analyze this GitHub repository for production readiness:\n\n${code}`
      const raw = await callNvidia(msg)
      const result = parseLLMResponse(raw)
      const summary = [
        `**Score: ${result.score}/100**`,
        result.summary,
        '',
        result.topPriority ? `🚨 **Priority:** ${result.topPriority}\n` : '',
        `**Issues (${result.issues?.length || 0} found):**`,
        ...(result.issues || []).map(
          (i: any) =>
            `- [${i.severity.toUpperCase()}] **${i.title}** — ${i.description}\n  _File:_ ${i.affectedFile || 'general'}\n  _Fix:_ ${i.fix}`,
        ),
      ].join('\n')

      return {
        content: [{ type: 'text', text: summary }],
      }
    } catch (e: any) {
      return {
        content: [{ type: 'text', text: `⚠ Audit failed: ${e.message}` }],
        isError: true,
      }
    }
  },
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((e) => {
  console.error('Fatal error:', e)
  process.exit(1)
})
