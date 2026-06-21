import { Command } from 'commander'
import { watch } from 'chokidar'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { runLocalChecks } from '../checks.js'
import { formatFindings } from '../format.js'

const EXTENSIONS = new Set(['.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.env', '.json', '.yaml', '.yml'])

export const watchCommand = new Command('watch')
  .description('Watch files for changes and run local checks')
  .argument('[directory]', 'Directory to watch', '.')
  .action(async (directory: string) => {
    try {
      const dir = resolve(directory)
      console.log(`  Watching ${dir} for changes... (Ctrl+C to stop)`)

      const watcher = watch(dir, {
        ignored: /(node_modules|\.git|dist|build|\.next)/,
        persistent: true,
      })

      watcher.on('change', (filePath: string) => {
        const ext = filePath.slice(filePath.lastIndexOf('.'))
        if (!EXTENSIONS.has(ext)) return

        try {
          const text = readFileSync(filePath, 'utf-8')
          const findings = runLocalChecks(filePath, text)
          const rel = filePath.replace(dir + '/', '')
          const timestamp = new Date().toLocaleTimeString()

          if (findings.length > 0) {
            console.log(`\n  [${timestamp}] ${rel} — ${findings.length} issue(s)`)
            console.log(formatFindings(findings))
          }
        } catch {}
      })

      watcher.on('error', (err: any) => {
        console.error(`  Watch error: ${err?.message || err}`)
      })

      process.on('SIGINT', () => {
        console.log('\n  Stopped.')
        watcher.close()
        process.exit(0)
      })
    } catch (e: any) {
      console.error(`\n  ✗ Error: ${e.message}`)
      process.exit(1)
    }
  })
