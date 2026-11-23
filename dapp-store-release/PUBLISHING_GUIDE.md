# Solana dApp Store Release Kit v6.0 (Self-Service Publishing Factory)

- **Package ID:** `com.rentandrugshield.mobile`
- **Version:** `6.0.0` (`versionCode: 600`, `minSdkVersion: 26`, `targetSdkVersion: 34`)
- **Signed Release APK:** `./SolanaRentRugShield-v6.0-dAppStore.apk` (v1 + v2 + v3 signed)
- **APK SHA-256:** `d751052b3c5c859d07f2dc9e9f537f654cbc25ba1a86920afa6485615428c7f5`
- **Icon Spec:** `512x512` Signature `96.5%` Full-Bleed Yellow-Gold & Jet Black Shield (`0` C2PA bytes)
- **Release Keystore (Private, Outside Git):** `~/.keys/rrs-dappstore-v6.jks` (`alias: rentrugshield_dappstore_v6`)
- **Public Live Mobile Hub:** `https://rentandrugshield.com/mobile.html` (with `v5.3` MWA fallback preserved)

## One-Command Solana dApp Store CLI Submission
```bash
cd ./dapp-store-release
npx @solana-mobile/dapp-store-cli validate -k ~/.config/solana/id.json -b $ANDROID_HOME/build-tools/34.0.0
npx @solana-mobile/dapp-store-cli create app -k ~/.config/solana/id.json -u https://solana-rpc.publicnode.com
npx @solana-mobile/dapp-store-cli create release -k ~/.config/solana/id.json -b $ANDROID_HOME/build-tools/34.0.0 -u https://solana-rpc.publicnode.com
npx @solana-mobile/dapp-store-cli publish submit -k ~/.config/solana/id.json -u https://solana-rpc.publicnode.com --requestor-is-authorized --complies-with-solana-dapp-store-policies
```
