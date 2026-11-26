/* RRS PERSISTENT TOP SWITCH BAR + LIVE SQLITE VOTE + SAVE TO TASKBAR + FLASHING CORNER SHIELD */
(function(){
  var FALLBACK_EP = "";
  var deferredPwaPrompt = null;
  window.addEventListener("beforeinstallprompt", function(e){
    e.preventDefault();
    deferredPwaPrompt = e;
  });

  function resolveApi() {
    if (window.BACKEND_TUNNEL_BASE && /^https?:\/\//.test(window.BACKEND_TUNNEL_BASE)) {
      return String(window.BACKEND_TUNNEL_BASE).replace(/\/+$/, "");
    }
    var h = (location.hostname || "").toLowerCase();
    if (h === "localhost" || h === "127.0.0.1") return "";
    return FALLBACK_EP;
  }

  window.rrsSelectUiMode = function(mode, skipHistory) {
    var isInst = (mode === "institutional");
    document.body.classList.toggle("rrs-mode-institutional", isInst);
    document.body.classList.toggle("rrs-mode-original", !isInst);
    var origEl = document.getElementById("rrsOriginalMemeContainer");
    var instEl = document.getElementById("rrsViewInstitutional");
    if (origEl) origEl.style.display = isInst ? "none" : "block";
    if (instEl) instEl.style.display = isInst ? "block" : "none";
    var bOrig = document.getElementById("btnSwitchOriginalUi");
    var bInst = document.getElementById("btnSwitchInstUi");
    if (bOrig) {
      bOrig.classList.toggle("active", !isInst);
      bOrig.setAttribute("aria-pressed", String(!isInst));
    }
    if (bInst) {
      bInst.classList.toggle("active", isInst);
      bInst.setAttribute("aria-pressed", String(isInst));
    }
    try { localStorage.setItem("rrs_ui_mode", isInst ? "institutional" : "original"); } catch(_e){}
    if (!skipHistory && window.history && window.history.replaceState) {
      var u = new URL(window.location.href);
      if (isInst) { u.searchParams.set("mode", "institutional"); u.searchParams.delete("ui"); }
      else { u.searchParams.delete("mode"); u.searchParams.delete("ui"); }
      window.history.replaceState(null, "", u.pathname + u.search + u.hash);
    }
  };

  function renderVoteCounts(d) {
    if (!d) return;
    var oEl = document.getElementById("rrsVoteOrigCnt");
    var iEl = document.getElementById("rrsVoteInstCnt");
    if (oEl && d.original != null) oEl.textContent = String(d.original);
    if (iEl && d.institutional != null) iEl.textContent = String(d.institutional);
  }

  window.rrsCastUiVote = function(choice) {
    var vid = "";
    try {
      vid = localStorage.getItem("rrs_voter_id") || ("v_" + Math.random().toString(36).slice(2) + Date.now().toString(36));
      localStorage.setItem("rrs_voter_id", vid);
    } catch(_e) { vid = "v_anon"; }
    fetch(resolveApi() + "/api/ui-vote", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({choice: choice, voter_id: vid})
    }).then(function(r){ return r.json(); }).then(function(d){
      renderVoteCounts(d);
      var btn = document.getElementById(choice === "institutional" ? "btnVoteInstUi" : "btnVoteOriginalUi");
      if (btn) {
        btn.classList.add("voted-flash");
        setTimeout(function(){ btn.classList.remove("voted-flash"); }, 900);
      }
    }).catch(function(){});
  };

  window.rrsToggleHeroPromoAudio = function() {
    var v = document.getElementById("rrsHeroPromoVideo");
    var b = document.getElementById("rrsUnmutePromoHeroBtn");
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted) { v.volume = 1.0; v.play().catch(function(){}); }
    if (b) b.innerHTML = v.muted ? "🔊 Unmute Promo Video" : "🔇 Mute Promo Video";
  };

  window.rrsDownloadTaskbarShortcut = function() {
    var shortcutTxt = "[InternetShortcut]\r\nURL=https://rentandrugshield.com/?source=taskbar\r\nIconIndex=0\r\nIconFile=https://rentandrugshield.com/favicon.ico\r\n";
    var blob = new Blob([shortcutTxt], {type: "application/octet-stream"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "Solana_Rent_Rug_Shield.url";
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 400);
  };

  window.rrsOpenTopModal = function(id, show) {
    var m = document.getElementById(id);
    if (!m) return;
    if (show) {
      m.removeAttribute("hidden");
      m.style.display = "flex";
    } else {
      m.setAttribute("hidden", "hidden");
      m.style.display = "none";
    }
  };

  window.rrsSaveToTaskbarAction = function() {
    if (deferredPwaPrompt) {
      deferredPwaPrompt.prompt();
      deferredPwaPrompt.userChoice.finally(function(){ deferredPwaPrompt = null; });
      return;
    }
    window.rrsOpenTopModal("rrsSaveTaskbarModal", true);
  };

  window.triggerRrsPwaInstall = function() {
    if (deferredPwaPrompt) {
      deferredPwaPrompt.prompt();
      deferredPwaPrompt.userChoice.finally(function(){ deferredPwaPrompt = null; });
      return;
    }
    window.rrsOpenTopModal("rrsInstallPwaModal", true);
  };

  var _rrsBoltTimer = null;
  window.rrsShowInstallBolts = function(show) {
    var el = document.getElementById("rrsLightningInstallPointers");
    if (!el) return;
    if (_rrsBoltTimer) { clearTimeout(_rrsBoltTimer); _rrsBoltTimer = null; }
    if (show) {
      el.classList.add("show");
      _rrsBoltTimer = setTimeout(function(){ el.classList.remove("show"); }, 9000);
    } else {
      el.classList.remove("show");
    }
  };

  window.rrsOpenChromeShieldModal = function(withBolts) {
    window.rrsOpenTopModal("rrsChromeShieldModal", true);
    if (withBolts) window.rrsShowInstallBolts(true);
  };

  window.rrsToggleWhyAddDropdown = function(ev, forceState) {
    if (ev && ev.stopPropagation) ev.stopPropagation();
    var p = document.getElementById("rrsWhyAddFeaturesPanel");
    var b = document.getElementById("btnWhyAddDropdown");
    if (!p) return;
    var next = (typeof forceState === "boolean") ? forceState : !p.classList.contains("open");
    p.classList.toggle("open", next);
    if (b) b.setAttribute("aria-expanded", String(next));
  };

  window.rrsOpenPromoCinemaModal = function() {
    var heroV = document.getElementById("rrsHeroPromoVideo");
    if (heroV && !heroV.paused) { try { heroV.pause(); } catch(_e){} }
    window.rrsOpenTopModal("rrsPromoCinemaModal", true);
    var cv = document.getElementById("rrsCinemaModalVideo");
    if (cv) {
      cv.currentTime = 0;
      cv.muted = false;
      cv.play().catch(function(){ cv.muted = true; cv.play().catch(function(){}); });
    }
  };

  window.rrsClosePromoCinemaModal = function() {
    var cv = document.getElementById("rrsCinemaModalVideo");
    if (cv) { try { cv.pause(); } catch(_e){} }
    window.rrsOpenTopModal("rrsPromoCinemaModal", false);
  };

  var _rrsShieldState = "secure";
  window.rrsSetShieldThreeState = function(mode, headline) {
    _rrsShieldState = (mode === "caution" || mode === "alert") ? mode : "secure";
    var badge = document.getElementById("rrsFlashingCornerShield");
    var txt = document.getElementById("rrsCornerShieldText");
    var modTitle = document.getElementById("rrsCyberSentinelTitle");
    if (!badge) return;
    badge.classList.remove("is-red-alert", "is-caution");
    if (_rrsShieldState === "alert") {
      badge.classList.add("is-red-alert");
      if (txt) txt.textContent = "🔴 Alert";
      if (modTitle) {
        modTitle.style.color = "#FF4D6D";
        modTitle.textContent = "🔴 Alert: " + (headline || "Layer-12 Drainer / Slot-0 Bundle Blocked");
      }
    } else if (_rrsShieldState === "caution") {
      badge.classList.add("is-caution");
      if (txt) txt.textContent = "🟡 Caution";
      if (modTitle) {
        modTitle.style.color = "#FDE047";
        modTitle.textContent = "🟡 Caution: " + (headline || "High Whale / Concentration Risk");
      }
    } else {
      if (txt) txt.textContent = "🟢 Secure";
      if (modTitle) {
        modTitle.style.color = "#00FF88";
        modTitle.textContent = "🟢 Secure: 12-Layer 12-Layer Security Sentinel Armed";
      }
    }
  };

  window.rrsCycleTestAlert = function() {
    var order = ["secure", "caution", "alert"];
    var nxt = order[(order.indexOf(_rrsShieldState) + 1) % order.length];
    window.rrsSetShieldThreeState(nxt, nxt === "alert" ? "Test Alert Verified | 12-Layer Shield Armed" : "Test Caution Verified");
  };

  window.rrsSetCornerShieldState = function(isRedAlert, alertHeadline) {
    window.rrsSetShieldThreeState(isRedAlert ? "alert" : "secure", alertHeadline);
  };

  function rrsClearStuckContractInputs(ev) {
    if (window.__rrsUserSetWalletInput || window.connectedWallet || window.isScanning) return;
    if (ev && !ev.persisted) return;
    var sp = new URLSearchParams(window.location.search || "");
    var hasExplicitQuery = !!(sp.get("token") || sp.get("mint") || sp.get("scan") || sp.get("wallet") || sp.get("w"));
    if (hasExplicitQuery) return;
    ["walletInput", "mintInput", "instWalletInput", "instMintInput", "w-inp", "m-inp"].forEach(function(id){
      var el = document.getElementById(id);
      if (el && el.value) el.value = "";
    });
  }
  window.addEventListener("pageshow", rrsClearStuckContractInputs);

  document.addEventListener("DOMContentLoaded", function(){
    var spInit = new URLSearchParams(window.location.search);
    var qUi = spInit.get("mode") || spInit.get("ui");
    var saved = "original";
    try { saved = localStorage.getItem("rrs_ui_mode") || "original"; } catch(_e){}
    if (qUi === "institutional" || (qUi !== "original" && saved === "institutional")) {
      window.rrsSelectUiMode("institutional", true);
    } else {
      window.rrsSelectUiMode("original", true);
    }

    fetch(resolveApi() + "/api/ui-vote").then(function(r){ return r.json(); }).then(renderVoteCounts).catch(function(){});
    fetch(resolveApi() + "/api/cyber-threat-feed").then(function(r){ return r.json(); }).then(function(d){
      if (d && d.active_threat) {
        window.rrsSetCornerShieldState(true, d.active_threat.title);
      }
    }).catch(function(){});

    rrsClearStuckContractInputs();
    if (window.location.search.indexOf("ext_installed=1") !== -1) { window.rrsShowInstallBolts(true); }
    if (window.location.search.indexOf("cyber_inspect=1") !== -1) {
      window.rrsSetCornerShieldState(true, "Threat Advisory Inspection Mode");
      window.rrsOpenTopModal("rrsCyberSentinelModal", true);
    }
  });
})();
