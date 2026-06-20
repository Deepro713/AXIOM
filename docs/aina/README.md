# AXIOM Command — AiNa Pipeline Document Set

The product package produced by running the **AiNa App Factory** pipeline over
[`../PRD_AXIOM_Command_App.md`](../PRD_AXIOM_Command_App.md). The headline deliverable is
this document set — one detailed doc per stage — with working code and marketing alongside.

**Chosen path:** docs in this repo · extend the existing Next.js `/app` · full 8 stages ·
marketing doc **+** product page. **Build variant:** `tier_recommended` (full connect-and-observe
web client on the existing stack with a frozen transport-adapter seam).

## The document set

| # | Stage | Document | What it captures |
|---|-------|----------|------------------|
| 01 | Intake | [`01-braindoc.md`](01-braindoc.md) | Framed problem, personas, V1 in/out, economics, risks, DevOps, delivery |
| 02 | Intent | [`02-intent-sow.md`](02-intent-sow.md) | Domain dynamics, scope of work, impact, 3-yr longevity, dependencies, 3 build variants |
| 03 | Ideation | [`03-ideation-prd.md`](03-ideation-prd.md) | Technical PRD: posture, data model, API, UX, NFRs, P0/P1 features (grounded in the live code) |
| 04 | Dev | [`04-dev-notes.md`](04-dev-notes.md) | Real architecture, current feature state, the Vault slice shipped, what's stubbed, next slice |
| 05 | Security | [`05-security.md`](05-security.md) | Threat model + finding register → **CONDITIONAL** clearance |
| 06 | Readiness | [`06-readiness.md`](06-readiness.md) | Deploy/onboarding/cost/DR → **GO** for the Alpha web client |
| 07 | Marketing | [`07-marketing.md`](07-marketing.md) | Positioning, persona, voice, taglines, messaging, FAQ, GTM |
| 08 | Docs | [`08-user-docs.md`](08-user-docs.md) | User walkthroughs + developer guide + architecture diagram |
| 09 | Ops | [`09-ops-runbook.md`](09-ops-runbook.md) | Vercel-native deploy, monitoring, SLOs, rollback, runbooks, go-live checklist |

## Code & marketing produced this run

- **Capture Vault (AX-106)** — new `/app` view: seeded library, live auto-capture from radio
  activity, full-text + tag search, expandable detail with versioning/geotag, delete, localStorage
  persistence. Files: `app/app/lib/command.js`, `app/app/command.css`. *Additive; build verified.*
- **AXIOM Command marketing page** — [`/command.html`](../../public/command.html), brand-consistent
  (DKube design system), self-contained, links into `/app`. Distinct from the device Kickstarter
  landing at `/`.

## How the stages threaded forward
Each stage read the prior docs and the live code, so scope compounded rather than restarted:
braindoc framed it → intent picked the variant + boundaries → ideation turned that into a PRD grounded
in `device-sim.js`/`transport.js`/`command.js` → dev built the one missing P0 feature and documented the
rest → security/readiness cleared the actual build → marketing/docs/ops packaged it for launch.

## Verification (this run)
- `npm run build` → green; `/app` prerenders static.
- `npm start` + curl → `/` 200, `/app` 200 (Vault wired), `/command.html` 200.
- `node -c app/app/lib/command.js` → syntax OK.
- Remaining manual check: interactive browser smoke of the Vault (no headless browser in this run).
