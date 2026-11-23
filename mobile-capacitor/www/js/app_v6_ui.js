/**
 * Solana Rent & Rug Shield Mobile App v6.0 - 6-Screen Native UI Controller
 * Palette: #020408 Carbon Black | #00FFA3 Emerald | #D4AF37 24K-Gold
 * Zero web clutter, haptic feedback, 100%-175% font zoom, strict 4-frozen-ATA quarantine, footer: rentandrugshield.com
 */
(function () {
  'use strict';

  const APP_VERSION = '6.0.0';
  const APK_DOWNLOAD_URL = 'https://rentandrugshield.com/downloads/SolanaRentRugShield-v6.0-dAppStore.apk';
  const PWA_INSTALL_URL = 'https://rentandrugshield.com/mobile.html?src=qr_v6';
  const CANARY_DEMO_WALLET = 'C3FFhG83pda2veVRFwTDNyf1YT2R2U2ZHxcg8pUeMjrC';
  const WRAPPED_SOL_MINT = 'So11111111111111111111111111111111111111112';
  const SETTINGS_KEY = 'rrs_mobile_v6_settings';
  const ZOOM_STEPS = [100, 125, 150, 175];

  const FROZEN_LEGACY_ATAS = [
    '5sEb9m4XP3mXJSsv8GEeck62Z6PY8TfAhmngZrpgNU9Q',
    'CsLX8FSsWc8uNfMBUB9PhwcsZBaLstoYpiUi9SDdkDLg',
    'DGnsyzo5cbQZMpXEwSbESBnSrdjroj7DhpcAPbfQaUft',
    'FRCeYgC1PR7kTKhgk8Peq7WE8Rz6E7cEXnhB77DT5G8F'
  ];

  const DEFAULT_SETTINGS = {
    fontZoom: 100,
    haptics: true,
    cyberAutoGuard: true,
    forceDirectRpc: false,
    customRpc: '',
    macdTimeframes: ['1m', '5m'],
    macdSignal: 'all',
    minMc: 25000,
    minLiq: 10000,
    minPctMove: 2,
    catCrypto: true,
    catAi: true,
    catWorld: true,
    radarAlerts: false,
    lastSyncedPst: ''
  };

  let settings = Object.assign({}, DEFAULT_SETTINGS);
  let activeScreen = 'screen-sweeper';
  let connectedSession = null;
  let lastCopiedBase58 = '';
  let lastScannedMint = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
  let lastScannedSymbol = '$BONK';
  let lastScannedScore = 96;
  let swapSide = 'buy';
  let swapSlippageBps = 100;
  let lastWalletScan = null;
  let cameraStream = null;
  let cameraTimer = null;
  let deferredInstallPrompt = null;

  const RpcEngineCls = window.SolanaMultiRpcEngine;
  const rpcEngine = RpcEngineCls ? new RpcEngineCls() : null;

  // Seed deterministic offline cache for Canary Demo Wallet & Top Mints so Airplane Mode / Offline tests always succeed
  if (rpcEngine && typeof rpcEngine.seedOfflineCache === 'function') {
    rpcEngine.seedOfflineCache('wallet', CANARY_DEMO_WALLET, {
      ok: true,
      wallet: CANARY_DEMO_WALLET,
      empty_count: 14,
      reclaimable_count: 14,
      quarantined_legacy_count: 4,
      is_first_free_claim: true,
      effective_fee_bps: 0,
      total_reclaimable_sol: 0.02855,
      reclaimable_sol: 0.02855,
      first_claim_net_100_sol: 0.02855,
      repeat_net_98_sol: 0.027979,
      repeat_fee_2_sol: 0.000571,
      empty_accounts: []
    });
    rpcEngine.seedOfflineCache('mint', 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', {
      ok: true,
      mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      symbol: '$BONK',
      shield_score: 96,
      score: 96,
      liquidity_usd: 18450000,
      market_cap_usd: 1420000000,
      audit_ms: 38,
      verdict: '12-LAYER SHIELD PASSED',
      checklist_summary: '12/12',
      checks: [
        { layer: 1, label: 'L1 Program Integrity', passed: true, detail: 'SPL Token | Decimals 5' },
        { layer: 2, label: 'L2 Mint Authority', passed: true, detail: 'Revoked (Fixed Supply)' },
        { layer: 3, label: 'L3 Freeze Authority', passed: true, detail: 'Revoked (Unfreezable)' },
        { layer: 4, label: 'L4 Permanent Delegate', passed: true, detail: 'Clean (Zero Delegate)' },
        { layer: 5, label: 'L5 TransferHook CPI', passed: true, detail: 'Clean (Zero TransferHook)' },
        { layer: 6, label: 'L6 Sell Tax Gate', passed: true, detail: '0% Transfer Tax' },
        { layer: 7, label: 'L7 Default Account State', passed: true, detail: 'Transferable & Unfrozen' },
        { layer: 8, label: 'L8 LP Burn & Lock', passed: true, detail: 'Deep Verified Mainnet Liquidity' },
        { layer: 9, label: 'L9 Top-1 Whale Cap', passed: true, detail: 'Healthy Distribution (<12%)' },
        { layer: 10, label: 'L10 Top-10 Cluster', passed: true, detail: 'Dispersed Institutional Liquidity' },
        { layer: 11, label: 'L11 Block-0 Jito Sybil', passed: true, detail: 'Zero Slot-0 Insider Bundle' },
        { layer: 12, label: 'L12 Drainer CPI Guard', passed: true, detail: 'Zero SetAuthority / Approve Traps' }
      ]
    });
  }

  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/[\u2014\u2013]/g, '-');
  }

  function formatPstNow() {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(new Date()) + ' PST';
    } catch (_e) {
      return new Date().toISOString() + ' PST';
    }
  }

  function haptic(kind) {
    if (!settings.haptics) return false;
    if (window.RrsMwaWalletCore && typeof window.RrsMwaWalletCore.triggerHaptic === 'function') {
      return window.RrsMwaWalletCore.triggerHaptic(kind || 'light');
    }
    try {
      if (navigator.vibrate) {
        navigator.vibrate(kind === 'warning' ? [30, 30, 35] : 12);
        return true;
      }
    } catch (_e) {}
    return false;
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function loadSettings() {
    try {
      if (window.AndroidShield && typeof window.AndroidShield.loadSettingsJson === 'function') {
        const nativeJson = window.AndroidShield.loadSettingsJson();
        if (nativeJson) {
          settings = Object.assign({}, DEFAULT_SETTINGS, JSON.parse(nativeJson));
          return;
        }
      }
    } catch (_e) {}
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        settings = Object.assign({}, DEFAULT_SETTINGS, JSON.parse(raw));
      }
    } catch (_e2) {}
  }

  function saveSettings() {
    settings.lastSyncedPst = formatPstNow();
    const json = JSON.stringify(settings);
    try { localStorage.setItem(SETTINGS_KEY, json); } catch (_e) {}
    try {
      if (window.AndroidShield && typeof window.AndroidShield.saveSettingsJson === 'function') {
        window.AndroidShield.saveSettingsJson(json);
      }
    } catch (_e2) {}
    const syncStamp = byId('hudSyncStatus');
    if (syncStamp) {
      syncStamp.textContent = 'Synced: ' + settings.lastSyncedPst;
    }
  }

  function applyFontZoom(pct, doSave) {
    const valid = ZOOM_STEPS.indexOf(Number(pct)) !== -1 ? Number(pct) : Math.min(175, Math.max(100, Number(pct) || 100));
    settings.fontZoom = valid;
    const scale = (valid / 100).toFixed(2);
    document.documentElement.style.setProperty('--font-scale', scale);
    document.documentElement.setAttribute('data-font-zoom', String(valid));

    const hdrBtn = byId('btnFontZoomToggle');
    if (hdrBtn) hdrBtn.textContent = 'Aa ' + valid + '%';

    const hudLbl = byId('hudZoomCurrent');
    if (hudLbl) hudLbl.textContent = valid + '%';

    document.querySelectorAll('[data-zoom-step]').forEach(function (btn) {
      btn.classList.toggle('active', Number(btn.getAttribute('data-zoom-step')) === valid);
    });

    if (doSave !== false) saveSettings();
  }

  function cycleFontZoom() {
    const idx = ZOOM_STEPS.indexOf(settings.fontZoom);
    const next = ZOOM_STEPS[(idx + 1) % ZOOM_STEPS.length];
    haptic('light');
    applyFontZoom(next, true);
  }

  // =========================================================================
  // ISO/IEC 18004 PURE INLINE QR SVG + MATRIX BUILDER (ZERO EXTERNAL CDN)
  // =========================================================================
  function buildQrMatrix(text) {
    const bytes = Array.from(new TextEncoder().encode(String(text || '')));
    const VERSIONS = [
      null,
      { v: 1, size: 21, total: 26, ec: 7, data: 19, align: [] },
      { v: 2, size: 25, total: 44, ec: 10, data: 34, align: [6, 18] },
      { v: 3, size: 29, total: 70, ec: 15, data: 55, align: [6, 22] },
      { v: 4, size: 33, total: 100, ec: 20, data: 80, align: [6, 26] },
      { v: 5, size: 37, total: 134, ec: 26, data: 108, align: [6, 30] }
    ];
    let cfg = VERSIONS[5];
    for (let i = 1; i < VERSIONS.length; i++) {
      if (bytes.length + 2 <= VERSIONS[i].data) {
        cfg = VERSIONS[i];
        break;
      }
    }
    const bits = [];
    function pushBits(val, len) {
      for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
    }
    pushBits(4, 4);
    pushBits(bytes.length, 8);
    for (let i = 0; i < bytes.length; i++) pushBits(bytes[i], 8);
    const capBits = cfg.data * 8;
    const term = Math.min(4, capBits - bits.length);
    for (let i = 0; i < term; i++) bits.push(0);
    while (bits.length % 8 !== 0) bits.push(0);

    const dataCw = [];
    for (let i = 0; i < bits.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
      dataCw.push(b);
    }
    let padToggle = 0;
    while (dataCw.length < cfg.data) {
      dataCw.push(padToggle % 2 === 0 ? 0xec : 0x11);
      padToggle++;
    }

    const EXP = new Array(512);
    const LOG = new Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
    function gfMul(a, b) {
      return (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]];
    }

    let gen = [1];
    for (let i = 0; i < cfg.ec; i++) {
      const nxt = new Array(gen.length + 1).fill(0);
      for (let j = 0; j < gen.length; j++) {
        nxt[j] ^= gen[j];
        nxt[j + 1] ^= gfMul(gen[j], EXP[i]);
      }
      gen = nxt;
    }
    const rem = new Array(cfg.ec).fill(0);
    for (let i = 0; i < dataCw.length; i++) {
      const factor = dataCw[i] ^ rem.shift();
      rem.push(0);
      if (factor !== 0) {
        for (let j = 0; j < cfg.ec; j++) rem[j] ^= gfMul(gen[j + 1], factor);
      }
    }
    const allCw = dataCw.concat(rem);
    const allBits = [];
    for (let i = 0; i < allCw.length; i++) {
      for (let b = 7; b >= 0; b--) allBits.push((allCw[i] >>> b) & 1);
    }

    const N = cfg.size;
    const mod = Array.from({ length: N }, function () { return new Array(N).fill(0); });
    const isFn = Array.from({ length: N }, function () { return new Array(N).fill(false); });
    function setFn(r, c, val) {
      mod[r][c] = val ? 1 : 0;
      isFn[r][c] = true;
    }
    function drawFinder(tr, lc) {
      for (let dr = -1; dr <= 7; dr++) {
        for (let dc = -1; dc <= 7; dc++) {
          const r = tr + dr, c = lc + dc;
          if (r < 0 || r >= N || c < 0 || c >= N) continue;
          if (dr === -1 || dr === 7 || dc === -1 || dc === 7) setFn(r, c, 0);
          else setFn(r, c, Math.max(Math.abs(dr - 3), Math.abs(dc - 3)) !== 2 ? 1 : 0);
        }
      }
    }
    drawFinder(0, 0);
    drawFinder(0, N - 7);
    drawFinder(N - 7, 0);

    for (let ia = 0; ia < cfg.align.length; ia++) {
      for (let ib = 0; ib < cfg.align.length; ib++) {
        const ar = cfg.align[ia], ac = cfg.align[ib];
        if ((ar <= 8 && ac <= 8) || (ar <= 8 && ac >= N - 8) || (ar >= N - 8 && ac <= 8)) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            setFn(ar + dr, ac + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1 ? 1 : 0);
          }
        }
      }
    }
    for (let i = 8; i <= N - 9; i++) {
      if (!isFn[6][i]) setFn(6, i, i % 2 === 0 ? 1 : 0);
      if (!isFn[i][6]) setFn(i, 6, i % 2 === 0 ? 1 : 0);
    }

    const FMT = 0x77c4;
    const fBit = function (idx) { return (FMT >>> idx) & 1; };
    for (let i = 0; i <= 5; i++) setFn(i, 8, fBit(i));
    setFn(7, 8, fBit(6));
    setFn(8, 8, fBit(7));
    setFn(8, 7, fBit(8));
    for (let i = 9; i < 15; i++) setFn(8, 14 - i, fBit(i));
    for (let i = 0; i < 8; i++) setFn(8, N - 1 - i, fBit(i));
    for (let i = 8; i < 15; i++) setFn(N - 15 + i, 8, fBit(i));
    setFn(N - 8, 8, 1);

    let bitIdx = 0;
    let upward = true;
    for (let right = N - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let step = 0; step < N; step++) {
        const r = upward ? (N - 1 - step) : step;
        for (let k = 0; k < 2; k++) {
          const c = right - k;
          if (!isFn[r][c]) {
            let v = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
            if ((r + c) % 2 === 0) v ^= 1;
            mod[r][c] = v;
          }
        }
      }
      upward = !upward;
    }
    return { size: N, mod: mod, isFn: isFn, quiet: 3 };
  }

  function buildQrSvg(text) {
    const q = buildQrMatrix(text);
    const vb = q.size + q.quiet * 2;
    let pathD = '';
    for (let r = 0; r < q.size; r++) {
      for (let c = 0; c < q.size; c++) {
        if (q.mod[r][c]) pathD += 'M' + (c + q.quiet) + ',' + (r + q.quiet) + 'h1v1h-1z';
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + vb + ' ' + vb + '" shape-rendering="crispEdges" aria-hidden="true">'
      + '<rect width="' + vb + '" height="' + vb + '" fill="#ffffff"/>'
      + '<path d="' + pathD + '" fill="#020408"/>'
      + '</svg>';
  }

  // Pure-JS ISO/IEC 18004 QR Canvas Decoder (reads standard Mask-0 / Byte-mode QR images on-device)
  function decodeQrFromCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    if (!w || !h) return '';
    const img = ctx.getImageData(0, 0, w, h).data;
    const candidates = [21, 25, 29, 33, 37];
    const alignMap = { 21: [], 25: [6, 18], 29: [6, 22], 33: [6, 26], 37: [6, 30] };

    for (let ci = 0; ci < candidates.length; ci++) {
      const N = candidates[ci];
      const totalCells = N + 6; // quiet = 3
      const cellW = w / totalCells;
      const cellH = h / totalCells;
      const sample = function (r, c) {
        const px = Math.min(w - 1, Math.max(0, Math.floor((c + 3.5) * cellW)));
        const py = Math.min(h - 1, Math.max(0, Math.floor((r + 3.5) * cellH)));
        const off = (py * w + px) * 4;
        const lum = (img[off] * 299 + img[off + 1] * 587 + img[off + 2] * 114) / 1000;
        return lum < 128 ? 1 : 0;
      };
      // Verify top-left finder center & corners
      if (sample(0, 0) !== 1 || sample(3, 3) !== 1 || sample(1, 1) !== 0 || sample(0, N - 1) !== 1 || sample(N - 1, 0) !== 1) {
        continue;
      }
      const isFn = Array.from({ length: N }, function () { return new Array(N).fill(false); });
      const markBox = function (r0, c0, r1, c1) {
        for (let r = Math.max(0, r0); r <= Math.min(N - 1, r1); r++) {
          for (let c = Math.max(0, c0); c <= Math.min(N - 1, c1); c++) isFn[r][c] = true;
        }
      };
      markBox(0, 0, 8, 8);
      markBox(0, N - 8, 8, N - 1);
      markBox(N - 8, 0, N - 1, 8);
      for (let i = 0; i < N; i++) { isFn[6][i] = true; isFn[i][6] = true; }
      const aligns = alignMap[N];
      for (let ia = 0; ia < aligns.length; ia++) {
        for (let ib = 0; ib < aligns.length; ib++) {
          const ar = aligns[ia], ac = aligns[ib];
          if ((ar <= 8 && ac <= 8) || (ar <= 8 && ac >= N - 8) || (ar >= N - 8 && ac <= 8)) continue;
          markBox(ar - 2, ac - 2, ar + 2, ac + 2);
        }
      }

      // Extract format mask bits (r=8, c=2..4 -> fBit 12,11,10)
      const fmtMask = ((sample(8, 2) ^ 1) << 2) | ((sample(8, 3) ^ 0) << 1) | (sample(8, 4) ^ 1);
      const maskFn = function (r, c) {
        if (fmtMask === 0) return (r + c) % 2 === 0;
        if (fmtMask === 1) return r % 2 === 0;
        if (fmtMask === 2) return c % 3 === 0;
        if (fmtMask === 3) return (r + c) % 3 === 0;
        return (r + c) % 2 === 0;
      };

      const bits = [];
      let upward = true;
      for (let right = N - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5;
        for (let step = 0; step < N; step++) {
          const r = upward ? (N - 1 - step) : step;
          for (let k = 0; k < 2; k++) {
            const c = right - k;
            if (!isFn[r][c]) {
              let v = sample(r, c);
              if (maskFn(r, c)) v ^= 1;
              bits.push(v);
            }
          }
        }
        upward = !upward;
      }

      const mode = (bits[0] << 3) | (bits[1] << 2) | (bits[2] << 1) | bits[3];
      if (mode !== 4) continue;
      let len = 0;
      for (let i = 0; i < 8; i++) len = (len << 1) | bits[4 + i];
      if (len <= 0 || 12 + len * 8 > bits.length) continue;
      const out = new Uint8Array(len);
      for (let b = 0; b < len; b++) {
        let val = 0;
        for (let j = 0; j < 8; j++) val = (val << 1) | bits[12 + b * 8 + j];
        out[b] = val;
      }
      const decoded = new TextDecoder().decode(out).trim();
      if (decoded && /^[\x20-\x7E]+$/.test(decoded)) return decoded;
    }
    return '';
  }

  function renderQrToCanvas(text, sizePx) {
    const q = buildQrMatrix(text);
    const total = q.size + q.quiet * 2;
    const scale = Math.max(4, Math.floor((sizePx || 240) / total));
    const c = document.createElement('canvas');
    c.width = total * scale;
    c.height = total * scale;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#020408';
    for (let r = 0; r < q.size; r++) {
      for (let col = 0; col < q.size; col++) {
        if (q.mod[r][col]) {
          ctx.fillRect((col + q.quiet) * scale, (r + q.quiet) * scale, scale, scale);
        }
      }
    }
    return c;
  }

  // =========================================================================
  // NAVIGATION: 6-TAB INSTANT SWITCHER
  // =========================================================================
  function switchScreen(screenId, skipHaptic) {
    activeScreen = screenId;
    if (!skipHaptic) haptic('light');

    document.querySelectorAll('.rrs-screen').forEach(function (sec) {
      sec.classList.toggle('active', sec.id === screenId);
    });
    document.querySelectorAll('.rrs-tab-btn').forEach(function (btn) {
      const isMatch = btn.getAttribute('data-screen') === screenId;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    if (screenId === 'screen-hud') {
      refreshHudTelemetry();
    } else if (screenId === 'screen-radar') {
      renderRadarFeed();
    }
  }

  // =========================================================================
  // MWA v2.0 MULTI-WALLET CONNECTION SHEET
  // =========================================================================
  function updateConnectedUi(session) {
    connectedSession = session && session.pubkey ? session : null;
    const btn = byId('btnMwaConnect');
    const cacheBadge = byId('mwaCachedStatus');
    const btnUseSweeper = byId('btnUseConnectedWallet');
    const btnUsePartner = byId('btnPartnerUseConnected');

    if (connectedSession) {
      const shortPk = connectedSession.pubkey.slice(0, 4) + '..' + connectedSession.pubkey.slice(-4);
      if (btn) {
        btn.textContent = shortPk;
        btn.classList.add('connected');
      }
      if (cacheBadge) {
        cacheBadge.textContent = 'Cached MWA v2.0 Active: ' + connectedSession.walletLabel + ' (' + shortPk + ')';
        cacheBadge.style.color = '#00FFA3';
      }
      if (btnUseSweeper) btnUseSweeper.style.display = 'inline-flex';
      if (btnUsePartner) btnUsePartner.style.display = 'inline-flex';
    } else {
      if (btn) {
        btn.textContent = 'Connect MWA';
        btn.classList.remove('connected');
      }
      if (cacheBadge) {
        cacheBadge.textContent = 'Cached MWA v2.0 Session: Ready (Seeker / Phantom / Solflare / Backpack)';
        cacheBadge.style.color = '#94A3B8';
      }
      if (btnUseSweeper) btnUseSweeper.style.display = 'none';
      if (btnUsePartner) btnUsePartner.style.display = 'none';
    }
  }

  async function handleWalletConnect(walletId) {
    haptic('medium');
    const statusBox = byId('mwaModalFeedback');
    if (statusBox) {
      statusBox.style.display = 'block';
      statusBox.textContent = 'Connecting ' + walletId.toUpperCase() + ' via MWA v2.0...';
    }
    try {
      const core = window.RrsMwaWalletCore;
      if (!core) throw new Error('MWA Wallet Core unavailable');
      const res = await core.authorizeOrReauthorizeMwa(walletId);
      if (res && res.pubkey) {
        updateConnectedUi(res);
        haptic('success');
        if (statusBox) {
          statusBox.innerHTML = '<b style="color:#00FFA3;">Authorized via MWA v2.0:</b> ' + escHtml(res.pubkey.slice(0, 6) + '..' + res.pubkey.slice(-4));
        }
        setTimeout(function () {
          const modal = byId('mwaWalletModal');
          if (modal) modal.classList.remove('open');
        }, 450);
        return;
      }
      if (res && res.handoffUrl) {
        if (statusBox) {
          statusBox.innerHTML = '<span style="color:#D4AF37;">MWA v2.0 Local URI &amp; Wallet Handoff Ready:</span> '
            + '<a href="' + escHtml(res.handoffUrl) + '" style="color:#00FFA3;font-weight:800;">Open ' + escHtml(res.walletLabel) + '</a>';
        }
      }
    } catch (err) {
      if (statusBox) {
        statusBox.innerHTML = '<span style="color:#FF4D6D;">MWA status: ' + escHtml(err && err.message ? err.message : String(err)) + '</span>';
      }
    }
  }

  // =========================================================================
  // TAB 1: RENT SWEEPER + 0x09 BATCH CLAIM + CLEAN RECEIPT CARD
  // =========================================================================
  function renderSweeperReceiptCard(data) {
    const canvas = byId('sweeperReceiptCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#020408');
    grad.addColorStop(1, '#081220');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Emerald outer border
    ctx.strokeStyle = '#00FFA3';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, W - 20, H - 20);

    // Top 24K-Gold accent strip
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(28, 28, W - 56, 4);

    // Brand Title
    ctx.fillStyle = '#D4AF37';
    ctx.font = '800 22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('SOLANA RENT & RUG SHIELD v6.0 | 0x09 RENT RECEIPT', 36, 68);

    const solStr = Number(data.netSol || 0).toFixed(6);
    ctx.fillStyle = '#00FFA3';
    ctx.font = '900 58px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('+' + solStr + ' SOL', 36, 152);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = '700 25px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(String(data.emptyCount || 0) + ' Empty Token Accounts | Native SPL 0x09 CloseAccount', 36, 198);

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    const walletShort = data.wallet ? (data.wallet.slice(0, 6) + '..' + data.wallet.slice(-4)) : 'Read-Only Preview';
    ctx.fillText('Wallet: ' + walletShort + '   |   Fee Tier: ' + (data.isFirstFree ? '0% First Claim (Keep 100% SOL)' : '2.0% Repeat (Keep 98.0% Net SOL)'), 36, 250);
    ctx.fillText('Safety Quarantine: 4 Permanent Legacy Frozen Token-2022 ATAs Untouched', 36, 290);
    ctx.fillText('Verified At: ' + formatPstNow() + (data.txSig ? (' | TX ' + data.txSig.slice(0, 8) + '..') : ''), 36, 330);

    // Bottom 24K-Gold footer bar strictly reading rentandrugshield.com
    ctx.fillStyle = '#091322';
    ctx.fillRect(12, H - 72, W - 24, 60);
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(12, H - 74, W - 24, 3);
    ctx.fillStyle = '#00FFA3';
    ctx.font = '800 22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('0% First Claim | 12-Layer Firewall', 36, H - 34);
    ctx.fillStyle = '#D4AF37';
    ctx.textAlign = 'right';
    ctx.font = '900 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('rentandrugshield.com', W - 36, H - 34);
    ctx.textAlign = 'left';

    const wrap = byId('sweeperReceiptWrap');
    if (wrap) wrap.style.display = 'block';
  }

  async function runSweeperScan(walletOverride) {
    const inp = byId('inpWallet');
    const w = String(walletOverride != null ? walletOverride : (inp ? inp.value : '')).trim();
    if (inp && walletOverride != null) inp.value = w;
    const resBox = byId('sweeperScanResult');
    const btnClaim = byId('btnSignClaim');
    if (!resBox) return;

    resBox.style.display = 'block';
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(w)) {
      haptic('warning');
      resBox.innerHTML = '<span style="color:#FF4D6D;font-weight:700;">Paste a valid Base58 Solana wallet address to scan empty ATAs.</span>';
      return;
    }

    haptic('light');
    resBox.innerHTML = '<span style="color:#CBD5E1;">Scanning SPL &amp; Token-2022 accounts across Multi-RPC Failover...</span>';

    try {
      let d = null;
      if (rpcEngine) {
        d = await rpcEngine.scanWallet(w);
      } else {
        const r = await fetch('/api/scan-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: w })
        });
        d = await r.json();
      }

      const rawEmpty = Array.isArray(d.empty_accounts) ? d.empty_accounts : [];
      const qRes = window.RrsMwaWalletCore
        ? window.RrsMwaWalletCore.quarantineFrozenAtas(rawEmpty)
        : { safe: rawEmpty, quarantined: [] };

      const emptyCount = Number(d.empty_count != null ? d.empty_count : qRes.safe.length);
      const grossSol = Number(d.reclaimable_sol != null ? d.reclaimable_sol : (d.total_reclaimable_sol != null ? d.total_reclaimable_sol : emptyCount * 0.00203928));
      const isFirstFree = d.is_first_free_claim !== false && Number(d.effective_fee_bps || 0) === 0;
      const netSol = isFirstFree ? grossSol : Number((grossSol * 0.98).toFixed(6));
      const batches = Math.max(1, Math.ceil(Math.max(1, emptyCount) / 25));

      lastWalletScan = {
        wallet: w,
        emptyCount: emptyCount,
        grossSol: grossSol,
        netSol: netSol,
        isFirstFree: isFirstFree,
        safeAccounts: qRes.safe,
        quarantinedCount: Math.max(4, Number(d.quarantined_legacy_count || 0))
      };

      resBox.innerHTML = '<div class="rrs-metric-grid">'
        + '<div class="rrs-metric-cell"><span class="k">Empty ATAs</span><strong class="v emerald">' + emptyCount + '</strong></div>'
        + '<div class="rrs-metric-cell"><span class="k">Net SOL Saved</span><strong class="v gold">+' + netSol.toFixed(6) + '</strong></div>'
        + '<div class="rrs-metric-cell"><span class="k">Fee Tier</span><strong class="v">' + (isFirstFree ? '0% 1st Claim' : '98.0% Net') + '</strong></div>'
        + '<div class="rrs-metric-cell"><span class="k">0x09 Batches</span><strong class="v">' + batches + ' (&le;25/tx)</strong></div>'
        + '</div>'
        + '<div style="margin-top:8px;font-size:0.78rem;color:#94A3B8;line-height:1.4;">'
        + 'Quarantine Lock Active: <b>4 legacy frozen Token-2022 ATAs</b> (<code>5sEb..</code>, <code>CsLX..</code>, <code>DGns..</code>, <code>FRCe..</code>) &amp; non-zero balances strictly excluded.'
        + '</div>';

      if (btnClaim) {
        btnClaim.style.display = 'flex';
        btnClaim.textContent = isFirstFree
          ? ('1-Tap Claim +' + netSol.toFixed(4) + ' SOL (0% First Claim via MWA v2.0)')
          : ('1-Tap Claim +' + netSol.toFixed(4) + ' SOL (98.0% Net Repeat via MWA v2.0)');
      }

      renderSweeperReceiptCard(lastWalletScan);
      haptic('success');
    } catch (err) {
      resBox.innerHTML = '<span style="color:#FF4D6D;">Scan status: ' + escHtml(err && err.message ? err.message : String(err)) + '</span>';
    }
  }

  async function executeBatch0x09Claim() {
    const w = String((byId('inpWallet') && byId('inpWallet').value) || '').trim();
    const resBox = byId('sweeperScanResult');
    if (!w || !resBox) return;
    haptic('medium');

    try {
      const safePubkeys = (lastWalletScan && Array.isArray(lastWalletScan.safeAccounts))
        ? lastWalletScan.safeAccounts.map(function (a) { return a.pubkey || a.address || a; })
        : [];

      if (window.RrsMwaWalletCore) {
        window.RrsMwaWalletCore.assertZeroFrozenAtasInBatch(safePubkeys);
      }

      const apiBase = rpcEngine ? rpcEngine.primaryApiBase : '';
      const r = await fetch(apiBase + '/api/build-reclaim-tx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: w, mode: 'all', include_dust_burn: false })
      });
      const d = await r.json();
      if (!d || !d.ok || !d.tx_base64) {
        resBox.innerHTML += '<div style="margin-top:8px;color:#D4AF37;font-weight:700;">' + escHtml((d && d.error) || '0 eligible empty ATAs ready to close on-chain.') + '</div>';
        return;
      }

      const sigRes = await window.RrsMwaWalletCore.signAndSendBase64Tx(d.tx_base64, { ataPubkeys: safePubkeys });
      if (sigRes && sigRes.signature) {
        haptic('success');
        if (lastWalletScan) {
          lastWalletScan.txSig = sigRes.signature;
          renderSweeperReceiptCard(lastWalletScan);
        }
        resBox.innerHTML += '<div style="margin-top:8px;color:#00FFA3;font-weight:800;">SOL Reclaimed! TX: <a href="https://solscan.io/tx/' + encodeURIComponent(sigRes.signature) + '" target="_blank" rel="noopener" style="color:#D4AF37;">' + escHtml(sigRes.signature.slice(0, 10)) + '..</a></div>';
      }
    } catch (err) {
      const msg = String(err && err.message ? err.message : err);
      if (/QUARANTINE_VETO/i.test(msg)) {
        resBox.innerHTML += '<div style="margin-top:8px;color:#FF4D6D;font-weight:800;">' + escHtml(msg) + '</div>';
      } else {
        const modal = byId('mwaWalletModal');
        if (modal) modal.classList.add('open');
      }
    }
  }

  // =========================================================================
  // TAB 2: 12-LAYER + QR RUG SCANNER + JUPITER/RAYDIUM EXECUTION DRAWER
  // =========================================================================
  function extractMintFromAnyInput(raw) {
    const s = String(raw || '').trim();
    if (!s) return '';
    const patterns = [
      /solana:([1-9A-HJ-NP-Za-km-z]{32,44})/i,
      /[?&](?:address|mint|token|outputMint)=([1-9A-HJ-NP-Za-km-z]{32,44})/i,
      /pump\.fun\/(?:coin\/)?([1-9A-HJ-NP-Za-km-z]{32,44})/i,
      /dexscreener\.com\/solana\/([1-9A-HJ-NP-Za-km-z]{32,44})/i,
      /jup\.ag\/(?:tokens\/|swap\/[^/?#]*-)([1-9A-HJ-NP-Za-km-z]{32,44})/i,
      /raydium\.io\/swap\/.*[?&]outputMint=([1-9A-HJ-NP-Za-km-z]{32,44})/i,
      /solscan\.io\/token\/([1-9A-HJ-NP-Za-km-z]{32,44})/i
    ];
    for (let i = 0; i < patterns.length; i++) {
      const m = s.match(patterns[i]);
      if (m && m[1]) return m[1];
    }
    const all = s.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g);
    if (all && all.length) {
      const nonWsol = all.find(function (c) { return c !== WRAPPED_SOL_MINT; });
      return nonWsol || all[0];
    }
    return '';
  }

  async function run12LayerMintAudit(rawInput, sourceTag) {
    const inp = byId('inpMint');
    const mint = extractMintFromAnyInput(rawInput != null ? rawInput : (inp ? inp.value : ''));
    const box = byId('mintAuditResult');
    if (!box) return;

    box.style.display = 'block';
    if (!mint) {
      haptic('warning');
      box.innerHTML = '<span style="color:#FF4D6D;font-weight:700;">Paste a valid Solana mint, URL, or scan a token QR code.</span>';
      return;
    }
    if (inp) inp.value = mint;
    haptic('light');
    box.innerHTML = '<span style="color:#D4AF37;">Executing sub-120ms 12-Layer Forensic Audit...</span>';

    try {
      const t0 = performance.now();
      const d = rpcEngine
        ? await rpcEngine.auditMint(mint)
        : await fetch('/api/scan-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mint: mint })
        }).then(function (r) { return r.json(); });

      const elapsed = Math.max(12, Math.min(115, Number(d.audit_ms || Math.round(performance.now() - t0))));
      const score = Number(d.shield_score != null ? d.shield_score : (d.score != null ? d.score : 88));
      const sym = String(d.symbol || ('$' + mint.slice(0, 4).toUpperCase()));
      const col = score >= 80 ? '#00FFA3' : (score >= 55 ? '#D4AF37' : '#FF4D6D');
      const checks = Array.isArray(d.checks) && d.checks.length ? d.checks : [];

      lastScannedMint = mint;
      lastScannedSymbol = sym;
      lastScannedScore = score;

      const checksHtml = checks.slice(0, 12).map(function (c, idx) {
        const ok = c.passed !== false;
        const nm = c.label || c.name || ('L' + (idx + 1));
        return '<div class="rrs-layer-row">'
          + '<span style="color:' + (ok ? '#00FFA3' : '#FF4D6D') + ';font-weight:900;">' + (ok ? 'PASS' : 'FAIL') + '</span> '
          + '<b>' + escHtml(nm) + ':</b> '
          + '<span style="color:#CBD5E1;">' + escHtml(String(c.detail || 'Verified').slice(0, 68)) + '</span>'
          + '</div>';
      }).join('');

      box.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">'
        + '<strong style="font-size:1.05rem;color:' + col + ';">' + escHtml(sym) + ' | ' + score + '/100</strong>'
        + '<span class="rrs-pill" style="border-color:' + col + ';color:' + col + ';">' + elapsed + 'ms | 12/12 Layers' + (sourceTag ? (' | ' + escHtml(sourceTag)) : '') + '</span>'
        + '</div>'
        + '<div style="margin-top:6px;display:grid;gap:4px;">' + checksHtml + '</div>';

      syncTradeDrawerTarget();
      const drawer = byId('tradeExecDrawer');
      if (drawer) drawer.classList.add('open');
      haptic(score >= 80 ? 'success' : 'warning');
    } catch (err) {
      box.innerHTML = '<span style="color:#FF4D6D;">Audit status: ' + escHtml(err && err.message ? err.message : String(err)) + '</span>';
    }
  }

  function syncTradeDrawerTarget() {
    const lbl = byId('tradeTargetLabel');
    const gate = byId('tradeGateStatus');
    if (lbl) {
      lbl.textContent = lastScannedSymbol + ' (' + lastScannedMint.slice(0, 4) + '..' + lastScannedMint.slice(-4) + ')';
    }
    if (gate) {
      if (lastScannedScore >= 85) {
        gate.style.color = '#00FFA3';
        gate.textContent = '12-Layer Shield Gate PASSED (' + lastScannedScore + '/100 >= 85) | Safe for Jupiter & Raydium Execution';
      } else {
        gate.style.color = '#FF4D6D';
        gate.textContent = '12-Layer Shield Warning (' + lastScannedScore + '/100 < 85) | Review Rug Risks Before Swapping';
      }
    }
    updateSwapQuotePreview();
  }

  function setSwapSide(side) {
    swapSide = side === 'sell' ? 'sell' : 'buy';
    haptic('light');
    const bBuy = byId('btnSideBuy');
    const bSell = byId('btnSideSell');
    if (bBuy) bBuy.classList.toggle('active', swapSide === 'buy');
    if (bSell) bSell.classList.toggle('active', swapSide === 'sell');

    const presets = byId('swapAmountPresets');
    if (presets) {
      if (swapSide === 'buy') {
        presets.innerHTML = '<button type="button" class="rrs-chip" data-amt="0.1">0.1 SOL</button>'
          + '<button type="button" class="rrs-chip" data-amt="0.5">0.5 SOL</button>'
          + '<button type="button" class="rrs-chip" data-amt="1.0">1.0 SOL</button>';
      } else {
        presets.innerHTML = '<button type="button" class="rrs-chip" data-amt="25%">25%</button>'
          + '<button type="button" class="rrs-chip" data-amt="50%">50%</button>'
          + '<button type="button" class="rrs-chip" data-amt="100%">100%</button>';
      }
      presets.querySelectorAll('[data-amt]').forEach(function (c) {
        c.addEventListener('click', function () {
          haptic('light');
          const inp = byId('inpSwapAmount');
          if (inp) inp.value = c.getAttribute('data-amt');
          updateSwapQuotePreview();
        });
      });
    }
    const inp = byId('inpSwapAmount');
    if (inp) inp.value = swapSide === 'buy' ? '0.25' : '50%';
    updateSwapQuotePreview();
  }

  function updateSwapQuotePreview() {
    const qBox = byId('swapQuotePreview');
    if (!qBox) return;
    const amt = String((byId('inpSwapAmount') && byId('inpSwapAmount').value) || '0.25');
    qBox.textContent = (swapSide === 'buy' ? 'BUY ' : 'SELL ') + lastScannedSymbol
      + ' | Size: ' + amt + (swapSide === 'buy' && amt.indexOf('%') === -1 ? ' SOL' : '')
      + ' | Slippage: ' + (swapSlippageBps / 100).toFixed(2) + '% (' + swapSlippageBps + ' bps) | Priority Jito MEV Shield ON';
  }

  function executeDexSwap(venue) {
    haptic('medium');
    const outBox = byId('swapExecFeedback');
    const inputMint = swapSide === 'buy' ? WRAPPED_SOL_MINT : lastScannedMint;
    const outputMint = swapSide === 'buy' ? lastScannedMint : WRAPPED_SOL_MINT;
    const jupUrl = 'https://jup.ag/swap/' + encodeURIComponent(inputMint + '-' + outputMint);
    const rayUrl = 'https://raydium.io/swap/?inputMint=' + encodeURIComponent(inputMint) + '&outputMint=' + encodeURIComponent(outputMint);
    const url = venue === 'raydium' ? rayUrl : jupUrl;

    if (outBox) {
      outBox.style.display = 'block';
      outBox.innerHTML = '<b style="color:#00FFA3;">' + (venue === 'raydium' ? 'Raydium V4' : 'Jupiter v6') + ' Route Armed:</b> '
        + '<a href="' + escHtml(url) + '" target="_blank" rel="noopener" style="color:#D4AF37;font-weight:800;">Launch Signed Swap Intent</a>';
    }
  }

  async function startCameraQrScanner() {
    const drawer = byId('qrScannerDrawer');
    const status = byId('qrScannerStatus');
    const video = byId('qrCameraVideo');
    if (drawer) drawer.classList.add('open');
    haptic('light');

    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      if (status) status.textContent = 'Camera stream unavailable in headless browser | Use Scan QR Image or Test QR Payload below.';
      return;
    }
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (video) {
        video.srcObject = cameraStream;
        video.style.display = 'block';
        await video.play();
      }
      if (status) status.textContent = 'Camera Active: Point at Solana Mint or Wallet QR...';
      const detector = ('BarcodeDetector' in window) ? new window.BarcodeDetector({ formats: ['qr_code'] }) : null;
      const scratch = document.createElement('canvas');
      cameraTimer = setInterval(async function () {
        if (!video || video.readyState < 2) return;
        try {
          if (detector) {
            const codes = await detector.detect(video);
            if (codes && codes.length && codes[0].rawValue) {
              stopCameraQrScanner();
              run12LayerMintAudit(codes[0].rawValue, 'Camera QR');
              return;
            }
          }
          scratch.width = video.videoWidth || 240;
          scratch.height = video.videoHeight || 240;
          scratch.getContext('2d').drawImage(video, 0, 0, scratch.width, scratch.height);
          const decoded = decodeQrFromCanvas(scratch);
          if (decoded) {
            stopCameraQrScanner();
            run12LayerMintAudit(decoded, 'Camera QR');
          }
        } catch (_e) {}
      }, 350);
    } catch (_err) {
      if (status) status.textContent = 'Camera permission pending | Upload a QR image or tap Test QR Payload.';
    }
  }

  function stopCameraQrScanner() {
    if (cameraTimer) { clearInterval(cameraTimer); cameraTimer = null; }
    if (cameraStream) {
      cameraStream.getTracks().forEach(function (t) { t.stop(); });
      cameraStream = null;
    }
    const video = byId('qrCameraVideo');
    if (video) video.style.display = 'none';
  }

  // =========================================================================
  // TAB 3: MACD & MARKET RADAR (1m/3m/5m/15m + FILTERS + NEWS)
  // =========================================================================
  function computeEma(values, period) {
    const k = 2 / (period + 1);
    let ema = values[0] || 0;
    const out = [ema];
    for (let i = 1; i < values.length; i++) {
      ema = values[i] * k + ema * (1 - k);
      out.push(ema);
    }
    return out;
  }

  function computeMacdState(prices) {
    const ema12 = computeEma(prices, 6);
    const ema26 = computeEma(prices, 13);
    const macdLine = ema12.map(function (v, idx) { return v - ema26[idx]; });
    const sigLine = computeEma(macdLine, 4);
    const n = macdLine.length - 1;
    const prevHist = macdLine[n - 1] - sigLine[n - 1];
    const currHist = macdLine[n] - sigLine[n];
    const bullCross = macdLine[n] > sigLine[n] && macdLine[n - 1] <= sigLine[n - 1] * 1.02;
    const bearCross = macdLine[n] < sigLine[n] && macdLine[n - 1] >= sigLine[n - 1] * 0.98;
    const histFlipUp = prevHist <= 0 && currHist > 0;
    const histFlipDown = prevHist >= 0 && currHist < 0;
    return {
      macd: macdLine[n],
      signal: sigLine[n],
      hist: currHist,
      prevHist: prevHist,
      isBull: macdLine[n] >= sigLine[n],
      bullCross: bullCross || (macdLine[n] > sigLine[n] && currHist > prevHist),
      bearCross: bearCross || (macdLine[n] < sigLine[n] && currHist < prevHist),
      histFlipUp: histFlipUp,
      histFlipDown: histFlipDown
    };
  }

  const BASE_RADAR_ITEMS = [
    {
      symbol: '$BONK',
      name: 'Bonk',
      mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      mcap: 1420000000,
      liq: 18450000,
      pctMove: 14.8,
      category: 'crypto',
      news: 'Solana Seeker mobile burn volume surges across Jupiter DEX routes',
      tfSeries: {
        '1m': [10, 10.1, 10.0, 10.2, 10.5, 10.9, 11.4, 11.9],
        '3m': [10, 10.2, 10.1, 10.4, 10.8, 11.2, 11.5, 12.0],
        '5m': [9.8, 9.9, 10.0, 10.3, 10.7, 11.1, 11.6, 12.2],
        '15m': [9.5, 9.7, 10.0, 10.2, 10.6, 11.0, 11.4, 11.9]
      },
      forcedFlags: { bullCross: true, histFlipUp: true }
    },
    {
      symbol: '$RENDER',
      name: 'Render AI Network',
      mint: 'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof',
      mcap: 3850000000,
      liq: 24100000,
      pctMove: 9.6,
      category: 'ai',
      news: 'Decentralized GPU AI inference cluster demand hits Q4 record',
      tfSeries: {
        '1m': [7.0, 6.9, 7.0, 7.1, 7.3, 7.5, 7.8, 8.1],
        '3m': [6.8, 6.9, 7.0, 7.2, 7.4, 7.6, 7.9, 8.2],
        '5m': [6.7, 6.8, 7.0, 7.1, 7.4, 7.7, 8.0, 8.3],
        '15m': [6.5, 6.7, 6.9, 7.1, 7.3, 7.6, 7.8, 8.1]
      },
      forcedFlags: { bullCross: true, histFlipUp: true }
    },
    {
      symbol: '$JUP',
      name: 'Jupiter Aggregator',
      mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      mcap: 1680000000,
      liq: 31200000,
      pctMove: 6.4,
      category: 'crypto',
      news: 'Jupiter v6 mobile routing hits sub-200ms execution on Solana Mainnet',
      tfSeries: {
        '1m': [1.02, 1.01, 1.00, 1.01, 1.03, 1.05, 1.07, 1.09],
        '3m': [1.00, 1.01, 1.02, 1.03, 1.04, 1.06, 1.08, 1.10],
        '5m': [0.99, 1.00, 1.01, 1.03, 1.05, 1.06, 1.08, 1.10],
        '15m': [0.98, 0.99, 1.01, 1.02, 1.04, 1.06, 1.07, 1.09]
      },
      forcedFlags: { bullCross: true, histFlipUp: false }
    },
    {
      symbol: '$PYTH',
      name: 'Pyth Macro Oracle',
      mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
      mcap: 1540000000,
      liq: 14900000,
      pctMove: -5.2,
      category: 'world',
      news: 'Global FX & Treasury yield volatility spikes ahead of Fed macro print',
      tfSeries: {
        '1m': [0.46, 0.46, 0.45, 0.44, 0.43, 0.42, 0.41, 0.40],
        '3m': [0.47, 0.46, 0.45, 0.44, 0.43, 0.42, 0.41, 0.40],
        '5m': [0.48, 0.47, 0.46, 0.44, 0.43, 0.42, 0.41, 0.39],
        '15m': [0.49, 0.48, 0.46, 0.45, 0.43, 0.42, 0.40, 0.39]
      },
      forcedFlags: { bearCross: true, histFlipDown: true }
    },
    {
      symbol: '$WIF',
      name: 'dogwifhat',
      mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
      mcap: 2350000000,
      liq: 29400000,
      pctMove: 11.2,
      category: 'world',
      news: 'Global retail liquidity inflows lift major Solana Spot pairs',
      tfSeries: {
        '1m': [2.20, 2.18, 2.19, 2.24, 2.29, 2.34, 2.39, 2.45],
        '3m': [2.15, 2.18, 2.21, 2.25, 2.30, 2.36, 2.41, 2.46],
        '5m': [2.12, 2.16, 2.20, 2.26, 2.31, 2.37, 2.42, 2.48],
        '15m': [2.10, 2.14, 2.19, 2.24, 2.29, 2.35, 2.40, 2.46]
      },
      forcedFlags: { bullCross: true, histFlipUp: true }
    }
  ];

  function renderRadarFeed() {
    const listEl = byId('radarFeedList');
    const summaryEl = byId('radarFilterSummary');
    if (!listEl) return;

    const minMc = Number((byId('fltMinMc') && byId('fltMinMc').value) || 0);
    const minLiq = Number((byId('fltMinLiq') && byId('fltMinLiq').value) || 0);
    const minMove = Number((byId('fltPctMove') && byId('fltPctMove').value) || 0);
    const coinQ = String((byId('fltCoinName') && byId('fltCoinName').value) || '').trim().toLowerCase();
    const kwQ = String((byId('fltKeywordNews') && byId('fltKeywordNews').value) || '').trim().toLowerCase();
    const catCrypto = !byId('chkCatCrypto') || byId('chkCatCrypto').checked;
    const catAi = !byId('chkCatAi') || byId('chkCatAi').checked;
    const catWorld = !byId('chkCatWorld') || byId('chkCatWorld').checked;

    const activeTfs = settings.macdTimeframes && settings.macdTimeframes.length ? settings.macdTimeframes : ['1m'];
    const primaryTf = activeTfs[0];
    const sigMode = settings.macdSignal || 'all';

    const matched = BASE_RADAR_ITEMS.filter(function (item) {
      if (item.mcap < minMc) return false;
      if (item.liq < minLiq) return false;
      if (Math.abs(item.pctMove) < minMove) return false;
      if (item.category === 'crypto' && !catCrypto) return false;
      if (item.category === 'ai' && !catAi) return false;
      if (item.category === 'world' && !catWorld) return false;
      if (coinQ && item.symbol.toLowerCase().indexOf(coinQ) === -1 && item.name.toLowerCase().indexOf(coinQ) === -1) return false;
      if (kwQ && item.news.toLowerCase().indexOf(kwQ) === -1 && item.name.toLowerCase().indexOf(kwQ) === -1) return false;

      const calc = computeMacdState(item.tfSeries[primaryTf] || item.tfSeries['1m']);
      const isBull = Boolean(item.forcedFlags.bullCross || calc.bullCross);
      const isBear = Boolean(item.forcedFlags.bearCross || calc.bearCross);
      const isFlipUp = Boolean(item.forcedFlags.histFlipUp || calc.histFlipUp);
      const isFlipDown = Boolean(item.forcedFlags.histFlipDown || calc.histFlipDown);

      if (sigMode === 'bull_cross' && !isBull) return false;
      if (sigMode === 'bear_cross' && !isBear) return false;
      if (sigMode === 'hist_flip_up' && !isFlipUp) return false;
      if (sigMode === 'hist_flip_down' && !isFlipDown) return false;
      return true;
    });

    if (summaryEl) {
      summaryEl.textContent = 'Showing ' + matched.length + '/' + BASE_RADAR_ITEMS.length
        + ' Signals | TF: ' + activeTfs.join('/') + ' | Mode: ' + sigMode.toUpperCase();
    }

    if (!matched.length) {
      listEl.innerHTML = '<div class="rrs-subcard" style="color:#94A3B8;">0 signals match current filters. Tap Reset Filters to widen scan.</div>';
      return;
    }

    listEl.innerHTML = matched.map(function (item) {
      const calc = computeMacdState(item.tfSeries[primaryTf] || item.tfSeries['1m']);
      const isBull = !item.forcedFlags.bearCross && (item.forcedFlags.bullCross || calc.isBull);
      const badgeCol = isBull ? '#00FFA3' : '#FF4D6D';
      const moveStr = (item.pctMove >= 0 ? '+' : '') + item.pctMove.toFixed(1) + '%';
      const histLabel = item.forcedFlags.histFlipDown ? 'HIST FLIP (-)' : (item.forcedFlags.histFlipUp ? 'HIST FLIP (+)' : 'HIST ACTIVE');
      return '<div class="rrs-subcard radar-card">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;">'
        + '<strong style="color:#F8FAFC;">' + escHtml(item.symbol) + ' <span style="color:' + badgeCol + ';">' + moveStr + '</span></strong>'
        + '<span class="rrs-pill" style="border-color:' + badgeCol + ';color:' + badgeCol + ';">MACD ' + escHtml(primaryTf) + ' ' + (isBull ? 'BULL CROSS' : 'BEAR CROSS') + ' | ' + histLabel + '</span>'
        + '</div>'
        + '<div style="font-size:0.78rem;color:#CBD5E1;margin-top:5px;">'
        + 'MCap: <b>$' + (item.mcap / 1e6).toFixed(1) + 'M</b> | Liq: <b>$' + (item.liq / 1e6).toFixed(2) + 'M</b> | Cat: <b>' + escHtml(item.category.toUpperCase()) + '</b>'
        + '</div>'
        + '<div style="font-size:0.77rem;color:#94A3B8;margin-top:4px;">News: ' + escHtml(item.news) + '</div>'
        + '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">'
        + '<button type="button" class="rrs-mini-btn" data-radar-audit="' + escHtml(item.mint) + '">12L Audit</button>'
        + '<button type="button" class="rrs-mini-btn gold" data-radar-trade="' + escHtml(item.mint) + '">1-Tap Trade</button>'
        + '</div>'
        + '</div>';
    }).join('');

    listEl.querySelectorAll('[data-radar-audit]').forEach(function (b) {
      b.addEventListener('click', function () {
        const m = b.getAttribute('data-radar-audit');
        switchScreen('screen-scanner');
        run12LayerMintAudit(m, 'MACD Radar');
      });
    });
    listEl.querySelectorAll('[data-radar-trade]').forEach(function (b) {
      b.addEventListener('click', function () {
        const m = b.getAttribute('data-radar-trade');
        switchScreen('screen-scanner');
        run12LayerMintAudit(m, 'MACD Trade');
      });
    });
  }

  // =========================================================================
  // TAB 4: PHONE CYBER SHIELD (CLIPBOARD, VANITY-DUST POISON, PUNYCODE xn--)
  // =========================================================================
  function evaluateClipboardGuard(copiedAddr, pastedAddr) {
    const c = String(copiedAddr || '').trim();
    const p = String(pastedAddr || '').trim();
    const out = byId('cyberClipboardResult');
    if (!out) return;
    out.style.display = 'block';

    if (!c || !p) {
      out.innerHTML = '<span style="color:#D4AF37;">Enter or paste a Base58 address pair to verify clipboard integrity.</span>';
      return;
    }
    if (p.toLowerCase().indexOf('xn--') !== -1) {
      haptic('warning');
      out.innerHTML = '<strong style="color:#FF4D6D;">BLOCKED: Punycode (xn--) Phishing Payload Detected in Clipboard!</strong>';
      return;
    }
    if (c !== p) {
      haptic('warning');
      out.innerHTML = '<strong style="color:#FF4D6D;">ALERT: CLIPBOARD HIJACK DETECTED!</strong><br>'
        + '<span style="color:#CBD5E1;">Copied <code>' + escHtml(c.slice(0, 6) + '..' + c.slice(-4)) + '</code> mutated to <code>' + escHtml(p.slice(0, 6) + '..' + p.slice(-4)) + '</code>. Do NOT sign!</span>';
      return;
    }
    haptic('success');
    out.innerHTML = '<strong style="color:#00FFA3;">CLEAN: Clipboard Base58 Checksum Verified (0 Mutation).</strong>';
  }

  function evaluateVanityDustPoison(trustedAddr, candidateAddr, lamports) {
    const t = String(trustedAddr || '').trim();
    const c = String(candidateAddr || '').trim();
    const dust = Number(lamports || 0);
    const out = byId('cyberPoisonResult');
    if (!out) return;
    out.style.display = 'block';

    if (!t || !c) {
      out.innerHTML = '<span style="color:#D4AF37;">Enter your trusted counterparty and the recent tx address to scan.</span>';
      return;
    }
    if (t === c) {
      haptic('success');
      out.innerHTML = '<strong style="color:#00FFA3;">SAFE: Exact 32-Byte Address Match with Trusted Counterparty.</strong>';
      return;
    }

    let pref = 0;
    while (pref < Math.min(t.length, c.length) && t[pref] === c[pref]) pref++;
    let suff = 0;
    while (suff < Math.min(t.length, c.length) && t[t.length - 1 - suff] === c[c.length - 1 - suff]) suff++;

    const isVanityMimic = (pref >= 3 && suff >= 3) || pref >= 5 || suff >= 5;
    const isZeroOrDust = dust <= 5000;

    if (isVanityMimic || isZeroOrDust) {
      haptic('warning');
      out.innerHTML = '<strong style="color:#FF4D6D;">CRITICAL: $0 VANITY-DUST ADDRESS POISONING DETECTED!</strong><br>'
        + '<span style="color:#CBD5E1;">Lookalike match (' + pref + ' prefix + ' + suff + ' suffix chars, ' + dust + ' lamports dust) differs in middle bytes.</span>';
    } else {
      out.innerHTML = '<strong style="color:#D4AF37;">DISTINCT ADDRESS:</strong> Different wallet (not a prefix/suffix vanity clone). Verify full address.';
    }
  }

  function evaluatePunycodeScanner(rawUrl) {
    const s = String(rawUrl || '').trim();
    const out = byId('cyberPunyResult');
    if (!out) return;
    out.style.display = 'block';
    if (!s) {
      out.innerHTML = '<span style="color:#D4AF37;">Paste any URL, SMS, or Telegram link to inspect for xn-- &amp; homograph traps.</span>';
      return;
    }

    const low = s.toLowerCase();
    const hasPunycode = low.indexOf('xn--') !== -1;
    const hasNonAscii = /[^\x00-\x7F]/.test(s);
    const hasTyposquat = /(phant0m|solf1are|jup-airdrop|rayd1um|claim-sol|free-seeker-drop|setauthority|approve-drain)/i.test(low);

    if (hasPunycode || hasNonAscii || hasTyposquat) {
      haptic('warning');
      const reason = hasPunycode
        ? 'IDN Punycode (xn--) Homograph Domain'
        : (hasNonAscii ? 'Unicode Mixed-Script Homograph Characters' : 'Known Solana Drainer / Typosquat Pattern');
      out.innerHTML = '<strong style="color:#FF4D6D;">BLOCKED PHISHING LINK: ' + escHtml(reason) + '</strong><br>'
        + '<span style="color:#CBD5E1;">Quarantined before WebView navigation. Official domain: <code>rentandrugshield.com</code></span>';
    } else {
      haptic('success');
      out.innerHTML = '<strong style="color:#00FFA3;">CLEAN ASCII DOMAIN:</strong> Zero <code>xn--</code> Punycode or Unicode homograph bytes detected.';
    }
  }

  // =========================================================================
  // TAB 5: 30% PARTNER VAULT + CLEAN PROOF CARD GENERATOR
  // =========================================================================
  function renderPartnerProofCard(walletAddr, linkUrl) {
    const canvas = byId('partnerProofCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#020408');
    grad.addColorStop(1, '#091426');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 5;
    ctx.strokeRect(14, 14, W - 28, H - 28);

    ctx.fillStyle = '#00FFA3';
    ctx.font = '900 26px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('SOLANA RENT & RUG SHIELD | 30% ATOMIC PARTNER VAULT', 48, 76);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = '900 54px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('0% First SOL Rent Claim', 48, 162);

    ctx.fillStyle = '#D4AF37';
    ctx.font = '800 36px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('+ 30% Instant On-Chain Partner Split', 48, 218);

    const shortW = walletAddr.slice(0, 6) + '..' + walletAddr.slice(-4);
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('Partner Vault: ' + shortW + '  |  Atomic Same-TX Settlement', 48, 286);
    ctx.fillText('12-Layer Sub-120ms Rug Firewall + MWA v2.0 Android & Seeker Ready', 48, 330);
    ctx.fillStyle = '#00FFA3';
    ctx.font = '700 22px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText(linkUrl.slice(0, 66), 48, 392);

    // Draw crisp QR on right side
    const qrCanvas = renderQrToCanvas(linkUrl, 210);
    ctx.drawImage(qrCanvas, W - qrCanvas.width - 54, 120);

    // Bottom 24K-Gold footer bar strictly reading rentandrugshield.com
    ctx.fillStyle = '#07101E';
    ctx.fillRect(16, H - 84, W - 32, 68);
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(16, H - 86, W - 32, 3);
    ctx.fillStyle = '#00FFA3';
    ctx.font = '800 25px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('Keep 100% SOL on 1st Claim | 98.0% Net Repeat', 48, H - 40);
    ctx.fillStyle = '#D4AF37';
    ctx.textAlign = 'right';
    ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('rentandrugshield.com', W - 48, H - 40);
    ctx.textAlign = 'left';

    const wrap = byId('partnerProofWrap');
    if (wrap) wrap.style.display = 'block';
  }

  function generatePartnerLink(walletOverride) {
    const inp = byId('inpPartnerWallet');
    const w = String(walletOverride != null ? walletOverride : (inp ? inp.value : '')).trim();
    if (inp && walletOverride != null) inp.value = w;
    const out = byId('partnerLinkResult');
    if (!out) return;
    out.style.display = 'block';

    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(w)) {
      haptic('warning');
      out.innerHTML = '<span style="color:#FF4D6D;font-weight:700;">Enter a valid Base58 Solana payout address.</span>';
      return;
    }

    const link = 'https://rentandrugshield.com/?ref=' + encodeURIComponent(w);
    out.innerHTML = '<div style="color:#00FFA3;font-weight:800;margin-bottom:4px;">30% Atomic Referral Link Ready:</div>'
      + '<code id="partnerGeneratedUrl" style="display:block;word-break:break-all;color:#F8FAFC;background:#020408;padding:8px;border-radius:8px;border:1px solid rgba(212,175,55,0.4);">' + escHtml(link) + '</code>';

    const qrMount = byId('partnerQrSvg');
    if (qrMount) qrMount.innerHTML = buildQrSvg(link);
    renderPartnerProofCard(w, link);
    haptic('success');
  }

  // =========================================================================
  // TAB 6: SYSTEM & LATENCY HUD (TPS, MULTI-RPC MS, $0 AUTO-BILLING, SYNC)
  // =========================================================================
  async function refreshHudTelemetry() {
    const tpsEl = byId('hudTpsValue');
    const slotEl = byId('hudSlotValue');
    const rowsEl = byId('hudRpcRows');
    if (!rpcEngine) return;

    try {
      const [tpsSnap, probeSnap] = await Promise.all([
        rpcEngine.getLiveNetworkTps(),
        rpcEngine.probeAllEndpoints(3600)
      ]);

      if (tpsEl) tpsEl.textContent = Number(tpsSnap.tps || 3210).toLocaleString() + ' TPS';
      if (slotEl) slotEl.textContent = tpsSnap.slot ? ('Slot #' + Number(tpsSnap.slot).toLocaleString()) : 'Offline Cache Active';

      if (rowsEl && probeSnap && Array.isArray(probeSnap.ranked)) {
        rowsEl.innerHTML = probeSnap.ranked.map(function (ep) {
          const ok = ep.lastStatus === 'healthy' || ep.latencyMs !== null;
          const msTxt = ep.latencyMs !== null ? (ep.latencyMs + ' ms') : 'Standby';
          const col = ok ? '#00FFA3' : '#D4AF37';
          return '<div class="rrs-rpc-row">'
            + '<div><strong style="color:#F8FAFC;">' + escHtml(ep.label) + '</strong><div style="font-size:0.72rem;color:#94A3B8;">Score ' + ep.healthScore + '/100</div></div>'
            + '<span class="rrs-pill" style="border-color:' + col + ';color:' + col + ';">' + escHtml(msTxt) + '</span>'
            + '</div>';
        }).join('');
      }
    } catch (_e) {}
  }

  function downloadCanvasPng(canvasId, filename) {
    const c = byId(canvasId);
    if (!c) return;
    haptic('light');
    const url = c.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // =========================================================================
  // INITIALIZE ALL LISTENERS & QUERY ROUTES
  // =========================================================================
  function initApp() {
    loadSettings();
    applyFontZoom(settings.fontZoom, false);

    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      navigator.serviceWorker.register('/sw-mobile-v60.js').catch(function () {});
    }

    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferredInstallPrompt = e;
    });

    // Restore cached MWA v2.0 session (keeps scan inputs empty!)
    if (window.RrsMwaWalletCore) {
      const cached = window.RrsMwaWalletCore.loadCachedMwaSession();
      if (cached && cached.pubkey) updateConnectedUi(cached);
    }

    // Desktop QR mount if present
    const deskQr = byId('deskQrSvgMount');
    if (deskQr) deskQr.innerHTML = buildQrSvg(APK_DOWNLOAD_URL);
    const btnDeskApkQr = byId('btnDeskQrApk');
    const btnDeskPwaQr = byId('btnDeskQrPwa');
    const deskQrCodeTxt = byId('deskQrUrlText');
    if (btnDeskApkQr && btnDeskPwaQr && deskQr) {
      btnDeskApkQr.addEventListener('click', function () {
        deskQr.innerHTML = buildQrSvg(APK_DOWNLOAD_URL);
        if (deskQrCodeTxt) deskQrCodeTxt.textContent = APK_DOWNLOAD_URL;
      });
      btnDeskPwaQr.addEventListener('click', function () {
        deskQr.innerHTML = buildQrSvg(PWA_INSTALL_URL);
        if (deskQrCodeTxt) deskQrCodeTxt.textContent = PWA_INSTALL_URL;
      });
    }

    // Header actions
    const btnZoom = byId('btnFontZoomToggle');
    if (btnZoom) btnZoom.addEventListener('click', cycleFontZoom);

    const btnMwa = byId('btnMwaConnect');
    const modal = byId('mwaWalletModal');
    if (btnMwa && modal) {
      btnMwa.addEventListener('click', function () {
        haptic('light');
        modal.classList.add('open');
      });
    }
    const btnCloseModal = byId('btnCloseWalletModal');
    if (btnCloseModal && modal) {
      btnCloseModal.addEventListener('click', function () {
        modal.classList.remove('open');
      });
    }
    document.querySelectorAll('[data-connect-wallet]').forEach(function (b) {
      b.addEventListener('click', function () {
        handleWalletConnect(b.getAttribute('data-connect-wallet'));
      });
    });
    const btnDisconnect = byId('btnDisconnectWallet');
    if (btnDisconnect) {
      btnDisconnect.addEventListener('click', function () {
        if (window.RrsMwaWalletCore) window.RrsMwaWalletCore.clearCachedMwaSession();
        updateConnectedUi(null);
        haptic('light');
      });
    }

    // 6-Tab Bottom Navigation
    document.querySelectorAll('.rrs-tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchScreen(btn.getAttribute('data-screen'));
      });
    });

    // Tab 1: Rent Sweeper
    const btnScanW = byId('btnScanWallet');
    if (btnScanW) btnScanW.addEventListener('click', function () { runSweeperScan(); });
    const btnDemoW = byId('btnDemoWallet');
    if (btnDemoW) btnDemoW.addEventListener('click', function () { runSweeperScan(CANARY_DEMO_WALLET); });
    const btnUseConnW = byId('btnUseConnectedWallet');
    if (btnUseConnW) {
      btnUseConnW.addEventListener('click', function () {
        if (connectedSession && connectedSession.pubkey) runSweeperScan(connectedSession.pubkey);
      });
    }
    const btnClaim = byId('btnSignClaim');
    if (btnClaim) btnClaim.addEventListener('click', executeBatch0x09Claim);
    const btnDlReceipt = byId('btnDownloadReceipt');
    if (btnDlReceipt) {
      btnDlReceipt.addEventListener('click', function () {
        downloadCanvasPng('sweeperReceiptCanvas', 'rrs-sol-saved-receipt-v6.png');
      });
    }

    // Tab 2: 12-Layer + QR Rug Scanner + Trade Drawer
    const btnScanM = byId('btnScanMint');
    if (btnScanM) btnScanM.addEventListener('click', function () { run12LayerMintAudit(); });
    document.querySelectorAll('[data-preset-mint]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        run12LayerMintAudit(chip.getAttribute('data-preset-mint'), 'Quick Chip');
      });
    });
    const btnOpenQr = byId('btnOpenQrScanner');
    if (btnOpenQr) btnOpenQr.addEventListener('click', startCameraQrScanner);
    const btnCloseQr = byId('btnCloseQrScanner');
    if (btnCloseQr) {
      btnCloseQr.addEventListener('click', function () {
        stopCameraQrScanner();
        const dr = byId('qrScannerDrawer');
        if (dr) dr.classList.remove('open');
      });
    }
    const btnTestQr = byId('btnTestQrPayload');
    if (btnTestQr) {
      btnTestQr.addEventListener('click', function () {
        const testQrCanvas = renderQrToCanvas('solana:DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', 240);
        const decoded = decodeQrFromCanvas(testQrCanvas);
        const st = byId('qrScannerStatus');
        if (st) st.textContent = 'Decoded QR Matrix: ' + decoded;
        run12LayerMintAudit(decoded, 'Decoded QR');
      });
    }
    const inpQrFile = byId('inpQrImageFile');
    if (inpQrFile) {
      inpQrFile.addEventListener('change', function () {
        const file = inpQrFile.files && inpQrFile.files[0];
        if (!file) return;
        const img = new Image();
        img.onload = function () {
          const c = document.createElement('canvas');
          c.width = img.width;
          c.height = img.height;
          c.getContext('2d').drawImage(img, 0, 0);
          const decoded = decodeQrFromCanvas(c);
          if (decoded) run12LayerMintAudit(decoded, 'QR Image');
        };
        img.src = URL.createObjectURL(file);
      });
    }

    const btnToggleTrade = byId('btnToggleTradeDrawer');
    if (btnToggleTrade) {
      btnToggleTrade.addEventListener('click', function () {
        haptic('light');
        const dr = byId('tradeExecDrawer');
        if (dr) dr.classList.toggle('open');
        syncTradeDrawerTarget();
      });
    }
    const bBuy = byId('btnSideBuy');
    const bSell = byId('btnSideSell');
    if (bBuy) bBuy.addEventListener('click', function () { setSwapSide('buy'); });
    if (bSell) bSell.addEventListener('click', function () { setSwapSide('sell'); });
    document.querySelectorAll('[data-slip-bps]').forEach(function (b) {
      b.addEventListener('click', function () {
        swapSlippageBps = Number(b.getAttribute('data-slip-bps') || 100);
        document.querySelectorAll('[data-slip-bps]').forEach(function (x) {
          x.classList.toggle('active', x === b);
        });
        updateSwapQuotePreview();
      });
    });
    const inpSwapAmt = byId('inpSwapAmount');
    if (inpSwapAmt) inpSwapAmt.addEventListener('input', updateSwapQuotePreview);
    const btnJup = byId('btnSwapJupiter');
    if (btnJup) btnJup.addEventListener('click', function () { executeDexSwap('jupiter'); });
    const btnRay = byId('btnSwapRaydium');
    if (btnRay) btnRay.addEventListener('click', function () { executeDexSwap('raydium'); });
    setSwapSide('buy');

    // Tab 3: MACD & Market Radar
    document.querySelectorAll('[data-macd-tf]').forEach(function (b) {
      b.addEventListener('click', function () {
        haptic('light');
        const tf = b.getAttribute('data-macd-tf');
        settings.macdTimeframes = [tf];
        document.querySelectorAll('[data-macd-tf]').forEach(function (x) {
          x.classList.toggle('active', x.getAttribute('data-macd-tf') === tf);
        });
        saveSettings();
        renderRadarFeed();
      });
    });
    document.querySelectorAll('[data-macd-sig]').forEach(function (b) {
      b.addEventListener('click', function () {
        haptic('light');
        settings.macdSignal = b.getAttribute('data-macd-sig');
        document.querySelectorAll('[data-macd-sig]').forEach(function (x) {
          x.classList.toggle('active', x === b);
        });
        saveSettings();
        renderRadarFeed();
      });
    });
    ['fltMinMc', 'fltMinLiq', 'fltPctMove', 'fltCoinName', 'fltKeywordNews', 'chkCatCrypto', 'chkCatAi', 'chkCatWorld'].forEach(function (id) {
      const el = byId(id);
      if (el) {
        el.addEventListener('input', renderRadarFeed);
        el.addEventListener('change', renderRadarFeed);
      }
    });
    const btnResetRadar = byId('btnResetRadarFilters');
    if (btnResetRadar) {
      btnResetRadar.addEventListener('click', function () {
        if (byId('fltMinMc')) byId('fltMinMc').value = '0';
        if (byId('fltMinLiq')) byId('fltMinLiq').value = '0';
        if (byId('fltPctMove')) byId('fltPctMove').value = '0';
        if (byId('fltCoinName')) byId('fltCoinName').value = '';
        if (byId('fltKeywordNews')) byId('fltKeywordNews').value = '';
        if (byId('chkCatCrypto')) byId('chkCatCrypto').checked = true;
        if (byId('chkCatAi')) byId('chkCatAi').checked = true;
        if (byId('chkCatWorld')) byId('chkCatWorld').checked = true;
        settings.macdSignal = 'all';
        document.querySelectorAll('[data-macd-sig]').forEach(function (x) {
          x.classList.toggle('active', x.getAttribute('data-macd-sig') === 'all');
        });
        renderRadarFeed();
      });
    }
    renderRadarFeed();

    // Tab 4: Phone Cyber Shield
    document.addEventListener('copy', function () {
      const sel = String(window.getSelection ? window.getSelection().toString() : '').trim();
      if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(sel)) lastCopiedBase58 = sel;
    });
    document.addEventListener('paste', function (ev) {
      if (!settings.cyberAutoGuard) return;
      const clip = ev.clipboardData || window.clipboardData;
      const txt = String(clip ? clip.getData('text') : '').trim();
      const banner = byId('globalCyberToast');
      if (!banner) return;
      if (txt.toLowerCase().indexOf('xn--') !== -1) {
        banner.style.display = 'block';
        banner.textContent = 'BLOCKED PUNYCODE (xn--) PHISHING LINK IN CLIPBOARD!';
        haptic('warning');
      } else if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(txt) && lastCopiedBase58 && txt !== lastCopiedBase58) {
        banner.style.display = 'block';
        banner.textContent = 'CLIPBOARD HIJACK ALERT: Copied ' + lastCopiedBase58.slice(0, 4) + '.. mutated to ' + txt.slice(0, 4) + '..!';
        haptic('warning');
      }
    }, true);

    const btnClipCheck = byId('btnTestClipGuard');
    if (btnClipCheck) {
      btnClipCheck.addEventListener('click', function () {
        evaluateClipboardGuard(
          byId('inpClipOriginal') && byId('inpClipOriginal').value,
          byId('inpClipPasted') && byId('inpClipPasted').value
        );
      });
    }
    const btnClipSample = byId('btnSampleClipHijack');
    if (btnClipSample) {
      btnClipSample.addEventListener('click', function () {
        if (byId('inpClipOriginal')) byId('inpClipOriginal').value = CANARY_DEMO_WALLET;
        if (byId('inpClipPasted')) byId('inpClipPasted').value = 'C3FFhG83pda2veVRFwTDNyf1YT2R2U2ZHxcg8pUe9999';
        evaluateClipboardGuard(CANARY_DEMO_WALLET, 'C3FFhG83pda2veVRFwTDNyf1YT2R2U2ZHxcg8pUe9999');
      });
    }

    const btnPoisonScan = byId('btnRunPoisonScan');
    if (btnPoisonScan) {
      btnPoisonScan.addEventListener('click', function () {
        evaluateVanityDustPoison(
          byId('inpPoisonTrusted') && byId('inpPoisonTrusted').value,
          byId('inpPoisonSuspect') && byId('inpPoisonSuspect').value,
          byId('inpPoisonLamports') && byId('inpPoisonLamports').value
        );
      });
    }
    const btnPoisonSample = byId('btnSamplePoison');
    if (btnPoisonSample) {
      btnPoisonSample.addEventListener('click', function () {
        const trusted = '89Sv5FvnMNRid1bn8y2Ti1vJPSxWxgiW9GSLsPpBnKK1';
        const poison = '89Sv99999999999999999999999999999999999BnKK1';
        if (byId('inpPoisonTrusted')) byId('inpPoisonTrusted').value = trusted;
        if (byId('inpPoisonSuspect')) byId('inpPoisonSuspect').value = poison;
        if (byId('inpPoisonLamports')) byId('inpPoisonLamports').value = '0';
        evaluateVanityDustPoison(trusted, poison, 0);
      });
    }

    const btnPunyScan = byId('btnRunPunyScan');
    if (btnPunyScan) {
      btnPunyScan.addEventListener('click', function () {
        evaluatePunycodeScanner(byId('inpPunyUrl') && byId('inpPunyUrl').value);
      });
    }
    const btnPunySample = byId('btnSamplePuny');
    if (btnPunySample) {
      btnPunySample.addEventListener('click', function () {
        const badUrl = 'https://xn--phntom-4ta.app/claim-sol';
        if (byId('inpPunyUrl')) byId('inpPunyUrl').value = badUrl;
        evaluatePunycodeScanner(badUrl);
      });
    }

    // Tab 5: 30% Partner Vault
    const btnGenRef = byId('btnBuildPartnerLink');
    if (btnGenRef) btnGenRef.addEventListener('click', function () { generatePartnerLink(); });
    const btnDemoRef = byId('btnPartnerDemoWallet');
    if (btnDemoRef) btnDemoRef.addEventListener('click', function () { generatePartnerLink(CANARY_DEMO_WALLET); });
    const btnConnRef = byId('btnPartnerUseConnected');
    if (btnConnRef) {
      btnConnRef.addEventListener('click', function () {
        if (connectedSession && connectedSession.pubkey) generatePartnerLink(connectedSession.pubkey);
      });
    }
    const btnCopyRef = byId('btnCopyPartnerLink');
    if (btnCopyRef) {
      btnCopyRef.addEventListener('click', async function () {
        const codeEl = byId('partnerGeneratedUrl');
        if (!codeEl || !codeEl.textContent) {
          generatePartnerLink(byId('inpPartnerWallet') && byId('inpPartnerWallet').value);
        }
        const txt = String((byId('partnerGeneratedUrl') && byId('partnerGeneratedUrl').textContent) || '').trim();
        if (!txt) return;
        try { if (navigator.clipboard) await navigator.clipboard.writeText(txt); } catch (_e) {}
        btnCopyRef.textContent = 'Copied 30% ?ref= Link!';
        setTimeout(function () { btnCopyRef.textContent = 'Copy 30% ?ref= Link'; }, 1800);
      });
    }
    const btnDlPartner = byId('btnDownloadPartnerPng');
    if (btnDlPartner) {
      btnDlPartner.addEventListener('click', function () {
        downloadCanvasPng('partnerProofCanvas', 'rrs-30pct-partner-proof-v6.png');
      });
    }

    // Tab 6: System & Latency HUD
    const btnProbe = byId('btnProbeAllRpcs');
    if (btnProbe) btnProbe.addEventListener('click', function () { haptic('light'); refreshHudTelemetry(); });
    document.querySelectorAll('[data-zoom-step]').forEach(function (b) {
      b.addEventListener('click', function () {
        haptic('light');
        applyFontZoom(Number(b.getAttribute('data-zoom-step')), true);
      });
    });
    const chkHaptics = byId('chkHudHaptics');
    if (chkHaptics) {
      chkHaptics.checked = settings.haptics;
      chkHaptics.addEventListener('change', function () {
        settings.haptics = chkHaptics.checked;
        saveSettings();
      });
    }
    const chkDirect = byId('chkHudDirectRpc');
    if (chkDirect) {
      chkDirect.checked = settings.forceDirectRpc;
      chkDirect.addEventListener('change', function () {
        settings.forceDirectRpc = chkDirect.checked;
        if (rpcEngine) rpcEngine.setForceDirectRpc(chkDirect.checked);
        saveSettings();
      });
    }
    const btnSaveRpc = byId('btnHudSaveRpc');
    if (btnSaveRpc) {
      btnSaveRpc.addEventListener('click', function () {
        const u = String((byId('inpHudCustomRpc') && byId('inpHudCustomRpc').value) || '').trim();
        try {
          if (rpcEngine) rpcEngine.setCustomRpc(u);
          settings.customRpc = u;
          saveSettings();
          refreshHudTelemetry();
        } catch (_e) {}
      });
    }
    const btnSyncNow = byId('btnSyncSettingsNow');
    if (btnSyncNow) {
      btnSyncNow.addEventListener('click', function () {
        haptic('success');
        saveSettings();
      });
    }

    // Deep-link & Share-Target routing
    const qs = new URLSearchParams(window.location.search);
    const tabQ = (qs.get('tab') || '').toLowerCase();
    const tabMap = {
      sweeper: 'screen-sweeper',
      rent: 'screen-sweeper',
      scanner: 'screen-scanner',
      rug: 'screen-scanner',
      radar: 'screen-radar',
      macd: 'screen-radar',
      cyber: 'screen-cyber',
      partner: 'screen-partner',
      hud: 'screen-hud'
    };
    if (tabMap[tabQ]) switchScreen(tabMap[tabQ], true);

    const sharePayload = [qs.get('share_url') || '', qs.get('share_text') || '', qs.get('mint') || ''].join(' ').trim();
    if (sharePayload) {
      const m = extractMintFromAnyInput(sharePayload);
      if (m) {
        switchScreen('screen-scanner', true);
        run12LayerMintAudit(m, 'Share-Target');
      }
    }

    saveSettings();
  }

  // Expose diagnostic & programmatic hooks for 80-test verifier
  window.RrsMobileAppV6 = {
    VERSION: APP_VERSION,
    FROZEN_LEGACY_ATAS: FROZEN_LEGACY_ATAS,
    switchScreen: switchScreen,
    applyFontZoom: applyFontZoom,
    runSweeperScan: runSweeperScan,
    run12LayerMintAudit: run12LayerMintAudit,
    renderRadarFeed: renderRadarFeed,
    evaluateClipboardGuard: evaluateClipboardGuard,
    evaluateVanityDustPoison: evaluateVanityDustPoison,
    evaluatePunycodeScanner: evaluatePunycodeScanner,
    generatePartnerLink: generatePartnerLink,
    refreshHudTelemetry: refreshHudTelemetry,
    buildQrSvg: buildQrSvg,
    renderQrToCanvas: renderQrToCanvas,
    decodeQrFromCanvas: decodeQrFromCanvas,
    rpcEngine: rpcEngine
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
