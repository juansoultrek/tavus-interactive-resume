import { useEffect, useRef, useState } from 'react'
import './App.css'
import { Conversation } from './components/cvi/components/conversation'
import {
  createConversation,
  endConversation,
  fetchPromptCatalog,
  type PublicCatalog,
  type TavusConversation,
} from './api'

function readPromptIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  const fromQuery = params.get('prompt')?.trim()
  if (fromQuery) return fromQuery

  const path = window.location.pathname.replace(/\/+$/, '')
  if (path.endsWith('/talk')) {
    return params.get('prompt')?.trim() || null
  }

  return null
}

function App() {
  const [catalog, setCatalog] = useState<PublicCatalog | null>(null)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<TavusConversation | null>(null)
  const [startingPromptId, setStartingPromptId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const autoStarted = useRef(false)

  useEffect(() => {
    let cancelled = false

    fetchPromptCatalog()
      .then((data) => {
        if (!cancelled) setCatalog(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setCatalogError(err instanceof Error ? err.message : 'Failed to load prompts')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function handleStart(promptId?: string) {
    setStartingPromptId(promptId ?? 'open')
    setError(null)

    try {
      const next = await createConversation(
        promptId
          ? { promptId }
          : {
              conversation_name: 'Interactive Resume',
              custom_greeting:
                'Hi — ask me about my work, skills, or experience.',
            },
      )
      setConversation(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation')
    } finally {
      setStartingPromptId(null)
    }
  }

  useEffect(() => {
    if (autoStarted.current || !catalog) return
    const promptId = readPromptIdFromUrl()
    if (!promptId) return
    autoStarted.current = true
    void handleStart(promptId)
  }, [catalog])

  async function handleLeave() {
    if (conversation) {
      await endConversation(conversation.conversation_id)
    }
    setConversation(null)

    const url = new URL(window.location.href)
    url.searchParams.delete('prompt')
    window.history.replaceState({}, '', url.pathname + url.search)
  }

  function toggleCategory(categoryId: string) {
    setOpenCategoryId((current) => (current === categoryId ? null : categoryId))
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
      <h1>Interactive Resume</h1>
      <p>
        Choose a category, then pick a question to start a video conversation with the AI
        persona.
      </p>

      {catalogError ? <p className="error" role="alert">{catalogError}</p> : null}

      {!catalog && !catalogError ? <p className="muted">Loading prompts…</p> : null}

      {catalog ? (
        <ul className="categories">
          {catalog.categories.map((category) => {
            const isOpen = openCategoryId === category.id

            return (
              <li key={category.id} className={isOpen ? 'category open' : 'category'}>
                <button
                  type="button"
                  className="category-toggle"
                  aria-expanded={isOpen}
                  onClick={() => toggleCategory(category.id)}
                >
                  <span>{category.label}</span>
                  <span className="chevron" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen ? (
                  <ul className="prompts">
                    {category.prompts.map((prompt) => (
                      <li key={prompt.id}>
                        <button
                          type="button"
                          className="prompt"
                          onClick={() => handleStart(prompt.id)}
                          disabled={isStarting}
                        >
                          {startingPromptId === prompt.id ? 'Starting…' : prompt.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}

      <button
        type="button"
        className="open-chat"
        onClick={() => handleStart()}
        disabled={isStarting || !catalog}
      >
        {startingPromptId === 'open' ? 'Starting…' : 'Start open conversation'}
      </button>

      {error ? <p className="error" role="alert">{error}</p> : null}
    </main>
  )
}

export default App
