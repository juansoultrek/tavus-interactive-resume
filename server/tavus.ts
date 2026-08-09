import { buildSystemPromptFromKnowledge, systemPromptHash } from './knowledge.ts'

type CreateConversationInput = {
  conversational_context?: string
  custom_greeting?: string
  conversation_name?: string
}

type TavusConversation = {
  conversation_id: string
  conversation_url: string
}

let lastSyncedPromptHash: string | null = null

function requireApiKey(): string {
  const apiKey = process.env.TAVUS_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('TAVUS_API_KEY is not set')
  }
  return apiKey
}

function buildCreateBody(input: CreateConversationInput): Record<string, unknown> {
  const palId = process.env.TAVUS_PAL_ID?.trim()
  const faceId = process.env.TAVUS_FACE_ID?.trim()

  if (!palId && !faceId) {
    throw new Error('Set TAVUS_PAL_ID or TAVUS_FACE_ID')
  }

  const body: Record<string, unknown> = {
    conversation_name: input.conversation_name ?? 'Interactive Resume',
  }

  if (palId) body.pal_id = palId
  if (faceId) body.face_id = faceId
  if (input.conversational_context) {
    body.conversational_context = input.conversational_context
  }
  if (input.custom_greeting) {
    body.custom_greeting = input.custom_greeting
  }

  // Keep guided prompts short so visitors don't burn conversation minutes.
  body.properties = {
    max_call_duration: 120,
    participant_absent_timeout: 60,
  }

  return body
}

/** Push local knowledge/*.md to the remote Tavus PAL system_prompt. */
export async function syncPalSystemPrompt(): Promise<{ synced: boolean; hash: string }> {
  const palId = process.env.TAVUS_PAL_ID?.trim()
  if (!palId) {
    throw new Error('TAVUS_PAL_ID is required to sync system prompt remotely')
  }

  const prompt = buildSystemPromptFromKnowledge()
  const hash = systemPromptHash(prompt)

  if (hash === lastSyncedPromptHash) {
    return { synced: false, hash }
  }

  const apiKey = requireApiKey()
  const llmModel = process.env.TAVUS_LLM_MODEL?.trim() || 'tavus-gpt-4.1'
  const response = await fetch(
    `https://tavusapi.com/v2/pals/${encodeURIComponent(palId)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify([
        {
          op: 'replace',
          path: '/system_prompt',
          value: prompt,
        },
        // Existing PALs may still reference deprecated tavus-llama* models;
        // Tavus revalidates layers on patch, so keep LLM on a supported model.
        {
          op: 'replace',
          path: '/layers/llm/model',
          value: llmModel,
        },
      ]),
    },
  )

  // 304 = unchanged remotely; treat as success so conversations can still start.
  if (!response.ok && response.status !== 304) {
    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>
    const message =
      (typeof data.message === 'string' && data.message) ||
      (typeof data.error === 'string' && data.error) ||
      `Tavus PAL patch error ${response.status}`
    throw new Error(message)
  }

  lastSyncedPromptHash = hash
  return { synced: true, hash }
}

export async function createConversation(
  input: CreateConversationInput = {},
): Promise<TavusConversation> {
  // Keep the remote PAL aligned with repo knowledge before opening a room.
  if (process.env.TAVUS_PAL_ID?.trim()) {
    await syncPalSystemPrompt()
  }

  const apiKey = requireApiKey()
  const response = await fetch('https://tavusapi.com/v2/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(buildCreateBody(input)),
  })

  const data = (await response.json()) as Record<string, unknown>

  if (!response.ok) {
    const message =
      (typeof data.message === 'string' && data.message) ||
      (typeof data.error === 'string' && data.error) ||
      `Tavus error ${response.status}`
    throw new Error(message)
  }

  const conversation_id = data.conversation_id
  const conversation_url = data.conversation_url

  if (typeof conversation_id !== 'string' || typeof conversation_url !== 'string') {
    throw new Error('Tavus response missing conversation_id or conversation_url')
  }

  return { conversation_id, conversation_url }
}

export async function endConversation(conversationId: string): Promise<void> {
  const apiKey = requireApiKey()
  const response = await fetch(
    `https://tavusapi.com/v2/conversations/${encodeURIComponent(conversationId)}`,
    {
      method: 'DELETE',
      headers: {
        'x-api-key': apiKey,
      },
    },
  )

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>
    const message =
      (typeof data.message === 'string' && data.message) ||
      (typeof data.error === 'string' && data.error) ||
      `Tavus error ${response.status}`
    throw new Error(message)
  }
}

export function getLastSyncedPromptHash(): string | null {
  return lastSyncedPromptHash
}
