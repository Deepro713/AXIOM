# 04 · Dev Notes — AXIOM Command (web client)

> **Stage:** Dev (AiNa pipeline) · Reads: [`03-ideation-prd.md`](03-ideation-prd.md) · **Mode:** extend the existing Next.js app (no FastAPI starter)
> Documents the real architecture, what this stage shipped, what's stubbed, and the next slice.

---

## Architecture (as built)

The Command app is a **client-rendered SPA mounted inside a Next.js route**, deliberately framework-agnostic so it can later be lifted into native shells unchanged.

```
app/app/page.js            React shell — mounts #app, lazy-imports the 3 lib modules client-side
app/app/command.css        DKube Design System 2.0 — tokens, components, vault styles
app/app/lib/device-sim.js  DeviceSim — stand-in for on-device `axiomd`; emits 1 Hz telemetry frames
app/app/lib/transport.js   Transport interface + SimTransport + ConnectionManager (adapter seam)
app/app/lib/command.js     The whole UI: pairing, Health, Cast, Vault, Firmware, Settings (~790 LOC, vanilla JS)
```

**Boot path:** `page.js` (`useEffect`, guarded by `window.__axiomBooted`) imports `device-sim → transport → command`, which calls `boot()` → reconnect (if a device is saved in `localStorage`) or `renderConnect()`.

**Data flow:** `DeviceSim.start()` ticks every 1000 ms → `_emit(frame)` → `SimTransport.connect` stamps `frame.link` (transport/quality/latency) → `command.onFrame(f)`:
- pushes to history rings (`hist.batt/soc/cpu`) + telemetry ring buffer (`log`, cap 600),
- `evalAlerts(f)` raises threshold toasts,
- `maybeAutoCapture(f)` lands a vault capture on sustained radio activity,
- re-renders the active view's live bits.

**The frozen contract:** the emitted telemetry frame (`device-sim.js` `_emit`) is the versioned schema shared by the simulator, the UI, and the future real adapters. The PRD's `axiomd` gRPC/Protobuf maps onto this shape. **Additive-only changes** — renaming a field ripples into History down-sampling, CSV/JSON export, and every real-hardware adapter.

**Transport adapter seam:** `SimTransport` implements `connect / onFrame / send(cmd,args) / upgrade(kind)`. `AXIOM.BleTransport / WifiTransport / UsbTransport` are declared `null` placeholders with the identical interface — swapping to real silicon in Beta touches zero UI code. The command surface is `cmd ∈ {setRadio, setCharging, cast, checkUpdate, applyUpdate}`.

**Persistence:** `localStorage` via `loadJSON/saveJSON` — keys `axiom.device`, `axiom.settings`, `axiom.vault`. No account, no server in the device hot path (local-first, PRD principle 1).

## Current feature state (Phase 1 Alpha — verified running)

| PRD / code | Feature | State |
|---|---|---|
| AX-101 | Pairing — discover → numeric code → encrypted-channel sim → name + region | ✅ built |
| AX-102 | Telemetry & Health — power/thermal/storage/compute/connection/radios cards, sparklines, status banner | ✅ built |
| AX-103/104 | Cast — map, live dashboard, notification, document (4 types) with on-device canvas preview | ✅ built |
| AX-112 | Alerts — low-batt / SoC-hot / storage-full toasts from live frame; thresholds in Settings | ✅ built |
| AX-110 | Firmware/OTA — check, release notes, staged install with A/B + rollback messaging, history | ✅ built |
| AX-111 | Transport layer — one session abstraction, BLE→Wi-Fi upgrade on cast, link pills, drop sim | ✅ built |
| — | Telemetry export — CSV/JSON of the ring buffer | ✅ built |
| **AX-106** | **Capture Vault** — local-first, search, tags, versioning, detail | ✅ **added this stage** |

## What this stage shipped: Capture Vault (AX-106)

Implemented as a fully additive slice — new icon, nav item, view, one state key, and a CSS block. No existing feature was touched.

- **New `Vault` nav item** between Cast and Firmware; `setView` routes `"vault" → renderVault()`.
- **Seeded library** (`defaultCaptures()`): 6 captures across sub-ghz / nfc / rfid / log / script / config, with tags, sizes, timestamps, optional geotags, versions.
- **Live auto-capture** (`maybeAutoCapture`): sustained radio activity (`subghz.act > 88`, `nfc/rfid > 92`) lands a fresh, geotagged capture — throttled to one per 12 s — so the vault fills from telemetry, tying AX-106 to AX-102. A **Simulate capture** button does the same on demand.
- **Search + tag filter** (`filteredCaptures`): full-text over note/type/frequency/tags + a tag chip rail (`allTags`).
- **Capture rows** expand to a detail panel (frequency, RSSI, size, captured-at, version, location, tags) with delete; type-colored icons.
- **Empty states** for "vault empty" vs "no match".
- **Persistence:** `localStorage` key `axiom.vault` (cap 200). *Stubbed:* real captures carry binary blobs — those move to **IndexedDB** when the real transport delivers payloads (the seam is `addCapture` + `saveVault`).

## How to run

```bash
npm install
npm run dev          # http://localhost:3000  → / (landing) and /app (Command)
npm run build        # production build (verified green)
npm start            # serve the production build
```
- The Command app boots against the **device simulator** automatically — no hardware needed.
- Tracking DB (separate): `node db/status.mjs` (needs `DATABASE_URL` for Neon).

## Verification done this stage
- `node -c app/app/lib/command.js` → syntax OK.
- `npm run build` → compiled successfully; `/app` prerenders static; bundle 103 kB First Load JS.
- `npm start` + `curl /app` → HTTP 200, shell renders.
- *Not covered (no headless browser):* interactive client rendering of the vault list/search. Manual smoke test in a browser is the remaining check before merge.

## What's stubbed / deferred (in priority order)
1. **Real captures with blobs** → IndexedDB store behind `addCapture` (web-client side ready; needs real transport payloads).
2. **Cast type #5 (image)** to formally hit the PRD's "≥5 cast types" (currently map/dash/notif/doc = 4; image is a small `drawImage` add).
3. **History detail view** — down-sampled 24 h/7 d/30 d trends (sparklines + ring buffer exist; needs the down-sampled tier + a detail route).
4. **Read-only tracking API** — expose `db/*.mjs` as `/api/tracking/*` so the console renders live phase/feature status in-app (currently CLI-only).
5. **Find My AXIOM (AX-109)** — last-known location + ring/lost-mode (P1).
6. **Real transports** — `BleTransport / WifiTransport / UsbTransport` implementations (Beta; interface already frozen).

## Next slice (recommended)
**Image cast (close ≥5 cast types) + IndexedDB vault blobs**, then the **read-only tracking API**. All three are small, additive, and individually verifiable — they finish the connect-and-observe story before the V1.1 intelligence/maps work begins.
