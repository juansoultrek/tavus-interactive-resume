# Tavus Interactive Resume

Cloneable lab: start a **Tavus** conversational video session from a JSON prompt catalog. Stack is **Vite + React**, **Express**, and **`@tavus/cvi-ui`** (no iframe).

## Prerequisites

- Node.js 20+
- A Tavus account with a face/replica and a PAL
- `TAVUS_API_KEY` plus `TAVUS_PAL_ID` and/or `TAVUS_FACE_ID`

## Setup

```bash
npm install
cp .env.example .env
cp config/prompts.example.json config/prompts.json
```

Edit `.env` with your Tavus credentials. Edit `config/prompts.json` with your categories and questions (or keep the generic example).

Fill `knowledge/persona.md` with your bio. `knowledge/system-prompt.md` is the behavior prompt.

On each new conversation (and via `POST /api/sync-pal`), the server **PATCHes** your remote Tavus PAL (`TAVUS_PAL_ID`) so `system_prompt` matches those files. No manual paste in the Tavus dashboard required after the first PAL exists.

## Run locally

Two terminals:

```bash
npm run dev:server
npm run dev
```

- UI: Vite URL (proxies `/api` and `/health` to the Express server)
- Health: `http://localhost:8787/health`

Deep link (auto-starts a prompt):

`http://localhost:5173/?prompt=who-professionally`

In production the same query works on `/` or `/talk`.

## Prompts JSON

- `config/prompts.example.json` — committed sample (generic, no personal brand)
- `config/prompts.json` — your local/production catalog (**gitignored**)

The server resolves `promptId` to `conversational_context` + `custom_greeting`.  
`GET /api/prompts` returns labels only for the UI.

## Production

```bash
npm run build
npm start
```

Express serves the Vite `dist/` build and the API. Optional `APP_BASE_PATH` (e.g. `/talk`) mounts the app under a subpath. For a dedicated subdomain, leave `APP_BASE_PATH` empty.

On cPanel/Passenger, startup file: `server.js`. Put secrets and `config/prompts.json` on the host only — do not commit production prompts or API keys.

See [docs/DEPLOY.md](docs/DEPLOY.md) for SSH deploy and subdomain notes.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite front end |
| `npm run dev:server` | Express API (loads `.env`) |
| `npm run build` | Typecheck + Vite production build |
| `npm start` | Serve API + `dist/` |

## License

MIT
