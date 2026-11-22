/**
 * rrs_sdk.ts — Solana Rent & Rug Shield v5.1 Official Zero-Dependency TypeScript SDK
 * ==================================================================================
 * Compatible with: Node 20+, Bun, Deno, Cloudflare Workers, Browser Extensions (MV3)
 * Origin  : https://rentandrugshield.com
 * Contact : ceo@rentandrugshield.com
 *
 * Canonical v5.1 Guarantees:
 *   - 0% 1st Rent Claim (<=25 empty ATAs w/ 4-lock anti-Sybil)
 *   - 2.0% flat repeat fee = 98.0% net SOL returned to user
 *   - $0 auto-billing ($19.99 Pro / $99 Whale / $500/mo Institutional API)
 *   - 30% atomic ?ref=WALLET partner split settled inside the same Solana tx
 *   - <120ms 12-Layer Helius SLA blocking Token-2022 hooks, >=6.0% 2-hop cartels & Jito traps
 */

export const RRS_DEFAULT_BASE_URL = "https://rentandrugshield.com";
export const SOLANA_CAIP2_MAINNET = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";
export const RRS_TREASURY_WALLET = "89Sv5FvnMNRid1bn8y2Ti1vJPSxWxgiW9GSLsPpBnKK1";
export const RRS_TREASURY_USDC_ATA = "BDFbaZumRyR2ceQfQqVdSXXDbJCDpEgAqgrmiUp92Hp8";
export const SPL_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

const BASE58_PUBKEY_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export interface LayerCheckResult {
  layer: number;
  id?: string;
  label?: string;
  name?: string;
  passed: boolean;
  detail?: string;
  status?: string;
  severity?: string;
}

export interface TokenAuditResponse {
  ok: boolean;
  mint: string;
  symbol: string;
  name: string;
  token_program: "SPL Token" | "Token-2022" | string;
  score: number;
  safety_score: number;
  shield_score: number;
  verdict: string;
  badge: string;
  safe_to_buy?: boolean;
  is_dead_pool: boolean;
  liquidity_viability_passed: boolean;
  price_usd: number;
  liquidity_usd: number;
  market_cap_usd: number;
  volume_24h_usd: number;
  dex_id: string;
  pool_age: string;
  mint_authority_active: boolean;
  freeze_authority_active: boolean;
  transfer_fee_bps: number;
  has_permanent_delegate: boolean;
  has_transfer_hook: boolean;
  hidden_pda_rent_trap: string | boolean | null;
  top10_holder_pct: number;
  top15_holder_pct: number;
  sybil_cluster_pct: number;
  spoofed_migration_lp: boolean;
  audit_ms: number;
  checks: LayerCheckResult[];
  risks?: string[];
  api_auth?: Record<string, unknown>;
}

export interface HonestFeeQuote {
  is_first_free_claim: boolean;
  fee_bps: number;
  fee_pct: number;
  max_free_atas?: number;
  anti_sybil_locks_verified?: number;
}

export interface WalletRentScanResponse {
  ok: boolean;
  wallet?: string;
  empty_count: number;
  dust_count?: number;
  total_reclaimable_sol: number;
  sol_usd?: number;
  is_first_free_claim: boolean;
  first_claim_fee_bps: 0;
  repeat_claim_fee_bps: 200;
  effective_fee_bps: number;
  fee_pct: number;
  honest_fee_quote: HonestFeeQuote;
  accounts?: Array<Record<string, unknown>>;
}

export interface BuildReclaimTxOptions {
  includeDustBurn?: boolean;
  mode?: "all" | "empty_only" | "selected";
  selectedPubkeys?: string[];
  reinvestPct?: number;
  deductUnlimitedPass?: boolean;
  refWallet?: string;
}

export interface BuildReclaimTxResponse {
  ok: boolean;
  wallet: string;
  batch_reclaimed_sol: number;
  user_net_lamports: number;
  user_net_sol: number;
  service_fee_lamports: number;
  service_fee_sol: number;
  treasury_wallet: string;
  affiliate_ref_wallet: string;
  affiliate_commission_pct: number;
  affiliate_referrer_lamports: number;
  blockhash: string;
  unsigned_tx_base64: string;
  tx_base64: string;
  transaction_base64: string;
}

export interface X402PaymentRequirement {
  scheme: string;
  network: string;
  option: string;
  asset: string;
  symbol: string;
  decimals: number;
  amount: string;
  priceUsd: number;
  payTo: string;
  treasuryAta?: string;
  resource: string;
  maxTimeoutSeconds: number;
}

export interface X402PaymentChallenge {
  status: 402;
  resource: string;
  treasury: string;
  treasuryUsdcAta: string;
  usdcMint: string;
  wwwAuthenticate: string;
  accepts: X402PaymentRequirement[];
  rawBody: Record<string, unknown>;
}

export interface X402PaymentProof {
  txSignature?: string;
  xPaymentBase64?: string;
  paymentOption?: string;
  proPassToken?: string;
}

export type X402SignerHandler = (
  challenge: X402PaymentChallenge,
) => Promise<X402PaymentProof | string> | X402PaymentProof | string;

export interface RRSClientConfig {
  apiKey?: string;
  refWallet?: string;
  proPassToken?: string;
  deviceHash?: string;
  agentId?: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  x402Signer?: X402SignerHandler;
}

export interface HardVetoPolicy {
  minScore?: number;
  maxCartelPct?: number;
  maxTransferFeeBps?: number;
}

export interface HardVetoVerdict {
  allowExecution: boolean;
  mint: string;
  symbol: string;
  score: number;
  auditMs: number;
  vetoReasons: string[];
  audit: TokenAuditResponse;
}

export class RRSAPIError extends Error {
  public readonly status: number;
  public readonly payload: Record<string, unknown>;

  constructor(status: number, message: string, payload: Record<string, unknown> = {}) {
    super(`HTTP ${status}: ${message}`);
    this.name = "RRSAPIError";
    this.status = status;
    this.payload = payload;
  }
}

export class RRSPaymentRequired402Error extends Error {
  public readonly challenge: X402PaymentChallenge;

  constructor(challenge: X402PaymentChallenge) {
    super(
      `HTTP 402 Payment Required for ${challenge.resource} ` +
        `(treasury=${challenge.treasury}, options=${challenge.accepts.length})`,
    );
    this.name = "RRSPaymentRequired402Error";
    this.challenge = challenge;
  }
}

export class RRSHardVetoError extends Error {
  public readonly verdict: HardVetoVerdict;

  constructor(verdict: HardVetoVerdict) {
    super(
      `HARD VETO [${verdict.symbol} / ${verdict.mint}] ` +
        `(score=${verdict.score}/100, ${verdict.auditMs}ms): ${verdict.vetoReasons.join("; ")}`,
    );
    this.name = "RRSHardVetoError";
    this.verdict = verdict;
  }
}

function encodeBase64Json(obj: Record<string, unknown>): string {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decodeBase64Json(raw: string): Record<string, unknown> {
  const trimmed = (raw || "").trim();
  if (!trimmed) return {};
  if (trimmed.startsWith("{")) {
    try {
      return JSON.parse(trimmed) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  try {
    const padded = trimmed + "=".repeat((4 - (trimmed.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const text = new TextDecoder().decode(bytes);
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function assertValidSolanaPubkey(pubkey: string, label = "wallet"): string {
  const clean = (pubkey || "").trim();
  if (!BASE58_PUBKEY_RE.test(clean)) {
    throw new Error(`Invalid Solana base58 ${label}: "${pubkey}"`);
  }
  return clean;
}

export function evaluateTokenHardVeto(
  audit: TokenAuditResponse,
  policy: HardVetoPolicy = {},
): HardVetoVerdict {
  const minScore = policy.minScore ?? 80;
  const maxCartelPct = policy.maxCartelPct ?? 6.0;
  const maxTransferFeeBps = policy.maxTransferFeeBps ?? 0;
  const reasons: string[] = [];

  if (!audit.ok) {
    reasons.push("AUDIT_NOT_OK");
  }

  // 1. Token-2022 Hooks, Permanent Delegates, Transfer Tax & Active Mint/Freeze Auth
  if (audit.has_transfer_hook) {
    reasons.push("TOKEN_2022_TRANSFER_HOOK_ACTIVE");
  }
  if (audit.has_permanent_delegate) {
    reasons.push("TOKEN_2022_PERMANENT_DELEGATE_ACTIVE");
  }
  if ((audit.transfer_fee_bps ?? 0) > maxTransferFeeBps) {
    reasons.push(`TOKEN_2022_TRANSFER_FEE_${audit.transfer_fee_bps}BPS`);
  }
  if (audit.freeze_authority_active) {
    reasons.push("FREEZE_AUTHORITY_ACTIVE");
  }
  if (audit.mint_authority_active) {
    reasons.push("MINT_AUTHORITY_ACTIVE");
  }

  // 2. >= 6.0% 2-Hop Insider / Slot-0 Sybil Cartel Concentration
  const cartelPct = Number(audit.sybil_cluster_pct ?? 0);
  if (cartelPct >= maxCartelPct) {
    reasons.push(`TWO_HOP_SYBIL_CARTEL_${cartelPct.toFixed(2)}PCT_GTE_${maxCartelPct.toFixed(1)}PCT`);
  }

  // 3. Jito Sandwich Pools, Slot-0 Bundles, Dead/Spoofed LPs & Layer-9 Inner-CPI Traps
  if (audit.is_dead_pool || audit.liquidity_viability_passed === false) {
    reasons.push("DEAD_OR_ILLIQUID_POOL");
  }
  if (audit.spoofed_migration_lp) {
    reasons.push("SPOOFED_MIGRATION_LP");
  }
  if (audit.hidden_pda_rent_trap) {
    reasons.push(`LAYER9_HIDDEN_PDA_TRAP:${String(audit.hidden_pda_rent_trap)}`);
  }

  for (const chk of audit.checks ?? []) {
    const text = `${chk.label ?? ""} ${chk.name ?? ""} ${chk.detail ?? ""} ${chk.status ?? ""}`.toLowerCase();
    if (
      !chk.passed &&
      (text.includes("jito") ||
        text.includes("sandwich") ||
        text.includes("slot-0") ||
        text.includes("sybil") ||
        text.includes("drainer") ||
        text.includes("cpi") ||
        text.includes("hook"))
    ) {
      reasons.push(`LAYER_${chk.layer}_BLOCK:${chk.detail ?? chk.label ?? "FAILED"}`);
    }
  }

  const score = Number(audit.score ?? 0);
  if (score < minScore) {
    reasons.push(`SCORE_${score}_BELOW_${minScore}`);
  }
  if (audit.safe_to_buy === false) {
    reasons.push("SAFE_TO_BUY_FALSE");
  }

  const uniqueReasons = Array.from(new Set(reasons));
  return {
    allowExecution: uniqueReasons.length === 0,
    mint: audit.mint,
    symbol: audit.symbol ?? "UNKNOWN",
    score,
    auditMs: Number(audit.audit_ms ?? 0),
    vetoReasons: uniqueReasons,
    audit,
  };
}

export class RentAndRugShieldClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly refWallet: string;
  private proPassToken: string;
  private readonly deviceHash: string;
  private readonly agentId: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;
  private readonly x402Signer?: X402SignerHandler;

  constructor(config: RRSClientConfig = {}) {
    this.baseUrl = (config.baseUrl ?? RRS_DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.apiKey = (config.apiKey ?? "").trim();
    this.refWallet = config.refWallet ? assertValidSolanaPubkey(config.refWallet, "refWallet") : "";
    this.proPassToken = (config.proPassToken ?? "").trim();
    this.deviceHash = (config.deviceHash ?? "").trim();
    this.agentId = config.agentId ?? "rrs-ts-sdk-v5.1";
    this.timeoutMs = config.timeoutMs ?? 4_500;
    this.fetchImpl = config.fetchImpl ?? globalThis.fetch.bind(globalThis);
    this.x402Signer = config.x402Signer;
  }

  private buildUrl(path: string, query?: Record<string, string | undefined>): string {
    const url = new URL(path.startsWith("/") ? path : `/${path}`, `${this.baseUrl}/`);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== "") {
          url.searchParams.set(k, v);
        }
      }
    }
    if (this.refWallet && !url.searchParams.has("ref")) {
      url.searchParams.set("ref", this.refWallet);
    }
    return url.toString();
  }

  private buildHeaders(extra?: Record<string, string>): Headers {
    const headers = new Headers({
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Agent-Id": this.agentId,
    });
    if (this.apiKey) headers.set("X-API-Key", this.apiKey);
    if (this.proPassToken) headers.set("X-Pro-Pass-Token", this.proPassToken);
    if (this.deviceHash) headers.set("X-Device-Hash", this.deviceHash);
    if (this.refWallet) headers.set("X-Ref-Wallet", this.refWallet);
    if (extra) {
      for (const [k, v] of Object.entries(extra)) {
        if (v) headers.set(k, v);
      }
    }
    return headers;
  }

  private injectRefBody(body?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!body) return undefined;
    const next: Record<string, unknown> = { ...body };
    if (this.refWallet) {
      next.ref ??= this.refWallet;
      next.ref_wallet ??= this.refWallet;
    }
    if (this.deviceHash) {
      next.device_hash ??= this.deviceHash;
    }
    return next;
  }

  private parse402Challenge(
    url: string,
    headers: Headers,
    body: Record<string, unknown>,
  ): X402PaymentChallenge {
    const b64Hdr = headers.get("payment-required") || headers.get("x-payment-required") || "";
    const decodedHdr = decodeBase64Json(b64Hdr);
    const acceptsRaw =
      (body.accepts as X402PaymentRequirement[] | undefined) ??
      (decodedHdr.accepts as X402PaymentRequirement[] | undefined) ??
      (decodedHdr.paymentRequirements as X402PaymentRequirement[] | undefined) ??
      [];
    return {
      status: 402,
      resource: url,
      treasury: headers.get("x-402-treasury") || String(body.treasury ?? RRS_TREASURY_WALLET),
      treasuryUsdcAta: headers.get("x-402-treasury-usdc-ata") || RRS_TREASURY_USDC_ATA,
      usdcMint: headers.get("x-402-usdc-mint") || SPL_USDC_MINT,
      wwwAuthenticate: headers.get("www-authenticate") || "",
      accepts: Array.isArray(acceptsRaw) ? acceptsRaw : [],
      rawBody: Object.keys(body).length > 0 ? body : decodedHdr,
    };
  }

  private proofToHeaders(proofInput: X402PaymentProof | string): Record<string, string> {
    const proof: X402PaymentProof =
      typeof proofInput === "string" ? { txSignature: proofInput } : proofInput;
    const option = proof.paymentOption ?? "option_b_usdc_single_scan";
    const out: Record<string, string> = { "X-Payment-Option": option };

    if (proof.proPassToken) {
      out["X-Pro-Pass-Token"] = proof.proPassToken;
    }
    if (proof.txSignature) {
      out["X-Payment-Tx"] = proof.txSignature;
      out["X-Solana-Tx-Signature"] = proof.txSignature;
    }
    if (proof.xPaymentBase64) {
      out["X-Payment"] = proof.xPaymentBase64;
      out["PAYMENT-SIGNATURE"] = proof.xPaymentBase64;
    } else if (proof.txSignature) {
      const encoded = encodeBase64Json({
        x402Version: 1,
        scheme: "exact",
        network: SOLANA_CAIP2_MAINNET,
        option,
        payload: { txSignature: proof.txSignature, payTo: RRS_TREASURY_WALLET },
      });
      out["X-Payment"] = encoded;
      out["PAYMENT-SIGNATURE"] = encoded;
    }
    return out;
  }

  private async executeOnce(
    method: "GET" | "POST",
    url: string,
    body?: Record<string, unknown>,
    extraHeaders?: Record<string, string>,
  ): Promise<{ status: number; headers: Headers; data: Record<string, unknown> }> {
    const res = await this.fetchImpl(url, {
      method,
      headers: this.buildHeaders(extraHeaders),
      body: method === "POST" && body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    const issuedPass = res.headers.get("x-pro-pass-token")?.trim();
    if (issuedPass) {
      this.proPassToken = issuedPass;
    }
    const text = await res.text();
    let data: Record<string, unknown> = {};
    if (text.trim()) {
      try {
        data = JSON.parse(text) as Record<string, unknown>;
      } catch {
        data = { ok: false, error: text.slice(0, 400) };
      }
    }
    return { status: res.status, headers: res.headers, data };
  }

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    options: { query?: Record<string, string | undefined>; body?: Record<string, unknown> } = {},
  ): Promise<T> {
    const url = this.buildUrl(path, options.query);
    const body = this.injectRefBody(options.body);
    let { status, headers, data } = await this.executeOnce(method, url, body);

    if (status === 402) {
      const challenge = this.parse402Challenge(url, headers, data);
      if (!this.x402Signer) {
        throw new RRSPaymentRequired402Error(challenge);
      }
      const proof = await this.x402Signer(challenge);
      const retryHeaders = this.proofToHeaders(proof);
      ({ status, headers, data } = await this.executeOnce(method, url, body, retryHeaders));
    }

    if (status >= 400) {
      throw new RRSAPIError(status, String(data.error ?? "Request failed"), data);
    }
    return data as unknown as T;
  }

  /** POST /api/scan-token — Full 12-Layer Adaptive Token & Liquidity Viability Audit */
  public async scanToken(mint: string, userInitiated = false): Promise<TokenAuditResponse> {
    return this.request<TokenAuditResponse>("POST", "/api/scan-token", {
      body: { mint: mint.trim(), user_initiated: userInitiated },
    });
  }

  /** GET /api/v1/shield-check — <120ms Institutional / Headless AI-Agent Pre-Sign Gate */
  public async shieldCheck(mint: string, lite = false): Promise<TokenAuditResponse> {
    return this.request<TokenAuditResponse>("GET", "/api/v1/shield-check", {
      query: { mint: mint.trim(), lite: lite ? "1" : undefined },
    });
  }

  /** POST /api/scan-wallet — Read-only empty ATA discovery & honest 0% / 2.0% fee quote */
  public async scanWallet(
    wallet: string,
    options: { autoCollect?: boolean; userInitiated?: boolean } = {},
  ): Promise<WalletRentScanResponse> {
    const cleanWallet = assertValidSolanaPubkey(wallet, "wallet");
    return this.request<WalletRentScanResponse>("POST", "/api/scan-wallet", {
      body: {
        wallet: cleanWallet,
        auto_collect: options.autoCollect ?? false,
        user_initiated: options.userInitiated ?? false,
      },
    });
  }

  /** POST /api/build-reclaim-tx — Builds unsigned base64 CloseAccount tx w/ 30% atomic ?ref=WALLET split */
  public async buildReclaimTx(
    wallet: string,
    options: BuildReclaimTxOptions = {},
  ): Promise<BuildReclaimTxResponse> {
    const cleanWallet = assertValidSolanaPubkey(wallet, "wallet");
    const effRef = options.refWallet
      ? assertValidSolanaPubkey(options.refWallet, "refWallet")
      : this.refWallet;

    const payload: Record<string, unknown> = {
      wallet: cleanWallet,
      include_dust_burn: options.includeDustBurn ?? true,
      mode: options.mode ?? "all",
      reinvest_pct: options.reinvestPct ?? 0,
      deduct_unlimited_pass: options.deductUnlimitedPass ?? false,
    };
    if (options.selectedPubkeys) {
      payload.selected_pubkeys = options.selectedPubkeys;
    }
    if (effRef) {
      payload.ref = effRef;
      payload.ref_wallet = effRef;
    }

    return this.request<BuildReclaimTxResponse>("POST", "/api/build-reclaim-tx", {
      query: effRef ? { ref: effRef } : undefined,
      body: payload,
    });
  }

  /** Deterministic <120ms pre-sign guard; throws RRSHardVetoError on any critical risk */
  public async assertTokenSafePreSign(
    mint: string,
    policy: HardVetoPolicy = {},
  ): Promise<HardVetoVerdict> {
    const audit = await this.shieldCheck(mint);
    const verdict = evaluateTokenHardVeto(audit, policy);
    if (!verdict.allowExecution) {
      throw new RRSHardVetoError(verdict);
    }
    return verdict;
  }
}
