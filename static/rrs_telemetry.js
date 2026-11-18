/* Solana Rent & Rug Shield - 11-Layer Info Popover, View Navigation & Button Click Telemetry */
(function () {
  if (window.__RRS_0X107_TELEMETRY_LOADED) return;
  window.__RRS_0X107_TELEMETRY_LOADED = true;

  var LAYER11_INFO_TEXT = "We launched at 10 layers and already shipped Layer 11 (Block-0 Sybil Cluster Defense) live at $0 extra cost during active passes.";
  var EXCLUDED_PREFIXES = ["5sEb9m", "CsLX8F", "DGnsyz", "FRCeYg"];
  var _apiBaseCache = null;

  function injectSharedStyles() {
    if (document.getElementById("rrs-0x107-shared-styles")) return;
    var st = document.createElement("style");
    st.id = "rrs-0x107-shared-styles";
    st.textContent = [
      ".rrs-layer11-info-btn{display:inline-flex;align-items:center;justify-content:center;width:21px;height:21px;margin-left:6px;padding:0;border-radius:999px;border:1.5px solid #14F195;background:rgba(20,241,149,0.16);color:#6EE7B7;font-size:12.5px;font-weight:900;line-height:1;cursor:pointer;vertical-align:middle;transition:all .16s ease;box-shadow:0 0 8px rgba(20,241,149,0.22);}",
      ".rrs-layer11-info-btn:hover,.rrs-layer11-info-btn:focus{background:#14F195;color:#022C22;transform:scale(1.07);outline:none;}",
      "#rrsLayer11GlobalPopover{display:none;position:fixed;z-index:2147483000;width:min(340px,calc(100vw - 24px));background:linear-gradient(165deg,#071628,#042F2E);border:1.5px solid #14F195;border-radius:12px;padding:12px 14px;color:#F8FAFC;font-size:13px;line-height:1.48;box-shadow:0 18px 44px rgba(0,0,0,0.88);}",
      "#rrsLayer11GlobalPopover.rrs-open{display:block;}",
      ".rrs-onpage-nav-bar{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;padding:4px 8px;border-radius:10px;background:rgba(9,16,29,0.9);border:1px solid rgba(56,189,248,0.38);}",
      ".rrs-nav-ctrl-btn{display:inline-flex;align-items:center;gap:4px;min-height:30px;padding:4px 10px;border-radius:7px;border:1px solid #334155;background:#0F172A;color:#E2E8F0;font-size:12px;font-weight:700;cursor:pointer;text-decoration:none;transition:all .15s ease;line-height:1.2;}",
      ".rrs-nav-ctrl-btn:hover{border-color:#14F195;color:#6EE7B7;background:#0B192E;}",
      ".rrs-nav-ctrl-home{border-color:rgba(20,241,149,0.55);background:rgba(16,185,129,0.14);color:#6EE7B7;}",
      ".rrs-modal-nav-strip{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:6px 9px;margin-bottom:10px;border-radius:9px;background:#080F1D;border:1px solid rgba(56,189,248,0.32);}"
    ].join("\n");
    (document.head || document.documentElement).appendChild(st);
  }

  function getSessionId() {
    try {
      var sid = sessionStorage.getItem("rrs_tel_sid");
      if (!sid) {
        sid = "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
        sessionStorage.setItem("rrs_tel_sid", sid);
      }
      return sid;
    } catch (_e) {
      return "s_mem_" + Math.floor(Date.now() / 1000);
    }
  }

  function captureStickyAffiliateRef() {
    try {
      var qp = new URLSearchParams(window.location.search || "");
      var ref = (qp.get("ref") || "").trim();
      if (ref && ref.length >= 3 && ref.length <= 64) {
        var blocked = EXCLUDED_PREFIXES.some(function (p) { return ref.indexOf(p) === 0; });
        if (!blocked) {
          localStorage.setItem("rrs_affiliate_ref_30pct", ref);
          sessionStorage.setItem("rrs_affiliate_ref_30pct", ref);
          return ref;
        }
      }
      return sessionStorage.getItem("rrs_affiliate_ref_30pct") || localStorage.getItem("rrs_affiliate_ref_30pct") || "";
    } catch (_e) {
      return "";
    }
  }

  function detectConnectedWallet() {
    try {
      var providers = [
        window.phantom && window.phantom.solana,
        window.solana,
        window.solflare,
        window.backpack && window.backpack.solana,
        window.backpack
      ];
      for (var i = 0; i < providers.length; i++) {
        var p = providers[i];
        if (p && p.publicKey && typeof p.publicKey.toString === "function") {
          var pk = String(p.publicKey.toString() || "").trim();
          if (pk.length >= 32 && pk.length <= 44) {
            var bad = EXCLUDED_PREFIXES.some(function (x) { return pk.indexOf(x) === 0; });
            if (!bad) return pk;
          }
        }
      }
      var inpIds = ["walletInput", "w-inp", "affRefWalletGenInp"];
      for (var j = 0; j < inpIds.length; j++) {
        var el = document.getElementById(inpIds[j]);
        if (el && el.value) {
          var v = String(el.value).trim();
          if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(v)) {
            var bad2 = EXCLUDED_PREFIXES.some(function (x) { return v.indexOf(x) === 0; });
            if (!bad2) return v;
          }
        }
      }
    } catch (_e) {}
    return "";
  }

  async function resolveTelemetryEndpoint() {
    if (_apiBaseCache !== null) return _apiBaseCache + "/api/telemetry/click";
    var host = String(window.location.hostname || "").toLowerCase();
    if (host === "127.0.0.1" || host === "localhost") {
      _apiBaseCache = "";
      return "/api/telemetry/click";
    }
    if (host.indexOf("rentandrugshield.com") !== -1 || host.indexOf("github.io") !== -1) {
      try {
        var r = await fetch("/live_endpoint.json?t=" + Math.floor(Date.now() / 60000), { cache: "no-store" });
        if (r.ok) {
          var j = await r.json();
          if (j && j.api_base) {
            _apiBaseCache = String(j.api_base).replace(/\/+$/, "");
            return _apiBaseCache + "/api/telemetry/click";
          }
        }
      } catch (_e) {}
      _apiBaseCache = "https://via-tree-techno-rrp.trycloudflare.com";
      return _apiBaseCache + "/api/telemetry/click";
    }
    _apiBaseCache = "";
    return "/api/telemetry/click";
  }

  function dispatchButtonClickTelemetry(payload) {
    resolveTelemetryEndpoint().then(function (url) {
      var bodyStr = JSON.stringify(payload);
      var sent = false;
      try {
        if (navigator.sendBeacon) {
          var blob = new Blob([bodyStr], { type: "text/plain;charset=UTF-8" });
          sent = navigator.sendBeacon(url, blob);
        }
      } catch (_e) {}
      if (!sent) {
        try {
          fetch(url, {
            method: "POST",
            mode: "cors",
            keepalive: true,
            headers: { "Content-Type": "application/json" },
            body: bodyStr
          }).catch(function () {});
        } catch (_e2) {}
      }
    });
  }

  // Interactive Layer 11 Info Popover
  function ensurePopoverDom() {
    var pop = document.getElementById("rrsLayer11GlobalPopover");
    if (pop) return pop;
    pop = document.createElement("div");
    pop.id = "rrsLayer11GlobalPopover";
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-label", "11-Layer Defense Upgrade Notice");
    pop.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px;">' +
      '<span style="font-size:12px;font-weight:900;color:#14F195;letter-spacing:0.02em;">🛡️ LAYER 11 SHIPPED LIVE • $0 EXTRA</span>' +
      '<button type="button" id="rrsLayer11PopClose" style="background:transparent;border:1px solid #334155;color:#CBD5E1;border-radius:6px;padding:1px 6px;font-size:11px;cursor:pointer;">✕</button>' +
      "</div>" +
      '<div style="color:#F8FAFC;font-weight:600;">' + LAYER11_INFO_TEXT + "</div>";
    document.body.appendChild(pop);
    var cBtn = document.getElementById("rrsLayer11PopClose");
    if (cBtn) {
      cBtn.addEventListener("click", function (ev) {
        ev.stopPropagation();
        pop.classList.remove("rrs-open");
      });
    }
    document.addEventListener("click", function (ev) {
      if (!pop.classList.contains("rrs-open")) return;
      var t = ev.target;
      if (pop.contains(t) || (t && t.closest && t.closest(".rrs-layer11-info-btn"))) return;
      pop.classList.remove("rrs-open");
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") pop.classList.remove("rrs-open");
    });
    return pop;
  }

  window.rrsShowLayer11Popover = function (anchorEl, toggleMode) {
    var pop = ensurePopoverDom();
    if (toggleMode && pop.classList.contains("rrs-open") && pop._anchor === anchorEl) {
      pop.classList.remove("rrs-open");
      return;
    }
    pop._anchor = anchorEl;
    pop.classList.add("rrs-open");
    if (anchorEl && anchorEl.getBoundingClientRect) {
      var rect = anchorEl.getBoundingClientRect();
      var pw = Math.min(340, window.innerWidth - 24);
      var left = Math.max(12, Math.min(rect.left - 20, window.innerWidth - pw - 12));
      var top = rect.bottom + 8;
      if (top + 130 > window.innerHeight) {
        top = Math.max(12, rect.top - 125);
      }
      pop.style.left = left + "px";
      pop.style.top = top + "px";
    }
  };

  function bindLayer11Buttons() {
    var btns = document.querySelectorAll(".rrs-layer11-info-btn");
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      if (b._rrsBound) continue;
      b._rrsBound = true;
      (function (btn) {
        btn.addEventListener("click", function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          window.rrsShowLayer11Popover(btn, true);
        });
        btn.addEventListener("mouseenter", function () {
          if (window.matchMedia && window.matchMedia("(hover: hover)").matches) {
            window.rrsShowLayer11Popover(btn, false);
          }
        });
      })(b);
    }
  }

  // In-page view/tab & modal navigation state stack
  var _viewStack = [];
  var _viewIdx = -1;
  var _lastClosedModalId = null;

  function closeActiveModalIfAny() {
    var modalIds = ["liveCheckoutModal", "publicBetaFeedbackModal", "watchDemoModal", "addAppModal", "singleAudit2cModal", "appSingleAudit2cModal"];
    for (var i = 0; i < modalIds.length; i++) {
      var m = document.getElementById(modalIds[i]);
      if (m && m.style && m.style.display && m.style.display !== "none") {
        _lastClosedModalId = modalIds[i];
        m.style.display = "none";
        return true;
      }
    }
    return false;
  }

  window.rrsRecordTabView = function (tabName) {
    if (!tabName) return;
    if (_viewIdx >= 0 && _viewStack[_viewIdx] === tabName) return;
    _viewStack = _viewStack.slice(0, _viewIdx + 1);
    _viewStack.push(tabName);
    _viewIdx = _viewStack.length - 1;
  };

  window.rrsNavAction = function (action) {
    if (action === "home") {
      closeActiveModalIfAny();
      if (window.location.pathname === "/" || window.location.pathname === "/index.html") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.location.href = "/";
      }
      return;
    }
    if (action === "back") {
      if (closeActiveModalIfAny()) return;
      if (typeof window.switchNativeTab === "function" && _viewIdx > 0) {
        _viewIdx -= 1;
        window.switchNativeTab(_viewStack[_viewIdx], true);
        return;
      }
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
      return;
    }
    if (action === "forward") {
      if (typeof window.switchNativeTab === "function" && _viewIdx >= 0 && _viewIdx < _viewStack.length - 1) {
        _viewIdx += 1;
        window.switchNativeTab(_viewStack[_viewIdx], true);
        return;
      }
      if (_lastClosedModalId) {
        var m = document.getElementById(_lastClosedModalId);
        if (m) {
          m.style.display = "flex";
          _lastClosedModalId = null;
          return;
        }
      }
      window.history.forward();
    }
  };

  function injectModalNavStrips() {
    var modalIds = ["liveCheckoutModal", "publicBetaFeedbackModal", "watchDemoModal"];
    for (var i = 0; i < modalIds.length; i++) {
      var modal = document.getElementById(modalIds[i]);
      if (!modal) continue;
      var inner = modal.firstElementChild;
      if (!inner || inner.querySelector(".rrs-modal-nav-strip")) continue;
      var strip = document.createElement("div");
      strip.className = "rrs-modal-nav-strip";
      strip.innerHTML =
        '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">' +
        '<button type="button" class="rrs-nav-ctrl-btn" id="modalNavBack_' + modalIds[i] + '" onclick="window.rrsNavAction(\'back\')">← Back</button>' +
        '<a href="/" class="rrs-nav-ctrl-btn rrs-nav-ctrl-home" id="modalNavHome_' + modalIds[i] + '" onclick="window.rrsNavAction(\'home\');return false;">🏠 Home</a>' +
        '<button type="button" class="rrs-nav-ctrl-btn" id="modalNavFwd_' + modalIds[i] + '" onclick="window.rrsNavAction(\'forward\')">Forward →</button>' +
        "</div>" +
        '<span style="font-size:11px;color:#6EE7B7;font-weight:700;">11-Layer Shield</span>';
      inner.insertBefore(strip, inner.firstChild);
    }
  }

  function wrapAppTabSwitcher() {
    if (typeof window.switchNativeTab === "function" && !window.switchNativeTab._rrsWrapped) {
      var orig = window.switchNativeTab;
      window.rrsRecordTabView("claim");
      var wrapped = function (tabId, skipRecord) {
        if (!skipRecord) window.rrsRecordTabView(tabId);
        return orig.apply(this, arguments);
      };
      wrapped._rrsWrapped = true;
      window.switchNativeTab = wrapped;
    }
  }

  function setupClickDelegation() {
    document.addEventListener("click", function (ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      var el = t.closest("button, a, [role='button'], .btn, .choice-a-btn, .nav-pill, .btn-emerald, .btn-outline, .btn-cta, .btn-secondary");
      if (!el) return;
      var tag = String(el.tagName || "BUTTON").toUpperCase();
      var label = String(el.getAttribute("data-telemetry-label") || el.getAttribute("aria-label") || el.innerText || el.textContent || el.getAttribute("title") || "").replace(/\s+/g, " ").trim().slice(0, 100);
      var id = String(el.id || el.getAttribute("data-telemetry-id") || "").trim();
      var href = String(el.getAttribute("href") || "").trim();
      if (!id) {
        var slug = (label || href || tag).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48);
        id = tag.toLowerCase() + "_" + (slug || "cta");
      }
      var ref = captureStickyAffiliateRef();
      var wallet = detectConnectedWallet();
      dispatchButtonClickTelemetry({
        button_id: id,
        button_label: label || id,
        tag: tag,
        href: href,
        page_path: window.location.pathname || "/",
        page_url: window.location.href || "",
        session_id: getSessionId(),
        ref: ref,
        wallet: wallet,
        viewport: window.innerWidth + "x" + window.innerHeight,
        ts: Date.now() / 1000
      });
    }, true);
  }

  function init() {
    injectSharedStyles();
    captureStickyAffiliateRef();
    bindLayer11Buttons();
    injectModalNavStrips();
    wrapAppTabSwitcher();
    setupClickDelegation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
