/**
 * Local convenience only. Production Passenger must use server.cjs
 * (CommonJS) — see docs/DEPLOY.md.
 */
import 'tsx/esm'
await import('./server/index.ts')
