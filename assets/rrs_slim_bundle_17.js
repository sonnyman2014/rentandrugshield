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
    var B58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    var TREASURY_PK = "89Sv5FvnMNRid1bn8y2Ti1vJPSxWxgiW9GSLsPpBnKK1";
    var FROZEN_PFX = ["5sEb9m", "CsLX8F", "DGnsyz", "FRCeYg"];
    function isValidRefPubkey(s) {
        var v = String(s || "").trim();
        if (!B58_RE.test(v) || v === TREASURY_PK)
            return false;
        for (var i = 0; i < FROZEN_PFX.length; i++) {
            if (v.indexOf(FROZEN_PFX[i]) === 0)
                return false;
        }
        return true;
    }
    // 1. Capture ?ref=<SolanaWallet> from URL on load (ignoring Phantom ?ref=https://... URLs)
    try {
        var qp = new URLSearchParams(window.location.search || "");
        var candRef = (qp.get("ref") || qp.get("referrer") || qp.get("aff") || "").trim();
        if (isValidRefPubkey(candRef)) {
            localStorage.setItem("rrs_affiliate_ref_wallet", candRef);
            document.cookie = "rrs_ref=" + encodeURIComponent(candRef) + "; path=/; max-age=2592000; SameSite=Lax";
        }
    }
    catch (_e) { }
    window.getActiveAffiliateRefWallet = function (buyerWallet) {
        try {
            var stored = (localStorage.getItem("rrs_affiliate_ref_wallet") || "").trim();
            if (!isValidRefPubkey(stored))
                return "";
            if (buyerWallet && String(buyerWallet).trim() === stored)
                return "";
            return stored;
        }
        catch (_e) {
            return "";
        }
    };
    // 2. Automatically inject ref_wallet into backend API POST bodies (zero-custody 30% split)
    var _origFetchAff = window.fetch;
    if (typeof _origFetchAff === "function" && !window.__RRS_AFF30_FETCH_WRAPPED) {
        window.__RRS_AFF30_FETCH_WRAPPED = true;
        window.fetch = function (input, init) {
            try {
                var urlStr = (typeof input === "string") ? input : ((input && input.url) || "");
                if (init && init.method && String(init.method).toUpperCase() === "POST" && typeof init.body === "string" && init.body.charAt(0) === "{") {
                    if (/\/(scan-wallet|build-reclaim-tx|confirm-reclaim-tx|build-pass-tx|build-single-audit-tx|create-checkout-session|verify-payment)/.test(urlStr)) {
                        var parsed = JSON.parse(init.body);
                        var refW = window.getActiveAffiliateRefWallet(parsed.wallet || parsed.sender_wallet || "");
                        if (refW && !parsed.ref_wallet && !parsed.ref) {
                            parsed.ref_wallet = refW;
                            init = Object.assign({}, init, { body: JSON.stringify(parsed) });
                        }
                    }
                }
            }
            catch (_fe) { }
            return _origFetchAff.call(this, input, init);
        };
    }
    function detectUserWalletForShare() {
        var inp = document.getElementById("affRefWalletGenInp");
        if (inp && isValidRefPubkey(inp.value))
            return inp.value.trim();
        var w1 = document.getElementById("walletInput") || document.getElementById("w-inp");
        if (w1 && isValidRefPubkey(w1.value))
            return w1.value.trim();
        if (typeof lastScanData !== "undefined" && lastScanData && isValidRefPubkey(lastScanData.wallet))
            return String(lastScanData.wallet).trim();
        if (typeof connectedWallet !== "undefined" && isValidRefPubkey(connectedWallet))
            return String(connectedWallet).trim();
        try {
            var prov = window.detectInjectedSolanaWallet ? window.detectInjectedSolanaWallet() : null;
            if (prov && prov.publicKey && isValidRefPubkey(prov.publicKey.toString()))
                return prov.publicKey.toString();
        }
        catch (_pe) { }
        return "";
    }
    // 3. [Share Reclaimed SOL on X] with prefilled reclaimed SOL proof + ?ref=<UserWallet> 30% referral URL
    window.shareReclaimedSolOnX = function () {
        var userW = detectUserWalletForShare();
        var solAmt = "0.1915";
        var ataCnt = 125;
        if (typeof lastScanData !== "undefined" && lastScanData && Number(lastScanData.total_reclaimable_sol) > 0) {
            solAmt = Number(lastScanData.total_reclaimable_sol).toFixed(4);
            ataCnt = Number(lastScanData.reclaimable_count || lastScanData.empty_count || 1);
        }
        else {
            var totEl = document.getElementById("totSol");
            if (totEl && /\+([0-9]+\.[0-9]+)/.test(totEl.innerText)) {
                var m = totEl.innerText.match(/\+([0-9]+\.[0-9]+)/);
                if (m && Number(m[1]) > 0)
                    solAmt = Number(m[1]).toFixed(4);
            }
        }
        var shareUrl = userW
            ? ("https://rentandrugshield.com/?ref=" + encodeURIComponent(userW))
            : "https://rentandrugshield.com/";
        var tweetText = "Just reclaimed +" + solAmt + " SOL (" + ataCnt + " empty ATAs • 100% 1st claim 2,039,280 lamports, 0% fee) + audited tokens with the <120ms 12-Layer Rug Shield on @SolRentClaim:";
        var intentUrl = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(tweetText) + "&url=" + encodeURIComponent(shareUrl);
        window.open(intentUrl, "_blank", "noopener,noreferrer");
    };
    window.shareOnX = window.shareReclaimedSolOnX;
    window.jumpToAffiliate30Engine = function (ev) {
        var bar = document.getElementById("affiliate30PctEngineBar") || document.getElementById("instAffiliate30Bar");
        if (bar && bar.offsetParent !== null) {
            if (ev && ev.preventDefault)
                ev.preventDefault();
            bar.scrollIntoView({ behavior: "smooth", block: "center" });
            bar.style.boxShadow = "0 0 0 2px #14F195, 0 0 24px rgba(20, 241, 149, 0.45)";
            setTimeout(function () { bar.style.boxShadow = ""; }, 2200);
            var inp = document.getElementById("affRefWalletGenInp") || document.getElementById("instAffRefWalletGenInp");
            var w = detectUserWalletForShare();
            if (inp && w && !inp.value)
                inp.value = w;
            if (inp)
                setTimeout(function () { try {
                    inp.focus({ preventScroll: true });
                }
                catch (_e) { } }, 350);
            return false;
        }
        if (ev && ev.preventDefault)
            ev.preventDefault();
        window.location.href = "/affiliates.html";
        return false;
    };
    // 4. 30% ?ref=<Wallet> Affiliate Link Generator
    window.copyAffiliateLink30Pct = function () {
        return __awaiter(this, void 0, void 0, function () {
            var w, st, link, _ce_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        w = detectUserWalletForShare();
                        st = document.getElementById("aff30GenStatus");
                        if (!w) {
                            if (st) {
                                st.style.display = "block";
                                st.style.color = "#FDE047";
                                st.innerText = "Paste your Solana wallet address above (or scan/connect first) to generate your 30% zero-custody ?ref= link.";
                            }
                            return [2 /*return*/];
                        }
                        link = "https://rentandrugshield.com/?ref=" + encodeURIComponent(w);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        if (!(navigator.clipboard && navigator.clipboard.writeText)) return [3 /*break*/, 3];
                        return [4 /*yield*/, navigator.clipboard.writeText(link)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        _ce_1 = _a.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        if (st) {
                            st.style.display = "block";
                            st.style.color = "#6EE7B7";
                            st.innerText = "Copied 30% Zero-Custody Referral URL: " + link;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    window.shareAffiliate30PctOnX = function () {
        var w = detectUserWalletForShare();
        var url = w ? ("https://rentandrugshield.com/?ref=" + encodeURIComponent(w)) : "https://rentandrugshield.com/";
        var txt = "Reclaim 100% of trapped Solana token rent on your 1st claim (2,039,280 lamports, 0% fee) + block rugs in <120ms with the 12-Layer Shield on @SolRentClaim:";
        window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(txt) + "&url=" + encodeURIComponent(url), "_blank", "noopener,noreferrer");
    };
    // 5. Stripe & x402 Checkout Modal Helpers
    window.triggerStripeCheckoutModal = function () {
        return __awaiter(this, void 0, void 0, function () {
            var apiBase, activeTier, w, refW, b, r, d, _se_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        apiBase = (typeof window.resolveRrsApiBase === "function") ? window.resolveRrsApiBase() : "";
                        activeTier = window.__RRS_CURRENT_CHK_TIER || "trader_pro_1999";
                        w = detectUserWalletForShare();
                        refW = window.getActiveAffiliateRefWallet(w);
                        b = document.getElementById("chkLiveStatusBanner");
                        if (b)
                            b.innerHTML = "💳 Preparing institutional Stripe checkout session...";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch(apiBase + "/api/create-checkout-session", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ tier: activeTier, wallet: w, ref_wallet: refW })
                            })];
                    case 2:
                        r = _a.sent();
                        return [4 /*yield*/, r.json()];
                    case 3:
                        d = _a.sent();
                        if (d && d.checkout_url && d.checkout_url.indexOf("stripe.com") !== -1) {
                            window.location.href = d.checkout_url;
                            return [2 /*return*/];
                        }
                        if (b)
                            b.innerHTML = "✅ <b>" + ((d && d.message) || "Instant non-custodial SOL/USDC checkout active below") + "</b> • Zero auto-billing.";
                        return [3 /*break*/, 5];
                    case 4:
                        _se_1 = _a.sent();
                        if (b)
                            b.innerHTML = "ℹ️ Use 1-Click Solana Wallet, Mobile Deep-Link, or USDC/SOL QR below.";
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    window.copyX402AgentHeaderModal = function () {
        return __awaiter(this, void 0, void 0, function () {
            var activeTier, cmd, _xe_1, b;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        activeTier = window.__RRS_CURRENT_CHK_TIER || "quant_desk_99";
                        cmd = 'curl -i -H "X-Agent-Id: quant-bot-1" "https://rentandrugshield.com/.well-known/x402.json" # Tier: ' + activeTier;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        if (!(navigator.clipboard && navigator.clipboard.writeText)) return [3 /*break*/, 3];
                        return [4 /*yield*/, navigator.clipboard.writeText(cmd)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        _xe_1 = _a.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        b = document.getElementById("chkLiveStatusBanner");
                        if (b)
                            b.innerHTML = " Copied <code>x402</code> discovery command! Agents can pay via <code>PAYMENT-SIGNATURE</code> (SOL or SPL USDC) with zero custody.";
                        return [2 /*return*/];
                }
            });
        });
    };
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
/* Solana Rent & Rug Shield - 12-Layer Info Popover, View Navigation & Button Click Telemetry */
(function () {
    if (window.__RRS_0X107_TELEMETRY_LOADED)
        return;
    window.__RRS_0X107_TELEMETRY_LOADED = true;
    var LAYER11_INFO_TEXT = "12-Layer 12-Layer Security Shield: Includes Layer 11 (Block-0 Sybil Cluster Defense) + Layer 12 (Slot-0 Insider Bundle & Cybersecurity Drainer Detection) engineered across 898 Verified Founder Hrs (165 Days) + 5,501 Parallel Compute Hrs.";
    var EXCLUDED_PREFIXES = ["5sEb9m", "CsLX8F", "DGnsyz", "FRCeYg"];
    var _apiBaseCache = null;
    function injectSharedStyles() {
        if (document.getElementById("rrs-0x107-shared-styles"))
            return;
        var st = document.createElement("style");
        st.id = "rrs-0x107-shared-styles";
        st.textContent = [
            ".rrs-layer11-info-btn{display:inline-flex;align-items:center;justify-content:center;width:21px;height:21px;margin-left:6px;padding:0;border-radius:999px;border:1.5px solid #14F195;background:rgba(20,241,149,0.16);color:#6EE7B7;font-size:12.5px;font-weight:900;line-height:1;cursor:pointer;vertical-align:middle;transition:all .16s ease;box-shadow:0 0 8px rgba(20,241,149,0.22);}",
            ".rrs-layer11-info-btn:hover,.rrs-layer11-info-btn:focus{background:#14F195;color:#022C22;transform:scale(1.07);outline:none;}",
            "#rrsLayer11GlobalPopover{display:none;position:fixed;z-index:2147483000;width:min(340px,calc(100vw - 24px));background:linear-gradient(165deg,#071628,#042F2E);border:1.5px solid #14F195;border-radius:12px;padding:12px 14px;color:#F8FAFC;font-size:13px;line-height:1.48;box-shadow:0 18px 44px rgba(0,0,0,0.88);}",
            "#rrsLayer11GlobalPopover.rrs-open{display:block !important;visibility:visible !important;opacity:1 !important;}",
            "#rrsIndexQuickNav,#rrsAppOnPageNavBar,.rrs-onpage-nav-bar{display:none !important;align-items:center;gap:6px;flex-wrap:wrap;padding:4px 8px;border-radius:10px;background:rgba(9,16,29,0.9);border:1px solid rgba(56,189,248,0.38);}",
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
        }
        catch (_e) {
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
        }
        catch (_e) {
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
                        if (!bad)
                            return pk;
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
                        if (!bad2)
                            return v;
                    }
                }
            }
        }
        catch (_e) { }
        return "";
    }
    function resolveTelemetryEndpoint() {
        return __awaiter(this, void 0, void 0, function () {
            var host, r, j, _e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (_apiBaseCache !== null)
                            return [2 /*return*/, _apiBaseCache + "/api/telemetry/click"];
                        host = String(window.location.hostname || "").toLowerCase();
                        if ((host === "127.0.0.1" || host === "localhost") && String(window.location.port || "") === "8088") {
                            _apiBaseCache = "";
                            return [2 /*return*/, "/api/telemetry/click"];
                        }
                        if (String(window.location.port || "") === "8088") return [3 /*break*/, 7];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, fetch("/live_endpoint.json?t=" + Math.floor(Date.now() / 60000), { cache: "no-store" })];
                    case 2:
                        r = _a.sent();
                        if (!r.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, r.json()];
                    case 3:
                        j = _a.sent();
                        if (j && j.api_base) {
                            _apiBaseCache = String(j.api_base).replace(/\/+$/, "");
                            return [2 /*return*/, _apiBaseCache + "/api/telemetry/click"];
                        }
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        _e_1 = _a.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        _apiBaseCache = "";
                        return [2 /*return*/, _apiBaseCache + "/api/telemetry/click"];
                    case 7:
                        _apiBaseCache = "";
                        return [2 /*return*/, "/api/telemetry/click"];
                }
            });
        });
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
            }
            catch (_e) { }
            if (!sent) {
                try {
                    fetch(url, {
                        method: "POST",
                        mode: "cors",
                        keepalive: true,
                        headers: { "Content-Type": "application/json" },
                        body: bodyStr
                    }).catch(function () { });
                }
                catch (_e2) { }
            }
        });
    }
    // Interactive Layer 11 Info Popover
    function ensurePopoverDom() {
        var pop = document.getElementById("rrsLayer11GlobalPopover");
        if (pop)
            return pop;
        pop = document.createElement("div");
        pop.id = "rrsLayer11GlobalPopover";
        pop.setAttribute("role", "dialog");
        pop.setAttribute("aria-label", "12-Layer Defense Upgrade Notice");
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
                pop._pinnedByClick = false;
            });
        }
        document.addEventListener("click", function (ev) {
            if (!pop.classList.contains("rrs-open"))
                return;
            var t = ev.target;
            if (pop.contains(t) || (t && t.closest && t.closest(".rrs-layer11-info-btn")))
                return;
            pop.classList.remove("rrs-open");
            pop._pinnedByClick = false;
        });
        document.addEventListener("keydown", function (ev) {
            if (ev.key === "Escape") {
                pop.classList.remove("rrs-open");
                pop._pinnedByClick = false;
            }
        });
        return pop;
    }
    window.rrsShowLayer11Popover = function (anchorEl, toggleMode) {
        var pop = ensurePopoverDom();
        if (!toggleMode && pop._anchor !== anchorEl) {
            pop._pinnedByClick = false;
        }
        if (toggleMode && pop.classList.contains("rrs-open") && pop._anchor === anchorEl && pop._pinnedByClick) {
            pop.classList.remove("rrs-open");
            pop._pinnedByClick = false;
            return;
        }
        pop._anchor = anchorEl;
        if (toggleMode)
            pop._pinnedByClick = true;
        pop.removeAttribute("hidden");
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
            if (b._rrsBound)
                continue;
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
        if (!tabName)
            return;
        if (_viewIdx >= 0 && _viewStack[_viewIdx] === tabName)
            return;
        _viewStack = _viewStack.slice(0, _viewIdx + 1);
        _viewStack.push(tabName);
        _viewIdx = _viewStack.length - 1;
    };
    window.rrsNavAction = function (action) {
        if (action === "home") {
            closeActiveModalIfAny();
            if (window.location.pathname === "/" || window.location.pathname === "/index.html") {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
            else {
                window.location.href = "/";
            }
            return;
        }
        if (action === "back") {
            if (closeActiveModalIfAny())
                return;
            if (typeof window.switchNativeTab === "function" && _viewIdx > 0) {
                _viewIdx -= 1;
                window.switchNativeTab(_viewStack[_viewIdx], true);
                return;
            }
            if (window.history.length > 1) {
                window.history.back();
            }
            else {
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
            if (!modal)
                continue;
            var inner = modal.firstElementChild;
            if (!inner || inner.querySelector(".rrs-modal-nav-strip"))
                continue;
            var strip = document.createElement("div");
            strip.className = "rrs-modal-nav-strip";
            strip.innerHTML =
                '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">' +
                    '<button type="button" class="rrs-nav-ctrl-btn" id="modalNavBack_' + modalIds[i] + '" onclick="window.rrsNavAction(\'back\')">← Back</button>' +
                    '<a href="/" class="rrs-nav-ctrl-btn rrs-nav-ctrl-home" id="modalNavHome_' + modalIds[i] + '" onclick="window.rrsNavAction(\'home\');return false;">🏠 Home</a>' +
                    '<button type="button" class="rrs-nav-ctrl-btn" id="modalNavFwd_' + modalIds[i] + '" onclick="window.rrsNavAction(\'forward\')">Forward →</button>' +
                    "</div>" +
                    '<span style="font-size:11px;color:#6EE7B7;font-weight:700;">12-Layer Shield</span>';
            inner.insertBefore(strip, inner.firstChild);
        }
    }
    function wrapAppTabSwitcher() {
        if (typeof window.switchNativeTab === "function" && !window.switchNativeTab._rrsWrapped) {
            var orig = window.switchNativeTab;
            window.rrsRecordTabView("claim");
            var wrapped = function (tabId, skipRecord) {
                if (!skipRecord)
                    window.rrsRecordTabView(tabId);
                return orig.apply(this, arguments);
            };
            wrapped._rrsWrapped = true;
            window.switchNativeTab = wrapped;
        }
    }
    function setupClickDelegation() {
        document.addEventListener("click", function (ev) {
            var t = ev.target;
            if (!t || !t.closest)
                return;
            var el = t.closest("button, a, [role='button'], .btn, .choice-a-btn, .nav-pill, .btn-emerald, .btn-outline, .btn-cta, .btn-secondary");
            if (!el)
                return;
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
    }
    else {
        init();
    }
})();
