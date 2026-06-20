# 01 · Braindoc — AXIOM Command

> **Stage:** Intake / Braindoc (AiNa pipeline) · **Source AIR:** [`PRD_AXIOM_Command_App.md`](../PRD_AXIOM_Command_App.md) · [`IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md)
> **Status:** Synthesized for operator review — the framed scope that every downstream stage (Intent → Ops) reads alongside the PRD.

---

## Summary

**AXIOM Command** is the cross-platform companion app for the AXIOM pocket computer — a 6×3×1″ device that fuses Flipper-Pro-class radios, an 8-core RK3588S Linux SoC, on-device AI, and a 5.9″ 4K AMOLED screen. The app pairs over BLE 5.3 / Wi-Fi 6E / USB-C and turns the device from a powerful gadget into a *connected platform*: live telemetry, cast-to-screen (maps + arbitrary content), a synced capture vault, an AI copilot, automations, and fleet management. It is the layer that converts a one-time $399 hardware sale into a recurring-revenue, community-driven platform. **Why now:** the hardware (16 GB RAM, Wi-Fi 6E, NPU) is the first pocket multitool powerful enough to justify a premium, AI-native, fleet-ready companion — a gap Flipper's thin app never filled.

## The problem

The owner is **blind and powerless once the device leaves their hand.** A maker across the workshop, a researcher mid-survey, or a field engineer off-grid has no idea about battery, heat, storage, or what the radios are doing — so power users live in low-grade anxiety ("is it still alive / still recording / overheating?"). The **4K screen is wasted as a one-way display** with no easy way to push maps, dashboards, or docs to it. **Captures are trapped on-device** in local storage with no backup, search, or cross-device continuity. Teams running several units have **no fleet view**. The current workaround is a laptop + ad-hoc scripts + USB cable + manual note-taking — slow, tethered, unreproducible, and impossible in the field. The deeper cost: without a software layer, the hardware stays a commodity with no recurring relationship.

## Users

- **Primary — The Maker ("Mara"):** hobbyist / cyberdeck builder. JTBD: *"Build and debug my projects in the field without a laptop."* Context: mobile, daily, BLE-tethered. Killer feature: cast dashboards/code to screen + telemetry + automations.
- **Primary — The Researcher ("Raj"):** authorized security/RF researcher, pentester. JTBD: *"Survey and document the wireless world I'm authorized to test — safely and reproducibly."* Killer feature: geotagged RF signal mapping + capture vault + audit log.
- **Secondary — The Field Pro ("Fei"):** surveyor / drone op / expedition engineer. JTBD: navigate and monitor gear off-grid. Killer feature: offline maps cast to device + GNSS breadcrumbs + find-my.
- **Expansion — The Educator/Team Lead ("Tomas"):** makerspace / university lab / security team. JTBD: provision, monitor, audit a fleet. Killer feature: fleet management, policy, OTA, usage reporting. (Unlocks 5–20× ACV.)
- **Power Owner ("Priya"):** wants the app to be a daily habit — AI copilot, marketplace, cross-device beam.

**Anti-personas:**
- The "black-hat" user wanting tools to defeat security controls on systems they don't own — explicitly excluded (PRD §11, NG3); building for them poisons the brand and app-store standing.
- The casual buyer who never pairs — the app is not a marketing microsite; it must earn the daily open.
- General IoT consumers wanting a Tuya-style smart-home hub — wrong domain; would dilute the RF/compute focus.

## V1 scope

**In (P0 — must ship at device launch):**
- Pair an AXIOM in ≤30 s via QR/USB with encrypted key exchange.
- Live telemetry & health dashboard across power, thermals, compute, storage, radios, connectivity (<1 s local latency).
- Configurable alerts (low battery, overheat, storage, offline, unexpected radio activity).
- Cast offline maps + route to the 4K screen (≤3 taps).
- Cast-anything P0 set: notifications, images, documents, a custom live dashboard (≥5 cast types).
- Capture Vault — local-first, searchable, versioned (works with no account).
- Firmware & OTA with A/B partitions + automatic rollback (no-brick guarantee).
- Seamless transport layer (BLE/Wi-Fi/USB) with one session abstraction + handoff.

**Out (deliberate V1 omissions):**
- AI Copilot, RF Signal Mapping, Automations — V1.1; need NPU integration + map/GNSS join.
- Cloud E2E sync & accounts — gated to 1.0; local-first must work first.
- Fleet/Teams, Plugin SDK + Marketplace — 2.0; expansion ICP, not launch.
- Two-way remote control / full remote desktop — deferred (PRD NG4).
- Social feed / community network — not a goal (NG2).

**Edge cases:** transport drops mid-cast → fall back to BLE presence + queue; pairing across app restart → keys survive in secure enclave; OTA power-loss mid-update → A/B rollback; region not set → radios default to most-restrictive compliant preset.

## Economics

- **Build:** Multi-quarter, multi-engineer (shared Rust/Protobuf core + native/Web UI shells). This is a venture-scale product, **not** a fixed-budget contract. **Fits budget: CONDITIONAL** — phased to device milestones (Alpha → 2.0) so app spend tracks hardware revenue.
- **Monthly infra (at 1.0):** local-first keeps the floor low; cloud sync + AI dominate cost. Rough order: object/blob storage + Postgres + push ($ hundreds early), AI inference (cloud Claude) scales with Pro adoption, OTA CDN. Free tier is near-zero marginal (no cloud).
- **Value / business model:** Free (activation) → Pro $6–9/mo (sync, AI, RF mapping, automations) → Teams $15–25/seat + per-device (fleet, audit, SSO) → Marketplace rev-share. Moat: the app is the data layer (captures + automations + fleet history = switching cost).

## Risks & dependencies

- **Hardware ship slip drags app timeline** — decouple with a device **simulator** dev track (already built: `app/app/lib/device-sim.js`); app phases gate on device milestones.
- **BLE telemetry/cast feels sluggish** — auto-upgrade to Wi-Fi 6E for bandwidth; BLE only for presence/control.
- **Cloud trust from a privacy-sensitive audience** — local-first, E2E encryption, cloud strictly opt-in, transparent data inventory.
- **Radio misuse / legal exposure** — region policy, authorization-attestation gates, responsible-use framing, immutable audit log (PRD §11; load-bearing).
- **Cross-platform parity cost** — shared core (gRPC schema + business logic), thin native UI shells; web ships read-only first.
- **App-store sensitive-capability review** — disclose radio/capture capabilities; frame for authorized use; redact identifiers in exports by default.

## DevOps & Deployment

- **Hosting target:** **Vercel** (Git integration → auto-deploy on push to `main`). Project `prj_k8az1nvGA5q3i0rmbNzbifnMtIgD`, live at `get-axiom.vercel.app`.
- **Runtime + framework:** **Next.js 15 (App Router) + React 19**, Node 24. Hosts the Kickstarter landing (`/`) and the AXIOM Command web client (`/app`).
- **Database & persistence:** **Neon Postgres** for the implementation-tracking layer (`phases` + `features` tables, `db/`). App telemetry/vault are device-local in the current simulator track; cloud sync DB is a 1.0 decision.
- **Secrets & config:** `DATABASE_URL` (Neon), `NEON_*`; future: `ANTHROPIC_API_KEY` (Copilot), push keys (APNs/FCM), blob storage token. Names only — values in `.env.local` (git-ignored).
- **Observability:** Vercel logs + build logs today; plan Sentry for the web client and structured `axiomd` logs in Beta. Crash-free ≥99.5% is a launch gate.
- **CI/CD:** push to GitHub `main` → Vercel preview on PR → prod on merge. No manual deploy step.
- **Rollback story:** Vercel instant rollback to the prior deployment; DB/schema changes are forward-only and committed.
- **Scaling envelope:** the web client is read-mostly telemetry + fleet console — comfortable to high traffic on Vercel Fluid Compute; the bandwidth-heavy paths (cast, mirror, capture sync) run device↔app direct, not through the server.

## Delivery

Aligned to the existing 5-phase plan (device ship Q2 2027):
- **Phase 1 — Alpha** (Q4 2026): pair + live telemetry + OTA + cast-map. *By end, the owner can pair a device and watch real telemetry.* **← in progress today (simulator-backed).**
- **Phase 2 — Beta** (Q1 2027): cast-anything (P0), local vault, alerts, find-my, transport handoff. *The owner can push anything to the screen and back up captures with no account.*
- **Phase 3 — 1.0** (Q2 2027): all P0 GA + accounts, cloud sync, Pro tier.
- **Phase 4 — 1.1 / Phase 5 — 2.0:** AI copilot, RF mapping, automations, mirror, beam → fleet, SDK, marketplace.

**Definition of done (V1 / Alpha gate):** pair ≤30 s · every telemetry channel renders real values <1 s local · cast a map in ≤3 taps · OTA update+verify+rollback all tested · transport handoff works · crash-free ≥99.5%.

## Open questions

- **Q:** Native (Swift/Kotlin) vs cross-platform (Flutter/RN/KMP) for mobile shells? — *Recommendation: shared Rust/Protobuf core + native UI for telemetry/mirror performance.*
- **Q:** Which cast-template standard ships for third parties in v1? — drives the Cast SDK boundary.
- **Q:** Is GNSS hard-required for RF Mapping, or ship dead-reckoning fallback at launch? — affects the "irresistible" demo timeline.
- **Q:** Cloud region/residency for Teams — EU data residency from day one? — affects SOC 2 path and architecture.
- **Q:** How much of the AI Copilot must run on-device before cloud is acceptable for the privacy-first segment?

## Assumptions made

- The PRD + implementation plan are the authoritative brief; this braindoc tightens, not re-scopes.
- The **web client** (`/app` on Next.js) is the launch surface we build in this repo; native mobile shells are a parallel track outside this codebase.
- Telemetry/cast run against a **device simulator** until real BLE/Wi-Fi/USB adapters land in Beta — the telemetry frame shape stays identical, so no app rewrite.
- "Create the app repo" = enrich and extend **this** repo, not spin up a separate FastAPI app.
- Funding figures, backer counts, and ship dates are illustrative (concept campaign), per the PRD note.
