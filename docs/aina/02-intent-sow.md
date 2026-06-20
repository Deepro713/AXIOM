# 02 · Intent & Statement of Work — AXIOM Command

> **Stage:** Intent (AiNa pipeline) · Reads: [`01-braindoc.md`](01-braindoc.md) + PRD · **Feeds:** Ideation (03)
> Defines the *shape* of the solution, who benefits, the 3-year bet, external dependencies, and three build variants to choose from.

---

## Domain

**Open-hardware companion software for a multi-radio Linux pocket computer** — the intersection of (a) prosumer hardware companion apps (Flipper, GoPro, DJI, Tesla), (b) RF/security research tooling, and (c) device-fleet management (MDM-like).

### Dynamics
- **Hardware-gated demand.** Every app user is a pre-qualified device owner — distribution is the Kickstarter backer base (3,000+ design partners), not paid acquisition. App phases must track hardware milestones, not run ahead of them.
- **Privacy-sensitive, technical audience.** Makers and researchers distrust cloud-by-default and read permission prompts. Local-first is a feature, not a fallback.
- **Radio = regulated.** Sub-GHz/NFC/RFID capabilities sit under FCC/CE and authorized-use law. The product lives or dies on responsible-use framing and app-store sensitive-capability review.
- **Real-time + offline simultaneously.** Telemetry needs <1 s latency; field use needs full-offline. The transport layer (BLE↔Wi-Fi↔USB handoff) is the technical spine.
- **Platform economics.** Value compounds in the data layer (captures, automations, fleet history) — switching cost grows the longer the device is owned.

### Constraints
- FCC/CE + region radio policy; app-store sensitive-capability disclosure; SOC 2 path for Teams cloud; GDPR/CCPA (export + delete). E2E encryption mandatory for any cloud path. Concept-campaign framing means no live-fundraising claims.

### What downstream should watch
The **transport/session abstraction** and the **responsible-use gate** are load-bearing across nearly every feature — Ideation must treat both as first-class architecture, not bolt-ons.

---

## Scope of Work

### Executive summary
AXIOM Command is the single pane of glass for the AXIOM device: see its health, push anything to its 4K screen, keep captures safe and searchable, and (later) orchestrate fleets with an AI copilot. V1 is the *connect-and-observe* layer; intelligence, cloud, and platform features phase in behind it.

### In scope (this repo / web-client track, Alpha→Beta)
- User can **pair** a (simulated, then real) device via QR/USB and see it named + firmware-checked in ≤30 s.
- User can **watch live telemetry** for power, thermals, compute, storage, radios, connectivity — each channel rendering real values with <1 s simulated-link latency.
- User can **set alerts** (low battery, overheat, storage, offline, unexpected radio activity) and see them fire.
- User can **cast an offline map + route** to the device screen in ≤3 taps.
- User can **cast** notifications, an image, a document, and a custom live dashboard (≥5 cast types).
- User can **browse a local capture vault** with metadata + full-text + tag search and versioning.
- User can **run an OTA update** with visible A/B + rollback (no-brick) flow.
- The **transport layer** presents one session abstraction with simulated BLE/Wi-Fi/USB handoff.

### Out of scope (V1, deliberate)
- **AI Copilot / RF Signal Mapping / Automations** — V1.1; depend on NPU + GNSS/map join. Building now distorts the connect-and-observe focus.
- **Cloud accounts + E2E sync** — 1.0; local-first must be proven first, and cloud trust is earned, not assumed.
- **Fleet/Teams, Plugin SDK, Marketplace** — 2.0 expansion ICP; premature platform work starves the core.
- **Native mobile shells (Swift/Kotlin)** — parallel track outside this repo; the web client is the launch surface here.
- **Two-way remote control / screen mirror** — deferred (mirror is P1, remote is P2).

### Why these boundaries
The device's value proposition is *visibility + control of an untethered device*; until that is rock-solid, every later feature (AI, fleet, marketplace) has nothing trustworthy to sit on. The split front-loads the trust-building, local-first core and defers everything that needs cloud, NPU, or org accounts.

---

## Impact

**Who benefits · benefit · how they'd notice**
- **Device owner (Mara/Raj) ·** ends "is it alive/overheating?" anxiety + unlocks the 4K screen · opens the app daily, casts ≥5×/week.
- **Field pro (Fei) ·** navigates off-grid with maps on-device · completes a survey with phone in airplane mode.
- **Team lead (Tomas) ·** manages many units from one console · onboards a class of devices in minutes (2.0).
- **The business ·** converts hardware sales into recurring revenue · Free→Pro ≥8%, Teams ≥30% of revenue.

**Magnitude (needs validation):** North-Star *Weekly Connected Devices*; targets — ≥80% pair within 24 h, ≤30 s median pair, ≥45% D30 retention, ≥5 casts/WAU. Flipper's >1M units + top-download app is the proof the category exists; the bet is that *premium + AI + fleet* expands ARPU 5–20× via Pro/Teams.

**Evidence we have:** PRD §5 targets, §14 pricing, Flipper precedent. **Evidence we'd need:** real pair-time and retention from Alpha backers; willingness-to-pay for Pro among the backer base; Teams pipeline from at least one makerspace/university design partner.

**Post-launch measurement:** Weekly Connected Devices, median time-to-first-pair, casts/WAU, Free→Pro conversion.

---

## Longevity (3-year stress test)

- **3-year outlook:** pocket multitools trend toward Linux-class compute + on-device AI; companion apps become the differentiator. The bet *for*: hardware+software+community bundles win. The bet *against*: a thin-app incumbent (Flipper) adds a premium layer first.
- **Defensibility:** the **data layer** (captures, automations, fleet history) creates switching cost; **open SDK + marketplace** create network effects; **on-device AI + E2E sync** is a genuine technical edge; hardware+software+community is hard to copy. Weakest link: protocol/SDK could be cloned if not paired with the install base.
- **Market-drift risks:** Flipper (or a fast follower) ships a premium app — *fast* (12 mo); phone OSes tighten BLE/USB background access — *slow*; radio-regulation crackdown on multi-radio devices — *medium*; cloud-AI commoditizes, eroding the "AI copilot" wow — *fast* (mitigate by owning the device-data context, not the model).
- **Kill criteria:** if <40% of shipped devices pair with the app within 30 days of Beta → rethink onboarding; if Free→Pro <3% by 1.0 + 2 quarters → rework monetization; if hardware ship slips >2 quarters → pause cloud/Teams spend, keep simulator track only.
- **Verdict:** **Green, with caveats** — ship the connect-and-observe core as scoped; treat responsible-use + transport reliability as gating, and validate Pro willingness-to-pay during Beta.

---

## Dependencies

- **Data:** device telemetry/captures originate on `axiomd` (owned); cloud sync needs user-owned E2E key material; map tiles from a vector-tile provider (offline packs) — licensing matters.
- **Partner/vendor:** Vercel (web host/CI), Neon (Postgres tracking + future cloud), push (APNs/FCM), Anthropic Claude (cloud Copilot, V1.1), a map-tile/vector source, future blob storage. Each is a swappable risk; map-tile licensing is the one with real cost/legal weight.
- **Regulatory/compliance:** FCC/CE region radio policy; app-store sensitive-capability disclosure (could block launch if mis-framed); GDPR/CCPA export+delete; SOC 2 for Teams. **Critical-path.**
- **Distribution:** Apple App Store + Google Play review for native shells (sensitive-capability scrutiny); web client via Vercel (no gatekeeper); the Kickstarter backer base is the warm launch channel.
- **Critical path callouts:** (1) app-store review of radio/capture features; (2) map-tile licensing for offline packs; (3) the real device/firmware + `axiomd` gRPC schema landing on schedule.

---

## Implementation Variants

> Scoped to the **web-client build in this repo** (the launch surface). Native shells and full cloud are separate, larger programs.

### Variant 1: Lean (tier_lean)
**Budget band (USD):** $0–5k incremental · **Engineer-weeks:** 2–3 · **Ops complexity:** low · **Stack:** existing Next.js + device simulator, Vercel · **Target scale:** demo + backer preview.
**Tradeoffs:** + ships fastest, proves the UX, zero new infra; − simulator-only, no real transports, no persistence beyond Neon tracking, no cloud sync.
**Kill criteria:** wrong if backers need to drive *real* hardware in Alpha, or if a persisted multi-session vault is required now.

### Variant 2: Recommended (tier_recommended)
**Budget band (USD):** $8–20k incremental · **Engineer-weeks:** 5–8 · **Ops complexity:** medium · **Stack:** Next.js + simulator with a clean transport-adapter seam, local-first vault (IndexedDB), Neon for tracking, Vercel CI · **Target scale:** full Alpha→Beta web client for the backer base.
**Tradeoffs:** + complete connect-and-observe experience, real cast/vault/alerts UX, adapter seam so real BLE/Wi-Fi/USB drop in with no UI rewrite; − still no cloud accounts/sync; native mobile remains a separate track.
**Kill criteria:** wrong if the org needs Teams/fleet revenue *now*, or if cloud E2E sync is a launch gate rather than a 1.0 item.

### Variant 3: Hardened (tier_hardened)
**Budget band (USD):** $40k+ incremental (multi-engineer) · **Engineer-weeks:** 16+ · **Ops complexity:** high · **Stack:** shared Rust/Protobuf core + native shells + cloud (accounts, E2E sync, OTA CDN, SOC 2 path) · **Target scale:** 1.0 GA across platforms.
**Tradeoffs:** + production-grade, multi-platform, cloud + Pro tier, compliance posture; − months of work, real infra + on-call, premature before device DVT validates demand.
**Kill criteria:** wrong before Alpha proves pair-rate and Pro willingness-to-pay; over-builds ahead of the hardware.

### Recommended variant: **tier_recommended**
It delivers the full connect-and-observe experience the PRD scopes for Alpha→Beta on the existing stack, with a transport-adapter seam so the simulator swaps to real hardware later with no UI rewrite — maximum learning per dollar before committing to cloud/native.

### Open questions / risks (resolve before Ideation)
- Confirm the **transport-adapter contract** (telemetry frame shape) is frozen so simulator→real is a no-rewrite swap. *(Recommendation: yes — already the design intent.)*
- Decide whether the **vault persists** in the web client now (IndexedDB) or stays in-memory until cloud. *(Recommendation: persist locally — it's the local-first promise.)*
- Pick the **cast-template format** (JSON layout schema) — third-party SDK boundary.
- Map-tile/offline-pack **source + license** for cast-map.
- GNSS hard-required vs dead-reckoning fallback for the later RF-mapping demo.
