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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
(function () {
    window.__SELECTED_CARD_MODAL_TIER = "day";
    window.selectCardModalTier = function (tierKey) {
        window.__SELECTED_CARD_MODAL_TIER = (tierKey === "monthly") ? "monthly" : "day";
        var isM = window.__SELECTED_CARD_MODAL_TIER === "monthly";
        var hp = document.getElementById("chkHeaderPriceSpan");
        var hr = document.getElementById("chkHeaderRegSpan");
        var ba = document.getElementById("chkBtnAmtSpan");
        var bd = document.getElementById("chkSelectDayBtn");
        var bm = document.getElementById("chkSelectMonthlyBtn");
        if (hp)
            hp.innerText = isM ? "$99/mo" : "$19.99/mo";
        if (hr)
            hr.innerText = isM ? "$199/mo" : "$39.99/mo";
        if (ba)
            ba.innerText = isM ? "$99.00" : "$19.99";
        if (bd)
            bd.style.border = isM ? "1px solid #475569" : "2px solid #10B981";
        if (bm)
            bm.style.border = isM ? "2px solid #10B981" : "1px solid #38BDF8";
    };
    window.openSingleAudit2cModal = function () {
        var m = document.getElementById("singleAudit2cModal");
        if (m)
            m.style.display = "flex";
    };
    window.closeSingleAudit2cModal = function () {
        var m = document.getElementById("singleAudit2cModal");
        if (m)
            m.style.display = "none";
    };
    function set10cStatus(msg, isErr) {
        var e_1, _a;
        try {
            for (var _b = __values(["singleAudit2cStatus", "instant-buy-status-index", "pass199Status"]), _c = _b.next(); !_c.done; _c = _b.next()) {
                var id = _c.value;
                var el = document.getElementById(id);
                if (el) {
                    el.style.display = "block";
                    el.style.color = isErr ? "#FCA5A5" : "#10B981";
                    el.innerHTML = msg;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    function creditSingleAuditUnlock(vRes, sig) {
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
        if (typeof updateDemoBadge === "function")
            updateDemoBadge();
        set10cStatus("<b>12-Layer Adaptive Token Audit Unlocked!</b> Verified TX: <code>" + String(sig || "").slice(0, 14) + "...</code>. Paste any mint and run your audit now.", false);
    }
    window.verifySingleAudit2cSignatureManual = function () {
        return __awaiter(this, void 0, void 0, function () {
            var inp, sig, r, d, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        inp = document.getElementById("singleAudit2cSigInput");
                        sig = inp ? inp.value.trim() : "";
                        if (!sig || sig.length < 60) {
                            set10cStatus("Please paste a valid confirmed base58 Solana transaction signature.", true);
                            return [2 /*return*/];
                        }
                        set10cStatus("Verifying on-chain Solana payment...", false);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch((window.location.port === "8088" ? "" : "") + "/api/verify-payment", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ tx_signature: sig })
                            })];
                    case 2:
                        r = _a.sent();
                        return [4 /*yield*/, r.json()];
                    case 3:
                        d = _a.sent();
                        if (d && d.ok && d.verified_onchain) {
                            if (d.plan === "MONTHLY_PRO_PASS_499") {
                                if (d.pro_pass_token)
                                    localStorage.setItem("rrs_pro_pass_token", d.pro_pass_token);
                                if (sig && sig.length >= 32)
                                    localStorage.setItem("dex6_pro_pass_tx", sig);
                                localStorage.setItem("dex6_pro_pass_unlocked", "1");
                                if (typeof updateDemoBadge === "function")
                                    updateDemoBadge();
                                set10cStatus("<b>$19.99/mo 30 Day Monthly Pro Pass Activated!</b>", false);
                            }
                            else if (d.plan === "SERVICE2_199_LAUNCH_PASS") {
                                if (d.pro_pass_token)
                                    localStorage.setItem("rrs_pro_pass_token", d.pro_pass_token);
                                if (sig && sig.length >= 32)
                                    localStorage.setItem("dex6_pro_pass_tx", sig);
                                localStorage.setItem("dex6_pro_pass_unlocked", "1");
                                if (typeof updateDemoBadge === "function")
                                    updateDemoBadge();
                                set10cStatus("<b>$19.99 30-Day Trader Pro Activated!</b>", false);
                            }
                            else {
                                creditSingleAuditUnlock(d, sig);
                            }
                        }
                        else {
                            set10cStatus(((d && d.error) || "Payment signature could not be verified on Solana Mainnet."), true);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        e_2 = _a.sent();
                        set10cStatus("Network error verifying transaction: " + (e_2.message || e_2), true);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    window.executeSingleAudit2cPay = function (assetMode) {
        return __awaiter(this, void 0, void 0, function () {
            var asset, label, p, deepUrl, phLink, cr, payer, buildRes, raw, tx, sigRes, _a, sig, vRes, inp, e_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        asset = (String(assetMode || "SOL").toUpperCase() === "USDC") ? "USDC" : "SOL";
                        label = (asset === "USDC") ? "$19.99 SPL USDC" : "$19.99/mo Pro in SOL";
                        set10cStatus("Opening " + label + " $19.99/mo Pro Pass (regularly $39.99/mo)...", false);
                        p = (window.phantom && window.phantom.solana) ? window.phantom.solana : (window.solflare || window.solana || null);
                        if (!p || (!p.signAndSendTransaction && !p.signTransaction)) {
                            deepUrl = "https://rentandrugshield.com/app.html?single10c=" + encodeURIComponent(asset);
                            phLink = "https://phantom.app/ul/browse/" + encodeURIComponent(deepUrl) + "?ref=" + encodeURIComponent("https://rentandrugshield.com");
                            set10cStatus('<a href="' + phLink + '" style="color:#FDE047;text-decoration:underline;font-weight:800;">Approve in Browser Wallet Extension to activate ' + label + '</a> (or paste TX signature above)', false);
                            return [2 /*return*/];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 9, , 10]);
                        return [4 /*yield*/, p.connect({ onlyIfTrusted: false })];
                    case 2:
                        cr = _b.sent();
                        payer = (cr && cr.publicKey) ? cr.publicKey.toString() : (p.publicKey ? p.publicKey.toString() : "");
                        return [4 /*yield*/, fetch((window.location.port === "8088" ? "" : "") + "/api/build-single-audit-tx", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ wallet: payer, asset: asset })
                            }).then(function (r) { return r.json(); })];
                    case 3:
                        buildRes = _b.sent();
                        if (!buildRes || !buildRes.ok || !buildRes.tx_base64) {
                            set10cStatus(((buildRes && buildRes.error) || "Failed to build $19.99/mo Pro transaction."), true);
                            return [2 /*return*/];
                        }
                        raw = Uint8Array.from(atob(buildRes.tx_base64), function (c) { return c.charCodeAt(0); });
                        tx = window.solanaWeb3.Transaction.from(raw);
                        if (!window.BLOWFISH_PHANTOM_TX_GUARD) return [3 /*break*/, 5];
                        return [4 /*yield*/, window.BLOWFISH_PHANTOM_TX_GUARD.signAndSendClean(p, tx)];
                    case 4:
                        _a = _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, p.signAndSendTransaction(tx)];
                    case 6:
                        _a = _b.sent();
                        _b.label = 7;
                    case 7:
                        sigRes = _a;
                        sig = String((sigRes && sigRes.signature) || sigRes || "");
                        set10cStatus("Confirming TX <code>" + sig.slice(0, 12) + "...</code> on Solana Mainnet...", false);
                        return [4 /*yield*/, fetch((window.location.port === "8088" ? "" : "") + "/api/verify-payment", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ wallet: payer, tx_signature: sig })
                            }).then(function (r) { return r.json(); })];
                    case 8:
                        vRes = _b.sent();
                        if (vRes && vRes.ok && vRes.verified_onchain) {
                            creditSingleAuditUnlock(vRes, sig);
                            setTimeout(function () { closeSingleAudit2cModal(); }, 1100);
                        }
                        else {
                            set10cStatus("TX sent (<code>" + sig.slice(0, 12) + "...</code>). Click Verify TX in a few seconds once confirmed.", false);
                            inp = document.getElementById("singleAudit2cSigInput");
                            if (inp)
                                inp.value = sig;
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        e_3 = _b.sent();
                        set10cStatus((e_3.message || "Approve the $19.99/mo Pro transfer in your Solana wallet or paste TX signature."), true);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
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
(function () {
    function getPassiveWalletBooleans() {
        var _a;
        return {
            phantom: !!((_a = window.phantom) === null || _a === void 0 ? void 0 : _a.solana),
            solflare: !!window.solflare,
            backpack: !!window.backpack
        };
    }
    var activeDwellSec = 0;
    var hbSid = (window.RentShieldTelemetry && window.RentShieldTelemetry.sessionId) || ("rs_hb_" + Math.random().toString(36).slice(2, 12));
    function resolveHbEndpoint() {
        var host = String((window.location && window.location.hostname) || "").toLowerCase();
        var isStatic = (String(window.location.port || "") !== "8088");
        var base = isStatic ? String(window.BACKEND_TUNNEL_BASE || "").replace(/\/+$/, "") : "";
        return base + "/api/human-telemetry";
    }
    function sendPassiveHeartbeat(evName, deltaSec) {
        if (navigator.webdriver === true)
            return;
        var w = getPassiveWalletBooleans();
        var payload = {
            event: evName || "dwell_heartbeat",
            session_id: hbSid,
            page: (window.location && window.location.pathname) || "/",
            origin: (window.location && window.location.origin) || "",
            ref: String(document.referrer || ""),
            dwell_seconds: activeDwellSec,
            dwell_delta_seconds: deltaSec || 0,
            phantom: w.phantom,
            solflare: w.solflare,
            backpack: w.backpack,
            wallet_apps: w,
            ts: Date.now()
        };
        try {
            fetch(resolveHbEndpoint(), {
                method: "POST",
                mode: "cors",
                credentials: "omit",
                keepalive: true,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }).catch(function () { });
        }
        catch (_e) { }
    }
    setTimeout(function () {
        if (document.visibilityState === "visible") {
            sendPassiveHeartbeat("wallet_passive_probe", 0);
        }
    }, 1800);
    setInterval(function () {
        if (document.visibilityState === "visible") {
            activeDwellSec += 15;
            sendPassiveHeartbeat("dwell_heartbeat", 15);
        }
    }, 15000);
    window.submitOneClickAlertsOptIn = function (surface) {
        return __awaiter(this, void 0, void 0, function () {
            var inp, st, btn, contact, perm, _e_1, channel, host, isStatic, base, res, _err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        inp = document.getElementById(surface === "app" ? "appAlertsOptInContactInp" : "alertsOptInContactInp");
                        st = document.getElementById(surface === "app" ? "appAlertsOptInStatusMsg" : "alertsOptInStatusMsg");
                        btn = document.getElementById(surface === "app" ? "appAlertsOptInOneClickBtn" : "alertsOptInOneClickBtn");
                        contact = inp ? String(inp.value || "").trim() : "";
                        perm = "default";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        if (!("Notification" in window && Notification.permission === "default")) return [3 /*break*/, 3];
                        return [4 /*yield*/, Notification.requestPermission().catch(function () { return "default"; })];
                    case 2:
                        perm = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        if ("Notification" in window) {
                            perm = Notification.permission;
                        }
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        _e_1 = _a.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        if (st) {
                            st.style.display = "inline-block";
                            st.style.color = "#fde047";
                            st.innerText = "Saving alert opt-in...";
                        }
                        channel = contact ? (contact.indexOf("@") === 0 || contact.toLowerCase().indexOf("t.me/") !== -1 ? "telegram" : (contact.indexOf("@") !== -1 ? "email" : "contact")) : "browser";
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 9, , 10]);
                        host = String((window.location && window.location.hostname) || "").toLowerCase();
                        isStatic = (host === "rentandrugshield.com" || host === "www.rentandrugshield.com" || host.indexOf("github.io") !== -1);
                        base = isStatic ? String(window.BACKEND_TUNNEL_BASE || "").replace(/\/+$/, "") : "";
                        return [4 /*yield*/, fetch(base + "/api/opt-in-alerts", {
                                method: "POST",
                                mode: "cors",
                                credentials: "omit",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    channel: channel,
                                    contact: contact,
                                    telegram: contact.indexOf("@") === 0 ? contact : "",
                                    browser_push: true,
                                    notification_permission: perm,
                                    page: (window.location && window.location.pathname) || "/",
                                    ref: String(document.referrer || "")
                                })
                            }).then(function (r) { return r.json(); })];
                    case 8:
                        res = _a.sent();
                        if (res && res.ok) {
                            try {
                                localStorage.setItem("rs_alerts_opted_in", "1");
                            }
                            catch (_s) { }
                            if (st) {
                                st.style.display = "inline-block";
                                st.style.color = "#10B981";
                                st.innerText = contact ? ("✅ Subscribed (" + contact + ")!") : "✅ Browser Rug & Free-SOL Alerts Active!";
                            }
                            if (btn)
                                btn.innerText = "✅ Rug & Free-SOL Alerts Active";
                        }
                        else if (st) {
                            st.style.color = "#fca5a5";
                            st.innerText = "⚠️ Could not save opt-in right now.";
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        _err_1 = _a.sent();
                        if (st) {
                            st.style.color = "#fca5a5";
                            st.innerText = "⚠️ Network error saving opt-in.";
                        }
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
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
(function () {
    if (window.__SQUAD2_TRIPLE_LOCK_INITIALIZED)
        return;
    window.__SQUAD2_TRIPLE_LOCK_INITIALIZED = true;
    function resolveApiBase() {
        var host = String((window.location && window.location.hostname) || "").toLowerCase();
        var isStatic = (String(window.location.port || "") !== "8088");
        return isStatic ? String(window.BACKEND_TUNNEL_BASE || "").replace(/\/+$/, "") : "";
    }
    // -------------------------------------------------------------------------
    // 1. Deterministic Canvas + WebGL + Audio + Screen SHA-256 Device Fingerprint
    // -------------------------------------------------------------------------
    var _cachedDeviceHashPromise = null;
    window.__RRS_DEVICE_HASH = "";
    function sha256Hex(str) {
        return __awaiter(this, void 0, void 0, function () {
            var buf, digest, _e_1, h1, h2, i, ch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!(window.crypto && window.crypto.subtle)) return [3 /*break*/, 2];
                        buf = new TextEncoder().encode(str);
                        return [4 /*yield*/, window.crypto.subtle.digest("SHA-256", buf)];
                    case 1:
                        digest = _a.sent();
                        return [2 /*return*/, Array.from(new Uint8Array(digest)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("")];
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        _e_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        h1 = 0xdeadbeef ^ str.length, h2 = 0x41c6ce57 ^ str.length;
                        for (i = 0; i < str.length; i++) {
                            ch = str.charCodeAt(i);
                            h1 = Math.imul(h1 ^ ch, 2654435761);
                            h2 = Math.imul(h2 ^ ch, 1597334677);
                        }
                        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
                        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
                        return [2 /*return*/, (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0") + "rrsfp2026"];
                }
            });
        });
    }
    window.getTripleLockDeviceHash = function () {
        if (_cachedDeviceHashPromise)
            return _cachedDeviceHashPromise;
        _cachedDeviceHashPromise = (function () {
            return __awaiter(this, void 0, void 0, function () {
                var parts, sc, cv, ctx, glCv, gl, dbg, OfflineCtx, actx, osc, rendered, chan, sum, j, _e4_1, digest;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            parts = [];
                            try {
                                sc = window.screen || {};
                                parts.push([sc.width || 0, sc.height || 0, sc.colorDepth || 0, window.devicePixelRatio || 1].join("x"));
                                parts.push(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
                                parts.push(String(navigator.hardwareConcurrency || 0) + "|" + String(navigator.language || "") + "|" + String(navigator.platform || ""));
                            }
                            catch (_e1) { }
                            try {
                                cv = document.createElement("canvas");
                                cv.width = 180;
                                cv.height = 36;
                                ctx = cv.getContext("2d");
                                if (ctx) {
                                    ctx.textBaseline = "top";
                                    ctx.font = "13px 'Arial'";
                                    ctx.fillStyle = "#10B981";
                                    ctx.fillRect(4, 4, 72, 22);
                                    ctx.fillStyle = "#061224";
                                    ctx.fillText("RRS-TripleLock-v1", 8, 8);
                                    parts.push(cv.toDataURL().slice(-96));
                                }
                            }
                            catch (_e2) { }
                            try {
                                glCv = document.createElement("canvas");
                                gl = glCv.getContext("webgl") || glCv.getContext("experimental-webgl");
                                if (gl) {
                                    dbg = gl.getExtension("WEBGL_debug_renderer_info");
                                    if (dbg) {
                                        parts.push(String(gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || "") + "::" + String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || ""));
                                    }
                                }
                            }
                            catch (_e3) { }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
                            if (!OfflineCtx) return [3 /*break*/, 3];
                            actx = new OfflineCtx(1, 512, 44100);
                            osc = actx.createOscillator();
                            osc.type = "triangle";
                            osc.frequency.value = 1000;
                            osc.connect(actx.destination);
                            osc.start(0);
                            return [4 /*yield*/, actx.startRendering()];
                        case 2:
                            rendered = _a.sent();
                            chan = rendered.getChannelData(0);
                            sum = 0;
                            for (j = 64; j < 192; j++)
                                sum += Math.abs(chan[j]);
                            parts.push(sum.toFixed(6));
                            _a.label = 3;
                        case 3: return [3 /*break*/, 5];
                        case 4:
                            _e4_1 = _a.sent();
                            return [3 /*break*/, 5];
                        case 5: return [4 /*yield*/, sha256Hex(parts.join("||"))];
                        case 6:
                            digest = _a.sent();
                            window.__RRS_DEVICE_HASH = digest;
                            return [2 /*return*/, digest];
                    }
                });
            });
        })();
        return _cachedDeviceHashPromise;
    };
    window.getTripleLockDeviceHash();
    // -------------------------------------------------------------------------
    // 2. Fetch Interceptor: Attach X-Device-Hash, Pro Credit Token & Pass Token
    //    + Capture Wallet Net Worth & Free SOL Telemetry
    // -------------------------------------------------------------------------
    window.__RRS_LAST_WALLET_META = {
        wallet_address: "",
        wallet_net_worth_usd: 0,
        free_sol_waiting_usd: 0
    };
    window.__RRS_MAX_VIDEO_PCT = 0;
    window.__RRS_START_TS = Date.now();
    window.__RRS_LAST_402_PAYLOAD = null;
    window.__RRS_PENDING_MINT = "";
    function peekOrPop10cToken(consume) {
        try {
            var arr = JSON.parse(localStorage.getItem("dex6_single_audit_tokens") || "[]");
            if (!Array.isArray(arr) || arr.length === 0)
                return "";
            var tok = String(arr[0] || "");
            if (consume) {
                arr.shift();
                localStorage.setItem("dex6_single_audit_tokens", JSON.stringify(arr));
                localStorage.setItem("dex6_single_audit_credits", String(arr.length));
            }
            return tok;
        }
        catch (_e) {
            return "";
        }
    }
    var _origFetchS2 = window.fetch.bind(window);
    window.fetch = function (input, init) {
        return __awaiter(this, void 0, void 0, function () {
            var urlStr, isTokenAuditCall, isWalletScanCall, fp, _a, hdrs, passTok, scTok, resp, cloned, _b, _e402_1, normalResp, wJson, _ew_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        urlStr = (typeof input === "string") ? input : ((input && input.url) ? input.url : "");
                        isTokenAuditCall = (urlStr.indexOf("/api/audit-mint") !== -1 ||
                            urlStr.indexOf("/api/scan-token") !== -1 ||
                            urlStr.indexOf("/api/scan-mint") !== -1 ||
                            (urlStr.indexOf("/api/audit") !== -1 && urlStr.indexOf("/api/audit-") === -1));
                        isWalletScanCall = urlStr.indexOf("/api/scan-wallet") !== -1;
                        if (!isTokenAuditCall) return [3 /*break*/, 8];
                        _a = window.__RRS_DEVICE_HASH;
                        if (_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, window.getTripleLockDeviceHash()];
                    case 1:
                        _a = (_c.sent());
                        _c.label = 2;
                    case 2:
                        fp = _a;
                        init = Object.assign({}, init || {});
                        hdrs = new Headers(init.headers || {});
                        if (fp)
                            hdrs.set("X-Device-Hash", fp);
                        passTok = localStorage.getItem("rrs_pro_pass_token") || "";
                        if (passTok && !hdrs.has("X-Pro-Pass-Token"))
                            hdrs.set("X-Pro-Pass-Token", passTok);
                        scTok = peekOrPop10cToken(false);
                        if (scTok && !hdrs.has("X-Single-Scan-Token"))
                            hdrs.set("X-Single-Scan-Token", scTok);
                        init.headers = hdrs;
                        if (!init.credentials)
                            init.credentials = "include";
                        return [4 /*yield*/, _origFetchS2(input, init)];
                    case 3:
                        resp = _c.sent();
                        if (resp && resp.status === 200 && scTok) {
                            peekOrPop10cToken(true);
                        }
                        if (!(resp && resp.status === 402)) return [3 /*break*/, 7];
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        cloned = resp.clone();
                        _b = window;
                        return [4 /*yield*/, cloned.json()];
                    case 5:
                        _b.__RRS_LAST_402_PAYLOAD = _c.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _e402_1 = _c.sent();
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, resp];
                    case 8: return [4 /*yield*/, _origFetchS2(input, init)];
                    case 9:
                        normalResp = _c.sent();
                        if (!(isWalletScanCall && normalResp && normalResp.ok)) return [3 /*break*/, 13];
                        _c.label = 10;
                    case 10:
                        _c.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, normalResp.clone().json()];
                    case 11:
                        wJson = _c.sent();
                        if (wJson && wJson.ok && wJson.wallet) {
                            window.__RRS_LAST_WALLET_META = {
                                wallet_address: String(wJson.wallet || ""),
                                wallet_net_worth_usd: Number(wJson.wallet_net_worth_usd || wJson.free_sol_usd || 0),
                                free_sol_waiting_usd: Number(wJson.free_sol_waiting_usd || wJson.total_reclaimable_usd || 0)
                            };
                        }
                        return [3 /*break*/, 13];
                    case 12:
                        _ew_1 = _c.sent();
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/, normalResp];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // 3. Full Button-Click & Demo-Video Watch % Telemetry Beacon
    // -------------------------------------------------------------------------
    window.sendRrsEngagementBeacon = function (eventType, extra) {
        if (navigator.webdriver === true)
            return;
        var dwellSec = Math.max(1, Math.round((Date.now() - window.__RRS_START_TS) / 1000));
        var wm = window.__RRS_LAST_WALLET_META || {};
        var curWalletInp = document.getElementById("walletInput") || document.getElementById("w-inp");
        var fallbackWallet = (curWalletInp && curWalletInp.value) ? curWalletInp.value.trim() : "";
        var body = Object.assign({
            event_type: eventType || "button_click",
            zone: (window.location && window.location.pathname) || "/",
            dwell_seconds: dwellSec,
            wallet_address: wm.wallet_address || fallbackWallet || "",
            wallet_net_worth_usd: wm.wallet_net_worth_usd || 0,
            free_sol_waiting_usd: wm.free_sol_waiting_usd || 0,
            video_watch_pct: window.__RRS_MAX_VIDEO_PCT || 0
        }, extra || {});
        try {
            _origFetchS2(resolveApiBase() + "/api/telemetry/event", {
                method: "POST",
                mode: "cors",
                keepalive: true,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            }).catch(function () { });
        }
        catch (_et) { }
    };
    document.addEventListener("click", function (ev) {
        var tgt = ev.target && ev.target.closest ? ev.target.closest("button, a.btn, a.btn-cta, a.btn-secondary, .chip, .audit-chip, [data-telemetry-btn]") : null;
        if (!tgt)
            return;
        var bId = tgt.id || tgt.getAttribute("data-telemetry-btn") || "";
        var bTxt = String(tgt.getAttribute("data-telemetry-btn") || tgt.innerText || tgt.textContent || bId || "cta").replace(/\s+/g, " ").trim().slice(0, 80);
        window.sendRrsEngagementBeacon("button_click", {
            button_id: bId,
            button_name: bTxt
        });
    }, true);
    // -------------------------------------------------------------------------
    // 4. Blurred 402 Paywall Renderer (Insider Whale & Wash-Trading Layers)
    //    + 1-Click "Deduct $19.99 from my recovered Free SOL"
    // -------------------------------------------------------------------------
    function escS2(s) {
        return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
    window.renderTripleLock402Paywall = function (payload, mintAddr, surface) {
        var p = payload || {};
        window.__RRS_PENDING_MINT = mintAddr || p.mint || "";
        var sym = escS2(p.symbol || (mintAddr ? mintAddr.slice(0, 6) : "TOKEN"));
        var checks = Array.isArray(p.checks) ? p.checks : [];
        var surfaceRows = checks.filter(function (c) { return !c.blurred; }).slice(0, 4).map(function (c) {
            var ok = c.passed !== false;
            return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 9px;margin-bottom:5px;border-radius:7px;background:rgba(15,23,42,0.85);border:1px solid rgba(16, 185, 129,0.25);font-size: 0.85rem;">'
                + '<span style="color:#e2e8f0;font-weight:800;">' + (ok ? '✅ ' : '⚠️ ') + escS2(c.label || c.name) + ': <span style="color:#CBD5E1;font-weight:600;">' + escS2(c.detail || 'Checked') + '</span></span>'
                + '<span style="color:#10B981;font-weight:900;font-size: 0.85rem;">SURFACE</span>'
                + '</div>';
        }).join("");
        var blurredHtml = ''
            + '<div class="rrs-blur-forensic-row">'
            + '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">'
            + '    <span style="font-size: 0.85rem;font-weight:900;color:#fde047;">🔒 Layer 3 &amp; 5 • Insider Whale &amp; Creator Sniper Bundle Forensics</span>'
            + '    <span style="font-size: 0.85rem;font-weight:900;padding:2px 6px;border-radius:5px;background:rgba(239,68,68,0.22);color:#fca5a5;">BLURRED • 402</span>'
            + '  </div>'
            + '  <div class="rrs-blur-secret-text">Top-1 Insider Whale: 28.4% • Linked Creator Sniper Cluster: 44.8% Across 7 Fresh Wallets • Unburned LP Risk</div>'
            + '</div>'
            + '<div class="rrs-blur-forensic-row">'
            + '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">'
            + '    <span style="font-size: 0.85rem;font-weight:900;color:#38bdf8;">🔒 Layer 8, 10 &amp; 11 • Block-0 Sybil Cluster, Spoofed .pump LP &amp; Inner-CPI Velocity</span>'
            + '    <span style="font-size: 0.85rem;font-weight:900;padding:2px 6px;border-radius:5px;background:rgba(239,68,68,0.22);color:#fca5a5;">BLURRED • 402</span>'
            + '  </div>'
            + '  <div class="rrs-blur-secret-text">5m Bot Wash Symmetry: 81.2% Self-Trades • Inner-CPI Drain Hook: 0x09 Safe • True Exit Solvency Reserve: 14.6 SOL</div>'
            + '</div>';
        var ctaHtml = ''
            + '<div class="rrs-paywall-cta-box" style="background:#0E1626;border:1.5px solid #10B981;border-radius:12px;padding:14px 16px;color:#F8FAFC;">'
            + '  <div style="font-size:0.95rem;font-weight:800;color:#FDE047;margin-bottom:6px;">Free 12-Layer Adaptive Token Audit Used: Forensic Whale &amp; Wash Layers Locked</div>'
            + '  <p style="font-size:0.92rem;color:#F8FAFC;margin-bottom:12px;line-height:1.55;">Your first 12-Layer Token Audit and first SPL 0x09 Rent Claim are 100% Free ($0 Starter). Upgrade anytime to $19.99/mo Pro (Reg. $39.99/mo), $99/mo Quant (Reg. $199/mo), or $500/mo Enterprise API.</p>'
            + '  <div style="display:flex;flex-direction:column;gap:8px;">'
            + '    <button type="button" data-telemetry-btn="paywall_unlock_pro" onclick="' + (surface === "app" ? "openAppSingleAudit2cModal()" : "openSingleAudit2cModal()") + '" style="width:100%;padding:11px 12px;border-radius:9px;border:1.5px solid #FDE047;background:linear-gradient(90deg,#10B981,#FDE047);color:#022C22;font-size:0.90rem;font-weight:800;cursor:pointer;">'
            + '      Unlock <span class="mono-price">$19.99/mo Pro</span> for 30 Days (Reg. <span class="mono-price">$39.99/mo</span>)'
            + '    </button>'
            + '    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(195px,1fr));gap:8px;">'
            + '      <button type="button" data-telemetry-btn="paywall_unlimited_199_pass" onclick="' + (surface === "app" ? "buyProPass(0.026, \'30-Day Trader Pro ($19.99/mo, Reg. $39.99/mo)\')" : "openInstantBuyBubble(\'trader_pro_1999\')") + '" style="width:100%;padding:10px 10px;border-radius:9px;border:2px solid #10B981;background:rgba(16, 185, 129,0.18);color:#F8FAFC;font-size:0.85rem;font-weight:800;cursor:pointer;">'
            + '        Recommended: <span class="mono-price">$19.99/mo Pro</span> (Reg. <span class="mono-price">$39.99/mo</span>)'
            + '      </button>'
            + '      <button type="button" data-telemetry-btn="paywall_monthly_499_pass" onclick="' + (surface === "app" ? "buyProPass(0.066, \'30-Day Trader Pro ($19.99/mo, Reg. $39.99/mo)\')" : "openInstantBuyBubble(\'trader_pro_1999\')") + '" style="width:100%;padding:10px 10px;border-radius:9px;border:1.5px solid #38BDF8;background:rgba(14,165,233,0.22);color:#F8FAFC;font-size:0.85rem;font-weight:800;cursor:pointer;">'
            + '        30-Day Trader Pro <span class="mono-price">$19.99/mo</span> (Reg. <span class="mono-price">$39.99/mo</span>)'
            + '      </button>'
            + '    </div>'
            + '    <button type="button" data-telemetry-btn="paywall_deduct_199_recovered_sol" onclick="window.deductUnlimitedPassFromRecoveredSol(\'' + escS2(window.__RRS_PENDING_MINT) + '\')" style="width:100%;padding:10px 12px;border-radius:9px;border:1.5px solid #C084FC;background:linear-gradient(90deg,rgba(147,51,234,0.34),rgba(16, 185, 129,0.22));color:#F8FAFC;font-size:0.85rem;font-weight:800;cursor:pointer;">'
            + '      Pay <span class="mono-price">$19.99/mo Pro</span> from Recovered SOL (<span class="mono-pct">0%</span> First Claim Fee)'
            + '    </button>'
            + '  </div>'
            + '  <div id="rrsDeductRecoveredStatus" style="display:none;margin-top:8px;padding:8px 10px;border-radius:8px;background:#042F2E;border:1px solid #10B981;font-size:0.84rem;color:#F8FAFC;line-height:1.5;"></div>'
            + '</div>';
        if (surface === "app") {
            var out = document.getElementById("audit-out");
            if (out) {
                out.style.display = "block";
                out.innerHTML = surfaceRows + blurredHtml + ctaHtml;
            }
            return;
        }
        var resBox = document.getElementById("tokenResults");
        if (resBox)
            resBox.style.display = "block";
        var gateBox = document.getElementById("verifiedSafeTradeGateBox");
        if (gateBox)
            gateBox.innerHTML = "";
        var tMeta = document.getElementById("tokMeta");
        if (tMeta)
            tMeta.innerText = "First free 12-Layer Adaptive Token Audit used • Unlock Choice A below";
        var tTitle = document.getElementById("tokTitle");
        if (tTitle)
            tTitle.innerText = sym + " • 12-Layer Forensic Preview (HTTP 402 Paywall)";
        var tVerdict = document.getElementById("tokVerdict");
        if (tVerdict) {
            tVerdict.innerText = "INSIDER WHALE & WASH LAYERS LOCKED: UNLOCK WITH TRADER PRO ($19.99/MO)";
            tVerdict.style.color = "#fde047";
        }
        var tScore = document.getElementById("tokScore");
        if (tScore) {
            tScore.innerText = "🔒";
            tScore.style.color = "#fde047";
        }
        var ul = document.getElementById("tokChecklist");
        if (ul) {
            ul.innerHTML = "<div style='list-style:none;'>" + surfaceRows + blurredHtml + ctaHtml + "</div>";
        }
    };
    window.deductUnlimitedPassFromRecoveredSol = function (pendingMint) {
        return __awaiter(this, void 0, void 0, function () {
            function showMsg(html, isErr) {
                if (st) {
                    st.style.display = "block";
                    st.style.color = isErr ? "#fca5a5" : "#ecfdf5";
                    st.innerHTML = html;
                }
            }
            var st, prov, wInp, wallet, cr, _ce_1, res, appUrl, ulLink, raw, tx, sigRes, _a, sig, conf, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        st = document.getElementById("rrsDeductRecoveredStatus") || document.getElementById("singleAudit2cStatus") || document.getElementById("appSingleAudit2cStatus");
                        prov = (window.phantom && window.phantom.solana) || window.solflare || window.solana || null;
                        wInp = document.getElementById("walletInput") || document.getElementById("w-inp");
                        wallet = (wInp && wInp.value) ? wInp.value.trim() : ((window.__RRS_LAST_WALLET_META && window.__RRS_LAST_WALLET_META.wallet_address) || "");
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        if (!(!wallet && prov && prov.connect)) return [3 /*break*/, 3];
                        return [4 /*yield*/, prov.connect({ onlyIfTrusted: false })];
                    case 2:
                        cr = _b.sent();
                        wallet = (cr && cr.publicKey) ? cr.publicKey.toString() : (prov.publicKey ? prov.publicKey.toString() : "");
                        if (wInp && wallet)
                            wInp.value = wallet;
                        _b.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        _ce_1 = _b.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        if (!wallet) {
                            showMsg("📋 Paste your Solana wallet address in the Wallet Rent box (or connect Phantom/Solflare) so we can bundle <b>$19.99 Unlimited Pass</b> directly from your recovered Free SOL!", true);
                            if (wInp)
                                wInp.focus();
                            return [2 /*return*/];
                        }
                        showMsg("⏳ Scanning empty ATAs &amp; bundling <b>$19.99 Unlimited Pass (0% reclaim fee)</b> from your recovered Free SOL...", false);
                        _b.label = 6;
                    case 6:
                        _b.trys.push([6, 13, , 14]);
                        return [4 /*yield*/, _origFetchS2(resolveApiBase() + "/api/deduct-pass-from-recovered-sol", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({ wallet: wallet, deduct_unlimited_pass: true })
                            }).then(function (r) { return r.json(); })];
                    case 7:
                        res = _b.sent();
                        if (!res || !res.ok || !res.tx_base64) {
                            showMsg("ℹ️ " + escS2((res && res.error) || "Saved your $19.99 recovered-SOL deduction preference! Unlock this scan for $19.99/mo Pro if 0 empty ATAs are ready."), false);
                            return [2 /*return*/];
                        }
                        if (!prov || (!prov.signAndSendTransaction && !prov.signTransaction)) {
                            appUrl = "https://rentandrugshield.com/app.html?wallet=" + encodeURIComponent(wallet) + "&deduct199=1";
                            ulLink = "https://phantom.app/ul/browse/" + encodeURIComponent(appUrl) + "?ref=" + encodeURIComponent("https://rentandrugshield.com");
                            showMsg('📲 <a href="' + ulLink + '" style="color:#fde047;font-weight:900;text-decoration:underline;">Approve in Browser Wallet Extension to Sign Combined Free-SOL Claim + $19.99 Unlimited Pass ↗</a>', false);
                            return [2 /*return*/];
                        }
                        raw = Uint8Array.from(atob(res.tx_base64), function (c) { return c.charCodeAt(0); });
                        tx = window.solanaWeb3.Transaction.from(raw);
                        if (!window.BLOWFISH_PHANTOM_TX_GUARD) return [3 /*break*/, 9];
                        return [4 /*yield*/, window.BLOWFISH_PHANTOM_TX_GUARD.signAndSendClean(prov, tx)];
                    case 8:
                        _a = _b.sent();
                        return [3 /*break*/, 11];
                    case 9: return [4 /*yield*/, prov.signAndSendTransaction(tx)];
                    case 10:
                        _a = _b.sent();
                        _b.label = 11;
                    case 11:
                        sigRes = _a;
                        sig = String((sigRes && sigRes.signature) || sigRes || "");
                        showMsg("⏳ Confirming bundled Rent Claim + $19.99 Unlimited Pass TX <code>" + escS2(sig.slice(0, 12)) + "...</code>", false);
                        return [4 /*yield*/, _origFetchS2(resolveApiBase() + "/api/confirm-reclaim-tx", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({
                                    wallet: wallet,
                                    tx_sig: sig,
                                    deduct_unlimited_pass: true,
                                    closed_empty_count: res.closed_empty_count || 0,
                                    reclaimed_lamports: res.batch_reclaimed_lamports || 0,
                                    user_net_lamports: res.user_net_lamports || 0,
                                    fee_lamports: 0
                                })
                            }).then(function (r) { return r.json(); })];
                    case 12:
                        conf = _b.sent();
                        if (conf && conf.pro_pass_token) {
                            localStorage.setItem("rrs_pro_pass_token", conf.pro_pass_token);
                        }
                        localStorage.setItem("dex6_pro_pass_unlocked", "1");
                        showMsg("🎉 <b>$19.99 Unlimited Pass Activated from Recovered Free SOL!</b> Re-running full 12-Layer audit...", false);
                        if (pendingMint) {
                            setTimeout(function () {
                                if (typeof window.scanToken === "function")
                                    window.scanToken(false, pendingMint);
                                else if (typeof window.runMintAudit === "function")
                                    window.runMintAudit();
                            }, 500);
                        }
                        return [3 /*break*/, 14];
                    case 13:
                        err_1 = _b.sent();
                        showMsg("⚠️ " + escS2(err_1.message || String(err_1)), true);
                        return [3 /*break*/, 14];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // 5. "Rug-or-Moon" 5-Second Live Candlestick Mini-Game (VEYRA vs JESTER)
    // -------------------------------------------------------------------------
    var _romTimers = {};
    function drawRomChart(canvasId, progress01, revealDone) {
        var cv = document.getElementById(canvasId);
        if (!cv)
            return;
        var ctx = cv.getContext("2d");
        var w = cv.width, h = cv.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#030917";
        ctx.fillRect(0, 0, w, h);
        // Subtle grid
        ctx.strokeStyle = "rgba(56,189,248,0.12)";
        ctx.lineWidth = 1;
        for (var gy = 25; gy < h; gy += 30) {
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.lineTo(w, gy);
            ctx.stroke();
        }
        // Normalized trajectories over 25 ticks (first 65% look neck-and-neck, final 35% VEYRA rugs -99.4% & JESTER moons +46.23%)
        var totalTicks = 24;
        var shown = Math.max(3, Math.round(totalTicks * Math.min(1, progress01)));
        var jesterPts = [100, 103, 102, 106, 108, 107, 111, 114, 112, 116, 119, 118, 122, 125, 128, 131, 136, 140, 144, 148, 151, 153, 155, 156];
        var veyraPts = [100, 104, 107, 105, 110, 113, 115, 112, 118, 121, 124, 122, 126, 129, 124, 118, 92, 58, 28, 11, 4, 2, 1, 0.6];
        function plotLine(pts, color, label, endTag, yOffset) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            for (var i = 0; i < shown; i++) {
                var x = 14 + (i / (totalTicks - 1)) * (w - 108);
                var norm = pts[i] / 165.0;
                var y = (h - 16) - norm * (h - 32);
                if (i === 0)
                    ctx.moveTo(x, y);
                else
                    ctx.lineTo(x, y);
                // Mini candle wick
                ctx.fillStyle = color;
                ctx.fillRect(x - 1.5, y - 4, 3, 8);
            }
            ctx.stroke();
            var lastVal = pts[shown - 1];
            var lx = 14 + ((shown - 1) / (totalTicks - 1)) * (w - 108);
            var ly = Math.min(h - 14, Math.max(16, (h - 16) - (lastVal / 165.0) * (h - 32)));
            ctx.font = "bold 12px 'JetBrains Mono', monospace";
            ctx.fillStyle = color;
            var pct = ((lastVal - 100)).toFixed(1);
            var sign = lastVal >= 100 ? "+" : "";
            ctx.fillText(label + " " + (revealDone ? endTag : (sign + pct + "%")), lx + 6, Math.min(h - 6, Math.max(14, ly + 4 + (yOffset || 0))));
        }
        var jVal = jesterPts[shown - 1], vVal = veyraPts[shown - 1];
        var jY = (h - 16) - (jVal / 165.0) * (h - 32);
        var vY = (h - 16) - (vVal / 165.0) * (h - 32);
        var jOff = 0, vOff = 0;
        if (Math.abs(jY - vY) < 15) {
            jOff = -8;
            vOff = 8;
        }
        plotLine(jesterPts, "#10B981", "$JESTER", "+46.2% MOON", jOff);
        plotLine(veyraPts, "#f472b6", "$VEYRA", "-99.4% RUG!", vOff);
    }
    window.startRugOrMoonChallenge = function (prefix, pickedToken) {
        var timerEl = document.getElementById(prefix + "-rom-timer");
        var revEl = document.getElementById(prefix + "-rom-forensic-reveal");
        var canvasId = prefix + "-rom-canvas";
        if (_romTimers[prefix])
            clearInterval(_romTimers[prefix]);
        if (revEl)
            revEl.style.display = "none";
        window.sendRrsEngagementBeacon("mini_game_guess", {
            button_name: "rom_guess_" + pickedToken,
            zone: prefix + "-rug-or-moon"
        });
        var tStart = performance.now();
        var durationMs = 5000;
        _romTimers[prefix] = setInterval(function () {
            var elapsed = performance.now() - tStart;
            var rem = Math.max(0, (durationMs - elapsed) / 1000);
            var prog = Math.min(1, elapsed / durationMs);
            if (timerEl)
                timerEl.innerText = rem > 0 ? ("⏱️ " + rem.toFixed(1) + "s LIVE") : "🏁 REVEALED";
            drawRomChart(canvasId, prog, prog >= 1);
            if (prog >= 1) {
                clearInterval(_romTimers[prefix]);
                _romTimers[prefix] = null;
                var won = (pickedToken === "JESTER");
                if (revEl) {
                    revEl.style.display = "block";
                    revEl.style.borderColor = won ? "#10B981" : "#f59e0b";
                    revEl.innerHTML = (won
                        ? "🏆 <b style='color:#10B981;'>NAILED IT! $JESTER Mooned (+46.23%) &amp; $VEYRA Rugged (-99.4%)!</b><br/>"
                        : "💥 <b style='color:#fde047;'>GOTCHA! $VEYRA Faked Early Green Candles Then Pulled LP (-99.4%)!</b><br/>")
                        + "🛡️ <b>How Our 12-Layer Adaptive Shield Caught $VEYRA Pre-Buy (0/100):</b> "
                        + "<code>L3 Creator Sniper Bundle (44.8%)</code> • <code>L4 Liq/MC Trap</code> • <code>L5 Unburned Custom LP</code> • <code>L10 Wash-Trade Dump</code> :  while clearing <b>$JESTER (96/100 SAFE)</b>!";
                }
            }
        }, 50);
    };
    // Initial static preview frame on load
    setTimeout(function () {
        drawRomChart("idx-rom-canvas", 0.35, false);
        drawRomChart("app-rom-canvas", 0.35, false);
    }, 120);
    // -------------------------------------------------------------------------
    // 6. Interactive 40s Walkthrough Demo Video (<video> + Canvas + Milestones)
    // -------------------------------------------------------------------------
    var _vidStates = {};
    function renderDemoVideoFrame(prefix, sec) {
        var cv = document.getElementById(prefix + "-demo-video-canvas");
        if (!cv)
            return;
        var ctx = cv.getContext("2d");
        var w = cv.width, h = cv.height;
        ctx.fillStyle = "#040b18";
        ctx.fillRect(0, 0, w, h);
        var chapters = [
            { t: 0, title: "STEP 1 • PASTE WALLET ($0 UPFRONT)", sub: "100% Read-Only Scan finds empty SPL & Token-2022 ATAs (~0.00204 SOL each)", accent: "#10B981" },
            { t: 10, title: "STEP 2 • NATIVE 0x09 CLOSEACCOUNT", sub: "1st Claim 0% Fee (Keep 100% SOL) • Repeat 2.0% • Active Held Tokens 100% Untouched", accent: "#38bdf8" },
            { t: 20, title: "STEP 3 • 11-LAYER PRE-BUY RUG SHIELD", sub: "1 Free Audit • Blocks Freeze Hooks, Sniper Bundles & Unburned LP in <120ms", accent: "#fde047" },
            { t: 30, title: "STEP 4 • 1ST AUDIT FREE OR TRADER PRO", sub: "1st Audit Free, $19.99/mo 30-Day Trader Pro, or $99/mo Quant Desk Trader Pro (Reg. $39.99/mo)!", accent: "#c084fc" }
        ];
        var ch = chapters[0];
        for (var i = 0; i < chapters.length; i++) {
            if (sec >= chapters[i].t)
                ch = chapters[i];
        }
        // Animated radar pulse
        var pulse = (sec * 42) % 65;
        ctx.strokeStyle = ch.accent;
        ctx.globalAlpha = 0.28;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w - 58, h / 2, 16 + pulse * 0.55, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = ch.accent;
        ctx.font = "bold 13px sans-serif";
        ctx.fillText(ch.title, 16, 36);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "11.5px sans-serif";
        var wrapIdx = ch.sub.length > 56 ? ch.sub.lastIndexOf(" ", 56) : ch.sub.length;
        if (wrapIdx <= 20)
            wrapIdx = 56;
        ctx.fillText(ch.sub.slice(0, wrapIdx).trim(), 16, 62);
        if (ch.sub.length > wrapIdx)
            ctx.fillText(ch.sub.slice(wrapIdx).trim(), 16, 80);
        ctx.fillStyle = "rgba(16, 185, 129,0.14)";
        ctx.fillRect(16, 102, w - 32, 28);
        ctx.strokeStyle = ch.accent;
        ctx.strokeRect(16, 102, w - 32, 28);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px 'JetBrains Mono', monospace";
        var pct = Math.min(100, Math.round((sec / 40.0) * 100));
        ctx.fillText("LIVE DEMO [" + sec.toFixed(1) + "s / 40.0s] • " + pct + "% WATCHED", 26, 120);
    }
    function ensureVidState(prefix) {
        if (!_vidStates[prefix]) {
            _vidStates[prefix] = { playing: false, sec: 0, timer: null, milestonesSent: {} };
            var cv = document.getElementById(prefix + "-demo-video-canvas");
            var vid = document.getElementById(prefix + "-demo-video-el");
            if (cv && vid && typeof cv.captureStream === "function") {
                try {
                    vid.srcObject = cv.captureStream(15);
                }
                catch (_e) { }
            }
            renderDemoVideoFrame(prefix, 0);
        }
        return _vidStates[prefix];
    }
    window.toggleRrsDemoVideo = function (prefix) {
        var st = ensureVidState(prefix);
        var btn = document.getElementById(prefix + "-demo-video-play-btn");
        var vid = document.getElementById(prefix + "-demo-video-el");
        if (st.playing) {
            st.playing = false;
            if (st.timer)
                clearInterval(st.timer);
            st.timer = null;
            if (vid && vid.pause)
                try {
                    vid.pause();
                }
                catch (_p) { }
            if (btn)
                btn.innerText = "▶️ Resume Walkthrough (" + Math.round((st.sec / 40) * 100) + "%)";
            window.sendRrsEngagementBeacon("video_pause", {
                button_name: "demo_video_pause",
                video_watch_pct: Math.round((st.sec / 40) * 100)
            });
            return;
        }
        if (st.sec >= 40)
            st.sec = 0;
        st.playing = true;
        if (vid && vid.play)
            try {
                vid.play().catch(function () { });
            }
            catch (_pl) { }
        if (btn)
            btn.innerText = "⏸️ Pause Walkthrough";
        st.timer = setInterval(function () {
            st.sec = Math.min(40, st.sec + 0.25);
            var pct = Math.min(100, Math.round((st.sec / 40.0) * 100));
            if (pct > window.__RRS_MAX_VIDEO_PCT)
                window.__RRS_MAX_VIDEO_PCT = pct;
            renderDemoVideoFrame(prefix, st.sec);
            var bar = document.getElementById(prefix + "-demo-video-bar");
            if (bar)
                bar.style.width = pct + "%";
            var badge = document.getElementById(prefix + "-video-pct-badge");
            if (badge)
                badge.innerText = "Watched: " + pct + "%";
            [25, 50, 75, 100].forEach(function (ms) {
                if (pct >= ms && !st.milestonesSent[ms]) {
                    st.milestonesSent[ms] = true;
                    window.sendRrsEngagementBeacon("video_milestone", {
                        button_name: "demo_video_" + ms + "pct",
                        video_watch_pct: ms,
                        video_milestone: ms + "%"
                    });
                }
            });
            if (st.sec >= 40) {
                clearInterval(st.timer);
                st.timer = null;
                st.playing = false;
                if (btn)
                    btn.innerText = "✅ 100% Watched :  Replay Walkthrough";
            }
        }, 250);
    };
    window.restartRrsDemoVideo = function (prefix) {
        var st = ensureVidState(prefix);
        if (st.timer)
            clearInterval(st.timer);
        st.playing = false;
        st.sec = 0;
        window.toggleRrsDemoVideo(prefix);
    };
    setTimeout(function () {
        ensureVidState("idx");
        ensureVidState("app");
    }, 160);
    // -------------------------------------------------------------------------
    // 7. Annual SOL Vault Raffle (1% of Platform Fees • 3 Yearly On-Chain Winners) + Ad Inquiry
    // -------------------------------------------------------------------------
    window.submitAnnualVaultRaffle = function (prefix) {
        return __awaiter(this, void 0, void 0, function () {
            function setVaultMsg(htmlStr, err) {
                if (!stEl)
                    return;
                stEl.style.display = "block";
                stEl.style.color = err ? "#fca5a5" : "#6EE7B7";
                stEl.style.borderColor = err ? "#ef4444" : "#10B981";
                stEl.innerHTML = htmlStr;
            }
            var p, wEl, cEl, optEl, badgeEl, stEl, wallet, contact, weekly, res, tBadge, _err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        p = prefix || "idx";
                        wEl = document.getElementById(p + "-vault-wallet-inp");
                        cEl = document.getElementById(p + "-vault-contact-inp");
                        optEl = document.getElementById(p + "-vault-weekly-optin");
                        badgeEl = document.getElementById(p + "-vault-ticket-badge");
                        stEl = document.getElementById(p + "-vault-status");
                        wallet = wEl ? wEl.value.trim() : "";
                        contact = cEl ? cEl.value.trim() : "";
                        weekly = Boolean(optEl && optEl.checked);
                        if (!wallet || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) {
                            setVaultMsg("⚠️ Please enter a valid 32 to 44 character Solana wallet address.", true);
                            if (wEl)
                                wEl.focus();
                            return [2 /*return*/];
                        }
                        if (!contact || contact.length < 3) {
                            setVaultMsg("⚠️ Please enter your Email or @Telegram handle so we can notify winners.", true);
                            if (cEl)
                                cEl.focus();
                            return [2 /*return*/];
                        }
                        setVaultMsg("⏳ Minting your sequential Annual SOL Vault ticket...", false);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, _origFetchS2(resolveApiBase() + "/api/vault-raffle-enter", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    wallet: wallet,
                                    contact: contact,
                                    weekly_optin: weekly
                                })
                            }).then(function (r) { return r.json(); })];
                    case 2:
                        res = _a.sent();
                        if (res && res.ok) {
                            tBadge = res.ticket_badge || ("Vault Ticket #" + String(res.ticket_id || "000001"));
                            if (badgeEl) {
                                badgeEl.innerText = "🎟️ " + tBadge;
                                badgeEl.style.background = "rgba(250, 204, 21, 0.22)";
                                badgeEl.style.borderColor = "#FDE047";
                                badgeEl.style.color = "#FEF08A";
                            }
                            setVaultMsg("✅ <b>" + tBadge + "</b> locked on-chain! (1% of Platform Fees • 3 Yearly On-Chain Winners)", false);
                            if (wEl)
                                wEl.value = "";
                            if (cEl)
                                cEl.value = "";
                        }
                        else {
                            setVaultMsg("⚠️ " + ((res && res.error) || "Could not register Annual SOL Vault ticket."), true);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _err_1 = _a.sent();
                        setVaultMsg("⚠️ Network error reaching Annual SOL Vault Raffle endpoint.", true);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    window.submitHolidaySolVault = window.submitAnnualVaultRaffle;
    window.submitTokenAdInquiry = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tEl, cEl, mEl, stEl, tok, cnt, msg, res, _e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tEl = document.getElementById("adInqTokenInp");
                        cEl = document.getElementById("adInqContactInp");
                        mEl = document.getElementById("adInqMsgInp");
                        stEl = document.getElementById("adInqStatusMsg");
                        tok = tEl ? tEl.value.trim() : "";
                        cnt = cEl ? cEl.value.trim() : "";
                        msg = mEl ? mEl.value.trim() : "";
                        if (!stEl)
                            return [2 /*return*/];
                        stEl.style.display = "block";
                        if (!tok && !cnt) {
                            stEl.style.borderColor = "#FACC15";
                            stEl.style.color = "#FEF08A";
                            stEl.innerText = "⚠️ Enter your Token Ticker/Mint and your Email or @Telegram handle.";
                            return [2 /*return*/];
                        }
                        stEl.style.borderColor = "#38BDF8";
                        stEl.style.color = "#E0F2FE";
                        stEl.innerText = "⏳ Sending token promotion inquiry...";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, window.__rrsResilientFeedbackPost("/api/ad-inquiry", {
                                category: "ad_inquiry",
                                project_name: tok,
                                token_mint: tok,
                                contact: cnt,
                                message: msg || ("Promote Solana token " + tok + " on Rent & Rug Shield")
                            }, "/api/feedback")];
                    case 2:
                        res = _a.sent();
                        if (res && res.ok) {
                            stEl.style.borderColor = "#10B981";
                            stEl.style.color = "#6EE7B7";
                            stEl.innerText = "✅ " + (res.message || "Thank you! Your promotion inquiry has been delivered.");
                            if (tEl)
                                tEl.value = "";
                            if (mEl)
                                mEl.value = "";
                        }
                        else {
                            stEl.style.borderColor = "#EF4444";
                            stEl.style.color = "#FCA5A5";
                            stEl.innerText = "⚠️ " + ((res && res.error) || "Could not send inquiry.");
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _e_2 = _a.sent();
                        stEl.style.borderColor = "#EF4444";
                        stEl.style.color = "#FCA5A5";
                        stEl.innerText = "⚠️ Network error sending inquiry.";
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // 8. Engineering & Product Roadmap Feedback Box (-> feedback queue)
    // -------------------------------------------------------------------------
    window.submitImproveNextFeedback = function (prefix) {
        return __awaiter(this, void 0, void 0, function () {
            var catEl, cntEl, msgEl, stEl, msg, cat, cnt, res, _e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        catEl = document.getElementById(prefix + "-improve-category");
                        cntEl = document.getElementById(prefix + "-improve-contact-inp");
                        msgEl = document.getElementById(prefix + "-improve-msg-inp");
                        stEl = document.getElementById(prefix + "-improve-status");
                        msg = msgEl ? msgEl.value.trim() : "";
                        cat = catEl ? catEl.value : "feature_request";
                        cnt = cntEl ? cntEl.value.trim() : "";
                        if (!stEl)
                            return [2 /*return*/];
                        stEl.style.display = "block";
                        if (!msg) {
                            stEl.style.color = "#fca5a5";
                            stEl.innerText = "⚠️ Please type an idea or improvement suggestion first.";
                            return [2 /*return*/];
                        }
                        stEl.style.color = "#fde047";
                        stEl.innerText = "⏳ Sending directly to our Engineering & Product Roadmap...";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, window.__rrsResilientFeedbackPost("/api/feedback", { category: cat, message: msg, contact: cnt })];
                    case 2:
                        res = _a.sent();
                        if (res && res.ok) {
                            stEl.style.color = "#10B981";
                            stEl.innerText = res.message || "✅ Thank you! Your message has been received by our Engineering & Product Roadmap.";
                            if (msgEl)
                                msgEl.value = "";
                        }
                        else {
                            stEl.style.color = "#fca5a5";
                            stEl.innerText = "⚠️ " + ((res && res.error) || "Could not save suggestion.");
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _e_3 = _a.sent();
                        stEl.style.color = "#fca5a5";
                        stEl.innerText = "⚠️ Network error sending feedback.";
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
})();
