import { Command } from 'commander'
import { existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const CONFIG_TEMPLATE = `# AuditMe configuration
# Set your NVIDIA API key (get one at https://build.nvidia.com)
# NVIDIA_API_KEY=nvapi-...
`

const ENV_TEMPLATE = `# Get your API key at https://build.nvidia.com
NVIDIA_API_KEY=

# AuditMe will use this key for full AI-powered audits.
# Without it, only local regex checks are available.
`

export const initCommand = new Command('init')
  .description('Generate AuditMe configuration files')
  .action(() => {
    const configPath = resolve('.auditmerc')

    if (!existsSync(configPath)) {
      writeFileSync(configPath, CONFIG_TEMPLATE, 'utf-8')
      console.log(`  Created .auditmerc`)
    } else {
      console.log(`  .auditmerc already exists`)
    }

    const envPath = resolve('.env')

    if (!existsSync(envPath)) {
      writeFileSync(envPath, ENV_TEMPLATE, 'utf-8')
      console.log(`  Created .env`)
      console.log(`  ${'→'} Edit .env and set your NVIDIA_API_KEY`)
    } else {
      console.log(`  .env already exists`)
    }

    console.log(`\n  Next steps:`)
    console.log(`  1. Edit .env with your NVIDIA_API_KEY`)
    console.log(`  2. Run: auditme scan https://github.com/username/repo`)
    console.log(`  3. Run: auditme check src/**/*.ts`)
  })
