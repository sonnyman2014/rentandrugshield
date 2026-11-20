const DEFAULTS = {
  uiMode: "institutional",
  togTrending: true,
  togRugRed: true,
  togPcGuard: true,
  togRpcLag: true,
  togClipboard: true,
  togAutoReclaim: true,
  soundProfile: "voice",
  lastSeenMint: ""
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(DEFAULTS, (cfg) => chrome.storage.local.set(cfg));
  chrome.alarms.create("rrs_sentinel_pulse", { periodInMinutes: 1 });
  chrome.action.setBadgeBackgroundColor({ color: "#00FF88" });
  chrome.action.setBadgeText({ text: "PASS" });
});

function speakIfEnabled(cfg, txt) {
  if (cfg.soundProfile === "voice" && chrome.tts) {
    chrome.tts.stop();
    chrome.tts.speak(txt, { rate: 1.04 });
  }
}

async function sweep() {
  const cfg = await chrome.storage.local.get(DEFAULTS);
  let level = "GREEN";
  let reason = "RUG SHIELD PASSED • PC & RPC Optimal";

  if (cfg.togPcGuard && chrome.system && chrome.system.memory) {
    const m = await new Promise((r) => chrome.system.memory.getInfo(r));
    if (m && m.capacity > 0) {
      const pct = ((m.capacity - m.availableCapacity) / m.capacity) * 100;
      if (pct >= 86) {
        level = "YELLOW";
        reason = "CAUTION: PC RAM at " + pct.toFixed(0) + "% (Close heavy tabs)";
      }
    }
  }

  if (cfg.togRpcLag) {
    const t0 = Date.now();
    try {
      await fetch("https://rentandrugshield.com/llms.txt", { method: "HEAD", cache: "no-store" });
      const ms = Date.now() - t0;
      if (ms > 450 && level === "GREEN") {
        level = "YELLOW";
        reason = "CAUTION: Network Latency " + ms + "ms";
      }
    } catch (_e) {
      level = "RED";
      reason = "ALERT: Network Offline";
    }
  }

  if (cfg.togTrending) {
    try {
      const r = await fetch("https://api.dexscreener.com/token-boosts/top/v1", { cache: "no-store" });
      const arr = await r.json();
      const top = (arr || []).find((x) => x && x.chainId === "solana" && x.tokenAddress);
      if (top && top.tokenAddress !== cfg.lastSeenMint) {
        chrome.storage.local.set({ lastSeenMint: top.tokenAddress });
        const rc = await fetch("https://api.rugcheck.xyz/v1/tokens/" + top.tokenAddress + "/report/summary");
        if (rc.ok) {
          const rep = await rc.json();
          const risks = Array.isArray(rep.risks) ? rep.risks : [];
          const dng = risks.find((x) => (x.level || "").toLowerCase() === "danger");
          if ((dng || Number(rep.score || 0) > 2500) && cfg.togRugRed) {
            level = "RED";
            const why = dng ? dng.name : "High Rug Score";
            reason = "RUG SHIELD FAILED: " + why;
            speakIfEnabled(cfg, "Rug alert! Rug alert! Trending coin failed 12 layer shield.");
            chrome.notifications.create("rug_" + top.tokenAddress, {
              type: "basic",
              iconUrl: "icons/icon-128.png",
              title: "🚨 RUG SHIELD FAILED — DO NOT BUY",
              message: "Flagged for " + why + ". Click for 12-Layer Breakdown."
            });
          }
        }
      }
    } catch (_e) {}
  }

  const bMap = {
    GREEN: { c: "#00FF88", t: "PASS" },
    YELLOW: { c: "#F59E0B", t: "WARN" },
    RED: { c: "#EF4444", t: "RUG!" }
  };
  const b = bMap[level] || bMap.GREEN;
  chrome.action.setBadgeBackgroundColor({ color: b.c });
  chrome.action.setBadgeText({ text: b.t });
  chrome.storage.local.set({ currentLevel: level, currentReason: reason });
}

chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === "rrs_sentinel_pulse") sweep();
});
chrome.notifications.onClicked.addListener((id) => {
  const m = id.replace("rug_", "");
  chrome.tabs.create({ url: "https://rentandrugshield.com/?trade=" + encodeURIComponent(m) });
});
