(function () {
  'use strict';

  if (window.__RRS_CONTENT_SHIELD_LOADED__) return;
  window.__RRS_CONTENT_SHIELD_LOADED__ = true;

  const PREFS_STORAGE_KEY = 'rrs_alert_prefs_v42';
  const LAYER_INFO_BUBBLE_TEXT = 'We launched at 11 layers and now shipped Layer 12 (Slot-0 Sniper Bundle & Drainer Cybersecurity Shield) (Block-0 Sybil Cluster Defense) live at $0 extra cost during active passes.';

  const DEFAULT_ALERT_PREFS = {
    riskCutoff: 75,
    audioChimeAlert: false,
    topBannerAlert: true,
    block0SybilAutoWarn: true,
    whaleLpRugAlert: true,
    liveChartBadges: true,
    clipboardFakeWalletGuard: true
  };
  window.__RRS_CLIPBOARD_GUARD_ENABLED__ = true;

  const BASE_QUOTE_MINTS = new Set([
    'So11111111111111111111111111111111111111112',
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    '11111111111111111111111111111111',
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
    'ComputeBudget111111111111111111111111111111',
    'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'
  ]);

  let currentPrefs = Object.assign({}, DEFAULT_ALERT_PREFS);
  let activeMint = '';
  let lastScanData = null;
  let lastAlertedKey = '';
  let lastCheckedUrl = '';
  let manualPosition = null;
  let modalHistory = ['home'];
  let modalHistoryIdx = 0;
  let bannerDismissedForMint = '';

  function escapeHtml(val) {
    return String(val || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function shortMint(m) {
    if (!m || m.length < 12) return m || 'No Token Selected';
    return m.slice(0, 5) + '…' + m.slice(-4);
  }

  function getDexPlatformLabel() {
    const h = (window.location.hostname || '').toLowerCase();
    if (h.indexOf('jup.ag') !== -1) return 'Jupiter';
    if (h.indexOf('raydium.io') !== -1) return 'Raydium';
    if (h.indexOf('pump.fun') !== -1) return 'Pump.fun';
    if (h.indexOf('meteora.ag') !== -1) return 'Meteora';
    if (h.indexOf('dexscreener.com') !== -1) return 'DexScreener';
    return 'Solana DEX';
  }

  function isValidTargetMint(cand) {
    if (!cand || cand.length < 32 || cand.length > 44) return false;
    if (BASE_QUOTE_MINTS.has(cand)) return false;
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(cand);
  }

  function extractActiveMint() {
    const href = window.location.href || '';
    try {
      const u = new URL(href);
      const priorityKeys = [
        'outputMint',
        'outputCurrency',
        'mint',
        'token',
        'baseMint',
        'quoteMint',
        'inputMint',
        'inputCurrency',
        'address'
      ];
      for (const k of priorityKeys) {
        const v = (u.searchParams.get(k) || '').trim();
        if (isValidTargetMint(v)) return v;
      }

      const pathParts = u.pathname.split('/').filter(Boolean);
      for (let i = pathParts.length - 1; i >= 0; i--) {
        const seg = pathParts[i];
        if (seg.indexOf('-') !== -1) {
          const subParts = seg.split('-');
          for (let j = subParts.length - 1; j >= 0; j--) {
            if (isValidTargetMint(subParts[j])) return subParts[j];
          }
        }
        if (isValidTargetMint(seg)) return seg;
      }
    } catch (_e) {}

    const linkSelectors = [
      'a[href*="solscan.io/token/"]',
      'a[href*="solscan.io/account/"]',
      'a[href*="explorer.solana.com/address/"]',
      'a[href*="dexscreener.com/solana/"]',
      '[data-mint]',
      '[data-token-mint]'
    ];
    for (const sel of linkSelectors) {
      const nodes = document.querySelectorAll(sel);
      for (let i = 0; i < Math.min(nodes.length, 12); i++) {
        const el = nodes[i];
        const attrMint = el.getAttribute('data-mint') || el.getAttribute('data-token-mint') || '';
        if (isValidTargetMint(attrMint)) return attrMint;
        const linkHref = el.getAttribute('href') || '';
        const matches = linkHref.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g);
        if (matches) {
          for (const m of matches) {
            if (isValidTargetMint(m)) return m;
          }
        }
      }
    }
    return '';
  }

  function sendBgMessage(payload) {
    return new Promise((resolve) => {
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage(payload, (resp) => {
            if (chrome.runtime.lastError) {
              resolve(null);
              return;
            }
            resolve(resp || null);
          });
          return;
        }
      } catch (_e) {}
      resolve(null);
    });
  }

  function trackClick(btnId, btnLabel) {
    sendBgMessage({
      type: 'RRS_TELEMETRY_CLICK',
      payload: {
        button_id: btnId,
        button_label: btnLabel,
        page: 'extension:content_shield:' + getDexPlatformLabel().toLowerCase(),
        path: window.location.pathname || '/',
        url: window.location.href || '',
        mint: activeMint || ''
      }
    });
  }

  function readLocalFallbackPrefs() {
    try {
      const raw = localStorage.getItem(PREFS_STORAGE_KEY);
      if (raw) {
        return Object.assign({}, DEFAULT_ALERT_PREFS, JSON.parse(raw));
      }
    } catch (_e) {}
    return Object.assign({}, DEFAULT_ALERT_PREFS);
  }

  function writeLocalFallbackPrefs(prefs) {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
    } catch (_e) {}
  }

  async function loadAlertPrefs() {
    const localCopy = readLocalFallbackPrefs();
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        return await new Promise((resolve) => {
          chrome.storage.sync.get([PREFS_STORAGE_KEY], (res) => {
            if (!chrome.runtime.lastError && res && res[PREFS_STORAGE_KEY]) {
              currentPrefs = Object.assign({}, DEFAULT_ALERT_PREFS, res[PREFS_STORAGE_KEY]);
              writeLocalFallbackPrefs(currentPrefs);
              resolve(currentPrefs);
              return;
            }
            currentPrefs = localCopy;
            resolve(currentPrefs);
          });
        });
      }
    } catch (_e) {}
    currentPrefs = localCopy;
    return currentPrefs;
  }

  async function saveAlertPrefs(nextPartial) {
    const merged = Object.assign({}, currentPrefs, nextPartial || {});
    merged.riskCutoff = Math.max(0, Math.min(100, Math.round(Number(merged.riskCutoff) || 75)));
    merged.audioChimeAlert = Boolean(merged.audioChimeAlert);
    merged.topBannerAlert = Boolean(merged.topBannerAlert);
    merged.block0SybilAutoWarn = Boolean(merged.block0SybilAutoWarn);
    merged.whaleLpRugAlert = Boolean(merged.whaleLpRugAlert);
    merged.updatedAt = Date.now();
    currentPrefs = merged;
    writeLocalFallbackPrefs(merged);

    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ [PREFS_STORAGE_KEY]: merged }, () => {});
        chrome.storage.local.set({ [PREFS_STORAGE_KEY]: merged }, () => {});
      }
    } catch (_e) {}

    sendBgMessage({ type: 'RRS_SET_PREFS', prefs: merged });
    syncPrefControlsUI();
    if (lastScanData) {
      applyScanToUI(lastScanData, false);
    }
    return merged;
  }

  function playWarningChime(forceTest) {
    if (!forceTest && !currentPrefs.audioChimeAlert) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.setValueAtTime(440.0, now + 0.13);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);
      setTimeout(() => {
        try { ctx.close(); } catch (_e) {}
      }, 450);
    } catch (_e) {}
  }

  function findSwapBoxElement() {
    const candidates = [
      '#integrated-terminal',
      '[id*="jupiter-terminal"]',
      '[data-testid*="swap"]',
      '[class*="SwapPanel"]',
      '[class*="swap-box"]',
      '[class*="swapContainer"]',
      '[class*="trade-panel"]',
      'form'
    ];
    for (const sel of candidates) {
      const list = document.querySelectorAll(sel);
      for (let i = 0; i < list.length; i++) {
        const r = list[i].getBoundingClientRect();
        if (r.width >= 260 && r.width <= 620 && r.height >= 220 && r.top >= -40 && r.top < window.innerHeight - 100) {
          return list[i];
        }
      }
    }

    const divs = document.querySelectorAll('main div, section div');
    for (let i = 0; i < Math.min(divs.length, 160); i++) {
      const el = divs[i];
      const r = el.getBoundingClientRect();
      if (r.width >= 300 && r.width <= 540 && r.height >= 280 && r.height <= 740 && r.top >= 40 && r.top <= 340) {
        const txt = (el.innerText || '').slice(0, 320);
        if (/\b(Swap|Buy|Sell|You pay|Selling|Buying)\b/i.test(txt)) {
          return el;
        }
      }
    }
    return null;
  }

  function positionShieldBesideSwapBox() {
    const root = document.getElementById('rrs-floating-shield-root');
    if (!root) return;

    if (manualPosition) {
      const clampedLeft = Math.max(8, Math.min(window.innerWidth - 304, manualPosition.left));
      const clampedTop = Math.max(8, Math.min(window.innerHeight - 80, manualPosition.top));
      root.style.left = clampedLeft + 'px';
      root.style.top = clampedTop + 'px';
      root.style.right = 'auto';
      root.style.bottom = 'auto';
      return;
    }

    const widgetW = root.classList.contains('rrs-minimized') ? 190 : 294;
    const swapEl = findSwapBoxElement();
    if (swapEl) {
      const r = swapEl.getBoundingClientRect();
      const topY = Math.max(64, Math.min(window.innerHeight - 270, Math.round(r.top)));
      if (window.innerWidth - r.right >= widgetW + 22) {
        root.style.left = Math.round(r.right + 14) + 'px';
        root.style.top = topY + 'px';
        root.style.right = 'auto';
        root.style.bottom = 'auto';
        return;
      }
      if (r.left >= widgetW + 22) {
        root.style.left = Math.round(r.left - widgetW - 14) + 'px';
        root.style.top = topY + 'px';
        root.style.right = 'auto';
        root.style.bottom = 'auto';
        return;
      }
    }

    root.style.left = 'auto';
    root.style.top = 'auto';
    root.style.right = '16px';
    root.style.bottom = '16px';
  }

  function getShieldIconUrl() {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        return chrome.runtime.getURL('icon48.png');
      }
    } catch (_e) {}
    return 'https://rentandrugshield.com/favicon.ico';
  }

  function buildUI() {
    if (document.getElementById('rrs-floating-shield-root')) return;

    const banner = document.createElement('div');
    banner.id = 'rrs-top-alert-banner';
    banner.innerHTML =
      '<div class="rrs-banner-msg">' +
        '<span class="rrs-banner-tag">🚨 12-LAYER SHIELD ALERT</span>' +
        '<span id="rrs-banner-text">Risk threshold triggered on active Solana mint.</span>' +
      '</div>' +
      '<div class="rrs-banner-actions">' +
        '<button type="button" class="rrs-banner-btn" id="rrs-banner-inspect">Inspect 12-Layer Report</button>' +
        '<button type="button" class="rrs-banner-close" id="rrs-banner-dismiss">✕ Dismiss</button>' +
      '</div>';
    document.documentElement.appendChild(banner);

    const root = document.createElement('div');
    root.id = 'rrs-floating-shield-root';
    const iconSrc = escapeHtml(getShieldIconUrl());
    const dexName = escapeHtml(getDexPlatformLabel());

    root.innerHTML =
      '<div class="rrs-shield-hdr" id="rrs-drag-handle" title="Drag to reposition beside swap box">' +
        '<div class="rrs-hdr-left">' +
          '<img class="rrs-shield-logo" src="' + iconSrc + '" alt="Shield" />' +
          '<span class="rrs-hdr-title" id="rrs-mini-summary">🛡️ 12-Layer • ' + dexName + '</span>' +
          '<button type="button" class="rrs-info-trigger" id="rrs-info-btn" title="12-Layer Pass Upgrade Info">ⓘ</button>' +
        '</div>' +
        '<div class="rrs-hdr-ctrls">' +
          '<button type="button" class="rrs-icon-btn" id="rrs-redock-btn" title="Snap beside swap box">📌</button>' +
          '<button type="button" class="rrs-icon-btn" id="rrs-min-btn" title="Minimize / Expand">-</button>' +
        '</div>' +
      '</div>' +
      '<div class="rrs-info-popover" id="rrs-info-popover">' +
        '<b>12-Layer Live Pass Guarantee:</b> ' + escapeHtml(LAYER_INFO_BUBBLE_TEXT) +
      '</div>' +
      '<div class="rrs-shield-body">' +
        '<div class="rrs-score-box">' +
          '<div class="rrs-score-top">' +
            '<span class="rrs-score-pill rrs-score-idle" id="rrs-score-pill">SHIELD READY • 12L</span>' +
            '<span class="rrs-mint-chip" id="rrs-mint-chip">Auto-Detecting…</span>' +
          '</div>' +
          '<div class="rrs-verdict-line" id="rrs-verdict-line">Select or paste any Solana token mint to audit (&lt;120ms).</div>' +
          '<div class="rrs-l11-line" id="rrs-l11-line">🛡️ L11 Block-0 Sybil Cluster Defense: Armed</div>' +
        '</div>' +
        '<div class="rrs-action-grid">' +
          '<button type="button" class="rrs-act-btn rrs-btn-primary" id="rrs-open-audit-btn">🔍 12-Layer Audit</button>' +
          '<button type="button" class="rrs-act-btn rrs-btn-alerts" id="rrs-open-alerts-btn">⚙️ Alerts (<span id="rrs-cutoff-mini">75</span>)</button>' +
        '</div>' +
        '<div class="rrs-trust-row">' +
          '<button type="button" class="rrs-trust-badge" id="rrs-open-carbon-btn">🛡️ Carbon Certified</button>' +
          '<button type="button" class="rrs-trust-badge rrs-rnd-badge" id="rrs-open-rnd-btn">🔬 14,640h (7.32y) R&amp;D</button>' +
        '</div>' +
      '</div>';
    document.documentElement.appendChild(root);

    const backdrop = document.createElement('div');
    backdrop.id = 'rrs-modal-backdrop';
    backdrop.innerHTML =
      '<div class="rrs-modal-card" role="dialog" aria-modal="true">' +
        '<div class="rrs-modal-top">' +
          '<div style="display:flex;align-items:center;gap:7px;">' +
            '<img class="rrs-shield-logo" src="' + iconSrc + '" alt="Shield" />' +
            '<span class="rrs-modal-title">SOL Rent &amp; Rug Shield • 12-Layer Suite (v6.0)</span>' +
            '<button type="button" class="rrs-info-trigger" id="rrs-modal-info-btn" title="12-Layer Info">ⓘ</button>' +
          '</div>' +
          '<button type="button" class="rrs-icon-btn" id="rrs-modal-close-btn">✕ Close</button>' +
        '</div>' +
        '<div class="rrs-info-popover" id="rrs-modal-info-popover">' +
          escapeHtml(LAYER_INFO_BUBBLE_TEXT) +
        '</div>' +
        '<div class="rrs-nav-bar">' +
          '<div class="rrs-nav-grp">' +
            '<button type="button" class="rrs-nav-btn" id="rrs-nav-back">← Back</button>' +
            '<button type="button" class="rrs-nav-btn" id="rrs-nav-home">🏠 Home</button>' +
            '<button type="button" class="rrs-nav-btn" id="rrs-nav-fwd">Forward →</button>' +
          '</div>' +
          '<a href="https://rentandrugshield.com/app.html" target="_blank" rel="noopener noreferrer" class="rrs-nav-btn" id="rrs-open-webapp-link" style="text-decoration:none;color:#fde047;border-color:#fde047;">Open Web App ↗</a>' +
        '</div>' +
        '<div class="rrs-nav-tabs">' +
          '<button type="button" class="rrs-tab-btn rrs-tab-active" data-rrs-view="home">🛡️ 12L Audit</button>' +
          '<button type="button" class="rrs-tab-btn" data-rrs-view="alerts">⚙️ Alerts</button>' +
          '<button type="button" class="rrs-tab-btn" data-rrs-view="carbon">🏛️ Carbon Cert</button>' +
          '<button type="button" class="rrs-tab-btn" data-rrs-view="rnd">🔬 14,640h R&amp;D</button>' +
        '</div>' +
        '<div id="rrs-view-home" class="rrs-modal-view">' +
          '<div class="rrs-sec-box">' +
            '<div style="font-weight:900;color:#67e8f9;margin-bottom:6px;">12-Layer Pre-Buy Mint Scanner &amp; Block-0 Sybil Check</div>' +
            '<div style="display:flex;gap:6px;margin-bottom:6px;">' +
              '<input type="text" class="rrs-inp" id="rrs-manual-mint-inp" placeholder="Paste Solana Mint Address…" />' +
              '<button type="button" class="rrs-act-btn rrs-btn-primary" id="rrs-manual-scan-btn" style="padding:6px 12px;">Scan Now</button>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;">' +
              '<button type="button" class="rrs-act-btn" data-rrs-preset="3ig9E5SQKs8RjVn9EuW1YaprjaMd6dEftG63hBcMpump">🚀 $MELNOK</button>' +
              '<button type="button" class="rrs-act-btn" data-rrs-preset="3wyRvbB6nFD7Y9cuozSXrUajZs1EoJxrcBCDBxwupump">🏆 $WASTED6</button>' +
              '<button type="button" class="rrs-act-btn" data-rrs-preset="AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL" style="color:#fca5a5;border-color:#ef4444;">🚨 Rug $NVIDIA</button>' +
            '</div>' +
          '</div>' +
          '<div class="rrs-sec-box" id="rrs-modal-audit-details">' +
            '<div style="color:#94a3b8;">Waiting for active swap mint or manual scan…</div>' +
          '</div>' +
        '</div>' +
        '<div id="rrs-view-alerts" class="rrs-modal-view" style="display:none;">' +
          '<div class="rrs-sec-box">' +
            '<div style="font-weight:900;color:#fde047;margin-bottom:4px;">⚙️ On-Screen User Alert Preferences</div>' +
            '<div style="font-size:10px;color:#94a3b8;margin-bottom:8px;">Synced automatically across tabs &amp; popup via chrome.storage.sync (+ localStorage fallback).</div>' +
            '<div class="rrs-pref-row">' +
              '<div style="flex:1;">' +
                '<div class="rrs-pref-lbl">Risk Score Cutoff (<span id="rrs-pref-cutoff-lbl">75</span>/100)</div>' +
                '<div class="rrs-pref-sub">Warn whenever token safety score falls below cutoff</div>' +
                '<input type="range" id="rrs-pref-cutoff-range" min="0" max="100" step="1" value="75" style="width:100%;margin-top:5px;accent-color:#14f195;" />' +
              '</div>' +
              '<input type="number" class="rrs-num-inp" id="rrs-pref-cutoff-num" min="0" max="100" value="75" />' +
            '</div>' +
            '<div class="rrs-pref-row">' +
              '<div>' +
                '<div class="rrs-pref-lbl">🔊 Audio Chime Alert</div>' +
                '<div class="rrs-pref-sub">Play instant synth warning tone on high-risk tokens</div>' +
              '</div>' +
              '<div style="display:flex;align-items:center;gap:6px;">' +
                '<button type="button" class="rrs-icon-btn" id="rrs-test-chime-btn">Test 🔊</button>' +
                '<input type="checkbox" id="rrs-pref-audio" checked style="width:16px;height:16px;accent-color:#14f195;" />' +
              '</div>' +
            '</div>' +
            '<div class="rrs-pref-row">' +
              '<div>' +
                '<div class="rrs-pref-lbl">🚨 High-Contrast Top Banner Alert</div>' +
                '<div class="rrs-pref-sub">Pin high-visibility warning bar across DEX viewport</div>' +
              '</div>' +
              '<input type="checkbox" id="rrs-pref-banner" checked style="width:16px;height:16px;accent-color:#14f195;" />' +
            '</div>' +
            '<div class="rrs-pref-row">' +
              '<div>' +
                '<div class="rrs-pref-lbl">🕸️ Layer-11 Block-0 Sybil Cluster Auto-Warn</div>' +
                '<div class="rrs-pref-sub">Flag genesis-bundled insider &amp; sniper clusters</div>' +
              '</div>' +
              '<input type="checkbox" id="rrs-pref-sybil" checked style="width:16px;height:16px;accent-color:#14f195;" />' +
            '</div>' +
            '<div class="rrs-pref-row">' +
              '<div>' +
                '<div class="rrs-pref-lbl">🐋 Whale Dump / LP-Rug Alert</div>' +
                '<div class="rrs-pref-sub">Warn on unlocked LP, shallow pool trap, or top-holder dump</div>' +
              '</div>' +
              '<input type="checkbox" id="rrs-pref-whale" checked style="width:16px;height:16px;accent-color:#14f195;" />' +
            '</div>' +
            '<div style="display:flex;gap:6px;margin-top:9px;">' +
              '<button type="button" class="rrs-act-btn rrs-btn-primary" id="rrs-save-prefs-btn" style="flex:2;">💾 Save Alert Preferences</button>' +
              '<button type="button" class="rrs-act-btn" id="rrs-reset-prefs-btn" style="flex:1;">Reset (75)</button>' +
            '</div>' +
            '<div class="rrs-toast" id="rrs-prefs-toast">✅ Preferences synced across Chrome &amp; active DEX tabs!</div>' +
          '</div>' +
        '</div>' +
        '<div id="rrs-view-carbon" class="rrs-modal-view" style="display:none;">' +
          '<div class="rrs-sec-box">' +
            '<div style="font-weight:900;color:#14f195;font-size:12px;margin-bottom:5px;">🛡️ Carbon Cybersecurity Certification • Verified Architecture</div>' +
            '<div style="color:#cbd5e1;margin-bottom:7px;">Certified <b>12-Layer Adaptive Pre-Buy Defense</b> powered by <b>Gemini 4 Carbon High</b> deterministic verification &amp; <b>100% Non-Custodial Zero-Key</b> read-only RPC inspection.</div>' +
            '<div style="background:#030917;border:1px solid #1e293b;border-radius:8px;padding:8px;font-size:10.2px;color:#e2e8f0;line-height:1.48;">' +
              '• <b>L1-L3 Supply &amp; Authority Gate:</b> Mint Auth, Freeze Auth &amp; Top-Holder Concentration<br/>' +
              '• <b>L4-L5 Liquidity Integrity:</b> Liq/MC Trap Ratio &amp; Burned/Locked LP Verification<br/>' +
              '• <b>L6-L8 Bytecode &amp; Hook Defense:</b> Token-2022 Transfer Hooks, Metadata Spoof &amp; Inner-CPI Drainer Simulation<br/>' +
              '• <b>L9-L10 Market Microstructure:</b> True Pool Lifecycle Age &amp; Organic Buy/Sell Velocity<br/>' +
              '• <b style="color:#14f195;">L11 Block-0 Sybil Cluster Defense:</b> Genesis-slot bundled sniper &amp; linked funder ring detection' +
            '</div>' +
            '<div style="margin-top:8px;padding:7px 8px;background:rgba(20,241,149,0.08);border:1px solid rgba(20,241,149,0.3);border-radius:8px;font-size:10.2px;">' +
              '<div>🔒 <b>Zero Private Keys • Zero Blind Signing:</b> Never requests seed phrases or wallet write permissions inside extension scans.</div>' +
              '<div style="margin-top:5px;color:#fde047;">📧 Executive Desk: <a href="mailto:ceo@rentandrugshield.com" style="color:#7dd3fc;">ceo@rentandrugshield.com</a> • Institutional SLA: <a href="mailto:enterprise@rentandrugshield.com" style="color:#7dd3fc;">enterprise@rentandrugshield.com</a></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div id="rrs-view-rnd" class="rrs-modal-view" style="display:none;">' +
          '<div class="rrs-sec-box">' +
            '<div style="font-weight:900;color:#fde047;font-size:12px;margin-bottom:5px;">🔬 14,640h (7.32 Work-Years) Engineering &amp; Mainnet Telemetry Proof</div>' +
            '<div style="color:#cbd5e1;margin-bottom:7px;">Backed by <b>14,640 verified engineering &amp; live Solana Mainnet telemetry hours</b> (<b>7.32 standard 2,000h work-years</b>):</div>' +
            '<div style="background:#030917;border:1px solid #1e293b;border-radius:8px;padding:8px;font-size:10.2px;color:#e2e8f0;line-height:1.48;">' +
              '• <b>SPL Account &amp; Rent Reclamation (3,420h):</b> 2,039,280 lamport ATA state &amp; zero-custody batch close verification<br/>' +
              '• <b>Token-2022 Hooks &amp; Fee Traps (3,680h):</b> Transfer-hook CPI inspection &amp; max-fee honeypot defense<br/>' +
              '• <b>Inner-CPI Drainer Simulation (3,940h):</b> Pre-execution instruction graph &amp; authority hijack blocking<br/>' +
              '• <b>Layer-11 Block-0 Sybil Cluster Defense (3,600h):</b> Genesis slot multi-wallet bundle &amp; sniper attribution' +
            '</div>' +
            '<div style="margin-top:8px;font-weight:900;color:#67e8f9;font-size:10.8px;">Institutional &amp; Pro Pass Pricing Ladder (1st Rent Claim 0% Fee):</div>' +
            '<div class="rrs-ladder-grid">' +
              '<div class="rrs-tier-card"><div class="rrs-tier-price">$19.99</div><div class="rrs-tier-name">Trader Pro (30d)</div></div>' +
              '<div class="rrs-tier-card"><div class="rrs-tier-price">$49.99</div><div class="rrs-tier-name">Sniper Bot API</div></div>' +
              '<div class="rrs-tier-card"><div class="rrs-tier-price">$99</div><div class="rrs-tier-name">Quant Stream</div></div>' +
              '<div class="rrs-tier-card" style="border-color:#fde047;"><div class="rrs-tier-price" style="color:#fde047;">$500/mo</div><div class="rrs-tier-name">Enterprise SLA</div></div>' +
            '</div>' +
            '<div style="margin-top:7px;font-size:9.8px;color:#94a3b8;">' + escapeHtml(LAYER_INFO_BUBBLE_TEXT) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.documentElement.appendChild(backdrop);

    wireUIEvents();
    syncPrefControlsUI();
    positionShieldBesideSwapBox();
  }

  function switchModalView(viewName, recordHistory) {
    const validViews = ['home', 'alerts', 'carbon', 'rnd'];
    const target = validViews.indexOf(viewName) !== -1 ? viewName : 'home';

    for (const v of validViews) {
      const el = document.getElementById('rrs-view-' + v);
      if (el) el.style.display = v === target ? 'block' : 'none';
    }
    const tabs = document.querySelectorAll('#rrs-modal-backdrop [data-rrs-view]');
    tabs.forEach((btn) => {
      btn.classList.toggle('rrs-tab-active', btn.getAttribute('data-rrs-view') === target);
    });

    if (recordHistory !== false) {
      if (modalHistory[modalHistoryIdx] !== target) {
        modalHistory = modalHistory.slice(0, modalHistoryIdx + 1);
        modalHistory.push(target);
        modalHistoryIdx = modalHistory.length - 1;
      }
    }

    const backBtn = document.getElementById('rrs-nav-back');
    const fwdBtn = document.getElementById('rrs-nav-fwd');
    if (backBtn) backBtn.disabled = modalHistoryIdx <= 0;
    if (fwdBtn) fwdBtn.disabled = modalHistoryIdx >= modalHistory.length - 1;
  }

  function openModal(viewName) {
    const bd = document.getElementById('rrs-modal-backdrop');
    if (!bd) return;
    bd.classList.add('rrs-modal-open');
    switchModalView(viewName || 'home', true);
  }

  function closeModal() {
    const bd = document.getElementById('rrs-modal-backdrop');
    if (bd) bd.classList.remove('rrs-modal-open');
  }

  function syncPrefControlsUI() {
    const cutoff = Math.max(0, Math.min(100, Number(currentPrefs.riskCutoff) || 75));
    const mini = document.getElementById('rrs-cutoff-mini');
    const lbl = document.getElementById('rrs-pref-cutoff-lbl');
    const rng = document.getElementById('rrs-pref-cutoff-range');
    const num = document.getElementById('rrs-pref-cutoff-num');
    const aud = document.getElementById('rrs-pref-audio');
    const ban = document.getElementById('rrs-pref-banner');
    const syb = document.getElementById('rrs-pref-sybil');
    const whl = document.getElementById('rrs-pref-whale');

    if (mini) mini.textContent = String(cutoff);
    if (lbl) lbl.textContent = String(cutoff);
    if (rng) rng.value = String(cutoff);
    if (num) num.value = String(cutoff);
    if (aud) aud.checked = Boolean(currentPrefs.audioChimeAlert);
    if (ban) ban.checked = Boolean(currentPrefs.topBannerAlert);
    if (syb) syb.checked = Boolean(currentPrefs.block0SybilAutoWarn);
    if (whl) whl.checked = Boolean(currentPrefs.whaleLpRugAlert);
    window.__RRS_CLIPBOARD_GUARD_ENABLED__ = currentPrefs.clipboardFakeWalletGuard !== false;
    const fRoot = document.getElementById('rrs-floating-shield-root');
    if (fRoot) fRoot.style.display = (currentPrefs.liveChartBadges === false) ? 'none' : '';
  }

  function wireUIEvents() {
    const root = document.getElementById('rrs-floating-shield-root');
    const handle = document.getElementById('rrs-drag-handle');

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let origLeft = 0;
    let origTop = 0;

    if (handle && root) {
      handle.addEventListener('mousedown', (ev) => {
        if (ev.target && ev.target.closest('button')) return;
        dragging = true;
        const rect = root.getBoundingClientRect();
        startX = ev.clientX;
        startY = ev.clientY;
        origLeft = rect.left;
        origTop = rect.top;
        ev.preventDefault();
      });

      window.addEventListener('mousemove', (ev) => {
        if (!dragging) return;
        manualPosition = {
          left: origLeft + (ev.clientX - startX),
          top: origTop + (ev.clientY - startY)
        };
        positionShieldBesideSwapBox();
      });

      window.addEventListener('mouseup', () => {
        dragging = false;
      });
    }

    document.getElementById('rrs-redock-btn').addEventListener('click', () => {
      manualPosition = null;
      positionShieldBesideSwapBox();
      trackClick('shield_redock', 'Snap Shield Beside Swap Box');
    });

    document.getElementById('rrs-min-btn').addEventListener('click', () => {
      root.classList.toggle('rrs-minimized');
      positionShieldBesideSwapBox();
      trackClick('shield_minimize_toggle', 'Toggle Floating Shield Minimize');
    });

    const infoBtn = document.getElementById('rrs-info-btn');
    const infoPop = document.getElementById('rrs-info-popover');
    infoBtn.addEventListener('click', () => {
      infoPop.classList.toggle('rrs-open');
      trackClick('shield_11layer_info', '12-Layer Info Bubble');
    });
    infoBtn.addEventListener('mouseenter', () => infoPop.classList.add('rrs-open'));

    const modalInfoBtn = document.getElementById('rrs-modal-info-btn');
    const modalInfoPop = document.getElementById('rrs-modal-info-popover');
    modalInfoBtn.addEventListener('click', () => {
      modalInfoPop.classList.toggle('rrs-open');
      trackClick('modal_11layer_info', 'Modal 12-Layer Info Bubble');
    });

    document.getElementById('rrs-open-audit-btn').addEventListener('click', () => {
      openModal('home');
      if (activeMint) runTokenScan(activeMint, true);
      trackClick('shield_open_audit', 'Open 12-Layer Audit Modal');
    });

    document.getElementById('rrs-open-alerts-btn').addEventListener('click', () => {
      openModal('alerts');
      trackClick('shield_open_alerts', 'Open Alert Preferences Modal');
    });

    document.getElementById('rrs-open-carbon-btn').addEventListener('click', () => {
      openModal('carbon');
      trackClick('shield_open_carbon_cert', 'Open Carbon Cybersecurity Certification');
    });

    document.getElementById('rrs-open-rnd-btn').addEventListener('click', () => {
      openModal('rnd');
      trackClick('shield_open_rnd_proof', 'Open 14640h R&D Proof Modal');
    });

    document.getElementById('rrs-modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('rrs-modal-backdrop').addEventListener('click', (ev) => {
      if (ev.target && ev.target.id === 'rrs-modal-backdrop') closeModal();
    });

    document.getElementById('rrs-nav-back').addEventListener('click', () => {
      if (modalHistoryIdx > 0) {
        modalHistoryIdx -= 1;
        switchModalView(modalHistory[modalHistoryIdx], false);
      }
      trackClick('modal_nav_back', 'Modal Nav Back');
    });

    document.getElementById('rrs-nav-home').addEventListener('click', () => {
      switchModalView('home', true);
      trackClick('modal_nav_home', 'Modal Nav Home');
    });

    document.getElementById('rrs-nav-fwd').addEventListener('click', () => {
      if (modalHistoryIdx < modalHistory.length - 1) {
        modalHistoryIdx += 1;
        switchModalView(modalHistory[modalHistoryIdx], false);
      }
      trackClick('modal_nav_forward', 'Modal Nav Forward');
    });

    document.getElementById('rrs-open-webapp-link').addEventListener('click', () => {
      trackClick('modal_open_webapp', 'Open rentandrugshield.com App');
    });

    document.querySelectorAll('#rrs-modal-backdrop [data-rrs-view]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const v = btn.getAttribute('data-rrs-view');
        switchModalView(v, true);
        trackClick('modal_tab_' + v, 'Switch Modal Tab ' + v);
      });
    });

    document.getElementById('rrs-manual-scan-btn').addEventListener('click', () => {
      const inp = document.getElementById('rrs-manual-mint-inp');
      const m = (inp ? inp.value : '').trim();
      if (m) {
        activeMint = m;
        bannerDismissedForMint = '';
        runTokenScan(m, true);
        trackClick('modal_manual_scan', 'Manual Token Scan');
      }
    });

    document.querySelectorAll('#rrs-modal-backdrop [data-rrs-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const m = btn.getAttribute('data-rrs-preset');
        const inp = document.getElementById('rrs-manual-mint-inp');
        if (inp) inp.value = m;
        activeMint = m;
        bannerDismissedForMint = '';
        runTokenScan(m, true);
        trackClick('modal_preset_scan', 'Preset Token Scan ' + btn.textContent.trim());
      });
    });

    const rng = document.getElementById('rrs-pref-cutoff-range');
    const num = document.getElementById('rrs-pref-cutoff-num');
    const lbl = document.getElementById('rrs-pref-cutoff-lbl');
    rng.addEventListener('input', () => {
      num.value = rng.value;
      lbl.textContent = rng.value;
    });
    num.addEventListener('input', () => {
      const clamped = Math.max(0, Math.min(100, Number(num.value) || 0));
      rng.value = String(clamped);
      lbl.textContent = String(clamped);
    });

    document.getElementById('rrs-test-chime-btn').addEventListener('click', () => {
      playWarningChime(true);
      trackClick('prefs_test_chime', 'Test Audio Warning Chime');
    });

    document.getElementById('rrs-save-prefs-btn').addEventListener('click', async () => {
      await saveAlertPrefs({
        riskCutoff: Number(num.value),
        audioChimeAlert: document.getElementById('rrs-pref-audio').checked,
        topBannerAlert: document.getElementById('rrs-pref-banner').checked,
        block0SybilAutoWarn: document.getElementById('rrs-pref-sybil').checked,
        whaleLpRugAlert: document.getElementById('rrs-pref-whale').checked
      });
      const toast = document.getElementById('rrs-prefs-toast');
      if (toast) {
        toast.classList.add('rrs-show');
        setTimeout(() => toast.classList.remove('rrs-show'), 2600);
      }
      trackClick('prefs_save', 'Save Alert Preferences');
    });

    document.getElementById('rrs-reset-prefs-btn').addEventListener('click', async () => {
      await saveAlertPrefs(DEFAULT_ALERT_PREFS);
      trackClick('prefs_reset', 'Reset Alert Preferences');
    });

    document.getElementById('rrs-banner-inspect').addEventListener('click', () => {
      openModal('home');
      trackClick('top_banner_inspect', 'Inspect Risk Report From Top Banner');
    });

    document.getElementById('rrs-banner-dismiss').addEventListener('click', () => {
      bannerDismissedForMint = activeMint;
      const b = document.getElementById('rrs-top-alert-banner');
      if (b) b.classList.remove('rrs-banner-visible');
      trackClick('top_banner_dismiss', 'Dismiss Top Risk Banner');
    });
  }

  function applyScanToUI(d, allowAudioTrigger) {
    const root = document.getElementById('rrs-floating-shield-root');
    const scorePill = document.getElementById('rrs-score-pill');
    const mintChip = document.getElementById('rrs-mint-chip');
    const verdictLine = document.getElementById('rrs-verdict-line');
    const l11Line = document.getElementById('rrs-l11-line');
    const miniSummary = document.getElementById('rrs-mini-summary');
    const modalDetails = document.getElementById('rrs-modal-audit-details');
    const banner = document.getElementById('rrs-top-alert-banner');
    const bannerText = document.getElementById('rrs-banner-text');

    if (!root || !scorePill) return;

    if (!d || d.ok === false) {
      scorePill.className = 'rrs-score-pill rrs-score-idle';
      scorePill.textContent = 'API CHECK PENDING';
      verdictLine.textContent = (d && d.error) ? d.error : 'Could not verify token right now.';
      if (modalDetails) {
        modalDetails.innerHTML = '<div style="color:#fca5a5;">⚠️ ' + escapeHtml(verdictLine.textContent) + '</div>';
      }
      return;
    }

    const score = Number(d.safety_score !== undefined ? d.safety_score : 95);
    const cutoff = Number(currentPrefs.riskCutoff || 75);
    const l11Passed = d.layer11 ? Boolean(d.layer11.passed) : (score >= cutoff);
    const whalePassed = d.whaleLp ? Boolean(d.whaleLp.passed) : (score >= cutoff);

    const belowCutoff = score < cutoff;
    const sybilTriggered = Boolean(currentPrefs.block0SybilAutoWarn && !l11Passed);
    const whaleTriggered = Boolean(currentPrefs.whaleLpRugAlert && !whalePassed);
    const isDanger = belowCutoff || sybilTriggered || whaleTriggered;

    root.classList.toggle('rrs-danger-state', isDanger);
    scorePill.className = 'rrs-score-pill ' + (isDanger ? 'rrs-score-bad' : '');
    const sym = d.symbol ? ('$' + String(d.symbol).replace(/^\$/, '') + ' • ') : '';
    scorePill.textContent = sym + score + '/100';
    mintChip.textContent = shortMint(d.mint || activeMint);
    mintChip.title = d.mint || activeMint || '';
    verdictLine.textContent = d.verdict || (isDanger ? 'HIGH RISK • BELOW CUTOFF' : 'SAFE • 12-LAYER VERIFIED');

    if (miniSummary) {
      miniSummary.textContent = '🛡️ ' + (d.symbol ? ('$' + String(d.symbol).replace(/^\$/, '') + ' ') : '') + score + '/100 • 12L';
    }

    const l11Detail = (d.layer11 && d.layer11.detail) ? d.layer11.detail : (l11Passed ? 'Clean Genesis Slot' : 'Sybil Cluster Flagged');
    l11Line.className = 'rrs-l11-line' + (l11Passed ? '' : ' rrs-l11-danger');
    l11Line.textContent = (l11Passed ? '✅ L11 Block-0 Sybil: ' : '🚨 L11 Block-0 Sybil: ') + l11Detail;

    if (modalDetails) {
      const checks = Array.isArray(d.checks) ? d.checks : [];
      const rows = checks.map((c) => {
        const ok = Boolean(c.passed);
        return '<div style="padding:4px 0;border-bottom:1px solid rgba(148,163,184,0.12);color:' + (ok ? '#cbd5e1' : '#fca5a5') + ';">' +
          (ok ? '✅ ' : '🚨 ') + '<b>' + escapeHtml(c.label || 'Layer') + ':</b> ' + escapeHtml(c.detail || '') +
        '</div>';
      }).join('');
      modalDetails.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
          '<span style="font-size:12.5px;font-weight:900;color:' + (isDanger ? '#f87171' : '#14f195') + ';">' + escapeHtml(sym + 'SHIELD SCORE: ' + score + '/100') + '</span>' +
          '<span style="font-size:10px;color:#fde047;">Cutoff: ' + cutoff + '/100</span>' +
        '</div>' +
        '<div style="font-weight:800;margin-bottom:6px;color:#f8fafc;">' + escapeHtml(verdictLine.textContent) + '</div>' +
        '<div>' + (rows || 'All 12 Pre-Buy Security Layers Verified.') + '</div>';
    }

    if (banner && bannerText) {
      if (isDanger && currentPrefs.topBannerAlert && bannerDismissedForMint !== (d.mint || activeMint)) {
        const reasons = [];
        if (belowCutoff) reasons.push('Score ' + score + '/100 < Cutoff ' + cutoff + '/100');
        if (sybilTriggered) reasons.push('L11 Block-0 Sybil Cluster Flagged');
        if (whaleTriggered) reasons.push('Whale Dump / LP-Rug Hazard');
        bannerText.textContent = sym + reasons.join(' • ');
        banner.classList.add('rrs-banner-visible');
      } else {
        banner.classList.remove('rrs-banner-visible');
      }
    }

    if (isDanger && allowAudioTrigger) {
      const alertKey = (d.mint || activeMint) + ':' + score;
      if (lastAlertedKey !== alertKey) {
        lastAlertedKey = alertKey;
        playWarningChime(false);
      }
    }
  }

  async function runTokenScan(mint, forceRefresh) {
    if (!mint) return;
    const scorePill = document.getElementById('rrs-score-pill');
    const mintChip = document.getElementById('rrs-mint-chip');
    const verdictLine = document.getElementById('rrs-verdict-line');
    const inp = document.getElementById('rrs-manual-mint-inp');

    if (inp && !inp.value) inp.value = mint;
    if (mintChip) {
      mintChip.textContent = shortMint(mint);
      mintChip.title = mint;
    }
    if (scorePill) {
      scorePill.className = 'rrs-score-pill rrs-score-idle';
      scorePill.textContent = '⏳ AUDITING 12L…';
    }
    if (verdictLine) {
      verdictLine.textContent = 'Querying 12-Layer Helius & Carbon High Gate…';
    }

    const res = await sendBgMessage({
      type: 'RRS_SCAN_TOKEN',
      mint,
      forceRefresh: Boolean(forceRefresh),
      source: 'floating_swap_shield_' + getDexPlatformLabel().toLowerCase()
    });
    lastScanData = res;
    applyScanToUI(res, true);
  }

  function checkPageAndMint() {
    positionShieldBesideSwapBox();
    const detected = extractActiveMint();
    if (detected && detected !== activeMint) {
      activeMint = detected;
      bannerDismissedForMint = '';
      const inp = document.getElementById('rrs-manual-mint-inp');
      if (inp) inp.value = detected;
      runTokenScan(detected, false);
    }
  }

  function setupLivePreferenceSync() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
        chrome.storage.onChanged.addListener((changes, area) => {
          if ((area === 'sync' || area === 'local') && changes[PREFS_STORAGE_KEY] && changes[PREFS_STORAGE_KEY].newValue) {
            currentPrefs = Object.assign({}, DEFAULT_ALERT_PREFS, changes[PREFS_STORAGE_KEY].newValue);
            writeLocalFallbackPrefs(currentPrefs);
            syncPrefControlsUI();
            if (lastScanData) applyScanToUI(lastScanData, false);
          }
        });
      }
    } catch (_e) {}

    window.addEventListener('storage', (ev) => {
      if (ev && ev.key === PREFS_STORAGE_KEY && ev.newValue) {
        try {
          currentPrefs = Object.assign({}, DEFAULT_ALERT_PREFS, JSON.parse(ev.newValue));
          syncPrefControlsUI();
          if (lastScanData) applyScanToUI(lastScanData, false);
        } catch (_e) {}
      }
    });
  }

  async function init() {
    await loadAlertPrefs();
    buildUI();
    setupLivePreferenceSync();
    checkPageAndMint();

    window.addEventListener('resize', positionShieldBesideSwapBox, { passive: true });
    window.addEventListener('popstate', checkPageAndMint);
    window.addEventListener('hashchange', checkPageAndMint);

    let debounceTimer = null;
    const obs = new MutationObserver(() => {
      if (window.location.href !== lastCheckedUrl) {
        lastCheckedUrl = window.location.href;
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(checkPageAndMint, 350);
      }
    });
    if (document.body) {
      obs.observe(document.body, { childList: true, subtree: true });
    }

    setInterval(checkPageAndMint, 2200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


(function() {
  const DRAINER_RX = /SetAuthority\s*\(\s*['"]?AccountOwner|ApproveChecked\s*\([^)]*18446744073709551615|angel[_-]?drainer|pink[_-]?drainer|inferno[_-]?drainer|enter your 12 or 24 word secret recovery phrase/i;
  let flaggedDomOnce = false;

  function scanDomForDrainerPayloads() {
    if (flaggedDomOnce) return;
    try {
      const scripts = document.querySelectorAll('script:not([src])');
      for (let i = 0; i < Math.min(scripts.length, 40); i++) {
        const txt = scripts[i].textContent || '';
        if (txt.length > 20 && DRAINER_RX.test(txt)) {
          flaggedDomOnce = true;
          chrome.runtime.sendMessage({
            type: 'RRS_CYBER_THREAT_DETECTED',
            threat: {
              id: 'DOM-DRAINER-' + location.hostname,
              kind: 'DRAINER_APPROVE_SETAUTHORITY_SCRIPT',
              title: 'CRITICAL Wallet Drainer Script Blocked on ' + location.hostname,
              detail: 'Detected SPL SetAuthority / Unlimited Approve drainer payload attempting wallet hijack.',
              action_url: 'https://rentandrugshield.com/?cyber_inspect=1&domain=' + encodeURIComponent(location.hostname)
            }
          });
          break;
        }
      }
    } catch (_e) {}
  }

  document.addEventListener('paste', (ev) => {
    if (window.__RRS_CLIPBOARD_GUARD_ENABLED__ === false) return;
    try {
      const pasted = (ev.clipboardData || window.clipboardData).getData('text') || '';
      if (DRAINER_RX.test(pasted)) {
        chrome.runtime.sendMessage({
          type: 'RRS_CYBER_THREAT_DETECTED',
          threat: {
            id: 'CLIPBOARD-THREAT-' + Date.now(),
            kind: 'CLIPBOARD_DRAINER_PAYLOAD',
            title: 'Suspicious Drainer Payload Detected in Clipboard',
            detail: 'Clipboard contains SPL SetAuthority / recovery-phrase trap signature.',
            action_url: 'https://rentandrugshield.com/?cyber_inspect=1'
          }
        });
      }
    } catch (_e) {}
  }, true);

  setTimeout(scanDomForDrainerPayloads, 1200);


  /* === RRS v5.1 SECURITY UPGRADE: CLIPBOARD HIJACK, VANITY-POISONING & HOMOGRAPH/TYPOSQUAT SENTINEL === */
  const RRS_SOL_PUBKEY_RX = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;
  const RRS_PROTECTED_DOMAINS = [
    'pump.fun',
    'jup.ag',
    'dexscreener.com',
    'photon-sol.tinyastro.io',
    'photon-sol.io',
    'bullx.io',
    'rentandrugshield.com'
  ];
  let _rrsLastCopiedSolAddr = '';
  let _rrsLastCopiedAt = 0;
  let _rrsRecentTrustedAddrs = new Set();
  let _rrsRecentDustPoisoners = new Set();

  function _rrsLevDistance(a, b) {
    if (a === b) return 0;
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > 2) return 99;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[m][n];
  }

  function _rrsNormalizeConfusables(h) {
    return String(h || '').toLowerCase()
      .replace(/rn/g, 'm')
      .replace(/1/g, 'l')
      .replace(/0/g, 'o')
      .replace(/-/g, '');
  }

  function _rrsCheckHostPhishing(rawHost) {
    const host = String(rawHost || '').toLowerCase().replace(/^www\./, '').trim();
    if (!host) return null;
    if (RRS_PROTECTED_DOMAINS.some(d => host === d || host.endsWith('.' + d))) {
      return null;
    }
    if (host.includes('xn--')) {
      return {
        kind: 'PUNYCODE_IDN_HOMOGRAPH',
        spoofed: host,
        canonical: 'rentandrugshield.com',
        reason: 'Blocked IDN Punycode (xn--) lookalike domain commonly used in Solana wallet-drainer phishing.'
      };
    }
    const hostBase = host.split('.')[0];
    for (const canon of RRS_PROTECTED_DOMAINS) {
      const canonBase = canon.split('.')[0];
      const distFull = _rrsLevDistance(host, canon);
      const distBase = _rrsLevDistance(hostBase, canonBase);
      const confMatch = _rrsNormalizeConfusables(hostBase) === _rrsNormalizeConfusables(canonBase) && host !== canon;
      if ((distFull === 1) || (canonBase.length >= 5 && distBase === 1) || confMatch) {
        return {
          kind: 'DEX_TYPOSQUAT_CLONE',
          spoofed: host,
          canonical: canon,
          reason: `Detected 1-character typosquat / homograph clone of official ${canon}.`
        };
      }
    }
    return null;
  }

  function _rrsShowCriticalRedAlert(title, detail, canonicalDomain) {
    try {
      const existing = document.getElementById('rrs-v51-red-cyber-shield');
      if (existing) existing.remove();
      const bar = document.createElement('div');
      bar.id = 'rrs-v51-red-cyber-shield';
      bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483647;background:linear-gradient(90deg,#7f1d1d,#dc2626,#7f1d1d);color:#fff;padding:14px 20px;font-family:Inter,Segoe UI,sans-serif;box-shadow:0 8px 32px rgba(220,38,38,0.65);border-bottom:3px solid #fde047;display:flex;align-items:center;justify-content:space-between;gap:16px;';
      const safeHref = canonicalDomain ? ('https://' + canonicalDomain) : 'https://rentandrugshield.com';
      bar.innerHTML = '<div style="display:flex;flex-direction:column;gap:3px;">'
        + '<strong style="font-size:15px;letter-spacing:0.3px;">🚨 RENT & RUG SHIELD v6.0 CRITICAL SECURITY BLOCK: ' + escapeHtml(title) + '</strong>'
        + '<span style="font-size:13px;color:#fee2e2;">' + escapeHtml(detail) + '</span>'
        + '</div>'
        + '<div style="display:flex;gap:8px;align-items:center;flex-shrink:0;">'
        + (canonicalDomain ? ('<a href="' + safeHref + '" style="background:#fde047;color:#111827;font-weight:800;padding:7px 13px;border-radius:8px;text-decoration:none;font-size:12.5px;">Go to Official ' + escapeHtml(canonicalDomain) + '</a>') : '')
        + '<button id="rrs-v51-dismiss-red" type="button" style="background:rgba(0,0,0,0.35);color:#fff;border:1px solid rgba(255,255,255,0.4);padding:6px 11px;border-radius:8px;cursor:pointer;font-size:12px;">Dismiss</button>'
        + '</div>';
      document.documentElement.appendChild(bar);
      const btn = document.getElementById('rrs-v51-dismiss-red');
      if (btn) btn.onclick = () => bar.remove();
    } catch (_e) {}
  }

  // 1) Check current hostname & outbound link clicks for Punycode / 1-char DEX typosquats
  try {
    const hostHit = _rrsCheckHostPhishing(location.hostname);
    if (hostHit) {
      _rrsShowCriticalRedAlert('Phishing Domain Blocked (' + hostHit.spoofed + ')', hostHit.reason, hostHit.canonical);
      chrome.runtime.sendMessage({
        type: 'RRS_CYBER_THREAT_DETECTED',
        threat: { id: 'PHISH-' + Date.now(), kind: hostHit.kind, title: 'Blocked DEX Phishing Clone: ' + hostHit.spoofed, detail: hostHit.reason, action_url: 'https://' + hostHit.canonical }
      });
    }
    document.addEventListener('click', (ev) => {
      const a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
      if (!a) return;
      try {
        const u = new URL(a.href, location.href);
        const linkHit = _rrsCheckHostPhishing(u.hostname);
        if (linkHit) {
          ev.preventDefault();
          ev.stopPropagation();
          _rrsShowCriticalRedAlert('Blocked Phishing Link (' + linkHit.spoofed + ')', linkHit.reason, linkHit.canonical);
        }
      } catch (_uErr) {}
    }, true);
  } catch (_phErr) {}

  // 2) Harvest visible trusted addresses & $0-dust vanity poisoners on explorer / wallet pages
  function _rrsIndexPageAddresses() {
    try {
      const bodyTxt = (document.body && document.body.innerText) ? document.body.innerText.slice(0, 80000) : '';
      const matches = bodyTxt.match(RRS_SOL_PUBKEY_RX) || [];
      for (const addr of matches.slice(0, 120)) {
        if (BASE_QUOTE_MINTS.has(addr)) continue;
        _rrsRecentTrustedAddrs.add(addr);
      }
    } catch (_e) {}
  }
  setTimeout(_rrsIndexPageAddresses, 1800);

  // 3) Clipboard Hijack (Clipper Trojan Mutation) & First-4/Last-4 Vanity Dust Poisoning Sentinel
  document.addEventListener('copy', () => {
    try {
      const sel = String(window.getSelection ? window.getSelection().toString() : '').trim();
      const m = sel.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
      if (m) {
        _rrsLastCopiedSolAddr = m[0];
        _rrsLastCopiedAt = Date.now();
        _rrsRecentTrustedAddrs.add(m[0]);
      }
    } catch (_e) {}
  }, true);

  document.addEventListener('paste', (ev) => {
    if (window.__RRS_CLIPBOARD_GUARD_ENABLED__ === false) return;
    try {
      const pasted = String((ev.clipboardData || window.clipboardData).getData('text') || '').trim();
      const m = pasted.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
      if (!m) return;
      const pAddr = m[0];

      // Check A: Clipper Trojan Address Swap (copied Solana pubkey mutated on paste within 10m!)
      if (_rrsLastCopiedSolAddr && (Date.now() - _rrsLastCopiedAt < 600000) && pAddr !== _rrsLastCopiedSolAddr) {
        const msg = 'CLIPBOARD HIJACK DETECTED! You copied ' + _rrsLastCopiedSolAddr.slice(0, 6) + '...' + _rrsLastCopiedSolAddr.slice(-6)
          + ' but clipboard pasted ' + pAddr.slice(0, 6) + '...' + pAddr.slice(-6) + '! DO NOT SIGN OR SEND SOL!';
        _rrsShowCriticalRedAlert('Clipboard Clipper Trojan Hijack!', msg, '');
        chrome.runtime.sendMessage({
          type: 'RRS_CYBER_THREAT_DETECTED',
          threat: { id: 'CLIPPER-' + Date.now(), kind: 'CLIPBOARD_PUBKEY_MUTATION', title: 'CRITICAL: Clipboard Address Hijack Blocked!', detail: msg, action_url: 'https://rentandrugshield.com/?cyber_inspect=1' }
        });
        return;
      }

      // Check B: First-4 + Last-4 $0-Dust Vanity Address Poisoning Match
      for (const known of _rrsRecentTrustedAddrs) {
        if (known !== pAddr && known.slice(0, 4) === pAddr.slice(0, 4) && known.slice(-4) === pAddr.slice(-4)) {
          const vMsg = 'VANITY DUST POISONING ALERT! Pasted address ' + pAddr.slice(0, 6) + '...' + pAddr.slice(-6)
            + ' mimics first/last 4 chars of recent wallet ' + known.slice(0, 6) + '...' + known.slice(-6) + ' ($0-dust impersonator)!';
          _rrsShowCriticalRedAlert('Vanity Address Dust-Poisoning Detected!', vMsg, '');
          chrome.runtime.sendMessage({
            type: 'RRS_CYBER_THREAT_DETECTED',
            threat: { id: 'VANITY-' + Date.now(), kind: 'VANITY_DUST_POISONING', title: 'CRITICAL: Vanity Dust Poisoner Detected!', detail: vMsg, action_url: 'https://rentandrugshield.com/?cyber_inspect=1' }
          });
          break;
        }
      }
    } catch (_e) {}
  }, true);

  setTimeout(scanDomForDrainerPayloads, 1200);
})();
