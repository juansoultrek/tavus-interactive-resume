# Tavus Interactive Resume

A small demo app where visitors click interview-style questions and talk **face-to-face on video** with an AI persona (powered by [Tavus](https://www.tavus.io)). Useful as a starting point for an interactive resume or portfolio “talk to me” experience.

Under the hood: **Vite + React**, **Express**, and Tavus’s conversational video UI (**no iframe**), with questions loaded from a **JSON** catalog.

---

## Prerequisites

- **Node.js 20+** (see `engines` in `package.json`; `npm run dev:server` uses `node --env-file`).
- **npm** (this repo has a `package-lock.json`; prefer **`npm ci`**).
- A **Tavus** account with an API key and a **PAL** that has a default face (or also set `TAVUS_FACE_ID`).

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
| `TAVUS_PAL_ID` | PAL used for conversations and remote system-prompt sync. |
| `TAVUS_FACE_ID` | Optional if the PAL already has `default_face_id`. |
| `TAVUS_LLM_MODEL` | Optional; default `tavus-gpt-4.1` (used when syncing the PAL). |
| `PORT` | API port; default `8787`. |
| `APP_BASE_PATH` | Optional mount prefix (e.g. `/talk`) behind a reverse proxy. |

> **Important:** `.env` must exist for `npm run dev:server` (`--env-file=.env`). Never commit `.env` or a filled `config/prompts.json`.

### 4. Knowledge files

- [`knowledge/system-prompt.md`](knowledge/system-prompt.md) — PAL behavior.
- [`knowledge/persona.md`](knowledge/persona.md) — bio/knowledge template.

On each new conversation (and via `POST /api/sync-pal`), the server **PATCHes** the remote PAL so `system_prompt` matches those files. Keep real personal bios out of public git history if you publish the repo.

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

Deep link: `http://localhost:5173/?prompt=who-professionally`

### 7. Health check (optional)

```bash
curl -sS http://localhost:8787/health
```

```bash
curl -sS -X POST http://localhost:8787/api/sync-pal
```

---

## Prompts JSON

| File | In git? | Role |
| --- | --- | --- |
| `config/prompts.example.json` | Yes | Sample catalog |
| `config/prompts.json` | No (gitignored) | Your local catalog |

The server maps `promptId` → `conversational_context` + `custom_greeting`.  
`GET /api/prompts` returns **labels only** for the UI.

---

## Production-like local run

```bash
npm run build
npm start
```

Express serves the Vite `dist/` build and the API. **`npm start` does not load `.env`** — export vars in the shell or your host’s process manager.

Passenger-style hosts can use **`server.js`** as the startup file.

---

## Deploy workflow (optional)

[`.github/workflows/deploy-ssh.yml`](.github/workflows/deploy-ssh.yml) is **optional**. It is wired for the author’s SSH/cPanel deploy (GitHub Secrets + remote extract + `tmp/restart.txt`).

If you clone this repo:

- You **do not need** that workflow to run the app locally.
- Leave it unused, delete it, or replace it with your own hosting.
- Extra notes (SCP for private prompts/bio): [docs/DEPLOY.md](docs/DEPLOY.md).

Do **not** put the workflow in `.gitignore` if you still want Actions to deploy *your* fork when you push — clones simply skip configuring those secrets.

---

## Commit style

`Tavus Interactive Resume | short imperative summary`

---

## License

MIT
