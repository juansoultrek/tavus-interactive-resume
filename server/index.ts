import express from 'express'
import { getPromptById } from '../shared/prompts.ts'
import { createConversation, endConversation } from './tavus.ts'

const app = express()
const port = Number(process.env.PORT) || 8787

app.disable('x-powered-by')
app.use(express.json({ limit: '32kb' }))

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    tavusApiKeySet: Boolean(process.env.TAVUS_API_KEY?.trim()),
    palIdSet: Boolean(process.env.TAVUS_PAL_ID?.trim()),
    faceIdSet: Boolean(process.env.TAVUS_FACE_ID?.trim()),
  })
})

app.post('/api/conversations', async (req, res) => {
  try {
    const promptId = typeof req.body?.promptId === 'string' ? req.body.promptId : undefined
    const prompt = promptId ? getPromptById(promptId) : undefined

    if (promptId && !prompt) {
      res.status(400).json({ error: `Unknown promptId: ${promptId}` })
      return
    }

    const conversational_context =
      prompt?.conversational_context ??
      (typeof req.body?.conversational_context === 'string'
        ? req.body.conversational_context
        : undefined)
    const custom_greeting =
      prompt?.custom_greeting ??
      (typeof req.body?.custom_greeting === 'string' ? req.body.custom_greeting : undefined)
    const conversation_name =
      typeof req.body?.conversation_name === 'string'
        ? req.body.conversation_name
        : prompt
          ? `Resume: ${prompt.label}`
          : 'Tavus Interactive Resume'

    const conversation = await createConversation({
      conversational_context,
      custom_greeting,
      conversation_name,
    })

    res.status(201).json(conversation)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create conversation'
    const status = message.includes('not set') || message.includes('Set TAVUS_') ? 500 : 502
    res.status(status).json({ error: message })
  }
})

app.post('/api/conversations/:id/end', async (req, res) => {
  try {
    await endConversation(req.params.id)
    res.status(204).send()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to end conversation'
    res.status(502).json({ error: message })
  }
})

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
