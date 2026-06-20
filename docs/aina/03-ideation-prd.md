# 03 · Technical PRD — AXIOM Command (web client)

> **Stage:** Ideation (AiNa pipeline) · Reads: [`02-intent-sow.md`](02-intent-sow.md) (variant **tier_recommended**) + the live code · **Feeds:** Dev (04)
> Grounded in the running app: `app/app/page.js`, `app/app/lib/{device-sim,transport,command}.js`, `app/app/command.css`, Neon tracking in `db/`.

---

## Name
**AXIOM Command** (web client)

## Elevator pitch
The browser-based command center for the AXIOM pocket computer: pair a device, watch live telemetry, cast maps and content to its 4K screen, keep a searchable capture vault, and run OTA updates. For makers and authorized researchers who need to see and control their device once it's untethered.

## Chosen variant
`tier_recommended` — full connect-and-observe web client on the existing Next.js + simulator stack, with a frozen transport-adapter seam.

## Tech stack (one-line)
Next.js 15 (App Router) + React 19 · client-rendered Command SPA in `/app` (vanilla `AXIOM.*` modules) · DKube Design System CSS (Poppins, brand purple `#7660A8`) · Neon Postgres for implementation tracking · Vercel hosting + CI

> **Golden-stack deviation (deliberate):** the AiNa `nextjs` golden stack defaults to Tailwind v4 + shadcn/ui. This project already ships the **DKube Design System 2.0** (`command.css`, custom SVG icon set, pill buttons, soft-shadow cards) and is deployed. Per §1.3 (surgical changes) we **keep DKube** and do not introduce Tailwind/shadcn — they are skipped on purpose to avoid a gratuitous restyle of a live app.

---

## Architectural posture
- **Web-first, client-rendered SPA** for the device session (telemetry/cast are device↔app direct, not server round-trips). The Next.js server hosts the page + the Neon-backed tracking API; the device session lives entirely client-side against the simulator today.
- **Realtime, not batch:** 1 Hz telemetry frames drive the UI via an `onFrame` subscription. No polling, no server in the hot path.
- **Local-first persistence:** session/settings/vault in `localStorage`/IndexedDB; no account required (matches PRD principle 1 + the local-first promise).
- **Transport-adapter seam is frozen:** `SimTransport` implements the same interface (`connect/onFrame/send/upgrade`) that `BleTransport/WifiTransport/UsbTransport` will, so swapping to real silicon in Beta touches zero UI.

### Data shape
Mostly **streaming telemetry frames** (ephemeral, 1 Hz) + a small set of **persisted records** (paired device, settings, alert rules, vault items, cast jobs, firmware state) + the **relational tracking model** in Neon (phases/features). The PRD's `TelemetrySample` is a down-sampled tier derived from frames for History/export.

### Integration footprint
- Device session: `axiomd` gRPC/Protobuf (today: in-process simulator).
- Map tiles: offline vector-tile pack source (cast-map) — license TBD.
- Neon Postgres (tracking; future cloud sync DB).
- Push (APNs/FCM) — Beta, for alerts when app is backgrounded.
- Anthropic Claude — V1.1 Copilot. Vercel logs/CI.

### Latency / scale ceiling
Primary action (telemetry render) target **<1 s** on local link (sim p95 ≈ 120 ms BLE, ≤40 ms Wi-Fi). Cast static content **<500 ms**. Scale: single device per session at Alpha→Beta; the web client is read-mostly and bandwidth-heavy paths bypass the server.

### Non-obvious constraint
The **telemetry frame schema is a public contract** between `axiomd`, the simulator, and the UI. Any field rename ripples into the real-hardware adapter, History down-sampling, and export. Treat `device-sim.js`'s emitted frame as the versioned source of truth — additive changes only.

---

## Features

- **Onboarding & pairing (AX-101)** [P0]
  - what: discover a nearby AXIOM, show a numeric code, simulate encrypted key exchange, name + set region.
  - acceptance: pair completes in ≤30 s; reconnect survives reload (device persisted); no plaintext PSK; region captured.
  - depends on: `ConnectionManager.discover/pair/attach` · PairedDevice record · connect/pairing views.
- **Telemetry & health dashboard (AX-102)** [P0]
  - what: live cards for power, thermals, compute, storage, radios, connectivity from the 1 Hz frame; one status line ("All systems nominal").
  - acceptance: every channel renders real values; updates ≥1 Hz; tap a card → detail/history; local latency badge shown from `frame.link`.
  - depends on: TelemetryFrame · `onFrame` · /health view.
- **Cast — maps (AX-103)** [P0]
  - what: pick an area/route, cast an offline map pack to the device screen.
  - acceptance: map+route "appears" on device preview in ≤3 taps; cast job acked by `device.cast`; works offline.
  - depends on: CastJob(map) · `transport.send("cast")` · /cast view.
- **Cast — anything (AX-104)** [P0/Beta]
  - what: cast notifications, an image, a document (PDF/MD/text), and a custom live-dashboard widget set — ≥5 cast types via a JSON cast-template format.
  - acceptance: ≥5 cast types selectable; each produces a valid CastJob + on-device preview; static cast <500 ms (simulated).
  - depends on: CastJob(notif|image|doc|dashboard) · CastTemplate schema · /cast view.
- **Capture Vault (AX-106)** [P0/Beta]
  - what: local-first library of captures/scripts/configs with metadata + full-text + tag search, folders, versioning.
  - acceptance: a (simulated) capture appears in vault ≤10 s; search by text/tag works; version history retained; persists across reload (IndexedDB).
  - depends on: CaptureItem · /vault view.
- **Alerts & thresholds (AX-112)** [P0/Beta]
  - what: user-set thresholds (low batt, overheat, storage, offline, unexpected radio activity) that fire from the live frame.
  - acceptance: alert fires ≤10 s after threshold crossed; visible in-app; rule editable in Settings (thresholds already in `defaultSettings()`).
  - depends on: AlertRule · frame evaluation loop · /settings + alerts surface.
- **Firmware & OTA (AX-110)** [P0]
  - what: check for update, show release notes, apply with A/B + rollback messaging.
  - acceptance: check returns current+available+notes; apply updates firmware string; rollback path shown; no-brick framing.
  - depends on: FirmwareState · `device.checkUpdate/applyUpdate` · /firmware view.
- **Transport layer & handoff (AX-111)** [P0]
  - what: one session abstraction; auto-upgrade BLE→Wi-Fi for casting; show active transport + link quality.
  - acceptance: `frame.link` shows transport/quality/latency; `upgrade()` switches profile without UI rewrite; adapter contract documented.
  - depends on: Transport interface · ConnectionManager.
- **History & export** [P1]
  - what: down-sampled telemetry trends (24 h/7 d/30 d) exportable as CSV/JSON.
  - acceptance: a channel renders a trend; export produces valid CSV/JSON. depends on: TelemetrySample tier.
- **Find My AXIOM (AX-109)** [P1] — last-known location + ring/flash + lost mode. Deferred within this track.

## Data model summary
*(Full field detail below the summary.)*
- **PairedDevice** — the connected AXIOM (id, name, region, firmware, keyId, lastSeen).
- **TelemetryFrame** — ephemeral 1 Hz snapshot (power/usb/thermal/compute/storage/radios/motion/link). Not persisted raw.
- **TelemetrySample** — down-sampled tier (deviceId, ts, domain, metric, value, unit) for History/export.
- **AlertRule** — threshold config (metric, op, value, enabled) + fired events.
- **CastJob** — a cast request (type, payloadRef, status, ts).
- **CastTemplate** — JSON layout schema for dashboard/doc casts (the third-party SDK boundary).
- **CaptureItem** — vault entry (id, type, ts, geo?, size, tags[], blobRef, version).
- **FirmwareState** — current/available/notes/lastChecked.
- **Phase / Feature** — Neon tracking model (already live in `db/schema.sql`).

### Entities (web-client persisted)
```
PairedDevice (localStorage)
- id: text · device id · PK
- name: text · user-set name
- region: text · radio-compliance region
- firmware: text · current version
- key_id: text · handshake key id (no PSK)
- last_seen: number · epoch ms

AlertRule (localStorage; seeded from defaultSettings)
- metric: text · e.g. battery_pct | soc_c | nvme_used_pct | offline
- op: text · lt | gt
- value: number · threshold
- enabled: boolean

CaptureItem (IndexedDB)
- id: text · PK
- type: text · subghz | nfc | rfid | log | script | config | map_pack | cast_template
- ts: number · epoch ms
- geo: {lat,lon} | null
- size_bytes: number
- tags: text[]
- blob_ref: text · IndexedDB key
- version: int · default 1

CastJob (in-memory + recent history in localStorage)
- id: text · PK
- type: text · map | dashboard | doc | image | notif
- payload_ref: text
- status: text · queued | accepted | rendered | failed
- ts: number
```
TelemetryFrame is defined by `device-sim.js` (the contract); TelemetrySample is its down-sampled projection. Phase/Feature are in `db/schema.sql` (Postgres, unchanged).

## API contract summary
The device session uses an **in-process command surface**, not HTTP — `transport.send(cmd, args)` with `cmd ∈ {setRadio, setCharging, cast, checkUpdate, applyUpdate}` returning `{ok, ...}`. The only **HTTP API** is the Neon-backed tracking layer:
- `GET /api/tracking/phases` → phase rollups (from `phase_progress` view)
- `GET /api/tracking/features` → feature list + status
- `PATCH /api/tracking/features/{code}` → `{status, progress, note}` (mirrors `db/update.mjs`)

Errors: JSON `{ "error": "message" }` with conventional HTTP status (400 validation, 404 unknown code, 500 server). No auth in V1 (single-operator tracking console; device session is local). Webhooks: none in V1.

## UX (pages, flows, components)
**Pages / views** (within `/app`, client-routed via `setView`):
- **Connect / Pair** — discover → code → encrypted-channel animation → name + region. Primary action: pair.
- **/health** — status line + glanceable cards (battery, thermal, compute, storage, radios, link); tap → detail/history. Primary action: read state.
- **/cast** — pick a cast type (map/notif/image/doc/dashboard) → device-screen preview. Primary action: cast.
- **/vault** *(new)* — search bar + capture list + tag filters + item detail/versions. Primary action: find a capture.
- **/firmware** — current vs available + notes + Update button (A/B + rollback messaging). Primary action: update.
- **/settings** — device name/region, alert thresholds, preferred transport, alerts toggle, disconnect/forget.

**Golden flows:**
- *First pair:* Connect → discover → Pair (code) → encrypted channel → name+region → Health.
- *Cast a map:* Health → Cast → Map → pick area → Cast → device preview (≤3 taps).
- *Set an alert:* Settings → threshold (e.g. battery <15%) → save → alert fires from live frame.

**Component inventory:** TelemetryCard, RadioToggleRow, LinkQualityBadge, CastTypePicker, DeviceScreenPreview, CaptureRow, TagFilter, FirmwareUpdatePanel, AlertRuleRow, PairCodeDisplay.

**Design tokens:** DKube Design System — Poppins; brand purple `#7660A8` / `#9384BD`; pill buttons; soft-shadow cards; custom SVG icon set (already in `command.js`). True-black AMOLED-tuned device preview.

**Empty / error / offline states:** no device → Connect screen; no captures → vault empty state with "captures appear here when your AXIOM records"; transport drop → degraded badge + "reconnecting…", queue casts; failed cast → inline error + retry.

## NFR highlights
- **Auth/access:** device session = local, no account (single-operator). Tracking API single-user. Cloud accounts deferred to 1.0.
- **Performance:** telemetry render p95 <1 s local; cast static <500 ms; dashboard cold-open <1.5 s.
- **Security/privacy:** keys in secure storage (no plaintext PSK); local-first — no telemetry leaves device without opt-in; region-aware radio policy gates non-compliant presets; authorization attestation before capture-heavy workflows (PRD §11).
- **Observability:** Vercel logs + build logs now; Sentry for the web client in Beta; crash-free ≥99.5% is a launch gate.
- **a11y/i18n:** WCAG 2.2 AA target, keyboard nav, high-contrast AMOLED styles; English at launch, strings externalized.

## Open questions
- Freeze the **TelemetryFrame schema version** and document it as the adapter contract? *(Default: yes — additive-only.)*
- **Vault persistence** in the web client: IndexedDB now vs in-memory until cloud? *(Default: IndexedDB — local-first promise.)*
- **Cast-template format**: ship the JSON layout schema in this track or defer to the SDK milestone? *(Default: define a minimal v0 now, expand at SDK.)*
- **Map-tile source + license** for cast-map offline packs. *(Blocker for real map cast — placeholder preview until resolved.)*
- Should the **tracking API** be exposed as HTTP routes now, or stay as `db/*.mjs` CLI scripts? *(Default: add read-only HTTP routes so the console can render live.)*

## What's NOT in V1 (deliberate)
- AI Copilot, RF Signal Mapping, Automations — V1.1 (need NPU + GNSS/map join).
- Cloud accounts + E2E sync — 1.0.
- Fleet/Teams, Plugin SDK, Marketplace — 2.0.
- Native mobile shells — separate track.
- Two-way remote control / screen mirror — deferred (mirror P1, remote P2).
- Tailwind/shadcn migration — intentionally not done; DKube design system stays.
