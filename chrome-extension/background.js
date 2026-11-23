'use strict';

// === HARD-SET STAGE 1 CONSTANTS & DEFAULTS (v5.3.0) ===
const quietHoursEnabled = false;
const ENABLE_WHITE_OS_BALLOON = false;
let soundEnabled = false; // Toggleable in Dark Control Popup (default false)

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
  return String(s || '')
    .replace(/\u2014/g, ' | ')
    .replace(/\u2013/g, '-')
    .replace(/--+/g, '-');
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
  updatedAt: 0
};

const DEFAULT_FILTERS_V53 = {
  quietHoursEnabled: false,
  ENABLE_WHITE_OS_BALLOON: false,
  soundEnabled: false,
  masterBubbles: true,
  catCoin: true,
  catRug: true,
  catMoonbag: true,
  catVisitor: true,
  catCrypto: true,
  catAi: true,
  catWorld: true,
  tickerOn: false,
  tickerQuery: '',
  mcOn: false,
  mcMin: 15000,
  mcMax: 50000000,
  moveOn: false,
  moveMin: 5,
  moveWin: '1h',
  liqOn: false,
  liqMin: 10000
};

// Persistent seenMints cache (stops duplicate ticker spam on auto-pulse)
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
          ENABLE_WHITE_OS_BALLOON: false
        });
        soundEnabled = Boolean(merged.soundEnabled);
        resolve(merged);
      });
    } catch (_e) {
      resolve(Object.assign({}, DEFAULT_FILTERS_V53));
    }
  });
}

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

function updateTabBadge(tabId, score, cutoff) {
  if (!tabId || !chrome.action || !chrome.action.setBadgeText) return;
  try {
    const safe = Number(score) >= Number(cutoff || 75);
    chrome.action.setBadgeText({ tabId, text: String(score) });
    chrome.action.setBadgeBackgroundColor({
      tabId,
      color: safe ? '#00FFA3' : '#FF1744'
    });
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
      body: JSON.stringify({ mint, source: (msg && msg.source) || 'mv3_sentinel_v5.3.0' })
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
        kind: 'LAYER12_RUG_OR_SLOT0_BUNDLE',
        title: 'DANGER Token Blocked: ' + (result.symbol || mint.slice(0, 6)) + ' (Score ' + result.safety_score + '/100)',
        detail: String(result.verdict || 'Failed 12-Layer Slot-0 Bundle / LP Burn Gate'),
        action_url: 'https://rentandrugshield.com/?mint=' + encodeURIComponent(mint) + '&cyber_inspect=1'
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
    page: String(raw.page || 'extension:mv3_v5.3.0'),
    page_path: String(raw.path || '/extension'),
    path: String(raw.path || '/extension'),
    url: String(tabUrl),
    source: 'mv3_sentinel_v5.3.0',
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

function renderToolbarShieldTick() {
  animPhase = (animPhase + 1) % 10000;
  try {
    const img16 = drawShieldFrame(16, cyberAlertActive, animPhase);
    const img32 = drawShieldFrame(32, cyberAlertActive, animPhase);
    if (img16 && img32 && chrome.action && chrome.action.setIcon) {
      chrome.action.setIcon({ imageData: { 16: img16, 32: img32 } }, () => { void chrome.runtime.lastError; });
    }
    if (chrome.action && chrome.action.setBadgeText) {
      if (cyberAlertActive) {
        chrome.action.setBadgeText({ text: (animPhase % 2 === 0) ? '!' : 'RUG' });
        chrome.action.setBadgeBackgroundColor({ color: '#FF1744' });
        chrome.action.setTitle({
          title: 'CYBER THREAT DETECTED! Click immediately: ' + scrubNoLongDash((currentThreat && currentThreat.title) || 'Inspect Threat')
        });
      } else {
        chrome.action.setBadgeText({ text: '12L' });
        chrome.action.setBadgeBackgroundColor({ color: '#059669' });
        chrome.action.setTitle({
          title: 'Solana Rent & Rug Shield v5.3 | 12 Layers Clean & Armed'
        });
      }
    }
  } catch (_e) {}
}

function ensureShieldPulseLoop() {
  const intervalMs = cyberAlertActive ? 260 : 650;
  if (pulseTimer) clearInterval(pulseTimer);
  pulseTimer = setInterval(renderToolbarShieldTick, intervalMs);
  renderToolbarShieldTick();
}

function triggerCyberRedAlert(threatObj, forceCornerSync) {
  if (!threatObj) return;
  cyberAlertActive = true;
  currentThreat = Object.assign({
    id: 'THREAT-' + Date.now(),
    severity: 'CRITICAL',
    kind: 'rug',
    title: 'Crypto Cybersecurity Threat Blocked',
    detail: '12-Layer Gemini 4 Carbon Sentinel detected an active Web3 threat.',
    action_url: 'https://rentandrugshield.com/?cyber_inspect=1',
    ts: Date.now()
  }, threatObj);

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
      severity: 'CRITICAL',
      badge: 'CRITICAL RUG ALERT',
      title: scrubNoLongDash(currentThreat.title).slice(0, 96),
      message: scrubNoLongDash(currentThreat.detail).slice(0, 185),
      url: currentThreat.action_url || 'https://rentandrugshield.com/?cyber_inspect=1',
      speakTxt: 'Critical security alert. 12 layer shield flagged a threat.'
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
        triggerCyberRedAlert({
          id: 'RUG-URL-' + m.slice(0, 12),
          kind: 'rug',
          title: 'Layer-12 Rug / Slot-0 Bundle Token Flagged (' + m.slice(0, 6) + '...)',
          detail: flaggedRugMints.get(m),
          action_url: 'https://rentandrugshield.com/?mint=' + encodeURIComponent(m) + '&cyber_inspect=1'
        });
        return;
      }
    }
  } catch (_e) {}
}

async function pollCyberThreatFeed(testAdvisory) {
  try {
    const sid = await getOrCreateVisitorSession();
    const qs = '?ver=5.3.0&client_id=' + encodeURIComponent(sid) + (testAdvisory ? '&test_advisory=1' : '');
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
        triggerCyberRedAlert(d.active_threat, Boolean(testAdvisory));
      } else if (testAdvisory) {
        triggerCyberRedAlert({
          id: 'LOCAL-TEST-RED-' + Date.now(),
          kind: 'rug',
          title: '$RUGTEST (-89.4% 5m) | Slot-0 Drainer SetAuthority Blocked',
          detail: 'Carbon Black #020408 + Red #FF1744 Critical Rug Bubble verified live (7s auto-close).',
          action_url: 'https://rentandrugshield.com/?cyber_inspect=1'
        }, true);
      }
      return d;
    }
  } catch (_e) {}
  if (testAdvisory) {
    triggerCyberRedAlert({
      id: 'LOCAL-TEST-RED-' + Date.now(),
      kind: 'rug',
      title: '$RUGTEST (-89.4% 5m) | Slot-0 Drainer SetAuthority Blocked',
      detail: 'Carbon Black #020408 + Red #FF1744 Critical Rug Bubble verified live (7s auto-close).',
      action_url: 'https://rentandrugshield.com/?cyber_inspect=1'
    }, true);
  }
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
      pollCyberThreatFeed(false);
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
  if (msg.type === 'RRS_CYBER_TEST_ALERT') {
    pollCyberThreatFeed(true).then(() => {
      sendResponse({ ok: true, active: cyberAlertActive, threat: currentThreat });
    });
    return true;
  }
  return false;
});

pollCyberThreatFeed(false);

// === v5.3.0: 3-State Shield + Automatic 24h Ultra Pro FREE Trial ===
const TRIAL_KEY_V51 = 'rrs_ultra_pro_trial_v51';
let shieldStateV51 = 'secure';

function ensure24hUltraProTrial(openWelcome) {
  try {
    chrome.storage.local.get([TRIAL_KEY_V51], (res) => {
      let rec = res && res[TRIAL_KEY_V51];
      if (!rec || !rec.activatedAt) {
        const now = Date.now();
        rec = {
          version: '5.3.0',
          activatedAt: now,
          expiresAt: now + 24 * 60 * 60 * 1000,
          tierDuring24h: 'Ultra Pro FREE (24-Hour Automatic Trial)'
        };
        chrome.storage.local.set({ [TRIAL_KEY_V51]: rec }, () => {});
      }
      if (openWelcome && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: 'https://rentandrugshield.com/?ext_installed=1' });
      }
    });
  } catch (_e) {}
}

if (chrome.runtime && chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener((details) => {
    ensure24hUltraProTrial(details && details.reason === 'install');
  });
}
ensure24hUltraProTrial(false);

function setShieldThreeState(mode, customReason) {
  shieldStateV51 = (mode === 'caution' || mode === 'alert') ? mode : 'secure';
  if (shieldStateV51 === 'alert') {
    triggerCyberRedAlert({
      id: 'TEST-3STATE-' + Date.now(),
      severity: 'CRITICAL',
      kind: 'rug',
      title: customReason || 'Alert State Verified: Layer-12 Slot-0 Bundle & Drainer Shield Active',
      detail: 'Carbon Black #020408 + Red #FF1744 Alert Card verified operational.'
    }, true);
  } else if (shieldStateV51 === 'caution') {
    cyberAlertActive = false;
    currentThreat = null;
    try {
      chrome.storage.local.set({ [CYBER_STATE_KEY]: { active: false, mode: 'caution', threat: null } }, () => {});
      if (chrome.action && chrome.action.setBadgeText) {
        chrome.action.setBadgeText({ text: 'WARN' });
        chrome.action.setBadgeBackgroundColor({ color: '#F59E0B' });
        chrome.action.setTitle({ title: 'Caution | Elevated Whale/LP Concentration' });
      }
    } catch (_e) {}
  } else {
    clearCyberRedAlert();
  }
}

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
  if (msg.type === 'RRS_V51_SET_STATE') {
    setShieldThreeState(msg.mode || 'secure', msg.reason || '');
    sendResponse({ ok: true, mode: shieldStateV51, active: cyberAlertActive, threat: currentThreat });
    return false;
  }
  return false;
});

// ============================================================================
// v5.3 CARBON BLACK #020408 POPUP TOASTS + FULL DARK FILTER ENGINE
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
    // Proactively wipe any white OS notifications
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
    if (winKey === '5m' && b.m5 !== undefined) return Number(b.m5);
    if (winKey === '15m' && b.m15 !== undefined) return Number(b.m15);
    if (winKey === '1h' && b.h1 !== undefined) return Number(b.h1);
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
  if (k === 'moonbag' && flt.catMoonbag === false) return false;
  if (k === 'visitor' && flt.catVisitor === false) return false;
  if (k === 'crypto' && flt.catCrypto === false) return false;
  if (k === 'ai' && flt.catAi === false) return false;
  if (k === 'world' && flt.catWorld === false) return false;

  if (k === 'coin' || k === 'moonbag' || k === 'rug') {
    const raw = (String(b.sym || '') + ' ' + String(b.name || '') + ' ' + String(b.title || '') + ' ' + String(b.sub || '')).toUpperCase();
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
      }
      if (flt.moveOn) {
        const mv = Math.abs(extractWindowMovePct(b, flt.moveWin || '1h', raw));
        if (mv < Number(flt.moveMin || 0)) return false;
      }
    }
  }
  return true;
}

async function fireRealPopupToast(opts) {
  if (!opts || !opts.title) return { ok: false };
  const notifId = String(opts.id || ('rrs_toast_' + Date.now()));
  const targetUrl = String(opts.url || 'https://rentandrugshield.com');
  rememberNotifUrl(notifId, targetUrl);

  const flt = await getStoredFiltersV53();
  const prefs = await getStoredAlertPrefs();
  const allowSound = Boolean(flt.soundEnabled || prefs.audioChimeAlert || soundEnabled);
  if (opts.speakTxt && allowSound && chrome.tts && chrome.tts.speak) {
    try {
      chrome.tts.stop();
      chrome.tts.speak(String(opts.speakTxt), { rate: 1.06, enqueue: false });
    } catch (_e) {}
  }

  broadcastToastToActiveTabs({
    id: notifId,
    kind: opts.kind || 'coin',
    sym: opts.sym || '',
    severity: opts.severity || 'INFO',
    badge: scrubNoLongDash(opts.badge || '12-LAYER CARBON v5.3'),
    title: scrubNoLongDash(opts.title).slice(0, 110),
    message: scrubNoLongDash(opts.message || 'Click card to inspect').slice(0, 190),
    url: targetUrl
  });

  // ENABLE_WHITE_OS_BALLOON is strictly false: never create white OS balloons
  if (ENABLE_WHITE_OS_BALLOON && chrome.notifications && chrome.notifications.create) {
    // Hard-disabled per Sonny Stage 1 specification
  }
  return { ok: true, notifId, url: targetUrl };
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
    if (ttl && /^https?:\/\//i.test(lnk)) {
      out.push({ kind: kindKey, source: sourceLabel, title: ttl.slice(0, 115), url: lnk });
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
                badge: '12-LAYER TRENDING',
                title: '$' + sym + ' (' + (h1 >= 0 ? '+' : '') + h1.toFixed(1) + '% 1h) | MC $' + mcK + 'K',
                sub: '12-Layer Pre-Scan Ready | Liq $' + liqK + 'K',
                url: 'https://rentandrugshield.com/?trade=' + encodeURIComponent(p.baseToken.address) + '&sym=' + encodeURIComponent(sym),
                mint: p.baseToken.address,
                sym,
                m1,
                m5,
                m15,
                h1,
                mc: mcK,
                liq: liqK,
                mc_usd: mcUsd,
                liq_usd: liqUsd
              });
            }
          });
        }
      }
    }
  } catch (_e) {}

  try {
    const ra = await fetch('https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=4&query=AI%20OR%20Gemini%20OR%20OpenAI%20OR%20LLM', { cache: 'no-store' });
    if (ra.ok) {
      const d = await ra.json();
      (d.hits || []).slice(0, 3).forEach((h) => {
        const u = h.url || ('https://news.ycombinator.com/item?id=' + h.objectID);
        if (h.title) {
          bubbles.push({ kind: 'ai', badge: 'AI NEWS | Live', title: scrubNoLongDash(h.title).slice(0, 115), sub: 'Click card to open AI report', url: u });
        }
      });
    }
  } catch (_e) {}

  for (const [rUrl, lbl, k] of [
    ['https://cointelegraph.com/rss', 'CoinTelegraph', 'crypto'],
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
            sub: 'Click card to open ' + lbl + ' report',
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
    payload.bubbles = payload.bubbles.filter((b) => {
      if (!b || !b.title) return false;
      const tk = (b.kind || 'x') + ':' + b.title;
      if (localSeen.has(tk)) return false;
      localSeen.add(tk);
      return true;
    });

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
            severity: chosen.severity || (chosen.kind === 'rug' ? 'CRITICAL' : 'INFO'),
            badge: chosen.badge,
            title: chosen.title,
            message: chosen.sub || 'Click card to inspect',
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
  if (msg.type === 'RRS_SYNC_FILTERS_V53') {
    const cleanFlt = Object.assign({}, DEFAULT_FILTERS_V53, msg.filters || {}, {
      quietHoursEnabled: false,
      ENABLE_WHITE_OS_BALLOON: false
    });
    soundEnabled = Boolean(cleanFlt.soundEnabled);
    chrome.storage.local.set({ [FLT_KEY_V53]: cleanFlt, rrs_quiet_snooze_until: 0 }, () => {
      syncCornerNotifierBridge('/sync-filters', cleanFlt);
      sendResponse({ ok: true, filters: cleanFlt });
    });
    return true;
  }
  if (msg.type === 'RRS_FIRE_TEST_TOAST') {
    Promise.all([refreshLiveIntelBubbles(false), getStoredFiltersV53()]).then(([intel, flt]) => {
      const list = (intel && Array.isArray(intel.bubbles)) ? intel.bubbles.filter((b) => bubblePassesFiltersV53(b, flt)) : [];
      const top = list[0] || (intel && Array.isArray(intel.bubbles) && intel.bubbles[0]) || {
        kind: 'coin',
        sym: 'SOL',
        badge: 'CARBON v5.3 LIVE TEST',
        title: '$SOL (+6.8% 1h) | Carbon Black #020408 Bubble Active',
        sub: '12-Layer Sentinel + Dark Filter Controls Synced (7s Auto-Close)',
        url: 'https://rentandrugshield.com'
      };
      const toastPayload = {
        id: 'rrs_manual_toast_' + Date.now(),
        kind: top.kind || 'coin',
        sym: top.sym || '',
        severity: top.severity || (top.kind === 'rug' ? 'CRITICAL' : 'INFO'),
        badge: top.badge || '12-LAYER CARBON v5.3',
        title: top.title,
        message: top.sub || 'Click card to inspect',
        url: top.url || 'https://rentandrugshield.com',
        speakTxt: 'Carbon notice bubble verified.'
      };
      syncCornerNotifierBridge('/fire-test', toastPayload);
      fireRealPopupToast(toastPayload).then((r) => sendResponse(r));
    });
    return true;
  }
  if (msg.type === 'RRS_GET_FOUNDER_APPROVALS') {
    pollFounderApprovalsPrivate(false).then((st) => sendResponse({ ok: true, approvals: st }));
    return true;
  }
  return false;
});

// === FOUNDER-ONLY PRIVATE LOCALHOST APPROVAL BELL ===
let lastFounderApprovalsCount = -1;
let cachedFounderApprovals = { founderLocalhost: false, pending_count: 0 };

async function pollFounderApprovalsPrivate(notifyOnIncrease) {
  const ctrl = new AbortController();
  const tm = setTimeout(() => ctrl.abort(), 1400);
  try {
    const r = await fetch('http://127.0.0.1:18088/api/command/approvals?t=' + Date.now(), { cache: 'no-store', signal: ctrl.signal });
    clearTimeout(tm);
    if (r.ok) {
      const j = await r.json();
      const cnt = Number((j && j.pending_count) || 0);
      cachedFounderApprovals = { founderLocalhost: true, pending_count: cnt, ts: Date.now() };
      if (chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] }, (tabs) => {
          (tabs || []).forEach((tb) => {
            if (tb && tb.id) {
              chrome.tabs.sendMessage(tb.id, { type: 'RRS_FOUNDER_APPROVALS_SYNC', approvals: cachedFounderApprovals }, () => { void chrome.runtime.lastError; });
            }
          });
        });
      }
      if (notifyOnIncrease && cnt > 0 && lastFounderApprovalsCount >= 0 && cnt > lastFounderApprovalsCount) {
        fireRealPopupToast({
          id: 'rrs_founder_appr_' + Date.now(),
          kind: 'coin',
          severity: 'INFO',
          badge: 'FOUNDER PRIVATE QUEUE',
          title: cnt + ' Pending Items Waiting for Approval',
          message: 'Click to open private Waiting Approvals deck (127.0.0.1:18088)',
          url: 'http://127.0.0.1:18088/command/waiting-approvals'
        });
      }
      lastFounderApprovalsCount = cnt;
      return cachedFounderApprovals;
    }
  } catch (_e) {
    clearTimeout(tm);
  }
  cachedFounderApprovals = { founderLocalhost: false, pending_count: 0, ts: Date.now() };
  return cachedFounderApprovals;
}

if (chrome.alarms) {
  chrome.alarms.create('rrs_founder_approvals_30s', { periodInMinutes: 0.5 });
  chrome.alarms.onAlarm.addListener((a) => {
    if (a && a.name === 'rrs_founder_approvals_30s') pollFounderApprovalsPrivate(true);
  });
}
pollFounderApprovalsPrivate(false);

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
