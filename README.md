# Tavus Interactive Resume

Vite + React + Express lab that starts a **Tavus** conversational video call from a **JSON prompt catalog**, using **`@tavus/cvi-ui`** (Daily under the hood — **no iframe**).

This repo is a **public, cloneable demo** built as part of the [juanvillegas.dev](https://juanvillegas.dev) / [Dev Playground](https://juansoultrek.com) lineup: same spirit as the Nango and Resend labs — something others can run locally, and a foundation for wiring an interactive resume on a personal site.

**Site-specific UI** (portfolio layout, branded botonera, how video sits on the page) does **not** have to live here. Keep this lab generic; put Juan-specific presentation in a private fork or in the `juanvillegas.dev` site that calls this API / mounts the call UI.

---

## Prerequisites

- **Node.js 20+** (see `engines` in `package.json`; `npm run dev:server` uses `node --env-file`).
- **npm** (this repo has a `package-lock.json`; prefer **`npm ci`**).
- A **Tavus** account with:
  - an API key
  - a **PAL** (`TAVUS_PAL_ID`) that already has a **default face** (or also set `TAVUS_FACE_ID`)

---

## Run on localhost (follow in order)

### 1. Install dependencies

At the repository root (directory that contains **`package.json`**):

```bash
npm ci
```

### 2. Create `.env` and prompts config

```bash
cp .env.example .env
cp config/prompts.example.json config/prompts.json
```

### 3. Minimum configuration

Edit `.env` and set:

| Variable | Purpose |
| --- | --- |
| `TAVUS_API_KEY` | Server-only key from the Tavus dashboard. |
| `TAVUS_PAL_ID` | PAL used for conversations **and** remote system-prompt sync. |
| `TAVUS_FACE_ID` | Optional if the PAL already has `default_face_id`. |
| `TAVUS_LLM_MODEL` | Optional; default `tavus-gpt-4.1` (used when syncing the PAL). |
| `PORT` | API port; default `8787`. |
| `APP_BASE_PATH` | Optional mount prefix (e.g. `/talk`) for production behind a subpath. |

> **Important:** `.env` must exist for `npm run dev:server` (`--env-file=.env`). Never commit `.env` or a filled `config/prompts.json`.

### 4. Knowledge files (behavior + bio template)

- [`knowledge/system-prompt.md`](knowledge/system-prompt.md) — PAL behavior (safe to keep generic in git).
- [`knowledge/persona.md`](knowledge/persona.md) — bio/knowledge template.

On each new conversation (and via `POST /api/sync-pal`), the server **PATCHes** the remote PAL so `system_prompt` matches those files.

For a **public** clone, leave `persona.md` as a template. Put a real bio only on the server (SCP) or in a private fork — see [docs/DEPLOY.md](docs/DEPLOY.md).

### 5. Start API + UI (two terminals)

```bash
npm run dev:server
```

```bash
npm run dev
```

- **API:** `http://localhost:8787` (Vite proxies `/api` and `/health`).
- **UI:** Vite URL, usually `http://localhost:5173`.

### 6. Try the UI

1. Expand a category and click a question (or **Start open conversation**).
2. Allow camera/microphone.
3. Wait until the Tavus face appears (past “Connecting”).

Deep link (auto-starts a prompt):

`http://localhost:5173/?prompt=who-professionally`

### 7. Health check (optional)

```bash
curl -sS http://localhost:8787/health
```

Confirm `tavusApiKeySet`, `palIdSet`, and `promptsLoaded` without exposing secrets.

Sync the PAL prompt explicitly:

```bash
curl -sS -X POST http://localhost:8787/api/sync-pal
```

---

## Prompts JSON

| File | In git? | Role |
| --- | --- | --- |
| `config/prompts.example.json` | Yes | Generic sample catalog |
| `config/prompts.json` | No (gitignored) | Local / production catalog |

The server maps `promptId` → `conversational_context` + `custom_greeting`.  
`GET /api/prompts` returns **labels only** for the UI.

---

## Production-like local run

```bash
npm run build
npm start
```

Express serves the Vite `dist/` build and the API. **`npm start` does not load `.env`** — export vars in the shell or use your host’s env (cPanel Application Manager), same idea as the Nango lab.

Passenger startup file: **`server.js`**.

---

## Environment variables (reference)

Full list: [`.env.example`](.env.example). Deploy notes (SSH, SCP for private prompts/bio): [docs/DEPLOY.md](docs/DEPLOY.md).

---

## Commit style

`Tavus Interactive Resume | short imperative summary`

---

## Deploy (GitHub Actions)

Push to **`main`** runs [`.github/workflows/deploy-ssh.yml`](.github/workflows/deploy-ssh.yml): build on Ubuntu, pack `dist` + `server` + production `node_modules`, SCP/extract on the host, `tmp/restart.txt`.

The bundle keeps **generic** knowledge/prompts. Upload real `config/prompts.json` and `knowledge/persona.md` with **SCP** on the server so they are not in the public history.

---

## Related

- Personal site: [juanvillegas.dev](https://juanvillegas.dev)
- Dev Playground: [juansoultrek.com](https://juansoultrek.com)
- Tavus CVI embed docs: [Embedding CVI](https://docs.tavus.io/sections/integrations/embedding-cvi)

---

## License

MIT
