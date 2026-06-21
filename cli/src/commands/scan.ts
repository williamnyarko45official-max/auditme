import { Command } from 'commander'
import { fetchGithubCode } from '../github.js'
import { callNvidia, parseLLMResponse } from '../llm.js'
import { formatAuditResult, dim } from '../format.js'

export const scanCommand = new Command('scan')
  .description('Full NVIDIA audit of a public GitHub repository')
  .argument('<url>', 'GitHub repository URL (e.g. https://github.com/username/repo)')
  .action(async (url: string) => {
    try {
      process.stdout.write(dim('  → Fetching repository...'))
      const code = await fetchGithubCode(url, (msg) => {
        process.stdout.write('\r\x1b[K')
        process.stdout.write(dim(`  → ${msg}`))
      })

      process.stdout.write('\r\x1b[K')
      process.stdout.write(dim('  → Running NVIDIA Nemotron analysis...\n'))
      process.stdout.write(dim('  → This takes 15–30 seconds...'))

      const raw = await callNvidia(`Analyze this GitHub repository for production readiness:\n\n${code}`)
      const result = parseLLMResponse(raw)

      process.stdout.write('\r\x1b[K')
      console.log(formatAuditResult(result))
    } catch (e: any) {
      console.error(`\n  ${'✗'} Error: ${e.message}`)
      process.exit(1)
    }
  })
