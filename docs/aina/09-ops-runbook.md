# 09 · Ops Runbook — AXIOM Command (web client)

> **Stage:** Ops (AiNa pipeline · final) · Reads: all prior stages + the deploy config
> **Deviation from template:** the Ops persona templates assume Docker + a VPS. This app deploys to **Vercel** via Git integration, so this runbook is the Vercel-native equivalent (no Dockerfile, no compose, no nginx). Kept as one consolidated doc in `docs/aina/` per the docs-location decision.

---

## Deployment & operations

### Quick deploy (Vercel · Git integration)
1. Code lives in `Deepro713/AXIOM`; Vercel project `prj_k8az1nvGA5q3i0rmbNzbifnMtIgD` (team `team_UDOBzYTQ5y9nsi4o0gU2BJL0`).
2. **Push to `main`** → Vercel auto-builds (`next build`) and deploys to production. **Open a PR** → Vercel posts a **preview URL** automatically.
3. No manual deploy step. (Manual fallback: `vercel --prod` from the repo root.)
4. Production alias: **`get-axiom.vercel.app`** → `/` (landing), `/app` (Command), `/command.html` (marketing).
5. Framework auto-detected (Next.js 15, Node 24); no custom build command required. `vercel.json` holds only minimal config.

### Environment variables
| Var | Scope | Required to run app? | Notes |
|---|---|---|---|
| `DATABASE_URL` | server (tracking) | No | Neon connection for `db/*.mjs`; never shipped to client |
| `NEON_*` | provisioning | No | optional helper vars |
| *(future)* `ANTHROPIC_API_KEY` | server | No | AI Copilot, V1.1 |
| *(future)* `BLOB_READ_WRITE_TOKEN` | server | No | capture cloud, 1.0 |
Set via `vercel env` or the dashboard. Locally they live in `.env.local` (git-ignored).

### Infrastructure requirements
- **Compute:** Vercel Fluid Compute — the app is static-prerendered (`/`, `/app`, `/command.html`); no always-on server. The device session runs entirely client-side.
- **Database:** Neon Postgres (serverless), used only by the tracking layer; idle otherwise.
- **No** container host, load balancer, or manual SSL — Vercel manages TLS and CDN.

### Health checks & monitoring
- **Health signal:** `GET /app` and `GET /` return 200 with the rendered shell (used in the go-live check). No custom `/health` route is needed for a static app; add one only when server routes (tracking API) ship.
- **Monitoring today:** Vercel build logs + runtime logs + deployment status. **Add in Beta:** Sentry for the web client (capture client exceptions; crash-free ≥99.5% is the launch gate) and an external uptime check on `/app`.
- **Key metrics when server routes land:** tracking-API error rate, Neon connection errors, p95 route latency.

### SLO targets
| SLO | Target | Source |
|---|---|---|
| `/app` availability | ≥ 99.9% (Vercel CDN) | Deploy |
| Dashboard cold-open | < 1.5 s | PRD §10 |
| Telemetry render (local) | < 1 s | PRD §10 |
| Crash-free sessions | ≥ 99.5% | PRD §5 (Beta gate) |

### Rollback
- **Instant:** Vercel dashboard → Deployments → pick the last good deployment → **Promote to Production** (or `vercel rollback`). Takes effect immediately; no rebuild.
- **Source rollback:** `git revert <sha>` → push `main` → auto-redeploy.
- Schema/DB changes are **forward-only** and committed; never edit an applied migration.

### Backup & restore
- **App:** stateless — the deployment artifact is rebuildable from `main`. No app data lives on the server.
- **User data:** lives in the browser (`localStorage`: device/settings/vault). A browser/storage wipe loses local captures — acceptable for simulator data; durable capture backup arrives with **IndexedDB + opt-in E2E cloud sync (1.0)**.
- **Tracking DB:** Neon point-in-time restore / branch snapshots; schema is reproducible from `db/schema.sql` + `db/seed.sql`.

---

## Runbooks

### RB-1 · Bad deploy in production
1. Confirm via Vercel runtime logs / a failing `curl https://get-axiom.vercel.app/app`.
2. Vercel → Deployments → **Promote** the last known-good deployment (instant rollback).
3. Reproduce locally: `npm run build` — fix the cause on a branch, open a PR (preview URL verifies the fix), merge.

### RB-2 · `/app` renders blank / SPA fails to boot
1. Check the browser console for an error in the lazy-imported `lib/*.js`.
2. Verify `window.__axiomBooted` guard and that all three modules import in order (device-sim → transport → command).
3. `node -c app/app/lib/command.js` to rule out a syntax error; `npm run build` to catch type/import breakage. Rollback (RB-1) if production is affected while you fix.

### RB-3 · Tracking DB unreachable (`db/*.mjs` errors)
1. This does **not** affect the app — only `node db/status.mjs`/`update.mjs`.
2. Verify `DATABASE_URL` is set and the Neon branch is awake; re-run. Re-apply schema with `node db/apply.mjs` if needed (idempotent).

### Maintenance window procedure
The app has no stateful server, so maintenance is generally zero-downtime (Vercel atomic deploys). For a deliberate freeze: announce in the repo, hold merges to `main`, perform the change on a branch, verify via preview URL, then merge.

---

## Go-live checklist (Alpha web client)

### Build & deploy
- [x] `npm run build` succeeds locally (no restart loops; static pages generated)
- [x] `npm start` + `curl /app` → 200
- [ ] PR preview URL renders `/`, `/app`, and `/command.html`
- [ ] Merge to `main` → Vercel production deploy succeeds
- [ ] Production alias `get-axiom.vercel.app` points at the merged commit

### Application
- [x] `.env*` git-ignored; no secrets in the client bundle
- [x] Alpha simulator banner present and dismissible
- [ ] Manual browser smoke: pair → Health → Cast → **Vault (search + simulate capture)** → Firmware → Settings
- [ ] `/command.html` CTAs link correctly to `/app` and `/`

### Data / tracking
- [ ] `node db/status.mjs` reflects current phase/feature status (AX-106 → done)
- [ ] Neon branch reachable; schema reproducible from `db/`

### Monitoring & handover
- [ ] Vercel deploy notifications on for the project
- [ ] Beta items filed: Sentry, external uptime check, Playwright smoke, IndexedDB+E2E vault durability
- [ ] This pipeline's docs (`docs/aina/*`) committed
- [ ] Product owner sign-off

### Sign-off
| Role | Name | Date |
|------|------|------|
| Tech Lead | | |
| Product Owner | | |

---

## Ops summary
- **Stack:** Next.js 15 + React 19 (static-prerendered) on **Vercel**; Neon Postgres for tracking only.
- **Hosting model:** serverless / CDN (Vercel Fluid Compute) — no containers, no VPS, no manual SSL.
- **DB + backup:** Neon serverless Postgres; point-in-time restore + schema reproducible from `db/`. App is stateless; user data is browser-local until 1.0 cloud sync.
- **Monitoring:** Vercel logs now; add Sentry + external uptime in Beta.
- **SLOs:** ≥99.9% availability, <1.5 s cold-open, <1 s telemetry render, ≥99.5% crash-free.
- **Runbooks:** 3 (bad deploy, SPA boot failure, tracking DB) + maintenance procedure.
- **Outstanding gaps:** client error tracking, browser smoke automation, and durable capture backup are all Beta-scoped, not Alpha blockers.
