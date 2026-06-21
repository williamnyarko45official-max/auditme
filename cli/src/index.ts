#!/usr/bin/env node

import { Command } from 'commander'
import { scanCommand } from './commands/scan.js'
import { checkCommand } from './commands/check.js'
import { watchCommand } from './commands/watch.js'
import { initCommand } from './commands/init.js'

const program = new Command()

program
  .name('auditme')
  .description('AuditMe — production-readiness analysis from your terminal')
  .version('0.1.0')

program.addCommand(scanCommand)
program.addCommand(checkCommand)
program.addCommand(watchCommand)
program.addCommand(initCommand)

program.parse()
