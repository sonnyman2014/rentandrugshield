(function() {
  var SW_VER = "25772";
  var EXPECTED_CACHE = "rent-shield-v25772-live-rpc";
  var ACTIVE_TUNNEL = "";
  try {
    for (var sIdx = 0; sIdx < 2; sIdx++) {
      var st = sIdx === 0 ? window.localStorage : window.sessionStorage;
      if (!st) continue;
      for (var kIdx = st.length - 1; kIdx >= 0; kIdx--) {
        var k = st.key(kIdx);
        if (!k) continue;
        var v = String(st.getItem(k) || "");
        if (v.indexOf(".trycloudflare.com") !== -1 && v.indexOf(ACTIVE_TUNNEL) === -1) {
          st.removeItem(k);
        }
      }
    }
  } catch (_se) {}
  try {
    if ("caches" in window && caches.keys) {
      caches.keys().then(function(names) {
        names.forEach(function(n) {
          if (n !== EXPECTED_CACHE) caches.delete(n).catch(function() {});
        });
      }).catch(function() {});
    }
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function() {
        navigator.serviceWorker.register("/sw.js?v=" + SW_VER, { updateViaCache: "none" }).then(function(reg) {
          if (reg && reg.waiting) {
            try { reg.waiting.postMessage({ type: "SKIP_WAITING" }); } catch (_we) {}
          }
          if (reg && reg.update) reg.update().catch(function() {});
        }).catch(function() {});
      });
    }
  } catch (_swe) {}
})();
