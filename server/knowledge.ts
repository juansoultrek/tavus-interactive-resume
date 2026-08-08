import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const knowledgeDir = path.resolve(__dirname, '../knowledge')

function readOptional(fileName: string): string {
  const filePath = path.join(knowledgeDir, fileName)
  if (!fs.existsSync(filePath)) return ''
  return fs.readFileSync(filePath, 'utf8').trim()
}

/** Builds the remote PAL system_prompt from local knowledge files. */
export function buildSystemPromptFromKnowledge(): string {
  const system = readOptional('system-prompt.md')
  const persona = readOptional('persona.md')

  if (!system && !persona) {
    throw new Error('No knowledge/system-prompt.md or knowledge/persona.md found')
  }

  const parts: string[] = []
  if (system) parts.push(system)
  if (persona) {
    parts.push('## Knowledge\n\nUse only the following facts about yourself:\n\n' + persona)
  }

  return parts.join('\n\n').trim()
}

export function systemPromptHash(prompt: string): string {
  return createHash('sha256').update(prompt).digest('hex')
}
