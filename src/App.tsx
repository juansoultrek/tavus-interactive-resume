import { useState } from 'react'
import './App.css'
import { Conversation } from './components/cvi/components/conversation'
import {
  createConversation,
  endConversation,
  type TavusConversation,
} from './api'

function App() {
  const [conversation, setConversation] = useState<TavusConversation | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStart() {
    setIsStarting(true)
    setError(null)

    try {
      const next = await createConversation({
        conversation_name: 'Tavus Interactive Resume',
        custom_greeting: 'Hi — I am Juan. Ask me about my work, skills, or experience.',
      })
      setConversation(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation')
    } finally {
      setIsStarting(false)
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

  return (
    <main className="home">
      <h1>Tavus Interactive Resume</h1>
      <p>Talk with an AI persona of Juan about his work and experience.</p>
      <button type="button" onClick={handleStart} disabled={isStarting}>
        {isStarting ? 'Starting…' : 'Start conversation'}
      </button>
      {error ? <p className="error" role="alert">{error}</p> : null}
    </main>
  )
}

export default App
