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
    var TREASURY_ADDR = "89Sv5FvnMNRid1bn8y2Ti1vJPSxWxgiW9GSLsPpBnKK1";
    var TIER_META = {
        single_99c: { key: "single_99c", title: "Single Deep Audit ($0.99 / Scan - Save 80%)", usd: 0.99, regUsd: 4.99, defaultSol: "0.006828", defaultLamports: 6827586, usdc: "0.99" },
        trader_pro_1999: { key: "trader_pro_1999", title: "$19.99/mo Pro (Unlimited 12-Layer Web & Extension)", usd: 19.99, regUsd: 39.99, defaultSol: "0.266000", defaultLamports: 266000000, usdc: "19.99" },
        quant_desk_99: { key: "quant_desk_99", title: "$99/mo Quant (100k/mo <120ms API)", usd: 99.00, regUsd: 199.00, defaultSol: "1.320000", defaultLamports: 1320000000, usdc: "99.00" },
        enterprise_500: { key: "enterprise_500", title: "$500/mo Enterprise API", usd: 500.00, regUsd: 999.00, defaultSol: "6.660000", defaultLamports: 6660000000, usdc: "500.00" }
    };
    var _chkState = {
        tier: "trader_pro_1999",
        asset: "SOL",
        solUsd: 75.00,
        quotes: {
            single_99c: { sol: "0.006828", lamports: 6827586, usdc: "0.99" },
            trader_pro_1999: { sol: "0.266000", lamports: 266000000, usdc: "19.99" },
            quant_desk_99: { sol: "1.320000", lamports: 1320000000, usdc: "99.00" },
            enterprise_500: { sol: "6.660000", lamports: 6660000000, usdc: "500.00" }
        }
    };
    function getApiBaseClean() {
        var host = String((window.location && window.location.hostname) || "").toLowerCase();
        var isStatic = (String(window.location.port || "") !== "8088");
        if (!isStatic)
            return "";
        var cfg = window.__LIVE_ENDPOINT_CONFIG;
        if (cfg && (cfg.endpoint || cfg.api_base))
            return String(cfg.endpoint || cfg.api_base).replace(/\/+$/, "");
        return String(window.BACKEND_TUNNEL_BASE || "").replace(/\/+$/, "");
    }
    window.resolveRrsApiBase = getApiBaseClean;
    function detectInjectedSolanaWallet() {
        if (window.phantom && window.phantom.solana && (window.phantom.solana.isPhantom || window.phantom.solana.connect))
            return window.phantom.solana;
        if (window.solflare && (window.solflare.isSolflare || window.solflare.connect))
            return window.solflare;
        if (window.backpack && window.backpack.solana && window.backpack.solana.connect)
            return window.backpack.solana;
        if (window.solana && window.solana.connect)
            return window.solana;
        return null;
    }
    window.detectInjectedSolanaWallet = detectInjectedSolanaWallet;
    // -------------------------------------------------------------------------
    // Genuine ISO/IEC 18004 QR Version 5-L (37x37, up to 84 UTF-8 bytes) SVG
    // Zero network latency (<2ms synchronous render)
    // -------------------------------------------------------------------------
    var _GF_EXP = new Uint8Array(512);
    var _GF_LOG = new Uint8Array(256);
    (function initGf() {
        var x = 1;
        for (var i = 0; i < 255; i++) {
            _GF_EXP[i] = x;
            _GF_LOG[x] = i;
            x <<= 1;
            if (x & 0x100)
                x ^= 0x11d;
        }
        for (var j = 255; j < 512; j++)
            _GF_EXP[j] = _GF_EXP[j - 255];
    })();
    function gfMul(a, b) { return (a === 0 || b === 0) ? 0 : _GF_EXP[_GF_LOG[a] + _GF_LOG[b]]; }
    function rsEncode22(data86) {
        var gen = [1];
        for (var i = 0; i < 22; i++) {
            var next = new Array(gen.length + 1).fill(0);
            var root = _GF_EXP[i];
            for (var j = 0; j < gen.length; j++) {
                next[j] ^= gen[j];
                next[j + 1] ^= gfMul(gen[j], root);
            }
            gen = next;
        }
        var msg = new Uint8Array(86 + 22);
        msg.set(data86, 0);
        for (var k = 0; k < 86; k++) {
            var coef = msg[k];
            if (coef !== 0) {
                for (var g = 1; g < gen.length; g++)
                    msg[k + g] ^= gfMul(gen[g], coef);
            }
        }
        return msg.slice(86);
    }
    window.renderSolanaPayQrSvg = function (text) {
        try {
            var bytes = Array.from(new TextEncoder().encode(String(text || "").slice(0, 84)));
            var bits = [];
            function pushBits(val, len) { for (var i = len - 1; i >= 0; i--)
                bits.push((val >> i) & 1); }
            pushBits(4, 4);
            pushBits(bytes.length, 8);
            for (var b = 0; b < bytes.length; b++)
                pushBits(bytes[b], 8);
            for (var t = 0; t < 4 && bits.length < 86 * 8; t++)
                bits.push(0);
            while (bits.length % 8 !== 0)
                bits.push(0);
            var data = new Uint8Array(86);
            var bi = 0;
            for (var p = 0; p < bits.length; p += 8) {
                var v = 0;
                for (var q = 0; q < 8; q++)
                    v = (v << 1) | bits[p + q];
                data[bi++] = v;
            }
            var pads = [0xEC, 0x11];
            for (var pi = 0; bi < 86; pi++)
                data[bi++] = pads[pi % 2];
            var ecc = rsEncode22(data);
            var allBytes = new Uint8Array(108);
            allBytes.set(data, 0);
            allBytes.set(ecc, 86);
            var N = 37;
            var mat = Array.from({ length: N }, function () { return new Int8Array(N).fill(-1); });
            function setMod(r, c, val) { if (r >= 0 && r < N && c >= 0 && c < N)
                mat[r][c] = val ? 1 : 0; }
            function placeFinder(fr, fc) {
                for (var dr = -1; dr <= 7; dr++) {
                    for (var dc = -1; dc <= 7; dc++) {
                        var inOuter = (dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6);
                        var isBorder = (dr === 0 || dr === 6 || dc === 0 || dc === 6);
                        var isCore = (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
                        setMod(fr + dr, fc + dc, inOuter && (isBorder || isCore));
                    }
                }
            }
            placeFinder(0, 0);
            placeFinder(0, N - 7);
            placeFinder(N - 7, 0);
            // Alignment at (30, 30)
            for (var ar = -2; ar <= 2; ar++) {
                for (var ac = -2; ac <= 2; ac++) {
                    setMod(30 + ar, 30 + ac, Math.max(Math.abs(ar), Math.abs(ac)) !== 1);
                }
            }
            for (var ti = 8; ti < N - 8; ti++) {
                if (mat[6][ti] === -1)
                    setMod(6, ti, ti % 2 === 0);
                if (mat[ti][6] === -1)
                    setMod(ti, 6, ti % 2 === 0);
            }
            setMod(N - 8, 8, 1);
            // Reserve format areas (Level L = 01, Mask 0 = 000 -> 0x77c4)
            var fmt = 0x77c4;
            var fCoords1 = [[8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8], [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]];
            for (var fi = 0; fi < 15; fi++) {
                var fBit = (fmt >> fi) & 1;
                setMod(fCoords1[fi][0], fCoords1[fi][1], fBit);
                if (fi < 8)
                    setMod(8, N - 1 - fi, fBit);
                else
                    setMod(N - 15 + fi, 8, fBit);
            }
            var stream = [];
            for (var sb = 0; sb < allBytes.length; sb++) {
                for (var sbit = 7; sbit >= 0; sbit--)
                    stream.push((allBytes[sb] >> sbit) & 1);
            }
            var idx = 0, up = true;
            for (var col = N - 1; col >= 1; col -= 2) {
                if (col === 6)
                    col--;
                for (var step = 0; step < N; step++) {
                    var row = up ? (N - 1 - step) : step;
                    for (var dx = 0; dx < 2; dx++) {
                        var cc = col - dx;
                        if (mat[row][cc] === -1) {
                            var bit = idx < stream.length ? stream[idx++] : 0;
                            if ((row + cc) % 2 === 0)
                                bit ^= 1;
                            mat[row][cc] = bit;
                        }
                    }
                }
                up = !up;
            }
            var path = "";
            for (var r = 0; r < N; r++) {
                for (var c = 0; c < N; c++) {
                    if (mat[r][c] === 1)
                        path += "M" + (c + 2) + "," + (r + 2) + "h1v1h-1z";
                }
            }
            return '<svg viewBox="0 0 41 41" width="116" height="116" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><rect width="41" height="41" fill="#FFFFFF"/><path d="' + path + '" fill="#020617"/></svg>';
        }
        catch (_qe) {
            return '<div style="font-size:14px;color:#020617;text-align:center;font-weight:700;">Solana Pay<br>89Sv...nKK1</div>';
        }
    };
    function normalizeTierKey(raw) {
        var s = String(raw || "").toLowerCase();
        if (TIER_META[s])
            return s;
        if (s.indexOf("500") !== -1 || s.indexOf("enterprise") !== -1)
            return "enterprise_500";
        if (s.indexOf("99.00") !== -1 || s.indexOf("quant") !== -1 || s === "99")
            return "quant_desk_99";
        if (s.indexOf("quant") !== -1 || s.indexOf("sniper") !== -1) return "quant_desk_99";
        if (s.indexOf("19.99") !== -1 || s.indexOf("trader") !== -1 || s.indexOf("39.99") !== -1 || s.indexOf("month") !== -1 || s === "monthly_499")
            return "trader_pro_1999";
        if (s.indexOf("single") !== -1 || s.indexOf("0.99") !== -1 || s.indexOf("99c") !== -1 || s === "single_10c" || s === "legacy_tier_removed")
            return "single_99c";
        return "trader_pro_1999";
    }
    function setChkStatus(html, isErr) {
        var b = document.getElementById("chkLiveStatusBanner");
        if (b) {
            b.style.borderColor = isErr ? "#EF4444" : "rgba(16, 185, 129,0.55)";
            b.style.color = isErr ? "#FCA5A5" : "#F8FAFC";
            b.innerHTML = html;
        }
    }
    function renderCheckoutModalState() {
        var tk = _chkState.tier;
        var meta = TIER_META[tk] || TIER_META.trader_pro_1999;
        var q = _chkState.quotes[tk] || { sol: meta.defaultSol, lamports: meta.defaultLamports, usdc: meta.usdc };
        var isUsdc = (_chkState.asset === "USDC");
        var tEl = document.getElementById("chkModalTitle");
        if (tEl)
            tEl.innerText = meta.title + " ($" + meta.usd.toFixed(2) + ")";
        var subEl = document.getElementById("chkModalSubtitle");
        if (subEl)
            subEl.innerText = "Launch $" + meta.usd.toFixed(2) + " (Reg. $" + meta.regUsd.toFixed(2) + ") • New layers included free during active pass, $0 auto-billing";
        window.__RRS_CURRENT_CHK_TIER = _chkState.tier;
        ["single_99c", "trader_pro_1999", "quant_desk_99", "enterprise_500"].forEach(function (k) {
            var tb = document.getElementById("chkTab_" + k);
            if (tb) {
                var active = (k === tk);
                tb.style.border = active ? "1.5px solid #10B981" : "1px solid #334155";
                tb.style.background = active ? "rgba(16, 185, 129,0.16)" : "#0F172A";
            }
        });
        var bSol = document.getElementById("chkAssetBtnSOL");
        var bUsdc = document.getElementById("chkAssetBtnUSDC");
        if (bSol) {
            bSol.style.border = !isUsdc ? "1.5px solid #10B981" : "1px solid #334155";
            bSol.style.background = !isUsdc ? "rgba(16, 185, 129,0.15)" : "#0F172A";
            bSol.style.color = !isUsdc ? "#F8FAFC" : "#CBD5E1";
        }
        if (bUsdc) {
            bUsdc.style.border = isUsdc ? "1.5px solid #10B981" : "1px solid #334155";
            bUsdc.style.background = isUsdc ? "rgba(16, 185, 129,0.15)" : "#0F172A";
            bUsdc.style.color = isUsdc ? "#F8FAFC" : "#CBD5E1";
        }
        var amtTxt = isUsdc ? (q.usdc + " USDC") : (q.sol + " SOL");
        var amtEl = document.getElementById("chkExactAmountDisplay");
        if (amtEl)
            amtEl.innerText = amtTxt;
        var solPayUri = isUsdc
            ? ("solana:" + TREASURY_ADDR + "?amount=" + q.usdc + "&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
            : ("solana:" + TREASURY_ADDR + "?amount=" + q.sol);
        var qrWrap = document.getElementById("chkSolanaPayQrWrap");
        if (qrWrap)
            qrWrap.innerHTML = window.renderSolanaPayQrSvg(solPayUri);
        var deepTarget = "https://rentandrugshield.com/app.html?checkout_tier=" + encodeURIComponent(tk) + "&asset=" + encodeURIComponent(_chkState.asset);
        var phBtn = document.getElementById("chkPhantomMobileDeepLink");
        var sfBtn = document.getElementById("chkSolflareMobileDeepLink");
        if (phBtn)
            phBtn.href = "https://phantom.app/ul/browse/" + encodeURIComponent(deepTarget) + "?ref=" + encodeURIComponent("https://rentandrugshield.com");
        if (sfBtn)
            sfBtn.href = "https://solflare.com/ul/v1/browse/" + encodeURIComponent(deepTarget) + "?ref=" + encodeURIComponent("https://rentandrugshield.com");
        window.__RRS_CHK_STATE = _chkState;
        window.__RRS_RENDER_CHK = renderCheckoutModalState;
        window.__RRS_SET_CHK_STATUS = setChkStatus;
        window.__RRS_APPLY_UNLOCK = applyUnlockTokenResult;
        var prov = detectInjectedSolanaWallet();
        var wBtn = document.getElementById("chkBrowserWalletSignBtn");
        if (wBtn) {
            wBtn.style.display = "block";
            wBtn.innerText = prov ? ("⚡ Approve " + amtTxt + " in Connected Wallet") : ("👻 Connect Phantom / Solflare to Pay " + amtTxt);
        }
    }
    function refreshCheckoutQuoteFromServer() {
        return __awaiter(this, void 0, void 0, function () {
            var r, d, _e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch(getApiBaseClean() + "/api/checkout-quote", { cache: "no-store" })];
                    case 1:
                        r = _b.sent();
                        if (!r || !r.ok)
                            return [2 /*return*/];
                        return [4 /*yield*/, r.json()];
                    case 2:
                        d = _b.sent();
                        if (!d || !d.ok || !d.tiers)
                            return [2 /*return*/];
                        if (d.sol_usd)
                            _chkState.solUsd = Number(d.sol_usd);
                        window.__RRS_CURRENT_CHK_TIER = _chkState.tier;
                        ["single_99c", "trader_pro_1999", "quant_desk_99", "enterprise_500"].forEach(function (k) {
                            var srcTier = d.tiers[k] || (k === "single_99c" ? d.tiers.single_10c : null); if (srcTier) { d.tiers[k] = srcTier;
                                _chkState.quotes[k] = {
                                    sol: String(d.tiers[k].sol),
                                    lamports: Number(d.tiers[k].lamports || 0),
                                    usdc: String(d.tiers[k].usdc || TIER_META[k].usdc)
                                };
                            }
                        });
                        renderCheckoutModalState();
                        return [3 /*break*/, 4];
                    case 3:
                        _e_1 = _b.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function applyUnlockTokenResult(vRes, sig, tk) {
        if (tk === "legacy_tier_removed" && !(vRes && (vRes.plan === "MONTHLY_PRO_PASS_499" || vRes.plan === "SERVICE2_199_LAUNCH_PASS"))) {
            var cur = parseInt(localStorage.getItem("dex6_single_audit_credits") || "0", 10);
            localStorage.setItem("dex6_single_audit_credits", String(cur + 1));
            if (vRes && vRes.single_scan_token) {
                var q = [];
                try {
                    q = JSON.parse(localStorage.getItem("dex6_single_audit_tokens") || "[]");
                }
                catch (_e) { }
                if (!Array.isArray(q))
                    q = [];
                q.push(vRes.single_scan_token);
                localStorage.setItem("dex6_single_audit_tokens", JSON.stringify(q));
            }
            setChkStatus("✅ <b>12-Layer Audit Unlocked!</b> Verified on-chain. Paste any mint to scan now.", false);
        }
        else {
            if (vRes && vRes.pro_pass_token) {
                localStorage.setItem("rrs_pro_pass_token", vRes.pro_pass_token);
            }
            localStorage.setItem("dex6_pro_pass_unlocked", "1");
            var apiKeyMsg = (vRes && vRes.api_key) ? (" • API Key: <code>" + vRes.api_key + "</code>") : "";
            setChkStatus("✅ <b>Unlimited Pass Activated!</b> Verified on Solana Mainnet" + apiKeyMsg, false);
        }
        if (typeof window.updateDemoBadge === "function")
            try {
                window.updateDemoBadge();
            }
            catch (_u) { }
        if (window.__RRS_PENDING_MINT) {
            var pm = window.__RRS_PENDING_MINT;
            setTimeout(function () {
                window.closeLiveCheckoutModal();
                if (typeof window.scanToken === "function")
                    window.scanToken(false, pm);
                else if (typeof window.runMintAudit === "function")
                    window.runMintAudit();
            }, 800);
        }
    }
    // Pre-warm blockhash & SOL/USD quote at 0ms (sessionStorage + parallel Mainnet RPC race) for <500ms wallet checkout!
    _chkState.recentBlockhash = "";
    try {
        var _cachedBhObj = JSON.parse(sessionStorage.getItem("rrs_fast_bh_v1") || "null");
        if (_cachedBhObj && _cachedBhObj.bh && (Date.now() - Number(_cachedBhObj.ts || 0)) < 45000) {
            _chkState.recentBlockhash = String(_cachedBhObj.bh);
        }
    }
    catch (_sErr) { }
    function _saveFastBlockhash(bhStr) {
        if (!bhStr)
            return;
        _chkState.recentBlockhash = String(bhStr);
        try {
            sessionStorage.setItem("rrs_fast_bh_v1", JSON.stringify({ bh: _chkState.recentBlockhash, ts: Date.now() }));
        }
        catch (_e) { }
    }
    function _raceFastBlockhash(timeoutMs) {
        return __awaiter(this, void 0, void 0, function () {
            var ms, ctrl, tid, pApi, pRpc, winner, _rErr_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (_chkState.recentBlockhash)
                            return [2 /*return*/, _chkState.recentBlockhash];
                        ms = timeoutMs || 360;
                        ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
                        tid = ctrl ? setTimeout(function () { try {
                            ctrl.abort();
                        }
                        catch (_a) { } }, ms) : null;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        pApi = fetch(getApiBaseClean() + "/api/checkout-quote", { cache: "no-store", signal: ctrl ? ctrl.signal : undefined })
                            .then(function (r) { return r.ok ? r.json() : Promise.reject("bad"); })
                            .then(function (d) {
                            if (d && d.recent_blockhash) {
                                _saveFastBlockhash(d.recent_blockhash);
                                return String(d.recent_blockhash);
                            }
                            return Promise.reject("no_bh");
                        });
                        pRpc = fetch(getApiBaseClean() + "/api/rpc", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getLatestBlockhash", params: [{ commitment: "confirmed" }] }),
                            signal: ctrl ? ctrl.signal : undefined
                        }).then(function (r) { return r.ok ? r.json() : Promise.reject("bad_rpc"); })
                            .then(function (j) {
                            var bh = j && j.result && j.result.value && j.result.value.blockhash;
                            if (bh) {
                                _saveFastBlockhash(bh);
                                return String(bh);
                            }
                            return Promise.reject("no_rpc_bh");
                        });
                        return [4 /*yield*/, (typeof Promise.any === "function" ? Promise.any([pApi, pRpc]) : pApi.catch(function () { return pRpc; }))];
                    case 2:
                        winner = _b.sent();
                        if (tid)
                            clearTimeout(tid);
                        return [2 /*return*/, winner || _chkState.recentBlockhash];
                    case 3:
                        _rErr_1 = _b.sent();
                        if (tid)
                            clearTimeout(tid);
                        return [2 /*return*/, _chkState.recentBlockhash];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    refreshCheckoutQuoteFromServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var r, d, _e_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _raceFastBlockhash(1500);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch(getApiBaseClean() + "/api/checkout-quote", { cache: "no-store" })];
                    case 2:
                        r = _b.sent();
                        if (!r || !r.ok)
                            return [2 /*return*/];
                        return [4 /*yield*/, r.json()];
                    case 3:
                        d = _b.sent();
                        if (!d || !d.ok)
                            return [2 /*return*/];
                        if (d.sol_usd)
                            _chkState.solUsd = Number(d.sol_usd);
                        if (d.recent_blockhash)
                            _saveFastBlockhash(d.recent_blockhash);
                        if (d.tiers) {
                            window.__RRS_CURRENT_CHK_TIER = _chkState.tier;
                            ["single_99c", "trader_pro_1999", "quant_desk_99", "enterprise_500"].forEach(function (k) {
                                var srcTier = d.tiers[k] || (k === "single_99c" ? d.tiers.single_10c : null); if (srcTier) { d.tiers[k] = srcTier;
                                    _chkState.quotes[k] = {
                                        sol: String(d.tiers[k].sol),
                                        lamports: Number(d.tiers[k].lamports || 0),
                                        usdc: String(d.tiers[k].usdc || TIER_META[k].usdc)
                                    };
                                }
                            });
                        }
                        renderCheckoutModalState();
                        return [3 /*break*/, 5];
                    case 4:
                        _e_2 = _b.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    refreshCheckoutQuoteFromServer();
    setInterval(refreshCheckoutQuoteFromServer, 20000);
    window.triggerInjectedWalletCheckout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var prov, tk, asset, q, payer, bhPromise, crArr, cr, tx, sw3, lamports, fromPk, toPk, endpoint, reqBody, ctrl, tid, buildRes, raw, sigRes, _b, sig, inp, vRes, err_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        prov = detectInjectedSolanaWallet();
                        if (!prov) {
                            setChkStatus("No browser wallet extension detected. Scan the <b>Solana Pay QR</b>, tap <b>1-Click Mobile Deep-Link</b>, or copy exact SOL/USDC &amp; Treasury <code>89Sv...nKK1</code> below.", false);
                            return [2 /*return*/];
                        }
                        tk = _chkState.tier;
                        asset = _chkState.asset;
                        q = _chkState.quotes[tk] || { sol: TIER_META[tk].defaultSol, lamports: TIER_META[tk].defaultLamports, usdc: TIER_META[tk].usdc };
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 14, , 15]);
                        setChkStatus("⚡ Opening live wallet signature prompt...", false);
                        payer = (prov.isConnected && prov.publicKey) ? prov.publicKey.toString() : "";
                        bhPromise = _chkState.recentBlockhash ? Promise.resolve(_chkState.recentBlockhash) : _raceFastBlockhash(360);
                        if (!!payer) return [3 /*break*/, 3];
                        return [4 /*yield*/, Promise.all([prov.connect({ onlyIfTrusted: false }), bhPromise])];
                    case 2:
                        crArr = _c.sent();
                        cr = crArr[0];
                        payer = (cr && cr.publicKey) ? cr.publicKey.toString() : (prov.publicKey ? prov.publicKey.toString() : "");
                        return [3 /*break*/, 5];
                    case 3:
                        if (!!_chkState.recentBlockhash) return [3 /*break*/, 5];
                        return [4 /*yield*/, bhPromise];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        if (!payer) {
                            setChkStatus("Wallet connected without public key. Scan Solana Pay QR or copy exact SOL/USDC below.", true);
                            return [2 /*return*/];
                        }
                        tx = null;
                        if (!(asset === "SOL" && window.solanaWeb3 && _chkState.recentBlockhash && !(window.getActiveAffiliateRefWallet && window.getActiveAffiliateRefWallet(payer)))) return [3 /*break*/, 6];
                        sw3 = window.solanaWeb3;
                        lamports = Number(q.lamports || TIER_META[tk].defaultLamports || 1333156);
                        fromPk = new sw3.PublicKey(payer);
                        toPk = new sw3.PublicKey(TREASURY_ADDR);
                        tx = new sw3.Transaction({
                            recentBlockhash: _chkState.recentBlockhash,
                            feePayer: fromPk
                        });
                        if (sw3.ComputeBudgetProgram) {
                            tx.add(sw3.ComputeBudgetProgram.setComputeUnitLimit({ units: 100000 }));
                            tx.add(sw3.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 10000 }));
                        }
                        tx.add(sw3.SystemProgram.transfer({
                            fromPubkey: fromPk,
                            toPubkey: toPk,
                            lamports: lamports
                        }));
                        return [3 /*break*/, 8];
                    case 6:
                        endpoint = (tk === "legacy_tier_removed") ? "/api/build-single-audit-tx" : "/api/build-pass-tx";
                        reqBody = (tk === "legacy_tier_removed")
                            ? { wallet: payer, asset: asset, tier: "legacy_tier_removed" }
                            : { wallet: payer, asset: asset, tier: tk, sol_amount: Number(q.sol || TIER_META[tk].defaultSol), tier_label: TIER_META[tk].title };
                        ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
                        tid = ctrl ? setTimeout(function () { ctrl.abort(); }, 440) : null;
                        return [4 /*yield*/, fetch(getApiBaseClean() + endpoint, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(reqBody),
                                signal: ctrl ? ctrl.signal : undefined
                            }).then(function (r) { return r.json(); }).catch(function () { return null; })];
                    case 7:
                        buildRes = _c.sent();
                        if (tid)
                            clearTimeout(tid);
                        if (!buildRes || !buildRes.ok || !buildRes.tx_base64) {
                            setChkStatus("⚡ Scan the <b>Solana Pay QR</b> or copy exact <code>" + asset + "</code> &amp; Treasury <code>89Sv...nKK1</code> below for instant unlock.", false);
                            return [2 /*return*/];
                        }
                        raw = Uint8Array.from(atob(buildRes.tx_base64), function (c) { return c.charCodeAt(0); });
                        tx = window.solanaWeb3.Transaction.from(raw);
                        _c.label = 8;
                    case 8:
                        if (!(typeof prov.signAndSendTransaction === "function")) return [3 /*break*/, 10];
                        return [4 /*yield*/, prov.signAndSendTransaction(tx)];
                    case 9:
                        _b = _c.sent();
                        return [3 /*break*/, 12];
                    case 10: return [4 /*yield*/, window.BLOWFISH_PHANTOM_TX_GUARD.signAndSendClean(prov, tx)];
                    case 11:
                        _b = _c.sent();
                        _c.label = 12;
                    case 12:
                        sigRes = _b;
                        sig = String((sigRes && sigRes.signature) || sigRes || "");
                        inp = document.getElementById("chkLiveTxSigInp");
                        if (inp && sig)
                            inp.value = sig;
                        setChkStatus("⛓️ Confirming TX <code>" + sig.slice(0, 12) + "...</code> on Solana Mainnet...", false);
                        return [4 /*yield*/, fetch(getApiBaseClean() + "/api/verify-payment", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ wallet: payer, tx_signature: sig, tier: tk })
                            }).then(function (r) { return r.json(); })];
                    case 13:
                        vRes = _c.sent();
                        if (vRes && vRes.ok && vRes.verified_onchain) {
                            applyUnlockTokenResult(vRes, sig, tk);
                        }
                        else {
                            setChkStatus("TX broadcast (<code>" + sig.slice(0, 12) + "...</code>). Click <b>Verify On-Chain Payment</b> in 2s once confirmed.", false);
                        }
                        return [3 /*break*/, 15];
                    case 14:
                        err_1 = _c.sent();
                        setChkStatus("Wallet prompt dismissed (" + (err_1 && err_1.message ? err_1.message : "use QR/Copy below") + "). Scan the Solana Pay QR or copy exact amount below.", false);
                        return [3 /*break*/, 15];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    window.openLiveCheckout = function (tierRaw, assetRaw) {
        // Close any legacy modals so only 1 crisp modal is visible
        ["singleAudit2cModal", "appSingleAudit2cModal", "app-billing-modal"].forEach(function (id) {
            var el = document.getElementById(id);
            if (el)
                el.style.display = "none";
        });
        _chkState.tier = normalizeTierKey(tierRaw);
        if (assetRaw)
            _chkState.asset = String(assetRaw).toUpperCase() === "USDC" ? "USDC" : "SOL";
        var modal = document.getElementById("liveCheckoutModal");
        if (modal) {
            modal.removeAttribute("hidden");
            modal.setAttribute("aria-hidden", "false");
            modal.style.display = "flex";
        }
        renderCheckoutModalState();
        var prov = detectInjectedSolanaWallet();
        if (prov) {
            setChkStatus("⚡ Wallet detected: opening live signature popup...", false);
            window.triggerInjectedWalletCheckout();
        }
        else {
            var meta = TIER_META[_chkState.tier] || TIER_META.trader_pro_1999;
            setChkStatus(" <b>$" + meta.usd.toFixed(2) + " Instant Solana Checkout Ready:</b> Connect Phantom/Solflare Wallet Extension, scan the Solana Pay QR, or copy the exact amount &amp; click Verify.", false);
        }
        refreshCheckoutQuoteFromServer();
    };
    window.closeLiveCheckoutModal = function () {
        var modal = document.getElementById("liveCheckoutModal");
        if (modal)
            modal.style.display = "none";
    };
    window.switchLiveCheckoutTier = function (tierKey) {
        _chkState.tier = normalizeTierKey(tierKey);
        renderCheckoutModalState();
        var meta = TIER_META[_chkState.tier] || TIER_META.trader_pro_1999;
        setChkStatus("Selected <b>" + meta.title + " ($" + meta.usd.toFixed(2) + ")</b>. Ready to pay via Wallet, QR, or Copy.", false);
    };
    window.switchLiveCheckoutAsset = function (assetStr) {
        _chkState.asset = (String(assetStr).toUpperCase() === "USDC") ? "USDC" : "SOL";
        renderCheckoutModalState();
    };
    function copyTextSafe(val) {
        return __awaiter(this, void 0, void 0, function () {
            var _e_3, ta;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(navigator.clipboard && navigator.clipboard.writeText)) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, navigator.clipboard.writeText(val)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 3:
                        _e_3 = _b.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        try {
                            ta = document.createElement("textarea");
                            ta.value = val;
                            ta.style.position = "fixed";
                            ta.style.left = "-9999px";
                            document.body.appendChild(ta);
                            ta.select();
                            document.execCommand("copy");
                            ta.remove();
                            return [2 /*return*/, true];
                        }
                        catch (_e2) {
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    window.copyCheckoutExactAmount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var q, val, btn;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        q = _chkState.quotes[_chkState.tier] || TIER_META[_chkState.tier];
                        val = (_chkState.asset === "USDC") ? String(q.usdc) : String(q.sol);
                        return [4 /*yield*/, copyTextSafe(val)];
                    case 1:
                        _b.sent();
                        btn = document.getElementById("chkCopyAmountBtn");
                        if (btn) {
                            btn.innerText = "✅ Copied!";
                            setTimeout(function () { btn.innerText = "📋 Copy Amount"; }, 1800);
                        }
                        setChkStatus("✅ Copied exact amount <code>" + val + " " + _chkState.asset + "</code>! Send to <code>89Sv...nKK1</code> then click Verify below.", false);
                        return [2 /*return*/];
                }
            });
        });
    };
    window.copyCheckoutTreasuryAddr = function () {
        return __awaiter(this, void 0, void 0, function () {
            var btn;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, copyTextSafe(TREASURY_ADDR)];
                    case 1:
                        _b.sent();
                        btn = document.getElementById("chkCopyTreasuryBtn");
                        if (btn) {
                            btn.innerText = "✅ Copied!";
                            setTimeout(function () { btn.innerText = "📋 Copy Address"; }, 1800);
                        }
                        setChkStatus("✅ Copied Treasury Address <code>" + TREASURY_ADDR + "</code>!", false);
                        return [2 /*return*/];
                }
            });
        });
    };
    window.verifyCheckoutOnChainNow = function () {
        return __awaiter(this, void 0, void 0, function () {
            var inp, rawVal, tk, q, isSig, isSender, payload, r, d, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        inp = document.getElementById("chkLiveTxSigInp");
                        rawVal = inp ? inp.value.trim() : "";
                        tk = _chkState.tier;
                        q = _chkState.quotes[tk] || TIER_META[tk];
                        isSig = rawVal.length >= 60;
                        isSender = (!isSig && rawVal.length >= 32 && rawVal.length <= 44);
                        setChkStatus("🔍 Checking Solana Mainnet RPC for confirmed payment to <code>89Sv...nKK1</code>...", false);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        payload = {
                            auto_detect: !isSig,
                            tier: tk,
                            asset: _chkState.asset,
                            expected_lamports: Number(q.lamports || 0),
                            tx_signature: isSig ? rawVal : "",
                            sender_wallet: isSender ? rawVal : ""
                        };
                        return [4 /*yield*/, fetch(getApiBaseClean() + "/api/verify-payment", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload)
                            })];
                    case 2:
                        r = _b.sent();
                        return [4 /*yield*/, r.json()];
                    case 3:
                        d = _b.sent();
                        if (d && d.ok && d.verified_onchain) {
                            applyUnlockTokenResult(d, d.tx_signature || rawVal, tk);
                        }
                        else {
                            setChkStatus("ℹ️ " + ((d && d.error) || "No recent unredeemed transfer matched yet. Once your wallet confirms on Solana Mainnet (~2s), click Verify again or paste the TX signature."), true);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _b.sent();
                        setChkStatus("⚠️ Verification network check failed: " + (e_1.message || e_1), true);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Wire ALL legacy & Choice A pricing / modal functions to unified <500ms checkout!
    window.openSingleAudit2cModal = function () { window.openLiveCheckout("trader_pro_1999", "SOL"); };
    window.closeSingleAudit2cModal = window.closeLiveCheckoutModal;
    window.executeSingleAudit2cPay = function (asset) { window.openLiveCheckout("trader_pro_1999", asset || "SOL"); };
    window.openAppSingleAudit2cModal = function () { window.openLiveCheckout("trader_pro_1999", "SOL"); };
    window.closeAppSingleAudit2cModal = window.closeLiveCheckoutModal;
    window.buyAppSingleAudit2c = function (asset) { window.openLiveCheckout("trader_pro_1999", asset || "SOL"); };
    window.openInstantBuyBubble = function (tier) { window.openLiveCheckout(tier, "SOL"); };
    window.closeInstantBuyBubble = window.closeLiveCheckoutModal;
    window.executeInstantPhantomPassIndex = function (solAmt, lbl) {
        var tk = (Number(solAmt) >= 0.05 || String(lbl || "").indexOf("19.99") !== -1 || String(lbl || "").indexOf("39.99") !== -1) ? "trader_pro_1999" : "day_199";
        window.openLiveCheckout(tk, "SOL");
    };
    window.buyProPass = function (solAmt, lbl) {
        var tk = (Number(solAmt) >= 0.05 || String(lbl || "").indexOf("19.99") !== -1 || String(lbl || "").indexOf("39.99") !== -1) ? "trader_pro_1999" : "day_199";
        window.openLiveCheckout(tk, "SOL");
    };
    // Enhanced Deduct from Reclaimed SOL (opens modal immediately if no wallet/address!)
    var _origDeduct = window.deductUnlimitedPassFromRecoveredSol;
    window.deductUnlimitedPassFromRecoveredSol = function (pendingMint) {
        return __awaiter(this, void 0, void 0, function () {
            var prov, wInp, wallet, modal, deepApp, phUl;
            return __generator(this, function (_b) {
                if (pendingMint)
                    window.__RRS_PENDING_MINT = pendingMint;
                prov = detectInjectedSolanaWallet();
                wInp = document.getElementById("walletInput") || document.getElementById("w-inp");
                wallet = (wInp && wInp.value) ? wInp.value.trim() : ((window.__RRS_LAST_WALLET_META && window.__RRS_LAST_WALLET_META.wallet_address) || "");
                if (!prov && !wallet) {
                    window.openLiveCheckout("trader_pro_1999", "SOL");
                    setChkStatus("💎 <b>Deduct Pass from Reclaimed SOL:</b> Connect Phantom/Solflare Wallet Extension above (auto-scans &amp; deducts from empty ATAs with 0% 1st-claim fee), or pay directly via Solana Pay QR below!", false);
                    return [2 /*return*/];
                }
                if (typeof _origDeduct === "function") {
                    modal = document.getElementById("liveCheckoutModal");
                    if (!prov && modal) {
                        window.openLiveCheckout("trader_pro_1999", "SOL");
                        deepApp = "https://rentandrugshield.com/app.html?wallet=" + encodeURIComponent(wallet) + "&deduct199=1";
                        phUl = "https://phantom.app/ul/browse/" + encodeURIComponent(deepApp) + "?ref=" + encodeURIComponent("https://rentandrugshield.com");
                        setChkStatus('💎 Ready to bundle empty ATAs + $19.99/mo Pro for <code>' + wallet.slice(0, 4) + '...' + wallet.slice(-4) + '</code>: <a href="' + phUl + '" style="color:#10B981;text-decoration:underline;font-weight:700;" class="rrs-mobile-only-paybtn">Open Mobile Wallet to Sign ↗</a> (or use Solana Pay QR below).', false);
                        return [2 /*return*/];
                    }
                    return [2 /*return*/, _origDeduct(pendingMint)];
                }
                return [2 /*return*/];
            });
        });
    };
    // -------------------------------------------------------------------------
    // Public Beta & Bottom-Right Feedback Modal Handlers (-> :8088 /api/feedback)
    // -------------------------------------------------------------------------
    window.openPublicBetaModal = function (mode) {
        var m = document.getElementById("publicBetaFeedbackModal");
        if (m)
            m.style.display = "flex";
        var inp = document.getElementById("betaModalMsgInp");
        if (inp && mode === "feedback")
            setTimeout(function () { inp.focus(); }, 60);
    };
    window.closePublicBetaModal = function () {
        var m = document.getElementById("publicBetaFeedbackModal");
        if (m)
            m.style.display = "none";
    };
    window.submitPublicBetaFeedback = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cnt, msgEl, msg, st, wInp, d, _e_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cnt = (document.getElementById("betaModalContactInp") || {}).value || "";
                        msgEl = document.getElementById("betaModalMsgInp");
                        msg = (msgEl && msgEl.value ? msgEl.value : "").trim();
                        st = document.getElementById("betaModalStatusMsg");
                        if (!st)
                            return [2 /*return*/];
                        st.style.display = "block";
                        if (!msg) {
                            st.style.borderColor = "#FACC15";
                            st.style.color = "#FEF08A";
                            st.innerText = "Please enter your feedback or early access note first.";
                            return [2 /*return*/];
                        }
                        st.style.borderColor = "#38BDF8";
                        st.style.color = "#E0F2FE";
                        st.innerText = "Sending to our Engineering & Product Roadmap...";
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        wInp = document.getElementById("walletInput") || document.getElementById("w-inp");
                        return [4 /*yield*/, window.__rrsResilientFeedbackPost("/api/feedback", {
                                category: "public_beta_feedback",
                                contact: cnt.trim(),
                                message: msg,
                                wallet: (wInp && wInp.value) ? wInp.value.trim() : ""
                            })];
                    case 2:
                        d = _b.sent();
                        if (d && d.ok !== false) {
                            st.style.borderColor = "#10B981";
                            st.style.color = "#10B981";
                            st.innerText = "Thank you! Your message has been received by our Engineering & Product Roadmap.";
                            if (msgEl)
                                msgEl.value = "";
                        }
                        else {
                            st.style.borderColor = "#EF4444";
                            st.style.color = "#FCA5A5";
                            st.innerText = (d && d.error) || "Could not submit feedback right now.";
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _e_4 = _b.sent();
                        st.style.borderColor = "#EF4444";
                        st.style.color = "#FCA5A5";
                        st.innerText = "Network error reaching feedback service.";
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Watch Demo -> Animated Cursor Step-by-Step Walkthrough
    // -------------------------------------------------------------------------
    window.openWatchDemoModal = function () {
        if (typeof window.startInteractiveCursorTour === "function") {
            window.startInteractiveCursorTour();
            return;
        }
        var m = document.getElementById("watchDemoWalkthroughModal");
        if (m)
            m.style.display = "flex";
    };
    window.closeWatchDemoModal = function () {
        var m = document.getElementById("watchDemoWalkthroughModal");
        if (m)
            m.style.display = "none";
    };
    // -------------------------------------------------------------------------
    // Periodic 90s Non-Flashing Slide-In "Enable 10 Free Pings" Bubble
    // -------------------------------------------------------------------------
    var _pingsDismissedAt = 0;
    function showPeriodic90sPingsBubble() {
        try {
            if (localStorage.getItem("rs_alerts_opted_in") === "1")
                return;
        }
        catch (_e) { }
        var b = document.getElementById("periodic90sPingsBubble");
        if (!b)
            return;
        b.style.display = "block";
        requestAnimationFrame(function () {
            b.classList.add("rrs-slide-visible");
        });
    }
    window.dismissPeriodic90sPingsBubble = function () {
        _pingsDismissedAt = Date.now();
        var b = document.getElementById("periodic90sPingsBubble");
        if (!b)
            return;
        b.classList.remove("rrs-slide-visible");
        setTimeout(function () { b.style.display = "none"; }, 320);
    };
    window.openPingHandshakeModal = showPeriodic90sPingsBubble;
    window.savePeriodicPingsOptIn = function (mode) {
        return __awaiter(this, void 0, void 0, function () {
            var inp, st, contact, perm, _b, _np_1, ch, r, d, _err_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        inp = document.getElementById("periodic90sContactInp");
                        st = document.getElementById("periodic90sStatusMsg");
                        contact = (inp && inp.value ? inp.value : "").trim();
                        if (st)
                            st.style.display = "block";
                        if (mode === "handle" && !contact) {
                            if (st) {
                                st.style.color = "#FEF08A";
                                st.innerText = "Enter your @telegram handle or email, or click Browser Push below.";
                            }
                            return [2 /*return*/];
                        }
                        perm = "default";
                        if (!(mode === "browser" && "Notification" in window)) return [3 /*break*/, 6];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, , 6]);
                        if (!(Notification.permission === "default")) return [3 /*break*/, 3];
                        return [4 /*yield*/, Notification.requestPermission().catch(function () { return "default"; })];
                    case 2:
                        _b = _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _b = Notification.permission;
                        _c.label = 4;
                    case 4:
                        perm = _b;
                        return [3 /*break*/, 6];
                    case 5:
                        _np_1 = _c.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        ch = contact
                            ? ((contact.indexOf("@") === 0 || contact.toLowerCase().indexOf("t.me/") !== -1) ? "telegram" : (contact.indexOf("@") !== -1 ? "email" : "contact"))
                            : "browser";
                        if (st) {
                            st.style.color = "#38BDF8";
                            st.innerText = "Saving 10 Free Pings alert preferences...";
                        }
                        _c.label = 7;
                    case 7:
                        _c.trys.push([7, 10, , 11]);
                        return [4 /*yield*/, fetch(getApiBaseClean() + "/api/opt-in-alerts", {
                                method: "POST",
                                mode: "cors",
                                credentials: "omit",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    channel: ch,
                                    contact: contact,
                                    telegram: contact.indexOf("@") === 0 ? contact : "",
                                    browser_push: (mode === "browser" || !contact),
                                    notification_permission: perm,
                                    page: (window.location && window.location.pathname) || "/"
                                })
                            })];
                    case 8:
                        r = _c.sent();
                        return [4 /*yield*/, r.json()];
                    case 9:
                        d = _c.sent();
                        if (r.ok && d && d.ok) {
                            try {
                                localStorage.setItem("rs_alerts_opted_in", "1");
                            }
                            catch (_ls) { }
                            if (st) {
                                st.style.color = "#10B981";
                                st.innerText = contact
                                    ? ("✅ Saved (" + contact + ")! 10 Free Pings active.")
                                    : "✅ Browser Push Pings enabled! Thank you.";
                            }
                            if (inp)
                                inp.value = "";
                            setTimeout(window.dismissPeriodic90sPingsBubble, 2200);
                        }
                        else if (st) {
                            st.style.color = "#FCA5A5";
                            st.innerText = (d && d.error) || "Could not save alert preferences.";
                        }
                        return [3 /*break*/, 11];
                    case 10:
                        _err_1 = _c.sent();
                        if (st) {
                            st.style.color = "#FCA5A5";
                            st.innerText = "Network error saving alert preferences.";
                        }
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    // Slide in cleanly every 90s (non-flashing, dismissible)
    /* v315: disabled periodic auto-open popup; opens strictly on explicit user click */
    // Also wire app.html #tab-pro submitAppFreePings cleanly to /api/opt-in-alerts (200 OK, no broken 4-digit box)
    window.submitAppFreePings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var inp, st, vb, contact, ch, r, d, _e_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        inp = document.getElementById("app-ping-contact-inp");
                        st = document.getElementById("app-ping-status");
                        vb = document.getElementById("app-ping-verify-box");
                        if (vb)
                            vb.style.display = "none";
                        contact = (inp && inp.value ? inp.value : "").trim();
                        if (st)
                            st.style.display = "block";
                        ch = contact ? (contact.indexOf("@") === 0 ? "telegram" : (contact.indexOf("@") !== -1 ? "email" : "contact")) : "browser";
                        if (st) {
                            st.style.color = "#38BDF8";
                            st.innerText = "Saving 10 Free Pings alert preferences...";
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch(getApiBaseClean() + "/api/opt-in-alerts", {
                                method: "POST",
                                mode: "cors",
                                credentials: "omit",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ channel: ch, contact: contact, browser_push: !contact, page: "/app.html" })
                            })];
                    case 2:
                        r = _b.sent();
                        return [4 /*yield*/, r.json()];
                    case 3:
                        d = _b.sent();
                        if (r.ok && d && d.ok) {
                            try {
                                localStorage.setItem("rs_alerts_opted_in", "1");
                            }
                            catch (_ls) { }
                            if (st) {
                                st.style.color = "#10B981";
                                st.innerText = contact ? ("✅ Saved (" + contact + ")! 10 Free Pings active.") : "✅ Browser Push Pings enabled! Thank you.";
                            }
                            if (inp)
                                inp.value = "";
                        }
                        else if (st) {
                            st.style.color = "#FCA5A5";
                            st.innerText = (d && d.error) || "Could not save alert preferences.";
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        _e_5 = _b.sent();
                        if (st) {
                            st.style.color = "#FCA5A5";
                            st.innerText = "Network error saving alert preferences.";
                        }
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Handle deep-link query params (?checkout_tier=..., ?single10c=..., ?single2c=..., ?buy_pass=..., ?deduct199=1)
    window.addEventListener("DOMContentLoaded", function () {
        var params = new URLSearchParams(window.location.search);
        var cTier = params.get("checkout_tier");
        var s10 = params.get("single10c") || params.get("single2c");
        var bPass = params.get("buy_pass");
        var ded = params.get("deduct199");
        var qW = (params.get("wallet") || params.get("w") || "").trim();
        var qAutoClaim = params.get("auto_claim") === "1" || params.get("autoclaim") === "1";
        /* v315: only open checkout modal when explicit ?checkout_tier= deep-link is navigated */
        if (cTier && typeof window.openLiveCheckout === "function") {
            window.openLiveCheckout(cTier, params.get("asset") || "SOL");
        }
        if (false && qW) {
            if (typeof window.scanWallet === "function") {
                window.scanWallet(qW, "rent").then(function () {
                    if (detectInjectedSolanaWallet() && typeof window.reclaimSolNow === "function") {
                        window.reclaimSolNow("all");
                    }
                });
            }
        }
    });
})();;

(function(){
  function fireTourMilestone(pct, isDone){
    try {
      var apiB = (typeof window.resolveRrsApiBase === "function") ? window.resolveRrsApiBase() : "";
      fetch(apiB + "/api/telemetry/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: isDone ? "video_complete" : "video_milestone",
          video_milestone: pct + "%",
          video_watch_pct: pct,
          button_name: "watch_demo_cursor_" + pct + "pct",
          page: window.location.pathname || "/"
        })
      }).catch(function(){});
    } catch(_e){}
  }

  window.startInteractiveCursorTour = function(){
    if (typeof window.pingShieldTelemetry === "function") window.pingShieldTelemetry("started_demo_tour");
    fireTourMilestone(25, false);
    var oldC = document.getElementById("tour-cursor-overlay");
    if (oldC) oldC.remove();

    var wrap = document.createElement("div");
    wrap.id = "tour-cursor-overlay";
    wrap.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:100150;";
    var cur = document.createElement("div");
    cur.style.cssText = "position:fixed;left:42%;top:20%;transition:all 0.95s cubic-bezier(0.22,1,0.36,1);z-index:100151;pointer-events:auto;";
    cur.innerHTML = '<div style="font-size:30px;filter:drop-shadow(0 0 14px #10b981);pointer-events:none;">🖱️</div>'
      + '<div id="tour-step-bubble" style="margin-top:4px;width:min(380px, calc(100vw - 28px));background:#042f2e;border:2px solid #34d399;color:#ecfdf5;padding:12px 14px;border-radius:12px;font-size:12.5px;line-height:1.5;font-weight:600;box-shadow:0 16px 42px rgba(0,0,0,0.92);"></div>';
    wrap.appendChild(cur);
    document.body.appendChild(wrap);

    var wi = document.getElementById("walletInput") || document.getElementById("w-inp");
    var fsBtn = document.getElementById("nonCustodialTrustBadge") || document.getElementById("pasteReadOnlyWalletBtn") || document.getElementById("paste-wallet-btn") || wi;
    var discBtn = document.getElementById("panel1DisconnectWalletBtn") || document.getElementById("disc-btn") || wi;
    var burnBtn = document.getElementById("burnerScanBtn") || document.getElementById("burn-scan-btn") || wi;
    var shieldInp = document.getElementById("mintInput") || document.getElementById("m-inp") || document.body;
    var proofSec = document.getElementById("verifiedFullCycleFeedSection") || document.getElementById("tab-proof") || document.body;
    var passSec = document.getElementById("appShieldSingleAudit2cBtn") || document.body;

    var steps = [
      {
        el: wi,
        pct: 25,
        html: "🟢 <b>STEP 1/7 • 100% READ-ONLY WALLET INPUT:</b><br>Paste any public 44-character Solana address here. We NEVER auto-fill this box behind your back, and you never need to connect a wallet to run a Free Read-Only Scan."
      },
      {
        el: fsBtn,
        pct: 40,
        html: "🛡️ <b>STEP 2/7 • NON-CUSTODIAL SPL CLOSEACCOUNT:</b><br>Every rent recovery uses native Solana <code>TokenProgram::CloseAccount (0x09)</code> with <b>Zero Blind Approvals</b>, zero private keys, and 0% fee on your 1st claim."
      },
      {
        el: discBtn,
        pct: 55,
        html: "🔒 <b>STEP 3/7 • VERIFIED HARD DISCONNECT:</b><br>Unlike shady dApps that fake-disconnect while keeping your wallet hooked, clicking <b>🔌 Disconnect Wallet</b> executes <code>await provider.disconnect()</code>, wipes local/session storage, clears the input, and shows <b>Wallet Disconnected</b>."
      },
      {
        el: burnBtn,
        pct: 70,
        html: "🔥 <b>STEP 4/7 • RENT SCAN &amp; DEAD TOKEN INCINERATOR:</b><br>Close empty SPL &amp; Token-2022 accounts (~0.00204 SOL rent each) or burn dead rugged dust tokens in one atomic locally-signed transaction."
      },
      {
        el: shieldInp,
        pct: 85,
        html: "🛡️ <b>STEP 5/7 • 11-LAYER PRE-BUY ANTI-RUG SHIELD:</b><br>Audit any Solana token mint in &lt;120ms across Mint/Freeze Authority, Unburned LP Pulls, Holder Bundles, Token-2022 Hooks &amp; Inner-CPI Drains before buying."
      },
      {
        el: proofSec,
        pct: 95,
        html: "⛓️ <b>STEP 6/7 • ON-CHAIN SOLSCAN PROOF COLUMNS:</b><br>Verify real <b>Wallet Rent Reclaims</b> (left) and <b>Full-Cycle Token Exits</b> (right) with % ROI, MC, 12-Layer Score, and ATA Rent Reclaimed directly on Solscan."
      },
      {
        el: passSec,
        pct: 100,
        html: "⚡ <b>STEP 7/7 • TRADER PRO, QUANT DESK &amp; $500/MO B2B API:</b><br>Your 1st 12-Layer Audit is Free. 0% Free First Rent Claim / Starter, <b>$19.99/mo Pro</b>, <b>$99/mo Quant</b>, and <b>$500/mo Enterprise API</b> &amp; Annual SOL Vault Raffle!"
      }
    ];

    var stepIdx = 0; var paused = false; var timer = null;
    window.tourClose = function(){ if (timer) clearTimeout(timer); if (wrap && wrap.parentNode) wrap.remove(); };
    window.tourTogglePause = function(){
      paused = !paused;
      var pb = document.getElementById("tour-pause-btn");
      if (pb) pb.innerText = paused ? "▶️ Resume" : "⏸️ Pause";
      if (!paused) scheduleNext(); else if (timer) clearTimeout(timer);
    };
    window.tourNextStep = function(){
      if (timer) clearTimeout(timer);
      stepIdx++;
      if (stepIdx >= steps.length) { fireTourMilestone(100, true); window.tourClose(); return; }
      renderStep();
    };
    function scheduleNext(){
      if (timer) clearTimeout(timer);
      if (!paused) timer = setTimeout(function(){
        stepIdx++;
        if (stepIdx >= steps.length) { fireTourMilestone(100, true); window.tourClose(); }
        else renderStep();
      }, 9000);
    }
    function renderStep(){
      if (!document.getElementById("tour-cursor-overlay")) return;
      var s = steps[stepIdx];
      if (s.pct >= 50) fireTourMilestone(s.pct, s.pct >= 100);
      var b = document.getElementById("tour-step-bubble");
      if (b){
        b.innerHTML = s.html
          + '<div style="margin-top:9px;padding-top:7px;border-top:1px solid rgba(52,211,153,0.35);display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;">'
          + '<span style="font-size:11px;color:#6ee7b7;font-weight:700;">Step ' + (stepIdx+1) + ' of ' + steps.length + '</span>'
          + '<div style="display:flex;gap:5px;">'
          + '<button type="button" id="tour-pause-btn" onclick="window.tourTogglePause()" style="cursor:pointer;background:#065f46;color:#fff;border:1px solid #34d399;font-size:11px;padding:3px 8px;border-radius:5px;">' + (paused ? '▶️ Resume' : '⏸️ Pause') + '</button>'
          + '<button type="button" onclick="window.tourNextStep()" style="cursor:pointer;background:#10b981;color:#022c22;border:none;font-weight:800;font-size:11px;padding:3px 9px;border-radius:5px;">' + (stepIdx + 1 === steps.length ? '✅ Finish' : '⏭️ Next') + '</button>'
          + '<button type="button" onclick="window.tourClose()" style="cursor:pointer;background:#1e293b;color:#cbd5e1;border:1px solid #475569;font-size:11px;padding:3px 7px;border-radius:5px;">✕ Close</button>'
          + '</div></div>';
      }
      if (s.el && s.el.getBoundingClientRect){
        try { s.el.scrollIntoView({behavior:"smooth", block:"center"}); } catch(_se){}
        setTimeout(function(){
          if (!s.el || !s.el.getBoundingClientRect) return;
          var r = s.el.getBoundingClientRect();
          var maxLeft = Math.max(14, window.innerWidth - Math.min(395, window.innerWidth - 14));
          cur.style.left = Math.max(14, Math.min(maxLeft, r.left + Math.min(80, r.width * 0.25))) + "px";
          cur.style.top  = Math.max(16, Math.min(window.innerHeight - 235, r.top + Math.min(36, r.height * 0.5))) + "px";
        }, 320);
      }
      scheduleNext();
    }
    renderStep();
  };
  window.openWatchDemoModal = window.startInteractiveCursorTour;
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
(function () {
    function resolveBackendApiBase() {
        var host = String((window.location && window.location.hostname) || "").toLowerCase();
        var isStatic = (String(window.location.port || "") !== "8088");
        return isStatic ? String(window.BACKEND_TUNNEL_BASE || "").replace(/\/+$/, "") : "";
    }
    function wipeAllWalletStorageKeys() {
        var explicitPreserve = {
            "dex6_pro_pass_unlocked": true,
            "dex6_single_audit_tokens": true,
            "dex6_single_audit_credits": true,
            "dex6_site_lang": true,
            "rs_alerts_opted_in": true
        };
        try {
            var keysToRemove = [
                "savedWalletAddress",
                "connectedWallet",
                "walletAddress",
                "solanaWallet",
                "rrs_wallet",
                "dex6_wallet",
                "dex6_auto_collect",
                "walletName",
                "phantom_connected",
                "solflare_connected",
                "backpack_connected"
            ];
            for (var i = 0; i < localStorage.length; i++) {
                var k = localStorage.key(i);
                if (k && !explicitPreserve[k] && /wallet|solana|phantom|solflare|backpack|pubkey/i.test(k)) {
                    keysToRemove.push(k);
                }
            }
            keysToRemove.forEach(function (k) { try {
                localStorage.removeItem(k);
            }
            catch (_e) { } });
        }
        catch (_e) { }
        try {
            sessionStorage.clear();
            sessionStorage.setItem("rrs_explicit_disconnect", "1");
        }
        catch (_e) { }
    }
    window.rrsUnifiedHardDisconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            function addProv(p) {
                if (p && providers.indexOf(p) === -1)
                    providers.push(p);
            }
            var providers, i, _err_1, cBtn, p1Btn, propConn, swBtn, appConn, topSt, dBadge, scanOut, statusBanner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        window.__walletExplicitlyDisconnected = true;
                        providers = [];
                        try {
                            if (window.phantom && window.phantom.solana)
                                addProv(window.phantom.solana);
                            if (window.solflare)
                                addProv(window.solflare);
                            if (window.backpack && window.backpack.solana)
                                addProv(window.backpack.solana);
                            if (window.backpack)
                                addProv(window.backpack);
                            if (window.solana)
                                addProv(window.solana);
                            if (window.okxwallet && window.okxwallet.solana)
                                addProv(window.okxwallet.solana);
                            if (window.trustwallet && window.trustwallet.solana)
                                addProv(window.trustwallet.solana);
                            if (window.coinbaseSolana)
                                addProv(window.coinbaseSolana);
                            if (typeof getSolanaProvider === "function")
                                addProv(getSolanaProvider());
                            if (typeof getInjectedProvider === "function")
                                addProv(getInjectedProvider());
                        }
                        catch (_e) { }
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < providers.length)) return [3 /*break*/, 7];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        if (!(providers[i] && typeof providers[i].disconnect === "function")) return [3 /*break*/, 4];
                        return [4 /*yield*/, providers[i].disconnect()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        _err_1 = _a.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        i++;
                        return [3 /*break*/, 1];
                    case 7:
                        wipeAllWalletStorageKeys();
                        try {
                            connectedWallet = null;
                        }
                        catch (_e) { }
                        try {
                            connectedWalletPubkey = "";
                        }
                        catch (_e) { }
                        try {
                            lastScanData = null;
                        }
                        catch (_e) { }
                        try {
                            _lastHoverAutoScannedWallet = "";
                        }
                        catch (_e) { }
                        window.connectedWallet = null;
                        window.connectedPublicKey = null;
                        window.userWalletAddress = null;
                        ["walletInput", "w-inp", "modalWalletPaste", "apiWalletInput", "fleetWalletInput"].forEach(function (id) {
                            var el = document.getElementById(id);
                            if (el)
                                el.value = "";
                        });
                        cBtn = document.getElementById("connectBtn");
                        if (cBtn)
                            cBtn.innerText = "Connect Wallet";
                        p1Btn = document.getElementById("panel1ConnectWalletBtn");
                        if (p1Btn)
                            p1Btn.innerHTML = "👻 Connect Wallet";
                        propConn = document.getElementById("prop-connect-btn");
                        if (propConn)
                            propConn.innerHTML = "🔗 Connect / Switch Wallet";
                        swBtn = document.getElementById("switchWalletBtn");
                        if (swBtn)
                            swBtn.style.display = "none";
                        appConn = document.getElementById("conn-btn");
                        if (appConn)
                            appConn.innerHTML = "👻 Connect Wallet &amp; Auto-Scan Now";
                        topSt = document.getElementById("top-wallet-status");
                        if (topSt)
                            topSt.innerText = "1st Claim 0% Fee • 12-Layer Shield";
                        ["walletResults", "scanFinishedTopBanner", "indexEmeraldFoundCard", "primaryScanResultCards", "emerald-claim-card"].forEach(function (id) {
                            var el = document.getElementById(id);
                            if (el)
                                el.style.display = "none";
                        });
                        ["top-auto-collect-chk", "auto-collect-checkbox"].forEach(function (id) {
                            var chk = document.getElementById(id);
                            if (chk)
                                chk.checked = false;
                        });
                        try {
                            window.history.replaceState({}, document.title, window.location.pathname);
                        }
                        catch (_e) { }
                        dBadge = document.getElementById("walletDisconnectedBadge");
                        if (dBadge) {
                            dBadge.style.display = "block";
                            dBadge.innerText = "🔌 Wallet Disconnected | Paste any Solana address";
                        }
                        scanOut = document.getElementById("scan-out");
                        if (scanOut) {
                            scanOut.style.display = "block";
                            scanOut.innerHTML = "🔌 <b>Wallet Disconnected | Paste any Solana address</b>";
                        }
                        statusBanner = document.getElementById("inline-free-scan-pop");
                        if (statusBanner) {
                            statusBanner.style.display = "block";
                            statusBanner.innerHTML = '<span style="color:#34d399;font-weight:900;">🔒 VERIFIED HARD DISCONNECT:</span> Wallet provider disconnected &amp; browser storage wiped clean.';
                        }
                        if (typeof closeWalletModal === "function") {
                            try {
                                closeWalletModal();
                            }
                            catch (_e) { }
                        }
                        if (typeof showPlatformToast === "function") {
                            try {
                                showPlatformToast("✅ Wallet Disconnected Safely • Read-Only Mode", true);
                            }
                            catch (_e) { }
                        }
                        try {
                            fetch(resolveBackendApiBase() + "/api/traffic-event", {
                                method: "POST",
                                mode: "cors",
                                keepalive: true,
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ event: "disconnect_wallet", button: "disconnect_wallet", zone: "Wallet-Controls" })
                            }).catch(function () { });
                        }
                        catch (_e) { }
                        return [2 /*return*/];
                }
            });
        });
    };
    window.disconnectWallet = window.rrsUnifiedHardDisconnect;
    window.disconnectAndClearWallet = window.rrsUnifiedHardDisconnect;
    window.forceHardWalletDisconnect = window.rrsUnifiedHardDisconnect;
    window.disconnectInjectedWallet = window.rrsUnifiedHardDisconnect;
    function fireDemoMilestoneTelemetry(pctNum, stepIdx, totalSteps) {
        var pct = Math.min(100, Math.max(0, Math.round(pctNum)));
        if (pct > (window.__RRS_MAX_VIDEO_PCT || 0))
            window.__RRS_MAX_VIDEO_PCT = pct;
        var milestoneStr = pct + "%";
        var base = resolveBackendApiBase();
        var payload = {
            event: pct >= 100 ? "video_100" : "video_milestone",
            event_type: "video_milestone",
            event_name: pct >= 100 ? "VIDEO 100%" : ("DEMO_" + pct + "PCT"),
            button_id: "prop-video-tour-btn",
            button_name: pct >= 100 ? "video_100pct" : ("cursor_demo_" + pct + "pct"),
            video_watch_pct: pct,
            video_milestone: milestoneStr,
            step: stepIdx,
            total_steps: totalSteps,
            zone: "Animated-Cursor-Walkthrough",
            page: (window.location && window.location.pathname) || "/"
        };
        if (typeof window.sendRrsEngagementBeacon === "function") {
            try {
                window.sendRrsEngagementBeacon("video_milestone", payload);
            }
            catch (_e) { }
        }
        else {
            try {
                fetch(base + "/api/engagement-telemetry", {
                    method: "POST",
                    mode: "cors",
                    keepalive: true,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }).catch(function () { });
            }
            catch (_e) { }
        }
        try {
            fetch(base + "/api/traffic-event", {
                method: "POST",
                mode: "cors",
                keepalive: true,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }).catch(function () { });
        }
        catch (_e) { }
    }
    window.startInteractiveCursorTour = function () {
        var oldC = document.getElementById("tour-cursor-overlay");
        if (oldC)
            oldC.remove();
        var wrap = document.createElement("div");
        wrap.id = "tour-cursor-overlay";
        wrap.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:100120;";
        var ring = document.createElement("div");
        ring.id = "tour-target-ring";
        ring.style.cssText = "position:fixed;left:-999px;top:-999px;width:40px;height:40px;border:2px solid #10B981;border-radius:12px;box-shadow:0 0 24px rgba(16,185,129,0.55), inset 0 0 12px rgba(16,185,129,0.22);transition:all 0.85s cubic-bezier(0.22,1,0.36,1);pointer-events:none;z-index:100121;";
        wrap.appendChild(ring);
        var cur = document.createElement("div");
        cur.id = "tour-animated-cursor";
        cur.style.cssText = "position:fixed;left:45%;top:20%;transition:all 0.95s cubic-bezier(0.22,1,0.36,1);z-index:100122;pointer-events:auto;max-width:calc(100vw - 24px);";
        cur.innerHTML = '<div style="display:flex;align-items:center;gap:6px;pointer-events:none;">'
            + '<span style="font-size:30px;filter:drop-shadow(0 0 14px #10b981);">🖱️</span>'
            + '<span id="tour-pct-pill" style="padding:2px 8px;border-radius:999px;background:#064E3B;border:1px solid #34D399;color:#ECFDF5;font-size:11px;font-weight:800;font-family:JetBrains Mono,monospace;">STEP 1/7</span>'
            + '</div>'
            + '<div id="tour-step-bubble" style="margin-top:6px;width:min(385px, calc(100vw - 28px));background:linear-gradient(165deg,#042f2e,#091526);border:2px solid #34d399;color:#ecfdf5;padding:13px 15px;border-radius:12px;font-size:13.5px;line-height:1.48;font-weight:600;box-shadow:0 16px 42px rgba(0,0,0,0.92);"></div>';
        wrap.appendChild(cur);
        document.body.appendChild(wrap);
        var wi = document.getElementById("walletInput") || document.getElementById("w-inp") || document.body;
        var pasteBtn = document.getElementById("pasteReadOnlyWalletBtn") || document.getElementById("paste-scan-btn") || wi;
        var discBtn = document.getElementById("panel1DisconnectWalletBtn") || document.getElementById("app-disconnect-wallet-btn") || document.getElementById("disc-btn") || wi;
        var scanBtn = document.getElementById("scanWalletBtn") || document.getElementById("burnerScanBtn") || pasteBtn;
        var mintInp = document.getElementById("mintInput") || document.getElementById("m-inp") || document.getElementById("rugShieldCard") || document.body;
        var proofBox = document.getElementById("liveWalletRentScansBox") || document.getElementById("verified-sample-claim-card") || document.body;
        var passBox = document.getElementById("choiceAPricingSection") || document.getElementById("idx-annual-vault-card") || document.getElementById("app-annual-vault-card") || document.body;
        var steps = [
            {
                el: wi,
                pct: 15,
                tab: "claim",
                html: "🟢 <b>STEP 1/7 • 100% READ-ONLY WALLET SCANNER:</b><br>Paste any public 44-character Solana address here. Zero seed phrases and zero wallet connection required to check your locked SOL rent!"
            },
            {
                el: pasteBtn,
                pct: 25,
                tab: "claim",
                html: "📋 <b>STEP 2/7 • 1-CLICK PASTE &amp; SCAN (0% 1ST CLAIM FEE):</b><br>Tap <b>Paste &amp; Scan</b> to audit empty SPL &amp; Token-2022 accounts (~0.00204 SOL each) via Helius Mainnet RPC. Your 1st rent claim is <b>0% platform fee</b>!"
            },
            {
                el: discBtn,
                pct: 45,
                tab: "claim",
                html: "🔒 <b>STEP 3/7 • VERIFIED HARD DISCONNECT:</b><br>Clicking <b>🔌 Disconnect Wallet</b> awaits real <code>provider.disconnect()</code>, wipes <code>localStorage</code> &amp; <code>sessionStorage</code>, clears the input bar, and blocks background auto-reconnect!"
            },
            {
                el: scanBtn,
                pct: 50,
                tab: "claim",
                html: "🔥 <b>STEP 4/7 • RENT RECLAIM &amp; DEAD DUST INCINERATOR:</b><br>Close 0-balance empty ATAs or burn dead rugged tokens in one atomic non-custodial <code>CloseAccount (0x09)</code> transaction."
            },
            {
                el: mintInp,
                pct: 75,
                tab: "shield",
                html: "🛡️ <b>STEP 5/7 • 11-LAYER PRE-BUY ANTI-RUG SHIELD:</b><br>Paste any Solana token mint to screen Jupiter sell-side honeypots, LP burn locks, Token-2022 hooks, and sniper bundles in &lt;120ms!"
            },
            {
                el: proofBox,
                pct: 90,
                tab: "proof",
                html: "🧾 <b>STEP 6/7 • ON-CHAIN WALLET RECLAIMS &amp; TOKEN EXITS:</b><br>Verify live Wallet Rent Reclaims on the left and full-cycle Token Exits on the right | every row links directly to Solscan!"
            },
            {
                el: passBox,
                pct: 100,
                tab: null,
                html: "🏆 <b>STEP 7/7 • PASSES, RAFFLE &amp; $500/MO ENTERPRISE API:</b><br>0% Free Starter (0% 1st Claim &amp; 1st Audit Free) • <b>$19.99/mo Pro</b> • <b>$99/mo Quant</b> • <b>$500/mo Enterprise API</b> + <b>Annual SOL Vault Raffle (1% Fees • 3 Yearly Winners)</b>!"
            }
        ];
        var idx = 0;
        var paused = false;
        var timer = null;
        var sentMilestones = {};
        function recordStepPct(pVal, sIdx) {
            [25, 50, 75, 100].forEach(function (m) {
                if (pVal >= m && !sentMilestones[m]) {
                    sentMilestones[m] = true;
                    fireDemoMilestoneTelemetry(m, sIdx + 1, steps.length);
                }
            });
        }
        window.tourClose = function (markComplete) {
            if (markComplete)
                recordStepPct(100, steps.length - 1);
            if (timer)
                clearTimeout(timer);
            if (wrap && wrap.parentNode)
                wrap.parentNode.removeChild(wrap);
        };
        window.tourTogglePause = function () {
            paused = !paused;
            var pb = document.getElementById("tour-pause-btn");
            if (pb)
                pb.innerText = paused ? "▶️ Resume" : "⏸️ Pause";
            if (!paused)
                scheduleNext();
            else if (timer)
                clearTimeout(timer);
        };
        window.tourNextStep = function () {
            if (timer)
                clearTimeout(timer);
            idx++;
            if (idx >= steps.length) {
                window.tourClose(true);
                return;
            }
            renderStep();
        };
        function scheduleNext() {
            if (timer)
                clearTimeout(timer);
            if (!paused) {
                timer = setTimeout(function () {
                    idx++;
                    if (idx >= steps.length)
                        window.tourClose(true);
                    else
                        renderStep();
                }, 4500);
            }
        }
        function renderStep() {
            if (!document.getElementById("tour-cursor-overlay"))
                return;
            var s = steps[idx];
            if (s.tab && typeof window.switchNativeTab === "function") {
                try {
                    window.switchNativeTab(s.tab);
                }
                catch (_e) { }
            }
            recordStepPct(s.pct, idx);
            var pill = document.getElementById("tour-pct-pill");
            if (pill)
                pill.innerText = "STEP " + (idx + 1) + "/" + steps.length + " • " + s.pct + "%";
            var b = document.getElementById("tour-step-bubble");
            if (b) {
                var isLast = (idx === steps.length - 1);
                b.innerHTML = s.html
                    + '<div style="margin-top:9px;height:5px;width:100%;background:#0f172a;border-radius:999px;overflow:hidden;">'
                    + '  <div style="height:100%;width:' + s.pct + '%;background:linear-gradient(90deg,#10B981,#38BDF8);transition:width 0.35s ease;"></div>'
                    + '</div>'
                    + '<div style="margin-top:8px;padding-top:6px;border-top:1px solid rgba(52,211,153,0.3);display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;">'
                    + '<span style="font-size:12px;color:#6ee7b7;font-family:JetBrains Mono,monospace;">' + (isLast ? "✅ 100% Complete" : ("Guided Demo • " + s.pct + "%")) + '</span>'
                    + '<div style="display:flex;gap:5px;">'
                    + '<button type="button" id="tour-pause-btn" onclick="window.tourTogglePause()" style="cursor:pointer;background:#065f46;color:#fff;border:1px solid #34d399;font-size:12px;padding:3px 8px;border-radius:6px;">' + (paused ? "▶️ Resume" : "⏸️ Pause") + '</button>'
                    + '<button type="button" onclick="window.tourNextStep()" style="cursor:pointer;background:#10b981;color:#022c22;border:none;font-weight:800;font-size:12px;padding:3px 9px;border-radius:6px;">' + (isLast ? "✅ Finish" : "⏭️ Next") + '</button>'
                    + '<button type="button" onclick="window.tourClose(false)" style="cursor:pointer;background:#1e293b;color:#cbd5e1;border:1px solid #475569;font-size:12px;padding:3px 7px;border-radius:6px;">✕</button>'
                    + '</div></div>';
            }
            var targetEl = s.el;
            if (targetEl && targetEl.getBoundingClientRect) {
                try {
                    targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
                }
                catch (_e) { }
                setTimeout(function () {
                    if (!document.getElementById("tour-cursor-overlay"))
                        return;
                    var r = targetEl.getBoundingClientRect();
                    if (r && r.width > 0 && r.height > 0) {
                        ring.style.left = Math.max(4, r.left - 4) + "px";
                        ring.style.top = Math.max(4, r.top - 4) + "px";
                        ring.style.width = Math.min(window.innerWidth - 8, r.width + 8) + "px";
                        ring.style.height = Math.min(220, r.height + 8) + "px";
                        cur.style.left = Math.max(12, Math.min(window.innerWidth - 405, r.left + Math.min(80, r.width * 0.25))) + "px";
                        cur.style.top = Math.max(16, Math.min(window.innerHeight - 255, r.top + Math.min(48, r.height * 0.55))) + "px";
                    }
                }, 320);
            }
            scheduleNext();
        }
        if (typeof window.pingShieldTelemetry === "function") {
            try {
                window.pingShieldTelemetry("started_demo_tour");
            }
            catch (_e) { }
        }
        renderStep();
    };
    window.openWatchDemoModal = window.startInteractiveCursorTour;
    window.closeWatchDemoModal = function () {
        if (typeof window.tourClose === "function")
            window.tourClose(false);
    };
    window.submitAnnualVaultRaffle = function (prefix) {
        return __awaiter(this, void 0, void 0, function () {
            var p, wEl, cEl, optEl, stEl, wallet, contact, weekly, res, _e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        p = prefix || "idx";
                        wEl = document.getElementById(p + "-vault-wallet-inp");
                        cEl = document.getElementById(p + "-vault-contact-inp");
                        optEl = document.getElementById(p + "-vault-weekly-optin");
                        stEl = document.getElementById(p + "-vault-status");
                        if (!stEl)
                            return [2 /*return*/];
                        stEl.style.display = "block";
                        wallet = wEl ? wEl.value.trim() : "";
                        contact = cEl ? cEl.value.trim() : "";
                        weekly = !!(optEl && optEl.checked);
                        if (!wallet || wallet.length < 32) {
                            stEl.style.color = "#FCA5A5";
                            stEl.innerText = "⚠️ Please enter a valid 32-to-44 character public Solana wallet address.";
                            return [2 /*return*/];
                        }
                        if (!contact) {
                            stEl.style.color = "#FCA5A5";
                            stEl.innerText = "⚠️ Please enter an Email or @Telegram handle for winner notification.";
                            return [2 /*return*/];
                        }
                        stEl.style.color = "#FDE047";
                        stEl.innerText = "⏳ Minting your sequential Annual SOL Vault Raffle ticket...";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetch(resolveBackendApiBase() + "/api/vault-raffle-enter", {
                                method: "POST",
                                mode: "cors",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ wallet: wallet, contact: contact, weekly_optin: weekly })
                            }).then(function (r) { return r.json(); })];
                    case 2:
                        res = _a.sent();
                        if (res && res.ok) {
                            stEl.style.color = "#6EE7B7";
                            stEl.innerText = "✅ " + (res.message || (res.ticket_badge + " Confirmed! (1% Fees • 3 Yearly Winners)"));
                            if (wEl)
                                wEl.value = "";
                            if (cEl)
                                cEl.value = "";
                        }
                        else {
                            stEl.style.color = "#FCA5A5";
                            stEl.innerText = "⚠️ " + ((res && res.error) || "Could not register raffle ticket right now.");
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _e_1 = _a.sent();
                        stEl.style.color = "#FCA5A5";
                        stEl.innerText = "⚠️ Network error contacting Annual SOL Vault Raffle service.";
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    window.submitTokenAdInquiry = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tokEl, cntEl, msgEl, stEl, tok, cnt, notes, res, _e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokEl = document.getElementById("adInqTokenInp");
                        cntEl = document.getElementById("adInqContactInp");
                        msgEl = document.getElementById("adInqMsgInp");
                        stEl = document.getElementById("adInqStatusMsg");
                        if (!stEl)
                            return [2 /*return*/];
                        stEl.style.display = "block";
                        tok = tokEl ? tokEl.value.trim() : "";
                        cnt = cntEl ? cntEl.value.trim() : "";
                        notes = msgEl ? msgEl.value.trim() : "";
                        if (!tok || !cnt) {
                            stEl.style.color = "#FCA5A5";
                            stEl.innerText = "⚠️ Please enter your Token Ticker/Mint and your Email or @Telegram.";
                            return [2 /*return*/];
                        }
                        stEl.style.color = "#7DD3FC";
                        stEl.innerText = "⏳ Sending inquiry to ceo@rentandrugshield.com...";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, window.__rrsResilientFeedbackPost("/api/ad-inquiry", {
                                category: "ad_inquiry",
                                token_mint: tok,
                                project_name: tok,
                                contact: cnt,
                                message: "[Token Ad Slot Inquiry] Token: " + tok + " | Contact: " + cnt + (notes ? (" | Notes: " + notes) : "")
                            }, "/api/feedback")];
                    case 2:
                        res = _a.sent();
                        if (res && res.ok) {
                            stEl.style.color = "#6EE7B7";
                            stEl.innerText = "✅ Ad inquiry delivered to ceo@rentandrugshield.com! Our team will follow up shortly.";
                            if (tokEl)
                                tokEl.value = "";
                            if (cntEl)
                                cntEl.value = "";
                            if (msgEl)
                                msgEl.value = "";
                        }
                        else {
                            stEl.style.color = "#FCA5A5";
                            stEl.innerText = "⚠️ " + ((res && res.error) || "Could not submit ad inquiry.");
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _e_2 = _a.sent();
                        stEl.style.color = "#FCA5A5";
                        stEl.innerText = "⚠️ Network error submitting ad inquiry.";
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
})();
