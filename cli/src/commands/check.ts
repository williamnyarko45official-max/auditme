import { Command } from 'commander'
import { readFileSync } from 'node:fs'
import { runLocalChecks } from '../checks.js'
import { formatFindings } from '../format.js'

export const checkCommand = new Command('check')
  .description('Run local quick checks on files (secrets, code smells, etc.)')
  .argument('[files...]', 'Files to check')
  .option('-r, --recursive', 'Recursively check all files in directory')
  .action(async (files: string[], options: { recursive?: boolean }) => {
    try {
      if (!files || files.length === 0) {
        console.error('  Specify files to check, or use --recursive for current directory')
        process.exit(1)
      }

      const allFindings: any[] = []
      let checked = 0

      for (const file of files) {
        try {
          const text = readFileSync(file, 'utf-8')
          const findings = runLocalChecks(file, text)
          allFindings.push(...findings)
          checked++
        } catch (e: any) {
          console.error(`  ✗ Could not read ${file}: ${e.message}`)
        }
      }

      if (checked === 0) {
        console.error('  No files could be read')
        process.exit(1)
      }

      console.log(formatFindings(allFindings))
      console.log(`  Checked ${checked} file(s), found ${allFindings.length} issue(s)`)
    } catch (e: any) {
      console.error(`\n  ✗ Error: ${e.message}`)
      process.exit(1)
    }
  })
