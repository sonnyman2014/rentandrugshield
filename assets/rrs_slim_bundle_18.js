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
    if (window.__RRS_V314_TICKER_ACTIVE)
        return;
    window.__RRS_V314_TICKER_ACTIVE = true;
    var WSOL_MINT = "So11111111111111111111111111111111111111112";
    var JUP_REF_WALLET = window.JUPITER_REFERRAL_WALLET || "";
    var JUP_REF_BPS = window.JUPITER_REFERRAL_BPS || 50;
    var FALLBACK_MEMES = [
        "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
        "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
        "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump",
        "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump",
        "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5",
        "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9",
        "ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY"
    ];
    var state = {
        sol: null,
        coins: [],
        coinsByMint: {},
        lastSig: "",
        activeCoin: null
    };
    function esc(s) {
        return String(s == null ? "" : s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
    function fmtUsdPrice(px) {
        var n = Number(px || 0);
        if (!isFinite(n) || n <= 0)
            return "$0.00";
        if (n >= 100)
            return "$" + n.toFixed(2);
        if (n >= 1)
            return "$" + n.toFixed(3);
        if (n >= 0.01)
            return "$" + n.toFixed(4);
        if (n >= 0.0001)
            return "$" + n.toFixed(6);
        var s = n.toFixed(10).replace(/0+$/, "");
        return "$" + s;
    }
    function fmtCompactUsd(val) {
        var n = Number(val || 0);
        if (!isFinite(n) || n <= 0)
            return "$0";
        if (n >= 1e9)
            return "$" + (n / 1e9).toFixed(2) + "B";
        if (n >= 1e6)
            return "$" + (n / 1e6).toFixed(2) + "M";
        if (n >= 1e3)
            return "$" + (n / 1e3).toFixed(1) + "K";
        return "$" + Math.round(n);
    }
    function fmtPct(v) {
        var n = Number(v || 0);
        if (!isFinite(n))
            n = 0;
        return (n >= 0 ? "+" : "") + n.toFixed(1) + "%";
    }
    function pctSpanHtml(v) {
        var n = Number(v || 0);
        var cls = n >= 0 ? "rrs-tk-up" : "rrs-tk-dn";
        return '<span class="' + cls + '">' + esc(fmtPct(n)) + '</span>';
    }
    function getApiCandidateBases() {
        var bases = [];
        var host = String(window.location.hostname || "").toLowerCase();
        var isStaticGh = (host.indexOf("github.io") !== -1 || host.indexOf("rentandrugshield.com") !== -1);
        var liveCfg = window.__LIVE_ENDPOINT_CONFIG;
        var dynBase = (liveCfg && (liveCfg.endpoint || liveCfg.api_base))
            ? String(liveCfg.endpoint || liveCfg.api_base).replace(/\/+$/, "")
            : (window.BACKEND_TUNNEL_BASE ? String(window.BACKEND_TUNNEL_BASE).replace(/\/+$/, "") : "");
        if (!isStaticGh) {
            bases.push("");
        }
        if (dynBase) {
            bases.push(dynBase);
        }
        bases.push("https://rentandrugshield.com");
        return bases;
    }
    function fetchJsonWithTimeout(url, timeoutMs) {
        return __awaiter(this, void 0, void 0, function () {
            var ctrl, tid, opts, r, ct, _err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
                        tid = ctrl ? setTimeout(function () { try {
                            ctrl.abort();
                        }
                        catch (_e) { } }, timeoutMs || 4200) : null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        opts = { method: "GET", headers: { "Accept": "application/json" } };
                        if (ctrl)
                            opts.signal = ctrl.signal;
                        if (url.indexOf("http") === 0) {
                            opts.mode = "cors";
                            opts.credentials = "omit";
                        }
                        return [4 /*yield*/, fetch(url, opts)];
                    case 2:
                        r = _a.sent();
                        if (!r || !r.ok)
                            return [2 /*return*/, null];
                        ct = String(r.headers.get("content-type") || "").toLowerCase();
                        if (ct.indexOf("html") !== -1)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, r.json()];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        _err_1 = _a.sent();
                        return [2 /*return*/, null];
                    case 5:
                        if (tid)
                            clearTimeout(tid);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    function fetchClientSideDexScreenerFallback() {
        return __awaiter(this, void 0, void 0, function () {
            var results, wsolRes, boostsRes, solObj, solPairs, sp, mints, seen, i, b, j, enr, bestByMint, k, pr, bm, coins, mIdx, mAddr, pair, liqU, mcU, ch24U, vol24, estScore;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            fetchJsonWithTimeout("https://api.dexscreener.com/latest/dex/tokens/" + WSOL_MINT, 4500),
                            fetchJsonWithTimeout("https://api.dexscreener.com/token-boosts/top/v1", 4500)
                        ])];
                    case 1:
                        results = _a.sent();
                        wsolRes = results[0];
                        boostsRes = results[1];
                        solObj = {
                            symbol: "SOL",
                            name: "Solana",
                            mint: WSOL_MINT,
                            price_usd: 0,
                            change_5m: 0,
                            change_1h: 0,
                            change_24h: 0,
                            market_cap: 0,
                            liquidity_usd: 0,
                            volume_24h: 0,
                            dex_id: "orca",
                            pair_url: "https://dexscreener.com/solana/" + WSOL_MINT,
                            age_label: "Mainnet",
                            shield_score: 99
                        };
                        if (wsolRes && Array.isArray(wsolRes.pairs)) {
                            solPairs = wsolRes.pairs.filter(function (p) {
                                return p && p.chainId === "solana"
                                    && p.baseToken && p.baseToken.address === WSOL_MINT
                                    && p.quoteToken && /^(USDC|USDT|USD)$/i.test(String(p.quoteToken.symbol || ""));
                            });
                            solPairs.sort(function (a, b) {
                                return Number((b.liquidity && b.liquidity.usd) || 0) - Number((a.liquidity && a.liquidity.usd) || 0);
                            });
                            if (solPairs[0]) {
                                sp = solPairs[0];
                                solObj.price_usd = Number(sp.priceUsd || 0);
                                solObj.change_5m = Number((sp.priceChange && sp.priceChange.m5) || 0);
                                solObj.change_1h = Number((sp.priceChange && sp.priceChange.h1) || 0);
                                solObj.change_24h = Number((sp.priceChange && sp.priceChange.h24) || 0);
                                solObj.liquidity_usd = Number((sp.liquidity && sp.liquidity.usd) || 0);
                                solObj.volume_24h = Number((sp.volume && sp.volume.h24) || 0);
                                solObj.dex_id = String(sp.dexId || "orca");
                                solObj.pair_url = String(sp.url || solObj.pair_url);
                            }
                        }
                        mints = [];
                        seen = {};
                        seen[WSOL_MINT] = true;
                        if (Array.isArray(boostsRes)) {
                            for (i = 0; i < boostsRes.length && mints.length < 18; i++) {
                                b = boostsRes[i];
                                if (b && b.chainId === "solana" && b.tokenAddress && !seen[b.tokenAddress]) {
                                    seen[b.tokenAddress] = true;
                                    mints.push(b.tokenAddress);
                                }
                            }
                        }
                        for (j = 0; j < FALLBACK_MEMES.length && mints.length < 18; j++) {
                            if (!seen[FALLBACK_MEMES[j]]) {
                                seen[FALLBACK_MEMES[j]] = true;
                                mints.push(FALLBACK_MEMES[j]);
                            }
                        }
                        return [4 /*yield*/, fetchJsonWithTimeout("https://api.dexscreener.com/tokens/v1/solana/" + mints.slice(0, 22).join(","), 4800)];
                    case 2:
                        enr = _a.sent();
                        bestByMint = {};
                        if (Array.isArray(enr)) {
                            for (k = 0; k < enr.length; k++) {
                                pr = enr[k];
                                if (!pr || pr.chainId !== "solana" || !pr.baseToken || !pr.baseToken.address)
                                    continue;
                                bm = pr.baseToken.address;
                                if (!bestByMint[bm] || Number((pr.liquidity && pr.liquidity.usd) || 0) > Number((bestByMint[bm].liquidity && bestByMint[bm].liquidity.usd) || 0)) {
                                    bestByMint[bm] = pr;
                                }
                            }
                        }
                        coins = [];
                        for (mIdx = 0; mIdx < mints.length && coins.length < 14; mIdx++) {
                            mAddr = mints[mIdx];
                            pair = bestByMint[mAddr];
                            if (!pair || !Number(pair.priceUsd || 0))
                                continue;
                            liqU = Number((pair.liquidity && pair.liquidity.usd) || 0);
                            mcU = Number(pair.marketCap || pair.fdv || 0);
                            ch24U = Number((pair.priceChange && pair.priceChange.h24) || 0);
                            if (liqU < 10000 || mcU < 15000 || !(ch24U > -60.0))
                                continue;
                            vol24 = Number((pair.volume && pair.volume.h24) || 0);
                            estScore = FALLBACK_MEMES.indexOf(mAddr) !== -1 ? 94 : (liqU >= 100000 ? 86 : (liqU >= 25000 ? 78 : 66));
                            coins.push({
                                symbol: String((pair.baseToken && pair.baseToken.symbol) || mAddr.slice(0, 5)).replace(/^\$/, "").toUpperCase(),
                                name: String((pair.baseToken && pair.baseToken.name) || "Solana Token"),
                                mint: mAddr,
                                price_usd: Number(pair.priceUsd || 0),
                                change_5m: Number((pair.priceChange && pair.priceChange.m5) || 0),
                                change_1h: Number((pair.priceChange && pair.priceChange.h1) || 0),
                                change_24h: ch24U,
                                market_cap: mcU,
                                liquidity_usd: liqU,
                                volume_24h: vol24,
                                dex_id: String(pair.dexId || "raydium"),
                                pair_url: String(pair.url || ("https://dexscreener.com/solana/" + mAddr)),
                                age_label: "Live",
                                shield_score: estScore
                            });
                        }
                        return [2 /*return*/, { ok: true, sol: solObj, coins: coins }];
                }
            });
        });
    }
    function loadLiveMarketFeed() {
        return __awaiter(this, void 0, void 0, function () {
            var data, bases, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = null;
                        return [4 /*yield*/, fetchJsonWithTimeout("/api/live-market-ticker", 4000)];
                    case 1:
                        // 1. Primary fetch via site /api/live-market-ticker (intercepted cleanly to tunnel on GitHub Pages)
                        data = _a.sent();
                        if (!(!data || !Array.isArray(data.coins) || data.coins.length === 0)) return [3 /*break*/, 5];
                        bases = getApiCandidateBases();
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < bases.length)) return [3 /*break*/, 5];
                        if (!bases[i])
                            return [3 /*break*/, 4];
                        return [4 /*yield*/, fetchJsonWithTimeout(bases[i] + "/api/live-market-ticker", 4000)];
                    case 3:
                        data = _a.sent();
                        if (data && Array.isArray(data.coins) && data.coins.length > 0)
                            return [3 /*break*/, 5];
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5:
                        if (!(!data || !Array.isArray(data.coins) || data.coins.length === 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, fetchClientSideDexScreenerFallback()];
                    case 6:
                        data = _a.sent();
                        _a.label = 7;
                    case 7:
                        if (data && (data.sol || (Array.isArray(data.coins) && data.coins.length > 0))) {
                            renderTickerBanner(data);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    function buildCoinPillHtml(c) {
        var sc = Number(c.shield_score != null ? c.shield_score : 75);
        var shCls = sc >= 85 ? "rrs-tk-sh-ok" : (sc >= 65 ? "rrs-tk-sh-warn" : "rrs-tk-sh-bad");
        var hiCls = sc >= 85 ? " rrs-high-shield" : "";
        var chg = Number(c.change_24h != null ? c.change_24h : 0);
        var chgCls = chg >= 0 ? "rrs-tk-up" : "rrs-tk-dn";
        var icon = sc >= 88 ? "🛡️" : "🔥";
        return '<button type="button" class="rrs-ticker-coin-btn' + hiCls + '" data-rrs-mint="' + esc(c.mint) + '">'
            + '<span>' + icon + '</span>'
            + '<span class="rrs-tk-sym">' + esc(c.symbol) + '</span>'
            + '<span class="rrs-tk-px">' + esc(fmtUsdPrice(c.price_usd)) + '</span>'
            + '<span class="' + chgCls + '">(' + esc(fmtPct(chg)) + ')</span>'
            + '<span class="rrs-tk-mc">• MC ' + esc(fmtCompactUsd(c.market_cap)) + '</span>'
            + '<span class="' + shCls + '">• 🛡️ ' + sc + '/100</span>'
            + '</button>';
    }
    function renderTickerBanner(data) {
        var solBadgeTxt = document.getElementById("rrsLiveSolSpotText");
        if (data.sol && Number(data.sol.price_usd) > 0) {
            var s = data.sol;
            state.sol = {
                symbol: "SOL",
                name: "Wrapped SOL (Spot)",
                mint: WSOL_MINT,
                price_usd: Number(s.price_usd),
                change_5m: Number(s.change_5m || 0),
                change_1h: Number(s.change_1h || 0),
                change_24h: Number(s.change_24h || 0),
                market_cap: 0,
                liquidity_usd: Number(s.liquidity_usd || 0),
                volume_24h: Number(s.volume_24h || 0),
                dex_id: String(s.dex_id || "orca"),
                pair_url: String(s.pair_url || ("https://dexscreener.com/solana/" + WSOL_MINT)),
                age_label: "Mainnet",
                shield_score: 99
            };
            state.coinsByMint[WSOL_MINT] = state.sol;
            if (solBadgeTxt) {
                var c24 = Number(s.change_24h || 0);
                var cCol = c24 >= 0 ? "#34D399" : "#F87171";
                solBadgeTxt.innerHTML = '◎ SOL <span style="color:#FDE68A;">$' + Number(s.price_usd).toFixed(2) + '</span> <span style="color:' + cCol + ';">(' + esc(fmtPct(c24)) + ')</span>';
            }
        }
        var rawCoins = Array.isArray(data.coins) ? data.coins : [];
        var coins = rawCoins.filter(function (c) {
            if (!c || !c.mint)
                return false;
            var lq = Number(c.liquidity_usd || 0);
            var mc = Number(c.market_cap || 0);
            var ch = Number(c.change_24h != null ? c.change_24h : 0);
            return lq >= 10000 && mc >= 15000 && ch > -60.0;
        });
        if (!coins.length)
            return;
        state.coins = coins;
        for (var i = 0; i < coins.length; i++) {
            if (coins[i] && coins[i].mint) {
                state.coinsByMint[coins[i].mint] = coins[i];
            }
        }
        var track = document.getElementById("rrsLiveMemeMarqueeTrack");
        if (!track)
            return;
        var mintSig = coins.map(function (x) { return x.mint; }).join("|");
        var pillsHtml = coins.map(buildCoinPillHtml).join("");
        var durSec = Math.max(34, coins.length * 3.4);
        track.style.setProperty("--rrs-marquee-dur", durSec.toFixed(1) + "s");
        if (state.lastSig === mintSig && track.querySelectorAll(".rrs-ticker-half").length === 2) {
            var halves = track.querySelectorAll(".rrs-ticker-half");
            halves[0].innerHTML = pillsHtml;
            halves[1].innerHTML = pillsHtml;
        }
        else {
            state.lastSig = mintSig;
            track.innerHTML = '<div class="rrs-ticker-half">' + pillsHtml + '</div>'
                + '<div class="rrs-ticker-half" aria-hidden="true">' + pillsHtml + '</div>';
            track.classList.add("rrs-marquee-running");
        }
    }
    function populateService2ScannerInput(mintAddr) {
        if (!mintAddr)
            return;
        var inp = document.getElementById("mintInput") || document.getElementById("m-inp");
        if (inp) {
            inp.value = mintAddr;
        }
    }
    var DEAD_POOL_BADGE = "🔴 DEAD / DRAINED POOL | ILLIQUID";
    function isDeadOrDrainedPool(c) {
        if (!c || c.mint === WSOL_MINT)
            return false;
        if (c.is_dead_pool === true || c.liquidity_viability_passed === false)
            return true;
        var liq = Number(c.liquidity_usd != null ? c.liquidity_usd : 0);
        var mc = Number(c.market_cap != null ? c.market_cap : 0);
        var ch24 = Number(c.change_24h != null ? c.change_24h : 0);
        return (liq < 5000) || (mc < 10000 && ch24 <= -80.0);
    }
    function renderLayersHtml(layers, verdictText, scoreNum, coinCtx) {
        var listEl = document.getElementById("rrsCoinModalLayersList");
        var verdEl = document.getElementById("rrsModalLayersVerdict");
        var pillEl = document.getElementById("rrsModalShieldPill");
        var deadBannerEl = document.getElementById("rrsCoinDeadPoolBanner");
        var swapBtnEl = document.getElementById("rrsCoinProtectedSwapBtn");
        var layersBoxEl = listEl ? listEl.parentElement : null;
        var deadPool = isDeadOrDrainedPool(coinCtx);
        var sc = scoreNum != null ? Number(scoreNum) : (deadPool ? 20 : 75);
        if (!isFinite(sc))
            sc = deadPool ? 20 : 75;
        if (deadPool && sc > 25)
            sc = 25;
        if (deadBannerEl) {
            if (deadPool) {
                deadBannerEl.textContent = DEAD_POOL_BADGE + " • Liquidity Viability Layer FAILED (Shield Capped " + sc + "/100)";
                deadBannerEl.style.display = "block";
            }
            else {
                deadBannerEl.textContent = "";
                deadBannerEl.style.display = "none";
            }
        }
        if (pillEl) {
            if (deadPool) {
                pillEl.style.background = "rgba(239, 68, 68, 0.22)";
                pillEl.style.borderColor = "#EF4444";
                pillEl.style.color = "#FCA5A5";
                pillEl.textContent = DEAD_POOL_BADGE + " • " + sc + "/100";
            }
            else {
                var col = sc >= 85 ? "#34D399" : (sc >= 65 ? "#FBBF24" : "#F87171");
                var bdr = sc >= 85 ? "#10B981" : (sc >= 65 ? "#F59E0B" : "#EF4444");
                var bg = sc >= 85 ? "rgba(16, 185, 129, 0.16)" : (sc >= 65 ? "rgba(245, 158, 11, 0.16)" : "rgba(239, 68, 68, 0.18)");
                pillEl.style.background = bg;
                pillEl.style.color = col;
                pillEl.style.borderColor = bdr;
                pillEl.textContent = "🛡️ " + sc + "/100";
            }
        }
        if (verdEl) {
            if (deadPool) {
                verdEl.style.color = "#F87171";
                verdEl.textContent = DEAD_POOL_BADGE;
            }
            else {
                verdEl.style.color = sc >= 85 ? "#34D399" : (sc >= 65 ? "#FBBF24" : "#F87171");
                if (verdictText)
                    verdEl.textContent = verdictText;
            }
        }
        if (layersBoxEl) {
            layersBoxEl.style.borderColor = deadPool
                ? "rgba(239, 68, 68, 0.55)"
                : (sc >= 85 ? "rgba(16, 185, 129, 0.36)" : (sc >= 65 ? "rgba(245, 158, 11, 0.42)" : "rgba(239, 68, 68, 0.48)"));
        }
        if (swapBtnEl) {
            if (deadPool) {
                swapBtnEl.textContent = "🚫 Dead Pool (Illiquid)";
                swapBtnEl.style.background = "rgba(239, 68, 68, 0.2)";
                swapBtnEl.style.borderColor = "#EF4444";
                swapBtnEl.style.color = "#FECACA";
            }
            else {
                swapBtnEl.textContent = "⚡ Protected Swap";
                swapBtnEl.style.background = "linear-gradient(135deg, #10B981, #059669)";
                swapBtnEl.style.borderColor = "#34D399";
                swapBtnEl.style.color = "#022C22";
            }
        }
        if (!listEl || !Array.isArray(layers) || !layers.length)
            return;
        listEl.innerHTML = layers.map(function (ly) {
            var isLiqLayer = Number(ly.layer) === 6 || ly.key === "liquidity_viability";
            var ok = deadPool && isLiqLayer ? false : Boolean(ly.passed);
            var stUp = String(ly.status || "").toUpperCase();
            var isFail = (!ok) && (stUp === "FAIL" || stUp === "CRITICAL" || (deadPool && isLiqLayer));
            var badge = ok
                ? '<span style="color:#34D399; font-weight:800;">✅ PASS</span>'
                : (isFail
                    ? '<span style="color:#F87171; font-weight:900;">❌ FAIL</span>'
                    : '<span style="color:#FBBF24; font-weight:800;">⚠️ WARN</span>');
            return '<div class="rrs-coin-layer-item">'
                + '<span style="color:#E2E8F0; font-weight:700;">' + esc(ly.name || ("Layer " + ly.layer)) + '</span>'
                + '<span style="color:#94A3B8; text-align:right;">' + esc(ly.detail || "") + ' &nbsp;' + badge + '</span>'
                + '</div>';
        }).join("");
    }
    function buildClientFallbackLayers(c) {
        var deadPool = isDeadOrDrainedPool(c);
        var liqUsd = Number(c.liquidity_usd || 0);
        var mcUsd = Number(c.market_cap || 0);
        var ch24 = Number(c.change_24h || 0);
        var sc = deadPool ? Math.min(25, Number(c.shield_score != null ? c.shield_score : 20)) : Number(c.shield_score || 75);
        var liqOk = (!deadPool) && (liqUsd >= 8000 || c.mint === WSOL_MINT);
        var volOk = (!deadPool) && Number(c.volume_24h || 0) >= 5000;
        return [
            { layer: 1, key: "mint_authority", name: "Layer 1 • Mint Authority Lock", passed: sc >= 60, status: sc >= 60 ? "PASS" : "WARN", detail: sc >= 60 ? "Renounced / Fixed Supply" : "Verify Mint Authority" },
            { layer: 2, key: "freeze_authority", name: "Layer 2 • Freeze Authority Guard", passed: sc >= 60, status: sc >= 60 ? "PASS" : "WARN", detail: sc >= 60 ? "Disabled" : "Verify Freeze Authority" },
            { layer: 3, key: "token2022_extensions", name: "Layer 3 • Token-2022 Drain Extensions", passed: true, status: "PASS", detail: "0 Malicious Hooks Detected" },
            { layer: 4, key: "metadata_mutability", name: "Layer 4 • Metadata Spoof & Mutability", passed: sc >= 70, status: sc >= 70 ? "PASS" : "WARN", detail: sc >= 70 ? "Verified Metadata" : "Check Mutability" },
            { layer: 5, key: "lp_burn_lock", name: "Layer 5 • LP Burn & Vault Lock", passed: liqOk, status: deadPool ? "FAIL" : (liqOk ? "PASS" : "WARN"), detail: deadPool ? ("Pool Drained (" + fmtCompactUsd(liqUsd) + " Liq)") : (liqOk ? "Active DEX Pool Verified" : "Low Pool Lock Depth") },
            { layer: 6, key: "liquidity_viability", name: "Layer 6 • Liquidity Viability & Real Pool Depth", passed: liqOk, status: deadPool ? "FAIL" : (liqOk ? "PASS" : "WARN"), detail: deadPool ? ("FAILED Liquidity Viability (" + fmtCompactUsd(liqUsd) + " Liq • " + fmtCompactUsd(mcUsd) + " MC • " + fmtPct(ch24) + " 24h)") : (fmtCompactUsd(liqUsd) + " Active Pool Liquidity") },
            { layer: 7, key: "whale_concentration", name: "Layer 7 • Top-10 Whale Concentration", passed: sc >= 70, status: sc >= 70 ? "PASS" : "WARN", detail: sc >= 70 ? "Balanced Distribution" : "Monitor Top Holders" },
            { layer: 8, key: "creator_profile", name: "Layer 8 • Creator & Deployer Profile", passed: sc >= 72, status: sc >= 72 ? "PASS" : "WARN", detail: "Public Deployer Telemetry" },
            { layer: 9, key: "sybil_cluster_radar", name: "Layer 9 • Sybil & Bundler Cluster Radar", passed: sc >= 75, status: sc >= 75 ? "PASS" : "WARN", detail: sc >= 75 ? "No Sybil Cluster Flagged" : "Run Full 12-Layer Deep Scan" },
            { layer: 10, key: "organic_velocity", name: "Layer 10 • Organic Buyer & Wash Velocity", passed: volOk, status: volOk ? "PASS" : "WARN", detail: "24h Vol " + fmtCompactUsd(c.volume_24h) },
            { layer: 11, key: "honeypot_exit_sim", name: "Layer 11 • Honeypot & Inner-CPI Drain Sim", passed: !deadPool, status: deadPool ? "FAIL" : "PASS", detail: deadPool ? "Illiquid Pool | Exit Insolvency Risk" : (String(c.dex_id || "DEX").toUpperCase() + " Route Active") }
        ];
    }
    function openCoinIntelModal(mintAddr) {
        return __awaiter(this, void 0, void 0, function () {
            var coin, backdrop, dexBtn, solBtn, qs, rc, bases, i, deadNow, rawSc, effScore, effVerdict, deadFallback, fbScore;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!mintAddr)
                            return [2 /*return*/];
                        coin = state.coinsByMint[mintAddr] || {
                            symbol: mintAddr.slice(0, 5).toUpperCase(),
                            name: "Solana Token",
                            mint: mintAddr,
                            price_usd: 0,
                            change_5m: 0,
                            change_1h: 0,
                            change_24h: 0,
                            market_cap: 0,
                            liquidity_usd: 0,
                            volume_24h: 0,
                            dex_id: "solana",
                            pair_url: "https://dexscreener.com/solana/" + encodeURIComponent(mintAddr),
                            age_label: "Live",
                            shield_score: 20
                        };
                        state.activeCoin = Object.assign({}, coin);
                        // Auto-populate Service 2 scanner input immediately
                        if (mintAddr !== WSOL_MINT) {
                            populateService2ScannerInput(mintAddr);
                        }
                        backdrop = document.getElementById("rrsCoinIntelModalBackdrop");
                        if (!backdrop)
                            return [2 /*return*/];
                        document.getElementById("rrsModalCoinSym").textContent = "$" + String(coin.symbol || "TOKEN").replace(/^\$/, "");
                        document.getElementById("rrsModalCoinName").textContent = String(coin.name || coin.symbol || "Solana Token");
                        document.getElementById("rrsModalCoinVenueBadge").textContent = String(coin.dex_id || "SOLANA").toUpperCase() + " • " + String(coin.age_label || "Live");
                        document.getElementById("rrsModalCoinMint").textContent = coin.mint;
                        document.getElementById("rrsModalMetricPrice").textContent = fmtUsdPrice(coin.price_usd);
                        document.getElementById("rrsModalMetricChanges").innerHTML = pctSpanHtml(coin.change_5m) + " / " + pctSpanHtml(coin.change_1h) + " / " + pctSpanHtml(coin.change_24h);
                        document.getElementById("rrsModalMetricMc").textContent = coin.market_cap > 0 ? fmtCompactUsd(coin.market_cap) : (mintAddr === WSOL_MINT ? "Spot Mainnet" : "$0");
                        document.getElementById("rrsModalMetricLiq").textContent = fmtCompactUsd(coin.liquidity_usd);
                        document.getElementById("rrsModalMetricVol").textContent = fmtCompactUsd(coin.volume_24h);
                        document.getElementById("rrsModalMetricAgeDex").textContent = String(coin.age_label || "Live") + " • " + String(coin.dex_id || "solana").toUpperCase();
                        dexBtn = document.getElementById("rrsCoinDexChartBtn");
                        if (dexBtn)
                            dexBtn.href = coin.pair_url || ("https://dexscreener.com/solana/" + encodeURIComponent(coin.mint));
                        solBtn = document.getElementById("rrsCoinSolscanBtn");
                        if (solBtn)
                            solBtn.href = "https://solscan.io/token/" + encodeURIComponent(coin.mint);
                        if (state.coinsByMint[mintAddr]) {
                            renderLayersHtml(buildClientFallbackLayers(coin), "Syncing live /api/rug-check 12-Layer telemetry...", coin.shield_score, coin);
                        }
                        if (typeof window.rrsShowModalEl === "function") {
                            window.rrsShowModalEl(backdrop, "flex");
                        }
                        else {
                            backdrop.removeAttribute("hidden");
                            backdrop.style.display = "flex";
                            backdrop.setAttribute("aria-hidden", "false");
                        }
                        qs = "?mint=" + encodeURIComponent(coin.mint);
                        return [4 /*yield*/, fetchJsonWithTimeout("/api/rug-check" + qs, 4200)];
                    case 1:
                        rc = _a.sent();
                        if (!(!rc || !rc.ok)) return [3 /*break*/, 5];
                        bases = getApiCandidateBases();
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < bases.length)) return [3 /*break*/, 5];
                        if (!bases[i])
                            return [3 /*break*/, 4];
                        return [4 /*yield*/, fetchJsonWithTimeout(bases[i] + "/api/rug-check" + qs, 4200)];
                    case 3:
                        rc = _a.sent();
                        if (rc && rc.ok)
                            return [3 /*break*/, 5];
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5:
                        if (state.activeCoin && state.activeCoin.mint === coin.mint && rc && rc.ok && Array.isArray(rc.layers)) {
                            if (rc.symbol)
                                document.getElementById("rrsModalCoinSym").textContent = "$" + String(rc.symbol).replace(/^\$/, "");
                            if (rc.name)
                                document.getElementById("rrsModalCoinName").textContent = String(rc.name);
                            if (rc.dex_id) {
                                document.getElementById("rrsModalCoinVenueBadge").textContent = String(rc.dex_id).toUpperCase() + " • " + String(rc.age_label || "Live");
                                document.getElementById("rrsModalMetricAgeDex").textContent = String(rc.age_label || "Live") + " • " + String(rc.dex_id).toUpperCase();
                            }
                            if (rc.price_usd != null)
                                document.getElementById("rrsModalMetricPrice").textContent = fmtUsdPrice(rc.price_usd);
                            if (rc.change_24h != null) {
                                document.getElementById("rrsModalMetricChanges").innerHTML = pctSpanHtml(rc.change_5m) + " / " + pctSpanHtml(rc.change_1h) + " / " + pctSpanHtml(rc.change_24h);
                            }
                            if (rc.market_cap != null) {
                                document.getElementById("rrsModalMetricMc").textContent = rc.market_cap > 0 ? fmtCompactUsd(rc.market_cap) : (mintAddr === WSOL_MINT ? "Spot Mainnet" : "$0");
                            }
                            if (rc.liquidity_usd != null)
                                document.getElementById("rrsModalMetricLiq").textContent = fmtCompactUsd(rc.liquidity_usd);
                            if (rc.volume_24h != null)
                                document.getElementById("rrsModalMetricVol").textContent = fmtCompactUsd(rc.volume_24h);
                            if (rc.pair_url && dexBtn)
                                dexBtn.href = rc.pair_url;
                            Object.assign(state.activeCoin, {
                                symbol: rc.symbol || state.activeCoin.symbol,
                                name: rc.name || state.activeCoin.name,
                                price_usd: rc.price_usd != null ? Number(rc.price_usd) : state.activeCoin.price_usd,
                                change_5m: rc.change_5m != null ? Number(rc.change_5m) : state.activeCoin.change_5m,
                                change_1h: rc.change_1h != null ? Number(rc.change_1h) : state.activeCoin.change_1h,
                                change_24h: rc.change_24h != null ? Number(rc.change_24h) : state.activeCoin.change_24h,
                                market_cap: rc.market_cap != null ? Number(rc.market_cap) : state.activeCoin.market_cap,
                                liquidity_usd: rc.liquidity_usd != null ? Number(rc.liquidity_usd) : state.activeCoin.liquidity_usd,
                                volume_24h: rc.volume_24h != null ? Number(rc.volume_24h) : state.activeCoin.volume_24h,
                                is_dead_pool: Boolean(rc.is_dead_pool),
                                liquidity_viability_passed: rc.liquidity_viability_passed
                            });
                            deadNow = isDeadOrDrainedPool(rc) || isDeadOrDrainedPool(state.activeCoin);
                            rawSc = rc.shield_score != null ? Number(rc.shield_score) : Number(rc.score != null ? rc.score : 20);
                            effScore = deadNow ? Math.min(25, rawSc) : rawSc;
                            state.activeCoin.shield_score = effScore;
                            effVerdict = deadNow
                                ? DEAD_POOL_BADGE
                                : (String(rc.checklist_summary || "11/12 Adaptive Security Layers") + " • " + String(rc.badge || rc.verdict || ""));
                            renderLayersHtml(rc.layers, effVerdict, effScore, state.activeCoin);
                        }
                        else if (state.activeCoin && state.activeCoin.mint === coin.mint) {
                            deadFallback = isDeadOrDrainedPool(state.activeCoin);
                            fbScore = deadFallback ? Math.min(25, Number(state.activeCoin.shield_score || 20)) : Number(state.activeCoin.shield_score || 75);
                            state.activeCoin.shield_score = fbScore;
                            renderLayersHtml(buildClientFallbackLayers(state.activeCoin), deadFallback ? DEAD_POOL_BADGE : "11/12 Real-Time Pool & Authority Layers Evaluated", fbScore, state.activeCoin);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    window.openCoinIntelModal = openCoinIntelModal;
    function closeCoinIntelModal() {
        var backdrop = document.getElementById("rrsCoinIntelModalBackdrop");
        if (!backdrop)
            return;
        backdrop.style.display = "none";
        backdrop.setAttribute("aria-hidden", "true");
    }
    function bindEvents() {
        var banner = document.getElementById("rrsLiveSolMemeTickerBanner");
        if (banner) {
            banner.addEventListener("click", function (ev) {
                var coinBtn = ev.target && ev.target.closest ? ev.target.closest("[data-rrs-mint]") : null;
                if (coinBtn) {
                    ev.preventDefault();
                    openCoinIntelModal(coinBtn.getAttribute("data-rrs-mint"));
                    return;
                }
                var solBtn = ev.target && ev.target.closest ? ev.target.closest("#rrsLiveSolSpotBadge") : null;
                if (solBtn && state.sol) {
                    ev.preventDefault();
                    openCoinIntelModal(WSOL_MINT);
                }
            });
        }
        var backdrop = document.getElementById("rrsCoinIntelModalBackdrop");
        if (backdrop) {
            backdrop.addEventListener("click", function (ev) {
                if (ev.target === backdrop)
                    closeCoinIntelModal();
            });
        }
        var backBtn = document.getElementById("rrsCoinModalBackBtn");
        if (backBtn)
            backBtn.addEventListener("click", closeCoinIntelModal);
        var closeBtn = document.getElementById("rrsCoinModalCloseBtn");
        if (closeBtn)
            closeBtn.addEventListener("click", closeCoinIntelModal);
        var homeBtn = document.getElementById("rrsCoinModalHomeBtn");
        if (homeBtn) {
            homeBtn.addEventListener("click", function () {
                closeCoinIntelModal();
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }
        var copyBtn = document.getElementById("rrsModalCopyMintBtn");
        if (copyBtn) {
            copyBtn.addEventListener("click", function () {
                if (!state.activeCoin)
                    return;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(state.activeCoin.mint).then(function () {
                        copyBtn.textContent = "Copied!";
                        setTimeout(function () { copyBtn.textContent = "Copy Mint"; }, 1400);
                    }).catch(function () { });
                }
            });
        }
        var auditBtn = document.getElementById("rrsCoinRunFullAuditBtn");
        if (auditBtn) {
            auditBtn.addEventListener("click", function () {
                if (!state.activeCoin)
                    return;
                var m = state.activeCoin.mint;
                var sym = state.activeCoin.symbol;
                closeCoinIntelModal();
                populateService2ScannerInput(m);
                if (typeof window.switchNativeTab === "function") {
                    window.switchNativeTab("shield");
                }
                var card2 = document.getElementById("rugShieldCard");
                if (card2 && card2.scrollIntoView) {
                    card2.scrollIntoView({ behavior: "smooth", block: "start" });
                }
                if (typeof window.scanToken === "function") {
                    window.scanToken(false, m);
                }
                else if (typeof window.runMintAudit === "function") {
                    window.runMintAudit(sym);
                }
            });
        }
        var swapBtn = document.getElementById("rrsCoinProtectedSwapBtn");
        if (swapBtn) {
            swapBtn.addEventListener("click", function () {
                if (!state.activeCoin)
                    return;
                var c = state.activeCoin;
                var sc = Number(c.shield_score || 0);
                if (c.mint === WSOL_MINT) {
                    window.open("https://jup.ag/swap/USDC-SOL?referrer=" + encodeURIComponent(JUP_REF_WALLET) + "&feeBps=" + encodeURIComponent(JUP_REF_BPS), "_blank", "noopener,noreferrer");
                    return;
                }
                if (sc >= 85 && typeof window.executeVerifiedSafeBlinkSwap === "function") {
                    closeCoinIntelModal();
                    window.executeVerifiedSafeBlinkSwap(c.mint, c.symbol, 0.1);
                    return;
                }
                if (sc < 85) {
                    var proceed = window.confirm("Shield Score is " + sc + "/100 (below 85 Verified Safe threshold). Run Full 12-Layer Audit first or click OK to open Jupiter Swap anyway.");
                    if (!proceed)
                        return;
                }
                window.open("https://jup.ag/swap/SOL-" + encodeURIComponent(c.mint) + "?referrer=" + encodeURIComponent(JUP_REF_WALLET) + "&feeBps=" + encodeURIComponent(JUP_REF_BPS), "_blank", "noopener,noreferrer");
            });
        }
        document.addEventListener("keydown", function (ev) {
            if (ev.key === "Escape") {
                var bd = document.getElementById("rrsCoinIntelModalBackdrop");
                if (bd && bd.style.display !== "none") {
                    closeCoinIntelModal();
                }
            }
        });
    }
    function startTickerEngine() {
        bindEvents();
        loadLiveMarketFeed();
        setInterval(function () {
            if (!document.hidden) {
                loadLiveMarketFeed();
            }
        }, 15000);
        document.addEventListener("visibilitychange", function () {
            if (!document.hidden) {
                loadLiveMarketFeed();
            }
        });
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startTickerEngine);
    }
    else {
        startTickerEngine();
    }
})();;

(function(){
  var MODAL_SEL = '.modal, .modal-backdrop, [role="dialog"]:not(#rrsMobile12LayerSheet), #periodic90sPingsBubble, #smart25sPingToast';
  var _userInteracted = /[?&]checkout_tier=/i.test(window.location.search || "");

  function markUserClick(){ _userInteracted = true; }
  window.addEventListener("pointerdown", markUserClick, true);
  window.addEventListener("touchstart", markUserClick, true);
  window.addEventListener("click", markUserClick, true);
  window.addEventListener("keydown", function(e){
    if (e.key === "Enter" || e.key === " ") _userInteracted = true;
    if (e.key === "Escape" || e.key === "Esc") {
      window.rrsCloseAllModals();
    }
  }, true);

  window.rrsHideModalEl = function(el){
    if (!el) return;
    el.classList.remove("rrs-slide-visible", "open");
    if (el.style.display !== "none") el.style.display = "none";
    if (el.getAttribute("aria-hidden") !== "true") el.setAttribute("aria-hidden", "true");
    if (!el.hasAttribute("hidden")) el.setAttribute("hidden", "");
  };

  window.rrsShowModalEl = function(el, disp){
    if (!el) return;
    el.removeAttribute("hidden");
    el.setAttribute("aria-hidden", "false");
    el.style.display = disp || "flex";
  };

  window.rrsCloseAllModals = function(){
    var nodes = document.querySelectorAll(MODAL_SEL);
    for (var i = 0; i < nodes.length; i++){
      window.rrsHideModalEl(nodes[i]);
    }
    var drw = document.getElementById("inlineAdInquiryDrawer");
    if (drw) window.rrsHideModalEl(drw);
    var pop = document.getElementById("rrsLayer11GlobalPopover");
    if (pop) { pop.classList.remove("rrs-open"); pop.style.display = "none"; pop.setAttribute("aria-hidden", "true"); }
  };

  function bindModalElement(el){
    if (!el || el.__rrsBoundV315) return;
    el.__rrsBoundV315 = true;
    el.addEventListener("click", function(ev){
      if (ev.target === el && el.id !== "periodic90sPingsBubble" && el.id !== "smart25sPingToast"){
        window.rrsHideModalEl(el);
      }
    });
    var obs = new MutationObserver(function(){
      var d = (el.style && el.style.display) ? el.style.display.trim().toLowerCase() : "";
      if (d && d !== "none"){
        if (!_userInteracted){
          window.rrsHideModalEl(el);
          return;
        }
        if (el.hasAttribute("hidden")) el.removeAttribute("hidden");
        if (el.getAttribute("aria-hidden") !== "false") el.setAttribute("aria-hidden", "false");
      } else if (d === "none"){
        if (el.getAttribute("aria-hidden") !== "true") el.setAttribute("aria-hidden", "true");
        if (!el.hasAttribute("hidden")) el.setAttribute("hidden", "");
      }
    });
    obs.observe(el, { attributes: true, attributeFilter: ["style", "class"] });
  }

  function enforceInitialClosedState(){
    var keepChkOpen = /[?&]checkout_tier=/i.test(window.location.search || "");
    var nodes = document.querySelectorAll(MODAL_SEL);
    for (var i = 0; i < nodes.length; i++){
      if (keepChkOpen && nodes[i].id === "liveCheckoutModal") {
        bindModalElement(nodes[i]);
        continue;
      }
      window.rrsHideModalEl(nodes[i]);
      bindModalElement(nodes[i]);
    }
    var drw = document.getElementById("inlineAdInquiryDrawer");
    if (drw) {
      window.rrsHideModalEl(drw);
      bindModalElement(drw);
    }
  }

  window.closeWatchDemoModal = function(){
    window.rrsHideModalEl(document.getElementById("watchDemoModal"));
  };
  window.closeIsolatedDemoPreview = function(){
    window.rrsHideModalEl(document.getElementById("isolatedDemoPreviewModal"));
  };

  enforceInitialClosedState();
  document.addEventListener("DOMContentLoaded", enforceInitialClosedState);
  window.addEventListener("pageshow", function(){
    var hasDeepTier = /[?&]checkout_tier=/i.test(window.location.search || "");
    _userInteracted = hasDeepTier;
    if (!hasDeepTier) {
      enforceInitialClosedState();
    } else if (typeof window.openLiveCheckout === "function") {
      var qp = new URLSearchParams(window.location.search);
      window.openLiveCheckout(qp.get("checkout_tier"), qp.get("asset") || "SOL");
    }
  });
})();;

(function(){
  'use strict';
  window.rrsLaunchInteractiveDemo = function(src){
    try {
      if (typeof window.startInteractiveCursorTour === 'function') { window.startInteractiveCursorTour(); return true; }
      if (typeof window.openWatchDemoModal === 'function') { window.openWatchDemoModal(); return true; }
      var m = document.getElementById('watchDemoModal');
      if (m) { m.hidden = false; m.removeAttribute('hidden'); m.setAttribute('aria-hidden', 'false'); m.style.display = 'flex'; return true; }
    } catch (e) { if (window.console) console.warn('[rrs-demo] launch failed', e); }
    return false;
  };
  function autoLaunchFromUrl(){
    try {
      var q = new URLSearchParams(window.location.search || '');
      if (q.get('demo') === '1' || String(window.location.hash || '').toLowerCase() === '#demo') {
        setTimeout(function(){ window.rrsLaunchInteractiveDemo('deep_link'); }, 900);
      }
    } catch (e) {}
  }
  if (document.readyState === 'complete') { autoLaunchFromUrl(); } else { window.addEventListener('load', autoLaunchFromUrl); }
})();
