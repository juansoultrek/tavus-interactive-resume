import { useState } from 'react'
import './App.css'
import { Conversation } from './components/cvi/components/conversation'
import { PROMPTS } from '../shared/prompts'
import {
  createConversation,
  endConversation,
  type TavusConversation,
} from './api'

function App() {
  const [conversation, setConversation] = useState<TavusConversation | null>(null)
  const [startingPromptId, setStartingPromptId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleStart(promptId?: string) {
    setStartingPromptId(promptId ?? 'open')
    setError(null)

    try {
      const next = await createConversation(
        promptId
          ? { promptId }
          : {
              conversation_name: 'Tavus Interactive Resume',
              custom_greeting:
                'Hi — I am Juan. Ask me about my work, skills, or experience.',
            },
      )
      setConversation(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation')
    } finally {
      setStartingPromptId(null)
    }
  }

  async function handleLeave() {
    if (conversation) {
      await endConversation(conversation.conversation_id)
    }
    setConversation(null)
  }

  if (conversation) {
    return (
      <div className="call">
        <Conversation
          conversationUrl={conversation.conversation_url}
          onLeave={handleLeave}
        />
      </div>
    )
  }

  const isStarting = startingPromptId !== null

  return (
    <main className="home">
      <h1>Tavus Interactive Resume</h1>
      <p>Pick a question to start a video conversation with Juan’s AI persona.</p>

      <ul className="prompts">
        {PROMPTS.map((prompt) => (
          <li key={prompt.id}>
            <button
              type="button"
              onClick={() => handleStart(prompt.id)}
              disabled={isStarting}
            >
              {startingPromptId === prompt.id ? 'Starting…' : prompt.label}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="open-chat"
        onClick={() => handleStart()}
        disabled={isStarting}
      >
        {startingPromptId === 'open' ? 'Starting…' : 'Start open conversation'}
      </button>

      {error ? <p className="error" role="alert">{error}</p> : null}
    </main>
  )
}

export default App
