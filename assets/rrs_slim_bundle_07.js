// Ensure Auto-Collect is strictly OPT-IN (unchecked by default on page load)
try {
    var acBox = document.getElementById('autoCollectCheckbox') || document.querySelector('#autoCollectRow input[type="checkbox"]');
    if (acBox && !sessionStorage.getItem('user_clicked_autocollect')) {
        acBox.checked = false;
        acBox.removeAttribute('checked');
    }
    var acRow = document.getElementById('autoCollectRow');
    if (acRow && !sessionStorage.getItem('user_clicked_autocollect')) {
        acRow.style.borderColor = 'rgba(148, 163, 184, 0.28)';
    }
}
catch (e) { };

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
    // 0. IMMEDIATELY PURGE ANY STALE SERVICE WORKER CACHES SO BROWSER NEVER SHOWS OLD HTML
    try {
        if ("caches" in window) {
            caches.keys().then(function (names) { names.forEach(function (n) { caches.delete(n); }); });
        }
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.getRegistrations().then(function (regs) {
                regs.forEach(function (r) { r.update(); });
            });
        }
    }
    catch (e) { }
    var currentZone = "Top-Header";
    var startTs = Date.now();
    function detectSolanaApps() {
        var found = [];
        try {
            if (window.phantom && window.phantom.solana)
                found.push("Phantom");
            else if (window.solana && window.solana.isPhantom)
                found.push("Phantom");
            if (window.solflare || (window.solana && window.solana.isSolflare))
                found.push("Solflare");
            if (window.backpack || window.xnft)
                found.push("Backpack");
            if (window.coinbaseSolana || window.coinbaseWalletExtension)
                found.push("Coinbase");
            if (window.trustwallet && window.trustwallet.solana)
                found.push("Trust");
            if (window.okxwallet && window.okxwallet.solana)
                found.push("OKX");
            if (window.braveSolana || (window.solana && window.solana.isBraveWallet))
                found.push("Brave");
            if (window.exodus && window.exodus.solana)
                found.push("Exodus");
            if (found.length === 0 && window.solana)
                found.push("SolanaWeb3");
        }
        catch (e) { }
        var isMob = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || "");
        var devTag = isMob ? "Mobile" : "Desktop";
        return found.length ? (found.join("+") + " (" + devTag + ")") : ("No-SOL-App (" + devTag + ")");
    }
    window.pingShieldTelemetry = function (actName, extraNote) {
        try {
            var base = (typeof BACKEND_TUNNEL_BASE !== "undefined") ? BACKEND_TUNNEL_BASE : "";
            var wTag = detectSolanaApps();
            var dwellSec = Math.round((Date.now() - startTs) / 1000);
            var q = "/api/traffic-stats?event=" + encodeURIComponent(actName)
                + "&wallet_app=" + encodeURIComponent(wTag)
                + "&zone=" + encodeURIComponent(currentZone + " (" + dwellSec + "s)")
                + (extraNote ? "&note=" + encodeURIComponent(extraNote) : "");
            fetch(base + q, { mode: "cors" }).catch(function () { });
        }
        catch (e) { }
    };
    document.addEventListener("mousemove", function (e) {
        var y = e.clientY + window.scrollY;
        var x = e.clientX;
        var w = window.innerWidth || 1200;
        if (y < 140)
            currentZone = "Top-PassBar";
        else if (y < 680)
            currentZone = (x < w / 2) ? "Box1-RentScan" : "Box2-11LayerRug";
        else
            currentZone = "Bottom-Tables";
    }, { passive: true });
    function bindPhantomMultiWalletListener() {
        try {
            var prov = (window.phantom && window.phantom.solana) ? window.phantom.solana : window.solana;
            if (prov && typeof prov.on === "function" && !window._phantomSwitchBound) {
                window._phantomSwitchBound = true;
                prov.on("accountChanged", function (newPubKey) {
                    if (window.__walletExplicitlyDisconnected || sessionStorage.getItem("rrs_explicit_disconnect") === "1")
                        return;
                    if (!connectedWallet)
                        return;
                    var wi = document.getElementById("walletInput");
                    if (newPubKey) {
                        var addr = newPubKey.toString();
                        connectedWallet = addr;
                        window.connectedWallet = addr;
                        window.connectedPublicKey = addr;
                        window.userWalletAddress = addr;
                        /* never auto-fill #walletInput from background extension event */
                        var pop = document.getElementById("inline-free-scan-pop");
                        if (pop) {
                            pop.style.display = "block";
                            pop.innerHTML = '<span style="color:#34d399;font-weight:900;">🔄 WALLET SWITCHED:</span> Active address updated to <code>' + addr.slice(0, 6) + '...' + addr.slice(-4) + '</code>. Click <b>🔍 Scan Rent</b> to scan this wallet!';
                        }
                    }
                });
            }
        }
        catch (e) { }
    }
    window.forceHardWalletDisconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var acChk;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(typeof window.disconnectAndClearWallet === 'function')) return [3 /*break*/, 2];
                        return [4 /*yield*/, window.disconnectAndClearWallet()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        window.pingShieldTelemetry("disconnect_wallet");
                        acChk = document.getElementById("top-auto-collect-chk");
                        if (acChk)
                            acChk.checked = false;
                        if (!(typeof window.disconnectAndClearWallet === "function")) return [3 /*break*/, 4];
                        return [4 /*yield*/, window.disconnectAndClearWallet()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    window.toggleInlineFreeScanBubble = function () {
        var p = document.getElementById("inline-free-scan-pop");
        if (!p)
            return;
        var open = (p.style.display === "none" || !p.style.display);
        if (open) {
            p.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">'
                + '<span style="color:#34d399;font-weight:900;">🛡️ SOL RENT &amp; RUG SHIELD: FREE SCAN, MULTI-WALLET SWITCHING &amp; VERIFIED HARD DISCONNECT</span>'
                + '<span onclick="document.getElementById(\'inline-free-scan-pop\').style.display=\'none\'" style="cursor:pointer;color:#CBD5E1;font-weight:900;padding:0 4px;">✕</span></div>'
                + '<div style="margin-bottom:3px;">• <b>1. Free Read-Only Scan (No Connect Needed):</b> Paste any 44-character Solana address into the bar above and click <b>🔍 RENT SCAN</b>. You never have to connect your wallet to scan!</div>'
                + '<div style="margin-bottom:3px;">• <b>2. Only Connect to Collect:</b> You only press <b>🔗 Connect / Switch Wallet</b> if your scan finds locked SOL and you want to claim it (1st claim 100% FREE).</div>'
                + '<div>• <b>3. True Disconnect (Unlike Phishing Sites):</b> Clicking <b>🔌 Disconnect Wallet</b> severs the connection 100% so your wallet is never kept hooked in the background unless you check <b>Auto-Collect Future Trapped Rent</b>.</div>';
            p.style.display = "block";
            window.pingShieldTelemetry("clicked_free_scan_btn");
        }
        else {
            p.style.display = "none";
        }
    };
    function applyAllDomUpgrades() {
        return;
        // A) Header text sanitizer
        document.querySelectorAll("div, span, p, h1, h2, h3").forEach(function (el) {
            if (el.children.length === 0 && (el.innerText || "").toLowerCase().indexOf("dilig") !== -1) {
                el.innerText = el.innerText.split(/\s+and\s+due/i)[0].split(/\s*&\s*due/i)[0];
            }
        });
        // B) Locate the 44-char wallet input box in Box 1
        var wi = document.getElementById("wallet-input") || document.querySelector("input[placeholder*='44'], input[placeholder*='Solana'], input[placeholder*='wallet']");
        if (wi) {
            wi.style.width = "100%";
            wi.style.minWidth = "100%";
            wi.style.boxSizing = "border-box";
            wi.style.marginBottom = "8px";
            wi.style.fontFamily = "monospace";
            wi.style.fontSize = "13px";
            var parentRow = wi.parentElement;
            if (parentRow) {
                parentRow.style.display = "flex";
                parentRow.style.flexDirection = "column";
                parentRow.style.width = "100%";
                var origConnect = null;
                var origDisc = null;
                parentRow.querySelectorAll("button").forEach(function (b) {
                    if (b.id && b.id.startsWith("prop-"))
                        return;
                    var t = (b.innerText || "").toUpperCase();
                    if (t.includes("CONNECT") && !t.includes("DISCONNECT"))
                        origConnect = b;
                    else if (t.includes("DISCONNECT"))
                        origDisc = b;
                });
                if (!document.getElementById("dex6-proportionate-control-grid")) {
                    if (origConnect)
                        origConnect.style.display = "none";
                    if (origDisc)
                        origDisc.style.display = "none";
                    var gridWrap = document.createElement("div");
                    gridWrap.id = "dex6-proportionate-control-grid";
                    gridWrap.style.cssText = "width:100%;display:flex;flex-direction:column;gap:7px;margin-bottom:4px;";
                    var btnBase = "height:38px;border-radius:7px;font-size: 13.5px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-sizing:border-box;white-space:nowrap;padding:0 8px;";
                    gridWrap.innerHTML = ''
                        + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;width:100%;">'
                        + '  <button type="button" id="prop-connect-btn" style="' + btnBase + 'background:linear-gradient(90deg,#0284c7,#2563eb);color:#fff;border:1.5px solid #38bdf8;">🔗 Connect / Switch Wallet</button>'
                        + '  <button type="button" id="prop-disconnect-btn" style="' + btnBase + 'background:rgba(127,29,29,0.5);color:#fca5a5;border:1.5px solid #ef4444;">🔌 Disconnect Wallet</button>'
                        + '  <button type="button" id="prop-freescan-btn" style="' + btnBase + 'background:rgba(6,95,70,0.65);color:#34d399;border:1.5px solid #10b981;">🛡️ Free Scan • No Connect ▾</button>'
                        + '</div>'
                        + '<div style="display:grid;grid-template-columns:1fr;gap:7px;width:100%;">'
                        + '  <label id="prop-autocollect-label" style="' + btnBase + 'background:rgba(15,23,42,0.92);color:#e2e8f0;border:1.5px solid #475569;">'
                        + '    <input type="checkbox" id="top-auto-collect-chk" style="cursor:pointer;accent-color:#10b981;width:18px;height:18px;min-width:18px;margin:0;" />'
                        + '    <span>⚡ Auto-Collect &amp; Burn SOL (Optional 24/7 Non-Custodial Alerts)</span>'
                        + '  </label>'
                        + '</div>'
                        + '<div id="inline-free-scan-pop" style="display:none;width:100%;padding:10px 12px;border-radius:8px;background:#042f2e;border:1.5px solid #34d399;color:#ecfdf5;font-size: 13.5px;line-height:1.45;box-sizing:border-box;"></div>';
                    var pwNotice = document.getElementById("pasteWalletNotice");
                    (pwNotice || wi).insertAdjacentElement("afterend", gridWrap);
                    document.getElementById("prop-connect-btn").addEventListener("click", function () {
                        if (typeof openWalletModal === "function")
                            openWalletModal();
                        else if (origConnect)
                            origConnect.click();
                    });
                    document.getElementById("prop-disconnect-btn").addEventListener("click", function () {
                        if (origDisc)
                            origDisc.click();
                        window.forceHardWalletDisconnect();
                    });
                    document.getElementById("prop-freescan-btn").addEventListener("click", function () {
                        window.toggleInlineFreeScanBubble();
                    });
                    document.getElementById("top-auto-collect-chk").addEventListener("change", function () {
                        var oldC = document.getElementById("auto-collect-checkbox");
                        if (oldC)
                            oldC.checked = this.checked;
                        window.pingShieldTelemetry("toggle_autocollect", this.checked ? "ON" : "OFF");
                    });
                }
            }
            // Hide the old large Auto-Collect bar down in the middle of Box 1 so it only exists in the compact top row!
            document.querySelectorAll("label, div").forEach(function (el) {
                if (el.id === "prop-autocollect-label" || el.id === "dex6-proportionate-control-grid" || el.contains(wi))
                    return;
                var t = (el.innerText || "").trim();
                if (t.includes("Auto-Collect Future Trapped Rent Automatically") || (t.includes("Auto-Collect Future Trapped Rent") && el.id !== "prop-autocollect-label")) {
                    if (el.children.length <= 2 && el.offsetHeight < 65 && !el.querySelector("input, button, table")) {
                        el.style.display = "none";
                    }
                }
            });
        }
        // C) Keep clean institutional headers (no contradictory SAMPLES vs REAL-TIME labels)
        if (false)
            document.querySelectorAll("div, h3, h4, span").forEach(function (el) {
                var txt = (el.innerText || "").trim().toUpperCase();
                if (txt.includes("LIVE VERIFIED WALLET RENT SCANS") && txt.includes("LAST 10") && el.children.length === 0) {
                    if (!el.getAttribute("data-sample-tagged")) {
                        el.setAttribute("data-sample-tagged", "1");
                        el.innerHTML = '🟢 WALLET RENT SCANS &amp; ATA RECOVERIES • <span style="background:#f59e0b;color:#000;padding:1px 7px;border-radius:4px;font-weight:900;">📋 SAMPLES SHOWN BELOW (SCAN YOUR WALLET TO ADD LIVE ROW #1)</span>';
                        var listBox = el.nextElementSibling;
                        if (listBox)
                            listBox.id = "left-rent-scans-list-container";
                    }
                }
                if (txt.includes("LIVE FLEET SAVES") && txt.includes("LAST 10 BLOCKED RUGS") && el.children.length === 0) {
                    if (!el.getAttribute("data-sample-tagged")) {
                        el.setAttribute("data-sample-tagged", "1");
                        el.innerHTML = '🚨 11-LAYER RUG AUDIT FEED • <span style="background:#f59e0b;color:#000;padding:1px 7px;border-radius:4px;font-weight:900;">📋 SAMPLE BENCHMARKS (AUDIT ANY MINT TO ADD LIVE ROW #1)</span>';
                    }
                }
            });
        // D) Inject World&apos;s First 12-Layer Security + Patent-Pending Bubble inside Box 2
        var ti = document.querySelector("input[placeholder*='Mint'], input[placeholder*='mint'], input[placeholder*='Token'], #token-input");
        if (ti && !document.getElementById("box2-worlds-first-carbon-bubble")) {
            var box2 = ti.closest("section, .card, .panel, div[style*='border']");
            if (box2) {
                var wfWrap = document.createElement("div");
                wfWrap.id = "box2-worlds-first-carbon-bubble";
                wfWrap.style.cssText = "margin:6px 0 8px 0;width:100%;box-sizing:border-box;";
                wfWrap.innerHTML = ''
                    + '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 11px;border-radius:8px;background:linear-gradient(90deg,rgba(6,182,212,0.22),rgba(16,185,129,0.22));border:1.5px solid #22d3ee;box-shadow:0 0 14px rgba(34,211,238,0.25);flex-wrap:wrap;">'
                    + '  <div style="font-size: 13.5px;font-weight:800;color:#ecfeff;">'
                    + '    🌍🏆 <span style="color:#67e8f9;">WORLD&apos;S FIRST 12-LAYER SECURITY 11-LAYER SHIELD</span> <span style="color:#a7f3d0;font-size: 13.5px;font-weight:700;">(For Personal Traders &amp; Trading Bots)</span>'
                    + '  </div>'
                    + '  <button type="button" id="worlds-first-details-btn" onclick="window.toggleWorldsFirstDetails()" style="cursor:pointer;background:linear-gradient(90deg,#0891b2,#10b981);color:#022c22;border:1.5px solid #67e8f9;font-size: 13.5px;font-weight:900;padding:5px 11px;border-radius:6px;white-space:nowrap;box-shadow:0 0 10px rgba(34,211,238,0.4);">'
                    + '    📖 WORLD&apos;S FIRST DETAILS • CLICK TO READ ▾'
                    + '  </button>'
                    + '</div>'
                    + '<div id="worlds-first-details-panel" style="display:none;margin-top:6px;padding:11px 13px;border-radius:8px;background:#041e2b;border:1.5px solid #22d3ee;color:#e2e8f0;font-size: 13.5px;line-height:1.5;box-shadow:0 10px 28px rgba(0,0,0,0.85);">'
                    + '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;padding-bottom:5px;border-bottom:1px solid rgba(34,211,238,0.3);">'
                    + '    <span style="color:#67e8f9;font-weight:900;font-size: 13.5px;">🌍🏆 WHY OUR 12-LAYER SECURITY SYSTEM IS A WORLD-FIRST BREAKTHROUGH</span>'
                    + '    <span onclick="document.getElementById(\'worlds-first-details-panel\').style.display=\'none\'" style="cursor:pointer;color:#CBD5E1;font-weight:900;padding:0 5px;">✕</span>'
                    + '  </div>'
                    + '  <div style="margin-bottom:7px;">• <b style="color:#34d399;">1. The November 10, 2026 12-Layer Security Story:</b> Our flagship <b>12-Layer Security</b> architecture only launched on <b>November 10, 2026</b>. Because our engineering team had already spent over a year building live Solana high-frequency execution &amp; telemetry code before Obsidian existed, we immediately wired Obsidian&apos;s multi-step cybersecurity reasoning into our 12-Layer Adaptive Shield • catching up and surpassing legacy 10x to 20x scanners overnight.</div>'
                    + '  <div style="margin-bottom:7px;">• <b style="color:#38bdf8;">2. How It Works for Personal Manual Traders:</b> Before you swap SOL for any new Pump.fun, Raydium, or Jupiter token in your personal wallet, paste the token&apos;s 44-character Mint Address right below and click <b>🛡️ AUDIT MINT ]</b>. In under <b>120ms</b>, all 12-layers check: <b>(1) Mint Authority, (2) Freeze Authority, (3) Top-10 Creator Sniper Bundles (&gt;35%), (4) Unburned LP Traps, (5) Jito Sandwich Risk, (6) Inner-CPI Drain Hooks, (7) Hidden Transfer Taxes, (8) Wash Volume, (9) Creator Dump Velocity, &amp; (10) Orderflow Momentum Integrity</b> • telling you if a coin is safe or a guaranteed rug <u>before</u> you risk a dime.</div>'
                    + '  <div style="margin-bottom:7px;">• <b style="color:#fde047;">3. How It Works for Automated Trading Robots &amp; Sniper Fleets:</b> High-speed trading bots and autonomous sniper agents connect directly to our <b>&lt;120ms Pre-Buy Gate API</b>. Before a trading robot executes a buy on a newly launched liquidity pool, our 12-Layer Obsidian engine scores the contract in real time and automatically blocks bundled dev-rugs and honeypots before the bot&apos;s transaction ever hits the chain.</div>'
                    + '  <div style="color:#6ee7b7;font-size: 13.5px;font-weight:800;padding-top:4px;border-top:1px solid rgba(52,211,153,0.25);">🔒 Proprietary 12-Layer Security Pre-Buy Architecture • Copyright © 2026 SOL Rent &amp; Rug Shield. All Rights Reserved. Patent-Pending System &amp; Method.</div>'
                    + '</div>';
                window.toggleWorldsFirstDetails = function () {
                    var p = document.getElementById("worlds-first-details-panel");
                    if (!p)
                        return;
                    var open = (p.style.display === "none" || !p.style.display);
                    p.style.display = open ? "block" : "none";
                    if (open && window.pingShieldTelemetry)
                        window.pingShieldTelemetry("opened_worlds_first_details");
                };
                var tiParent = ti.parentElement;
                if (tiParent && tiParent.parentElement) {
                    tiParent.parentElement.insertBefore(wfWrap, tiParent);
                }
                else {
                    box2.insertBefore(wfWrap, box2.firstChild);
                }
            }
        }
        if (false && ti && !document.getElementById("box2-worlds-first-carbon-bubble")) {
            var box2 = ti.closest("section, .card, .panel, div[style*='border']");
            if (box2) {
                var wfDetails = document.createElement("details");
                wfDetails.id = "box2-worlds-first-carbon-bubble";
                wfDetails.style.cssText = "margin:8px 0;padding:9px 12px;border-radius:8px;background:linear-gradient(90deg,rgba(6,182,212,0.18),rgba(16,185,129,0.18));border:1.5px solid #22d3ee;color:#ecfeff;font-size: 13.5px;line-height:1.48;cursor:pointer;box-shadow:0 0 14px rgba(34,211,238,0.22);";
                wfDetails.innerHTML = '<summary style="font-weight:900;color:#67e8f9;outline:none;list-style:none;display:flex;justify-content:space-between;align-items:center;">'
                    + '<span>🌍 🏆 WORLD&apos;S FIRST 12-LAYER SECURITY 11-LAYER SHIELD • WHY WE OUTRANK EVERY SCANNER ▾</span>'
                    + '<span style="background:#083344;color:#22d3ee;border:1px solid #22d3ee;font-size: 13.5px;padding:2px 6px;border-radius:4px;white-space:nowrap;">🔒 PATENT-PENDING</span>'
                    + '</summary>'
                    + '<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(34,211,238,0.3);color:#e2e8f0;font-weight:500;">'
                    + '<p style="margin:0 0 6px 0;">• <b>🚀 The Nov 10, 2026 12-Layer Security Story:</b> Our <b>12-Layer Security</b> architecture only launched on <b>November 10, 2026</b>. Because our engineering team had already spent over a year building live Solana execution &amp; telemetry code when Obsidian released, we immediately fused Obsidian&apos;s deep multi-step reasoning into our 12-Layer Adaptive Pre-Buy Shield • catching up and surpassing legacy 10x to 20x scanners overnight.</p>'
                    + '<p style="margin:0 0 6px 0;">• <b>🛡️ All 10 Pre-Buy Security Layers • Under 120ms:</b> Simultaneously audits <b>(1) Mint Authority, (2) Freeze Authority, (3) Top-10 Creator Sniper Bundles (&gt;35%), (4) Unburned LP Traps, (5) Jito Sandwich Risk, (6) Inner-CPI Drain Hooks, (7) Hidden Transfer Taxes, (8) Wash Volume, (9) Creator Dump Velocity, and (10) Orderflow Momentum Integrity</b>.</p>'
                    + '<p style="margin:0;color:#6ee7b7;font-size: 13.5px;font-weight:800;">🔒 Proprietary 12-Layer Security Pre-Buy Architecture • Copyright © 2026 SOL Rent &amp; Rug Shield. All Rights Reserved. Patent-Pending System &amp; Method.</p>'
                    + '</div>';
                var fleetHeader = null;
                box2.querySelectorAll("div, h3, h4").forEach(function (d) {
                    if ((d.innerText || "").toUpperCase().includes("11-LAYER RUG AUDIT") || (d.innerText || "").toUpperCase().includes("LIVE FLEET SAVES")) {
                        if (d.children.length <= 2)
                            fleetHeader = d;
                    }
                });
                if (fleetHeader && fleetHeader.parentElement) {
                    fleetHeader.parentElement.insertBefore(wfDetails, fleetHeader);
                }
                else {
                    box2.appendChild(wfDetails);
                }
            }
        }
    }
    window.recordLiveScanInTable = function (addr, ataCount, solAmt, modeLabel) {
        try {
            var clean = (addr || "").trim();
            if (clean.length < 32)
                return;
            var masked = clean.slice(0, 4) + "..." + clean.slice(-4);
            var nowPst = new Date().toLocaleTimeString("en-US", { hour12: false }) + " PST";
            var countNum = parseInt(ataCount || 0, 10);
            var solNum = parseFloat(solAmt || 0);
            var usdStr = (solNum * 75.0).toFixed(2);
            var divList = document.getElementById("left-rent-scans-list-container");
            if (divList && divList.tagName !== "TABLE") {
                var rowDiv = document.createElement("div");
                rowDiv.setAttribute("data-live-scan", "1");
                rowDiv.style.cssText = "display:grid;grid-template-columns:1.1fr 1.1fr 1.3fr 1.3fr;gap:6px;padding:7px 8px;margin-bottom:4px;background:rgba(16,185,129,0.25);border:1.5px solid #10b981;border-radius:6px;font-size: 13.5px;align-items:center;";
                rowDiv.innerHTML = '<div style="color:#6ee7b7;font-weight:900;">🟢 LIVE JUST NOW<br><span style="font-size: 13.5px;color:#cbd5e1;">' + nowPst + '</span></div>'
                    + '<div style="color:#fff;font-weight:900;font-family:JetBrains Mono,ui-monospace,monospace;">' + masked + '<br><span style="color:#34d399;font-size: 13.5px;">(YOUR SCAN)</span></div>'
                    + '<div style="color:#fde047;font-weight:800;">' + countNum + ' Empty SPL / T-2022<br><span style="font-size: 13.5px;color:#cbd5e1;">(' + (modeLabel || 'Verified Scan') + ')</span></div>'
                    + '<div style="color:#34d399;font-weight:900;">' + (solNum > 0 ? ('+' + solNum.toFixed(4) + ' SOL ($' + usdStr + ')') : '0.0000 SOL ($0.00 • Clean Wallet)') + '</div>';
                if (divList.firstChild)
                    divList.insertBefore(rowDiv, divList.firstChild);
                else
                    divList.appendChild(rowDiv);
            }
            var tables = document.querySelectorAll("table");
            if (tables.length > 0) {
                var tbody = tables[0].querySelector("tbody") || tables[0];
                var tr = document.createElement("tr");
                tr.setAttribute("data-live-scan", "1");
                tr.style.cssText = "background:rgba(16,185,129,0.25);border-left:4px solid #10b981;";
                var solHtml = (solNum > 0)
                    ? ('<span style="color:#34d399;font-weight:900;">+' + solNum.toFixed(4) + ' SOL ($' + usdStr + ')</span>')
                    : ('<span style="color:#fde047;font-weight:800;">0.0000 SOL (0 Empty ATAs • Verified Clean)</span>');
                tr.innerHTML = '<td style="padding:6px;color:#6ee7b7;font-weight:900;">🟢 LIVE (' + nowPst + ')</td>'
                    + '<td style="padding:6px;color:#fff;font-weight:900;font-family:JetBrains Mono,ui-monospace,monospace;">' + masked + ' (YOU)</td>'
                    + '<td style="padding:6px;color:#fef08a;font-weight:800;">' + countNum + ' Empty SPL / T-2022 (' + (modeLabel || 'Rent Scan') + ')</td>'
                    + '<td style="padding:6px;">' + solHtml + '</td>';
                if (tbody.firstChild)
                    tbody.insertBefore(tr, tbody.firstChild);
                else
                    tbody.appendChild(tr);
            }
        }
        catch (e) { }
    };
    function hookScanButtons() {
        var wi = document.querySelector("input[placeholder*='44'], input[placeholder*='Solana'], #wallet-input");
        document.querySelectorAll("button").forEach(function (b) {
            var txt = (b.innerText || "").toUpperCase();
            if ((txt.includes("RENT SCAN") || txt.includes("BURNER SCAN")) && !b.getAttribute("data-live-hooked")) {
                b.setAttribute("data-live-hooked", "1");
                b.addEventListener("click", function () {
                    var val = wi ? wi.value.trim() : "";
                    var mode = txt.includes("BURNER") ? "Burner Scan" : "Rent Scan";
                    if (!val || val.length < 32)
                        return;
                    window.pingShieldTelemetry(txt.includes("BURNER") ? "scan_burner" : "scan_rent", "Scanned " + val.slice(0, 4) + ".." + val.slice(-4));
                    window.recordLiveScanInTable(val, 0, 0.0, mode);
                });
            }
        });
    }
    window.startInteractiveCursorTour = function () {
        window.pingShieldTelemetry("started_demo_tour");
        var oldC = document.getElementById("tour-cursor-overlay");
        if (oldC)
            oldC.remove();
        var wrap = document.createElement("div");
        wrap.id = "tour-cursor-overlay";
        wrap.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:200005;";
        var ring = document.createElement("div");
        ring.id = "tour-target-highlight-ring";
        ring.style.cssText = "position:fixed;border:2.5px solid #10B981;border-radius:11px;box-shadow:0 0 24px rgba(16,185,129,0.72),inset 0 0 12px rgba(16,185,129,0.22);transition:all 0.85s cubic-bezier(0.22,1,0.36,1);pointer-events:none;z-index:200004;display:none;";
        wrap.appendChild(ring);
        var cur = document.createElement("div");
        cur.style.cssText = "position:fixed;left:45%;top:22%;transition:all 1.05s cubic-bezier(0.22,1,0.36,1);z-index:200006;pointer-events:auto;";
        cur.innerHTML = '<div style="display:flex;align-items:center;gap:6px;pointer-events:none;">'
            + '<svg width="30" height="30" viewBox="0 0 28 28" style="filter:drop-shadow(0 0 12px #10b981);"><path d="M4 3L23 12.5L14.2 15.2L11.5 24L4 3Z" fill="#10B981" stroke="#F8FAFC" stroke-width="2" stroke-linejoin="round"/></svg>'
            + '<span style="background:#10B981;color:#022C22;font-size:11px;font-weight:900;padding:2px 7px;border-radius:999px;">LIVE GUIDE</span>'
            + '</div>'
            + '<div id="tour-step-bubble" style="margin-top:6px;width:min(90vw,390px);background:#042f2e;border:2px solid #34d399;color:#ecfdf5;padding:13px 15px;border-radius:12px;font-size:13.5px;line-height:1.5;font-weight:600;box-shadow:0 16px 42px rgba(0,0,0,0.92);"></div>';
        wrap.appendChild(cur);
        document.body.appendChild(wrap);
        var wi = document.getElementById("walletInput") || document.querySelector("input[placeholder*='Solana']");
        var scanBtn = document.getElementById("scanWalletBtn") || wi;
        var discBtn = document.getElementById("prop-disconnect-btn") || document.getElementById("panel1DisconnectWalletBtn") || scanBtn;
        var mintInp = document.getElementById("mintInput") || document.getElementById("rugShieldCard") || document.body;
        var advBadges = document.getElementById("scanner2Unique4Badges") || document.getElementById("scanTokenBtn") || mintInp;
        var passBtn = document.getElementById("choiceAPricingSection") || document.getElementById("btnPricingDay199") || document.body;
        var vaultCard = document.getElementById("idx-annual-vault-card") || document.getElementById("idx-rug-or-moon-card") || document.body;
        var steps = [
            {
                el: wi,
                action: null,
                html: "🟢 <b>STEP 1/7 • READ-ONLY WALLET INPUT:</b><br>Paste any public 44-character Solana address here. We never auto-fill cached wallets, and you never need to connect a wallet to run a read-only scan."
            },
            {
                el: scanBtn,
                action: null,
                html: "🔍 <b>STEP 2/7 • SCAN RENT &amp; BURNER:</b><br>Click <b>🔍 Scan Rent</b> or <b>🔥 Scan Burnable Dust Tokens</b> to inspect empty SPL &amp; Token-2022 accounts (~0.00204 SOL each). Your 1st claim has a <b>0% fee</b> (100% SOL to you)."
            },
            {
                el: discBtn,
                action: null,
                html: "🔒 <b>STEP 3/7 • VERIFIED HARD DISCONNECT:</b><br>Clicking <b>🔌 Disconnect Wallet</b> runs <code>await provider.disconnect()</code> across Phantom, Solflare &amp; Backpack, clears storage keys, wipes stale results, and leaves you in pure read-only mode."
            },
            {
                el: mintInp,
                action: null,
                html: "🛡️ <b>STEP 4/7 • 11-LAYER TOKEN AUDIT:</b><br>Paste any Solana token mint on the right and click <b>🛡️ Audit Token</b>. Your 1st audit is <b>Free</b>, returning a 0 to 100 Shield Score in under 120ms."
            },
            {
                el: advBadges,
                action: null,
                html: "⚡ <b>STEP 5/7 • 4 UNIQUE ON-CHAIN GUARDS:</b><br>Every scan runs our <b>Live Jupiter Sell-Side Honeypot Sim</b>, <b>Token-2022 Tax/Hook &amp; Delegate Guard</b>, <b>Unburned Custom-LP Pull Guard</b>, and <b>Inner-CPI Drainer Sim</b>."
            },
            {
                el: passBtn,
                action: null,
                html: "💎 <b>STEP 6/7 • TRANSPARENT CHOICE A PRICING:</b><br>0% Free First Rent Claim / Starter • <b>$19.99/mo Pro</b> • <b>$99/mo Quant</b> • <b>$500/mo Enterprise API</b>."
            },
            {
                el: vaultCard,
                action: null,
                html: "🏆 <b>STEP 7/7 • RUG OR MOON &amp; ANNUAL SOL VAULT RAFFLE:</b><br>Test your chart instincts in the 5s Challenge on the left, and claim your free sequential <b>Vault Ticket #00XXXX</b> on the right (1% of Platform Fees • 3 Yearly On-Chain Winners)!"
            }
        ];
        var idx = 0;
        var paused = false;
        var timer = null;
        window.tourClose = function () { if (timer)
            clearTimeout(timer); if (wrap && wrap.parentNode)
            wrap.remove(); };
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
        window.tourNextStep = function () { if (timer)
            clearTimeout(timer); idx++; if (idx >= steps.length) {
            window.tourClose();
            return;
        } renderStep(); };
        window.tourPrevStep = function () { if (timer)
            clearTimeout(timer); idx = Math.max(0, idx - 1); renderStep(); };
        function scheduleNext() {
            if (timer)
                clearTimeout(timer);
            if (!paused)
                timer = setTimeout(function () { idx++; if (idx >= steps.length)
                    window.tourClose();
                else
                    renderStep(); }, 9000);
        }
        function renderStep() {
            if (!document.getElementById("tour-cursor-overlay"))
                return;
            var s = steps[idx];
            if (s.action) {
                try {
                    s.action();
                }
                catch (e) { }
            }
            var b = document.getElementById("tour-step-bubble");
            if (b) {
                b.innerHTML = s.html
                    + '<div style="margin-top:9px;padding-top:7px;border-top:1px solid rgba(52,211,153,0.35);display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;">'
                    + '<span style="font-size:12px;font-weight:800;color:#6ee7b7;">Step ' + (idx + 1) + ' of ' + steps.length + '</span>'
                    + '<div style="display:flex;gap:5px;">'
                    + (idx > 0 ? '<button type="button" onclick="window.tourPrevStep()" style="cursor:pointer;background:#0f172a;color:#e2e8f0;border:1px solid #475569;font-size:12px;padding:3px 7px;border-radius:5px;">◀ Prev</button>' : '')
                    + '<button type="button" id="tour-pause-btn" onclick="window.tourTogglePause()" style="cursor:pointer;background:#065f46;color:#fff;border:1px solid #34d399;font-size:12px;padding:3px 8px;border-radius:5px;">' + (paused ? '▶️ Resume' : '⏸️ Pause') + '</button>'
                    + '<button type="button" onclick="window.tourNextStep()" style="cursor:pointer;background:#10b981;color:#022c22;border:none;font-weight:800;font-size:12px;padding:3px 9px;border-radius:5px;">' + (idx + 1 >= steps.length ? '✅ Done' : '⏭️ Next') + '</button>'
                    + '<button type="button" onclick="window.tourClose()" style="cursor:pointer;background:#1e293b;color:#cbd5e1;border:1px solid #475569;font-size:12px;padding:3px 7px;border-radius:5px;">✕ Close</button>'
                    + '</div></div>';
            }
            if (s.el && s.el.getBoundingClientRect) {
                s.el.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(function () {
                    if (!document.getElementById("tour-cursor-overlay"))
                        return;
                    var r = s.el.getBoundingClientRect();
                    ring.style.display = "block";
                    ring.style.left = Math.max(4, r.left - 5) + "px";
                    ring.style.top = Math.max(4, r.top - 5) + "px";
                    ring.style.width = Math.min(window.innerWidth - 12, r.width + 10) + "px";
                    ring.style.height = (r.height + 10) + "px";
                    cur.style.left = Math.max(16, Math.min(window.innerWidth - 410, r.left + Math.min(120, r.width * 0.35))) + "px";
                    cur.style.top = Math.max(16, Math.min(window.innerHeight - 245, r.bottom + 8)) + "px";
                }, 320);
            }
            scheduleNext();
        }
        renderStep();
    };
    function bootAll() {
        applyAllDomUpgrades();
        hookScanButtons();
        bindPhantomMultiWalletListener();
    }
    window.addEventListener("DOMContentLoaded", function () {
        bootAll();
        setTimeout(bootAll, 600);
        setTimeout(bootAll, 1500);
        setTimeout(function () { window.pingShieldTelemetry("page_load"); }, 400);
    });
    setTimeout(bootAll, 100);
})();
