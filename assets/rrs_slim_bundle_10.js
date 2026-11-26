(function(){
  // STRICT INPUT BOX ISOLATION: Never allow demo/sample/showcase functions to touch #walletInput or #mintInput
  window.openIsolatedDemoPreview = function(){
    var m = document.getElementById("isolatedDemoPreviewModal");
    if (m) m.style.display = "flex";
  };
  window.loadSampleWallet = function(_w){
    window.openIsolatedDemoPreview();
  };
  window.loadSampleMint = function(_m){
    window.openIsolatedDemoPreview();
  };
  window.selectDiscoveryWallet = function(w){
    if (w && String(w).length >= 32 && String(w) !== "C3FFhG83pda2veVRFwTDNyf1YT2R2U2ZHxcg8pUeMjrC"){
      window.open("https://solscan.io/account/" + encodeURIComponent(String(w).trim()), "_blank", "noopener,noreferrer");
    } else {
      window.openIsolatedDemoPreview();
    }
  };
})();;

(function(){
  var origPlacesCaptured = false;
  var box1OrigParent = null, box1OrigNext = null;
  var box2OrigParent = null, box2OrigNext = null;
  var statCardsOrigParent = null, statCardsOrigNext = null;
  var trialBoxOrigParent = null, trialBoxOrigNext = null;

  function syncMobileDesktopLayoutOrder(){ return; 
    var grid2 = document.querySelector(".grid-2");
    var rentCard = document.getElementById("rentShieldCard");
    var rugCard = document.getElementById("rugShieldCard");
    var box1 = document.getElementById("liveWalletRentScansBox");
    var box2 = document.getElementById("liveAutonomousFleetRadarBox");
    var statCards = document.getElementById("primaryScanResultCards");
    var trialBox = document.getElementById("trialPassBox");
    if (!grid2 || !rentCard || !rugCard || !box1 || !box2) return;

    if (!origPlacesCaptured){
      origPlacesCaptured = true;
      box1OrigParent = box1.parentNode;
      box1OrigNext = box1.nextSibling;
      box2OrigParent = box2.parentNode;
      box2OrigNext = box2.nextSibling;
      if (statCards){
        statCardsOrigParent = statCards.parentNode;
        statCardsOrigNext = statCards.nextSibling;
      }
      if (trialBox){
        trialBoxOrigParent = trialBox.parentNode;
        trialBoxOrigNext = trialBox.nextSibling;
      }
    }

    var bottomStack = document.getElementById("mobileBottomProofStack");
    if (!bottomStack){
      bottomStack = document.createElement("div");
      bottomStack.id = "mobileBottomProofStack";
      bottomStack.style.cssText = "display:none; flex-direction:column; gap:14px; margin-bottom:18px; width:100%;";
      grid2.insertAdjacentElement("afterend", bottomStack);
    }

    var isMobile = (window.innerWidth <= 768);
    var p1Conn = document.getElementById("panel1ConnectWalletBtn");
    var p1Disc = document.getElementById("panel1DisconnectWalletBtn");
    if (isMobile){
      if (p1Conn && p1Conn.innerText.indexOf("Connected") === -1){
        p1Conn.innerHTML = "👻 Connect Wallet &amp; Auto-Scan";
      }
      bottomStack.style.display = "flex";
      if (box1.parentNode !== bottomStack) bottomStack.appendChild(box1);
      if (box2.parentNode !== bottomStack) bottomStack.appendChild(box2);
      if (trialBox && trialBox.parentNode !== bottomStack) bottomStack.appendChild(trialBox);
      if (statCards && statCards.parentNode !== bottomStack) bottomStack.appendChild(statCards);
    } else {
      bottomStack.style.display = "none";
      if (statCards && statCardsOrigParent && statCards.parentNode === bottomStack){
        statCardsOrigParent.insertBefore(statCards, statCardsOrigNext);
      }
      if (box1OrigParent && box1.parentNode === bottomStack){
        box1OrigParent.insertBefore(box1, box1OrigNext);
      }
      if (trialBox && trialBoxOrigParent && trialBox.parentNode === bottomStack){
        trialBoxOrigParent.insertBefore(trialBox, trialBoxOrigNext);
      }
      if (box2OrigParent && box2.parentNode === bottomStack){
        box2OrigParent.insertBefore(box2, box2OrigNext);
      }
    }
  }

  window.addEventListener("DOMContentLoaded", function(){
    syncMobileDesktopLayoutOrder();
    setTimeout(syncMobileDesktopLayoutOrder, 200);
    setTimeout(syncMobileDesktopLayoutOrder, 800);
  });
  window.addEventListener("resize", syncMobileDesktopLayoutOrder);
  setTimeout(syncMobileDesktopLayoutOrder, 50);
})();;

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
// Live-Endpoint-Aware CORS POST Helper (handles tunnel rotation & transient 429/5xx retries cleanly)
if (!window.__rrsResilientFeedbackPost) {
    window.__rrsResolveLiveBase = function () {
        var host = String((window.location && window.location.hostname) || "").toLowerCase();
        var isStatic = (String(window.location.port || "") !== "8088");
        if (!isStatic)
            return "";
        var cfg = window.__LIVE_ENDPOINT_CONFIG;
        if (cfg && (cfg.endpoint || cfg.api_base))
            return String(cfg.endpoint || cfg.api_base).replace(/\/+$/, "");
        return String(window.BACKEND_TUNNEL_BASE || "").replace(/\/+$/, "");
    };
    window.__rrsRefreshLiveBaseOnce = function () {
        return __awaiter(this, void 0, void 0, function () {
            var r, cfg, ep, _re_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, fetch("/live_endpoint.json?t=" + Date.now(), { cache: "no-store", credentials: "omit" })];
                    case 1:
                        r = _a.sent();
                        if (!(r && r.ok)) return [3 /*break*/, 3];
                        return [4 /*yield*/, r.json()];
                    case 2:
                        cfg = _a.sent();
                        if (cfg && (cfg.endpoint || cfg.api_base)) {
                            window.__LIVE_ENDPOINT_CONFIG = cfg;
                            ep = String(cfg.endpoint || cfg.api_base).replace(/\/+$/, "");
                            window.BACKEND_TUNNEL_BASE = ep;
                            try {
                                BACKEND_TUNNEL_BASE = ep;
                            }
                            catch (_be) { }
                            return [2 /*return*/, ep];
                        }
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        _re_1 = _a.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, window.__rrsResolveLiveBase()];
                }
            });
        });
    };
    window.__rrsResilientFeedbackPost = function (primaryPath, payload, fallbackPath) {
        return __awaiter(this, void 0, void 0, function () {
            var paths, lastErr, attempt, base, _a, pIdx, targetUrl, resp, data, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        paths = [primaryPath];
                        if (fallbackPath && fallbackPath !== primaryPath)
                            paths.push(fallbackPath);
                        lastErr = null;
                        attempt = 0;
                        _b.label = 1;
                    case 1:
                        if (!(attempt < 2)) return [3 /*break*/, 14];
                        if (!(attempt === 0)) return [3 /*break*/, 2];
                        _a = window.__rrsResolveLiveBase();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, window.__rrsRefreshLiveBaseOnce()];
                    case 3:
                        _a = (_b.sent());
                        _b.label = 4;
                    case 4:
                        base = _a;
                        pIdx = 0;
                        _b.label = 5;
                    case 5:
                        if (!(pIdx < paths.length)) return [3 /*break*/, 11];
                        targetUrl = base + paths[pIdx];
                        _b.label = 6;
                    case 6:
                        _b.trys.push([6, 9, , 10]);
                        return [4 /*yield*/, fetch(targetUrl, {
                                method: "POST",
                                mode: "cors",
                                credentials: "omit",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Accept": "application/json"
                                },
                                body: JSON.stringify(payload)
                            })];
                    case 7:
                        resp = _b.sent();
                        if (resp && (resp.status === 429 || resp.status >= 500)) {
                            lastErr = new Error("HTTP " + resp.status);
                            return [3 /*break*/, 10];
                        }
                        return [4 /*yield*/, resp.json().catch(function () { return null; })];
                    case 8:
                        data = _b.sent();
                        if (data && typeof data === "object") {
                            return [2 /*return*/, data];
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        err_1 = _b.sent();
                        lastErr = err_1;
                        return [3 /*break*/, 10];
                    case 10:
                        pIdx++;
                        return [3 /*break*/, 5];
                    case 11:
                        if (!(attempt === 0)) return [3 /*break*/, 13];
                        return [4 /*yield*/, new Promise(function (res) { setTimeout(res, 450); })];
                    case 12:
                        _b.sent();
                        _b.label = 13;
                    case 13:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 14: throw (lastErr || new Error("Network error"));
                }
            });
        });
    };
}
window.submitVisitorFeedbackNow = function () {
    return __awaiter(this, void 0, void 0, function () {
        var msgEl, cntEl, stEl, wEl, msg, contact, wallet, j, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    msgEl = document.getElementById("visitorFeedbackMsgInp");
                    cntEl = document.getElementById("visitorFeedbackContactInp");
                    stEl = document.getElementById("visitorFeedbackStatusMsg");
                    wEl = document.getElementById("walletInput");
                    msg = msgEl ? msgEl.value.trim() : "";
                    contact = cntEl ? cntEl.value.trim() : "";
                    wallet = wEl ? wEl.value.trim() : "";
                    if (!msg) {
                        if (stEl) {
                            stEl.style.display = "block";
                            stEl.style.color = "#fde047";
                            stEl.innerText = "⚠️ Please type a feedback message or question first.";
                        }
                        return [2 /*return*/];
                    }
                    if (stEl) {
                        stEl.style.display = "block";
                        stEl.style.color = "#38bdf8";
                        stEl.innerText = "⚡ Sending live message to Engineering & Product Roadmap...";
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, window.__rrsResilientFeedbackPost("/api/feedback", { message: msg, contact: contact, wallet: wallet })];
                case 2:
                    j = _a.sent();
                    if (j && j.ok) {
                        if (stEl) {
                            stEl.style.color = "#10B981";
                            stEl.innerText = "✅ " + (j.message || "Thank you! Feedback delivered to Engineering & Product Roadmap.");
                        }
                        if (msgEl)
                            msgEl.value = "";
                    }
                    else {
                        if (stEl) {
                            stEl.style.color = "#f87171";
                            stEl.innerText = "⚠️ " + ((j && j.error) || "Could not send feedback.");
                        }
                    }
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    if (stEl) {
                        stEl.style.color = "#10B981";
                        stEl.innerText = "✅ Thank you! Feedback recorded.";
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
};;

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
    var SAMPLE_VERIFIED_WALLET = "C3FFhG83pda2veVRFwTDNyf1YT2R2U2ZHxcg8pUeMjrC";
    function isSolAddr(s) {
        return typeof s === "string" && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s.trim());
    }
    function getInjProvider() {
        if (window.phantom && window.phantom.solana && window.phantom.solana.isPhantom)
            return window.phantom.solana;
        if (window.solana && (window.solana.isPhantom || window.solana.connect))
            return window.solana;
        if (window.solflare && (window.solflare.isSolflare || window.solflare.connect))
            return window.solflare;
        return null;
    }
    function syncMobileDeepLinkBar() {
        var bar = document.getElementById("indexMobileWalletDeepLinks");
        if (!bar)
            return;
        var hasInj = Boolean(getInjProvider());
        var isMob = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || "");
        bar.style.display = (!hasInj && isMob) ? "grid" : "none";
    }
    function sendFunnelTelemetry(evName, extra) {
        try {
            fetch((window.location.port === "8088" ? "" : "") + "/api/traffic-stats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.assign({ event: evName, event_name: evName, force_human_action: true }, extra || {})),
                keepalive: true
            }).catch(function () { });
        }
        catch (_e) { }
    }
    window.openIndexWalletDeepLink = function (appName, ev) {
        if (ev && ev.preventDefault)
            ev.preventDefault();
        var wVal = (document.getElementById("walletInput") || {}).value || "";
        wVal = wVal.trim();
        var targetApp = "https://rentandrugshield.com/app.html?autoscan=1" + (isSolAddr(wVal) ? ("&wallet=" + encodeURIComponent(wVal)) : "");
        var refUrl = "https://rentandrugshield.com";
        var dl = appName === "solflare"
            ? ("https://solflare.com/ul/v1/browse/" + encodeURIComponent(targetApp) + "?ref=" + encodeURIComponent(refUrl))
            : ("https://phantom.app/ul/browse/" + encodeURIComponent(targetApp) + "?ref=" + encodeURIComponent(refUrl));
        sendFunnelTelemetry(appName === "solflare" ? "solflare_deeplink" : "phantom_deeplink", {
            button: "connect_wallet",
            wallet_app: appName === "solflare" ? "Solflare" : "Phantom",
            zone: "Index-Service1-DeepLink"
        });
        window.location.href = dl;
        return false;
    };
    function updateIndexEmeraldCard(scanData) {
        var card = document.getElementById("indexEmeraldFoundCard");
        var hl = document.getElementById("indexEmeraldFoundHeadline");
        if (!card || !hl || !scanData)
            return;
        var cnt = Number(scanData.reclaimable_count != null ? scanData.reclaimable_count : ((scanData.empty_count || 0) + (scanData.dust_count || 0)));
        var totS = Number(scanData.total_reclaimable_sol || 0);
        var totU = Number(scanData.total_reclaimable_usd || (totS * Number(scanData.sol_usd || 74.0)));
        if (cnt > 0) {
            card.style.display = "block";
            hl.innerText = "🔥 FOUND " + cnt + " EMPTY TOKEN ACCOUNTS = +" + totS.toFixed(4) + " SOL ($" + totU.toFixed(2) + ") TRAPPED RENT!";
        }
        else {
            card.style.display = "none";
        }
    }
    // Wrap directBrowserRpcScanWallet so every wallet scan also lights up #indexEmeraldFoundCard
    var prevScanRpc = window.directBrowserRpcScanWallet;
    if (typeof prevScanRpc === "function") {
        window.directBrowserRpcScanWallet = function (w) {
            return __awaiter(this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, prevScanRpc(w)];
                        case 1:
                            res = _a.sent();
                            try {
                                window.lastScanData = res;
                                updateIndexEmeraldCard(res);
                            }
                            catch (_e) { }
                            return [2 /*return*/, res];
                    }
                });
            });
        };
    }
    window.pasteAndScanIndexWallet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var wIn, cur, clip, _ce_1, topB;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        wIn = document.getElementById("walletInput");
                        if (!wIn)
                            return [2 /*return*/];
                        cur = (wIn.value || "").trim();
                        if (isSolAddr(cur)) {
                            window.__explicitUserWalletScan = true;
                            return [2 /*return*/, window.scanWallet(cur, "rent")];
                        }
                        if (!(navigator.clipboard && navigator.clipboard.readText)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, navigator.clipboard.readText()];
                    case 2:
                        clip = ((_a.sent()) || "").trim();
                        if (isSolAddr(clip)) {
                            wIn.value = clip;
                            window.__explicitUserWalletScan = true;
                            return [2 /*return*/, window.scanWallet(clip, "rent")];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _ce_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        wIn.focus();
                        topB = document.getElementById("scanFinishedTopBanner");
                        if (topB) {
                            topB.style.display = "block";
                            topB.style.color = "#10B981";
                            topB.innerHTML = "📋 Paste your Solana address into the input box above | auto-scans instantly with 100% read-only safety!";
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    window.testIndexVerifiedWallet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var btnSample, topB, apiBase, r, cnt, totS, isFirst, netS, px, pCards, tEl, tuEl, nEl, nuEl, aEl, emCard, emHl, emBtn, _te_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        btnSample = document.getElementById("testVerifiedSampleWalletBtn");
                        if (btnSample)
                            btnSample.innerText = "⏳ Scanning Helius RPC...";
                        topB = document.getElementById("scanFinishedTopBanner");
                        if (topB) {
                            topB.style.display = "block";
                            topB.style.color = "#38BDF8";
                            topB.innerHTML = "⏳ Scanning verified wallet <code>C3FF...MjrC</code> on Helius Mainnet RPC...";
                        }
                        apiBase = (typeof window.resolveRrsApiBase === "function") ? window.resolveRrsApiBase() : "";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (typeof window.rrsScanWalletLiveRpc === "function" ? window.rrsScanWalletLiveRpc(SAMPLE_VERIFIED_WALLET) : Promise.resolve(null))];
                    case 2:
                        r = _a.sent();
                        if (btnSample)
                            btnSample.innerText = "👀 Test Verified Wallet";
                        if (r && r.ok) {
                            window.lastScanData = r;
                            cnt = Number(r.reclaimable_count != null ? r.reclaimable_count : (r.empty_count || 0));
                            totS = Number(r.total_reclaimable_sol || 0);
                            isFirst = (r.is_first_claim !== false);
                            netS = isFirst ? totS : Number(r.user_net_95_sol || (totS * 0.985));
                            px = Number(r.sol_usd || 74.8);
                            pCards = document.getElementById("primaryScanResultCards");
                            if (pCards && cnt > 0) {
                                pCards.classList.add("rrs-has-active-scan");
                                pCards.style.display = "grid";
                            }
                            tEl = document.getElementById("totSol");
                            if (tEl)
                                tEl.innerText = "+" + totS.toFixed(4) + " SOL";
                            tuEl = document.getElementById("totUsd");
                            if (tuEl)
                                tuEl.innerText = "$" + (totS * px).toFixed(2) + " USD";
                            nEl = document.getElementById("netSol");
                            if (nEl)
                                nEl.innerText = "+" + netS.toFixed(4) + " SOL";
                            nuEl = document.getElementById("netUsd");
                            if (nuEl)
                                nuEl.innerText = isFirst ? "1st Claim 0% Fee (100%)" : "Repeat Claim (98.0% Net)";
                            aEl = document.getElementById("accCount");
                            if (aEl)
                                aEl.innerText = cnt + " ATAs";
                            emCard = document.getElementById("indexEmeraldFoundCard");
                            emHl = document.getElementById("indexEmeraldFoundHeadline");
                            emBtn = document.getElementById("emeraldClaimPrimaryBtn");
                            if (emCard && emHl && cnt > 0) {
                                emCard.style.display = "block";
                                emHl.innerText = "🔥 FOUND " + cnt + " EMPTY TOKEN ACCOUNTS = +" + totS.toFixed(4) + " SOL ($" + (totS * px).toFixed(2) + ")!";
                                if (emBtn)
                                    emBtn.innerText = isFirst ? "🔥 CLAIM 100% SOL NOW (1ST CLAIM 0% FEE)" : "🔥 CLAIM 98.0% SOL NOW (2.0% REPEAT fee)";
                            }
                            if (topB) {
                                topB.style.color = "#10B981";
                                topB.innerHTML = "✅ Live Helius RPC Verified (<code>C3FF...MjrC</code>): Found <b>" + cnt + " Empty ATAs = +" + totS.toFixed(4) + " SOL</b>! Paste your own address above.";
                            }
                            return [2 /*return*/, r];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _te_1 = _a.sent();
                        if (btnSample)
                            btnSample.innerText = "👀 Test Verified Wallet";
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, window.scanWallet(SAMPLE_VERIFIED_WALLET, "rent")];
                }
            });
        });
    };
    window.pasteOrAuditIndexMint = function () {
        return __awaiter(this, void 0, void 0, function () {
            var mIn, cur, clip, _ce_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mIn = document.getElementById("mintInput");
                        if (!mIn)
                            return [2 /*return*/];
                        cur = (mIn.value || "").trim();
                        if (isSolAddr(cur)) {
                            return [2 /*return*/, window.scanToken(false, cur)];
                        }
                        if (!(navigator.clipboard && navigator.clipboard.readText)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, navigator.clipboard.readText()];
                    case 2:
                        clip = ((_a.sent()) || "").trim();
                        if (isSolAddr(clip)) {
                            mIn.value = clip;
                            return [2 /*return*/, window.scanToken(false, clip)];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _ce_2 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, window.scanToken(false)];
                }
            });
        });
    };
    window.runIndexQuickMintAudit = function (mintAddr) {
        return __awaiter(this, void 0, void 0, function () {
            var mIn, res, tr, oldC, cw, gateBox;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mIn = document.getElementById("mintInput");
                        if (mIn)
                            mIn.value = mintAddr;
                        return [4 /*yield*/, window.scanToken(false, mintAddr)];
                    case 1:
                        res = _a.sent();
                        try {
                            tr = document.getElementById("tokenResults");
                            if (tr) {
                                tr.style.display = "block";
                                oldC = document.getElementById("retailDemoOwnMintCtaWrap");
                                if (oldC)
                                    oldC.remove();
                                cw = document.createElement("div");
                                cw.id = "retailDemoOwnMintCtaWrap";
                                cw.innerHTML = '<div class="rrs-emerald-step2-callout" onclick="window.rrsFocusOwnWalletInput(\'retail\')" style="margin-bottom:10px;">'
                                    + '<div class="rrs-step2-emerald-headline" style="font-size:0.90rem;font-weight:900;color:#00FFA3;line-height:1.4;margin-bottom:6px;">⚡ Verified in 0.1s - Now Paste YOUR Own Wallet Above to Reclaim Your Locked SOL at 0% Fee!</div>'
                                    + '<button type="button" onclick="event.stopPropagation();window.rrsFocusOwnWalletInput(\'retail\')" style="width:100%;min-height:38px;padding:8px 12px;border-radius:8px;border:none;background:#00FFA3;color:#021810;font-weight:900;font-size:0.85rem;cursor:pointer;">📋 Paste YOUR Own Wallet Above Now (0% Fee First Claim)</button>'
                                    + '</div>';
                                gateBox = document.getElementById("verifiedSafeTradeGateBox");
                                if (gateBox && gateBox.parentNode === tr)
                                    tr.insertBefore(cw, gateBox);
                                else
                                    tr.appendChild(cw);
                            }
                        }
                        catch (_qe) { }
                        return [2 /*return*/, res];
                }
            });
        });
    };
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", function () {
            navigator.serviceWorker.register("/sw.js?v=25772", { updateViaCache: "none" }).then(function (reg) {
                if (reg && reg.update)
                    reg.update().catch(function () { });
            }).catch(function () { });
        });
    }
    window.addEventListener("DOMContentLoaded", function () {
        syncMobileDeepLinkBar();
        setTimeout(syncMobileDeepLinkBar, 400);
        var wIn = document.getElementById("walletInput");
        if (wIn) {
            wIn.addEventListener("paste", function () {
                setTimeout(function () {
                    if (isSolAddr(wIn.value)) {
                        window.__explicitUserWalletScan = true;
                        window.scanWallet(wIn.value.trim(), "rent");
                    }
                }, 60);
            });
        }
        var mIn = document.getElementById("mintInput");
        if (mIn) {
            mIn.addEventListener("paste", function () {
                setTimeout(function () {
                    if (isSolAddr(mIn.value))
                        window.scanToken(false, mIn.value.trim());
                }, 60);
            });
        }
        var params = new URLSearchParams(window.location.search);
        var qMint = (params.get("mint") || params.get("token") || params.get("scan") || "").trim();
        var qAutoScan = params.get("autoscan") === "1" || params.get("autoconnect") === "1";
        var qWallet = (params.get("wallet") || params.get("w") || "").trim();
        if (isSolAddr(qMint)) {
            if (mIn)
                mIn.value = qMint;
            var instIn = document.getElementById("instMintInput");
            if (instIn)
                instIn.value = qMint;
            if (qAutoScan || window.location.hash === "#tokenScanner" || window.location.hash === "#rugShieldCard") {
                var scTarget = document.getElementById("rugShieldCard") || document.getElementById("instRugEngineCard");
                if (scTarget && scTarget.scrollIntoView)
                    scTarget.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            setTimeout(function () { window.scanToken(false, qMint); }, 120);
        }
        closeScanBubble();
        var prov = getInjProvider();
        /* Never auto-connect or auto-fill #walletInput on page load */
    });
})();
