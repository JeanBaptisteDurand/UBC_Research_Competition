> *Author's working note, written in French on October 21, 2026 while preparing the paper; translated to English with an AI assistant for publication; every number is as in the original (some were later superseded: the paper and `NUMBERS.md` are the reference). Removed for publication: local file paths and script name; one internal reviewer reference; one detail about the author's test bots. Dates are DD/MM/YYYY, as in the original.*
> **What changed since this note (see `NUMBERS.md`):** the target became $0.0022 (−54 %) on a Feb–Jun 2026 base at 2.62×; the pie is now counted on the launchpads alone (83 → 10 → 52 %, −70 %); the trade has no price stop.

# Verified PUMP data (21/10/2026), and what they change

> **VERIFIED**: DefiLlama API `summary/fees/pump` (parent protocol = pump.fun + PumpSwap + Terminal + mobile app; `dataType=dailyRevenue` and `dailyFees`) and CoinGecko API `coins/pump-fun` (365-day history + supply), queried on 21/10/2026. Raw responses and the fetch script: [removed for publication: local file paths].

## 1. Protocol revenue (DefiLlama, $M per month)
| Month | Revenue | Fees | | Month | Revenue | Fees |
|---|---|---|---|---|---|---|
| 2025-01 | **149.8** | 149.8 | | 2026-01 | 48.0 | 120.9 |
| 2025-02 | 73.6 | 73.6 | | 2026-02 | 37.9 | 90.7 |
| 2025-03 | 41.7 | 46.9 | | 2026-03 | 36.3 | 82.8 |
| 2025-04 | 55.2 | 77.6 | | 2026-04 | 30.6 | 67.4 |
| 2025-05 | 58.9 | 90.4 | | 2026-05 | 34.4 | 78.6 |
| 2025-06 | 46.1 | 71.8 | | 2026-06 | **26.6** | 66.3 |
| 2025-07 | 20.1 | 34.3 | | 2026-07 | 33.7 | 86.7 |
| 2025-08 | 45.3 | 71.0 | | 2026-08 | **58.1** | 145.1 |
| 2025-09 | 55.5 | 123.8 | | 2026-09 | 53.1 | 165.4 |
| 2025-10 | 37.6 | 85.9 | | 2026-10 (1-20) | 46.4 | 128.6 |
| 2025-11 | 34.7 | 79.3 | | | | |
| 2025-12 | 34.0 | 83.5 | | | | |

- Total 2025 ≈ **$652M** of revenue (CoinDesk's "$971M" probably refers to fees or to another scope, so do not cite it without specifying).
- **Weekly revenue**: ~$6M/week in June-July 2026 (baseline), then a peak of $17.7M (W35, late August), then a trough of $10-12M (September), then a **second peak of $17.9M (W40, early October)**, then 17.2 (W41), then **14.3 (W42, −17%)**; last known day (20/10): $2.07M.
- ⇒ Current revenue is **≈ 2.5-3x the first-half 2026 baseline** and **seems to be starting to recede** from the early-October peak.

## 2. Price and market cap (CoinGecko, end of month)
| Month | Price $ | Circ. MC $M | | Month | Price $ | Circ. MC $M |
|---|---|---|---|---|---|---|
| 2025-10 | 0.00441 | 1,562 | | 2026-04 | 0.00174 | 629 |
| 2025-11 | 0.00289 | 1,710 | | 2026-05 | 0.00178 | 628 |
| 2025-12 | 0.00184 | 1,087 | | 2026-06 | **0.00150** | 609 |
| 2026-01 | 0.00281 | 1,659 | | 2026-07 | 0.00198 | 787 |
| 2026-02 | 0.00179 | 1,059 | | 2026-08 | 0.00447 | 1,771 |
| 2026-03 | 0.00166 | 977 | | 2026-09 | **0.00588** | 2,738 |
| | | | | 2026-10 (21/10) | 0.00474 | 2,191 |

- Supply (21/10): **circulating 461.9B**, total 826.8B, max 1,000B. FDV $3.92B.
- **Price ≈ ×3 from June to September 2026, exactly when revenue rose ≈ ×2.5-3.** The price peaked in late September and has already fallen by ~19%.

## 3. Inconsistencies in the file: resolved
| Question | Verified answer |
|---|---|
| Revenue of ~$320M/yr or ~$745M/yr? | **Both, at different times.** ~$320-370M/yr = the first-half 2026 baseline (April: $30.6M × 12). ~$720-850M/yr = the pace of the August-October 2026 peak. |
| Burn of 36% or of 17.3%? | **36% of circulating supply** (MC from 977 → 629 $M between March and April at a nearly constant price) = **~17% of total supply**. Both figures are correct. |
| Why did PUMP triple while its share fell to 27%? | **The pie exploded**: the summer 2026 memecoin mania (Robinhood Chain on 01/07, Arc on 16/09) inflated all launchpads. pump.fun lost share but gained in absolute terms (revenue ×2.5-3), and the price followed revenue. |
| Circulating supply | ~361B in April (after the burn) → ~397B in July-August → **~466B at end of September (+70B in one month: unlock)** → 462B. **+28% circulating supply since April.** |

## 4. What this changes for the thesis (strengthened version)
**Before**: "PUMP is losing its moat, its revenue is falling." → **false today** (revenue is at its highest since early 2025).
**Now**: *"PUMP's price is only the valuation of a cyclical revenue peak. In the first half of 2026, with baseline revenue (~$6M/week), PUMP was worth ~$0.0017. The summer memecoin mania (new chains) produced ×2.5-3 on revenue and ×3 on price. But the fuel for this peak is running out: we saw it from the inside on Arc and Robinhood (factory families shut down, Pons fees from $35M to $11M/week, arbitrage on Arc ÷ 130), and pump.fun's revenue has already fallen 17% in one week."*

**Derived target (first approach, to be refined)**: the market applies an approximately constant multiple to current revenue:
- Current pace (W40-W42 ≈ $16.4M/week ≈ $850M/yr; holder revenue = 50% ≈ $425M) → FDV / holder revenue ≈ **9.2x**.
- **Return to the first-half baseline** (~$6.3M/week ≈ $330M/yr; holders ≈ $165M) at a constant multiple → **FDV ≈ $1.5B (−61%) ≈ $0.0018**, which is precisely the first-half 2026 price ($0.0015-0.0018). **The price has already made the round trip once.**
- Scenarios to build: bear (return to baseline + end of buybacks + unlocks), base (halfway return, ~$0.0028, −40%), bull (the peak becomes the new baseline).
- Plus rising circulating supply (+28% since April) and the end of the 50% buyback program around April 2027.

**This is the "cyclical at a low multiple" trap**, which an earlier review had named without proving [removed for publication: internal reviewer reference]. We prove it: revenue ×2.7 and price ×3 over the same period, then a pullback in revenue.

## 5. Still to do (P1)
- Verify the unlock schedule (the +70B step in September: who? when is the next one?).
- Verify the buyback program (end date, calculation base) against the primary source.
- Measure the revenue ↔ price link (weekly regression) and the revenue ↔ new-chain activity link (our data + DefiLlama Pons, Arguspad).
- Launchpad market-share series (DefiLlama Launchpad category).
