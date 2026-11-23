(function () {
  'use strict';
  window.__RRS_TOAST_V53_READY__ = true;

  function scrubText(s) {
    return String(s || '')
      .replace(/\u2014/g, ' | ')
      .replace(/\u2013/g, '-')
      .replace(/--+/g, '-');
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
      host.style.cssText = 'position:fixed !important;bottom:18px !important;right:18px !important;z-index:2147483647 !important;pointer-events:none !important;background:transparent !important;';
      (document.body || document.documentElement).appendChild(host);
    }
    const root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    if (!root.getElementById('rrs-v53-style')) {
      const st = document.createElement('style');
      st.id = 'rrs-v53-style';
      st.textContent = `
        * { box-sizing: border-box; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .rrs-stack { display: flex; flex-direction: column-reverse; gap: 10px; width: 416px; max-width: calc(100vw - 32px); pointer-events: none; }
        .rrs-card {
          pointer-events: auto; cursor: pointer;
          background-color: #020408 !important;
          background-image: linear-gradient(160deg, #060B14 0%, #020408 100%) !important;
          color: #FFFFFF !important;
          border-radius: 12px; padding: 13px 15px;
          box-shadow: 0 22px 54px rgba(0,0,0,0.96), 0 0 22px var(--rrs-glow);
          border: 2px solid var(--rrs-accent);
          border-left: 7px solid var(--rrs-accent);
          transform: translateY(14px); opacity: 0;
          transition: transform 0.18s ease, opacity 0.18s ease;
        }
        .rrs-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
        .rrs-badges { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
        .rrs-ticker {
          background-color: #020408 !important;
          border: 1.5px solid var(--rrs-accent);
          color: var(--rrs-accent) !important;
          padding: 3px 9px; border-radius: 7px;
          font-size: 14.5px; font-weight: 900; letter-spacing: 0.02em;
        }
        .rrs-pill {
          background-color: var(--rrs-pill-bg) !important;
          border: 1px solid var(--rrs-accent);
          color: #FFFFFF !important;
          padding: 3px 9px; border-radius: 999px;
          font-size: 10.8px; font-weight: 800; letter-spacing: 0.02em;
        }
        .rrs-close {
          background-color: #0B1220 !important; color: #F8FAFC !important;
          border: 1px solid #334155; border-radius: 6px;
          padding: 2px 8px; font-size: 12px; font-weight: 900; cursor: pointer;
        }
        .rrs-title { font-size: 14.5px; font-weight: 900; color: #FFFFFF !important; line-height: 1.32; margin-bottom: 5px; }
        .rrs-sub { font-size: 12.2px; font-weight: 700; color: var(--rrs-sub) !important; line-height: 1.36; }
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
        .rrs-bell-count {
          background: #FACC15; color: #020408; border-radius: 999px;
          padding: 2px 8px; font-size: 11.5px; font-weight: 900;
        }
        .rrs-bell-hide {
          background: transparent; border: none; color: #94A3B8;
          font-size: 12px; font-weight: 900; cursor: pointer; margin-left: 2px;
        }
      `;
      root.appendChild(st);
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
    return { root, stack, bell };
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
    const { stack } = ensureShadowRootHost();
    const { sym, pct } = parseTicker(t);
    const isRed = (t.severity === 'CRITICAL' || t.kind === 'rug' || pct.startsWith('-'));
    const accent = isRed ? '#FF1744' : '#00FFA3';
    const glow = isRed ? 'rgba(255,23,68,0.36)' : 'rgba(0,255,163,0.30)';
    const pillBg = isRed ? '#4A0816' : '#043222';
    const subCol = isRed ? '#FDA4AF' : '#86EFAC';

    const card = document.createElement('div');
    card.className = 'rrs-card';
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
    pill.textContent = scrubText(t.badge || (isRed ? 'CRITICAL RUG ALERT' : '12-LAYER CARBON v5.3')).replace(/^[^\w$]+/, '').trim();
    badges.appendChild(pill);

    const cls = document.createElement('button');
    cls.type = 'button';
    cls.className = 'rrs-close';
    cls.textContent = 'X';
    cls.onclick = function (ev) { ev.stopPropagation(); card.remove(); };

    top.appendChild(badges);
    top.appendChild(cls);

    const ttl = document.createElement('div');
    ttl.className = 'rrs-title';
    ttl.textContent = scrubText(t.title);

    const sub = document.createElement('div');
    sub.className = 'rrs-sub';
    sub.textContent = scrubText(t.message || 'Click card to inspect');

    card.appendChild(top);
    card.appendChild(ttl);
    card.appendChild(sub);

    card.addEventListener('click', function () {
      window.open(t.url || 'https://rentandrugshield.com', '_blank', 'noopener,noreferrer');
      card.remove();
    });

    while (stack.children.length >= 3) stack.firstElementChild.remove();
    stack.appendChild(card);
    requestAnimationFrame(() => {
      card.style.transform = 'translateY(0)';
      card.style.opacity = '1';
    });

    setTimeout(() => {
      if (card.parentNode) {
        card.style.opacity = '0';
        setTimeout(() => { if (card.parentNode) card.remove(); }, 220);
      }
    }, 7000);
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
