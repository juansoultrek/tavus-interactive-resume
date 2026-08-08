import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export type Prompt = {
  id: string
  label: string
  conversational_context: string
  custom_greeting: string
}

export type PromptCategory = {
  id: string
  label: string
  prompts: Prompt[]
}

export type PromptsFile = {
  categories: PromptCategory[]
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const configDir = path.resolve(__dirname, '../config')

let cached: PromptsFile | null = null

function readPromptsFile(): PromptsFile {
  const preferred = path.join(configDir, 'prompts.json')
  const fallback = path.join(configDir, 'prompts.example.json')
  const filePath = fs.existsSync(preferred) ? preferred : fallback
  const raw = fs.readFileSync(filePath, 'utf8')
  const parsed = JSON.parse(raw) as PromptsFile

  if (!parsed?.categories || !Array.isArray(parsed.categories)) {
    throw new Error(`Invalid prompts file: ${filePath}`)
  }

  return parsed
}

export function loadPrompts(): PromptsFile {
  if (!cached) {
    cached = readPromptsFile()
  }
  return cached
}

export function getPromptById(id: string): Prompt | undefined {
  for (const category of loadPrompts().categories) {
    const prompt = category.prompts.find((item) => item.id === id)
    if (prompt) return prompt
  }
  return undefined
}

/** Public catalog for the UI — labels only, no conversation context. */
export function getPublicCatalog(): {
  categories: { id: string; label: string; prompts: { id: string; label: string }[] }[]
} {
  return {
    categories: loadPrompts().categories.map((category) => ({
      id: category.id,
      label: category.label,
      prompts: category.prompts.map((prompt) => ({
        id: prompt.id,
        label: prompt.label,
      })),
    })),
  }
}
