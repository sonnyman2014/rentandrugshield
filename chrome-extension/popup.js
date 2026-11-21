'use strict';

const API_ENDPOINTS = [
  'http://127.0.0.1:8088',
  'https://soldier-indirect-amber-messaging.trycloudflare.com',
  'https://rentandrugshield.com',
  'http://127.0.0.1:8088'
];

const PREFS_STORAGE_KEY = 'rrs_alert_prefs_v42';
const SAMPLE_VERIFIED_WALLET = 'C3FFhG83pda2veVRFwTDNyf1YT2R2U2ZHxcg8pUeMjrC';

const DEFAULT_ALERT_PREFS = {
  riskCutoff: 75,
  audioChimeAlert: true,
  topBannerAlert: true,
  block0SybilAutoWarn: true,
  whaleLpRugAlert: true,
  mcFloor: 25000,
  liqFloor: 10000,
  timeWindow: '15m',
  pctMove: 25
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
    verdict: 'SAFE • 12-LAYER SHIELD PASSED ✅',
    layer11_sybil_clean: true,
    whale_lp_clean: true,
    checks: [
      { label: 'L1 • Mint Auth', detail: 'Renounced (Fixed Immutable Supply)', passed: true },
      { label: 'L2 • Freeze Auth', detail: 'Renounced (Cannot Freeze Buyer ATAs)', passed: true },
      { label: 'L3 • Top-1/Top-5 Holder Concentration', detail: 'Clean Distribution (Top-1: 2.8% • Top-5: 10.9%)', passed: true },
      { label: 'L4 • Liq/MC Trap Ratio', detail: 'Healthy Pool Depth ($17,599 Liq • 28.9% Liq/MC)', passed: true },
      { label: 'L11 • Block-0 Sybil Cluster', detail: '0 Bundled Genesis Snipers Detected', passed: true }
    ]
  },
  '3wyRvbB6nFD7Y9cuozSXrUajZs1EoJxrcBCDBxwupump': {
    ok: true,
    symbol: 'WASTED6',
    safety_score: 100,
    verdict: 'SAFE • 12-LAYER SHIELD PASSED ✅',
    layer11_sybil_clean: true,
    whale_lp_clean: true,
    checks: [
      { label: 'L1 • Mint Auth', detail: 'Renounced (Fixed Immutable Supply)', passed: true },
      { label: 'L2 • Freeze Auth', detail: 'Renounced (Cannot Freeze Buyer ATAs)', passed: true },
      { label: 'L3 • Top-1/Top-5 Holder Concentration', detail: 'Clean Distribution (Top-1: 0.3% • Top-5: 0.5%)', passed: true },
      { label: 'L4 • Liq/MC Trap Ratio', detail: 'Healthy Pool Depth ($1,821 Liq • 118.0% Liq/MC)', passed: true },
      { label: 'L11 • Block-0 Sybil Cluster', detail: 'Verified Clean Genesis Entry', passed: true }
    ]
  },
  'AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL': {
    ok: true,
    symbol: 'NVIDIA',
    safety_score: 0,
    verdict: 'DANGER • RUG / SYBIL & LP-PULL BLOCKED 🚨',
    layer11_sybil_clean: false,
    whale_lp_clean: false,
    checks: [
      { label: 'L11 • Block-0 Sybil Cluster', detail: 'COORDINATED BLOCK-0 INSIDER RING FLAGGED', passed: false },
      { label: 'L4 • Liq/MC Trap Ratio', detail: 'Drained / Shallow Liquidity ($0 USD Liq • 0.0% Liq/MC Trap)', passed: false },
      { label: 'L5 • LP Burn / Lock Status', detail: 'MANUAL LP PULL DETECTED • Blocked by 12-Layer Gate', passed: false },
      { label: 'L9 • True Pool Age', detail: 'Unverified / Rugged Pool Lifecycle', passed: false },
      { label: 'L10 • Buy/Sell Velocity', detail: 'Heavy Whale Dump / Dead Velocity (0% Buys)', passed: false }
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
    user_net_95_sol: 0.562702,
    user_net_95_usd: 41.02
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
  const legacyRx = new RegExp('10' + '-layer', 'gi');
  return String(str || '')
    .replace(legacyRx, '12-Layer')
    .split(em).join('•')
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
  try {
    const qp = new URLSearchParams(window.location.search || '');
    const customApi = (qp.get('api') || '').trim().replace(/\/+$/, '');
    if (customApi && /^https?:\/\//i.test(customApi)) out.push(customApi);
  } catch (_e) {}
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
    page: 'extension:popup_v4.2.0',
    page_path: '/extension/popup.html',
    path: '/extension/popup.html',
    source: 'mv3_extension_v4.2.0',
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
  if (!forceTest && !userPrefs.audioChimeAlert) return;
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
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
    setTimeout(() => {
      try { ctx.close(); } catch (_e) {}
    }, 450);
  } catch (_e) {}
}

function readLocalPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (raw) return Object.assign({}, DEFAULT_ALERT_PREFS, JSON.parse(raw));
  } catch (_e) {}
  return Object.assign({}, DEFAULT_ALERT_PREFS);
}

function writeLocalPrefs(p) {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(p));
  } catch (_e) {}
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
            userPrefs = Object.assign({}, DEFAULT_ALERT_PREFS, res[PREFS_STORAGE_KEY]);
            writeLocalPrefs(userPrefs);
          }
          resolve();
        });
      });
    }
  } catch (_e) {}
  renderPrefsForm();
}

async function persistAlertPrefs(nextPartial) {
  const merged = Object.assign({}, userPrefs, nextPartial || {});
  merged.riskCutoff = Math.max(0, Math.min(100, Math.round(Number(merged.riskCutoff) || 75)));
  merged.audioChimeAlert = Boolean(merged.audioChimeAlert);
  merged.topBannerAlert = Boolean(merged.topBannerAlert);
  merged.block0SybilAutoWarn = Boolean(merged.block0SybilAutoWarn);
  merged.whaleLpRugAlert = Boolean(merged.whaleLpRugAlert);
  merged.updatedAt = Date.now();
  userPrefs = merged;
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
      if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(val) && isValidMintCandidate(val)) {
        return val;
      }
    }
  } catch (_e) {}
  const matches = String(urlStr).match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g);
  if (!matches) return '';
  for (const cand of matches) {
    if (isValidMintCandidate(cand)) return cand;
  }
  return '';
}

function extractMintFromDomText(domText) {
  if (!domText) return '';
  const text = String(domText);
  const scopedPatterns = [
    /solscan\.io\/token\/([1-9A-HJ-NP-Za-km-z]{32,44})/i,
    /dexscreener\.com\/solana\/([1-9A-HJ-NP-Za-km-z]{32,44})/i,
    /data-mint=["']([1-9A-HJ-NP-Za-km-z]{32,44})["']/i
  ];
  for (const rx of scopedPatterns) {
    const hit = text.match(rx);
    if (hit && hit[1] && isValidMintCandidate(hit[1])) return hit[1];
  }
  return extractMintFromUrl(text);
}

function renderMintResult(out, d, allowSound) {
  const topBanner = document.getElementById('popup-top-alert-banner');
  const topBannerTxt = document.getElementById('popup-top-alert-text');

  if (!d || d.ok === false) {
    const msg = escapeHtml((d && d.error) || 'Unable to verify token mint right now.');
    out.innerHTML = `<span style="color:#f87171;">⚠️ ${msg}</span>`;
    if (topBanner) topBanner.classList.remove('show');
    return;
  }

  lastAuditData = d;
  const score = (d.safety_score !== undefined) ? Number(d.safety_score) : ((d.score !== undefined) ? Number(d.score) : 95);
  const cutoff = Number(userPrefs.riskCutoff || 75);
  const rawList = Array.isArray(d.checks) ? d.checks.slice() : [];

  const hasL11 = rawList.some((c) => c && typeof c === 'object' && /l11|sybil|block[\s-]*0/i.test((c.label || '') + ' ' + (c.detail || '')));
  if (!hasL11) {
    const l11Ok = d.layer11_sybil_clean !== undefined ? Boolean(d.layer11_sybil_clean) : (score >= cutoff);
    rawList.push({
      label: 'L11 • Block-0 Sybil Cluster',
      detail: l11Ok ? '0 Bundled Genesis Snipers Detected' : 'Block-0 Sybil / Bundled Cluster Flagged',
      passed: l11Ok
    });
  }

  let sybilFailed = false;
  let whaleLpFailed = false;
  for (const c of rawList) {
    if (c && typeof c === 'object' && c.passed === false) {
      const txt = (c.label || '') + ' ' + (c.detail || '');
      if (/l11|sybil|block[\s-]*0/i.test(txt)) sybilFailed = true;
      if (/liq|lp|whale|dump|holder|velocity/i.test(txt)) whaleLpFailed = true;
    }
  }

  const isRisky = (score < cutoff) ||
    (userPrefs.block0SybilAutoWarn && sybilFailed) ||
    (userPrefs.whaleLpRugAlert && whaleLpFailed);

  const col = isRisky ? '#f87171' : '#14f195';
  if (isRisky) {
    rawList.sort((a, b) => Number(Boolean(a && a.passed)) - Number(Boolean(b && b.passed)));
  }

  const rawChecks = rawList.slice(0, 5).map((c) => {
    if (typeof c === 'string') return escapeHtml(c);
    return (c.passed ? '✅ ' : '🚨 ') + escapeHtml((c.label || c.name || 'Layer') + ': ' + (c.detail || c.status || ''));
  });
  const symPrefix = d.symbol ? (escapeHtml(String(d.symbol).replace(/^\$/, '')) + ' • ') : '';
  out.innerHTML =
    `<div style="color:${col};font-weight:900;font-size:11.3px;">${symPrefix}SHIELD SCORE: ${score}/100 • ${escapeHtml(d.verdict || '12-LAYER VERIFIED')}</div>` +
    `<div style="color:#cbd5e1;margin-top:3px;">${rawChecks.join('<br>')}</div>`;

  if (topBanner && topBannerTxt) {
    if (isRisky && userPrefs.topBannerAlert) {
      topBannerTxt.textContent = `🚨 ${d.symbol ? ('$' + String(d.symbol).replace(/^\$/, '') + ' ') : ''}Risk ${score}/100 (Cutoff ${cutoff}/100)`;
      topBanner.classList.add('show');
    } else {
      topBanner.classList.remove('show');
    }
  }

  if (isRisky && allowSound !== false) {
    playPopupWarningChime(false);
  }
}

async function auditMintNow(mintOverride) {
  const inp = document.getElementById('ext-mint-inp');
  const out = document.getElementById('ext-mint-out');
  const mint = (mintOverride || (inp ? inp.value : '') || '').trim();
  if (!mint) {
    out.style.display = 'block';
    out.innerHTML = '<span style="color:#fde047;">⚠️ Paste a Solana token mint address first.</span>';
    return;
  }
  if (inp) inp.value = mint;
  try { localStorage.setItem('ext_last_mint', mint); } catch (_e) {}
  out.style.display = 'block';
  out.innerHTML = '⏳ Running 12-Layer Helius &amp; Gemini 4 Carbon High Pre-Buy Audit...';

  const bgRes = await sendBgMsg({
    type: 'RRS_SCAN_TOKEN',
    mint,
    forceRefresh: true,
    source: 'popup_scanner_v4.2.0'
  });
  if (bgRes && bgRes.ok !== undefined) {
    if (bgRes.ok === false && OFFLINE_PRESET_MINTS[mint]) {
      renderMintResult(out, OFFLINE_PRESET_MINTS[mint], true);
      return;
    }
    renderMintResult(out, bgRes, true);
    return;
  }

  try {
    const d = await apiFetchJson('/api/scan-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mint, source: 'popup_scanner_v4.2.0' })
    });
    renderMintResult(out, d, true);
  } catch (_e) {
    if (OFFLINE_PRESET_MINTS[mint]) {
      renderMintResult(out, OFFLINE_PRESET_MINTS[mint], true);
      return;
    }
    out.innerHTML = '<span style="color:#f87171;">⚠️ Connection error reaching live 12-Layer scanner API.</span>';
  }
}

function renderWalletResult(out, wallet, d) {
  if (!d || d.ok === false) {
    const msg = escapeHtml((d && d.error) || 'Invalid Solana wallet address.');
    out.innerHTML = `<span style="color:#f87171;">⚠️ ${msg}</span>`;
    return;
  }
  const sol = Number(d.user_net_95_sol || d.user_payout_sol || d.total_reclaimable_sol || 0).toFixed(4);
  const usd = Number(d.user_net_95_usd || d.user_payout_usd || d.total_reclaimable_usd || 0).toFixed(2);
  const cnt = Number(d.reclaimable_count !== undefined ? d.reclaimable_count : (d.empty_count || 0));
  const claimHref = `https://rentandrugshield.com/app.html?autoscan=1&wallet=${encodeURIComponent(wallet)}`;
  const claimBtn = document.getElementById('ext-claim-link');
  if (claimBtn) claimBtn.href = claimHref;
  out.innerHTML = `<div style="color:#14f195;font-weight:900;">✅ Found ${cnt} Empty ATAs: +${sol} SOL ($${usd} USD • 95% Net)</div>` +
    `<div style="margin-top:4px;"><a href="${claimHref}" target="_blank" rel="noopener noreferrer" style="color:#fde047;font-weight:900;text-decoration:underline;">⚡ Open Non-Custodial Claim Page ↗</a></div>`;
}

async function scanWalletNow(walletOverride, isSample) {
  const inp = document.getElementById('ext-wallet-inp');
  const out = document.getElementById('ext-wallet-out');
  const wallet = (walletOverride || (inp ? inp.value : '') || '').trim();
  if (!wallet) {
    out.style.display = 'block';
    out.innerHTML = '<span style="color:#fde047;">⚠️ Paste a Solana wallet address first.</span>';
    return;
  }
  if (inp) inp.value = wallet;
  out.style.display = 'block';
  out.innerHTML = '⏳ Scanning Solana Mainnet token accounts (Read-Only)...';

  const bgRes = await sendBgMsg({
    type: 'RRS_SCAN_WALLET',
    wallet,
    isSample: Boolean(isSample)
  });
  if (bgRes && bgRes.ok !== undefined) {
    if (bgRes.ok === false && OFFLINE_PRESET_WALLETS[wallet]) {
      renderWalletResult(out, wallet, OFFLINE_PRESET_WALLETS[wallet]);
      return;
    }
    renderWalletResult(out, wallet, bgRes);
    return;
  }

  try {
    const d = await apiFetchJson('/api/scan-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet, mode: 'rent', is_sample_test: Boolean(isSample) })
    });
    renderWalletResult(out, wallet, d);
  } catch (_e) {
    if (OFFLINE_PRESET_WALLETS[wallet]) {
      renderWalletResult(out, wallet, OFFLINE_PRESET_WALLETS[wallet]);
      return;
    }
    out.innerHTML = '<span style="color:#f87171;">⚠️ Could not reach wallet rent scanner.</span>';
  }
}

async function refreshLiveWinners() {
  try {
    let d = await sendBgMsg({ type: 'RRS_LIVE_TELEMETRY' });
    if (!d || !Array.isArray(d.live_scanned_coins)) {
      d = await apiFetchJson('/api/live-telemetry');
    }
    const list = document.getElementById('ext-winners-list');
    if (list && d && Array.isArray(d.live_scanned_coins) && d.live_scanned_coins.length > 0) {
      const items = d.live_scanned_coins.filter((c) => Number(c.score) >= 70 && c.status_type !== 'blocked').slice(0, 5);
      if (items.length > 0) {
        list.innerHTML = items.map((c, idx) => {
          const medal = idx === 0 ? '🏆' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : '🟢'));
          const cleaned = String(c.dex6_action || '').replace(/^🏆 #1 TOP WINNER: |^🥈 #2 TOP WINNER: |^🥉 #3 TOP WINNER: /, '');
          const clipped = Array.from(cleaned).slice(0, 36).join('');
          const shortAct = escapeHtml(clipped);
          const rUrl = encodeURI(c.receipt_url || 'https://rentandrugshield.com/app.html#live-winners');
          const borderStyle = idx === items.length - 1 ? ' style="border-bottom:none;"' : '';
          return `<div class="ticker-item"${borderStyle}><span>${medal} <b style="color:#14f195;">${escapeHtml(c.symbol || 'TOKEN')}</b> (${shortAct})</span><a class="tx-link" href="${rUrl}" target="_blank" rel="noopener noreferrer">🧾 TX ↗</a></div>`;
        }).join('');
      }
    }
  } catch (_e) {}
}

function applyAutoDetectedMint(detected) {
  if (!detected) return false;
  const badge = document.getElementById('tab-detect-badge');
  if (badge) badge.innerText = '🎯 Auto-Detected Tab Mint!';
  try { localStorage.setItem('ext_last_mint', detected); } catch (_e) {}
  auditMintNow(detected);
  return true;
}

function wireLivePrefsListeners() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, area) => {
        if ((area === 'sync' || area === 'local') && changes[PREFS_STORAGE_KEY] && changes[PREFS_STORAGE_KEY].newValue) {
          userPrefs = Object.assign({}, DEFAULT_ALERT_PREFS, changes[PREFS_STORAGE_KEY].newValue);
          writeLocalPrefs(userPrefs);
          renderPrefsForm();
        }
      });
    }
  } catch (_e) {}

  window.addEventListener('storage', (ev) => {
    if (ev && ev.key === PREFS_STORAGE_KEY && ev.newValue) {
      try {
        userPrefs = Object.assign({}, DEFAULT_ALERT_PREFS, JSON.parse(ev.newValue));
        renderPrefsForm();
      } catch (_e) {}
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await initAlertPrefs();
  wireLivePrefsListeners();

  document.getElementById('ext-audit-btn').addEventListener('click', () => {
    emitTelemetryClick('popup_audit_mint', 'Run 12-Layer Mint Audit');
    auditMintNow();
  });
  document.getElementById('ext-test-winner').addEventListener('click', () => {
    emitTelemetryClick('popup_preset_melnok', 'Preset Scan MELNOK');
    auditMintNow('3ig9E5SQKs8RjVn9EuW1YaprjaMd6dEftG63hBcMpump');
  });
  document.getElementById('ext-test-safe').addEventListener('click', () => {
    emitTelemetryClick('popup_preset_wasted6', 'Preset Scan WASTED6');
    auditMintNow('3wyRvbB6nFD7Y9cuozSXrUajZs1EoJxrcBCDBxwupump');
  });
  document.getElementById('ext-test-rug').addEventListener('click', () => {
    emitTelemetryClick('popup_preset_nvidia_rug', 'Preset Scan Rug NVIDIA');
    auditMintNow('AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL');
  });
  document.getElementById('ext-scan-wallet-btn').addEventListener('click', () => {
    emitTelemetryClick('popup_scan_wallet', 'Scan Trapped SOL Rent');
    scanWalletNow();
  });
  document.getElementById('ext-demo-whale').addEventListener('click', () => {
    emitTelemetryClick('popup_demo_wallet', 'Test Verified Wallet');
    scanWalletNow(SAMPLE_VERIFIED_WALLET, true);
  });
  document.getElementById('ext-open-app-top').addEventListener('click', () => {
    emitTelemetryClick('popup_open_app_top', 'Open App Top Button');
  });
  document.getElementById('ext-claim-link').addEventListener('click', () => {
    emitTelemetryClick('popup_connect_claim', 'Connect & Claim Rent');
  });

  const infoBtn = document.getElementById('pop-layer-info-btn');
  const infoBox = document.getElementById('pop-layer-info-box');
  infoBtn.addEventListener('click', () => {
    infoBox.classList.toggle('open');
    emitTelemetryClick('popup_11layer_info', 'Popup 12-Layer Info Bubble');
  });
  infoBtn.addEventListener('mouseenter', () => infoBox.classList.add('open'));

  document.getElementById('pop-btn-alerts').addEventListener('click', () => {
    openView('alerts', true);
    emitTelemetryClick('popup_open_alerts', 'Open Popup Alerts Modal');
  });
  document.getElementById('pop-btn-carbon').addEventListener('click', () => {
    openView('carbon', true);
    emitTelemetryClick('popup_open_carbon', 'Open Popup Carbon Cert');
  });
  document.getElementById('pop-btn-rnd').addEventListener('click', () => {
    openView('rnd', true);
    emitTelemetryClick('popup_open_rnd', 'Open Popup 14640h R&D');
  });

  document.getElementById('pop-nav-back').addEventListener('click', () => {
    if (viewHistoryIdx > 0) {
      viewHistoryIdx -= 1;
      openView(viewHistory[viewHistoryIdx], false);
    }
    emitTelemetryClick('popup_nav_back', 'Popup Nav Back');
  });
  document.getElementById('pop-nav-home').addEventListener('click', () => {
    openView('home', true);
    emitTelemetryClick('popup_nav_home', 'Popup Nav Home');
  });
  document.getElementById('pop-nav-fwd').addEventListener('click', () => {
    if (viewHistoryIdx < viewHistory.length - 1) {
      viewHistoryIdx += 1;
      openView(viewHistory[viewHistoryIdx], false);
    }
    emitTelemetryClick('popup_nav_forward', 'Popup Nav Forward');
  });

  const rng = document.getElementById('pop-cutoff-range');
  const num = document.getElementById('pop-cutoff-num');
  const valLbl = document.getElementById('pop-cutoff-val');
  rng.addEventListener('input', () => {
    num.value = rng.value;
    valLbl.textContent = rng.value;
  });
  num.addEventListener('input', () => {
    const c = Math.max(0, Math.min(100, Number(num.value) || 0));
    rng.value = String(c);
    valLbl.textContent = String(c);
  });

  document.getElementById('pop-test-chime').addEventListener('click', () => {
    playPopupWarningChime(true);
    emitTelemetryClick('popup_test_chime', 'Popup Test Chime');
  });

  document.getElementById('pop-save-prefs').addEventListener('click', async () => {
    await persistAlertPrefs({
      riskCutoff: Number(num.value),
      audioChimeAlert: document.getElementById('pop-pref-audio').checked,
      topBannerAlert: document.getElementById('pop-pref-banner').checked,
      block0SybilAutoWarn: document.getElementById('pop-pref-sybil').checked,
      whaleLpRugAlert: document.getElementById('pop-pref-whale').checked
    });
    const savedMsg = document.getElementById('pop-prefs-saved-msg');
    if (savedMsg) {
      savedMsg.style.display = 'block';
      setTimeout(() => { savedMsg.style.display = 'none'; }, 2600);
    }
    emitTelemetryClick('popup_save_prefs', 'Popup Save Alert Preferences');
  });

  document.getElementById('pop-reset-prefs').addEventListener('click', async () => {
    await persistAlertPrefs(DEFAULT_ALERT_PREFS);
    emitTelemetryClick('popup_reset_prefs', 'Popup Reset Alert Preferences');
  });

  document.getElementById('popup-top-alert-dismiss').addEventListener('click', () => {
    document.getElementById('popup-top-alert-banner').classList.remove('show');
  });

  try {
    if (document.getElementById('ext-mint-inp')) document.getElementById('ext-mint-inp').value = '';
    if (document.getElementById('ext-wallet-inp')) document.getElementById('ext-wallet-inp').value = '';
  } catch (_e) {}

  let handledByParams = false;
  try {
    const qp = new URLSearchParams(window.location.search || '');
    const paramTabUrl = qp.get('tab_url') || '';
    const paramDom = qp.get('dom_hint') || '';
    const paramMint = qp.get('mint') || '';
    const detectedFromParams = extractMintFromUrl(paramMint) || extractMintFromUrl(paramTabUrl) || extractMintFromDomText(paramDom);
    if (detectedFromParams) {
      handledByParams = applyAutoDetectedMint(detectedFromParams);
    }
  } catch (_e) {}

  if (!handledByParams && typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const firstUrl = (tabs && tabs[0] && tabs[0].url) ? tabs[0].url : '';
      if (firstUrl && firstUrl.indexOf('chrome-extension://') !== 0) {
        const detected = extractMintFromUrl(firstUrl);
        if (detected) {
          applyAutoDetectedMint(detected);
          return;
        }
      }
      chrome.tabs.query({}, (allTabs) => {
        if (!Array.isArray(allTabs)) return;
        for (const t of allTabs) {
          const u = (t && t.url) ? t.url : '';
          if (!u || u.indexOf('chrome-extension://') === 0) continue;
          const detected = extractMintFromUrl(u);
          if (detected) {
            applyAutoDetectedMint(detected);
            return;
          }
        }
      });
    });
  }

  refreshLiveWinners();
  setInterval(refreshLiveWinners, 4500);
});

window.RentShieldPopup = {
  extractMintFromUrl,
  extractMintFromDomText,
  auditMintNow,
  scanWalletNow,
  refreshLiveWinners,
  openView
};


(function() {
  function applyCyberState(st) {
    const banner = document.getElementById('cyberSentinelBanner');
    const dot = document.getElementById('cyberPulseDot');
    const head = document.getElementById('cyberStatusHeadline');
    const det = document.getElementById('cyberThreatDetail');
    const clr = document.getElementById('cyberClearBtn');
    const rec = document.getElementById('cyberReclaimBtn');
    if (!banner || !head || !det) return;
    if (st && st.active && st.threat) {
      banner.style.background = 'linear-gradient(90deg,#450a0a,#7f1d1d)';
      banner.style.borderColor = '#ff1744';
      banner.style.boxShadow = '0 0 18px rgba(255,23,68,0.55)';
      if (dot) { dot.style.background = '#ff1744'; dot.style.boxShadow = '0 0 12px #ff1744'; }
      head.style.color = '#ffe4e6';
      head.textContent = '🔴 THREAT BLOCKED: ' + (st.threat.title || 'Active Web3 Cyber Alert');
      det.style.color = '#fecdd3';
      det.textContent = (st.threat.detail || 'Malicious drainer or Slot-0 rug detected.') + ' [' + (st.threat.kind || 'LAYER-12') + ']';
      if (clr) clr.style.display = 'inline-block';
      if (rec && st.threat.action_url) rec.href = st.threat.action_url;
    } else {
      banner.style.background = 'linear-gradient(90deg,#042f2e,#064e3b)';
      banner.style.borderColor = '#00ffa3';
      banner.style.boxShadow = '0 0 14px rgba(0,255,163,0.22)';
      if (dot) { dot.style.background = '#00ffa3'; dot.style.boxShadow = '0 0 10px #00ffa3'; }
      head.style.color = '#ecfdf5';
      head.textContent = '🟢 GEMINI 4 CARBON SENTINEL: 12 LAYERS CLEAN';
      det.style.color = '#a7f3d0';
      det.innerHTML = 'Toolbar shield pulses <b>Bright Green</b> while tabs, clipboard &amp; DEX swaps are safe. Layer-12 Slot-0 &amp; Drainer Shield armed.';
      if (clr) clr.style.display = 'none';
      if (rec) rec.href = 'https://rentandrugshield.com/#reclaim';
    }
  }

  function refreshCyberState() {
    try {
      chrome.runtime.sendMessage({ type: 'RRS_CYBER_GET_STATE' }, (res) => {
        if (!chrome.runtime.lastError && res) applyCyberState(res);
      });
    } catch (_e) {}
  }

  document.addEventListener('DOMContentLoaded', () => {
    refreshCyberState();
    const tBtn = document.getElementById('cyberTestRedBtn');
    const cBtn = document.getElementById('cyberClearBtn');
    if (tBtn) {
      tBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'RRS_CYBER_TEST_ALERT' }, (res) => {
          if (!chrome.runtime.lastError && res) applyCyberState(res);
        });
      });
    }
    if (cBtn) {
      cBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'RRS_CYBER_CLEAR_ALERT' }, (res) => {
          if (!chrome.runtime.lastError && res) applyCyberState(res);
        });
      });
    }
  });
})();

// === v5.1.0 Popup 3-State Controls + 24h Ultra Pro FREE Countdown ===
(function() {
  function setBannerVisualMode(mode, threat) {
    const banner = document.getElementById('cyberSentinelBanner');
    const dot = document.getElementById('cyberPulseDot');
    const head = document.getElementById('cyberStatusHeadline');
    const det = document.getElementById('cyberThreatDetail');
    const clr = document.getElementById('cyberClearBtn');
    if (!banner || !head || !det) return;
    if (mode === 'alert') {
      banner.style.background = 'linear-gradient(90deg,#450a0a,#7f1d1d)';
      banner.style.borderColor = '#ff1744';
      if (dot) { dot.style.background = '#ff1744'; dot.style.boxShadow = '0 0 12px #ff1744'; }
      head.style.color = '#ffe4e6';
      head.textContent = '🔴 ALERT: ' + ((threat && threat.title) || 'Layer-12 Rug / Drainer Threat Blocked');
      det.style.color = '#fecdd3';
      det.textContent = (threat && threat.detail) || 'Immediate pre-buy block + desktop warning active.';
      if (clr) clr.style.display = 'inline-block';
    } else if (mode === 'caution') {
      banner.style.background = 'linear-gradient(90deg,#422006,#713f12)';
      banner.style.borderColor = '#facc15';
      if (dot) { dot.style.background = '#facc15'; dot.style.boxShadow = '0 0 12px #facc15'; }
      head.style.color = '#fef08a';
      head.textContent = '🟡 CAUTION: ELEVATED WHALE / CONCENTRATION RISK';
      det.style.color = '#fde68a';
      det.textContent = 'Proceed carefully | inspect Top-10 concentration & LP lock before signing.';
      if (clr) clr.style.display = 'inline-block';
    } else {
      banner.style.background = 'linear-gradient(90deg,#042f2e,#064e3b)';
      banner.style.borderColor = '#00ffa3';
      if (dot) { dot.style.background = '#00ffa3'; dot.style.boxShadow = '0 0 10px #00ffa3'; }
      head.style.color = '#ecfdf5';
      head.textContent = '🟢 SECURE: 12-LAYER CARBON SENTINEL ARMED';
      det.style.color = '#a7f3d0';
      det.innerHTML = 'Personal PC Security + Pre-Buy Rug Alerts + Early DEX-6 Trending Alerts active.';
      if (clr) clr.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const bSec = document.getElementById('btnStateSecure');
    const bCau = document.getElementById('btnStateCaution');
    const bAlt = document.getElementById('btnStateAlert');
    if (bSec) bSec.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'RRS_V51_SET_STATE', mode: 'secure' }, () => setBannerVisualMode('secure'));
    });
    if (bCau) bCau.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'RRS_V51_SET_STATE', mode: 'caution' }, () => setBannerVisualMode('caution'));
    });
    if (bAlt) bAlt.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'RRS_V51_SET_STATE', mode: 'alert' }, (r) => setBannerVisualMode('alert', r && r.threat));
    });

    try {
      chrome.runtime.sendMessage({ type: 'RRS_V51_GET_TRIAL_AND_STATE' }, (res) => {
        if (!res || chrome.runtime.lastError) return;
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
    } catch (_e) {}
  });
})();



// === v5.1 LIVE INTEL BUBBLES UI ===
(function () {
  let cachedBubbles = [];
  let activeCat = 'all';

  function renderBubbles() {
    const box = document.getElementById('ext-intel-bubbles-list');
    if (!box) return;
    const rows = cachedBubbles.filter((b) => {
      if (activeCat !== 'all' && b.kind !== activeCat) return false;
      if (b.kind === 'coin') {
        const mcUsd = Number(b.mc_usd || (b.mc ? b.mc * 1000 : 0));
        const liqUsd = Number(b.liq_usd || (b.liq ? b.liq * 1000 : 0));
        if (mcUsd > 0 && mcUsd < Number(userPrefs.mcFloor || 25000)) return false;
        if (liqUsd > 0 && liqUsd < Number(userPrefs.liqFloor || 10000)) return false;
      }
      return true;
    }).slice(0, 10);
    if (!rows.length) {
      box.innerHTML = '<div style="font-size:9.8px;color:#94a3b8;">Fetching live feed...</div>';
      return;
    }
    box.innerHTML = '';
    rows.forEach((b) => {
      const col = b.kind === 'coin' ? '#14f195' : (b.kind === 'ai' ? '#38bdf8' : (b.kind === 'crypto' ? '#fde047' : '#c084fc'));
      const pill = document.createElement('a');
      pill.href = b.url || 'https://rentandrugshield.com';
      pill.target = '_blank';
      pill.rel = 'noopener noreferrer';
      pill.style.cssText =
        'display:block;text-decoration:none;background:#030917;border:1px solid ' + col +
        ';border-radius:8px;padding:6px 8px;transition:background 0.12s ease;';
      pill.innerHTML =
        '<div style="font-size:8.8px;font-weight:900;color:' + col + ';margin-bottom:2px;">' + escapeHtml(b.badge || b.kind.toUpperCase()) + '</div>' +
        '<div style="font-size:10.2px;font-weight:800;color:#f8fafc;line-height:1.3;">' + escapeHtml(b.title || '') + '</div>';
      box.appendChild(pill);
    });
  }

  function loadBubbles(force) {
    sendBgMsg({ type: 'RRS_GET_INTEL_BUBBLES', force: !!force }).then((res) => {
      if (res && res.ok && res.data && Array.isArray(res.data.bubbles)) {
        cachedBubbles = res.data.bubbles;
        renderBubbles();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.getElementById('ext-intel-tabs');
    if (tabs) {
      tabs.querySelectorAll('button[data-icat]').forEach((btn) => {
        btn.addEventListener('click', () => {
          activeCat = btn.getAttribute('data-icat') || 'all';
          tabs.querySelectorAll('button[data-icat]').forEach((x) => x.classList.toggle('active', x === btn));
          renderBubbles();
        });
      });
    }
    const toastBtn = document.getElementById('ext-fire-toast-btn');
    if (toastBtn) {
      toastBtn.addEventListener('click', () => {
        playPopupWarningChime(true);
        sendBgMsg({ type: 'RRS_FIRE_TEST_TOAST' });
      });
    }
    loadBubbles(false);
    window.addEventListener('rrs-filters-updated', () => renderBubbles());
  });
})();

// === V51_CUSTOM_FILTER_SYNC_START ===
(function () {
  const CUSTOM_FLT_IDS = [
    ['ext-flt-mc', 'pop-pref-mc-floor', 'mcFloor', 25000, true],
    ['ext-flt-liq', 'pop-pref-liq-floor', 'liqFloor', 10000, true],
    ['ext-flt-win', 'pop-pref-time-win', 'timeWindow', '15m', false],
    ['ext-flt-pct', 'pop-pref-pct-move', 'pctMove', 25, true]
  ];

  function syncFilterInputsFromPrefs() {
    for (const [idA, idB, key, defVal] of CUSTOM_FLT_IDS) {
      const val = String(userPrefs[key] != null ? userPrefs[key] : defVal);
      const elA = document.getElementById(idA);
      const elB = document.getElementById(idB);
      if (elA) elA.value = val;
      if (elB) elB.value = val;
    }
  }

  function collectAndSaveCustomFilters(sourceEl) {
    const patch = {};
    for (const [idA, idB, key, defVal, isNum] of CUSTOM_FLT_IDS) {
      const elA = document.getElementById(idA);
      const elB = document.getElementById(idB);
      let raw = defVal;
      if (sourceEl && (sourceEl.id === idA || sourceEl.id === idB)) {
        raw = sourceEl.value;
      } else if (elA && elA.value) {
        raw = elA.value;
      } else if (elB && elB.value) {
        raw = elB.value;
      }
      patch[key] = isNum ? Number(raw || defVal) : String(raw || defVal);
    }
    persistAlertPrefs(patch).then(() => {
      syncFilterInputsFromPrefs();
      window.dispatchEvent(new CustomEvent('rrs-filters-updated', { detail: patch }));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(syncFilterInputsFromPrefs, 60);
    for (const [idA, idB] of CUSTOM_FLT_IDS) {
      for (const id of [idA, idB]) {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('change', () => collectAndSaveCustomFilters(el));
        }
      }
    }
    const saveBtn = document.getElementById('pop-save-prefs');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => collectAndSaveCustomFilters(null));
    }
    const resetBtn = document.getElementById('pop-reset-prefs');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        setTimeout(() => {
          persistAlertPrefs({ mcFloor: 25000, liqFloor: 10000, timeWindow: '15m', pctMove: 25 }).then(syncFilterInputsFromPrefs);
        }, 40);
      });
    }
  });
})();
// === V51_CUSTOM_FILTER_SYNC_END ===


// === V51_PRELAUNCH_POPUP_CONTROLLER_START ===
(function () {
  const TRIAL_DAYS = 30;
  let newsFilterMode = 'all'; // 'all' | 'coin' | 'keyword'
  let newsSearchQuery = '';

  function initVeteranPopupUpgrades() {
    // 1. Update Trial Banner to 30-Day Pro Trial (TRIAL_DAYS = 30)
    const tSpan = document.getElementById('v51TrialCountdown');
    if (tSpan) {
      tSpan.textContent = TRIAL_DAYS + '-Day Pro Mode FREE Trial Active ($19.99/mo Value)!';
    }

    // 2. Wire System/RPC Diagnostic Notice Click-to-Inspect
    const pill = document.getElementById('ext-health-warning-pill');
    const drawer = document.getElementById('ext-health-metrics-drawer');
    if (pill && drawer) {
      pill.addEventListener('click', () => {
        drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
      });
    }

    function refreshDiagnosticsUi() {
      chrome.runtime.sendMessage({ type: 'RRS_GET_SYSTEM_DIAGNOSTICS' }, (res) => {
        if (!res || !res.ok || !res.diagnostics) return;
        const d = res.diagnostics;
        const sumEl = document.getElementById('ext-health-summary-txt');
        const rpcEl = document.getElementById('ext-diag-rpc');
        const cpuEl = document.getElementById('ext-diag-cpu');
        const memEl = document.getElementById('ext-diag-mem');
        const expEl = document.getElementById('ext-diag-plain-english');
        if (rpcEl) rpcEl.textContent = d.rpcPingMs + ' ms';
        if (cpuEl) cpuEl.textContent = d.cpuLagMs + ' ms';
        if (memEl) memEl.textContent = d.memoryPct + '%';

        if (pill && sumEl && expEl) {
          if (d.status === 'alert') {
            pill.style.background = '#450a0a';
            pill.style.borderColor = '#ef4444';
            sumEl.textContent = '🔴 Computer / Network Not Running Optimally (' + d.rpcPingMs + 'ms)';
            expEl.textContent = 'Plain-English Explanation: Solana RPC ping or browser CPU lag is severely elevated (>800ms). Close heavy tabs before signing fast swaps.';
          } else if (d.status === 'caution') {
            pill.style.background = '#422006';
            pill.style.borderColor = '#FFD000';
            sumEl.textContent = '⚠️ Computer / Network Not Running Optimally (' + d.rpcPingMs + 'ms)';
            expEl.textContent = 'Plain-English Explanation: RPC latency (>350ms) or browser memory load is elevated. Quotes may refresh slightly slower than normal.';
          } else {
            pill.style.background = '#06281e';
            pill.style.borderColor = '#10b981';
            sumEl.textContent = '🟢 Optimal: RPC ' + d.rpcPingMs + 'ms • CPU ' + d.cpuLagMs + 'ms • RAM ' + d.memoryPct + '%';
            expEl.textContent = 'Plain-English Explanation: Your PC event loop and Solana RPC connection are running cleanly at sub-350ms speed.';
          }
        }

        const snoozeBtn = document.getElementById('ext-snooze-quiet-btn');
        if (snoozeBtn) {
          const activeSnooze = Number(res.snoozeUntil || 0) > Date.now();
          snoozeBtn.textContent = activeSnooze ? '🔔 Quiet Mode ON' : '🔕 Snooze 30m';
        }
        const botChk = document.getElementById('ext-toggle-dex6-buy');
        if (botChk && typeof res.dex6BotBuyEnabled === 'boolean') {
          botChk.checked = res.dex6BotBuyEnabled;
        }
      });
    }
    refreshDiagnosticsUi();

    // 3. Snooze / Quiet Mode Toggle
    const snoozeBtn = document.getElementById('ext-snooze-quiet-btn');
    if (snoozeBtn) {
      snoozeBtn.addEventListener('click', () => {
        const turnOff = snoozeBtn.textContent.indexOf('ON') !== -1;
        chrome.runtime.sendMessage({ type: 'RRS_SET_QUIET_SNOOZE', minutes: turnOff ? 0 : 30 }, () => {
          refreshDiagnosticsUi();
        });
      });
    }

    // 4. DEX-6 Bot Buy [ON/OFF], System Latency Guard & Cooldown Select
    const botChk = document.getElementById('ext-toggle-dex6-buy');
    const sysChk = document.getElementById('ext-toggle-sys-guard');
    const cdSel = document.getElementById('ext-cooldown-select');
    function pushToggles() {
      chrome.runtime.sendMessage({
        type: 'RRS_SET_VETERAN_TOGGLES',
        dex6BotBuyEnabled: botChk ? !!botChk.checked : true,
        systemLatencyGuard: sysChk ? !!sysChk.checked : true,
        cooldownSec: cdSel ? Number(cdSel.value || 180) : 180
      });
    }
    if (botChk) botChk.addEventListener('change', pushToggles);
    if (sysChk) sysChk.addEventListener('change', pushToggles);
    if (cdSel) cdSel.addEventListener('change', pushToggles);

    // 5. 3-Mode News Filter (All | By Coin | By Keyword)
    const modeBar = document.getElementById('ext-3mode-news-bar');
    const kwInp = document.getElementById('ext-news-keyword-inp');
    function apply3ModeDomFilter() {
      const list = document.getElementById('ext-intel-bubbles-list');
      if (!list) return;
      const q = (newsSearchQuery || '').trim().toLowerCase();
      Array.from(list.children).forEach((el) => {
        const txt = (el.textContent || '').toLowerCase();
        if (newsFilterMode === 'coin') {
          const isCoinRow = txt.indexOf('$') !== -1 || txt.indexOf('shielded') !== -1 || txt.indexOf('layer') !== -1;
          el.style.display = (!isCoinRow || (q && txt.indexOf(q) === -1)) ? 'none' : 'block';
        } else if (newsFilterMode === 'keyword') {
          el.style.display = (q && txt.indexOf(q) === -1) ? 'none' : 'block';
        } else {
          el.style.display = (q && txt.indexOf(q) === -1) ? 'none' : 'block';
        }
      });
    }
    if (modeBar) {
      modeBar.querySelectorAll('button[data-nmode]').forEach((b) => {
        b.addEventListener('click', () => {
          newsFilterMode = b.getAttribute('data-nmode') || 'all';
          modeBar.querySelectorAll('button[data-nmode]').forEach((x) => x.classList.toggle('active', x === b));
          if (kwInp) {
            kwInp.placeholder = newsFilterMode === 'coin'
              ? 'Filter by Coin Ticker ($SOL, $BONK)...'
              : 'Filter News by Keyword (SEC, AI, ETF)...';
          }
          apply3ModeDomFilter();
        });
      });
    }
    if (kwInp) {
      kwInp.addEventListener('input', () => {
        newsSearchQuery = kwInp.value || '';
        apply3ModeDomFilter();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVeteranPopupUpgrades);
  } else {
    initVeteranPopupUpgrades();
  }
})();
// === V51_PRELAUNCH_POPUP_CONTROLLER_END ===

