# AXIOM Command — implementation tracking DB

NeonDB (Postgres) tables that mirror [`../docs/IMPLEMENTATION_PLAN.md`](../docs/IMPLEMENTATION_PLAN.md)
so build progress can be **stored, updated, and monitored**.

## Tables
- **`phases`** — the 5 delivery phases (Alpha → 2.0) with window + rollup status.
- **`features`** — 21 features (AX-101…AX-206) with priority, status, progress (0–100), target window, owner, notes.
- **`phase_progress`** (view) — per-phase average progress and done/wip/blocked/planned counts for monitoring.

## Setup
```bash
cd db
npm install                       # installs pg
export DATABASE_URL='postgresql://USER:PASS@HOST/DB?sslmode=require'   # Neon connection string
# (or: vercel env pull ../.env.local  then export the value)
npm run apply                     # creates tables + seeds phases/features (idempotent)
```

## Daily use
```bash
node status.mjs                   # full dashboard (phases + features)
node status.mjs alpha             # one phase

# update a feature as you build:
node update.mjs AX-101 in_progress 40 "BLE pairing handshake working"
node update.mjs AX-102 done 100
node update.mjs AX-105 blocked 20 "waiting on GNSS stretch module"

# set a phase status directly (also auto-rolls from features on each update):
node update.mjs phase alpha in_progress
```

## Notes
- `apply.mjs` is **idempotent** and uses upserts — re-running refreshes feature *definitions*
  without clobbering live `status` / `progress` / `notes`.
- `updated_at` auto-bumps via trigger on every row change.
- Connection string is read from `DATABASE_URL` / `POSTGRES_URL` — never hard-code it; `.env.local` is git-ignored.
