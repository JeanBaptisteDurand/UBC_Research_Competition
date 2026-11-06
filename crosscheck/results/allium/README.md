# Allium cross-check: results

Source: Allium (https://allium.so), Explorer, Academic plan, table `solana.dex.trades` and `solana.assets.spl_token_balances_latest`. The queries are in `../../queries/allium/`, committed before they were run. Only aggregates are published here, as Allium's academic terms ask.

Runs: q0 to q4 between Nov 4, 2026 at 22:56 UTC and Nov 5 at 00:53 UTC. Explorer units used: 12.3 of 100.

## Verdicts against `../../DEFINITIONS.md`
| measure | collector | Allium | tolerance | verdict |
|---|---|---|---|---|
| active buyers per day, Oct 6–12 (mean) | 155,300 | 163,333 (+5.2 %) | level ±10 % | pass |
| active buyers per day, Oct 13–19 (mean) | 114,481 | 137,677 (+20.3 %) | level ±10 % | **fail** |
| week-on-week change | −26.3 % | −15.7 % | same sign, within 5 points | **fail** (sign holds, 10.6 points apart) |
| same weekday pairs down | 7 of 7 | 7 of 7 (−12 % to −22 %) | reported | same direction |
| distinct buyers over the 16 days | 1,129,662 | 1,296,189 (+14.7 %) | ±10 % | **fail** |
| creations, Oct 5–20 | 700,261 (all modes) | 662,977 (−5.3 %) | ±5 % | **fail**, at the edge; the query's creation proxy is an approximation |
| graduation rate | 2.08 % (all modes) | 1.67 % | ±0.3 point | **fail** |
| crowd median, 20–60 s | −17.4 % | −13.2 % (2,249,019 positions) | ±2 points | **fail** (sign holds, 4.2 points apart) |
| creators' P&L | −28.8 % | +28.9 % | ±5 points | **fail**; the query takes the signer of the first swap as the creator, which is often a bundled sniper, not the creator |
| second buyer within 60 s | 51.3 % | 69.2 % | reported, not calibrated | — |
| LaunchLab swaps per day | 122,640 → 35,484 (−71.1 %) | 172,442 → 78,660 (−54.4 %) | ±10 % | **fail** (sign holds) |

Rule 2 applies: the Allium series are shown as "second pipeline, not calibrated", and the crowd median is not extended to earlier fortnights (`q4b`, `q4c` and `q4d` were not run).

## What the gap is
- The gap is not constant. On Oct 5–14 Allium counts 3 % to 11 % more buyers than the collector, day by day. From Oct 15 the gap widens: +20 % to +22 % on Oct 15–18, then +49 % and +44 % on Oct 19 and 20 (`q1-overlap-daily.csv` against `docs/pumpfun/03-sixteen-days-tick-level.md` §10).
- Allium's swap counts on the curve stay flat, at 3.9 to 5.1 million a day. The collector's fall from 2.95 million (Oct 5) to 1.31 million (Oct 19). The collector saw 68 % of Allium's swaps on Oct 5 and 27 % on Oct 19.
- All curve swaps in Allium go through one program id (`6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P`), about 70 % of them wrapped in another program (`q1b-overlap-programs.csv`). The drift is therefore not a new pump.fun program. It is a loss of coverage on the collector's side that its canary did not catch. The cause is not established.
- Consequence: the collector's week-two figures understate activity. The fall in buyers is real in both pipelines, every weekday down, but it is −16 % in Allium, not −26 %. The crowd median is negative in both, −13 % in Allium against −17 % in the collector.

## Holdings of PUMP (`q3-pump-concentration.csv`)
423,446 holders. Top 10 addresses: 59.4 % of all balances. Top 100: 88.2 %. Accounts Solscan labels as pump.fun's (custodian, Squads vaults, livestream allocation): 55.6 %. The 422,446 holders outside the top 1,000 hold 1.3 % together. Solscan on Oct 22 gave 60.3 % and 88.6 % (`data/raw/solscan_pump_holders_2026-10-22.md`).

## Nine months, Feb 1 – Nov 3, 2026 (`q2-nine-months-daily.csv`, second pipeline, not calibrated)
Run on Nov 5, 2026, 00:09–00:16 UTC (395 s). One row per day and protocol: swaps, buys, buyers, tokens bought, SOL volume. The SOL volume of `pumpswap` is not usable as it stands: a few pools with mispriced amounts dominate it (77 million SOL on Feb 1). Swaps and buyers are.

Active buyers per day on the pump.fun curve, monthly mean:

| Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Oct 21 – Nov 3 |
|---|---|---|---|---|---|---|---|---|---|
| 154,126 | 130,924 | 107,979 | 104,416 | 100,870 | 117,127 | 129,242 | 129,895 | 149,431 | 124,081 |

- Weekly means (Monday to Sunday) peak in the week of Sep 28 at 192,000 a day, then fall four weeks in a row: 163,000, 141,000, 136,000, 122,000 (week of Oct 26), −36 % from the peak week. Only three of 39 full weeks average 155,000 or more: Feb 2, Sep 28 and Oct 5.
- Of 38 week-on-week changes, three are −15.7 % or worse, and none reaches −26 %. The steepest are −16.4 % (week of Mar 16), −16.3 % (Jul 6) and −16.1 % (Sep 7).
- pump.fun's share of the five Solana launchpads in this table (swaps): 91 % in February, 94 % in April, 86 % in July, 70 % in September, 81 % in October. Its share of buyers stays between 87 % and 92 % every month.
