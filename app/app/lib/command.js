/* AXIOM Command — Alpha app controller.
   Wires the device simulator + transport into pairing, telemetry, cast, firmware, and settings.
   Phase 1 complete: persistence + auto-reconnect, configurable alerts, telemetry export,
   transport selection + link-drop handling, cast destinations, and OTA history. */
(function (root) {
  "use strict";
  var AXIOM = root.AXIOM;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var app = $("#app");
  var LS = (function () { try { return root.localStorage; } catch (e) { return null; } })();

  // ---- tiny SVG icon set ----
  var I = {
    cube: '<svg class="logo-cube" viewBox="0 0 120 120"><path d="M60 14 106 38v6L60 20Z" fill="#9384BD"/><path d="M60 20v44L14 40Z" fill="#7660A8"/><path d="M60 26 100 48 60 70 20 48Z" fill="#7660A8"/><path d="M60 26 100 48 60 70Z" fill="#9384BD"/><path d="M20 60 60 82 100 60 60 38Z" fill="#D6D6D6"/></svg>',
    health: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l2-7 4 18 2-9 1 3h5"/></svg>',
    cast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 16a6 6 0 0 1 6 6M2 12a10 10 0 0 1 10 10M2 8a14 14 0 0 1 14 14"/><rect x="2" y="3" width="20" height="14" rx="2"/></svg>',
    chip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>',
    fw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 6.6 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 13.4H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 5 6.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10.6 3H11a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a2 2 0 1 1 0 4h-.1Z"/></svg>',
    batt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 11v2"/></svg>',
    therm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 14V4a2 2 0 0 0-4 0v10a4 4 0 1 0 4 0Z"/></svg>',
    hdd: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h10M7 13h6"/></svg>',
    radio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M5 12a7 7 0 0 1 14 0M2 12a10 10 0 0 1 20 0"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m9 4 6 2 6-2v14l-6 2-6-2-6 2V6l6-2Zm0 0v14m6-12v14"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7M10 21a2 2 0 0 0 4 0"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Zm0 0v5h5M9 13h6M9 17h6"/></svg>',
    gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm1.5-3.5L17 7M4 18a9 9 0 1 1 16 0"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    vault: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l9-4 9 4v6c0 5-3.5 8-9 9-5.5-1-9-4-9-9Z"/><path d="M9 12l2 2 4-4"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    nfc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a9 9 0 0 1 12 0M9 12a5 5 0 0 1 6 0M12 15v0"/><rect x="3" y="4" width="18" height="16" rx="3"/></svg>'
  };

  var LATEST_FW = "1.1.0-alpha";
  var DESTS = [
    { name: "Almaden Blvd", dist: "400 m", turn: "Turn right" },
    { name: "Tech Museum", dist: "1.2 km", turn: "Continue straight" },
    { name: "Diridon Station", dist: "2.8 km", turn: "Turn left" },
    { name: "Santana Row", dist: "5.1 km", turn: "Keep right" }
  ];

  // ---------- persistence ----------
  function loadJSON(k, d) { try { return JSON.parse(LS.getItem(k)) || d; } catch (e) { return d; } }
  function saveJSON(k, v) { try { LS.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function defaultSettings() { return { battLow: 15, socHot: 85, storFull: 90, prefTransport: "auto", alerts: true }; }

  // ---------- capture vault (AX-106) — seeded library; auto-captures from radio activity ----------
  var HOUR = 3600e3;
  function defaultCaptures() {
    var now = Date.now();
    return [
      { id: "cap_7f31", type: "subghz", note: "Garage remote · 433.92 MHz", freq: "433.92 MHz", rssi: -58, size_kb: 12, tags: ["sub-ghz", "remote"], geo: { lat: 37.3349, lon: -121.8916 }, ts: now - 2 * HOUR, version: 2 },
      { id: "cap_5a08", type: "nfc", note: "Office access fob (NTAG215)", size_kb: 0.9, tags: ["nfc", "access"], geo: null, ts: now - 5 * HOUR, version: 1 },
      { id: "cap_b2c4", type: "rfid", note: "EM4100 125 kHz tag", size_kb: 0.1, tags: ["rfid", "125khz"], geo: null, ts: now - 26 * HOUR, version: 1 },
      { id: "cap_91de", type: "script", note: "sweep-subghz.axs · band scan", size_kb: 3.4, tags: ["script", "sub-ghz"], geo: null, ts: now - 30 * HOUR, version: 4 },
      { id: "cap_3ac7", type: "log", note: "RF survey · Diridon walk", size_kb: 184, tags: ["log", "survey"], geo: { lat: 37.3297, lon: -121.9026 }, ts: now - 52 * HOUR, version: 1 },
      { id: "cap_0d6f", type: "config", note: "Field power dashboard layout", size_kb: 2.1, tags: ["config", "cast"], geo: null, ts: now - 96 * HOUR, version: 3 }
    ];
  }

  var state = {
    cm: new AXIOM.ConnectionManager(),
    device: null, transport: null,
    connected: false, view: "health", frame: null,
    hist: { batt: [], soc: [], cpu: [] },
    log: [],                 // telemetry ring buffer (cap 600)
    cast: null, casting: false, dest: 0, waypoints: 0,
    fwHistory: [],
    activeAlerts: {},        // key -> true while firing
    _linkDown: false,
    captures: (LS && loadJSON("axiom.vault", null)) || defaultCaptures(),
    vaultQuery: "", vaultTag: null, _lastCap: 0,
    settings: (LS && loadJSON("axiom.settings", defaultSettings())) || defaultSettings()
  };

  // ============================================================ BOOT
  function boot() {
    var saved = LS && loadJSON("axiom.device", null);
    if (saved && saved.id) reconnect(saved);
    else renderConnect();
  }
  function reconnect(saved) {
    app.innerHTML = '<div class="connect"><div class="connect-card fade-in" style="text-align:center">' +
      '<div class="brand-row" style="justify-content:center">' + I.cube +
      '<div><div class="word">AXIOM Command</div><div class="sub">Device Console</div></div></div>' +
      '<div class="handshake" style="justify-content:center"><span class="spin"></span> Reconnecting to ' + esc(saved.name) + '…</div>' +
      '</div></div>';
    setTimeout(function () { completeConnect(saved.name, saved.region, saved.id); }, 900);
  }

  // ============================================================ PAIRING (AX-101)
  function renderConnect() {
    app.innerHTML =
      '<div class="connect"><div class="connect-card fade-in">' +
        '<div class="brand-row">' + I.cube +
          '<div><div class="word">AXIOM Command</div><div class="sub">Device Console</div></div></div>' +
        '<h1>Connect your AXIOM</h1>' +
        '<p class="lede">Power on your device and keep it nearby. AXIOM Command will find it over Bluetooth and pair securely.</p>' +
        '<div class="discover" id="discover"><div class="scanning"><span class="spin"></span> Scanning for nearby devices…</div></div>' +
        '<a class="back-home" href="/">← Back to axiom.dev</a>' +
      '</div></div>';
    state.cm.discover().then(function (list) {
      var d = list[0];
      $("#discover").innerHTML =
        '<div class="dev-row fade-in" id="devRow">' +
          '<div class="dev-ic">' + I.cube + '</div>' +
          '<div class="dev-meta"><div class="n">' + d.model + '</div>' +
            '<div class="s">' + d.id + ' · signal ' + d.rssi + ' dBm</div></div>' +
          '<button class="btn btn-primary btn-sm" id="pairBtn">Pair</button>' +
        '</div>';
      $("#pairBtn").onclick = function () { startPairing(d); };
    });
  }

  function startPairing(d) {
    var code = String(Math.floor(100000 + Math.random() * 900000));
    $("#discover").innerHTML =
      '<div class="pairing-code fade-in">' +
        '<div class="lbl">Confirm this code shows on your AXIOM screen</div>' +
        '<div class="code-digits">' + code.split("").map(function (c) { return "<span>" + c + "</span>"; }).join("") + '</div>' +
        '<div class="handshake"><span class="spin"></span> Establishing encrypted channel…</div>' +
      '</div>';
    state.cm.pair(d, code).then(function () {
      $("#discover").innerHTML =
        '<div class="fade-in">' +
          '<div class="field"><label>Device name</label><input id="devName" value="AXIOM" /></div>' +
          '<div class="field"><label>Region (sets radio compliance)</label>' + regionOptions("US") + '</div>' +
          '<div class="connect-actions"><button class="btn btn-primary" id="finishBtn">' + I.check + ' Finish setup</button></div>' +
        '</div>';
      $("#finishBtn").onclick = function () {
        completeConnect($("#devName").value || "AXIOM", $("#region").value, d.id);
      };
    });
  }
  function regionOptions(sel) {
    var opts = [["US", "United States (FCC)"], ["EU", "European Union (CE)"], ["UK", "United Kingdom"], ["JP", "Japan"], ["AU", "Australia"]];
    return '<select id="region">' + opts.map(function (o) {
      return '<option value="' + o[0] + '"' + (o[0] === sel ? " selected" : "") + '>' + o[1] + '</option>';
    }).join("") + '</select>';
  }

  function completeConnect(name, region, id) {
    var dev = new AXIOM.DeviceSim({ id: id, name: name, region: region });
    dev.region = region;
    var t = new AXIOM.SimTransport(dev);
    if (state.settings.prefTransport && state.settings.prefTransport !== "auto") t.upgrade(state.settings.prefTransport);
    state.device = dev; state.transport = t; state.connected = true;
    state.fwHistory = [{ version: dev.firmware, ts: Date.now(), note: "installed at setup" }];
    if (LS) saveJSON("axiom.device", { id: dev.id, name: name, region: region });
    t.onFrame(onFrame);
    state.cm.attach(t).then(function () { renderShell(); });
  }

  function disconnect(forget) {
    if (state.transport && state.device) state.device.stop();
    if (forget && LS) LS.removeItem("axiom.device");
    state.connected = false; state.frame = null;
    state.hist = { batt: [], soc: [], cpu: [] }; state.log = [];
    renderConnect();
  }

  // ============================================================ SHELL
  function renderShell() {
    app.innerHTML =
      '<div class="shell">' +
        '<aside class="side">' +
          '<div class="brand-row">' + I.cube + '<div class="word">AXIOM</div></div>' +
          navItem("health", I.health, "Health") +
          navItem("cast", I.cast, "Cast") +
          navItem("vault", I.vault, "Vault") +
          navItem("firmware", I.fw, "Firmware") +
          navItem("settings", I.gear, "Settings") +
          '<div class="side-foot"><div class="side-dev"><span class="d"></span>' +
            '<div><div style="color:#fff;font-weight:600">' + esc(state.device.name) + '</div>' +
            '<div class="muted" style="font-size:11px">' + state.device.id + ' · ' + state.device.region + '</div></div></div>' +
            '<a class="back-home" href="/" style="margin-top:12px">← axiom.dev</a></div>' +
        '</aside>' +
        '<main class="main" id="main"></main>' +
      '</div>';
    Array.prototype.forEach.call(document.querySelectorAll(".nav-item"), function (n) {
      n.onclick = function () { setView(n.getAttribute("data-v")); };
    });
    setView(state.view);
  }
  function navItem(v, icon, label) {
    return '<a class="nav-item" data-v="' + v + '">' + icon + '<span>' + label + '</span></a>';
  }
  function setView(v) {
    state.view = v;
    Array.prototype.forEach.call(document.querySelectorAll(".nav-item"), function (n) {
      n.classList.toggle("active", n.getAttribute("data-v") === v);
    });
    if (v === "health") renderHealth();
    else if (v === "cast") renderCast();
    else if (v === "vault") renderVault();
    else if (v === "firmware") renderFirmware();
    else if (v === "settings") renderSettings();
  }

  // ============================================================ TELEMETRY (AX-102)
  function onFrame(f) {
    state.frame = f;
    push(state.hist.batt, f.power.battery_pct);
    push(state.hist.soc, f.thermal.soc_c);
    push(state.hist.cpu, f.compute.cpu_avg);
    state.log.push(flatten(f)); if (state.log.length > 600) state.log.shift();
    evalAlerts(f);
    maybeAutoCapture(f);
    if (state.view === "health" && $("#m-batt")) updateHealth(f);
    if (state.view === "cast" && state.casting) drawDeviceScreen();
    updateTopLink(f);
  }
  function push(a, v) { a.push(v); if (a.length > 60) a.shift(); }
  function flatten(f) {
    return {
      ts: f.ts, battery_pct: f.power.battery_pct, charging: f.power.charging,
      voltage: f.power.voltage, current_a: f.power.current_a,
      soc_c: f.thermal.soc_c, board_c: f.thermal.board_c, throttling: f.thermal.throttling,
      cpu_avg: f.compute.cpu_avg, ram_used_gb: f.compute.ram_used_gb, npu_pct: f.compute.npu_pct,
      nvme_used_gb: f.storage.nvme_used_gb,
      subghz: f.radios.subghz.on, nfc: f.radios.nfc.on, rfid: f.radios.rfid.on,
      wifi: f.radios.wifi.on, bt: f.radios.bt.on, wifi_rssi: f.radios.wifi.rssi,
      transport: f.link.transport, latency_ms: f.link.latency_ms, link_quality: f.link.quality_pct
    };
  }

  function renderHealth() {
    var f = state.frame; if (!f) return;
    var main = $("#main");
    main.innerHTML =
      topbar("Health", "Live telemetry · " + f.link.label) +
      '<div id="banner"></div>' +
      '<div class="grid">' +
        card("span4", I.batt, "Power", powerCard(f), "m-batt") +
        card("span4", I.therm, "Thermals", thermCard(f), "m-therm") +
        card("span4", I.hdd, "Storage", storageCard(f), "m-stor") +
        card("span8", I.chip, "Compute", computeCard(f), "m-comp") +
        card("span4", I.gauge, "Connection", linkCard(f), "m-link") +
        card("span12", I.radio, "Radios", radiosCard(f), "m-radio") +
      '</div>';
    bindRadioToggles();
    updateHealth(f);
  }

  function powerCard(f) {
    return '<div class="metric"><span class="v" id="v-batt">' + Math.round(f.power.battery_pct) + '</span><span class="u">%</span>' +
      '<span class="chip" id="c-charge" style="margin-left:auto"></span></div>' +
      '<div class="bar"><i id="bar-batt" class="good"></i></div>' +
      '<div class="sub-metrics"><div class="sm">Voltage <b id="s-volt"></b></div>' +
      '<div class="sm">Current <b id="s-cur"></b></div><div class="sm" id="s-eta"></div></div>' +
      '<canvas class="spark" id="sp-batt"></canvas>' +
      '<button class="btn btn-ghost btn-sm" id="chargeBtn" style="margin-top:6px">Toggle USB-C charger</button>';
  }
  function thermCard(f) {
    return '<div class="metric"><span class="v" id="v-soc">' + Math.round(f.thermal.soc_c) + '</span><span class="u">°C SoC</span>' +
      '<span class="chip ok" id="c-throttle" style="margin-left:auto">nominal</span></div>' +
      '<div class="sub-metrics"><div class="sm">Board <b id="s-board"></b></div></div>' +
      '<canvas class="spark" id="sp-soc"></canvas>';
  }
  function storageCard(f) {
    return '<div class="metric"><span class="v" id="v-stor">' + f.storage.nvme_used_gb + '</span><span class="u">/ 256 GB</span></div>' +
      '<div class="bar"><i id="bar-stor" class="good"></i></div>' +
      '<div class="sub-metrics"><div class="sm">Read <b id="s-rd"></b></div><div class="sm">Write <b id="s-wr"></b></div></div>';
  }
  function computeCard(f) {
    return '<div class="sub-metrics" style="margin:0 0 4px"><div class="sm">CPU avg <b id="s-cpu"></b></div>' +
      '<div class="sm">RAM <b id="s-ram"></b> / 16 GB</div><div class="sm">NPU <b id="s-npu"></b></div></div>' +
      '<div class="cores" id="cores"></div><canvas class="spark" id="sp-cpu"></canvas>';
  }
  function linkCard(f) {
    return '<div class="metric"><span class="v" id="v-lat">' + f.link.latency_ms + '</span><span class="u">ms</span></div>' +
      '<div class="sub-metrics"><div class="sm">Transport <b id="s-tx"></b></div>' +
      '<div class="sm">Quality <b id="s-q"></b></div></div>' +
      '<div class="bar"><i id="bar-link" class="good"></i></div>';
  }
  function radiosCard(f) {
    var rows = "", r = f.radios;
    rows += radioRow("subghz", "Sub-GHz", r.subghz.band + " · CC1101", r.subghz);
    rows += radioRow("nfc", "NFC", "PN7150", r.nfc);
    rows += radioRow("rfid", "RFID", "13.56 MHz + 125 kHz", r.rfid);
    rows += radioRow("wifi", "Wi-Fi 6E", r.wifi.ssid + " · " + r.wifi.rssi + " dBm", r.wifi);
    rows += radioRow("bt", "Bluetooth 5.3", r.bt.devices + " devices", r.bt);
    return '<div class="radios">' + rows + '</div>';
  }
  function radioRow(key, name, sub, r) {
    return '<div class="radio-row"><div class="radio-ic">' + I.radio + '</div>' +
      '<div class="radio-meta"><div class="n">' + name + '</div><div class="s">' + sub + '</div></div>' +
      '<div class="activity" id="act-' + key + '"></div>' +
      '<button class="toggle ' + (r.on ? "on" : "") + '" data-radio="' + key + '" aria-label="toggle ' + name + '"></button></div>';
  }

  function updateHealth(f) {
    set("v-batt", Math.round(f.power.battery_pct));
    var bp = f.power.battery_pct, bcls = bp < state.settings.battLow ? "crit" : bp < 30 ? "warn" : "good";
    var bar = $("#bar-batt"); if (bar) { bar.style.width = bp + "%"; bar.className = bcls; }
    chip("c-charge", f.power.charging ? "charging" : "discharging", f.power.charging ? "ok" : "");
    set("s-volt", f.power.voltage.toFixed(2) + " V");
    set("s-cur", f.power.current_a.toFixed(2) + " A");
    set("s-eta", f.power.charging ? ("Full in <b>" + f.power.time_to_full_min + " min</b>") :
      ("Empty in <b>" + f.power.time_to_empty_min + " min</b>"), true);

    set("v-soc", Math.round(f.thermal.soc_c));
    set("s-board", f.thermal.board_c.toFixed(1) + " °C");
    chip("c-throttle", f.thermal.throttling ? "throttling" : "nominal", f.thermal.throttling ? "warn" : "ok");

    set("v-stor", f.storage.nvme_used_gb);
    var sbar = $("#bar-stor"); if (sbar) sbar.style.width = (f.storage.nvme_used_gb / 256 * 100) + "%";
    set("s-rd", f.storage.read_mbs + " MB/s"); set("s-wr", f.storage.write_mbs + " MB/s");

    set("s-cpu", f.compute.cpu_avg + "%"); set("s-ram", f.compute.ram_used_gb);
    set("s-npu", f.compute.npu_pct + "%");
    renderCores(f.compute.cpu);

    set("v-lat", f.link.latency_ms); set("s-tx", f.link.label);
    set("s-q", f.link.quality_pct + "%");
    var lb = $("#bar-link"); if (lb) lb.style.width = f.link.quality_pct + "%";

    ["subghz", "nfc", "rfid", "wifi", "bt"].forEach(function (k) { renderActivity("act-" + k, f.radios[k]); });

    spark("sp-batt", state.hist.batt, "#9384BD", 0, 100);
    spark("sp-soc", state.hist.soc, "#E0B25A", 25, 95);
    spark("sp-cpu", state.hist.cpu, "#7FE0B0", 0, 100);

    renderBanner(f);
  }

  function renderCores(cpu) {
    var el = $("#cores"); if (!el) return;
    if (el.children.length !== 8) {
      el.innerHTML = cpu.map(function (_, i) { return '<div class="core"><span>C' + i + '</span><i></i></div>'; }).join("");
    }
    Array.prototype.forEach.call(el.children, function (c, i) { c.querySelector("i").style.height = cpu[i] + "%"; });
  }
  function renderActivity(id, r) {
    var el = $("#" + id); if (!el) return;
    if (el.children.length !== 7) { el.innerHTML = ""; for (var i = 0; i < 7; i++) el.appendChild(document.createElement("i")); }
    var on = r.on, act = r.act || 0;
    Array.prototype.forEach.call(el.children, function (bar, i) {
      var h = on ? Math.max(3, (Math.sin(Date.now() / 200 + i) * 0.5 + 0.5) * (act / 100) * 18) : 2;
      bar.style.height = h + "px"; bar.style.opacity = on ? (0.4 + act / 200) : 0.18;
    });
  }
  function renderBanner(f) {
    var el = $("#banner"); if (!el) return;
    var msg = null, cls = "", sub = "", st = state.settings;
    if (f.power.battery_pct < st.battLow) { msg = "Low battery"; cls = "crit"; sub = "Connect USB-C to keep AXIOM running."; }
    else if (f.thermal.soc_c > st.socHot) { msg = "Thermal warning"; cls = "warn"; sub = "SoC above " + st.socHot + " °C — performance may reduce."; }
    else if (f.storage.nvme_used_gb / 256 * 100 > st.storFull) { msg = "Storage almost full"; cls = "warn"; sub = "Free space or sync the capture vault."; }
    if (!msg) {
      el.innerHTML = '<div class="status-banner"><span class="ic" style="color:#7FE0B0">' + I.check + '</span>' +
        '<div><div class="t">All systems nominal</div><div class="s">Battery, thermals, storage, and all radios are healthy.</div></div></div>';
    } else {
      el.innerHTML = '<div class="status-banner ' + cls + '"><span class="ic" style="color:#E0B25A">' + I.bell + '</span>' +
        '<div><div class="t">' + msg + '</div><div class="s">' + sub + '</div></div></div>';
    }
  }

  // alerts -> toast when newly crossing a threshold
  function evalAlerts(f) {
    if (!state.settings.alerts) return;
    var st = state.settings, checks = {
      battLow: { on: f.power.battery_pct < st.battLow && !f.power.charging, msg: "Low battery (" + Math.round(f.power.battery_pct) + "%)" },
      socHot: { on: f.thermal.soc_c > st.socHot, msg: "SoC hot (" + Math.round(f.thermal.soc_c) + "°C)" },
      storFull: { on: f.storage.nvme_used_gb / 256 * 100 > st.storFull, msg: "Storage almost full" }
    };
    Object.keys(checks).forEach(function (k) {
      if (checks[k].on && !state.activeAlerts[k]) { state.activeAlerts[k] = true; toast(checks[k].msg, "warn"); }
      else if (!checks[k].on) state.activeAlerts[k] = false;
    });
  }

  function bindRadioToggles() {
    Array.prototype.forEach.call(document.querySelectorAll(".toggle[data-radio]"), function (t) {
      t.onclick = function () {
        var key = t.getAttribute("data-radio"), on = !t.classList.contains("on");
        t.classList.toggle("on", on);
        state.transport.send("setRadio", { name: key, on: on });
      };
    });
    var cb = $("#chargeBtn");
    if (cb) cb.onclick = function () { state.transport.send("setCharging", { on: !state.frame.power.charging }); };
  }

  // ============================================================ CAST (AX-103/104)
  function renderCast() {
    var main = $("#main");
    main.innerHTML =
      topbar("Cast", "Push content to the 5.9″ 4K AMOLED · auto-upgrades to Wi-Fi") +
      '<div class="cast-wrap"><div>' +
        '<div class="cast-opts">' +
          castOpt("map", I.map, "Offline map & route", "Navigate from the device screen, no phone needed.") +
          castOpt("dash", I.gauge, "Live dashboard", "Mirror key telemetry as a full-screen field meter.") +
          castOpt("notif", I.bell, "Notification", "Send an alert card to the device.") +
          castOpt("doc", I.doc, "Document", "Push a doc or image to read on the 4K panel.") +
        '</div>' +
        '<div id="castControls"></div>' +
        '<p class="muted" style="margin-top:14px;font-size:13px">Casting opens a Wi-Fi 6E channel for low-latency rendering; ' +
        'Bluetooth stays connected for control. <span id="castStatus"></span></p>' +
      '</div>' +
      '<div class="device-mock"><div class="device-frame"><div class="device-knob"></div>' +
        '<canvas class="device-screen" id="devScreen" width="280" height="590"></canvas></div>' +
        '<div class="device-label">AXIOM · 5.9″ 4K AMOLED</div>' +
        '<button class="btn btn-ghost btn-sm" id="stopCast" style="width:100%;justify-content:center;margin-top:10px;display:none">Stop casting</button>' +
        '</div>' +
      '</div>';
    Array.prototype.forEach.call(document.querySelectorAll(".cast-opt"), function (o) {
      o.onclick = function () { doCast(o.getAttribute("data-cast"), o); };
    });
    $("#stopCast").onclick = stopCast;
    state.cast = state.cast || "map";
    var first = document.querySelector('.cast-opt[data-cast="' + state.cast + '"]');
    doCast(state.cast, first);
  }
  function castOpt(k, icon, n, d) {
    return '<button class="cast-opt" data-cast="' + k + '">' + icon +
      '<div class="n">' + n + '</div><div class="d">' + d + '</div></button>';
  }
  function castControls(type) {
    var el = $("#castControls"); if (!el) return;
    if (type === "map") {
      el.innerHTML = '<div class="cast-foot fade-in"><div class="field" style="margin:0;flex:1"><label>Destination</label>' +
        '<select id="destSel">' + DESTS.map(function (d, i) { return '<option value="' + i + '"' + (i === state.dest ? " selected" : "") + '>' + d.name + ' · ' + d.dist + '</option>'; }).join("") + '</select></div>' +
        '<button class="btn btn-ghost btn-sm" id="addWp">+ Waypoint <span id="wpCount">(' + state.waypoints + ')</span></button></div>';
      $("#destSel").onchange = function () { state.dest = parseInt(this.value, 10); };
      $("#addWp").onclick = function () { state.waypoints = (state.waypoints + 1) % 4; set("wpCount", "(" + state.waypoints + ")"); };
    } else el.innerHTML = "";
  }
  function doCast(type, el) {
    state.cast = type;
    Array.prototype.forEach.call(document.querySelectorAll(".cast-opt"), function (o) { o.classList.remove("active"); });
    if (el) el.classList.add("active");
    state.transport.upgrade("wifi");
    state.transport.send("cast", { type: type }).then(function (ack) {
      if ($("#castStatus")) $("#castStatus").innerHTML = ack.ok ?
        '<span style="color:#7FE0B0">✓ Casting "' + type + '" over Wi-Fi 6E</span>' : "cast failed";
    });
    state.casting = true;
    castControls(type);
    var sc = $("#stopCast"); if (sc) sc.style.display = "";
    drawDeviceScreen();
  }
  function stopCast() {
    state.casting = false;
    if (state.settings.prefTransport === "auto") state.transport.upgrade("ble");
    var cv = $("#devScreen"); if (cv) { var x = cv.getContext("2d"); x.fillStyle = "#000"; x.fillRect(0, 0, cv.width, cv.height);
      x.fillStyle = "#6c6780"; x.font = "500 13px Poppins, sans-serif"; x.textAlign = "center"; x.fillText("Screen idle", cv.width / 2, cv.height / 2); x.textAlign = "left"; }
    var sc = $("#stopCast"); if (sc) sc.style.display = "none";
    if ($("#castStatus")) $("#castStatus").innerHTML = '<span class="muted">Casting stopped · back to Bluetooth</span>';
  }
  function drawDeviceScreen() {
    var cv = $("#devScreen"); if (!cv) return;
    var x = cv.getContext("2d"), W = cv.width, H = cv.height, f = state.frame;
    x.fillStyle = "#000"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#9b93ad"; x.font = "600 11px Poppins, sans-serif"; x.textAlign = "left"; x.fillText("AXIOM", 12, 20);
    x.textAlign = "right"; x.fillText(Math.round(f.power.battery_pct) + "%", W - 12, 20); x.textAlign = "left";
    var t = (Date.now() / 1000) % 1000;
    if (state.cast === "map") drawMap(x, W, H, t);
    else if (state.cast === "dash") drawDash(x, W, H, f);
    else if (state.cast === "notif") drawNotif(x, W, H);
    else drawDoc(x, W, H);
  }
  function drawMap(x, W, H, t) {
    var d = DESTS[state.dest];
    x.fillStyle = "#0b0f0c"; x.fillRect(0, 28, W, H - 28);
    x.strokeStyle = "#1c241d"; x.lineWidth = 1;
    for (var gx = -((t * 8) % 40); gx < W; gx += 40) { x.beginPath(); x.moveTo(gx, 28); x.lineTo(gx, H); x.stroke(); }
    for (var gy = 28 + ((t * 4) % 40); gy < H; gy += 40) { x.beginPath(); x.moveTo(0, gy); x.lineTo(W, gy); x.stroke(); }
    x.strokeStyle = "#7660A8"; x.lineWidth = 5; x.lineCap = "round"; x.beginPath();
    x.moveTo(40, H - 40); x.lineTo(40, 320); x.lineTo(150, 320); x.lineTo(150, 150); x.lineTo(230, 150); x.stroke();
    x.strokeStyle = "#9384BD"; x.lineWidth = 2; x.setLineDash([2, 6]); x.stroke(); x.setLineDash([]);
    var wpPts = [[40, 320], [150, 320], [150, 150]];
    for (var w = 0; w < Math.min(state.waypoints, wpPts.length); w++) { x.fillStyle = "#E0C97F"; x.beginPath(); x.arc(wpPts[w][0], wpPts[w][1], 5, 0, 7); x.fill(); }
    var p = (t % 8) / 8, dotY = (H - 40) - p * 120;
    x.fillStyle = "#fff"; x.beginPath(); x.arc(40, dotY, 7, 0, 7); x.fill();
    x.fillStyle = "rgba(147,132,189,.4)"; x.beginPath(); x.arc(40, dotY, 14, 0, 7); x.fill();
    x.fillStyle = "#7FE0B0"; x.beginPath(); x.arc(230, 150, 6, 0, 7); x.fill();
    roundRect(x, 12, H - 70, W - 24, 52, 12, "rgba(20,18,26,.92)");
    x.fillStyle = "#fff"; x.font = "700 15px Poppins, sans-serif"; x.fillText(d.dist + " · " + d.turn, 24, H - 44);
    x.fillStyle = "#9b93ad"; x.font = "500 11px Poppins, sans-serif"; x.fillText("onto " + d.name, 24, H - 28);
  }
  function drawDash(x, W, H, f) {
    var rows = [["Battery", Math.round(f.power.battery_pct) + "%"], ["SoC temp", Math.round(f.thermal.soc_c) + "°C"],
      ["CPU", f.compute.cpu_avg + "%"], ["RAM", f.compute.ram_used_gb + " / 16 GB"],
      ["Sub-GHz", f.radios.subghz.on ? f.radios.subghz.band : "off"], ["Link", f.link.label]];
    rows.forEach(function (r, i) {
      var y = 70 + i * 78;
      roundRect(x, 14, y, W - 28, 64, 12, "rgba(118,96,168,.10)");
      x.fillStyle = "#8e889c"; x.font = "600 11px Poppins"; x.fillText(r[0].toUpperCase(), 28, y + 24);
      x.fillStyle = "#fff"; x.font = "700 22px Poppins"; x.fillText(r[1], 28, y + 50);
    });
  }
  function drawNotif(x, W, H) {
    roundRect(x, 16, 90, W - 32, 110, 16, "rgba(118,96,168,.16)");
    x.fillStyle = "#9384BD"; x.font = "700 12px Poppins"; x.fillText("AXIOM COMMAND", 32, 120);
    x.fillStyle = "#fff"; x.font = "700 17px Poppins"; x.fillText("Capture complete", 32, 148);
    x.fillStyle = "#c7c2d2"; x.font = "400 13px Poppins"; x.fillText("Sub-GHz session saved to vault.", 32, 172);
  }
  function drawDoc(x, W, H) {
    roundRect(x, 16, 70, W - 32, H - 110, 12, "#16131d");
    x.fillStyle = "#fff"; x.font = "700 16px Poppins"; x.fillText("AXIOM field notes", 32, 104);
    for (var i = 0; i < 14; i++) { var w = 200 - (i % 4) * 30; x.fillStyle = "#2a2733"; x.fillRect(32, 124 + i * 22, w, 7); }
  }

  // ============================================================ CAPTURE VAULT (AX-106)
  var CAP_META = {
    subghz: { label: "Sub-GHz", icon: "radio" },
    nfc:    { label: "NFC",      icon: "nfc" },
    rfid:   { label: "RFID",     icon: "radio" },
    log:    { label: "Log",      icon: "doc" },
    script: { label: "Script",   icon: "doc" },
    config: { label: "Config",   icon: "gear" }
  };

  function saveVault() { if (LS) saveJSON("axiom.vault", state.captures); }

  // sustained radio activity occasionally lands a fresh capture (throttled to 12 s)
  function maybeAutoCapture(f) {
    if (Date.now() - state._lastCap < 12000) return;
    var hot = null, r = f.radios;
    if (r.subghz.on && r.subghz.act > 88) hot = { type: "subghz", note: "Sub-GHz burst · " + r.subghz.band, freq: r.subghz.band, rssi: f.radios.wifi.rssi, size_kb: 8 + Math.round(Math.random() * 20), tags: ["sub-ghz", "auto"] };
    else if (r.nfc.on && r.nfc.act > 92) hot = { type: "nfc", note: "NFC tag read", size_kb: 0.9, tags: ["nfc", "auto"] };
    else if (r.rfid.on && r.rfid.act > 92) hot = { type: "rfid", note: "RFID tag · 125 kHz", size_kb: 0.1, tags: ["rfid", "auto"] };
    if (!hot) return;
    state._lastCap = Date.now();
    addCapture(hot, f);
  }

  function addCapture(c, f) {
    c.id = "cap_" + Math.random().toString(16).slice(2, 6);
    c.ts = Date.now();
    c.version = 1;
    c.geo = (f && f.motion.gnss && f.motion.gnss.fix) ? { lat: f.motion.gnss.lat, lon: f.motion.gnss.lon } : null;
    state.captures.unshift(c);
    if (state.captures.length > 200) state.captures.pop();
    saveVault();
    if (state.view === "vault") renderVaultList();
    else toast("Capture saved to vault · " + (CAP_META[c.type] || {}).label, "ok");
  }

  function allTags() {
    var seen = {};
    state.captures.forEach(function (c) { (c.tags || []).forEach(function (t) { seen[t] = (seen[t] || 0) + 1; }); });
    return Object.keys(seen).sort(function (a, b) { return seen[b] - seen[a]; });
  }

  function filteredCaptures() {
    var q = state.vaultQuery.trim().toLowerCase(), tag = state.vaultTag;
    return state.captures.filter(function (c) {
      if (tag && (c.tags || []).indexOf(tag) === -1) return false;
      if (!q) return true;
      var hay = [c.note, c.type, (CAP_META[c.type] || {}).label, c.freq, (c.tags || []).join(" ")].join(" ").toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function renderVault() {
    var main = $("#main");
    main.innerHTML =
      topbar("Capture Vault", "Local-first · searchable · versioned — works with no account") +
      '<div class="vault-bar">' +
        '<div class="vault-search">' + I.search + '<input id="vq" placeholder="Search captures, tags, frequencies…" value="' + esc(state.vaultQuery) + '" /></div>' +
        '<button class="btn btn-ghost btn-sm" id="capNow">' + I.vault + ' Simulate capture</button>' +
      '</div>' +
      '<div class="vault-tags" id="vaultTags"></div>' +
      '<div id="vaultList"></div>';
    $("#vq").oninput = function () { state.vaultQuery = this.value; renderVaultList(); };
    $("#capNow").onclick = function () {
      addCapture({ type: "subghz", note: "Manual capture · 433.92 MHz", freq: "433.92 MHz", rssi: -61, size_kb: 10 + Math.round(Math.random() * 18), tags: ["sub-ghz", "manual"] }, state.frame);
    };
    renderVaultTags();
    renderVaultList();
  }

  function renderVaultTags() {
    var el = $("#vaultTags"); if (!el) return;
    var tags = allTags();
    el.innerHTML =
      '<button class="vtag' + (state.vaultTag ? "" : " on") + '" data-tag="">All</button>' +
      tags.map(function (t) { return '<button class="vtag' + (state.vaultTag === t ? " on" : "") + '" data-tag="' + esc(t) + '">' + esc(t) + '</button>'; }).join("");
    Array.prototype.forEach.call(el.querySelectorAll(".vtag"), function (b) {
      b.onclick = function () {
        var t = b.getAttribute("data-tag");
        state.vaultTag = t || null;
        renderVaultTags(); renderVaultList();
      };
    });
  }

  function renderVaultList() {
    var el = $("#vaultList"); if (!el) return;
    var items = filteredCaptures();
    if (!items.length) {
      el.innerHTML = '<div class="vault-empty">' + I.vault +
        '<div class="t">' + (state.captures.length ? "No captures match your search" : "Your vault is empty") + '</div>' +
        '<div class="s">' + (state.captures.length ? "Try a different term or clear the tag filter." :
          "Captures appear here the moment your AXIOM records RF, NFC, or RFID — or simulate one above.") + '</div></div>';
      return;
    }
    el.innerHTML = '<div class="vault-list">' + items.map(captureRow).join("") + '</div>';
    Array.prototype.forEach.call(el.querySelectorAll(".cap-row"), function (row) {
      row.querySelector(".cap-main").onclick = function () { row.classList.toggle("open"); };
      var del = row.querySelector(".cap-del");
      if (del) del.onclick = function (e) {
        e.stopPropagation();
        state.captures = state.captures.filter(function (c) { return c.id !== row.getAttribute("data-id"); });
        saveVault(); renderVaultTags(); renderVaultList();
      };
    });
  }

  function captureRow(c) {
    var m = CAP_META[c.type] || { label: c.type, icon: "doc" };
    var size = c.size_kb >= 1024 ? (c.size_kb / 1024).toFixed(1) + " MB" : (c.size_kb < 1 ? (c.size_kb * 1000).toFixed(0) + " B" : c.size_kb + " KB");
    return '<div class="cap-row" data-id="' + c.id + '">' +
      '<div class="cap-main">' +
        '<div class="cap-ic cap-' + c.type + '">' + I[m.icon] + '</div>' +
        '<div class="cap-meta"><div class="n">' + esc(c.note) + '</div>' +
          '<div class="s"><span class="cap-type">' + m.label + '</span> · ' + size + ' · ' + relTime(c.ts) +
          (c.version > 1 ? ' · v' + c.version : '') + (c.geo ? ' · 📍' : '') + '</div></div>' +
        '<div class="cap-tags">' + (c.tags || []).slice(0, 2).map(function (t) { return '<span class="cap-tag">' + esc(t) + '</span>'; }).join("") + '</div>' +
      '</div>' +
      '<div class="cap-detail">' +
        kv("Type", m.label) + (c.freq ? kv("Frequency", c.freq) : "") + (c.rssi ? kv("RSSI", c.rssi + " dBm") : "") +
        kv("Size", size) + kv("Captured", fmtTime(c.ts)) + kv("Version", "v" + c.version) +
        (c.geo ? kv("Location", c.geo.lat.toFixed(4) + ", " + c.geo.lon.toFixed(4)) : kv("Location", "not geotagged")) +
        kv("Tags", (c.tags || []).join(", ") || "—") +
        '<div class="cap-actions"><button class="btn btn-ghost btn-sm cap-del" style="color:#E0857E;border-color:rgba(224,133,126,.4)">Delete</button></div>' +
      '</div></div>';
  }
  function kv(k, v) { return '<div class="cap-kv"><span class="k">' + k + '</span><span class="v">' + esc(v) + '</span></div>'; }

  function relTime(ts) {
    var s = Math.max(1, Math.round((Date.now() - ts) / 1000));
    if (s < 60) return s + "s ago";
    if (s < 3600) return Math.round(s / 60) + "m ago";
    if (s < 86400) return Math.round(s / 3600) + "h ago";
    return Math.round(s / 86400) + "d ago";
  }

  // ============================================================ FIRMWARE (AX-110)
  function renderFirmware() {
    var dev = state.device, main = $("#main");
    var upToDate = dev.firmware === LATEST_FW;
    main.innerHTML =
      topbar("Firmware", "Secure OTA with A/B partitions and automatic rollback") +
      '<div class="grid"><div class="card span8" id="fwCard">' +
        '<div class="fw-row"><span class="k">Installed version</span><span class="v" id="fwCur">' + dev.firmware + '</span></div>' +
        '<div class="fw-row"><span class="k">Channel</span><span class="v">alpha</span></div>' +
        '<div class="fw-row"><span class="k">Boot slot</span><span class="v">A (rollback armed)</span></div>' +
        '<div id="fwAction" style="margin-top:20px"></div>' +
      '</div>' +
      '<div class="card span4"><div class="card-h"><span class="t">' + I.fw + ' Safety</span></div>' +
        '<p class="muted" style="font-size:13px;line-height:1.6">Updates write to the inactive slot and verify before switching. ' +
        'If the new firmware fails to boot, AXIOM automatically rolls back — a power loss mid-update cannot brick the device.</p></div>' +
        '<div class="card span12"><div class="card-h"><span class="t">' + I.fw + ' Version history</span></div><div id="fwHist"></div></div>' +
      '</div>';
    renderFwHistory();
    var act = $("#fwAction");
    if (upToDate) {
      act.innerHTML = '<div class="status-banner"><span class="ic" style="color:#7FE0B0">' + I.check + '</span>' +
        '<div><div class="t">You\'re up to date</div><div class="s">' + dev.firmware + ' is the latest alpha build.</div></div></div>' +
        '<button class="btn btn-ghost btn-sm" id="recheckFw" style="margin-top:12px">Re-check</button>';
      $("#recheckFw").onclick = checkFw;
    } else {
      act.innerHTML = '<button class="btn btn-primary" id="checkFw">Check for updates</button>';
      $("#checkFw").onclick = checkFw;
    }
  }
  function renderFwHistory() {
    var el = $("#fwHist"); if (!el) return;
    el.innerHTML = state.fwHistory.slice().reverse().map(function (h) {
      return '<div class="fw-row"><span class="v">' + h.version + '</span><span class="k">' + h.note + ' · ' + fmtTime(h.ts) + '</span></div>';
    }).join("");
  }
  function checkFw() {
    var act = $("#fwAction");
    act.innerHTML = '<div class="scanning"><span class="spin"></span> Checking…</div>';
    state.transport.send("checkUpdate").then(function (u) {
      if (u.current === u.available) { renderFirmware(); return; }
      act.innerHTML =
        '<div class="fade-in"><div style="color:#fff;font-weight:600;margin-bottom:6px">Update available · ' + u.available + '</div>' +
        '<div class="muted" style="font-size:13px;margin-bottom:10px">' + u.size_mb + ' MB · ' + u.notes.join(" · ") + '</div>' +
        '<button class="btn btn-primary" id="doFw">Install ' + u.available + '</button></div>';
      $("#doFw").onclick = function () { installFw(u.available); };
    });
  }
  function installFw(version) {
    var act = $("#fwAction");
    act.innerHTML = '<div class="muted" id="fwStage">Downloading to inactive slot…</div><div class="progress"><i id="fwBar"></i></div>';
    var p = 0, stages = [[35, "Verifying signature…"], [70, "Writing slot B…"], [95, "Switching boot slot…"], [100, "Verified · rollback armed"]];
    var iv = setInterval(function () {
      p = Math.min(100, p + 4 + Math.random() * 6);
      $("#fwBar").style.width = p + "%";
      for (var i = 0; i < stages.length; i++) if (p < stages[i][0] || i === stages.length - 1) { $("#fwStage").textContent = stages[i][1]; break; }
      if (p >= 100) {
        clearInterval(iv);
        state.transport.send("applyUpdate", { version: version }).then(function () {
          state.fwHistory.push({ version: version, ts: Date.now(), note: "OTA update" });
          toast("Updated to " + version, "ok");
          renderFirmware();
        });
      }
    }, 220);
  }

  // ============================================================ SETTINGS (AX-101/102/111)
  function renderSettings() {
    var dev = state.device, s = state.settings, main = $("#main");
    main.innerHTML =
      topbar("Settings", "Device, connection, alerts, and data") +
      '<div class="grid">' +
        '<div class="card span6"><div class="card-h"><span class="t">' + I.cube + ' Device</span></div>' +
          '<div class="field"><label>Name</label><input id="setName" value="' + esc(dev.name) + '" /></div>' +
          '<div class="field"><label>Region (radio compliance)</label>' + regionOptions(dev.region) + '</div>' +
          '<div class="fw-row"><span class="k">Device ID</span><span class="v">' + dev.id + '</span></div>' +
          '<div class="fw-row"><span class="k">Firmware</span><span class="v">' + dev.firmware + '</span></div>' +
          '<button class="btn btn-primary btn-sm" id="saveDev" style="margin-top:14px">Save device</button></div>' +

        '<div class="card span6"><div class="card-h"><span class="t">' + I.gauge + ' Connection</span></div>' +
          '<label class="muted" style="font-size:12px;text-transform:uppercase;letter-spacing:.05em">Preferred transport</label>' +
          '<div class="seg" id="seg">' + ["auto", "ble", "wifi", "usb"].map(function (k) {
            return '<button data-tx="' + k + '" class="' + (s.prefTransport === k ? "on" : "") + '">' + txLabel(k) + '</button>';
          }).join("") + '</div>' +
          '<div class="fw-row"><span class="k">Active link</span><span class="v" id="setLink">—</span></div>' +
          '<button class="btn btn-ghost btn-sm" id="dropLink" style="margin-top:8px">Simulate link drop</button></div>' +

        '<div class="card span6"><div class="card-h"><span class="t">' + I.bell + ' Alerts</span></div>' +
          '<div class="set-row"><span>Enable alerts</span><button class="toggle ' + (s.alerts ? "on" : "") + '" id="alToggle"></button></div>' +
          '<div class="field"><label>Low battery below (%)</label><input type="number" id="thBatt" value="' + s.battLow + '" min="1" max="50" /></div>' +
          '<div class="field"><label>SoC hot above (°C)</label><input type="number" id="thSoc" value="' + s.socHot + '" min="50" max="95" /></div>' +
          '<div class="field"><label>Storage full above (%)</label><input type="number" id="thStor" value="' + s.storFull + '" min="50" max="99" /></div>' +
          '<button class="btn btn-primary btn-sm" id="saveAlerts" style="margin-top:14px">Save alerts</button></div>' +

        '<div class="card span6"><div class="card-h"><span class="t">' + I.dl + ' Telemetry data</span></div>' +
          '<p class="muted" style="font-size:13px;margin-bottom:14px"><b id="logCount">' + state.log.length + '</b> samples buffered (last ~10 min). Export for analysis or reporting.</p>' +
          '<div style="display:flex;gap:10px"><button class="btn btn-ghost btn-sm" id="expCsv">' + I.dl + ' CSV</button>' +
          '<button class="btn btn-ghost btn-sm" id="expJson">' + I.dl + ' JSON</button></div>' +
          '<div class="card-h" style="margin:22px 0 12px"><span class="t" style="color:#E0857E">Danger zone</span></div>' +
          '<div style="display:flex;gap:10px"><button class="btn btn-ghost btn-sm" id="disc">Disconnect</button>' +
          '<button class="btn btn-ghost btn-sm" id="forget" style="color:#E0857E;border-color:rgba(224,133,126,.4)">Forget device</button></div></div>' +
      '</div>';

    $("#saveDev").onclick = function () {
      dev.name = $("#setName").value || dev.name; dev.region = $("#region").value;
      if (LS) saveJSON("axiom.device", { id: dev.id, name: dev.name, region: dev.region });
      toast("Device saved", "ok"); renderShell();
    };
    Array.prototype.forEach.call(document.querySelectorAll("#seg button"), function (b) {
      b.onclick = function () {
        var k = b.getAttribute("data-tx");
        s.prefTransport = k; saveSettings();
        Array.prototype.forEach.call(document.querySelectorAll("#seg button"), function (o) { o.classList.toggle("on", o === b); });
        if (k !== "auto") state.transport.upgrade(k); else state.transport.upgrade("ble");
        toast("Transport: " + txLabel(k), "ok");
      };
    });
    $("#dropLink").onclick = simulateLinkDrop;
    $("#alToggle").onclick = function () { s.alerts = !s.alerts; this.classList.toggle("on", s.alerts); saveSettings(); };
    $("#saveAlerts").onclick = function () {
      s.battLow = clampInt($("#thBatt").value, 1, 50, 15);
      s.socHot = clampInt($("#thSoc").value, 50, 95, 85);
      s.storFull = clampInt($("#thStor").value, 50, 99, 90);
      saveSettings(); toast("Alert thresholds saved", "ok");
    };
    $("#expCsv").onclick = exportCsv;
    $("#expJson").onclick = exportJson;
    $("#disc").onclick = function () { disconnect(false); };
    $("#forget").onclick = function () { disconnect(true); };
  }
  function txLabel(k) { return { auto: "Auto", ble: "Bluetooth", wifi: "Wi-Fi 6E", usb: "USB-C" }[k] || k; }
  function saveSettings() { if (LS) saveJSON("axiom.settings", state.settings); }
  function clampInt(v, lo, hi, d) { v = parseInt(v, 10); if (isNaN(v)) return d; return Math.max(lo, Math.min(hi, v)); }

  function simulateLinkDrop() {
    toast("Link dropped — reconnecting…", "warn");
    var pills = $("#topPills");
    if (pills) pills.innerHTML = '<span class="pill" style="color:#E0B25A"><span class="d"></span>Reconnecting…</span>';
    state._linkDown = true;
    setTimeout(function () {
      state._linkDown = false;
      toast("Reconnected over " + state.transport.profile.label, "ok");
    }, 2200);
  }

  function exportCsv() {
    if (!state.log.length) return toast("No samples yet", "warn");
    var cols = Object.keys(state.log[0]);
    var rows = [cols.join(",")].concat(state.log.map(function (r) {
      return cols.map(function (c) { return r[c]; }).join(",");
    }));
    download("axiom-telemetry-" + state.device.id + ".csv", rows.join("\n"), "text/csv");
    toast("Exported " + state.log.length + " samples (CSV)", "ok");
  }
  function exportJson() {
    if (!state.log.length) return toast("No samples yet", "warn");
    download("axiom-telemetry-" + state.device.id + ".json", JSON.stringify(state.log, null, 2), "application/json");
    toast("Exported " + state.log.length + " samples (JSON)", "ok");
  }
  function download(name, text, mime) {
    var blob = new Blob([text], { type: mime }), url = URL.createObjectURL(blob);
    var a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
  }

  // ============================================================ shared bits
  function topbar(title, sub) {
    return '<div class="topbar"><div><h2>' + title + '</h2><div class="sub">' + sub + '</div></div>' +
      '<div class="top-pills" id="topPills"></div></div>';
  }
  function updateTopLink(f) {
    if (state._linkDown) return;
    var el = $("#topPills"); if (!el) return;
    var k = f.link.transport;
    el.innerHTML =
      '<span class="pill link-' + k + '"><span class="d"></span>' + f.link.label + ' · ' + f.link.latency_ms + ' ms</span>' +
      '<span class="pill">' + I.bolt + ' ' + Math.round(f.power.battery_pct) + '%' + (f.power.charging ? " ⚡" : "") + '</span>';
    var sl = $("#setLink"); if (sl) sl.textContent = f.link.label + " · " + f.link.latency_ms + " ms · " + f.link.quality_pct + "%";
    var lc = $("#logCount"); if (lc) lc.textContent = state.log.length;
  }
  function card(span, icon, title, body, id) {
    return '<div class="card ' + span + '" id="' + id + '"><div class="card-h"><span class="t">' + icon + ' ' + title + '</span></div>' + body + '</div>';
  }
  function spark(id, data, color, lo, hi) {
    var cv = $("#" + id); if (!cv || !data.length) return;
    var w = cv.clientWidth || 280, h = 46; cv.width = w; cv.height = h;
    var x = cv.getContext("2d"); x.clearRect(0, 0, w, h);
    var n = data.length, dx = w / Math.max(1, 59);
    function y(v) { return h - 4 - ((v - lo) / (hi - lo)) * (h - 8); }
    var grad = x.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + "55"); grad.addColorStop(1, color + "00");
    x.beginPath(); x.moveTo(0, h);
    for (var i = 0; i < n; i++) x.lineTo(i * dx, y(data[i]));
    x.lineTo((n - 1) * dx, h); x.closePath(); x.fillStyle = grad; x.fill();
    x.beginPath();
    for (var j = 0; j < n; j++) { var px = j * dx, py = y(data[j]); j ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.strokeStyle = color; x.lineWidth = 1.8; x.lineJoin = "round"; x.stroke();
  }
  function roundRect(x, rx, ry, rw, rh, r, fill) {
    x.beginPath(); x.moveTo(rx + r, ry);
    x.arcTo(rx + rw, ry, rx + rw, ry + rh, r); x.arcTo(rx + rw, ry + rh, rx, ry + rh, r);
    x.arcTo(rx, ry + rh, rx, ry, r); x.arcTo(rx, ry, rx + rw, ry, r); x.closePath();
    x.fillStyle = fill; x.fill();
  }
  var toastBox = null;
  function toast(msg, kind) {
    if (!toastBox) { toastBox = document.createElement("div"); toastBox.className = "toast-box"; document.body.appendChild(toastBox); }
    var t = document.createElement("div");
    t.className = "toast " + (kind || "");
    t.innerHTML = (kind === "ok" ? I.check : I.bell) + "<span>" + msg + "</span>";
    toastBox.appendChild(t);
    setTimeout(function () { t.classList.add("out"); setTimeout(function () { t.remove(); }, 300); }, 2800);
  }
  function fmtTime(ts) { var d = new Date(ts); return d.toLocaleString(); }
  function set(id, v, html) { var el = $("#" + id); if (el) { if (html) el.innerHTML = v; else el.textContent = v; } }
  function chip(id, text, cls) { var el = $("#" + id); if (el) { el.textContent = text; el.className = "chip" + (cls ? " " + cls : ""); } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // ---- animation cadence for activity bars + device screen ----
  setInterval(function () {
    if (state.connected && state.view === "health" && state.frame)
      ["subghz", "nfc", "rfid", "wifi", "bt"].forEach(function (k) { renderActivity("act-" + k, state.frame.radios[k]); });
    if (state.connected && state.view === "cast" && state.casting) drawDeviceScreen();
  }, 120);

  boot();
})(typeof window !== "undefined" ? window : this);
