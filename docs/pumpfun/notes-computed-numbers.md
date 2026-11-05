> *Author's working note, written in French on October 21, 2026 while preparing the paper; translated to English with an AI assistant for publication; every number is as in the original (some were later superseded: the paper and `NUMBERS.md` are the reference). Removed for publication: internal file and figure references; local file paths; a reference to internal reviewers; one detail about the author's test bots; two phrasings reworded. Dates are DD/MM/YYYY, as in the original.*
> **What changed since this note (see `NUMBERS.md`):** the target is $0.0022 (−54 %), not $0.0018 or $0.0023; the launchpad pie is counted on the launchpads alone (16 venues): $6.5M → $85M → $26M (−70 %), pump.fun's share 83 % → 10 % → 52 %, instead of 92 → 31 → 76 % and −54 %; the price stop was replaced by a thesis stop and a catastrophe stop on the PUMP/SOL ratio; the active-buyer count is 1,129,662 addresses; the take rate is 32 % (September) and 35 % trailing.

# Computed numbers for the paper (21/10/2026)

> VERIFIED: computed from raw API responses (DefiLlama API `summary/fees/{pump,pons,arguspad}`, CoinGecko `market_chart` PUMP and SOL 365 d, Binance `fundingRate` + `openInterestHist` PUMPUSDT, Hyperliquid `metaAndAssetCtxs`), all queried on 21/10/2026. Weekly series and figures: [removed for publication: local file paths].

## 1. "Same clock": weekly fees ($M)
| Week | pump.fun fees | pump.fun revenue | **Pons** (Robinhood) | **Arguspad** (Arc) | Our dates |
|---|---|---|---|---|---|
| W26 (22/06) | 16.4 | 6.3 | n/a | n/a | |
| W27 | 21.6 | 7.9 | n/a | n/a | **01/07 Robinhood mainnet** |
| W29 | 15.9 | 6.3 | 3.0 | n/a | Pons starts |
| W30 | 20.7 | 8.0 | 8.5 | n/a | |
| W34 | 34.6 | 13.7 | 2.4 | n/a | |
| W35 | 45.1 | 17.7 | 16.8 | n/a | |
| **W36 (31/08)** | 32.8 | 10.8 | **51.0** | n/a | **Pons > pump.fun**; Pons daily peak $11.4M on 05/09 |
| W37 | 34.4 | 10.2 | 48.3 | 0.01 | |
| W38 | 37.9 | 11.9 | 23.0 | **3.16** | **16/09 Arc mainnet**; Arguspad peak $2.3M/day |
| W39 | 45.0 | 15.2 | 14.8 | 1.08 | |
| **W40 (28/09)** | **51.8** | **17.9** | 9.5 | 0.46 | **pump.fun peak**; family 1526o shut down 06/10 |
| W41 | 47.3 | 17.2 | 4.1 | 0.15 | **13/10: our bots stopped** |
| W42 | 39.0 | 14.3 | 3.3 | 0.08 | |
| W43 (2 days) | 11.6 | 4.2 | 1.5 | 0.04 | |

**Reading**: the newer launchpads peaked **first** (Pons W36, Arguspad W38), and pump.fun **4 weeks later** (W40). Pons: −94% in 6 weeks; Arguspad: −97% in 4 weeks; pump.fun: −25% in 2 weeks since its peak. ⚠️ Note: Pons and pump.fun **both** rose in August (this is not a transfer from one to the other; it is a common mania); the transfer works the other way on the way down: when the newer launchpads fade, pump.fun does not pick up their flow (its revenue falls too).

## 2. PUMP / SOL beta (daily log returns, CoinGecko)
| Window | Beta | Correlation | PUMP vol. | SOL vol. |
|---|---|---|---|---|
| 90 d | 0.91 | 0.36 | 140%/yr | 56%/yr |
| 180 d | 1.04 | 0.46 | 122%/yr | 54%/yr |
| 365 d | 1.16 | 0.61 | 122%/yr | 64%/yr |
→ **Hedge: long SOL for ~1.0× the value of the PUMP short** neutralizes market beta; the specific risk remains (PUMP vol. ≈ 2.2× that of SOL).

## 3. Perps: carry cost and liquidity
| Venue | Recent funding | Annualized | OI |
|---|---|---|---|
| Binance PUMPUSDT | +0.0038%/8h (30 d), positive 93% of the time | **+4.1%/yr** | $86M (30-d avg: $103M) |
| Hyperliquid PUMP | +0.0013%/h | **+11.0%/yr** | $153M |
→ **Positive** funding = longs pay shorts: **a PUMP short is paid ~4-11%/yr to wait** (no carry cost, quite the opposite). Total OI ≈ $240M: a position of a few hundred $k is absorbable. Risk: funding can flip in a squeeze.

## 4. Circulating supply (MC / price, CoinGecko): one burn, three steps
| Date | Before → after (B) | Change | Interpretation |
|---|---|---|---|
| 30/04/2026 | 590.0 → 360.9 | **−38.8%** | April burn (≈ 229B; consistent with "36% of circulating supply") |
| 26/06/2026 | 345.3 → 407.2 | **+17.9%** | unlock (~62B) |
| 09/09/2026 | 395.1 → 414.9 | +5.0% | unlock (~20B) |
| 14/09/2026 | 414.9 → 468.8 | **+13.0%** | unlock (~54B) |
| 21/10/2026 | 461.9 | | **+28% since the burn** |
→ **Visual reading**: between two steps, circulating supply **declines slowly** (≈ −1%/month: this is the buyback-burns, ~$0.9M/day); each unlock step (+13 to +18%) ~~wipes out more than a year of buybacks at once~~ (WRONG, corrected on 21/10: ≈ 1 month of buybacks at the peak, 2 months at baseline [removed for publication: internal file reference]). This is the simplest demonstration that "buybacks support the price" is an illusion of net supply.
→ ⚠️ **Corrected with the official schedule** [removed for publication: internal file reference]: the steps above are **CoinGecko's update dates**, not the actual dates. Official schedule: **82.5B cliff on 12/07/2026**, then **6.875B PUMP on the 12th of each month** (≈ $32.6M at the current price) until July 2029; next ones: **12/11/2026, 12/12/2026, 12/01/2027** (V-sec, exact day not confirmed). Buybacks: **$490.65M cumulative, 172.96B burned = 17.3% of total supply** (official pump.fun page pump.fun/pump-token, 20/10); program "50% of revenue, programmatically locked for one year" since 28/04/2026 → **end ≈ 28/04/2027** (inferred, not published). **Monthly net supply**: unlocks ~$32.6M vs buybacks ~$27M at peak revenue (≈ balance) but **~$13M at baseline revenue → ~−$20M/month ≈ 0.9% of MC**, and **0 buybacks after April 2027**. The CoinGecko gap (+136B implied vs ~103B official since April) comes from CoinGecko's method (to mention in a note, not in the body).
→ **Perps (cross-check with primary sources)**: aggregate OI Binance + Bybit + Hyperliquid + OKX ≈ **$352M**; 30-d funding: Binance 4-8%/yr depending on the method, Hyperliquid 11-15%/yr; **spot margin allowed on Binance; no options listed**. → Cite a range "+4 to +15%/yr".

## 6. The total launchpad pie, all chains (DefiLlama, 16 platforms > $0.3M/30 d) [sic: section numbering follows the original, 1, 2, 3, 4, 6, 7, 5]
| Week | pump.fun | others (Flap, Pons, StonkFun, LaunchLab, BONK.fun, Argus…) | **Total** | pump.fun share |
|---|---|---|---|---|
| 01/06 | 14.1 | 1.1 | 15.2 | **92%** |
| 29/06 | 21.6 | 1.8 | 23.3 | 92% |
| 06/07 (Robinhood) | 17.8 | 10.9 | 28.6 | 62% |
| 17/08 | 34.6 | 8.6 | 43.2 | 80% |
| 31/08 | 32.8 | 72.6 | 105.4 | **31%** |
| **07/09** | 34.4 | 76.4 | **110.8 (peak)** | 31% |
| 21/09 | 45.0 | 43.6 | 88.6 | 51% |
| 28/09 (pump.fun peak) | 51.8 | 34.6 | 86.4 | 60% |
| 05/10 | 47.3 | 18.1 | 65.4 | 72% |
| **12/10** | 39.0 | 12.4 | **51.4 (−54% vs peak)** | **76%** |

**Reading (answer to the first question a skeptical reader would ask, "is the crowd coming back?")**: pump.fun's share rose from 31% to 76% **while the total pie lost 54%** and while pump.fun's own fees fell 25%. The crowd did not come back to pump.fun: it left. **Only series to use in the paper** (drop the press's "80% → 27%", whose denominator is unknown).

## 7. Comparables (CoinGecko MC/FDV; DefiLlama 30-d annualized revenue)
| Token | MC | FDV | Revenue/yr | **MC / revenue** | FDV / revenue | Fees/yr |
|---|---|---|---|---|---|---|
| **PUMP** | $2.22B | $3.97B | $824M | **2.7×** | 4.8× | $2,337M |
| HYPE (Hyperliquid) | $18.1B | $77.8B | $822M | 22.0× | 94.6× | $1,024M |
| JUP (Jupiter) | $1.07B | $2.20B | $57M | 18.6× | 38.4× | $201M |
| RAY (Raydium) | $0.54B | $1.10B | $54M | 10.0× | 20.5× | $326M |
| PONS (Pons V2) | $0.19B | $0.19B | $59M | 3.2× | 3.2× | $394M |

**Honest reading**: PUMP is **the cheapest** of its peers (2.7× against 10-22×): the market already judges this revenue non-durable (launchpads are priced at ~3×, DEXs/perps at 10-22×). **The decline cannot come from multiple compression; it comes from the denominator** (revenue returning to its baseline). Single multiple retained: **MC / annualized revenue (rolling 30 d) = 2.7×**. Base-rate check: in June 2026, MC ≈ $609M for ~$330M/yr of revenue → 1.9×; so at baseline revenue, a multiple of 1.9-2.7× gives **$0.0014-0.0019** (−60 to −70%). Central target $0.0018 is consistent.

## 5. What this changes in the plan
- The "Same clock" figure is now drawn on public data (not only our dates): the paper's first argument.
- **Trade**: short 1× + long SOL 1.0×; funding in our favor; stop $0.0065.
- **Net supply**: at the revenue baseline (~$6M/week → ~$13M/month of buybacks), unlocks (~$130M/month equivalent) outweigh buybacks by a factor of ~10 → to verify against the official schedule before writing the figure.
