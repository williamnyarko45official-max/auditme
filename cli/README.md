# @auditme/cli

AuditMe CLI — production-readiness analysis from your terminal.

## Commands

```
auditme scan <url>        Full NVIDIA audit of a public GitHub repo
auditme check [files...]  Local regex checks (no API needed)
auditme watch [dir]       Watch files for changes, run checks
auditme init              Generate config files
```

## Usage

```bash
# Full audit
npx @auditme/cli scan https://github.com/username/repo

# Quick local checks
npx @auditme/cli check src/**/*.ts

# Watch mode
npx @auditme/cli watch src/
```

Requires `NVIDIA_API_KEY` for `scan` command. Get one at https://build.nvidia.com.

## Install

```bash
npm install -g @auditme/cli
# or
npx @auditme/cli <command>
```

## Build from source

```bash
cd cli && npm install && npm run build
node dist/index.js --help
```
