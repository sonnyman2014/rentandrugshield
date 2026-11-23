(function () {
  'use strict';
  const qp = new URLSearchParams(window.location.search || '');
  const scrub = (s) => String(s || '').replace(/\u2014/g, ' | ').replace(/\u2013/g, '-').replace(/--+/g, '-');
  const title = scrub(qp.get('title') || '12-Layer Carbon Sentinel v5.3 Active');
  const sub = scrub(qp.get('sub') || 'Click card to inspect');
  const badge = scrub(qp.get('badge') || '12-LAYER SHIELD');
  const url = qp.get('url') || 'https://rentandrugshield.com';
  const sev = qp.get('sev') || 'INFO';
  const kind = qp.get('kind') || 'coin';
  const symParam = qp.get('sym') || '';

  const card = document.getElementById('card');
  const tk = document.getElementById('tk');
  const pl = document.getElementById('pl');
  const ttl = document.getElementById('ttl');
  const subEl = document.getElementById('sub');

  const sm = title.match(/\$([A-Za-z0-9_]{2,12})/);
  const pm = title.match(/([+-]\d+(?:\.\d+)?%)/);
  const sym = symParam ? ('$' + symParam.replace(/^\$/, '').toUpperCase()) : (sm ? ('$' + sm[1].toUpperCase()) : '');
  const pct = pm ? pm[1] : '';

  if (sev === 'CRITICAL' || kind === 'rug' || pct.startsWith('-')) {
    card.classList.add('red');
  }

  if (sym) {
    tk.style.display = 'inline-block';
    tk.textContent = sym + (pct ? (' ' + pct) : '');
  }
  pl.textContent = badge.replace(/^[^\w$]+/, '').trim() || 'CARBON v5.3';
  ttl.textContent = title;
  subEl.textContent = sub;

  document.getElementById('btnClose').addEventListener('click', (ev) => {
    ev.stopPropagation();
    window.close();
  });

  card.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
    window.close();
  });

  setTimeout(() => { window.close(); }, 7000);
})();
