# Deploy notes (optional)

The GitHub Action [`.github/workflows/deploy-ssh.yml`](../.github/workflows/deploy-ssh.yml) is an **example** SSH deploy for a Node/Passenger host (build on Ubuntu → pack → SCP → extract → `tmp/restart.txt`).

Clones can **ignore or delete** that workflow. Local `npm run dev` / `npm run build` do not use it.

## If you use the workflow

GitHub Secrets (typical):

- `DEPLOY_SSH_HOST`
- `DEPLOY_SSH_PORT`
- `DEPLOY_SSH_USERNAME`
- `DEPLOY_SSH_PRIVATE_KEY`
- `DEPLOY_REMOTE_APP_DIR`

On the host: Node app, startup file `server.js`, env vars from `.env.example`.

## Private content via SCP

Keep real catalogs/bios off public git:

```bash
scp config/prompts.json user@host:~/path/to/app/config/prompts.json
scp knowledge/persona.md user@host:~/path/to/app/knowledge/persona.md
```

The CI bundle ships generic templates only; it does not upload your private `prompts.json` / filled `persona.md`.
