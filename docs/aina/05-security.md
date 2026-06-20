# 05 · Security Clearance — AXIOM Command (web client)

> **Stage:** Security (AiNa pipeline) · Reads: [`03-ideation-prd.md`](03-ideation-prd.md), [`04-dev-notes.md`](04-dev-notes.md), the live code · **Feeds:** Marketing (07)
> Threat model → dependency audit → code scan → clearance verdict. Scoped to the **shipped web client**; product-wide (cloud/native) items are flagged as future-scope, not current blockers.

---

## Verdict

**CONDITIONAL**

The shipped web client is a **client-side simulator with no untrusted-input sinks, no auth, no secrets, and a minimal dependency tree** — its own attack surface is near-zero. The CONDITIONAL is driven by **product-level** controls the PRD itself makes load-bearing (responsible-use gates, region radio policy, E2E for the *future* cloud path) that must be designed in before the cloud/real-hardware milestones — not by any defect in what runs today.

## Threat model

### Actors
- **Anonymous web visitor** → loads `/` and `/app`; runs the client simulator entirely in their browser. Cannot reach any server-side mutation.
- **Device owner** (future) → drives a *real* AXIOM over BLE/Wi-Fi/USB; full device control.
- **Operator** (future) → the Neon tracking layer (`db/*.mjs`), currently CLI-only with `DATABASE_URL`.
- **Background job** → the 1 Hz simulator tick; in-process, no network.
- **Third-party webhooks** → none.

### Trust boundaries
| Source | Sink | Current control |
|---|---|---|
| User input (device name, alert thresholds, vault search) | `localStorage` write + DOM render | `esc()` HTML-escaping on rendered user strings; `clampInt` on numeric thresholds; search is a substring match, no eval |
| Simulator frame | DOM / canvas render | In-process, trusted; no parsing of external bytes |
| `db/*.mjs` | Neon Postgres | Parameterized via the Neon driver; **not** exposed as an HTTP route yet |
| `.env.local` (`DATABASE_URL`) | build/runtime | git-ignored (confirmed in `.gitignore`); never shipped to client |

### Highest-risk flows (ranked)
1. **(Future) real capture payloads → IndexedDB/vault render** — when real transports deliver attacker-influenced bytes (RF/NFC), the vault must treat capture metadata/notes as untrusted and escape on render. *Today: seeded/simulated data only — no live risk.*
2. **(Future) cloud sync → device** — any cloud path must be E2E-encrypted with keys in the secure enclave (PRD §10); a server-trust model would break the product's core promise.
3. **(Future) tracking API `/api/tracking/*`** — if exposed, `PATCH features/{code}` needs input validation + (eventually) auth; currently CLI-only, so out of band.
4. **DOM injection via user strings** — device name / capture note rendered into `innerHTML`. *Mitigated:* `esc()` is applied; vault notes are app-generated today.

### Dependency focus
- Runtime deps are minimal: `next`, `react`, `react-dom` (exact-ish pinned in `package.json`). No auth, crypto, parsing, or networking libraries in the client bundle. `htmx.min.js` is vendored but unused by the Next path.

### Code scan focus
- `app/app/lib/command.js` — every `innerHTML` sink that interpolates user/device strings (covered by `esc()`; vault search builds DOM from app data).
- `db/*.mjs` — SQL construction (parameterized; safe) — relevant only when surfaced over HTTP.

## Finding register (CRITICAL → LOW)

| # | Title | Source | Severity | Fix (1 sentence) |
|---|-------|--------|----------|------------------|
| 1 | Responsible-use / authorization gate not enforced in UI | code | HIGH (product) | Add an explicit "I am authorized to test this area/target" attestation + region radio-policy gate before any capture-heavy or RF-mapping workflow (PRD §11) — design now, enforce when real radios land |
| 2 | No E2E encryption design for the future cloud sync path | code | HIGH (future) | Specify client-side E2E (keys in OS secure enclave/keystore) before building accounts/sync; cloud must never see plaintext captures |
| 3 | `esc()` covers `&<>"` but not attribute-context single quotes | code | LOW | Captures/notes are app-generated today; when user-authored notes/tags ship, escape `'` too or use `textContent`/DOM APIs for the vault |
| 4 | Vendored `htmx.min.js` unused on the Next path | dep | LOW | Remove the dead vendored file to shrink surface, or document why it's retained |
| 5 | Tracking API not yet authenticated | code | NOTE | When `/api/tracking/*` is exposed, add validation + operator auth before it leaves single-user/local use |

## Blockers (must change before the relevant milestone)
- **Before Beta / real radios:** implement finding #1 — the authorization attestation + region policy gate. This is the single most important control for a multi-radio device and an app-store review gate.
- **Before 1.0 / cloud:** implement finding #2 — E2E sync design with enclave-held keys. Do not build accounts/sync without it.

## Accepted residual risk (web client, today)
- Findings #3, #4, #5 are LOW/NOTE and acceptable while the app is a **client-side simulator with app-generated data and a CLI-only DB**. Re-evaluate the moment (a) user-authored capture notes, (b) real capture bytes, or (c) an HTTP tracking API ship.

## Security posture summary
What the Dev cluster produced is **well-behaved for its scope**: no server-side untrusted-input sinks, HTML escaping on rendered strings, numeric clamping on settings, secrets git-ignored and never client-shipped, and a deliberately tiny dependency tree. The real security work is **ahead of** this build, not in it — and the PRD already names it (§10 security, §11 responsible use). The risk is *omission at future milestones*, which this report front-loads, not a defect shipping today.

## Operator checklist (before advancing)
- [ ] Confirm `.env.local` / `.env*` remain git-ignored and no `DATABASE_URL` is committed *(verified in `.gitignore`)*.
- [ ] File the responsible-use attestation + region radio-policy gate as a **Beta blocker** in the tracking DB.
- [ ] File the E2E cloud-sync design as a **1.0 blocker**.
- [ ] When user-authored vault notes ship, extend `esc()` to single quotes or switch the vault to DOM-builder APIs.
- [ ] Decide whether to remove the unused vendored `htmx.min.js`.
- [ ] Add `npm audit` (or Dependabot) to CI before the dependency tree grows.
