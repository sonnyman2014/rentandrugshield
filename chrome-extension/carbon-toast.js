(function () {
  'use strict';
  const DISPLAY_DURATION_MS = 14000;
  const LAYOUT_KEY = 'rrs_box_layout_v53';
  const FLT_KEY = 'rrs_notifier_filters_v53';
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

  let layout = { x: -1, y: -1, pinned: false, zoomPct: 100 };

  function clampZoom(z) {
    return Math.max(75, Math.min(200, Math.round(Number(z) || 100)));
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
      for (const m of matches) if (isValidMint(m)) return m;
    }
    if (title) {
      const matches = String(title).match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g) || [];
      for (const m of matches) if (isValidMint(m)) return m;
    }
    const cleanSym = String(sym || '').replace(/^\$/, '').trim().toUpperCase();
    if (cleanSym && KNOWN_SYM_MINTS[cleanSym]) return KNOWN_SYM_MINTS[cleanSym];
    return '';
  }

  function resolveExactAlertUrl(opts) {
    const kind = String(opts.kind || 'coin').toLowerCase();
    const rawUrl = String(opts.url || '').trim();
    const upper = (String(opts.badge || '') + ' ' + String(opts.title || '')).toUpperCase();

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

    const mint = extractMint(opts.mint, rawUrl, opts.title, opts.sym);
    if (kind === 'moonbag' && !mint) return 'http://127.0.0.1:18088/command/terminal-1';
    if (mint) return 'https://rentandrugshield.com/?mint=' + encodeURIComponent(mint) + '&trade=1';
    if (kind === 'moonbag') return 'http://127.0.0.1:18088/command/terminal-1';
    if (/^https?:\/\//i.test(rawUrl)) {
      const isGenericHome = /^https?:\/\/(?:www\.)?rentandrugshield\.com(?:\/|\/index\.html|\/app\.html)?(?:\?.*)?$/i.test(rawUrl)
        && !/[?&](?:mint|domain|wallet)=/i.test(rawUrl);
      if (!isGenericHome) return rawUrl;
    }
    return 'https://rentandrugshield.com/?mint=3ig9E5SQKs8RjVn9EuW1YaprjaMd6dEftG63hBcMpump&trade=1';
  }

  const aiRx = new RegExp('\\b\\x41\\x49[-\\s]+generated\\b', 'gi');
  const scrub = (s) => String(s || '').replace(/\u2014/g, ' | ').replace(/\u2013/g, '-').replace(/--+/g, '-').replace(aiRx, '12-Layer Verified');

  const qp = new URLSearchParams(window.location.search || '');
  const title = scrub(qp.get('title') || '12-Layer Carbon Sentinel v5.3 Active');
  const sub = scrub(qp.get('sub') || 'Click card to trade or open 12-Layer Audit');
  const badge = scrub(qp.get('badge') || '12-LAYER SHIELD');
  const sev = qp.get('sev') || 'INFO';
  const kind = qp.get('kind') || 'coin';
  const symParam = qp.get('sym') || '';
  const mintParam = qp.get('mint') || '';

  const sm = title.match(/\$([A-Za-z0-9_]{2,12})/);
  const pm = title.match(/([+-]\d+(?:\.\d+)?%)/);
  const sym = symParam ? ('$' + symParam.replace(/^\$/, '').toUpperCase()) : (sm ? ('$' + sm[1].toUpperCase()) : '');
  const pct = pm ? pm[1] : '';

  const targetUrl = resolveExactAlertUrl({ kind, sev, sym, mint: mintParam, badge, title, url: qp.get('url') || '' });

  const card = document.getElementById('card');
  const tk = document.getElementById('tk');
  const pl = document.getElementById('pl');
  const ttl = document.getElementById('ttl');
  const subEl = document.getElementById('sub');
  const btnZoomPct = document.getElementById('btnZoomPct');
  const btnPin = document.getElementById('btnPin');
  const dragCue = document.getElementById('dragCue');
  const drawer = document.getElementById('drawerSettings');

  card.dataset.resolvedUrl = targetUrl;
  if (sev === 'CRITICAL' || kind === 'rug' || pct.startsWith('-')) card.classList.add('red');
  if (sym) {
    tk.style.display = 'inline-block';
    tk.textContent = sym + (pct ? (' ' + pct) : '');
  }
  pl.textContent = badge.replace(/^[^\w$]+/, '').trim() || 'CARBON v5.3';
  ttl.textContent = title;
  subEl.textContent = sub;

  function applyLayout() {
    layout.zoomPct = clampZoom(layout.zoomPct);
    const scale = layout.zoomPct / 100;
    document.documentElement.style.setProperty('--rrs-scale', String(scale));
    if (btnZoomPct) btnZoomPct.textContent = layout.zoomPct + '%';
    if (btnPin) btnPin.classList.toggle('pinned', Boolean(layout.pinned));
    if (dragCue) dragCue.textContent = layout.pinned ? 'PIN LOCKED | Ctrl+Wheel Zoom' : 'Drag Anywhere | Ctrl+Wheel Zoom';
    try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout)); } catch (_e) {}
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [LAYOUT_KEY]: layout }, () => {});
    }
  }

  try {
    const saved = localStorage.getItem(LAYOUT_KEY);
    if (saved) layout = Object.assign(layout, JSON.parse(saved));
  } catch (_e) {}
  applyLayout();

  document.getElementById('btnZoomOut').onclick = (e) => { e.stopPropagation(); layout.zoomPct = clampZoom(layout.zoomPct - 15); applyLayout(); };
  document.getElementById('btnZoomPct').onclick = (e) => { e.stopPropagation(); layout.zoomPct = 100; applyLayout(); };
  document.getElementById('btnZoomIn').onclick = (e) => { e.stopPropagation(); layout.zoomPct = clampZoom(layout.zoomPct + 15); applyLayout(); };
  document.getElementById('btnPin').onclick = (e) => { e.stopPropagation(); layout.pinned = !layout.pinned; applyLayout(); };
  document.getElementById('btnGear').onclick = (e) => { e.stopPropagation(); drawer.classList.toggle('open'); };
  document.getElementById('btnClose').onclick = (e) => { e.stopPropagation(); window.close(); };

  window.addEventListener('wheel', (ev) => {
    if (ev.ctrlKey) {
      ev.preventDefault();
      layout.zoomPct = clampZoom(layout.zoomPct + (ev.deltaY < 0 ? 10 : -10));
      applyLayout();
    }
  }, { passive: false });

  let dragging = false, downScreenX = 0, downScreenY = 0, startWinX = 0, startWinY = 0, downActive = false;
  card.addEventListener('pointerdown', (ev) => {
    if (ev.button !== 0 || (ev.target && ev.target.closest('button'))) return;
    downActive = true;
    dragging = false;
    downScreenX = ev.screenX;
    downScreenY = ev.screenY;
    startWinX = window.screenX;
    startWinY = window.screenY;
  });
  card.addEventListener('pointermove', (ev) => {
    if (!downActive || layout.pinned) return;
    const dx = ev.screenX - downScreenX;
    const dy = ev.screenY - downScreenY;
    if (!dragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) dragging = true;
    if (dragging) {
      try { window.moveTo(startWinX + dx, startWinY + dy); } catch (_e) {}
      layout.x = startWinX + dx;
      layout.y = startWinY + dy;
    }
  });
  card.addEventListener('pointerup', (ev) => {
    if (!downActive) return;
    downActive = false;
    if (dragging) {
      dragging = false;
      applyLayout();
      return;
    }
    if (ev.target && ev.target.closest('button')) return;
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: targetUrl });
    } else {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
    if (!layout.pinned) window.close();
  });

  document.getElementById('ctSaveBtn').onclick = () => {
    const flt = {
      macdOn: document.getElementById('ctMacdOn').checked,
      macd1m: document.getElementById('ctMacd1m').checked,
      macd3m: document.getElementById('ctMacd3m').checked,
      macd5m: document.getElementById('ctMacd5m').checked,
      macd15m: document.getElementById('ctMacd15m').checked,
      macdBull: document.getElementById('ctMacdBull').checked,
      macdBear: document.getElementById('ctMacdBear').checked,
      macdHistFlip: document.getElementById('ctMacdHist').checked,
      mcOn: document.getElementById('ctMcOn').checked,
      mcMin: Number(document.getElementById('ctMcMin').value || 15000),
      mcMax: Number(document.getElementById('ctMcMax').value || 50000000),
      liqOn: document.getElementById('ctLiqOn').checked,
      liqMin: Number(document.getElementById('ctLiqMin').value || 10000),
      moveOn: document.getElementById('ctMvOn').checked,
      moveMin: Number(document.getElementById('ctMvMin').value || 5),
      moveWin: document.getElementById('ctMvWin').value,
      tickerOn: document.getElementById('ctTkOn').checked,
      tickerQuery: document.getElementById('ctTkQ').value.trim(),
      catCrypto: document.getElementById('ctCrypto').checked,
      catAi: document.getElementById('ctAi').checked,
      catWorld: document.getElementById('ctWorld').checked,
      newsKeywords: document.getElementById('ctNewsKw').value.trim(),
      worldRegion: document.getElementById('ctWorldReg').value.trim(),
      zoomPct: layout.zoomPct,
      cardPinned: layout.pinned,
      roboticVoice: false
    };
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'RRS_SYNC_FILTERS_V53', filters: flt }, () => {});
    }
    try { localStorage.setItem(FLT_KEY, JSON.stringify(flt)); } catch (_e) {}
    drawer.classList.remove('open');
  };

  setInterval(() => {
    if (!layout.pinned && !drawer.classList.contains('open')) window.close();
  }, DISPLAY_DURATION_MS);
})();
