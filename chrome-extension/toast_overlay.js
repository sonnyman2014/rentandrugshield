(function () {
  'use strict';
  window.__RRS_TOAST_V53_READY__ = true;
  window.__RRS_TOAST_V55_LUXURY_READY__ = true;

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
    SOL: 'So11111111111111111111111111111111111111112',
    BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
  };

  const DEFAULT_LAYOUT = { x: -1, y: -1, pinned: false, zoomPct: 100, autoHideSec: 14 };
  const DEFAULT_FILTERS = {
    masterBubbles: true,
    autoHideSec: 14,
    stayOpen: false,
    soundEnabled: false,
    roboticVoice: false,
    tf: '3m',
    preset: 'Runners',
    catCoin: true,
    catRug: true,
    cyberLat: true,
    whalePro: true,
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
    newsKeywords: 'Solana, ETF, Gold',
    worldRegion: 'Global',
    mcOn: true,
    mcMin: 15000,
    mcMax: 10000000,
    moveOn: true,
    moveMin: 10,
    moveWin: '3m',
    liqOn: true,
    liqMin: 10000
  };

  let layoutState = Object.assign({}, DEFAULT_LAYOUT);
  let filterState = Object.assign({}, DEFAULT_FILTERS);
  const uniqueAlerts = [];
  const seenAlertKeys = new Set();
  let activeAlertIdx = 0;
  let localUnreadCount = 0;
  let localShieldState = 'yellow_black'; // yellow_black | red_alert | emerald_flash
  let countdownRemMs = 14000;
  let countdownTotalMs = 14000;
  let countdownTimerId = null;
  let cardHovered = false;
  let isDraggingCard = false;

  const isExtRuntime = Boolean(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);

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
    if ((kind === 'news' || kind === 'crypto' || kind === 'ai' || kind === 'world') && /^https?:\/\//i.test(rawUrl)) {
      return rawUrl;
    }

    const mint = extractMint(t && t.mint, rawUrl, t && t.title, t && t.sym);
    if (kind === 'moonbag' && !mint) return 'http://127.0.0.1:18088/command/terminal-1';
    if (mint) return 'https://rentandrugshield.com/?mint=' + encodeURIComponent(mint) + '&trade=1';
    if (kind === 'moonbag') return 'http://127.0.0.1:18088/command/terminal-1';
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
    return 'https://rentandrugshield.com/?mint=3ig9E5SQKs8RjVn9EuW1YaprjaMd6dEftG63hBcMpump&trade=1';
  }

  function renderShieldSvgMarkup(state) {
    if (state === 'red_alert') {
      return `<svg viewBox="0 0 256 256" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rrsRedRim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FF8095"/><stop offset="32%" stop-color="#FF1744"/><stop offset="100%" stop-color="#8A001A"/>
          </linearGradient>
        </defs>
        <path d="M128 5 C175 5 232 14 250 22 C252 98 238 184 128 251 C18 184 4 98 6 22 C24 14 81 5 128 5 Z" fill="url(#rrsRedRim)"/>
        <path d="M128 24 C168 24 214 31 229 38 C230 100 218 170 128 228 C38 170 26 100 27 38 C42 31 88 24 128 24 Z" fill="#050208" stroke="#FF5277" stroke-width="3"/>
        <polygon points="139,58 94,130 125,130 112,194 165,117 132,117" fill="#FF1744"/>
      </svg>`;
    }
    if (state === 'emerald_flash') {
      return `<svg viewBox="0 0 256 256" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rrsEmRim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#B8FFE3"/><stop offset="35%" stop-color="#00FFA3"/><stop offset="100%" stop-color="#046C4A"/>
          </linearGradient>
        </defs>
        <path d="M128 5 C175 5 232 14 250 22 C252 98 238 184 128 251 C18 184 4 98 6 22 C24 14 81 5 128 5 Z" fill="url(#rrsEmRim)"/>
        <path d="M128 24 C168 24 214 31 229 38 C230 100 218 170 128 228 C38 170 26 100 27 38 C42 31 88 24 128 24 Z" fill="#030A09" stroke="#00FFA3" stroke-width="3"/>
        <polygon points="128,54 140,68 128,82 116,68" fill="#00FFA3"/>
        <polygon points="78,124 96,105 117,128 163,78 182,97 117,166" fill="#00FFA3"/>
      </svg>`;
    }
    return `<svg viewBox="0 0 256 256" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rrsGoldRim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFF2A6"/><stop offset="35%" stop-color="#FFD000"/><stop offset="100%" stop-color="#9E7306"/>
        </linearGradient>
      </defs>
      <path d="M128 5 C175 5 232 14 250 22 C252 98 238 184 128 251 C18 184 4 98 6 22 C24 14 81 5 128 5 Z" fill="url(#rrsGoldRim)"/>
      <path d="M128 24 C168 24 214 31 229 38 C230 100 218 170 128 228 C38 170 26 100 27 38 C42 31 88 24 128 24 Z" fill="#040812" stroke="#FFD000" stroke-width="3"/>
      <polygon points="128,54 140,68 128,82 116,68" fill="#FFD000"/>
      <polygon points="78,124 96,105 117,128 163,78 182,97 117,166" fill="#FFD000"/>
    </svg>`;
  }

  function loadPersistedState(cb) {
    if (isExtRuntime && chrome.storage && chrome.storage.local) {
      try {
        chrome.storage.local.get([LAYOUT_KEY_V53, FLT_KEY_V53], (res) => {
          if (res && res[LAYOUT_KEY_V53]) {
            layoutState = Object.assign({}, DEFAULT_LAYOUT, res[LAYOUT_KEY_V53]);
            layoutState.zoomPct = clampZoom(layoutState.zoomPct);
          }
          if (res && res[FLT_KEY_V53]) {
            filterState = Object.assign({}, DEFAULT_FILTERS, res[FLT_KEY_V53]);
          }
          cb();
        });
        return;
      } catch (_e) {}
    }
    try {
      const rawL = localStorage.getItem(LAYOUT_KEY_V53);
      if (rawL) layoutState = Object.assign({}, DEFAULT_LAYOUT, JSON.parse(rawL));
      layoutState.zoomPct = clampZoom(layoutState.zoomPct);
      const rawF = localStorage.getItem(FLT_KEY_V53);
      if (rawF) filterState = Object.assign({}, DEFAULT_FILTERS, JSON.parse(rawF));
    } catch (_e) {}
    cb();
  }

  function saveStateAll() {
    layoutState.zoomPct = clampZoom(layoutState.zoomPct);
    const mergedFlt = Object.assign({}, filterState, {
      cardX: layoutState.x,
      cardY: layoutState.y,
      cardPinned: Boolean(layoutState.pinned),
      stayOpen: Boolean(layoutState.pinned),
      zoomPct: layoutState.zoomPct,
      autoHideSec: Number(layoutState.autoHideSec || 14),
      roboticVoice: false
    });
    if (isExtRuntime && chrome.storage && chrome.storage.local) {
      try {
        chrome.storage.local.set({ [LAYOUT_KEY_V53]: layoutState, [FLT_KEY_V53]: mergedFlt }, () => {});
        if (chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ type: 'RRS_SYNC_FILTERS_V53', filters: mergedFlt }, () => { void chrome.runtime.lastError; });
        }
      } catch (_e) {}
    } else {
      try {
        localStorage.setItem(LAYOUT_KEY_V53, JSON.stringify(layoutState));
        localStorage.setItem(FLT_KEY_V53, JSON.stringify(mergedFlt));
      } catch (_e) {}
    }
  }

  function ensureShadowHost() {
    let host = document.getElementById('rrs-v53-black-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'rrs-v53-black-host';
      host.style.cssText = 'position:fixed;bottom:18px;right:18px;z-index:2147483647;pointer-events:none;background:transparent;--rrs-scale:1;';
      (document.body || document.documentElement).appendChild(host);
    }
    const root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    if (!root.getElementById('rrs-v55-luxury-style')) {
      root.innerHTML = '';
      const st = document.createElement('style');
      st.id = 'rrs-v55-luxury-style';
      st.textContent = `
        * { box-sizing: border-box; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .rrs-lux-wrap {
          display: flex; flex-direction: column; align-items: flex-end;
          pointer-events: none;
        }
        /* Above-Card Luxury Settings Drawer: opens EXACTLY 8px above Notice Card */
        .rrs-lux-drawer {
          pointer-events: auto; display: none;
          width: calc(508px * min(1.22, var(--rrs-scale, 1)));
          max-width: calc(100vw - 20px); max-height: calc(100vh - 230px); overflow-y: auto;
          margin-bottom: 8px;
          border-radius: 14px;
          border: 1.8px solid transparent;
          background:
            radial-gradient(120% 110% at 32% 16%, #10203E 0%, #091224 48%, #020408 100%) padding-box,
            linear-gradient(135deg, #FFF2A6 0%, #FFD000 42%, #D49B00 72%, #9E7306 100%) border-box;
          box-shadow: 0 22px 56px rgba(0,0,0,0.95), 0 0 24px rgba(255,208,0,0.34);
          padding: 13px 15px; color: #F8FAFC;
        }
        .rrs-lux-drawer.open { display: block; }
        .rrs-lux-card {
          pointer-events: auto; display: none; user-select: none; cursor: grab;
          width: calc(508px * var(--rrs-scale, 1));
          max-width: calc(100vw - 18px);
          border-radius: 14px;
          border: 1.8px solid transparent;
          background:
            radial-gradient(120% 110% at 32% 18%, #10203E 0%, #091224 48%, #020408 100%) padding-box,
            linear-gradient(135deg, #FFF2A6 0%, #FFD000 42%, #D49B00 72%, #9E7306 100%) border-box;
          box-shadow: 0 22px 54px rgba(0,0,0,0.95), 0 0 22px rgba(255,208,0,0.36);
          padding: calc(12px * var(--rrs-scale, 1)) calc(15px * var(--rrs-scale, 1)) calc(7px * var(--rrs-scale, 1));
          color: #FFFFFF;
          transition: box-shadow 0.2s ease;
        }
        .rrs-lux-card.open { display: block; }
        .rrs-lux-card.dragging { cursor: grabbing !important; }
        .rrs-lux-card.state-red {
          background:
            radial-gradient(120% 110% at 32% 18%, #220813 0%, #091224 52%, #020408 100%) padding-box,
            linear-gradient(135deg, #FF94A8 0%, #FF1744 48%, #9B001C 100%) border-box;
          box-shadow: 0 22px 54px rgba(0,0,0,0.95), 0 0 26px rgba(255,23,68,0.52);
        }
        .rrs-lux-card.state-emerald {
          background:
            radial-gradient(120% 110% at 32% 18%, #07281F 0%, #091224 52%, #020408 100%) padding-box,
            linear-gradient(135deg, #B8FFE3 0%, #00FFA3 48%, #059669 100%) border-box;
          box-shadow: 0 22px 54px rgba(0,0,0,0.95), 0 0 28px rgba(0,255,163,0.58);
        }
        .rrs-hdr { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .rrs-hdr-left { display: flex; align-items: center; gap: 9px; min-width: 0; flex: 1; }
        .rrs-shield-box {
          position: relative; width: calc(38px * var(--rrs-scale, 1)); height: calc(38px * var(--rrs-scale, 1));
          flex-shrink: 0; cursor: pointer;
        }
        .rrs-unread-badge {
          display: none; position: absolute; right: -3px; bottom: -3px;
          min-width: 17px; height: 17px; padding: 0 4px; border-radius: 999px;
          background: #FF1744; border: 1.4px solid #FFD000; color: #FFFFFF;
          font-size: 9.5px; font-weight: 900; align-items: center; justify-content: center;
        }
        .rrs-unread-badge.show { display: inline-flex; }
        .rrs-status-pill {
          padding: calc(4px * var(--rrs-scale, 1)) calc(9px * var(--rrs-scale, 1));
          border-radius: 8px; background: rgba(6, 56, 42, 0.68);
          border: 1px solid rgba(0, 255, 163, 0.55); color: #00FFA3;
          font-size: calc(10.8px * var(--rrs-scale, 1)); font-weight: 900;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .rrs-nav-grp { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
        .rrs-pill-btn {
          background: linear-gradient(180deg, #131E35 0%, #09101E 100%);
          border: 1.1px solid #3A4D6B; color: #F8FAFC;
          border-radius: 9px; padding: calc(4px * var(--rrs-scale, 1)) calc(9px * var(--rrs-scale, 1));
          font-size: calc(11px * var(--rrs-scale, 1)); font-weight: 800; cursor: pointer;
          transition: all 0.15s ease;
        }
        .rrs-pill-btn:hover { border-color: #FFD000; color: #FFF2A6; }
        .rrs-pill-gold {
          background: linear-gradient(180deg, rgba(168,120,8,0.42) 0%, rgba(68,48,4,0.72) 100%);
          border-color: #FFD000; color: #FFF2A6;
          box-shadow: 0 0 10px rgba(255,208,0,0.28);
        }
        .rrs-pill-emerald {
          background: linear-gradient(180deg, rgba(6,95,70,0.65) 0%, rgba(4,48,34,0.88) 100%);
          border-color: #00FFA3; color: #00FFA3;
          box-shadow: 0 0 11px rgba(0,255,163,0.32);
        }
        .rrs-pill-red {
          background: linear-gradient(180deg, rgba(88,14,30,0.7) 0%, rgba(42,6,14,0.9) 100%);
          border-color: #FF1744; color: #FF94A8;
        }
        .rrs-title {
          font-size: calc(14.5px * var(--rrs-scale, 1)); font-weight: 900; color: #FFFFFF;
          margin: calc(9px * var(--rrs-scale, 1)) 2px calc(4px * var(--rrs-scale, 1));
          line-height: 1.28; cursor: pointer;
        }
        .rrs-body {
          font-size: calc(12px * var(--rrs-scale, 1)); font-weight: 600; color: #D6E0EE;
          margin: 0 2px calc(10px * var(--rrs-scale, 1)); line-height: 1.38; cursor: pointer;
        }
        .rrs-actions { display: flex; align-items: center; justify-content: space-between; gap: 6px; flex-wrap: wrap; }
        .rrs-act-left, .rrs-act-right { display: flex; align-items: center; gap: 5px; }
        .rrs-foot {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: calc(8px * var(--rrs-scale, 1)); padding-top: calc(5px * var(--rrs-scale, 1));
          border-top: 1px solid rgba(255,208,0,0.18);
          font-size: calc(11px * var(--rrs-scale, 1)); font-weight: 800;
        }
        .rrs-brand {
          background: linear-gradient(90deg, #FFF2A6, #FFD000);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          font-weight: 900; cursor: pointer;
        }
        .rrs-prog-track {
          width: 100%; height: 4px; background: #0C1526; border-radius: 999px;
          margin-top: 6px; overflow: hidden;
        }
        .rrs-prog-bar {
          height: 100%; width: 100%;
          background: linear-gradient(90deg, #FFF2A6 0%, #FFD000 65%, #D49B00 100%);
          border-radius: 999px; transition: width 0.1s linear;
        }
        /* Drawer Luxury Controls (ZERO native checkboxes or gray dropdowns!) */
        .rrs-sec-lbl {
          font-size: 10.4px; font-weight: 900; letter-spacing: 0.03em;
          color: #FFD000; margin: 8px 0 5px;
        }
        .rrs-seg-bar { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
        .rrs-seg-pill {
          background: #080E1C; border: 1.1px solid #263854; color: #94A3B8;
          border-radius: 9px; padding: 4px 10px; font-size: 11px; font-weight: 800;
          cursor: pointer; transition: all 0.15s ease;
        }
        .rrs-seg-pill.active-gold {
          background: linear-gradient(180deg, rgba(180,130,8,0.45), rgba(72,50,4,0.78));
          border-color: #FFD000; color: #FFF2A6; box-shadow: 0 0 10px rgba(255,208,0,0.36);
        }
        .rrs-seg-pill.active-em {
          background: linear-gradient(180deg, rgba(6,95,70,0.55), rgba(4,52,40,0.85));
          border-color: #00FFA3; color: #A7F3D0; box-shadow: 0 0 10px rgba(0,255,163,0.36);
        }
        /* Animated Glowing Sliding Pill Toggle Switch */
        .rrs-sw-wrap {
          display: inline-flex; align-items: center; gap: 7px; cursor: pointer;
          padding: 3px 4px 3px 0; user-select: none;
        }
        .rrs-sw-track {
          position: relative; width: 42px; height: 21px; border-radius: 999px;
          background: #080E1C; border: 1.2px solid #2D3E5A;
          transition: all 0.18s ease; flex-shrink: 0;
        }
        .rrs-sw-thumb {
          position: absolute; top: 2px; left: 2px; width: 15px; height: 15px;
          border-radius: 50%; background: #94A3B8;
          transition: transform 0.18s cubic-bezier(0.22,1,0.36,1), background 0.18s ease;
        }
        .rrs-sw-wrap[data-on="true"][data-tone="emerald"] .rrs-sw-track {
          background: linear-gradient(135deg, rgba(6,95,70,0.72), rgba(4,56,42,0.92));
          border-color: #00FFA3; box-shadow: 0 0 12px rgba(0,255,163,0.52);
        }
        .rrs-sw-wrap[data-on="true"][data-tone="emerald"] .rrs-sw-thumb {
          transform: translateX(20px);
          background: radial-gradient(circle at 35% 35%, #FFFFFF, #00FFA3);
        }
        .rrs-sw-wrap[data-on="true"][data-tone="gold"] .rrs-sw-track {
          background: linear-gradient(135deg, rgba(146,102,4,0.68), rgba(68,48,4,0.90));
          border-color: #FFD000; box-shadow: 0 0 12px rgba(255,208,0,0.52);
        }
        .rrs-sw-wrap[data-on="true"][data-tone="gold"] .rrs-sw-thumb {
          transform: translateX(20px);
          background: radial-gradient(circle at 35% 35%, #FFFFFF, #FFD000);
        }
        .rrs-sw-lbl { font-size: 11.2px; font-weight: 700; color: #E8EEF8; }
        .rrs-inp-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; margin-bottom: 6px; }
        .rrs-inp-lbl { font-size: 9.8px; font-weight: 700; color: #94A3B8; margin-bottom: 2px; }
        .rrs-lux-inp {
          width: 100%; background: #060B16; border: 1.1px solid #384C6C;
          border-radius: 8px; padding: 5px 7px; color: #00FFA3;
          font-size: 11.5px; font-weight: 800; outline: none;
        }
        .rrs-lux-inp:focus { border-color: #FFD000; box-shadow: 0 0 8px rgba(255,208,0,0.28); }
        .rrs-founder-bell {
          position: fixed; bottom: 20px; left: 20px; pointer-events: auto; cursor: pointer;
          display: none; align-items: center; gap: 9px;
          background: #020408; color: #FEF08A; border: 1.8px solid #FFD000;
          border-radius: 999px; padding: 8px 14px; font-size: 12px; font-weight: 900;
          box-shadow: 0 12px 34px rgba(0,0,0,0.95), 0 0 18px rgba(255,208,0,0.34);
        }
        .rrs-founder-bell.show { display: inline-flex; }
      `;
      root.appendChild(st);

      const wrap = document.createElement('div');
      wrap.id = 'rrs-lux-wrap';
      wrap.className = 'rrs-lux-wrap';
      wrap.innerHTML = `
        <div id="rrs-v55-drawer" class="rrs-lux-drawer">
          <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:7px;border-bottom:1px solid rgba(255,208,0,0.22);">
            <span style="font-size:12px;font-weight:900;color:#FFF2A6;">\u2699 24K LUXURY SHIELD SETTINGS | MACD, WHALE &amp; NEWS</span>
            <button type="button" id="rrs-drw-x" class="rrs-pill-btn rrs-pill-red" style="padding:2px 8px;">\u2715</button>
          </div>

          <div class="rrs-sec-lbl">1. AUTO-HIDE COUNTDOWN &amp; CHIME</div>
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
            <div id="rrs-seg-hide" class="rrs-seg-bar" data-tone="gold">
              <button type="button" class="rrs-seg-pill" data-val="8s">8s</button>
              <button type="button" class="rrs-seg-pill active-gold" data-val="14s">14s</button>
              <button type="button" class="rrs-seg-pill" data-val="30s">30s</button>
              <button type="button" class="rrs-seg-pill" data-val="Pinned">Pinned</button>
            </div>
            <div class="rrs-sw-wrap" id="rrs-sw-sound" data-on="false" data-tone="gold">
              <div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div>
              <span class="rrs-sw-lbl">Alert Chime</span>
            </div>
          </div>

          <div class="rrs-sec-lbl">2. TIMEFRAME, MARKET PRESETS &amp; MACD TRIGGERS</div>
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:6px;">
            <div id="rrs-seg-tf" class="rrs-seg-bar" data-tone="emerald">
              <button type="button" class="rrs-seg-pill" data-val="1m">1m</button>
              <button type="button" class="rrs-seg-pill active-em" data-val="3m">3m</button>
              <button type="button" class="rrs-seg-pill" data-val="5m">5m</button>
              <button type="button" class="rrs-seg-pill" data-val="15m">15m</button>
              <button type="button" class="rrs-seg-pill" data-val="1h">1h</button>
            </div>
            <div id="rrs-seg-preset" class="rrs-seg-bar" data-tone="gold">
              <button type="button" class="rrs-seg-pill" data-val="Snipes">Snipes</button>
              <button type="button" class="rrs-seg-pill active-gold" data-val="Runners">Runners</button>
              <button type="button" class="rrs-seg-pill" data-val="Whales">Whales</button>
            </div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:12px;">
            <div class="rrs-sw-wrap" id="rrs-sw-macd-bull" data-on="true" data-tone="emerald"><div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div><span class="rrs-sw-lbl">Bull Cross</span></div>
            <div class="rrs-sw-wrap" id="rrs-sw-macd-hist" data-on="true" data-tone="gold"><div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div><span class="rrs-sw-lbl">Histogram Flip</span></div>
            <div class="rrs-sw-wrap" id="rrs-sw-macd-bear" data-on="true" data-tone="gold"><div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div><span class="rrs-sw-lbl">Bear Warn</span></div>
          </div>

          <div class="rrs-sec-lbl">3. MIN/MAX MCAP ($), MIN LIQUIDITY ($), % MOVE &amp; COIN TICKER</div>
          <div class="rrs-inp-grid">
            <div><div class="rrs-inp-lbl">Min MCap ($)</div><input id="rrs-in-minmc" class="rrs-lux-inp" type="text" value="15000" /></div>
            <div><div class="rrs-inp-lbl">Max MCap ($)</div><input id="rrs-in-maxmc" class="rrs-lux-inp" type="text" value="10000000" /></div>
            <div><div class="rrs-inp-lbl">Min Liquidity ($)</div><input id="rrs-in-minliq" class="rrs-lux-inp" type="text" value="10000" /></div>
            <div><div class="rrs-inp-lbl">% Move</div><input id="rrs-in-move" class="rrs-lux-inp" type="text" value="10" /></div>
          </div>
          <div><div class="rrs-inp-lbl">Coin Ticker (ALL or comma list: SOL, BONK, WIF, JUP)</div><input id="rrs-in-coin" class="rrs-lux-inp" type="text" value="ALL" /></div>

          <div class="rrs-sec-lbl">4. 12-LAYER SECURITY, CYBER/LATENCY &amp; WHALE MOVE SENSE</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 10px;">
            <div class="rrs-sw-wrap" id="rrs-sw-safe12" data-on="true" data-tone="emerald"><div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div><span class="rrs-sw-lbl">12-Layer Safe Coins</span></div>
            <div class="rrs-sw-wrap" id="rrs-sw-rug" data-on="true" data-tone="gold"><div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div><span class="rrs-sw-lbl">Rug / Drainer Alert</span></div>
            <div class="rrs-sw-wrap" id="rrs-sw-cyber" data-on="true" data-tone="emerald"><div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div><span class="rrs-sw-lbl">Cyber/Latency Guard</span></div>
            <div class="rrs-sw-wrap" id="rrs-sw-whale" data-on="true" data-tone="gold"><div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div><span class="rrs-sw-lbl">Whale Move Sense</span></div>
          </div>

          <div class="rrs-sec-lbl">5. CRYPTO / AI / WORLD NEWS (KEYWORDS + REGION)</div>
          <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:5px;">
            <div class="rrs-sw-wrap" id="rrs-sw-ncrypto" data-on="true" data-tone="emerald"><div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div><span class="rrs-sw-lbl">Crypto News</span></div>
            <div class="rrs-sw-wrap" id="rrs-sw-nai" data-on="true" data-tone="emerald"><div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div><span class="rrs-sw-lbl">AI News</span></div>
            <div class="rrs-sw-wrap" id="rrs-sw-nworld" data-on="false" data-tone="gold"><div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div><span class="rrs-sw-lbl">World News</span></div>
          </div>
          <div id="rrs-seg-region" class="rrs-seg-bar" data-tone="gold" style="margin-bottom:6px;">
            <button type="button" class="rrs-seg-pill active-gold" data-val="Global">Global</button>
            <button type="button" class="rrs-seg-pill" data-val="North America">North America</button>
            <button type="button" class="rrs-seg-pill" data-val="Asia">Asia</button>
            <button type="button" class="rrs-seg-pill" data-val="Europe">Europe</button>
          </div>
          <div><div class="rrs-inp-lbl">News Keywords</div><input id="rrs-in-kw" class="rrs-lux-inp" type="text" value="Solana, ETF, Gold" /></div>

          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,208,0,0.2);">
            <span class="rrs-brand">rentandrugshield.com</span>
            <div style="display:flex;gap:6px;">
              <button type="button" id="rrs-drw-simred" class="rrs-pill-btn rrs-pill-red">\u26A1 Test Red Alert</button>
              <button type="button" id="rrs-drw-save" class="rrs-pill-btn rrs-pill-emerald">\u2713 Save &amp; Arm Shield</button>
            </div>
          </div>
        </div>

        <div id="rrs-v55-card" class="rrs-lux-card">
          <div class="rrs-hdr">
            <div class="rrs-hdr-left">
              <div id="rrs-card-shield" class="rrs-shield-box" title="Click Shield to Acknowledge &amp; Flash Emerald">
                <div id="rrs-card-shield-svg" style="width:100%;height:100%;"></div>
                <span id="rrs-card-unread" class="rrs-unread-badge">1</span>
              </div>
              <span id="rrs-card-badge" class="rrs-status-pill">SHIELD LIVE | 12-LAYER + MACD ARMED</span>
            </div>
            <div class="rrs-nav-grp">
              <button type="button" id="rrs-btn-prev" class="rrs-pill-btn">&lt;</button>
              <span id="rrs-lbl-cnt" style="font-size:11px;font-weight:900;color:#FFF2A6;padding:0 3px;">1/1</span>
              <button type="button" id="rrs-btn-next" class="rrs-pill-btn">&gt;</button>
              <button type="button" id="rrs-btn-close" class="rrs-pill-btn rrs-pill-red">\u2715</button>
            </div>
          </div>

          <div id="rrs-card-title" class="rrs-title">24K-Gold &amp; Obsidian Luxury Trader Shield Ready</div>
          <div id="rrs-card-body" class="rrs-body">Oversized 96.5% Yellow-Black Shield flips Crimson-Red on unread notices, flashes Emerald on click, and opens Luxury Pill Settings 8px above.</div>

          <div class="rrs-actions">
            <div class="rrs-act-left">
              <button type="button" id="rrs-btn-zout" class="rrs-pill-btn">\u2212</button>
              <button type="button" id="rrs-btn-zpct" class="rrs-pill-btn" style="color:#FFF2A6;">100%</button>
              <button type="button" id="rrs-btn-zin" class="rrs-pill-btn" style="color:#00FFA3;">+</button>
              <button type="button" id="rrs-btn-pin" class="rrs-pill-btn rrs-pill-gold">14s Auto</button>
            </div>
            <div class="rrs-act-right">
              <button type="button" id="rrs-btn-gear" class="rrs-pill-btn rrs-pill-gold">\u2699 Settings \u25B2</button>
              <button type="button" id="rrs-btn-trade" class="rrs-pill-btn rrs-pill-emerald">Open Trade \u2197</button>
            </div>
          </div>

          <div class="rrs-foot">
            <span id="rrs-brand-link" class="rrs-brand">rentandrugshield.com</span>
            <span id="rrs-lbl-timer" style="color:#94A3B8;">14s</span>
          </div>
          <div class="rrs-prog-track"><div id="rrs-prog-bar" class="rrs-prog-bar"></div></div>
        </div>
      `;
      root.appendChild(wrap);

      const bell = document.createElement('div');
      bell.id = 'rrs-founder-bell';
      bell.className = 'rrs-founder-bell';
      bell.innerHTML = '<span>Approvals Waiting</span><span id="rrs-bell-num" style="background:#FFD000;color:#020408;border-radius:999px;padding:1px 7px;">0</span>';
      bell.onclick = () => window.open('http://127.0.0.1:18088/command/waiting-approvals', '_blank', 'noopener,noreferrer');
      root.appendChild(bell);

      wireLuxuryInteractions(host, root);
    }
    return { host, root };
  }

  function setSegmentedValue(root, barId, val) {
    const bar = root.getElementById(barId);
    if (!bar) return;
    const cls = bar.dataset.tone === 'emerald' ? 'active-em' : 'active-gold';
    bar.querySelectorAll('.rrs-seg-pill').forEach((b) => {
      b.classList.remove('active-gold', 'active-em');
      if (String(b.dataset.val).toLowerCase() === String(val).toLowerCase()) b.classList.add(cls);
    });
  }

  function getSegmentedValue(root, barId, fallback) {
    const bar = root.getElementById(barId);
    if (!bar) return fallback;
    const act = bar.querySelector('.active-gold, .active-em');
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

  function syncVisualShieldState(root, state, unread) {
    localShieldState = state;
    localUnreadCount = Math.max(0, Number(unread || 0));
    const card = root.getElementById('rrs-v55-card');
    const svgBox = root.getElementById('rrs-card-shield-svg');
    const badgeEl = root.getElementById('rrs-card-unread');
    if (!card || !svgBox || !badgeEl) return;

    card.classList.remove('state-red', 'state-emerald');
    if (state === 'red_alert') {
      card.classList.add('state-red');
      svgBox.innerHTML = renderShieldSvgMarkup('red_alert');
      const c = Math.max(1, localUnreadCount);
      badgeEl.textContent = c > 9 ? '9+' : String(c);
      badgeEl.classList.add('show');
    } else if (state === 'emerald_flash') {
      card.classList.add('state-emerald');
      svgBox.innerHTML = renderShieldSvgMarkup('emerald_flash');
      badgeEl.classList.remove('show');
    } else {
      svgBox.innerHTML = renderShieldSvgMarkup('yellow_black');
      badgeEl.classList.remove('show');
    }
  }

  function acknowledgeWithEmeraldFlash(root) {
    localUnreadCount = 0;
    syncVisualShieldState(root, 'emerald_flash', 0);
    if (isExtRuntime && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        chrome.runtime.sendMessage({ type: 'RRS_SHIELD_ACK_CLICK' }, () => { void chrome.runtime.lastError; });
      } catch (_e) {}
    }
    setTimeout(() => {
      if (localUnreadCount === 0) syncVisualShieldState(root, 'yellow_black', 0);
    }, 680);
  }

  function applyLayoutToHost(host, root) {
    const z = clampZoom(layoutState.zoomPct);
    host.style.setProperty('--rrs-scale', (z / 100).toFixed(3));
    const zBtn = root.getElementById('rrs-btn-zpct');
    if (zBtn) zBtn.textContent = z + '%';
    const pinBtn = root.getElementById('rrs-btn-pin');
    const sec = Number(layoutState.autoHideSec || 14);
    if (pinBtn) pinBtn.textContent = layoutState.pinned ? 'Pinned' : (sec + 's Auto');

    if (layoutState.x >= 0 && layoutState.y >= 0) {
      const maxX = Math.max(8, window.innerWidth - 160);
      const maxY = Math.max(8, window.innerHeight - 100);
      host.style.left = Math.min(layoutState.x, maxX) + 'px';
      host.style.top = Math.min(layoutState.y, maxY) + 'px';
      host.style.right = 'auto';
      host.style.bottom = 'auto';
    } else {
      host.style.right = '18px';
      host.style.bottom = '18px';
      host.style.left = 'auto';
      host.style.top = 'auto';
    }
  }

  function populateDrawerFromState(root) {
    setSegmentedValue(root, 'rrs-seg-hide', layoutState.pinned ? 'Pinned' : ((layoutState.autoHideSec || 14) + 's'));
    setSwitchOn(root, 'rrs-sw-sound', Boolean(filterState.soundEnabled));
    setSegmentedValue(root, 'rrs-seg-tf', filterState.tf || '3m');
    setSegmentedValue(root, 'rrs-seg-preset', filterState.preset || 'Runners');
    setSwitchOn(root, 'rrs-sw-macd-bull', filterState.macdBull !== false);
    setSwitchOn(root, 'rrs-sw-macd-hist', filterState.macdHistFlip !== false);
    setSwitchOn(root, 'rrs-sw-macd-bear', filterState.macdBear !== false);
    root.getElementById('rrs-in-minmc').value = filterState.mcMin || 15000;
    root.getElementById('rrs-in-maxmc').value = filterState.mcMax || 10000000;
    root.getElementById('rrs-in-minliq').value = filterState.liqMin || 10000;
    root.getElementById('rrs-in-move').value = filterState.moveMin || 10;
    root.getElementById('rrs-in-coin').value = filterState.tickerQuery || 'ALL';
    setSwitchOn(root, 'rrs-sw-safe12', filterState.catCoin !== false);
    setSwitchOn(root, 'rrs-sw-rug', filterState.catRug !== false);
    setSwitchOn(root, 'rrs-sw-cyber', filterState.cyberLat !== false);
    setSwitchOn(root, 'rrs-sw-whale', filterState.whalePro !== false);
    setSwitchOn(root, 'rrs-sw-ncrypto', filterState.catCrypto !== false);
    setSwitchOn(root, 'rrs-sw-nai', filterState.catAi !== false);
    setSwitchOn(root, 'rrs-sw-nworld', Boolean(filterState.catWorld));
    setSegmentedValue(root, 'rrs-seg-region', filterState.worldRegion || 'Global');
    root.getElementById('rrs-in-kw').value = filterState.newsKeywords || 'Solana, ETF, Gold';
  }

  function renderActiveAlert(root) {
    if (!uniqueAlerts.length) return;
    activeAlertIdx = Math.max(0, Math.min(activeAlertIdx, uniqueAlerts.length - 1));
    const cur = uniqueAlerts[activeAlertIdx];
    root.getElementById('rrs-card-badge').textContent = cur.badge;
    root.getElementById('rrs-card-title').textContent = cur.title;
    root.getElementById('rrs-card-body').textContent = cur.message;
    root.getElementById('rrs-lbl-cnt').textContent = (activeAlertIdx + 1) + '/' + uniqueAlerts.length;
  }

  function ensureCountdownLoop(root) {
    if (countdownTimerId) return;
    countdownTimerId = setInterval(() => {
      const card = root.getElementById('rrs-v55-card');
      const drawer = root.getElementById('rrs-v55-drawer');
      if (!card || !card.classList.contains('open')) return;
      const timerLbl = root.getElementById('rrs-lbl-timer');
      const progBar = root.getElementById('rrs-prog-bar');
      const drawerOpen = drawer && drawer.classList.contains('open');

      if (layoutState.pinned || drawerOpen || cardHovered || isDraggingCard) {
        if (timerLbl) timerLbl.textContent = layoutState.pinned ? 'Pinned' : (drawerOpen ? 'Settings Open' : 'Paused');
        return;
      }
      countdownRemMs -= 100;
      const secLeft = Math.max(0, Math.ceil(countdownRemMs / 1000));
      if (timerLbl) timerLbl.textContent = secLeft + 's';
      if (progBar) {
        const pct = Math.max(0, Math.min(100, (countdownRemMs / Math.max(1000, countdownTotalMs)) * 100));
        progBar.style.width = pct.toFixed(1) + '%';
      }
      if (countdownRemMs <= 0) {
        if (drawer) drawer.classList.remove('open');
        card.classList.remove('open');
        root.getElementById('rrs-btn-gear').textContent = '\u2699 Settings \u25B2';
      }
    }, 100);
  }

  function wireLuxuryInteractions(host, root) {
    const card = root.getElementById('rrs-v55-card');
    const drawer = root.getElementById('rrs-v55-drawer');
    const gearBtn = root.getElementById('rrs-btn-gear');

    // Segmented pills
    root.querySelectorAll('.rrs-seg-bar').forEach((bar) => {
      bar.querySelectorAll('.rrs-seg-pill').forEach((pill) => {
        pill.addEventListener('click', (ev) => {
          ev.stopPropagation();
          setSegmentedValue(root, bar.id, pill.dataset.val);
          if (bar.id === 'rrs-seg-preset') {
            const p = pill.dataset.val;
            if (p === 'Snipes') {
              root.getElementById('rrs-in-minmc').value = '5000';
              root.getElementById('rrs-in-maxmc').value = '100000';
              root.getElementById('rrs-in-minliq').value = '6000';
              root.getElementById('rrs-in-move').value = '8';
            } else if (p === 'Runners') {
              root.getElementById('rrs-in-minmc').value = '100000';
              root.getElementById('rrs-in-maxmc').value = '5000000';
              root.getElementById('rrs-in-minliq').value = '25000';
              root.getElementById('rrs-in-move').value = '12';
            } else if (p === 'Whales') {
              root.getElementById('rrs-in-minmc').value = '5000000';
              root.getElementById('rrs-in-maxmc').value = '500000000';
              root.getElementById('rrs-in-minliq').value = '150000';
              root.getElementById('rrs-in-move').value = '5';
            }
          }
        });
      });
    });

    // Animated sliding pill switches
    root.querySelectorAll('.rrs-sw-wrap').forEach((sw) => {
      sw.addEventListener('click', (ev) => {
        ev.stopPropagation();
        sw.dataset.on = sw.dataset.on === 'true' ? 'false' : 'true';
      });
    });

    root.getElementById('rrs-card-shield').onclick = (ev) => {
      ev.stopPropagation();
      acknowledgeWithEmeraldFlash(root);
    };

    const openCurUrl = (ev) => {
      ev.stopPropagation();
      if (localUnreadCount > 0 || localShieldState === 'red_alert') acknowledgeWithEmeraldFlash(root);
      const cur = uniqueAlerts[activeAlertIdx];
      if (cur && cur.url) window.open(cur.url, '_blank', 'noopener,noreferrer');
    };
    root.getElementById('rrs-card-title').onclick = openCurUrl;
    root.getElementById('rrs-card-body').onclick = openCurUrl;
    root.getElementById('rrs-btn-trade').onclick = openCurUrl;
    root.getElementById('rrs-brand-link').onclick = (ev) => {
      ev.stopPropagation();
      window.open('https://rentandrugshield.com', '_blank', 'noopener,noreferrer');
    };

    root.getElementById('rrs-btn-prev').onclick = (ev) => {
      ev.stopPropagation();
      if (!uniqueAlerts.length) return;
      activeAlertIdx = (activeAlertIdx - 1 + uniqueAlerts.length) % uniqueAlerts.length;
      renderActiveAlert(root);
    };
    root.getElementById('rrs-btn-next').onclick = (ev) => {
      ev.stopPropagation();
      if (!uniqueAlerts.length) return;
      activeAlertIdx = (activeAlertIdx + 1) % uniqueAlerts.length;
      renderActiveAlert(root);
    };
    root.getElementById('rrs-btn-close').onclick = (ev) => {
      ev.stopPropagation();
      if (localUnreadCount > 0) acknowledgeWithEmeraldFlash(root);
      drawer.classList.remove('open');
      card.classList.remove('open');
      gearBtn.textContent = '\u2699 Settings \u25B2';
    };

    root.getElementById('rrs-btn-zout').onclick = (ev) => {
      ev.stopPropagation();
      layoutState.zoomPct = clampZoom(layoutState.zoomPct - 15);
      applyLayoutToHost(host, root);
      saveStateAll();
    };
    root.getElementById('rrs-btn-zpct').onclick = (ev) => {
      ev.stopPropagation();
      layoutState.zoomPct = 100;
      applyLayoutToHost(host, root);
      saveStateAll();
    };
    root.getElementById('rrs-btn-zin').onclick = (ev) => {
      ev.stopPropagation();
      layoutState.zoomPct = clampZoom(layoutState.zoomPct + 15);
      applyLayoutToHost(host, root);
      saveStateAll();
    };
    root.getElementById('rrs-btn-pin').onclick = (ev) => {
      ev.stopPropagation();
      layoutState.pinned = !layoutState.pinned;
      applyLayoutToHost(host, root);
      saveStateAll();
    };

    gearBtn.onclick = (ev) => {
      ev.stopPropagation();
      if (localUnreadCount > 0 || localShieldState === 'red_alert') acknowledgeWithEmeraldFlash(root);
      populateDrawerFromState(root);
      const openNow = drawer.classList.toggle('open');
      gearBtn.textContent = openNow ? '\u2699 Settings \u25BC' : '\u2699 Settings \u25B2';
    };
    root.getElementById('rrs-drw-x').onclick = (ev) => {
      ev.stopPropagation();
      drawer.classList.remove('open');
      gearBtn.textContent = '\u2699 Settings \u25B2';
    };

    root.getElementById('rrs-drw-simred').onclick = (ev) => {
      ev.stopPropagation();
      if (isExtRuntime && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'RRS_FIRE_TEST_TOAST' }, () => { void chrome.runtime.lastError; });
      } else {
        window.__rrsRenderBlackToastV53({
          kind: 'coin',
          sym: 'SOL',
          mint: 'So11111111111111111111111111111111111111112',
          unreadCount: localUnreadCount + 1,
          badge: 'MACD BULL CROSS | WHALE',
          title: '$SOL Whale Breakout +14.8% (12/12 Safe)',
          message: 'Shield flipped Crimson-Red (#FF1744 + unread badge). Click Shield to flash #00FFA3 Emerald & reset!',
          url: 'https://rentandrugshield.com/?mint=So11111111111111111111111111111111111111112&trade=1'
        });
      }
    };

    root.getElementById('rrs-drw-save').onclick = (ev) => {
      ev.stopPropagation();
      const hv = getSegmentedValue(root, 'rrs-seg-hide', '14s');
      if (hv === 'Pinned') {
        layoutState.pinned = true;
      } else {
        layoutState.pinned = false;
        layoutState.autoHideSec = parseInt(hv, 10) || 14;
      }
      const tf = getSegmentedValue(root, 'rrs-seg-tf', '3m');
      filterState = Object.assign({}, filterState, {
        soundEnabled: getSwitchOn(root, 'rrs-sw-sound'),
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
        cyberLat: getSwitchOn(root, 'rrs-sw-cyber'),
        whalePro: getSwitchOn(root, 'rrs-sw-whale'),
        catCrypto: getSwitchOn(root, 'rrs-sw-ncrypto'),
        catAi: getSwitchOn(root, 'rrs-sw-nai'),
        catWorld: getSwitchOn(root, 'rrs-sw-nworld'),
        worldRegion: getSegmentedValue(root, 'rrs-seg-region', 'Global'),
        newsKeywords: scrubText(root.getElementById('rrs-in-kw').value || 'Solana, ETF, Gold').trim()
      });
      applyLayoutToHost(host, root);
      saveStateAll();
      drawer.classList.remove('open');
      gearBtn.textContent = '\u2699 Settings \u25B2';
      acknowledgeWithEmeraldFlash(root);
    };

    // Hover pause & Ctrl+Wheel zoom
    card.addEventListener('mouseenter', () => { cardHovered = true; });
    card.addEventListener('mouseleave', () => { cardHovered = false; });
    card.addEventListener('wheel', (ev) => {
      if (ev.ctrlKey) {
        ev.preventDefault();
        ev.stopPropagation();
        layoutState.zoomPct = clampZoom(layoutState.zoomPct + (ev.deltaY < 0 ? 10 : -10));
        applyLayoutToHost(host, root);
        saveStateAll();
      }
    }, { passive: false });

    // Smooth pointer drag on Card
    let startX = 0, startY = 0, origLeft = 0, origTop = 0, ptrDown = false;
    card.addEventListener('pointerdown', (ev) => {
      if (ev.button !== 0) return;
      if (ev.target && ev.target.closest && ev.target.closest('button, #rrs-card-shield, #rrs-brand-link')) return;
      if (localUnreadCount > 0 || localShieldState === 'red_alert') acknowledgeWithEmeraldFlash(root);
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
        layoutState.x = Math.max(6, Math.min(window.innerWidth - 150, Math.round(origLeft + dx)));
        layoutState.y = Math.max(6, Math.min(window.innerHeight - 90, Math.round(origTop + dy)));
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

  window.__rrsRenderBlackToastV53 = function (t, openDrawerImmediately) {
    if (!t || !t.title) return;
    loadPersistedState(() => {
      const { host, root } = ensureShadowHost();
      const exactUrl = resolveExactAlertUrl(t);
      const badge = scrubText(t.badge || 'SHIELD LIVE | 12-LAYER + MACD ARMED');
      const title = scrubText(t.title);
      const message = scrubText(t.message || 'Click card or [Open Trade] to inspect 12-Layer token audit.');
      const key = title + '|' + message;

      if (!seenAlertKeys.has(key)) {
        seenAlertKeys.add(key);
        uniqueAlerts.push({ badge, title, message, url: exactUrl });
        if (uniqueAlerts.length > 15) uniqueAlerts.shift();
        activeAlertIdx = uniqueAlerts.length - 1;
      }

      renderActiveAlert(root);
      applyLayoutToHost(host, root);

      countdownTotalMs = Math.max(4000, Number(layoutState.autoHideSec || 14) * 1000);
      countdownRemMs = countdownTotalMs;
      const progBar = root.getElementById('rrs-prog-bar');
      if (progBar) progBar.style.width = '100%';

      const unread = typeof t.unreadCount === 'number' ? t.unreadCount : (t.markCaughtUp ? 0 : (localUnreadCount + 1));
      if (unread > 0) {
        syncVisualShieldState(root, 'red_alert', unread);
      } else {
        syncVisualShieldState(root, 'yellow_black', 0);
      }

      const card = root.getElementById('rrs-v55-card');
      const drawer = root.getElementById('rrs-v55-drawer');
      const gearBtn = root.getElementById('rrs-btn-gear');
      card.classList.add('open');

      if (openDrawerImmediately) {
        populateDrawerFromState(root);
        drawer.classList.add('open');
        gearBtn.textContent = '\u2699 Settings \u25BC';
      }
      ensureCountdownLoop(root);
    });
  };

  // Public interactive demo trigger for [Try Luxury Movable Trader Shield] on rentandrugshield.com
  window.RRS_openLuxuryTraderShieldDemo = function (openDrawer) {
    window.__rrsRenderBlackToastV53({
      kind: 'coin',
      sym: 'SOL',
      mint: 'So11111111111111111111111111111111111111112',
      unreadCount: 1,
      badge: 'MACD BULL CROSS | 12-LAYER SAFE',
      title: '$SOL Whale Runner +14.8% | Luxury Movable Trader Shield',
      message: 'Drag this 24K-Gold & Obsidian box anywhere, zoom 75%-200%, click Red Shield to flash Emerald, or tune glowing pill switches above.',
      url: 'https://rentandrugshield.com/?mint=So11111111111111111111111111111111111111112&trade=1'
    }, openDrawer !== false);
  };

  if (!window.__RRS_V55_LISTENER_BOUND__ && isExtRuntime && chrome.runtime && chrome.runtime.onMessage) {
    window.__RRS_V55_LISTENER_BOUND__ = true;
    chrome.runtime.onMessage.addListener((msg) => {
      if (!msg) return;
      if ((msg.type === 'RRS_SHOW_LIVE_TOAST_V53' || msg.type === 'RRS_SHOW_LIVE_TOAST_V52' || msg.type === 'RRS_SHOW_LIVE_TOAST') && msg.toast) {
        window.__rrsRenderBlackToastV53(msg.toast, false);
      } else if (msg.type === 'RRS_SHIELD_STATE_SYNC_V55') {
        const { root } = ensureShadowHost();
        syncVisualShieldState(root, msg.state || 'yellow_black', Number(msg.unreadCount || 0));
        if (msg.state === 'emerald_flash') {
          setTimeout(() => {
            if (localUnreadCount === 0) syncVisualShieldState(root, 'yellow_black', 0);
          }, 680);
        }
      } else if (msg.type === 'RRS_FOUNDER_APPROVALS_SYNC') {
        window.__rrsUpdateFounderBell(msg.approvals || {});
      }
    });
  }
})();
