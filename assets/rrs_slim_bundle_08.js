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
var guideBubblesIndexEnabled = true;
function toggleGuideBubblesIndex() {
    guideBubblesIndexEnabled = !guideBubblesIndexEnabled;
    var btn = document.getElementById("guideBubblesToggleBtn");
    if (btn) {
        btn.innerText = guideBubblesIndexEnabled ? " Gold Bubble: ON" : " Gold Bubble: OFF";
        btn.setAttribute("aria-pressed", guideBubblesIndexEnabled ? "true" : "false");
        btn.style.opacity = guideBubblesIndexEnabled ? "1" : "0.6";
    }
    var b = document.getElementById("guideStoryIndexBanner");
    if (b && !guideBubblesIndexEnabled)
        b.style.display = "none";
}
function showGuideStoryIndex(topic) {
    if (!guideBubblesIndexEnabled)
        return;
    var b = document.getElementById("guideStoryIndexBanner");
    if (!b)
        return;
    var stories = {
        connect: "🛡️ <b>100% Non-Custodial Safety:</b> Connecting only shares your public address and lets you approve native Solana <code>CloseAccount (0x09)</code> / <code>BurnChecked</code> transactions.",
        disconnect: "🔒 <b>Verified Hard-Disconnect:</b> Unlike phishing sites, clicking Disconnect severs the wallet session 100% cleanly so you can switch Phantom accounts anytime.",
        freescan: "🎁 <b>Read-Only Free Scan &amp; 0% 1st Claim:</b> Paste any 44-char Solana address to scan trapped rent with zero wallet connection. Your 1st SOL Rent Claim is 100% FREE!",
        trial: "✅ <strong>Cancel anytime • 100% zero penalty • Zero auto-billing traps.</strong> 100% Non-Custodial • Read-Only Scans &amp; 1st Rent Recovery 0% Fee • Every TX Verifiable on Solscan."
    };
    b.innerHTML = stories[topic] || stories.trial;
    b.style.display = "block";
}
function triggerAutoAddAppIndex() {
    var m = document.getElementById("addAppModal");
    if (m)
        m.style.display = "flex";
    if (typeof window.installPlatformAppFromIndex === "function") {
        var ua = navigator.userAgent || "";
        if (/Android/i.test(ua))
            window.installPlatformAppFromIndex("android", false);
        else
            window.installPlatformAppFromIndex("ios", false);
    }
}
function openAddAppModal() { triggerAutoAddAppIndex(); }
function closeAddAppModal() {
    var m = document.getElementById("addAppModal");
    if (m)
        m.style.display = "none";
}
function openInstantBuyBubble(tier) {
    if (typeof showGuideStoryIndex === "function")
        showGuideStoryIndex("trial");
    var m = document.getElementById("app-billing-modal");
    if (m)
        m.style.display = "flex";
}
window.openInstantBuyBubble = openInstantBuyBubble;
function closeInstantBuyBubble() {
    var m = document.getElementById("app-billing-modal");
    if (m)
        m.style.display = "none";
}
window.closeInstantBuyBubble = closeInstantBuyBubble;
window.executeInstantPhantomPassIndex = function executeInstantPhantomPassIndex(solAmount, passLabel) {
    return __awaiter(this, void 0, void 0, function () {
        var st, p, connRes, payer, res, raw, tx, sig, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    st = document.getElementById("instant-buy-status-index");
                    if (st) {
                        st.style.display = "block";
                        st.innerHTML = "⚡ Requesting Phantom signature for <b>" + passLabel + " (" + solAmount + " SOL)</b>...";
                    }
                    p = (window.phantom && window.phantom.solana) ? window.phantom.solana : window.solana;
                    if (!p) {
                        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "")) { /* mobile only */ }
                        else {
                            console.info("Desktop browser: connect via Phantom/Solflare browser extension.");
                        }
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, p.connect({ onlyIfTrusted: false })];
                case 2:
                    connRes = _a.sent();
                    payer = (connRes && connRes.publicKey) ? connRes.publicKey.toString() : (p.publicKey ? p.publicKey.toString() : "");
                    return [4 /*yield*/, fetch((window.location.port === "8088" ? "" : "") + "/api/build-pass-tx", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ wallet: payer, sol_amount: solAmount, tier: passLabel })
                        }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })];
                case 3:
                    res = _a.sent();
                    if (!(res && res.tx_base64 && window.solanaWeb3)) return [3 /*break*/, 5];
                    raw = Uint8Array.from(atob(res.tx_base64), function (c) { return c.charCodeAt(0); });
                    tx = window.solanaWeb3.Transaction.from(raw);
                    return [4 /*yield*/, window.BLOWFISH_PHANTOM_TX_GUARD.signAndSendClean(p, tx)];
                case 4:
                    sig = _a.sent();
                    st.innerHTML = "✅ <b>Pass Unlocked!</b> Tx: <code>" + String(sig.signature || sig).slice(0, 10) + "...</code>";
                    return [2 /*return*/];
                case 5:
                    st.innerHTML = "✅ <b>Wallet Connected (" + payer.slice(0, 4) + ".." + payer.slice(-4) + "):</b> Approving " + solAmount + " SOL " + passLabel + "...";
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _a.sent();
                    if (st)
                        st.innerHTML = "ℹ️ " + (e_1.message || "Approve in Phantom or use 1-Tap Apple Pay / Card below.");
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
};
function selectBrandLogo(srcUrl, titleText) {
    try {
        localStorage.setItem("sol_shield_brand_logo", srcUrl);
        localStorage.setItem("sol_shield_brand_name", titleText);
    }
    catch (e) { }
    var hImg = document.getElementById("headerBrandCrestImg");
    if (hImg)
        hImg.src = srcUrl;
    var mImg = document.getElementById("modal-brand-logo-preview");
    if (mImg)
        mImg.src = srcUrl;
}
function installPlatformAppFromIndex(platform) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (platform === "ios") {
                showPlatformToast("🍏 Tap Share [↑] → Add to Home Screen to pin the SOL Shield icon!");
            }
            else if (platform === "android") {
                if (window.deferredInstallPrompt) {
                    try {
                        window.deferredInstallPrompt.prompt();
                        return [2 /*return*/];
                    }
                    catch (e) { }
                }
                showPlatformToast(" Android Home Screen Icon Ready: Tap browser menu ⋮ → Add to Home screen / Install app.");
            }
            else if (platform === "phantom") {
                if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "")) { /* mobile only */ }
                else {
                    console.info("Desktop browser: connect via Phantom/Solflare browser extension.");
                }
            }
            else if (platform === "pc") {
                openPcChromeExtension();
            }
            return [2 /*return*/];
        });
    });
}
function closeScanBubble() {
    var m = document.getElementById("scanBubbleModal");
    if (m)
        m.style.display = "none";
}
window.closeScanBubble = closeScanBubble;
window.__explicitUserWalletScan = false;
function openScanBubbleFromIndex(walletAddr, emptyCount, burnCount, rentSol, rentUsd, burnExtraSol, burnExtraUsd) {
    if (!window.__explicitUserWalletScan) {
        return;
    }
    window.__explicitUserWalletScan = false;
    if (walletAddr && typeof walletAddr === "object") {
        var obj = walletAddr;
        walletAddr = obj.wallet || "";
        emptyCount = Number(obj.empty_count !== undefined ? obj.empty_count : (obj.empty_accounts || 0));
        burnCount = Number(obj.dust_count !== undefined ? obj.dust_count : (obj.burnable_accounts || 0));
        rentSol = Number(obj.user_net_95_sol !== undefined ? obj.user_net_95_sol : (obj.total_reclaimable_sol || 0));
        var px = Number(obj.sol_usd || 74.0);
        rentUsd = rentSol * px;
        burnExtraSol = 0;
        burnExtraUsd = 0;
    }
    var m = document.getElementById("scanBubbleModal");
    if (!m)
        return;
    var clean = String(walletAddr || "").trim();
    var masked = clean.length >= 8 ? (clean.slice(0, 6) + "..." + clean.slice(-4)) : clean;
    var empN = Number(emptyCount || 0);
    var brnN = Number(burnCount || 0);
    var totN = empN + brnN;
    var totSolN = Number(rentSol || 0) + Number(burnExtraSol || 0);
    var totUsdN = Number(rentUsd || 0) + Number(burnExtraUsd || 0);
    var hlEl = document.getElementById("bubble-status-headline");
    if (hlEl) {
        if (totN > 0) {
            hlEl.style.color = "#10B981";
            hlEl.innerText = "🎉 +" + totSolN.toFixed(4) + " SOL ($" + totUsdN.toFixed(2) + " USD) Ready to Reclaim!";
        }
        else {
            hlEl.style.color = "#10B981";
            hlEl.innerText = "✅ Wallet Scanned Clean • 0 Empty Token Accounts Found (0.0000 SOL)";
        }
    }
    var expEl = document.getElementById("bubble-body-explanation");
    if (expEl) {
        if (totN > 0) {
            expEl.innerHTML = "We found <strong>" + empN + " Empty Token Accounts</strong> and <strong>" + brnN + " Burnable Dead Tokens</strong> locking your SOL rent. Click <strong>⚡ COLLECT MY 98.0% SOL NOW</strong> below to recover your SOL in 1 transaction!";
        }
        else {
            expEl.innerHTML = "Your wallet <code>" + masked + "</code> has <strong>0 Empty Token Accounts (0.0000 SOL trapped)</strong> right now. Turn on <strong>Auto-Refund Alerts &amp; Free Reclaim Days</strong> below so we notify you automatically whenever empty accounts accumulate!";
        }
    }
    document.getElementById("bubble-wallet-lbl").innerText = "Audited Wallet: " + masked + " • Verified On-Chain (Solscan)";
    document.getElementById("bubble-rent-sol").innerText = "+" + Number(rentSol || 0).toFixed(4) + " SOL";
    document.getElementById("bubble-rent-usd").innerText = "$" + Number(rentUsd || 0).toFixed(2) + " • 98.0% Net";
    document.getElementById("bubble-empty-cnt").innerText = empN + " Empty ATAs";
    document.getElementById("bubble-burn-cnt").innerText = brnN + " Tokens Found";
    document.getElementById("bubble-burn-sol").innerText = "+" + Number(burnExtraSol || 0).toFixed(4) + " Extra SOL";
    document.getElementById("bubble-burn-usd").innerText = "$" + Number(burnExtraUsd || 0).toFixed(2) + " Extra";
    m.style.display = "flex";
}
window.openScanBubbleFromIndex = openScanBubbleFromIndex;
window.startIndexVoiceBurnCommand = function () {
    var vBtn = document.getElementById("prop-voice-burn-btn");
    var SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
        showPlatformToast("🎙️ Voice Trigger Active: Executing Burn SOL & Rent Scan...");
        scanWallet(null, "burner");
        return;
    }
    var rec = new SpeechRec();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    if (vBtn) {
        vBtn.innerHTML = "🔴 Say &quot;Burn SOL&quot;...";
        vBtn.style.background = "#dc2626";
    }
    rec.onresult = function (ev) {
        var spoken = (ev.results[0][0].transcript || "").toLowerCase();
        if (vBtn) {
            vBtn.innerHTML = "🎙️ Say &quot;Burn SOL&quot;";
            vBtn.style.background = "linear-gradient(90deg,#4f46e5,#7c3aed)";
        }
        showPlatformToast("🎙️ Heard: " + spoken + " • Firing Burn SOL & Rent Scan!");
        scanWallet(null, "burner");
    };
    rec.onerror = function () {
        if (vBtn) {
            vBtn.innerHTML = "🎙️ Say &quot;Burn SOL&quot;";
            vBtn.style.background = "linear-gradient(90deg,#4f46e5,#7c3aed)";
        }
    };
    rec.start();
};
function refreshFleetRadarTelemetry() {
    return __awaiter(this, void 0, void 0, function () {
        var r, pEl, pre, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch((window.location.port === "8088" ? "" : "") + "/api/fleet-radar").then(function (res) { return res.ok ? res.json() : null; }).catch(function () { return null; })];
                case 1:
                    r = _a.sent();
                    if (!r || !r.ok)
                        return [2 /*return*/];
                    pEl = document.getElementById("radarPoolsAuditedVal");
                    if (pEl && r.active_pools_count)
                        pEl.innerText = r.active_pools_count + " Live Pools";
                    pre = document.getElementById("liveRigStreamPre");
                    if (pre && r.stream_summary)
                        pre.innerText = r.stream_summary;
                    return [3 /*break*/, 3];
                case 2:
                    e_2 = _a.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function openLiveRigStreamModal() {
    var m = document.getElementById("liveRigStreamModal");
    if (m)
        m.style.display = "flex";
    refreshFleetRadarTelemetry();
}
function closeLiveRigStreamModal() {
    var m = document.getElementById("liveRigStreamModal");
    if (m)
        m.style.display = "none";
}
window.addEventListener("DOMContentLoaded", function () {
    try {
        var savedLogo = localStorage.getItem("sol_shield_brand_logo");
        var savedName = localStorage.getItem("sol_shield_brand_name");
        if (savedLogo)
            selectBrandLogo(savedLogo, savedName || "Signature Brand Emblem");
    }
    catch (e) { }
    refreshFleetRadarTelemetry();
    setInterval(refreshFleetRadarTelemetry, 12000);
    setTimeout(function () {
        var cBtn = document.getElementById("prop-connect-btn");
        if (cBtn)
            cBtn.addEventListener("mouseenter", function () { showGuideStoryIndex("connect"); });
        var dBtn = document.getElementById("prop-disconnect-btn");
        if (dBtn)
            dBtn.addEventListener("mouseenter", function () { showGuideStoryIndex("disconnect"); });
        var fBtn = document.getElementById("prop-freescan-btn");
        if (fBtn)
            fBtn.addEventListener("mouseenter", function () { showGuideStoryIndex("freescan"); });
    }, 500);
});;

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
    var PASS_TREASURY_PUBKEY = "89Sv5FvnMNRid1bn8y2Ti1vJPSxWxgiW9GSLsPpBnKK1";
    // GLOBAL FETCH INTERCEPTOR: Route relative /api/* requests on GitHub Pages (rentandrugshield.com) to BACKEND_TUNNEL_BASE
    var origFetch = window.fetch;
    if (origFetch && !window._fetchInterceptorInstalled) {
        window._fetchInterceptorInstalled = true;
        window.fetch = function (input, init) {
            try {
                var urlStr = (typeof input === "string") ? input : (input && input.url ? input.url : "");
                if (urlStr && (urlStr.indexOf("/api/") === 0 || urlStr === "/actions.json" || urlStr === "/.well-known/actions.json")) {
                    var host = String(window.location.hostname || "");
                    if (String(window.location.port || "") !== "8088") {
                        var _liveCfg = window.__LIVE_ENDPOINT_CONFIG;
                        var _dynBase = (_liveCfg && (_liveCfg.endpoint || _liveCfg.api_base)) ? String(_liveCfg.endpoint || _liveCfg.api_base).replace(/\/+$/, "") : ((typeof window.BACKEND_TUNNEL_BASE !== "undefined" && window.BACKEND_TUNNEL_BASE) ? String(window.BACKEND_TUNNEL_BASE).replace(/\/+$/, "") : ((typeof BACKEND_TUNNEL_BASE !== "undefined" && BACKEND_TUNNEL_BASE) ? String(BACKEND_TUNNEL_BASE).replace(/\/+$/, "") : ""));
                        if (_dynBase)
                            input = _dynBase + urlStr;
                    }
                }
            }
            catch (e) { }
            return origFetch.call(this, input, init);
        };
    }
    // FLOW 1: WALLET RENT SCAN & 0x09 CLOSEACCOUNT RECLAIM (reclaimSolNow / reclaimSelectedAccounts / executeDirectRefund95)
    window.reclaimSolNow = function (modeOverride) {
        return __awaiter(this, void 0, void 0, function () {
            var mode, w, statusEl, banner, provider, claimUrl, phantomDeepLink, mStat, deepLinkHtml, cRes, wIn, e_1, buildRes, b64, rawBytes, tx, sigRes, sigStr, err_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        closeScanBubble();
                        mode = (modeOverride === "empty_only" || modeOverride === "rent_only") ? "empty_only" : (modeOverride === "burn_only" ? "burn_only" : "all");
                        w = (((_a = document.getElementById("walletInput")) === null || _a === void 0 ? void 0 : _a.value) || (typeof lastScanData !== "undefined" && lastScanData && lastScanData.wallet) || (typeof connectedWallet !== "undefined" && connectedWallet) || "").trim();
                        statusEl = document.getElementById("txStatus");
                        banner = document.getElementById("scanFinishedTopBanner");
                        provider = (window.phantom && window.phantom.solana) ? window.phantom.solana : (window.solflare || window.solana || null);
                        // If user is on Mobile Safari / Google App / Desktop without an injected Solana wallet provider:
                        if (!provider || (!provider.signAndSendTransaction && !provider.signTransaction)) {
                            claimUrl = "https://rentandrugshield.com/?" + (w && w.length >= 32 ? ("wallet=" + encodeURIComponent(w) + "&") : "") + "auto_claim=1";
                            phantomDeepLink = "https://phantom.app/ul/browse/" + encodeURIComponent(claimUrl) + "?ref=" + encodeURIComponent("https://rentandrugshield.com");
                            if (typeof openWalletModal === "function")
                                openWalletModal();
                            mStat = document.getElementById("walletModalStatus");
                            deepLinkHtml = '<div style="margin-top:8px;padding:10px;border-radius:9px;background:rgba(16,185,129,0.16);border:1.5px solid #10B981;text-align:center;">'
                                + '<div style="color:#ecfdf5;font-size:0.82rem;font-weight:800;margin-bottom:6px;">📲 Ready to Sign &amp; Collect Your SOL Rent:</div>'
                                + '<a href="' + phantomDeepLink + '" style="display:inline-block;width:100%;padding:10px 8px;border-radius:8px;background:linear-gradient(90deg,#059669,#10b981);color:#022c22;font-weight:900;font-size:0.84rem;text-decoration:none;box-sizing:border-box;">👻 Open This Exact Claim Inside Phantom App to Sign &amp; Collect Your SOL</a>'
                                + '</div>';
                            if (mStat)
                                mStat.innerHTML = deepLinkHtml;
                            if (statusEl) {
                                statusEl.style.display = "block";
                                statusEl.innerHTML = deepLinkHtml;
                            }
                            if (banner) {
                                banner.style.display = "block";
                                banner.innerHTML = deepLinkHtml;
                            }
                            return [2 /*return*/];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        if (!!provider.publicKey) return [3 /*break*/, 3];
                        return [4 /*yield*/, provider.connect({ onlyIfTrusted: false })];
                    case 2:
                        cRes = _b.sent();
                        if (cRes && cRes.publicKey) {
                            w = cRes.publicKey.toString();
                            window.connectedWallet = w;
                            wIn = document.getElementById("walletInput");
                            if (wIn)
                                wIn.value = w;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        w = provider.publicKey.toString();
                        window.connectedWallet = w;
                        _b.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        e_1 = _b.sent();
                        if (statusEl)
                            statusEl.innerText = "⚠️ Please approve wallet connection in Phantom to sign your SOL rent claim.";
                        return [2 /*return*/];
                    case 6:
                        if (!w || w.length < 32) {
                            if (typeof openWalletModal === "function")
                                openWalletModal();
                            return [2 /*return*/];
                        }
                        if (statusEl) {
                            statusEl.style.color = "#38bdf8";
                            statusEl.innerHTML = "⚡ Building atomic 0x09 CloseAccount transaction via Helius Mainnet RPC for <code>" + w.slice(0, 4) + "..." + w.slice(-4) + "</code>...";
                        }
                        _b.label = 7;
                    case 7:
                        _b.trys.push([7, 13, , 14]);
                        return [4 /*yield*/, fetch((window.location.port === "8088" ? "" : "") + "/api/build-reclaim-tx", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    wallet: w,
                                    include_dust_burn: (mode !== "empty_only"),
                                    reinvest_pct: 0,
                                    mode: mode
                                })
                            }).then(function (r) { return r.json(); }).catch(function () { return null; })];
                    case 8:
                        buildRes = _b.sent();
                        b64 = buildRes && (buildRes.tx_base64 || buildRes.unsigned_tx_base64 || buildRes.transaction_base64);
                        if (!(b64 && window.solanaWeb3)) return [3 /*break*/, 10];
                        rawBytes = Uint8Array.from(atob(b64), function (c) { return c.charCodeAt(0); });
                        tx = window.solanaWeb3.Transaction.from(rawBytes);
                        return [4 /*yield*/, window.BLOWFISH_PHANTOM_TX_GUARD.signAndSendClean(provider, tx)];
                    case 9:
                        sigRes = _b.sent();
                        sigStr = (typeof sigRes === "string") ? sigRes : ((sigRes && sigRes.signature) || "");
                        if (statusEl) {
                            statusEl.style.color = "#10B981";
                            statusEl.innerHTML = "✅ <b>SOL Rent Claim Confirmed On-Chain!</b> TX: <code>" + sigStr.slice(0, 16) + "...</code>";
                        }
                        if (typeof showPlatformToast === "function")
                            showPlatformToast("✅ SOL Rent Reclaimed! TX: " + sigStr.slice(0, 10) + "...", true);
                        return [2 /*return*/, sigRes];
                    case 10:
                        if (!(typeof executeDirectRefund95 === "function")) return [3 /*break*/, 12];
                        return [4 /*yield*/, executeDirectRefund95(mode)];
                    case 11: return [2 /*return*/, _b.sent()];
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        err_1 = _b.sent();
                        if (statusEl) {
                            statusEl.style.color = "#f59e0b";
                            statusEl.innerText = "ℹ️ Transaction status: " + (err_1.message || "Check wallet approval.");
                        }
                        return [3 /*break*/, 14];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    window.reclaimSelectedAccounts = window.reclaimSolNow;
    // Override Box 1 direct collect buttons to call window.reclaimSolNow so backend /api/build-reclaim-tx + Phantom deep-link always work
    window.executeDirectRefund95 = window.reclaimSolNow;
    // FLOW 2: CANONICAL $19.99/mo PRO & $99/mo QUANT CHECKOUT
    window.executeInstantPhantomPassIndex = function (solAmount, passLabel) {
        return __awaiter(this, void 0, void 0, function () {
            var st, tierCode, p, payTargetUrl, phantomPayLink, connRes, payer, res, b64, tx, raw, bh, sig, sigStr, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        st = document.getElementById("instant-buy-status-index");
                        tierCode = (Number(solAmount) >= 0.05) ? "trader_pro_1999" : "19.99";
                        if (st) {
                            st.style.display = "block";
                            st.innerHTML = "⚡ Building " + solAmount + " SOL (" + passLabel + ") payment transaction via Helius RPC...";
                        }
                        p = (window.phantom && window.phantom.solana) ? window.phantom.solana : (window.solflare || window.solana || null);
                        if (!p || (!p.signAndSendTransaction && !p.signTransaction)) {
                            payTargetUrl = "https://rentandrugshield.com/?auto_pay_pass=" + encodeURIComponent(tierCode);
                            phantomPayLink = "https://phantom.app/ul/browse/" + encodeURIComponent(payTargetUrl) + "?ref=" + encodeURIComponent("https://rentandrugshield.com");
                            if (st) {
                                st.innerHTML = '<div style="padding:6px;text-align:center;">'
                                    + '<div style="margin-bottom:5px;color:#fde047;font-weight:800;">📲 Tap below to open Phantom and auto-approve ' + solAmount + ' SOL (' + passLabel + '):</div>'
                                    + '<a href="' + phantomPayLink + '" style="display:inline-block;width:100%;padding:9px 6px;border-radius:7px;background:linear-gradient(90deg,#059669,#10b981);color:#022c22;font-weight:900;text-decoration:none;box-sizing:border-box;" class="rrs-mobile-only-paybtn">👻 Open Mobile Wallet &amp; Approve ' + solAmount + ' SOL Now</a>'
                                    + '</div>';
                            }
                            window.location.href = phantomPayLink;
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 10]);
                        return [4 /*yield*/, p.connect({ onlyIfTrusted: false })];
                    case 2:
                        connRes = _a.sent();
                        payer = (connRes && connRes.publicKey) ? connRes.publicKey.toString() : (p.publicKey ? p.publicKey.toString() : "");
                        if (!payer || payer.length < 32) {
                            throw new Error("Please unlock your Solana wallet first.");
                        }
                        return [4 /*yield*/, fetch((window.location.port === "8088" ? "" : "") + "/api/build-pass-tx", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ wallet: payer, sol_amount: solAmount, tier: tierCode })
                            }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })];
                    case 3:
                        res = _a.sent();
                        b64 = res && (res.tx_base64 || res.unsigned_tx_base64 || res.transaction_base64);
                        tx = null;
                        if (!(b64 && window.solanaWeb3)) return [3 /*break*/, 4];
                        raw = Uint8Array.from(atob(b64), function (c) { return c.charCodeAt(0); });
                        tx = window.solanaWeb3.Transaction.from(raw);
                        return [3 /*break*/, 6];
                    case 4:
                        if (!window.solanaWeb3) return [3 /*break*/, 6];
                        return [4 /*yield*/, fetchLatestBlockhash()];
                    case 5:
                        bh = _a.sent();
                        tx = new window.solanaWeb3.Transaction({
                            recentBlockhash: bh,
                            feePayer: new window.solanaWeb3.PublicKey(payer)
                        }).add(window.solanaWeb3.SystemProgram.transfer({
                            fromPubkey: new window.solanaWeb3.PublicKey(payer),
                            toPubkey: new window.solanaWeb3.PublicKey(PASS_TREASURY_PUBKEY),
                            lamports: Math.round(Number(solAmount) * 1e9)
                        }));
                        _a.label = 6;
                    case 6:
                        if (!tx) return [3 /*break*/, 8];
                        return [4 /*yield*/, window.BLOWFISH_PHANTOM_TX_GUARD.signAndSendClean(p, tx)];
                    case 7:
                        sig = _a.sent();
                        sigStr = String((sig && sig.signature) || sig);
                        if (st) {
                            st.innerHTML = "✅ <b>Pass Unlocked!</b> TX: <code>" + sigStr.slice(0, 14) + "...</code>";
                        }
                        try {
                            if (sigStr && sigStr.length >= 32)
                                localStorage.setItem("dex6_pro_pass_tx", sigStr);
                            localStorage.setItem("dex6_pro_pass_unlocked", "1");
                            proPassUnlocked = window.hasVerifiedPaidPassToken();
                            updateDemoBadge();
                        }
                        catch (_e) { }
                        return [2 /*return*/, sig];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        e_2 = _a.sent();
                        if (st)
                            st.innerHTML = "ℹ️ " + (e_2.message || "Approve in Phantom or use 1-Tap Apple Pay / Card below.");
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    // FLOW 3: PREPEND SCANNED MINT RESULT TO LIVE FEED WITHOUT DUPLICATE HTTP REQUEST
    var origScanToken = window.scanToken;
    window.scanToken = function (isAutoInit, optionalMint) {
        return __awaiter(this, void 0, void 0, function () {
            var mEl, mintVal, srvData, _a, tbody, sym, sc, vrd, shortM, tr;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        mEl = document.getElementById("mintInput");
                        mintVal = (typeof optionalMint === "string" && optionalMint.trim().length >= 20) ? optionalMint.trim() : (mEl ? mEl.value.trim() : "");
                        if (!(typeof origScanToken === "function")) return [3 /*break*/, 2];
                        return [4 /*yield*/, origScanToken(isAutoInit, optionalMint)];
                    case 1:
                        _a = (_b.sent());
                        return [3 /*break*/, 3];
                    case 2:
                        _a = null;
                        _b.label = 3;
                    case 3:
                        srvData = _a;
                        if (srvData && srvData.ok && mintVal && mintVal.length >= 20) {
                            try {
                                tbody = document.getElementById("liveFleetSavesTableBody");
                                if (tbody) {
                                    sym = String(srvData.symbol || ("$" + mintVal.slice(0, 4).toUpperCase()));
                                    if (sym.indexOf("$") !== 0)
                                        sym = "$" + sym;
                                    sc = Number(srvData.safety_score !== undefined ? srvData.safety_score : (srvData.score !== undefined ? srvData.score : 94));
                                    vrd = sc >= 85 ? "PASS" : (sc >= 50 ? "CAUTION" : "FAIL");
                                    shortM = mintVal.slice(0, 4) + "..." + mintVal.slice(-4);
                                    tr = document.createElement("tr");
                                    tr.style.background = sc >= 85 ? "rgba(16, 185, 129,0.14)" : "rgba(239,68,68,0.16)";
                                    tr.innerHTML = '<td style="color:#6EE7B7;font-weight:800;">JUST NOW (LIVE)</td>'
                                        + '<td><strong style="color:#F8FAFC;">' + sym + '</strong><br/><span class="mono-addr" style="color:#CBD5E1;font-size: 0.85rem;">(' + shortM + ')</span></td>'
                                        + '<td style="color:#FDE047;font-weight:800;">12-Layer Audit: <b class="mono-price">' + sc + '/100 (' + vrd + ')</b></td>'
                                        + '<td style="color:#10B981;font-weight:800;">' + (sc >= 85 ? 'Verified Safe Contract' : '100% Principal + Rent Saved') + '</td>';
                                    if (tbody.firstChild)
                                        tbody.insertBefore(tr, tbody.firstChild);
                                    else
                                        tbody.appendChild(tr);
                                }
                            }
                            catch (_e) { }
                        }
                        return [2 /*return*/, srvData];
                }
            });
        });
    };
    // HOOK ?auto_pay_pass=19.99 AND ?auto_claim=1
    window.addEventListener("DOMContentLoaded", function () {
        var params = new URLSearchParams(window.location.search);
        var autoPay = params.get("auto_pay_pass");
        var autoClaim = params.get("auto_claim") || params.get("claim");
        var urlWallet = params.get("wallet") || params.get("w");
        if (autoPay) {
            setTimeout(function () {
                openInstantBuyBubble(autoPay);
                var solAmt = (autoPay === "19.99" || autoPay === "trader_pro_1999" || autoPay === "monthly") ? 0.066 : 0.026;
                var lbl = (autoPay === "19.99" || autoPay === "trader_pro_1999" || autoPay === "monthly") ? "30-Day Trader Pro ($19.99/mo, Reg. $39.99/mo)" : "30-Day Trader Pro ($19.99/mo, Reg. $39.99/mo)";
                window.executeInstantPhantomPassIndex(solAmt, lbl);
            }, 450);
        }
        else if (autoClaim) {
            setTimeout(function () {
                return __awaiter(this, void 0, void 0, function () {
                    var wIn;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(urlWallet && urlWallet.length >= 32)) return [3 /*break*/, 2];
                                wIn = document.getElementById("walletInput");
                                /* never auto-fill #walletInput on page load */
                                return [4 /*yield*/, scanWallet(urlWallet, "rent")];
                            case 1:
                                /* never auto-fill #walletInput on page load */
                                _a.sent();
                                _a.label = 2;
                            case 2:
                                window.reclaimSolNow("all");
                                return [2 /*return*/];
                        }
                    });
                });
            }, 600);
        }
    });
})();
