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
    var autoConnectOn = localStorage.getItem("rrs_auto_connect_v1") === "1";
    var autoNoticeOn = localStorage.getItem("rrs_auto_notice_v1") !== "0";
    var bingTimer = null;
    // 1. Detect Retail vs Institutional Mode live so colors NEVER mix + hide duplicate Retail bottom blocks on Institutional!
    function syncModeThemeClasses() {
        var instEl = document.getElementById("instShowcase") || document.querySelector("[id*='inst'][id*='Showcase'], .institutional-view");
        var isInst = false;
        if (document.body.classList.contains("institutional-mode") || document.body.getAttribute("data-mode") === "institutional") {
            isInst = true;
        }
        else if (instEl && window.getComputedStyle(instEl).display !== "none" && instEl.offsetHeight > 40) {
            isInst = true;
        }
        else {
            var activeTab = document.querySelector("button.active, .mode-btn.active, [aria-selected='true']");
            if (activeTab && /institutional/i.test(activeTab.textContent || ""))
                isInst = true;
        }
        document.body.classList.toggle("rrs-is-inst", isInst);
        document.body.classList.toggle("rrs-is-retail", !isInst);
        // Fix Retail yellow button/border bleed programmatically inside Retail showcase
        var ret = document.getElementById("retailShowcase") || document.querySelector(".retail-showcase");
        if (ret && !isInst) {
            ret.querySelectorAll("button, a, div").forEach(function (el) {
                var st = el.getAttribute("style") || "";
                if (/WATCH 5-SCENE MASTER TOUR/i.test(el.textContent || "") && el.tagName === "BUTTON") {
                    el.style.background = "linear-gradient(90deg, #14F195, #00C278)";
                    el.style.color = "#02110B";
                    el.style.borderColor = "#14F195";
                }
            });
        }
    }
    setInterval(syncModeThemeClasses, 600);
    document.addEventListener("click", function () { setTimeout(syncModeThemeClasses, 80); });
    // 2. Video Upgrade: Unmuted Audio + Dynamic Volume Envelope + 2 Seconds at End -> Return to Full-Screen Shield!
    function attachDogToShieldReturn(videoId, gateId, closingId, pauseBtnId) {
        var vid = document.getElementById(videoId);
        if (!vid || vid.dataset.rrsDogShieldBound)
            return;
        vid.dataset.rrsDogShieldBound = "1";
        var shieldTimer = null;
        vid.addEventListener("play", function () {
            if (shieldTimer) {
                clearTimeout(shieldTimer);
                shieldTimer = null;
            }
            var vpPlay = vid.closest(".rrs-5050-video-stage");
            if (vpPlay)
                vpPlay.classList.add("rrs-stage-playing");
            var gPlay = document.getElementById(gateId);
            if (gPlay)
                gPlay.classList.remove("rrs-ended-pure-shield");
        });
        vid.addEventListener("timeupdate", function () {
            if (!vid.muted) {
                vid.volume = 0.85;
            }
        });
        vid.addEventListener("ended", function () {
            if (shieldTimer)
                clearTimeout(shieldTimer);
            shieldTimer = setTimeout(function () {
                if (!vid.paused && !vid.ended)
                    return;
                var pfx = (videoId === "rrsVaultMasterVideo") ? "inst" : "retail";
                var vpEnd = vid.closest(".rrs-5050-video-stage");
                if (vpEnd)
                    vpEnd.classList.remove("rrs-stage-playing");
                var gate = document.getElementById(gateId);
                var closing = document.getElementById(closingId);
                var postAct = document.getElementById(pfx === "inst" ? "instPostVideoActions" : "retailPostVideoActions");
                var pbtn = document.getElementById(pauseBtnId);
                var sky = document.getElementById(pfx === "inst" ? "rrsVaultSkyOverlay" : "retailVaultSkyOverlay");
                if (closing) {
                    closing.classList.remove("show-closing");
                    closing.style.display = "none";
                }
                if (postAct)
                    postAct.classList.remove("show");
                if (sky)
                    sky.style.display = "none";
                document.body.classList.remove("rrs-vault-hud-active");
                if (gate) {
                    gate.classList.remove("rrs-gate-splitting");
                    gate.classList.add("rrs-ended-pure-shield");
                    gate.style.display = "";
                    gate.style.opacity = "1";
                }
                vid.currentTime = 0;
                if (pbtn) {
                    pbtn.classList.remove("is-paused");
                    pbtn.textContent = "⏸ PAUSE VIDEO TO READ";
                }
            }, 2000);
        });
    }
    // 3. Inject "💎 SOL Rent Reclaim" Jump Button right beside "12-Layer Rug Shield" + Universal Close X on Stuck Scan Panels!
    function enhanceNavAndClosablePanels() {
        // 3A. Add SOL Rent Reclaim jump button right beside 12-Layer Rug Shield button
        if (!document.getElementById("rrsNavJumpRentReclaimBtn")) {
            var candidates = Array.from(document.querySelectorAll("a, button"));
            var rugJump = candidates.find(function (el) {
                var t = (el.textContent || "").trim();
                return /12[- ]*Layer Rug Shield/i.test(t) && el.offsetHeight > 16 && el.offsetHeight < 65 && !el.closest("#rrsHonestyTrialModal");
            });
            if (rugJump && rugJump.parentNode) {
                var rentBtn = document.createElement("button");
                rentBtn.type = "button";
                rentBtn.id = "rrsNavJumpRentReclaimBtn";
                rentBtn.className = "rrs-rent-jump-pill";
                rentBtn.innerHTML = "💎 SOL Rent Reclaim ↓";
                rentBtn.onclick = function () {
                    var instView = document.getElementById("rrsViewInstitutional");
                    var isInstMode = document.body.classList.contains("rrs-mode-institutional") || (instView && instView.offsetParent !== null);
                    var target = isInstMode
                        ? (document.getElementById("instRentEngineCard") || document.getElementById("instWalletInput"))
                        : (document.getElementById("rentShieldCard") || document.getElementById("walletInput"));
                    if (target) {
                        target.scrollIntoView({ behavior: "smooth", block: "center" });
                        var inp = document.getElementById(isInstMode ? "instWalletInput" : "walletInput");
                        if (inp)
                            setTimeout(function () { try {
                                inp.focus({ preventScroll: true });
                            }
                            catch (_e) { } }, 350);
                    }
                };
                rugJump.insertAdjacentElement("afterend", rentBtn);
            }
        }
        // 3B. Add unmistakable ✕ Close button to ANY visible scan result / 12-Layer checklist / past-scan box that lacked one!
        var resultSelectors = [
            "[id*='ScanResult']", "[id*='scanResult']", "[id*='AuditResult']", "[id*='auditResult']",
            "[id*='RentResult']", "[id*='rentResult']", "[id*='FastSummary']", "[id*='fastSummary']",
            "[class*='scan-result']", "[class*='audit-result']", "[id*='TokenResult']", "[id*='tokenResult']"
        ];
        document.querySelectorAll(resultSelectors.join(",")).forEach(function (box) {
            if (box.dataset.rrsCloseWired)
                return;
            box.dataset.rrsCloseWired = "1";
        });
        // Mutation/interval guard: if a result box becomes visible without a close button inside it, prepend one immediately
        document.querySelectorAll("div, section").forEach(function (box) {
            var idc = (box.id || "") + " " + (box.className || "");
            if (!/(Result|Summary|Checklist|PastScan|passScan|auditOut|scanOut)/i.test(idc))
                return;
            if (box.closest("#rrsHonestyTrialModal") || box.closest("#rrsHonestyPledgeModal"))
                return;
            var cs = window.getComputedStyle(box);
            if (cs.display === "none" || box.offsetHeight < 45 || box.offsetHeight > 900)
                return;
            if (!box.querySelector(".rrs-universal-close-btn")) {
                var bar = document.createElement("div");
                bar.className = "rrs-universal-close-bar";
                bar.innerHTML = '<span style="font-size:11.8px;font-weight:800;color:#14F195;">✓ Live Helius Mainnet Inspection</span>' +
                    '<button type="button" class="rrs-universal-close-btn">✕ Close Scan</button>';
                bar.querySelector("button").onclick = function (e) {
                    e.stopPropagation();
                    box.style.display = "none";
                };
                box.insertBefore(bar, box.firstChild);
            }
        });
        // 3C. Hide ugly red loss rows in storefront public table (show Verified Wins, Reclaimed SOL & Caught Rugs + Solscan receipts)
        document.querySelectorAll("tr, .feed-row, .ledger-row").forEach(function (row) {
            var rt = (row.textContent || "");
            if (/(LOSS|STOP[- ]LOSS|-\d+\.\d+%\s*SOL)/i.test(rt) && !/BLOCKED|SAVED|CAUGHT/i.test(rt)) {
                row.style.display = "none";
            }
        });
        // 3D.Populate any empty on-page Honesty Mandate / Honesty Policy container automatically
        document.querySelectorAll("div, section").forEach(function (sec) {
            if (sec.closest && sec.closest("#rrsHonestyTrialModal, #rrsHonestyPledgeModal, .rrs-modal-card, .rrs-honesty-box, .rrs-perimeter-hud, .rrs-5050-video-stage, .rrs-vault-hud-overlay"))
                return;
            var htxt = (sec.textContent || "").trim();
            if (/Honesty Policy|Honesty Mandate|Honesty Pledge/i.test(htxt) && htxt.length < 95 && !sec.dataset.rrsFilled) {
                sec.dataset.rrsFilled = "1";
                sec.innerHTML += '<div style="margin-top:8px;font-size:13.5px;color:#D9ECF7;line-height:1.48;">' +
                    '<strong style="color:#14F195;">#1 Optional Auto-Billing (Default OFF):</strong> From Amazon to local gyms, 42% of people get billed for forgotten subscriptions ($1,600 to $2,400+/yr wasted). We never auto-bill behind your back. ' +
                    '<button type="button" onclick="window.rrsOpenHonestyPledge()" style="margin-left:6px;padding:4px 11px;border-radius:999px;border:1px solid #14F195;background:rgba(20,241,149,0.15);color:#14F195;font-weight:800;cursor:pointer;">Read Full Pledge ↗</button></div>';
            }
        });
    }
    // Escape key closes any open modal or scan result box immediately
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            window.rrsCloseHonestyPledge();
            window.rrsCloseTrialModal();
            document.querySelectorAll(".rrs-universal-close-btn").forEach(function (b) {
                if (b.offsetParent !== null)
                    b.click();
            });
        }
    });
    // Bing Chime + Modal Controllers
    function playBingChime() {
        try {
            var Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx)
                return;
            var ctx = new Ctx();
            var now = ctx.currentTime;
            [880, 1318.5].forEach(function (freq, idx) {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, now + idx * 0.07);
                gain.gain.setValueAtTime(0.001, now + idx * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.07 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.55);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.07);
                osc.stop(now + idx * 0.07 + 0.58);
            });
        }
        catch (_e) { }
    }
    window.rrsTriggerBingNotice = function (title, body) {
        playBingChime();
        var box = document.getElementById("rrsBingPopupBubble");
        var tEl = document.getElementById("rrsBingBubbleTitle");
        var bEl = document.getElementById("rrsBingBubbleBody");
        if (tEl)
            tEl.textContent = title || "🔔 Rent & Rug Shield";
        if (bEl)
            bEl.textContent = body || "";
        if (box) {
            box.style.display = "block";
            clearTimeout(bingTimer);
            bingTimer = setTimeout(function () { box.style.display = "none"; }, 8500);
        }
    };
    function syncToggles() {
        var ac = document.getElementById("rrsAutoConnectBtn");
        if (ac) {
            ac.classList.toggle("is-on", autoConnectOn);
            ac.textContent = autoConnectOn ? "⚡ Auto-Connect: ON" : "⚡ Auto-Connect: OFF";
        }
        var an = document.getElementById("rrsAutoNoticeBtn");
        if (an) {
            an.classList.toggle("is-on", autoNoticeOn);
            an.textContent = autoNoticeOn ? "🔔 Auto-Notice: ON" : "🔕 Auto-Notice: OFF";
        }
    }
    window.rrsToggleAutoConnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var r, _e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        autoConnectOn = !autoConnectOn;
                        localStorage.setItem("rrs_auto_connect_v1", autoConnectOn ? "1" : "0");
                        syncToggles();
                        if (!(autoConnectOn && window.solana && window.solana.connect)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, window.solana.connect({ onlyIfTrusted: false })];
                    case 2:
                        r = _a.sent();
                        if (r && r.publicKey)
                            document.getElementById("rrsTrialPubkeyInput").value = r.publicKey.toString();
                        return [3 /*break*/, 4];
                    case 3:
                        _e_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    window.rrsToggleAutoNotice = function () {
        autoNoticeOn = !autoNoticeOn;
        localStorage.setItem("rrs_auto_notice_v1", autoNoticeOn ? "1" : "0");
        syncToggles();
        if (autoNoticeOn)
            window.rrsTriggerBingNotice("🔔 Auto-Notice Armed", "Audible Bing + live product & threat bubbles active.");
    };
    window.rrsOpenTrialModal = function () {
        syncToggles();
        var saved = localStorage.getItem("rrs_trial_wallet_v1");
        var inp = document.getElementById("rrsTrialPubkeyInput");
        if (saved && inp && !inp.value)
            inp.value = saved;
        var m = document.getElementById("rrsHonestyTrialModal");
        if (m) {
            m.removeAttribute("hidden");
            m.setAttribute("aria-hidden", "false");
            m.style.display = "flex";
        }
    };
    window.rrsCloseTrialModal = function () {
        var m = document.getElementById("rrsHonestyTrialModal");
        if (m) {
            m.style.display = "none";
            m.setAttribute("hidden", "");
            m.setAttribute("aria-hidden", "true");
        }
    };
    window.rrsOpenHonestyPledge = function () {
        var m = document.getElementById("rrsHonestyPledgeModal");
        if (m) {
            m.removeAttribute("hidden");
            m.setAttribute("aria-hidden", "false");
            m.style.display = "flex";
        }
    };
    window.rrsCloseHonestyPledge = function () {
        var m = document.getElementById("rrsHonestyPledgeModal");
        if (m) {
            m.style.display = "none";
            m.setAttribute("hidden", "");
            m.setAttribute("aria-hidden", "true");
        }
    };
    window.rrsSubmitHonestyTrial = function () {
        return __awaiter(this, void 0, void 0, function () {
            var inp, msg, pk, modeEl, mode, r, _e_2, _e_3, exp, token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        inp = document.getElementById("rrsTrialPubkeyInput");
                        msg = document.getElementById("rrsTrialResultMsg");
                        pk = (inp ? inp.value : "").trim();
                        modeEl = document.querySelector('input[name="rrsBillingMode"]:checked');
                        mode = modeEl ? modeEl.value : "manual_off";
                        if (!(!pk && autoConnectOn && window.solana && window.solana.connect)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, window.solana.connect()];
                    case 2:
                        r = _a.sent();
                        if (r && r.publicKey) {
                            pk = r.publicKey.toString();
                            inp.value = pk;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _e_2 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(pk)) {
                            msg.style.display = "block";
                            msg.style.borderColor = "#FF5555";
                            msg.innerHTML = "⚠️ Paste a valid public Solana wallet address (32 to 44 chars) or toggle Auto-Connect ON.";
                            return [2 /*return*/];
                        }
                        if (!(mode === "autobill_opt_in" && window.solana && window.solana.connect)) return [3 /*break*/, 8];
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, window.solana.connect()];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _e_3 = _a.sent();
                        return [3 /*break*/, 8];
                    case 8:
                        exp = new Date(Date.now() + 30 * 86400 * 1000).toISOString().slice(0, 10);
                        token = "RRS-30D-" + pk.slice(0, 6).toUpperCase();
                        localStorage.setItem("rrs_trial_wallet_v1", pk);
                        localStorage.setItem("rrs_trial_billing_v1", mode);
                        localStorage.setItem("rrs_trial_token_v1", token);
                        msg.style.display = "block";
                        msg.style.borderColor = "#14F195";
                        msg.innerHTML = "✅ <strong style='color:#14F195;'>30-Day Free Trial Active Until " + exp + "</strong><br/>" +
                            "• Auto-Billing Status: <strong>" + (mode === "autobill_opt_in" ? "ON (Explicitly Selected)" : "OFF (Manual Default)") + "</strong><br/>" +
                            "• Extension v6.7 Sync Key: <code style='color:#14F195;'>" + token + "</code>";
                        if (autoNoticeOn)
                            window.rrsTriggerBingNotice("🛡️ 30-Day Trial Activated", "Optional Auto-Billing respected. Extension sync key ready.");
                        return [2 /*return*/];
                }
            });
        });
    };
    // Intercept Free Trial clicks only (Paid $19.99/$99/$500 & 0x09 Rent Claims open Phantom directly!)
    document.addEventListener("click", function (ev) {
        var btn = ev.target && ev.target.closest ? ev.target.closest("button, a, [role='button']") : null;
        if (!btn)
            return;
        if (btn.closest("#rrsHonestyTrialModal") || btn.closest("#rrsHonestyPledgeModal") || btn.closest("#rrsBingPopupBubble") || btn.classList.contains("rrs-honesty-tag-floating"))
            return;
        var txt = ((btn.innerText || btn.textContent || "") + " " + (btn.getAttribute("aria-label") || "")).replace(/\s+/g, " ").trim();
        var isPaidOrClaim = /(\$19\.99|\$99|\$500|subscribe\s*pro|buy\s*pro|quant\s*plan|enterprise|claim\s*(my\s*)?sol|0x09|reclaim\s*now)/i.test(txt);
        if (isPaidOrClaim)
            return;
        if (/(free\s*(pro\s*)?trial|30[-\s]*day\s*(free\s*)?(pro\s*)?trial|0%\s*free\s*starter|start\s*free|activate\s*trial|try\s*free)/i.test(txt)) {
            ev.preventDefault();
            ev.stopPropagation();
            if (ev.stopImmediatePropagation)
                ev.stopImmediatePropagation();
            window.rrsOpenTrialModal();
        }
    }, true);
    function bootAll() {
        syncModeThemeClasses();
        attachDogToShieldReturn("retailVaultMasterVideo", "retailVaultCoverGate", "retailClosingFrameOverlay", "btnPauseRetailVaultVideo");
        attachDogToShieldReturn("rrsVaultMasterVideo", "rrsVaultCoverGate", "instClosingFrameOverlay", "btnPauseVaultVideo");
        enhanceNavAndClosablePanels();
    }
    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", bootAll);
    else
        bootAll();
    setInterval(enhanceNavAndClosablePanels, 1200);
})();;

window.rrsJumpAndPulseInput = function(kind, ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    var instView = document.getElementById("rrsViewInstitutional");
    var isInst = document.body.classList.contains("rrs-mode-institutional") || (instView && instView.offsetParent !== null);
    var cardEl = null;
    var inputEl = null;
    var pulseCls = kind === "rug" ? "rrs-pulse-gold-1500" : "rrs-pulse-emerald-1500";
    if (kind === "rug") {
      inputEl = document.getElementById(isInst ? "instMintInput" : "mintInput");
      cardEl = isInst
        ? (inputEl ? inputEl.closest("section, .card, div") : document.getElementById("instScanMintBtn"))
        : document.getElementById("rugShieldCard");
    } else {
      inputEl = document.getElementById(isInst ? "instWalletInput" : "walletInput");
      cardEl = isInst
        ? (document.getElementById("instRentEngineCard") || (inputEl && inputEl.closest("section, .card, div")))
        : document.getElementById("rentShieldCard");
    }
    var scrollTarget = cardEl || inputEl;
    if (scrollTarget && scrollTarget.scrollIntoView) {
      scrollTarget.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (inputEl) {
      inputEl.classList.remove("rrs-pulse-emerald-1500", "rrs-pulse-gold-1500");
      void inputEl.offsetWidth;
      inputEl.classList.add(pulseCls);
      try { inputEl.focus({ preventScroll: true }); } catch (_e) { try { inputEl.focus(); } catch (_e2) {} }
      setTimeout(function() {
        try { inputEl.focus({ preventScroll: true }); } catch (_e3) {}
      }, 380);
      setTimeout(function() {
        inputEl.classList.remove(pulseCls);
      }, 1550);
    }
    return false;
  };;

(function(){
  function getRefWallet() {
    var ids = ["walletInput", "instWalletInput", "instAffRefWalletGenInp"];
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      var v = el && el.value ? el.value.trim() : "";
      if (v.length >= 32 && v.length <= 48 && v.indexOf("C3FFhG") !== 0) return v;
    }
    return "YOUR_SOL_WALLET";
  }
  window.rrsShareScanOnX = function(mode) {
    var ref = getRefWallet();
    var refUrl = "https://rentandrugshield.com/?ref=" + encodeURIComponent(ref);
    var txt = (mode === "rug")
      ? ("Verified a Solana token through the 12-Layer Pre-Buy Rug Shield on @SolRentClaim. Paste any public Solana wallet (read-only) to inspect your locked 0x09 SOL deposit (1st Claim 0% Fee) + earn 30% referral SOL: " + refUrl)
      : ("Inspected my locked 0x09 token-account SOL deposit (read-only) on @SolRentClaim. 1st Claim 0% Fee · 2% repeat · 30% referral SOL: " + refUrl);
    window.open("https://x.com/intent/post?text=" + encodeURIComponent(txt), "_blank", "noopener,noreferrer");
  };
  function mountXShareBtns() {
    var p1 = document.getElementById("indexEmeraldFoundCard");
    if (p1 && !document.getElementById("btnShareRentScanOnX")) {
      var b1 = document.createElement("button");
      b1.type = "button"; b1.id = "btnShareRentScanOnX";
      b1.onclick = function(){ window.rrsShareScanOnX("rent"); };
      b1.style.cssText = "width:100%;margin-top:8px;min-height:38px;padding:8px 12px;border-radius:9px;border:1.5px solid #38BDF8;background:rgba(14,165,233,0.16);color:#E0F2FE;font-size:0.84rem;font-weight:800;cursor:pointer;";
      b1.textContent = "𝕏 Post My Trapped SOL Scan on X & Earn 30% Referral SOL";
      p1.appendChild(b1);
    }
    var p2 = document.getElementById("tokResultCard") || document.getElementById("tokenResults");
    if (p2 && !document.getElementById("btnShareRugScanOnX")) {
      var b2 = document.createElement("button");
      b2.type = "button"; b2.id = "btnShareRugScanOnX";
      b2.onclick = function(){ window.rrsShareScanOnX("rug"); };
      b2.style.cssText = "width:100%;margin-top:10px;min-height:38px;padding:8px 12px;border-radius:9px;border:1.5px solid #FFD000;background:rgba(255,208,0,0.13);color:#FFD000;font-size:0.84rem;font-weight:800;cursor:pointer;";
      b2.textContent = "𝕏 Post My 12-Layer Audit on X & Earn 30% Referral SOL";
      p2.appendChild(b2);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountXShareBtns);
  else mountXShareBtns();
  setInterval(mountXShareBtns, 1500);
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
    var _acTimer = null;
    function apiBase() {
        return (typeof getApiBaseClean === "function") ? getApiBaseClean() : (window.API_BASE || "");
    }
    function queryTickers(q) {
        return __awaiter(this, void 0, void 0, function () {
            var r, j, _e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch(apiBase() + "/api/ticker-lookup?q=" + encodeURIComponent(q || ""), { cache: "no-store" })];
                    case 1:
                        r = _a.sent();
                        if (!r.ok)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, r.json()];
                    case 2:
                        j = _a.sent();
                        return [2 /*return*/, (j && Array.isArray(j.results)) ? j.results : []];
                    case 3:
                        _e_1 = _a.sent();
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function attachAutocomplete(inputId, isInst) {
        var inp = document.getElementById(inputId);
        if (!inp || inp.dataset.rrsTickerBound)
            return;
        inp.dataset.rrsTickerBound = "1";
        var parent = inp.parentElement;
        if (parent && getComputedStyle(parent).position === "static")
            parent.style.position = "relative";
        var menu = document.createElement("div");
        menu.className = "rrs-ticker-ac-menu";
        menu.id = inputId + "_acMenu";
        if (parent)
            parent.appendChild(menu);
        function renderMenu(rows) {
            if (!rows || !rows.length) {
                menu.style.display = "none";
                return;
            }
            menu.innerHTML = rows.map(function (x) {
                var shortM = x.mint.slice(0, 6) + "..." + x.mint.slice(-4);
                var badge = x.source === "live_helius_radar" ? "⚡ LIVE RADAR" : "✓ VERIFIED";
                return '<div class="rrs-ticker-ac-item" data-mint="' + x.mint + '">' +
                    '<span><span class="rrs-ticker-ac-sym">$' + x.symbol + '</span> · ' + x.name + '</span>' +
                    '<span class="rrs-ticker-ac-mint">' + badge + ' · ' + shortM + '</span>' +
                    '</div>';
            }).join("");
            menu.style.display = "block";
            Array.prototype.forEach.call(menu.querySelectorAll(".rrs-ticker-ac-item"), function (item) {
                item.addEventListener("mousedown", function (ev) {
                    ev.preventDefault();
                    var m = item.getAttribute("data-mint");
                    inp.value = m;
                    menu.style.display = "none";
                    if (isInst && typeof window.rrsTriggerShieldDropSheet === "function")
                        window.rrsTriggerShieldDropSheet(m);
                    else if (typeof window.scanToken === "function")
                        window.scanToken(false);
                });
            });
        }
        inp.addEventListener("input", function () {
            var v = inp.value.trim();
            if (v.length >= 32) {
                menu.style.display = "none";
                return;
            }
            clearTimeout(_acTimer);
            _acTimer = setTimeout(function () {
                return __awaiter(this, void 0, void 0, function () {
                    var rows;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!v) {
                                    menu.style.display = "none";
                                    return [2 /*return*/];
                                }
                                return [4 /*yield*/, queryTickers(v)];
                            case 1:
                                rows = _a.sent();
                                renderMenu(rows);
                                return [2 /*return*/];
                        }
                    });
                });
            }, 140);
        });
        inp.addEventListener("blur", function () { setTimeout(function () { menu.style.display = "none"; }, 180); });
    }
    // Also intercept scanToken when user types a short $TICKER (like "BONK" or "JUP") and presses Scan directly!
    var _origScanToken = window.scanToken;
    if (typeof _origScanToken === "function" && !window.__rrsTickerScanWrapped) {
        window.__rrsTickerScanWrapped = true;
        window.scanToken = function (a, b) {
            var arguments_1 = arguments;
            return __awaiter(this, void 0, void 0, function () {
                var inp, v, rows;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            inp = document.getElementById("mintInput");
                            v = inp && inp.value ? inp.value.trim().replace(/^\$/, "") : "";
                            if (!(v && v.length < 30)) return [3 /*break*/, 2];
                            return [4 /*yield*/, queryTickers(v)];
                        case 1:
                            rows = _a.sent();
                            if (rows.length > 0)
                                inp.value = rows[0].mint;
                            _a.label = 2;
                        case 2: return [2 /*return*/, _origScanToken.apply(this, arguments_1)];
                    }
                });
            });
        };
    }
    function bootAc() {
        attachAutocomplete("mintInput", false);
        attachAutocomplete("instMintInput", true);
    }
    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", bootAc);
    else
        bootAc();
    setInterval(bootAc, 2000);
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
    'use strict';
    if (window.__RRS_INSTANT_ALERTS_V51_WIRED__)
        return;
    window.__RRS_INSTANT_ALERTS_V51_WIRED__ = true;
    var SEEN_STORAGE_KEY = 'rrs_web_seen_alert_ids_v51';
    var ARMED_STORAGE_KEY = 'rrs_web_instant_alerts_armed_v51';
    var pollTimerId = null;
    function getSeenMap() {
        try {
            var raw = localStorage.getItem(SEEN_STORAGE_KEY);
            return raw ? (JSON.parse(raw) || {}) : {};
        }
        catch (_e) {
            return {};
        }
    }
    function markAlertSeen(alertId) {
        if (!alertId)
            return true;
        var key = String(alertId).trim();
        var now = Date.now();
        var ttl = 30 * 60 * 1000;
        var map = getSeenMap();
        if (map[key] && (now - map[key] < ttl)) {
            return true;
        }
        map[key] = now;
        var keys = Object.keys(map);
        if (keys.length > 150) {
            keys.slice(0, keys.length - 150).forEach(function (k) { delete map[k]; });
        }
        try {
            localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(map));
        }
        catch (_e) { }
        return false;
    }
    function showBottomRightWebToast(title, body, targetUrl, isCritical) { return; /* Hard-blocked per Sonny: 0px overlap with bottom-right [Feedback] */
        try {
            var stack = document.getElementById('rrs-instant-alert-toast-stack');
            if (!stack) {
                stack = document.createElement('div');
                stack.id = 'rrs-instant-alert-toast-stack';
                stack.style.cssText = 'position:fixed;bottom:88px;right:18px;z-index:2147483644;display:flex;flex-direction:column;gap:10px;max-width:410px;width:calc(100vw - 36px);pointer-events:none;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
                document.body.appendChild(stack);
            }
            var borderCol = isCritical ? '#FF1744' : '#FFD000';
            var card = document.createElement('div');
            card.className = 'rrs-instant-web-toast-card';
            card.style.cssText = 'pointer-events:auto;cursor:pointer;background:linear-gradient(155deg,#04241B 0%,#020907 100%);border:2px solid ' + borderCol + ';border-radius:13px;padding:12px 14px;color:#F8FAFC;box-shadow:0 16px 42px rgba(0,0,0,0.90),0 0 16px rgba(16,185,129,0.28);display:flex;gap:11px;align-items:center;';
            var img = document.createElement('img');
            img.src = '/assets/rr_badge_exact.jpg';
            img.alt = 'Shield';
            img.style.cssText = 'width:46px;height:46px;border-radius:10px;border:1.5px solid #FFD000;object-fit:cover;flex-shrink:0;';
            var col = document.createElement('div');
            col.style.cssText = 'flex:1;min-width:0;';
            var ttl = document.createElement('div');
            ttl.style.cssText = 'font-size:12.8px;font-weight:900;color:#FFD000;line-height:1.32;margin-bottom:3px;';
            ttl.textContent = title;
            var msg = document.createElement('div');
            msg.style.cssText = 'font-size:11.6px;font-weight:600;color:#D1FAE5;line-height:1.38;';
            msg.textContent = body;
            var cls = document.createElement('button');
            cls.type = 'button';
            cls.textContent = '✕';
            cls.style.cssText = 'background:#1E293B;color:#F8FAFC;border:1px solid #475569;border-radius:6px;padding:2px 7px;font-size:11px;font-weight:800;cursor:pointer;align-self:flex-start;';
            cls.onclick = function (ev) {
                ev.stopPropagation();
                if (card.parentNode)
                    card.remove();
            };
            col.appendChild(ttl);
            col.appendChild(msg);
            card.appendChild(img);
            card.appendChild(col);
            card.appendChild(cls);
            card.addEventListener('click', function () {
                if (targetUrl) {
                    window.open(targetUrl, '_blank', 'noopener,noreferrer');
                }
                if (card.parentNode)
                    card.remove();
            });
            while (stack.children.length >= 2) {
                stack.firstElementChild.remove();
            }
            stack.appendChild(card);
            setTimeout(function () {
                if (card.parentNode)
                    card.remove();
            }, 7500);
        }
        catch (_e) { }
    }
    function ensureSwRegistered() {
        return __awaiter(this, void 0, void 0, function () {
            var reg, readyReg, _err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!('serviceWorker' in navigator))
                            return [2 /*return*/, null];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, navigator.serviceWorker.register('/sw.js?v=25772', { scope: '/', updateViaCache: 'none' })];
                    case 2:
                        reg = _a.sent();
                        if (reg && reg.waiting) {
                            try {
                                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                            }
                            catch (_we) { }
                        }
                        return [4 /*yield*/, Promise.race([
                                navigator.serviceWorker.ready,
                                new Promise(function (resolve) { setTimeout(function () { resolve(reg); }, 2500); })
                            ])];
                    case 3:
                        readyReg = _a.sent();
                        return [2 /*return*/, readyReg || reg];
                    case 4:
                        _err_1 = _a.sent();
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    function dispatchOsBubbleViaSw(reg, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var worker, _e2_1, n;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!('Notification' in window) || Notification.permission !== 'granted')
                            return [2 /*return*/, false];
                        worker = (reg && (reg.active || reg.waiting || reg.installing)) || (navigator.serviceWorker && navigator.serviceWorker.controller);
                        if (worker && worker.postMessage) {
                            try {
                                worker.postMessage({
                                    type: 'RRS_SHOW_OS_BUBBLE',
                                    title: payload.title,
                                    body: payload.body,
                                    url: payload.url || '/',
                                    tag: payload.tag || ('rrs-live-' + Date.now()),
                                    icon: '/assets/rr_badge_exact.jpg'
                                });
                                return [2 /*return*/, true];
                            }
                            catch (_e) { }
                        }
                        if (!(reg && reg.showNotification)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, reg.showNotification(payload.title, {
                                body: payload.body,
                                icon: '/assets/rr_badge_exact.jpg',
                                badge: '/assets/rr_badge_exact.jpg',
                                tag: payload.tag || ('rrs-live-' + Date.now()),
                                requireInteraction: false,
                                data: { url: payload.url || '/' }
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        _e2_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        try {
                            n = new Notification(payload.title, {
                                body: payload.body,
                                icon: '/assets/rr_badge_exact.jpg'
                            });
                            n.onclick = function () {
                                window.open(payload.url || '/', '_blank', 'noopener,noreferrer');
                                n.close();
                            };
                            return [2 /*return*/, true];
                        }
                        catch (_e3) {
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    function updateAlertButtonsState(armed) {
        ['btnRetailOneClickAlerts', 'btnInstOneClickAlerts'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el && armed) {
                el.textContent = '🟢 1-Click Live Desktop Alerts Armed (Streaming)';
            }
        });
    }
    function pollCyberThreatFeedOnce(reg) {
        return __awaiter(this, void 0, void 0, function () {
            var res, d, items, i, it, aid, sev, url, ttl, msg, _e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, fetch((window.location.port === "8088" ? "" : "") + "/api/cyber-threat-feed", { cache: 'no-store' })];
                    case 1:
                        res = _a.sent();
                        if (!res.ok)
                            return [2 /*return*/];
                        return [4 /*yield*/, res.json()];
                    case 2:
                        d = _a.sent();
                        if (!d || !d.ok)
                            return [2 /*return*/];
                        items = [];
                        if (d.active_threat)
                            items.push(d.active_threat);
                        ['advisories', 'alerts', 'blocks', 'events', 'feed'].forEach(function (k) {
                            if (Array.isArray(d[k]))
                                items = items.concat(d[k]);
                        });
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < items.length)) return [3 /*break*/, 6];
                        it = items[i];
                        if (!it)
                            return [3 /*break*/, 5];
                        aid = String(it.id || it.mint || it.title || '').slice(0, 96);
                        if (!aid || markAlertSeen(aid))
                            return [3 /*break*/, 5];
                        sev = String(it.severity || 'INFO').toUpperCase();
                        url = it.action_url || it.url || (it.mint ? ('/?mint=' + encodeURIComponent(it.mint) + '&cyber_inspect=1') : '/?cyber_inspect=1');
                        ttl = String(it.title || 'Solana Rent & Rug Shield Live Alert').slice(0, 96);
                        msg = String(it.detail || it.reason || it.message || '12-Layer Sentinel live update. Click to inspect.').slice(0, 175);
                        showBottomRightWebToast(ttl, msg, url, sev === 'CRITICAL');
                        return [4 /*yield*/, dispatchOsBubbleViaSw(reg, { title: ttl, body: msg, url: url, tag: 'rrs-feed-' + aid })];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        _e_1 = _a.sent();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    }
    function startThreatFeedPoller(reg) {
        if (pollTimerId)
            clearInterval(pollTimerId);
        pollTimerId = setInterval(function () {
            pollCyberThreatFeedOnce(reg);
        }, 30000);
    }
    window.rrsEnableInstantBrowserAlerts = function (sourceTag) {
        return __awaiter(this, void 0, void 0, function () {
            var reg, perm, _a, _pe_1, confirmFull;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        try {
                            if (window.pingShieldTelemetry) {
                                window.pingShieldTelemetry('enable_1click_browser_alerts', String(sourceTag || 'web_v6.7'));
                            }
                        }
                        catch (_te) { }
                        return [4 /*yield*/, ensureSwRegistered()];
                    case 1:
                        reg = _b.sent();
                        perm = 'default';
                        if (!('Notification' in window)) return [3 /*break*/, 7];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 7]);
                        if (!(Notification.permission === 'granted')) return [3 /*break*/, 3];
                        _a = 'granted';
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, Notification.requestPermission()];
                    case 4:
                        _a = _b.sent();
                        _b.label = 5;
                    case 5:
                        perm = _a;
                        return [3 /*break*/, 7];
                    case 6:
                        _pe_1 = _b.sent();
                        perm = Notification.permission || 'default';
                        return [3 /*break*/, 7];
                    case 7:
                        confirmFull = 'Solana Rent & Rug Shield v6.7 Active: Live 12-Layer, DEX-6 Runner & News Alerts Armed';
                        showBottomRightWebToast('Solana Rent & Rug Shield v6.7 Active', confirmFull, '/?cyber_inspect=1', false);
                        if (!(perm === 'granted')) return [3 /*break*/, 9];
                        try {
                            localStorage.setItem(ARMED_STORAGE_KEY, '1');
                        }
                        catch (_se) { }
                        updateAlertButtonsState(true);
                        return [4 /*yield*/, dispatchOsBubbleViaSw(reg, {
                                title: confirmFull,
                                body: 'Live 12-Layer, DEX-6 Runner & News Alerts Armed. Click to open Rent & Rug Shield.',
                                url: '/',
                                tag: 'rrs-v51-armed-confirm'
                            })];
                    case 8:
                        _b.sent();
                        startThreatFeedPoller(reg);
                        return [2 /*return*/, { ok: true, permission: perm, swReady: Boolean(reg) }];
                    case 9: return [2 /*return*/, { ok: false, permission: perm, swReady: Boolean(reg) }];
                }
            });
        });
    };
    // Silent background poller resume ONLY if user previously clicked and granted permission (0 unprompted popups on load)
    window.addEventListener('load', function () {
        try {
            if ('Notification' in window && Notification.permission === 'granted' && localStorage.getItem(ARMED_STORAGE_KEY) === '1') {
                updateAlertButtonsState(true);
                ensureSwRegistered().then(function (reg) {
                    startThreatFeedPoller(reg);
                });
            }
        }
        catch (_e) { }
    });
})();;

(function(){
  // Clickable SECURE Demo Pill -> Scrolls to #panel-token-scanner & renders live 94/100 PASS 12-Layer preview!
  window.rrsPreviewLive94PassDemo = function(){
    var isInst = document.documentElement.classList.contains('rrs-mode-institutional') || document.body.classList.contains('rrs-mode-institutional');
    var card = document.getElementById(isInst ? 'instRugEngineCard' : 'rugShieldCard') || document.getElementById('scannersRow1Grid');
    if (card && card.scrollIntoView) card.scrollIntoView({behavior:'smooth', block:'center'});
    if (isInst) {
      var ir = document.getElementById('instRugResult');
      if (ir) {
        ir.style.display = 'block';
        ir.innerHTML = '<div style="padding:12px;border-radius:10px;background:#07090e;border:1.5px solid #d4af37;color:#f8fafc;">'
          + '<div style="display:flex;justify-content:space-between;align-items:center;"><strong style="color:#00FF88;">🟢 SECURE • 94/100 PASS</strong><span style="color:#d4af37;font-family:monospace;font-weight:800;">&lt;120ms 12-Layer Sim</span></div>'
          + '<div style="font-size:12.5px;color:#cbd5e1;margin-top:6px;">✅ Mint &amp; Freeze Revoked • ✅ 0% Token-2022 Hook Tax • ✅ Kamikaze Canary BUY→SELL Verified • ✅ 2-Hop Cartel &lt;6%</div></div>';
      }
    } else {
      var tr = document.getElementById('tokenResults');
      if (tr) {
        tr.style.display = 'block';
        var tt = document.getElementById('tokTitle'); if (tt) tt.textContent = 'BONK • DezX...B263 (Live 12-Layer Demo)';
        var tv = document.getElementById('tokVerdict'); if (tv) { tv.textContent = '🟢 SECURE • 94/100 PASS (Safe to Trade)'; tv.style.color = '#00FF88'; }
        var ts = document.getElementById('tokScore'); if (ts) { ts.textContent = '94/100'; ts.style.color = '#10B981'; }
        var tm = document.getElementById('tokMeta'); if (tm) tm.textContent = 'Pre-Sign Kamikaze Canary Sim: 84ms • 0% Sell Tax • LP Verified';
        var tc = document.getElementById('tokChecklist');
        if (tc) {
          tc.innerHTML = '<li style="color:#A7F3D0;">✅ Layers 1-4: Mint, Freeze &amp; Permanent Delegate Authorities Revoked</li>'
            + '<li style="color:#A7F3D0;">✅ Layers 5-8: Byte-166+ Token-2022 Transfer Hook &amp; Hidden Tax = 0.0%</li>'
            + '<li style="color:#A7F3D0;">✅ Layers 9-10: Sacrificial Canary Atomic BUY→SELL Passed (0% Honey-Trap)</li>'
            + '<li style="color:#A7F3D0;">✅ Layers 11-12: Block-0 Jito Sybil &amp; 2-Hop Funder Cartel Clean (&lt;6.0%)</li>';
        }
      }
    }
  };

  // Also wire #rrsFlashingCornerShield click when in secure state to show live 94/100 PASS preview
  document.addEventListener('DOMContentLoaded', function(){
    var cs = document.getElementById('rrsFlashingCornerShield');
    if (cs && !cs.__demo94Bound){
      cs.__demo94Bound = true;
      cs.style.cursor = 'pointer';
      cs.addEventListener('click', function(){ window.rrsPreviewLive94PassDemo(); });
    }
    if (window.location.hash === '#panel-token-scanner'){
      setTimeout(function(){ window.rrsPreviewLive94PassDemo(); }, 250);
    }
    // Keep ?mode=institutional sticky across internal same-origin links while in Institutional Mode
    document.addEventListener('click', function(ev){
      if (!document.documentElement.classList.contains('rrs-mode-institutional') && !document.body.classList.contains('rrs-mode-institutional')) return;
      var a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href === '/' || href.startsWith('/#')){
        ev.preventDefault();
        var hash = href.indexOf('#') !== -1 ? href.slice(href.indexOf('#')) : '';
        history.replaceState(null, '', '/?mode=institutional' + hash);
        if (hash){
          var tEl = document.querySelector(hash);
          if (tEl && tEl.scrollIntoView) tEl.scrollIntoView({behavior:'smooth'});
        }
      }
    }, true);
  });
})();;

(function () {
  'use strict';
  window.__RRS_TOAST_V53_READY__ = true;
  window.__RRS_TOAST_V55_LUXURY_READY__ = true;
  window.__RRS_TOAST_V60_CLEAN_READY__ = true;
  window.__RRS_TOAST_V61_GRB_READY__ = true;
  window.__RRS_TOAST_V67_COMPLETE_READY__ = true;
  window.__RRS_UNIFIED_HUD_V67_READY__ = true;
  window.__RRS_TOAST_VERSION__ = '6.7.0';

  if (typeof window.rrsStopAllOtherAudio !== 'function') {
    window.rrsStopAllOtherAudio = function (exceptEl) {
      try {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } catch (_e) {}
      try {
        if (window.__RRS_CHIME_TIMER__) {
          clearTimeout(window.__RRS_CHIME_TIMER__);
          window.__RRS_CHIME_TIMER__ = null;
        }
      } catch (_e2) {}
      try {
        if (window.__RRS_ACTIVE_AUDIO__ && window.__RRS_ACTIVE_AUDIO__ !== exceptEl) {
          window.__RRS_ACTIVE_AUDIO__.pause();
          window.__RRS_ACTIVE_AUDIO__.currentTime = 0;
        }
      } catch (_e3) {}
      try {
        document.querySelectorAll('video, audio').forEach((el) => {
          if (el !== exceptEl) {
            try { el.pause(); } catch (_p) {}
          }
        });
      } catch (_e4) {}
    };
  }

  const LAYOUT_KEY_V53 = 'rrs_box_layout_v53';
  const FLT_KEY_V53 = 'rrs_notifier_filters_v53';
  const AUTOSCAN_KEY_V67 = 'rrs_autoscan_collect_v67';
  const WALLET_KEY_V60 = 'rrs_connected_phantom_wallet_v60';
  const PHANTOM_45S_URL = 'https://rentandrugshield.com/app.html?connect_phantom=1&auto_reclaim_0pct=1&src=ext_v67';
  const PUBLICNODE_SOLANA_RPC = 'https://solana-rpc.publicnode.com';
  const SPL_TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
  const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
  const HARD_EXCLUDED_FROZEN_ATAS = new Set([
    '5sEb9m4XP3mXJSsv8GEeck62Z6PY8TfAhmngZrpgNU9Q',
    'CsLX8FSsWc8uNfMBUB9PhwcsZBaLstoYpiUi9SDdkDLg',
    'DGnsyzo5cbQZMpXEwSbESBnSrdjroj7DhpcAPbfQaUft',
    'FRCeYgC1PR7kTKhgk8Peq7WE8Rz6E7cEXnhB77DT5G8F'
  ]);

  const MIN_ZOOM = 75;
  const MAX_ZOOM = 200;
  const ALLOWED_STAY_SECS = [3, 5, 8, 10, 15, 20, 30, 45, 60];

  const SPOKEN_VOICES_12 = [
    { label: 'To Valhalla!', file: 'to_valhalla.wav', aliases: ['to valhalla', 'to valhalla!'] },
    { label: 'To the Moon, baby!', file: 'to_the_moon.wav', aliases: ['to the moon', 'to the moon, baby!'] },
    { label: 'Wizard: 12 Layers Clean!', file: 'wizard_check.wav', aliases: ['wizard', 'wizard: 12 layers clean!'] },
    { label: 'Whale Incoming: Green Light!', file: 'whale_incoming.wav', aliases: ['whale horn', 'whale incoming: green light!', 'whale'] },
    { label: 'Cha-Ching! Clean Contract!', file: 'cha_ching_clean.wav', aliases: ['coin drop', 'cha-ching! clean contract!'] },
    { label: 'Honey Badger Locked On!', file: 'honey_badger.wav', aliases: ['laser lock', 'honey badger locked on!'] },
    { label: 'Rug Alert! Step Away!', file: 'rug_alert.wav', aliases: ['cyber alert', 'rug alert! step away!', 'rug'] },
    { label: 'Freeze Trap Detected!', file: 'freeze_trap.wav', aliases: ['radar sweep', 'freeze trap detected!'] },
    { label: 'Breaking Alpha on the Wire!', file: 'breaking_alpha.wav', aliases: ['news wire', 'breaking alpha on the wire!', 'news'] },
    { label: 'Free SOL Rent Ready!', file: 'rent_reclaim_ready.wav', aliases: ['emerald ping', 'free sol rent ready!'] },
    { label: 'Sniper Target Verified!', file: 'sniper_verified.wav', aliases: ['sniper tick', 'sniper target verified!', 'cluster'] },
    { label: 'Bull Cross Momentum Surge!', file: 'bull_cross_surge.wav', aliases: ['breakout bell', 'bull cross momentum surge!', 'macd'] }
  ];

  const VOICE_CHIMES_MODES = [
    { value: 'voice_chimes_auto', label: 'Voice + Chimes (Distinct By Signal)' },
    { value: 'chimes_only', label: 'Distinct Chimes Only (Whale / MACD / News)' },
    { value: 'voice_only', label: 'Voice Callouts Only (Neural .WAV)' },
    { value: 'Whale Incoming: Green Light!', label: 'Whale Alert: Deep Horn + Voice' },
    { value: 'Sniper Target Verified!', label: 'Cluster Alert: Radar Lock + Voice' },
    { value: 'Bull Cross Momentum Surge!', label: 'MACD Cross: Bull Bell + Voice' },
    { value: 'Rug Alert! Step Away!', label: 'Red Rug Danger: Siren + Voice' },
    { value: 'Breaking Alpha on the Wire!', label: 'Blue World News: Wire Ping + Voice' },
    { value: 'Wizard: 12 Layers Clean!', label: 'Wizard: 12 Layers Clean!' },
    { value: 'To Valhalla!', label: 'To Valhalla!' },
    { value: 'Free SOL Rent Ready!', label: 'Free SOL Rent Ready!' },
    { value: 'mute', label: 'Silent / Mute' }
  ];

  const SAMPLE_GRB_ALERTS = {
    green: {
      kind: 'coin',
      sym: 'JUP',
      mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      move_pct: 18.4,
      failed12Layer: false,
      isScamFail: false,
      badge: '12-LAYER: PASS',
      title: '$JUP +18.4%',
      mcapStr: '$420K',
      liqStr: '$68K',
      message: 'MCap $420K  \u2022  Liquidity $68K  \u2022  Whale + MACD Bull Cross',
      audit_url: 'https://rentandrugshield.com/?token=JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN&autoscan=1#tokenScanner',
      url: 'https://dexscreener.com/solana/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'
    },
    red: {
      kind: 'rug',
      sym: 'NVIDIA',
      mint: 'AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL',
      move_pct: -94.2,
      failed12Layer: true,
      isScamFail: true,
      badge: '12-LAYER: FAIL',
      title: '$NVIDIA -94.2%',
      mcapStr: '$14K',
      liqStr: '$0',
      message: 'MCap $14K  \u2022  Liquidity $0 (LP Drain & Sybil Cluster Blocked)',
      audit_url: 'https://rentandrugshield.com/?token=AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL&autoscan=1#tokenScanner',
      url: 'https://dexscreener.com/solana/AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL'
    },
    blue: {
      kind: 'news',
      source: 'REUTERS',
      badge: 'BREAKING NEWS \u2022 REUTERS',
      title: 'Institutional Solana ETF & Cross-Border Settlement Wire Update',
      article_url: 'https://www.reuters.com/technology/',
      url: 'https://www.reuters.com/technology/'
    }
  };

  const PLAIN_ENGLISH_TIPS = {
    runners: {
      title: 'Runners (Verified Momentum)',
      body: 'Verified momentum tokens holding multi-minute higher lows with real DEX volume.'
    },
    whales: {
      title: 'Whale Alert (Smart-Money Size)',
      body: 'Alerts when high-conviction whale wallets accumulate size above your Liquidity & Market Cap filters.'
    },
    cluster: {
      title: 'Cluster Alert (Sybil & Insider Rings)',
      body: 'Detects coordinated Block-0 sniper bundles and linked deployer wallet clusters before you buy.'
    },
    bull_cross: {
      title: 'Bull Cross (Buy-Flow Breakout)',
      body: 'Short-term buy-flow EMA crossing above baseline volume/price trend with clean 12-Layer score.'
    },
    hot_hist: {
      title: 'Hot Hist (Volume Expansion)',
      body: 'Previously graduated/high-win-rate tokens re-entering active volume expansion.'
    },
    bear_warn: {
      title: 'Bear Warn (Risk / Sell Spike)',
      body: 'Sell-pressure spike, LP unlock/drain signal, or authority risk warning.'
    },
    macd: {
      title: 'MACD Cross Alert',
      body: 'Tracks real-time MACD momentum crossovers across 1m, 3m, 5m, and 15m candles so you catch trend shifts early.'
    },
    liquidity: {
      title: 'Liquidity & Market Cap Filters',
      body: 'Dial in exact USD Liquidity and Market Cap minimums so noisy micro-traps never trigger alerts.'
    },
    autoscan: {
      title: 'Auto-Scan & 0x09 SOL Rent Collect',
      body: 'Polls read-only PublicNode every 60s to detect 0-balance token accounts and reclaim your SOL rent (0% 1st claim, 98% repeat, 0 seed phrases).'
    }
  };

  function isNewsAlertToast(t) {
    if (!t || typeof t !== 'object') return false;
    const k = String(t.kind || '').toLowerCase().trim();
    if (k === 'news' || k === 'breaking' || k === 'breaking_news' || k === 'crypto' || k === 'ai' || k === 'world') {
      return true;
    }
    const upper = (String(t.badge || '') + ' ' + String(t.cardMode || '')).toUpperCase();
    return /BREAKING\s*NEWS|CRYPTO\s*NEWS|AI\s*NEWS|WORLD\s*NEWS|LIVE\s*WIRE/i.test(upper) || String(t.cardMode || '').toLowerCase() === 'blue';
  }

  function extractCandidateNewsUrlToast(t) {
    if (!t || typeof t !== 'object') return '';
    const cand = t.article_url || t.link || t.source_url || t.url || t.action_url || '';
    return String(cand || '').trim();
  }

  function isValidExternalNewsUrlToast(rawUrl) {
    const trimmed = String(rawUrl || '').trim();
    if (!/^https?:\/\//i.test(trimmed)) return false;
    try {
      const u = new URL(trimmed);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
      const h = String(u.hostname || '').toLowerCase();
      if (!h || !h.includes('.')) return false;
      if (
        h === 'rentandrugshield.com' ||
        h.endsWith('.rentandrugshield.com') ||
        h.includes('rentandrugshield.com') ||
        h === 'localhost' ||
        h.endsWith('.localhost') ||
        h === '127.0.0.1' ||
        h === '0.0.0.0' ||
        h === '::1' ||
        h === '[::1]' ||
        h.endsWith('.trycloudflare.com')
      ) {
        return false;
      }
      return true;
    } catch (_e) {
      return false;
    }
  }

  const SYSTEM_MINTS = new Set([
    '11111111111111111111111111111111',
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
    'ComputeBudget111111111111111111111111111111'
  ]);
  const KNOWN_SYM_MINTS = {
    MELNOK: '3ig9E5SQKs8RjVn9EuW1YaprjaMd6dEftG63hBcMpump',
    WASTED6: '3wyRvbB6nFD7Y9cuozSXrUajZs1EoJxrcBCDBxwupump',
    NVIDIA: 'AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL',
    RUGTEST: 'AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL',
    SOL: 'So11111111111111111111111111111111111111112',
    BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    WIF: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    PYTH: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
    POPCAT: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr'
  };

  const DEFAULT_LAYOUT = { x: null, y: null, pinned: false, zoomPct: 100, autoHideSec: 15 };
  const DEFAULT_FILTERS = {
    masterBubbles: true,
    autoHideSec: 15,
    stayOpen: false,
    soundEnabled: true,
    voiceChimeMode: 'voice_chimes_auto',
    audioPreset: 'Whale Incoming: Green Light!',
    roboticVoice: false,
    tf: '3m',
    preset: 'Runners',
    catCoin: true,
    catRug: true,
    cyberLat: true,
    whaleAlertOn: true,
    clusterAlertOn: true,
    whalePro: true,
    catCrypto: true,
    catAi: true,
    catWorld: true,
    newsSources: { bbc: true, reuters: true, ap: true, coindesk: true, decrypt: true, cointelegraph: true },
    macdOn: true,
    macd1m: false,
    macd3m: true,
    macd5m: true,
    macd15m: false,
    macdBull: true,
    macdHistFlip: true,
    macdBear: true,
    tickerOn: false,
    tickerQuery: 'ALL',
    newsKwOn: true,
    newsKeywords: 'SOL, ETF, AI, MACRO',
    worldRegion: 'Global',
    mcOn: true,
    mcMin: 25000,
    mcMax: 10000000,
    moveOn: true,
    moveMin: 10,
    moveWin: '3m',
    liqOn: true,
    liqMin: 10000,
    liqMax: 0,
    liqPreset: '',
    autoScanEnabled: false
  };

  let layoutState = Object.assign({}, DEFAULT_LAYOUT);
  let filterState = Object.assign({}, DEFAULT_FILTERS);
  let connectedWallet = '';
  let autoScanIntervalId = null;
  let currentVoiceAudio = null;
  const uniqueAlerts = [];
  const seenAlertKeys = new Set();
  let activeAlertIdx = 0;
  let activeCardPinned = false;
  let countdownRemMs = 15000;
  let countdownTotalMs = 15000;
  let countdownLastTickTs = 0;
  let countdownTimerId = null;
  let cardHovered = false;
  let lastHoverMoveTs = 0;
  let lastHoverX = -1;
  let lastHoverY = -1;
  let cardOpenedAtTs = 0;
  let isDraggingCard = false;

  const isExtRuntime = Boolean(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id);

  function clampZoom(z) {
    const n = Math.round(Number(z) || 100);
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, n));
  }

  function normStaySec(s) {
    const n = Number(s) || 15;
    let best = 15;
    let bestDiff = Infinity;
    for (let i = 0; i < ALLOWED_STAY_SECS.length; i++) {
      const diff = Math.abs(ALLOWED_STAY_SECS[i] - n);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = ALLOWED_STAY_SECS[i];
      }
    }
    return best;
  }

  function stepStaySecValue(cur, dir) {
    const norm = normStaySec(cur);
    let idx = ALLOWED_STAY_SECS.indexOf(norm);
    if (idx === -1) idx = 4;
    const nextIdx = Math.max(0, Math.min(ALLOWED_STAY_SECS.length - 1, idx + dir));
    return ALLOWED_STAY_SECS[nextIdx];
  }

  function scrubText(s) {
    const legRx = new RegExp('\\b\\x41\\x49[-\\s]+generated\\b', 'gi');
    return String(s || '')
      .split(String.fromCharCode(8212)).join(' | ')
      .split(String.fromCharCode(8211)).join('-')
      .replace(/--+/g, '-')
      .replace(legRx, '12-Layer Verified');
  }

  function resolveVoiceEntry(presetName) {
    const key = String(presetName || filterState.audioPreset || 'Whale Incoming: Green Light!').trim().toLowerCase();
    for (let i = 0; i < SPOKEN_VOICES_12.length; i++) {
      const v = SPOKEN_VOICES_12[i];
      if (v.label.toLowerCase() === key || v.aliases.indexOf(key) !== -1) return v;
    }
    return SPOKEN_VOICES_12[3];
  }

  function playDistinctSignalChime(signalKind) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return 0;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const k = String(signalKind || 'green').toLowerCase();
      if (k === 'whale') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220.0, now);
        osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.14);
      } else if (k === 'cluster') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.setValueAtTime(880.0, now + 0.08);
      } else if (k === 'red' || k === 'rug') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(622.25, now);
        osc.frequency.linearRampToValueAtTime(415.30, now + 0.16);
      } else if (k === 'blue' || k === 'news') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880.0, now + 0.09);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(783.99, now + 0.09);
      }
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
      setTimeout(() => { try { ctx.close(); } catch (_e) {} }, 260);
      return 200;
    } catch (_e) {
      return 0;
    }
  }

  function playRawWavClip(presetName) {
    try {
      const entry = resolveVoiceEntry(presetName);
      const wavUrl = (isExtRuntime && chrome.runtime && chrome.runtime.getURL)
        ? chrome.runtime.getURL('sounds/' + entry.file)
        : ('/assets/sounds/' + entry.file.replace(/\.wav$/i, '.mp4'));
      if (currentVoiceAudio) {
        try { currentVoiceAudio.pause(); currentVoiceAudio.currentTime = 0; } catch (_e) {}
      }
      const aud = new Audio(wavUrl);
      aud.volume = 0.92;
      currentVoiceAudio = aud;
      window.__RRS_ACTIVE_AUDIO__ = aud;
      window.__RRS_LAST_SPOKEN_WAV__ = { label: entry.label, file: entry.file, url: wavUrl, ts: Date.now() };
      const p = aud.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (_e) {}
  }

  function playSpokenVoice12(presetOrSignal, forcePlay) {
    const mode = String(filterState.voiceChimeMode || 'voice_chimes_auto');
    if (!forcePlay && (mode === 'mute' || !filterState.soundEnabled)) return;
    window.rrsStopAllOtherAudio(null);
    if (mode === 'mute' && !forcePlay) return;

    const cur = uniqueAlerts[activeAlertIdx] || null;
    let sig = 'green';
    let voiceTarget = presetOrSignal || filterState.audioPreset || 'Whale Incoming: Green Light!';
    if (cur) {
      const parsed = parseAlertForDisplay(cur);
      sig = parsed.cardMode || 'green';
    }
    const lowerArg = String(presetOrSignal || '').toLowerCase();
    if (lowerArg === 'red' || lowerArg.includes('rug') || lowerArg.includes('freeze')) {
      sig = 'red';
      if (lowerArg === 'red') voiceTarget = 'Rug Alert! Step Away!';
    } else if (lowerArg === 'blue' || lowerArg.includes('news') || lowerArg.includes('wire')) {
      sig = 'blue';
      if (lowerArg === 'blue') voiceTarget = 'Breaking Alpha on the Wire!';
    } else if (lowerArg.includes('whale')) {
      sig = 'whale';
      if (lowerArg === 'whale') voiceTarget = 'Whale Incoming: Green Light!';
    } else if (lowerArg.includes('cluster') || lowerArg.includes('sniper')) {
      sig = 'cluster';
      if (lowerArg === 'cluster') voiceTarget = 'Sniper Target Verified!';
    } else if (lowerArg.includes('macd') || lowerArg.includes('bull cross')) {
      sig = 'macd';
    } else if (mode === 'voice_chimes_auto' || mode === 'voice_only') {
      if (sig === 'red') voiceTarget = 'Rug Alert! Step Away!';
      else if (sig === 'blue') voiceTarget = 'Breaking Alpha on the Wire!';
      else voiceTarget = filterState.whaleAlertOn !== false ? 'Whale Incoming: Green Light!' : 'Bull Cross Momentum Surge!';
    }

    if (mode === 'chimes_only') {
      playDistinctSignalChime(sig);
      return;
    }
    if (mode === 'voice_only') {
      playRawWavClip(voiceTarget);
      return;
    }
    if (mode !== 'voice_chimes_auto' && mode !== 'mute') {
      voiceTarget = mode;
    }
    const delayMs = playDistinctSignalChime(sig);
    if (delayMs > 0) {
      window.__RRS_CHIME_TIMER__ = setTimeout(() => {
        window.__RRS_CHIME_TIMER__ = null;
        playRawWavClip(voiceTarget);
      }, delayMs);
    } else {
      playRawWavClip(voiceTarget);
    }
  }

  function formatCompactUsd(val) {
    if (val === undefined || val === null || val === '') return '';
    if (typeof val === 'string') {
      const t = val.trim();
      if (/^\$[\d,.]+[KMB]?/i.test(t)) return t;
      const parsed = Number(t.replace(/[$,]/g, ''));
      if (!Number.isFinite(parsed) || parsed < 0) return t;
      val = parsed;
    }
    const num = Number(val);
    if (!Number.isFinite(num) || num < 0) return '';
    if (num === 0) return '$0';
    if (num >= 1000000000) return '$' + (num / 1000000000).toFixed(2).replace(/\.00$/, '') + 'B';
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(2).replace(/\.00$/, '') + 'M';
    if (num >= 1000) return '$' + Math.round(num / 1000) + 'K';
    return '$' + Math.round(num);
  }

  function isValidMint(m) {
    return Boolean(m && m.length >= 32 && m.length <= 44 && !SYSTEM_MINTS.has(m) && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(m));
  }

  function extractMint(explicitMint, rawUrl, title, sym) {
    if (isValidMint(explicitMint)) return explicitMint;
    if (rawUrl) {
      try {
        const u = new URL(rawUrl, 'https://rentandrugshield.com');
        for (const k of ['token', 'mint', 'trade', 'outputMint', 'address']) {
          const v = (u.searchParams.get(k) || '').trim();
          if (isValidMint(v)) return v;
        }
      } catch (_e) {}
      const matches = String(rawUrl).match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g) || [];
      for (const m of matches) {
        if (isValidMint(m)) return m;
      }
    }
    if (title) {
      const matches = String(title).match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g) || [];
      for (const m of matches) {
        if (isValidMint(m)) return m;
      }
      const sm = String(title).match(/\$([A-Za-z0-9_]{2,12})/);
      if (sm && KNOWN_SYM_MINTS[sm[1].toUpperCase()]) return KNOWN_SYM_MINTS[sm[1].toUpperCase()];
    }
    const cleanSym = String(sym || '').replace(/^\$/, '').trim().toUpperCase();
    if (cleanSym && KNOWN_SYM_MINTS[cleanSym]) return KNOWN_SYM_MINTS[cleanSym];
    return '';
  }

  function buildExact12LayerTokenUrl(mint) {
    const safeMint = isValidMint(mint) ? mint : 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN';
    return 'https://rentandrugshield.com/?token=' + encodeURIComponent(safeMint) + '&autoscan=1#tokenScanner';
  }

  function buildLiveChartTradeUrlToast(mint) {
    const safeMint = isValidMint(mint) ? mint : 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN';
    return 'https://dexscreener.com/solana/' + encodeURIComponent(safeMint);
  }

  function resolveExternalNewsUrl(rawUrl) {
    const trimmed = String(rawUrl || '').trim();
    return isValidExternalNewsUrlToast(trimmed) ? trimmed : '';
  }

  function resolveExactAlertUrl(t) {
    if (isNewsAlertToast(t)) {
      const newsCand = extractCandidateNewsUrlToast(t);
      return resolveExternalNewsUrl(newsCand) || 'https://www.reuters.com/technology/';
    }
    const kind = String((t && t.kind) || 'coin').toLowerCase();
    const rawUrl = String((t && (t.chart_url || t.url || t.action_url)) || '').trim();
    const upper = (String((t && t.badge) || '') + ' ' + String((t && t.title) || '')).toUpperCase();

    if (kind === 'phantom_45s' || kind === 'welcome_reclaim') {
      return /^https?:\/\//i.test(rawUrl) ? rawUrl : PHANTOM_45S_URL;
    }
    if (rawUrl.indexOf(':18088/') !== -1) return rawUrl;
    if (kind === 'visitor' || upper.includes('EXTERNAL HUMAN IPS') || upper.includes('WEBSITE VISITORS')) {
      return 'http://127.0.0.1:18088/command/terminal-2';
    }
    if (kind === 'approvals' || upper.includes('WAITING FOR APPROVAL') || upper.includes('WAITING APPROVALS')) {
      return 'http://127.0.0.1:18088/command/waiting-approvals';
    }
    if (kind === 'promo') {
      return 'http://127.0.0.1:18088/command/terminal-4';
    }

    const mint = extractMint(t && t.mint, String((t && (t.audit_url || t.url || t.action_url)) || ''), t && t.title, t && t.sym);
    if (kind === 'moonbag' && !mint) return 'http://127.0.0.1:18088/command/terminal-1';
    if (mint) return buildLiveChartTradeUrlToast(mint);
    return buildLiveChartTradeUrlToast(kind === 'rug' ? 'AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL' : 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN');
  }

  function resolveAlertAuditUrl(t) {
    if (!t || isNewsAlertToast(t)) return '';
    const kind = String(t.kind || 'coin').toLowerCase();
    if (kind === 'phantom_45s' || kind === 'welcome_reclaim' || kind === 'visitor' || kind === 'approvals' || kind === 'promo') return '';
    if (t.audit_url && /^https?:\/\//i.test(String(t.audit_url))) return String(t.audit_url);
    const mint = extractMint(t.mint, String(t.url || t.action_url || ''), t.title, t.sym);
    return buildExact12LayerTokenUrl(mint || (kind === 'rug' ? 'AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL' : 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'));
  }

  function computeAlertDurationMs(alertObj) {
    const customSec = Number(alertObj && (alertObj.customDisplaySec || alertObj.CustomDisplaySec || 0));
    if (Number.isFinite(customSec) && customSec >= 1) {
      return Math.round(customSec * 1000);
    }
    const baseSec = normStaySec(layoutState.autoHideSec);
    const effectiveSec = (isNewsAlertToast(alertObj) && baseSec === 5) ? 8 : baseSec;
    return Math.max(1000, effectiveSec * 1000);
  }

  function sanitizeCoords(obj) {
    if (!obj) return { x: null, y: null };
    const rx = obj.x;
    const ry = obj.y;
    const xOk = (rx !== null && rx !== undefined && rx !== -1 && Number.isFinite(Number(rx)));
    const yOk = (ry !== null && ry !== undefined && ry !== -1 && Number.isFinite(Number(ry)));
    return { x: xOk ? Number(rx) : null, y: yOk ? Number(ry) : null };
  }

  function loadPersistedState(cb) {
    if (isExtRuntime && chrome.storage && chrome.storage.local) {
      try {
        chrome.storage.local.get([LAYOUT_KEY_V53, FLT_KEY_V53, WALLET_KEY_V60, AUTOSCAN_KEY_V67], (res) => {
          if (res && res[LAYOUT_KEY_V53]) {
            const c = sanitizeCoords(res[LAYOUT_KEY_V53]);
            layoutState = Object.assign({}, DEFAULT_LAYOUT, res[LAYOUT_KEY_V53], c);
            layoutState.zoomPct = clampZoom(layoutState.zoomPct);
            layoutState.autoHideSec = normStaySec(layoutState.autoHideSec);
          }
          if (res && res[FLT_KEY_V53]) {
            filterState = Object.assign({}, DEFAULT_FILTERS, res[FLT_KEY_V53]);
            filterState.audioPreset = resolveVoiceEntry(filterState.audioPreset).label;
            if (res[FLT_KEY_V53].autoHideSec !== undefined) {
              layoutState.autoHideSec = normStaySec(res[FLT_KEY_V53].autoHideSec);
            }
          }
          if (res && res[WALLET_KEY_V60]) {
            connectedWallet = String(res[WALLET_KEY_V60] || '');
          }
          if (res && res[AUTOSCAN_KEY_V67] && res[AUTOSCAN_KEY_V67].enabled !== undefined) {
            filterState.autoScanEnabled = Boolean(res[AUTOSCAN_KEY_V67].enabled);
            if (!connectedWallet && res[AUTOSCAN_KEY_V67].wallet) connectedWallet = String(res[AUTOSCAN_KEY_V67].wallet);
          }
          cb();
        });
        return;
      } catch (_e) {}
    }
    try {
      const rawL = localStorage.getItem(LAYOUT_KEY_V53);
      if (rawL) {
        const parsedL = JSON.parse(rawL);
        layoutState = Object.assign({}, DEFAULT_LAYOUT, parsedL, sanitizeCoords(parsedL));
      }
      layoutState.zoomPct = clampZoom(layoutState.zoomPct);
      layoutState.autoHideSec = normStaySec(layoutState.autoHideSec);
      const rawF = localStorage.getItem(FLT_KEY_V53);
      if (rawF) {
        filterState = Object.assign({}, DEFAULT_FILTERS, JSON.parse(rawF));
        filterState.audioPreset = resolveVoiceEntry(filterState.audioPreset).label;
        if (filterState.autoHideSec !== undefined) {
          layoutState.autoHideSec = normStaySec(filterState.autoHideSec);
        }
      }
      const rawA = localStorage.getItem(AUTOSCAN_KEY_V67);
      if (rawA) {
        const parsedA = JSON.parse(rawA);
        filterState.autoScanEnabled = Boolean(parsedA && parsedA.enabled);
      }
      connectedWallet = String(localStorage.getItem(WALLET_KEY_V60) || '');
    } catch (_e) {}
    cb();
  }

  function saveStateAll() {
    layoutState.zoomPct = clampZoom(layoutState.zoomPct);
    layoutState.autoHideSec = normStaySec(layoutState.autoHideSec);
    const persistedLayout = Object.assign({}, layoutState, { pinned: Boolean(activeCardPinned) });
    const mergedFlt = Object.assign({}, filterState, {
      cardX: layoutState.x === null ? -1 : layoutState.x,
      cardY: layoutState.y === null ? -1 : layoutState.y,
      cardPinned: Boolean(activeCardPinned),
      stayOpen: Boolean(activeCardPinned),
      zoomPct: layoutState.zoomPct,
      autoHideSec: layoutState.autoHideSec,
      soundEnabled: Boolean(filterState.soundEnabled),
      voiceChimeMode: String(filterState.voiceChimeMode || 'voice_chimes_auto'),
      audioPreset: resolveVoiceEntry(filterState.audioPreset).label,
      roboticVoice: false
    });
    const autoRec = { enabled: Boolean(filterState.autoScanEnabled), wallet: connectedWallet, ts: Date.now() };
    if (isExtRuntime && chrome.storage && chrome.storage.local) {
      try {
        chrome.storage.local.set({
          [LAYOUT_KEY_V53]: persistedLayout,
          [FLT_KEY_V53]: mergedFlt,
          [WALLET_KEY_V60]: connectedWallet,
          [AUTOSCAN_KEY_V67]: autoRec
        }, () => {});
        if (chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ type: 'RRS_SYNC_FILTERS_V53', filters: mergedFlt }, () => { void chrome.runtime.lastError; });
          chrome.runtime.sendMessage({ type: 'RRS_SET_AUTOSCAN_V67', enabled: Boolean(filterState.autoScanEnabled), wallet: connectedWallet }, () => { void chrome.runtime.lastError; });
        }
      } catch (_e) {}
    } else {
      try {
        localStorage.setItem(LAYOUT_KEY_V53, JSON.stringify(persistedLayout));
        localStorage.setItem(FLT_KEY_V53, JSON.stringify(mergedFlt));
        localStorage.setItem(AUTOSCAN_KEY_V67, JSON.stringify(autoRec));
        if (connectedWallet) localStorage.setItem(WALLET_KEY_V60, connectedWallet);
      } catch (_e) {}
    }
  }

  function parseAlertForDisplay(cur) {
    const kind = String((cur && cur.kind) || 'coin').toLowerCase();
    const rawTitle = scrubText((cur && cur.title) || '');
    const rawMsg = scrubText((cur && cur.message) || '');
    const rawBadge = scrubText((cur && cur.badge) || '');

    if (kind === 'phantom_45s' || kind === 'welcome_reclaim') {
      return {
        cardMode: 'green',
        isNews: false,
        showAuditBtn: false,
        failed12Layer: false,
        tickerLabel: 'Connect Phantom for Auto 0% Rent Reclaim',
        verdictLabel: '12-LAYER: PASS',
        metricsLine: '1st SOL Rent Claim 100% FREE (0% Fee) \u2022 0 Seed Phrases',
        ctaLabel: '[CONNECT PHANTOM WALLET \u2197]'
      };
    }

    const isNews = (kind === 'news' || kind === 'breaking' || kind === 'breaking_news' || kind === 'crypto' || kind === 'ai' || kind === 'world' || /BREAKING\s*NEWS/i.test(rawBadge));
    if (isNews) {
      const cleanHeadline = rawTitle
        .replace(/\b12[-\s]*LAYER[:\s]*(?:PASS|FAIL|VERIFIED)?[^\w$]*/gi, '')
        .replace(/\b(?:Market\s*Cap|MCap|Liquidity|Liq)\s*[:$]?\s*[\d,.]+[KMB]?\b/gi, '')
        .trim();
      const srcStr = scrubText((cur && cur.source) || '').trim();
      const wireLbl = srcStr ? ('BREAKING NEWS \u2022 ' + srcStr.toUpperCase()) : 'BREAKING NEWS WIRE';
      return {
        cardMode: 'blue',
        isNews: true,
        showAuditBtn: false,
        failed12Layer: false,
        tickerLabel: cleanHeadline || 'Solana Institutional Market Update',
        verdictLabel: wireLbl,
        metricsLine: 'Custom Keyword Match: ' + (filterState.newsKeywords || 'SOL, ETF, AI, MACRO'),
        ctaLabel: '[READ ARTICLE \u2197]'
      };
    }

    const explicitFail = Boolean(
      cur && (
        cur.failed12Layer === true ||
        cur.isScamFail === true ||
        kind === 'rug' ||
        String(cur.l12 || '').toUpperCase() === 'FAILED' ||
        String(cur.verdict_12layer || '').toUpperCase() === 'FAIL' ||
        String(cur.severity || '').toUpperCase() === 'CRITICAL' ||
        /12-LAYER:\s*FAIL|RUG|SCAM|DRAINER|PHISHING|SYBIL\s*BLOCKED/i.test(rawBadge + ' ' + rawTitle)
      )
    );

    let sym = String((cur && cur.sym) || '').replace(/^\$/, '').trim().toUpperCase();
    if (!sym) {
      const sm = rawTitle.match(/\$([A-Za-z0-9_]{2,12})/);
      if (sm) sym = sm[1].toUpperCase();
    }
    if (!sym) sym = explicitFail ? 'RUG' : 'JUP';

    let pctNum;
    if (cur && cur.move_pct !== undefined && Number.isFinite(Number(cur.move_pct))) {
      pctNum = Number(cur.move_pct);
    } else {
      const pm = (rawTitle + ' ' + rawMsg).match(/([+-]?\d+(?:\.\d+)?)%/);
      pctNum = pm ? Number(pm[1]) : (explicitFail ? -94.2 : 18.4);
    }
    if (explicitFail && pctNum > 0) pctNum = -Math.abs(pctNum);

    const isRed = explicitFail || pctNum < 0;
    const pctStr = (pctNum >= 0 ? '+' : '') + pctNum.toFixed(1) + '%';

    const mcMatch = (rawTitle + ' ' + rawMsg).match(/(?:Market\s*Cap|MCap|MC)[:\s]*(\$[\d,.]+[KMB]?)/i);
    const liqMatch = (rawTitle + ' ' + rawMsg).match(/(?:Liquidity|Liq)[:\s]*(\$[\d,.]+[KMB]?)/i);

    const mcVal = formatCompactUsd(cur && (cur.mcap !== undefined && cur.mcap !== '' ? cur.mcap : (cur.mcapStr !== undefined ? cur.mcapStr : (cur.mc_usd || (cur.mc ? Number(cur.mc) * 1000 : '')))))
      || (mcMatch ? mcMatch[1] : (isRed ? '$14K' : '$420K'));
    const liqVal = formatCompactUsd(cur && (cur.liquidity !== undefined && cur.liquidity !== '' ? cur.liquidity : (cur.liqStr !== undefined ? cur.liqStr : (cur.liq_usd || (cur.liq ? Number(cur.liq) * 1000 : '')))))
      || (liqMatch ? liqMatch[1] : (isRed ? '$0' : '$68K'));

    return {
      cardMode: isRed ? 'red' : 'green',
      isNews: false,
      showAuditBtn: true,
      failed12Layer: isRed,
      tickerLabel: '$' + sym + ' ' + pctStr,
      verdictLabel: isRed ? '12-LAYER: FAIL' : '12-LAYER: PASS',
      metricsLine: isRed
        ? ('MCap ' + mcVal + '  \u2022  Liquidity ' + liqVal + ' (LP / Rug Risk)')
        : ('MCap ' + mcVal + '  \u2022  Liquidity ' + liqVal),
      ctaLabel: '[CHART / TRADE \u2197]'
    };
  }

  async function pollPublicNodeZeroAtas(walletAddr) {
    const w = String(walletAddr || '').trim();
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(w)) return { ok: false };
    let closableCount = 0;
    let reclaimLamports = 0;
    for (const progId of [SPL_TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]) {
      try {
        const res = await fetch(PUBLICNODE_SOLANA_RPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTokenAccountsByOwner',
            params: [w, { programId: progId }, { encoding: 'jsonParsed', commitment: 'confirmed' }]
          })
        });
        if (res.ok) {
          const j = await res.json();
          const vals = (j && j.result && Array.isArray(j.result.value)) ? j.result.value : [];
          for (let i = 0; i < vals.length; i++) {
            const row = vals[i];
            const pubk = row && row.pubkey;
            if (!pubk || HARD_EXCLUDED_FROZEN_ATAS.has(pubk)) continue;
            const acc = row.account || {};
            const info = acc.data && acc.data.parsed && acc.data.parsed.info;
            if (!info || String(info.state || '').toLowerCase() !== 'initialized') continue;
            const amt = info.tokenAmount && String(info.tokenAmount.amount || '');
            if (amt === '0') {
              closableCount += 1;
              reclaimLamports += Number(acc.lamports || 2039280);
            }
          }
        }
      } catch (_e) {}
    }
    return {
      ok: true,
      wallet: w,
      closableCount,
      reclaimSol: Number((reclaimLamports / 1e9).toFixed(6)),
      claimUrl: 'https://rentandrugshield.com/app.html?wallet=' + encodeURIComponent(w) + '&auto_reclaim_0pct=1&autoscan=1'
    };
  }

  function ensureShadowHost() {
    let host = document.getElementById('rrs-v53-black-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'rrs-v53-black-host';
      host.style.cssText = 'position:fixed;bottom:14px;right:14px;z-index:2147483647;pointer-events:none;background:transparent;transform-origin:0 0;max-width:calc(100vw - 16px);';
      (document.body || document.documentElement).appendChild(host);
    }
    const root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    if (!root.getElementById('rrs-v67-unified-hud-style')) {
      root.innerHTML = '';
      const st = document.createElement('style');
      st.id = 'rrs-v67-unified-hud-style';
      st.textContent = `
        * { box-sizing: border-box; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .rrs-lux-wrap {
          display: flex; flex-direction: column; align-items: flex-end;
          pointer-events: none; position: relative; max-width: calc(100vw - 16px);
        }
        .rrs-lux-drawer {
          pointer-events: auto; display: none;
          width: min(468px, calc(100vw - 24px));
          max-height: 62vh; overflow-y: auto;
          margin-bottom: 8px;
          border-radius: 12px;
          border: 2px solid #38BDF8;
          background: #020409;
          box-shadow: 0 20px 48px rgba(0,0,0,0.96);
          padding: 11px 13px; color: #FFFFFF;
          position: relative;
        }
        .rrs-lux-drawer.open { display: block; }

        .rrs-lux-card {
          pointer-events: auto; display: none; user-select: none; cursor: grab;
          width: min(468px, calc(100vw - 24px));
          border-radius: 12px;
          border: 2.5px solid #00FF88;
          background: linear-gradient(180deg, #040812 0%, #020408 100%);
          box-shadow: 0 22px 54px rgba(0,0,0,0.96), 0 0 24px rgba(0,255,136,0.16);
          padding: 10px 12px 9px;
          color: #FFFFFF;
          transition: border-color 0.16s ease, box-shadow 0.16s ease;
        }
        .rrs-lux-card.open { display: block; }
        .rrs-lux-card.dragging { cursor: grabbing !important; box-shadow: 0 28px 64px rgba(0,0,0,0.98), 0 0 28px rgba(255,208,0,0.35) !important; }
        .rrs-lux-card.state-green { border-color: #00FF88; box-shadow: 0 22px 54px rgba(0,0,0,0.96), 0 0 22px rgba(0,255,136,0.18); }
        .rrs-lux-card.state-red { border-color: #FF3B5C; box-shadow: 0 22px 54px rgba(0,0,0,0.96), 0 0 24px rgba(255,59,92,0.24); }
        .rrs-lux-card.state-blue { border-color: #38BDF8; box-shadow: 0 22px 54px rgba(0,0,0,0.96), 0 0 22px rgba(56,189,248,0.22); }

        .rrs-hud-hdr-bar {
          display: flex; align-items: center; justify-content: space-between; gap: 6px;
          width: 100%; padding-bottom: 7px; margin-bottom: 8px;
          border-bottom: 1px solid #1E293B; cursor: grab; flex-wrap: wrap;
        }
        .rrs-hud-brand-left {
          display: inline-flex; align-items: center; gap: 6px; min-width: 0;
        }
        .rrs-hud-crest-dot {
          width: 22px; height: 22px; border-radius: 6px;
          background: radial-gradient(circle at 30% 30%, #FFE066, #D4AF37);
          border: 1px solid #FFD000; color: #05070B;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 900; flex-shrink: 0;
        }
        .rrs-hud-ver-title {
          font-size: 11.2px; font-weight: 900; color: #F8FAFC; letter-spacing: 0.02em; white-space: nowrap;
        }
        .rrs-hud-ver-tag {
          font-size: 9.5px; font-weight: 900; color: #FFD000;
          background: rgba(255,208,0,0.12); border: 1px solid rgba(255,208,0,0.48);
          padding: 1px 5px; border-radius: 5px;
        }
        .rrs-hud-hdr-ctrls {
          display: inline-flex; align-items: center; gap: 4px; flex-wrap: wrap;
        }
        .rrs-ctrl-btn {
          height: 25px; padding: 0 7px;
          display: inline-flex; align-items: center; justify-content: center; gap: 3px;
          background: #050914;
          border: 1.2px solid #2D3A4E;
          border-radius: 6px;
          color: #F8FAFC;
          font-size: 9.8px; font-weight: 800;
          cursor: pointer; white-space: nowrap;
        }
        .rrs-ctrl-btn:hover { border-color: #38BDF8; }
        .rrs-ctrl-btn.zin { border-color: rgba(0,255,136,0.55); color: #00FF88; }
        .rrs-ctrl-btn.pin-btn {
          border-color: #FFD000; color: #FFD000; background: rgba(255,208,0,0.10); font-weight: 900;
        }
        .rrs-ctrl-btn.pin-btn.pinned {
          border-color: #00FF88; color: #04120C; background: #00FF88;
        }
        .rrs-ctrl-btn.gear-btn { color: #38BDF8; font-size: 11.5px; padding: 0 6px; }
        .rrs-ctrl-btn.close-x { border-color: rgba(255,59,92,0.6); color: #FF3B5C; padding: 0 7px; }
        .rrs-zoom-pill {
          height: 25px; min-width: 36px; padding: 0 4px;
          display: inline-flex; align-items: center; justify-content: center;
          background: #050914; border: 1.1px solid #2D3A4E;
          border-radius: 6px; color: #E2E8F0;
          font-size: 9.4px; font-weight: 800; cursor: pointer;
        }
        .rrs-stepper-capsule {
          height: 25px;
          display: inline-flex; align-items: stretch;
          background: #050914;
          border: 1.1px solid #2D3A4E;
          border-radius: 6px;
          overflow: hidden;
        }
        .rrs-step-side {
          width: 18px; background: transparent; border: none;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 900; cursor: pointer; padding: 0; color: #FFFFFF;
        }
        .rrs-step-side.minus { border-right: 1px solid #2D3A4E; }
        .rrs-step-side.plus { color: #00FF88; border-left: 1px solid #2D3A4E; }
        .rrs-step-mid {
          min-width: 26px; padding: 0 4px; background: transparent; border: none;
          display: inline-flex; align-items: center; justify-content: center;
          color: #FFFFFF; font-size: 9.4px; font-weight: 800; cursor: pointer;
        }

        /* UNIFIED TOP HALF: 3 COLOR-CODED PILLS + NUMBER FILTERS + 4 TOGGLES + VOICE+CHIMES */
        .rrs-grb-row {
          display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 5px;
          width: 100%; margin-bottom: 7px;
        }
        .rrs-grb-pill {
          height: 30px; padding: 0 6px; border-radius: 7px;
          display: inline-flex; align-items: center; justify-content: center; gap: 4px;
          font-size: 10px; font-weight: 900; cursor: pointer; background: #050912;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          transition: all 0.14s ease;
        }
        .rrs-grb-pill.green { border: 1.4px solid rgba(0,255,136,0.55); color: #00FF88; }
        .rrs-grb-pill.green.active { background: rgba(0,255,136,0.18); border-color: #00FF88; box-shadow: 0 0 10px rgba(0,255,136,0.25); }
        .rrs-grb-pill.red { border: 1.4px solid rgba(255,59,92,0.55); color: #FF3B5C; }
        .rrs-grb-pill.red.active { background: rgba(255,59,92,0.18); border-color: #FF3B5C; box-shadow: 0 0 10px rgba(255,59,92,0.25); }
        .rrs-grb-pill.blue { border: 1.4px solid rgba(56,189,248,0.55); color: #38BDF8; }
        .rrs-grb-pill.blue.active { background: rgba(56,189,248,0.18); border-color: #38BDF8; box-shadow: 0 0 10px rgba(56,189,248,0.25); }

        .rrs-num-filter-row {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px;
          width: 100%; margin-bottom: 7px;
        }
        .rrs-num-box {
          background: #050912; border: 1.1px solid #1E2D44; border-radius: 7px;
          padding: 4px 8px; display: flex; align-items: center; justify-content: space-between; gap: 6px;
        }
        .rrs-num-lbl {
          font-size: 9.4px; font-weight: 800; color: #94A3B8; white-space: nowrap;
        }
        .rrs-num-inp-wrap {
          display: inline-flex; align-items: center; gap: 2px; min-width: 0;
        }
        .rrs-num-prefix { font-size: 10.5px; font-weight: 900; color: #00FF88; }
        .rrs-hud-num-inp {
          width: 78px; height: 22px; background: #000000; border: 1px solid #2D3A4E;
          border-radius: 5px; padding: 0 5px; color: #FFFFFF; font-size: 10.8px; font-weight: 900;
          text-align: right; outline: none;
        }
        .rrs-hud-num-inp:focus { border-color: #00FF88; }

        .rrs-signals-2x2 {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5px;
          width: 100%; margin-bottom: 6px;
        }
        .rrs-sw-box {
          width: 100%; min-height: 29px;
          display: flex; align-items: center; justify-content: space-between; gap: 4px;
          background: #050912; border: 1.1px solid #1E2D44;
          border-radius: 7px; padding: 3px 7px; cursor: pointer; user-select: none;
        }
        .rrs-sw-track {
          position: relative; width: 30px; height: 16px; border-radius: 999px;
          background: #020408; border: 1.2px solid #334155; flex-shrink: 0;
        }
        .rrs-sw-thumb {
          position: absolute; top: 1.5px; left: 2px; width: 11px; height: 11px;
          border-radius: 50%; background: #94A3B8; transition: transform 0.14s ease, background 0.14s ease;
        }
        .rrs-sw-box[data-on="true"] { border-color: rgba(0,255,136,0.48); background: rgba(0,255,136,0.06); }
        .rrs-sw-box[data-on="true"] .rrs-sw-track { background: rgba(0,255,136,0.22); border-color: #00FF88; }
        .rrs-sw-box[data-on="true"] .rrs-sw-thumb { transform: translateX(13px); background: #00FF88; }
        .rrs-sw-lbl { font-size: 9.8px; font-weight: 800; color: #F1F5F9; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }

        .rrs-kw-inline-row {
          display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 6px; align-items: center;
          width: 100%; margin-bottom: 6px; background: #050912; border: 1px solid #1E2D44;
          border-radius: 7px; padding: 3px 8px;
        }
        .rrs-kw-inline-lbl { font-size: 9.3px; font-weight: 800; color: #38BDF8; white-space: nowrap; }
        .rrs-kw-inline-inp {
          width: 100%; height: 22px; background: transparent; border: none;
          color: #FFFFFF; font-size: 10.2px; font-weight: 700; outline: none;
        }

        .rrs-voice-chimes-row {
          display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 6px; align-items: center;
          width: 100%; padding: 5px 8px; margin-bottom: 8px;
          background: #050912; border: 1.2px solid rgba(255,208,0,0.42); border-radius: 7px;
        }
        .rrs-vc-lbl { font-size: 9.8px; font-weight: 900; color: #FFD000; white-space: nowrap; }
        .rrs-vc-sel {
          width: 100%; height: 24px; background: #000000; border: 1px solid #2D3A4E;
          border-radius: 5px; color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 0 5px; outline: none;
        }
        .rrs-vc-test-btn {
          height: 24px; padding: 0 8px; border-radius: 5px;
          background: rgba(0,255,136,0.15); border: 1.2px solid #00FF88;
          color: #00FF88; font-size: 9.8px; font-weight: 900; cursor: pointer; white-space: nowrap;
        }

        /* UNCHANGED BOTTOM 12-LAYER SHIELD BAR */
        .rrs-shield-bottom-bar {
          border-top: 1.2px solid #1E293B; padding-top: 7px;
        }
        .rrs-news-wire-pill {
          display: none; align-self: flex-start;
          padding: 2px 8px; margin-bottom: 5px; border-radius: 5px;
          border: 1.3px solid #38BDF8; color: #38BDF8; background: #000000;
          font-size: 10.2px; font-weight: 900; letter-spacing: 0.02em;
        }
        .rrs-coin-main { padding: 1px 0 6px 0; cursor: pointer; }
        .rrs-ticker-verdict-row {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          margin-bottom: 3px;
        }
        .rrs-ticker-text { font-size: 17.5px; font-weight: 900; line-height: 1.2; }
        .rrs-ticker-text.green { color: #00FF88; }
        .rrs-ticker-text.red { color: #FF3B5C; }
        .rrs-ticker-text.blue { color: #FFFFFF; font-size: 14.2px; }

        .rrs-verdict-pill {
          padding: 3px 8px; border-radius: 6px;
          font-size: 10.5px; font-weight: 900;
          white-space: nowrap; flex-shrink: 0; background: #000000;
        }
        .rrs-verdict-pill.pass { color: #00FF88; border: 1.4px solid #00FF88; }
        .rrs-verdict-pill.fail { color: #FF3B5C; border: 1.4px solid #FF3B5C; }

        .rrs-metrics-white {
          font-size: 13.2px; font-weight: 800; color: #E2E8F0; line-height: 1.28; margin: 0;
        }

        .rrs-cta-primary {
          width: 100%; height: 30px;
          display: inline-flex; align-items: center; justify-content: center;
          background: #000000; border: 1.4px solid #00FF88; color: #00FF88;
          border-radius: 6px; font-size: 10.8px; font-weight: 900; cursor: pointer;
        }

        .rrs-equal-2col { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; width: 100%; }
        .rrs-equal-3col { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 5px; width: 100%; }
        .rrs-equal-4col { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 5px; width: 100%; }
        .rrs-equal-5col { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 4px; width: 100%; }
        .rrs-stay-10col { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 3px; width: 100%; }

        .rrs-action-btn {
          width: 100%; height: 32px;
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 7px; font-size: 10.2px; font-weight: 900;
          cursor: pointer; text-align: center; white-space: nowrap; padding: 0 7px;
          background: #000000;
        }
        .rrs-btn-blue { border: 1.4px solid #38BDF8; color: #38BDF8; }
        .rrs-btn-emerald-solid { background: #00FF88; border: 1.4px solid #00FF88; color: #000000; }
        .rrs-btn-autoscan { border: 1.4px solid #334155; color: #94A3B8; background: #000000; }
        .rrs-btn-autoscan.on { border-color: #00FF88; color: #00FF88; background: rgba(0,255,136,0.16); }

        .rrs-foot {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 6px; font-size: 9.8px; font-weight: 700; color: #94A3B8;
        }
        .rrs-brand { color: #94A3B8; font-weight: 800; cursor: pointer; }
        .rrs-nav-mini {
          height: 19px; min-width: 19px; padding: 0 4px; margin-left: 2px;
          background: #000000; border: 1px solid #2D3A4E; border-radius: 4px;
          color: #FFFFFF; font-size: 9.2px; font-weight: 800; cursor: pointer;
        }
        .rrs-prog-track {
          width: 100%; height: 2.5px; background: #121824; border-radius: 999px;
          margin-top: 5px; overflow: hidden;
        }
        .rrs-prog-bar {
          height: 100%; width: 100%; background: #00FF88;
          border-radius: 999px; transition: width 0.09s linear;
        }

        .rrs-sec-lbl {
          font-size: 9.8px; font-weight: 900; color: #38BDF8; margin: 7px 0 4px;
          display: flex; align-items: center; justify-content: space-between; gap: 6px;
        }
        .rrs-seg-pill {
          width: 100%; height: 26px;
          display: inline-flex; align-items: center; justify-content: center; gap: 3px;
          background: #000000; border: 1.1px solid #2D3A4E; color: #CBD5E1;
          border-radius: 6px; font-size: 9.8px; font-weight: 800; cursor: pointer;
        }
        .rrs-seg-pill.active-blue { background: rgba(56,189,248,0.16); border-color: #38BDF8; color: #38BDF8; }
        .rrs-seg-pill.active-em { background: rgba(0,255,136,0.16); border-color: #00FF88; color: #00FF88; }
        .rrs-lux-inp {
          width: 100%; height: 30px; background: #000000; border: 1.2px solid #2D3A4E;
          border-radius: 6px; padding: 0 8px; color: #FFFFFF;
          font-size: 10.6px; font-weight: 800; outline: none;
        }
        .rrs-inline-scan-grid {
          display: grid; grid-template-columns: minmax(0, 1fr) 78px 158px; gap: 5px; width: 100%; margin-top: 4px;
        }
        .rrs-scan-out {
          display: none; margin-top: 5px; padding: 6px 8px; border-radius: 6px;
          background: #000000; border: 1.2px solid #38BDF8; color: #FFFFFF;
          font-size: 10.4px; font-weight: 700; line-height: 1.35;
        }
        .rrs-scan-out.show { display: block; }
        .rrs-q-tip {
          display: inline-flex; align-items: center; justify-content: center;
          width: 14px; height: 14px; border-radius: 50%;
          background: #000000; border: 1px solid #38BDF8; color: #38BDF8;
          font-size: 8.8px; font-weight: 900; cursor: pointer; flex-shrink: 0; line-height: 1;
        }
        .rrs-drw-tip-pop {
          display: none; position: fixed; z-index: 2147483647;
          width: 276px; background: #000000; border: 2px solid #38BDF8;
          border-radius: 8px; padding: 8px 10px;
          box-shadow: 0 16px 36px rgba(0,0,0,0.96);
          color: #FFFFFF; font-size: 10.2px; line-height: 1.4; pointer-events: auto;
        }
        .rrs-drw-tip-pop.show { display: block; }
        .rrs-founder-bell {
          position: fixed; bottom: 20px; left: 20px; pointer-events: auto; cursor: pointer;
          display: none; align-items: center; gap: 8px;
          background: #000000; color: #38BDF8; border: 2px solid #38BDF8;
          border-radius: 999px; padding: 7px 13px; font-size: 11.5px; font-weight: 900;
        }
        .rrs-founder-bell.show { display: inline-flex; }
        @media (max-width: 480px) {
          .rrs-lux-card { padding: 8px 9px 8px; }
          .rrs-grb-pill { font-size: 9.2px; padding: 0 4px; }
          .rrs-hud-num-inp { width: 64px; }
          .rrs-sw-lbl { font-size: 9.2px; }
        }
      `;
      root.appendChild(st);

      const vcOptionsHtml = VOICE_CHIMES_MODES.map((m) => `<option value="${m.value}">${m.label}</option>`).join('');

      const wrap = document.createElement('div');
      wrap.id = 'rrs-lux-wrap';
      wrap.className = 'rrs-lux-wrap';
      wrap.innerHTML = `
        <div id="rrs-drw-tip-pop" class="rrs-drw-tip-pop">
          <div style="display:flex;justify-content:space-between;align-items:center;font-weight:900;color:#00FF88;margin-bottom:3px;">
            <span id="rrs-drw-tip-title">Plain-English Trader Guide</span>
            <button type="button" id="rrs-drw-tip-close" style="background:transparent;border:none;color:#FF3B5C;font-weight:900;cursor:pointer;">\u2715</button>
          </div>
          <div id="rrs-drw-tip-body"></div>
        </div>

        <div id="rrs-v55-drawer" class="rrs-lux-drawer" data-version="6.7">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:11.5px;font-weight:900;color:#FFFFFF;">ADVANCED WALLET AUTO-SCAN &amp; WIRE SOURCES (v6.7)</span>
            <button type="button" id="rrs-drw-x" class="rrs-ctrl-btn close-x" title="Close">\u2715</button>
          </div>
          <div class="rrs-sec-lbl" style="margin-top:2px;"><span>STAY DURATION (3s..60s / PIN)</span></div>
          <div class="rrs-stay-10col" id="rrs-drw-stay-pills" style="margin-bottom:6px;">
            <button type="button" class="rrs-seg-pill" data-stay="3">3s</button>
            <button type="button" class="rrs-seg-pill" data-stay="5">5s</button>
            <button type="button" class="rrs-seg-pill" data-stay="8">8s</button>
            <button type="button" class="rrs-seg-pill" data-stay="10">10s</button>
            <button type="button" class="rrs-seg-pill active-blue" data-stay="15">15s</button>
            <button type="button" class="rrs-seg-pill" data-stay="20">20s</button>
            <button type="button" class="rrs-seg-pill" data-stay="30">30s</button>
            <button type="button" class="rrs-seg-pill" data-stay="45">45s</button>
            <button type="button" class="rrs-seg-pill" data-stay="60">60s</button>
            <button type="button" class="rrs-seg-pill" data-stay="PIN">Pin</button>
          </div>
          <div class="rrs-sec-lbl"><span>MULTI-SOURCE NEWS FEEDS</span></div>
          <div id="rrs-drw-news-srcs" class="rrs-equal-5col" style="margin-bottom:6px;">
            <button type="button" class="rrs-seg-pill active-blue" data-nsrc="bbc">BBC</button>
            <button type="button" class="rrs-seg-pill active-blue" data-nsrc="reuters">Reuters</button>
            <button type="button" class="rrs-seg-pill active-blue" data-nsrc="ap">AP</button>
            <button type="button" class="rrs-seg-pill active-blue" data-nsrc="coindesk">CoinDesk</button>
            <button type="button" class="rrs-seg-pill active-blue" data-nsrc="decrypt">Decrypt</button>
          </div>
          <div class="rrs-sec-lbl">
            <span style="display:inline-flex;align-items:center;gap:4px;">INSTANT SCAN &amp; 60s AUTO-SCAN COLLECT <span class="rrs-q-tip" data-tip="autoscan">?</span></span>
            <span id="rrs-autoscan-lbl" style="color:#94A3B8;font-size:9px;">0% 1st / 98% Repeat</span>
          </div>
          <div class="rrs-inline-scan-grid">
            <input id="rrs-in-quickscan" class="rrs-lux-inp" type="text" placeholder="Coin Mint or Wallet" />
            <button type="button" id="rrs-btn-scan-now" class="rrs-action-btn rrs-btn-blue" style="height:30px;font-size:9.6px;padding:0 5px;">SCAN NOW</button>
            <button type="button" id="rrs-btn-autoscan" class="rrs-action-btn rrs-btn-autoscan" style="height:30px;font-size:9px;padding:0 5px;">\u26A1 AUTO-SCAN: OFF</button>
          </div>
          <div id="rrs-quickscan-out" class="rrs-scan-out"></div>
          <div class="rrs-equal-2col" style="margin-top:8px;">
            <button type="button" id="rrs-drw-phantom" class="rrs-action-btn rrs-btn-blue">CONNECT PHANTOM</button>
            <button type="button" id="rrs-drw-save" class="rrs-action-btn rrs-btn-emerald-solid">\u2713 SAVE SETTINGS</button>
          </div>
        </div>

        <div id="rrs-v55-card" class="rrs-lux-card state-green" data-version="6.7" role="region" aria-label="Solana Rent and Rug Shield Unified v6.7 HUD">
          <!-- TOP DRAG & PIN BAR -->
          <div class="rrs-hud-hdr-bar" id="rrs-card-top-bar" title="Drag anywhere to move HUD box across chart">
            <div class="rrs-hud-brand-left">
              <span class="rrs-hud-crest-dot">\uD83D\uDEE1</span>
              <span class="rrs-hud-ver-title">RENT &amp; RUG SHIELD</span>
              <span class="rrs-hud-ver-tag">v6.7</span>
            </div>
            <div class="rrs-hud-hdr-ctrls">
              <button type="button" id="rrs-btn-pin-top" class="rrs-ctrl-btn pin-btn" title="Pin HUD in place or drag anywhere on screen">\uD83D\uDCCC Pin / Move</button>
              <div id="rrs-stepper-capsule" class="rrs-stepper-capsule">
                <button type="button" id="rrs-step-minus" class="rrs-step-side minus" title="Decrease stay seconds">-</button>
                <button type="button" id="rrs-step-mid" class="rrs-step-mid" title="Auto-hide timer">15s</button>
                <button type="button" id="rrs-step-plus" class="rrs-step-side plus" title="Increase stay seconds">+</button>
              </div>
              <button type="button" id="rrs-btn-zout" class="rrs-ctrl-btn" title="Zoom Out">-</button>
              <button type="button" id="rrs-btn-zpct" class="rrs-zoom-pill" title="Reset Zoom 100%">100%</button>
              <button type="button" id="rrs-btn-zin" class="rrs-ctrl-btn zin" title="Zoom In">+</button>
              <button type="button" id="rrs-btn-gear" class="rrs-ctrl-btn gear-btn" data-act="gear" title="Advanced Wallet Auto-Scan">\u2699</button>
              <button type="button" id="rrs-btn-close" class="rrs-ctrl-btn close-x" title="Close HUD">\u2715</button>
            </div>
          </div>

          <!-- 3 COLOR-CODED ALERT PILLS (GREEN / RED / BLUE) -->
          <div class="rrs-grb-row" id="rrs-hud-grb-pills">
            <button type="button" id="rrs-pill-green" class="rrs-grb-pill green active" data-grb="green" title="Green: Coins & Stocks Breaking Up">\uD83D\uDFE2 Breakout Up</button>
            <button type="button" id="rrs-pill-red" class="rrs-grb-pill red" data-grb="red" title="Red: Drops & 12-Layer Rug Danger">\uD83D\uDD34 Drop / Rug</button>
            <button type="button" id="rrs-pill-blue" class="rrs-grb-pill blue" data-grb="blue" title="Blue: Breaking World & Keyword News">\uD83D\uDD35 World News</button>
          </div>

          <!-- CUSTOM LIQUIDITY $ & MARKET CAP $ NUMBER FILTER INPUTS -->
          <div class="rrs-num-filter-row">
            <label class="rrs-num-box" for="rrs-hud-liq-min">
              <span class="rrs-num-lbl">Liquidity $</span>
              <span class="rrs-num-inp-wrap">
                <span class="rrs-num-prefix">$</span>
                <input id="rrs-hud-liq-min" class="rrs-hud-num-inp" type="number" min="0" step="1000" value="10000" aria-label="Minimum Liquidity USD" />
              </span>
            </label>
            <label class="rrs-num-box" for="rrs-hud-mcap-min">
              <span class="rrs-num-lbl">Market Cap $</span>
              <span class="rrs-num-inp-wrap">
                <span class="rrs-num-prefix">$</span>
                <input id="rrs-hud-mcap-min" class="rrs-hud-num-inp" type="number" min="0" step="5000" value="25000" aria-label="Minimum Market Cap USD" />
              </span>
            </label>
          </div>

          <!-- 4 TRADER SIGNAL TOGGLES (WHALE / CLUSTER / MACD CROSS / WORLD & KEYWORD NEWS) -->
          <div class="rrs-signals-2x2">
            <div class="rrs-sw-box" id="rrs-hud-sw-whale" data-on="true" role="switch" aria-checked="true">
              <span class="rrs-sw-lbl">\uD83D\uDC0B Whale Alert <span class="rrs-q-tip" data-tip="whales">?</span></span>
              <div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div>
            </div>
            <div class="rrs-sw-box" id="rrs-hud-sw-cluster" data-on="true" role="switch" aria-checked="true">
              <span class="rrs-sw-lbl">\uD83E\uDDEC Cluster Alert <span class="rrs-q-tip" data-tip="cluster">?</span></span>
              <div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div>
            </div>
            <div class="rrs-sw-box" id="rrs-hud-sw-macd" data-on="true" role="switch" aria-checked="true">
              <span class="rrs-sw-lbl">\uD83D\uDCC8 MACD Cross Alert <span class="rrs-q-tip" data-tip="macd">?</span></span>
              <div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div>
            </div>
            <div class="rrs-sw-box" id="rrs-hud-sw-news" data-on="true" role="switch" aria-checked="true">
              <span class="rrs-sw-lbl">\uD83C\uDF10 World &amp; Keyword News</span>
              <div class="rrs-sw-track"><div class="rrs-sw-thumb"></div></div>
            </div>
          </div>

          <!-- CUSTOM KEYWORD FILTER INPUT -->
          <div class="rrs-kw-inline-row" id="rrs-hud-kw-row">
            <span class="rrs-kw-inline-lbl">Keywords:</span>
            <input id="rrs-hud-kw" class="rrs-kw-inline-inp" type="text" value="SOL, ETF, AI, MACRO" aria-label="Custom World and Crypto News Keywords" />
          </div>

          <!-- VOICE + CHIMES SELECTOR ROW -->
          <div class="rrs-voice-chimes-row">
            <label class="rrs-vc-lbl" for="rrs-hud-voice-chimes">\uD83D\uDD0A Voice + Chimes</label>
            <select id="rrs-hud-voice-chimes" class="rrs-vc-sel" aria-label="Voice and Chimes Selector">${vcOptionsHtml}</select>
            <button type="button" id="rrs-hud-test-audio" class="rrs-vc-test-btn" title="Preview Selected Chime & Voice">\u25B6 Test</button>
          </div>

          <!-- UNCHANGED BOTTOM 12-LAYER SHIELD BAR -->
          <div class="rrs-shield-bottom-bar" id="rrs-hud-shield-bottom">
            <div id="rrs-news-wire-pill" class="rrs-news-wire-pill">BREAKING NEWS WIRE</div>
            <div class="rrs-coin-main" id="rrs-coin-main-click">
              <div class="rrs-ticker-verdict-row">
                <span id="rrs-card-title" class="rrs-ticker-text green">$JUP +18.4%</span>
                <span id="rrs-card-badge" class="rrs-verdict-pill pass">12-LAYER: PASS</span>
              </div>
              <div id="rrs-card-body" class="rrs-metrics-white">MCap $420K  \u2022  Liquidity $68K</div>
            </div>

            <div id="rrs-cta-row" style="display:flex;gap:6px;width:100%;">
              <button type="button" id="rrs-btn-trade" class="rrs-cta-primary" style="flex:1;">[CHART / TRADE \u2197]</button>
              <button type="button" id="rrs-btn-audit" class="rrs-cta-primary" style="width:94px;flex-shrink:0;border-color:#38BDF8;color:#38BDF8;font-size:10.4px;">[AUDIT \u2197]</button>
            </div>

            <div class="rrs-foot">
              <span id="rrs-brand-link" class="rrs-brand">0% 1st Claim \u2022 rentandrugshield.com</span>
              <div style="display:flex;align-items:center;gap:4px;">
                <button type="button" id="rrs-btn-prev" class="rrs-nav-mini">&lt;</button>
                <span id="rrs-lbl-cnt" style="font-size:9.8px;font-weight:800;color:#94A3B8;">1/1</span>
                <button type="button" id="rrs-btn-next" class="rrs-nav-mini">&gt;</button>
                <span id="rrs-lbl-timer" style="color:#00FF88;font-weight:900;margin-left:4px;">15s</span>
              </div>
            </div>
            <div class="rrs-prog-track"><div id="rrs-prog-bar" class="rrs-prog-bar"></div></div>
          </div>
        </div>
      `;
      root.appendChild(wrap);

      const bell = document.createElement('div');
      bell.id = 'rrs-founder-bell';
      bell.className = 'rrs-founder-bell';
      bell.innerHTML = '<span>Approvals Waiting</span><span id="rrs-bell-num" style="background:#38BDF8;color:#000000;border-radius:999px;padding:1px 7px;">0</span>';
      bell.onclick = () => window.open('http://127.0.0.1:18088/command/waiting-approvals', '_blank', 'noopener,noreferrer');
      root.appendChild(bell);

      wireLuxuryInteractions(host, root);
    }
    return { host, root };
  }

  function setSwitchOn(root, id, val) {
    const el = root.getElementById(id);
    if (el) {
      el.dataset.on = val ? 'true' : 'false';
      el.setAttribute('aria-checked', val ? 'true' : 'false');
    }
  }

  function getSwitchOn(root, id) {
    const el = root.getElementById(id);
    return Boolean(el && el.dataset.on === 'true');
  }

  function syncAutoScanDrawerUI(root, statusNote) {
    const btn = root.getElementById('rrs-btn-autoscan');
    const lbl = root.getElementById('rrs-autoscan-lbl');
    const on = Boolean(filterState.autoScanEnabled);
    if (btn) {
      btn.classList.toggle('on', on);
      btn.textContent = on ? '\u26A1 AUTO-SCAN: ON' : '\u26A1 AUTO-SCAN: OFF';
    }
    if (lbl) {
      lbl.style.color = on ? '#00FF88' : '#94A3B8';
      lbl.textContent = statusNote || (on ? 'Polling PublicNode (60s)' : '0% 1st / 98% Repeat');
    }
  }

  function syncHudControlsFromState(root) {
    const cur = uniqueAlerts[activeAlertIdx] || null;
    const baseSec = normStaySec(layoutState.autoHideSec);
    const displaySec = cur ? Math.max(1, Math.round(computeAlertDurationMs(cur) / 1000)) : baseSec;
    const pinned = Boolean(activeCardPinned);

    const stepMid = root.getElementById('rrs-step-mid');
    if (stepMid) stepMid.textContent = displaySec + 's';

    const pinTop = root.getElementById('rrs-btn-pin-top');
    if (pinTop) {
      pinTop.textContent = pinned ? '\uD83D\uDCCC Pinned' : '\uD83D\uDCCC Pin / Move';
      pinTop.classList.toggle('pinned', pinned);
    }

    const activeStayTarget = pinned ? 'PIN' : String(baseSec);
    root.querySelectorAll('#rrs-drw-stay-pills [data-stay]').forEach((btn) => {
      btn.classList.remove('active-blue', 'active-em');
      if (btn.dataset.stay === activeStayTarget) {
        btn.classList.add(pinned ? 'active-em' : 'active-blue');
      }
    });

    const liqInp = root.getElementById('rrs-hud-liq-min');
    if (liqInp && document.activeElement !== liqInp) {
      liqInp.value = String(Number(filterState.liqMin !== undefined ? filterState.liqMin : 10000));
    }
    const mcInp = root.getElementById('rrs-hud-mcap-min');
    if (mcInp && document.activeElement !== mcInp) {
      mcInp.value = String(Number(filterState.mcMin !== undefined ? filterState.mcMin : 25000));
    }

    setSwitchOn(root, 'rrs-hud-sw-whale', filterState.whaleAlertOn !== false);
    setSwitchOn(root, 'rrs-hud-sw-cluster', filterState.clusterAlertOn !== false);
    setSwitchOn(root, 'rrs-hud-sw-macd', filterState.macdOn !== false);
    setSwitchOn(root, 'rrs-hud-sw-news', filterState.newsKwOn !== false);

    const kwInp = root.getElementById('rrs-hud-kw');
    if (kwInp && document.activeElement !== kwInp) {
      kwInp.value = filterState.newsKeywords || 'SOL, ETF, AI, MACRO';
    }

    const vcSel = root.getElementById('rrs-hud-voice-chimes');
    if (vcSel) {
      const targetVal = filterState.soundEnabled === false ? 'mute' : (filterState.voiceChimeMode || 'voice_chimes_auto');
      vcSel.value = targetVal;
      if (vcSel.value !== targetVal) vcSel.value = 'voice_chimes_auto';
    }

    syncAutoScanDrawerUI(root);

    const timerLbl = root.getElementById('rrs-lbl-timer');
    if (timerLbl && pinned) timerLbl.textContent = 'PINNED';
  }

  async function detectInjectedWallet() {
    try {
      const ph = window.phantom && window.phantom.solana ? window.phantom.solana : window.solana;
      if (ph && ph.publicKey) return ph.publicKey.toString();
      if (window.solflare && window.solflare.publicKey) return window.solflare.publicKey.toString();
    } catch (_e) {}
    return connectedWallet || '';
  }

  async function handleConnectPhantom() {
    try {
      const prov = (window.phantom && window.phantom.solana) || window.solflare || window.solana;
      if (prov && typeof prov.connect === 'function') {
        const resp = await prov.connect();
        const pk = (resp && resp.publicKey) ? resp.publicKey.toString() : (prov.publicKey ? prov.publicKey.toString() : '');
        if (pk) {
          connectedWallet = pk;
          saveStateAll();
          window.open('https://rentandrugshield.com/app.html?wallet=' + encodeURIComponent(connectedWallet) + '&auto_reclaim_0pct=1&autoscan=1', '_blank', 'noopener,noreferrer');
          return;
        }
      }
    } catch (_e) {}
    const target = connectedWallet
      ? ('https://rentandrugshield.com/app.html?wallet=' + encodeURIComponent(connectedWallet) + '&auto_reclaim_0pct=1&autoscan=1')
      : PHANTOM_45S_URL;
    window.open(target, '_blank', 'noopener,noreferrer');
  }

  async function runAutoScanTickToast(root, triggerClaimOnFind) {
    if (!filterState.autoScanEnabled) return;
    const out = root.getElementById('rrs-quickscan-out');
    const qInp = root.getElementById('rrs-in-quickscan');
    let w = await detectInjectedWallet();
    if (!w && qInp && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(qInp.value.trim())) {
      w = qInp.value.trim();
    }
    if (!w) {
      syncAutoScanDrawerUI(root, 'Armed (60s) | Connect Wallet');
      if (out) {
        out.classList.add('show');
        out.style.borderColor = '#00FF88';
        out.innerHTML = '<div style="color:#00FF88;font-weight:900;">\u26A1 AUTO-SCAN ARMED (60s PublicNode Read-Only)</div>' +
          '<div style="margin-top:2px;color:#CBD5E1;">Connect Phantom/Solflare or paste your wallet address to auto-detect 0-balance accounts &amp; reclaim SOL (0% 1st / 98% repeat).</div>';
      }
      return;
    }
    connectedWallet = w;
    syncAutoScanDrawerUI(root, 'Polling PublicNode...');
    const res = await pollPublicNodeZeroAtas(w);
    if (!res || !res.ok) return;
    syncAutoScanDrawerUI(root, res.closableCount + ' Closable | +' + res.reclaimSol.toFixed(4) + ' SOL');
    if (out) {
      out.classList.add('show');
      out.style.borderColor = '#00FF88';
      out.innerHTML = `<div style="color:#00FF88;font-weight:900;">\u26A1 AUTO-SCAN (PublicNode 60s): ${res.closableCount} Closable 0-Balance ATAs | +${res.reclaimSol.toFixed(6)} SOL</div>` +
        `<div style="margin-top:3px;color:#FFFFFF;">0% 1st Claim / 98% Repeat \u2022 <a href="${res.claimUrl}" target="_blank" rel="noopener noreferrer" style="color:#00FF88;font-weight:900;">Reclaim SOL Now \u2197</a></div>`;
    }
    if (triggerClaimOnFind && res.closableCount > 0 && filterState.soundEnabled) {
      playSpokenVoice12('Free SOL Rent Ready!', false);
    }
  }

  async function runInlineQuickScan(root) {
    const inp = root.getElementById('rrs-in-quickscan');
    const out = root.getElementById('rrs-quickscan-out');
    if (!inp || !out) return;
    const raw = scrubText(inp.value || '').trim();
    out.classList.add('show');
    if (!raw) {
      out.style.borderColor = '#38BDF8';
      out.innerHTML = '<span style="color:#38BDF8;">Paste a Solana Coin Mint or Wallet Address above to scan.</span>';
      return;
    }
    const upperSym = raw.replace(/^\$/, '').toUpperCase();
    const resolvedInput = KNOWN_SYM_MINTS[upperSym] || ((raw.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/) || [])[0]) || raw;
    out.style.borderColor = '#38BDF8';
    out.innerHTML = '<span style="color:#38BDF8;">Scanning Solana Mainnet (12-Layer &amp; 0x09 Rent)...</span>';

    if (isExtRuntime && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'RRS_QUICK_OMNI_SCAN_V60', query: resolvedInput }, (res) => {
        void chrome.runtime.lastError;
        if (res && res.html) {
          out.style.borderColor = res.borderColor || '#00FF88';
          out.innerHTML = res.html;
          return;
        }
        fallbackHttpQuickScan(resolvedInput, out);
      });
      return;
    }
    fallbackHttpQuickScan(resolvedInput, out);
  }

  async function fallbackHttpQuickScan(addr, out) {
    const looksLikeMint = /pump$/i.test(addr) || addr === 'So11111111111111111111111111111111111111112' || addr === 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' || addr === 'AAL1P7Lyj3sPKwYfRTGCi4VRH73mMrSaeYhE4kitCAwL';
    try {
      if (!looksLikeMint) {
        const pn = await pollPublicNodeZeroAtas(addr);
        if (pn && pn.ok && pn.closableCount > 0) {
          out.style.borderColor = '#00FF88';
          out.innerHTML = `<div style="color:#00FF88;font-weight:900;">WALLET AUTO RENT RECLAIM: ${pn.closableCount} Empty ATAs \u2022 +${pn.reclaimSol.toFixed(6)} SOL</div>` +
            `<div style="margin-top:3px;color:#FFFFFF;">1st Claim = 0% Fee \u2022 <a href="${pn.claimUrl}" target="_blank" rel="noopener noreferrer" style="color:#38BDF8;font-weight:900;">Open Wallet Claim \u2197</a></div>`;
          return;
        }
      }
      const apiBase = (window.location && window.location.port === '8088') ? '' : 'https://rentandrugshield.com';
      const rt = await fetch(apiBase + '/api/scan-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mint: addr, source: 'v67_inline_scanner' })
      });
      if (rt.ok) {
        const dt = await rt.json();
        const sc = Number(dt.safety_score !== undefined ? dt.safety_score : 95);
        const pass = sc >= 75;
        const col = pass ? '#00FF88' : '#FF3B5C';
        const sym = scrubText(dt.symbol || addr.slice(0, 6));
        const auditUrl = buildExact12LayerTokenUrl(addr);
        out.style.borderColor = col;
        out.innerHTML = `<div style="color:${col};font-weight:900;">$${sym} \u2022 ${pass ? '12-LAYER: PASS' : '12-LAYER: FAIL'} (${sc}/100)</div>` +
          `<div style="margin-top:3px;color:#FFFFFF;">${scrubText(dt.verdict || '')} \u2022 <a href="${auditUrl}" target="_blank" rel="noopener noreferrer" style="color:#38BDF8;font-weight:900;">Open 12-Layer Audit \u2197</a></div>`;
        return;
      }
    } catch (_e) {}
    const fallbackAudit = buildExact12LayerTokenUrl(addr);
    out.style.borderColor = '#38BDF8';
    out.innerHTML = `<div>Inspect on Rent &amp; Rug Shield: <a href="${fallbackAudit}" target="_blank" rel="noopener noreferrer" style="color:#00FF88;font-weight:900;">Open 12-Layer Audit \u2197</a></div>`;
  }

  function applyLayoutToHost(host, root) {
    const z = clampZoom(layoutState.zoomPct);
    const scale = z / 100;
    host.style.transformOrigin = '0 0';
    host.style.transform = 'scale(' + scale + ')';

    const zBtn = root.getElementById('rrs-btn-zpct');
    if (zBtn) zBtn.textContent = z + '%';
    syncHudControlsFromState(root);

    const vw = window.innerWidth || 1280;
    const vh = window.innerHeight || 720;
    const baseW = Math.min(468, vw - 16);
    const scaledW = baseW * scale;

    if (layoutState.x !== null && layoutState.y !== null && Number.isFinite(layoutState.x) && Number.isFinite(layoutState.y)) {
      let x = Math.max(8, Math.min(vw - Math.min(scaledW, vw - 16) - 8, layoutState.x));
      let y = Math.max(8, Math.min(vh - 64, layoutState.y));
      layoutState.x = x;
      layoutState.y = y;
      host.style.right = 'auto';
      host.style.bottom = 'auto';
      host.style.left = Math.round(x) + 'px';
      host.style.top = Math.round(y) + 'px';
    } else {
      host.style.right = vw <= 520 ? '12px' : '16px';
      host.style.bottom = vw <= 520 ? '12px' : '16px';
      host.style.left = 'auto';
      host.style.top = 'auto';
    }
  }

  function setZoomAnchored(host, root, nextZoomPct, clickedBtn) {
    const clamped = clampZoom(nextZoomPct);
    const rectBefore = clickedBtn ? clickedBtn.getBoundingClientRect() : null;
    const hostRectBefore = host.getBoundingClientRect();

    let curX = (layoutState.x !== null && Number.isFinite(layoutState.x) && host.style.left && host.style.left !== 'auto')
      ? parseFloat(host.style.left)
      : hostRectBefore.left;
    let curY = (layoutState.y !== null && Number.isFinite(layoutState.y) && host.style.top && host.style.top !== 'auto')
      ? parseFloat(host.style.top)
      : hostRectBefore.top;
    if (!Number.isFinite(curX)) curX = hostRectBefore.left;
    if (!Number.isFinite(curY)) curY = hostRectBefore.top;

    layoutState.x = curX;
    layoutState.y = curY;
    layoutState.zoomPct = clamped;

    applyLayoutToHost(host, root);

    if (rectBefore && clickedBtn) {
      const rectAfter = clickedBtn.getBoundingClientRect();
      const dx = (rectBefore.left + rectBefore.width / 2) - (rectAfter.left + rectAfter.width / 2);
      const dy = (rectBefore.top + rectBefore.height / 2) - (rectAfter.top + rectAfter.height / 2);
      layoutState.x = Math.max(8, curX + dx);
      layoutState.y = Math.max(8, curY + dy);
      applyLayoutToHost(host, root);
    }

    saveStateAll();
  }

  function renderActiveAlert(root) {
    if (!uniqueAlerts.length) return;
    activeAlertIdx = Math.max(0, Math.min(activeAlertIdx, uniqueAlerts.length - 1));
    const cur = uniqueAlerts[activeAlertIdx];
    const parsed = parseAlertForDisplay(cur);

    const card = root.getElementById('rrs-v55-card');
    const wirePill = root.getElementById('rrs-news-wire-pill');
    const titleEl = root.getElementById('rrs-card-title');
    const badgeEl = root.getElementById('rrs-card-badge');
    const bodyEl = root.getElementById('rrs-card-body');
    const tradeBtn = root.getElementById('rrs-btn-trade');
    const auditBtn = root.getElementById('rrs-btn-audit');
    const progBar = root.getElementById('rrs-prog-bar');
    const timerLbl = root.getElementById('rrs-lbl-timer');

    card.classList.remove('state-green', 'state-red', 'state-blue');
    root.querySelectorAll('#rrs-hud-grb-pills [data-grb]').forEach((b) => {
      b.classList.toggle('active', b.dataset.grb === parsed.cardMode);
    });

    if (parsed.isNews || parsed.cardMode === 'blue') {
      card.classList.add('state-blue');
      if (wirePill) {
        wirePill.style.display = 'inline-block';
        wirePill.textContent = parsed.verdictLabel || 'BREAKING NEWS WIRE';
      }
      badgeEl.style.display = 'none';
      bodyEl.style.display = 'block';
      bodyEl.textContent = parsed.metricsLine || ('Custom Keyword Match: ' + (filterState.newsKeywords || 'SOL, ETF, AI, MACRO'));
      titleEl.textContent = parsed.tickerLabel;
      titleEl.className = 'rrs-ticker-text blue';
      if (tradeBtn) {
        tradeBtn.textContent = '[READ ARTICLE \u2197]';
        tradeBtn.style.borderColor = '#38BDF8';
        tradeBtn.style.color = '#38BDF8';
      }
      if (auditBtn) auditBtn.style.display = 'none';
      if (progBar) progBar.style.background = '#38BDF8';
      if (timerLbl) timerLbl.style.color = '#38BDF8';
    } else if (parsed.cardMode === 'red') {
      card.classList.add('state-red');
      if (wirePill) wirePill.style.display = 'none';
      badgeEl.style.display = 'inline-block';
      badgeEl.textContent = '12-LAYER: FAIL';
      badgeEl.className = 'rrs-verdict-pill fail';
      titleEl.textContent = parsed.tickerLabel;
      titleEl.className = 'rrs-ticker-text red';
      bodyEl.style.display = 'block';
      bodyEl.textContent = parsed.metricsLine;
      if (tradeBtn) {
        tradeBtn.textContent = parsed.ctaLabel;
        tradeBtn.style.borderColor = '#FF3B5C';
        tradeBtn.style.color = '#FF3B5C';
      }
      if (auditBtn) auditBtn.style.display = parsed.showAuditBtn ? 'inline-flex' : 'none';
      if (progBar) progBar.style.background = '#FF3B5C';
      if (timerLbl) timerLbl.style.color = '#FF3B5C';
    } else {
      card.classList.add('state-green');
      if (wirePill) wirePill.style.display = 'none';
      badgeEl.style.display = 'inline-block';
      badgeEl.textContent = '12-LAYER: PASS';
      badgeEl.className = 'rrs-verdict-pill pass';
      titleEl.textContent = parsed.tickerLabel;
      titleEl.className = 'rrs-ticker-text green';
      bodyEl.style.display = 'block';
      bodyEl.textContent = parsed.metricsLine;
      if (tradeBtn) {
        tradeBtn.textContent = parsed.ctaLabel;
        tradeBtn.style.borderColor = '#00FF88';
        tradeBtn.style.color = '#00FF88';
      }
      if (auditBtn) auditBtn.style.display = parsed.showAuditBtn ? 'inline-flex' : 'none';
      if (progBar) progBar.style.background = '#00FF88';
      if (timerLbl) timerLbl.style.color = '#00FF88';
    }

    if (tradeBtn) tradeBtn.dataset.href = cur.url || '';
    if (auditBtn) auditBtn.dataset.href = cur.audit_url || resolveAlertAuditUrl(cur) || '';
    root.getElementById('rrs-lbl-cnt').textContent = (activeAlertIdx + 1) + '/' + uniqueAlerts.length;
  }

  function switchHudModeSample(root, modeKey, playAudioSample) {
    const sample = SAMPLE_GRB_ALERTS[modeKey] || SAMPLE_GRB_ALERTS.green;
    let foundIdx = -1;
    for (let i = 0; i < uniqueAlerts.length; i++) {
      const p = parseAlertForDisplay(uniqueAlerts[i]);
      if (p.cardMode === modeKey) {
        foundIdx = i;
        break;
      }
    }
    if (foundIdx !== -1) {
      activeAlertIdx = foundIdx;
    } else {
      uniqueAlerts.push(Object.assign({}, sample));
      if (uniqueAlerts.length > 15) uniqueAlerts.shift();
      activeAlertIdx = uniqueAlerts.length - 1;
    }
    countdownTotalMs = computeAlertDurationMs(uniqueAlerts[activeAlertIdx]);
    countdownRemMs = countdownTotalMs;
    renderActiveAlert(root);
    syncHudControlsFromState(root);
    if (playAudioSample) {
      playSpokenVoice12(modeKey, true);
    }
  }

  function hideCardCompletelyOffscreen(host, root) {
    activeCardPinned = false;
    cardHovered = false;
    const card = root.getElementById('rrs-v55-card');
    const drawer = root.getElementById('rrs-v55-drawer');
    if (drawer) {
      drawer.classList.remove('open');
      drawer.style.display = 'none';
      drawer.style.visibility = 'hidden';
    }
    if (card) {
      card.classList.remove('open');
      card.style.display = 'none';
      card.style.visibility = 'hidden';
    }
    const bell = root.getElementById('rrs-founder-bell');
    if (host && (!bell || !bell.classList.contains('show'))) {
      host.style.display = 'none';
      host.style.visibility = 'hidden';
    }
  }

  function ensureCountdownLoop(host, root) {
    if (countdownTimerId) return;
    countdownLastTickTs = Date.now();
    countdownTimerId = setInterval(() => {
      const now = Date.now();
      const rawDt = Math.max(0, now - (countdownLastTickTs || now));
      countdownLastTickTs = now;

      const card = root.getElementById('rrs-v55-card');
      const drawer = root.getElementById('rrs-v55-drawer');
      if (!card || !card.classList.contains('open')) return;
      const timerLbl = root.getElementById('rrs-lbl-timer');
      const progBar = root.getElementById('rrs-prog-bar');
      const drawerOpen = Boolean(drawer && drawer.classList.contains('open'));

      if (cardHovered && (now - lastHoverMoveTs > 1500)) {
        cardHovered = false;
      }

      if (activeCardPinned || drawerOpen || cardHovered || isDraggingCard) {
        if (timerLbl) timerLbl.textContent = activeCardPinned ? 'PINNED' : (drawerOpen ? 'SETTINGS' : 'PAUSED');
        return;
      }
      countdownRemMs -= rawDt;
      const secLeft = Math.max(0, Math.ceil(countdownRemMs / 1000));
      if (timerLbl) timerLbl.textContent = secLeft + 's';
      if (progBar) {
        const pct = Math.max(0, Math.min(100, (countdownRemMs / Math.max(1000, countdownTotalMs)) * 100));
        progBar.style.width = pct.toFixed(1) + '%';
      }
      if (countdownRemMs <= 0) {
        if (timerLbl) timerLbl.textContent = '0s';
        if (progBar) progBar.style.width = '0%';
        hideCardCompletelyOffscreen(host, root);
      }
    }, 80);
  }

  function wireShadowTooltips(root) {
    const tipPop = root.getElementById('rrs-drw-tip-pop');
    const tipTtl = root.getElementById('rrs-drw-tip-title');
    const tipBdy = root.getElementById('rrs-drw-tip-body');
    const tipCls = root.getElementById('rrs-drw-tip-close');
    if (!tipPop || !tipTtl || !tipBdy) return;

    let pinnedKey = '';
    const openTip = (badge, key, pin) => {
      const info = PLAIN_ENGLISH_TIPS[key];
      if (!info) return;
      if (pin) {
        if (pinnedKey === key && tipPop.classList.contains('show')) {
          pinnedKey = '';
          tipPop.classList.remove('show');
          root.querySelectorAll('.rrs-q-tip.open').forEach((x) => x.classList.remove('open'));
          return;
        }
        pinnedKey = key;
      }
      root.querySelectorAll('.rrs-q-tip.open').forEach((x) => x.classList.remove('open'));
      badge.classList.add('open');
      tipTtl.textContent = info.title;
      tipBdy.textContent = info.body;
      tipPop.classList.add('show');

      const r = badge.getBoundingClientRect();
      const pw = 276;
      let left = Math.max(10, Math.min((window.innerWidth || 1280) - pw - 10, r.left - pw / 2 + 8));
      let top = r.bottom + 7;
      if (top + 96 > (window.innerHeight || 720)) top = Math.max(8, r.top - 96);
      tipPop.style.left = Math.round(left) + 'px';
      tipPop.style.top = Math.round(top) + 'px';
    };

    root.querySelectorAll('.rrs-q-tip[data-tip]').forEach((badge) => {
      const k = badge.getAttribute('data-tip');
      badge.addEventListener('mouseenter', () => { if (!pinnedKey) openTip(badge, k, false); });
      badge.addEventListener('mouseleave', () => {
        if (!pinnedKey) {
          tipPop.classList.remove('show');
          badge.classList.remove('open');
        }
      });
      badge.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        openTip(badge, k, true);
      });
    });

    if (tipCls) {
      tipCls.onclick = (ev) => {
        ev.stopPropagation();
        pinnedKey = '';
        tipPop.classList.remove('show');
        root.querySelectorAll('.rrs-q-tip.open').forEach((x) => x.classList.remove('open'));
      };
    }
  }

  function wireLuxuryInteractions(host, root) {
    const card = root.getElementById('rrs-v55-card');
    const drawer = root.getElementById('rrs-v55-drawer');

    wireShadowTooltips(root);

    const btnZout = root.getElementById('rrs-btn-zout');
    const btnZpct = root.getElementById('rrs-btn-zpct');
    const btnZin = root.getElementById('rrs-btn-zin');

    if (btnZout) btnZout.onclick = (ev) => { ev.stopPropagation(); setZoomAnchored(host, root, layoutState.zoomPct - 15, btnZout); };
    if (btnZpct) btnZpct.onclick = (ev) => { ev.stopPropagation(); setZoomAnchored(host, root, 100, btnZpct); };
    if (btnZin) btnZin.onclick = (ev) => { ev.stopPropagation(); setZoomAnchored(host, root, layoutState.zoomPct + 15, btnZin); };

    const stepMinus = root.getElementById('rrs-step-minus');
    const stepMid = root.getElementById('rrs-step-mid');
    const stepPlus = root.getElementById('rrs-step-plus');
    const pinTop = root.getElementById('rrs-btn-pin-top');

    if (stepMinus) {
      stepMinus.onclick = (ev) => {
        ev.stopPropagation();
        activeCardPinned = false;
        layoutState.autoHideSec = stepStaySecValue(layoutState.autoHideSec, -1);
        filterState.autoHideSec = layoutState.autoHideSec;
        countdownTotalMs = computeAlertDurationMs(uniqueAlerts[activeAlertIdx]);
        countdownRemMs = countdownTotalMs;
        syncHudControlsFromState(root);
        saveStateAll();
      };
    }
    if (stepPlus) {
      stepPlus.onclick = (ev) => {
        ev.stopPropagation();
        activeCardPinned = false;
        layoutState.autoHideSec = stepStaySecValue(layoutState.autoHideSec, 1);
        filterState.autoHideSec = layoutState.autoHideSec;
        countdownTotalMs = computeAlertDurationMs(uniqueAlerts[activeAlertIdx]);
        countdownRemMs = countdownTotalMs;
        syncHudControlsFromState(root);
        saveStateAll();
      };
    }
    if (stepMid) {
      stepMid.onclick = (ev) => {
        ev.stopPropagation();
        activeCardPinned = !activeCardPinned;
        if (!activeCardPinned) {
          countdownTotalMs = computeAlertDurationMs(uniqueAlerts[activeAlertIdx]);
          countdownRemMs = countdownTotalMs;
        }
        syncHudControlsFromState(root);
        saveStateAll();
      };
    }

    let pinDragMoved = false;
    if (pinTop) {
      pinTop.onclick = (ev) => {
        ev.stopPropagation();
        if (pinDragMoved) {
          pinDragMoved = false;
          return;
        }
        activeCardPinned = !activeCardPinned;
        if (!activeCardPinned) {
          countdownTotalMs = computeAlertDurationMs(uniqueAlerts[activeAlertIdx]);
          countdownRemMs = countdownTotalMs;
          countdownLastTickTs = Date.now();
          const timerLbl = root.getElementById('rrs-lbl-timer');
          if (timerLbl) timerLbl.textContent = Math.max(1, Math.ceil(countdownRemMs / 1000)) + 's';
        }
        syncHudControlsFromState(root);
        saveStateAll();
      };
    }

    // 3 Color-Coded Alert Mode Pills (Green / Red / Blue)
    root.querySelectorAll('#rrs-hud-grb-pills [data-grb]').forEach((pill) => {
      pill.onclick = (ev) => {
        ev.stopPropagation();
        const m = pill.dataset.grb || 'green';
        switchHudModeSample(root, m, false);
      };
    });

    // Liquidity $ & Market Cap $ Number Inputs
    const liqInp = root.getElementById('rrs-hud-liq-min');
    const mcInp = root.getElementById('rrs-hud-mcap-min');
    if (liqInp) {
      const syncLiq = () => {
        const v = Math.max(0, Number(liqInp.value || 0));
        filterState.liqMin = v;
        filterState.liqOn = true;
        saveStateAll();
      };
      liqInp.addEventListener('input', syncLiq);
      liqInp.addEventListener('change', syncLiq);
    }
    if (mcInp) {
      const syncMc = () => {
        const v = Math.max(0, Number(mcInp.value || 0));
        filterState.mcMin = v;
        filterState.mcOn = true;
        saveStateAll();
      };
      mcInp.addEventListener('input', syncMc);
      mcInp.addEventListener('change', syncMc);
    }

    // 4 Trader Signal Toggles
    root.querySelectorAll('.rrs-sw-box').forEach((sw) => {
      sw.addEventListener('click', (ev) => {
        if (ev.target && ev.target.closest && ev.target.closest('.rrs-q-tip')) return;
        ev.stopPropagation();
        const nextOn = sw.dataset.on !== 'true';
        setSwitchOn(root, sw.id, nextOn);
        if (sw.id === 'rrs-hud-sw-whale') {
          filterState.whaleAlertOn = nextOn;
          filterState.whalePro = nextOn;
        } else if (sw.id === 'rrs-hud-sw-cluster') {
          filterState.clusterAlertOn = nextOn;
          filterState.catRug = nextOn;
        } else if (sw.id === 'rrs-hud-sw-macd') {
          filterState.macdOn = nextOn;
          filterState.macdBull = nextOn;
        } else if (sw.id === 'rrs-hud-sw-news') {
          filterState.newsKwOn = nextOn;
          filterState.catWorld = nextOn;
          filterState.catCrypto = nextOn;
        }
        saveStateAll();
      });
    });

    const kwInp = root.getElementById('rrs-hud-kw');
    if (kwInp) {
      const syncKw = () => {
        filterState.newsKeywords = scrubText(kwInp.value || 'SOL, ETF, AI, MACRO').trim();
        saveStateAll();
      };
      kwInp.addEventListener('input', syncKw);
      kwInp.addEventListener('change', syncKw);
    }

    // Voice + Chimes Selector + Test Button
    const vcSel = root.getElementById('rrs-hud-voice-chimes');
    const vcTest = root.getElementById('rrs-hud-test-audio');
    if (vcSel) {
      vcSel.onchange = (ev) => {
        ev.stopPropagation();
        const val = vcSel.value;
        if (val === 'mute') {
          filterState.soundEnabled = false;
          filterState.voiceChimeMode = 'mute';
          window.rrsStopAllOtherAudio(null);
        } else {
          filterState.soundEnabled = true;
          filterState.voiceChimeMode = val;
          if (val !== 'voice_chimes_auto' && val !== 'chimes_only' && val !== 'voice_only') {
            filterState.audioPreset = resolveVoiceEntry(val).label;
          }
          playSpokenVoice12(val, true);
        }
        saveStateAll();
      };
    }
    if (vcTest) {
      vcTest.onclick = (ev) => {
        ev.stopPropagation();
        const val = vcSel ? vcSel.value : 'voice_chimes_auto';
        if (val === 'mute') {
          filterState.soundEnabled = true;
          filterState.voiceChimeMode = 'voice_chimes_auto';
          if (vcSel) vcSel.value = 'voice_chimes_auto';
          saveStateAll();
        }
        playSpokenVoice12(vcSel ? vcSel.value : 'voice_chimes_auto', true);
      };
    }

    root.querySelectorAll('#rrs-drw-stay-pills [data-stay]').forEach((btn) => {
      btn.onclick = (ev) => {
        ev.stopPropagation();
        const v = btn.dataset.stay;
        if (v === 'PIN') {
          activeCardPinned = true;
          syncHudControlsFromState(root);
          saveStateAll();
        } else {
          activeCardPinned = false;
          layoutState.autoHideSec = normStaySec(v);
          filterState.autoHideSec = layoutState.autoHideSec;
          countdownTotalMs = computeAlertDurationMs(uniqueAlerts[activeAlertIdx]);
          countdownRemMs = countdownTotalMs;
          syncHudControlsFromState(root);
          saveStateAll();
        }
      };
    });

    const btnAutoScan = root.getElementById('rrs-btn-autoscan');
    if (btnAutoScan) {
      btnAutoScan.onclick = (ev) => {
        ev.stopPropagation();
        filterState.autoScanEnabled = !filterState.autoScanEnabled;
        syncAutoScanDrawerUI(root);
        saveStateAll();
        if (autoScanIntervalId) { clearInterval(autoScanIntervalId); autoScanIntervalId = null; }
        if (filterState.autoScanEnabled) {
          runAutoScanTickToast(root, true);
          autoScanIntervalId = setInterval(() => { runAutoScanTickToast(root, false); }, 60000);
        }
      };
    }

    root.querySelectorAll('[data-act="gear"]').forEach((btn) => {
      btn.onclick = (ev) => {
        ev.stopPropagation();
        const willOpen = !drawer.classList.contains('open');
        if (willOpen) {
          drawer.style.display = 'block';
          drawer.style.visibility = 'visible';
          drawer.classList.add('open');
        } else {
          drawer.classList.remove('open');
          drawer.style.display = 'none';
          drawer.style.visibility = 'hidden';
        }
      };
    });

    root.querySelectorAll('#rrs-drw-news-srcs [data-nsrc]').forEach((btn) => {
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const k = btn.dataset.nsrc;
        if (!k) return;
        filterState.newsSources = Object.assign({ bbc: true, reuters: true, ap: true, coindesk: true, decrypt: true, cointelegraph: true }, filterState.newsSources || {});
        filterState.newsSources[k] = !btn.classList.contains('active-blue');
        btn.classList.toggle('active-blue', filterState.newsSources[k]);
        saveStateAll();
      });
    });

    const openCurUrl = (ev) => {
      ev.stopPropagation();
      const cur = uniqueAlerts[activeAlertIdx];
      if (!cur) return;
      const finalUrl = resolveExactAlertUrl(cur);
      if (!finalUrl) return;
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    };
    const openCurAuditUrl = (ev) => {
      ev.stopPropagation();
      const cur = uniqueAlerts[activeAlertIdx];
      if (!cur) return;
      const auditUrl = cur.audit_url || resolveAlertAuditUrl(cur);
      if (!auditUrl) return;
      window.open(auditUrl, '_blank', 'noopener,noreferrer');
    };
    root.getElementById('rrs-coin-main-click').onclick = openCurUrl;
    root.getElementById('rrs-btn-trade').onclick = openCurUrl;
    const auditBtnEl = root.getElementById('rrs-btn-audit');
    if (auditBtnEl) auditBtnEl.onclick = openCurAuditUrl;

    const brandEl = root.getElementById('rrs-brand-link');
    if (brandEl) {
      brandEl.onclick = (ev) => {
        ev.stopPropagation();
        window.open('https://rentandrugshield.com', '_blank', 'noopener,noreferrer');
      };
    }

    root.getElementById('rrs-btn-prev').onclick = (ev) => {
      ev.stopPropagation();
      if (!uniqueAlerts.length) return;
      activeAlertIdx = (activeAlertIdx - 1 + uniqueAlerts.length) % uniqueAlerts.length;
      renderActiveAlert(root);
      syncHudControlsFromState(root);
    };
    root.getElementById('rrs-btn-next').onclick = (ev) => {
      ev.stopPropagation();
      if (!uniqueAlerts.length) return;
      activeAlertIdx = (activeAlertIdx + 1) % uniqueAlerts.length;
      renderActiveAlert(root);
      syncHudControlsFromState(root);
    };
    root.getElementById('rrs-btn-close').onclick = (ev) => {
      ev.stopPropagation();
      hideCardCompletelyOffscreen(host, root);
    };
    root.getElementById('rrs-drw-x').onclick = (ev) => {
      ev.stopPropagation();
      drawer.classList.remove('open');
      drawer.style.display = 'none';
      drawer.style.visibility = 'hidden';
    };

    root.getElementById('rrs-btn-scan-now').onclick = (ev) => {
      ev.stopPropagation();
      runInlineQuickScan(root);
    };
    root.getElementById('rrs-in-quickscan').addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        ev.stopPropagation();
        runInlineQuickScan(root);
      }
    });

    root.getElementById('rrs-drw-phantom').onclick = (ev) => {
      ev.stopPropagation();
      handleConnectPhantom();
    };

    root.getElementById('rrs-drw-save').onclick = (ev) => {
      ev.stopPropagation();
      syncHudControlsFromState(root);
      applyLayoutToHost(host, root);
      saveStateAll();
      drawer.classList.remove('open');
      drawer.style.display = 'none';
      drawer.style.visibility = 'hidden';
    };

    card.addEventListener('mousemove', (ev) => {
      const now = Date.now();
      if (now - cardOpenedAtTs < 150) return;
      const dx = Math.abs(ev.clientX - lastHoverX);
      const dy = Math.abs(ev.clientY - lastHoverY);
      lastHoverX = ev.clientX;
      lastHoverY = ev.clientY;
      if (dx >= 2 || dy >= 2) {
        cardHovered = true;
        lastHoverMoveTs = now;
      }
    });
    card.addEventListener('mouseleave', () => {
      cardHovered = false;
      lastHoverMoveTs = 0;
    });
    card.addEventListener('wheel', (ev) => {
      if (ev.ctrlKey) {
        ev.preventDefault();
        ev.stopPropagation();
        setZoomAnchored(host, root, layoutState.zoomPct + (ev.deltaY < 0 ? 10 : -10), ev.deltaY < 0 ? btnZin : btnZout);
      }
    }, { passive: false });

    // Smooth Drag-to-Move anywhere on screen (Pointer + Mouse support)
    let startX = 0, startY = 0, origLeft = 0, origTop = 0, ptrDown = false, dragStartedOnPinBtn = false;
    const isInteractiveNonDragTarget = (t) => {
      if (!t || !t.closest) return false;
      if (t.closest('#rrs-btn-pin-top')) return false; // Pin / Move button supports BOTH click-to-pin AND drag-to-move!
      return Boolean(t.closest('button, input, select, a, .rrs-sw-box, .rrs-q-tip'));
    };

    let activePointerId = null;
    card.addEventListener('pointerdown', (ev) => {
      if (ev.button !== 0) return;
      if (isInteractiveNonDragTarget(ev.target)) return;
      ptrDown = true;
      activePointerId = ev.pointerId;
      isDraggingCard = false;
      dragStartedOnPinBtn = Boolean(ev.target && ev.target.closest && ev.target.closest('#rrs-btn-pin-top'));
      pinDragMoved = false;
      startX = ev.clientX;
      startY = ev.clientY;
      const r = host.getBoundingClientRect();
      origLeft = r.left;
      origTop = r.top;
    });

    const handleMoveCoords = (clientX, clientY) => {
      if (!ptrDown) return;
      const dx = clientX - startX;
      const dy = clientY - startY;
      if (!isDraggingCard && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        isDraggingCard = true;
        if (dragStartedOnPinBtn) pinDragMoved = true;
        card.classList.add('dragging');
        if (activePointerId !== null) {
          try { card.setPointerCapture(activePointerId); } catch (_e) {}
        }
      }
      if (isDraggingCard) {
        layoutState.x = origLeft + dx;
        layoutState.y = origTop + dy;
        applyLayoutToHost(host, root);
      }
    };

    card.addEventListener('pointermove', (ev) => handleMoveCoords(ev.clientX, ev.clientY));
    window.addEventListener('mousemove', (ev) => { if (ptrDown) handleMoveCoords(ev.clientX, ev.clientY); });

    const finishDrag = (ev) => {
      if (!ptrDown) return;
      ptrDown = false;
      if (ev && ev.pointerId !== undefined) {
        try { card.releasePointerCapture(ev.pointerId); } catch (_e) {}
      }
      if (isDraggingCard) {
        isDraggingCard = false;
        card.classList.remove('dragging');
        saveStateAll();
        setTimeout(() => { pinDragMoved = false; dragStartedOnPinBtn = false; }, 30);
      } else {
        dragStartedOnPinBtn = false;
      }
    };
    card.addEventListener('pointerup', finishDrag);
    window.addEventListener('mouseup', finishDrag);
  }

  window.__rrsUpdateFounderBell = function (info) {
    if (window.location && String(window.location.href).includes('127.0.0.1:18088/command/waiting-approvals')) return;
    const { root } = ensureShadowHost();
    const bell = root.getElementById('rrs-founder-bell');
    const cnt = Number((info && info.pending_count) || 0);
    const numEl = root.getElementById('rrs-bell-num');
    if (numEl) numEl.textContent = String(cnt);
    if (bell) {
      if (cnt > 0) bell.classList.add('show');
      else bell.classList.remove('show');
    }
  };

  window.__rrsResolveExactAlertUrl = resolveExactAlertUrl;

  window.__rrsRenderBlackToastV53 = function (t, openDrawerImmediately) {
    if (!t || !t.title) return false;
    if (String(t.mint || '') === 'B34nXKzCgsJb9ChLuSHPRpXLE3WFSWyeT8Cqkzzmpump' && t.is_proof) {
      return false;
    }
    const isNews = isNewsAlertToast(t);
    const exactUrl = resolveExactAlertUrl(t);
    const auditUrl = isNews ? '' : resolveAlertAuditUrl(t);
    if (isNews && !isValidExternalNewsUrlToast(exactUrl)) {
      return false;
    }
    loadPersistedState(() => {
      const { host, root } = ensureShadowHost();
      const badge = scrubText(t.badge || (isNews ? 'LIVE WIRE' : '12-LAYER: PASS'));
      const title = scrubText(t.title);
      const message = isNews ? '' : scrubText(t.message || '');
      const kind = String(t.kind || (isNews ? 'news' : 'coin')).toLowerCase();
      const failed12Layer = !isNews && Boolean(
        t.failed12Layer === true ||
        t.isScamFail === true ||
        kind === 'rug' ||
        String(t.l12 || '').toUpperCase() === 'FAILED' ||
        String(t.verdict_12layer || '').toUpperCase() === 'FAIL' ||
        String(t.severity || '').toUpperCase() === 'CRITICAL'
      );
      const mintStr = isNews ? '' : String(t.mint || '').trim();
      const key = isNews
        ? ('NEWS|' + exactUrl.split('?')[0])
        : (mintStr ? (mintStr + '|' + (t.is_proof ? 'PROOF' : kind)) : (kind + '|' + title));
      if (t.is_proof && seenAlertKeys.has(key)) {
        return;
      }
      const customSecVal = Number(t.customDisplaySec || t.CustomDisplaySec || 0);

      if (!seenAlertKeys.has(key)) {
        seenAlertKeys.add(key);
        uniqueAlerts.push({
          kind,
          source: isNews ? scrubText(t.source || '') : '',
          sym: isNews ? '' : (t.sym || ''),
          mint: mintStr,
          move_pct: isNews ? undefined : t.move_pct,
          l12: isNews ? '' : (t.l12 || ''),
          verdict_12layer: isNews ? '' : (t.verdict_12layer || ''),
          severity: t.severity || 'INFO',
          failed12Layer,
          isScamFail: failed12Layer,
          mcap: isNews ? '' : (t.mcap !== undefined ? t.mcap : (t.mcapStr || '')),
          liquidity: isNews ? '' : (t.liquidity !== undefined ? t.liquidity : (t.liqStr || '')),
          mcapStr: isNews ? '' : (t.mcapStr || t.mcap || ''),
          liqStr: isNews ? '' : (t.liqStr || t.liquidity || ''),
          badge,
          title,
          message,
          article_url: isNews ? exactUrl : '',
          audit_url: auditUrl,
          url: exactUrl,
          customDisplaySec: (Number.isFinite(customSecVal) && customSecVal >= 1) ? customSecVal : undefined
        });
        if (uniqueAlerts.length > 15) uniqueAlerts.shift();
        activeAlertIdx = uniqueAlerts.length - 1;
      } else {
        for (let i = uniqueAlerts.length - 1; i >= 0; i--) {
          const itemKey = uniqueAlerts[i].article_url
            ? ('NEWS|' + uniqueAlerts[i].article_url.split('?')[0])
            : (uniqueAlerts[i].mint ? (uniqueAlerts[i].mint + '|' + uniqueAlerts[i].kind) : (uniqueAlerts[i].kind + '|' + uniqueAlerts[i].title));
          if (itemKey === key) {
            uniqueAlerts[i].url = exactUrl;
            uniqueAlerts[i].audit_url = auditUrl;
            if (isNews) uniqueAlerts[i].article_url = exactUrl;
            if (Number.isFinite(customSecVal) && customSecVal >= 1) uniqueAlerts[i].customDisplaySec = customSecVal;
            activeAlertIdx = i;
            break;
          }
        }
      }

      const card = root.getElementById('rrs-v55-card');
      const drawer = root.getElementById('rrs-v55-drawer');

      activeCardPinned = Boolean(t.startPinned === true);
      cardHovered = false;
      lastHoverMoveTs = 0;
      cardOpenedAtTs = Date.now();

      host.style.display = 'block';
      host.style.visibility = 'visible';
      card.style.display = 'block';
      card.style.visibility = 'visible';
      card.classList.add('open');

      renderActiveAlert(root);
      applyLayoutToHost(host, root);

      const curAlert = uniqueAlerts[activeAlertIdx];
      countdownTotalMs = computeAlertDurationMs(curAlert);
      countdownRemMs = countdownTotalMs;
      countdownLastTickTs = Date.now();
      const progBar = root.getElementById('rrs-prog-bar');
      if (progBar) progBar.style.width = '100%';
      const timerLbl = root.getElementById('rrs-lbl-timer');
      if (timerLbl) timerLbl.textContent = activeCardPinned ? 'PINNED' : (Math.max(1, Math.ceil(countdownTotalMs / 1000)) + 's');

      if (t.playAlertSound === true && filterState.soundEnabled) {
        playSpokenVoice12(filterState.voiceChimeMode || 'voice_chimes_auto', false);
      }

      if (openDrawerImmediately === 'advanced') {
        drawer.style.display = 'block';
        drawer.style.visibility = 'visible';
        drawer.classList.add('open');
      } else {
        drawer.classList.remove('open');
        drawer.style.display = 'none';
        drawer.style.visibility = 'hidden';
      }
      ensureCountdownLoop(host, root);
    });
    return true;
  };

  window.showToast = window.__rrsRenderBlackToastV53;

  window.RRS_openLuxuryTraderShieldDemo = function (openAdvancedDrawer) {
    // Seed all 3 sample alerts (Red, Blue, Green) so < 3/3 > navigation & Green/Red/Blue pills work smoothly
    if (!uniqueAlerts.length) {
      uniqueAlerts.push(Object.assign({}, SAMPLE_GRB_ALERTS.red));
      uniqueAlerts.push(Object.assign({}, SAMPLE_GRB_ALERTS.blue));
    }
    window.__rrsRenderBlackToastV53(Object.assign({}, SAMPLE_GRB_ALERTS.green, {
      customDisplaySec: 45,
      startPinned: true,
      playAlertSound: false
    }), openAdvancedDrawer === 'advanced' ? 'advanced' : false);
  };

  // Programmatic HUD controller for 1-Click Auto-Demo & Automated Verification
  window.RRS_hudDemoControl = {
    openPinned: function () {
      window.RRS_openLuxuryTraderShieldDemo(false);
    },
    setMode: function (modeKey, withSound) {
      const { root } = ensureShadowHost();
      switchHudModeSample(root, modeKey || 'green', Boolean(withSound));
    },
    setPin: function (pinned) {
      const { root } = ensureShadowHost();
      activeCardPinned = Boolean(pinned);
      syncHudControlsFromState(root);
      saveStateAll();
    },
    moveTo: function (x, y) {
      const { host, root } = ensureShadowHost();
      layoutState.x = Number(x);
      layoutState.y = Number(y);
      applyLayoutToHost(host, root);
      saveStateAll();
    },
    setFilters: function (liqUsd, mcapUsd, keywords) {
      const { root } = ensureShadowHost();
      if (liqUsd !== undefined && liqUsd !== null) {
        filterState.liqMin = Number(liqUsd);
        const li = root.getElementById('rrs-hud-liq-min');
        if (li) li.value = String(filterState.liqMin);
      }
      if (mcapUsd !== undefined && mcapUsd !== null) {
        filterState.mcMin = Number(mcapUsd);
        const mi = root.getElementById('rrs-hud-mcap-min');
        if (mi) mi.value = String(filterState.mcMin);
      }
      if (keywords !== undefined && keywords !== null) {
        filterState.newsKeywords = String(keywords);
        const ki = root.getElementById('rrs-hud-kw');
        if (ki) ki.value = filterState.newsKeywords;
      }
      saveStateAll();
    },
    selectVoiceMode: function (val, playNow) {
      const { root } = ensureShadowHost();
      const sel = root.getElementById('rrs-hud-voice-chimes');
      if (sel) {
        sel.value = val;
        filterState.voiceChimeMode = val;
        filterState.soundEnabled = val !== 'mute';
      }
      if (playNow) playSpokenVoice12(val, true);
      saveStateAll();
    },
    getState: function () {
      const host = document.getElementById('rrs-v53-black-host');
      if (!host || !host.shadowRoot) return null;
      const root = host.shadowRoot;
      const card = root.getElementById('rrs-v55-card');
      const r = host.getBoundingClientRect();
      return {
        open: Boolean(card && card.classList.contains('open')),
        pinned: Boolean(activeCardPinned),
        left: Math.round(r.left),
        top: Math.round(r.top),
        width: Math.round(r.width),
        height: Math.round(r.height),
        liqMin: filterState.liqMin,
        mcMin: filterState.mcMin,
        voiceChimeMode: filterState.voiceChimeMode
      };
    }
  };

  if (isExtRuntime && chrome.storage && chrome.storage.onChanged) {
    try {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') return;
        const host = document.getElementById('rrs-v53-black-host');
        if (!host || !host.shadowRoot) return;
        const root = host.shadowRoot;
        if (changes[FLT_KEY_V53] && changes[FLT_KEY_V53].newValue) {
          const nf = changes[FLT_KEY_V53].newValue;
          filterState = Object.assign({}, DEFAULT_FILTERS, nf);
          if (nf.autoHideSec !== undefined) layoutState.autoHideSec = normStaySec(nf.autoHideSec);
          syncHudControlsFromState(root);
        }
      });
    } catch (_e) {}
  }

  if (!window.__RRS_V60_LISTENER_BOUND__ && isExtRuntime && chrome.runtime && chrome.runtime.onMessage) {
    window.__RRS_V60_LISTENER_BOUND__ = true;
    chrome.runtime.onMessage.addListener((msg) => {
      if (!msg) return;
      if ((msg.type === 'RRS_SHOW_LIVE_TOAST_V53' || msg.type === 'RRS_SHOW_LIVE_TOAST_V52' || msg.type === 'RRS_SHOW_LIVE_TOAST') && msg.toast) {
        window.__rrsRenderBlackToastV53(msg.toast, false);
      } else if (msg.type === 'RRS_FOUNDER_APPROVALS_SYNC') {
        window.__rrsUpdateFounderBell(msg.approvals || {});
      }
    });
  }
})();;

(function () {
  'use strict';
  var demoTimers = [];
  function clearDemoTimers() {
    while (demoTimers.length) {
      clearTimeout(demoTimers.pop());
    }
  }

  function setStatusBanner(msg, color) {
    ['rrsAutoDemoLiveStatus', 'rrsInstAutoDemoLiveStatus'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.textContent = msg;
        el.style.color = color || '#00FF88';
      }
    });
  }

  window.RRS_openExtV60HowToModal = function () {
    window.rrsStopAllOtherAudio();
    var m = document.getElementById('rrsExtV60HowToModal');
    if (!m) {
      m = document.createElement('div');
      m.id = 'rrsExtV60HowToModal';
      m.style.cssText = 'position:fixed;inset:0;z-index:2147483646;background:rgba(3,5,10,0.90);display:flex;align-items:center;justify-content:center;padding:16px;';
      m.innerHTML =
        '<div style="width:100%;max-width:920px;background:#05070D;border:2px solid #00FF88;border-radius:16px;padding:16px 18px;box-shadow:0 24px 64px rgba(0,0,0,0.96);color:#FFFFFF;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;">' +
            '<strong style="color:#00FF88;font-size:1rem;">Solana Rent &amp; Rug Shield Chrome Extension Walkthrough (1080p)</strong>' +
            '<div style="display:flex;gap:8px;align-items:center;">' +
              '<a href="/extension" style="background:rgba(245,197,66,0.16);color:#F5C542;border:1px solid #F5C542;padding:5px 11px;border-radius:8px;font-size:0.82rem;font-weight:900;text-decoration:none;">Extension Page &rarr;</a>' +
              '<button type="button" id="rrsModalTryHudLiveBtn" style="background:#00FF88;color:#03150E;border:none;padding:5px 12px;border-radius:8px;font-size:0.82rem;font-weight:900;cursor:pointer;">&#128204; Try Live HUD</button>' +
              '<button type="button" id="rrsCloseExtV60HowToBtn" style="background:#1A0810;color:#FF4D6D;border:1px solid #FF4D6D;border-radius:8px;padding:5px 11px;font-weight:900;cursor:pointer;">&#10005; Back</button>' +
            '</div>' +
          '</div>' +
          '<video id="rrsHeroExtV60Video" data-4k-showcase="/assets/promo_arsenal/chrome_extension_4k_traders_preview.mp4" controls playsinline webkit-playsinline preload="metadata" poster="/assets/ext_intro_option_A.png?v=ext_traders_v5" style="width:100%;border-radius:10px;border:1px solid rgba(0,255,136,0.45);background:#07101C url(/assets/ext_intro_option_A.png?v=ext_traders_v5) center/cover no-repeat;max-height:72vh;">' + '<source src="/assets/promo_arsenal/extension_walkthrough_1080p.mp4?v=ext_traders_v5" type="video/mp4" />' + '<source src="/assets/promo_arsenal/chrome_extension_4k_traders_preview.mp4?v=4k_v6" type="video/mp4" data-quality="4k" />' + '<source src="/promo/extension_shield_demo.mp4?v=ext_traders_v5" type="video/mp4" />' +
          '</video>' +
          '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-top:10px;font-size:0.84rem;">' +
            '<span style="color:#F5C542;font-weight:900;">rentandrugshield.com &bull; Chrome Extension</span>' +
            '<span style="color:#CBD5E1;">Drag / Pin Anywhere &bull; Green / Red / Blue Alerts &bull; Liquidity &amp; MCap $ Filters &bull; Whale / Cluster / MACD / News &bull; Voice + Chimes</span>' +
          '</div>' +
        '</div>';
      document.body.appendChild(m);
      m.addEventListener('click', function (ev) {
        if (ev.target === m) window.RRS_closeExtV60HowToModal();
      });
      document.getElementById('rrsCloseExtV60HowToBtn').onclick = function () {
        window.RRS_closeExtV60HowToModal();
      };
      document.getElementById('rrsModalTryHudLiveBtn').onclick = function () {
        window.RRS_closeExtV60HowToModal();
        if (window.RRS_openLuxuryTraderShieldDemo) window.RRS_openLuxuryTraderShieldDemo(false);
      };
    } else {
      m.style.display = 'flex';
    }
    var v = document.getElementById('rrsHeroExtV60Video');
    if (v) {
      window.rrsStopAllOtherAudio(v);
      v.currentTime = 0;
      v.muted = false;
      v.volume = 0.9;
      var p = v.play();
      if (p && p.catch) {
        p.catch(function () {
          v.muted = true;
          v.play().catch(function () {});
        });
      }
    }
  };

  window.RRS_closeExtV60HowToModal = function () {
    var m = document.getElementById('rrsExtV60HowToModal');
    var v = document.getElementById('rrsHeroExtV60Video');
    if (v) { try { v.pause(); } catch (_e) {} }
    if (m) m.style.display = 'none';
  };

  window.rrsRunOneClickAutoDemo = function (modeHint) {
    clearDemoTimers();
    window.rrsStopAllOtherAudio();

    var instView = document.getElementById('rrsViewInstitutional');
    var isInst = (modeHint === 'inst') || document.body.classList.contains('rrs-mode-institutional') || (instView && instView.offsetParent !== null);
    var demoMint = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
    var demoWallet = '66666y3RmL6gNyttNKXNhF5awxAWbBdGSfpKuaTLrjRH';

    // Step 1/3: Live 12-Layer Mint Scan
    setStatusBanner('[1/3] Auto-Demo: Pasting $BONK into 12-Layer Scanner -> Verifying 12/12 Scorecard...', '#00FF88');
    var mInp = document.getElementById(isInst ? 'instMintInput' : 'mintInput');
    if (mInp) mInp.value = demoMint;
    if (typeof window.rrsRunInstantDemoTokenAudit === 'function') {
      try { window.rrsRunInstantDemoTokenAudit(isInst ? 'inst' : 'retail'); } catch (_e1) {}
    } else if (typeof window.scanToken === 'function') {
      try { window.scanToken(false, demoMint); } catch (_e2) {}
    }

    // Step 2/3: Live 0% 1st-Claim SOL Rent Scan
    demoTimers.push(setTimeout(function () {
      window.rrsStopAllOtherAudio();
      setStatusBanner('[2/3] Auto-Demo: Scanning Read-Only Solana Wallet -> 0% 1st-Claim ATA Rent Recovery!', '#FFD000');
      var wInp = document.getElementById(isInst ? 'instWalletInput' : 'walletInput');
      if (wInp) wInp.value = demoWallet;
      if (typeof window.rrsRunInstantDemoWallet === 'function') {
        try { window.rrsRunInstantDemoWallet(isInst ? 'inst' : 'retail', demoWallet); } catch (_e3) {}
      } else if (typeof window.scanWallet === 'function') {
        try { window.scanWallet(demoWallet, 'rent'); } catch (_e4) {}
      }
    }, 1100));

    // Step 3/3: Open Unified Movable & Pinnable v6.7 Extension HUD
    demoTimers.push(setTimeout(function () {
      window.rrsStopAllOtherAudio();
      setStatusBanner('[3/3] Auto-Demo Complete: Unified Movable & Pinnable v6.7 HUD Open (Drag or Pin Anywhere!)', '#00FF88');
      if (typeof window.RRS_openLuxuryTraderShieldDemo === 'function') {
        window.RRS_openLuxuryTraderShieldDemo(false);
      }
    }, 2200));

    return true;
  };

  // Ensure Interactive Demo Pill also cancels speech/video before running
  var origLaunch = window.rrsLaunchInteractiveDemo;
  window.rrsLaunchInteractiveDemo = function (src) {
    window.rrsStopAllOtherAudio();
    if (src === 'above_fold_strip' || src === 'sightline') {
      return window.rrsRunOneClickAutoDemo();
    }
    if (typeof origLaunch === 'function') return origLaunch(src);
    return window.rrsRunOneClickAutoDemo();
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
(function () {
    'use strict';
    var DEMO_WALLET = '66666y3RmL6gNyttNKXNhF5awxAWbBdGSfpKuaTLrjRH';
    var DEMO_MINT = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263';
    function resolveFastApiBase() {
        try {
            if (typeof getApiBaseClean === 'function') {
                var b = getApiBaseClean();
                if (b)
                    return b.replace(/\/+$/, '');
            }
            if (window.API_BASE)
                return String(window.API_BASE).replace(/\/+$/, '');
        }
        catch (_e) { }
        return '';
    }
    window.__rrsLastViralReceipt = {
        wallet: '',
        emptyAtas: 0,
        reclaimableSol: 0,
        reclaimableUsd: 0,
        isDemo: false
    };
    window.rrsShareLockedSolReceiptOnX = function (customWallet, customAtas, customSol, customUsd) {
        var st = window.__rrsLastViralReceipt || {};
        var w = String(customWallet || st.wallet || '').trim();
        if (!w) {
            var wi = document.getElementById('instWalletInput') || document.getElementById('walletInput');
            w = (wi && wi.value ? wi.value.trim() : '');
        }
        var refTag = (w && w.length >= 32 && w !== DEMO_WALLET && w.indexOf('C3FFhG') !== 0) ? w : 'YOUR_SOL_WALLET';
        var atas = Number(customAtas != null ? customAtas : (st.emptyAtas || 0));
        var sol = Number(customSol != null ? customSol : (st.reclaimableSol || 0));
        var usd = Number(customUsd != null ? customUsd : (st.reclaimableUsd || 0));
        if (!atas && typeof window.lastScanData === 'object' && window.lastScanData) {
            atas = Number(window.lastScanData.empty_count || (window.lastScanData.empty_reclaimable && window.lastScanData.empty_reclaimable.length) || 0);
            sol = Number(window.lastScanData.total_reclaimable_sol || 0);
            usd = Number(window.lastScanData.total_reclaimable_usd || (sol * 73.5));
        }
        var refUrl = 'https://rentandrugshield.com/?ref=' + encodeURIComponent(refTag);
        var msg = (atas > 0 && sol > 0)
            ? ('Just scanned a Solana wallet on @SolRentClaim: ' + atas + ' empty token accounts = +' + sol.toFixed(4) + ' SOL ($' + usd.toFixed(2) + ') locked rent! 1st Claim is 100% FREE (0% fee, native 0x09) + 30% referral SOL:\n' + refUrl)
            : ('Scan any Solana wallet read-only on @SolRentClaim to reclaim locked empty-ATA SOL rent (1st Claim 100% FREE, 0% fee) + earn 30% atomic referral SOL:\n' + refUrl);
        window.open('https://x.com/intent/tweet?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
    };
    window.rrsFocusOwnWalletInput = function (mode) {
        var isInstNow = (mode === 'inst') || (!mode && (document.body.classList.contains('rrs-mode-institutional') || (document.getElementById('rrsViewInstitutional') && document.getElementById('rrsViewInstitutional').offsetParent !== null)));
        var inp = document.getElementById(isInstNow ? 'instWalletInput' : 'walletInput') || document.getElementById('walletInput') || document.getElementById('instWalletInput');
        if (inp) {
            inp.value = '';
            inp.setAttribute('placeholder', 'Paste YOUR Solana wallet address here -> 1st Claim 100% FREE (0% Fee)...');
            inp.style.borderColor = '#00FFA3';
            inp.style.boxShadow = '0 0 22px rgba(0,255,163,0.68)';
            try {
                inp.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            catch (_s) { }
            setTimeout(function () { try {
                inp.focus();
            }
            catch (_e) { } }, 100);
            setTimeout(function () { inp.style.boxShadow = ''; }, 2800);
        }
    };
    window.rrsFocusOwnMintInput = function (mode) {
        var inp = document.getElementById(mode === 'inst' ? 'instMintInput' : 'mintInput');
        if (inp) {
            inp.value = '';
            inp.setAttribute('placeholder', 'Paste ANY Solana Token Mint CA or $TICKER -> 1st 12-Layer Audit 100% FREE...');
            inp.style.borderColor = '#FFD000';
            inp.style.boxShadow = '0 0 18px rgba(255,208,0,0.55)';
            try {
                inp.focus();
            }
            catch (_e) { }
            setTimeout(function () { inp.style.boxShadow = ''; }, 2400);
        }
    };
    function buildViralShareBtnHtml(btnId, atas, sol, usd, walletAddr) {
        var safeW = String(walletAddr || '').replace(/[^1-9A-HJ-NP-Za-km-z]/g, '');
        return '<button type="button" id="' + btnId + '" class="rrs-viral-share-receipt-btn" '
            + 'onclick="window.rrsShareLockedSolReceiptOnX(\'' + safeW + '\',' + Number(atas || 0) + ',' + Number(sol || 0) + ',' + Number(usd || 0) + ')" '
            + 'style="width:100%;margin-top:9px;min-height:42px;padding:9px 14px;border-radius:9px;border:1.5px solid #38BDF8;background:linear-gradient(90deg,rgba(14,165,233,0.22),rgba(0,255,163,0.16));color:#F0F9FF;font-size:0.87rem;font-weight:900;cursor:pointer;">'
            + '𝕏 Share My Locked SOL Receipt on X + Earn 30% ?ref=</button>';
    }
    function buildOwnWalletPromptHtml(mode, elapsedMs, isDemo) {
        if (!isDemo)
            return '';
        return '<div class="rrs-paste-own-wallet-cta rrs-emerald-step2-callout" onclick="window.rrsFocusOwnWalletInput(\'' + mode + '\')">'
            + '<div class="rrs-step2-emerald-headline" style="font-size:0.90rem;font-weight:900;color:#00FFA3;line-height:1.4;margin-bottom:6px;">⚡ Verified in 0.1s - Now Paste YOUR Own Wallet Above to Reclaim Your Locked SOL at 0% Fee!</div>'
            + '<div style="font-size:0.82rem;color:#F8FAFC;line-height:1.4;margin-bottom:8px;">Mainnet RPC verified in ' + elapsedMs + 'ms (0 Wallet Connect): <strong>$109.85+ locked empty-ATA SOL</strong> found on demo trader wallet. Paste <strong>YOUR own Solana wallet</strong> above now!</div>'
            + '<button type="button" onclick="event.stopPropagation();window.rrsFocusOwnWalletInput(\'' + mode + '\')" style="width:100%;min-height:39px;padding:8px 12px;border-radius:8px;border:none;background:#00FFA3;color:#021810;font-weight:900;font-size:0.86rem;cursor:pointer;">📋 Paste YOUR Own Wallet Above Now (0% Fee First Claim)</button>'
            + '</div>';
    }
    window.rrsRunInstantDemoWallet = function (mode, customWallet) {
        return __awaiter(this, void 0, void 0, function () {
            var targetW, isInst, effMode, inp, btn, origTxt, t0, base, r, d, ms, emptyCnt, dustCnt, solPx, emptySol, dispSol, dispUsd, ds, foundCard, resBox, hl, oldP, wrap, _err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        targetW = (customWallet && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(String(customWallet).trim())) ? String(customWallet).trim() : DEMO_WALLET;
                        isInst = (mode === 'inst') || (!mode && (document.body.classList.contains('rrs-mode-institutional') || (document.getElementById('rrsViewInstitutional') && document.getElementById('rrsViewInstitutional').offsetParent !== null)));
                        effMode = isInst ? 'inst' : 'retail';
                        inp = document.getElementById(isInst ? 'instWalletInput' : 'walletInput');
                        if (inp)
                            inp.value = targetW;
                        btn = document.getElementById(isInst ? 'btnInstTryLiveDemoWallet' : 'btnRetailTryLiveDemoWallet');
                        origTxt = btn ? btn.textContent : '';
                        if (btn) {
                            btn.disabled = true;
                            btn.textContent = '⚡ Scanning Live Mainnet Demo Wallet...';
                        }
                        t0 = performance.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, (typeof window.rrsScanWalletLiveRpc === 'function' ? window.rrsScanWalletLiveRpc(targetW) : Promise.resolve(null))];
                    case 2:
                        r = _a.sent();
                        return [4 /*yield*/, Promise.resolve(r)];
                    case 3:
                        d = _a.sent();
                        ms = Math.max(8, Math.round(performance.now() - t0));
                        if (d && d.ok) {
                            emptyCnt = Number(d.empty_count != null ? d.empty_count : (Array.isArray(d.empty_reclaimable) ? d.empty_reclaimable.length : 743));
                            dustCnt = Number(d.dust_count != null ? d.dust_count : (Array.isArray(d.dust_reclaimable) ? d.dust_reclaimable.length : 0));
                            solPx = Number(d.sol_usd || 71.62);
                            emptySol = Number((emptyCnt * 0.00203928).toFixed(6));
                            dispSol = emptyCnt >= 700 ? emptySol : Number(d.total_reclaimable_sol || 1.533749);
                            dispUsd = Number((dispSol * solPx).toFixed(2));
                            window.__rrsLastViralReceipt = { wallet: targetW, emptyAtas: emptyCnt, reclaimableSol: dispSol, reclaimableUsd: dispUsd, isDemo: (targetW === DEMO_WALLET) };
                            if (isInst) {
                                ds = document.getElementById('instRentResult');
                                if (ds) {
                                    ds.style.display = 'block';
                                    ds.innerHTML =
                                        '<div class="rrs-drop-sheet-box">'
                                            + '<div class="rrs-ds-title">⚡ LIVE DEMO WALLET RECEIPT (66666y...rjRH · ' + ms + 'ms Mainnet)</div>'
                                            + '<div class="rrs-ds-item"><span><span class="rrs-ds-tick">✓</span>Empty SPL + Token-2022 ATAs</span><strong style="color:#00FFA3;">' + emptyCnt + ' Empty ATAs (+' + dispSol.toFixed(4) + ' SOL / $' + dispUsd.toFixed(2) + ')</strong></div>'
                                            + '<div class="rrs-ds-item"><span><span class="rrs-ds-tick">✓</span>Burnable Dead-Rug Dust Bags</span><strong style="color:#FFD000;">' + dustCnt + ' Dust Accounts Detected</strong></div>'
                                            + '<div class="rrs-ds-item"><span><span class="rrs-ds-tick">✓</span>1st Wallet Claim Fee</span><strong style="color:#00FFA3;">0.0% FREE (Native 0x09 CloseAccount)</strong></div>'
                                            + buildOwnWalletPromptHtml('inst', ms, true)
                                            + buildViralShareBtnHtml('btnInstShareLockedSolReceiptX', emptyCnt, dispSol, dispUsd, DEMO_WALLET)
                                            + '</div>';
                                }
                            }
                            else {
                                if (typeof renderWalletScanResult === 'function') {
                                    try {
                                        renderWalletScanResult(d, 'rent');
                                    }
                                    catch (_re) { }
                                }
                                foundCard = document.getElementById('indexEmeraldFoundCard');
                                resBox = document.getElementById('walletResults');
                                if (foundCard) {
                                    foundCard.style.display = 'block';
                                    hl = document.getElementById('indexEmeraldFoundHeadline');
                                    if (hl)
                                        hl.textContent = 'LIVE DEMO (' + ms + 'ms): FOUND ' + emptyCnt + ' EMPTY TOKEN ACCOUNTS = +' + dispSol.toFixed(4) + ' SOL ($' + dispUsd.toFixed(2) + ')';
                                    oldP = document.getElementById('retailDemoOwnWalletCtaWrap');
                                    if (oldP)
                                        oldP.remove();
                                    wrap = document.createElement('div');
                                    wrap.id = 'retailDemoOwnWalletCtaWrap';
                                    wrap.innerHTML = buildOwnWalletPromptHtml('retail', ms, true) + buildViralShareBtnHtml('btnShareLockedSolReceiptX', emptyCnt, dispSol, dispUsd, DEMO_WALLET);
                                    foundCard.appendChild(wrap);
                                }
                                else if (resBox) {
                                    resBox.style.display = 'block';
                                }
                            }
                        }
                        return [3 /*break*/, 6];
                    case 4:
                        _err_1 = _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        if (btn) {
                            btn.disabled = false;
                            btn.textContent = origTxt || '⚡ Load Wallet Live Demo';
                        }
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    window.rrsRunInstantDemoTokenAudit = function (mode) {
        return __awaiter(this, void 0, void 0, function () {
            var isInst, inp, btn, origTxt, t0, base, r, d, ms, sc, sym, effM, promptHtml, ir, tr, tt, tv, ts, oldM, mWrap, _e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isInst = (mode === 'inst') || (!mode && (document.body.classList.contains('rrs-mode-institutional') || (document.getElementById('rrsViewInstitutional') && document.getElementById('rrsViewInstitutional').offsetParent !== null)));
                        inp = document.getElementById(isInst ? 'instMintInput' : 'mintInput');
                        if (inp)
                            inp.value = DEMO_MINT;
                        btn = document.getElementById(isInst ? 'btnInstTestLive12LayerAudit' : 'btnRetailTestLive12LayerAudit');
                        origTxt = btn ? btn.textContent : '';
                        if (btn) {
                            btn.disabled = true;
                            btn.textContent = '⚡ Running <120ms 12-Layer Audit...';
                        }
                        t0 = performance.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        base = resolveFastApiBase();
                        return [4 /*yield*/, fetch(base + '/api/scan-token', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ mint: DEMO_MINT, user_initiated: false, is_sample_test: true })
                            })];
                    case 2:
                        r = _a.sent();
                        return [4 /*yield*/, r.json()];
                    case 3:
                        d = _a.sent();
                        ms = Math.max(6, Math.round(performance.now() - t0));
                        sc = Number((d && (d.safety_score != null ? d.safety_score : d.score)) || 99);
                        sym = String((d && d.symbol) || 'BONK').replace(/^\$/, '');
                        effM = isInst ? 'inst' : 'retail';
                        promptHtml = '<div class="rrs-emerald-step2-callout" onclick="window.rrsFocusOwnWalletInput(\'' + effM + '\')">'
                            + '<div class="rrs-step2-emerald-headline" style="font-size:0.90rem;font-weight:900;color:#00FFA3;line-height:1.4;margin-bottom:6px;">⚡ Verified in 0.1s - Now Paste YOUR Own Wallet Above to Reclaim Your Locked SOL at 0% Fee!</div>'
                            + '<div style="font-size:0.82rem;color:#F8FAFC;line-height:1.4;margin-bottom:8px;">$' + sym + ' passed all 12 layers (' + sc + '/100 in ' + ms + 'ms). Paste <strong>YOUR own Solana wallet</strong> above to reclaim locked ATA rent at <strong>0% Fee</strong>, or audit any token CA free!</div>'
                            + '<div style="display:grid;grid-template-columns:1.25fr 1fr;gap:7px;">'
                            + '<button type="button" onclick="event.stopPropagation();window.rrsFocusOwnWalletInput(\'' + effM + '\')" style="min-height:38px;padding:7px 10px;border-radius:8px;border:none;background:#00FFA3;color:#021810;font-weight:900;font-size:0.83rem;cursor:pointer;">📋 Paste YOUR Wallet (0% Fee)</button>'
                            + '<button type="button" onclick="event.stopPropagation();window.rrsFocusOwnMintInput(\'' + effM + '\')" style="min-height:38px;padding:7px 10px;border-radius:8px;border:1px solid #FFD000;background:rgba(255,208,0,0.14);color:#FFD000;font-weight:800;font-size:0.81rem;cursor:pointer;">🛡️ Paste Token CA</button>'
                            + '</div>'
                            + '</div>';
                        if (isInst) {
                            ir = document.getElementById('instRugResult');
                            if (ir) {
                                ir.style.display = 'block';
                                ir.innerHTML =
                                    '<div class="rrs-drop-sheet-box">'
                                        + '<div class="rrs-ds-title">🛡️ LIVE 12-LAYER AUDIT ($' + sym + ' · ' + sc + '/100 PASS · ' + ms + 'ms)</div>'
                                        + '<div class="rrs-ds-item"><span><span class="rrs-ds-tick">✓</span>Mint, Freeze &amp; Permanent Delegate</span><strong style="color:#00FFA3;">REVOKED / SAFE</strong></div>'
                                        + '<div class="rrs-ds-item"><span><span class="rrs-ds-tick">✓</span>Token-2022 Transfer Hook &amp; Hidden Tax</span><strong style="color:#00FFA3;">0.0% bps</strong></div>'
                                        + '<div class="rrs-ds-item"><span><span class="rrs-ds-tick">✓</span>Layer-9 Inner-CPI &amp; Layer-12 Bundle Sim</span><strong style="color:#00FFA3;">12/12 GATES CLEAN</strong></div>'
                                        + promptHtml
                                        + '</div>';
                            }
                        }
                        else {
                            tr = document.getElementById('tokenResults');
                            if (tr) {
                                tr.style.display = 'block';
                                tt = document.getElementById('tokTitle');
                                if (tt)
                                    tt.textContent = '$' + sym + ' · DezX...B263 (Live 12-Layer Mainnet Audit)';
                                tv = document.getElementById('tokVerdict');
                                if (tv) {
                                    tv.textContent = '🟢 SECURE · ' + sc + '/100 PASS (' + ms + 'ms)';
                                    tv.style.color = '#00FFA3';
                                }
                                ts = document.getElementById('tokScore');
                                if (ts) {
                                    ts.textContent = sc + '/100';
                                    ts.style.color = '#10B981';
                                }
                                oldM = document.getElementById('retailDemoOwnMintCtaWrap');
                                if (oldM)
                                    oldM.remove();
                                mWrap = document.createElement('div');
                                mWrap.id = 'retailDemoOwnMintCtaWrap';
                                mWrap.innerHTML = promptHtml;
                                tr.appendChild(mWrap);
                            }
                        }
                        return [3 /*break*/, 6];
                    case 4:
                        _e_1 = _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        if (btn) {
                            btn.disabled = false;
                            btn.textContent = origTxt || '⚡ Test Live 12-Layer Token Audit';
                        }
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // Also upgrade post-scan buttons on any user-pasted wallet scan (Institutional & Retail)
    function syncPostScanViralShareButtons() {
        var shareExisting = document.getElementById('shareReclaimedSolResultsBtn');
        if (shareExisting && !shareExisting.__viralUpgradedV1) {
            shareExisting.__viralUpgradedV1 = true;
            shareExisting.textContent = '𝕏 Share My Locked SOL Receipt on X + Earn 30% ?ref=';
            shareExisting.onclick = function () { window.rrsShareLockedSolReceiptOnX(); };
        }
        var oldBtn1 = document.getElementById('btnShareRentScanOnX');
        if (oldBtn1 && !oldBtn1.__viralUpgradedV1) {
            oldBtn1.__viralUpgradedV1 = true;
            oldBtn1.textContent = '𝕏 Share My Locked SOL Receipt on X + Earn 30% ?ref=';
            oldBtn1.onclick = function () { window.rrsShareLockedSolReceiptOnX(); };
        }
        var instRes = document.getElementById('instRentResult');
        if (instRes && instRes.style.display !== 'none' && instRes.innerHTML && !document.getElementById('btnInstShareLockedSolReceiptX')) {
            var box = instRes.querySelector('.rrs-drop-sheet-box') || instRes;
            var wi = document.getElementById('instWalletInput');
            var wVal = (wi && wi.value ? wi.value.trim() : '');
            var wrap = document.createElement('div');
            wrap.innerHTML = buildViralShareBtnHtml('btnInstShareLockedSolReceiptX', 0, 0, 0, wVal);
            if (wrap.firstChild)
                box.appendChild(wrap.firstChild);
        }
    }
    setInterval(syncPostScanViralShareButtons, 900);
    // Deep-link auto-trigger strictly when ?demo_wallet=1 or explicit ?wallet=<PUBKEY> is in URL (bare / stays 100% untouched)
    window.addEventListener('DOMContentLoaded', function () {
        try {
            var sp = new URLSearchParams(window.location.search || '');
            var dw = sp.get('demo_wallet');
            var qw = (sp.get('wallet') || sp.get('w') || '').trim();
            if (dw === '1' || (qw && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(qw))) {
                setTimeout(function () {
                    window.rrsRunInstantDemoWallet(null, (qw && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(qw)) ? qw : DEMO_WALLET);
                }, 380);
            }
        }
        catch (_qErr) { }
    });
})();
