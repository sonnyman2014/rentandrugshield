(function () {
  'use strict';
  if (window.__RRS_TOAST_OVERLAY_V51__) return;
  window.__RRS_TOAST_OVERLAY_V51__ = true;

  function playToastChime(isRed) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = window.__rrsToastAudioCtx || (window.__rrsToastAudioCtx = new AC());
      if (ctx.state === 'suspended') { ctx.resume().catch(() => {}); }
      const notes = isRed ? [587.33, 440.0] : [783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        const t = ctx.currentTime + idx * 0.11;
        osc.type = isRed ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.09, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.26);
      });
    } catch (_e) {}
  }

  function ensureToastContainer() {
    let c = document.getElementById('rrs-v51-toast-stack');
    if (c) return c;
    c = document.createElement('div');
    c.id = 'rrs-v51-toast-stack';
    c.style.cssText = 'position:fixed;top:16px;right:16px;z-index:2147483647;display:flex;flex-direction:column;gap:10px;max-width:390px;width:calc(100vw - 32px);pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
    document.documentElement.appendChild(c);
    return c;
  }

  function showInPageToast(t) {
    if (!t || !t.title) return;
    const stack = ensureToastContainer();
    const isRed = t.severity === 'CRITICAL' || t.kind === 'rug';
    const borderCol = isRed ? '#FF1744' : (t.kind === 'coin' ? '#00FFA3' : '#FFD700');
    const badgeBg = isRed ? '#7F1D1D' : (t.kind === 'coin' ? '#064E3B' : '#3B2806');

    const card = document.createElement('div');
    card.style.cssText =
      'pointer-events:auto;cursor:pointer;background:linear-gradient(160deg,#06111E 0%,#030710 100%);' +
      'border:2px solid ' + borderCol + ';border-radius:13px;padding:11px 13px;color:#F8FAFC;' +
      'box-shadow:0 18px 48px rgba(0,0,0,0.92),0 0 18px rgba(0,255,163,0.22);' +
      'transform:translateX(24px);opacity:0;transition:transform 0.22s ease,opacity 0.22s ease;';

    const top = document.createElement('div');
    top.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;';

    const bdg = document.createElement('span');
    bdg.style.cssText = 'background:' + badgeBg + ';border:1px solid ' + borderCol + ';color:#FFFFFF;padding:2px 8px;border-radius:999px;font-size:10.5px;font-weight:900;letter-spacing:0.03em;';
    bdg.textContent = t.badge || (isRed ? '🔴 12-LAYER THREAT ALERT' : '🛡️ CARBON SENTINEL LIVE');

    const cls = document.createElement('button');
    cls.type = 'button';
    cls.textContent = '✕';
    cls.style.cssText = 'background:#DC2626;color:#FFF;border:none;border-radius:6px;padding:2px 7px;font-size:11px;font-weight:900;cursor:pointer;';
    cls.onclick = function (ev) {
      ev.stopPropagation();
      card.remove();
    };

    top.appendChild(bdg);
    top.appendChild(cls);

    const ttl = document.createElement('div');
    ttl.style.cssText = 'font-size:13px;font-weight:900;color:#FFFFFF;line-height:1.32;margin-bottom:4px;';
    ttl.textContent = t.title;

    const sub = document.createElement('div');
    sub.style.cssText = 'font-size:11.3px;color:#CBD5E1;line-height:1.36;';
    sub.textContent = t.message || 'Click bubble to open ↗';

    card.appendChild(top);
    card.appendChild(ttl);
    card.appendChild(sub);

    card.addEventListener('click', function () {
      const target = t.url || 'https://rentandrugshield.com';
      window.open(target, '_blank', 'noopener,noreferrer');
      card.remove();
    });

    while (stack.children.length >= 3) {
      stack.firstElementChild.remove();
    }
    stack.appendChild(card);
    requestAnimationFrame(() => {
      card.style.transform = 'translateX(0)';
      card.style.opacity = '1';
    });
    playToastChime(isRed);
    setTimeout(() => {
      if (card.parentNode) {
        card.style.opacity = '0';
        setTimeout(() => { if (card.parentNode) card.remove(); }, 240);
      }
    }, isRed ? 16000 : 11000);
  }

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg && msg.type === 'RRS_SHOW_LIVE_TOAST' && msg.toast) {
        showInPageToast(msg.toast);
      }
    });
  }
})();
