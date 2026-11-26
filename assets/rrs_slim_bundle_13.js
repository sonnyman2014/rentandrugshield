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
    var TRENCH_FEED_URL = "/api/live-trench-feed";
    var TRENCH_POLL_MS = 10000;
    var currentFilter = "ALL";
    var cachedItems = [];
    var base58Re = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    function escHtml(str) {
        return String(str == null ? "" : str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
    function shortMint(mint) {
        var m = String(mint || "").trim();
        if (m.length <= 10)
            return m;
        return m.slice(0, 4) + "..." + m.slice(-4);
    }
    function formatDisplaySymbol(sym) {
        var s = String(sym || "TOKEN").trim();
        if (!s)
            return "$TOKEN";
        if (s.indexOf("$") !== -1)
            return s;
        return "$" + s;
    }
    function isRugStatus(statusStr) {
        var st = String(statusStr || "").toUpperCase();
        return st.indexOf("RUG") !== -1 || st.indexOf("BLOCK") !== -1;
    }
    window.auditTrenchRadarMint = function (mintAddr) {
        var m = String(mintAddr || "").trim();
        if (!base58Re.test(m))
            return;
        var rugCard = document.getElementById("rugShieldCard");
        var mintInp = document.getElementById("mintInput");
        if (mintInp) {
            mintInp.value = m;
        }
        if (rugCard && typeof rugCard.scrollIntoView === "function") {
            rugCard.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        if (typeof window.runIndexQuickMintAudit === "function") {
            return window.runIndexQuickMintAudit(m);
        }
        if (typeof window.scanToken === "function") {
            return window.scanToken(false, m);
        }
    };
    window.setLiveTrenchFilter = function (filterMode) {
        currentFilter = String(filterMode || "ALL").toUpperCase();
        var btnAll = document.getElementById("trenchFilterAllBtn");
        var btnGrad = document.getElementById("trenchFilterGradBtn");
        var btnRug = document.getElementById("trenchFilterRugBtn");
        if (btnAll)
            btnAll.className = "trench-filter-btn" + (currentFilter === "ALL" ? " active" : "");
        if (btnGrad)
            btnGrad.className = "trench-filter-btn" + (currentFilter === "GRADUATED" ? " active" : "");
        if (btnRug)
            btnRug.className = "trench-filter-btn" + (currentFilter === "CAUGHT RUG" ? " active-rug" : "");
        renderTrenchRadar();
    };
    function renderTrenchRadar() {
        var grid = document.getElementById("liveTrenchRadarGrid");
        if (!grid || !cachedItems.length)
            return;
        var gradCount = 0;
        var rugCount = 0;
        for (var i = 0; i < cachedItems.length; i++) {
            if (isRugStatus(cachedItems[i].status))
                rugCount++;
            else
                gradCount++;
        }
        var btnAll = document.getElementById("trenchFilterAllBtn");
        var btnGrad = document.getElementById("trenchFilterGradBtn");
        var btnRug = document.getElementById("trenchFilterRugBtn");
        if (btnAll)
            btnAll.textContent = "All Live (" + cachedItems.length + ")";
        if (btnGrad)
            btnGrad.textContent = "🎓 Graduated (" + gradCount + ")";
        if (btnRug)
            btnRug.textContent = "🚨 Caught Rugs (" + rugCount + ")";
        var filtered = cachedItems.filter(function (item) {
            if (currentFilter === "GRADUATED")
                return !isRugStatus(item.status);
            if (currentFilter === "CAUGHT RUG")
                return isRugStatus(item.status);
            return true;
        }).slice(0, 8);
        if (!filtered.length)
            return;
        var cardsHtml = "";
        for (var j = 0; j < filtered.length; j++) {
            var it = filtered[j];
            var mint = String(it.mint || "").trim();
            if (!base58Re.test(mint))
                continue;
            var sym = formatDisplaySymbol(it.symbol);
            var score = Math.max(0, Math.min(100, parseInt(it.shield_score, 10) || 0));
            var age = String(it.age || "1m").trim();
            var mc = String(it.mc || "$0").trim();
            var status = String(it.status || "GRADUATED").toUpperCase();
            var rugFlag = isRugStatus(status);
            var cardCls = rugFlag ? "trench-token-card is-rug" : "trench-token-card";
            var badgeCls = rugFlag ? "trench-status-badge trench-status-rug" : "trench-status-badge trench-status-grad";
            var scoreCls = score >= 80 ? "trench-score-pass" : (score >= 50 ? "trench-score-warn" : "trench-score-fail");
            cardsHtml += ('<button type="button" class="' + cardCls + '" data-mint="' + escHtml(mint) + '" ' +
                'onclick="window.auditTrenchRadarMint(this.dataset.mint)" ' +
                'title="Click to run 12-Layer Adaptive Rug Shield Audit on ' + escHtml(mint) + '">' +
                '<div class="trench-row-top">' +
                '<span class="trench-sym">' + escHtml(sym) + '</span>' +
                '<span class="' + badgeCls + '">' + escHtml(status) + '</span>' +
                '</div>' +
                '<div class="trench-row-mid">' +
                '<span class="trench-metric ' + scoreCls + '">Shield: ' + score + '/100</span>' +
                '<span class="trench-metric">MC: ' + escHtml(mc) + ' • ' + escHtml(age) + '</span>' +
                '</div>' +
                '<div class="trench-row-bot">' +
                '<span class="trench-mint-short">' + escHtml(shortMint(mint)) + '</span>' +
                '<span class="trench-audit-cta">🛡️ Audit Mint ↗</span>' +
                '</div>' +
                '</button>');
        }
        if (cardsHtml) {
            grid.innerHTML = cardsHtml;
        }
    }
    function fetchLiveTrenchFeed() {
        return __awaiter(this, void 0, void 0, function () {
            var res, payload, list, clean, i, row, m, syncEl, nowStr, _err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch(TRENCH_FEED_URL, {
                                method: "GET",
                                cache: "no-store",
                                headers: { "Accept": "application/json" }
                            })];
                    case 1:
                        res = _a.sent();
                        if (!res || !res.ok)
                            return [2 /*return*/];
                        return [4 /*yield*/, res.json()];
                    case 2:
                        payload = _a.sent();
                        list = Array.isArray(payload) ? payload : (payload && Array.isArray(payload.items) ? payload.items : []);
                        if (!list.length)
                            return [2 /*return*/];
                        clean = [];
                        for (i = 0; i < list.length; i++) {
                            row = list[i];
                            if (!row || typeof row !== "object")
                                continue;
                            m = String(row.mint || "").trim();
                            if (!base58Re.test(m))
                                continue;
                            clean.push({
                                symbol: String(row.symbol || "TOKEN"),
                                mint: m,
                                shield_score: Math.max(0, Math.min(100, parseInt(row.shield_score, 10) || 0)),
                                age: String(row.age || "1m"),
                                mc: String(row.mc || "$0"),
                                status: String(row.status || "GRADUATED")
                            });
                        }
                        if (clean.length) {
                            cachedItems = clean;
                            renderTrenchRadar();
                            syncEl = document.getElementById("liveTrenchSyncStatus");
                            if (syncEl) {
                                nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                                syncEl.textContent = "LIVE 10s RADAR • SYNCED " + nowStr + " • CLICK MINT TO AUDIT";
                            }
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _err_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            fetchLiveTrenchFeed();
            window.setInterval(fetchLiveTrenchFeed, TRENCH_POLL_MS);
        });
    }
    else {
        fetchLiveTrenchFeed();
        window.setInterval(fetchLiveTrenchFeed, TRENCH_POLL_MS);
    }
})();
