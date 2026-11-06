# pump.fun: the research folder

Everything the paper says about pump.fun and PUMP, at full depth, in one place. Two kinds of documents: the ones **generated from the data in this repository** (regenerate with `make report`) and the ones **written or translated from the author's lab**. Nothing here is typed by hand except the section introductions and the lab documents.

| file | what it is | how it was made |
|---|---|---|
| [`01-method-and-instrument.md`](01-method-and-instrument.md) | the collector, the lab tool, the replay, the controls, the definitions, what the instrument misses | written from the paper's Appendix A and E |
| [`02-public-series-2024-2026.md`](02-public-series-2024-2026.md) | fees, revenue, take rate and product mix month by month since March 2024; week by week in 2026; the launchpad pie | generated from `data/raw/` (DefiLlama) |
| [`03-sixteen-days-tick-level.md`](03-sixteen-days-tick-level.md) | the 16 days of the collector, position by position: coverage, launches, the crowd by entry age, the 20–60 s crowd day by day with the robustness variants, 384 hours, the replay grid and the out-of-sample test, snipers, creators, positive control, users and retention, the food chain, the same days in DefiLlama | generated from `data/pumpfun-16d/` and `results/` |
| [`04-valuation-and-derivatives.md`](04-valuation-and-derivatives.md) | price, supply, the multiple month by month over a year, comparables, the target grid, buyback coverage, the reverse check, funding and open interest | generated from `data/raw/` (CoinGecko, DefiLlama, Binance, Hyperliquid) |
| [`05-arguments-tested-and-rejected-limits.md`](05-arguments-tested-and-rejected-limits.md) | the three pillars with their evidence, the objections tested and rejected, what would prove the thesis wrong, the limits | written from the paper |
| [`06-nine-months-plan.md`](06-nine-months-plan.md) | why the collector has 16 days and not nine months, which public sources exist (with sizes and dates), and the plan to carry each measure over nine months, source by source | written from the audit of October 26 |
| [`07-coverage-reconciliation.md`](07-coverage-reconciliation.md) | the collector's volume against DefiLlama's fees, day by day, and the share of each launch family | generated |
| [`08-data-dictionary.md`](08-data-dictionary.md) | every key of the daily JSON and every column of the published CSV files, in English | generated |
| [`../../crosscheck/DEFINITIONS.md`](../../crosscheck/DEFINITIONS.md) | the definitions and tolerances fixed before the Allium cross-check; queries, results and verdicts in [`../../crosscheck/results/allium/`](../../crosscheck/results/allium/README.md) | done (Nov 5–6) |
| `lab-2026-10-solana-exploration-sheet-pumpfun-launchlab.md` | the lab's exploration sheet for Solana (pump.fun, Raydium LaunchLab), written before the 16-day run | translated from the French original |
| `lab-2026-10-meteora-dbc-and-just-graduated-pumpswap.md` | the lab's note on Meteora's dynamic bonding curve and on "just graduated" tokens on PumpSwap | translated |
| `lab-2026-10-05-launchpad-landscape.md` | the landscape of launchpads on October 5, 2026, across chains | translated |
| `notes-market-data-first-pass.md`, `notes-market-data-verified.md`, `notes-computed-numbers.md`, `notes-primary-sources.md`, `notes-the-2025-long-thesis-confronted.md` | the author's working notes, in the order they were written: the first pass on PUMP's market data, the verified data (API pulls of Oct 21), the computed numbers behind the first drafts, the list of primary sources, and the 2025 finalist long thesis on PUMP read against 2026 | translated from the French originals; some numbers were later superseded, the paper and `NUMBERS.md` are the reference |

## Sixteen days, or thirty-two months? Both, and here is the join

The collector reads every pump.fun swap as it happens and rebuilds each buyer's position from the bonding-curve state. It ran on pump.fun from **October 5 to October 20, 2026**: sixteen UTC days, 68 million transactions read (65.3 million distinct), 1.69 million crowd positions, 1.13 million buying addresses. That is the only window in which the paper can say *who* lost and how fast the crowd thinned; it is one market regime (post-peak October), and the paper says so. The hourly files (8.6 GB compressed) are available on request; the collector's run logs are in `data/pumpfun-16d/`.

The public series go back **to March 2024**: fees, revenue, the take rate and the product mix day by day (DefiLlama), price and market cap for a year (CoinGecko), funding and open interest (Binance, Hyperliquid). They carry the valuation, the three peaks, the toll cut and the launchpad pie. They cannot say how many buyers paid the fees or what each one made.

To carry the collector's measures (active buyers, crowd median, graduations, second buyer, creators) over nine months, the path is a historical index of Solana rather than a live reader: Allium (offered to the competition's teams from October 29), or a public dataset of pump.fun trades. The plan, source by source, is in [`06-nine-months-plan.md`](06-nine-months-plan.md); until then the paper joins the two honestly: the 16 days give the mechanism and the slope, the public series give the level and the history.
