(function(){
  // 1) Ensure Wallet Scanned Clean modal NEVER auto-pops on F5 / load / bfcache restore
  window.addEventListener("pageshow", function(){
    window.__explicitUserWalletScan = false;
    if (typeof window.closeScanBubble === "function") window.closeScanBubble();
  });
  window.addEventListener("DOMContentLoaded", function(){
    window.__explicitUserWalletScan = false;
    if (typeof window.closeScanBubble === "function") window.closeScanBubble();

    // 2) 25-Second Smart Scroll Engagement Popup (fires once per session after scroll)
    var userScrolled = false;
    window.addEventListener("scroll", function(){ userScrolled = true; }, { passive: true });
    /* v315: disabled 25s auto-open toast; opens strictly on explicit user click */
  });
})();
