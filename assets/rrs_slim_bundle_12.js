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
    // 1. STATE & TOGGLE REPAIR
    window.guideBubblesIndexEnabled = true;
    document.body.setAttribute("data-bubble-guide", "on");
    var tipEl = document.getElementById("floatingEmeraldGuideTooltip");
    var hideTimer = null;
    var lastBubbleShowTs = 0;
    function clampViewportAndShow(targetEl, titleTag, bodyHtml) {
        if (!window.guideBubblesIndexEnabled || !tipEl || !targetEl)
            return;
        lastBubbleShowTs = Date.now();
        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
        tipEl.innerHTML = '<div class="eg-badge">🛡️ ' + (titleTag || 'SHIELD GUIDE') + '</div><div>' + bodyHtml + '</div>';
        tipEl.style.display = "block";
        tipEl.setAttribute("aria-hidden", "false");
        var rect = targetEl.getBoundingClientRect();
        var tw = tipEl.offsetWidth || 290;
        var th = tipEl.offsetHeight || 76;
        var vw = window.innerWidth || document.documentElement.clientWidth || 375;
        var vh = window.innerHeight || document.documentElement.clientHeight || 667;
        var left = rect.left + (rect.width / 2) - (tw / 2);
        if (left < 10)
            left = 10;
        if (left + tw > vw - 10)
            left = Math.max(10, vw - tw - 10);
        var top = rect.top - th - 10;
        if (top < 10) {
            top = Math.min(vh - th - 10, rect.bottom + 10);
        }
        if (top < 10)
            top = 10;
        tipEl.style.left = Math.round(left) + "px";
        tipEl.style.top = Math.round(top) + "px";
        var banner = document.getElementById("guideStoryIndexBanner");
        if (banner) {
            banner.innerHTML = "🛡️ <strong>" + (titleTag || "Shield Guide") + ":</strong> " + bodyHtml;
            banner.style.display = "block";
        }
    }
    function hideEmeraldTooltip() {
        if (!tipEl)
            return;
        tipEl.style.display = "none";
        tipEl.setAttribute("aria-hidden", "true");
    }
    window.hideEmeraldGuideTooltip = hideEmeraldTooltip;
    window.syncGuideToggleVisual = function () {
        var btn = document.getElementById("guideBubblesToggleBtn");
        var banner = document.getElementById("guideStoryIndexBanner");
        var on = Boolean(window.guideBubblesIndexEnabled);
        document.body.setAttribute("data-bubble-guide", on ? "on" : "off");
        if (btn) {
            btn.setAttribute("aria-pressed", on ? "true" : "false");
            btn.innerHTML = on
                ? '🟢 Go Bubble Guide: <span style="background:#10B981;color:#022c22;padding:1px 6px;border-radius:999px;font-size: 0.85rem;margin-left:3px;font-weight:900;">ON</span>'
                : '⚪ Go Bubble Guide: <span style="background:#334155;color:#cbd5e1;padding:1px 6px;border-radius:999px;font-size: 0.85rem;margin-left:3px;font-weight:800;">OFF</span>';
        }
        if (banner) {
            if (on) {
                if (!banner.innerHTML.trim()) {
                    banner.innerHTML = "✅ <strong>Emerald Bubble Guide Active:</strong> Hover or tap any button, card, token chip, or metric below for an instant non-custodial explanation.";
                }
                banner.style.display = "block";
            }
            else {
                banner.style.display = "none";
            }
        }
        if (!on)
            hideEmeraldTooltip();
    };
    window.toggleGuideBubblesIndex = function () {
        window.guideBubblesIndexEnabled = !window.guideBubblesIndexEnabled;
        window.syncGuideToggleVisual();
        var btn = document.getElementById("guideBubblesToggleBtn");
        if (window.guideBubblesIndexEnabled && btn) {
            clampViewportAndShow(btn, "BUBBLE GUIDE ENABLED", "Hover or tap any card, scan button, 12-Layer chip, or Solscan metric for live explanations. Click again anytime to mute.");
            hideTimer = setTimeout(hideEmeraldTooltip, 3200);
        }
    };
    window.showGuideStoryIndex = function (topic, sourceEl) {
        if (!window.guideBubblesIndexEnabled)
            return;
        var stories = {
            connect: ["NON-CUSTODIAL CONNECT", "Shares only your public Solana address so Phantom/Solflare can preview & sign native <code>CloseAccount (0x09)</code> transactions."],
            disconnect: ["VERIFIED HARD-DISCONNECT", "Completely severs the wallet session and clears local address state so you can switch wallets safely."],
            freescan: ["100% READ-ONLY SCAN", "Paste any 44-char Solana wallet to check trapped SOL rent via Mainnet JSON-RPC with zero wallet connection. 1st claim is 0% fee!"],
            trial: ["$19.99/mo Pro", "0% Free First Rent Claim / Starter, $19.99/mo Pro (Reg. $39.99/mo), $99/mo Quant, and $500/mo Enterprise API."]
        };
        var pair = stories[topic] || stories.trial;
        var banner = document.getElementById("guideStoryIndexBanner");
        if (banner) {
            banner.innerHTML = "🛡️ <strong>" + pair[0] + ":</strong> " + pair[1];
            banner.style.display = "block";
        }
        if (sourceEl)
            clampViewportAndShow(sourceEl, pair[0], pair[1]);
    };
    // 2. BIND COMPREHENSIVE HOVER / FOCUS / TAP EXPLANATION BUBBLES ACROSS EVERY MAJOR ELEMENT
    var BUBBLE_MAP = [
        ["#guideBubblesToggleBtn", "BUBBLE GUIDE TOGGLE", "Click to switch interactive Emerald hover & tap explanations ON or OFF across the entire page."],
        ["#topEnableFreePingsBtn", "10 FREE LIVE PINGS", "Test our 12-Layer Adaptive Anti-Rug accuracy free: get 10 real-time newly-launched token safety alerts on Telegram, Email, or X."],
        ["#box2EnableFreePingsBtn", "10 FREE ANTI-RUG ALERTS", "Receive 10 instant pre-buy safety pings on live Solana launches | zero wallet connection required."],
        ["#topTrialBtn", "$19.99/mo Pro", "0% Free First Rent Claim / Starter, $19.99/mo Pro (Reg. $39.99/mo), $99/mo Quant, and $500/mo Enterprise API."],
        ["#startTrialPassBtn", "$19.99/MO PRO", "Unlock 30 days of unlimited 12-Layer Token Audits for $19.99/mo Pro (Reg. $39.99/mo) or 1-click pay from recovered SOL."],
        ["#addAppNavBtn", "STANDALONE APP INSTALLER", "Install SOL Rent & Rug Shield to your Desktop, iPhone Home Screen, or Android drawer in 1 click."],
        ["#addChromeExtNavBtn", "DESKTOP APP & CHROME SHIELD", "Launch the 1-Click Desktop Shield Mini-Window or pin our Manifest V3 Chrome Extension right next to Phantom."],
        ["#headerBrandCrestImg", "TITANIUM SHIELD CREST", "Official Emerald & Gold Titanium Shield Crest | click to open the 1-Click App & Chrome Shield installer."],
        ["#rentShieldCard .card-header", "SERVICE 1 • RENT & BURNER", "Reclaims ~0.002039 SOL rent locked inside every 0-balance SPL/Token-2022 account via native CloseAccount (0x09). 1st claim 0% fee!"],
        ["#walletInput", "READ-ONLY WALLET INPUT", "Paste any public 44-character Solana address | auto-scans empty ATAs & dead dust tokens with 100% read-only safety."],
        ["#pasteReadOnlyWalletBtn", "1-CLICK PASTE & SCAN", "Reads your clipboard Solana wallet address and runs a 100% read-only Mainnet RPC rent scan in one click."],
        ["#testVerifiedSampleWalletBtn", "TEST VERIFIED WALLET", "Runs a live Mainnet RPC scan on verified wallet C3FF..MjrC so you can inspect real reclaimable ATA math before scanning yours."],
        ["#panel1ConnectWalletBtn", "CONNECT & AUTO-SCAN", "Connect Phantom or Solflare non-custodially to auto-fill your public address and sign CloseAccount refund transactions."],
        ["#panel1DisconnectWalletBtn", "VERIFIED HARD-DISCONNECT", "Immediately severs your wallet session and wipes cached state | zero background hooks."],
        ["#prop-connect-btn", "CONNECT / SWITCH WALLET", "Connect or switch between Phantom & Solflare accounts cleanly with non-custodial read/sign safety."],
        ["#prop-disconnect-btn", "HARD DISCONNECT", "100% session disconnect | wipes wallet connection cleanly unlike shady dApps."],
        ["#prop-freescan-btn", "NO-CONNECT FREE SCAN", "Click to see how read-only Solana JSON-RPC scanning works without ever connecting your wallet."],
        ["#prop-video-tour-btn", "INTERACTIVE VIDEO TOUR", "Launch the live 7-step guided cursor demo walking through Rent Recovery, Dead Coin Burner & 12-Layer Adaptive Rug Shield."],
        ["#prop-autocollect-label", "AUTO-COLLECT OPT-IN", "Optional 24/7 public-address monitor that prepares non-custodial 98.0% SOL refund batches whenever 5+ empty ATAs accumulate."],
        ["#indexPhantomDeepLinkBtn", "PHANTOM DEEP-LINK", "Opens SOL Rent & Rug Shield directly inside the Phantom mobile app browser with auto-scan armed."],
        ["#indexSolflareDeepLinkBtn", "SOLFLARE DEEP-LINK", "Opens SOL Rent & Rug Shield directly inside the Solflare mobile app browser with auto-scan armed."],
        ["#scanWalletBtn", "EMPTY ATA RENT SCAN", "Audits all 0-balance SPL & Token-2022 accounts via Helius Mainnet RPC (~0.002039 SOL reclaimable per account; 0.0% 1st Claim Free • 98.0% Net SOL on 2.0% repeat claims)."],
        ["#burnerScanBtn", "DEAD TOKEN INCINERATOR", "Finds rugged/dust tokens you can burn (BurnChecked + CloseAccount) to reclaim their locked SOL rent deposit."],
        ["#totSol", "TOTAL LOCKED RENT METRIC", "Gross SOL rent currently locked inside audited empty SPL/Token-2022 accounts on Solana Mainnet."],
        ["#box2StatCell", "YOUR 100% / 98.0% NET PAYOUT", "Exact net SOL & USD routed directly to your wallet in one atomic transaction (1st rent claim is 0% fee | keep 100%!)."],
        ["#box2DirectCollectBtn", "ATOMIC 100% / 98.0% SOL CLAIM", "Builds a transparent native Solana CloseAccount (0x09) transaction signed solely inside your own wallet."],
        ["#accCount", "ELIGIBLE ACCOUNT COUNT", "Total 0-balance empty ATAs + burnable dead token accounts ready to close for instant SOL recovery."],
        ["#box3DirectBurnBtn", "BURN & RECLAIM SOL", "Executes BurnChecked + CloseAccount on selected dead dust tokens to unlock extra trapped SOL rent."],
        ["#rugShieldCard .card-header", "SERVICE 2 • 11-LAYER SHIELD", "Pre-buy Solana token security engine auditing Mint/Freeze Auth, LP Burn, Top-10 Sniper Bundles & Inner-CPI Drains in <200ms."],
        ["#worlds-first-details-btn", "12-LAYER SECURITY ENGINE", "Click to inspect all 11 adaptive pre-buy security layers preventing honeypots, tax traps, and creator bundle dumps."],
        ["#mintInput", "TOKEN MINT AUDIT BAR", "Paste any 32 to 44 char Solana token mint address (or use ?mint= in URL) to run a 12-Layer pre-buy audit."],
        ["#scanTokenBtn", "1-CLICK PASTE & AUDIT MINT", "Pastes or audits the Solana token mint and returns a 0 to 100 Safety Score + 12-Layer pass/fail breakdown."],
        ["#indexChipLiveWinner", "LIVE WINNER AUDIT ($MELNOK +55.72%)", "1-tap live 12-Layer audit on verified runner $MELNOK (+55.72% full-cycle exit)."],
        ["#indexChipAllTimeWinner", "#1 MOONBAG AUDIT ($WASTED6)", "1-tap live 12-Layer audit on verified #1 moonbag $WASTED6 (+500.72% peak)."],
        ["#indexChipBlockedRug", "RUG TRAP AUDIT ($NVIDIA)", "1-tap forensic audit demonstrating how our 12-Layer Adaptive Shield blocks rugged mint $NVIDIA (-100.03%) pre-buy."],
        ["#botApiHoverBtn", "BOT WEBHOOK API (<120ms)", "Inspect the POST /api/audit JSON webhook & copy a demo API key to protect sniper bots before swap execution."],
        ["#liveAutonomousFleetRadarBox", "VERIFIED BLOCKCHAIN STREAM", "Real-time 12-Layer cleared runners & blocked rugs | every trade links directly to its immutable Solscan TX receipt."],
        ["#liveWalletRentScansBox", "ON-CHAIN RENT PROOFS", "Live Mainnet wallet audits & verified CloseAccount refund transactions inspectable on Solscan."],
        ["#visitorFeedbackSendBtn", "24/7 ENGINEER DIRECT LINE", "Delivers your feedback or VIP API inquiry straight to our Engineering & Product Roadmap."]
    ];
    function bindAllBubbleTargets() {
        for (var i = 0; i < BUBBLE_MAP.length; i++) {
            (function (sel, tag, html) {
                var nodes = document.querySelectorAll(sel);
                for (var j = 0; j < nodes.length; j++) {
                    var el = nodes[j];
                    if (el.getAttribute("data-emerald-bound") === "1")
                        return;
                    el.setAttribute("data-emerald-bound", "1");
                    el.setAttribute("data-emerald-tip", tag);
                    el._emeraldBodyHtml = html;
                    el.addEventListener("mouseenter", function () {
                        clampViewportAndShow(el, tag, html);
                    });
                    el.addEventListener("mouseleave", function () {
                        hideEmeraldTooltip();
                    });
                    el.addEventListener("focus", function () {
                        clampViewportAndShow(el, tag, html);
                    });
                    el.addEventListener("blur", function () {
                        hideEmeraldTooltip();
                    });
                    el.addEventListener("pointerdown", function (ev) {
                        if (ev && ev.pointerType === "touch" && window.guideBubblesIndexEnabled) {
                            clampViewportAndShow(el, tag, html);
                            if (hideTimer)
                                clearTimeout(hideTimer);
                            hideTimer = setTimeout(hideEmeraldTooltip, 2800);
                        }
                    }, { passive: true });
                }
            })(BUBBLE_MAP[i][0], BUBBLE_MAP[i][1], BUBBLE_MAP[i][2]);
        }
    }
    document.addEventListener("mouseover", function (ev) {
        if (!window.guideBubblesIndexEnabled || !ev || !ev.target || !ev.target.closest)
            return;
        var hit = ev.target.closest("[data-emerald-tip]");
        if (hit && hit._emeraldBodyHtml) {
            clampViewportAndShow(hit, hit.getAttribute("data-emerald-tip"), hit._emeraldBodyHtml);
        }
    }, { passive: true });
    window.addEventListener("scroll", function () {
        if (Date.now() - lastBubbleShowTs < 320)
            return;
        hideEmeraldTooltip();
    }, { passive: true });
    // 3. UPGRADE DESKTOP "🧩 Add App / Chrome Shield" UX:
    //    (1) 1-Click Instant Desktop Shield App (beforeinstallprompt standalone mini-window) FIRST
    //    (2) Interactive visual helper for chrome://extensions with 1-click Copy button + visual confirmation
    window.launchInstantDesktopShieldApp = function () {
        return __awaiter(this, void 0, void 0, function () {
            var st, pwaPrompt, choice, _a, _e_1, pop;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        st = document.getElementById("desktopShieldLaunchStatus");
                        pwaPrompt = window.deferredInstallPrompt || window.deferredPwaPrompt;
                        if (!(pwaPrompt && typeof pwaPrompt.prompt === "function")) return [3 /*break*/, 7];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, pwaPrompt.prompt()];
                    case 2:
                        _b.sent();
                        if (!pwaPrompt.userChoice) return [3 /*break*/, 4];
                        return [4 /*yield*/, pwaPrompt.userChoice];
                    case 3:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        _a = null;
                        _b.label = 5;
                    case 5:
                        choice = _a;
                        if (st) {
                            st.style.display = "block";
                            st.innerHTML = (choice && choice.outcome === "accepted")
                                ? "✅ <strong>Desktop Shield App Installed!</strong> Launching standalone window..."
                                : "✅ <strong>Installer Prompt Opened!</strong> You can also launch the standalone Shield Mini-Window anytime.";
                        }
                        return [2 /*return*/];
                    case 6:
                        _e_1 = _b.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        pop = null;
                        try {
                            pop = window.open("/app.html?source=desktop_shield", "SolRentRugShieldDesktop", "popup=yes,width=430,height=700,resizable=yes,scrollbars=yes");
                        }
                        catch (_e2) { }
                        if (st) {
                            st.style.display = "block";
                            st.innerHTML = pop
                                ? "✅ <strong>Standalone Shield Mini-Window Launched!</strong> (Tip: Click the <b>[⊕ Install]</b> icon in your Chrome/Edge address bar anytime to pin to Taskbar.)"
                                : "✅ <strong>Ready!</strong> <a href='/app.html?source=desktop_shield' target='_blank' rel='noopener' style='color:#fde047;text-decoration:underline;font-weight:900;'>Click here to open Shield Mini-Window ↗</a> (or click <b>[⊕ Install]</b> in Chrome's address bar).";
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    window.copyChromeExtensionsUrl = function () {
        return __awaiter(this, void 0, void 0, function () {
            var urlTxt, copied, _e_2, ta, badge, btn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        urlTxt = "chrome://extensions";
                        copied = false;
                        if (!(navigator.clipboard && navigator.clipboard.writeText)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, navigator.clipboard.writeText(urlTxt)];
                    case 2:
                        _a.sent();
                        copied = true;
                        return [3 /*break*/, 4];
                    case 3:
                        _e_2 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        if (!copied) {
                            try {
                                ta = document.createElement("textarea");
                                ta.value = urlTxt;
                                ta.setAttribute("readonly", "readonly");
                                ta.style.position = "fixed";
                                ta.style.left = "-9999px";
                                document.body.appendChild(ta);
                                ta.select();
                                copied = document.execCommand("copy");
                                ta.remove();
                            }
                            catch (_e2) { }
                        }
                        badge = document.getElementById("copyChromeExtConfirmBadge");
                        btn = document.getElementById("copyChromeExtUrlBtn");
                        if (btn) {
                            btn.innerHTML = "✅ Copied: chrome://extensions";
                            btn.style.borderColor = "#10B981";
                            btn.style.background = "linear-gradient(90deg,#059669,#10B981)";
                            btn.style.color = "#022c22";
                        }
                        if (badge) {
                            badge.style.display = "block";
                            badge.innerHTML = "✅ <strong>Copied <code>chrome://extensions</code> to clipboard!</strong> Open a new Chrome tab, press <b>Ctrl+V</b> (or Cmd+V) + <b>Enter</b>, toggle <b>Developer mode ON</b>, and click <b>Load unpacked</b>.";
                        }
                        return [2 /*return*/, copied];
                }
            });
        });
    };
    function renderDesktopShieldSuiteHtml() {
        var hasPrompt = Boolean(window.deferredInstallPrompt || window.deferredPwaPrompt);
        return ''
            + '<div style="background:linear-gradient(180deg,#042f2e,#041824); border:1.5px solid #10B981; border-radius:9px; padding:10px; margin-bottom:9px; box-shadow:0 0 16px rgba(16, 185, 129,0.22);">'
            + '  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">'
            + '    <span style="font-weight:900; color:#10B981; font-size: 13.5px;">⚡ Option 1 (Fastest • No Unzipping):</span>'
            + '    <span style="background:#10B981; color:#022c22; font-size: 13.5px; font-weight:900; padding:1px 6px; border-radius:999px;">' + (hasPrompt ? 'NATIVE INSTALL READY' : '1-CLICK MINI-APP') + '</span>'
            + '  </div>'
            + '  <div style="font-size: 13.5px; color:#d1fae5; margin-bottom:7px; line-height:1.38;">Launch SOL Rent &amp; Rug Shield immediately as a standalone Desktop Shield window right beside your DEX charts:</div>'
            + '  <button type="button" id="btnOneClickDesktopShieldApp" onclick="window.launchInstantDesktopShieldApp()" style="display:block; width:100%; padding:10px 10px; border-radius:8px; background:linear-gradient(90deg,#10b981,#10B981,#fde047); color:#022c22; font-weight:900; font-size: 13.5px; text-align:center; border:1.5px solid #ffffff; cursor:pointer; box-shadow:0 4px 14px rgba(16, 185, 129,0.45);">⚡ 1-Click Install / Launch Desktop Shield App</button>'
            + '  <div id="desktopShieldLaunchStatus" style="display:none; margin-top:6px; padding:6px 8px; border-radius:6px; background:rgba(2,6,23,0.82); border:1px solid #10B981; color:#ecfdf5; font-size: 13.5px; line-height:1.4;"></div>'
            + '</div>'
            + '<div style="background:rgba(30,27,75,0.55); border:1.5px solid #c084fc; border-radius:9px; padding:10px;">'
            + '  <div style="font-weight:900; color:#e9d5ff; font-size: 13.5px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">'
            + '    <span>🧩 Option 2: Pin Toolbar Extension Next to Phantom</span>'
            + '    <span style="font-size: 13.5px; color:#fde047; border:1px solid #fde047; padding:1px 5px; border-radius:4px;">MV3 v6.7</span>'
            + '  </div>'
            + '  <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:7px;">'
            + '    <a id="dlChromeShieldZipBtn" href="/CWS_READY_SolanaRentRugShield_MV3.zip" download="CWS_READY_SolanaRentRugShield_MV3.zip" style="display:flex; align-items:center; justify-content:center; padding:8px 6px; border-radius:7px; background:linear-gradient(90deg,#7c3aed,#2563eb); color:#ffffff; font-weight:900; font-size: 13.5px; text-align:center; text-decoration:none; border:1.5px solid #c084fc;">📦 1. Download MV3 (.zip)</a>'
            + '    <button type="button" id="copyChromeExtUrlBtn" onclick="window.copyChromeExtensionsUrl()" style="padding:8px 6px; border-radius:7px; background:#0f172a; color:#fde047; font-weight:900; font-size: 13.5px; border:1.5px solid #fde047; cursor:pointer;">📋 Copy chrome://extensions</button>'
            + '  </div>'
            + '  <div id="copyChromeExtConfirmBadge" style="display:none; margin-bottom:7px; padding:6px 8px; border-radius:6px; background:#042f2e; border:1px solid #10B981; color:#ecfdf5; font-size: 13.5px; line-height:1.38;"></div>'
            + '  <div style="background:rgba(2,6,23,0.78); border:1px solid rgba(192,132,252,0.45); border-radius:7px; padding:7px 9px; color:#f8fafc; font-size: 13.5px; line-height:1.48;">'
            + '    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px; padding-bottom:3px; border-bottom:1px solid rgba(255,255,255,0.08);">'
            + '      <span style="color:#93c5fd; font-family:JetBrains Mono,ui-monospace,monospace; font-weight:800;">chrome://extensions</span>'
            + '      <span style="background:#059669; color:#fff; padding:1px 6px; border-radius:999px; font-size: 13.5px; font-weight:900;">Developer mode: ON ●</span>'
            + '    </div>'
            + '    1️⃣ Click <b>📋 Copy chrome://extensions</b> above &amp; paste in Chrome address bar<br>'
            + '    2️⃣ Toggle <b>Developer mode ON</b> (top-right) → click <b>[Load unpacked]</b> (top-left)<br>'
            + '    3️⃣ Select unzipped folder (or <code>C:\\SolanaRentRugShield_Extension</code> on Windows) &amp; click 📌!'
            + '  </div>'
            + '</div>';
    }
    var origInstallPlatform = window.installPlatformAppFromIndex;
    window.installPlatformAppFromIndex = function (platform, autoDownload) {
        return __awaiter(this, void 0, void 0, function () {
            var m, box, stTitle, stSub, bIos, bAnd, bExt, bPc, activeBtn;
            return __generator(this, function (_a) {
                if (platform === "chrome_ext" || platform === "pc") {
                    m = document.getElementById("addAppModal");
                    if (m)
                        m.style.display = "flex";
                    box = document.getElementById("addAppPlatformActionBox");
                    stTitle = document.getElementById("auto-dl-status-title") || document.getElementById("autoDlStatusTitle");
                    stSub = document.getElementById("auto-dl-status-sub") || document.getElementById("autoDlStatusSub");
                    bIos = document.getElementById("addAppBtnIos");
                    bAnd = document.getElementById("addAppBtnAndroid");
                    bExt = document.getElementById("addAppBtnChromeExt");
                    bPc = document.getElementById("addAppBtnPc");
                    [bIos, bAnd, bExt, bPc].forEach(function (b) {
                        if (b) {
                            b.style.border = "1.5px solid rgba(255,255,255,0.22)";
                            b.style.boxShadow = "none";
                        }
                    });
                    activeBtn = (platform === "pc") ? bPc : bExt;
                    if (activeBtn) {
                        activeBtn.style.border = "2px solid #10B981";
                        activeBtn.style.boxShadow = "0 0 16px rgba(16, 185, 129,0.6)";
                    }
                    if (stTitle)
                        stTitle.innerText = "🛡️ 1-Click Desktop Shield App & Chrome Extension";
                    if (stSub)
                        stSub.innerText = "Launch instantly in 1 click OR pin the MV3 Shield next to Phantom:";
                    if (box)
                        box.innerHTML = renderDesktopShieldSuiteHtml();
                    return [2 /*return*/];
                }
                if (typeof origInstallPlatform === "function") {
                    return [2 /*return*/, origInstallPlatform(platform, autoDownload)];
                }
                return [2 /*return*/];
            });
        });
    };
    window.openChromeExtFromIndex = function () {
        var m = document.getElementById("addAppModal");
        if (m)
            m.style.display = "flex";
        window.installPlatformAppFromIndex("chrome_ext", false);
    };
    window.triggerAutoAddAppIndex = function () {
        var m = document.getElementById("addAppModal");
        if (m)
            m.style.display = "flex";
        var ua = navigator.userAgent || "";
        if (/Android/i.test(ua))
            window.installPlatformAppFromIndex("android", false);
        else if (/iPhone|iPad|iPod/i.test(ua))
            window.installPlatformAppFromIndex("ios", false);
        else
            window.installPlatformAppFromIndex("chrome_ext", false);
    };
    window.openAddAppModal = window.triggerAutoAddAppIndex;
    function bootV202UiUpgrades() {
        window.syncGuideToggleVisual();
        bindAllBubbleTargets();
        setTimeout(bindAllBubbleTargets, 450);
        setTimeout(bindAllBubbleTargets, 1200);
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bootV202UiUpgrades);
    }
    else {
        bootV202UiUpgrades();
    }
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
(function initFirstPartyHumanTelemetryBeacon() {
    if (window.__rsFirstPartyTelemetryArmed)
        return;
    window.__rsFirstPartyTelemetryArmed = true;
    var sidKey = "rs_fp_session_id_v2";
    var sessionId = "";
    try {
        sessionId = window.sessionStorage.getItem(sidKey) || "";
        if (!sessionId) {
            sessionId = "rs_" + Math.random().toString(36).slice(2, 10) + "_" + Date.now().toString(36);
            window.sessionStorage.setItem(sidKey, sessionId);
        }
    }
    catch (_e) {
        sessionId = "rs_" + Math.random().toString(36).slice(2, 10) + "_" + Date.now().toString(36);
    }
    var interactions = 0;
    var hardwarePointerVerified = false;
    var lastPointerType = "";
    var interactionBeaconSent = false;
    var lastX = null;
    var lastY = null;
    function resolveTelemetryEndpoint() {
        var cfg = window.__LIVE_ENDPOINT_CONFIG;
        var cfgBase = cfg && (cfg.endpoint || cfg.api_base) ? String(cfg.endpoint || cfg.api_base).replace(/\/+$/, "") : "";
        var host = String(window.location.hostname || "").toLowerCase();
        var isStaticHost = (window.location.port !== "8088");
        var base = isStaticHost ? (cfgBase || String(window.BACKEND_TUNNEL_BASE || "").replace(/\/+$/, "")) : "";
        return base + "/api/human-telemetry";
    }
    function sendHumanTelemetry(eventName, extra) {
        try {
            var ep = resolveTelemetryEndpoint();
            var payload = Object.assign({
                event: eventName || "page_view",
                page: window.location.pathname || "/",
                origin: window.location.origin || "https://rentandrugshield.com",
                referrer: document.referrer || "",
                session_id: sessionId,
                interactions: interactions,
                hardware_pointer: hardwarePointerVerified,
                pointer_type: lastPointerType,
                is_trusted: hardwarePointerVerified,
                max_touch_points: Number((navigator && navigator.maxTouchPoints) || 0),
                webdriver: Boolean(navigator && navigator.webdriver),
                wallet: "",
                mint: "",
                symbol: "",
                score: null,
                empty_atas: null,
                reclaimable_sol: null,
                ts: Date.now()
            }, extra || {});
            if (typeof window.fetch === "function") {
                window.fetch(ep, {
                    method: "POST",
                    mode: "cors",
                    credentials: "omit",
                    keepalive: true,
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(payload)
                }).catch(function () { });
            }
        }
        catch (_err) { }
    }
    function recordHumanInput(ev) {
        if (!ev || ev.isTrusted !== true)
            return;
        if (navigator && navigator.webdriver === true)
            return;
        var pType = String(ev.pointerType || (ev.touches ? "touch" : "mouse")).toLowerCase();
        if (pType !== "mouse" && pType !== "touch" && pType !== "pen")
            return;
        if (ev.type === "mousemove" || ev.type === "pointermove") {
            var cx = typeof ev.clientX === "number" ? ev.clientX : 0;
            var cy = typeof ev.clientY === "number" ? ev.clientY : 0;
            if (lastX !== null && cx === lastX && cy === lastY)
                return;
            lastX = cx;
            lastY = cy;
        }
        hardwarePointerVerified = true;
        lastPointerType = pType;
        interactions += 1;
        if (!interactionBeaconSent && interactions >= 1) {
            interactionBeaconSent = true;
            sendHumanTelemetry("interaction", {});
        }
    }
    document.addEventListener("pointermove", recordHumanInput, { passive: true });
    document.addEventListener("pointerdown", recordHumanInput, { passive: true });
    document.addEventListener("touchstart", recordHumanInput, { passive: true });
    // Fire initial page_view after live_endpoint.json sync settles
    setTimeout(function () {
        sendHumanTelemetry("page_view", {});
    }, 350);
    // Hook scanWallet / runWalletScan & scanToken / runMintAudit so real customer scans register accurately
    function hookScanners() {
        if (typeof window.scanWallet === "function" && !window.scanWallet.__fpTelemetryHooked) {
            var origSW = window.scanWallet;
            var wrappedSW = function (optionalWallet, scanType) {
                var arguments_1 = arguments;
                return __awaiter(this, void 0, void 0, function () {
                    var wEl, targetW, res, solEl, cntEl, emptyCnt, recSol;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                wEl = document.getElementById("walletInput") || document.getElementById("w-inp");
                                targetW = String(optionalWallet || (wEl && wEl.value ? wEl.value : "") || "").trim();
                                return [4 /*yield*/, origSW.apply(this, arguments_1)];
                            case 1:
                                res = _a.sent();
                                if (targetW && targetW.length >= 32 && targetW !== "C3FFhG83pda2veVRFwTDNyf1YT2R2U2ZHxcg8pUeMjrC") {
                                    solEl = document.getElementById("reclaimableSol");
                                    cntEl = document.getElementById("accountsCount");
                                    emptyCnt = (res && res.empty_count != null) ? Number(res.empty_count) : (cntEl ? parseInt(cntEl.innerText || "0", 10) : null);
                                    recSol = (res && res.total_reclaimable_sol != null) ? Number(res.total_reclaimable_sol) : (solEl ? parseFloat(solEl.innerText || "0") : null);
                                    sendHumanTelemetry("wallet_scan", {
                                        wallet: targetW,
                                        empty_atas: isNaN(emptyCnt) ? null : emptyCnt,
                                        reclaimable_sol: isNaN(recSol) ? null : recSol,
                                        is_sample_test: Boolean(targetW === "" || targetW === "C3FFhG83pda2veVRFwTDNyf1YT2R2U2ZHxcg8pUeMjrC")
                                    });
                                }
                                return [2 /*return*/, res];
                        }
                    });
                });
            };
            wrappedSW.__fpTelemetryHooked = true;
            window.scanWallet = wrappedSW;
        }
        if (typeof window.runWalletScan === "function" && !window.runWalletScan.__fpTelemetryHooked) {
            var origRWS = window.runWalletScan;
            var wrappedRWS = function (mode, isSampleTest) {
                var arguments_2 = arguments;
                return __awaiter(this, void 0, void 0, function () {
                    var wEl, targetW, res;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                wEl = document.getElementById("w-inp");
                                targetW = String((wEl && wEl.value) || "").trim();
                                return [4 /*yield*/, origRWS.apply(this, arguments_2)];
                            case 1:
                                res = _a.sent();
                                if (targetW && targetW.length >= 32) {
                                    sendHumanTelemetry("wallet_scan", {
                                        wallet: targetW,
                                        empty_atas: res && res.empty_count != null ? Number(res.empty_count) : null,
                                        reclaimable_sol: res && res.total_reclaimable_sol != null ? Number(res.total_reclaimable_sol) : null,
                                        is_sample_test: Boolean(isSampleTest)
                                    });
                                }
                                return [2 /*return*/, res];
                        }
                    });
                });
            };
            wrappedRWS.__fpTelemetryHooked = true;
            window.runWalletScan = wrappedRWS;
        }
        if (typeof window.scanToken === "function" && !window.scanToken.__fpTelemetryHooked) {
            var origST = window.scanToken;
            var wrappedST = function (isAutoInit, optionalMint) {
                var arguments_3 = arguments;
                return __awaiter(this, void 0, void 0, function () {
                    var mEl, targetM, res;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                mEl = document.getElementById("mintInput") || document.getElementById("m-inp");
                                targetM = String(optionalMint || (mEl && mEl.value ? mEl.value : "") || "").trim();
                                return [4 /*yield*/, origST.apply(this, arguments_3)];
                            case 1:
                                res = _a.sent();
                                if (!isAutoInit && targetM && targetM.length >= 32) {
                                    sendHumanTelemetry("token_scan", {
                                        mint: targetM,
                                        symbol: (res && res.symbol) ? String(res.symbol) : "",
                                        score: (res && res.score != null) ? Number(res.score) : null
                                    });
                                }
                                return [2 /*return*/, res];
                        }
                    });
                });
            };
            wrappedST.__fpTelemetryHooked = true;
            window.scanToken = wrappedST;
            window.auditMint = wrappedST;
        }
        if (typeof window.runMintAudit === "function" && !window.runMintAudit.__fpTelemetryHooked) {
            var origRMA = window.runMintAudit;
            var wrappedRMA = function (hintSym) {
                var arguments_4 = arguments;
                return __awaiter(this, void 0, void 0, function () {
                    var mEl, targetM, res;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                mEl = document.getElementById("m-inp");
                                targetM = String((mEl && mEl.value) || "").trim();
                                return [4 /*yield*/, origRMA.apply(this, arguments_4)];
                            case 1:
                                res = _a.sent();
                                if (targetM && targetM.length >= 32) {
                                    sendHumanTelemetry("token_scan", {
                                        mint: targetM,
                                        symbol: String(hintSym || ""),
                                        score: null
                                    });
                                }
                                return [2 /*return*/, res];
                        }
                    });
                });
            };
            wrappedRMA.__fpTelemetryHooked = true;
            window.runMintAudit = wrappedRMA;
        }
    }
    hookScanners();
    window.addEventListener("DOMContentLoaded", hookScanners);
    setTimeout(hookScanners, 800);
    window.RentShieldTelemetry = {
        sessionId: sessionId,
        sendEvent: sendHumanTelemetry
    };
    window.Dex6PersonaTracker = {
        sessionId: sessionId,
        trackDwell: function (bucket, dwellSeconds, extra) {
            sendHumanTelemetry("interaction", Object.assign({ bucket: bucket, dwell_seconds: dwellSeconds || 0 }, extra || {}));
        },
        trackMintScan: function (scanMint, extra) {
            sendHumanTelemetry("token_scan", Object.assign({ mint: scanMint || "" }, extra || {}));
        },
        trackWalletRentScan: function (walletAddr, extra) {
            sendHumanTelemetry("wallet_scan", Object.assign({ wallet: walletAddr || "" }, extra || {}));
        }
    };
})();
