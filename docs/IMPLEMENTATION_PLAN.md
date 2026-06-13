# AXIOM Command — Phasewise Feature Implementation Plan

Derived from [`PRD_AXIOM_Command_App.md`](PRD_AXIOM_Command_App.md) §9 (features) and §13 (release plan).
This plan is the **source of truth that is mirrored into NeonDB** (`phases` + `features` tables) so
implementation can be tracked, updated, and monitored. See [`../db/README.md`](../db/README.md) for how
to apply, update, and query status.

> Status legend — features: `planned` · `in_progress` · `blocked` · `in_review` · `done`
> Phases: `not_started` · `in_progress` · `done`. Progress is 0–100 per feature; phases roll up the average.

---

## Phase overview

| # | Phase | Window | Theme | Exit criteria |
|---|---|---|---|---|
| 1 | **Alpha** | Q4 2026 (device DVT) | Connect & observe | Pair + live telemetry + OTA + cast a map, on real hardware |
| 2 | **Beta** | Q1 2027 (pre-ship) | Cast & safeguard | Cast-anything (P0), local vault, alerts, find-my, transport handoff |
| 3 | **1.0 Launch** | Q2 2027 (with device) | Cloud & commerce | All P0 GA + accounts, cloud sync, Pro tier |
| 4 | **1.1** | Q3 2027 | Intelligence & maps | AI copilot, RF signal mapping, automations, mirror, beam |
| 5 | **2.0** | Q4 2027+ | Platform & teams | Fleet/Teams, plugin SDK + marketplace, remote control, web console |

---

## Phase 1 — Alpha (Q4 2026)

| Code | Feature | Priority | PRD § | Notes |
|---|---|---|---|---|
| AX-101 | Onboarding & pairing (QR + USB fast-setup, key exchange) | P0 | 9.1 | ≤30 s time-to-first-pair |
| AX-102 | Telemetry & health dashboard (power/thermal/compute/storage/radios) | P0 | 9.2 | <1 s local latency |
| AX-103 | Cast to device — maps (offline pack + route) | P0 | 9.3 | AMOLED-tuned styles |
| AX-110 | Firmware & OTA updates (A/B, rollback) | P0 | 9.10 | no-brick guarantee |
| AX-111 | Transport layer & seamless handoff (BLE/Wi-Fi/USB) | P0 | 8 | single session abstraction |

## Phase 2 — Beta (Q1 2027)

| Code | Feature | Priority | PRD § | Notes |
|---|---|---|---|---|
| AX-104 | Cast to device — anything (notif/image/doc/dashboard) | P0 | 9.4 | ≥5 cast types |
| AX-106 | Capture Vault (local-first, search, versioning) | P0 | 9.6 | works with no account |
| AX-112 | Alerts & thresholds (low batt/overheat/storage/offline) | P0 | 9.2 | fire ≤10 s |
| AX-109 | Find My AXIOM & lost mode | P1 | 9.9 | BLE presence + GNSS |

## Phase 3 — 1.0 Launch (Q2 2027)

| Code | Feature | Priority | PRD § | Notes |
|---|---|---|---|---|
| AX-201 | Accounts & E2E cloud sync (capture cloud) | P1 | 9.6 | opt-in, encrypted |
| AX-202 | Pro tier & billing | P1 | 14 | freemium upgrade |
| AX-203 | P0 GA hardening (perf, a11y, crash-free ≥99.5%) | P0 | 10 | launch gate |

## Phase 4 — 1.1 (Q3 2027)

| Code | Feature | Priority | PRD § | Notes |
|---|---|---|---|---|
| AX-107 | AI Copilot (on-device + cloud) | P1 | 9.7 | ≥75% thumbs-up |
| AX-105 | RF Signal Mapping (geotagged heatmaps) | P1 | 9.5 | the "irresistible" demo |
| AX-108 | Automations & rules engine | P1 | 9.8 | NL authoring via copilot |
| AX-204 | Screen mirror / present mode | P1 | 9.4 | 30 fps <150 ms |
| AX-113 | Cross-device beam & continuity | P1 | 9.13 | clipboard + file beam |

## Phase 5 — 2.0 (Q4 2027+)

| Code | Feature | Priority | PRD § | Notes |
|---|---|---|---|---|
| AX-114 | Fleet management / Teams (policy, audit, OTA) | P2 | 9.11 | ACV expansion |
| AX-115 | Plugin SDK & Marketplace (signed, rev-share) | P2 | 9.12 | network effects |
| AX-205 | Two-way remote control ("AXIOM Remote") | P2 | 9.4 | deferred from v1 |
| AX-206 | Web fleet console | P2 | 9.11 | read+manage in browser |

---

## Tracking workflow
1. **Source of truth:** this file + the Neon `features`/`phases` tables stay in sync.
2. **Update progress:** `node db/update.mjs <CODE> <status> <progress> "<note>"` (e.g. `node db/update.mjs AX-101 in_progress 40 "BLE pairing works"`).
3. **Monitor:** `node db/status.mjs` prints per-phase rollups and per-feature status from Neon.
4. **GitHub:** every change to the plan or schema is committed and pushed; the DB reflects live execution state.
