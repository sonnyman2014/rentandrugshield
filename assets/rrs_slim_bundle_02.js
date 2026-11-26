// Ensure Transaction.prototype.serialize ALWAYS returns a synchronous Buffer with _isBuffer=true
(function patchSolanaTransactionSerialize() {
    var g = (typeof globalThis !== "undefined") ? globalThis : ((typeof window !== "undefined") ? window : this);
    if (g.solanaWeb3 && g.solanaWeb3.Transaction) {
        var TxProto = g.solanaWeb3.Transaction.prototype;
        var origSerialize_1 = TxProto.serialize;
        TxProto.serialize = function (config) {
            var cfg = Object.assign({ requireAllSignatures: true, verifySignatures: true }, config || {});
            if (typeof this._serialize === "function" && typeof this.serializeMessage === "function" && (!cfg.verifySignatures || !cfg.requireAllSignatures)) {
                var signData_1 = this.serializeMessage();
                var rawWire_1 = this._serialize(signData_1);
                var buf_1 = (g.Buffer && typeof g.Buffer.from === "function") ? g.Buffer.from(rawWire_1) : rawWire_1;
                buf_1._isBuffer = true;
                return buf_1;
            }
            var res = origSerialize_1.call(this, cfg);
            if (res && typeof res.then !== "function") {
                var buf_2 = (g.Buffer && typeof g.Buffer.from === "function") ? g.Buffer.from(res) : res;
                buf_2._isBuffer = true;
                return buf_2;
            }
            // Fallback if origSerialize was async
            var signData = this.serializeMessage();
            var rawWire = this._serialize(signData);
            var buf = (g.Buffer && typeof g.Buffer.from === "function") ? g.Buffer.from(rawWire) : rawWire;
            buf._isBuffer = true;
            return buf;
        };
    }
})();
