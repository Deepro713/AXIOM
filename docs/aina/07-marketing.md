# 07 · Marketing — AXIOM Command

> **Stage:** Marketing (AiNa pipeline) · Reads: PRD, [`01-braindoc.md`](01-braindoc.md), [`04-dev-notes.md`](04-dev-notes.md) · **Deliverables:** this strategy doc **+** the product page at [`public/command.html`](../../public/command.html) (served at `/command.html`)
> Brand → copy → visual → pack. The page is distinct from the device Kickstarter landing (`/`): that sells the *hardware*; this sells the *app as the daily habit*.

---

## Positioning statement
**For makers and authorized RF researchers who own an AXIOM, AXIOM Command is the command center that lets you see everything your device is doing, push anything to its 4K screen, and keep every capture safe — unlike a laptop full of ad-hoc scripts and a USB cable.**

## Target persona
- **Name / archetype:** "Mara & Raj" — the maker and the authorized researcher (same Kickstarter backer audience).
- **Daily job-to-be-done:** know their AXIOM is healthy and drive it without tethering to a laptop.
- **Current workaround:** USB cable + terminal + manual notes; no visibility once the device is in a bag or across the bench.
- **Pain in the workaround:** blind to battery/heat/storage/radios when untethered; the 4K screen is a dead one-way display; captures are trapped on-device with no backup or search.
- **Decision trigger:** the first time they reach for the device mid-project and ask "is it still alive / still recording / overheating?" — and can't answer.

## Brand voice
- **Direct** — Says what it does, no hype. "See your device's battery, heat, and radios live" — not "holistic device intelligence."
- **Technical-credible** — Names real hardware (RK3588S, Wi-Fi 6E, CC1101). The audience respects specifics and smells marketing fluff instantly.
- **Trust-first** — Leads with local-first, encryption, and responsible-use. For this audience, restraint is the flex.

## Taglines (3 variants → primary)
1. **"See everything. Cast anything. Lose nothing."** ← **primary**
2. "Your AXIOM's nervous system."
3. "The command center for your pocket computer."

## Anti-positioning (what AXIOM Command is NOT)
- **Not a hacking toolkit.** Every radio feature is framed for authorized testing, research, education, and personal devices — never for defeating controls on systems you don't own.
- **Not a social network.** The vault and (future) library are utilitarian, not a feed.
- **Not a generic smart-home/IoT hub.** It is purpose-built for one Linux-class, multi-radio device — not a Tuya-style everything-app.

## Messaging pillars → P0 feature blurbs
| Pillar | Headline | Blurb (for the page) |
|---|---|---|
| **See everything** | Live telemetry, glanceable | Power, thermals, compute, storage, and every radio — streaming with sub-second latency. One status line tells you it's nominal; one tap shows you why. |
| **Cast anything** | Your 4K screen, finally useful | Push an offline map and route, a live field dashboard, a notification, or a document to the 5.9″ AMOLED panel — in three taps, auto-upgrading to Wi-Fi 6E. |
| **Lose nothing** | A vault for every capture | Sub-GHz, NFC, RFID, logs, and scripts land in a local-first vault you can search, tag, and version — no account required. |
| **Stay safe** | Updates that can't brick | OTA firmware with A/B partitions and automatic rollback — a power loss mid-update can't kill your device. |
| **One link, three radios** | Seamless connection | Bluetooth for presence and control, Wi-Fi 6E for casting and sync, USB-C for setup — one session that hands off automatically. |

## FAQ (first 4 = page accordions)
1. **Do I need an account?** No. Pairing, telemetry, the local vault, casting, and OTA all work over a direct link with no account. Cloud sync and the AI copilot are opt-in later.
2. **Is my data private?** Local-first by default — nothing leaves your device without explicit opt-in. Cloud sync (when it ships) is end-to-end encrypted with keys held in your device's secure enclave.
3. **Is this for hacking?** No. Every radio and capture feature is built for makers, educators, and authorized security research on systems and spectrum you own or are permitted to use, with region-aware compliance and authorization gates.
4. **Can I try it now?** Yes — the Alpha web client runs against a built-in device simulator, so you can explore Health, Cast, the Vault, and OTA in your browser before hardware ships.
5. **What does it run on?** iOS, Android, macOS, Windows, and the web. The web client is live today; native shells follow with the device.
6. **What's free vs paid?** Free covers pairing, telemetry, the local vault, cast basics, and OTA. Pro adds cloud E2E sync, the AI copilot, RF signal mapping, automations, and unlimited history.

## Social posts (first 3 = page cards)
- **X / Twitter:** "Your AXIOM is the body. AXIOM Command is the nervous system. Live telemetry, cast-to-screen, and a searchable capture vault — local-first, no account needed. See everything, cast anything, lose nothing. 🟣"
- **LinkedIn:** "Open hardware dies without great software. AXIOM Command turns a pocket multitool into a platform: real-time power/thermal/radio telemetry, cast maps + dashboards to a 4K screen, and an encrypted capture vault — with fleet management for labs and security teams on the roadmap."
- **Reddit (r/cyberdeck / r/flipperzero):** "Built the companion app I always wanted for a Linux-class pocket multitool: 1 Hz telemetry for every radio, cast offline maps to the device screen, and a vault that auto-saves captures and lets you search them. Runs against a simulator in-browser right now — feedback welcome."

## GTM
- **Launch channel:** the Kickstarter backer base (3,000+ design partners) — warm, pre-qualified, app-ready.
- **Hook content:** RF signal-mapping demos (the "irresistible" feature) are inherently shareable — a geotagged heatmap on both screens is the screenshot that travels.
- **Funnel:** device landing (`/`) → "Meet AXIOM Command" (`/command.html`) → try the simulator (`/app`) → backer beta → Free → Pro.
- **Expansion:** education (makerspaces, university labs) and SMB security/field teams via Teams (fleet/audit) — where ACV jumps 5–20×.
- **Pricing narrative:** Free drives activation (works with no account); Pro monetizes sync + intelligence; Teams monetizes fleets.

## Page spec (`public/command.html`)
- **Brand:** DKube Design System — Poppins, purple `#7660A8`/`#9384BD`, pill buttons, soft-shadow cards, dark hero (matches `/app`). Self-contained, inline CSS, no build step (mirrors the existing `public/kickstarter.html` convention).
- **Sections:** sticky nav · `#hero` (tagline + 3 benefit bullets + "Open the app" CTA → `/app` + trust line) · `#features` (5 P0 cards) · `#how` (3-radio handoff) · `#faq` (4 accordions) · `#cta` (try-the-simulator) · footer with responsible-use note.
- **CTA primary:** "Open AXIOM Command" → `/app`. **Secondary:** "Back the device" → `/`.
