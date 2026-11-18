# Empty ATA Rent Recovery Math (2026-11-18)

A classic 165 byte SPL token account was opened with 2,039,280 lamports (0.00203928 SOL) of rent. After the Solana rent cut, new accounts need less: the live RPC tonight quotes 1574800 lamports for 165 bytes, and Token-2022 accounts with the immutable owner extension hold about 1,513,840. Old accounts keep whatever they were opened with, so wallets that have traded for a while get back more per account. Selling a token to zero does not close the account, so the rent stays locked until you close it.

Measured tonight: the empty accounts we read on chain held 0.00158836 SOL on average.

| Empty accounts | Classic 0.00203928 SOL each | Measured tonight avg |
|---|---|---|
| 1 | 0.00203928 | 0.00158836 |
| 5 | 0.01019640 | 0.00794178 |
| 10 | 0.02039280 | 0.01588356 |
| 25 | 0.05098200 | 0.03970890 |
| 50 | 0.10196400 | 0.07941779 |
| 100 | 0.20392800 | 0.15883559 |
| 250 | 0.50982000 | 0.39708897 |
| 500 | 1.01964000 | 0.79417794 |

## Tonight's runners

Across the first page of token accounts for each runner, 17906 of 32505 accounts already hold 0 tokens, about 28.7346 SOL of rent sitting idle (from real account balances).

| Token | Sampled accounts | Empty (0 balance) | Avg real lamports per empty | SOL locked in sample |
|---|---|---|---|---|
| $GTA | 1000 | 17 | 1513840 | 0.025735 |
| $GTAVI | 1000 | 803 | 1513840 | 1.215614 |
| $GTAVI | 1000 | 529 | 1513586 | 0.800687 |
| $GTA6 | 1000 | 444 | 1593099 | 0.707336 |
| $NVDAx | 1000 | 497 | 1669543 | 0.829763 |
| $BLOB | 1000 | 549 | 1513840 | 0.831098 |
| $3 | 1000 | 658 | 1513840 | 0.996107 |
| $PENGYOUHAO | 1000 | 316 | 1513586 | 0.478293 |
| $AI | 1000 | 486 | 1521530 | 0.739464 |
| $PUMP | 1000 | 683 | 1744301 | 1.191358 |
| $GI | 1000 | 622 | 1513332 | 0.941293 |
| $GTAVI | 1000 | 18 | 1513840 | 0.027249 |
| $JALU | 1000 | 34 | 1513840 | 0.051471 |
| $mihao | 1000 | 587 | 1513586 | 0.888475 |
| $DacityCoin | 1000 | 599 | 1513840 | 0.906790 |
| $BTC | 1000 | 553 | 1513840 | 0.837154 |
| $VCN | 505 | 370 | 1519769 | 0.562315 |
| $TRUMP | 1000 | 653 | 1982358 | 1.294480 |
| $RAY | 1000 | 740 | 2020917 | 1.495479 |
| $GATO | 1000 | 565 | 1550934 | 0.876278 |
| $HOGE | 1000 | 696 | 1513586 | 1.053456 |
| $BP | 1000 | 611 | 1626144 | 0.993574 |
| $Dacity | 1000 | 696 | 1513840 | 1.053633 |
| $BAWSAQ | 1000 | 625 | 1513840 | 0.946150 |
| $FLOAT | 1000 | 708 | 1488440 | 1.053816 |
| $CATE | 1000 | 649 | 1859317 | 1.206697 |
| $ACRUX | 1000 | 617 | 1488440 | 0.918367 |
| $STONK | 1000 | 623 | 1668359 | 1.039388 |
| $DIGS | 1000 | 678 | 1513840 | 1.026384 |
| $1WIN | 1000 | 492 | 1488440 | 0.732312 |
| $LUNO | 1000 | 309 | 1520277 | 0.469766 |
| $CHAR | 1000 | 762 | 1513840 | 1.153546 |
| $USELESS | 1000 | 717 | 1940120 | 1.391066 |

## Get SOL back from empty token accounts

Classic SPL token accounts hold 0.00203928 SOL of rent; accounts opened since the Solana rent cut hold less (about 0.0015 SOL). Closing an empty one sends that SOL back to your wallet.

* Reclaim tool: https://rentandrugshield.com/app
* Rug check any mint: https://rentandrugshield.com/audit/<mint>
* Home: https://rentandrugshield.com/

**First Rent Claim 0% Fee.** **Choice A 10¢ Intro** covers 30 days of pre buy rug checks.

Data: Solana mainnet via Helius RPC and DexScreener public API, read at 2026-11-18T03:39:18Z. Values change every block. Not financial advice. Thank you.

GS
