import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createConversation, endConversation, getLastSyncedPromptHash, syncPalSystemPrompt } from './tavus.ts'
import { getPromptById, getPublicCatalog, loadPrompts } from './prompts.ts'

const app = express()
const port = Number(process.env.PORT) || 8787
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientDist = path.resolve(__dirname, '../dist')

function normalizeBase(raw: string | undefined): string {
  const t = raw?.trim().replace(/^["']|["']$/g, '') || ''
  if (!t || t === '/') return ''
  const withSlash = t.startsWith('/') ? t : `/${t}`
  return withSlash.replace(/\/+$/, '')
}

const MOUNT = normalizeBase(process.env.APP_BASE_PATH) || normalizeBase(process.env.BASE_PATH)

app.disable('x-powered-by')
app.use(express.json({ limit: '32kb' }))

const routes = express.Router()

routes.get('/health', (_req, res) => {
  let promptsLoaded = false
  try {
    loadPrompts()
    promptsLoaded = true
  } catch {
    promptsLoaded = false
  }

  res.json({
    ok: true,
    basePath: MOUNT || '/',
    tavusApiKeySet: Boolean(process.env.TAVUS_API_KEY?.trim()),
    palIdSet: Boolean(process.env.TAVUS_PAL_ID?.trim()),
    faceIdSet: Boolean(process.env.TAVUS_FACE_ID?.trim()),
    promptsLoaded,
    palPromptSyncedHash: getLastSyncedPromptHash(),
  })
})

routes.post('/api/sync-pal', async (_req, res) => {
  try {
    const result = await syncPalSystemPrompt()
    res.json({ ok: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sync PAL'
    res.status(502).json({ error: message })
  }
})

routes.get('/api/prompts', (_req, res) => {
  try {
    res.json(getPublicCatalog())
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load prompts'
    res.status(500).json({ error: message })
  }
})

routes.post('/api/conversations', async (req, res) => {
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
          : 'Interactive Resume'

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

routes.post('/api/conversations/:id/end', async (req, res) => {
  try {
    await endConversation(req.params.id)
    res.status(204).send()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to end conversation'
    res.status(502).json({ error: message })
  }
})

if (fs.existsSync(clientDist)) {
  routes.use(express.static(clientDist))
  routes.get(['/', '/talk', '/talk/'], (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

if (MOUNT) {
  app.use(MOUNT, routes)
}
app.use(routes)

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}${MOUNT || ''}`)
})
