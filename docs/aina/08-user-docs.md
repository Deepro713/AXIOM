# 08 · User & Developer Guide — AXIOM Command

> **Stage:** Docs (AiNa pipeline) · Reads: all prior stages + the live code · **Note:** the repo already has a strong hand-written [`README.md`](../../README.md); this is the consolidated **DOCS.md-equivalent** (user walkthroughs + developer guide) and deliberately does not overwrite it.

---

## Architecture at a glance

```mermaid
graph TD
  U[User browser] -->|/app| P[Next.js shell · page.js]
  P -->|lazy import| C[command.js · UI + views]
  C --> T[transport.js · SimTransport / ConnectionManager]
  T --> D[device-sim.js · axiomd stand-in]
  D -->|1 Hz telemetry frame| T --> C
  C -->|localStorage| LS[(device · settings · vault)]
  subgraph Future swap-in (Beta)
    BLE[BleTransport] -.same interface.-> T
    WIFI[WifiTransport] -.same interface.-> T
    USB[UsbTransport] -.same interface.-> T
  end
  P2[Neon Postgres] -->|db/*.mjs CLI| TRK[phases · features tracking]
```

The browser loads the Next.js shell, which mounts a framework-agnostic device session (simulator + transport + renderer). Telemetry flows one-way at 1 Hz; commands flow back through `transport.send`. Nothing in the device session touches the server — it's local-first by design. A separate Neon-backed tracking layer mirrors the implementation plan.

---

## User guide

### Connecting (AX-101)
1. Open **`/app`**. On first run it scans for a nearby AXIOM (simulated) and shows it with its signal strength.
2. Click **Pair**. A 6-digit code appears — on real hardware this matches the code on the device's screen; confirming it completes an encrypted key exchange (no plaintext secret).
3. Name the device and pick a **region** (this sets radio compliance). Click **Finish setup** → you land on **Health**.
> The session is remembered: reload and it reconnects automatically. *Screenshot spec: pairing code screen with the encrypted-channel spinner.*

### Health — live telemetry (AX-102)
- The **status banner** answers "is it okay?" at a glance ("All systems nominal", or a low-battery / thermal / storage warning).
- Cards: **Power** (battery %, voltage, current, time-to-empty, charge cycles, health) · **Thermals** (SoC/board temp, throttling) · **Storage** (NVMe used, read/write) · **Compute** (per-core CPU, RAM, NPU) · **Connection** (transport, latency, link quality) · **Radios** (Sub-GHz / NFC / RFID / Wi-Fi 6E / Bluetooth, each with live activity and an on/off toggle).
- Each metric draws a live sparkline. Toggle a radio or the USB-C charger to watch power and thermals respond.
> *Screenshot spec: Health grid mid-stream with sparklines and the radios card.*

### Cast — push to the 4K screen (AX-103/104)
1. Open **Cast**. Pick a type: **Offline map & route**, **Live dashboard**, **Notification**, or **Document**.
2. The device mock on the right renders what the AXIOM screen shows; casting auto-upgrades the link to **Wi-Fi 6E** while Bluetooth stays connected for control.
3. For maps, choose a destination and add waypoints; **Stop casting** returns the screen to idle and the link to Bluetooth.
> *Screenshot spec: Cast view with the map rendered on the device mock.*

### Vault — your captures (AX-106)
- Open **Vault** for a searchable, local-first library of captures (Sub-GHz, NFC, RFID), logs, scripts, and configs.
- **Search** by note, type, frequency, or tag; filter by a **tag chip**. Click a capture to expand its detail (frequency, RSSI, size, captured-at, version, geotag, tags) and delete it.
- The vault fills **automatically**: sustained radio activity lands a fresh, geotagged capture (throttled), and **Simulate capture** adds one on demand. Everything persists locally — no account.
> *Screenshot spec: Vault list with the search bar, tag rail, and one expanded capture.*

### Firmware — safe OTA (AX-110)
- **Firmware** shows your installed version, channel, and boot slot. **Check for updates** → if one exists, see size + release notes → **Install**.
- Updates write to the **inactive A/B slot** and verify before switching; a failed boot rolls back automatically — a power loss mid-update cannot brick the device. Version history is kept.

### Settings (AX-101/102/111)
- **Device:** rename, change region. **Connection:** preferred transport (Auto / Bluetooth / Wi-Fi / USB) + "simulate link drop." **Alerts:** enable + thresholds for low battery, SoC temperature, storage. **Telemetry data:** export the buffered samples as **CSV** or **JSON**; disconnect or forget the device.

---

## Developer guide

### Project structure
```
app/
  layout.js, page.js, globals.css   landing page (renders content/landing-body.html)
  LandingScript.js                  landing interactivity
  app/
    page.js                         mounts the Command SPA at /app
    command.css                     DKube Design System + Command styles
    lib/
      device-sim.js                 DeviceSim — telemetry frame source (axiomd stand-in)
      transport.js                  Transport interface + SimTransport + ConnectionManager
      command.js                    all views: pair, Health, Cast, Vault, Firmware, Settings
content/landing-body.html           landing markup
public/
  command.html                      AXIOM Command marketing page (this pipeline)
  kickstarter.html                  standalone landing copy
  assets/                           device.png, axiom-anthem-ad.mp4
db/                                 Neon tracking: schema.sql, seed.sql, *.mjs CLIs
docs/                               PRD, implementation plan, and docs/aina/* (this pipeline)
```

### Local setup
```bash
npm install
npm run dev            # http://localhost:3000  → / and /app
npm run build          # production build
npm start              # serve the production build
```
No environment variables are needed to run the app — the Command client is self-contained and boots the simulator. The **tracking** layer is separate.

### Environment variables
| Var | Used by | Notes |
|---|---|---|
| `DATABASE_URL` | `db/*.mjs` (Neon tracking) | git-ignored; not needed to run the app |
| `NEON_*` | provisioning scripts | optional |
| *(future)* `ANTHROPIC_API_KEY` | AI Copilot (V1.1) | not in current scope |

### Extending the app
- **Add a view:** add an `I.<icon>`, a `navItem(...)` in `renderShell`, a branch in `setView`, and a `render<View>()` function. Reuse `topbar`, `card`, `toast`, `loadJSON/saveJSON`, and `esc`. See the Vault (`renderVault`) as the reference pattern.
- **Telemetry frame is a frozen contract:** extend `device-sim.js`'s emitted frame **additively only** — every consumer (UI, History/export, future real adapters) reads the same shape.
- **Real transports:** implement `connect / onFrame / send / upgrade` on `BleTransport / WifiTransport / UsbTransport` to swap the simulator out with zero UI change.

### Tracking the implementation
```bash
node db/status.mjs                                  # per-phase rollups from Neon
node db/update.mjs AX-106 done 100 "Vault shipped"  # update a feature
```
Source of truth: [`docs/IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md) ↔ the Neon `phases`/`features` tables.

---

## Documentation summary
- 1 architecture diagram (Mermaid).
- 6 user-facing flows documented: pair, Health, Cast, Vault, Firmware, Settings.
- 5 screenshot specs called out for the user guide.
- Developer guide covers structure, local setup, env vars, the view-extension pattern, the frozen frame contract, and tracking.
- Does **not** overwrite the existing repo `README.md` (kept as the 30-second front door).
