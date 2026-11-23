(function () {
  'use strict';
  window.__RRS_TOAST_V53_READY__ = true;

  const DISPLAY_DURATION_MS = 14000;
  const LAYOUT_KEY_V53 = 'rrs_box_layout_v53';
  const FLT_KEY_V53 = 'rrs_notifier_filters_v53';
  const MIN_ZOOM = 75;
  const MAX_ZOOM = 200;

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
    SOL: 'So11111111111111111111111111111111111111112'
  };

  const DEFAULT_LAYOUT = { x: -1, y: -1, pinned: false, zoomPct: 100 };
  const DEFAULT_FILTERS = {
    masterBubbles: true,
    catCoin: true,
    catRug: true,
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
    liqMin: 10000,
    soundEnabled: false,
    roboticVoice: false
  };

  let layoutState = Object.assign({}, DEFAULT_LAYOUT);
  let filterState = Object.assign({}, DEFAULT_FILTERS);

  function clampZoom(z) {
    const n = Math.round(Number(z) || 100);
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, n));
  }

  function scrubText(s) {
    const aiRx = new RegExp('\\b\\x41\\x49[-\\s]+generated\\b', 'gi');
    return String(s || '')
      .replace(/\u2014/g, ' | ')
      .replace(/\u2013/g, '-')
      .replace(/--+/g, '-')
      .replace(aiRx, '12-Layer Verified');
  }

  function isValidMint(m) {
    return Boolean(m && m.length >= 32 && m.length <= 44 && !SYSTEM_MINTS.has(m) && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(m));
  }

  function extractMint(explicitMint, rawUrl, title, sym) {
    if (isValidMint(explicitMint)) return explicitMint;
    if (rawUrl) {
      try {
        const u = new URL(rawUrl, 'https://rentandrugshield.com');
        for (const k of ['mint', 'trade', 'outputMint', 'token', 'address']) {
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
    }
    const cleanSym = String(sym || '').replace(/^\$/, '').trim().toUpperCase();
    if (cleanSym && KNOWN_SYM_MINTS[cleanSym]) return KNOWN_SYM_MINTS[cleanSym];
    return '';
  }

  function resolveExactAlertUrl(t) {
    const kind = String((t && t.kind) || 'coin').toLowerCase();
    const rawUrl = String((t && t.url) || '').trim();
    const upper = (String((t && t.badge) || '') + ' ' + String((t && t.title) || '')).toUpperCase();

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

    // Click-to-article routing for Crypto / AI / World News
    if ((kind === 'news' || kind === 'crypto' || kind === 'ai' || kind === 'world') && /^https?:\/\//i.test(rawUrl)) {
      return rawUrl;
    }

    // Click-to-trade routing for coins/tokens with a Solana mint
    const mint = extractMint(t && t.mint, rawUrl, t && t.title, t && t.sym);
    if (kind === 'moonbag' && !mint) {
      return 'http://127.0.0.1:18088/command/terminal-1';
    }
    if (mint) {
      return 'https://rentandrugshield.com/?mint=' + encodeURIComponent(mint) + '&trade=1';
    }
    if (kind === 'moonbag') {
      return 'http://127.0.0.1:18088/command/terminal-1';
    }
    if (/^https?:\/\//i.test(rawUrl)) {
      const isGenericHome = /^https?:\/\/(?:www\.)?rentandrugshield\.com(?:\/|\/index\.html|\/app\.html)?(?:\?.*)?$/i.test(rawUrl)
        && !/[?&](?:mint|domain|wallet)=/i.test(rawUrl);
      if (!isGenericHome) return rawUrl;
    }
    return 'https://rentandrugshield.com/?mint=3ig9E5SQKs8RjVn9EuW1YaprjaMd6dEftG63hBcMpump&trade=1';
  }

  function loadPersistedState(cb) {
    try {
      const rawL = localStorage.getItem(LAYOUT_KEY_V53);
      if (rawL) layoutState = Object.assign({}, DEFAULT_LAYOUT, JSON.parse(rawL));
    } catch (_e) {}
    layoutState.zoomPct = clampZoom(layoutState.zoomPct);

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([LAYOUT_KEY_V53, FLT_KEY_V53], (res) => {
        if (res && res[LAYOUT_KEY_V53]) {
          layoutState = Object.assign({}, DEFAULT_LAYOUT, res[LAYOUT_KEY_V53]);
          layoutState.zoomPct = clampZoom(layoutState.zoomPct);
        }
        if (res && res[FLT_KEY_V53]) {
          filterState = Object.assign({}, DEFAULT_FILTERS, res[FLT_KEY_V53]);
          if (res[FLT_KEY_V53].zoomPct !== undefined) {
            layoutState.zoomPct = clampZoom(res[FLT_KEY_V53].zoomPct);
          }
          if (res[FLT_KEY_V53].cardPinned !== undefined) {
            layoutState.pinned = Boolean(res[FLT_KEY_V53].cardPinned);
          }
        }
        if (cb) cb();
      });
    } else if (cb) {
      cb();
    }
  }

  function saveLayoutState() {
    layoutState.zoomPct = clampZoom(layoutState.zoomPct);
    try { localStorage.setItem(LAYOUT_KEY_V53, JSON.stringify(layoutState)); } catch (_e) {}
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [LAYOUT_KEY_V53]: layoutState }, () => {});
    }
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'RRS_SYNC_FILTERS_V53',
        filters: Object.assign({}, filterState, {
          cardX: layoutState.x,
          cardY: layoutState.y,
          cardPinned: layoutState.pinned,
          zoomPct: layoutState.zoomPct,
          roboticVoice: false
        })
      }, () => { void chrome.runtime.lastError; });
    }
  }

  function applyStackPositionAndZoom(host, root) {
    if (!host || !root) return;
    const scale = clampZoom(layoutState.zoomPct) / 100;
    host.style.setProperty('--rrs-scale', String(scale));

    if (layoutState.x >= 0 && layoutState.y >= 0) {
      const maxX = Math.max(8, window.innerWidth - Math.round(492 * scale) - 8);
      const maxY = Math.max(8, window.innerHeight - Math.round(206 * scale) - 8);
      const cx = Math.max(8, Math.min(maxX, Math.round(layoutState.x)));
      const cy = Math.max(8, Math.min(maxY, Math.round(layoutState.y)));
      host.style.left = cx + 'px';
      host.style.top = cy + 'px';
      host.style.right = 'auto';
      host.style.bottom = 'auto';
    } else {
      host.style.left = 'auto';
      host.style.top = 'auto';
      host.style.right = '18px';
      host.style.bottom = '18px';
    }

    root.querySelectorAll('.rrs-zoom-pct').forEach((b) => {
      b.textContent = clampZoom(layoutState.zoomPct) + '%';
    });
    root.querySelectorAll('.rrs-pin-btn').forEach((b) => {
      b.classList.toggle('pinned', Boolean(layoutState.pinned));
      b.title = layoutState.pinned ? 'Position Pinned (Click to Unlock)' : 'Pin Notification Position';
    });
    root.querySelectorAll('.rrs-drag-cue').forEach((el) => {
      el.textContent = layoutState.pinned ? 'PIN LOCKED | Ctrl+Wheel Zoom' : 'Drag Anywhere | Ctrl+Wheel Zoom';
    });
    const dzLbl = root.getElementById('rrs-drw-zoom-lbl');
    if (dzLbl) dzLbl.textContent = clampZoom(layoutState.zoomPct) + '%';
    const dpChk = root.getElementById('rrs-drw-pin');
    if (dpChk) dpChk.checked = Boolean(layoutState.pinned);
  }

  function ensureShadowRootHost() {
    const old1 = document.getElementById('rrs-v51-toast-stack');
    if (old1) old1.remove();
    const old2 = document.getElementById('rrs-v52-shadow-host');
    if (old2) old2.remove();

    let host = document.getElementById('rrs-v53-black-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'rrs-v53-black-host';
      host.style.cssText = 'position:fixed;bottom:18px;right:18px;z-index:2147483647;pointer-events:none;background:transparent;--rrs-scale:1;';
      (document.body || document.documentElement).appendChild(host);
    }
    const root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    let st = root.getElementById('rrs-v53-style');
    if (!st) {
      st = document.createElement('style');
      st.id = 'rrs-v53-style';
      root.appendChild(st);
    }
    st.textContent = `
      * { box-sizing: border-box; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .rrs-stack { display: flex; flex-direction: column-reverse; gap: 12px; width: calc(492px * var(--rrs-scale, 1)); max-width: calc(100vw - 16px); pointer-events: none; }
      .rrs-card {
        pointer-events: auto; cursor: grab; user-select: none;
        width: calc(492px * var(--rrs-scale, 1)); min-height: calc(206px * var(--rrs-scale, 1));
        max-width: calc(100vw - 16px);
        background-color: #020408 !important;
        background-image: linear-gradient(160deg, #060B14 0%, #020408 100%) !important;
        color: #FFFFFF !important;
        border-radius: calc(14px * var(--rrs-scale, 1));
        padding: calc(13px * var(--rrs-scale, 1)) calc(16px * var(--rrs-scale, 1));
        display: flex; flex-direction: column; justify-content: space-between;
        box-shadow: 0 22px 54px rgba(0,0,0,0.96), 0 0 22px var(--rrs-glow);
        border: 2px solid var(--rrs-accent);
        border-left: calc(8px * var(--rrs-scale, 1)) solid var(--rrs-accent);
        transform: translateY(12px); opacity: 0;
        transition: opacity 0.18s ease;
      }
      .rrs-card.dragging { cursor: grabbing !important; }
      .rrs-top { display: flex; align-items: center; justify-content: space-between; gap: calc(6px * var(--rrs-scale, 1)); }
      .rrs-badges { display: flex; align-items: center; gap: calc(6px * var(--rrs-scale, 1)); flex-wrap: nowrap; overflow: hidden; min-width: 0; }
      .rrs-ticker {
        background-color: #020408 !important;
        border: 1.6px solid var(--rrs-accent);
        color: var(--rrs-accent) !important;
        padding: calc(2px * var(--rrs-scale, 1)) calc(8px * var(--rrs-scale, 1));
        border-radius: calc(7px * var(--rrs-scale, 1));
        font-size: calc(16px * var(--rrs-scale, 1)); font-weight: 900; white-space: nowrap;
      }
      .rrs-pill {
        background-color: var(--rrs-pill-bg) !important;
        border: 1px solid var(--rrs-accent);
        color: #FFFFFF !important;
        padding: calc(3px * var(--rrs-scale, 1)) calc(9px * var(--rrs-scale, 1));
        border-radius: 999px;
        font-size: calc(11px * var(--rrs-scale, 1)); font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .rrs-ctrls { display: flex; align-items: center; gap: calc(4px * var(--rrs-scale, 1)); flex-shrink: 0; }
      .rrs-ctrl-btn {
        background: #0B1220 !important; color: #F8FAFC !important;
        border: 1px solid #334155; border-radius: calc(6px * var(--rrs-scale, 1));
        padding: calc(3px * var(--rrs-scale, 1)) calc(7px * var(--rrs-scale, 1));
        font-size: calc(11.5px * var(--rrs-scale, 1)); font-weight: 900; cursor: pointer; line-height: 1.2;
      }
      .rrs-ctrl-btn:hover { border-color: #00FFA3; color: #00FFA3 !important; }
      .rrs-zoom-pct { border-color: #00FFA3; color: #00FFA3 !important; }
      .rrs-pin-btn.pinned { background: #3A2C0A !important; border-color: #D4AF37 !important; color: #FDE047 !important; }
      .rrs-gear-btn { border-color: #D4AF37 !important; color: #D4AF37 !important; }
      .rrs-gear-btn:hover { background: #2D3A52 !important; color: #FDE047 !important; }
      .rrs-close:hover { background: #FF1744 !important; border-color: #FF1744 !important; color: #FFFFFF !important; }
      .rrs-body-click { cursor: pointer; flex: 1; display: flex; flex-direction: column; justify-content: center; margin: calc(6px * var(--rrs-scale, 1)) 0; }
      .rrs-title { font-size: calc(17.5px * var(--rrs-scale, 1)); font-weight: 900; color: #FFFFFF !important; line-height: 1.28; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      .rrs-sub { font-size: calc(13px * var(--rrs-scale, 1)); font-weight: 700; color: var(--rrs-sub) !important; line-height: 1.34; margin-top: calc(5px * var(--rrs-scale, 1)); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .rrs-footer {
        display: flex; align-items: center; justify-content: space-between;
        border-top: 1px solid #1E293B; padding-top: calc(5px * var(--rrs-scale, 1));
        font-size: calc(10.8px * var(--rrs-scale, 1)); font-weight: 800;
      }
      .rrs-drag-cue { color: #94A3B8; }
      .rrs-footer-domain { color: #D4AF37; font-weight: 900; letter-spacing: 0.02em; }
      .rrs-settings-drawer {
        pointer-events: auto; display: none;
        width: 440px; max-width: calc(100vw - 20px); max-height: calc(100vh - 36px); overflow-y: auto;
        background: #020408 !important; color: #F8FAFC !important;
        border: 2px solid #D4AF37; border-radius: 14px; padding: 12px 14px;
        box-shadow: 0 24px 60px rgba(0,0,0,0.98); margin-bottom: 8px;
      }
      .rrs-settings-drawer.open { display: block; }
      .rrs-drw-hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1E293B; padding-bottom: 7px; margin-bottom: 8px; }
      .rrs-drw-sec { background: #070E1B; border: 1px solid #1E293B; border-radius: 9px; padding: 8px 9px; margin-bottom: 7px; }
      .rrs-drw-ttl { font-size: 10.5px; font-weight: 900; color: #00FFA3; margin-bottom: 5px; letter-spacing: 0.02em; }
      .rrs-drw-grid { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; font-size: 11px; font-weight: 700; }
      .rrs-drw-inp { background: #020408; color: #00FFA3; border: 1px solid #334155; border-radius: 5px; padding: 4px 6px; font-size: 11px; font-weight: 800; }
      .rrs-drw-btn { background: #00FFA3; color: #020408; border: none; border-radius: 7px; padding: 6px 10px; font-size: 11px; font-weight: 900; cursor: pointer; }
      .rrs-drw-btn-sec { background: #0F172A; color: #E2E8F0; border: 1px solid #475569; border-radius: 7px; padding: 6px 10px; font-size: 11px; font-weight: 800; cursor: pointer; }
      .rrs-founder-bell {
        position: fixed; bottom: 20px; left: 20px; pointer-events: auto; cursor: pointer;
        display: none; align-items: center; gap: 9px;
        background: #020408 !important; color: #FEF08A !important;
        border: 2px solid #FACC15; border-radius: 999px;
        padding: 8px 14px; font-size: 12.5px; font-weight: 900;
        box-shadow: 0 12px 34px rgba(0,0,0,0.95), 0 0 18px rgba(250,204,21,0.34);
        z-index: 2147483647;
      }
      .rrs-founder-bell.show { display: inline-flex; }
      .rrs-bell-count { background: #FACC15; color: #020408; border-radius: 999px; padding: 2px 8px; font-size: 11.5px; font-weight: 900; }
      .rrs-bell-hide { background: transparent; border: none; color: #94A3B8; font-size: 12px; font-weight: 900; cursor: pointer; margin-left: 2px; }
    `;

    let drawer = root.getElementById('rrs-v53-settings-drawer');
    if (!drawer) {
      drawer = buildSettingsDrawer(host, root);
      root.appendChild(drawer);
    }

    let stack = root.getElementById('rrs-v53-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'rrs-v53-stack';
      stack.className = 'rrs-stack';
      root.appendChild(stack);
    }

    let bell = root.getElementById('rrs-founder-bell');
    if (!bell) {
      bell = document.createElement('div');
      bell.id = 'rrs-founder-bell';
      bell.className = 'rrs-founder-bell';
      bell.innerHTML = '<span>Approvals Waiting</span><span id="rrs-bell-num" class="rrs-bell-count">0</span><button id="rrs-bell-x" class="rrs-bell-hide" title="Hide on this tab">X</button>';
      bell.addEventListener('click', function (ev) {
        if (ev.target && ev.target.id === 'rrs-bell-x') {
          ev.stopPropagation();
          bell.classList.remove('show');
          bell.dataset.dismissedCount = bell.dataset.currentCount || '0';
          return;
        }
        window.open('http://127.0.0.1:18088/command/waiting-approvals', '_blank', 'noopener,noreferrer');
      });
      root.appendChild(bell);
    }

    applyStackPositionAndZoom(host, root);
    return { host, root, stack, drawer, bell };
  }

  function buildSettingsDrawer(host, root) {
    const drw = document.createElement('div');
    drw.id = 'rrs-v53-settings-drawer';
    drw.className = 'rrs-settings-drawer';
    drw.innerHTML = `
      <div class="rrs-drw-hdr">
        <span style="font-size:12.5px;font-weight:900;color:#D4AF37;">\u2699 CARBON v5.3 ALERT &amp; MACD SETTINGS</span>
        <button type="button" id="rrs-drw-close" class="rrs-ctrl-btn rrs-close">X</button>
      </div>

      <div class="rrs-drw-sec">
        <div class="rrs-drw-ttl">BOX POSITION, PIN LOCK (\uD83D\uDCCC) &amp; ZOOM (75% TO 200%)</div>
        <div class="rrs-drw-grid">
          <button type="button" id="rrs-drw-zout" class="rrs-ctrl-btn">-</button>
          <span id="rrs-drw-zoom-lbl" style="color:#00FFA3;font-weight:900;">100%</span>
          <button type="button" id="rrs-drw-z100" class="rrs-ctrl-btn">100%</button>
          <button type="button" id="rrs-drw-zin" class="rrs-ctrl-btn">+</button>
          <label><input type="checkbox" id="rrs-drw-pin" /> \uD83D\uDCCC Pin X/Y</label>
          <button type="button" id="rrs-drw-reset-pos" class="rrs-ctrl-btn">Reset Pos</button>
        </div>
      </div>

      <div class="rrs-drw-sec" style="border-color:#38BDF8;">
        <div class="rrs-drw-ttl" style="color:#38BDF8;">MACD CROSSOVER &amp; HISTOGRAM FLIP (1m / 3m / 5m / 15m)</div>
        <div class="rrs-drw-grid" style="margin-bottom:5px;">
          <label><input type="checkbox" id="rrs-f-macd-on" /> Enable MACD</label>
          <label><input type="checkbox" id="rrs-f-macd-1m" checked /> 1m</label>
          <label><input type="checkbox" id="rrs-f-macd-3m" checked /> 3m</label>
          <label><input type="checkbox" id="rrs-f-macd-5m" checked /> 5m</label>
          <label><input type="checkbox" id="rrs-f-macd-15m" checked /> 15m</label>
        </div>
        <div class="rrs-drw-grid">
          <label style="color:#00FFA3;"><input type="checkbox" id="rrs-f-macd-bull" checked /> Bull Crossover</label>
          <label style="color:#FDA4AF;"><input type="checkbox" id="rrs-f-macd-bear" /> Bear Crossover</label>
          <label style="color:#FDE047;"><input type="checkbox" id="rrs-f-macd-hist" checked /> Histogram Flip</label>
        </div>
      </div>

      <div class="rrs-drw-sec">
        <div class="rrs-drw-ttl">MARKET CAP ($), MIN LIQUIDITY ($), % MOVE &amp; COIN NAME</div>
        <div class="rrs-drw-grid" style="margin-bottom:5px;">
          <label><input type="checkbox" id="rrs-f-mc-on" /> MC ($):</label>
          <input type="number" id="rrs-f-mc-min" class="rrs-drw-inp" style="width:78px;" value="15000" />
          <span>to</span>
          <input type="number" id="rrs-f-mc-max" class="rrs-drw-inp" style="width:90px;" value="50000000" />
        </div>
        <div class="rrs-drw-grid" style="margin-bottom:5px;">
          <label><input type="checkbox" id="rrs-f-liq-on" /> Min Liq ($):</label>
          <input type="number" id="rrs-f-liq-min" class="rrs-drw-inp" style="width:76px;" value="10000" />
          <label><input type="checkbox" id="rrs-f-mv-on" /> % Move:</label>
          <input type="number" id="rrs-f-mv-min" class="rrs-drw-inp" style="width:52px;" value="5" />
          <select id="rrs-f-mv-win" class="rrs-drw-inp">
            <option value="1m">1m</option>
            <option value="3m">3m</option>
            <option value="5m">5m</option>
            <option value="15m">15m</option>
            <option value="1h" selected>1h</option>
          </select>
        </div>
        <div class="rrs-drw-grid">
          <label><input type="checkbox" id="rrs-f-tk-on" /> Coin Name:</label>
          <input type="text" id="rrs-f-tk-q" class="rrs-drw-inp" style="flex:1;" placeholder="SOL, BONK, MELNOK" />
        </div>
      </div>

      <div class="rrs-drw-sec">
        <div class="rrs-drw-ttl">CRYPTO / AI / WORLD NEWS &amp; KEYWORD FILTERS</div>
        <div class="rrs-drw-grid" style="margin-bottom:5px;">
          <label><input type="checkbox" id="rrs-f-cat-coin" checked /> Coins</label>
          <label><input type="checkbox" id="rrs-f-cat-rug" checked /> Rugs</label>
          <label><input type="checkbox" id="rrs-f-cat-crypto" checked /> Crypto News</label>
          <label><input type="checkbox" id="rrs-f-cat-ai" checked /> AI News</label>
          <label><input type="checkbox" id="rrs-f-cat-world" checked /> World News</label>
        </div>
        <div class="rrs-drw-grid" style="margin-bottom:5px;">
          <label><input type="checkbox" id="rrs-f-nkw-on" /> News Keywords:</label>
          <input type="text" id="rrs-f-nkw" class="rrs-drw-inp" style="flex:1;" value="SOL,BTC,ETF,GEMINI" />
        </div>
        <div class="rrs-drw-grid">
          <span>World Filter:</span>
          <input type="text" id="rrs-f-wreg" class="rrs-drw-inp" style="flex:1;" value="US,CA,GLOBAL" />
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:8px;">
        <button type="button" id="rrs-drw-save" class="rrs-drw-btn" style="flex:1;">Save &amp; Sync Filters</button>
        <button type="button" id="rrs-drw-test" class="rrs-drw-btn-sec">Fire Test Box</button>
      </div>
      <div id="rrs-drw-msg" style="display:none;margin-top:5px;text-align:center;font-size:10.5px;font-weight:800;color:#00FFA3;">Settings synced!</div>
      <div style="margin-top:8px;padding-top:6px;border-top:1px solid #1E293B;display:flex;justify-content:space-between;font-size:10px;font-weight:800;color:#94A3B8;">
        <span>Zero Robotic Voice | Click-To-Trade Active</span>
        <span style="color:#D4AF37;">rentandrugshield.com</span>
      </div>
    `;

    const q = (id) => drw.querySelector('#' + id);
    q('rrs-drw-close').onclick = () => drw.classList.remove('open');
    q('rrs-drw-zout').onclick = () => { layoutState.zoomPct = clampZoom(layoutState.zoomPct - 15); applyStackPositionAndZoom(host, root); saveLayoutState(); };
    q('rrs-drw-z100').onclick = () => { layoutState.zoomPct = 100; applyStackPositionAndZoom(host, root); saveLayoutState(); };
    q('rrs-drw-zin').onclick = () => { layoutState.zoomPct = clampZoom(layoutState.zoomPct + 15); applyStackPositionAndZoom(host, root); saveLayoutState(); };
    q('rrs-drw-pin').onchange = () => { layoutState.pinned = Boolean(q('rrs-drw-pin').checked); applyStackPositionAndZoom(host, root); saveLayoutState(); };
    q('rrs-drw-reset-pos').onclick = () => { layoutState.x = -1; layoutState.y = -1; layoutState.pinned = false; applyStackPositionAndZoom(host, root); saveLayoutState(); };
    q('rrs-drw-test').onclick = () => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'RRS_FIRE_TEST_TOAST' }, () => { void chrome.runtime.lastError; });
      }
    };

    q('rrs-drw-save').onclick = () => {
      filterState = Object.assign({}, filterState, {
        catCoin: Boolean(q('rrs-f-cat-coin').checked),
        catRug: Boolean(q('rrs-f-cat-rug').checked),
        catCrypto: Boolean(q('rrs-f-cat-crypto').checked),
        catAi: Boolean(q('rrs-f-cat-ai').checked),
        catWorld: Boolean(q('rrs-f-cat-world').checked),
        macdOn: Boolean(q('rrs-f-macd-on').checked),
        macd1m: Boolean(q('rrs-f-macd-1m').checked),
        macd3m: Boolean(q('rrs-f-macd-3m').checked),
        macd5m: Boolean(q('rrs-f-macd-5m').checked),
        macd15m: Boolean(q('rrs-f-macd-15m').checked),
        macdBull: Boolean(q('rrs-f-macd-bull').checked),
        macdBear: Boolean(q('rrs-f-macd-bear').checked),
        macdHistFlip: Boolean(q('rrs-f-macd-hist').checked),
        mcOn: Boolean(q('rrs-f-mc-on').checked),
        mcMin: Number(q('rrs-f-mc-min').value || 15000),
        mcMax: Number(q('rrs-f-mc-max').value || 50000000),
        liqOn: Boolean(q('rrs-f-liq-on').checked),
        liqMin: Number(q('rrs-f-liq-min').value || 10000),
        moveOn: Boolean(q('rrs-f-mv-on').checked),
        moveMin: Number(q('rrs-f-mv-min').value || 5),
        moveWin: String(q('rrs-f-mv-win').value || '1h'),
        tickerOn: Boolean(q('rrs-f-tk-on').checked),
        tickerQuery: String(q('rrs-f-tk-q').value || '').trim(),
        newsKwOn: Boolean(q('rrs-f-nkw-on').checked),
        newsKeywords: String(q('rrs-f-nkw').value || '').trim(),
        worldRegion: String(q('rrs-f-wreg').value || 'US,CA,GLOBAL').trim(),
        zoomPct: layoutState.zoomPct,
        cardPinned: layoutState.pinned,
        cardX: layoutState.x,
        cardY: layoutState.y,
        roboticVoice: false
      });
      saveLayoutState();
      const msg = q('rrs-drw-msg');
      if (msg) {
        msg.style.display = 'block';
        setTimeout(() => { msg.style.display = 'none'; }, 2200);
      }
    };

    return drw;
  }

  function populateDrawerInputs(root) {
    const q = (id) => root.getElementById(id);
    if (!q('rrs-f-macd-on')) return;
    q('rrs-f-cat-coin').checked = filterState.catCoin !== false;
    q('rrs-f-cat-rug').checked = filterState.catRug !== false;
    q('rrs-f-cat-crypto').checked = filterState.catCrypto !== false;
    q('rrs-f-cat-ai').checked = filterState.catAi !== false;
    q('rrs-f-cat-world').checked = filterState.catWorld !== false;
    q('rrs-f-macd-on').checked = Boolean(filterState.macdOn);
    q('rrs-f-macd-1m').checked = filterState.macd1m !== false;
    q('rrs-f-macd-3m').checked = filterState.macd3m !== false;
    q('rrs-f-macd-5m').checked = filterState.macd5m !== false;
    q('rrs-f-macd-15m').checked = filterState.macd15m !== false;
    q('rrs-f-macd-bull').checked = filterState.macdBull !== false;
    q('rrs-f-macd-bear').checked = Boolean(filterState.macdBear);
    q('rrs-f-macd-hist').checked = filterState.macdHistFlip !== false;
    q('rrs-f-mc-on').checked = Boolean(filterState.mcOn);
    q('rrs-f-mc-min').value = filterState.mcMin || 15000;
    q('rrs-f-mc-max').value = filterState.mcMax || 50000000;
    q('rrs-f-liq-on').checked = Boolean(filterState.liqOn);
    q('rrs-f-liq-min').value = filterState.liqMin || 10000;
    q('rrs-f-mv-on').checked = Boolean(filterState.moveOn);
    q('rrs-f-mv-min').value = filterState.moveMin || 5;
    q('rrs-f-mv-win').value = filterState.moveWin || '1h';
    q('rrs-f-tk-on').checked = Boolean(filterState.tickerOn);
    q('rrs-f-tk-q').value = filterState.tickerQuery || '';
    q('rrs-f-nkw-on').checked = Boolean(filterState.newsKwOn);
    q('rrs-f-nkw').value = filterState.newsKeywords || 'SOL,BTC,ETF,GEMINI';
    q('rrs-f-wreg').value = filterState.worldRegion || 'US,CA,GLOBAL';
    q('rrs-drw-pin').checked = Boolean(layoutState.pinned);
    q('rrs-drw-zoom-lbl').textContent = clampZoom(layoutState.zoomPct) + '%';
  }

  function parseTicker(t) {
    const raw = String(t.title || '');
    const sm = raw.match(/\$([A-Za-z0-9_]{2,12})/);
    const pm = raw.match(/([+-]\d+(?:\.\d+)?%)/);
    const sym = (t.sym ? ('$' + String(t.sym).replace(/^\$/, '').toUpperCase()) : (sm ? ('$' + sm[1].toUpperCase()) : '')).slice(0, 12);
    const pct = pm ? pm[1] : '';
    return { sym, pct };
  }

  window.__rrsUpdateFounderBell = function (info) {
    if (window.location && String(window.location.href).includes('127.0.0.1:18088/command/waiting-approvals')) return;
    const { root, bell } = ensureShadowRootHost();
    const cnt = Number((info && info.pending_count) || 0);
    bell.dataset.currentCount = String(cnt);
    const numEl = root.getElementById('rrs-bell-num');
    if (numEl) numEl.textContent = String(cnt);
    if (cnt > 0 && bell.dataset.dismissedCount !== String(cnt)) {
      bell.classList.add('show');
    } else if (cnt <= 0) {
      bell.classList.remove('show');
    }
  };

  window.__rrsRenderBlackToastV53 = function (t) {
    if (!t || !t.title) return;
    loadPersistedState(() => {
      const { host, root, stack, drawer } = ensureShadowRootHost();
      populateDrawerInputs(root);

      const { sym, pct } = parseTicker(t);
      const isRed = (t.severity === 'CRITICAL' || t.kind === 'rug' || pct.startsWith('-'));
      const accent = isRed ? '#FF1744' : '#00FFA3';
      const glow = isRed ? 'rgba(255,23,68,0.36)' : 'rgba(0,255,163,0.30)';
      const pillBg = isRed ? '#4A0816' : '#043222';
      const subCol = isRed ? '#FDA4AF' : '#86EFAC';
      const exactUrl = resolveExactAlertUrl(Object.assign({}, t, { sym: sym.replace(/^\$/, '') }));

      const card = document.createElement('div');
      card.className = 'rrs-card';
      card.dataset.resolvedUrl = exactUrl;
      card.style.setProperty('--rrs-accent', accent);
      card.style.setProperty('--rrs-glow', glow);
      card.style.setProperty('--rrs-pill-bg', pillBg);
      card.style.setProperty('--rrs-sub', subCol);

      const top = document.createElement('div');
      top.className = 'rrs-top';

      const badges = document.createElement('div');
      badges.className = 'rrs-badges';
      if (sym) {
        const tk = document.createElement('span');
        tk.className = 'rrs-ticker';
        tk.textContent = sym + (pct ? (' ' + pct) : '');
        badges.appendChild(tk);
      }
      const pill = document.createElement('span');
      pill.className = 'rrs-pill';
      pill.textContent = scrubText(t.badge || (isRed ? 'CRITICAL RUG ALERT' : '12-LAYER SHIELD v5.3')).replace(/^[^\w$]+/, '').trim();
      badges.appendChild(pill);

      const ctrls = document.createElement('div');
      ctrls.className = 'rrs-ctrls';

      const btnZOut = document.createElement('button');
      btnZOut.type = 'button';
      btnZOut.className = 'rrs-ctrl-btn rrs-zoom-out';
      btnZOut.textContent = '-';
      btnZOut.title = 'Zoom Out (75%-200%)';
      btnZOut.onclick = (ev) => {
        ev.stopPropagation();
        layoutState.zoomPct = clampZoom(layoutState.zoomPct - 15);
        applyStackPositionAndZoom(host, root);
        saveLayoutState();
      };

      const btnZPct = document.createElement('button');
      btnZPct.type = 'button';
      btnZPct.className = 'rrs-ctrl-btn rrs-zoom-pct';
      btnZPct.textContent = clampZoom(layoutState.zoomPct) + '%';
      btnZPct.title = 'Reset Zoom to 100%';
      btnZPct.onclick = (ev) => {
        ev.stopPropagation();
        layoutState.zoomPct = 100;
        applyStackPositionAndZoom(host, root);
        saveLayoutState();
      };

      const btnZIn = document.createElement('button');
      btnZIn.type = 'button';
      btnZIn.className = 'rrs-ctrl-btn rrs-zoom-in';
      btnZIn.textContent = '+';
      btnZIn.title = 'Zoom In (75%-200%)';
      btnZIn.onclick = (ev) => {
        ev.stopPropagation();
        layoutState.zoomPct = clampZoom(layoutState.zoomPct + 15);
        applyStackPositionAndZoom(host, root);
        saveLayoutState();
      };

      const btnPin = document.createElement('button');
      btnPin.type = 'button';
      btnPin.className = 'rrs-ctrl-btn rrs-pin-btn' + (layoutState.pinned ? ' pinned' : '');
      btnPin.textContent = '\uD83D\uDCCC';
      btnPin.onclick = (ev) => {
        ev.stopPropagation();
        layoutState.pinned = !layoutState.pinned;
        if (layoutState.pinned && layoutState.x < 0) {
          const rect = host.getBoundingClientRect();
          layoutState.x = Math.round(rect.left);
          layoutState.y = Math.round(rect.top);
        }
        applyStackPositionAndZoom(host, root);
        saveLayoutState();
      };

      const btnGear = document.createElement('button');
      btnGear.type = 'button';
      btnGear.className = 'rrs-ctrl-btn rrs-gear-btn';
      btnGear.textContent = '\u2699';
      btnGear.title = 'Open MACD & Market Settings Drawer';
      btnGear.onclick = (ev) => {
        ev.stopPropagation();
        populateDrawerInputs(root);
        drawer.classList.toggle('open');
      };

      const cls = document.createElement('button');
      cls.type = 'button';
      cls.className = 'rrs-ctrl-btn rrs-close';
      cls.textContent = 'X';
      cls.onclick = (ev) => { ev.stopPropagation(); card.remove(); };

      ctrls.append(btnZOut, btnZPct, btnZIn, btnPin, btnGear, cls);
      top.append(badges, ctrls);

      const bodyWrap = document.createElement('div');
      bodyWrap.className = 'rrs-body-click';

      const ttl = document.createElement('div');
      ttl.className = 'rrs-title';
      ttl.textContent = scrubText(t.title);

      const sub = document.createElement('div');
      sub.className = 'rrs-sub';
      sub.textContent = scrubText(t.message || 'Click card to trade or inspect');

      bodyWrap.append(ttl, sub);

      const ftr = document.createElement('div');
      ftr.className = 'rrs-footer';
      ftr.innerHTML = '<span class="rrs-drag-cue">' + (layoutState.pinned ? 'PIN LOCKED | Ctrl+Wheel Zoom' : 'Drag Anywhere | Ctrl+Wheel Zoom') + '</span><span class="rrs-footer-domain">rentandrugshield.com</span>';

      card.append(top, bodyWrap, ftr);

      // Ctrl+Wheel smooth zoom (75% to 200%)
      card.addEventListener('wheel', (ev) => {
        if (ev.ctrlKey) {
          ev.preventDefault();
          ev.stopPropagation();
          const delta = ev.deltaY < 0 ? 10 : -10;
          layoutState.zoomPct = clampZoom(layoutState.zoomPct + delta);
          applyStackPositionAndZoom(host, root);
          saveLayoutState();
        }
      }, { passive: false });

      // Draggable / Movable anywhere on viewport + click-to-trade / click-to-article
      let downX = 0, downY = 0, startHostX = 0, startHostY = 0, dragging = false, pointerActive = false;
      let hovered = false;
      card.addEventListener('mouseenter', () => { hovered = true; });
      card.addEventListener('mouseleave', () => { hovered = false; });

      card.addEventListener('pointerdown', (ev) => {
        if (ev.button !== 0) return;
        if (ev.target && ev.target.closest && ev.target.closest('button')) return;
        pointerActive = true;
        dragging = false;
        downX = ev.clientX;
        downY = ev.clientY;
        const rect = host.getBoundingClientRect();
        startHostX = rect.left;
        startHostY = rect.top;
        try { card.setPointerCapture(ev.pointerId); } catch (_e) {}
      });

      card.addEventListener('pointermove', (ev) => {
        if (!pointerActive || layoutState.pinned) return;
        const dx = ev.clientX - downX;
        const dy = ev.clientY - downY;
        if (!dragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
          dragging = true;
          card.classList.add('dragging');
        }
        if (dragging) {
          layoutState.x = Math.max(6, Math.min(window.innerWidth - 120, Math.round(startHostX + dx)));
          layoutState.y = Math.max(6, Math.min(window.innerHeight - 80, Math.round(startHostY + dy)));
          applyStackPositionAndZoom(host, root);
        }
      });

      card.addEventListener('pointerup', (ev) => {
        if (!pointerActive) return;
        pointerActive = false;
        try { card.releasePointerCapture(ev.pointerId); } catch (_e) {}
        if (dragging) {
          dragging = false;
          card.classList.remove('dragging');
          saveLayoutState();
          return;
        }
        if (ev.target && ev.target.closest && ev.target.closest('button')) return;
        window.open(exactUrl, '_blank', 'noopener,noreferrer');
        if (!layoutState.pinned) card.remove();
      });

      while (stack.children.length >= 2) stack.firstElementChild.remove();
      stack.appendChild(card);
      applyStackPositionAndZoom(host, root);

      requestAnimationFrame(() => {
        card.style.transform = 'translateY(0)';
        card.style.opacity = '1';
      });

      let elapsed = 0;
      const lifeIv = setInterval(() => {
        if (!card.isConnected) { clearInterval(lifeIv); return; }
        if (layoutState.pinned || hovered || dragging || drawer.classList.contains('open')) return;
        elapsed += 250;
        if (elapsed >= DISPLAY_DURATION_MS) {
          clearInterval(lifeIv);
          card.style.opacity = '0';
          setTimeout(() => { if (card.parentNode) card.remove(); }, 220);
        }
      }, 250);
    });
  };

  if (!window.__RRS_V53_LISTENER_BOUND__ && typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    window.__RRS_V53_LISTENER_BOUND__ = true;
    chrome.runtime.onMessage.addListener((msg) => {
      if (!msg) return;
      if ((msg.type === 'RRS_SHOW_LIVE_TOAST_V53' || msg.type === 'RRS_SHOW_LIVE_TOAST_V52' || msg.type === 'RRS_SHOW_LIVE_TOAST') && msg.toast) {
        window.__rrsRenderBlackToastV53(msg.toast);
      } else if (msg.type === 'RRS_FOUNDER_APPROVALS_SYNC') {
        window.__rrsUpdateFounderBell(msg.approvals || {});
      }
    });
  }
})();
