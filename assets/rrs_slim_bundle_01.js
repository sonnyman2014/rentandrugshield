// UNIVERSAL WALLET DEEPLINK FALLBACK (Edge / Mobile / In-App Browsers)
window.openUniversalWalletDeepLink = function (providerName) {
    var currentUrl = encodeURIComponent(window.location.href);
    var ref = encodeURIComponent(window.location.origin);
    if (providerName === 'solflare') {
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "")) { /* mobile only */ }
        else {
            console.info("Desktop browser: connect via Phantom/Solflare browser extension.");
        }
    }
    else {
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "")) { /* mobile only */ }
        else {
            console.info("Desktop browser: connect via Phantom/Solflare browser extension.");
        }
    }
};;

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
(function ensureSolanaBufferPolyfill() {
    var g = (typeof globalThis !== "undefined") ? globalThis : ((typeof window !== "undefined") ? window : this);
    Object.defineProperty(Uint8Array.prototype, "_isBuffer", { value: true, writable: true, configurable: true });
    if (!Uint8Array.prototype.writeUIntLE) {
        Uint8Array.prototype.writeUIntLE = function (value, offset, byteLength) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            var val = Math.floor(Math.abs(Number(value) || 0));
            for (var i = 0; i < byteLength; i++) {
                this[offset + i] = val % 256;
                val = Math.floor(val / 256);
            }
            return offset + byteLength;
        };
    }
    if (!Uint8Array.prototype.readUIntLE) {
        Uint8Array.prototype.readUIntLE = function (offset, byteLength) {
            offset = offset >>> 0;
            byteLength = byteLength >>> 0;
            var val = 0;
            for (var i = byteLength - 1; i >= 0; i--) {
                val = (val * 256) + (this[offset + i] || 0);
            }
            return val;
        };
    }
    if (!Uint8Array.prototype.writeUInt32LE) {
        Uint8Array.prototype.writeUInt32LE = function (value, offset) {
            return this.writeUIntLE(value, offset || 0, 4);
        };
    }
    if (!Uint8Array.prototype.readUInt32LE) {
        Uint8Array.prototype.readUInt32LE = function (offset) {
            return this.readUIntLE(offset || 0, 4);
        };
    }
    if (!Uint8Array.prototype.equals) {
        Uint8Array.prototype.equals = function (other) {
            if (!other || this.length !== other.length)
                return false;
            for (var i = 0; i < this.length; i++) {
                if (this[i] !== other[i])
                    return false;
            }
            return true;
        };
    }
    var origSlice = Uint8Array.prototype.slice;
    Uint8Array.prototype.slice = function (start, end) {
        var out = origSlice.call(this, start, end);
        out._isBuffer = true;
        return out;
    };
    var origSubarray = Uint8Array.prototype.subarray;
    Uint8Array.prototype.subarray = function (start, end) {
        var out = origSubarray.call(this, start, end);
        out._isBuffer = true;
        return out;
    };
    if (!g.Buffer && g.buffer && g.buffer.Buffer) {
        g.Buffer = g.buffer.Buffer;
    }
    if (!g.Buffer) {
        function ShimBuffer(arg, encOrOffset, length) {
            var u;
            if (typeof arg === "number") {
                u = new Uint8Array(arg);
            }
            else if (typeof arg === "string") {
                if (encOrOffset === "hex") {
                    u = new Uint8Array(Math.floor(arg.length / 2));
                    for (var i = 0; i < u.length; i++)
                        u[i] = parseInt(arg.substr(i * 2, 2), 16);
                }
                else if (encOrOffset === "base64") {
                    var bin = (typeof atob === "function") ? atob(arg) : "";
                    u = new Uint8Array(bin.length);
                    for (var i = 0; i < bin.length; i++)
                        u[i] = bin.charCodeAt(i);
                }
                else {
                    u = new TextEncoder().encode(arg);
                }
            }
            else if (arg instanceof ArrayBuffer) {
                u = (length !== undefined) ? new Uint8Array(arg, encOrOffset || 0, length) : new Uint8Array(arg, encOrOffset || 0);
            }
            else if (ArrayBuffer.isView(arg)) {
                u = new Uint8Array(arg.buffer, arg.byteOffset, arg.byteLength);
            }
            else {
                u = new Uint8Array(arg || []);
            }
            u._isBuffer = true;
            return u;
        }
        Object.setPrototypeOf(ShimBuffer.prototype, Uint8Array.prototype);
        Object.setPrototypeOf(ShimBuffer, Uint8Array);
        ShimBuffer.prototype._isBuffer = true;
        ShimBuffer.from = function (v, enc, len) { return ShimBuffer(v, enc, len); };
        ShimBuffer.alloc = function (n, fill) {
            var u = new Uint8Array(n);
            if (fill !== undefined)
                u.fill(fill);
            u._isBuffer = true;
            return u;
        };
        ShimBuffer.allocUnsafe = function (n) {
            var u = new Uint8Array(n);
            u._isBuffer = true;
            return u;
        };
        ShimBuffer.isBuffer = function (b) {
            return Boolean(b && (b._isBuffer === true || b instanceof Uint8Array));
        };
        ShimBuffer.concat = function (list, totalLength) {
            var e_1, _a;
            var len = totalLength !== undefined ? totalLength : list.reduce(function (acc, cur) { return acc + cur.length; }, 0);
            var out = new Uint8Array(len);
            var offset = 0;
            try {
                for (var list_1 = __values(list), list_1_1 = list_1.next(); !list_1_1.done; list_1_1 = list_1.next()) {
                    var item = list_1_1.value;
                    out.set(item, offset);
                    offset += item.length;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (list_1_1 && !list_1_1.done && (_a = list_1.return)) _a.call(list_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            out._isBuffer = true;
            return out;
        };
        g.Buffer = ShimBuffer;
    }
    else {
        g.Buffer.prototype._isBuffer = true;
        var origIsBuffer_1 = g.Buffer.isBuffer;
        g.Buffer.isBuffer = function (b) {
            return Boolean((origIsBuffer_1 && origIsBuffer_1(b)) || (b && (b._isBuffer === true || b instanceof Uint8Array)));
        };
    }
    if (typeof window !== "undefined")
        window.Buffer = g.Buffer;
})();
