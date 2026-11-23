'use strict';

const quietHoursEnabled = false;
const ENABLE_WHITE_OS_BALLOON = false;
let soundEnabled = false;

const API_ENDPOINTS = [
  'https://rentandrugshield.com',
  'http://127.0.0.1:8088'
];

const PREFS_STORAGE_KEY = 'rrs_alert_prefs_v42';
const FLT_KEY_V53 = 'rrs_notifier_filters_v53';
const SAMPLE_VERIFIED_WALLET = 'C3FFhG83pda2veVRFwTDNyf1YT2R2U2ZHxcg8pUeMjrC';

const DEFAULT_ALERT_PREFS = {
  riskCutoff: 75,
  audioChimeAlert: false,
  soundEnabled: false,
  quietHoursEnabled: false,
  topBannerAlert: true,
  block0SybilAutoWarn: true,
  whaleLpRugAlert: true
};

const IGNORED_MINTS = new Set([
  'So11111111111111111111111111111111111111112',
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  '11111111111111111111111111111111',
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
]);

const OFFLINE_PRESET_MINTS = {
  '3ig9E5SQKs8RjVn9EuW1YaprjaMd6dEftG63hBcMpump': {
    ok: true,
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
      { label: 'L11 | Block-0 Sybil Cluster', detail: '0 Bundled Genesis Snipers Detected', passed: true }
    ]
  },
  '3wyRvbB6nFD7Y9cuozSXrUajZs1EoJxrcBCDBxwupump': {
    ok: true,
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
      { label: 'L11 | Block-0 Sybil Cluster', detail: 'Verified Clean Genesis Entry', passed: true }
    ]
  },
  'AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL': {
    ok: true,
    symbol: 'NVIDIA',
    safety_score: 0,
    verdict: 'DANGER | RUG / SYBIL & LP-PULL BLOCKED',
    layer11_sybil_clean: false,
    whale_lp_clean: false,
    checks: [
      { label: 'L11 | Block-0 Sybil Cluster', detail: 'COORDINATED BLOCK-0 INSIDER RING FLAGGED', passed: false },
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

let activeApiBase = '';
let userPrefs = Object.assign({}, DEFAULT_ALERT_PREFS);
let lastAuditData = null;
let viewHistory = ['home'];
let viewHistoryIdx = 0;

function scrubDashes(str) {
  const em = String.fromCharCode(8212);
  const en = String.fromCharCode(8211);
  const dbl = String.fromCharCode(45, 45);
  const legacyRx = new RegExp('(?:10|11)[-\\s]+layer', 'gi');
  return String(str || '')
    .replace(legacyRx, '12-Layer')
    .split(em).join(' | ')
    .split(en).join('-')
    .split(dbl).join('-');
}

function escapeHtml(str) {
  return scrubDashes(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getCandidateApiBases() {
  const out = [];
  if (activeApiBase && out.indexOf(activeApiBase) === -1) out.push(activeApiBase);
  try {
    const cached = sessionStorage.getItem('ext_api_base');
    if (cached && out.indexOf(cached) === -1) out.push(cached);
  } catch (_e) {}
  for (const b of API_ENDPOINTS) {
    if (out.indexOf(b) === -1) out.push(b);
  }
  return out;
}

async function apiFetchJson(path, options) {
  const bases = getCandidateApiBases();
  let lastErr = null;
  for (const base of bases) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 5500);
      const reqOpts = Object.assign({}, options || {}, { signal: ctrl.signal });
      const res = await fetch(base + path, reqOpts);
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        activeApiBase = base;
        try { sessionStorage.setItem('ext_api_base', base); } catch (_e) {}
        return data;
      }
      if (res.status === 400 || res.status === 402 || res.status === 429) {
        return await res.json();
      }
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('Scanner API unreachable');
}

function sendBgMsg(payload) {
  return new Promise((resolve) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(payload, (res) => {
          if (chrome.runtime.lastError) {
            resolve(null);
            return;
          }
          resolve(res || null);
        });
        return;
      }
    } catch (_e) {}
    resolve(null);
  });
}

function emitTelemetryClick(buttonId, buttonLabel) {
  const mintVal = (document.getElementById('ext-mint-inp') && document.getElementById('ext-mint-inp').value) || '';
  const walletVal = (document.getElementById('ext-wallet-inp') && document.getElementById('ext-wallet-inp').value) || '';
  const payload = {
    button_id: buttonId,
    id: buttonId,
    button_label: buttonLabel,
    label: buttonLabel,
    page: 'extension:popup_v5.3.0',
    page_path: '/extension/popup.html',
    path: '/extension/popup.html',
    source: 'mv3_extension_v5.3.0',
    mint: mintVal.trim(),
    wallet: walletVal.trim(),
    ts: Date.now()
  };

  sendBgMsg({ type: 'RRS_TELEMETRY_CLICK', payload }).then((res) => {
    if (!res || !res.ok) {
      apiFetchJson('/api/telemetry/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    }
  });
}

function playPopupWarningChime(forceTest) {
  if (!forceTest && !userPrefs.audioChimeAlert && !soundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(440.0, now + 0.12);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
    setTimeout(() => { try { ctx.close(); } catch (_e) {} }, 450);
  } catch (_e) {}
}

function readLocalPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (raw) return Object.assign({}, DEFAULT_ALERT_PREFS, JSON.parse(raw), { quietHoursEnabled: false });
  } catch (_e) {}
  return Object.assign({}, DEFAULT_ALERT_PREFS);
}

function writeLocalPrefs(p) {
  try { localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(p)); } catch (_e) {}
}

function renderPrefsForm() {
  const cutoff = Math.max(0, Math.min(100, Number(userPrefs.riskCutoff) || 75));
  const badge = document.getElementById('pop-cutoff-badge');
  const valLbl = document.getElementById('pop-cutoff-val');
  const rng = document.getElementById('pop-cutoff-range');
  const num = document.getElementById('pop-cutoff-num');
  const aud = document.getElementById('pop-pref-audio');
  const ban = document.getElementById('pop-pref-banner');
  const syb = document.getElementById('pop-pref-sybil');
  const whl = document.getElementById('pop-pref-whale');

  if (badge) badge.textContent = cutoff + '/100';
  if (valLbl) valLbl.textContent = String(cutoff);
  if (rng) rng.value = String(cutoff);
  if (num) num.value = String(cutoff);
  if (aud) aud.checked = Boolean(userPrefs.audioChimeAlert);
  if (ban) ban.checked = Boolean(userPrefs.topBannerAlert);
  if (syb) syb.checked = Boolean(userPrefs.block0SybilAutoWarn);
  if (whl) whl.checked = Boolean(userPrefs.whaleLpRugAlert);
}

async function initAlertPrefs() {
  userPrefs = readLocalPrefs();
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      await new Promise((resolve) => {
        chrome.storage.sync.get([PREFS_STORAGE_KEY], (res) => {
          if (!chrome.runtime.lastError && res && res[PREFS_STORAGE_KEY]) {
            userPrefs = Object.assign({}, DEFAULT_ALERT_PREFS, res[PREFS_STORAGE_KEY], { quietHoursEnabled: false });
            writeLocalPrefs(userPrefs);
          }
          resolve();
        });
      });
    }
  } catch (_e) {}
  soundEnabled = Boolean(userPrefs.audioChimeAlert || userPrefs.soundEnabled);
  renderPrefsForm();
}

async function persistAlertPrefs(nextPartial) {
  const merged = Object.assign({}, userPrefs, nextPartial || {}, { quietHoursEnabled: false });
  merged.riskCutoff = Math.max(0, Math.min(100, Math.round(Number(merged.riskCutoff) || 75)));
  merged.audioChimeAlert = Boolean(merged.audioChimeAlert);
  merged.soundEnabled = Boolean(merged.audioChimeAlert);
  merged.topBannerAlert = Boolean(merged.topBannerAlert);
  merged.block0SybilAutoWarn = Boolean(merged.block0SybilAutoWarn);
  merged.whaleLpRugAlert = Boolean(merged.whaleLpRugAlert);
  merged.updatedAt = Date.now();
  userPrefs = merged;
  soundEnabled = merged.soundEnabled;
  writeLocalPrefs(merged);

  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ [PREFS_STORAGE_KEY]: merged }, () => {});
      chrome.storage.local.set({ [PREFS_STORAGE_KEY]: merged }, () => {});
    }
  } catch (_e) {}

  sendBgMsg({ type: 'RRS_SET_PREFS', prefs: merged });
  renderPrefsForm();
  if (lastAuditData) {
    const out = document.getElementById('ext-mint-out');
    if (out) renderMintResult(out, lastAuditData, false);
  }
}

function openView(viewName, recordHist) {
  const views = ['home', 'alerts', 'carbon', 'rnd'];
  const target = views.indexOf(viewName) !== -1 ? viewName : 'home';
  for (const v of views) {
    const el = document.getElementById('pop-view-' + v);
    if (el) el.style.display = v === target ? 'block' : 'none';
  }
  const homeBtn = document.getElementById('pop-nav-home');
  if (homeBtn) homeBtn.classList.toggle('active', target === 'home');

  if (recordHist !== false) {
    if (viewHistory[viewHistoryIdx] !== target) {
      viewHistory = viewHistory.slice(0, viewHistoryIdx + 1);
      viewHistory.push(target);
      viewHistoryIdx = viewHistory.length - 1;
    }
  }
  const backBtn = document.getElementById('pop-nav-back');
  const fwdBtn = document.getElementById('pop-nav-fwd');
  if (backBtn) backBtn.disabled = viewHistoryIdx <= 0;
  if (fwdBtn) fwdBtn.disabled = viewHistoryIdx >= viewHistory.length - 1;
}

function isValidMintCandidate(cand) {
  return Boolean(cand && cand.length >= 32 && cand.length <= 44 && !IGNORED_MINTS.has(cand));
}

function extractMintFromUrl(urlStr) {
  if (!urlStr) return '';
  try {
    const parsed = new URL(urlStr);
    const paramKeys = ['outputMint', 'outputCurrency', 'mint', 'token', 'inputMint', 'address'];
    for (const key of paramKeys) {
      const val = (parsed.searchParams.get(key) || '').trim();
      if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(val) && isValidMintCandidate(val)) return val;
    }
  } catch (_e) {}
  const matches = String(urlStr).match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g);
  if (!matches) return '';
  for (const cand of matches) {
    if (isValidMintCandidate(cand)) return cand;
  }
  return '';
}

function renderMintResult(out, d, allowSound) {
  const topBanner = document.getElementById('popup-top-alert-banner');
  const topBannerTxt = document.getElementById('popup-top-alert-text');
  if (!d || d.ok === false) {
    const msg = escapeHtml((d && d.error) || 'Unable to verify token mint right now.');
    out.innerHTML = `<span style="color:#FF1744;">Warning: ${msg}</span>`;
    if (topBanner) topBanner.classList.remove('show');
    return;
  }
  lastAuditData = d;
  const score = (d.safety_score !== undefined) ? Number(d.safety_score) : ((d.score !== undefined) ? Number(d.score) : 95);
  const cutoff = Number(userPrefs.riskCutoff || 75);
  const safe = score >= cutoff;
  const sym = d.symbol ? ('$' + escapeHtml(String(d.symbol).replace(/^\$/, ''))) : 'Token';
  const verdict = escapeHtml(d.verdict || (safe ? 'SAFE | 12-LAYER SHIELD PASSED' : 'HIGH RISK | BELOW SAFETY CUTOFF'));
  const rawList = Array.isArray(d.checks) ? d.checks.slice(0, 6) : [];
  const rows = rawList.map((c) => {
    const ok = c && c.passed !== false;
    return `<div style="margin-top:2px;color:${ok ? '#a7f3d0' : '#fda4af'};">${ok ? '[OK]' : '[RISK]'} <b>${escapeHtml(c.label || 'Check')}:</b> ${escapeHtml(c.detail || '')}</div>`;
  }).join('');

  out.style.borderColor = safe ? '#00FFA3' : '#FF1744';
  out.innerHTML =
    `<div style="font-weight:900;font-size:11px;color:${safe ? '#00FFA3' : '#FF1744'};">${sym} | Score ${score}/100</div>` +
    `<div style="font-weight:800;color:#f8fafc;margin-top:2px;">${verdict}</div>` +
    `<div style="margin-top:4px;font-size:9.6px;">${rows}</div>`;

  if (!safe && userPrefs.topBannerAlert && topBanner && topBannerTxt) {
    topBannerTxt.textContent = `ALERT: ${sym} (${score}/100) failed cutoff ${cutoff}/100`;
    topBanner.classList.add('show');
  } else if (topBanner) {
    topBanner.classList.remove('show');
  }
  if (!safe && allowSound) playPopupWarningChime(false);
}

async function auditMintNow(customMint) {
  const inp = document.getElementById('ext-mint-inp');
  const out = document.getElementById('ext-mint-out');
  if (!out) return;
  const mint = String(customMint || (inp && inp.value) || '').trim();
  if (inp && customMint) inp.value = mint;
  out.style.display = 'block';
  if (!mint) {
    out.innerHTML = '<span style="color:#fde047;">Paste a Solana token mint address first.</span>';
    return;
  }
  out.innerHTML = '<span style="color:#67e8f9;">Running 12-Layer Carbon inspection...</span>';
  const bgRes = await sendBgMsg({ type: 'RRS_SCAN_TOKEN', mint, forceRefresh: true, source: 'popup_v5.3.0' });
  if (bgRes) {
    renderMintResult(out, bgRes, true);
    return;
  }
  try {
    const data = await apiFetchJson('/api/scan-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mint, source: 'popup_v5.3.0' })
    });
    renderMintResult(out, data, true);
  } catch (_e) {
    renderMintResult(out, OFFLINE_PRESET_MINTS[mint] || { ok: false, error: 'Scanner unreachable.' }, false);
  }
}

async function scanWalletNow(customWallet, isSample) {
  const inp = document.getElementById('ext-wallet-inp');
  const out = document.getElementById('ext-wallet-out');
  if (!out) return;
  const wallet = String(customWallet || (inp && inp.value) || '').trim();
  if (inp && customWallet) inp.value = wallet;
  out.style.display = 'block';
  if (!wallet) {
    out.innerHTML = '<span style="color:#fde047;">Paste a Solana wallet address first.</span>';
    return;
  }
  out.innerHTML = '<span style="color:#00FFA3;">Scanning read-only SPL &amp; Token-2022 ATAs...</span>';
  let data = await sendBgMsg({ type: 'RRS_SCAN_WALLET', wallet, isSample: Boolean(isSample) });
  if (!data) {
    try {
      data = await apiFetchJson('/api/scan-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, mode: 'rent', is_sample_test: Boolean(isSample) })
      });
    } catch (_e) {
      data = OFFLINE_PRESET_WALLETS[wallet] || { ok: false, error: 'Read-only wallet scanner unreachable.' };
    }
  }
  if (!data || data.ok === false) {
    out.innerHTML = `<span style="color:#FF1744;">${escapeHtml((data && data.error) || 'Wallet scan error.')}</span>`;
    return;
  }
  const cnt = Number(data.reclaimable_count !== undefined ? data.reclaimable_count : (data.empty_count || 0));
  const sol = Number(data.total_reclaimable_sol || data.reclaimable_sol || 0).toFixed(6);
  const usd = Number(data.total_reclaimable_usd || data.reclaimable_usd || 0).toFixed(2);
  out.innerHTML =
    `<div style="color:#00FFA3;font-weight:900;">Found ${cnt} Reclaimable ATAs | +${sol} SOL ($${usd})</div>` +
    `<div style="margin-top:3px;color:#cbd5e1;">100% Non-Custodial | 1st ATA Claim 0% Fee (98% Net Thereafter)</div>` +
    `<a href="https://rentandrugshield.com/app.html?wallet=${encodeURIComponent(wallet)}&autoscan=1" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:5px;background:#00FFA3;color:#020408;padding:4px 8px;border-radius:5px;font-weight:900;text-decoration:none;">Open Claim Transaction</a>`;
}

async function refreshLiveWinners() {
  try {
    const res = await sendBgMsg({ type: 'RRS_LIVE_TELEMETRY' });
    const list = res && Array.isArray(res.recent_winners) ? res.recent_winners : null;
    const box = document.getElementById('ext-winners-list');
    if (!list || !list.length || !box) return;
    box.innerHTML = list.slice(0, 4).map((w, idx, arr) => {
      const sym = escapeHtml(w.symbol || w.sym || 'TOKEN');
      const pct = Number(w.peak_pct || w.pnl_pct || 0).toFixed(2);
      const txUrl = w.tx_url || (w.sig ? ('https://solscan.io/tx/' + encodeURIComponent(w.sig)) : 'https://rentandrugshield.com/app.html');
      return `<div class="ticker-item" style="${idx === arr.length - 1 ? 'border-bottom:none;' : ''}"><span><b style="color:#00FFA3;">${sym}</b> (+${pct}% Peak)</span><a class="tx-link" href="${escapeHtml(txUrl)}" target="_blank" rel="noopener noreferrer">TX</a></div>`;
    }).join('');
  } catch (_e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  initAlertPrefs();

  const on = (id, ev, fn) => { const e = document.getElementById(id); if (e) e.addEventListener(ev, fn); };

  on('pop-nav-home', 'click', () => openView('home'));
  on('pop-btn-alerts', 'click', () => openView('alerts'));
  on('pop-btn-carbon', 'click', () => openView('carbon'));
  on('pop-btn-rnd', 'click', () => openView('rnd'));
  on('pop-nav-back', 'click', () => {
    if (viewHistoryIdx > 0) { viewHistoryIdx--; openView(viewHistory[viewHistoryIdx], false); }
  });
  on('pop-nav-fwd', 'click', () => {
    if (viewHistoryIdx < viewHistory.length - 1) { viewHistoryIdx++; openView(viewHistory[viewHistoryIdx], false); }
  });

  on('pop-layer-info-btn', 'click', () => {
    const b = document.getElementById('pop-layer-info-box');
    if (b) b.classList.toggle('open');
  });
  on('popup-top-alert-dismiss', 'click', () => {
    const b = document.getElementById('popup-top-alert-banner');
    if (b) b.classList.remove('show');
  });

  on('ext-audit-btn', 'click', () => { emitTelemetryClick('ext_audit_btn', 'Run 12-Layer Mint Audit'); auditMintNow(); });
  on('ext-test-winner', 'click', () => auditMintNow('3ig9E5SQKs8RjVn9EuW1YaprjaMd6dEftG63hBcMpump'));
  on('ext-test-safe', 'click', () => auditMintNow('3wyRvbB6nFD7Y9cuozSXrUajZs1EoJxrcBCDBxwupump'));
  on('ext-test-rug', 'click', () => auditMintNow('AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL'));

  on('ext-scan-wallet-btn', 'click', () => { emitTelemetryClick('ext_scan_wallet_btn', 'Scan Trapped SOL'); scanWalletNow(); });
  on('ext-demo-whale', 'click', () => scanWalletNow(SAMPLE_VERIFIED_WALLET, true));

  on('pop-cutoff-range', 'input', (ev) => {
    const v = ev.target.value;
    if (document.getElementById('pop-cutoff-val')) document.getElementById('pop-cutoff-val').textContent = v;
    if (document.getElementById('pop-cutoff-num')) document.getElementById('pop-cutoff-num').value = v;
  });
  on('pop-cutoff-num', 'input', (ev) => {
    const v = ev.target.value;
    if (document.getElementById('pop-cutoff-val')) document.getElementById('pop-cutoff-val').textContent = v;
    if (document.getElementById('pop-cutoff-range')) document.getElementById('pop-cutoff-range').value = v;
  });
  on('pop-test-chime', 'click', () => playPopupWarningChime(true));
  on('pop-save-prefs', 'click', async () => {
    await persistAlertPrefs({
      riskCutoff: Number((document.getElementById('pop-cutoff-num') && document.getElementById('pop-cutoff-num').value) || 75),
      audioChimeAlert: Boolean(document.getElementById('pop-pref-audio') && document.getElementById('pop-pref-audio').checked),
      topBannerAlert: Boolean(document.getElementById('pop-pref-banner') && document.getElementById('pop-pref-banner').checked),
      block0SybilAutoWarn: Boolean(document.getElementById('pop-pref-sybil') && document.getElementById('pop-pref-sybil').checked),
      whaleLpRugAlert: Boolean(document.getElementById('pop-pref-whale') && document.getElementById('pop-pref-whale').checked)
    });
    const m = document.getElementById('pop-prefs-saved-msg');
    if (m) { m.style.display = 'block'; setTimeout(() => { m.style.display = 'none'; }, 2400); }
  });
  on('pop-reset-prefs', 'click', () => persistAlertPrefs(DEFAULT_ALERT_PREFS));

  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs && tabs[0];
      const detected = activeTab && activeTab.url ? extractMintFromUrl(activeTab.url) : '';
      if (detected) {
        const inp = document.getElementById('ext-mint-inp');
        const bdg = document.getElementById('tab-detect-badge');
        if (inp) inp.value = detected;
        if (bdg) bdg.textContent = 'Auto-Detected Active Tab';
        auditMintNow(detected);
      }
    });
  }

  refreshLiveWinners();
  setInterval(refreshLiveWinners, 6000);
});

// === 3-STATE BANNER & TRIAL COUNTDOWN ===
(function () {
  function setBannerVisualMode(mode, threat) {
    const banner = document.getElementById('cyberSentinelBanner');
    const dot = document.getElementById('cyberPulseDot');
    const head = document.getElementById('cyberStatusHeadline');
    const det = document.getElementById('cyberThreatDetail');
    const clr = document.getElementById('cyberClearBtn');
    if (!banner || !head || !det) return;
    if (mode === 'alert') {
      banner.style.background = '#1a0308';
      banner.style.borderColor = '#FF1744';
      if (dot) { dot.style.background = '#FF1744'; dot.style.boxShadow = '0 0 12px #FF1744'; }
      head.style.color = '#FF1744';
      head.textContent = 'CRITICAL ALERT: ' + scrubDashes((threat && threat.title) || 'Layer-12 Threat Blocked');
      det.style.color = '#fda4af';
      det.textContent = scrubDashes((threat && threat.detail) || 'Carbon Black + Red #FF1744 warning active.');
      if (clr) clr.style.display = 'block';
    } else if (mode === 'caution') {
      banner.style.background = '#171003';
      banner.style.borderColor = '#facc15';
      if (dot) { dot.style.background = '#facc15'; dot.style.boxShadow = '0 0 12px #facc15'; }
      head.style.color = '#fde047';
      head.textContent = 'CAUTION: ELEVATED WHALE / CONCENTRATION RISK';
      det.style.color = '#fde68a';
      det.textContent = 'Inspect Top-10 concentration & LP lock before signing.';
      if (clr) clr.style.display = 'block';
    } else {
      banner.style.background = '#020408';
      banner.style.borderColor = '#00FFA3';
      if (dot) { dot.style.background = '#00FFA3'; dot.style.boxShadow = '0 0 10px #00FFA3'; }
      head.style.color = '#00FFA3';
      head.textContent = 'CARBON SENTINEL v5.3: 12 LAYERS ARMED';
      det.style.color = '#cbd5e1';
      det.innerHTML = 'Carbon Black <b style="color:#00FFA3;">#020408</b> bubbles active (7s auto-close, QuietHours OFF, Sound OFF by default).';
      if (clr) clr.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const bSec = document.getElementById('btnStateSecure');
    const bCau = document.getElementById('btnStateCaution');
    const tRed = document.getElementById('cyberTestRedBtn');
    const clr = document.getElementById('cyberClearBtn');
    if (bSec) bSec.addEventListener('click', () => sendBgMsg({ type: 'RRS_V51_SET_STATE', mode: 'secure' }).then(() => setBannerVisualMode('secure')));
    if (bCau) bCau.addEventListener('click', () => sendBgMsg({ type: 'RRS_V51_SET_STATE', mode: 'caution' }).then(() => setBannerVisualMode('caution')));
    if (tRed) tRed.addEventListener('click', () => sendBgMsg({ type: 'RRS_CYBER_TEST_ALERT' }).then((r) => setBannerVisualMode('alert', r && r.threat)));
    if (clr) clr.addEventListener('click', () => sendBgMsg({ type: 'RRS_CYBER_CLEAR_ALERT' }).then(() => setBannerVisualMode('secure')));

    sendBgMsg({ type: 'RRS_V51_GET_TRIAL_AND_STATE' }).then((res) => {
      if (!res) return;
      setBannerVisualMode(res.mode || 'secure', res.threat);
      const cdEl = document.getElementById('v51TrialCountdown');
      if (cdEl && res.trial && res.trial.expiresAt) {
        const remMs = res.trial.expiresAt - Date.now();
        if (remMs > 0) {
          const hh = Math.floor(remMs / 3600000);
          const mm = Math.floor((remMs % 3600000) / 60000);
          cdEl.textContent = `24h Ultra Pro FREE (${hh}h ${mm}m left)`;
        } else {
          cdEl.textContent = 'FREE Forever Tier Active (PC + Rug + DEX-6 Alerts)';
        }
      }
    });
  });
})();

// === LIVE INTEL BUBBLES + SONNY'S FULL DARK CONTROL POPUP (v5.3) ===
(function () {
  const DEFAULTS = {
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

  let cachedBubbles = [];
  let activeCat = 'all';
  let currentFilters = Object.assign({}, DEFAULTS);

  function el(id) { return document.getElementById(id); }

  function renderBubbles() {
    const box = el('ext-intel-bubbles-list');
    if (!box) return;
    const rows = cachedBubbles.filter((b) => activeCat === 'all' || b.kind === activeCat).slice(0, 12);
    if (!rows.length) {
      box.innerHTML = '<div style="font-size:9.8px;color:#94a3b8;">No items in selected category yet.</div>';
      return;
    }
    box.innerHTML = '';
    rows.forEach((b) => {
      const isRed = (b.kind === 'rug' || b.severity === 'CRITICAL');
      const col = isRed ? '#FF1744' : (b.kind === 'coin' || b.kind === 'moonbag' ? '#00FFA3' : (b.kind === 'visitor' ? '#7dd3fc' : (b.kind === 'crypto' ? '#fde047' : '#38bdf8')));
      const pill = document.createElement('a');
      pill.href = b.url || 'https://rentandrugshield.com';
      pill.target = '_blank';
      pill.rel = 'noopener noreferrer';
      pill.style.cssText =
        'display:block;text-decoration:none;background:#020408;border:1px solid ' + col +
        ';border-left:4px solid ' + col + ';border-radius:8px;padding:6px 8px;';
      pill.innerHTML =
        '<div style="font-size:8.6px;font-weight:900;color:' + col + ';margin-bottom:2px;">' + escapeHtml(b.badge || String(b.kind || 'LIVE').toUpperCase()) + '</div>' +
        '<div style="font-size:10.1px;font-weight:800;color:#ffffff;line-height:1.3;">' + escapeHtml(b.title || '') + '</div>' +
        (b.sub ? '<div style="font-size:9px;color:#94a3b8;margin-top:2px;">' + escapeHtml(b.sub) + '</div>' : '');
      box.appendChild(pill);
    });
  }

  function loadBubbles(force) {
    sendBgMsg({ type: 'RRS_GET_INTEL_BUBBLES', force: Boolean(force) }).then((res) => {
      if (res && res.ok && res.data && Array.isArray(res.data.bubbles)) {
        cachedBubbles = res.data.bubbles;
        renderBubbles();
      }
    });
  }

  function readForm() {
    return {
      quietHoursEnabled: false,
      ENABLE_WHITE_OS_BALLOON: false,
      soundEnabled: el('flt-sound-enabled') ? Boolean(el('flt-sound-enabled').checked) : false,
      masterBubbles: el('flt-master-bubbles') ? Boolean(el('flt-master-bubbles').checked) : true,
      catCoin: el('flt-cat-coin') ? Boolean(el('flt-cat-coin').checked) : true,
      catRug: el('flt-cat-rug') ? Boolean(el('flt-cat-rug').checked) : true,
      catMoonbag: el('flt-cat-moonbag') ? Boolean(el('flt-cat-moonbag').checked) : true,
      catVisitor: el('flt-cat-visitor') ? Boolean(el('flt-cat-visitor').checked) : true,
      catCrypto: el('flt-cat-crypto') ? Boolean(el('flt-cat-crypto').checked) : true,
      catAi: el('flt-cat-ai') ? Boolean(el('flt-cat-ai').checked) : true,
      catWorld: el('flt-cat-world') ? Boolean(el('flt-cat-world').checked) : true,
      tickerOn: el('flt-ticker-on') ? Boolean(el('flt-ticker-on').checked) : false,
      tickerQuery: el('flt-ticker-inp') ? String(el('flt-ticker-inp').value || '').trim() : '',
      mcOn: el('flt-mc-on') ? Boolean(el('flt-mc-on').checked) : false,
      mcMin: el('flt-mc-min') ? Number(el('flt-mc-min').value || 0) : 15000,
      mcMax: el('flt-mc-max') ? Number(el('flt-mc-max').value || 50000000) : 50000000,
      moveOn: el('flt-move-on') ? Boolean(el('flt-move-on').checked) : false,
      moveMin: el('flt-move-min') ? Number(el('flt-move-min').value || 0) : 5,
      moveWin: el('flt-move-win') ? String(el('flt-move-win').value || '1h') : '1h',
      liqOn: el('flt-liq-on') ? Boolean(el('flt-liq-on').checked) : false,
      liqMin: el('flt-liq-min') ? Number(el('flt-liq-min').value || 0) : 10000
    };
  }

  function applyForm(f) {
    const d = Object.assign({}, DEFAULTS, f || {}, { quietHoursEnabled: false, ENABLE_WHITE_OS_BALLOON: false });
    currentFilters = d;
    soundEnabled = Boolean(d.soundEnabled);
    if (el('flt-master-bubbles')) el('flt-master-bubbles').checked = Boolean(d.masterBubbles);
    if (el('flt-cat-coin')) el('flt-cat-coin').checked = Boolean(d.catCoin);
    if (el('flt-cat-rug')) el('flt-cat-rug').checked = Boolean(d.catRug);
    if (el('flt-cat-moonbag')) el('flt-cat-moonbag').checked = Boolean(d.catMoonbag);
    if (el('flt-cat-visitor')) el('flt-cat-visitor').checked = Boolean(d.catVisitor);
    if (el('flt-cat-crypto')) el('flt-cat-crypto').checked = Boolean(d.catCrypto);
    if (el('flt-cat-ai')) el('flt-cat-ai').checked = Boolean(d.catAi);
    if (el('flt-cat-world')) el('flt-cat-world').checked = Boolean(d.catWorld);
    if (el('flt-sound-enabled')) el('flt-sound-enabled').checked = Boolean(d.soundEnabled);
    if (el('flt-ticker-on')) el('flt-ticker-on').checked = Boolean(d.tickerOn);
    if (el('flt-ticker-inp')) el('flt-ticker-inp').value = d.tickerQuery || '';
    if (el('flt-mc-on')) el('flt-mc-on').checked = Boolean(d.mcOn);
    if (el('flt-mc-min')) el('flt-mc-min').value = d.mcMin;
    if (el('flt-mc-max')) el('flt-mc-max').value = d.mcMax;
    if (el('flt-move-on')) el('flt-move-on').checked = Boolean(d.moveOn);
    if (el('flt-move-min')) el('flt-move-min').value = d.moveMin;
    if (el('flt-move-win')) el('flt-move-win').value = d.moveWin || '1h';
    if (el('flt-liq-on')) el('flt-liq-on').checked = Boolean(d.liqOn);
    if (el('flt-liq-min')) el('flt-liq-min').value = d.liqMin;
    renderSummary(d);
  }

  function renderSummary(d) {
    const sum = el('ext-active-filter-summary');
    if (!sum) return;
    const parts = [];
    if (!d.masterBubbles) parts.push('Bubbles Paused');
    if (d.tickerOn && d.tickerQuery) parts.push('Coins: ' + d.tickerQuery);
    if (d.mcOn) parts.push('MC: $' + Number(d.mcMin).toLocaleString() + '-$' + Number(d.mcMax).toLocaleString());
    if (d.moveOn) parts.push('Move >= ' + d.moveMin + '% (' + d.moveWin + ')');
    if (d.liqOn) parts.push('Liq >= $' + Number(d.liqMin).toLocaleString());
    if (d.soundEnabled) parts.push('Sound ON');
    if (parts.length) {
      sum.style.display = 'block';
      sum.textContent = 'Active Filters: ' + parts.join(' | ');
    } else {
      sum.style.display = 'none';
    }
  }

  function saveNow(showMsg) {
    const d = readForm();
    currentFilters = d;
    soundEnabled = Boolean(d.soundEnabled);
    sendBgMsg({ type: 'RRS_SYNC_FILTERS_V53', filters: d }).then(() => {
      renderSummary(d);
      if (showMsg && el('flt-saved-msg')) {
        el('flt-saved-msg').style.display = 'block';
        setTimeout(() => { if (el('flt-saved-msg')) el('flt-saved-msg').style.display = 'none'; }, 2400);
      }
    });
  }

  function fireSingleTestBubble() {
    emitTelemetryClick('send_1_test_bubble', 'Send 1 Test Bubble');
    sendBgMsg({ type: 'RRS_FIRE_TEST_TOAST' });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([FLT_KEY_V53, 'rrs_notifier_filters_v52'], (res) => {
        applyForm(res && (res[FLT_KEY_V53] || res.rrs_notifier_filters_v52));
      });
    } else {
      applyForm(DEFAULTS);
    }

    const tabs = el('ext-intel-tabs');
    if (tabs) {
      tabs.querySelectorAll('button[data-icat]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeCat = btn.getAttribute('data-icat') || 'all';
          tabs.querySelectorAll('button[data-icat]').forEach((x) => x.classList.toggle('active', x === btn));
          renderBubbles();
        });
      });
    }

    if (el('ext-open-filters-btn') && el('pop-btn-alerts')) {
      el('ext-open-filters-btn').addEventListener('click', () => el('pop-btn-alerts').click());
    }
    ['btn-send-1-test-bubble', 'ext-fire-toast-btn', 'flt-test-toast-btn'].forEach((id) => {
      if (el(id)) el(id).addEventListener('click', fireSingleTestBubble);
    });
    if (el('flt-save-btn')) el('flt-save-btn').addEventListener('click', () => saveNow(true));
    if (el('flt-reset-btn')) el('flt-reset-btn').addEventListener('click', () => { applyForm(DEFAULTS); saveNow(true); });

    [
      'flt-master-bubbles', 'flt-cat-coin', 'flt-cat-rug', 'flt-cat-moonbag',
      'flt-cat-visitor', 'flt-cat-crypto', 'flt-cat-ai', 'flt-cat-world',
      'flt-sound-enabled', 'flt-ticker-on', 'flt-mc-on', 'flt-move-on', 'flt-liq-on', 'flt-move-win'
    ].forEach((id) => {
      if (el(id)) el(id).addEventListener('change', () => saveNow(false));
    });

    const fBar = el('founderApprovalBellBar');
    const fCnt = el('founderApprovalBellCnt');
    if (fBar && fCnt) {
      sendBgMsg({ type: 'RRS_GET_FOUNDER_APPROVALS' }).then((res) => {
        if (res && res.ok && res.approvals && res.approvals.founderLocalhost && res.approvals.pending_count > 0) {
          fCnt.textContent = String(res.approvals.pending_count);
          fBar.style.display = 'flex';
          fBar.onclick = () => chrome.tabs.create({ url: 'http://127.0.0.1:18088/command/waiting-approvals' });
        }
      });
    }

    loadBubbles(false);
  });
})();
