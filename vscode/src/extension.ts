import * as vscode from 'vscode'

const SECRET_PATTERNS = [
  { re: /(['"])sk_live_[A-Za-z0-9]{20,}\1/g, label: 'Stripe live secret key', sev: vscode.DiagnosticSeverity.Error },
  { re: /(['"])sk_test_[A-Za-z0-9]{20,}\1/g, label: 'Stripe test secret key', sev: vscode.DiagnosticSeverity.Warning },
  { re: /(['"])pk_live_[A-Za-z0-9]{20,}\1/g, label: 'Stripe live publishable key', sev: vscode.DiagnosticSeverity.Warning },
  { re: /(['"])AKIA[0-9A-Z]{16}\1/g, label: 'AWS access key ID', sev: vscode.DiagnosticSeverity.Error },
  { re: /(['"])ghp_[A-Za-z0-9]{36}\1/g, label: 'GitHub personal access token', sev: vscode.DiagnosticSeverity.Error },
  { re: /(['"])gho_[A-Za-z0-9]{36}\1/g, label: 'GitHub OAuth access token', sev: vscode.DiagnosticSeverity.Error },
  { re: /(['"])xox[bpsa]-[A-Za-z0-9-]{10,}\1/g, label: 'Slack token', sev: vscode.DiagnosticSeverity.Error },
  { re: /(['"])nvapi-[A-Za-z0-9_-]{30,}\1/g, label: 'NVIDIA API key', sev: vscode.DiagnosticSeverity.Error },
  { re: /password\s*[:=]\s*['"][^'"]+['"]/gi, label: 'Hardcoded password', sev: vscode.DiagnosticSeverity.Error },
  { re: /secret\s*[:=]\s*['"][^'"]+['"]/gi, label: 'Hardcoded secret', sev: vscode.DiagnosticSeverity.Error },
  { re: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, label: 'Hardcoded API key', sev: vscode.DiagnosticSeverity.Error },
  { re: /token\s*[:=]\s*['"][A-Za-z0-9_-]{20,}['"]/g, label: 'Hardcoded token', sev: vscode.DiagnosticSeverity.Error },
  { re: /\bconsole\.log\s*\(/g, label: 'console.log in production code', sev: vscode.DiagnosticSeverity.Warning },
  { re: /\bconsole\.error\s*\(/g, label: 'console.error — use proper error logging', sev: vscode.DiagnosticSeverity.Information },
  { re: /\bTODO\b/g, label: 'Unresolved TODO', sev: vscode.DiagnosticSeverity.Information },
  { re: /\bFIXME\b/g, label: 'Unresolved FIXME', sev: vscode.DiagnosticSeverity.Warning },
  { re: /\bHACK\b/g, label: 'Hack/workaround in code', sev: vscode.DiagnosticSeverity.Warning },
  { re: /\bXXX\b/g, label: 'Marked issue in code', sev: vscode.DiagnosticSeverity.Information },
  { re: /\.only\s*\(/g, label: 'test.only left in test suite', sev: vscode.DiagnosticSeverity.Warning },
  { re: /debugger\s*;/g, label: 'debugger statement in code', sev: vscode.DiagnosticSeverity.Error },
  { re: /@ts-ignore/g, label: '@ts-ignore suppresses type errors', sev: vscode.DiagnosticSeverity.Warning },
]

const diagnosticCollection = vscode.languages.createDiagnosticCollection('auditme')

function runLocalChecks(doc: vscode.TextDocument): vscode.Diagnostic[] {
  const diagnostics: vscode.Diagnostic[] = []
  const text = doc.getText()
  const lines = text.split('\n')

  for (const pattern of SECRET_PATTERNS) {
    pattern.re.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = pattern.re.exec(text)) !== null) {
      const startPos = doc.positionAt(match.index)
      const endPos = doc.positionAt(match.index + match[0].length)
      const range = new vscode.Range(startPos, endPos)
      const diag = new vscode.Diagnostic(range, pattern.label, pattern.sev)
      diag.source = 'auditme'
      diagnostics.push(diag)
    }
  }

  return diagnostics
}

function updateDiagnostics(doc: vscode.TextDocument) {
  if (doc.languageId === 'log' || doc.uri.scheme === 'output') return
  const config = vscode.workspace.getConfiguration('auditme')
  if (!config.get<boolean>('enableLocalChecks', true)) return

  const diagnostics = runLocalChecks(doc)
  diagnosticCollection.set(doc.uri, diagnostics)
}

async function runFullAudit() {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showErrorMessage('Open a file to audit')
    return
  }

  const config = vscode.workspace.getConfiguration('auditme')
  let apiKey = (config.get<string>('nvidiaApiKey') ?? '') as string
  if (!apiKey) {
    const input = await vscode.window.showInputBox({
      prompt: 'Enter your NVIDIA API key',
      password: true,
      placeHolder: 'nvapi-...',
      ignoreFocusOut: true,
    })
    if (!input) return
    apiKey = input
    await config.update('nvidiaApiKey', apiKey, vscode.ConfigurationTarget.Global)
  }

  const doc = editor.document
  const code = doc.getText()
  const fileName = doc.fileName.split(/[/\\]/).pop() || 'unknown'

  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: 'AuditMe: Running full AI audit...',
    cancellable: false,
  }, async () => {
    try {
      const systemPrompt = `You are AuditMe — a senior DevOps and security engineer.
Return ONLY valid JSON (no markdown, no backticks):
{
  "score": <0-100>,
  "summary": "<2 sentence summary>",
  "issues": [{
    "severity": "<critical|warning|pass>",
    "title": "<short title>",
    "description": "<plain English explanation>",
    "fix": "<concrete fix>",
    "line": <line number or 0>
  }],
  "topPriority": "<most important thing to fix>"
}`

      const res = await fetch(
        'https://ai.api.nvidia.com/v1/llm/llama-3_3-nemotron-super-49b-v1',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Analyze this file (${fileName}) for production readiness:\n\n${code}` },
            ],
            temperature: 0.3,
            max_tokens: 4096,
          }),
        },
      )

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`API error: ${text}`)
      }

      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content || ''
      const clean = raw.replace(/```json|```/g, '').trim()
      const result = JSON.parse(clean)

      const diagnostics: vscode.Diagnostic[] = (result.issues || []).map((issue: any) => {
        const lineNum = Math.max(0, (issue.line || 1) - 1)
        const range = new vscode.Range(lineNum, 0, lineNum, 120)
        const sev = issue.severity === 'critical' || issue.severity === 'error'
          ? vscode.DiagnosticSeverity.Error
          : issue.severity === 'warning'
            ? vscode.DiagnosticSeverity.Warning
            : vscode.DiagnosticSeverity.Information
        const diag = new vscode.Diagnostic(range, `[AuditMe] ${issue.title} — ${issue.fix}`, sev)
        diag.source = 'auditme'
        return diag
      })

      const scoreLine = new vscode.Range(0, 0, 0, 30)
      const scoreSev = result.score < 50
        ? vscode.DiagnosticSeverity.Error
        : result.score < 75
          ? vscode.DiagnosticSeverity.Warning
          : vscode.DiagnosticSeverity.Information
      const scoreDiag = new vscode.Diagnostic(
        scoreLine,
        `AuditMe score: ${result.score}/100 — ${result.topPriority || result.summary}`,
        scoreSev,
      )
      scoreDiag.source = 'auditme'
      diagnostics.push(scoreDiag)

      diagnosticCollection.set(doc.uri, diagnostics)
      vscode.window.showInformationMessage(`AuditMe: Score ${result.score}/100 — ${result.summary}`)
    } catch (e: any) {
      vscode.window.showErrorMessage(`AuditMe audit failed: ${e.message}`)
    }
  })
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(updateDiagnostics),
    vscode.workspace.onDidSaveTextDocument(updateDiagnostics),
    vscode.workspace.onDidCloseTextDocument((doc) => {
      diagnosticCollection.delete(doc.uri)
    }),
    vscode.commands.registerCommand('auditme.fullAudit', runFullAudit),
    vscode.commands.registerCommand('auditme.runLocalChecks', () => {
      const editor = vscode.window.activeTextEditor
      if (editor) updateDiagnostics(editor.document)
    }),
    diagnosticCollection,
  )

  vscode.workspace.textDocuments.forEach(updateDiagnostics)
}

export function deactivate() {}
