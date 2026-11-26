var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
(function () {
    var VIDEO_SRC = '/promo/rent_rug_shield_promo_45s.mp4?v=1795136453';
    function stripEmojiText(s) {
        var out = '';
        var arr = Array.from(s);
        for (var i = 0; i < arr.length; i++) {
            var cp = arr[i].codePointAt(0);
            var isEm = (cp >= 0x1F300 && cp <= 0x1FAFF) || (cp >= 0x2600 && cp <= 0x27BF) || cp === 0xFE0F || cp === 0x200D;
            if (!isEm)
                out += arr[i];
        }
        return out.split('  ').join(' ');
    }
    function enforceBlackGoldOnNode(root) {
        if (!root)
            return;
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
        var n;
        while ((n = walker.nextNode())) {
            var c = stripEmojiText(n.nodeValue || '');
            if (c !== n.nodeValue)
                n.nodeValue = c;
        }
        root.querySelectorAll('*').forEach(function (el) {
            var st = el.getAttribute('style') || '';
            if (st) {
                /* Replace inline green/cyan/purple accents inside Institutional view with Gold/Black */
                if (st.indexOf('#00ff') !== -1 || st.indexOf('#10b981') !== -1 || st.indexOf('#059669') !== -1 || st.indexOf('rgb(16, 185, 129)') !== -1 || st.indexOf('#38bdf8') !== -1 || st.indexOf('#06b6d4') !== -1) {
                    el.style.setProperty('border-color', 'rgba(212, 175, 55, 0.45)', 'important');
                    if (el.tagName.toLowerCase() !== 'button') {
                        el.style.setProperty('color', '#F5C542', 'important');
                    }
                }
            }
        });
    }
    function ensureCinemaV9() {
        var ov = document.getElementById('ranger-v9-cinema-overlay');
        if (ov)
            return ov;
        ov = document.createElement('div');
        ov.id = 'ranger-v9-cinema-overlay';
        ov.innerHTML =
            '<div id="ranger-v9-cinema-box">' +
                '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">' +
                '<span style="color:#F5C542;font-weight:800;font-size:15px;letter-spacing:0.03em;">SOLANA RENT & RUG SHIELD | 12-LAYER OVERVIEW</span>' +
                '<div style="display:flex;align-items:center;gap:8px;">' +
                '<button id="ranger-v9-mute-btn" type="button" style="background:#141824;color:#F5C542;border:1px solid #D4AF37;border-radius:6px;padding:6px 12px;font-weight:700;font-size:13px;cursor:pointer;">🔊 Sound ON (Click to Mute)</button>' +
                '<button id="ranger-v9-close-btn" type="button" style="background:#DC2626;color:#fff;border:none;border-radius:6px;padding:6px 14px;font-weight:800;font-size:13px;cursor:pointer;">✕ CLOSE</button>' +
                '</div>' +
                '</div>' +
                '<video id="ranger-v9-cinema-video" controls playsinline webkit-playsinline muted preload="none" poster="/assets/rr_badge_exact.jpg" src="' + VIDEO_SRC + '"></video>' +
                '</div>';
        document.body.appendChild(ov);
        var vid = document.getElementById('ranger-v9-cinema-video');
        var mbtn = document.getElementById('ranger-v9-mute-btn');
        mbtn.addEventListener('click', function () {
            vid.muted = !vid.muted;
            mbtn.textContent = vid.muted ? '🔇 Sound Muted (Click to Unmute)' : '🔊 Sound ON (Click to Mute)';
        });
        function closeV9() {
            try {
                vid.pause();
            }
            catch (_e) { }
            ov.style.setProperty('display', 'none', 'important');
        }
        document.getElementById('ranger-v9-close-btn').addEventListener('click', closeV9);
        ov.addEventListener('click', function (e) { if (e.target === ov)
            closeV9(); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape')
            closeV9(); });
        return ov;
    }
    function openPromoWithSound(ev) {
        if (ev) {
            ev.preventDefault();
            ev.stopImmediatePropagation();
        }
        document.querySelectorAll('video').forEach(function (v) {
            if (v.id !== 'ranger-v9-cinema-video') {
                try {
                    v.pause();
                    v.muted = true;
                }
                catch (_e) { }
            }
        });
        document.querySelectorAll('[id*="promo" i][id*="modal" i], [class*="promo" i][class*="modal" i], #ranger-v8-cinema-overlay').forEach(function (m) {
            if (m.id !== 'ranger-v9-cinema-overlay')
                m.style.setProperty('display', 'none', 'important');
        });
        var ov = ensureCinemaV9();
        ov.style.setProperty('display', 'flex', 'important');
        var vid = document.getElementById('ranger-v9-cinema-video');
        var mbtn = document.getElementById('ranger-v9-mute-btn');
        if (vid) {
            if (vid.src.indexOf('1795136453') === -1)
                vid.src = VIDEO_SRC;
            vid.currentTime = 0;
            vid.muted = false;
            vid.volume = 0.85;
            if (mbtn)
                mbtn.textContent = '🔊 Sound ON (Click to Mute)';
            var p = vid.play();
            if (p && p.catch) {
                p.catch(function () {
                    vid.muted = true;
                    if (mbtn)
                        mbtn.textContent = '🔇 Click Here to Enable Music';
                    vid.play().catch(function () { });
                });
            }
        }
    }
    function openSafeTelegramModal(ev) {
        if (ev) {
            ev.preventDefault();
            ev.stopImmediatePropagation();
        }
        var tm = document.getElementById('ranger-v9-tg-modal');
        if (!tm) {
            tm = document.createElement('div');
            tm.id = 'ranger-v9-tg-modal';
            tm.style.cssText = 'position:fixed;inset:0;background:rgba(2,4,8,0.9);z-index:2147483645;display:flex;align-items:center;justify-content:center;padding:16px;';
            tm.innerHTML =
                '<div style="max-width:460px;width:100%;background:#0A0C12;border:1.5px solid #D4AF37;border-radius:12px;padding:22px;color:#F8FAFC;font-family:sans-serif;">' +
                    '<h3 style="margin:0 0 10px 0;color:#F5C542;font-size:18px;">Live Rug & Rent Alerts</h3>' +
                    '<p style="margin:0 0 16px 0;color:#CBD5E1;font-size:14px;line-height:1.5;">Enable instant desktop & mobile pop-up alerts right from this browser, or follow live 12-Layer scan proofs on our official X feed <b>@SolRentClaim</b>.</p>' +
                    '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
                    '<button id="rv9-enable-push" type="button" style="flex:1;background:#F5C542;color:#050507;border:none;border-radius:6px;padding:10px 14px;font-weight:800;cursor:pointer;">Enable Live Pop-Ups</button>' +
                    '<a href="https://x.com/SolRentClaim" target="_blank" rel="noopener" style="flex:1;text-align:center;background:#141824;color:#F5C542;border:1px solid #D4AF37;border-radius:6px;padding:10px 14px;font-weight:700;text-decoration:none;">Open @SolRentClaim</a>' +
                    '</div>' +
                    '<button id="rv9-close-tg" type="button" style="margin-top:12px;width:100%;background:transparent;color:#9CA3AF;border:1px solid #27272A;border-radius:6px;padding:8px;cursor:pointer;">Close</button>' +
                    '</div>';
            document.body.appendChild(tm);
            document.getElementById('rv9-close-tg').onclick = function () { tm.style.display = 'none'; };
            tm.onclick = function (e) { if (e.target === tm)
                tm.style.display = 'none'; };
            document.getElementById('rv9-enable-push').onclick = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var perm;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!('Notification' in window)) return [3 /*break*/, 2];
                                return [4 /*yield*/, Notification.requestPermission()];
                            case 1:
                                perm = _a.sent();
                                if (perm === 'granted')
                                    (function () { return { close: function () { } }; })('Solana Rent & Rug Shield', { body: 'Live 12-Layer Pop-Up Alerts Active!' });
                                _a.label = 2;
                            case 2:
                                tm.style.display = 'none';
                                return [2 /*return*/];
                        }
                    });
                });
            };
        }
        tm.style.display = 'flex';
    }
    function applyV9All() {
        /* 1. Update inline preview videos to clean V9 MP4 & unmute when clicked directly */
        document.querySelectorAll('video').forEach(function (v) {
            if (v.id !== 'ranger-v9-cinema-video' && v.id !== 'retailVaultMasterVideo' && v.id !== 'rrsVaultMasterVideo' && v.id !== 'rrsCinemaModalVideo' && v.id !== 'rrsTvTheaterVideo' && v.id !== 'rrsExtSectionVideo' && v.id !== 'rrsHeroExtV60Video') {
                var s = v.getAttribute('src') || '';
                if (s.indexOf('promo') !== -1 && s.indexOf('1795136453') === -1) {
                    v.setAttribute('src', VIDEO_SRC);
                }
                if (!v.__rv9ClickSound) {
                    v.__rv9ClickSound = true;
                    v.addEventListener('click', openPromoWithSound, true);
                }
            }
        });
        /* 2. Remove GitHub links, secure Telegram links, and deduplicate double Promo buttons */
        var promoBtns = [];
        document.querySelectorAll('a, button, [role="button"]').forEach(function (el) {
            var tx = (el.textContent || '').trim().toLowerCase();
            var hr = (el.getAttribute('href') || '').trim().toLowerCase();
            /* Hide ANY GitHub link */
            if (hr.indexOf('github.com') !== -1 || tx === 'github') {
                el.style.setProperty('display', 'none', 'important');
                return;
            }
            /* Intercept ANY Telegram link so it NEVER opens Sunny's private Telegram Desktop */
            if (hr.indexOf('t.me/') !== -1 || hr.indexOf('telegram') !== -1 || tx === 'telegram' || tx.indexOf('telegram') !== -1) {
                if (el.id !== 'rv9-close-tg') {
                    /* preserve href for Canary trust verification */
                    if (!el.__rv9TgSafe) {
                        el.__rv9TgSafe = true;
                        el.addEventListener('click', openSafeTelegramModal, true);
                    }
                }
            }
            /* Block any button dumping user into browser edge:// or chrome:// app settings */
            if (tx.indexOf('open app settings') !== -1 || hr.indexOf('settings') !== -1) {
                el.style.setProperty('display', 'none', 'important');
                return;
            }
            /* Ensure X / Twitter links always open in a NEW tab without leaving our website */
            if (hr.indexOf('x.com/') !== -1 || hr.indexOf('twitter.com/') !== -1) {
                el.setAttribute('target', '_blank');
                el.setAttribute('rel', 'noopener noreferrer');
            }
            /* Collect duplicate Unmute Promo / Watch 45s Promo buttons */
            if (tx.indexOf('unmute promo') !== -1 ||
                (tx.indexOf('45s') !== -1 && (tx.indexOf('promo') !== -1 || tx.indexOf('watch') !== -1 || tx.indexOf('demo') !== -1)) ||
                hr === '/promo' || hr === '/promo/') {
                promoBtns.push(el);
            }
        });
        /* Keep ONE clean Watch 45s Promo (With Sound) button per bar; hide redundant Unmute duplicate */
        var keptVisiblePromo = 0;
        promoBtns.forEach(function (btn) {
            var tx = (btn.textContent || '').trim().toLowerCase();
            if (tx.indexOf('unmute promo') !== -1 && promoBtns.length > 1) {
                btn.style.setProperty('display', 'none', 'important');
                return;
            }
            if (!btn.__rv9PromoWired) {
                btn.__rv9PromoWired = true;
                btn.addEventListener('click', openPromoWithSound, true);
            }
            if (keptVisiblePromo === 0 && btn.offsetParent !== null) {
                keptVisiblePromo += 1;
            }
            else if (keptVisiblePromo >= 1 && tx.indexOf('45s') !== -1 && btn.closest('header') === null) {
                /* Hide duplicate second Watch 45s button in the same hero block */
                btn.style.setProperty('display', 'none', 'important');
            }
        });
        /* 3. Enforce Black & Gold on Institutional containers */
        document.querySelectorAll('#institutionalView, .institutional-view, [id*="institutional" i]').forEach(enforceBlackGoldOnNode);
        if (document.body && (document.body.classList.contains('institutional-mode') || document.body.getAttribute('data-ui-mode') === 'institutional' || window.location.pathname.indexOf('institutional') !== -1)) {
            document.body.classList.add('institutional-mode');
            enforceBlackGoldOnNode(document.body);
        }
        /* 4. Fix any lingering '12-Layer' text on page to '12-Layer' */
        var wlk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        var tn;
        while ((tn = wlk.nextNode())) {
            if (tn.nodeValue && tn.nodeValue.indexOf('12-Layer') !== -1) {
                tn.nodeValue = tn.nodeValue.split('12-Layer').join('12-Layer');
            }
            if (tn.nodeValue && tn.nodeValue.indexOf('12-layer') !== -1) {
                tn.nodeValue = tn.nodeValue.split('12-layer').join('12-layer');
            }
        }
    }
    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', applyV9All);
    else
        applyV9All();
    window.addEventListener('load', applyV9All);
    document.addEventListener('click', function () { setTimeout(applyV9All, 90); });
    setTimeout(applyV9All, 500);
})();;

(function () {
  'use strict';
  if (window.__RRS_SINGLE_AUDIO_MUTEX_V67__) return;
  window.__RRS_SINGLE_AUDIO_MUTEX_V67__ = true;

  function isAnyVideoPlayingUnmuted() {
    var vids = document.querySelectorAll('video');
    for (var i = 0; i < vids.length; i++) {
      var v = vids[i];
      if (!v.paused && !v.ended && !v.muted && v.volume > 0.01) return true;
    }
    return false;
  }

  window.rrsStopAllOtherAudio = function (exceptEl) {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (_e) {}
    try {
      if (window.__RRS_CHIME_TIMER__) {
        clearTimeout(window.__RRS_CHIME_TIMER__);
        window.__RRS_CHIME_TIMER__ = null;
      }
    } catch (_e2) {}
    try {
      if (window.__RRS_ACTIVE_AUDIO__ && window.__RRS_ACTIVE_AUDIO__ !== exceptEl) {
        window.__RRS_ACTIVE_AUDIO__.pause();
        window.__RRS_ACTIVE_AUDIO__.currentTime = 0;
      }
    } catch (_e3) {}
    try {
      var media = document.querySelectorAll('video, audio');
      for (var i = 0; i < media.length; i++) {
        var m = media[i];
        if (m !== exceptEl) {
          try { m.pause(); } catch (_pm) {}
        }
      }
    } catch (_e4) {}
  };

  document.addEventListener('play', function (ev) {
    var t = ev && ev.target;
    if (t && (t.tagName === 'VIDEO' || t.tagName === 'AUDIO')) {
      window.rrsStopAllOtherAudio(t);
    }
  }, true);

  document.addEventListener('volumechange', function (ev) {
    var t = ev && ev.target;
    if (t && (t.tagName === 'VIDEO' || t.tagName === 'AUDIO') && !t.paused && !t.muted && t.volume > 0.01) {
      window.rrsStopAllOtherAudio(t);
    }
  }, true);

  if (window.speechSynthesis && typeof window.speechSynthesis.speak === 'function' && !window.speechSynthesis.__rrsMutexWrapped) {
    var origSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
    var wrappedSpeak = function (utter) {
      try { window.speechSynthesis.cancel(); } catch (_c) {}
      if (isAnyVideoPlayingUnmuted() && !window.__RRS_ALLOW_EXPLICIT_TOUR_SPEECH__) {
        return;
      }
      return origSpeak(utter);
    };
    wrappedSpeak.__rrsMutexWrapped = true;
    try { window.speechSynthesis.speak = wrappedSpeak; } catch (_ws) {}
  }
})();
