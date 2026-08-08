type CreateConversationInput = {
  conversational_context?: string
  custom_greeting?: string
  conversation_name?: string
}

type TavusConversation = {
  conversation_id: string
  conversation_url: string
}

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
    conversation_name: input.conversation_name ?? 'Tavus Interactive Resume',
  }

  if (palId) body.pal_id = palId
  if (faceId) body.face_id = faceId
  if (input.conversational_context) {
    body.conversational_context = input.conversational_context
  }
  if (input.custom_greeting) {
    body.custom_greeting = input.custom_greeting
  }

  return body
}

export async function createConversation(
  input: CreateConversationInput = {},
): Promise<TavusConversation> {
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
