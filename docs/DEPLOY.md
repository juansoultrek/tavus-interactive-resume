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

## On the host (once)

1. Create a Node.js app in cPanel Application Manager.
2. Startup file: `server.js`
3. Set env vars: `TAVUS_API_KEY`, `TAVUS_PAL_ID` and/or `TAVUS_FACE_ID`, `PORT` (Passenger), optional `APP_BASE_PATH` (leave empty on a subdomain root).
4. Upload **your** `config/prompts.json` on the server (gitignored; not in the CI bundle).  
   First deploy copies `prompts.example.json` → `prompts.json` only if none exists yet — replace it with your real catalog for production.
5. Point DNS (e.g. `talk.juanvillegas.dev`) at this app directory.

The portfolio botonera on `juanvillegas.dev` can link to `https://talk.juanvillegas.dev/?prompt=<id>` later; keep prompt ids aligned with that catalog.
