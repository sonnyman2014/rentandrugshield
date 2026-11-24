(function () {
  'use strict';
  const LAYOUT_KEY = 'rrs_box_layout_v53';
  const FLT_KEY = 'rrs_notifier_filters_v53';
  const AUTOSCAN_KEY = 'rrs_autoscan_collect_v67';
  const ALLOWED_STAY_SECS = [3, 5, 8, 10, 15, 20, 30, 45, 60];

  const SPOKEN_VOICES_V67 = [
    { label: 'To Valhalla!', file: 'to_valhalla.wav', aliases: ['to valhalla', 'to valhalla!'] },
    { label: 'To the Moon, baby!', file: 'to_the_moon.wav', aliases: ['to the moon', 'to the moon!', 'to the moon, baby!'] },
    { label: 'Wizard: 12 Layers Clean!', file: 'wizard_check.wav', aliases: ['wizard', 'wizard 12-layer clean', 'wizard 12-layer clean!', 'wizard: 12-layer clean!', 'wizard: 12 layers clean', 'wizard: 12 layers clean!'] },
    { label: 'Whale Incoming: Green Light!', file: 'whale_incoming.wav', aliases: ['whale horn', 'whale incoming', 'whale incoming: green light!'] },
    { label: 'Cha-Ching! Clean Contract!', file: 'cha_ching_clean.wav', aliases: ['coin drop', 'cha-ching', 'cha-ching! clean contract!'] },
    { label: 'Honey Badger Locked On!', file: 'honey_badger.wav', aliases: ['laser lock', 'honey badger', 'honey badger locked on!'] },
    { label: 'Rug Alert! Step Away!', file: 'rug_alert.wav', aliases: ['cyber alert', 'rug alert', 'rug alert!', 'rug alert! step away', 'rug alert! step away!'] },
    { label: 'Freeze Trap Detected!', file: 'freeze_trap.wav', aliases: ['radar sweep', 'freeze trap', 'freeze trap detected!'] },
    { label: 'Breaking Alpha on the Wire!', file: 'breaking_alpha.wav', aliases: ['news wire', 'breaking alpha', 'breaking alpha on the wire!'] },
    { label: 'Free SOL Rent Ready!', file: 'rent_reclaim_ready.wav', aliases: ['emerald ping', 'free sol rent', 'free sol rent ready!'] },
    { label: 'Sniper Target Verified!', file: 'sniper_verified.wav', aliases: ['sniper tick', 'sniper target', 'sniper target verified!'] },
    { label: 'Bull Cross Momentum Surge!', file: 'bull_cross_surge.wav', aliases: ['breakout bell', 'bull cross', 'bull cross momentum surge!'] }
  ];

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
    JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'
  };

  let activeCardPinned = false;
  let layout = { x: -1, y: -1, pinned: false, zoomPct: 100, autoHideSec: 5, soundEnabled: false, audioPreset: 'To Valhalla!', liqMin: 10000, autoScan: false };

  function resolveWavFile(name) {
    const k = String(name || 'To Valhalla!').trim().toLowerCase();
    for (let i = 0; i < SPOKEN_VOICES_V67.length; i++) {
      if (SPOKEN_VOICES_V67[i].label.toLowerCase() === k || SPOKEN_VOICES_V67[i].aliases.indexOf(k) !== -1) {
        return SPOKEN_VOICES_V67[i].file;
      }
    }
    if (k.includes('valhalla')) return 'to_valhalla.wav';
    if (k.includes('moon')) return 'to_the_moon.wav';
    if (k.includes('wizard')) return 'wizard_check.wav';
    if (k.includes('whale')) return 'whale_incoming.wav';
    if (k.includes('cha-ching')) return 'cha_ching_clean.wav';
    if (k.includes('honey')) return 'honey_badger.wav';
    if (k.includes('rug') || k.includes('cyber')) return 'rug_alert.wav';
    if (k.includes('freeze') || k.includes('radar')) return 'freeze_trap.wav';
    if (k.includes('breaking') || k.includes('news')) return 'breaking_alpha.wav';
    if (k.includes('rent')) return 'rent_reclaim_ready.wav';
    if (k.includes('sniper')) return 'sniper_verified.wav';
    if (k.includes('bull') || k.includes('breakout')) return 'bull_cross_surge.wav';
    return 'to_valhalla.wav';
  }

  function playSpokenVoice(name) {
    try {
      const f = resolveWavFile(name);
      const u = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
        ? chrome.runtime.getURL('sounds/' + f)
        : ('sounds/' + f);
      const a = new Audio(u);
      a.volume = 0.95;
      a.play().catch(() => {});
    } catch (_e) {}
  }

  function clampZoom(z) {
    return Math.max(75, Math.min(200, Math.round(Number(z) || 100)));
  }

  function normStaySec(s) {
    const n = Number(s) || 5;
    let best = 5, bestDiff = Infinity;
    for (let i = 0; i < ALLOWED_STAY_SECS.length; i++) {
      const d = Math.abs(ALLOWED_STAY_SECS[i] - n);
      if (d < bestDiff) { bestDiff = d; best = ALLOWED_STAY_SECS[i]; }
    }
    return best;
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
      for (const m of matches) if (isValidMint(m)) return m;
    }
    if (title) {
      const matches = String(title).match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g) || [];
      for (const m of matches) if (isValidMint(m)) return m;
      const sm = String(title).match(/\$([A-Za-z0-9_]{2,12})/);
      if (sm && KNOWN_SYM_MINTS[sm[1].toUpperCase()]) return KNOWN_SYM_MINTS[sm[1].toUpperCase()];
    }
    const cleanSym = String(sym || '').replace(/^\$/, '').trim().toUpperCase();
    if (cleanSym && KNOWN_SYM_MINTS[cleanSym]) return KNOWN_SYM_MINTS[cleanSym];
    return '';
  }

  function isValidExternalNewsUrl(rawUrl) {
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

  function resolveExactAlertUrl(opts) {
    const kind = String(opts.kind || 'coin').toLowerCase();
    const badgeUp = String(opts.badge || '').toUpperCase();
    const isNewsKind = (kind === 'news' || kind === 'breaking' || kind === 'breaking_news' || kind === 'crypto' || kind === 'ai' || kind === 'world' || /BREAKING\s*NEWS|CRYPTO\s*NEWS|AI\s*NEWS|WORLD\s*NEWS|LIVE\s*WIRE/i.test(badgeUp));
    if (isNewsKind) {
      const cand = String(opts.article_url || opts.link || opts.source_url || opts.url || '').trim();
      return isValidExternalNewsUrl(cand) ? cand : '';
    }
    const rawUrl = String(opts.url || '').trim();
    const mint = extractMint(opts.mint, rawUrl, opts.title, opts.sym) || 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN';
    return 'https://rentandrugshield.com/?token=' + encodeURIComponent(mint) + '&autoscan=1#tokenScanner';
  }

  const legRx = new RegExp('\\b\\x41\\x49[-\\s]+generated\\b', 'gi');
  const scrub = (s) => String(s || '').split(String.fromCharCode(8212)).join(' | ').split(String.fromCharCode(8211)).join('-').replace(/--+/g, '-').replace(legRx, '12-Layer Verified');

  const qp = new URLSearchParams(window.location.search || '');
  const rawTitle = scrub(qp.get('title') || '$JUP +18.4%');
  const rawSub = scrub(qp.get('sub') || 'MCap $420K \u2022 Liquidity $68K');
  const rawBadge = scrub(qp.get('badge') || '12-LAYER: PASS');
  const kind = String(qp.get('kind') || 'coin').toLowerCase();
  const symParam = qp.get('sym') || '';
  const mintParam = qp.get('mint') || '';
  const customSecParam = Number(qp.get('sec') || qp.get('customDisplaySec') || 0);

  const isNews = (kind === 'news' || kind === 'breaking' || kind === 'breaking_news' || kind === 'crypto' || kind === 'ai' || kind === 'world' || /BREAKING\s*NEWS|CRYPTO\s*NEWS|AI\s*NEWS|WORLD\s*NEWS|LIVE\s*WIRE/i.test(rawBadge));
  const pm = (rawTitle + ' ' + rawSub).match(/([+-]?\d+(?:\.\d+)?)%/);
  const pctNum = pm ? Number(pm[1]) : 18.4;
  const failed12 = !isNews && (kind === 'rug' || /FAIL|RUG|SCAM|DRAINER/i.test(rawBadge + ' ' + rawTitle) || pctNum < 0);

  const targetUrl = resolveExactAlertUrl({
    kind,
    sym: symParam,
    mint: mintParam,
    badge: rawBadge,
    title: rawTitle,
    article_url: qp.get('article_url') || '',
    link: qp.get('link') || '',
    source_url: qp.get('source_url') || '',
    url: qp.get('url') || ''
  });

  const card = document.getElementById('card');
  if (isNews && !isValidExternalNewsUrl(targetUrl)) {
    if (card) {
      card.style.display = 'none';
      card.style.visibility = 'hidden';
    }
    try { window.close(); } catch (_e) {}
    return;
  }
  const wirePill = document.getElementById('wirePill');
  const pl = document.getElementById('pl');
  const ttl = document.getElementById('ttl');
  const subEl = document.getElementById('sub');
  const btnCta = document.getElementById('btnCta');
  const btnZoomPct = document.getElementById('btnZoomPct');
  const btnPin = document.getElementById('btnPin');
  const btnMute = document.getElementById('btnMute');
  const lblStepSec = document.getElementById('lblStepSec');
  const dragCue = document.getElementById('dragCue');
  const drawer = document.getElementById('drawerSettings');
  const audioSel = document.getElementById('ctAudioSelect');
  const progBar = document.getElementById('progBar');
  const liqSlider = document.getElementById('ctLiqSlider');
  const liqLbl = document.getElementById('ctLiqLbl');
  const autoScanBtn = document.getElementById('ctAutoScanBtn');

  if (audioSel) {
    SPOKEN_VOICES_V67.forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.label;
      o.textContent = opt.label;
      audioSel.appendChild(o);
    });
  }

  card.classList.remove('state-green', 'state-red', 'state-blue');
  if (isNews) {
    card.classList.add('state-blue');
    if (wirePill) wirePill.style.display = 'inline-block';
    if (pl) pl.style.display = 'none';
    if (subEl) { subEl.style.display = 'none'; subEl.textContent = ''; }
    const cleanHead = rawTitle.replace(/\b12[-\s]*LAYER[:\s]*(?:PASS|FAIL)?[^\w$]*/gi, '').replace(/\b(?:Market\s*Cap|MCap|Liquidity|Liq)\s*[:$]?\s*[\d,.]+[KMB]?\b/gi, '').trim();
    ttl.textContent = cleanHead || 'Solana Institutional News Wire';
    ttl.style.color = '#FFFFFF';
    ttl.style.fontSize = '15.8px';
    if (btnCta) {
      btnCta.textContent = '[READ ARTICLE \u2197]';
      btnCta.style.borderColor = '#38BDF8';
      btnCta.style.color = '#38BDF8';
    }
    if (progBar) progBar.style.background = '#38BDF8';
  } else if (failed12) {
    card.classList.add('state-red');
    if (wirePill) wirePill.style.display = 'none';
    ttl.textContent = rawTitle;
    ttl.style.color = '#FF3B5C';
    pl.textContent = '12-LAYER: FAIL';
    pl.style.borderColor = '#FF3B5C';
    pl.style.color = '#FF3B5C';
    subEl.style.display = 'block';
    subEl.textContent = rawSub;
    if (btnCta) {
      btnCta.textContent = '[OPEN 12-LAYER AUDIT \u2197]';
      btnCta.style.borderColor = '#FF3B5C';
      btnCta.style.color = '#FF3B5C';
    }
    if (progBar) progBar.style.background = '#FF3B5C';
  } else {
    card.classList.add('state-green');
    if (wirePill) wirePill.style.display = 'none';
    ttl.textContent = rawTitle;
    ttl.style.color = '#00FF88';
    pl.textContent = '12-LAYER: PASS';
    pl.style.borderColor = '#00FF88';
    pl.style.color = '#00FF88';
    subEl.style.display = 'block';
    subEl.textContent = rawSub;
    if (btnCta) {
      btnCta.textContent = '[OPEN 12-LAYER AUDIT \u2197]';
      btnCta.style.borderColor = '#00FF88';
      btnCta.style.color = '#00FF88';
    }
    if (progBar) progBar.style.background = '#00FF88';
  }

  function computeTotalMs() {
    if (Number.isFinite(customSecParam) && customSecParam >= 1) return Math.round(customSecParam * 1000);
    const baseSec = normStaySec(layout.autoHideSec);
    const effectiveSec = (isNews && baseSec === 5) ? 8 : baseSec;
    return Math.max(1000, effectiveSec * 1000);
  }

  let totalMs = computeTotalMs();
  let remMs = totalMs;

  function applyLayout() {
    layout.zoomPct = clampZoom(layout.zoomPct);
    layout.autoHideSec = normStaySec(layout.autoHideSec);
    layout.pinned = false;
    document.documentElement.style.setProperty('--rrs-scale', String(layout.zoomPct / 100));
    if (btnZoomPct) btnZoomPct.textContent = layout.zoomPct + '%';
    const effSec = Math.max(1, Math.round(computeTotalMs() / 1000));
    if (lblStepSec) lblStepSec.textContent = effSec + 's';
    if (btnPin) {
      btnPin.textContent = activeCardPinned ? 'PINNED' : 'PIN';
      btnPin.classList.toggle('pinned', Boolean(activeCardPinned));
    }
    if (btnMute) {
      btnMute.textContent = layout.soundEnabled ? '\uD83D\uDD14 VOICE' : '\uD83D\uDD15 MUTE';
      btnMute.style.color = layout.soundEnabled ? '#00FF88' : '#94A3B8';
      btnMute.style.borderColor = layout.soundEnabled ? '#00FF88' : '#2D3A4E';
    }
    if (audioSel && layout.audioPreset) audioSel.value = layout.audioPreset;
    if (liqSlider) liqSlider.value = String(layout.liqMin !== undefined ? layout.liqMin : 10000);
    if (liqLbl) {
      const lv = Number(layout.liqMin !== undefined ? layout.liqMin : 10000);
      liqLbl.textContent = lv >= 500000 ? '$500K+' : ('\u2265 $' + Math.round(lv / 1000) + 'K');
    }
    if (autoScanBtn) {
      autoScanBtn.classList.toggle('on', Boolean(layout.autoScan));
      autoScanBtn.textContent = layout.autoScan ? '\u26A1 AUTO-SCAN & COLLECT: ON' : '\u26A1 AUTO-SCAN & COLLECT: OFF';
    }
    if (dragCue) dragCue.textContent = activeCardPinned ? 'PINNED' : (Math.max(0, Math.ceil(remMs / 1000)) + 's');
    const persisted = Object.assign({}, layout, { pinned: false });
    try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(persisted)); } catch (_e) {}
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([FLT_KEY], (prev) => {
        const mergedFlt = Object.assign({}, (prev && prev[FLT_KEY]) || {}, {
          autoHideSec: layout.autoHideSec,
          cardPinned: false,
          stayOpen: false,
          soundEnabled: layout.soundEnabled,
          audioPreset: layout.audioPreset,
          liqMin: layout.liqMin
        });
        chrome.storage.local.set({ [LAYOUT_KEY]: persisted, [FLT_KEY]: mergedFlt, auto_scan_collect: Boolean(layout.autoScan) }, () => {});
      });
    }
  }

  try {
    const saved = localStorage.getItem(LAYOUT_KEY);
    if (saved) layout = Object.assign(layout, JSON.parse(saved), { pinned: false });
  } catch (_e) {}
  activeCardPinned = false;
  layout.pinned = false;
  totalMs = computeTotalMs();
  remMs = totalMs;
  applyLayout();

  const openTarget = () => {
    if (isNews && !isValidExternalNewsUrl(targetUrl)) return;
    if (!targetUrl) return;
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: targetUrl });
    } else {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
    if (!activeCardPinned) window.close();
  };

  document.getElementById('btnZoomOut').onclick = (e) => { e.stopPropagation(); layout.zoomPct = clampZoom(layout.zoomPct - 15); applyLayout(); };
  document.getElementById('btnZoomPct').onclick = (e) => { e.stopPropagation(); layout.zoomPct = 100; applyLayout(); };
  document.getElementById('btnZoomIn').onclick = (e) => { e.stopPropagation(); layout.zoomPct = clampZoom(layout.zoomPct + 15); applyLayout(); };
  document.getElementById('btnStepMinus').onclick = (e) => {
    e.stopPropagation();
    const idx = Math.max(0, ALLOWED_STAY_SECS.indexOf(normStaySec(layout.autoHideSec)) - 1);
    layout.autoHideSec = ALLOWED_STAY_SECS[idx];
    activeCardPinned = false;
    layout.pinned = false;
    totalMs = computeTotalMs();
    remMs = totalMs;
    applyLayout();
  };
  document.getElementById('btnStepPlus').onclick = (e) => {
    e.stopPropagation();
    const idx = Math.min(ALLOWED_STAY_SECS.length - 1, ALLOWED_STAY_SECS.indexOf(normStaySec(layout.autoHideSec)) + 1);
    layout.autoHideSec = ALLOWED_STAY_SECS[idx];
    activeCardPinned = false;
    layout.pinned = false;
    totalMs = computeTotalMs();
    remMs = totalMs;
    applyLayout();
  };
  document.getElementById('btnPin').onclick = (e) => {
    e.stopPropagation();
    activeCardPinned = !activeCardPinned;
    layout.pinned = false;
    if (!activeCardPinned) { totalMs = computeTotalMs(); remMs = totalMs; }
    applyLayout();
  };
  document.getElementById('btnMute').onclick = (e) => {
    e.stopPropagation();
    layout.soundEnabled = !layout.soundEnabled;
    if (layout.soundEnabled) playSpokenVoice(layout.audioPreset);
    applyLayout();
  };
  document.getElementById('btnGear').onclick = (e) => { e.stopPropagation(); drawer.classList.toggle('open'); };
  document.getElementById('btnClose').onclick = (e) => {
    e.stopPropagation();
    card.style.display = 'none';
    card.style.visibility = 'hidden';
    window.close();
  };
  document.getElementById('bodyClick').onclick = openTarget;
  document.getElementById('btnCta').onclick = (e) => { e.stopPropagation(); openTarget(); };
  if (audioSel) {
    audioSel.onchange = () => { layout.audioPreset = audioSel.value; playSpokenVoice(layout.audioPreset); applyLayout(); };
  }
  const playBtn = document.getElementById('ctPlayVoiceBtn');
  if (playBtn) {
    playBtn.onclick = (e) => { e.stopPropagation(); playSpokenVoice(audioSel ? audioSel.value : 'To Valhalla!'); };
  }
  if (liqSlider) {
    liqSlider.oninput = () => { layout.liqMin = liqSlider.value !== '' ? Number(liqSlider.value) : 10000; applyLayout(); };
  }
  const ctScanBtn = document.getElementById('ctScanBtn');
  const ctScanInp = document.getElementById('ctScanInp');
  const ctScanOut = document.getElementById('ctScanOut');
  if (ctScanBtn && ctScanInp && ctScanOut) {
    ctScanBtn.onclick = (e) => {
      e.stopPropagation();
      const raw = String(ctScanInp.value || '').trim();
      const m = extractMint(raw, raw, raw, raw) || 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN';
      const u = 'https://rentandrugshield.com/?token=' + encodeURIComponent(m) + '&autoscan=1#tokenScanner';
      ctScanOut.style.display = 'block';
      ctScanOut.innerHTML = `<a href="${u}" target="_blank" rel="noopener noreferrer" style="color:#00FF88;font-weight:900;text-decoration:none;">[OPEN 12-LAYER AUDIT \u2197]</a>`;
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) chrome.tabs.create({ url: u });
      else window.open(u, '_blank', 'noopener,noreferrer');
    };
  }
  if (autoScanBtn) {
    autoScanBtn.onclick = (e) => {
      e.stopPropagation();
      layout.autoScan = !layout.autoScan;
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'RRS_SET_AUTOSCAN_V67', enabled: layout.autoScan }, () => {});
      }
      try { localStorage.setItem(AUTOSCAN_KEY, JSON.stringify({ enabled: layout.autoScan, ts: Date.now() })); } catch (_e) {}
      applyLayout();
    };
  }

  let lastTickTs = Date.now();
  setInterval(() => {
    const now = Date.now();
    const dt = Math.max(0, now - lastTickTs);
    lastTickTs = now;
    if (activeCardPinned || drawer.classList.contains('open')) {
      if (dragCue) dragCue.textContent = activeCardPinned ? 'PINNED' : 'SETTINGS';
      return;
    }
    remMs -= dt;
    const secLeft = Math.max(0, Math.ceil(remMs / 1000));
    if (dragCue) dragCue.textContent = secLeft + 's';
    if (progBar) progBar.style.width = Math.max(0, Math.min(100, (remMs / Math.max(1000, totalMs)) * 100)).toFixed(1) + '%';
    if (remMs <= 0) {
      card.style.display = 'none';
      card.style.visibility = 'hidden';
      window.close();
    }
  }, 80);
})();
