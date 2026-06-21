import {
  createConnection,
  ProposedFeatures,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  Position,
  Range,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
} from 'vscode-languageserver/node.js'
import { TextDocument } from 'vscode-languageserver-textdocument'
import { runLocalChecks } from './checks.js'

const connection = createConnection(ProposedFeatures.all)
const documents = new TextDocuments(TextDocument)

let hasNvidiaKey = false

connection.onInitialize((params: InitializeParams): InitializeResult => {
  hasNvidiaKey = !!process.env.NVIDIA_API_KEY

  return {
    capabilities: {
      textDocumentSync: {
        openClose: true,
        change: TextDocumentSyncKind.Full,
      },
      executeCommandProvider: {
        commands: [
          'auditme.runLocalChecks',
          ...(hasNvidiaKey ? ['auditme.fullAudit'] : []),
        ],
      },
    },
    serverInfo: {
      name: 'auditme',
      version: '0.1.0',
    },
  }
})

connection.onInitialized(() => {
  connection.console.info('AuditMe LSP server initialized')
  if (hasNvidiaKey) {
    connection.console.info('NVIDIA_API_KEY found — full audit available')
  } else {
    connection.console.info('No NVIDIA_API_KEY — local checks only')
  }
})

function publishDiagnostics(doc: TextDocument) {
  const text = doc.getText()
  const checks = runLocalChecks(text, doc.uri)

  const diagnostics: Diagnostic[] = checks.map((c) => ({
    range: Range.create(
      Position.create(c.line, c.column),
      Position.create(c.line, c.column + c.length),
    ),
    message: c.message,
    severity:
      c.severity === 'error'
        ? DiagnosticSeverity.Error
        : c.severity === 'warning'
          ? DiagnosticSeverity.Warning
          : DiagnosticSeverity.Information,
    source: 'auditme',
  }))

  connection.sendDiagnostics({ uri: doc.uri, diagnostics })
}

documents.onDidOpen((e) => {
  publishDiagnostics(e.document)
})

documents.onDidChangeContent((e) => {
  publishDiagnostics(e.document)
})

connection.onExecuteCommand(async (params) => {
  if (params.command === 'auditme.runLocalChecks') {
    const uri = params.arguments?.[0] as string
    const doc = documents.get(uri)
    if (doc) publishDiagnostics(doc)
    return
  }

  if (params.command === 'auditme.fullAudit' && hasNvidiaKey) {
    const uri = params.arguments?.[0] as string
    const doc = documents.get(uri)
    if (!doc) return

    const code = doc.getText()
    const fileName = uri.split('/').pop() || 'unknown'

    try {
      const apiKey = process.env.NVIDIA_API_KEY!
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
              {
                role: 'user',
                content: `Analyze this file (${fileName}) for production readiness:\n\n${code}`,
              },
            ],
            temperature: 0.3,
            max_tokens: 4096,
          }),
        },
      )

      if (!res.ok) {
        const text = await res.text()
        connection.window.showErrorMessage(`AuditMe full audit failed: ${text}`)
        return
      }

      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content || ''
      const clean = raw.replace(/```json|```/g, '').trim()
      const result = JSON.parse(clean)

      const diagnostics: Diagnostic[] = (result.issues || []).map((issue: any) => {
        const lineNum = Math.max(0, (issue.line || 1) - 1)
        return {
          range: Range.create(
            Position.create(lineNum, 0),
            Position.create(lineNum, 120),
          ),
          message: `[AuditMe] ${issue.title} — ${issue.fix}`,
          severity:
            issue.severity === 'critical' || issue.severity === 'error'
              ? DiagnosticSeverity.Error
              : issue.severity === 'warning'
                ? DiagnosticSeverity.Warning
                : DiagnosticSeverity.Information,
          source: 'auditme',
        }
      })

      diagnostics.push({
        range: Range.create(Position.create(0, 0), Position.create(0, 30)),
        message: `AuditMe score: ${result.score}/100 — ${result.topPriority || result.summary}`,
        severity:
          result.score < 50
            ? DiagnosticSeverity.Error
            : result.score < 75
              ? DiagnosticSeverity.Warning
              : DiagnosticSeverity.Information,
        source: 'auditme',
      })

      connection.sendDiagnostics({ uri: doc.uri, diagnostics })
    } catch (e: any) {
      connection.window.showErrorMessage(`AuditMe audit error: ${e.message}`)
    }
  }
})

documents.listen(connection)
connection.listen()
