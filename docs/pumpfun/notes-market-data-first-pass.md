> *Author's working note, written in French on October 21, 2026 while preparing the paper; translated to English with an AI assistant for publication; every number is as in the original (some were later superseded: the paper and `NUMBERS.md` are the reference). Removed for publication: nothing (a few sentences about chains were rephrased to avoid chains as subjects of negative statements). Dates are DD/MM/YYYY, as in the original.*
> **What changed since this note (see `NUMBERS.md`):** every number here was replaced by the API pulls of October 21 (`notes-market-data-verified.md`) and by the canonical table; keep it for the reasoning, not for the figures.

# Market data for candidate tokens (21/10/2026)

> Web research of 21/10/2026. **VERIFIED**: price, MC, FDV via CoinGecko API (21/10, 01:19 UTC) [1]; fees, revenue, TVL via DeFiLlama API (21/10) [2], coverage sometimes incomplete; perps and OI via Binance, Hyperliquid (HL), Bybit, OKX APIs (21/10) [3]. **UNCERTAIN**: flagged as such (secondary sources).

**Eligibility conclusion: only PUMP, CRO and OKB pass the Short > $1B track.** No other launchpad token exceeds $1B. No tradable token exists for Base, Robinhood Chain, Tempo or ARC.

## Table (amounts in $; revenue/fees over 30 days)
| Asset | Circ. MC / FDV | Price ~200 d / 1 yr | Revenue or fees 30 d | Next unlock | Perp | Note |
|---|---|---|---|---|---|---|
| **PUMP** | $2.22B / $3.97B | +195% / +26% | Revenue: $45.4M pump.fun + $15.8M PumpSwap. Buyback = 50% of revenue, ~$0.9M/day, $490M cumulative, 17.3% of supply burned [4][5] | ~6.9B PUMP/month over 3 years after the 12/07/2026 cliff (start date UNCERTAIN) [5] | Binance + HL, OI ≈ $240M | MC / annualized revenue ≈ 3x [5]. Launchpad fee share fell from 80% to 27% in July [17], 35% today [2] |
| **CRO** | $2.93B / $5.71B | −18% / −62% | Chain fees not tracked; TVL $139M | ~1.16B CRO/month from the 70B re-minted (UNCERTAIN) [14] | Bybit and OKX only, OI ≈ $4M | Trump Media treasury cancelled on 07/08/2026 [14] |
| **OKB** | $2.43B / identical | +41% / −32% | X Layer: fees $45k; TVL $161M, of which 68% on Aave [15] | None (fixed supply 21M) | OKX $26M, Bybit $1.5M; neither Binance nor HL | MC / deposits ≈ 15x [15] |
| XPL | $356M / $785M | −29% / −80% | Fees $16k; TVL $571M against $3.36B a year ago | 25/10/2026: ~228M XPL (2.3%), then monthly [9] | Binance + HL | Deposits inflated by incentives [18] |
| MON | $261M / $2.22B | −19% / n.a. | Fees $439k; TVL $1.0B | 24/11/2026: 16.6B MON, ≈ 140% of MC [10] | Binance + HL | Just above $250M |
| MEGA | $49M / $430M | −80% from ATH | Fees $70k; TVL $12M | 53% of supply unlocked on KPIs [11] | Binance + HL | TGE on 30/04/2026 [11] |
| SEI | $411M / $611M | +13% / −69% | Fees $3k (coverage UNCERTAIN); TVL $32M against $431M | ~55.6M SEI on the 15th of each month [12] | Binance + HL | |
| FLR | $560M / $684M | −15% / −63% | Fees $21k; TVL $184M | n.a. | Bybit only, OI ≈ $1M | |
| S | $221M / identical | +36% / −67% | Fees $7k; TVL $20M | n.a. | Binance + HL | +43% over 30 d |
| BERA | $59M / $94M | −59% / −92% | Fees $2k; TVL $32M | ~13.3M/month until Nov. 2026 (UNCERTAIN) [13] | Binance + HL | |
| VIRTUAL | $446M / $677M | +7% / −15% | Revenue $118k | n.a. | Binance + HL | |
| ZORA | $29M / $65M | −52% / −94% | ≈ 0 | n.a. | Binance + HL | |
| **PONS** (Robinhood Chain) | $192M / identical | −53% over 30 d; −71% from the 05/09 ATH | Fees $31.7M, revenue $4.7M | n.a. | Binance + HL | |
| FORM (four.meme) | $95M / $142M | +21% / −70% | four.meme: revenue $225k | n.a. | Binance | Flap.sh dominates BSC ($32.9M of fees) but has no listed token |
| CLANKER | $12M / identical | −53% / −55% | Revenue $226k | n.a. | Binance | |

**Platforms with no tradable token**
- **Bonk.fun**: associated token BONK (MC $269M); $3.7M of revenue over 30 d.
- **Base**: no token ("under consideration" since Sept. 2025) [20].
- **Robinhood Chain**: mainnet 01/07/2026, gas in ETH, no token [21].
- **Tempo**: mainnet 18/03/2026, fees in stablecoins, no token [22].
- **ARC**: 10B minted on 16/09/2026 with no launch commitment; $222M presale at a $3B valuation led by a16z (May 2026) [23]. Not tradable → ineligible.

## Eligibility by track
- **Short > $1B (circulating MC): PUMP, CRO, OKB.**
  - PUMP: the most liquid to short, but supported by its revenue (MC ≈ 3x annualized revenue) and its buybacks → the short thesis must rest on manufactured activity, loss of market share and unlocks.
  - CRO: thin perps (~$4M of OI).
  - OKB: only OKX has meaningful OI ($26M).
  - MON exceeds $1B only in FDV → check whether the rules count FDV.
- **Long < $250M**: S, PONS, FORM, BERA, MEGA, ZORA, CLANKER (MON at the limit).
- **Long > $250M**: FLR, VIRTUAL, SEI, XPL, BONK, MON.

## 2026 publications on manufactured activity
- **"Meme Coin Factories"** (arXiv 2609.10246, CMU/EPFL/ETH, 09/09/2026) on pump.fun, **VERIFIED** [6]: ≥ 4M wash-trading tx (17% of tx, 1.32% of volume); the most active 1% of creator clusters created 58.6% of coins; > 1.5M copied coins. **To cite, and to differentiate from.**
- **MemeTrans** (arXiv 2602.13480, Feb. 2026): 21.4% wash trades before migration on Solana launchpads (abstract only) [7].
- **Arc, day 1 (16/09/2026)**: 82% of the $410.8M of DEX volume came from launchpads, including $202M for Arguspad, which created 86% of the day's tokens [8].
- **Robinhood Chain / Pons**: CoinDesk reports ~25,000 tokens created and $544M of volume in one day [16]. Bot/wash accusations only via OKX Orbit and X: UNCERTAIN [19].
- **Plasma**: ~65% of the stablecoins were placed to farm XPL; stablecoin supply went from > $6B to < $2B in two months [18].
- **X Layer**: deposits depend on incentives, 68% on Aave (Oct. 2026) [15].

## What interests Franklin Templeton
- **Franklin Crypto** (the sponsor) = acquisition of **250 Digital** (CoinFund spin-off), announced on 01/04/2026 [24]. Led by Christopher Perkins, CIO Seth Ginns. **Active management of liquid crypto** for institutions, ~$1.8B [25]. → They expect: **valuation, catalysts, short liquidity, risk analysis**.
- **BENJI / FOBXX**: > $2.5B in July 2026 (of which ~$1.5B on BNB Chain; UNCERTAIN, rwa.xyz shows $727-808M for the main token) [26]; collateral at Binance and Bybit; used to pay part of the 250 Digital purchase [24].
- **Stablecoins**: on 13/01/2026, money market fund LUIXX adapted as a GENIUS Act-compliant reserve, on-chain share class DIGXX [27].
- **Sandy Kaul**: agentic AI would be crypto's "killer use case"; all ETFs tokenized within 2-3 years (Ondo partnership); next cycle $20-30T [28].
- **Tone**: institutional and fundamental (value capture, real vs. subsidized usage, unlocks). Avoid any promotional tone.

## Sources
[1] https://api.coingecko.com/api/v3/coins/markets (21/10/2026)
[2] https://defillama.com/protocols/launchpad · https://api.llama.fi (21/10/2026)
[3] https://fapi.binance.com/fapi/v1/exchangeInfo · https://api.hyperliquid.xyz/info · https://api.bybit.com · https://www.okx.com/api/v5 (21/10/2026)
[4] https://pump.fun/pump-token (20/10/2026)
[5] https://www.tokenpost.com/news/investing/31667 (14/10/2026)
[6] https://arxiv.org/html/2609.10246v1
[7] https://arxiv.org/html/2602.13480v1
[8] https://beincrypto.com/arc-mainnet-meme-coin-launchpad-volume/ · https://www.cryptometer.io/news/arc-mainnet-posts-410-8-million-in-dex-volume-as-memecoin-launchpads-dominate-day-one/
[9] https://www.coingecko.com/en/coins/plasma · https://dropstab.com/coins/xpl
[10] https://dropstab.com/coins/monad · https://www.kucoin.com/news/flash/q4-2026-to-see-major-vc-and-team-token-unlocks-including-131-6-of-monad-s-market-cap
[11] https://unchainedcrypto.com/megaeths-mega-token-goes-live-on-13-exchanges-at-1-6b-fdv-after-kpi-milestone/ · https://yellow.com/news/megaeth-mega-token-launch-kpi-unlocks
[12] https://www.tapbit.com/en/learn/article/sei-price-outlook-october-15-token-unlock-20261015
[13] https://www.mexc.com/es/price/BERA/tokenomics
[14] https://www.coindesk.com/business/2026/08/07/trump-media-pulls-back-from-crypto-scraps-crypto-com-cro-treasury-deal · https://dev.to/mrnasdog/cro-inflation-analysis-july-2026-supply-growing-as-the-re-minted-reserve-unlocks-24f8
[15] https://cryptoticker.io/fr/okb-x-layer-concentration-capitaux/
[16] https://www.coindesk.com/tech/2026/09/03/a-memecoin-making-app-becomes-crypto-s-top-fee-generators-as-robinhood-chain-activity-explodes
[17] https://thedefiant.io/news/defi/pump-fun-launchpad-fee-share-falls-robinhood-chain-pons-noxa
[18] https://www.datawallet.com/crypto/what-is-plasma-chain
[19] https://www.okx.com/en-us/orbit/insight/88716432207584
[20] https://www.theblock.co/post/370668/coinbase-incubated-base-network-beginning-to-explore-native-token-creator-jesse-pollak-says · https://www.coindesk.com/opinion/2026/01/22/the-base-token-should-give-holders-voting-power-over-coinbase-itself
[21] https://fintech.global/2026/07/03/robinhood-launches-robinhood-chain-mainnet-and-defi-suite/
[22] https://www.finextra.com/newsarticle/47462/stripe-backed-tempo-blockchain-goes-live-with-machine-payments-protocol
[23] https://www.businesswire.com/news/home/20260916108863/en/Circle-Launches-Arc-Mainnet-an-Economic-Operating-System-for-the-Internet · https://finovate.com/circle-raises-222-million-in-new-token-presale/
[24] https://www.cnbc.com/2026/04/01/franklin-templeton-acquires-digital-assets-investment-firm-in-active-crypto-management-push.html
[25] https://www.americanbanker.com/news/2026-the-most-powerful-women-in-banking-women-to-watch-5-sandy-kaul-franklin-templeton
[26] https://cryptobriefing.com/franklin-templeton-tokenized-treasury-2b-growth/ · https://app.rwa.xyz/assets/BENJI
[27] https://news.bitcoin.com/franklin-templeton-positions-two-money-market-funds-for-tokenized-finance-under-genius-act/
[28] https://finance.yahoo.com/markets/crypto/articles/franklin-templeton-says-agentic-ai-190405110.html · https://www.thestreet.com/crypto/markets/franklin-templetons-sandy-kaul-says-tokenization-will-do-to-etfs-what-etfs-did-to-mutual-funds
