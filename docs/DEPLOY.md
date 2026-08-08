# Deploy (cPanel / Namecheap)

This lab deploys as a **Node Passenger** app (same idea as the Nango lab). The public site `juanvillegas.dev` is separate and is **not** required to clone or run this repo.

## GitHub Actions

Workflow: [`.github/workflows/deploy-ssh.yml`](../.github/workflows/deploy-ssh.yml)

Secrets:

- `DEPLOY_SSH_HOST`
- `DEPLOY_SSH_PORT`
- `DEPLOY_SSH_USERNAME`
- `DEPLOY_SSH_PRIVATE_KEY`
- `DEPLOY_REMOTE_APP_DIR` — e.g. `public_html/talk.juanvillegas.dev`

The CI bundle ships **empty/generic** templates only. It does **not** overwrite your real bio or production prompts on the host.

## On the host (once)

1. Create a Node.js app in cPanel Application Manager.
2. Startup file: `server.js`
3. Set env vars: `TAVUS_API_KEY`, `TAVUS_PAL_ID`, optional `TAVUS_FACE_ID`, `TAVUS_LLM_MODEL`, `PORT` (Passenger), optional `APP_BASE_PATH` (leave empty on a subdomain root).
4. Point DNS (e.g. `talk.juanvillegas.dev`) at this app directory.

## Secrets / private content via SCP (not in git)

Keep real data **only on the server** (or a private machine), then upload:

```bash
# from your machine (paths are examples)
scp config/prompts.json user@host:~/path/to/app/config/prompts.json
scp knowledge/persona.md user@host:~/path/to/app/knowledge/persona.md
```

| File on server | In public repo? | Notes |
|----------------|-----------------|--------|
| `config/prompts.json` | No (gitignored) | Production question catalog |
| `knowledge/persona.md` | Template only in git | Real bio via SCP; CI does not ship this file |
| `knowledge/system-prompt.md` | Yes (generic) | Behavior prompt; safe to redeploy |
| `.env` / cPanel env | No | API keys |

After uploading `persona.md`, start a new conversation (or `POST /api/sync-pal`) so the server PATCHes the remote Tavus PAL.

The portfolio botonera on `juanvillegas.dev` can link to `https://talk.juanvillegas.dev/?prompt=<id>` later; keep prompt ids aligned with that catalog.
