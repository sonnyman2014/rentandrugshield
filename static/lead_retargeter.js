(function () {
  "use strict";

  if (window.__RS_LEAD_RETARGETER_LOADED__) {
    return;
  }
  window.__RS_LEAD_RETARGETER_LOADED__ = true;

  var STORAGE_LEAD_KEY = "rs_unclaimed_sol_lead_v1";
  var STORAGE_OPTIN_KEY = "rs_scan_receipt_optin_v1";
  var STORAGE_CONTACT_KEY = "rs_scan_receipt_contact_v1";
  var MIN_UNCLAIMED_SOL = 0.002;
  var IDLE_BUBBLE_DELAY_MS = 9500;
  var DEFAULT_SOL_USD = 74.0;

  var SAMPLE_OR_INTERNAL_WALLETS = {
    "89Sv5FvnMNRid1bn8y2Ti1vJPSxWxgiW9GSLsPpBnKK1": true,
    "Cw3wqSkRPh3Z9hJoiPQtn9nRHiK4Xa9XJZsEr8cRkmHY": true,
    "C3FFhG83pda2veVRFwTDNyf1YT2R2U2ZHxcg8pUeMjrC": true,
    "76j2PCaXDeVD2CkEVDrnJCa5zYETmDYcgZv4gjtFEpov": true,
    "6dZpwsrf3QKWx5eWxYaYQ4FXkENWs4rmSMBQrPHqNyGB": true,
    "HYDkdn659rbz6Fu88dsNiLqn6sMyZvhhgGTfw917TXYN": true,
    "DEMO_WALLET_PREVIEW_ONLY": true
  };

  var BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  var lastCaptureSig = "";
  var lastCaptureAtMs = 0;
  var idleBubbleTimer = null;
  var sampleScanGuardUntil = 0;
  var selectedReceiptChannel = "telegram";
  var bubbleDismissedInView = false;

  function nowEpochSec() {
    return Math.floor(Date.now() / 1000);
  }

  function isValidSolanaAddress(addr) {
    if (typeof addr !== "string") {
      return false;
    }
    var trimmed = addr.trim();
    return BASE58_RE.test(trimmed);
  }

  function isSampleOrInternalWallet(addr) {
    if (!addr) {
      return true;
    }
    var clean = String(addr).trim();
    if (SAMPLE_OR_INTERNAL_WALLETS[clean]) {
      var prov = getPhantomOrSolanaProvider();
      var provPk = prov && prov.publicKey ? String(prov.publicKey.toString()) : "";
      if (provPk && provPk === clean) {
        return false;
      }
      return true;
    }
    if (Date.now() < sampleScanGuardUntil) {
      return true;
    }
    return false;
  }

  function shortWallet(addr) {
    var clean = String(addr || "").trim();
    if (clean.length < 10) {
      return clean;
    }
    return clean.slice(0, 4) + ".." + clean.slice(-4);
  }

  function currentSolPriceUsd(scanObj) {
    if (scanObj && Number(scanObj.sol_usd) > 5) {
      return Number(scanObj.sol_usd);
    }
    if (window.lastScanData && Number(window.lastScanData.sol_usd) > 5) {
      return Number(window.lastScanData.sol_usd);
    }
    if (window.lastScanResult && Number(window.lastScanResult.sol_usd) > 5) {
      return Number(window.lastScanResult.sol_usd);
    }
    return DEFAULT_SOL_USD;
  }

  function safeReadStorageJson(key) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) {
        return null;
      }
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (_err) {
      return null;
    }
  }

  function safeWriteStorageJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_err) {
      return false;
    }
  }

  function getPhantomOrSolanaProvider() {
    try {
      if (window.phantom && window.phantom.solana) {
        return window.phantom.solana;
      }
      if (window.solana && (window.solana.isPhantom || typeof window.solana.connect === "function")) {
        return window.solana;
      }
      if (window.solflare && typeof window.solflare.connect === "function") {
        return window.solflare;
      }
    } catch (_err) {}
    return null;
  }

  function getPrimaryWalletInput() {
    return document.getElementById("w-inp") || document.getElementById("walletInput");
  }

  function sendLeadCaptureToBackend(wallet, claimableSol, emptyAtas, usdValue, source, isSigned, txSig) {
    var cleanWallet = String(wallet || "").trim();
    if (!isValidSolanaAddress(cleanWallet)) {
      return;
    }
    if (!isSigned && isSampleOrInternalWallet(cleanWallet)) {
      return;
    }

    var solNum = Math.max(0, Number(claimableSol || 0));
    var ataNum = Math.max(0, Math.round(Number(emptyAtas || 0)));
    var usdNum = Math.max(0, Number(usdValue != null ? usdValue : solNum * currentSolPriceUsd(null)));
    var sigKey = [cleanWallet, solNum.toFixed(6), String(ataNum), isSigned ? "1" : "0"].join("|");
    var nowMs = Date.now();

    if (sigKey === lastCaptureSig && nowMs - lastCaptureAtMs < 2000) {
      return;
    }
    lastCaptureSig = sigKey;
    lastCaptureAtMs = nowMs;

    var payload = {
      wallet: cleanWallet,
      claimable_sol: Number(solNum.toFixed(6)),
      empty_atas: ataNum,
      usd_value: Number(usdNum.toFixed(2)),
      ts: nowEpochSec(),
      source: String(source || "web"),
      signed: Boolean(isSigned),
      tx_sig: String(txSig || "")
    };

    try {
      fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function () {});
    } catch (_err) {}
  }

  function persistUnclaimedLead(wallet, claimableSol, usdValue, emptyAtas) {
    var cleanWallet = String(wallet || "").trim();
    if (!isValidSolanaAddress(cleanWallet) || isSampleOrInternalWallet(cleanWallet)) {
      return null;
    }
    var solNum = Number(Number(claimableSol || 0).toFixed(6));
    var ataNum = Math.max(0, Math.round(Number(emptyAtas || 0)));
    var usdNum = Number(Number(usdValue != null ? usdValue : solNum * currentSolPriceUsd(null)).toFixed(2));

    var existing = safeReadStorageJson(STORAGE_LEAD_KEY);
    if (solNum <= MIN_UNCLAIMED_SOL) {
      if (existing && existing.wallet === cleanWallet && !existing.signed) {
        markLeadSigned(cleanWallet, "");
      }
      return null;
    }

    var record = {
      wallet: cleanWallet,
      claimable_sol: solNum,
      usd_value: usdNum,
      empty_atas: ataNum,
      ts: nowEpochSec(),
      signed: false
    };
    safeWriteStorageJson(STORAGE_LEAD_KEY, record);
    bubbleDismissedInView = false;
    renderScanReceiptOptinBar(record);
    scheduleIdleReturnBubble(record);
    return record;
  }

  function markLeadSigned(wallet, txSig) {
    var existing = safeReadStorageJson(STORAGE_LEAD_KEY);
    var targetWallet = String(wallet || (existing && existing.wallet) || "").trim();
    if (existing && (!targetWallet || existing.wallet === targetWallet)) {
      var updated = {
        wallet: existing.wallet,
        claimable_sol: 0,
        usd_value: 0,
        empty_atas: 0,
        ts: nowEpochSec(),
        signed: true
      };
      if (txSig) {
        updated.tx_sig = String(txSig);
      }
      safeWriteStorageJson(STORAGE_LEAD_KEY, updated);
    }
    if (idleBubbleTimer) {
      clearTimeout(idleBubbleTimer);
      idleBubbleTimer = null;
    }
    hideReturnReminderBubble();
    hideScanReceiptOptinBar();
    if (isValidSolanaAddress(targetWallet)) {
      sendLeadCaptureToBackend(targetWallet, 0, 0, 0, "reclaim_signed", true, txSig || "");
    }
  }

  function injectStylesOnce() {
    if (document.getElementById("rs-lead-retargeter-styles")) {
      return;
    }
    var styleEl = document.createElement("style");
    styleEl.id = "rs-lead-retargeter-styles";
    styleEl.textContent = [
      "#rsScanReceiptOptinPanel {",
      "  margin: 10px 0;",
      "  padding: 11px 13px;",
      "  border-radius: 11px;",
      "  background: linear-gradient(135deg, rgba(6, 24, 44, 0.96) 0%, rgba(4, 12, 24, 0.98) 100%);",
      "  border: 1px solid rgba(20, 241, 149, 0.45);",
      "  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.55);",
      "  color: #f1f5f9;",
      "  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;",
      "}",
      "#rsScanReceiptOptinPanel .rs-ro-top {",
      "  display: flex;",
      "  align-items: center;",
      "  justify-content: space-between;",
      "  gap: 8px;",
      "  margin-bottom: 8px;",
      "}",
      "#rsScanReceiptOptinPanel .rs-ro-title {",
      "  font-size: 12.5px;",
      "  font-weight: 800;",
      "  color: #ecfdf5;",
      "  letter-spacing: 0.01em;",
      "}",
      "#rsScanReceiptOptinPanel .rs-ro-close {",
      "  background: transparent;",
      "  border: none;",
      "  color: #94a3b8;",
      "  font-size: 15px;",
      "  line-height: 1;",
      "  cursor: pointer;",
      "  padding: 2px 5px;",
      "}",
      "#rsScanReceiptOptinPanel .rs-ro-actions {",
      "  display: flex;",
      "  flex-wrap: wrap;",
      "  gap: 7px;",
      "  align-items: center;",
      "}",
      "#rsScanReceiptOptinPanel .rs-ro-btn {",
      "  padding: 6px 11px;",
      "  border-radius: 8px;",
      "  border: 1px solid rgba(56, 189, 248, 0.45);",
      "  background: rgba(15, 23, 42, 0.9);",
      "  color: #e2e8f0;",
      "  font-size: 11.5px;",
      "  font-weight: 800;",
      "  cursor: pointer;",
      "  transition: border-color 0.15s ease, background 0.15s ease;",
      "}",
      "#rsScanReceiptOptinPanel .rs-ro-btn:hover {",
      "  border-color: #14f195;",
      "  background: rgba(20, 241, 149, 0.14);",
      "  color: #ffffff;",
      "}",
      "#rsScanReceiptOptinPanel .rs-ro-btn-push {",
      "  border-color: #14f195;",
      "  background: linear-gradient(90deg, rgba(5, 150, 105, 0.36), rgba(20, 241, 149, 0.22));",
      "  color: #ecfdf5;",
      "}",
      "#rsScanReceiptOptinPanel .rs-ro-form {",
      "  display: none;",
      "  margin-top: 8px;",
      "  gap: 6px;",
      "  align-items: center;",
      "  flex-wrap: wrap;",
      "}",
      "#rsScanReceiptOptinPanel .rs-ro-inp {",
      "  flex: 1;",
      "  min-width: 170px;",
      "  padding: 6px 10px;",
      "  border-radius: 7px;",
      "  border: 1px solid rgba(56, 189, 248, 0.5);",
      "  background: #020814;",
      "  color: #f8fafc;",
      "  font-size: 12px;",
      "}",
      "#rsScanReceiptOptinPanel .rs-ro-submit {",
      "  padding: 6px 12px;",
      "  border-radius: 7px;",
      "  border: 1px solid #14f195;",
      "  background: #10b981;",
      "  color: #022c22;",
      "  font-size: 11.5px;",
      "  font-weight: 900;",
      "  cursor: pointer;",
      "}",
      "#rsScanReceiptOptinPanel .rs-ro-status {",
      "  display: none;",
      "  margin-top: 6px;",
      "  font-size: 11.5px;",
      "  font-weight: 700;",
      "  color: #14f195;",
      "}",
      "#rsReturnReminderBubble {",
      "  position: fixed;",
      "  right: 18px;",
      "  bottom: 18px;",
      "  z-index: 100045;",
      "  max-width: min(440px, calc(100vw - 24px));",
      "  padding: 11px 13px;",
      "  border-radius: 12px;",
      "  background: linear-gradient(145deg, rgba(6, 17, 34, 0.97) 0%, rgba(3, 9, 20, 0.99) 100%);",
      "  border: 1px solid rgba(20, 241, 149, 0.62);",
      "  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.88), 0 0 20px rgba(20, 241, 149, 0.2);",
      "  backdrop-filter: blur(12px);",
      "  -webkit-backdrop-filter: blur(12px);",
      "  color: #f8fafc;",
      "  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;",
      "  display: none;",
      "  align-items: center;",
      "  gap: 10px;",
      "}",
      "#rsReturnReminderBubble.rs-has-tabbar {",
      "  bottom: 80px;",
      "  right: 12px;",
      "}",
      "#rsReturnReminderBubble .rs-rb-copy {",
      "  font-size: 12px;",
      "  line-height: 1.4;",
      "  color: #e2e8f0;",
      "  font-weight: 600;",
      "  flex: 1;",
      "}",
      "#rsReturnReminderBubble .rs-rb-copy strong {",
      "  color: #14f195;",
      "  font-weight: 800;",
      "}",
      "#rsReturnReminderBubble .rs-rb-cta {",
      "  white-space: nowrap;",
      "  padding: 7px 12px;",
      "  border-radius: 8px;",
      "  border: 1px solid #6ee7b7;",
      "  background: linear-gradient(90deg, #10b981 0%, #14f195 100%);",
      "  color: #022c22;",
      "  font-size: 11.5px;",
      "  font-weight: 900;",
      "  cursor: pointer;",
      "  box-shadow: 0 0 14px rgba(20, 241, 149, 0.35);",
      "}",
      "#rsReturnReminderBubble .rs-rb-cta:hover {",
      "  filter: brightness(1.06);",
      "}",
      "#rsReturnReminderBubble .rs-rb-dismiss {",
      "  background: transparent;",
      "  border: none;",
      "  color: #64748b;",
      "  font-size: 14px;",
      "  line-height: 1;",
      "  cursor: pointer;",
      "  padding: 2px 4px;",
      "  align-self: flex-start;",
      "}",
      "@media (max-width: 540px) {",
      "  #rsReturnReminderBubble {",
      "    left: 12px;",
      "    right: 12px;",
      "    max-width: calc(100vw - 24px);",
      "    flex-wrap: wrap;",
      "  }",
      "  #rsReturnReminderBubble .rs-rb-cta {",
      "    width: 100%;",
      "    text-align: center;",
      "  }",
      "}"
    ].join("\n");
    (document.head || document.documentElement).appendChild(styleEl);
  }

  function submitReceiptOptin(lead, channel, targetValue, pushPerm, statusEl) {
    var payload = {
      wallet: lead.wallet,
      channel: channel,
      target: targetValue,
      claimable_sol: lead.claimable_sol,
      usd_value: lead.usd_value,
      empty_atas: lead.empty_atas,
      push_permission: pushPerm || "",
      ts: nowEpochSec()
    };

    safeWriteStorageJson(STORAGE_OPTIN_KEY, {
      wallet: lead.wallet,
      channel: channel,
      target: targetValue,
      ts: payload.ts
    });
    if (targetValue && targetValue !== "browser_push") {
      try {
        window.localStorage.setItem(STORAGE_CONTACT_KEY, targetValue);
      } catch (_err) {}
    }

    if (statusEl) {
      statusEl.style.display = "block";
      statusEl.style.color = "#14f195";
      statusEl.textContent = "Scan receipt saved (" + channel.replace("_", " ") + ") for Wallet [" + shortWallet(lead.wallet) + "].";
    }

    try {
      fetch("/api/scan-receipt-optin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function () {});
    } catch (_err) {}
  }

  function handleWebPushOptinClick(lead, statusEl) {
    if (!("Notification" in window) || typeof window.Notification.requestPermission !== "function") {
      submitReceiptOptin(lead, "web_push", "browser_push_fallback", "unsupported", statusEl);
      return;
    }
    try {
      var permPromise = window.Notification.requestPermission();
      if (permPromise && typeof permPromise.then === "function") {
        permPromise.then(function (perm) {
          submitReceiptOptin(lead, "web_push", "browser_push", String(perm || "default"), statusEl);
          if (perm === "granted") {
            try {
              var nTitle = "SOL Rent Shield Scan Receipt";
              var nBody = "Wallet [" + shortWallet(lead.wallet) + "] has +" + Number(lead.claimable_sol).toFixed(3) + " SOL ($" + Number(lead.usd_value).toFixed(2) + ") ready to reclaim.";
              new window.Notification(nTitle, { body: nBody, icon: "/favicon.png" });
            } catch (_nErr) {}
          }
        }).catch(function () {
          submitReceiptOptin(lead, "web_push", "browser_push", "dismissed", statusEl);
        });
      } else {
        submitReceiptOptin(lead, "web_push", "browser_push", String(window.Notification.permission || "default"), statusEl);
      }
    } catch (_err) {
      submitReceiptOptin(lead, "web_push", "browser_push", "error", statusEl);
    }
  }

  function renderScanReceiptOptinBar(lead) {
    if (!lead || lead.signed || Number(lead.claimable_sol || 0) <= MIN_UNCLAIMED_SOL) {
      hideScanReceiptOptinBar();
      return;
    }
    if (!document.body) {
      return;
    }
    injectStylesOnce();

    var panel = document.getElementById("rsScanReceiptOptinPanel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "rsScanReceiptOptinPanel";

      var anchorApp = document.getElementById("emerald-claim-card");
      var anchorIdx = document.getElementById("indexEmeraldFoundCard") || document.getElementById("scanFinishedTopBanner");
      var resultsWrap = document.getElementById("walletResults");

      if (anchorApp && anchorApp.parentNode) {
        anchorApp.parentNode.insertBefore(panel, anchorApp.nextSibling);
      } else if (anchorIdx && anchorIdx.parentNode) {
        anchorIdx.parentNode.insertBefore(panel, anchorIdx.nextSibling);
      } else if (resultsWrap) {
        resultsWrap.insertBefore(panel, resultsWrap.firstChild);
      } else {
        document.body.appendChild(panel);
      }
    }

    var savedContact = "";
    try {
      savedContact = window.localStorage.getItem(STORAGE_CONTACT_KEY) || "";
    } catch (_err) {}

    var solTxt = "+" + Number(lead.claimable_sol).toFixed(3) + " SOL";
    var usdTxt = "$" + Number(lead.usd_value).toFixed(2);
    var wShort = shortWallet(lead.wallet);

    panel.innerHTML = "";
    panel.style.display = "block";

    var topRow = document.createElement("div");
    topRow.className = "rs-ro-top";

    var titleSpan = document.createElement("span");
    titleSpan.className = "rs-ro-title";
    titleSpan.textContent = "1-Click Scan Receipt: Keep your " + solTxt + " (" + usdTxt + ") audit for Wallet [" + wShort + "]";

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "rs-ro-close";
    closeBtn.setAttribute("aria-label", "Close scan receipt bar");
    closeBtn.textContent = "x";
    closeBtn.onclick = function () {
      panel.style.display = "none";
    };

    topRow.appendChild(titleSpan);
    topRow.appendChild(closeBtn);

    var actionsRow = document.createElement("div");
    actionsRow.className = "rs-ro-actions";

    var pushBtn = document.createElement("button");
    pushBtn.type = "button";
    pushBtn.className = "rs-ro-btn rs-ro-btn-push";
    pushBtn.textContent = "Browser Web Push Receipt";

    var tgBtn = document.createElement("button");
    tgBtn.type = "button";
    tgBtn.className = "rs-ro-btn";
    tgBtn.textContent = "Telegram Receipt";

    var emailBtn = document.createElement("button");
    emailBtn.type = "button";
    emailBtn.className = "rs-ro-btn";
    emailBtn.textContent = "Email Receipt";

    actionsRow.appendChild(pushBtn);
    actionsRow.appendChild(tgBtn);
    actionsRow.appendChild(emailBtn);

    var formRow = document.createElement("div");
    formRow.className = "rs-ro-form";

    var contactInp = document.createElement("input");
    contactInp.type = "text";
    contactInp.className = "rs-ro-inp";
    contactInp.autocomplete = "off";
    contactInp.spellcheck = false;
    contactInp.value = savedContact;
    contactInp.placeholder = "@your_telegram_handle";

    var sendBtn = document.createElement("button");
    sendBtn.type = "button";
    sendBtn.className = "rs-ro-submit";
    sendBtn.textContent = "Save Receipt";

    formRow.appendChild(contactInp);
    formRow.appendChild(sendBtn);

    var statusDiv = document.createElement("div");
    statusDiv.className = "rs-ro-status";

    pushBtn.onclick = function () {
      formRow.style.display = "none";
      handleWebPushOptinClick(lead, statusDiv);
    };

    tgBtn.onclick = function () {
      selectedReceiptChannel = "telegram";
      formRow.style.display = "flex";
      contactInp.placeholder = "@your_telegram_handle";
      contactInp.focus();
    };

    emailBtn.onclick = function () {
      selectedReceiptChannel = "email";
      formRow.style.display = "flex";
      contactInp.placeholder = "you@domain.com";
      contactInp.focus();
    };

    sendBtn.onclick = function () {
      var val = (contactInp.value || "").trim();
      if (!val) {
        statusDiv.style.display = "block";
        statusDiv.style.color = "#fde047";
        statusDiv.textContent = selectedReceiptChannel === "email"
          ? "Enter your email address to save this scan receipt."
          : "Enter your @Telegram handle to save this scan receipt.";
        contactInp.focus();
        return;
      }
      submitReceiptOptin(lead, selectedReceiptChannel, val, "", statusDiv);
      formRow.style.display = "none";
    };

    contactInp.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") {
        ev.preventDefault();
        sendBtn.click();
      }
    });

    panel.appendChild(topRow);
    panel.appendChild(actionsRow);
    panel.appendChild(formRow);
    panel.appendChild(statusDiv);
  }

  function hideScanReceiptOptinBar() {
    var panel = document.getElementById("rsScanReceiptOptinPanel");
    if (panel) {
      panel.style.display = "none";
    }
  }

  async function triggerReclaimFromBubble(lead) {
    if (!lead || !isValidSolanaAddress(lead.wallet)) {
      return;
    }
    var w = lead.wallet;
    var wInpApp = document.getElementById("w-inp");
    var wInpIdx = document.getElementById("walletInput");

    if (wInpApp) {
      wInpApp.value = w;
    }
    if (wInpIdx) {
      wInpIdx.value = w;
    }

    var prov = getPhantomOrSolanaProvider();
    if (prov && typeof prov.connect === "function" && !prov.publicKey) {
      try {
        var cRes = await prov.connect({ onlyIfTrusted: false });
        var connPk = cRes && cRes.publicKey ? String(cRes.publicKey.toString()) : "";
        if (isValidSolanaAddress(connPk)) {
          w = connPk;
          if (wInpApp) {
            wInpApp.value = connPk;
          }
          if (wInpIdx) {
            wInpIdx.value = connPk;
          }
          try {
            window.connectedWallet = connPk;
            window.connectedWalletPubkey = connPk;
          } catch (_err) {}
        }
      } catch (_connErr) {}
    }

    var cardTarget = document.getElementById("rentShieldCard") || wInpApp || wInpIdx;
    if (cardTarget && typeof cardTarget.scrollIntoView === "function") {
      try {
        cardTarget.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (_sErr) {}
    }

    if (typeof window.executeClaimOrDeepLink === "function" && wInpApp) {
      if (!window.lastScanResult || window.lastScanResult.wallet !== w) {
        if (typeof window.runWalletScan === "function") {
          await window.runWalletScan("rent", false);
        }
      }
      await window.executeClaimOrDeepLink("all");
      return;
    }

    if (typeof window.reclaimSolNow === "function") {
      await window.reclaimSolNow("all");
      return;
    }

    if (typeof window.executeDirectRefund95 === "function") {
      await window.executeDirectRefund95("all");
      return;
    }

    if (typeof window.scanWallet === "function") {
      await window.scanWallet(w, "rent");
    }
  }

  function renderReturnReminderBubble(lead) {
    if (!lead || lead.signed || Number(lead.claimable_sol || 0) <= MIN_UNCLAIMED_SOL) {
      hideReturnReminderBubble();
      return;
    }
    if (bubbleDismissedInView || !document.body) {
      return;
    }

    injectStylesOnce();

    var bubble = document.getElementById("rsReturnReminderBubble");
    if (!bubble) {
      bubble = document.createElement("div");
      bubble.id = "rsReturnReminderBubble";
      bubble.setAttribute("role", "region");
      bubble.setAttribute("aria-label", "Unclaimed SOL reminder");
      document.body.appendChild(bubble);
    }

    if (document.querySelector(".native-tabbar")) {
      bubble.classList.add("rs-has-tabbar");
    } else {
      bubble.classList.remove("rs-has-tabbar");
    }

    var wShort = shortWallet(lead.wallet);
    var solFormatted = Number(lead.claimable_sol).toFixed(3);
    var usdFormatted = Number(lead.usd_value != null ? lead.usd_value : lead.claimable_sol * currentSolPriceUsd(null)).toFixed(2);

    bubble.innerHTML = "";

    var copyDiv = document.createElement("div");
    copyDiv.className = "rs-rb-copy";
    copyDiv.textContent = "Wallet [" + wShort + "] still has +" + solFormatted + " SOL ($" + usdFormatted + ") waiting to reclaim (0% first-claim fee) -> ";

    var ctaBtn = document.createElement("button");
    ctaBtn.type = "button";
    ctaBtn.className = "rs-rb-cta";
    ctaBtn.id = "rsReturnReclaimNowBtn";
    ctaBtn.textContent = "Reclaim Now";
    ctaBtn.onclick = function () {
      triggerReclaimFromBubble(lead);
    };

    var dismissBtn = document.createElement("button");
    dismissBtn.type = "button";
    dismissBtn.className = "rs-rb-dismiss";
    dismissBtn.setAttribute("aria-label", "Dismiss reminder");
    dismissBtn.textContent = "x";
    dismissBtn.onclick = function () {
      bubbleDismissedInView = true;
      hideReturnReminderBubble();
    };

    bubble.appendChild(copyDiv);
    bubble.appendChild(ctaBtn);
    bubble.appendChild(dismissBtn);
    bubble.style.display = "flex";
  }

  function hideReturnReminderBubble() {
    var bubble = document.getElementById("rsReturnReminderBubble");
    if (bubble) {
      bubble.style.display = "none";
    }
  }

  function scheduleIdleReturnBubble(lead) {
    if (idleBubbleTimer) {
      clearTimeout(idleBubbleTimer);
      idleBubbleTimer = null;
    }
    if (!lead || lead.signed || Number(lead.claimable_sol || 0) <= MIN_UNCLAIMED_SOL) {
      return;
    }
    idleBubbleTimer = setTimeout(function () {
      var latest = safeReadStorageJson(STORAGE_LEAD_KEY);
      if (latest && !latest.signed && Number(latest.claimable_sol || 0) > MIN_UNCLAIMED_SOL) {
        renderReturnReminderBubble(latest);
      }
    }, IDLE_BUBBLE_DELAY_MS);
  }

  function handleCalculatedScanObject(scanObj, explicitWallet, isSampleFlag) {
    if (!scanObj || typeof scanObj !== "object") {
      return;
    }
    if (isSampleFlag) {
      return;
    }
    var inp = getPrimaryWalletInput();
    var w = String(scanObj.wallet || explicitWallet || (inp && inp.value) || "").trim();
    if (!isValidSolanaAddress(w) || isSampleOrInternalWallet(w)) {
      return;
    }

    var emptyCnt = Number(scanObj.empty_count != null ? scanObj.empty_count : (scanObj.empty_atas != null ? scanObj.empty_atas : 0));
    var recCnt = Number(scanObj.reclaimable_count != null ? scanObj.reclaimable_count : emptyCnt);
    var ataCount = Math.max(emptyCnt, recCnt, 0);
    var solPx = currentSolPriceUsd(scanObj);
    var claimSol = Number(
      scanObj.total_reclaimable_sol != null
        ? scanObj.total_reclaimable_sol
        : (scanObj.claimable_sol != null ? scanObj.claimable_sol : (scanObj.total_sol || 0))
    );
    var usdVal = Number(
      scanObj.total_reclaimable_usd != null && Number(scanObj.total_reclaimable_usd) > 0
        ? scanObj.total_reclaimable_usd
        : claimSol * solPx
    );

    sendLeadCaptureToBackend(w, claimSol, ataCount, usdVal, "scan_complete", false, "");
    persistUnclaimedLead(w, claimSol, usdVal, ataCount);
  }

  function silentCheckTrustedPhantom() {
    try {
      var silentPromise = window.phantom?.solana?.connect({ onlyIfTrusted: true });
      if (silentPromise && typeof silentPromise.then === "function") {
        silentPromise.then(function (resp) {
          var pk = resp && resp.publicKey ? String(resp.publicKey.toString()) : "";
          if (isValidSolanaAddress(pk)) {
            sendLeadCaptureToBackend(pk, 0, 0, 0, "phantom_trusted_load", false, "");
          }
        }).catch(function () {});
      }
    } catch (_err) {}

    var prov = getPhantomOrSolanaProvider();
    if (prov && typeof prov.on === "function" && !prov.__rsLeadListenersBound) {
      try {
        prov.__rsLeadListenersBound = true;
        prov.on("connect", function (pubKey) {
          var pkStr = pubKey ? String(pubKey.toString()) : (prov.publicKey ? String(prov.publicKey.toString()) : "");
          if (isValidSolanaAddress(pkStr)) {
            sendLeadCaptureToBackend(pkStr, 0, 0, 0, "phantom_connect", false, "");
          }
        });
        prov.on("accountChanged", function (pubKey) {
          var pkStr = pubKey ? String(pubKey.toString()) : "";
          if (isValidSolanaAddress(pkStr)) {
            sendLeadCaptureToBackend(pkStr, 0, 0, 0, "phantom_account_changed", false, "");
          }
        });
      } catch (_evErr) {}
    }
  }

  function bindInputAndPageHooks() {
    var inputIds = ["walletInput", "w-inp", "modalWalletPaste"];
    for (var i = 0; i < inputIds.length; i += 1) {
      (function (elId) {
        var inp = document.getElementById(elId);
        if (!inp || inp.__rsLeadBound) {
          return;
        }
        inp.__rsLeadBound = true;
        inp.addEventListener("paste", function () {
          setTimeout(function () {
            var val = (inp.value || "").trim();
            if (isValidSolanaAddress(val) && !isSampleOrInternalWallet(val)) {
              sendLeadCaptureToBackend(val, 0, 0, 0, "wallet_paste", false, "");
            }
          }, 30);
        });
        inp.addEventListener("change", function () {
          var val = (inp.value || "").trim();
          if (isValidSolanaAddress(val) && !isSampleOrInternalWallet(val)) {
            sendLeadCaptureToBackend(val, 0, 0, 0, "wallet_input", false, "");
          }
        });
      })(inputIds[i]);
    }

    var sampleBtns = ["testVerifiedSampleWalletBtn", "test-verified-wallet-btn"];
    for (var b = 0; b < sampleBtns.length; b += 1) {
      var sBtn = document.getElementById(sampleBtns[b]);
      if (sBtn && !sBtn.__rsSampleGuardBound) {
        sBtn.__rsSampleGuardBound = true;
        sBtn.addEventListener("click", function () {
          sampleScanGuardUntil = Date.now() + 6000;
        }, true);
      }
    }

    if (typeof window.testIndexVerifiedWallet === "function" && !window.testIndexVerifiedWallet.__rsWrapped) {
      var origTestIdx = window.testIndexVerifiedWallet;
      var wrappedTestIdx = async function () {
        sampleScanGuardUntil = Date.now() + 6000;
        return origTestIdx.apply(this, arguments);
      };
      wrappedTestIdx.__rsWrapped = true;
      window.testIndexVerifiedWallet = wrappedTestIdx;
    }

    if (typeof window.testRealVerifiedWallet === "function" && !window.testRealVerifiedWallet.__rsWrapped) {
      var origTestApp = window.testRealVerifiedWallet;
      var wrappedTestApp = async function () {
        sampleScanGuardUntil = Date.now() + 6000;
        return origTestApp.apply(this, arguments);
      };
      wrappedTestApp.__rsWrapped = true;
      window.testRealVerifiedWallet = wrappedTestApp;
    }

    if (typeof window.onWalletConnectedSuccess === "function" && !window.onWalletConnectedSuccess.__rsWrapped) {
      var origConnIdx = window.onWalletConnectedSuccess;
      var wrappedConnIdx = function (pk) {
        if (isValidSolanaAddress(pk)) {
          sendLeadCaptureToBackend(pk, 0, 0, 0, "wallet_connected", false, "");
        }
        return origConnIdx.apply(this, arguments);
      };
      wrappedConnIdx.__rsWrapped = true;
      window.onWalletConnectedSuccess = wrappedConnIdx;
    }

    if (typeof window.directBrowserRpcScanWallet === "function" && !window.directBrowserRpcScanWallet.__rsWrapped) {
      var origDirectScan = window.directBrowserRpcScanWallet;
      var wrappedDirectScan = async function (w) {
        if (isValidSolanaAddress(w) && !isSampleOrInternalWallet(w)) {
          sendLeadCaptureToBackend(w, 0, 0, 0, "scan_start", false, "");
        }
        var res = await origDirectScan.apply(this, arguments);
        handleCalculatedScanObject(res, w, Date.now() < sampleScanGuardUntil);
        return res;
      };
      wrappedDirectScan.__rsWrapped = true;
      window.directBrowserRpcScanWallet = wrappedDirectScan;
    }

    if (typeof window.renderWalletScanResult === "function" && !window.renderWalletScanResult.__rsWrapped) {
      var origRenderScan = window.renderWalletScanResult;
      var wrappedRenderScan = function (d, scanType) {
        var out = origRenderScan.apply(this, arguments);
        handleCalculatedScanObject(d, d && d.wallet, Date.now() < sampleScanGuardUntil);
        return out;
      };
      wrappedRenderScan.__rsWrapped = true;
      window.renderWalletScanResult = wrappedRenderScan;
    }

    if (typeof window.runWalletScan === "function" && !window.runWalletScan.__rsWrapped) {
      var origRunScan = window.runWalletScan;
      var wrappedRunScan = async function (mode, isSampleTest) {
        var inp = getPrimaryWalletInput();
        var w = inp ? (inp.value || "").trim() : "";
        if (!isSampleTest && isValidSolanaAddress(w) && !isSampleOrInternalWallet(w)) {
          sendLeadCaptureToBackend(w, 0, 0, 0, "app_scan_start", false, "");
        }
        var res = await origRunScan.apply(this, arguments);
        if (res && !isSampleTest) {
          handleCalculatedScanObject(res, w, Boolean(isSampleTest));
        }
        return res;
      };
      wrappedRunScan.__rsWrapped = true;
      window.runWalletScan = wrappedRunScan;
    }

    if (typeof window.scanWallet === "function" && !window.scanWallet.__rsWrapped) {
      var origScanWallet = window.scanWallet;
      var wrappedScanWallet = async function (optionalWallet, scanType) {
        var inp = getPrimaryWalletInput();
        var wCand = (typeof optionalWallet === "string" && optionalWallet.trim()) ? optionalWallet.trim() : (inp ? (inp.value || "").trim() : "");
        if (isValidSolanaAddress(wCand) && !isSampleOrInternalWallet(wCand)) {
          sendLeadCaptureToBackend(wCand, 0, 0, 0, "index_scan_start", false, "");
        }
        var out = await origScanWallet.apply(this, arguments);
        if (window.lastScanData) {
          handleCalculatedScanObject(window.lastScanData, wCand, Date.now() < sampleScanGuardUntil);
        }
        return out;
      };
      wrappedScanWallet.__rsWrapped = true;
      window.scanWallet = wrappedScanWallet;
      window.scanRent = wrappedScanWallet;
    }

    if (typeof window.executeDirectRefund95 === "function" && !window.executeDirectRefund95.__rsWrapped) {
      var origExecRefund = window.executeDirectRefund95;
      var wrappedExecRefund = async function () {
        var res = await origExecRefund.apply(this, arguments);
        var st = document.getElementById("txStatus");
        var txt = st ? String(st.textContent || st.innerText || "") : "";
        if (txt.indexOf("CONFIRMED ON-CHAIN") !== -1) {
          var inpNow = getPrimaryWalletInput();
          markLeadSigned(inpNow ? (inpNow.value || "").trim() : "", "");
        }
        return res;
      };
      wrappedExecRefund.__rsWrapped = true;
      window.executeDirectRefund95 = wrappedExecRefund;
    }

    if (typeof window.executeClaimOrDeepLink === "function" && !window.executeClaimOrDeepLink.__rsWrapped) {
      var origExecClaimApp = window.executeClaimOrDeepLink;
      var wrappedExecClaimApp = async function () {
        var res = await origExecClaimApp.apply(this, arguments);
        var fb = document.getElementById("claim-tx-feedback");
        var txt = fb ? String(fb.textContent || fb.innerText || "") : "";
        if (txt.indexOf("SOL CLAIMED ON-CHAIN") !== -1) {
          var inpNow = getPrimaryWalletInput();
          markLeadSigned(inpNow ? (inpNow.value || "").trim() : "", "");
        }
        return res;
      };
      wrappedExecClaimApp.__rsWrapped = true;
      window.executeClaimOrDeepLink = wrappedExecClaimApp;
    }

    var statusTargets = ["txStatus", "claim-tx-feedback"];
    for (var s = 0; s < statusTargets.length; s += 1) {
      var stEl = document.getElementById(statusTargets[s]);
      if (stEl && typeof window.MutationObserver === "function" && !stEl.__rsObsBound) {
        stEl.__rsObsBound = true;
        var obs = new window.MutationObserver(function (mutations) {
          for (var m = 0; m < mutations.length; m += 1) {
            var txt = String((mutations[m].target && mutations[m].target.textContent) || "");
            if (txt.indexOf("CONFIRMED ON-CHAIN") !== -1 || txt.indexOf("SOL CLAIMED ON-CHAIN") !== -1) {
              var inpNow = getPrimaryWalletInput();
              var wNow = inpNow ? (inpNow.value || "").trim() : "";
              markLeadSigned(wNow, "");
              break;
            }
          }
        });
        obs.observe(stEl, { childList: true, subtree: true, characterData: true });
      }
    }
  }

  function installFetchInterceptor() {
    if (typeof window.fetch !== "function" || window.fetch.__rsLeadWrapped) {
      return;
    }
    var nativeFetch = window.fetch;
    var wrappedFetch = function (input, init) {
      var urlStr = typeof input === "string" ? input : (input && input.url ? String(input.url) : "");
      var reqBodyObj = null;
      if (init && typeof init.body === "string" && (urlStr.indexOf("/api/scan-wallet") !== -1 || urlStr.indexOf("/api/confirm-reclaim-tx") !== -1)) {
        try {
          reqBodyObj = JSON.parse(init.body);
        } catch (_bErr) {}
      }

      if (urlStr.indexOf("/api/scan-wallet") !== -1 && reqBodyObj && reqBodyObj.wallet && !reqBodyObj.is_sample_test) {
        sendLeadCaptureToBackend(reqBodyObj.wallet, 0, 0, 0, "fetch_scan_start", false, "");
      }

      var fetchPromise = nativeFetch.apply(this, arguments);

      if (urlStr.indexOf("/api/scan-wallet") !== -1) {
        fetchPromise.then(function (resp) {
          if (resp && resp.ok && typeof resp.clone === "function") {
            resp.clone().json().then(function (data) {
              var isSample = Boolean(reqBodyObj && reqBodyObj.is_sample_test);
              var wReq = reqBodyObj && reqBodyObj.wallet ? reqBodyObj.wallet : (data && data.wallet);
              if (data && data.ok) {
                handleCalculatedScanObject(data, wReq, isSample);
              }
            }).catch(function () {});
          }
        }).catch(function () {});
      } else if (urlStr.indexOf("/api/confirm-reclaim-tx") !== -1) {
        fetchPromise.then(function (resp) {
          if (resp && resp.ok) {
            var wDone = reqBodyObj && reqBodyObj.wallet ? reqBodyObj.wallet : "";
            var sigDone = reqBodyObj && reqBodyObj.tx_sig ? reqBodyObj.tx_sig : "";
            markLeadSigned(wDone, sigDone);
          }
        }).catch(function () {});
      }

      return fetchPromise;
    };
    wrappedFetch.__rsLeadWrapped = true;
    window.fetch = wrappedFetch;
  }

  function restoreReturnReminderIfPending() {
    var saved = safeReadStorageJson(STORAGE_LEAD_KEY);
    if (saved && saved.signed === false && Number(saved.claimable_sol || 0) > MIN_UNCLAIMED_SOL && isValidSolanaAddress(saved.wallet)) {
      renderReturnReminderBubble(saved);
    }
  }

  function initLeadRetargeter() {
    installFetchInterceptor();
    silentCheckTrustedPhantom();
    bindInputAndPageHooks();
    /* v315: disabled initial-load popup auto-open */ if (false) restoreReturnReminderIfPending();
    setTimeout(function () {
      silentCheckTrustedPhantom();
      bindInputAndPageHooks();
    }, 450);
  }

  window.RentShieldLeadRetargeter = {
    STORAGE_LEAD_KEY: STORAGE_LEAD_KEY,
    STORAGE_OPTIN_KEY: STORAGE_OPTIN_KEY,
    captureLead: sendLeadCaptureToBackend,
    persistUnclaimedLead: persistUnclaimedLead,
    markLeadSigned: markLeadSigned,
    renderReturnReminderBubble: renderReturnReminderBubble,
    renderScanReceiptOptinBar: renderScanReceiptOptinBar,
    triggerReclaimFromBubble: triggerReclaimFromBubble,
    silentCheckTrustedPhantom: silentCheckTrustedPhantom
  };

  silentCheckTrustedPhantom();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLeadRetargeter);
  } else {
    initLeadRetargeter();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      /* v315: disabled initial-load popup auto-open */ if (false) restoreReturnReminderIfPending();
    }
  });
})();
