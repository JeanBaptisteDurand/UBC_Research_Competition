# The arguments, the objections tested, the limits

*Written from the paper (executive summary, Investment proposal, Appendix D). Each number has its command in `NUMBERS.md`.*

## The three pillars and where their evidence is

| pillar | claim | own data (16 days) | public data (32 months) | where to check |
|---|---|---|---|---|
| 1. The crowd loses, and it is thinning | median position −17.4 % at 20–60 s (−13.3 % all entry times), negative on 16/16 days under every rule; active buyers −26 % week on week, LaunchLab swaps −71 % on the same days; graduations −57 % Tuesday to Tuesday; PumpSwap fees −18 % week on week | `03-sixteen-days-tick-level.md` §3–4, §10 | `02-public-series-2024-2026.md` §2 (revenue w/w) | `make check` B3, B12–B19, B11, A26 |
| 2. The toll was cut | take rate 100 % (Jan 2025) → 58 % (token launch) → 32 % (Sep 2026), 35 % trailing; 18 ¢ of each fee dollar on the policy, 15 ¢ on observed buybacks; ticking up since mid-September | — | `02-public-series-2024-2026.md` §1 | A1–A4 |
| 3. Priced for the peak | 2.6× run-rate revenue; base Feb–Jun $398M → $0.0022; revenue −87 % and −52 % after the two prior peaks; trailing 12 months −38 % on the year before; the multiple ran 1.6×–4.2× over the last year | — | `04-valuation-and-derivatives.md` §2–4, `02-…` §1 | A8–A18 |

## Objections tested and rejected (or not settled)
- *The crowd always lost and pump.fun survived two collapses.* True. The claim is that this crowd is thinning while the price assumes it stays; the stops say when that claim fails.
- *The crowd is rotating back to pump.fun.* Its launchpad share rebounded 10 % → 52 % (launchpads only), but the pie is −70 % from its peak, buyers −26 % and LaunchLab −71 % in a week: a cooling game, not a rotation. One of the stop readings.
- *The volume is wash trading.* Wash trading is 1.3 % of pump.fun volume on the strict lower bound (Szwajcok et al. 2026); the claim is the opposite: real, negative-sum volume, which is worse for durability.
- *CoinGecko finds 73 % of pump.fun wallets with a positive realised P&L.* Realised P&L ignores unsold bags; the strict rule counts them at zero, the valued rule at the last price: −15.4 %.
- *The −17.4 % is an artefact of positions never sold.* Excluding them the median is −12.2 %, negative on all 16 days; the never-sold share tracks the strict median across days (r = −0.89) but not the median of the rest (r = −0.50); the follow-up horizon is the same every day.
- *The base of revenue is a choice.* It is, and the grid shows the alternatives: June trough, Feb–Jun average, trailing 12 months, last week, peak run-rate, at 1.9×, 2.6× and 3.2×.
- *The take rate was cut in 2025, not 2026, and it is rising again.* Yes: 40–45 % from October 2025 to August 2026, 32 % in September, 36 % in October; the rise is a stop reading, and the per-fee-dollar figure is given on the policy and on observed buybacks.
- *The paper measures the minority of the product (the curve ≈ 30 % of fees).* PumpSwap, the part not measured, lost 18 % of its fees week on week against 14 % for the curve; graduations, the flow that feeds PumpSwap, −57 %.

## What would prove the thesis wrong
Weekly revenue at or above $16M for four consecutive weeks (four, because the series fell 39 % in the first week of September and recovered in four); active buyers back above 155,000 a day for two weeks; total launchpad fees (launchpads only, 16 venues) back above $58M a week. A weekly revenue of $12–14M is not a stop: it values PUMP at $0.0035–0.0041, below today's price.

## Risks the paper carries
The crowd returns and the multiple follows (4.2× at the September month-end); the take rate is restored or the buyback raised by the config authority, or topped up from the $1.32B raised; a squeeze (open interest 16 % of market cap, ~14 % of circulating supply on exchanges); funding turning against the short; product expansion (app, perpetuals) lifting revenue per buyer; the RICO case moving either way.

## Limits
Sixteen days are one regime. The Arc and Robinhood Chain campaign (`../arc-robinhood/`) proves the method and the operators' behaviour, not PUMP's price. Sales after graduation are invisible. The valuation is linear in revenue, so the agreement between the target and the buyback-coverage price proves little by itself. The trade's expectancy is negative without the drift the thesis predicts; hence checkpoints rather than a tight stop.
