-- AXIOM Command — seed phases & features from the implementation plan.
-- Upsert: re-running refreshes definitions WITHOUT clobbering live status/progress/notes.

insert into phases (phase_key, name, description, target_window, sort_order, status) values
  ('alpha', 'Alpha',      'Connect & observe — pair, live telemetry, OTA, cast a map on real hardware.', 'Q4 2026', 1, 'not_started'),
  ('beta',  'Beta',       'Cast & safeguard — cast-anything (P0), local vault, alerts, find-my, transport handoff.', 'Q1 2027', 2, 'not_started'),
  ('v1',    '1.0 Launch', 'Cloud & commerce — all P0 GA plus accounts, cloud sync, Pro tier.', 'Q2 2027', 3, 'not_started'),
  ('v1_1',  '1.1',        'Intelligence & maps — AI copilot, RF signal mapping, automations, mirror, beam.', 'Q3 2027', 4, 'not_started'),
  ('v2',    '2.0',        'Platform & teams — fleet/Teams, plugin SDK + marketplace, remote control, web console.', 'Q4 2027+', 5, 'not_started')
on conflict (phase_key) do update
  set name = excluded.name,
      description = excluded.description,
      target_window = excluded.target_window,
      sort_order = excluded.sort_order;

insert into features (code, phase_key, title, description, priority, prd_section, target_window, sort_order) values
  -- Phase 1: Alpha
  ('AX-101','alpha','Onboarding & pairing','QR + USB fast-setup with encrypted key exchange; ≤30 s time-to-first-pair.','P0','9.1','Q4 2026',1),
  ('AX-102','alpha','Telemetry & health dashboard','Real-time power/thermal/compute/storage/radio telemetry; <1 s local latency.','P0','9.2','Q4 2026',2),
  ('AX-103','alpha','Cast to device — maps','Offline vector map pack + route cast to the 4K AMOLED; on-device turn-by-turn.','P0','9.3','Q4 2026',3),
  ('AX-110','alpha','Firmware & OTA updates','Staged OTA with A/B partitions and automatic rollback; no-brick guarantee.','P0','9.10','Q4 2026',4),
  ('AX-111','alpha','Transport layer & handoff','Single session over BLE 5.3 / Wi-Fi 6E / USB-C with seamless auto-handoff.','P0','8','Q4 2026',5),
  -- Phase 2: Beta
  ('AX-104','beta','Cast to device — anything','Notifications, images, docs, and custom live dashboards; ≥5 cast types.','P0','9.4','Q1 2027',6),
  ('AX-106','beta','Capture Vault (local-first)','Searchable, versioned library of captures/scripts/configs; works with no account.','P0','9.6','Q1 2027',7),
  ('AX-112','beta','Alerts & thresholds','Low-battery/overheat/storage/offline/unexpected-radio alerts; fire ≤10 s.','P0','9.2','Q1 2027',8),
  ('AX-109','beta','Find My AXIOM & lost mode','BLE presence + GNSS locate, ring/flash, lost mode, remote wipe of sensitive items.','P1','9.9','Q1 2027',9),
  -- Phase 3: 1.0 Launch
  ('AX-201','v1','Accounts & E2E cloud sync','Opt-in end-to-end encrypted sync of vault across the user''s installs.','P1','9.6','Q2 2027',10),
  ('AX-202','v1','Pro tier & billing','Freemium upgrade unlocking cloud/AI/mapping/automations.','P1','14','Q2 2027',11),
  ('AX-203','v1','P0 GA hardening','Perf, accessibility (WCAG 2.2 AA), crash-free ≥99.5% — launch gate.','P0','10','Q2 2027',12),
  -- Phase 4: 1.1
  ('AX-107','v1_1','AI Copilot','On-device NPU + cloud reasoning; explain telemetry/captures, NL control; ≥75% thumbs-up.','P1','9.7','Q3 2027',13),
  ('AX-105','v1_1','RF Signal Mapping','Geotagged radio-detection heatmaps overlaid on cast maps; authorization-gated.','P1','9.5','Q3 2027',14),
  ('AX-108','v1_1','Automations & rules engine','Trigger/condition/action engine with NL authoring via copilot.','P1','9.8','Q3 2027',15),
  ('AX-204','v1_1','Screen mirror / present mode','Mirror phone/desktop to the 4K panel over Wi-Fi at 30 fps <150 ms.','P1','9.4','Q3 2027',16),
  ('AX-113','v1_1','Cross-device beam & continuity','Shared clipboard and one-tap file/session beam between app and device.','P1','9.13','Q3 2027',17),
  -- Phase 5: 2.0
  ('AX-114','v2','Fleet management / Teams','Org workspace: enroll, policy, fleet dashboard, audit log, RBAC, usage reporting.','P2','9.11','Q4 2027+',18),
  ('AX-115','v2','Plugin SDK & Marketplace','Signed third-party AXIOM Apps; reviewed store with revenue share.','P2','9.12','Q4 2027+',19),
  ('AX-205','v2','Two-way remote control','Full "AXIOM Remote" — touch-on-device drives app and vice versa.','P2','9.4','Q4 2027+',20),
  ('AX-206','v2','Web fleet console','Browser console to read telemetry and manage fleets.','P2','9.11','Q4 2027+',21)
on conflict (code) do update
  set phase_key = excluded.phase_key,
      title = excluded.title,
      description = excluded.description,
      priority = excluded.priority,
      prd_section = excluded.prd_section,
      target_window = excluded.target_window,
      sort_order = excluded.sort_order;
