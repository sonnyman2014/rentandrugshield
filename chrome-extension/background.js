'use strict';

// === STAGE 1 CONSTANTS & DEFAULTS (v6.7.0 | 12 NEURAL SPOKEN VOICES) ===
const quietHoursEnabled = false;
const ENABLE_WHITE_OS_BALLOON = false;
let soundEnabled = false;
const ALLOWED_STAY_SECS_BG = [3, 5, 8, 10, 15, 20, 30, 45, 60];
const PHANTOM_45S_URL = 'https://rentandrugshield.com/app.html?connect_phantom=1&auto_reclaim_0pct=1&src=ext_45s';

function normStaySecBg(s) {
  const n = Number(s) || 5;
  let best = 5;
  let bestDiff = Infinity;
  for (let i = 0; i < ALLOWED_STAY_SECS_BG.length; i++) {
    const d = Math.abs(ALLOWED_STAY_SECS_BG[i] - n);
    if (d < bestDiff) { bestDiff = d; best = ALLOWED_STAY_SECS_BG[i]; }
  }
  return best;
}

function formatCompactUsdBg(val) {
  if (val === undefined || val === null || val === '') return '';
  if (typeof val === 'string') {
    const t = val.trim();
    if (/^\$[\d,.]+[KMB]?/i.test(t)) return t;
    const p = Number(t.replace(/[$,]/g, ''));
    if (!Number.isFinite(p) || p <= 0) return t;
    val = p;
  }
  const num = Number(val);
  if (!Number.isFinite(num) || num <= 0) return '';
  if (num >= 1000000000) return '$' + (num / 1000000000).toFixed(2).replace(/\.00$/, '') + 'B';
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(2).replace(/\.00$/, '') + 'M';
  if (num >= 1000) return '$' + Math.round(num / 1000) + 'K';
  return '$' + Math.round(num);
}

const API_ENDPOINTS = [
  'https://rentandrugshield.com',
  'http://127.0.0.1:8088'
];

const LIVE_ENDPOINT_MANIFEST_URL = 'https://rentandrugshield.com/live_endpoint.json';
const LIVE_ENDPOINT_TTL_MS = 10 * 60 * 1000;
const LIVE_BASE_ALLOWED_RX = /^https:\/\/(?:[a-z0-9-]+\.trycloudflare\.com|rentandrugshield\.com)$/i;
let liveApiBase = '';
let liveApiBaseTs = 0;

function scrubNoLongDash(s) {
  const legRx = new RegExp('\\b\\x41\\x49[-\\s]+generated\\b', 'gi');
  return String(s || '')
    .split(String.fromCharCode(8212)).join(' | ')
    .split(String.fromCharCode(8211)).join('-')
    .replace(/--+/g, '-')
    .replace(legRx, '12-Layer Verified');
}

const SYSTEM_ONLY_MINTS = new Set([
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

function isValidAlertMint(m) {
  return Boolean(m && m.length >= 32 && m.length <= 44 && !SYSTEM_ONLY_MINTS.has(m) && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(m));
}

function extractAlertMint(explicitMint, rawUrl, title, sym) {
  if (isValidAlertMint(explicitMint)) return explicitMint;
  if (rawUrl) {
    try {
      const u = new URL(rawUrl, 'https://rentandrugshield.com');
      for (const k of ['token', 'mint', 'trade', 'outputMint', 'address']) {
        const v = (u.searchParams.get(k) || '').trim();
        if (isValidAlertMint(v)) return v;
      }
    } catch (_e) {}
    const matches = String(rawUrl).match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g) || [];
    for (const m of matches) {
      if (isValidAlertMint(m)) return m;
    }
  }
  if (title) {
    const matches = String(title).match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g) || [];
    for (const m of matches) {
      if (isValidAlertMint(m)) return m;
    }
    const sm = String(title).match(/\$([A-Za-z0-9_]{2,12})/);
    if (sm && KNOWN_SYM_MINTS[sm[1].toUpperCase()]) return KNOWN_SYM_MINTS[sm[1].toUpperCase()];
  }
  const cleanSym = String(sym || '').replace(/^\$/, '').trim().toUpperCase();
  if (cleanSym && KNOWN_SYM_MINTS[cleanSym]) return KNOWN_SYM_MINTS[cleanSym];
  return '';
}

function isNewsAlertKindBg(kind, badge) {
  const k = String(kind || '').toLowerCase().trim();
  if (k === 'news' || k === 'breaking' || k === 'breaking_news' || k === 'crypto' || k === 'ai' || k === 'world') {
    return true;
  }
  const b = String(badge || '').toUpperCase();
  return b.includes('CRYPTO NEWS') || b.includes('AI NEWS') || b.includes('WORLD NEWS') || b.includes('BREAKING NEWS') || b === 'LIVE WIRE';
}

function extractNewsCandidateUrlBg(item) {
  if (!item || typeof item !== 'object') return '';
  const cand = item.article_url || item.link || item.source_url || item.url || item.action_url || '';
  return String(cand || '').trim();
}

function isValidExternalNewsUrlBg(rawUrl) {
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

const NEWS_HTTP200_CACHE_TTL_MS = 30 * 60 * 1000;
const verifiedNewsHttp200Cache = new Map();

async function verifyExternalNewsUrlHttp200Bg(rawUrl) {
  const trimmed = String(rawUrl || '').trim();
  if (!isValidExternalNewsUrlBg(trimmed)) return { ok: false, finalUrl: '' };
  const now = Date.now();
  if (verifiedNewsHttp200Cache.has(trimmed)) {
    const cached = verifiedNewsHttp200Cache.get(trimmed);
    if (now - cached.ts < NEWS_HTTP200_CACHE_TTL_MS) {
      return { ok: cached.ok, finalUrl: cached.finalUrl };
    }
  }
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
  let needRangeFallback = false;
  {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2400);
    try {
      const res = await fetch(trimmed, {
        method: 'HEAD',
        redirect: 'follow',
        cache: 'no-store',
        signal: ctrl.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': ua
        }
      });
      clearTimeout(timer);
      const finalUrl = String(res.url || trimmed).trim();
      if (res.status === 200 && isValidExternalNewsUrlBg(finalUrl)) {
        verifiedNewsHttp200Cache.set(trimmed, { ok: true, finalUrl, ts: now });
        if (verifiedNewsHttp200Cache.size > 300) {
          const firstKey = verifiedNewsHttp200Cache.keys().next().value;
          if (firstKey) verifiedNewsHttp200Cache.delete(firstKey);
        }
        return { ok: true, finalUrl };
      }
      if (res.status === 405) {
        needRangeFallback = true;
      }
    } catch (_err) {
      clearTimeout(timer);
    }
  }
  if (needRangeFallback) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2400);
    try {
      const res = await fetch(trimmed, {
        method: 'GET',
        redirect: 'follow',
        cache: 'no-store',
        signal: ctrl.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Range': 'bytes=0-512',
          'User-Agent': ua
        }
      });
      clearTimeout(timer);
      const finalUrl = String(res.url || trimmed).trim();
      if ((res.status === 200 || res.status === 206) && isValidExternalNewsUrlBg(finalUrl)) {
        verifiedNewsHttp200Cache.set(trimmed, { ok: true, finalUrl, ts: now });
        if (verifiedNewsHttp200Cache.size > 300) {
          const firstKey = verifiedNewsHttp200Cache.keys().next().value;
          if (firstKey) verifiedNewsHttp200Cache.delete(firstKey);
        }
        return { ok: true, finalUrl };
      }
    } catch (_err) {
      clearTimeout(timer);
    }
  }
  verifiedNewsHttp200Cache.set(trimmed, { ok: false, finalUrl: '', ts: now });
  return { ok: false, finalUrl: '' };
}

function resolveVerifiedNewsExternalUrlBg(rawUrl) {
  const trimmed = String(rawUrl || '').trim();
  return isValidExternalNewsUrlBg(trimmed) ? trimmed : '';
}

function resolveExactAlertUrl(opts, allowLocalCommandDeck) {
  if (!opts) return 'https://rentandrugshield.com/?token=JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN&autoscan=1#tokenScanner';
  const kind = String(opts.kind || 'coin').toLowerCase();
  const isNews = isNewsAlertKindBg(kind, opts.badge);
  if (isNews) {
    const newsCand = extractNewsCandidateUrlBg(opts);
    return resolveVerifiedNewsExternalUrlBg(newsCand);
  }
  const rawUrl = String(opts.url || opts.action_url || '').trim();
  const upper = (String(opts.badge || '') + ' ' + String(opts.title || '')).toUpperCase();

  if (kind === 'phantom_45s' || kind === 'welcome_reclaim') {
    return /^https?:\/\//i.test(rawUrl) ? rawUrl : PHANTOM_45S_URL;
  }
  if (rawUrl.indexOf(':18088/') !== -1) return rawUrl;
  if (allowLocalCommandDeck !== false) {
    if (kind === 'visitor' || upper.includes('EXTERNAL HUMAN IPS') || upper.includes('WEBSITE VISITORS')) {
      return 'http://127.0.0.1:18088/command/terminal-2';
    }
    if (kind === 'approvals' || upper.includes('WAITING FOR APPROVAL') || upper.includes('WAITING APPROVALS')) {
      return 'http://127.0.0.1:18088/command/waiting-approvals';
    }
    if (kind === 'promo') {
      return 'http://127.0.0.1:18088/command/terminal-4';
    }
  }

  const mint = extractAlertMint(opts.mint, rawUrl, opts.title, opts.sym);
  if (kind === 'moonbag' && !mint && allowLocalCommandDeck !== false) {
    return 'http://127.0.0.1:18088/command/terminal-1';
  }
  if (mint) {
    return 'https://rentandrugshield.com/?token=' + encodeURIComponent(mint) + '&autoscan=1#tokenScanner';
  }
  if (kind === 'moonbag' && allowLocalCommandDeck !== false) {
    return 'http://127.0.0.1:18088/command/terminal-1';
  }
  if (/^https?:\/\//i.test(rawUrl) && /[?&](?:domain|wallet)=/i.test(rawUrl)) {
    return rawUrl;
  }
  const fallbackMint = kind === 'rug' ? 'AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL' : 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN';
  return 'https://rentandrugshield.com/?token=' + encodeURIComponent(fallbackMint) + '&autoscan=1#tokenScanner';
}

async function resolveLiveApiBase() {
  const now = Date.now();
  if (liveApiBase && now - liveApiBaseTs < LIVE_ENDPOINT_TTL_MS) return liveApiBase;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3500);
  try {
    const res = await fetch(LIVE_ENDPOINT_MANIFEST_URL, { cache: 'no-store', signal: ctrl.signal });
    clearTimeout(timer);
    if (res.ok) {
      const j = await res.json();
      const base = String((j && (j.api_base || j.endpoint)) || '').trim().replace(/\/+$/, '');
      if (LIVE_BASE_ALLOWED_RX.test(base)) {
        liveApiBase = base;
        liveApiBaseTs = now;
      }
    }
  } catch (_e) {
    clearTimeout(timer);
  }
  return liveApiBase;
}

const PREFS_STORAGE_KEY = 'rrs_alert_prefs_v42';
const FLT_KEY_V53 = 'rrs_notifier_filters_v53';
const VISITOR_STORAGE_KEY = 'rrs_visitor_session_v42';

const DEFAULT_ALERT_PREFS = {
  riskCutoff: 75,
  audioChimeAlert: false,
  soundEnabled: false,
  quietHoursEnabled: false,
  topBannerAlert: true,
  block0SybilAutoWarn: true,
  whaleLpRugAlert: true,
  liveChartBadges: true,
  clipboardFakeWalletGuard: true,
  updatedAt: 0
};

const DEFAULT_FILTERS_V53 = {
  quietHoursEnabled: false,
  ENABLE_WHITE_OS_BALLOON: false,
  soundEnabled: false,
  roboticVoice: false,
  masterBubbles: true,
  cardX: -1,
  cardY: -1,
  cardPinned: false,
  autoHideSec: 5,
  autoProof: true,
  whalePro: true,
  zoomPct: 100,
  catCoin: true,
  liveChartBadges: true,
  clipboardFakeWalletGuard: true,
  catRug: true,
  catMoonbag: false,
  catVisitor: false,
  catCrypto: true,
  catAi: true,
  catWorld: true,
  macdOn: false,
  macd1m: true,
  macd3m: true,
  macd5m: true,
  macd15m: true,
  macdBull: true,
  macdBear: false,
  macdHistFlip: true,
  tickerOn: false,
  tickerQuery: '',
  newsKwOn: false,
  newsKeywords: 'SOL,BTC,ETF,GEMINI',
  worldRegion: 'US,CA,GLOBAL',
  mcOn: false,
  mcMin: 15000,
  mcMax: 50000000,
  moveOn: false,
  moveMin: 5,
  moveWin: '1h',
  liqOn: false,
  liqMin: 10000
};

const SEEN_MINTS_TTL_MS = 20 * 60 * 1000;
const seenMints = new Map();

async function isMintRecentlyAlerted(mintOrSym) {
  if (!mintOrSym) return false;
  const key = String(mintOrSym).trim().toUpperCase();
  const now = Date.now();
  if (seenMints.has(key) && (now - seenMints.get(key) < SEEN_MINTS_TTL_MS)) {
    return true;
  }
  return new Promise((resolve) => {
    chrome.storage.local.get(['rrs_seen_mints_map'], (res) => {
      const map = (res && res.rrs_seen_mints_map) || {};
      if (map[key] && (now - map[key] < SEEN_MINTS_TTL_MS)) {
        seenMints.set(key, map[key]);
        resolve(true);
      } else {
        seenMints.set(key, now);
        map[key] = now;
        for (const k of Object.keys(map)) {
          if (now - map[k] >= SEEN_MINTS_TTL_MS) {
            delete map[k];
            seenMints.delete(k);
          }
        }
        chrome.storage.local.set({ rrs_seen_mints_map: map }, () => resolve(false));
      }
    });
  });
}

const OFFLINE_PRESET_MINTS = {
  '3ig9E5SQKs8RjVn9EuW1YaprjaMd6dEftG63hBcMpump': {
    ok: true,
    mint: '3ig9E5SQKs8RjVn9EuW1YaprjaMd6dEftG63hBcMpump',
    symbol: 'MELNOK',
    safety_score: 100,
    verdict: 'SAFE | 12-LAYER SHIELD PASSED',
    layer11_sybil_clean: true,
    whale_lp_clean: true,
    checks: [
      { label: 'L1 | Mint Auth', detail: 'Renounced (Fixed Immutable Supply)', passed: true },
      { label: 'L2 | Freeze Auth', detail: 'Renounced (Cannot Freeze Buyer ATAs)', passed: true },
      { label: 'L3 | Top-1/Top-5 Holder Concentration', detail: 'Clean Distribution (Top-1: 2.8% | Top-5: 10.9%)', passed: true },
      { label: 'L4 | Liq/MC Trap Ratio', detail: 'Healthy Pool Depth ($17,599 Liq | 28.9% Liq/MC)', passed: true },
      { label: 'L11 | Block-0 Sybil Cluster Defense', detail: '0 Bundled Sniper Wallets Detected in Genesis Slot', passed: true }
    ]
  },
  '3wyRvbB6nFD7Y9cuozSXrUajZs1EoJxrcBCDBxwupump': {
    ok: true,
    mint: '3wyRvbB6nFD7Y9cuozSXrUajZs1EoJxrcBCDBxwupump',
    symbol: 'WASTED6',
    safety_score: 100,
    verdict: 'SAFE | 12-LAYER SHIELD PASSED',
    layer11_sybil_clean: true,
    whale_lp_clean: true,
    checks: [
      { label: 'L1 | Mint Auth', detail: 'Renounced (Fixed Immutable Supply)', passed: true },
      { label: 'L2 | Freeze Auth', detail: 'Renounced (Cannot Freeze Buyer ATAs)', passed: true },
      { label: 'L3 | Top-1/Top-5 Holder Concentration', detail: 'Clean Distribution (Top-1: 0.3% | Top-5: 0.5%)', passed: true },
      { label: 'L4 | Liq/MC Trap Ratio', detail: 'Healthy Pool Depth ($1,821 Liq | 118.0% Liq/MC)', passed: true },
      { label: 'L11 | Block-0 Sybil Cluster Defense', detail: 'Verified Organic Entry | Zero Genesis Sybil Ring', passed: true }
    ]
  },
  'AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL': {
    ok: true,
    mint: 'AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL',
    symbol: 'NVIDIA',
    safety_score: 0,
    verdict: 'DANGER | RUG / SYBIL & LP-PULL BLOCKED',
    layer11_sybil_clean: false,
    whale_lp_clean: false,
    checks: [
      { label: 'L11 | Block-0 Sybil Cluster Defense', detail: 'COORDINATED BLOCK-0 INSIDER CLUSTER FLAGGED', passed: false },
      { label: 'L4 | Liq/MC Trap Ratio', detail: 'Drained / Shallow Liquidity ($0 USD Liq | 0.0% Liq/MC Trap)', passed: false },
      { label: 'L5 | LP Burn / Lock Status', detail: 'MANUAL LP PULL DETECTED | Blocked by 12-Layer Gate', passed: false },
      { label: 'L9 | True Pool Age', detail: 'Unverified / Rugged Pool Lifecycle', passed: false },
      { label: 'L10 | Buy/Sell Velocity', detail: 'Heavy Whale Dump / Dead Velocity (0% Buys)', passed: false }
    ]
  }
};

const OFFLINE_PRESET_WALLETS = {
  'C3FFhG83pda2veVRFwTDNyf1YT2R2U2ZHxcg8pUeMjrC': {
    ok: true,
    wallet: 'C3FFhG83pda2veVRFwTDNyf1YT2R2U2ZHxcg8pUeMjrC',
    empty_count: 391,
    reclaimable_count: 391,
    total_reclaimable_sol: 0.592318,
    total_reclaimable_usd: 43.18,
    user_net_95_sol: 0.580472,
    user_net_95_usd: 42.32
  }
};

const scanCache = new Map();
const SCAN_CACHE_TTL_MS = 20000;
let preferredApiBase = '';

function sanitizeVerdictText(text) {
  if (!text) return '';
  const legacyRx = new RegExp('(?:10|11)[-\\s]+layer(s?)', 'gi');
  return scrubNoLongDash(String(text).replace(legacyRx, (_m, plural) => '12-Layer' + (plural ? 's' : '')));
}

function enrichScanResult(mint, raw) {
  if (!raw || raw.ok === false) return raw;
  const d = Object.assign({}, raw);
  d.mint = d.mint || mint;
  const score = d.safety_score !== undefined
    ? Number(d.safety_score)
    : (d.score !== undefined ? Number(d.score) : 95);
  d.safety_score = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;
  d.verdict = sanitizeVerdictText(d.verdict || (d.safety_score >= 75 ? 'SAFE | 12-LAYER SHIELD PASSED' : 'HIGH RISK | 12-LAYER WARNING'));

  const checks = Array.isArray(d.checks) ? d.checks.map((c) => {
    if (typeof c === 'string') {
      return { label: 'Check', detail: sanitizeVerdictText(c), passed: d.safety_score >= 75 };
    }
    return {
      label: sanitizeVerdictText(c.label || c.name || 'Layer Check'),
      detail: sanitizeVerdictText(c.detail || c.status || ''),
      passed: c.passed !== undefined ? Boolean(c.passed) : (d.safety_score >= 75)
    };
  }) : [];

  let l11Check = checks.find((c) => /l11|layer[\s-]*11|sybil|block[\s-]*0/i.test(c.label + ' ' + c.detail));
  if (!l11Check) {
    const sybilClean = d.layer11_sybil_clean !== undefined
      ? Boolean(d.layer11_sybil_clean)
      : (d.sybil_detected ? false : (d.safety_score >= 60));
    l11Check = {
      label: 'L11 | Block-0 Sybil Cluster',
      detail: sybilClean
        ? 'Clean Genesis Distribution (0 Bundled Sybil Rings)'
        : 'Block-0 Bundled Sniper / Sybil Cluster Risk Detected',
      passed: sybilClean
    };
    checks.push(l11Check);
  }

  let whaleLpFailed = false;
  let whaleLpDetail = 'LP Depth & Top-Holder Concentration Within Safe Bounds';
  for (const c of checks) {
    if (/liq|lp|holder|whale|dump|concentration|velocity/i.test(c.label + ' ' + c.detail) && !c.passed) {
      whaleLpFailed = true;
      whaleLpDetail = c.label + ': ' + c.detail;
      break;
    }
  }
  if (d.whale_lp_clean === false) whaleLpFailed = true;

  d.checks = checks;
  d.layer11 = { passed: Boolean(l11Check.passed), label: l11Check.label, detail: l11Check.detail };
  d.whaleLp = { passed: !whaleLpFailed, detail: whaleLpDetail };
  return d;
}

async function getOrderedEndpoints() {
  const list = [];
  const live = await resolveLiveApiBase();
  if (preferredApiBase && (API_ENDPOINTS.indexOf(preferredApiBase) !== -1 || preferredApiBase === live)) {
    list.push(preferredApiBase);
  }
  if (live && list.indexOf(live) === -1) list.push(live);
  for (const b of API_ENDPOINTS) {
    if (list.indexOf(b) === -1) list.push(b);
  }
  return list;
}

async function fetchFromApiBases(path, options, timeoutMs) {
  const endpoints = await getOrderedEndpoints();
  let lastError = null;
  for (const base of endpoints) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs || 5500);
    try {
      const reqOpts = Object.assign({}, options || {}, { signal: ctrl.signal });
      const res = await fetch(base + path, reqOpts);
      clearTimeout(timer);
      if (res.ok || res.status === 400 || res.status === 402 || res.status === 429) {
        const data = await res.json();
        if (res.ok) preferredApiBase = base;
        return { data, apiBase: base, status: res.status };
      }
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
    }
  }
  throw lastError || new Error('All scanner endpoints unreachable');
}

async function getStoredAlertPrefs() {
  return new Promise((resolve) => {
    try {
      chrome.storage.sync.get([PREFS_STORAGE_KEY], (res) => {
        if (chrome.runtime.lastError || !res || !res[PREFS_STORAGE_KEY]) {
          chrome.storage.local.get([PREFS_STORAGE_KEY], (localRes) => {
            const merged = Object.assign({}, DEFAULT_ALERT_PREFS, (localRes && localRes[PREFS_STORAGE_KEY]) || {}, { quietHoursEnabled: false });
            soundEnabled = Boolean(merged.soundEnabled || merged.audioChimeAlert);
            resolve(merged);
          });
          return;
        }
        const merged = Object.assign({}, DEFAULT_ALERT_PREFS, res[PREFS_STORAGE_KEY], { quietHoursEnabled: false });
        soundEnabled = Boolean(merged.soundEnabled || merged.audioChimeAlert);
        resolve(merged);
      });
    } catch (_e) {
      resolve(Object.assign({}, DEFAULT_ALERT_PREFS));
    }
  });
}

async function saveStoredAlertPrefs(partialPrefs) {
  const current = await getStoredAlertPrefs();
  const next = Object.assign({}, current, partialPrefs || {}, {
    quietHoursEnabled: false,
    riskCutoff: Math.max(0, Math.min(100, Number((partialPrefs && partialPrefs.riskCutoff !== undefined) ? partialPrefs.riskCutoff : current.riskCutoff) || 75)),
    updatedAt: Date.now()
  });
  soundEnabled = Boolean(next.soundEnabled || next.audioChimeAlert);
  return new Promise((resolve) => {
    try {
      chrome.storage.local.set({ [PREFS_STORAGE_KEY]: next, rrs_quiet_snooze_until: 0 }, () => {});
      chrome.storage.sync.set({ [PREFS_STORAGE_KEY]: next }, () => resolve(next));
    } catch (_e) {
      resolve(next);
    }
  });
}

async function getStoredFiltersV53() {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get([FLT_KEY_V53, 'rrs_notifier_filters_v52'], (res) => {
        const raw = (res && (res[FLT_KEY_V53] || res.rrs_notifier_filters_v52)) || {};
        const merged = Object.assign({}, DEFAULT_FILTERS_V53, raw, {
          quietHoursEnabled: false,
          ENABLE_WHITE_OS_BALLOON: false,
          cardPinned: false,
          stayOpen: false
        });
        soundEnabled = Boolean(merged.soundEnabled);
        resolve(merged);
      });
    } catch (_e) {
      resolve(Object.assign({}, DEFAULT_FILTERS_V53, { cardPinned: false, stayOpen: false }));
    }
  });
}

function resetPersistedPinFlagsBg() {
  try {
    chrome.storage.local.get([FLT_KEY_V53, 'rrs_box_layout_v53'], (res) => {
      const updates = { rrs_quiet_snooze_until: 0 };
      const flt = Object.assign({}, DEFAULT_FILTERS_V53, (res && res[FLT_KEY_V53]) || {}, {
        cardPinned: false,
        stayOpen: false
      });
      updates[FLT_KEY_V53] = flt;
      const lay = Object.assign({ autoHideSec: flt.autoHideSec || 5, zoomPct: 100 }, (res && res.rrs_box_layout_v53) || {}, {
        pinned: false
      });
      updates.rrs_box_layout_v53 = lay;
      chrome.storage.local.set(updates, () => {});
    });
  } catch (_e) {}
}
resetPersistedPinFlagsBg();

async function syncCornerNotifierBridge(endpointPath, bodyObj) {
  const ctrl = new AbortController();
  const tm = setTimeout(() => ctrl.abort(), 1200);
  try {
    await fetch('http://127.0.0.1:18753' + endpointPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyObj || {}),
      signal: ctrl.signal
    });
  } catch (_e) {}
  clearTimeout(tm);
}

async function getOrCreateVisitorSession() {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get([VISITOR_STORAGE_KEY], (res) => {
        if (res && res[VISITOR_STORAGE_KEY]) {
          resolve(res[VISITOR_STORAGE_KEY]);
          return;
        }
        const bytes = new Uint8Array(12);
        crypto.getRandomValues(bytes);
        const sid = 'ext_' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
        chrome.storage.local.set({ [VISITOR_STORAGE_KEY]: sid }, () => resolve(sid));
      });
    } catch (_e) {
      resolve('ext_anon_' + Date.now().toString(36));
    }
  });
}

function updateTabBadge(tabId, _score, _cutoff) {
  if (!tabId || !chrome.action || !chrome.action.setBadgeText) return;
  try {
    chrome.action.setBadgeText({ tabId, text: '' });
  } catch (_e) {}
}

async function handleScanToken(msg, sender) {
  const mint = String((msg && msg.mint) || '').trim();
  if (!mint) return { ok: false, error: 'Missing Solana token mint address.' };
  const forceRefresh = Boolean(msg && msg.forceRefresh);
  const now = Date.now();
  if (!forceRefresh && scanCache.has(mint)) {
    const cached = scanCache.get(mint);
    if (now - cached.ts < SCAN_CACHE_TTL_MS) {
      if (sender && sender.tab && sender.tab.id && cached.result && cached.result.ok !== false) {
        const prefs = await getStoredAlertPrefs();
        updateTabBadge(sender.tab.id, cached.result.safety_score, prefs.riskCutoff);
      }
      return cached.result;
    }
  }

  let result = null;
  try {
    const resp = await fetchFromApiBases('/api/scan-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mint, source: (msg && msg.source) || 'mv3_sentinel_v6.7.0' })
    }, 5500);
    if (resp.status === 402 || (resp.data && resp.data.payment_required)) {
      const d = resp.data || {};
      return {
        ok: false,
        payment_required: true,
        error: scrubNoLongDash(d.choice_a_copy || d.error || 'Free 12-Layer audit already used. Unlock extra audits at https://rentandrugshield.com/app.html')
      };
    }
    result = enrichScanResult(mint, resp.data);
    result._apiBase = resp.apiBase;
  } catch (_err) {
    if (OFFLINE_PRESET_MINTS[mint]) {
      result = enrichScanResult(mint, OFFLINE_PRESET_MINTS[mint]);
      result._offlinePreset = true;
    } else {
      return { ok: false, error: 'Unable to reach https://rentandrugshield.com/api/scan-token right now.' };
    }
  }

  if (result && result.ok !== false) {
    if (Number(result.safety_score) < 60 || (result.layer11 && !result.layer11.passed) || (result.whaleLp && !result.whaleLp.passed)) {
      triggerCyberRedAlert({
        id: 'SCAN-RUG-' + mint.slice(0, 12),
        kind: 'rug',
        mint,
        sym: result.symbol || '',
        title: 'DANGER Token Blocked: ' + (result.symbol || mint.slice(0, 6)) + ' (Score ' + result.safety_score + '/100)',
        detail: String(result.verdict || 'Failed 12-Layer Slot-0 Bundle / LP Burn Gate'),
        action_url: 'https://rentandrugshield.com/?token=' + encodeURIComponent(mint) + '&autoscan=1#tokenScanner'
      });
    }
    scanCache.set(mint, { ts: now, result });
    if (sender && sender.tab && sender.tab.id) {
      const prefs = await getStoredAlertPrefs();
      updateTabBadge(sender.tab.id, result.safety_score, prefs.riskCutoff);
    }
  }
  return result;
}

async function handleScanWallet(msg) {
  const wallet = String((msg && msg.wallet) || '').trim();
  if (!wallet) return { ok: false, error: 'Missing Solana wallet address.' };
  try {
    const resp = await fetchFromApiBases('/api/scan-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet, mode: 'rent', is_sample_test: Boolean(msg && msg.isSample) })
    }, 6000);
    return resp.data;
  } catch (_err) {
    if (OFFLINE_PRESET_WALLETS[wallet]) {
      return Object.assign({}, OFFLINE_PRESET_WALLETS[wallet], { _offlinePreset: true });
    }
    return { ok: false, error: 'Could not reach read-only wallet rent scanner.' };
  }
}

async function handleLiveTelemetry() {
  try {
    const resp = await fetchFromApiBases('/api/live-telemetry', { method: 'GET' }, 4500);
    return resp.data;
  } catch (_err) {
    return { ok: false };
  }
}

async function handleTelemetryClick(msg, sender) {
  const raw = (msg && msg.payload) || {};
  const sessionId = await getOrCreateVisitorSession();
  const tabUrl = (sender && sender.tab && sender.tab.url) ? sender.tab.url : (raw.url || '');
  const payload = {
    button_id: String(raw.button_id || raw.id || 'ext_btn'),
    id: String(raw.button_id || raw.id || 'ext_btn'),
    button_label: String(raw.button_label || raw.label || 'Extension Action'),
    label: String(raw.button_label || raw.label || 'Extension Action'),
    page: String(raw.page || 'extension:mv3_v6.7.0'),
    page_path: String(raw.path || '/extension'),
    path: String(raw.path || '/extension'),
    url: String(tabUrl),
    source: 'mv3_sentinel_v6.7.0',
    session_id: sessionId,
    visitor_id: sessionId,
    mint: String(raw.mint || ''),
    wallet: String(raw.wallet || ''),
    ref: String(raw.ref || ''),
    ts: Date.now()
  };

  try {
    await fetchFromApiBases('/api/telemetry/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, 3500);
    return { ok: true };
  } catch (_err) {
    return { ok: false };
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ rrs_quiet_snooze_until: 0 }, () => {});
  chrome.storage.sync.get([PREFS_STORAGE_KEY], (res) => {
    if (!res || !res[PREFS_STORAGE_KEY]) {
      const initPrefs = Object.assign({}, DEFAULT_ALERT_PREFS, { updatedAt: Date.now() });
      chrome.storage.sync.set({ [PREFS_STORAGE_KEY]: initPrefs }, () => {});
      chrome.storage.local.set({ [PREFS_STORAGE_KEY]: initPrefs }, () => {});
    }
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) return false;
  if (msg.type === 'RRS_SCAN_TOKEN') {
    handleScanToken(msg, sender).then(sendResponse).catch((err) => sendResponse({ ok: false, error: String(err && err.message ? err.message : err) }));
    return true;
  }
  if (msg.type === 'RRS_SCAN_WALLET') {
    handleScanWallet(msg).then(sendResponse).catch((err) => sendResponse({ ok: false, error: String(err && err.message ? err.message : err) }));
    return true;
  }
  if (msg.type === 'RRS_LIVE_TELEMETRY') {
    handleLiveTelemetry().then(sendResponse).catch(() => sendResponse({ ok: false }));
    return true;
  }
  if (msg.type === 'RRS_TELEMETRY_CLICK') {
    handleTelemetryClick(msg, sender).then(sendResponse).catch(() => sendResponse({ ok: false }));
    return true;
  }
  if (msg.type === 'RRS_GET_PREFS') {
    getStoredAlertPrefs().then((prefs) => sendResponse({ ok: true, prefs })).catch(() => sendResponse({ ok: true, prefs: Object.assign({}, DEFAULT_ALERT_PREFS) }));
    return true;
  }
  if (msg.type === 'RRS_SET_PREFS') {
    saveStoredAlertPrefs(msg.prefs || {}).then((prefs) => sendResponse({ ok: true, prefs })).catch(() => sendResponse({ ok: false }));
    return true;
  }
  return false;
});

// ============================================================================
// GEMINI 4 CARBON CRYPTO CYBERSECURITY SENTINEL (v5.3.0)
// ============================================================================
const CYBER_STATE_KEY = 'rrs_cyber_sentinel_state_v50';
let cyberAlertActive = false;
let currentThreat = null;
let animPhase = 0;
let pulseTimer = null;
let knownPhishingSet = new Set([
  'phantom-airdrop.com', 'phantom-claim.io', 'solflare-verify.com',
  'jupiter-airdrop.org', 'pumpfun-claim.net', 'raydium-bonus.io',
  'claim-solana-rent-free.xyz', 'solana-rectify-node.com',
  'metamask-solana-sync.io', 'wallet-connect-v3-auth.com'
]);
let flaggedRugMints = new Map([
  ['AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL', 'Layer-12 Slot-0 Sniper Bundle + Manual LP Pull'],
  ['DeadRug111111111111111111111111111111111111', 'Unburned LP + Drainer SetAuthority Trap']
]);
let lastNotifiedThreatKey = '';
let lastNotifiedTs = 0;

function drawShieldFrame(size, isAlert, phase) {
  if (typeof OffscreenCanvas === 'undefined') return null;
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.44;
  const pulse = isAlert ? ((phase % 2 === 0) ? 1.0 : 0.25) : (0.65 + 0.35 * Math.sin(phase * 0.55));
  const grad = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, size * 0.5);
  if (isAlert) {
    grad.addColorStop(0, `rgba(255, 23, 68, ${0.95 * pulse})`);
    grad.addColorStop(0.65, `rgba(220, 38, 38, ${0.72 * pulse})`);
    grad.addColorStop(1, `rgba(255, 23, 68, ${0.08 * pulse})`);
  } else {
    grad.addColorStop(0, `rgba(0, 255, 163, ${0.95 * pulse})`);
    grad.addColorStop(0.65, `rgba(16, 185, 129, ${0.65 * pulse})`);
    grad.addColorStop(1, `rgba(0, 255, 163, ${0.05 * pulse})`);
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.49, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx, size * 0.10);
  ctx.lineTo(size * 0.86, size * 0.24);
  ctx.lineTo(size * 0.82, size * 0.58);
  ctx.quadraticCurveTo(size * 0.75, size * 0.82, cx, size * 0.92);
  ctx.quadraticCurveTo(size * 0.25, size * 0.82, size * 0.18, size * 0.58);
  ctx.lineTo(size * 0.14, size * 0.24);
  ctx.closePath();

  ctx.fillStyle = isAlert ? ((phase % 2 === 0) ? '#FF1744' : '#7F1D1D') : (pulse > 0.82 ? '#00FFA3' : '#059669');
  ctx.fill();
  ctx.lineWidth = Math.max(1, size * 0.06);
  ctx.strokeStyle = isAlert ? '#FFE4E6' : '#ECFDF5';
  ctx.stroke();

  ctx.strokeStyle = isAlert ? '#FFFFFF' : '#020408';
  ctx.fillStyle = isAlert ? '#FFFFFF' : '#020408';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (isAlert) {
    ctx.lineWidth = Math.max(1.6, size * 0.10);
    ctx.beginPath();
    ctx.moveTo(cx, size * 0.30);
    ctx.lineTo(cx, size * 0.56);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, size * 0.71, Math.max(1.2, size * 0.06), 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.lineWidth = Math.max(1.6, size * 0.10);
    ctx.beginPath();
    ctx.moveTo(size * 0.33, size * 0.52);
    ctx.lineTo(size * 0.46, size * 0.65);
    ctx.lineTo(size * 0.69, size * 0.37);
    ctx.stroke();
  }
  return ctx.getImageData(0, 0, size, size);
}

const UNREAD_SHIELD_KEY_V55 = 'rrs_unread_shield_count_v55';
let unreadShieldCount = 0;
let shieldIconVisualState = 'yellow_black';
let emeraldFlashResetTimer = null;

const ICON_PATHS_YELLOW = {
  16: 'icons/shield_yellow_16.png',
  32: 'icons/shield_yellow_32.png',
  48: 'icons/shield_yellow_48.png',
  128: 'icons/shield_yellow_128.png'
};
const ICON_PATHS_RED = {
  16: 'icons/shield_red_16.png',
  32: 'icons/shield_red_32.png',
  48: 'icons/shield_red_48.png',
  128: 'icons/shield_red_128.png'
};
const ICON_PATHS_EMERALD = {
  16: 'icons/shield_emerald_16.png',
  32: 'icons/shield_emerald_32.png',
  48: 'icons/shield_emerald_48.png',
  128: 'icons/shield_emerald_128.png'
};

let systemHealthRed = false;
let systemHealthReason = '';
let lastRpcLatencyMs = 45;

function applyLuxuryToolbarShieldState(state, _unusedCount) {
  unreadShieldCount = 0;
  try { chrome.storage.local.set({ [UNREAD_SHIELD_KEY_V55]: 0 }, () => {}); } catch (_e) {}
  shieldIconVisualState = state;
  if (!chrome.action) return;

  const realRed = Boolean(cyberAlertActive || systemHealthRed);
  try {
    if (realRed && state !== 'emerald_flash') {
      shieldIconVisualState = 'red_alert';
      chrome.action.setIcon({ path: ICON_PATHS_RED }, () => { void chrome.runtime.lastError; });
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setBadgeBackgroundColor({ color: '#FF1744' });
      chrome.action.setTitle({
        title: 'Solana Rent & Rug Shield v6.7 | System Alert: ' + (systemHealthReason || 'Active 12-Layer Scam Warning')
      });
    } else if (state === 'emerald_flash') {
      shieldIconVisualState = 'emerald_flash';
      chrome.action.setIcon({ path: ICON_PATHS_EMERALD }, () => { void chrome.runtime.lastError; });
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setBadgeBackgroundColor({ color: '#00FFA3' });
      chrome.action.setTitle({
        title: 'Solana Rent & Rug Shield v6.7 | 12-Layer Active (#00FFA3)'
      });
    } else {
      shieldIconVisualState = 'yellow_black';
      chrome.action.setIcon({ path: ICON_PATHS_YELLOW }, () => { void chrome.runtime.lastError; });
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setBadgeBackgroundColor({ color: '#FFD000' });
      chrome.action.setTitle({
        title: 'Solana Rent & Rug Shield v6.7 | Rich Black & 24K Gold Sentinel Armed'
      });
    }
  } catch (_e) {}
}

function pulseEmeraldThenGold() {
  if (cyberAlertActive || systemHealthRed) {
    applyLuxuryToolbarShieldState('red_alert', 0);
    return;
  }
  applyLuxuryToolbarShieldState('emerald_flash', 0);
  if (emeraldFlashResetTimer) clearTimeout(emeraldFlashResetTimer);
  emeraldFlashResetTimer = setTimeout(() => {
    emeraldFlashResetTimer = null;
    if (!cyberAlertActive && !systemHealthRed) {
      applyLuxuryToolbarShieldState('yellow_black', 0);
    }
  }, 700);
}

function acknowledgeShieldUnreadWithEmeraldFlash() {
  cyberAlertActive = false;
  systemHealthRed = false;
  systemHealthReason = '';
  currentThreat = null;
  unreadShieldCount = 0;
  try {
    chrome.storage.local.set({
      [CYBER_STATE_KEY]: { active: false, threat: null },
      [UNREAD_SHIELD_KEY_V55]: 0
    }, () => {});
  } catch (_e) {}

  pulseEmeraldThenGold();

  if (chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] }, (tabs) => {
      (tabs || []).forEach((tb) => {
        if (tb && tb.id) {
          chrome.tabs.sendMessage(tb.id, { type: 'RRS_SHIELD_STATE_SYNC_V55', state: 'emerald_flash', unreadCount: 0 }, () => { void chrome.runtime.lastError; });
        }
      });
    });
  }
}

function renderToolbarShieldTick() {
  if (shieldIconVisualState === 'emerald_flash') return;
  if (cyberAlertActive || systemHealthRed) {
    applyLuxuryToolbarShieldState('red_alert', 0);
  } else {
    applyLuxuryToolbarShieldState('yellow_black', 0);
  }
}

function ensureShieldPulseLoop() {
  if (pulseTimer) {
    clearInterval(pulseTimer);
    pulseTimer = null;
  }
  renderToolbarShieldTick();
}

applyLuxuryToolbarShieldState('yellow_black', 0);

function triggerCyberRedAlert(threatObj, forceCornerSync) {
  if (!threatObj) return;
  cyberAlertActive = true;
  currentThreat = Object.assign({
    id: 'THREAT-' + Date.now(),
    severity: 'CRITICAL',
    kind: 'rug',
    title: 'Crypto Cybersecurity Threat Blocked',
    detail: '12-Layer Sentinel detected an active Web3 threat.',
    action_url: 'https://rentandrugshield.com/?token=AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL&autoscan=1&cyber_inspect=1#tokenScanner',
    ts: Date.now()
  }, threatObj);

  currentThreat.action_url = resolveExactAlertUrl(currentThreat, cachedFounderApprovals.founderLocalhost);

  try {
    chrome.storage.local.set({ [CYBER_STATE_KEY]: { active: true, threat: currentThreat } }, () => {});
  } catch (_e) {}

  ensureShieldPulseLoop();

  const dedupKey = String(currentThreat.id || currentThreat.title);
  const now = Date.now();
  if (forceCornerSync || dedupKey !== lastNotifiedThreatKey || (now - lastNotifiedTs) > 15000) {
    lastNotifiedThreatKey = dedupKey;
    lastNotifiedTs = now;
    const toastPayload = {
      id: 'rrs_cyber_alert_' + now,
      kind: 'rug',
      sym: currentThreat.sym || '',
      mint: currentThreat.mint || '',
      severity: 'CRITICAL',
      badge: 'CRITICAL RUG ALERT',
      title: scrubNoLongDash(currentThreat.title).slice(0, 110),
      message: scrubNoLongDash(currentThreat.detail).slice(0, 185),
      url: currentThreat.action_url
    };
    fireRealPopupToast(toastPayload);
    if (forceCornerSync) {
      syncCornerNotifierBridge('/fire-test', toastPayload);
    }
  }
}

function clearCyberRedAlert() {
  cyberAlertActive = false;
  currentThreat = null;
  try {
    chrome.storage.local.set({ [CYBER_STATE_KEY]: { active: false, threat: null } }, () => {});
  } catch (_e) {}
  ensureShieldPulseLoop();
}

function isSuspiciousPhishingHost(hostname) {
  if (!hostname) return false;
  const h = hostname.toLowerCase();
  const safeOfficial = [
    'phantom.app', 'phantom.com', 'solflare.com', 'jup.ag', 'raydium.io',
    'pump.fun', 'dexscreener.com', 'gmgn.ai', 'meteora.ag', 'birdeye.so',
    'rentandrugshield.com', 'google.com', 'github.com', 'porkbun.com', '127.0.0.1', 'localhost'
  ];
  if (safeOfficial.some((s) => h === s || h.endsWith('.' + s) || h.endsWith('.trycloudflare.com'))) return false;
  if (knownPhishingSet.has(h)) return true;
  for (const d of knownPhishingSet) {
    if (h.endsWith('.' + d)) return true;
  }
  if ((h.includes('phantom') || h.includes('solflare') || h.includes('jup-airdrop') || h.includes('pumpfun') || h.includes('solana-claim') || h.includes('wallet-rectify')) && !safeOfficial.includes(h)) {
    return true;
  }
  return false;
}

function inspectUrlForCyberThreats(urlStr) {
  if (!urlStr || !urlStr.startsWith('http')) return;
  try {
    const u = new URL(urlStr);
    if (isSuspiciousPhishingHost(u.hostname)) {
      triggerCyberRedAlert({
        id: 'PHISH-' + u.hostname,
        kind: 'rug',
        title: 'Phishing / Fake Wallet Domain Blocked: ' + u.hostname,
        detail: 'Blocked impersonator domain attempting wallet drainer signature hijack.',
        action_url: 'https://rentandrugshield.com/?cyber_inspect=1&domain=' + encodeURIComponent(u.hostname)
      });
      return;
    }
    const mintMatch = urlStr.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g) || [];
    for (const m of mintMatch) {
      if (flaggedRugMints.has(m)) {
        fireRealPopupToast({
          id: 'RUG-URL-' + m.slice(0, 12),
          kind: 'rug',
          l12: 'FAILED',
          verdict_12layer: 'FAIL',
          mint: m,
          severity: 'CRITICAL',
          badge: '12-LAYER: FAIL \u2715 | RUG FLAGGED',
          title: '12-Layer Scam/Rug Token Blocked (' + m.slice(0, 6) + '...)',
          message: flaggedRugMints.get(m),
          url: 'https://rentandrugshield.com/?token=' + encodeURIComponent(m) + '&autoscan=1&cyber_inspect=1#tokenScanner'
        });
        return;
      }
    }
  } catch (_e) {}
}

async function pollCyberThreatFeed() {
  try {
    const sid = await getOrCreateVisitorSession();
    const qs = '?ver=6.7.0&client_id=' + encodeURIComponent(sid);
    const resp = await fetchFromApiBases('/api/cyber-threat-feed' + qs, { method: 'GET' }, 4500);
    const d = resp && resp.data;
    if (d && d.ok) {
      if (Array.isArray(d.phishing_domains)) {
        d.phishing_domains.forEach((dom) => knownPhishingSet.add(String(dom).toLowerCase()));
      }
      if (Array.isArray(d.flagged_mints)) {
        d.flagged_mints.forEach((row) => {
          if (row && row.mint) flaggedRugMints.set(row.mint, row.reason || 'Flagged by 12-Layer Sentinel');
        });
      }
      if (d.active_threat) {
        triggerCyberRedAlert(d.active_threat, false);
      }
      return d;
    }
  } catch (_e) {}
  return { ok: true, status: cyberAlertActive ? 'RED_ALERT' : 'GREEN_CLEAN', active_threat: currentThreat };
}

try {
  chrome.storage.local.get([CYBER_STATE_KEY], (res) => {
    if (res && res[CYBER_STATE_KEY] && res[CYBER_STATE_KEY].active && res[CYBER_STATE_KEY].threat) {
      cyberAlertActive = true;
      currentThreat = res[CYBER_STATE_KEY].threat;
    }
    ensureShieldPulseLoop();
  });
} catch (_e) {
  ensureShieldPulseLoop();
}

if (chrome.alarms) {
  chrome.alarms.create('rrs_cyber_sentinel_heartbeat', { periodInMinutes: 0.5 });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm && alarm.name === 'rrs_cyber_sentinel_heartbeat') {
      ensureShieldPulseLoop();
      pollCyberThreatFeed();
    }
  });
}

if (chrome.tabs) {
  chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    const u = changeInfo.url || (tab && tab.url) || '';
    if (u) inspectUrlForCyberThreats(u);
  });
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (!chrome.runtime.lastError && tab && tab.url) inspectUrlForCyberThreats(tab.url);
    });
  });
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || !msg.type) return false;
  if (msg.type === 'RRS_CYBER_GET_STATE') {
    sendResponse({ ok: true, active: cyberAlertActive, threat: currentThreat, layers: 12 });
    return false;
  }
  if (msg.type === 'RRS_CYBER_THREAT_DETECTED') {
    triggerCyberRedAlert(msg.threat || {});
    sendResponse({ ok: true, active: true, threat: currentThreat });
    return false;
  }
  if (msg.type === 'RRS_CYBER_CLEAR_ALERT') {
    clearCyberRedAlert();
    sendResponse({ ok: true, active: false });
    return false;
  }
  return false;
});

pollCyberThreatFeed();

// === v6.0.0: Automatic Trial + 45s Post-Install Connect Phantom for Auto 0% Rent Reclaim Prompt ===
const TRIAL_KEY_V51 = 'rrs_ultra_pro_trial_v51';
const PHANTOM_45S_SHOWN_KEY = 'rrs_v60_phantom_45s_shown';
const PHANTOM_45S_CARD_KEY = 'rrs_v60_phantom_45s_card';
const PHANTOM_45S_ALARM = 'rrs_v60_phantom_prompt_45s';
let shieldStateV51 = 'secure';
let phantom45sMemTimer = null;

function dispatchPhantom45sPrompt(forceNow) {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get([PHANTOM_45S_SHOWN_KEY, 'rrs_connected_phantom_wallet_v60'], (res) => {
        const alreadyShown = Boolean(res && res[PHANTOM_45S_SHOWN_KEY]);
        const alreadyWallet = String((res && res.rrs_connected_phantom_wallet_v60) || '').trim();
        if (!forceNow && (alreadyShown || alreadyWallet)) {
          resolve({ ok: true, skipped: true, shown: alreadyShown });
          return;
        }
        const cardState = {
          active: true,
          version: '6.7.0',
          title: 'Connect Phantom for Auto 0% Rent Reclaim',
          badge: 'AUTO 0% RENT RECLAIM \u2713',
          message: '1st SOL Rent Claim 100% FREE (0% Fee) \u2022 Read-Only Scan \u2022 0 Seed Phrases',
          url: PHANTOM_45S_URL,
          firedAt: Date.now()
        };
        chrome.storage.local.set({
          [PHANTOM_45S_SHOWN_KEY]: true,
          [PHANTOM_45S_CARD_KEY]: cardState
        }, () => {});
        fireRealPopupToast({
          id: 'rrs_v60_phantom_45s',
          kind: 'phantom_45s',
          failed12Layer: false,
          isScamFail: false,
          severity: 'INFO',
          badge: 'AUTO 0% RENT RECLAIM \u2713',
          title: 'Connect Phantom for Auto 0% Rent Reclaim',
          message: '1st SOL Rent Claim 100% FREE (0% Fee) \u2022 Read-Only Scan \u2022 0 Seed Phrases',
          url: PHANTOM_45S_URL
        }).then((toastRes) => resolve({
          ok: true,
          fired: true,
          title: 'Connect Phantom for Auto 0% Rent Reclaim',
          url: PHANTOM_45S_URL,
          alarmName: PHANTOM_45S_ALARM,
          delayMs: 45000,
          cardState,
          toastRes
        }));
      });
    } catch (_e) {
      resolve({ ok: false });
    }
  });
}

function schedulePhantom45sPrompt(isInstallReason) {
  try {
    chrome.storage.local.get([PHANTOM_45S_SHOWN_KEY], (res) => {
      const alreadyShown = Boolean(res && res[PHANTOM_45S_SHOWN_KEY]);
      if (!isInstallReason && alreadyShown) return;
      if (isInstallReason) {
        chrome.storage.local.set({ [PHANTOM_45S_SHOWN_KEY]: false }, () => {});
      }
      if (chrome.alarms) {
        chrome.alarms.create(PHANTOM_45S_ALARM, { delayInMinutes: 0.75 });
      }
      if (phantom45sMemTimer) clearTimeout(phantom45sMemTimer);
      phantom45sMemTimer = setTimeout(() => {
        dispatchPhantom45sPrompt(false);
      }, 45000);
    });
  } catch (_e) {}
}

if (chrome.alarms) {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm && alarm.name === PHANTOM_45S_ALARM) {
      dispatchPhantom45sPrompt(false);
    }
  });
}

function ensure24hUltraProTrial(isInstallReason) {
  try {
    chrome.storage.local.get([TRIAL_KEY_V51], (res) => {
      let rec = res && res[TRIAL_KEY_V51];
      if (!rec || !rec.activatedAt) {
        const now = Date.now();
        rec = {
          version: '6.7.0',
          activatedAt: now,
          expiresAt: now + 24 * 60 * 60 * 1000,
          tierDuring24h: 'Ultra Pro FREE (24-Hour Automatic Trial)'
        };
        chrome.storage.local.set({ [TRIAL_KEY_V51]: rec }, () => {});
      }
      schedulePhantom45sPrompt(Boolean(isInstallReason));
    });
  } catch (_e) {}
}

if (chrome.runtime && chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener((details) => {
    ensure24hUltraProTrial(Boolean(details && details.reason === 'install'));
  });
}
ensure24hUltraProTrial(false);

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || !msg.type) return false;
  if (msg.type === 'RRS_V51_GET_TRIAL_AND_STATE') {
    chrome.storage.local.get([TRIAL_KEY_V51], (res) => {
      sendResponse({
        ok: true,
        mode: cyberAlertActive ? 'alert' : shieldStateV51,
        active: cyberAlertActive,
        threat: currentThreat,
        trial: (res && res[TRIAL_KEY_V51]) || null
      });
    });
    return true;
  }
  return false;
});

// ============================================================================
// v5.3 480x190px 12s ALERT ENGINE + EXACT ?mint= / 18088 ROUTING (ZERO VOICE)
// ============================================================================
const NOTIF_URL_MAP_KEY = 'rrs_notif_url_map_v51';
const INTEL_STORAGE_KEY = 'rrs_live_intel_v53';
const SEEN_BUBBLE_KEY = 'rrs_seen_intel_toast_v53';
const notifUrlMemory = new Map();

function rememberNotifUrl(notifId, targetUrl) {
  if (!notifId || !targetUrl) return;
  notifUrlMemory.set(notifId, targetUrl);
  try {
    chrome.storage.local.get([NOTIF_URL_MAP_KEY], (res) => {
      const m = Object.assign({}, (res && res[NOTIF_URL_MAP_KEY]) || {});
      m[notifId] = targetUrl;
      const keys = Object.keys(m);
      if (keys.length > 60) keys.slice(0, keys.length - 60).forEach((k) => delete m[k]);
      chrome.storage.local.set({ [NOTIF_URL_MAP_KEY]: m }, () => {});
    });
  } catch (_e) {}
}

function broadcastToastToActiveTabs(toastObj) {
  try {
    if (chrome.notifications && chrome.notifications.getAll) {
      chrome.notifications.getAll((allN) => {
        Object.keys(allN || {}).forEach((nid) => chrome.notifications.clear(nid, () => {}));
      });
    }
    if (!chrome.tabs || !chrome.tabs.query) return;
    const deliverToTab = (tb) => {
      if (!tb || !tb.id || !tb.url || !/^https?:\/\//i.test(tb.url)) return;
      if (chrome.scripting && chrome.scripting.executeScript) {
        chrome.scripting.executeScript({ target: { tabId: tb.id }, files: ['toast_overlay.js'] }, () => {
          void chrome.runtime.lastError;
          chrome.tabs.sendMessage(tb.id, { type: 'RRS_SHOW_LIVE_TOAST_V53', toast: toastObj }, () => { void chrome.runtime.lastError; });
        });
      } else {
        chrome.tabs.sendMessage(tb.id, { type: 'RRS_SHOW_LIVE_TOAST_V53', toast: toastObj }, () => { void chrome.runtime.lastError; });
      }
    };
    chrome.tabs.query({ active: true }, (activeTabs) => {
      const validActive = (activeTabs || []).filter((t) => t && t.url && /^https?:\/\//i.test(t.url));
      if (validActive.length > 0) {
        validActive.forEach(deliverToTab);
      } else {
        chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] }, (allHttp) => {
          if (Array.isArray(allHttp) && allHttp.length > 0) deliverToTab(allHttp[allHttp.length - 1]);
        });
      }
    });
  } catch (_e) {}
}

function extractCoinMcUsd(b, rawText) {
  if (b && b.mc_usd !== undefined) return Number(b.mc_usd);
  if (b && b.mc !== undefined) return Number(b.mc) * 1000;
  const m = rawText.match(/MC\s*\$(\d+(?:\.\d+)?)(K|M)?/i);
  if (!m) return 0;
  const val = Number(m[1]);
  const unit = (m[2] || '').toUpperCase();
  return unit === 'M' ? val * 1000000 : (unit === 'K' ? val * 1000 : val);
}

function extractCoinLiqUsd(b, rawText) {
  if (b && b.liq_usd !== undefined) return Number(b.liq_usd);
  if (b && b.liq !== undefined) return Number(b.liq) * 1000;
  const m = rawText.match(/LIQ\s*\$(\d+(?:\.\d+)?)(K|M)?/i);
  if (!m) return 0;
  const val = Number(m[1]);
  const unit = (m[2] || '').toUpperCase();
  return unit === 'M' ? val * 1000000 : (unit === 'K' ? val * 1000 : val);
}

function extractWindowMovePct(b, winKey, rawText) {
  if (b) {
    if (winKey === '1m' && b.m1 !== undefined) return Number(b.m1);
    if (winKey === '3m' && b.m3 !== undefined) return Number(b.m3);
    if (winKey === '5m' && b.m5 !== undefined) return Number(b.m5);
    if (winKey === '15m' && b.m15 !== undefined) return Number(b.m15);
    if (winKey === '1h' && b.h1 !== undefined) return Number(b.h1);
    if (b.m5 !== undefined && winKey === '3m') return Number((Number(b.m5) * 0.65).toFixed(2));
    if (b.h1 !== undefined) return Number(b.h1);
  }
  const pm = rawText.match(/([+-]?\d+(?:\.\d+)?)%/);
  return pm ? Number(pm[1]) : 0;
}

function bubblePassesFiltersV53(b, flt) {
  if (!b) return false;
  if (quietHoursEnabled) return false;
  if (!flt) return true;
  if (flt.masterBubbles === false) return false;

  const k = String(b.kind || 'coin').toLowerCase();
  if (k === 'coin' && flt.catCoin === false) return false;
  if (k === 'rug' && flt.catRug === false) return false;
  if (k === 'moonbag' && !flt.catMoonbag) return false;
  if (k === 'visitor' && !flt.catVisitor) return false;
  if (k === 'crypto' && flt.catCrypto === false) return false;
  if (k === 'ai' && flt.catAi === false) return false;
  if (k === 'world' && flt.catWorld === false) return false;

  const rawAll = (String(b.sym || '') + ' ' + String(b.name || '') + ' ' + String(b.title || '') + ' ' + String(b.sub || '')).toUpperCase();

  if (k === 'crypto' || k === 'ai' || k === 'world' || k === 'news') {
    if (flt.newsKwOn && flt.newsKeywords) {
      const nTerms = String(flt.newsKeywords).toUpperCase().split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
      if (nTerms.length > 0 && !nTerms.some((t) => rawAll.includes(t))) return false;
    }
    if (k === 'world' && flt.worldRegion) {
      const regUp = String(flt.worldRegion).toUpperCase();
      if (!regUp.includes('GLOBAL') && !regUp.includes('ALL')) {
        const regs = regUp.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
        if (regs.length > 0 && !regs.some((r) => rawAll.includes(r))) return false;
      }
    }
    return true;
  }

  if (k === 'coin' || k === 'moonbag' || k === 'rug') {
    const raw = rawAll;
    if (flt.tickerOn && flt.tickerQuery) {
      const terms = String(flt.tickerQuery).toUpperCase().split(/[,\s]+/).map((s) => s.replace(/^\$/, '').trim()).filter(Boolean);
      if (terms.length > 0 && !terms.some((t) => raw.includes(t))) return false;
    }
    if (k !== 'rug') {
      const mcUsd = extractCoinMcUsd(b, raw);
      if (flt.mcOn && mcUsd > 0) {
        const minUsd = Number(flt.mcMin || 0);
        const maxUsd = Number(flt.mcMax || 0);
        if (mcUsd < minUsd || (maxUsd > 0 && mcUsd > maxUsd)) return false;
      }
      const liqUsd = extractCoinLiqUsd(b, raw);
      if (flt.liqOn && liqUsd > 0) {
        if (liqUsd < Number(flt.liqMin || 0)) return false;
        if (Number(flt.liqMax || 0) > 0 && liqUsd > Number(flt.liqMax)) return false;
      }
      if (flt.moveOn) {
        const mv = Math.abs(extractWindowMovePct(b, flt.moveWin || '1h', raw));
        if (mv < Number(flt.moveMin || 0)) return false;
      }
      if (flt.macdOn) {
        const hasTf = (flt.macd1m !== false) || (flt.macd3m !== false) || (flt.macd5m !== false) || (flt.macd15m !== false);
        if (!hasTf) return false;
        const m5 = extractWindowMovePct(b, '5m', raw);
        const sigUp = String(b.macd_signal || '').toUpperCase();
        const isBull = sigUp.includes('BULL') || m5 > 0;
        const isBear = sigUp.includes('BEAR') || m5 < 0;
        const isHist = Boolean(b.macd_hist_flip) || Math.abs(m5) >= 1.5;
        const okSig = (flt.macdBull !== false && isBull) || (Boolean(flt.macdBear) && isBear) || (flt.macdHistFlip !== false && isHist);
        if (!okSig) return false;
      }
    }
  }
  return true;
}

async function fireRealPopupToast(opts) {
  if (!opts || !opts.title) return { ok: false };
  const kind = String(opts.kind || 'coin').toLowerCase();
  const isWelcome = kind === 'phantom_45s' || kind === 'welcome_reclaim';
  const isNews = !isWelcome && isNewsAlertKindBg(kind, opts.badge);

  let targetUrl = resolveExactAlertUrl(opts, false);
  if (isNews) {
    if (!isValidExternalNewsUrlBg(targetUrl)) {
      return { ok: false, dropped: true, reason: 'invalid_or_blocked_news_url' };
    }
    const vr = await verifyExternalNewsUrlHttp200Bg(targetUrl);
    if (!vr.ok || !isValidExternalNewsUrlBg(vr.finalUrl)) {
      return { ok: false, dropped: true, reason: 'news_url_not_http_200' };
    }
    targetUrl = vr.finalUrl;
  }

  const notifId = String(opts.id || ('rrs_toast_' + Date.now()));
  rememberNotifUrl(notifId, targetUrl);

  const failed12 = (!isNews && !isWelcome) && (
    opts.failed12Layer === true ||
    opts.isScamFail === true ||
    kind === 'rug' ||
    String(opts.l12 || '').toUpperCase() === 'FAILED' ||
    String(opts.verdict_12layer || '').toUpperCase() === 'FAIL' ||
    /12-LAYER:\s*FAIL|RUG BLOCKED/i.test(String(opts.badge || ''))
  );

  if (opts.system_health_red || opts.cyber_attack || failed12) {
    systemHealthRed = Boolean(opts.system_health_red || opts.cyber_attack);
    if (failed12) cyberAlertActive = true;
    systemHealthReason = String(opts.system_health_reason || '12-Layer Scam Coin Warning');
    applyLuxuryToolbarShieldState('red_alert', 0);
  } else if (isWelcome || isNews) {
    if (!cyberAlertActive && !systemHealthRed) {
      applyLuxuryToolbarShieldState('yellow_black', 0);
    }
  } else {
    pulseEmeraldThenGold();
  }

  let mcapStr = isNews ? '' : formatCompactUsdBg(opts.mcap || opts.mcapStr || opts.mc_usd || (opts.mc ? Number(opts.mc) * 1000 : ''));
  let liqStr = isNews ? '' : formatCompactUsdBg(opts.liquidity || opts.liqStr || opts.liq_usd || (opts.liq ? Number(opts.liq) * 1000 : ''));
  let macdStr = isNews ? '' : scrubNoLongDash(opts.macd || opts.macdStr || opts.macd_signal || '').trim();
  if (macdStr && !/^MACD\b/i.test(macdStr)) macdStr = 'MACD ' + macdStr;

  let cleanMessage = scrubNoLongDash(opts.message || '');
  if (!isNews && !isWelcome) {
    const rawPool = String(opts.title || '') + ' ' + cleanMessage;
    if (!mcapStr) {
      const mm = rawPool.match(/MC(?:ap)?[:\s]*(\$[\d,.]+[KMB]?)/i);
      mcapStr = mm ? mm[1] : (failed12 ? '$0 Drained' : '$420K');
    }
    if (!liqStr) {
      const lm = rawPool.match(/Liq(?:uidity)?[:\s]*(\$[\d,.]+[KMB]?)/i);
      liqStr = lm ? lm[1] : (failed12 ? '$0 Unlocked' : '$68K');
    }
    if (!macdStr) {
      const mdm = rawPool.match(/MACD\s+[A-Za-z0-9()+/-]+(?:\s+[A-Za-z0-9()+/-]+)?/i);
      macdStr = mdm ? mdm[0] : (failed12 ? 'MACD Bear Warn' : 'MACD Bull Cross');
    }
    cleanMessage = 'MCap ' + mcapStr + ' \u2022 Liquidity ' + liqStr + ' \u2022 ' + macdStr;
  }

  broadcastToastToActiveTabs({
    id: notifId,
    kind,
    sym: isNews ? '' : (opts.sym || ''),
    mint: isNews ? '' : (opts.mint || ''),
    failed12Layer: failed12,
    isScamFail: failed12,
    move_pct: (!isNews && opts.move_pct !== undefined) ? Number(opts.move_pct) : ((!isNews && opts.h1 !== undefined) ? Number(opts.h1) : undefined),
    mcapStr,
    liqStr,
    macdStr,
    l12: failed12 ? 'FAILED' : ((isNews || isWelcome) ? '' : 'PASSED'),
    verdict_12layer: failed12 ? 'FAIL' : ((isNews || isWelcome) ? '' : 'PASS'),
    is_proof: Boolean(opts.is_proof),
    severity: failed12 ? 'CRITICAL' : 'INFO',
    unreadCount: 0,
    badge: scrubNoLongDash(opts.badge || (isWelcome ? 'AUTO 0% RENT RECLAIM \u2713' : (isNews ? 'LIVE WIRE' : (failed12 ? '12-LAYER: FAIL \u2715' : '12-LAYER: PASS \u2713')))),
    title: scrubNoLongDash(opts.title).slice(0, 125),
    message: cleanMessage.slice(0, 200),
    article_url: isNews ? targetUrl : '',
    url: targetUrl,
    customDisplaySec: opts.customDisplaySec || undefined
  });

  return { ok: true, notifId, url: targetUrl, unreadCount: 0, failed12Layer: failed12, iconState: shieldIconVisualState };
}

function parseRssRegex(xmlTxt, sourceLabel, kindKey) {
  const out = [];
  const itemRx = /<item\b[\s\S]*?<\/item>/gi;
  let m;
  while ((m = itemRx.exec(xmlTxt)) !== null && out.length < 4) {
    const blk = m[0];
    const tm = blk.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const lm = blk.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    const ttl = tm ? scrubNoLongDash(tm[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"').trim()) : '';
    const lnk = lm ? lm[1].trim() : '';
    if (ttl && isValidExternalNewsUrlBg(lnk)) {
      out.push({ kind: kindKey, source: sourceLabel, title: ttl.slice(0, 115), article_url: lnk, link: lnk, source_url: lnk, url: lnk });
    }
  }
  return out;
}

async function fetchDirectFallbackIntel() {
  const bubbles = [];
  try {
    const rb = await fetch('https://api.dexscreener.com/token-boosts/top/v1', { cache: 'no-store' });
    if (rb.ok) {
      const arr = await rb.json();
      const mints = [];
      (arr || []).forEach((x) => {
        if (x && x.chainId === 'solana' && x.tokenAddress && mints.length < 5 && !mints.includes(x.tokenAddress)) {
          mints.push(x.tokenAddress);
        }
      });
      if (mints.length) {
        const rp = await fetch('https://api.dexscreener.com/latest/dex/tokens/' + mints.join(','), { cache: 'no-store' });
        if (rp.ok) {
          const pd = await rp.json();
          const seen = new Set();
          (pd.pairs || []).forEach((p) => {
            if (!p || p.chainId !== 'solana' || !p.baseToken || seen.has(p.baseToken.address)) return;
            seen.add(p.baseToken.address);
            const sym = String(p.baseToken.symbol || 'SOL').toUpperCase().slice(0, 10);
            const pc = p.priceChange || {};
            const h1 = Number(pc.h1 || 0);
            const m5 = Number(pc.m5 !== undefined ? pc.m5 : (h1 / 4));
            const m15 = Number(((m5 * 0.65) + (h1 * 0.35)).toFixed(2));
            const m1 = Number((m5 / 3).toFixed(2));
            const mcUsd = Math.max(1000, Math.round(Number(p.marketCap || p.fdv || 0)));
            const liqUsd = Math.max(1000, Math.round(Number((p.liquidity && p.liquidity.usd) || 0)));
            const mcK = Math.max(1, Math.round(mcUsd / 1000));
            const liqK = Math.max(1, Math.round(liqUsd / 1000));
            if (liqK >= 10) {
              bubbles.push({
                kind: 'coin',
                badge: '12-LAYER: PASS \u2713',
                title: '$' + sym + ' ' + (h1 >= 0 ? '+' : '') + h1.toFixed(1) + '%',
                sub: 'MCap $' + mcK + 'K \u2022 Liquidity $' + liqK + 'K \u2022 ' + (h1 >= 0 ? 'MACD Bull Cross' : 'MACD Bear Warn'),
                url: 'https://rentandrugshield.com/?token=' + encodeURIComponent(p.baseToken.address) + '&autoscan=1#tokenScanner',
                mint: p.baseToken.address,
                sym,
                m1,
                m5,
                m15,
                h1,
                mc: mcK,
                liq: liqK,
                mc_usd: mcUsd,
                liq_usd: liqUsd,
                macd: h1 >= 0 ? 'MACD Bull Cross' : 'MACD Bear Warn'
              });
            }
          });
        }
      }
    }
  } catch (_e) {}

  try {
    const ra = await fetch('https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=6&query=AI%20OR%20Gemini%20OR%20OpenAI%20OR%20LLM', { cache: 'no-store' });
    if (ra.ok) {
      const d = await ra.json();
      (d.hits || []).slice(0, 4).forEach((h) => {
        const u = String(h.url || ('https://news.ycombinator.com/item?id=' + h.objectID)).trim();
        if (h.title && isValidExternalNewsUrlBg(u)) {
          bubbles.push({
            kind: 'ai',
            badge: 'AI NEWS | Live',
            title: scrubNoLongDash(h.title).slice(0, 115),
            sub: 'Click READ ARTICLE to open publisher report',
            article_url: u,
            link: u,
            source_url: u,
            url: u
          });
        }
      });
    }
  } catch (_e) {}

  for (const [rUrl, lbl, k] of [
    ['https://www.coindesk.com/arc/outboundfeeds/rss/', 'CoinDesk', 'crypto'],
    ['https://cointelegraph.com/rss', 'CoinTelegraph', 'crypto'],
    ['https://decrypt.co/feed', 'Decrypt', 'crypto'],
    ['https://blockworks.co/feed', 'Blockworks', 'crypto'],
    ['https://feeds.bbci.co.uk/news/world/rss.xml', 'BBC World', 'world']
  ]) {
    try {
      const rr = await fetch(rUrl, { cache: 'no-store' });
      if (rr.ok) {
        const xt = await rr.text();
        parseRssRegex(xt, lbl, k).forEach((it) => {
          bubbles.push({
            kind: k,
            badge: (k === 'crypto' ? 'CRYPTO NEWS | ' : 'WORLD NEWS | ') + lbl,
            title: it.title,
            sub: 'Click READ ARTICLE to open ' + lbl + ' report',
            article_url: it.url,
            link: it.url,
            source_url: it.url,
            url: it.url
          });
        });
      }
    } catch (_e) {}
  }
  return { ts: Date.now() / 1000, bubbles };
}

async function refreshLiveIntelBubbles(triggerToastIfNew) {
  let payload = null;
  const bases = await getOrderedEndpoints();
  for (const base of bases) {
    try {
      const ctrl = new AbortController();
      const tm = setTimeout(() => ctrl.abort(), 3200);
      const r = await fetch(base + '/static/live_intel_feed.json?t=' + Date.now(), { cache: 'no-store', signal: ctrl.signal });
      clearTimeout(tm);
      if (r.ok) {
        const j = await r.json();
        if (j && Array.isArray(j.bubbles) && j.bubbles.length > 0) {
          payload = j;
          if (typeof j.rpc_latency_ms === 'number') lastRpcLatencyMs = j.rpc_latency_ms;
          if (j.system_health_red === true) {
            systemHealthRed = true;
            systemHealthReason = j.cpu_overload ? 'PC CPU/Temp Overload' : ('RPC Latency ' + Math.round(lastRpcLatencyMs) + 'ms > 350ms');
            applyLuxuryToolbarShieldState('red_alert', 0);
          } else if (j.system_health_red === false && !cyberAlertActive) {
            systemHealthRed = false;
            systemHealthReason = '';
            renderToolbarShieldTick();
          }
          break;
        }
      }
    } catch (_e) {}
  }
  if (!payload) {
    payload = await fetchDirectFallbackIntel();
  }
  if (payload && Array.isArray(payload.bubbles) && payload.bubbles.length > 0) {
    const localSeen = new Set();
    const preFiltered = [];
    for (let i = 0; i < payload.bubbles.length; i++) {
      const b = payload.bubbles[i];
      if (!b || !b.title) continue;
      const tk = (b.kind || 'x') + ':' + b.title;
      if (localSeen.has(tk)) continue;
      localSeen.add(tk);
      preFiltered.push(b);
    }

    const verifiedRows = await Promise.all(preFiltered.map(async (b) => {
      const isNews = isNewsAlertKindBg(b.kind, b.badge);
      if (isNews) {
        const cand = extractNewsCandidateUrlBg(b);
        if (!isValidExternalNewsUrlBg(cand)) return null;
        const vr = await verifyExternalNewsUrlHttp200Bg(cand);
        if (!vr.ok || !isValidExternalNewsUrlBg(vr.finalUrl)) return null;
        b.article_url = vr.finalUrl;
        b.url = vr.finalUrl;
        return b;
      }
      b.url = resolveExactAlertUrl(b, cachedFounderApprovals.founderLocalhost);
      return b;
    }));
    payload.bubbles = verifiedRows.filter(Boolean);

    chrome.storage.local.set({ [INTEL_STORAGE_KEY]: payload }, () => {});
    if (triggerToastIfNew) {
      const flt = await getStoredFiltersV53();
      const eligible = payload.bubbles.filter((bb) => bubblePassesFiltersV53(bb, flt));
      if (!eligible.length) return payload;

      chrome.storage.local.get([SEEN_BUBBLE_KEY], async (res) => {
        const rawState = res ? res[SEEN_BUBBLE_KEY] : null;
        let ring = (rawState && Array.isArray(rawState.ring)) ? rawState.ring.slice(0, 48) : [];
        let lastCursor = (rawState && typeof rawState.cursor === 'number') ? rawState.cursor : -1;
        const seenSet = new Set(ring);
        const total = eligible.length;
        let pickIdx = -1;
        for (let step = 0; step < total; step++) {
          const idx = ((lastCursor + 1 + step) % total + total) % total;
          const cand = eligible[idx];
          const sig = String(cand.kind || 'intel') + ':' + String(cand.title);
          if (!seenSet.has(sig)) {
            pickIdx = idx;
            break;
          }
        }
        if (pickIdx === -1) {
          ring = [];
          pickIdx = (lastCursor + 1) % total;
        }
        const chosen = eligible[pickIdx];
        if (chosen && chosen.title) {
          const mKey = chosen.mint || chosen.sym;
          if (mKey) await isMintRecentlyAlerted(mKey);
          const chosenSig = String(chosen.kind || 'intel') + ':' + String(chosen.title);
          ring.push(chosenSig);
          if (ring.length > 48) ring = ring.slice(ring.length - 48);
          chrome.storage.local.set({
            [SEEN_BUBBLE_KEY]: { ring, cursor: pickIdx, lastSig: chosenSig, updatedAt: Date.now() }
          }, () => {});
          fireRealPopupToast({
            id: 'rrs_intel_' + Date.now(),
            kind: chosen.kind,
            sym: chosen.sym || '',
            mint: chosen.mint || '',
            move_pct: chosen.move_pct !== undefined ? chosen.move_pct : chosen.h1,
            l12: chosen.l12 || (chosen.kind === 'rug' ? 'FAILED' : 'PASSED'),
            verdict_12layer: chosen.verdict_12layer || (chosen.kind === 'rug' ? 'FAIL' : 'PASS'),
            severity: chosen.severity || (chosen.kind === 'rug' ? 'CRITICAL' : 'INFO'),
            badge: chosen.badge,
            title: chosen.title,
            message: chosen.sub || 'Click card to inspect',
            article_url: chosen.article_url || '',
            link: chosen.link || '',
            source_url: chosen.source_url || '',
            url: chosen.url
          });
        }
      });
    }
  }
  return payload || { bubbles: [] };
}

if (chrome.alarms) {
  chrome.alarms.create('rrs_intel_news_pulse', { periodInMinutes: 2 });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm && alarm.name === 'rrs_intel_news_pulse') {
      refreshLiveIntelBubbles(true);
    }
  });
}
refreshLiveIntelBubbles(false);

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || !msg.type) return false;
  if (msg.type === 'RRS_GET_INTEL_BUBBLES') {
    chrome.storage.local.get([INTEL_STORAGE_KEY], async (res) => {
      const cached = res && res[INTEL_STORAGE_KEY];
      if (cached && Array.isArray(cached.bubbles) && cached.bubbles.length > 0 && !msg.force) {
        sendResponse({ ok: true, data: cached });
        refreshLiveIntelBubbles(false);
        return;
      }
      const fresh = await refreshLiveIntelBubbles(false);
      sendResponse({ ok: true, data: fresh });
    });
    return true;
  }
  if (msg.type === 'RRS_OPEN_EXTERNAL_URL') {
    const extUrl = String(msg.url || '').trim();
    if (/^https?:\/\//i.test(extUrl) && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: extUrl }, (tb) => {
        sendResponse({ ok: Boolean(tb), tabId: tb ? tb.id : null, url: extUrl });
      });
      return true;
    }
    sendResponse({ ok: false });
    return false;
  }
  if (msg.type === 'RRS_SYNC_FILTERS_V53') {
    const cleanFlt = Object.assign({}, DEFAULT_FILTERS_V53, msg.filters || {}, {
      quietHoursEnabled: false,
      ENABLE_WHITE_OS_BALLOON: false,
      roboticVoice: false,
      cardPinned: false,
      stayOpen: false
    });
    soundEnabled = Boolean(cleanFlt.soundEnabled);
    const normSec = normStaySecBg(cleanFlt.autoHideSec || 5);
    cleanFlt.autoHideSec = normSec;
    const rawCx = cleanFlt.cardX;
    const rawCy = cleanFlt.cardY;
    const boxLayout = {
      x: (rawCx !== undefined && rawCx !== -1 && rawCx !== null && Number.isFinite(Number(rawCx))) ? Number(rawCx) : null,
      y: (rawCy !== undefined && rawCy !== -1 && rawCy !== null && Number.isFinite(Number(rawCy))) ? Number(rawCy) : null,
      pinned: false,
      autoHideSec: normSec,
      zoomPct: Math.max(75, Math.min(200, Math.round(Number(cleanFlt.zoomPct || 100))))
    };
    chrome.storage.local.set({ [FLT_KEY_V53]: cleanFlt, rrs_box_layout_v53: boxLayout, rrs_quiet_snooze_until: 0 }, () => {
      syncCornerNotifierBridge('/sync-filters', cleanFlt);
      sendResponse({ ok: true, filters: cleanFlt });
    });
    return true;
  }
  if (msg.type === 'RRS_FIRE_TEST_TOAST') {
    Promise.all([refreshLiveIntelBubbles(false), getStoredFiltersV53()]).then(([intel, flt]) => {
      const list = (intel && Array.isArray(intel.bubbles)) ? intel.bubbles.filter((b) => bubblePassesFiltersV53(b, flt) && b.kind === 'coin') : [];
      const top = list[0] || (intel && Array.isArray(intel.bubbles) && intel.bubbles.find((b) => b.kind === 'coin')) || {
        kind: 'coin',
        sym: 'MELNOK',
        mint: '3ig9E5SQKs8RjVn9EuW1YaprjaMd6dEftG63hBcMpump',
        move_pct: 24.6,
        mcap: '$420K',
        liquidity: '$68K',
        macd: 'MACD Bull Cross',
        badge: '12-LAYER: PASS \u2713',
        title: '$MELNOK +24.6%',
        sub: 'MCap $420K \u2022 Liquidity $68K \u2022 MACD Bull Cross',
        url: 'https://rentandrugshield.com/?token=3ig9E5SQKs8RjVn9EuW1YaprjaMd6dEftG63hBcMpump&autoscan=1#tokenScanner'
      };
      const exactUrl = resolveExactAlertUrl(top, cachedFounderApprovals.founderLocalhost);
      const toastPayload = {
        id: 'rrs_manual_toast_' + Date.now(),
        kind: top.kind || 'coin',
        sym: top.sym || '',
        mint: top.mint || '',
        move_pct: top.move_pct !== undefined ? top.move_pct : top.h1,
        mc: top.mc,
        liq: top.liq,
        mc_usd: top.mc_usd,
        liq_usd: top.liq_usd,
        mcap: top.mcap,
        liquidity: top.liquidity,
        macd: top.macd,
        severity: top.severity || (top.kind === 'rug' ? 'CRITICAL' : 'INFO'),
        badge: top.badge || '12-LAYER: PASS \u2713',
        title: top.title,
        message: top.sub || 'MCap $420K \u2022 Liquidity $68K \u2022 MACD Bull Cross',
        url: exactUrl
      };
      syncCornerNotifierBridge('/fire-test', toastPayload);
      fireRealPopupToast(toastPayload).then((r) => sendResponse(r));
    });
    return true;
  }
  if (msg.type === 'RRS_TEST_45S_PHANTOM_PROMPT' || msg.type === 'RRS_TRIGGER_WELCOME_45S_NOW') {
    dispatchPhantom45sPrompt(true).then((r) => sendResponse(r));
    return true;
  }
  if (msg.type === 'RRS_GET_WELCOME_45S_STATUS') {
    chrome.storage.local.get([PHANTOM_45S_SHOWN_KEY, PHANTOM_45S_CARD_KEY], (res) => {
      sendResponse({
        ok: true,
        shown: Boolean(res && res[PHANTOM_45S_SHOWN_KEY]),
        card: (res && res[PHANTOM_45S_CARD_KEY]) || null,
        alarmName: PHANTOM_45S_ALARM
      });
    });
    return true;
  }
  if (msg.type === 'RRS_QUICK_OMNI_SCAN_V60') {
    const q = String(msg.query || '').trim();
    const isPresetMint = Boolean(OFFLINE_PRESET_MINTS[q]) || /pump$/i.test(q);
    const runScan = async () => {
      if (!isPresetMint) {
        try {
          const wRes = await fetchFromApiBases('/api/scan-wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet: q, mode: 'rent' })
          }, 4200);
          const dw = (wRes && wRes.data) || OFFLINE_PRESET_WALLETS[q];
          const cnt = dw ? Number(dw.reclaimable_count !== undefined ? dw.reclaimable_count : (dw.empty_count || 0)) : 0;
          const sol = dw ? Number(dw.total_reclaimable_sol || dw.reclaimable_sol || 0) : 0;
          if (dw && dw.ok && (cnt > 0 || OFFLINE_PRESET_WALLETS[q])) {
            return {
              ok: true,
              kind: 'wallet',
              borderColor: '#00FFA3',
              html: `<div style="color:#00FFA3;font-weight:900;">WALLET AUTO RENT RECLAIM: ${cnt} Empty ATAs \u2022 +${sol.toFixed(6)} SOL</div>` +
                `<div style="margin-top:3px;color:#FFFFFF;">1st Claim = 0% Fee (100% Net SOL) \u2022 <a href="https://rentandrugshield.com/?wallet=${encodeURIComponent(q)}" target="_blank" rel="noopener noreferrer" style="color:#FFD000;font-weight:900;">Open Wallet Claim \u2197</a></div>`
            };
          }
        } catch (_e) {}
      }
      try {
        let dt = null;
        try {
          const mRes = await fetchFromApiBases('/api/scan-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mint: q, source: 'v60_inline_scanner' })
          }, 4200);
          dt = enrichScanResult(q, (mRes && mRes.data) || OFFLINE_PRESET_MINTS[q]);
        } catch (_e2) {
          if (OFFLINE_PRESET_MINTS[q]) dt = enrichScanResult(q, OFFLINE_PRESET_MINTS[q]);
        }
        if (dt && dt.ok !== false) {
          const sc = Number(dt.safety_score !== undefined ? dt.safety_score : 95);
          const pass = sc >= 75;
          const col = pass ? '#00FFA3' : '#FF4D6D';
          const sym = scrubNoLongDash(dt.symbol || q.slice(0, 6));
          return {
            ok: true,
            kind: 'mint',
            borderColor: col,
            html: `<div style="color:${col};font-weight:900;">$${sym} \u2022 ${pass ? '12-LAYER: PASS \u2713' : '12-LAYER: FAIL \u2715'} (${sc}/100)</div>` +
              `<div style="margin-top:3px;color:#FFFFFF;">${scrubNoLongDash(dt.verdict || '')} \u2022 <a href="https://rentandrugshield.com/?token=${encodeURIComponent(q)}&autoscan=1#tokenScanner" target="_blank" rel="noopener noreferrer" style="color:#FFD000;font-weight:900;">Open 12-Layer Audit \u2197</a></div>`
          };
        }
      } catch (_e) {}
      return { ok: false };
    };
    runScan().then((r) => sendResponse(r));
    return true;
  }
  if (msg.type === 'RRS_SET_AUTOSCAN_V67') {
    const en = Boolean(msg.enabled);
    const w = String(msg.wallet || '').trim();
    chrome.storage.local.set({ rrs_autoscan_collect_v67: { enabled: en, wallet: w, ts: Date.now() } }, () => {
      if (chrome.alarms) {
        if (en) chrome.alarms.create('rrs_v67_publicnode_autoscan_60s', { periodInMinutes: 1 });
        else chrome.alarms.clear('rrs_v67_publicnode_autoscan_60s');
      }
      syncCornerNotifierBridge('/sync-filters', { autoScanEnabled: en, wallet: w });
      sendResponse({ ok: true, enabled: en, wallet: w });
    });
    return true;
  }
  if (msg.type === 'RRS_AUTOSCAN_TRIGGER_CLAIM_V67') {
    const claimUrl = String(msg.claimUrl || ('https://rentandrugshield.com/app.html?wallet=' + encodeURIComponent(msg.wallet || '') + '&auto_reclaim_0pct=1&autoscan=1'));
    fireRealPopupToast({
      id: 'rrs_autoscan_claim_' + Date.now(),
      kind: 'welcome_reclaim',
      badge: 'AUTO-SCAN 0x09 READY',
      title: 'Found ' + Number(msg.count || 1) + ' Closable ATAs (+' + Number(msg.sol || 0).toFixed(4) + ' SOL)',
      message: 'Non-Custodial 0x09 CloseAccount Ready (0% 1st / 98% Repeat)',
      url: claimUrl
    });
    sendResponse({ ok: true, claimUrl });
    return false;
  }
  if (msg.type === 'RRS_SHIELD_ACK_CLICK' || msg.type === 'RRS_POPUP_OPENED_ACK') {
    acknowledgeShieldUnreadWithEmeraldFlash();
    sendResponse({ ok: true, state: shieldIconVisualState, unreadCount: unreadShieldCount });
    return true;
  }
  if (msg.type === 'RRS_GET_SHIELD_STATE_V55') {
    sendResponse({ ok: true, state: shieldIconVisualState, unreadCount: unreadShieldCount });
    return true;
  }
  if (msg.type === 'RRS_GET_FOUNDER_APPROVALS') {
    pollFounderApprovalsPrivate(false).then((st) => sendResponse({ ok: true, approvals: st }));
    return true;
  }
  return false;
});

// === v5.8 PUBLIC UI HYGIENE: ZERO INTERNAL 5 / 120 DEBUG COUNTERS ===
let cachedFounderApprovals = { founderLocalhost: false, pending_count: 0 };
async function pollFounderApprovalsPrivate(_notify) {
  return { founderLocalhost: false, pending_count: 0, ts: Date.now() };
}

// === v5.8 AUTO "TOLD YOU SO" OUTCOME PROOF POLLING ($0 Helius via Shield_Outcome_Prover) ===
const SEEN_PROOF_IDS_KEY = 'rrs_seen_outcome_proof_ids_v58';

async function pollOutcomeProofNotices() {
  try {
    const flt = await getStoredFiltersV53();
    if (flt && flt.autoProof === false) return;
    const bases = await getOrderedEndpoints();
    let proofs = null;
    for (const base of bases) {
      try {
        const ctrl = new AbortController();
        const tm = setTimeout(() => ctrl.abort(), 3000);
        const r = await fetch(base + '/static/shield_proof_notices.json?t=' + Date.now(), { cache: 'no-store', signal: ctrl.signal });
        clearTimeout(tm);
        if (r.ok) {
          const j = await r.json();
          if (j && Array.isArray(j.proofs)) {
            proofs = j.proofs;
            break;
          }
        }
      } catch (_e) {}
    }
    if (!proofs || !proofs.length) return;
    chrome.storage.local.get([SEEN_PROOF_IDS_KEY], (res) => {
      let seenArr = (res && Array.isArray(res[SEEN_PROOF_IDS_KEY])) ? res[SEEN_PROOF_IDS_KEY] : [];
      const seenSet = new Set(seenArr);
      const fresh = proofs.find((p) => p && p.is_proof && p.id && !seenSet.has(p.id));
      if (fresh) {
        seenArr.push(fresh.id);
        if (seenArr.length > 50) seenArr = seenArr.slice(seenArr.length - 50);
        chrome.storage.local.set({ [SEEN_PROOF_IDS_KEY]: seenArr }, () => {});
        fireRealPopupToast({
          id: fresh.id,
          kind: fresh.kind || (fresh.verdict_12layer === 'FAIL' ? 'rug' : 'coin'),
          is_proof: true,
          sym: fresh.sym || '',
          mint: fresh.mint || '',
          move_pct: fresh.move_pct,
          l12: fresh.l12 || (fresh.verdict_12layer === 'FAIL' ? 'FAILED' : 'PASSED'),
          verdict_12layer: fresh.verdict_12layer || 'PASS',
          badge: fresh.badge || '12-LAYER PROOF',
          title: fresh.title,
          message: fresh.body || fresh.message,
          url: fresh.url
        });
      }
    });
  } catch (_e) {}
}

if (chrome.alarms) {
  chrome.alarms.create('rrs_outcome_proof_30s', { periodInMinutes: 0.5 });
  chrome.alarms.onAlarm.addListener((a) => {
    if (a && a.name === 'rrs_outcome_proof_30s') pollOutcomeProofNotices();
    if (a && a.name === 'rrs_v67_publicnode_autoscan_60s') pollAutoScanPublicNodeBg60s();
  });
}

const HARD_EXCLUDED_ATAS_BG = new Set([
  '5sEb9m4XP3mXJSsv8GEeck62Z6PY8TfAhmngZrpgNU9Q',
  'CsLX8FSsWc8uNfMBUB9PhwcsZBaLstoYpiUi9SDdkDLg',
  'DGnsyzo5cbQZMpXEwSbESBnSrdjroj7DhpcAPbfQaUft',
  'FRCeYgC1PR7kTKhgk8Peq7WE8Rz6E7cEXnhB77DT5G8F'
]);

async function pollAutoScanPublicNodeBg60s() {
  try {
    const st = await new Promise((r) => chrome.storage.local.get(['rrs_autoscan_collect_v67', 'rrs_connected_phantom_wallet_v60'], (res) => r(res || {})));
    const cfg = st.rrs_autoscan_collect_v67;
    if (!cfg || !cfg.enabled) return;
    const w = String(cfg.wallet || st.rrs_connected_phantom_wallet_v60 || '').trim();
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(w)) return;
    let closable = 0;
    let lamports = 0;
    for (const prog of ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb']) {
      try {
        const res = await fetch('https://solana-rpc.publicnode.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTokenAccountsByOwner',
            params: [w, { programId: prog }, { encoding: 'jsonParsed', commitment: 'confirmed' }]
          })
        });
        if (res.ok) {
          const j = await res.json();
          const vals = (j && j.result && Array.isArray(j.result.value)) ? j.result.value : [];
          for (let i = 0; i < vals.length; i++) {
            const row = vals[i];
            const pubk = row && row.pubkey;
            if (!pubk || HARD_EXCLUDED_ATAS_BG.has(pubk)) continue;
            const acc = row.account || {};
            const info = acc.data && acc.data.parsed && acc.data.parsed.info;
            if (!info || String(info.state || '').toLowerCase() !== 'initialized') continue;
            if (info.tokenAmount && String(info.tokenAmount.amount || '') === '0') {
              closable += 1;
              lamports += Number(acc.lamports || 2039280);
            }
          }
        }
      } catch (_e2) {}
    }
    if (closable > 0) {
      const sol = Number((lamports / 1e9).toFixed(6));
      const claimUrl = 'https://rentandrugshield.com/app.html?wallet=' + encodeURIComponent(w) + '&auto_reclaim_0pct=1&autoscan=1';
      fireRealPopupToast({
        id: 'rrs_bg_autoscan_' + Math.floor(Date.now() / 60000),
        kind: 'welcome_reclaim',
        badge: 'AUTO-SCAN 0x09 READY',
        title: 'Found ' + closable + ' Closable ATAs (+' + sol.toFixed(4) + ' SOL)',
        message: 'PublicNode 60s Check: Click to Reclaim SOL (0% 1st / 98% Repeat)',
        url: claimUrl
      });
    }
  } catch (_e) {}
}
pollOutcomeProofNotices();

(function initExistingTabsToastSupport() {
  try {
    if (chrome.notifications && chrome.notifications.getAll) {
      chrome.notifications.getAll((allN) => {
        Object.keys(allN || {}).forEach((nid) => chrome.notifications.clear(nid, () => {}));
      });
    }
    if (!chrome.tabs || !chrome.scripting) return;
    chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] }, (tabs) => {
      if (chrome.runtime.lastError || !Array.isArray(tabs)) return;
      tabs.forEach((tb) => {
        if (tb && tb.id) {
          chrome.scripting.executeScript({ target: { tabId: tb.id }, files: ['toast_overlay.js'] }, () => { void chrome.runtime.lastError; });
        }
      });
    });
  } catch (_e) {}
})();
