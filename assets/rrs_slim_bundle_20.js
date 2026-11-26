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
    var SOL_MINT = 'So11111111111111111111111111111111111111112';
    var latestMoons = [];
    var curToken = {
        mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        symbol: 'BONK', name: 'Bonk', price: '0.00002', h1: 4.8, liq: 1200000, status: 'CLEAR'
    };
    var jupReady = false;
    /* Subtle 2-Note Radar Ping Chime (Only plays after user interaction) */
    function playSoftPing() {
        try {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (!AC)
                return;
            var c = window.__rrsPingCtx || (window.__rrsPingCtx = new AC());
            if (c.state === 'suspended')
                return;
            [880, 1174.66].forEach(function (freq, idx) {
                var o = c.createOscillator();
                var g = c.createGain();
                var t = c.currentTime + idx * 0.11;
                o.type = 'sine';
                o.frequency.setValueAtTime(freq, t);
                g.gain.setValueAtTime(0.0001, t);
                g.gain.linearRampToValueAtTime(0.045, t + 0.015);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
                o.connect(g);
                g.connect(c.destination);
                o.start(t);
                o.stop(t + 0.24);
            });
        }
        catch (_e) { }
    }
    function check12LayerSummary(mint, liqUsd) {
        return __awaiter(this, void 0, void 0, function () {
            var r, d, risks, danger, _e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, fetch('https://api.rugcheck.xyz/v1/tokens/' + encodeURIComponent(mint) + '/report/summary')];
                    case 1:
                        r = _a.sent();
                        if (!r.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, r.json()];
                    case 2:
                        d = _a.sent();
                        risks = Array.isArray(d.risks) ? d.risks : [];
                        danger = risks.some(function (x) { return (x.level || '').toLowerCase() === 'danger'; });
                        if (danger || Number(d.score || 0) > 2500)
                            return [2 /*return*/, { tag: 'HIGH RISK FLAGGED', col: '#EF4444', bg: '#7F1D1D' }];
                        if (risks.length > 0 || (liqUsd && liqUsd < 15000))
                            return [2 /*return*/, { tag: 'CAUTION • CHECK LP', col: '#FBBF24', bg: '#78350F' }];
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        _e_1 = _a.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, { tag: '12-LAYER CLEAR', col: '#34D399', bg: '#064E3B' }];
                }
            });
        });
    }
    function loadJupiterScript(done) {
        if (window.Jupiter && typeof window.Jupiter.init === 'function') {
            done();
            return;
        }
        if (jupReady) {
            setTimeout(function () { loadJupiterScript(done); }, 200);
            return;
        }
        jupReady = true;
        var s = document.createElement('script');
        s.src = 'https://plugin.jup.ag/plugin-v1.js';
        s.async = true;
        s.onload = done;
        s.onerror = function () {
            var s2 = document.createElement('script');
            s2.src = 'https://terminal.jup.ag/main-v4.js';
            s2.async = true;
            s2.onload = done;
            document.head.appendChild(s2);
        };
        document.head.appendChild(s);
    }
    function renderJupSwap(mint, side) {
        var box = document.getElementById('rrs-eco-jup-box');
        if (!box)
            return;
        box.innerHTML = '<div style="padding:32px;text-align:center;color:#F5C542;font-weight:800;">⚡ Connecting Non-Custodial Jupiter Swap...</div>';
        loadJupiterScript(function () {
            try {
                if (window.Jupiter && window.Jupiter.close) {
                    try {
                        window.Jupiter.close();
                    }
                    catch (_e) { }
                }
                box.innerHTML = '';
                window.Jupiter.init({
                    displayMode: 'integrated',
                    integratedTargetId: 'rrs-eco-jup-box',
                    endpoint: 'https://api.mainnet-beta.solana.com',
                    formProps: {
                        initialInputMint: (side === 'sell') ? mint : SOL_MINT,
                        initialOutputMint: (side === 'sell') ? SOL_MINT : mint,
                        swapMode: 'ExactInOrOut'
                    }
                });
            }
            catch (_err) {
                box.innerHTML = '<div style="padding:26px;text-align:center;"><a href="https://jup.ag/swap/SOL-' + encodeURIComponent(mint) + '" target="_blank" rel="noopener" style="display:inline-block;padding:11px 18px;background:#F5C542;color:#05070C;font-weight:900;border-radius:8px;text-decoration:none;">⚡ Swap $' + curToken.symbol + ' on Jupiter ↗</a></div>';
            }
        });
    }
    window.openEcosystemModal = function (tok, side) {
        return __awaiter(this, void 0, void 0, function () {
            var modal, pct, cf, targetSrc, bBuy, bSell, v, vBar, vTxt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        curToken = tok || curToken;
                        modal = document.getElementById('rrsEcosystemTradeModal');
                        if (!modal)
                            return [2 /*return*/];
                        pct = Number(curToken.h1 || 0);
                        document.getElementById('rrs-eco-hdr').textContent = '🚀 $' + curToken.symbol + ' (' + (pct >= 0 ? '+' : '') + pct.toFixed(1) + '% 1h) • CHART & BUY/SELL';
                        document.getElementById('rrs-eco-sub').textContent = curToken.name + ' • ' + curToken.mint.slice(0, 6) + '...' + curToken.mint.slice(-4) + ' • Non-Custodial Wallet Sign';
                        document.getElementById('rrs-eco-ext-chart').href = 'https://dexscreener.com/solana/' + encodeURIComponent(curToken.mint);
                        cf = document.getElementById('rrs-eco-chart-frame');
                        targetSrc = 'https://dexscreener.com/solana/' + encodeURIComponent(curToken.mint) + '?embed=1&theme=dark&trades=0&info=0';
                        if (cf.src !== targetSrc)
                            cf.src = targetSrc;
                        bBuy = document.getElementById('rrs-eco-buy');
                        bSell = document.getElementById('rrs-eco-sell');
                        if (side === 'sell') {
                            bSell.style.background = '#EF4444';
                            bSell.style.color = '#FFF';
                            bSell.style.borderColor = '#EF4444';
                            bBuy.style.background = '#111827';
                            bBuy.style.color = '#E5E7EB';
                            bBuy.style.borderColor = '#374151';
                        }
                        else {
                            bBuy.style.background = '#10B981';
                            bBuy.style.color = '#04120B';
                            bBuy.style.borderColor = '#10B981';
                            bSell.style.background = '#111827';
                            bSell.style.color = '#E5E7EB';
                            bSell.style.borderColor = '#374151';
                        }
                        modal.setAttribute('aria-hidden', 'false');
                        modal.style.display = 'flex';
                        renderJupSwap(curToken.mint, side || 'buy');
                        return [4 /*yield*/, check12LayerSummary(curToken.mint, curToken.liq)];
                    case 1:
                        v = _a.sent();
                        vBar = document.getElementById('rrs-eco-verdict');
                        vTxt = document.getElementById('rrs-eco-verdict-txt');
                        vBar.style.background = v.bg;
                        vBar.style.borderColor = v.col;
                        vTxt.textContent = '🛡️ 12-LAYER AUTO-DETECT: ' + v.tag + ' • Liq $' + Math.round((curToken.liq || 0) / 1000) + 'K';
                        return [2 /*return*/];
                }
            });
        });
    };
    function showRocketCornerPing(tok, withSound) {
        return __awaiter(this, void 0, void 0, function () {
            var box, v, pct, pCol;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!tok)
                            return [2 /*return*/];
                        curToken = tok;
                        box = document.getElementById('rrs-rocket-ping-box');
                        if (!box)
                            return [2 /*return*/];
                        return [4 /*yield*/, check12LayerSummary(tok.mint, tok.liq)];
                    case 1:
                        v = _a.sent();
                        pct = Number(tok.h1 || 0);
                        pCol = pct >= 0 ? '#34D399' : '#F87171';
                        box.innerHTML =
                            '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;">' +
                                '<span style="background:' + v.bg + ';color:#FFF;border:1px solid ' + v.col + ';padding:3px 9px;border-radius:999px;font-size:11px;font-weight:900;letter-spacing:0.04em;">🛡️ 12-LAYER AUTO-DETECT • ' + v.tag + '</span>' +
                                '<button id="rrs-ping-dismiss" type="button" style="background:transparent;border:none;color:#94A3B8;font-size:16px;font-weight:900;cursor:pointer;line-height:1;">✕</button>' +
                                '</div>' +
                                '<div style="display:flex;align-items:center;gap:11px;margin-bottom:11px;">' +
                                (tok.logo ? '<img src="' + tok.logo + '" alt="" style="width:44px;height:44px;border-radius:50%;border:2px solid #F5C542;object-fit:cover;flex-shrink:0;">' : '<div style="width:44px;height:44px;border-radius:50%;background:#141C2E;border:2px solid #F5C542;display:flex;align-items:center;justify-content:center;font-size:22px;">🚀</div>') +
                                '<div style="min-width:0;flex:1;">' +
                                '<div style="font-weight:900;font-size:18px;color:#FFFFFF;letter-spacing:0.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">🚀 $' + tok.symbol + ' 🚀 <span style="color:' + pCol + ';font-size:15px;">' + (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%</span></div>' +
                                '<div style="font-size:12px;color:#CBD5E1;">' + tok.name.slice(0, 24) + ' • Liq $' + Math.round((tok.liq || 0) / 1000) + 'K • Live Solana Mover</div>' +
                                '</div>' +
                                '</div>' +
                                '<div style="display:grid;grid-template-columns:1fr 1.25fr;gap:8px;">' +
                                '<button id="rrs-ping-chart-btn" type="button" style="padding:9px 10px;border-radius:9px;border:1.5px solid #38BDF8;background:#0F1B2D;color:#38BDF8;font-weight:900;font-size:12.5px;cursor:pointer;">📈 Live Chart</button>' +
                                '<button id="rrs-ping-trade-btn" type="button" style="padding:9px 10px;border-radius:9px;border:none;background:linear-gradient(180deg,#F5C542 0%,#C99E27 100%);color:#05070C;font-weight:900;font-size:12.5px;cursor:pointer;">🚀 Buy / Sell Now</button>' +
                                '</div>';
                        box.style.display = 'block';
                        if (withSound)
                            playSoftPing();
                        document.getElementById('rrs-ping-dismiss').onclick = function (e) {
                            e.stopPropagation();
                            box.style.display = 'none';
                        };
                        document.getElementById('rrs-ping-chart-btn').onclick = function () {
                            window.openEcosystemModal(tok, 'buy');
                        };
                        document.getElementById('rrs-ping-trade-btn').onclick = function () {
                            window.openEcosystemModal(tok, 'buy');
                        };
                        return [2 /*return*/];
                }
            });
        });
    }
    function fetchLiveTrendingMoons() {
        return __awaiter(this, void 0, void 0, function () {
            var r, items, mints, i, pr, pd, pairs, map, top, _e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, fetch('https://api.dexscreener.com/token-boosts/top/v1', { cache: 'no-store' })];
                    case 1:
                        r = _a.sent();
                        if (!r.ok)
                            return [2 /*return*/];
                        return [4 /*yield*/, r.json()];
                    case 2:
                        items = _a.sent();
                        mints = [];
                        for (i = 0; i < items.length && mints.length < 5; i++) {
                            if (items[i] && items[i].chainId === 'solana' && items[i].tokenAddress && mints.indexOf(items[i].tokenAddress) === -1) {
                                mints.push(items[i].tokenAddress);
                            }
                        }
                        if (!mints.length)
                            return [2 /*return*/];
                        return [4 /*yield*/, fetch('https://api.dexscreener.com/latest/dex/tokens/' + mints.join(','), { cache: 'no-store' })];
                    case 3:
                        pr = _a.sent();
                        if (!pr.ok)
                            return [2 /*return*/];
                        return [4 /*yield*/, pr.json()];
                    case 4:
                        pd = _a.sent();
                        pairs = Array.isArray(pd.pairs) ? pd.pairs : [];
                        map = {};
                        pairs.forEach(function (p) {
                            if (!p || p.chainId !== 'solana' || !p.baseToken)
                                return;
                            var m = p.baseToken.address;
                            var liq = (p.liquidity && p.liquidity.usd) ? Number(p.liquidity.usd) : 0;
                            if (!map[m] || liq > map[m].liq) {
                                map[m] = {
                                    mint: m,
                                    symbol: (p.baseToken.symbol || 'SOL').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 9) || 'MOON',
                                    name: p.baseToken.name || 'Solana Token',
                                    price: p.priceUsd || '0',
                                    h1: (p.priceChange && p.priceChange.h1 !== undefined) ? Number(p.priceChange.h1) : 0,
                                    liq: liq,
                                    logo: (p.info && p.info.imageUrl) ? p.info.imageUrl : ''
                                };
                            }
                        });
                        latestMoons = mints.map(function (m) { return map[m]; }).filter(Boolean);
                        if (latestMoons.length > 0) {
                            top = latestMoons.slice().sort(function (a, b) { return b.h1 - a.h1; })[0];
                            /* Handled by V16 crisp card */
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        _e_2 = _a.sent();
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    /* Wire Hover Story Popover + Live Demo onto Top 'Test Alert' Button */
    function wireTestAlertButtonExplain() {
        var tip = document.getElementById('rrs-shield-story-tip');
        document.querySelectorAll('button, a, [role="button"]').forEach(function (btn) {
            var tx = (btn.textContent || '').trim().toLowerCase();
            if (tx.indexOf('test alert') !== -1 || tx === 'test shield' || (tx.indexOf('test') !== -1 && tx.indexOf('alert') !== -1)) {
                /* V16 clean header */
                if (btn.__rrsStoryWired)
                    return;
                btn.__rrsStoryWired = true;
                btn.setAttribute('title', '3-State 12-Layer Engine Shield (SECURE / CAUTION / ALERT) | Hover to read how our Moat protects your wallet, click to preview a live Rocket Alert!');
                btn.addEventListener('mouseenter', function () {
                    var rect = btn.getBoundingClientRect();
                    var leftPos = Math.min(window.innerWidth - 386, Math.max(12, rect.left));
                    tip.style.left = leftPos + 'px';
                    tip.style.top = (rect.bottom + 10) + 'px';
                    tip.style.display = 'block';
                });
                btn.addEventListener('mouseleave', function () {
                    tip.style.display = 'none';
                });
                btn.addEventListener('click', function () {
                    try {
                        var AC = window.AudioContext || window.webkitAudioContext;
                        if (AC) {
                            window.__rrsPingCtx = window.__rrsPingCtx || new AC();
                            if (window.__rrsPingCtx.state === 'suspended')
                                window.__rrsPingCtx.resume();
                        }
                    }
                    catch (_e) { }
                    var sample = latestMoons[0] || curToken;
                    showRocketCornerPing(sample, true);
                });
            }
        });
    }
    function bootV13() {
        document.getElementById('rrs-eco-close').onclick = function () {
            var m = document.getElementById('rrsEcosystemTradeModal');
            m.style.display = 'none';
            m.setAttribute('aria-hidden', 'true');
        };
        document.getElementById('rrsEcosystemTradeModal').onclick = function (e) {
            if (e.target && e.target.id === 'rrsEcosystemTradeModal') {
                e.target.style.display = 'none';
                e.target.setAttribute('aria-hidden', 'true');
            }
        };
        document.getElementById('rrs-eco-buy').onclick = function () { window.openEcosystemModal(curToken, 'buy'); };
        document.getElementById('rrs-eco-sell').onclick = function () { window.openEcosystemModal(curToken, 'sell'); };
        document.getElementById('rrs-eco-deep-btn').onclick = function () {
            var m = document.getElementById('rrsEcosystemTradeModal');
            m.style.display = 'none';
            m.setAttribute('aria-hidden', 'true');
            var inp = document.querySelector('input[placeholder*="mint" i], input[placeholder*="token" i], #tokenInput, #mintInput');
            if (inp) {
                inp.value = curToken.mint;
                inp.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };
        wireTestAlertButtonExplain();
        setTimeout(wireTestAlertButtonExplain, 900);
        fetchLiveTrendingMoons();
        setInterval(fetchLiveTrendingMoons, 70000);
    }
    if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', bootV13);
    else
        bootV13();
})();;

(function(){
  function polishScannerButtons() {
    var conn = Boolean(window.solana && window.solana.isConnected && window.solana.publicKey);
    var discBtn = document.getElementById('panel1DisconnectWalletBtn');
    if (discBtn && !conn) {
      discBtn.style.setProperty('display', 'none', 'important');
    }
    var scanBtn = document.getElementById('scanWalletBtn');
    if (scanBtn) {
      if (!scanBtn.classList.contains('rrs-btn-scanning-obsidian') && !scanBtn.__rrsBusy) { if (!scanBtn.classList.contains('rrs-btn-scanning-obsidian') && !scanBtn.__rrsBusy) { if (!scanBtn.classList.contains('rrs-btn-scanning-obsidian') && !scanBtn.__rrsBusy) { if (!scanBtn.classList.contains('rrs-btn-scanning-obsidian') && !scanBtn.__rrsBusy) { if (!scanBtn.classList.contains('rrs-btn-scanning-obsidian') && !scanBtn.__rrsBusy) { if (!scanBtn.classList.contains('rrs-btn-scanning-obsidian') && !scanBtn.__rrsBusy) { scanBtn.innerHTML = '🔥 Scan Rent &amp; Burn Dead Coins'; } } } } } }
    }
    var burnBtn = document.getElementById('burnerScanBtn');
    if (burnBtn) {
      burnBtn.innerHTML = '🧪 Scan Burnable Dust Tokens';
    }
    var feedSec = document.getElementById('verifiedFullCycleFeedSection');
    if (feedSec && feedSec.innerHTML.indexOf('10' + String.fromCharCode(162)) !== -1) {
      var c10 = '10' + String.fromCharCode(162);
      feedSec.innerHTML = feedSec.innerHTML.split(c10 + ' Checkout').join('On-Chain Checkout').split(c10 + ' Mainnet').join('Verified Mainnet').split(c10).join('Verified');
    }
    var chkMod = document.getElementById('liveCheckoutModal');
    if (chkMod && chkMod.parentElement && chkMod.parentElement !== document.body) {
      document.body.appendChild(chkMod);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', polishScannerButtons);
  else polishScannerButtons();
  setInterval(polishScannerButtons, 800);
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
    var LIVE_API_BASE = "";
    var TREASURY_WALLET = "89Sv5FvnMNRid1bn8y2Ti1vJPSxWxgiW9GSLsPpBnKK1";
    window.RRS_TREASURY_WALLET = TREASURY_WALLET;
    window.TREASURY_WALLET = TREASURY_WALLET;
    window.FEE_WALLET = TREASURY_WALLET;
    window.PASS_TREASURY_PUBKEY = TREASURY_WALLET;
    window.TREASURY_ADDR = TREASURY_WALLET;
    window.RRS_API_BASE = LIVE_API_BASE;
    var isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || "");
    if (!isMobileDevice)
        document.documentElement.classList.add("rrs-desktop-pc");
    function currentLiveApiBase() {
        var b = (window.BACKEND_TUNNEL_BASE && window.BACKEND_TUNNEL_BASE.indexOf("http") === 0) ? window.BACKEND_TUNNEL_BASE : LIVE_API_BASE;
        return String(b).replace(/\/+$/, "");
    }
    var isPublicStatic = (String(location.port || "") !== "8088");
    if (isPublicStatic) {
        window.getApiBase = currentLiveApiBase;
        window.resolveRrsApiBase = currentLiveApiBase;
        window.resolveApiBase = currentLiveApiBase;
    }
    if (!window.__RRS_V4_FETCH_ROUTER && typeof window.fetch === "function") {
        window.__RRS_V4_FETCH_ROUTER = true;
        var _origFetch = window.fetch;
        function refreshTunnelBaseFromRaw() {
            return __awaiter(this, void 0, void 0, function () {
                var r, j, cand, _e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            return [4 /*yield*/, _origFetch("https://raw.githubusercontent.com/sonnyman2014/rentandrugshield/main/live_endpoint.json?t=" + Date.now(), { cache: "no-store" })];
                        case 1:
                            r = _a.sent();
                            if (!(r && r.ok)) return [3 /*break*/, 3];
                            return [4 /*yield*/, r.json()];
                        case 2:
                            j = _a.sent();
                            cand = (j && (j.api_base || j.tunnel_url || j.backend_url || "")).replace(/\/+$/, "");
                            if (cand && cand.indexOf("https://") === 0) {
                                LIVE_API_BASE = cand;
                                window.BACKEND_TUNNEL_BASE = cand;
                                window.RRS_API_BASE = cand;
                                return [2 /*return*/, cand];
                            }
                            _a.label = 3;
                        case 3: return [3 /*break*/, 5];
                        case 4:
                            _e_1 = _a.sent();
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/, null];
                    }
                });
            });
        }
        window.fetch = function (input, init) {
            return __awaiter(this, void 0, void 0, function () {
                var apiPath, u, base, resp, fresh, err_1, fresh2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            apiPath = null;
                            try {
                                u = (typeof input === "string") ? input : ((input && input.url) || "");
                                if (isPublicStatic && u) {
                                    base = currentLiveApiBase();
                                    if (u.indexOf("/api/") === 0) {
                                        apiPath = u;
                                        input = base + u;
                                    }
                                    else if (u.indexOf(".trycloudflare.com/api/") !== -1) {
                                        apiPath = u.substring(u.indexOf("/api/"));
                                        input = base + apiPath;
                                    }
                                    else if (u.indexOf("https://rentandrugshield.com/api/") === 0) {
                                        apiPath = u.substring("https://rentandrugshield.com".length);
                                        input = base + apiPath;
                                    }
                                }
                            }
                            catch (_e) { }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 5, , 8]);
                            return [4 /*yield*/, _origFetch.call(this, input, init)];
                        case 2:
                            resp = _a.sent();
                            if (!(apiPath && resp && (resp.status === 502 || resp.status === 503 || resp.status === 530))) return [3 /*break*/, 4];
                            return [4 /*yield*/, refreshTunnelBaseFromRaw()];
                        case 3:
                            fresh = _a.sent();
                            if (fresh)
                                return [2 /*return*/, _origFetch.call(this, fresh + apiPath, init)];
                            _a.label = 4;
                        case 4: return [2 /*return*/, resp];
                        case 5:
                            err_1 = _a.sent();
                            if (!apiPath) return [3 /*break*/, 7];
                            return [4 /*yield*/, refreshTunnelBaseFromRaw()];
                        case 6:
                            fresh2 = _a.sent();
                            if (fresh2)
                                return [2 /*return*/, _origFetch.call(this, fresh2 + apiPath, init)];
                            _a.label = 7;
                        case 7: throw err_1;
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
    }
    function applyHeroAndPanel1Fixes() {
        var heroHead = null;
        document.querySelectorAll("h1, h2, .hero-title").forEach(function (h) {
            if (!heroHead && !h.closest("#rrsViewInstitutional") && (h.textContent || "").indexOf("Reclaim Trapped SOL Rent") !== -1)
                heroHead = h;
        });
        if (heroHead && heroHead.parentElement && !heroHead.parentElement.querySelector(".rrs-hero-bullets-v4")) {
            var heroBox = heroHead.parentElement;
            Array.from(heroBox.children).forEach(function (ch) {
                if (ch !== heroHead && ch.tagName === "P" && !ch.querySelector("button, a"))
                    ch.style.display = "none";
            });
            var ul = document.createElement("ul");
            ul.className = "rrs-hero-bullets-v4";
            ul.innerHTML =
                '<li><b>1st Rent Claim 100% Free:</b> Recover ~0.00204 SOL per empty ATA (98.0% net&nbsp;after).</li>' +
                    '<li><b>#1 Chrome Toolbar Shield:</b> Blocks rugs in &lt;120ms pre-buy with layer &amp; latency&nbsp;toggles.</li>' +
                    '<li><b>24/7 Wizard Engineer On Call:</b> Human lead engineer + live Python AI agent&nbsp;swarm.</li>' +
                    '<li><b>Powered by 12-Layer Security:</b> Frontier AI paired with Helius Mainnet byte&nbsp;checks.</li>' +
                    '<li><b>The AI Leapfrog Advantage:</b> Predictive live defense vs. slow static&nbsp;blacklists.</li>' +
                    '<li><b>Veteran Trader Intuition:</b> Years of real Solana order-flow instincts built in&nbsp;free.</li>' +
                    '<li><b>Cyborg &amp; Python Wolf Pack:</b> 7 live security daemons locking hashes, TLS &amp; rug&nbsp;moat.</li>' +
                    '<li><b>100% Non-Custodial Safety:</b> Read-only scans &amp; client signing. Zero private&nbsp;keys.</li>' +
                    '<li><b>Dead Scam Dust Burner:</b> Incinerates worthless airdrop traps &amp; unlocks account&nbsp;rent.</li>' +
                    '<li><b>Honesty Mandate:</b> Cancel anytime passes with sneaky auto-billing <b>OFF</b> by&nbsp;default.</li>';
            heroHead.insertAdjacentElement("afterend", ul);
        }
        var p1 = document.getElementById("rentShieldCard");
        if (p1) {
            var fb = document.getElementById("feeBadge");
            if (fb) {
                var curFb = (fb.textContent || "").trim();
                if (curFb.length > 28 || curFb.indexOf("SPL & Token-2022") !== -1)
                    fb.textContent = "1ST CLAIM FREE • READY";
            }
            var desc = p1.querySelector(".service-card-desc");
            if (desc && !desc.dataset.v4Clean) {
                desc.dataset.v4Clean = "1";
                desc.innerHTML = 'Recover <b>~0.00204 SOL</b> locked in every empty SPL &amp; Token-2022 account • <b style="color:#14F195;">1st Claim 100% Free</b> (98.0% Net SOL after) • Zero Seed Phrases.';
            }
            if (!p1.querySelector(".rrs-p1-feature-grid")) {
                var fg = document.createElement("div");
                fg.className = "rrs-p1-feature-grid";
                fg.innerHTML =
                    '<div class="rrs-p1-fchip">💎 1st Claim 100% Free (Full 2,039,280 Lamports)</div>' +
                        '<div class="rrs-p1-fchip">🔥 Atomic Dead Rug &amp; Scam Dust Incinerator</div>' +
                        '<div class="rrs-p1-fchip">🔒 Official SPL 0x09 CloseAccount (Zero Keys)</div>' +
                        '<div class="rrs-p1-fchip">📜 Instant Clickable Solscan Refund Receipt</div>';
                var autoLbl = document.getElementById("prop-autocollect-label");
                if (autoLbl)
                    autoLbl.insertAdjacentElement("beforebegin", fg);
                else
                    p1.appendChild(fg);
            }
        }
        document.querySelectorAll("div, span, b, strong").forEach(function (el) {
            if (el.children.length === 0 && (el.textContent || "").trim() === "ANTS") {
                var liveSyms = ["SINGULARITY", "CHUD", "TRADER", "GATO", "LOOSY", "HOGE"];
                el.textContent = liveSyms[Math.floor(Date.now() / 6000) % liveSyms.length];
            }
        });
        document.querySelectorAll("button, a").forEach(function (el) {
            var tx = (el.textContent || "").trim();
            if (tx.indexOf("Connect Phantom Extension") !== -1 || tx.indexOf("Connect Solflare Extension") !== -1) {
                el.classList.add("rrs-mobile-only-paybtn");
            }
        });
        document.querySelectorAll("div, p, span").forEach(function (el) {
            if (el.children.length <= 3) {
                var t = (el.textContent || "").trim();
                if (el.closest("#rrsHonestyTrialModal") || el.closest("#rrsHonestyPledgeModal"))
                    return;
                if ((t.indexOf("auto-billing") !== -1 || t.indexOf("$19.99/mo Pro") !== -1) && !el.closest(".rrs-honesty-box")) {
                    var modalCard = el.closest('[id*="Modal" i], [id*="modal" i], [class*="modal" i]');
                    if (modalCard && !document.querySelector(".rrs-honesty-box")) {
                        var hBox = document.createElement("div");
                        hBox.className = "rrs-honesty-box";
                        hBox.innerHTML =
                            '<div style="color:#14F195;font-weight:800;">🛡️ Honesty Mandate • Cancel Anytime • Full 12-Layer Pro Access</div>' +
                                '<label><input type="checkbox" id="rrs-optin-autobill-chk" />' +
                                '<span>Optional Auto-Billing Renewal (<b>OFF by default</b> | we NEVER auto-bill unless you tick this box)</span></label>';
                        var anchor = null;
                        modalCard.querySelectorAll("div, button").forEach(function (cand) {
                            var ct = (cand.textContent || "").trim();
                            if (!anchor && (ct.indexOf("Exact Amount to Send") === 0 || ct.indexOf("Ready to pay") !== -1))
                                anchor = cand;
                        });
                        if (anchor && anchor.parentElement)
                            anchor.parentElement.insertBefore(hBox, anchor);
                        else
                            modalCard.appendChild(hBox);
                    }
                }
            }
        });
    }
    var origDisc = window.disconnectAndClearWallet;
    window.disconnectAndClearWallet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _e2_1, wi, fb;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        try {
                            if (typeof origDisc === "function")
                                origDisc();
                        }
                        catch (_e) { }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        if (!(window.phantom && window.phantom.solana && window.phantom.solana.disconnect)) return [3 /*break*/, 3];
                        return [4 /*yield*/, window.phantom.solana.disconnect()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!(window.solana && window.solana.disconnect)) return [3 /*break*/, 5];
                        return [4 /*yield*/, window.solana.disconnect()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (!(window.solflare && window.solflare.disconnect)) return [3 /*break*/, 7];
                        return [4 /*yield*/, window.solflare.disconnect()];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        _e2_1 = _a.sent();
                        return [3 /*break*/, 9];
                    case 9:
                        wi = document.getElementById("walletInput");
                        if (wi)
                            wi.value = "";
                        fb = document.getElementById("feeBadge");
                        if (fb)
                            fb.textContent = "1ST CLAIM FREE • READY";
                        return [2 /*return*/];
                }
            });
        });
    };
    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", applyHeroAndPanel1Fixes);
    else
        applyHeroAndPanel1Fixes();
    document.addEventListener("click", function () { setTimeout(applyHeroAndPanel1Fixes, 120); });
    setInterval(applyHeroAndPanel1Fixes, 1200);
})();
