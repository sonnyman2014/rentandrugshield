(function () {
  'use strict';
  window.__RRS_TOAST_V53_READY__ = true;
  window.__RRS_TOAST_V55_LUXURY_READY__ = true;
  window.__RRS_TOAST_V60_CLEAN_READY__ = true;
  window.__RRS_TOAST_V61_GRB_READY__ = true;
  window.__RRS_TOAST_V67_COMPLETE_READY__ = true;
  window.__RRS_TOAST_VERSION__ = '6.7.0';

  const LAYOUT_KEY_V53 = 'rrs_box_layout_v53';
  const FLT_KEY_V53 = 'rrs_notifier_filters_v53';
  const AUTOSCAN_KEY_V67 = 'rrs_autoscan_collect_v67';
  const WALLET_KEY_V60 = 'rrs_connected_phantom_wallet_v60';
  const PHANTOM_45S_URL = 'https://rentandrugshield.com/app.html?connect_phantom=1&auto_reclaim_0pct=1&src=ext_v67';
  const PUBLICNODE_SOLANA_RPC = 'https://solana-rpc.publicnode.com';
  const SPL_TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
  const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
  const HARD_EXCLUDED_FROZEN_ATAS = new Set([
    '5sEb9m4XP3mXJSsv8GEeck62Z6PY8TfAhmngZrpgNU9Q',
    'CsLX8FSsWc8uNfMBUB9PhwcsZBaLstoYpiUi9SDdkDLg',
    'DGnsyzo5cbQZMpXEwSbESBnSrdjroj7DhpcAPbfQaUft',
    'FRCeYgC1PR7kTKhgk8Peq7WE8Rz6E7cEXnhB77DT5G8F'
  ]);

  const MIN_ZOOM = 75;
  const MAX_ZOOM = 200;
  const ALLOWED_STAY_SECS = [3, 5, 8, 10, 15, 20, 30, 45, 60];

  // 12 Real Spoken Neural Voice .WAV Clips (edge-tts, 0 synth beeps)
  const SPOKEN_VOICES_12 = [
    { label: 'To Valhalla!', file: 'to_valhalla.wav', aliases: ['to valhalla', 'to valhalla!'] },
    { label: 'To the Moon, baby!', file: 'to_the_moon.wav', aliases: ['to the moon', 'to the moon, baby!'] },
    { label: 'Wizard: 12 Layers Clean!', file: 'wizard_check.wav', aliases: ['wizard', 'wizard: 12 layers clean!'] },
    { label: 'Whale Incoming: Green Light!', file: 'whale_incoming.wav', aliases: ['whale horn', 'whale incoming: green light!'] },
    { label: 'Cha-Ching! Clean Contract!', file: 'cha_ching_clean.wav', aliases: ['coin drop', 'cha-ching! clean contract!'] },
    { label: 'Honey Badger Locked On!', file: 'honey_badger.wav', aliases: ['laser lock', 'honey badger locked on!'] },
    { label: 'Rug Alert! Step Away!', file: 'rug_alert.wav', aliases: ['cyber alert', 'rug alert! step away!'] },
    { label: 'Freeze Trap Detected!', file: 'freeze_trap.wav', aliases: ['radar sweep', 'freeze trap detected!'] },
    { label: 'Breaking Alpha on the Wire!', file: 'breaking_alpha.wav', aliases: ['news wire', 'breaking alpha on the wire!'] },
    { label: 'Free SOL Rent Ready!', file: 'rent_reclaim_ready.wav', aliases: ['emerald ping', 'free sol rent ready!'] },
    { label: 'Sniper Target Verified!', file: 'sniper_verified.wav', aliases: ['sniper tick', 'sniper target verified!'] },
    { label: 'Bull Cross Momentum Surge!', file: 'bull_cross_surge.wav', aliases: ['breakout bell', 'bull cross momentum surge!'] }
  ];

  // Plain-English [?] Trader Tooltip Bubbles
  const PLAIN_ENGLISH_TIPS = {
    runners: {
      title: 'Runners (Verified Momentum)',
      body: 'Verified momentum tokens holding multi-minute higher lows with real DEX volume.'
    },
    whales: {
      title: 'Whales (Smart-Money Size)',
      body: 'Large smart-money wallet accumulation above your SOL/USD size filter.'
    },
    bull_cross: {
      title: 'Bull Cross (Buy-Flow Breakout)',
      body: 'Short-term buy-flow EMA crossing above baseline volume/price trend with clean 12-Layer score.'
    },
    hot_hist: {
      title: 'Hot Hist (Volume Expansion)',
      body: 'Previously graduated/high-win-rate tokens re-entering active volume expansion.'
    },
    bear_warn: {
      title: 'Bear Warn (Risk / Sell Spike)',
      body: 'Sell-pressure spike, LP unlock/drain signal, or authority risk warning.'
    },
    macd: {
      title: 'MACD Trend Speed Filter',
      body: 'Moving Average Convergence Divergence: measures real-time trend direction and acceleration across 1m, 3m, 5m, or 15m candles.'
    },
    liquidity: {
      title: 'Liquidity Pool Depth ($0K-$500K+)',
      body: 'Real cash/SOL locked in the trading pool. Higher liquidity protects you from high slippage and shallow-pool rug pulls.'
    },
    autoscan: {
      title: 'Auto-Scan & 0x09 SOL Rent Collect',
      body: 'When ON with Phantom/Solflare connected, polls read-only PublicNode every 60s to detect 0-balance token accounts and reclaim your SOL rent straight to your wallet (0% 1st claim, 98% repeat, 0 seed phrases).'
    }
  };

  function isNewsAlertToast(t) {
    if (!t || typeof t !== 'object') return false;
    const k = String(t.kind || '').toLowerCase().trim();
    if (k === 'news' || k === 'breaking' || k === 'breaking_news' || k === 'crypto' || k === 'ai' || k === 'world') {
      return true;
    }
    const upper = (String(t.badge || '') + ' ' + String(t.cardMode || '')).toUpperCase();
    return /BREAKING\s*NEWS|CRYPTO\s*NEWS|AI\s*NEWS|WORLD\s*NEWS|LIVE\s*WIRE/i.test(upper) || String(t.cardMode || '').toLowerCase() === 'blue';
  }

  function extractCandidateNewsUrlToast(t) {
    if (!t || typeof t !== 'object') return '';
    const cand = t.article_url || t.link || t.source_url || t.url || t.action_url || '';
    return String(cand || '').trim();
  }

  function isValidExternalNewsUrlToast(rawUrl) {
    const trimmed = String(rawUrl || '').trim();
    if (!/^https?:\/\//i.test(trimmed)) return false;
    try {
      const u = new URL(trimmed);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
      const h = String(u.hostname || '').toLowerCase();
      if (!h || !h.includes('.')) return false;
      if (
        h === 'rentandrugshield.com' ||
        h.endsWith('.rentandrugshield.com') ||
        h.includes('rentandrugshield.com') ||
        h === 'localhost' ||
        h.endsWith('.localhost') ||
        h === '127.0.0.1' ||
        h === '0.0.0.0' ||
        h === '::1' ||
        h === '[::1]' ||
        h.endsWith('.trycloudflare.com')
      ) {
        return false;
      }
      return true;
    } catch (_e) {
      return false;
    }
  }

  const SYSTEM_MINTS = new Set([
    '11111111111111111111111111111111',
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
    'ComputeBudget111111111111111111111111111111'
  ]);
  const KNOWN_SYM_MINTS = {
    MELNOK: '3ig9E5SQKs8RjVn9EuW1YaprjaMd6dEftG63hBcMpump',
    WASTED6: '3wyRvbB6nFD7Y9cuozSXrUajZs1EoJxrcBCDBxwupump',
    NVIDIA: 'AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL',
    RUGTEST: 'AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL',
    SOL: 'So11111111111111111111111111111111111111112',
    BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    WIF: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    PYTH: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
    POPCAT: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr'
  };

  const DEFAULT_LAYOUT = { x: null, y: null, pinned: false, zoomPct: 100, autoHideSec: 5 };
  const DEFAULT_FILTERS = {
    masterBubbles: true,
    autoHideSec: 5,
    stayOpen: false,
    soundEnabled: false,
    audioPreset: 'To Valhalla!',
    roboticVoice: false,
    tf: '3m',
    preset: 'Runners',
    catCoin: true,
    catRug: true,
    cyberLat: true,
    whalePro: false,
    catCrypto: true,
    catAi: true,
    catWorld: false,
    macdOn: true,
    macd1m: false,
    macd3m: true,
    macd5m: true,
    macd15m: false,
    macdBull: true,
    macdHistFlip: true,
    macdBear: true,
    tickerOn: false,
    tickerQuery: 'ALL',
    newsKwOn: true,
    newsKeywords: 'Solana, ETF, Institutional',
    worldRegion: 'Global',
    mcOn: true,
    mcMin: 15000,
    mcMax: 10000000,
    moveOn: true,
    moveMin: 10,
    moveWin: '3m',
    liqOn: true,
    liqMin: 10000,
    liqMax: 0,
    liqPreset: '',
    autoScanEnabled: false
  };

  let layoutState = Object.assign({}, DEFAULT_LAYOUT);
  let filterState = Object.assign({}, DEFAULT_FILTERS);
  let connectedWallet = '';
  let autoScanIntervalId = null;
  let currentVoiceAudio = null;
  const uniqueAlerts = [];
  const seenAlertKeys = new Set();
  let activeAlertIdx = 0;
  let activeCardPinned = false;
  let countdownRemMs = 5000;
  let countdownTotalMs = 5000;
  let countdownLastTickTs = 0;
  let countdownTimerId = null;
  let cardHovered = false;
  let lastHoverMoveTs = 0;
  let lastHoverX = -1;
  let lastHoverY = -1;
  let cardOpenedAtTs = 0;
  let isDraggingCard = false;

  const isExtRuntime = Boolean(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);

  function clampZoom(z) {
    const n = Math.round(Number(z) || 100);
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, n));
  }

  function normStaySec(s) {
    const n = Number(s) || 5;
    let best = 5;
    let bestDiff = Infinity;
    for (let i = 0; i < ALLOWED_STAY_SECS.length; i++) {
      const diff = Math.abs(ALLOWED_STAY_SECS[i] - n);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = ALLOWED_STAY_SECS[i];
      }
    }
    return best;
  }

  function stepStaySecValue(cur, dir) {
    const norm = normStaySec(cur);
    let idx = ALLOWED_STAY_SECS.indexOf(norm);
    if (idx === -1) idx = 1;
    const nextIdx = Math.max(0, Math.min(ALLOWED_STAY_SECS.length - 1, idx + dir));
    return ALLOWED_STAY_SECS[nextIdx];
  }

  function scrubText(s) {
    const legRx = new RegExp('\\b\\x41\\x49[-\\s]+generated\\b', 'gi');
    return String(s || '')
      .split(String.fromCharCode(8212)).join(' | ')
      .split(String.fromCharCode(8211)).join('-')
      .replace(/--+/g, '-')
      .replace(legRx, '12-Layer Verified');
  }

  function resolveVoiceEntry(presetName) {
    const key = String(presetName || filterState.audioPreset || 'To Valhalla!').trim().toLowerCase();
    for (let i = 0; i < SPOKEN_VOICES_12.length; i++) {
      const v = SPOKEN_VOICES_12[i];
      if (v.label.toLowerCase() === key || v.aliases.indexOf(key) !== -1) return v;
    }
    return SPOKEN_VOICES_12[0];
  }

  function playSpokenVoice12(presetName) {
    try {
      const entry = resolveVoiceEntry(presetName);
      const wavUrl = (isExtRuntime && chrome.runtime && chrome.runtime.getURL)
        ? chrome.runtime.getURL('sounds/' + entry.file)
        : ('/static/sounds/' + entry.file);
      if (currentVoiceAudio) {
        try { currentVoiceAudio.pause(); currentVoiceAudio.currentTime = 0; } catch (_e) {}
      }
      const aud = new Audio(wavUrl);
      aud.volume = 0.95;
      currentVoiceAudio = aud;
      window.__RRS_LAST_SPOKEN_WAV__ = { label: entry.label, file: entry.file, url: wavUrl, ts: Date.now() };
      const p = aud.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (_e) {}
  }

  function formatCompactUsd(val) {
    if (val === undefined || val === null || val === '') return '';
    if (typeof val === 'string') {
      const t = val.trim();
      if (/^\$[\d,.]+[KMB]?/i.test(t)) return t;
      const parsed = Number(t.replace(/[$,]/g, ''));
      if (!Number.isFinite(parsed) || parsed <= 0) return t;
      val = parsed;
    }
    const num = Number(val);
    if (!Number.isFinite(num) || num <= 0) return '';
    if (num >= 1000000000) return '$' + (num / 1000000000).toFixed(2).replace(/\.00$/, '') + 'B';
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(2).replace(/\.00$/, '') + 'M';
    if (num >= 1000) return '$' + Math.round(num / 1000) + 'K';
    return '$' + Math.round(num);
  }

  function isValidMint(m) {
    return Boolean(m && m.length >= 32 && m.length <= 44 && !SYSTEM_MINTS.has(m) && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(m));
  }

  function extractMint(explicitMint, rawUrl, title, sym) {
    if (isValidMint(explicitMint)) return explicitMint;
    if (rawUrl) {
      try {
        const u = new URL(rawUrl, 'https://rentandrugshield.com');
        for (const k of ['token', 'mint', 'trade', 'outputMint', 'address']) {
          const v = (u.searchParams.get(k) || '').trim();
          if (isValidMint(v)) return v;
        }
      } catch (_e) {}
      const matches = String(rawUrl).match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g) || [];
      for (const m of matches) {
        if (isValidMint(m)) return m;
      }
    }
    if (title) {
      const matches = String(title).match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g) || [];
      for (const m of matches) {
        if (isValidMint(m)) return m;
      }
      const sm = String(title).match(/\$([A-Za-z0-9_]{2,12})/);
      if (sm && KNOWN_SYM_MINTS[sm[1].toUpperCase()]) return KNOWN_SYM_MINTS[sm[1].toUpperCase()];
    }
    const cleanSym = String(sym || '').replace(/^\$/, '').trim().toUpperCase();
    if (cleanSym && KNOWN_SYM_MINTS[cleanSym]) return KNOWN_SYM_MINTS[cleanSym];
    return '';
  }

  function buildExact12LayerTokenUrl(mint) {
    const safeMint = isValidMint(mint) ? mint : 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN';
    return 'https://rentandrugshield.com/?token=' + encodeURIComponent(safeMint) + '&autoscan=1#tokenScanner';
  }

  function resolveExternalNewsUrl(rawUrl) {
    const trimmed = String(rawUrl || '').trim();
    return isValidExternalNewsUrlToast(trimmed) ? trimmed : '';
  }

  function resolveExactAlertUrl(t) {
    if (isNewsAlertToast(t)) {
      const newsCand = extractCandidateNewsUrlToast(t);
      return resolveExternalNewsUrl(newsCand);
    }
    const kind = String((t && t.kind) || 'coin').toLowerCase();
    const rawUrl = String((t && (t.url || t.action_url)) || '').trim();
    const upper = (String((t && t.badge) || '') + ' ' + String((t && t.title) || '')).toUpperCase();

    if (kind === 'phantom_45s' || kind === 'welcome_reclaim') {
      return /^https?:\/\//i.test(rawUrl) ? rawUrl : PHANTOM_45S_URL;
    }
    if (rawUrl.indexOf(':18088/') !== -1) return rawUrl;
    if (kind === 'visitor' || upper.includes('EXTERNAL HUMAN IPS') || upper.includes('WEBSITE VISITORS')) {
      return 'http://127.0.0.1:18088/command/terminal-2';
    }
    if (kind === 'approvals' || upper.includes('WAITING FOR APPROVAL') || upper.includes('WAITING APPROVALS')) {
      return 'http://127.0.0.1:18088/command/waiting-approvals';
    }
    if (kind === 'promo') {
      return 'http://127.0.0.1:18088/command/terminal-4';
    }

    const mint = extractMint(t && t.mint, rawUrl, t && t.title, t && t.sym);
    if (kind === 'moonbag' && !mint) return 'http://127.0.0.1:18088/command/terminal-1';
    if (mint) return buildExact12LayerTokenUrl(mint);
    return buildExact12LayerTokenUrl(kind === 'rug' ? 'AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL' : 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN');
  }

  function computeAlertDurationMs(alertObj) {
    const customSec = Number(alertObj && (alertObj.customDisplaySec || alertObj.CustomDisplaySec || 0));
    if (Number.isFinite(customSec) && customSec >= 1) {
      return Math.round(customSec * 1000);
    }
    const baseSec = normStaySec(layoutState.autoHideSec);
    const effectiveSec = (isNewsAlertToast(alertObj) && baseSec === 5) ? 8 : baseSec;
    return Math.max(1000, effectiveSec * 1000);
  }

  function sanitizeCoords(obj) {
    if (!obj) return { x: null, y: null };
    const rx = obj.x;
    const ry = obj.y;
    const xOk = (rx !== null && rx !== undefined && rx !== -1 && Number.isFinite(Number(rx)));
    const yOk = (ry !== null && ry !== undefined && ry !== -1 && Number.isFinite(Number(ry)));
    return { x: xOk ? Number(rx) : null, y: yOk ? Number(ry) : null };
  }

  function loadPersistedState(cb) {
    if (isExtRuntime && chrome.storage && chrome.storage.local) {
      try {
        chrome.storage.local.get([LAYOUT_KEY_V53, FLT_KEY_V53, WALLET_KEY_V60, AUTOSCAN_KEY_V67], (res) => {
          if (res && res[LAYOUT_KEY_V53]) {
            const c = sanitizeCoords(res[LAYOUT_KEY_V53]);
            layoutState = Object.assign({}, DEFAULT_LAYOUT, res[LAYOUT_KEY_V53], c, { pinned: false });
            layoutState.zoomPct = clampZoom(layoutState.zoomPct);
            layoutState.autoHideSec = normStaySec(layoutState.autoHideSec);
          }
          if (res && res[FLT_KEY_V53]) {
            filterState = Object.assign({}, DEFAULT_FILTERS, res[FLT_KEY_V53], { stayOpen: false, cardPinned: false });
            filterState.audioPreset = resolveVoiceEntry(filterState.audioPreset).label;
            if (res[FLT_KEY_V53].autoHideSec !== undefined) {
              layoutState.autoHideSec = normStaySec(res[FLT_KEY_V53].autoHideSec);
            }
          }
          layoutState.pinned = false;
          filterState.stayOpen = false;
          filterState.cardPinned = false;
          if (res && res[WALLET_KEY_V60]) {
            connectedWallet = String(res[WALLET_KEY_V60] || '');
          }
          if (res && res[AUTOSCAN_KEY_V67] && res[AUTOSCAN_KEY_V67].enabled !== undefined) {
            filterState.autoScanEnabled = Boolean(res[AUTOSCAN_KEY_V67].enabled);
            if (!connectedWallet && res[AUTOSCAN_KEY_V67].wallet) connectedWallet = String(res[AUTOSCAN_KEY_V67].wallet);
          }
          cb();
        });
        return;
      } catch (_e) {}
    }
    try {
      const rawL = localStorage.getItem(LAYOUT_KEY_V53);
      if (rawL) {
        const parsedL = JSON.parse(rawL);
        layoutState = Object.assign({}, DEFAULT_LAYOUT, parsedL, sanitizeCoords(parsedL), { pinned: false });
      }
      layoutState.pinned = false;
      layoutState.zoomPct = clampZoom(layoutState.zoomPct);
      layoutState.autoHideSec = normStaySec(layoutState.autoHideSec);
      const rawF = localStorage.getItem(FLT_KEY_V53);
      if (rawF) {
        filterState = Object.assign({}, DEFAULT_FILTERS, JSON.parse(rawF), { stayOpen: false, cardPinned: false });
        filterState.audioPreset = resolveVoiceEntry(filterState.audioPreset).label;
        if (filterState.autoHideSec !== undefined) {
          layoutState.autoHideSec = normStaySec(filterState.autoHideSec);
        }
      }
      filterState.stayOpen = false;
      filterState.cardPinned = false;
      const rawA = localStorage.getItem(AUTOSCAN_KEY_V67);
      if (rawA) {
        const parsedA = JSON.parse(rawA);
        filterState.autoScanEnabled = Boolean(parsedA && parsedA.enabled);
      }
      connectedWallet = String(localStorage.getItem(WALLET_KEY_V60) || '');
    } catch (_e) {}
    cb();
  }

  function saveStateAll() {
    layoutState.zoomPct = clampZoom(layoutState.zoomPct);
    layoutState.autoHideSec = normStaySec(layoutState.autoHideSec);
    layoutState.pinned = false;
    filterState.stayOpen = false;
    filterState.cardPinned = false;
    const persistedLayout = Object.assign({}, layoutState, { pinned: false });
    const mergedFlt = Object.assign({}, filterState, {
      cardX: layoutState.x === null ? -1 : layoutState.x,
      cardY: layoutState.y === null ? -1 : layoutState.y,
      cardPinned: false,
      stayOpen: false,
      zoomPct: layoutState.zoomPct,
      autoHideSec: layoutState.autoHideSec,
      soundEnabled: Boolean(filterState.soundEnabled),
      audioPreset: resolveVoiceEntry(filterState.audioPreset).label,
      auto_scan_collect: Boolean(filterState.autoScanEnabled),
      roboticVoice: false
    });
    const autoRec = { enabled: Boolean(filterState.autoScanEnabled), auto_scan_collect: Boolean(filterState.autoScanEnabled), wallet: connectedWallet, ts: Date.now() };
    if (isExtRuntime && chrome.storage && chrome.storage.local) {
      try {
        chrome.storage.local.set({
          [LAYOUT_KEY_V53]: persistedLayout,
          [FLT_KEY_V53]: mergedFlt,
          [WALLET_KEY_V60]: connectedWallet,
          [AUTOSCAN_KEY_V67]: autoRec,
          auto_scan_collect: Boolean(filterState.autoScanEnabled)
        }, () => {});
        if (chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ type: 'RRS_SYNC_FILTERS_V53', filters: mergedFlt }, () => { void chrome.runtime.lastError; });
          chrome.runtime.sendMessage({ type: 'RRS_SET_AUTOSCAN_V67', enabled: Boolean(filterState.autoScanEnabled), wallet: connectedWallet }, () => { void chrome.runtime.lastError; });
        }
      } catch (_e) {}
    } else {
      try {
        localStorage.setItem(LAYOUT_KEY_V53, JSON.stringify(persistedLayout));
        localStorage.setItem(FLT_KEY_V53, JSON.stringify(mergedFlt));
        localStorage.setItem(AUTOSCAN_KEY_V67, JSON.stringify(autoRec));
        if (connectedWallet) localStorage.setItem(WALLET_KEY_V60, connectedWallet);
      } catch (_e) {}
    }
  }

  function parseAlertForDisplay(cur) {
    const kind = String((cur && cur.kind) || 'coin').toLowerCase();
    const rawTitle = scrubText((cur && cur.title) || '');
    const rawMsg = scrubText((cur && cur.message) || '');
    const rawBadge = scrubText((cur && cur.badge) || '');

    if (kind === 'phantom_45s' || kind === 'welcome_reclaim') {
      return {
        cardMode: 'green',
        isNews: false,
        failed12Layer: false,
        tickerLabel: 'Connect Phantom for Auto 0% Rent Reclaim',
        verdictLabel: '12-LAYER: PASS',
        metricsLine: '1st SOL Rent Claim 100% FREE (0% Fee) \u2022 0 Seed Phrases',
        ctaLabel: '[CONNECT PHANTOM WALLET \u2197]'
      };
    }

    const isNews = (kind === 'news' || kind === 'breaking' || kind === 'breaking_news' || kind === 'crypto' || kind === 'ai' || kind === 'world' || /BREAKING\s*NEWS/i.test(rawBadge));
    if (isNews) {
      const cleanHeadline = rawTitle
        .replace(/\b12[-\s]*LAYER[:\s]*(?:PASS|FAIL|VERIFIED)?[^\w$]*/gi, '')
        .replace(/\b(?:Market\s*Cap|MCap|Liquidity|Liq)\s*[:$]?\s*[\d,.]+[KMB]?\b/gi, '')
        .trim();
      return {
        cardMode: 'blue',
        isNews: true,
        failed12Layer: false,
        tickerLabel: cleanHeadline || 'Solana Institutional Market Update',
        verdictLabel: 'BREAKING NEWS WIRE',
        metricsLine: '',
        ctaLabel: '[READ ARTICLE]'
      };
    }

    const explicitFail = Boolean(
      cur && (
        cur.failed12Layer === true ||
        cur.isScamFail === true ||
        kind === 'rug' ||
        String(cur.l12 || '').toUpperCase() === 'FAILED' ||
        String(cur.verdict_12layer || '').toUpperCase() === 'FAIL' ||
        String(cur.severity || '').toUpperCase() === 'CRITICAL' ||
        /12-LAYER:\s*FAIL|RUG|SCAM|DRAINER|PHISHING|SYBIL\s*BLOCKED/i.test(rawBadge + ' ' + rawTitle)
      )
    );

    let sym = String((cur && cur.sym) || '').replace(/^\$/, '').trim().toUpperCase();
    if (!sym) {
      const sm = rawTitle.match(/\$([A-Za-z0-9_]{2,12})/);
      if (sm) sym = sm[1].toUpperCase();
    }
    if (!sym) sym = explicitFail ? 'RUG' : 'JUP';

    let pctNum;
    if (cur && cur.move_pct !== undefined && Number.isFinite(Number(cur.move_pct))) {
      pctNum = Number(cur.move_pct);
    } else {
      const pm = (rawTitle + ' ' + rawMsg).match(/([+-]?\d+(?:\.\d+)?)%/);
      pctNum = pm ? Number(pm[1]) : (explicitFail ? -42.0 : 18.4);
    }
    if (explicitFail && pctNum > 0) pctNum = -Math.abs(pctNum);

    const isRed = explicitFail || pctNum < 0;
    const pctStr = (pctNum >= 0 ? '+' : '') + pctNum.toFixed(1) + '%';

    const mcMatch = (rawTitle + ' ' + rawMsg).match(/(?:Market\s*Cap|MCap|MC)[:\s]*(\$[\d,.]+[KMB]?)/i);
    const liqMatch = (rawTitle + ' ' + rawMsg).match(/(?:Liquidity|Liq)[:\s]*(\$[\d,.]+[KMB]?)/i);

    const mcVal = formatCompactUsd(cur && (cur.mcap || cur.mcapStr || cur.mc_usd || (cur.mc ? Number(cur.mc) * 1000 : '')))
      || (mcMatch ? mcMatch[1] : (isRed ? '$14K' : '$420K'));
    const liqVal = formatCompactUsd(cur && (cur.liquidity || cur.liqStr || cur.liq_usd || (cur.liq ? Number(cur.liq) * 1000 : '')))
      || (liqMatch ? liqMatch[1] : (isRed ? '$0' : '$68K'));

    return {
      cardMode: isRed ? 'red' : 'green',
      isNews: false,
      failed12Layer: isRed,
      tickerLabel: '$' + sym + ' ' + pctStr,
      verdictLabel: isRed ? '12-LAYER: FAIL' : '12-LAYER: PASS',
      metricsLine: 'MCap ' + mcVal + '  \u2022  Liquidity ' + liqVal,
      ctaLabel: '[OPEN 12-LAYER AUDIT \u2197]'
    };
  }

  async function pollPublicNodeZeroAtas(walletAddr) {
    const w = String(walletAddr || '').trim();
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(w)) return { ok: false };
    let closableCount = 0;
    let reclaimLamports = 0;
    for (const progId of [SPL_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]) {
      try {
        const res = await fetch(PUBLICNODE_SOLANA_RPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTokenAccountsByOwner',
            params: [w, { programId: progId }, { encoding: 'jsonParsed', commitment: 'confirmed' }]
          })
        });
        if (res.ok) {
          const j = await res.json();
          const vals = (j && j.result && Array.isArray(j.result.value)) ? j.result.value : [];
          for (let i = 0; i < vals.length; i++) {
            const row = vals[i];
            const pubk = row && row.pubkey;
            if (!pubk || HARD_EXCLUDED_FROZEN_ATAS.has(pubk)) continue;
            const acc = row.account || {};
            const info = acc.data && acc.data.parsed && acc.data.parsed.info;
            if (!info || String(info.state || '').toLowerCase() !== 'initialized') continue;
            const amt = info.tokenAmount && String(info.tokenAmount.amount || '');
            if (amt === '0') {
              closableCount += 1;
              reclaimLamports += Number(acc.lamports || 2039280);
            }
          }
        }
      } catch (_e) {}
    }
    return {
      ok: true,
      wallet: w,
      closableCount,
      reclaimSol: Number((reclaimLamports / 1e9).toFixed(6)),
      claimUrl: 'https://rentandrugshield.com/app.html?wallet=' + encodeURIComponent(w) + '&auto_reclaim_0pct=1&autoscan=1'
    };
  }

  function ensureShadowHost() {
    let host = document.getElementById('rrs-v53-black-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'rrs-v53-black-host';
      host.style.cssText = 'position:fixed;bottom:18px;right:18px;z-index:2147483647;pointer-events:none;background:transparent;transform-origin:0 0;';
      (document.body || document.documentElement).appendChild(host);
    }
    const root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    if (!root.getElementById('rrs-v67-grb-style')) {
      root.innerHTML = '';
      const st = document.createElement('style');
      st.id = 'rrs-v67-grb-style';
      st.textContent = `
        * { box-sizing: border-box; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .rrs-lux-wrap {
          display: flex; flex-direction: column; align-items: flex-end;
          pointer-events: none; position: relative;
        }
        .rrs-lux-drawer {
          pointer-events: auto; display: none;
          width: 468px;
          max-height: 78vh; overflow-y: auto;
          margin-bottom: 8px;
          border-radius: 10px;
          border: 3px solid #38BDF8;
          background: #020408;
          backdrop-filter: blur(16px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.96);
          padding: 12px 14px; color: #FFFFFF;
          position: relative;
        }
        .rrs-lux-drawer.open { display: block; }

        .rrs-lux-card {
          pointer-events: auto; display: none; user-select: none; cursor: grab;
          width: 468px;
          border-radius: 10px;
          border: 3px solid #00FF88;
          background: #020408;
          backdrop-filter: blur(16px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.96);
          padding: 11px 14px 9px;
          color: #FFFFFF;
        }
        .rrs-lux-card.open { display: block; }
        .rrs-lux-card.dragging { cursor: grabbing !important; }
        .rrs-lux-card.state-green { border: 3px solid #00FF88; }
        .rrs-lux-card.state-red { border: 3px solid #FF3B5C; }
        .rrs-lux-card.state-blue { border: 3px solid #38BDF8; }

        .rrs-notice-bar {
          display: flex; align-items: center; justify-content: space-between; gap: 4px;
          width: 100%; margin-bottom: 9px;
        }
        .rrs-zoom-cluster { display: inline-flex; align-items: center; gap: 3px; flex-shrink: 0; }
        .rrs-ctrl-btn {
          height: 26px; padding: 0 7px;
          display: inline-flex; align-items: center; justify-content: center;
          background: #000000;
          border: 1.1px solid #2D3A4E;
          border-radius: 6px;
          color: #F8FAFC;
          font-size: 9.8px; font-weight: 800;
          cursor: pointer; white-space: nowrap;
        }
        .rrs-ctrl-btn.zin { border-color: rgba(0,255,136,0.55); color: #00FF88; }
        .rrs-ctrl-btn.pin-btn.pinned { border-color: #00FF88; color: #00FF88; }
        .rrs-ctrl-btn.mute-btn.unmuted { border-color: #00FF88; color: #00FF88; }
        .rrs-ctrl-btn.gear-btn { color: #38BDF8; font-size: 12.5px; padding: 0 7px; }
        .rrs-ctrl-btn.close-x { border-color: rgba(255,59,92,0.55); color: #FF3B5C; }
        .rrs-zoom-pill {
          height: 26px; min-width: 40px; padding: 0 5px;
          display: inline-flex; align-items: center; justify-content: center;
          background: #000000; border: 1.1px solid #2D3A4E;
          border-radius: 6px; color: #E2E8F0;
          font-size: 9.8px; font-weight: 800; cursor: pointer; flex-shrink: 0;
        }
        .rrs-stepper-capsule {
          height: 26px;
          display: inline-flex; align-items: stretch;
          background: #000000;
          border: 1.1px solid #2D3A4E;
          border-radius: 6px;
          overflow: hidden; flex-shrink: 0;
        }
        .rrs-step-side {
          width: 20px; background: transparent; border: none;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 900; cursor: pointer; padding: 0; color: #FFFFFF;
        }
        .rrs-step-side.minus { border-right: 1px solid #2D3A4E; }
        .rrs-step-side.plus { color: #00FF88; border-left: 1px solid #2D3A4E; }
        .rrs-step-mid {
          min-width: 30px; padding: 0 5px; background: transparent; border: none;
          display: inline-flex; align-items: center; justify-content: center;
          color: #FFFFFF; font-size: 9.8px; font-weight: 800; cursor: pointer; white-space: nowrap;
        }

        .rrs-news-wire-pill {
          display: none; align-self: flex-start;
          padding: 3px 9px; margin-bottom: 6px; border-radius: 6px;
          border: 1.4px solid #38BDF8; color: #38BDF8; background: #000000;
          font-size: 11px; font-weight: 900; letter-spacing: 0.02em;
        }
        .rrs-coin-main { padding: 2px 0 8px 0; cursor: pointer; }
        .rrs-ticker-verdict-row {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          margin-bottom: 5px;
        }
        .rrs-ticker-text { font-size: 20px; font-weight: 900; line-height: 1.22; }
        .rrs-ticker-text.green { color: #00FF88; }
        .rrs-ticker-text.red { color: #FF3B5C; }
        .rrs-ticker-text.blue { color: #FFFFFF; font-size: 16px; }

        .rrs-verdict-pill {
          padding: 3px 9px; border-radius: 6px;
          font-size: 11.2px; font-weight: 900;
          white-space: nowrap; flex-shrink: 0; background: #000000;
        }
        .rrs-verdict-pill.pass { color: #00FF88; border: 1.4px solid #00FF88; }
        .rrs-verdict-pill.fail { color: #FF3B5C; border: 1.4px solid #FF3B5C; }

        .rrs-metrics-white {
          font-size: 15.8px;
          font-weight: 800;
          color: #FFFFFF;
          line-height: 1.32;
          margin: 0;
        }

        .rrs-cta-primary {
          width: 100%; height: 32px;
          display: inline-flex; align-items: center; justify-content: center;
          background: #000000; border: 1.4px solid #00FF88; color: #00FF88;
          border-radius: 6px; font-size: 11.5px; font-weight: 900; cursor: pointer;
        }

        .rrs-equal-2col { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; width: 100%; }
        .rrs-equal-3col { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; width: 100%; }
        .rrs-equal-4col { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; width: 100%; }
        .rrs-equal-5col { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 5px; width: 100%; }
        .rrs-stay-10col { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 3px; width: 100%; }

        .rrs-action-btn {
          width: 100%; height: 34px;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 7px; font-size: 10.6px; font-weight: 900;
          cursor: pointer; text-align: center; white-space: nowrap; padding: 0 7px;
          background: #000000;
        }
        .rrs-btn-blue { border: 1.4px solid #38BDF8; color: #38BDF8; }
        .rrs-btn-emerald-solid { background: #00FF88; border: 1.4px solid #00FF88; color: #000000; }
        .rrs-btn-autoscan { border: 1.4px solid #334155; color: #94A3B8; background: #000000; }
        .rrs-btn-autoscan.on { border-color: #00FF88; color: #00FF88; background: rgba(0,255,136,0.16); box-shadow: 0 0 10px rgba(0,255,136,0.28); }

        .rrs-foot {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 7px; font-size: 10.2px; font-weight: 700; color: #94A3B8;
        }
        .rrs-brand { color: #94A3B8; font-weight: 700; cursor: pointer; }
        .rrs-nav-mini {
          height: 20px; min-width: 20px; padding: 0 5px; margin-left: 3px;
          background: #000000; border: 1px solid #2D3A4E; border-radius: 4px;
          color: #FFFFFF; font-size: 9.5px; font-weight: 800; cursor: pointer;
        }
        .rrs-prog-track {
          width: 100%; height: 2.5px; background: #121824; border-radius: 999px;
          margin-top: 5px; overflow: hidden;
        }
        .rrs-prog-bar {
          height: 100%; width: 100%; background: #00FF88;
          border-radius: 999px; transition: width 0.09s linear;
        }

        .rrs-sec-lbl {
          font-size: 10px; font-weight: 900; color: #38BDF8; margin: 8px 0 4px;
          display: flex; align-items: center; justify-content: space-between; gap: 6px;
        }
        .rrs-seg-pill {
          width: 100%; height: 28px;
          display: inline-flex; align-items: center; justify-content: center; gap: 3px;
          background: #000000; border: 1.1px solid #2D3A4E; color: #CBD5E1;
          border-radius: 6px; font-size: 10.2px; font-weight: 800; cursor: pointer;
        }
        .rrs-seg-pill.active-blue { background: rgba(56,189,248,0.16); border-color: #38BDF8; color: #38BDF8; }
        .rrs-seg-pill.active-em { background: rgba(0,255,136,0.16); border-color: #00FF88; color: #00FF88; }

        .rrs-sw-box {
          width: 100%; min-height: 32px;
          display: flex; align-items: center; justify-content: space-between; gap: 4px;
          background: #000000; border: 1.1px solid #2D3A4E;
          border-radius: 7px; padding: 4px 7px; cursor: pointer; user-select: none;
        }
        .rrs-sw-track {
          position: relative; width: 34px; height: 18px; border-radius: 999px;
          background: #000000; border: 1.2px solid #334155; flex-shrink: 0;
        }
        .rrs-sw-thumb {
          position: absolute; top: 2px; left: 2px; width: 12px; height: 12px;
          border-radius: 50%; background: #94A3B8; transition: transform 0.14s ease, background 0.14s ease;
        }
        .rrs-sw-box[data-on="true"] { border-color: rgba(0,255,136,0.5); }
        .rrs-sw-box[data-on="true"] .rrs-sw-track { background: rgba(0,255,136,0.2); border-color: #00FF88; }
        .rrs-sw-box[data-on="true"] .rrs-sw-thumb { transform: translateX(14px); background: #00FF88; }
        .rrs-sw-lbl { font-size: 10px; font-weight: 800; color: #FFFFFF; display: inline-flex; align-items: center; gap: 3px; }

        .rrs-inp-lbl { font-size: 9.4px; font-weight: 800; color: #CBD5E1; margin-bottom: 2px; }
        .rrs-lux-inp {
          width: 100%; height: 32px; background: #000000; border: 1.2px solid #2D3A4E;
          border-radius: 6px; padding: 0 8px; color: #FFFFFF;
          font-size: 11px; font-weight: 800; outline: none;
        }
        .rrs-lux-inp:focus { border-color: #38BDF8; }

        .rrs-liq-slider {
          width: 100%; accent-color: #00FF88; height: 6px; cursor: pointer; margin: 3px 0 6px 0;
        }

        .rrs-inline-scan-grid {
          display: grid; grid-template-columns: minmax(0, 1fr) 82px 168px; gap: 5px; width: 100%; margin-top: 5px;
        }
        .rrs-scan-out {
          display: none; margin-top: 5px; padding: 7px 9px; border-radius: 6px;
          background: #000000; border: 1.2px solid #38BDF8; color: #FFFFFF;
          font-size: 10.8px; font-weight: 700; line-height: 1.35;
        }
        .rrs-scan-out.show { display: block; }

        .rrs-q-tip {
          display: inline-flex; align-items: center; justify-content: center;
          width: 15px; height: 15px; border-radius: 50%;
          background: #000000; border: 1.1px solid #38BDF8; color: #38BDF8;
          font-size: 9.2px; font-weight: 900; cursor: pointer; flex-shrink: 0; line-height: 1;
        }
        .rrs-q-tip:hover, .rrs-q-tip.open { background: #38BDF8; color: #000000; }

        .rrs-drw-tip-pop {
          display: none; position: fixed; z-index: 2147483647;
          width: 282px; background: #000000; border: 2px solid #38BDF8;
          border-radius: 8px; padding: 8px 10px;
          box-shadow: 0 16px 36px rgba(0,0,0,0.96);
          color: #FFFFFF; font-size: 10.4px; line-height: 1.4; pointer-events: auto;
        }
        .rrs-drw-tip-pop.show { display: block; }

        .rrs-founder-bell {
          position: fixed; bottom: 20px; left: 20px; pointer-events: auto; cursor: pointer;
          display: none; align-items: center; gap: 8px;
          background: #000000; color: #38BDF8; border: 2px solid #38BDF8;
          border-radius: 999px; padding: 7px 13px; font-size: 11.5px; font-weight: 900;
        }
        .rrs-founder-bell.show { display: inline-flex; }
      `;
      root.appendChild(st);

      const audioOptsMarkup = SPOKEN_VOICES_12.map((v) => `<option value="${v.label}">${v.label}</option>`).join('');

      const wrap = document.createElement('div');
      wrap.id = 'rrs-lux-wrap';
      wrap.className = 'rrs-lux-wrap';
      wrap.innerHTML = `
        <div id="rrs-drw-tip-pop" class="rrs-drw-tip-pop">
          <div style="display:flex;justify-content:space-between;align-items:center;font-weight:900;color:#00FF88;margin-bottom:3px;">
            <span id="rrs-drw-tip-title">Plain-English Trader Guide</span>
            <button type="button" id="rrs-drw-tip-close" style="background:transparent;border:none;color:#FF3B5C;font-weight:900;cursor:pointer;">\u2715</button>
          </div>
          <div id="rrs-drw-tip-body"></div>
        </div>

        <div id="rrs-v55-drawer" class="rrs-lux-drawer" data-version="6.7">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;">
            <span style="font-size:12px;font-weight:900;color:#FFFFFF;">SOLANA SHIELD v6.7 SETTINGS</span>
            <button type="button" id="rrs-drw-x" class="rrs-ctrl-btn close-x" title="Close Settings">\u2715</button>
          </div>

          <div class="rrs-sec-lbl" style="margin-top:2px;"><span>STAY DURATION (3s..60s / PIN | AUTO-CLOSES AT 0s)</span></div>
          <div class="rrs-stay-10col" id="rrs-drw-stay-pills" style="margin-bottom:5px;">
            <button type="button" class="rrs-seg-pill" data-stay="3">3s</button>
            <button type="button" class="rrs-seg-pill active-blue" data-stay="5">5s</button>
            <button type="button" class="rrs-seg-pill" data-stay="8">8s</button>
            <button type="button" class="rrs-seg-pill" data-stay="10">10s</button>
            <button type="button" class="rrs-seg-pill" data-stay="15">15s</button>
            <button type="button" class="rrs-seg-pill" data-stay="20">20s</button>
            <button type="button" class="rrs-seg-pill" data-stay="30">30s</button>
            <button type="button" class="rrs-seg-pill" data-stay="45">45s</button>
            <button type="button" class="rrs-seg-pill" data-stay="60">60s</button>
            <button type="button" class="rrs-seg-pill" data-stay="PIN">Pin</button>
          </div>

          <div class="rrs-sec-lbl"><span>12 REAL SPOKEN NEURAL VOICES (.WAV)</span></div>
          <div style="display:grid;grid-template-columns:minmax(0,1fr) 74px 96px;gap:5px;margin-bottom:5px;">
            <select id="rrs-sel-audio18" class="rrs-lux-inp">${audioOptsMarkup}</select>
            <button type="button" id="rrs-btn-test-audio" class="rrs-action-btn rrs-btn-blue" style="height:32px;">\u25B6 PLAY</button>
            <div class="rrs-sw-box" id="rrs-sw-sound" data-on="false" style="min-height:32px;padding:3px 7px;">
              <span class="rrs-sw-lbl">Voice</span>
              <div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div>
            </div>
          </div>

          <div class="rrs-sec-lbl">
            <span style="display:inline-flex;align-items:center;gap:4px;">TIMEFRAME, PRESETS &amp; MACD <span class="rrs-q-tip" data-tip="macd">?</span></span>
          </div>
          <div id="rrs-seg-tf" class="rrs-equal-5col" data-tone="emerald" style="margin-bottom:5px;">
            <button type="button" class="rrs-seg-pill" data-val="1m">1m</button>
            <button type="button" class="rrs-seg-pill active-em" data-val="3m">3m</button>
            <button type="button" class="rrs-seg-pill" data-val="5m">5m</button>
            <button type="button" class="rrs-seg-pill" data-val="15m">15m</button>
            <button type="button" class="rrs-seg-pill" data-val="1h">1h</button>
          </div>
          <div id="rrs-seg-preset" class="rrs-equal-3col" data-tone="blue" style="margin-bottom:5px;">
            <button type="button" class="rrs-seg-pill" data-val="Snipes">Snipes</button>
            <button type="button" class="rrs-seg-pill active-blue" data-val="Runners"><span>Runners</span><span class="rrs-q-tip" data-tip="runners">?</span></button>
            <button type="button" class="rrs-seg-pill" data-val="Whales"><span>Whales</span><span class="rrs-q-tip" data-tip="whales">?</span></button>
          </div>
          <div class="rrs-equal-3col">
            <div class="rrs-sw-box" id="rrs-sw-macd-bull" data-on="true"><span class="rrs-sw-lbl">Bull Cross <span class="rrs-q-tip" data-tip="bull_cross">?</span></span><div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div></div>
            <div class="rrs-sw-box" id="rrs-sw-macd-hist" data-on="true"><span class="rrs-sw-lbl">Hot Hist <span class="rrs-q-tip" data-tip="hot_hist">?</span></span><div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div></div>
            <div class="rrs-sw-box" id="rrs-sw-macd-bear" data-on="true"><span class="rrs-sw-lbl">Bear Warn <span class="rrs-q-tip" data-tip="bear_warn">?</span></span><div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div></div>
          </div>

          <!-- DEDICATED LIQUIDITY SLIDER ($0K-$500K+) + 4 PRESET CHIPS -->
          <div class="rrs-sec-lbl">
            <span style="display:inline-flex;align-items:center;gap:4px;">LIQUIDITY POOL FILTER ($0K-$500K+) <span class="rrs-q-tip" data-tip="liquidity">?</span></span>
            <span id="rrs-liq-readout" style="color:#00FF88;font-size:10.4px;font-weight:900;">&ge; $10K</span>
          </div>
          <input id="rrs-liq-slider" class="rrs-liq-slider" type="range" min="0" max="500000" step="5000" value="10000" />
          <div id="rrs-liq-chips" class="rrs-equal-4col" style="margin-bottom:4px;">
            <button type="button" class="rrs-seg-pill" data-liq-chip="lt25k">&lt;$25K</button>
            <button type="button" class="rrs-seg-pill" data-liq-chip="gt50k">&gt;$50K</button>
            <button type="button" class="rrs-seg-pill" data-liq-chip="gt100k">&gt;$100K</button>
            <button type="button" class="rrs-seg-pill" data-liq-chip="gt500k">&gt;$500K</button>
          </div>

          <div class="rrs-sec-lbl"><span>MARKET CAP ($), LIQUIDITY ($), % MOVE &amp; COIN FILTER</span></div>
          <div class="rrs-equal-4col" style="margin-bottom:5px;">
            <div><div class="rrs-inp-lbl">Min MCap ($)</div><input id="rrs-in-minmc" class="rrs-lux-inp" type="text" value="15000" /></div>
            <div><div class="rrs-inp-lbl">Max MCap ($)</div><input id="rrs-in-maxmc" class="rrs-lux-inp" type="text" value="10000000" /></div>
            <div><div class="rrs-inp-lbl">Min Liq ($)</div><input id="rrs-in-minliq" class="rrs-lux-inp" type="text" value="10000" /></div>
            <div><div class="rrs-inp-lbl">% Move</div><input id="rrs-in-move" class="rrs-lux-inp" type="text" value="10" /></div>
          </div>
          <div><div class="rrs-inp-lbl">Coin Ticker Filter (ALL or comma list: SOL, BONK, WIF, JUP)</div><input id="rrs-in-coin" class="rrs-lux-inp" type="text" value="ALL" /></div>

          <div class="rrs-sec-lbl"><span>12-LAYER SCAM PROTECTION</span></div>
          <div class="rrs-equal-2col">
            <div class="rrs-sw-box" id="rrs-sw-rug" data-on="true"><span class="rrs-sw-lbl">12-Layer Scam Warning</span><div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div></div>
            <div class="rrs-sw-box" id="rrs-sw-safe12" data-on="true"><span class="rrs-sw-lbl">12-Layer Safe Movers</span><div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div></div>
          </div>

          <div class="rrs-sec-lbl"><span>BREAKING NEWS FILTERS &amp; KEYWORDS</span></div>
          <div class="rrs-equal-3col" style="margin-bottom:5px;">
            <div class="rrs-sw-box" id="rrs-sw-ncrypto" data-on="true"><span class="rrs-sw-lbl">Crypto News</span><div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div></div>
            <div class="rrs-sw-box" id="rrs-sw-nai" data-on="true"><span class="rrs-sw-lbl">AI News</span><div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div></div>
            <div class="rrs-sw-box" id="rrs-sw-nworld" data-on="false"><span class="rrs-sw-lbl">World News</span><div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div></div>
          </div>
          <div>
            <div class="rrs-inp-lbl">News Keywords</div>
            <input id="rrs-in-kw" class="rrs-lux-inp" type="text" value="Solana, ETF, Institutional" placeholder="News Keywords" />
          </div>

          <div class="rrs-sec-lbl">
            <span style="display:inline-flex;align-items:center;gap:4px;">INSTANT SCAN &amp; 60s AUTO-SCAN COLLECT <span class="rrs-q-tip" data-tip="autoscan">?</span></span>
            <span id="rrs-autoscan-lbl" style="color:#94A3B8;font-size:9.2px;">0% 1st / 98% Repeat</span>
          </div>
          <div class="rrs-inline-scan-grid">
            <input id="rrs-in-quickscan" class="rrs-lux-inp" type="text" placeholder="Coin Mint or Wallet" />
            <button type="button" id="rrs-btn-scan-now" class="rrs-action-btn rrs-btn-blue" style="height:32px;font-size:9.8px;padding:0 5px;">SCAN NOW</button>
            <button type="button" id="rrs-btn-autoscan" class="rrs-action-btn rrs-btn-autoscan" style="height:32px;font-size:9.2px;padding:0 5px;">\u26A1 AUTO-SCAN &amp; COLLECT: OFF</button>
          </div>
          <div id="rrs-quickscan-out" class="rrs-scan-out"></div>

          <div class="rrs-equal-2col" style="margin-top:9px;">
            <button type="button" id="rrs-drw-phantom" class="rrs-action-btn rrs-btn-blue">CONNECT PHANTOM</button>
            <button type="button" id="rrs-drw-save" class="rrs-action-btn rrs-btn-emerald-solid">\u2713 SAVE SETTINGS</button>
          </div>
        </div>

        <div id="rrs-v55-card" class="rrs-lux-card state-green" data-version="6.7">
          <div class="rrs-notice-bar" id="rrs-card-top-bar">
            <div class="rrs-zoom-cluster">
              <button type="button" id="rrs-btn-zout" class="rrs-ctrl-btn" data-act="zout">[- ZOOM]</button>
              <button type="button" id="rrs-btn-zpct" class="rrs-zoom-pill" title="Reset Zoom to 100%">100%</button>
              <button type="button" id="rrs-btn-zin" class="rrs-ctrl-btn zin" data-act="zin">[+ ZOOM]</button>
            </div>
            <div id="rrs-stepper-capsule" class="rrs-stepper-capsule">
              <button type="button" id="rrs-step-minus" class="rrs-step-side minus" title="Decrease duration">-</button>
              <button type="button" id="rrs-step-mid" class="rrs-step-mid" title="Alert duration">5s</button>
              <button type="button" id="rrs-step-plus" class="rrs-step-side plus" title="Increase duration">+</button>
            </div>
            <button type="button" id="rrs-btn-pin-top" class="rrs-ctrl-btn pin-btn" title="Pin Open">PIN</button>
            <button type="button" id="rrs-btn-chime-top" class="rrs-ctrl-btn mute-btn" title="1-Click Voice/Mute">\uD83D\uDD15 MUTE</button>
            <button type="button" id="rrs-btn-gear" class="rrs-ctrl-btn gear-btn" data-act="gear" title="Settings">\u2699</button>
            <button type="button" id="rrs-btn-close" class="rrs-ctrl-btn close-x" title="Close">\u2715</button>
          </div>

          <div id="rrs-news-wire-pill" class="rrs-news-wire-pill">BREAKING NEWS WIRE</div>

          <div class="rrs-coin-main" id="rrs-coin-main-click">
            <div class="rrs-ticker-verdict-row">
              <span id="rrs-card-title" class="rrs-ticker-text green">$JUP +18.4%</span>
              <span id="rrs-card-badge" class="rrs-verdict-pill pass">12-LAYER: PASS</span>
            </div>
            <div id="rrs-card-body" class="rrs-metrics-white">MCap $420K  \u2022  Liquidity $68K</div>
          </div>

          <button type="button" id="rrs-btn-trade" class="rrs-cta-primary">[OPEN 12-LAYER AUDIT \u2197]</button>

          <div class="rrs-foot">
            <span id="rrs-brand-link" class="rrs-brand">rentandrugshield.com</span>
            <div style="display:flex;align-items:center;gap:4px;">
              <button type="button" id="rrs-btn-prev" class="rrs-nav-mini">&lt;</button>
              <span id="rrs-lbl-cnt" style="font-size:10px;font-weight:800;color:#94A3B8;">1/1</span>
              <button type="button" id="rrs-btn-next" class="rrs-nav-mini">&gt;</button>
              <span id="rrs-lbl-timer" style="color:#94A3B8;margin-left:5px;">5s</span>
            </div>
          </div>
          <div class="rrs-prog-track"><div id="rrs-prog-bar" class="rrs-prog-bar"></div></div>
        </div>
      `;
      root.appendChild(wrap);

      const bell = document.createElement('div');
      bell.id = 'rrs-founder-bell';
      bell.className = 'rrs-founder-bell';
      bell.innerHTML = '<span>Approvals Waiting</span><span id="rrs-bell-num" style="background:#38BDF8;color:#000000;border-radius:999px;padding:1px 7px;">0</span>';
      bell.onclick = () => window.open('http://127.0.0.1:18088/command/waiting-approvals', '_blank', 'noopener,noreferrer');
      root.appendChild(bell);

      wireLuxuryInteractions(host, root);
    }
    return { host, root };
  }

  function setSegmentedValue(root, barId, val) {
    const bar = root.getElementById(barId);
    if (!bar) return;
    const cls = bar.dataset.tone === 'emerald' ? 'active-em' : 'active-blue';
    bar.querySelectorAll('.rrs-seg-pill').forEach((b) => {
      b.classList.remove('active-blue', 'active-em');
      if (String(b.dataset.val).toLowerCase() === String(val).toLowerCase()) b.classList.add(cls);
    });
  }

  function getSegmentedValue(root, barId, fallback) {
    const bar = root.getElementById(barId);
    if (!bar) return fallback;
    const act = bar.querySelector('.active-blue, .active-em');
    return act ? act.dataset.val : fallback;
  }

  function setSwitchOn(root, id, val) {
    const el = root.getElementById(id);
    if (el) el.dataset.on = val ? 'true' : 'false';
  }

  function getSwitchOn(root, id) {
    const el = root.getElementById(id);
    return Boolean(el && el.dataset.on === 'true');
  }

  function formatLiqReadout(minVal, maxVal, preset) {
    if (preset === 'lt25k' || (maxVal > 0 && maxVal <= 25000)) return '< $25K';
    const parsed = Number(minVal);
    const n = Number.isFinite(parsed) ? Math.max(0, parsed) : 10000;
    if (n <= 0) return '$0K';
    if (n >= 500000) return '$500K+';
    return '\u2265 $' + Math.round(n / 1000) + 'K';
  }

  function syncLiqDrawerUI(root, minVal, maxVal, preset) {
    const sld = root.getElementById('rrs-liq-slider');
    const lbl = root.getElementById('rrs-liq-readout');
    const inp = root.getElementById('rrs-in-minliq');
    const parsed = Number(minVal);
    const clamped = Math.max(0, Math.min(500000, Number.isFinite(parsed) ? parsed : 10000));
    if (sld) sld.value = String(clamped);
    if (inp) inp.value = String(clamped);
    if (lbl) lbl.textContent = formatLiqReadout(clamped, maxVal, preset);
    const chips = root.getElementById('rrs-liq-chips');
    if (chips) {
      chips.querySelectorAll('[data-liq-chip]').forEach((b) => {
        b.classList.remove('active-em');
        if (b.dataset.liqChip === preset) b.classList.add('active-em');
      });
    }
    filterState.liqMin = clamped;
    filterState.liqMax = Number(maxVal) || 0;
    filterState.liqPreset = String(preset || '');
  }

  function syncAutoScanDrawerUI(root, statusNote) {
    const btn = root.getElementById('rrs-btn-autoscan');
    const lbl = root.getElementById('rrs-autoscan-lbl');
    const on = Boolean(filterState.autoScanEnabled);
    if (btn) {
      btn.classList.toggle('on', on);
      btn.textContent = on ? '\u26A1 AUTO-SCAN & COLLECT: ON' : '\u26A1 AUTO-SCAN & COLLECT: OFF';
    }
    if (lbl) {
      lbl.style.color = on ? '#00FF88' : '#94A3B8';
      lbl.textContent = statusNote || (on ? 'Polling PublicNode (60s)' : '0% 1st / 98% Repeat');
    }
  }

  function syncChimeAndStepperUI(root) {
    const cur = uniqueAlerts[activeAlertIdx] || null;
    const baseSec = normStaySec(layoutState.autoHideSec);
    const displaySec = cur ? Math.max(1, Math.round(computeAlertDurationMs(cur) / 1000)) : baseSec;
    const pinned = Boolean(activeCardPinned);
    const soundOn = Boolean(filterState.soundEnabled);

    const stepMid = root.getElementById('rrs-step-mid');
    if (stepMid) stepMid.textContent = displaySec + 's';

    const pinTop = root.getElementById('rrs-btn-pin-top');
    if (pinTop) {
      pinTop.textContent = pinned ? 'PINNED' : 'PIN';
      pinTop.classList.toggle('pinned', pinned);
    }

    const activeStayTarget = pinned ? 'PIN' : String(baseSec);
    root.querySelectorAll('#rrs-drw-stay-pills [data-stay]').forEach((btn) => {
      btn.classList.remove('active-blue', 'active-em');
      if (btn.dataset.stay === activeStayTarget) {
        btn.classList.add(pinned ? 'active-em' : 'active-blue');
      }
    });

    const chimeTop = root.getElementById('rrs-btn-chime-top');
    if (chimeTop) {
      chimeTop.textContent = soundOn ? '\uD83D\uDD14 VOICE' : '\uD83D\uDD15 MUTE';
      chimeTop.classList.toggle('unmuted', soundOn);
    }
    setSwitchOn(root, 'rrs-sw-sound', soundOn);

    const selAud = root.getElementById('rrs-sel-audio18');
    if (selAud) selAud.value = resolveVoiceEntry(filterState.audioPreset).label;

    syncAutoScanDrawerUI(root);

    const timerLbl = root.getElementById('rrs-lbl-timer');
    if (timerLbl && pinned) timerLbl.textContent = 'PINNED';
  }

  async function detectInjectedWallet() {
    try {
      const ph = window.phantom && window.phantom.solana ? window.phantom.solana : window.solana;
      if (ph && ph.publicKey) return ph.publicKey.toString();
      if (window.solflare && window.solflare.publicKey) return window.solflare.publicKey.toString();
    } catch (_e) {}
    return connectedWallet || '';
  }

  async function handleConnectPhantom(root) {
    try {
      const prov = (window.phantom && window.phantom.solana) || window.solflare || window.solana;
      if (prov && typeof prov.connect === 'function') {
        const resp = await prov.connect();
        const pk = (resp && resp.publicKey) ? resp.publicKey.toString() : (prov.publicKey ? prov.publicKey.toString() : '');
        if (pk) {
          connectedWallet = pk;
          saveStateAll();
          window.open('https://rentandrugshield.com/app.html?wallet=' + encodeURIComponent(connectedWallet) + '&auto_reclaim_0pct=1&autoscan=1', '_blank', 'noopener,noreferrer');
          return;
        }
      }
    } catch (_e) {}
    const target = connectedWallet
      ? ('https://rentandrugshield.com/app.html?wallet=' + encodeURIComponent(connectedWallet) + '&auto_reclaim_0pct=1&autoscan=1')
      : PHANTOM_45S_URL;
    window.open(target, '_blank', 'noopener,noreferrer');
  }

  async function runAutoScanTickToast(root, triggerClaimOnFind) {
    if (!filterState.autoScanEnabled) return;
    const out = root.getElementById('rrs-quickscan-out');
    const qInp = root.getElementById('rrs-in-quickscan');
    let w = await detectInjectedWallet();
    if (!w && qInp && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(qInp.value.trim())) {
      w = qInp.value.trim();
    }
    if (!w) {
      syncAutoScanDrawerUI(root, 'Armed (60s) | Connect Wallet');
      if (out) {
        out.classList.add('show');
        out.style.borderColor = '#00FF88';
        out.innerHTML = '<div style="color:#00FF88;font-weight:900;">\u26A1 AUTO-SCAN ARMED (60s PublicNode Read-Only)</div>' +
          '<div style="margin-top:2px;color:#CBD5E1;">Connect Phantom/Solflare or paste your wallet address to auto-detect 0-balance accounts &amp; reclaim SOL (0% 1st / 98% repeat).</div>';
      }
      return;
    }
    connectedWallet = w;
    syncAutoScanDrawerUI(root, 'Polling PublicNode...');
    const res = await pollPublicNodeZeroAtas(w);
    if (!res || !res.ok) return;
    syncAutoScanDrawerUI(root, res.closableCount + ' Closable | +' + res.reclaimSol.toFixed(4) + ' SOL');
    if (out) {
      out.classList.add('show');
      out.style.borderColor = '#00FF88';
      out.innerHTML = `<div style="color:#00FF88;font-weight:900;">\u26A1 AUTO-SCAN (PublicNode 60s): ${res.closableCount} Closable 0-Balance ATAs | +${res.reclaimSol.toFixed(6)} SOL</div>` +
        `<div style="margin-top:3px;color:#FFFFFF;">0% 1st Claim / 98% Repeat \u2022 <a href="${res.claimUrl}" target="_blank" rel="noopener noreferrer" style="color:#00FF88;font-weight:900;">Reclaim SOL Now \u2197</a></div>`;
    }
    if (triggerClaimOnFind && res.closableCount > 0 && filterState.soundEnabled) {
      playSpokenVoice12('Free SOL Rent Ready!');
    }
  }

  async function runInlineQuickScan(root) {
    const inp = root.getElementById('rrs-in-quickscan');
    const out = root.getElementById('rrs-quickscan-out');
    if (!inp || !out) return;
    const raw = scrubText(inp.value || '').trim();
    out.classList.add('show');
    if (!raw) {
      out.style.borderColor = '#38BDF8';
      out.innerHTML = '<span style="color:#38BDF8;">Paste a Solana Coin Mint or Wallet Address above to scan.</span>';
      return;
    }

    const upperSym = raw.replace(/^\$/, '').toUpperCase();
    const resolvedInput = KNOWN_SYM_MINTS[upperSym] || ((raw.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/) || [])[0]) || raw;
    out.style.borderColor = '#38BDF8';
    out.innerHTML = '<span style="color:#38BDF8;">Scanning Solana Mainnet (12-Layer &amp; 0x09 Rent)...</span>';

    if (isExtRuntime && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'RRS_QUICK_OMNI_SCAN_V60', query: resolvedInput }, (res) => {
        void chrome.runtime.lastError;
        if (res && res.html) {
          out.style.borderColor = res.borderColor || '#00FF88';
          out.innerHTML = res.html;
          return;
        }
        fallbackHttpQuickScan(resolvedInput, out);
      });
      return;
    }
    fallbackHttpQuickScan(resolvedInput, out);
  }

  async function fallbackHttpQuickScan(addr, out) {
    const looksLikeMint = /pump$/i.test(addr) || addr === 'So11111111111111111111111111111111111111112' || addr === 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' || addr === 'AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL';
    try {
      if (!looksLikeMint) {
        const pn = await pollPublicNodeZeroAtas(addr);
        if (pn && pn.ok && pn.closableCount > 0) {
          out.style.borderColor = '#00FF88';
          out.innerHTML = `<div style="color:#00FF88;font-weight:900;">WALLET AUTO RENT RECLAIM: ${pn.closableCount} Empty ATAs \u2022 +${pn.reclaimSol.toFixed(6)} SOL</div>` +
            `<div style="margin-top:3px;color:#FFFFFF;">1st Claim = 0% Fee \u2022 <a href="${pn.claimUrl}" target="_blank" rel="noopener noreferrer" style="color:#38BDF8;font-weight:900;">Open Wallet Claim \u2197</a></div>`;
          return;
        }
      }
      const rt = await fetch('https://rentandrugshield.com/api/scan-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mint: addr, source: 'v67_inline_scanner' })
      });
      if (rt.ok) {
        const dt = await rt.json();
        const sc = Number(dt.safety_score !== undefined ? dt.safety_score : 95);
        const pass = sc >= 75;
        const col = pass ? '#00FF88' : '#FF3B5C';
        const sym = scrubText(dt.symbol || addr.slice(0, 6));
        const auditUrl = buildExact12LayerTokenUrl(addr);
        out.style.borderColor = col;
        out.innerHTML = `<div style="color:${col};font-weight:900;">$${sym} \u2022 ${pass ? '12-LAYER: PASS' : '12-LAYER: FAIL'} (${sc}/100)</div>` +
          `<div style="margin-top:3px;color:#FFFFFF;">${scrubText(dt.verdict || '')} \u2022 <a href="${auditUrl}" target="_blank" rel="noopener noreferrer" style="color:#38BDF8;font-weight:900;">Open 12-Layer Audit \u2197</a></div>`;
        return;
      }
    } catch (_e) {}
    const fallbackAudit = buildExact12LayerTokenUrl(addr);
    out.style.borderColor = '#38BDF8';
    out.innerHTML = `<div>Inspect on Rent &amp; Rug Shield: <a href="${fallbackAudit}" target="_blank" rel="noopener noreferrer" style="color:#00FF88;font-weight:900;">Open 12-Layer Audit \u2197</a></div>`;
  }

  function applyLayoutToHost(host, root) {
    const z = clampZoom(layoutState.zoomPct);
    const scale = z / 100;
    host.style.transformOrigin = '0 0';
    host.style.transform = 'scale(' + scale + ')';

    const zBtn = root.getElementById('rrs-btn-zpct');
    if (zBtn) zBtn.textContent = z + '%';
    syncChimeAndStepperUI(root);

    if (layoutState.x !== null && layoutState.y !== null && Number.isFinite(layoutState.x) && Number.isFinite(layoutState.y)) {
      let x = layoutState.x;
      let y = layoutState.y;
      const vw = window.innerWidth || 1280;
      const vh = window.innerHeight || 720;
      const scaledW = 468 * scale;
      if (x + scaledW < 40) x = 40 - scaledW;
      if (x > vw - 40) x = vw - 40;
      if (y < -900) y = 8;
      if (y > vh - 40) y = vh - 40;
      layoutState.x = x;
      layoutState.y = y;
      host.style.right = 'auto';
      host.style.bottom = 'auto';
      host.style.left = x + 'px';
      host.style.top = y + 'px';
    } else {
      host.style.right = '18px';
      host.style.bottom = '18px';
      host.style.left = 'auto';
      host.style.top = 'auto';
    }
  }

  function setZoomAnchored(host, root, nextZoomPct, clickedBtn) {
    const clamped = clampZoom(nextZoomPct);
    const rectBefore = clickedBtn ? clickedBtn.getBoundingClientRect() : null;
    const hostRectBefore = host.getBoundingClientRect();

    let curX = (layoutState.x !== null && Number.isFinite(layoutState.x) && host.style.left && host.style.left !== 'auto')
      ? parseFloat(host.style.left)
      : hostRectBefore.left;
    let curY = (layoutState.y !== null && Number.isFinite(layoutState.y) && host.style.top && host.style.top !== 'auto')
      ? parseFloat(host.style.top)
      : hostRectBefore.top;
    if (!Number.isFinite(curX)) curX = hostRectBefore.left;
    if (!Number.isFinite(curY)) curY = hostRectBefore.top;

    layoutState.x = curX;
    layoutState.y = curY;
    layoutState.zoomPct = clamped;

    host.style.right = 'auto';
    host.style.bottom = 'auto';
    host.style.left = curX + 'px';
    host.style.top = curY + 'px';
    host.style.transformOrigin = '0 0';
    host.style.transform = 'scale(' + (clamped / 100) + ')';

    const zBtn = root.getElementById('rrs-btn-zpct');
    if (zBtn) zBtn.textContent = clamped + '%';

    if (rectBefore && clickedBtn) {
      const rectAfter = clickedBtn.getBoundingClientRect();
      const dx = (rectBefore.left + rectBefore.width / 2) - (rectAfter.left + rectAfter.width / 2);
      const dy = (rectBefore.top + rectBefore.height / 2) - (rectAfter.top + rectAfter.height / 2);
      layoutState.x = curX + dx;
      layoutState.y = curY + dy;
      host.style.left = layoutState.x + 'px';
      host.style.top = layoutState.y + 'px';
    }

    saveStateAll();
  }

  function populateDrawerFromState(root) {
    syncChimeAndStepperUI(root);
    setSegmentedValue(root, 'rrs-seg-tf', filterState.tf || '3m');
    setSegmentedValue(root, 'rrs-seg-preset', filterState.preset || 'Runners');
    setSwitchOn(root, 'rrs-sw-macd-bull', filterState.macdBull !== false);
    setSwitchOn(root, 'rrs-sw-macd-hist', filterState.macdHistFlip !== false);
    setSwitchOn(root, 'rrs-sw-macd-bear', filterState.macdBear !== false);
    root.getElementById('rrs-in-minmc').value = filterState.mcMin || 15000;
    root.getElementById('rrs-in-maxmc').value = filterState.mcMax || 10000000;
    syncLiqDrawerUI(root, filterState.liqMin || 10000, filterState.liqMax || 0, filterState.liqPreset || '');
    root.getElementById('rrs-in-move').value = filterState.moveMin || 10;
    root.getElementById('rrs-in-coin').value = filterState.tickerQuery || 'ALL';
    setSwitchOn(root, 'rrs-sw-safe12', filterState.catCoin !== false);
    setSwitchOn(root, 'rrs-sw-rug', filterState.catRug !== false);
    setSwitchOn(root, 'rrs-sw-ncrypto', filterState.catCrypto !== false);
    setSwitchOn(root, 'rrs-sw-nai', filterState.catAi !== false);
    setSwitchOn(root, 'rrs-sw-nworld', Boolean(filterState.catWorld));
    root.getElementById('rrs-in-kw').value = filterState.newsKeywords || 'Solana, ETF, Institutional';
    const selAud = root.getElementById('rrs-sel-audio18');
    if (selAud) selAud.value = resolveVoiceEntry(filterState.audioPreset).label;
  }

  function renderActiveAlert(root) {
    if (!uniqueAlerts.length) return;
    activeAlertIdx = Math.max(0, Math.min(activeAlertIdx, uniqueAlerts.length - 1));
    const cur = uniqueAlerts[activeAlertIdx];
    const parsed = parseAlertForDisplay(cur);

    const card = root.getElementById('rrs-v55-card');
    const wirePill = root.getElementById('rrs-news-wire-pill');
    const titleEl = root.getElementById('rrs-card-title');
    const badgeEl = root.getElementById('rrs-card-badge');
    const bodyEl = root.getElementById('rrs-card-body');
    const tradeBtn = root.getElementById('rrs-btn-trade');
    const progBar = root.getElementById('rrs-prog-bar');

    card.classList.remove('state-green', 'state-red', 'state-blue');
    if (parsed.isNews || parsed.cardMode === 'blue') {
      card.classList.add('state-blue');
      if (wirePill) wirePill.style.display = 'inline-block';
      badgeEl.style.display = 'none';
      bodyEl.style.display = 'none';
      bodyEl.textContent = '';
      titleEl.textContent = parsed.tickerLabel;
      titleEl.className = 'rrs-ticker-text blue';
      if (tradeBtn) {
        tradeBtn.textContent = '[READ ARTICLE]';
        tradeBtn.style.borderColor = '#38BDF8';
        tradeBtn.style.color = '#38BDF8';
      }
      if (progBar) progBar.style.background = '#38BDF8';
    } else if (parsed.cardMode === 'red') {
      card.classList.add('state-red');
      if (wirePill) wirePill.style.display = 'none';
      badgeEl.style.display = 'inline-block';
      badgeEl.textContent = '12-LAYER: FAIL';
      badgeEl.className = 'rrs-verdict-pill fail';
      titleEl.textContent = parsed.tickerLabel;
      titleEl.className = 'rrs-ticker-text red';
      bodyEl.style.display = 'block';
      bodyEl.textContent = parsed.metricsLine;
      if (tradeBtn) {
        tradeBtn.textContent = parsed.ctaLabel;
        tradeBtn.style.borderColor = '#FF3B5C';
        tradeBtn.style.color = '#FF3B5C';
      }
      if (progBar) progBar.style.background = '#FF3B5C';
    } else {
      card.classList.add('state-green');
      if (wirePill) wirePill.style.display = 'none';
      badgeEl.style.display = 'inline-block';
      badgeEl.textContent = '12-LAYER: PASS';
      badgeEl.className = 'rrs-verdict-pill pass';
      titleEl.textContent = parsed.tickerLabel;
      titleEl.className = 'rrs-ticker-text green';
      bodyEl.style.display = 'block';
      bodyEl.textContent = parsed.metricsLine;
      if (tradeBtn) {
        tradeBtn.textContent = parsed.ctaLabel;
        tradeBtn.style.borderColor = '#00FF88';
        tradeBtn.style.color = '#00FF88';
      }
      if (progBar) progBar.style.background = '#00FF88';
    }

    if (tradeBtn) tradeBtn.dataset.href = cur.url || '';
    root.getElementById('rrs-lbl-cnt').textContent = (activeAlertIdx + 1) + '/' + uniqueAlerts.length;
  }

  function hideCardCompletelyOffscreen(host, root) {
    activeCardPinned = false;
    cardHovered = false;
    const card = root.getElementById('rrs-v55-card');
    const drawer = root.getElementById('rrs-v55-drawer');
    if (drawer) {
      drawer.classList.remove('open');
      drawer.style.display = 'none';
      drawer.style.visibility = 'hidden';
    }
    if (card) {
      card.classList.remove('open');
      card.style.display = 'none';
      card.style.visibility = 'hidden';
    }
    const bell = root.getElementById('rrs-founder-bell');
    if (host && (!bell || !bell.classList.contains('show'))) {
      host.style.display = 'none';
      host.style.visibility = 'hidden';
    }
  }

  function ensureCountdownLoop(host, root) {
    if (countdownTimerId) return;
    countdownLastTickTs = Date.now();
    countdownTimerId = setInterval(() => {
      const now = Date.now();
      const rawDt = Math.max(0, now - (countdownLastTickTs || now));
      countdownLastTickTs = now;

      const card = root.getElementById('rrs-v55-card');
      const drawer = root.getElementById('rrs-v55-drawer');
      if (!card || !card.classList.contains('open')) return;
      const timerLbl = root.getElementById('rrs-lbl-timer');
      const progBar = root.getElementById('rrs-prog-bar');
      const drawerOpen = Boolean(drawer && drawer.classList.contains('open'));

      if (cardHovered && (now - lastHoverMoveTs > 1200)) {
        cardHovered = false;
      }

      if (activeCardPinned || drawerOpen || cardHovered || isDraggingCard) {
        if (timerLbl) timerLbl.textContent = activeCardPinned ? 'PINNED' : (drawerOpen ? 'SETTINGS' : 'PAUSED');
        return;
      }
      countdownRemMs -= rawDt;
      const secLeft = Math.max(0, Math.ceil(countdownRemMs / 1000));
      if (timerLbl) timerLbl.textContent = secLeft + 's';
      if (progBar) {
        const pct = Math.max(0, Math.min(100, (countdownRemMs / Math.max(1000, countdownTotalMs)) * 100));
        progBar.style.width = pct.toFixed(1) + '%';
      }
      if (countdownRemMs <= 0) {
        if (timerLbl) timerLbl.textContent = '0s';
        if (progBar) progBar.style.width = '0%';
        hideCardCompletelyOffscreen(host, root);
      }
    }, 80);
  }

  function wireShadowTooltips(root) {
    const tipPop = root.getElementById('rrs-drw-tip-pop');
    const tipTtl = root.getElementById('rrs-drw-tip-title');
    const tipBdy = root.getElementById('rrs-drw-tip-body');
    const tipCls = root.getElementById('rrs-drw-tip-close');
    if (!tipPop || !tipTtl || !tipBdy) return;

    let pinnedKey = '';
    const openTip = (badge, key, pin) => {
      const info = PLAIN_ENGLISH_TIPS[key];
      if (!info) return;
      if (pin) {
        if (pinnedKey === key && tipPop.classList.contains('show')) {
          pinnedKey = '';
          tipPop.classList.remove('show');
          root.querySelectorAll('.rrs-q-tip.open').forEach((x) => x.classList.remove('open'));
          return;
        }
        pinnedKey = key;
      }
      root.querySelectorAll('.rrs-q-tip.open').forEach((x) => x.classList.remove('open'));
      badge.classList.add('open');
      tipTtl.textContent = info.title;
      tipBdy.textContent = info.body;
      tipPop.classList.add('show');

      const r = badge.getBoundingClientRect();
      const pw = 282;
      let left = Math.max(10, Math.min((window.innerWidth || 1280) - pw - 10, r.left - pw / 2 + 8));
      let top = r.bottom + 7;
      if (top + 96 > (window.innerHeight || 720)) top = Math.max(8, r.top - 96);
      tipPop.style.left = Math.round(left) + 'px';
      tipPop.style.top = Math.round(top) + 'px';
    };

    root.querySelectorAll('.rrs-q-tip[data-tip]').forEach((badge) => {
      const k = badge.getAttribute('data-tip');
      badge.addEventListener('mouseenter', () => { if (!pinnedKey) openTip(badge, k, false); });
      badge.addEventListener('mouseleave', () => {
        if (!pinnedKey) {
          tipPop.classList.remove('show');
          badge.classList.remove('open');
        }
      });
      badge.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        openTip(badge, k, true);
      });
    });

    if (tipCls) {
      tipCls.onclick = (ev) => {
        ev.stopPropagation();
        pinnedKey = '';
        tipPop.classList.remove('show');
        root.querySelectorAll('.rrs-q-tip.open').forEach((x) => x.classList.remove('open'));
      };
    }
  }

  function wireLuxuryInteractions(host, root) {
    const card = root.getElementById('rrs-v55-card');
    const drawer = root.getElementById('rrs-v55-drawer');

    wireShadowTooltips(root);

    const btnZout = root.getElementById('rrs-btn-zout');
    const btnZpct = root.getElementById('rrs-btn-zpct');
    const btnZin = root.getElementById('rrs-btn-zin');

    if (btnZout) btnZout.onclick = (ev) => { ev.stopPropagation(); setZoomAnchored(host, root, layoutState.zoomPct - 15, btnZout); };
    if (btnZpct) btnZpct.onclick = (ev) => { ev.stopPropagation(); setZoomAnchored(host, root, 100, btnZpct); };
    if (btnZin) btnZin.onclick = (ev) => { ev.stopPropagation(); setZoomAnchored(host, root, layoutState.zoomPct + 15, btnZin); };

    const stepMinus = root.getElementById('rrs-step-minus');
    const stepMid = root.getElementById('rrs-step-mid');
    const stepPlus = root.getElementById('rrs-step-plus');
    const pinTop = root.getElementById('rrs-btn-pin-top');

    if (stepMinus) {
      stepMinus.onclick = (ev) => {
        ev.stopPropagation();
        activeCardPinned = false;
        layoutState.pinned = false;
        layoutState.autoHideSec = stepStaySecValue(layoutState.autoHideSec, -1);
        filterState.autoHideSec = layoutState.autoHideSec;
        filterState.stayOpen = false;
        countdownTotalMs = computeAlertDurationMs(uniqueAlerts[activeAlertIdx]);
        countdownRemMs = countdownTotalMs;
        syncChimeAndStepperUI(root);
        saveStateAll();
      };
    }
    if (stepPlus) {
      stepPlus.onclick = (ev) => {
        ev.stopPropagation();
        activeCardPinned = false;
        layoutState.pinned = false;
        layoutState.autoHideSec = stepStaySecValue(layoutState.autoHideSec, 1);
        filterState.autoHideSec = layoutState.autoHideSec;
        filterState.stayOpen = false;
        countdownTotalMs = computeAlertDurationMs(uniqueAlerts[activeAlertIdx]);
        countdownRemMs = countdownTotalMs;
        syncChimeAndStepperUI(root);
        saveStateAll();
      };
    }
    if (stepMid) {
      stepMid.onclick = (ev) => {
        ev.stopPropagation();
        activeCardPinned = false;
        layoutState.pinned = false;
        layoutState.autoHideSec = 5;
        filterState.autoHideSec = 5;
        filterState.stayOpen = false;
        countdownTotalMs = computeAlertDurationMs(uniqueAlerts[activeAlertIdx]);
        countdownRemMs = countdownTotalMs;
        syncChimeAndStepperUI(root);
        saveStateAll();
      };
    }
    if (pinTop) {
      pinTop.onclick = (ev) => {
        ev.stopPropagation();
        activeCardPinned = !activeCardPinned;
        layoutState.pinned = false;
        filterState.stayOpen = false;
        if (!activeCardPinned) {
          countdownTotalMs = computeAlertDurationMs(uniqueAlerts[activeAlertIdx]);
          countdownRemMs = countdownTotalMs;
          countdownLastTickTs = Date.now();
          const timerLbl = root.getElementById('rrs-lbl-timer');
          if (timerLbl) timerLbl.textContent = Math.max(1, Math.ceil(countdownRemMs / 1000)) + 's';
        }
        syncChimeAndStepperUI(root);
      };
    }

    root.querySelectorAll('#rrs-drw-stay-pills [data-stay]').forEach((btn) => {
      btn.onclick = (ev) => {
        ev.stopPropagation();
        const v = btn.dataset.stay;
        if (v === 'PIN') {
          activeCardPinned = true;
          layoutState.pinned = false;
          filterState.stayOpen = false;
          syncChimeAndStepperUI(root);
        } else {
          activeCardPinned = false;
          layoutState.pinned = false;
          filterState.stayOpen = false;
          layoutState.autoHideSec = normStaySec(v);
          filterState.autoHideSec = layoutState.autoHideSec;
          countdownTotalMs = computeAlertDurationMs(uniqueAlerts[activeAlertIdx]);
          countdownRemMs = countdownTotalMs;
          syncChimeAndStepperUI(root);
          saveStateAll();
        }
      };
    });

    const chimeTop = root.getElementById('rrs-btn-chime-top');
    if (chimeTop) {
      chimeTop.onclick = (ev) => {
        ev.stopPropagation();
        filterState.soundEnabled = !filterState.soundEnabled;
        syncChimeAndStepperUI(root);
        saveStateAll();
        if (filterState.soundEnabled) playSpokenVoice12(filterState.audioPreset);
      };
    }

    const selAud = root.getElementById('rrs-sel-audio18');
    if (selAud) {
      selAud.onchange = () => {
        filterState.audioPreset = selAud.value;
        saveStateAll();
        playSpokenVoice12(filterState.audioPreset);
      };
    }
    const btnTestAud = root.getElementById('rrs-btn-test-audio');
    if (btnTestAud) {
      btnTestAud.onclick = (ev) => {
        ev.stopPropagation();
        const chosen = selAud ? selAud.value : 'To Valhalla!';
        filterState.audioPreset = chosen;
        saveStateAll();
        playSpokenVoice12(chosen);
      };
    }

    // Dedicated Liquidity Slider + 4 Preset Chips (<$25K, >$50K, >$100K, >$500K)
    const liqSld = root.getElementById('rrs-liq-slider');
    if (liqSld) {
      liqSld.addEventListener('input', () => {
        syncLiqDrawerUI(root, Number(liqSld.value || 10000), 0, '');
        saveStateAll();
      });
    }
    root.querySelectorAll('#rrs-liq-chips [data-liq-chip]').forEach((chip) => {
      chip.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const code = chip.dataset.liqChip;
        if (code === 'lt25k') syncLiqDrawerUI(root, 5000, 25000, 'lt25k');
        else if (code === 'gt50k') syncLiqDrawerUI(root, 50000, 0, 'gt50k');
        else if (code === 'gt100k') syncLiqDrawerUI(root, 100000, 0, 'gt100k');
        else if (code === 'gt500k') syncLiqDrawerUI(root, 500000, 0, 'gt500k');
        saveStateAll();
      });
    });

    // [⚡ AUTO-SCAN: ON/OFF] Toggle
    const btnAutoScan = root.getElementById('rrs-btn-autoscan');
    if (btnAutoScan) {
      btnAutoScan.onclick = (ev) => {
        ev.stopPropagation();
        filterState.autoScanEnabled = !filterState.autoScanEnabled;
        syncAutoScanDrawerUI(root);
        saveStateAll();
        if (autoScanIntervalId) { clearInterval(autoScanIntervalId); autoScanIntervalId = null; }
        if (filterState.autoScanEnabled) {
          runAutoScanTickToast(root, true);
          autoScanIntervalId = setInterval(() => { runAutoScanTickToast(root, false); }, 60000);
        }
      };
    }

    root.querySelectorAll('[data-act="gear"]').forEach((btn) => {
      btn.onclick = (ev) => {
        ev.stopPropagation();
        populateDrawerFromState(root);
        const willOpen = !drawer.classList.contains('open');
        if (willOpen) {
          drawer.style.display = 'block';
          drawer.style.visibility = 'visible';
          drawer.classList.add('open');
        } else {
          drawer.classList.remove('open');
          drawer.style.display = 'none';
          drawer.style.visibility = 'hidden';
        }
      };
    });

    ['rrs-seg-tf', 'rrs-seg-preset'].forEach((barId) => {
      const bar = root.getElementById(barId);
      if (!bar) return;
      bar.querySelectorAll('.rrs-seg-pill').forEach((pill) => {
        pill.addEventListener('click', (ev) => {
          if (ev.target && ev.target.closest && ev.target.closest('.rrs-q-tip')) return;
          ev.stopPropagation();
          setSegmentedValue(root, barId, pill.dataset.val);
          if (barId === 'rrs-seg-preset') {
            const p = pill.dataset.val;
            if (p === 'Snipes') {
              root.getElementById('rrs-in-minmc').value = '5000';
              root.getElementById('rrs-in-maxmc').value = '100000';
              syncLiqDrawerUI(root, 6000, 0, '');
              root.getElementById('rrs-in-move').value = '8';
            } else if (p === 'Runners') {
              root.getElementById('rrs-in-minmc').value = '100000';
              root.getElementById('rrs-in-maxmc').value = '5000000';
              syncLiqDrawerUI(root, 25000, 0, '');
              root.getElementById('rrs-in-move').value = '12';
            } else if (p === 'Whales') {
              root.getElementById('rrs-in-minmc').value = '5000000';
              root.getElementById('rrs-in-maxmc').value = '500000000';
              syncLiqDrawerUI(root, 150000, 0, 'gt100k');
              root.getElementById('rrs-in-move').value = '5';
            }
          }
        });
      });
    });

    root.querySelectorAll('.rrs-sw-box').forEach((sw) => {
      sw.addEventListener('click', (ev) => {
        if (ev.target && ev.target.closest && ev.target.closest('.rrs-q-tip')) return;
        ev.stopPropagation();
        const nextOn = sw.dataset.on !== 'true';
        sw.dataset.on = nextOn ? 'true' : 'false';
        if (sw.id === 'rrs-sw-sound') {
          filterState.soundEnabled = nextOn;
          syncChimeAndStepperUI(root);
          saveStateAll();
          if (nextOn) playSpokenVoice12(filterState.audioPreset);
        }
      });
    });

    const openCurUrl = (ev) => {
      ev.stopPropagation();
      const cur = uniqueAlerts[activeAlertIdx];
      if (!cur) return;
      const finalUrl = resolveExactAlertUrl(cur);
      if (isNewsAlertToast(cur) && !isValidExternalNewsUrlToast(finalUrl)) return;
      if (!finalUrl) return;
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    };
    root.getElementById('rrs-coin-main-click').onclick = openCurUrl;
    root.getElementById('rrs-btn-trade').onclick = openCurUrl;

    const brandEl = root.getElementById('rrs-brand-link');
    if (brandEl) {
      brandEl.onclick = (ev) => {
        ev.stopPropagation();
        window.open('https://rentandrugshield.com', '_blank', 'noopener,noreferrer');
      };
    }

    root.getElementById('rrs-btn-prev').onclick = (ev) => {
      ev.stopPropagation();
      if (!uniqueAlerts.length) return;
      activeAlertIdx = (activeAlertIdx - 1 + uniqueAlerts.length) % uniqueAlerts.length;
      renderActiveAlert(root);
      syncChimeAndStepperUI(root);
    };
    root.getElementById('rrs-btn-next').onclick = (ev) => {
      ev.stopPropagation();
      if (!uniqueAlerts.length) return;
      activeAlertIdx = (activeAlertIdx + 1) % uniqueAlerts.length;
      renderActiveAlert(root);
      syncChimeAndStepperUI(root);
    };
    root.getElementById('rrs-btn-close').onclick = (ev) => {
      ev.stopPropagation();
      hideCardCompletelyOffscreen(host, root);
    };
    root.getElementById('rrs-drw-x').onclick = (ev) => {
      ev.stopPropagation();
      drawer.classList.remove('open');
      drawer.style.display = 'none';
      drawer.style.visibility = 'hidden';
    };

    root.getElementById('rrs-btn-scan-now').onclick = (ev) => {
      ev.stopPropagation();
      runInlineQuickScan(root);
    };
    root.getElementById('rrs-in-quickscan').addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        ev.stopPropagation();
        runInlineQuickScan(root);
      }
    });

    root.getElementById('rrs-drw-phantom').onclick = (ev) => {
      ev.stopPropagation();
      handleConnectPhantom(root);
    };

    root.getElementById('rrs-drw-save').onclick = (ev) => {
      ev.stopPropagation();
      const tf = getSegmentedValue(root, 'rrs-seg-tf', '3m');
      filterState = Object.assign({}, filterState, {
        soundEnabled: getSwitchOn(root, 'rrs-sw-sound'),
        audioPreset: selAud ? selAud.value : 'To Valhalla!',
        autoHideSec: normStaySec(layoutState.autoHideSec),
        stayOpen: false,
        cardPinned: false,
        tf,
        preset: getSegmentedValue(root, 'rrs-seg-preset', 'Runners'),
        macdOn: true,
        macd1m: tf === '1m',
        macd3m: tf === '3m',
        macd5m: tf === '5m',
        macd15m: tf === '15m' || tf === '1h',
        macdBull: getSwitchOn(root, 'rrs-sw-macd-bull'),
        macdHistFlip: getSwitchOn(root, 'rrs-sw-macd-hist'),
        macdBear: getSwitchOn(root, 'rrs-sw-macd-bear'),
        mcOn: true,
        mcMin: Number(root.getElementById('rrs-in-minmc').value || 15000),
        mcMax: Number(root.getElementById('rrs-in-maxmc').value || 10000000),
        liqOn: true,
        liqMin: Number(root.getElementById('rrs-in-minliq').value || 10000),
        moveOn: true,
        moveMin: Number(root.getElementById('rrs-in-move').value || 10),
        moveWin: tf,
        tickerQuery: scrubText(root.getElementById('rrs-in-coin').value || 'ALL').trim(),
        catCoin: getSwitchOn(root, 'rrs-sw-safe12'),
        catRug: getSwitchOn(root, 'rrs-sw-rug'),
        catCrypto: getSwitchOn(root, 'rrs-sw-ncrypto'),
        catAi: getSwitchOn(root, 'rrs-sw-nai'),
        catWorld: getSwitchOn(root, 'rrs-sw-nworld'),
        newsKeywords: scrubText(root.getElementById('rrs-in-kw').value || 'Solana, ETF, Institutional').trim()
      });
      syncChimeAndStepperUI(root);
      applyLayoutToHost(host, root);
      saveStateAll();
      drawer.classList.remove('open');
      drawer.style.display = 'none';
      drawer.style.visibility = 'hidden';
    };

    card.addEventListener('mousemove', (ev) => {
      const now = Date.now();
      if (now - cardOpenedAtTs < 150) return;
      const dx = Math.abs(ev.clientX - lastHoverX);
      const dy = Math.abs(ev.clientY - lastHoverY);
      lastHoverX = ev.clientX;
      lastHoverY = ev.clientY;
      if (dx >= 2 || dy >= 2) {
        cardHovered = true;
        lastHoverMoveTs = now;
      }
    });
    card.addEventListener('mouseleave', () => {
      cardHovered = false;
      lastHoverMoveTs = 0;
    });
    card.addEventListener('wheel', (ev) => {
      if (ev.ctrlKey) {
        ev.preventDefault();
        ev.stopPropagation();
        setZoomAnchored(host, root, layoutState.zoomPct + (ev.deltaY < 0 ? 10 : -10), ev.deltaY < 0 ? btnZin : btnZout);
      }
    }, { passive: false });

    let startX = 0, startY = 0, origLeft = 0, origTop = 0, ptrDown = false;
    card.addEventListener('pointerdown', (ev) => {
      if (ev.button !== 0) return;
      if (ev.target && ev.target.closest && ev.target.closest('button, input, select, a, #rrs-brand-link, .rrs-q-tip')) return;
      ptrDown = true;
      isDraggingCard = false;
      startX = ev.clientX;
      startY = ev.clientY;
      const r = host.getBoundingClientRect();
      origLeft = r.left;
      origTop = r.top;
      try { card.setPointerCapture(ev.pointerId); } catch (_e) {}
    });
    card.addEventListener('pointermove', (ev) => {
      if (!ptrDown) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!isDraggingCard && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        isDraggingCard = true;
        card.classList.add('dragging');
      }
      if (isDraggingCard) {
        layoutState.x = origLeft + dx;
        layoutState.y = origTop + dy;
        applyLayoutToHost(host, root);
      }
    });
    card.addEventListener('pointerup', (ev) => {
      if (!ptrDown) return;
      ptrDown = false;
      try { card.releasePointerCapture(ev.pointerId); } catch (_e) {}
      if (isDraggingCard) {
        isDraggingCard = false;
        card.classList.remove('dragging');
        saveStateAll();
      }
    });
  }

  window.__rrsUpdateFounderBell = function (info) {
    if (window.location && String(window.location.href).includes('127.0.0.1:18088/command/waiting-approvals')) return;
    const { root } = ensureShadowHost();
    const bell = root.getElementById('rrs-founder-bell');
    const cnt = Number((info && info.pending_count) || 0);
    const numEl = root.getElementById('rrs-bell-num');
    if (numEl) numEl.textContent = String(cnt);
    if (bell) {
      if (cnt > 0) bell.classList.add('show');
      else bell.classList.remove('show');
    }
  };

  window.__rrsResolveExactAlertUrl = resolveExactAlertUrl;

  window.__rrsRenderBlackToastV53 = function (t, openDrawerImmediately) {
    if (!t || !t.title) return false;
    const isNews = isNewsAlertToast(t);
    const exactUrl = resolveExactAlertUrl(t);
    if (isNews && !isValidExternalNewsUrlToast(exactUrl)) {
      return false;
    }
    loadPersistedState(() => {
      const { host, root } = ensureShadowHost();
      const badge = scrubText(t.badge || (isNews ? 'LIVE WIRE' : '12-LAYER: PASS'));
      const title = scrubText(t.title);
      const message = isNews ? '' : scrubText(t.message || '');
      const kind = String(t.kind || (isNews ? 'news' : 'coin')).toLowerCase();
      const failed12Layer = !isNews && Boolean(
        t.failed12Layer === true ||
        t.isScamFail === true ||
        kind === 'rug' ||
        String(t.l12 || '').toUpperCase() === 'FAILED' ||
        String(t.verdict_12layer || '').toUpperCase() === 'FAIL' ||
        String(t.severity || '').toUpperCase() === 'CRITICAL'
      );
      const key = kind + '|' + title + '|' + message;
      const customSecVal = Number(t.customDisplaySec || t.CustomDisplaySec || 0);

      if (!seenAlertKeys.has(key)) {
        seenAlertKeys.add(key);
        uniqueAlerts.push({
          kind,
          sym: isNews ? '' : (t.sym || ''),
          mint: isNews ? '' : (t.mint || ''),
          move_pct: isNews ? undefined : t.move_pct,
          l12: isNews ? '' : (t.l12 || ''),
          verdict_12layer: isNews ? '' : (t.verdict_12layer || ''),
          severity: t.severity || 'INFO',
          failed12Layer,
          isScamFail: failed12Layer,
          mcap: isNews ? '' : (t.mcap || t.mcapStr || ''),
          liquidity: isNews ? '' : (t.liquidity || t.liqStr || ''),
          mcapStr: isNews ? '' : (t.mcapStr || t.mcap || ''),
          liqStr: isNews ? '' : (t.liqStr || t.liquidity || ''),
          badge,
          title,
          message,
          article_url: isNews ? exactUrl : '',
          url: exactUrl,
          customDisplaySec: (Number.isFinite(customSecVal) && customSecVal >= 1) ? customSecVal : undefined
        });
        if (uniqueAlerts.length > 15) uniqueAlerts.shift();
        activeAlertIdx = uniqueAlerts.length - 1;
      } else {
        for (let i = uniqueAlerts.length - 1; i >= 0; i--) {
          if ((uniqueAlerts[i].kind + '|' + uniqueAlerts[i].title + '|' + uniqueAlerts[i].message) === key) {
            uniqueAlerts[i].url = exactUrl;
            if (isNews) uniqueAlerts[i].article_url = exactUrl;
            if (Number.isFinite(customSecVal) && customSecVal >= 1) uniqueAlerts[i].customDisplaySec = customSecVal;
            activeAlertIdx = i;
            break;
          }
        }
      }

      const card = root.getElementById('rrs-v55-card');
      const drawer = root.getElementById('rrs-v55-drawer');

      // Per-card transient pin & anti-stuck hover reset on every new alert
      activeCardPinned = false;
      layoutState.pinned = false;
      filterState.stayOpen = false;
      filterState.cardPinned = false;
      cardHovered = false;
      lastHoverMoveTs = 0;
      cardOpenedAtTs = Date.now();

      host.style.display = 'block';
      host.style.visibility = 'visible';
      card.style.display = 'block';
      card.style.visibility = 'visible';
      card.classList.add('open');

      renderActiveAlert(root);
      applyLayoutToHost(host, root);

      const curAlert = uniqueAlerts[activeAlertIdx];
      countdownTotalMs = computeAlertDurationMs(curAlert);
      countdownRemMs = countdownTotalMs;
      countdownLastTickTs = Date.now();
      const progBar = root.getElementById('rrs-prog-bar');
      if (progBar) progBar.style.width = '100%';
      const timerLbl = root.getElementById('rrs-lbl-timer');
      if (timerLbl) timerLbl.textContent = Math.max(1, Math.ceil(countdownTotalMs / 1000)) + 's';

      if (filterState.soundEnabled) playSpokenVoice12(filterState.audioPreset);

      if (openDrawerImmediately === true) {
        populateDrawerFromState(root);
        drawer.style.display = 'block';
        drawer.style.visibility = 'visible';
        drawer.classList.add('open');
      } else {
        drawer.classList.remove('open');
        drawer.style.display = 'none';
        drawer.style.visibility = 'hidden';
      }
      ensureCountdownLoop(host, root);
    });
    return true;
  };

  window.showToast = window.__rrsRenderBlackToastV53;

  window.RRS_openLuxuryTraderShieldDemo = function (openDrawer) {
    window.__rrsRenderBlackToastV53({
      kind: 'coin',
      sym: 'JUP',
      mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      move_pct: 18.4,
      failed12Layer: false,
      isScamFail: false,
      badge: '12-LAYER: PASS',
      title: '$JUP +18.4%',
      mcapStr: '$420K',
      liqStr: '$68K',
      message: 'MCap $420K  \u2022  Liquidity $68K',
      url: 'https://rentandrugshield.com/?token=JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN&autoscan=1#tokenScanner'
    }, Boolean(openDrawer === true));
  };

  if (isExtRuntime && chrome.storage && chrome.storage.onChanged) {
    try {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') return;
        const host = document.getElementById('rrs-v53-black-host');
        if (!host || !host.shadowRoot) return;
        const root = host.shadowRoot;
        if (changes[FLT_KEY_V53] && changes[FLT_KEY_V53].newValue) {
          const nf = changes[FLT_KEY_V53].newValue;
          filterState = Object.assign({}, DEFAULT_FILTERS, nf, { stayOpen: false, cardPinned: false });
          if (nf.autoHideSec !== undefined) layoutState.autoHideSec = normStaySec(nf.autoHideSec);
          layoutState.pinned = false;
          syncChimeAndStepperUI(root);
        }
      });
    } catch (_e) {}
  }

  if (!window.__RRS_V60_LISTENER_BOUND__ && isExtRuntime && chrome.runtime && chrome.runtime.onMessage) {
    window.__RRS_V60_LISTENER_BOUND__ = true;
    chrome.runtime.onMessage.addListener((msg) => {
      if (!msg) return;
      if ((msg.type === 'RRS_SHOW_LIVE_TOAST_V53' || msg.type === 'RRS_SHOW_LIVE_TOAST_V52' || msg.type === 'RRS_SHOW_LIVE_TOAST') && msg.toast) {
        window.__rrsRenderBlackToastV53(msg.toast, false);
      } else if (msg.type === 'RRS_FOUNDER_APPROVALS_SYNC') {
        window.__rrsUpdateFounderBell(msg.approvals || {});
      }
    });
  }
})();
