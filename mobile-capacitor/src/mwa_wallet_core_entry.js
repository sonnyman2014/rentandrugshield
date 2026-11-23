/**
 * @mwa-wallet-core v6.0
 * Real @solana-mobile/wallet-standard-mobile (>= v0.5.1) + MWA v2.0 Cached Session Bridge
 * Supports: Solana Seeker (Seed Vault), Phantom, Solflare, Backpack + Strict 4-Frozen-ATA Quarantine
 */
import {
  registerMwa,
  createDefaultAuthorizationCache,
  createDefaultChainSelector,
  createDefaultWalletNotFoundHandler
} from '@solana-mobile/wallet-standard-mobile';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol';

const APP_IDENTITY = Object.freeze({
  name: 'Solana Rent & Rug Shield',
  uri: 'https://rentandrugshield.com',
  icon: '/icons/icon-512.png'
});

const AUTH_CACHE_KEY = 'rrs_mwa_v2_auth_cache_v6';
const AUTH_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14-day cached MWA v2.0 session

const FROZEN_LEGACY_ATAS = Object.freeze([
  '5sEb9m4XP3mXJSsv8GEeck62Z6PY8TfAhmngZrpgNU9Q',
  'CsLX8FSsWc8uNfMBUB9PhwcsZBaLstoYpiUi9SDdkDLg',
  'DGnsyzo5cbQZMpXEwSbESBnSrdjroj7DhpcAPbfQaUft',
  'FRCeYgC1PR7kTKhgk8Peq7WE8Rz6E7cEXnhB77DT5G8F'
]);
const FROZEN_LEGACY_PREFIXES = Object.freeze([
  '5sEb9m4XP3',
  'CsLX8FSsWc',
  'DGnsyzo5cb',
  'FRCeYgC1PR'
]);

const SUPPORTED_WALLETS = Object.freeze({
  seeker: {
    id: 'seeker',
    label: 'Solana Seeker (MWA v2.0)',
    packageId: 'com.solanamobile.seedvaultimpl',
    mwaScheme: 'solana-wallet',
    browseUrl: function (targetUrl) { return targetUrl; }
  },
  phantom: {
    id: 'phantom',
    label: 'Phantom',
    packageId: 'app.phantom',
    mwaScheme: 'solana-wallet',
    browseUrl: function (targetUrl, origin) {
      return 'https://phantom.app/ul/browse/' + encodeURIComponent(targetUrl) + '?ref=' + encodeURIComponent(origin);
    }
  },
  solflare: {
    id: 'solflare',
    label: 'Solflare',
    packageId: 'com.solflare.mobile',
    mwaScheme: 'solana-wallet',
    browseUrl: function (targetUrl, origin) {
      return 'https://solflare.com/ul/v1/browse/' + encodeURIComponent(targetUrl) + '?ref=' + encodeURIComponent(origin);
    }
  },
  backpack: {
    id: 'backpack',
    label: 'Backpack',
    packageId: 'app.backpack.mobile',
    mwaScheme: 'solana-wallet',
    browseUrl: function (targetUrl, origin) {
      return 'https://backpack.app/ul/v1/browse/' + encodeURIComponent(targetUrl) + '?ref=' + encodeURIComponent(origin);
    }
  }
});

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function bytesToBase58(bytes) {
  if (!bytes || !bytes.length) return '';
  const digits = [0];
  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let out = '';
  for (let k = 0; k < bytes.length && bytes[k] === 0; k++) out += '1';
  for (let q = digits.length - 1; q >= 0; q--) out += BASE58_ALPHABET[digits[q]];
  return out;
}

function base64ToBytes(b64) {
  const clean = String(b64 || '').replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function isQuarantinedFrozenAta(addr) {
  const s = String(addr || '').trim();
  if (!s) return false;
  if (FROZEN_LEGACY_ATAS.indexOf(s) !== -1) return true;
  for (let i = 0; i < FROZEN_LEGACY_PREFIXES.length; i++) {
    if (s.indexOf(FROZEN_LEGACY_PREFIXES[i]) === 0) return true;
  }
  return false;
}

function quarantineFrozenAtas(accounts) {
  if (!Array.isArray(accounts)) return { safe: [], quarantined: [] };
  const safe = [];
  const quarantined = [];
  for (let i = 0; i < accounts.length; i++) {
    const item = accounts[i];
    const pk = typeof item === 'string'
      ? item
      : String((item && (item.pubkey || item.address || item.ata)) || '');
    if (isQuarantinedFrozenAta(pk)) quarantined.push(item);
    else safe.push(item);
  }
  return { safe, quarantined };
}

function assertZeroFrozenAtasInBatch(pubkeys) {
  if (!Array.isArray(pubkeys)) return true;
  for (let i = 0; i < pubkeys.length; i++) {
    const pk = typeof pubkeys[i] === 'string'
      ? pubkeys[i]
      : String((pubkeys[i] && (pubkeys[i].pubkey || pubkeys[i].address)) || '');
    if (isQuarantinedFrozenAta(pk)) {
      throw new Error('QUARANTINE_VETO: Permanent legacy frozen Token-2022 ATA blocked (' + pk.slice(0, 10) + ')');
    }
  }
  return true;
}

function loadCachedMwaSession() {
  try {
    if (typeof window !== 'undefined' && window.AndroidShield && typeof window.AndroidShield.loadAuthCache === 'function') {
      const nativeRaw = window.AndroidShield.loadAuthCache();
      if (nativeRaw) {
        const parsed = JSON.parse(nativeRaw);
        if (parsed && parsed.pubkey && (!parsed.expiresAt || parsed.expiresAt > Date.now())) {
          return parsed;
        }
      }
    }
  } catch (_e) {}
  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.pubkey) return null;
    if (parsed.expiresAt && parsed.expiresAt <= Date.now()) {
      localStorage.removeItem(AUTH_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch (_e2) {
    return null;
  }
}

function saveCachedMwaSession(session) {
  if (!session || !session.pubkey) return null;
  const record = {
    authToken: String(session.authToken || ''),
    pubkey: String(session.pubkey),
    base64Address: String(session.base64Address || ''),
    walletId: String(session.walletId || 'seeker'),
    walletLabel: String(session.walletLabel || 'Solana MWA v2.0'),
    walletUriBase: String(session.walletUriBase || ''),
    chain: String(session.chain || 'solana:mainnet'),
    authorizedAt: Number(session.authorizedAt || Date.now()),
    expiresAt: Number(session.expiresAt || (Date.now() + AUTH_TTL_MS))
  };
  const json = JSON.stringify(record);
  try { localStorage.setItem(AUTH_CACHE_KEY, json); } catch (_e) {}
  try {
    if (typeof window !== 'undefined' && window.AndroidShield && typeof window.AndroidShield.saveAuthCache === 'function') {
      window.AndroidShield.saveAuthCache(json);
    }
  } catch (_e2) {}
  return record;
}

function clearCachedMwaSession() {
  try { localStorage.removeItem(AUTH_CACHE_KEY); } catch (_e) {}
  try {
    if (typeof window !== 'undefined' && window.AndroidShield && typeof window.AndroidShield.clearAuthCache === 'function') {
      window.AndroidShield.clearAuthCache();
    }
  } catch (_e2) {}
}

let walletStandardRegistered = false;
function initWalletStandardMobile() {
  if (walletStandardRegistered) return true;
  try {
    registerMwa({
      appIdentity: APP_IDENTITY,
      authorizationCache: createDefaultAuthorizationCache(),
      chains: ['solana:mainnet'],
      chainSelector: createDefaultChainSelector(),
      onWalletNotFound: createDefaultWalletNotFoundHandler()
    });
    walletStandardRegistered = true;
    return true;
  } catch (_e) {
    return false;
  }
}

function getInjectedProvider(preferredId) {
  if (typeof window === 'undefined') return null;
  if (preferredId === 'phantom' && window.phantom && window.phantom.solana) return { provider: window.phantom.solana, id: 'phantom', label: 'Phantom' };
  if (preferredId === 'solflare' && window.solflare) return { provider: window.solflare, id: 'solflare', label: 'Solflare' };
  if (preferredId === 'backpack' && window.backpack && window.backpack.solana) return { provider: window.backpack.solana, id: 'backpack', label: 'Backpack' };
  if (window.solana && window.solana.isSeeker) return { provider: window.solana, id: 'seeker', label: 'Solana Seeker' };
  if (window.phantom && window.phantom.solana) return { provider: window.phantom.solana, id: 'phantom', label: 'Phantom' };
  if (window.solflare) return { provider: window.solflare, id: 'solflare', label: 'Solflare' };
  if (window.backpack && window.backpack.solana) return { provider: window.backpack.solana, id: 'backpack', label: 'Backpack' };
  if (window.solana) return { provider: window.solana, id: 'seeker', label: 'Solana Wallet' };
  return null;
}

function buildMwaLocalAssociationUri(preferredWalletId) {
  const port = 49152 + Math.floor(Math.random() * 16000);
  const rnd = crypto.getRandomValues(new Uint8Array(32));
  const assocToken = bytesToBase64(rnd).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return {
    uri: 'solana-wallet:/v1/associate/local?association=' + encodeURIComponent(assocToken) + '&port=' + port + '&v=v1',
    port: port,
    walletId: preferredWalletId || 'seeker'
  };
}

async function authorizeOrReauthorizeMwa(preferredWalletId, customTransact) {
  const walletMeta = SUPPORTED_WALLETS[preferredWalletId] || SUPPORTED_WALLETS.seeker;
  const cached = loadCachedMwaSession();

  // 1. Check injected provider first (Phantom, Solflare, Backpack, Seeker in-app WebView)
  const injected = getInjectedProvider(preferredWalletId);
  if (injected && typeof injected.provider.connect === 'function') {
    const resp = await injected.provider.connect(cached ? { onlyIfTrusted: false } : undefined);
    const pk = (resp && resp.publicKey)
      ? resp.publicKey.toString()
      : (injected.provider.publicKey ? injected.provider.publicKey.toString() : '');
    if (pk) {
      return saveCachedMwaSession({
        authToken: (cached && cached.authToken) || ('injected:' + injected.id),
        pubkey: pk,
        walletId: injected.id,
        walletLabel: injected.label,
        chain: 'solana:mainnet'
      });
    }
  }

  // 2. Native Android / MWA v2.0 transact session (with silent cached reauthorize -> authorize fallback)
  const runner = typeof customTransact === 'function' ? customTransact : transact;
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent || '');
  if (isAndroid || typeof customTransact === 'function') {
    const session = await runner(async function (wallet) {
      let authResult = null;
      if (cached && cached.authToken && typeof wallet.reauthorize === 'function') {
        try {
          authResult = await wallet.reauthorize({
            auth_token: cached.authToken,
            identity: APP_IDENTITY
          });
        } catch (_reauthErr) {
          authResult = null;
        }
      }
      if (!authResult) {
        authResult = await wallet.authorize({
          chain: 'solana:mainnet',
          identity: APP_IDENTITY,
          auth_token: cached ? cached.authToken : undefined
        });
      }
      const firstAcct = (authResult && Array.isArray(authResult.accounts) && authResult.accounts[0]) || null;
      if (!firstAcct) throw new Error('No Solana account returned by MWA v2.0 wallet');
      let pubkey = String(firstAcct.display_address || '');
      const b64Addr = String(firstAcct.address || '');
      if (!pubkey && b64Addr) {
        pubkey = bytesToBase58(base64ToBytes(b64Addr));
      }
      return saveCachedMwaSession({
        authToken: authResult.auth_token || '',
        pubkey: pubkey,
        base64Address: b64Addr,
        walletId: walletMeta.id,
        walletLabel: walletMeta.label,
        walletUriBase: authResult.wallet_uri_base || '',
        chain: 'solana:mainnet'
      });
    }, cached && cached.walletUriBase ? { baseUri: cached.walletUriBase } : undefined);
    return session;
  }

  // 3. Desktop / iOS universal link handoff
  const targetUrl = typeof location !== 'undefined' ? location.href : APP_IDENTITY.uri + '/mobile.html';
  const originUrl = typeof location !== 'undefined' ? location.origin : APP_IDENTITY.uri;
  return {
    handoffUrl: walletMeta.browseUrl(targetUrl, originUrl),
    mwaUri: buildMwaLocalAssociationUri(walletMeta.id).uri,
    walletId: walletMeta.id,
    walletLabel: walletMeta.label,
    pubkey: ''
  };
}

async function signAndSendBase64Tx(txBase64, options) {
  const opts = options || {};
  if (Array.isArray(opts.ataPubkeys)) {
    assertZeroFrozenAtasInBatch(opts.ataPubkeys);
  }
  const rawBytes = base64ToBytes(txBase64);
  const cached = loadCachedMwaSession();
  const injected = getInjectedProvider(opts.walletId || (cached && cached.walletId));

  if (injected && typeof injected.provider.signAndSendTransaction === 'function') {
    const res = await injected.provider.signAndSendTransaction(rawBytes);
    const sig = String((res && res.signature) || res || '');
    return { ok: true, signature: sig, walletId: injected.id };
  }

  const runner = typeof opts.customTransact === 'function' ? opts.customTransact : transact;
  const sigResult = await runner(async function (wallet) {
    if (cached && cached.authToken && typeof wallet.reauthorize === 'function') {
      try {
        await wallet.reauthorize({ auth_token: cached.authToken, identity: APP_IDENTITY });
      } catch (_e) {
        await wallet.authorize({ chain: 'solana:mainnet', identity: APP_IDENTITY });
      }
    } else {
      await wallet.authorize({ chain: 'solana:mainnet', identity: APP_IDENTITY });
    }
    const sigs = await wallet.signAndSendTransactions({
      payloads: [txBase64]
    });
    const firstSig = Array.isArray(sigs) ? sigs[0] : (sigs && sigs.signatures && sigs.signatures[0]);
    const sigStr = typeof firstSig === 'string' && firstSig.length < 64
      ? bytesToBase58(base64ToBytes(firstSig))
      : String(firstSig || '');
    return { ok: true, signature: sigStr, walletId: (cached && cached.walletId) || 'seeker' };
  }, cached && cached.walletUriBase ? { baseUri: cached.walletUriBase } : undefined);

  return sigResult;
}

function triggerHaptic(kind) {
  const durations = { light: 12, medium: 24, success: [16, 30, 22], warning: [35, 40, 45] };
  const pattern = durations[kind] || 14;
  try {
    if (typeof window !== 'undefined' && window.AndroidShield && typeof window.AndroidShield.vibrate === 'function') {
      window.AndroidShield.vibrate(Array.isArray(pattern) ? pattern[0] : pattern);
      return true;
    }
  } catch (_e) {}
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
      return true;
    }
  } catch (_e2) {}
  return false;
}

const api = {
  VERSION: '6.0.0',
  WALLET_STANDARD_MOBILE_MIN: '0.5.1',
  APP_IDENTITY,
  SUPPORTED_WALLETS,
  FROZEN_LEGACY_ATAS,
  FROZEN_LEGACY_PREFIXES,
  initWalletStandardMobile,
  isQuarantinedFrozenAta,
  quarantineFrozenAtas,
  assertZeroFrozenAtasInBatch,
  loadCachedMwaSession,
  saveCachedMwaSession,
  clearCachedMwaSession,
  buildMwaLocalAssociationUri,
  authorizeOrReauthorizeMwa,
  signAndSendBase64Tx,
  triggerHaptic,
  bytesToBase58,
  base64ToBytes,
  bytesToBase64
};

if (typeof window !== 'undefined') {
  window.RrsMwaWalletCore = api;
  initWalletStandardMobile();
}

export default api;
export {
  APP_IDENTITY,
  SUPPORTED_WALLETS,
  FROZEN_LEGACY_ATAS,
  FROZEN_LEGACY_PREFIXES,
  initWalletStandardMobile,
  isQuarantinedFrozenAta,
  quarantineFrozenAtas,
  assertZeroFrozenAtasInBatch,
  loadCachedMwaSession,
  saveCachedMwaSession,
  clearCachedMwaSession,
  buildMwaLocalAssociationUri,
  authorizeOrReauthorizeMwa,
  signAndSendBase64Tx,
  triggerHaptic
};
