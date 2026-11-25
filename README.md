# 🛡️ SOL Rent & Rug Shield (`rentandrugshield.com`)

[![sonnyman2014/solana-rent-rug-shield-mcp MCP server](https://glama.ai/mcp/servers/sonnyman2014/solana-rent-rug-shield-mcp/badges/score.svg)](https://glama.ai/mcp/servers/sonnyman2014/solana-rent-rug-shield-mcp) [![Solana Rent & Rug Shield MCP connector](https://glama.ai/mcp/connectors/io.github.sonnyman2014/solana-rent-rug-shield-mcp/badges/score.svg)](https://glama.ai/mcp/connectors/io.github.sonnyman2014/solana-rent-rug-shield-mcp)
**100% Client-Side Solana ATA Rent Recovery (`0%` Fee on 1st Claim • Keep 95% Net SOL on Repeat Claims) + 11-Layer Adaptive Solana Rug Shield (Deterministic On-Chain Telemetry Engine) + Native `x402` / MCP Agent Gateway**

👉 **[Launch Live Web Scanner (`0%` 1st-Claim Rent Recovery + Free 11-Layer Token Audit)](https://rentandrugshield.com/)** |  **[Telegram Scanner Bot (`@Bigmoonbag50bot`)](https://t.me/Bigmoonbag50bot)** | 📄 **[Agent Protocol Spec (`llms.txt`)](https://rentandrugshield.com/llms.txt)**

---

## ⚡ Why Solana Trench Traders & Autonomous Agents Use `rentandrugshield.com`
Every time you buy a Solana SPL or Token-2022 memecoin on Pump.fun, PumpSwap, Raydium, Jupiter, or Meteora, Solana locks **`~0.00203928 SOL`** in an Associated Token Account (ATA) rent deposit. Even after you sell 100% of the token, that empty ATA stays open on-chain holding your SOL hostage until explicitly closed via native `0x09 CloseAccount`.

1. **`0%` First-Claim Fee (`100%` of Your Recovered SOL on Claim #1; Flat `5%` Repeat Fee)**:
  : 100% client-side `@solana/web3.js` transaction construction in your browser , zero private keys or seed phrases ever leave your wallet.
  : Automatically skips frozen trap accounts so a single frozen token never bricks your batch `CloseAccount` transaction.
2. **11-Layer Adaptive Pre-Buy Solana Rug Shield (Deterministic On-Chain Telemetry Engine)**:
  : **Layer 1**: Mint Authority Revocation Check (blocks infinite supply inflation)
  : **Layer 2**: Freeze Authority & Token-2022 `DefaultAccountState` Honeypot Check
  : **Layer 3**: Top-10 Non-LP Holder & Creator Concentration Cap
  : **Layer 4**: Liquidity-to-Market-Cap Solvency Ratio
  : **Layer 5**: Canonical Burned / Locked LP Verification (blocks manual unburned PumpSwap, Raydium & Meteora LP-pull traps)
  : **Layer 6**: Token-2022 `transferFeeConfig`, `PermanentDelegate` & `TransferHook` Seizure Detector
  : **Layer 7**: Quote-Vault Exit-Liquidity Solvency Verification
  : **Layer 8**: Inner-CPI Hidden ATA Rent-Drain Shield
  : **Layer 9**: Authentic On-Chain Pool Lifecycle Age Verification
  : **Layer 10**: Live 5m / 1h Buy-to-Sell Orderflow Velocity Filter
  : **Layer 11**: **Block-0 Sybil Wallet-Cluster & Spoofed Migration LP Guard** (detects fresh Block-0 Sybil funder clusters >20% across top-15 non-pool wallets and blocks spoofed vanity `.pump` migration pools)

> **Why Our Shield Layers Keep Growing**: Our 24/7 Mainnet telemetry engine paired with **Deterministic Mainnet Telemetry** continuously catches newly deployed scam mechanics (Sybil bundles, spoofed `.pump` LPs, malicious Token-2022 hooks) in real time and Ships new deterministic layers ahead of static scanners.


## Headless Autonomous Agent `x402` Auto-Pay (`X-Payment-Tx` & MCP `audit_solana_token`)

Funded Solana wallet-agent frameworks (`solana-agent-kit`, ElizaOS `@elizaos/plugin-solana`, Goat SDK `@goat-sdk/wallet-solana`, and custom autonomous trading bots) can purchase 11-Layer Adaptive Shield audits headlessly over HTTP with zero browser popups:

* **Mainnet Treasury (`payTo`)**: `89Sv5FvnMNRid1bn8y2Ti1vJPSxWxgiW9GSLsPpBnKK1` (CAIP-2 `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` | Treasury SPL USDC ATA `BDFbaZumRyR2ceQfQqVdSXXDbJCDpEgAqgrmiUp92Hp8`)
* **10¢ (`$0.10`) Single 11-Layer Audit**: `1,400,000` lamports (`0.0014 SOL`) or `100,000` atomic SPL USDC (`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`)
* **`$1.99` 24-Hour Unlimited Pro Pass**: `26,000,000` lamports (`0.026 SOL`) or `1,990,000` atomic SPL USDC -> returns reusable `X-Pro-Pass-Token` header (`x402pp_v1...`) for unlimited sub-120ms calls
* **Payment Header**: `X-Payment-Tx: <CONFIRMED_BASE58_SOLANA_TX_SIG>` (also accepted via `X-Solana-Tx-Signature` and `PAYMENT-SIGNATURE` on `POST /mcp`, `POST /api/scan-token`, and `GET/POST /api/v1/shield-check`)
* **MCP Tool Schema (`audit_solana_token`)**: JSON-RPC 2.0 `tools/call` on `POST /mcp` with `{"name": "audit_solana_token", "arguments": {"mint": "<BASE58_MINT>"}}` (aliases: `audit_solana_token_11_layer`, `audit_solana_token_10_layer`)

### 5-Line TypeScript `x402` Auto-Pay (`solana-agent-kit` / ElizaOS / Goat SDK)

```typescript
import { Connection, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
const mcp = (await (await fetch("https://rentandrugshield.com/.well-known/mcp.json")).json()).liveStreamableHttpEndpoint ?? "https://rentandrugshield.com/mcp";
const call = (h: Record<string, string> = {}) => fetch(mcp, { method: "POST", headers: { "Content-Type": "application/json", "X-Agent-Id": agentKeypair.publicKey.toBase58(), ...h }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "audit_solana_token", arguments: { mint } } }) }).then(r => r.json());
let audit = await call(); // Set lamports: 1_400_000 (~$0.10 single 11-layer scan) or 26_000_000 ($1.99 24h Unlimited Pass -> X-Pro-Pass-Token)
if (audit.error?.httpStatus === 402 || audit.status === 402) { const sig = await sendAndConfirmTransaction(new Connection(rpcUrl, "confirmed"), new Transaction().add(SystemProgram.transfer({ fromPubkey: agentKeypair.publicKey, toPubkey: new PublicKey("89Sv5FvnMNRid1bn8y2Ti1vJPSxWxgiW9GSLsPpBnKK1"), lamports: 1_400_000 })), [agentKeypair]); audit = await call({ "X-Payment-Tx": sig, "X-Solana-Tx-Signature": sig }); }
```

### 5-Line Python `x402` Auto-Pay (`solders` + `requests` Headless Keypair Agent)

```python
import base64, time, requests; from solders.hash import Hash; from solders.message import Message; from solders.pubkey import Pubkey; from solders.system_program import TransferParams, transfer; from solders.transaction import Transaction
mcp = requests.get("https://rentandrugshield.com/.well-known/mcp.json", timeout=8).json().get("liveStreamableHttpEndpoint", "https://rentandrugshield.com/mcp")
call = lambda h={}: requests.post(mcp, headers={"X-Agent-Id": str(kp.pubkey()), **h}, json={"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "audit_solana_token", "arguments": {"mint": mint}}}, timeout=15).json()
audit = call()  # Set lamports=1_400_000 (~$0.10 single 11-layer audit) or 26_000_000 ($1.99 24h Unlimited Pass -> X-Pro-Pass-Token)
if audit.get("error", {}).get("httpStatus") == 402 or audit.get("status") == 402: bh = requests.post(rpc, json={"jsonrpc": "2.0", "id": 1, "method": "getLatestBlockhash", "params": [{"commitment": "confirmed"}]}).json()["result"]["value"]["blockhash"]; sig = requests.post(rpc, json={"jsonrpc": "2.0", "id": 1, "method": "sendTransaction", "params": [base64.b64encode(bytes(Transaction([kp], Message([transfer(TransferParams(from_pubkey=kp.pubkey(), to_pubkey=Pubkey.from_string("89Sv5FvnMNRid1bn8y2Ti1vJPSxWxgiW9GSLsPpBnKK1"), lamports=1_400_000))], kp.pubkey()), Hash.from_string(bh)))).decode(), {"encoding": "base64"}]}).json()["result"]; time.sleep(2.5); audit = call({"X-Payment-Tx": sig, "X-Solana-Tx-Signature": sig})
```

---

## 🔍 Live Mainnet Proof Wallets (Click Any Link to Auto-Scan Read-Only on Mainnet)

| Wallet Address | Empty ATAs | Reclaimable SOL | 1-Click Live Auto-Scan Link |
| :--- | :---: | :---: | :--- |
| `HYDk...TXYN` | **86** | **`0.17538 SOL`** | [⚡ Auto-Scan `HYDk...TXYN`](https://rentandrugshield.com/?wallet=HYDkdn659rbz6Fu88dsNiLqn6sMyZvhhgGTfw917TXYN) |
| `C3FF...MjrC` | **335** | **`0.50716 SOL`** | [⚡ Auto-Scan `C3FF...MjrC`](https://rentandrugshield.com/?wallet=C3FFhG83pda2veVRFwTDNyf1YT2R2U2ZHxcg8pUeMjrC) |
| `76j2...Epov` | **334** | **`0.50500 SOL`** | [⚡ Auto-Scan `76j2...Epov`](https://rentandrugshield.com/?wallet=76j2PCaXDeVD2CkEVDrnJCa5zYETmDYcgZv4gjtFEpov) |
| `HCV4...USqG` | **256** | **`0.49753 SOL`** | [⚡ Auto-Scan `HCV4...USqG`](https://rentandrugshield.com/?wallet=HCV49hQ99nQeYuKDYzNN89b2Mj78R2powQfrSb37USqG) |
| `EfGq...GRSD` | **191** | **`0.28935 SOL`** | [⚡ Auto-Scan `EfGq...GRSD`](https://rentandrugshield.com/?wallet=EfGq397M7LAeimhd6sHPeE1sa8Wx5AbXHNPX1eLxGRSD) |

---

## 🌏 中文简介 (Solana 链上空账户租金一键领回 + 11层自适应防貔貅护盾)
大多数 Solana 链上高频交易钱包都积累了 50-300+ 个空代币账户 (Empty SPL / Token-2022 ATAs)，每个空账户锁仓约 `0.00204 SOL` 租金！
- **首单 0% 手续费**: 首次领回 **100% 净 SOL 全额到账**（后续领回仅收 5% 透明服务费，比收 10%-20% 的销毁工具省 2-4 倍）。
- **11 层自适应护盾 + Autonomous Agent `x402` 无头支付**: 支持 `solana-agent-kit`、ElizaOS、Goat SDK 通过 `X-Payment-Tx` / MCP `audit_solana_token` 自动购买 `10¢` 单次扫描或 `$1.99` 24小时无限通行证。
- **立即体验**: [https://rentandrugshield.com/](https://rentandrugshield.com/) | Telegram 机器人: [@Bigmoonbag50bot](https://t.me/Bigmoonbag50bot)
