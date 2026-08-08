export type TavusConversation = {
  conversation_id: string
  conversation_url: string
}

export type CreateConversationBody = {
  conversational_context?: string
  custom_greeting?: string
  conversation_name?: string
}

export async function createConversation(
  body: CreateConversationBody = {},
): Promise<TavusConversation> {
  const response = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>

  if (!response.ok) {
    const message =
      (typeof data.error === 'string' && data.error) ||
      `Failed to create conversation (${response.status})`
    throw new Error(message)
  }

  if (
    typeof data.conversation_id !== 'string' ||
    typeof data.conversation_url !== 'string'
  ) {
    throw new Error('API response missing conversation_id or conversation_url')
  }

  return {
    conversation_id: data.conversation_id,
    conversation_url: data.conversation_url,
  }
}

export async function endConversation(conversationId: string): Promise<void> {
  await fetch(`/api/conversations/${encodeURIComponent(conversationId)}/end`, {
    method: 'POST',
  }).catch(() => undefined)
}
