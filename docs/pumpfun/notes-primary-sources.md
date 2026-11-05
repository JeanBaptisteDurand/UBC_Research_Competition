> *Author's working note, written in French on October 21, 2026 while preparing the paper; translated to English with an AI assistant for publication; every number is as in the original (some were later superseded: the paper and `NUMBERS.md` are the reference). Removed for publication: the internal file number in the title; one quoted private-message phrase and one legal-charge term (sensitive wording). Dates are DD/MM/YYYY, as in the original.*

# Primary sources on PUMP (verified on 21/10/2026)

Legend: **VERIFIED** = dated primary source (official page, API); **V-sec** = dated secondary source; **UNCERTAIN** = inferred. Reference price $0.00474.

## 1. Buyback-burn

| Fact | Status | Source |
|---|---|---|
| X announcement @Pumpfun of 28/04/2026: "50 % of the net revenue from the Pump.fun bonding curve, PumpSwap, and Terminal" → automatic purchase + immediate burn via an "irreversible locked smart contract for one year"; the other half funds operations | VERIFIED | https://x.com/Pumpfun/status/2049232506143006844 ; https://www.theblock.co/post/399288/pump-fun-burns-370-million-pump |
| Exact base: Bonding Curve + PumpSwap + Terminal revenue (Solana, Base, ETH, BNB), **net of referrals and cashbacks, excluding Mayhem Mode**; "As of 28 Apr 2026, 50 % of revenue is programmatically locked… for one year" | VERIFIED | https://pump.fun/pump-token |
| **End: not published**; one year → **≈ 28/04/2027** | UNCERTAIN | same |
| April burn: ≈ $370M = "36 % of the… **circulating** supply" (circulating base); tokens not quantified | VERIFIED | The Block; https://www.coindesk.com/markets/2026/04/29/pump-fun-burns-36-of-pump-supply-in-usd370-million-wipe-locks-50-revenue-into-ongoing-buybacks |
| Before: 100% of revenue since 15/07/2025, tokens kept in treasury (104.5B = $328.5M on 15/03/2026) | V-sec | https://research.4pillars.io/en/research/debunking-pumpfun-revenue-manipulation-fud |
| **Official dashboard** (fees.pump.fun → pump.fun/pump-token), 20/10: **$490.65M; 172.96B burned = 17.296% of total supply**; $0.77-1.14M/day (11-20 Oct.) = 49-52% of revenue; milestones $400.9M (The Defiant, "token stays flat"), $437M (31/08), $465M (05/10). Warning: "the fee dashboard does not correctly reflect the revenue and buyback amount" since custom pairs | VERIFIED | https://pump.fun/pump-token ; https://thedefiant.io/news/defi/pump-fun-s-pump-buybacks-top-usd400m-as-token-stays-flat |
| Weekly protocol fees: $16.07M (24-30/08) → $9.27M (7-13/09) → $16.32M (28/09-4/10) | VERIFIED | newsletters, same |

## 2. Unlocks

Allocation (1,000B): ICO 33% (TGE); community 24% (linear 48 m); **team 20% (200B)**; **investors 13% (130B)**; livestream 3%; liquidity 2.6%; eco fund 2.4%; foundation 2%. V-sec: https://www.tokenomist.ai/pump-fun/tokenomics ; https://dropstab.com/coins/pump-fun/vesting

| Fact | Status | Source |
|---|---|---|
| 12-month cliff on **12/07/2026**: **82.5B** unlocked (25% of 330B), "20.23 % of the circulating supply before the unlock" | V-sec | https://www.tokenpost.com/news/investing/31667 |
| Transferred on 14/07: 52.7B (≈ $80M) to 84 addresses; 7.6% sold in 27 d (4.03B, $6.97M); 62 wallets with no sale | V-sec | https://research.4pillars.io/en/data/content/pump-insiders-kept-92-of-the-july-unlock |
| Then **6.875B/month** (team 4.17 + investors 2.71) on ~the 12th "until July 2029" (48 m linear); 0.69% of total supply | V-sec | 4Pillars; https://www.kucoin.com/news/flash/pump-fun-faces-pressure-as-6-875b-pump-unlock-approaches |
| Check: DropsTab = 31.25% unlocked (103.1B = 82.5 + 3 × 6.875) | V-sec | DropsTab |
| **Next: 12/11/2026, 12/12/2026, 12/01/2027**… through 12/11/2027: 6.875B ≈ **$32.6M** (≈ 1.5% of circulating) each; 13 tranches = 89.4B ≈ $424M. Day (11th or 12th) not confirmed | V-sec / UNCERTAIN | same |
| September jump: CoinGecko implied supply (MC ÷ price) **+19.8B on 09/09, +53.9B on 14/09** (395 → 469B). Hypothesis: late incorporation of the cliff (82.5B) + August/Sept. tranches; pump.fun displays **399.46B** circulating (gap ≈ 62B). Other jumps: +237B (12/11/2025), −229B (30/04, burn), +61.9B (26/06) | VERIFIED (data) / UNCERTAIN (cause) | https://api.coingecko.com/api/v3/coins/pump-fun/market_chart?vs_currency=usd&days=365 |
| Buybacks ≈ $28-30M/month ≈ unlocks $32.6M/month: the program now absorbs only the insider issuance (March: 2×) | Computation | n/a |

## 3. Perps and short (API, 21/10 ~07:00 UTC)

| Venue | Current funding | 30-d avg (annualized) | 90-d avg | OI | Source |
|---|---|---|---|---|---|
| Hyperliquid (1 h) | 0.00125%/h ≈ 11%/yr | **14.7%/yr** | 14.5%/yr | **$152.7M**, 10× leverage, 24-h vol. $107M | https://api.hyperliquid.xyz/info |
| Binance PUMPUSDT (4 h) | 0.0007% (last 0.0035%) | **8.2%/yr** | 6.3%/yr; 7% of periods negative | $81.9M | https://fapi.binance.com/fapi/v1/fundingRate?symbol=PUMPUSDT&limit=1000 |
| Bybit PUMPFUNUSDT (4 h) | 0.005% | 7.0%/yr | 6.6%/yr | $42.3M | https://api.bybit.com/v5/market/funding/history?category=linear&symbol=PUMPFUNUSDT |
| OKX (8 h) | 0.0028% | 3.7%/yr | n/a | $26.5M | https://www.okx.com/api/v5/public/open-interest?instId=PUMP-USDT-SWAP |
| CoinGlass aggregate | n/a | n/a | n/a | **$352.4M**; 24-h liquidations $1.69M | V-sec https://www.coinglass.com/currencies/PUMP |

**Positive** funding: a perp short collects ~7-15%/yr; negative episodes in week 42 (Binance min −0.0026%). **Spot lending**: Binance `isMarginTradingAllowed = true` (VERIFIED https://api.binance.com/api/v3/exchangeInfo?symbol=PUMPUSDT). **Options**: 0 instruments on Bybit (VERIFIED); no other venue found (UNCERTAIN).

## 4. Counter-theses

| Item | Content | Status / Source |
|---|---|---|
| Delphi "Bigger Than Binance" (10/07/2025, S. Shockey) | Cumulative revenue > $780M; ICO $4B FDV vs HYPE/JUP/RAY: **$11.6B at 21.5× / $18.4B at 34.3×** 90-d revenue; 25% revenue share proposed; risks: VC unlocks, lawsuit; Binance = aspiration, not a valuation | V-sec https://members.delphidigital.io/reports/bigger-than-binance-how-pump-funs-1-3b-raise-sets-up-cryptos-most-hated-rally |
| 4Pillars (17/03/2026) | DefiLlama revenue $300.0M = 100.05% of buybacks; fees→revenue 1.0 → 0.48; "trust discounts compress" | V-sec (URL §1) |
| Tokenomist (11/07/2026) | "The $125M July 2026 Insider Unlock" | V-sec https://tokenomist.ai/research/pump-tokenomics-what-the-july-12-2026-insider-cliff-means-for-a-fixed-1t-supply-2 |
| Messari / Blockworks / Artemis | Not located within the time budget | UNCERTAIN |
| Losing traders | Dune @Adam_Tehc (06/2025): 62.5% at a loss, 311 wallets > $1M; Dune @oladee (03/2026): 50.6% at a loss, 96% loss or < $500; Solidus: 98% of tokens suspect, 1.4% with liquidity | V-sec https://crypto.news/over-60-pump-fun-traders-saw-losses-less-than-0-01-made-over-1m/ ; https://crypto.news/pump-fun-data-shows-49-of-march-traders-in-the-red-as-platform-locks-fees/ |
| **Alon's response** | **No direct public quote found** (Unchained, crypto.news, yellow.com; BeInCrypto and X inaccessible). Only clue: private messages cited in the second amended Burwick complaint, "an extremely low probability of winning, [removed for publication: sensitive wording]" (paraphrase from the file) | UNCERTAIN https://www.chaincatcher.com/en/article/2237236 |
| Verifiable quotes | 28/04 (X): the other half keeps pump.fun alive "for decades to come"; 17/10: "All platform fees that do NOT go to referrals will go towards INCREASING the Callout Rewards pot. $300k/day is the baseline." | V-sec CoinDesk; https://www.tokenpost.com/news/business/33804 ; https://x.com/a1lon9/status/2049233387328565548 |

## 5. News, August-Oct. 2026

| Date | Event | Status / Source |
|---|---|---|
| 02-03/09/2025 (reminder) | **Project Ascend**: PumpSwap creator fee 0.95% (420-1,470 SOL mcap) tapering to 0.05% (≥ 98,240 SOL); protocol 0.05%; bonding curve 0.30% creator + 0.95% protocol | VERIFIED https://pump.fun/docs/fees (updated 17/10) |
| 12/08 | 1st monthly tranche 6.875B | V-sec KuCoin |
| ~31/08 | **RICO** (SDNY, *Aguilar v. Baton Corp*, Judge McMahon): Solana Labs/Foundation, Jito dismissed; Securities Act claim rejected; **RICO maintained** (wire fraud, [removed for publication: sensitive legal term], unlicensed money transmission) against Baton, Tweedale, **Cohen**, Kerler; 10/09 deadline on 25 KOLs | V-sec https://protos.com/solana-labs-dropped-from-burwick-laws-pump-fun-lawsuit/ |
| 09-13/09 | Custom Pairs ($1.08M of fees; 50% → burn) | VERIFIED pump.fun/pump-token |
| 07/10 | High of $0.006664; −32% by 15/10 | V-sec https://www.tokenpost.com/news/investing/33024 |
| 12-14/10 | **Callout Rewards** review (followers' PnL multiplier); 30-d revenue $65.63M, buybacks $29.48M | V-sec https://www.tokenpost.com/news/business/32131 |
| 16-17/10 | **Perps via Hyperliquid** (builder ≤ 0.10%, bridge ≤ 0.25%, US excluded); **platform fees 0.45% / 0.40%** (web + app, excluding Terminal); EVM 0.10-0.15% | VERIFIED https://pump.fun/docs/fees |
| 18/10 | −19.7% over 7 d, OI −10%/24 h, negative funding; 30-d fees record $60M | V-sec https://www.tokenpost.com/news/investing/34264 |
| 19-20/10 | **Pre-IPO tokens** (PreStocks: OpenAI, Anthropic, Polymarket, Kalshi, Figure AI, Neuralink, Anduril, Oura; US excluded), +8.4% | V-sec https://www.kucoin.com/news/flash/pump-fun-launches-pre-ipo-tokens-for-openai-polymarket-drives-8-pump-price-surge |
| 20/10 | 7.5% of the 1,083,771 tokens of September traded ≥ 7 d after launch | V-sec https://www.tokenpost.com/tag/pump-fun |

**Catalysts**: unlocks 12/11 and 12/12; dashboard correction; RICO follow-ups; **≈ 28/04/2027 end of the 50% lock** (UNCERTAIN).
