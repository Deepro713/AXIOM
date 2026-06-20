# 06 · Readiness Sign-off — AXIOM Command (web client)

> **Stage:** Readiness (AiNa pipeline) · Reads: [`04-dev-notes.md`](04-dev-notes.md), [`05-security.md`](05-security.md), the deploy config · **Feeds:** Marketing (07)
> Deploy → onboarding → cost → DR, consolidated into a go/no-go for the **Alpha web client** shipping to the Vercel project.

---

## Verdict

**GO** *(for the Alpha simulator web client)* — with two awareness notes carried forward to Beta.

The web client is a **static-prerendered Next.js app on Vercel with no backend in the hot path, no user data leaving the browser, and a verified green build**. There is nothing that can cause a customer-facing incident or data loss at this scope. The Beta/1.0 milestones (real transports, cloud sync) will need their own readiness pass — flagged below, not blocking now.

## Readiness register

| # | Area | Finding | Severity | Fix (1 sentence) |
|---|------|---------|----------|------------------|
| 1 | Deploy | `/` and `/app` prerender static; Vercel Git integration auto-deploys `main`; instant rollback available | NOTE | None — already wired (`prj_k8az1nvGA5q3i0rmbNzbifnMtIgD`) |
| 2 | Onboarding | First run boots straight into the simulator; the `alpha-flag` banner sets expectations ("running against a device simulator") | NOTE | Keep the banner until real transports land |
| 3 | Cost | Static Next.js on Vercel + an idle Neon tracking DB; near-zero marginal cost | NOTE | None |
| 4 | DR | App state is `localStorage`-only (device, settings, vault); a browser/storage wipe loses local captures | IMPORTANT | Acceptable for simulator data; real captures need IndexedDB + the opt-in E2E cloud backup (1.0) before users trust the vault with irreplaceable data |
| 5 | Observability | Vercel build/runtime logs only; no client error tracking | IMPORTANT | Add Sentry for the web client in Beta (crash-free ≥99.5% is a launch gate) |
| 6 | Onboarding | No automated browser test of the SPA's interactive paths | NOTE | Add a Playwright smoke test (pair → health → cast → vault) before Beta |

## Blockers
None for the Alpha web client. The IMPORTANT items (#4 vault durability, #5 error tracking) are **Beta** work and do not gate the current ship.

## Production cost summary
- **Monthly (expected tier):** ~$0–20 — static hosting + CI on Vercel (within Hobby/Pro), plus an idle Neon Postgres branch for tracking. No AI inference, blob storage, or push in this scope.
- **Scale trigger:** the bandwidth-heavy paths (cast, mirror, capture sync) run **device↔app direct**, not through Vercel — so the server stays read-mostly. First real cost step is **cloud sync (1.0)**: blob storage egress + Postgres rows + push fan-out.
- **vs. braindoc estimate:** on-track (braindoc projected a near-zero local-first floor with cloud/AI as the cost driver later).

## Go-live checklist (Alpha web client)
- [x] `npm run build` green; `/app` prerenders static _(source: Deploy)_
- [x] `npm start` + `curl /app` → 200; shell renders _(source: Deploy)_
- [x] `.env*` git-ignored; no secrets in client bundle _(source: Deploy / Security)_
- [x] Alpha simulator banner present and dismissible _(source: Onboarding)_
- [ ] Manual browser smoke test: pair → Health → Cast → **Vault search/capture** → Firmware → Settings _(source: Onboarding)_
- [ ] Confirm Vercel production alias (`get-axiom.vercel.app`) points at the merged commit _(source: Deploy)_
- [ ] File Beta readiness items: Sentry (#5), IndexedDB+E2E vault durability (#4), Playwright smoke (#6) _(source: DR / Observability)_

## What's in good shape
- **Deploy path is boringly reliable** — push `main` → Vercel preview → prod, with one-click rollback; nothing bespoke to break.
- **Onboarding is honest** — the app states it's simulator-backed, so no user is misled about hardware.
- **Cost is essentially free at Alpha** — local-first means the server does almost nothing.
- **Build is verifiably green** — the new Vault slice compiles and serves; no regression to existing views.
