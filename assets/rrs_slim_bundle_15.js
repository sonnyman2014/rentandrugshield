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
    window.openSandboxFeedbackModal = function () {
        var m = document.getElementById("rrsFeedbackModalBackdrop");
        if (m) {
            m.hidden = false;
            m.setAttribute("aria-hidden", "false");
            m.style.display = "flex";
            m.classList.add("is-open");
        }
        var inp = document.getElementById("fbMessageInp");
        if (inp)
            setTimeout(function () { inp.focus(); }, 50);
    };
    window.openRrsFeedbackModal = window.openSandboxFeedbackModal;
    window.closeSandboxFeedbackModal = function () {
        var m = document.getElementById("rrsFeedbackModalBackdrop");
        if (m) {
            m.classList.remove("is-open");
            m.style.display = "none";
            m.setAttribute("aria-hidden", "true");
            m.hidden = true;
        }
    };
    window.closeRrsFeedbackModal = window.closeSandboxFeedbackModal;
    document.addEventListener("keydown", function (ev) {
        if (ev.key === "Escape")
            window.closeSandboxFeedbackModal();
    });
    window.submitSandboxFeedback = function (ev) {
        return __awaiter(this, void 0, void 0, function () {
            var btn, st, msgEl, msg, contact, category, website_hp, hdrs, bodyStr, r, attempt, base, _netErr_1, j, _a, _e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (ev && ev.preventDefault)
                            ev.preventDefault();
                        btn = document.getElementById("fbSubmitBtn");
                        st = document.getElementById("fbStatusMsg");
                        msgEl = document.getElementById("fbMessageInp");
                        msg = (msgEl && msgEl.value ? msgEl.value : "").trim();
                        contact = ((document.getElementById("fbContactInp") || {}).value || "").trim();
                        category = ((document.getElementById("fbCategorySel") || {}).value || "report_issue").trim();
                        website_hp = ((document.getElementById("fbWebsiteHp") || {}).value || "").trim();
                        if (!msg) {
                            st.style.color = "#F87171";
                            st.textContent = "Please enter your message first.";
                            return [2 /*return*/, false];
                        }
                        btn.disabled = true;
                        st.style.color = "#94A3B8";
                        st.textContent = "Sending...";
                        hdrs = { "Content-Type": "application/json", "Accept": "application/json" };
                        if (window.location.search.indexOf("qa_canary=1") !== -1) {
                            hdrs["X-QA-Canary-Track"] = "1";
                        }
                        bodyStr = JSON.stringify({
                            category: category,
                            contact: contact,
                            message: msg,
                            website_hp: website_hp
                        });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 13, 14, 15]);
                        r = null;
                        attempt = 0;
                        _b.label = 2;
                    case 2:
                        if (!(attempt < 2)) return [3 /*break*/, 9];
                        base = "";
                        if (!(attempt === 0 && typeof window.__rrsResolveLiveBase === "function")) return [3 /*break*/, 3];
                        base = window.__rrsResolveLiveBase() || "";
                        return [3 /*break*/, 5];
                    case 3:
                        if (!(attempt === 1 && typeof window.__rrsRefreshLiveBaseOnce === "function")) return [3 /*break*/, 5];
                        return [4 /*yield*/, window.__rrsRefreshLiveBaseOnce()];
                    case 4:
                        base = (_b.sent()) || "";
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, fetch(base + "/api/feedback", {
                                method: "POST",
                                mode: "cors",
                                credentials: "omit",
                                headers: hdrs,
                                body: bodyStr
                            })];
                    case 6:
                        r = _b.sent();
                        if (r && (r.ok || r.status === 400 || r.status === 429)) {
                            return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        _netErr_1 = _b.sent();
                        if (attempt === 1)
                            throw _netErr_1;
                        return [3 /*break*/, 8];
                    case 8:
                        attempt++;
                        return [3 /*break*/, 2];
                    case 9:
                        if (!r) return [3 /*break*/, 11];
                        return [4 /*yield*/, r.json().catch(function () { return {}; })];
                    case 10:
                        _a = (_b.sent());
                        return [3 /*break*/, 12];
                    case 11:
                        _a = {};
                        _b.label = 12;
                    case 12:
                        j = _a;
                        if (r && r.ok && j.ok !== false) {
                            st.style.color = "#10B981";
                            st.textContent = "Sent straight to Support. Thank you!";
                            if (msgEl)
                                msgEl.value = "";
                        }
                        else {
                            st.style.color = "#F87171";
                            st.textContent = (j && j.error) || ("Error HTTP " + (r ? r.status : 0));
                        }
                        return [3 /*break*/, 15];
                    case 13:
                        _e_1 = _b.sent();
                        st.style.color = "#F87171";
                        st.textContent = "Network error submitting feedback.";
                        return [3 /*break*/, 15];
                    case 14:
                        btn.disabled = false;
                        return [7 /*endfinally*/];
                    case 15: return [2 /*return*/, false];
                }
            });
        });
    };
})();
