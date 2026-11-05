# Sixteen days, not nine months: why, and the plan to get there

*Written on October 26, 2026 from the project's audit of that day. Dates are those of the checks; every size and status was verified on the source that day.*

## Why the collector has sixteen days
The collector is a **live reader**: it subscribes to Solana's public websockets and records the programs' transactions as they happen. It was started on pump.fun on October 4, 2026 at 20:58 UTC; there is no past to replay. Rebuilding nine months with the same tool would mean fetching the full history of the bonding-curve program: at 2 to 5 million swaps a day (Marino et al. 2026), 0.5 to 1.4 billion transactions over 270 days, i.e. months of calls on a public RPC, or a copy of the Solana archive (hundreds of terabytes). Not before the November 9 deadline.

What the sixteen days give is the part no public series has: the position of each buyer, its entry age, its outcome, the creator's behaviour, the hour-by-hour replay, and the same-chain control. What they cannot give is the base rate: whether the crowd was thinner or thicker in March.

## What already covers nine months and more
| series | source | period | where |
|---|---|---|---|
| fees, revenue, take rate, product mix (curve, PumpSwap, Terminal, app), day by day | DefiLlama | March 1, 2024 → October 20, 2026 (964 days) | `data/raw/llama_pump_*`, `02-public-series-2024-2026.md` |
| the launchpad pie, 16 venues | DefiLlama | same | `data/raw/llama_lp_*` |
| price, market cap, the multiple month by month | CoinGecko | 365 days | `data/raw/cg_pump_chart.json`, `04-valuation-and-derivatives.md` |
| funding, open interest | Binance, Hyperliquid | since July 30, 2026 | `data/raw/binance_*`, `hl_meta.json` |

## Public datasets found (checked October 26, 2026)
| source | content | period | access | use |
|---|---|---|---|---|
| Szwajcok et al. 2026, "Meme Coin Factories" (ACM CCS 2026), dataset on KiltHub, doi 10.1184/R1/33420628 | creation of 15M tokens; full history of a 1 % sample (152,171 tokens, 49.97M transactions) and of a 5-day sample; scripts (wash trading, coordinated sells, creator clustering) | January 14, 2024 → January 14, 2026 | **353 GB Postgres dump in 66 parts, CC BY 4.0** (figshare API, 91 files) | the base rate of 2024–2025 for creations, graduations and the crowd's P&L on the sample; too large to use before November 9, planned for the pitch |
| Kamat 2026, "Do Two On-Chain Observation Pipelines See the Same Tokens?", Zenodo 10.5281/zenodo.21399918 | 39 MB zip, scripts and data dictionary, June–July 2026 | June–July 2026 | free, CC BY 4.0 | the method of the cross-check (two pipelines see almost disjoint token sets) |
| Marino et al. 2026, "Predicting the success of new crypto-tokens" | 655,770 tokens, 2.6M traders, 0.63 % graduated, September 2025 | September 2025 | no data release; authors to be asked | comparison point |
| Dune (`pumpdotfun_solana.pump_call_create`, `pump_call_withdraw`; dashboards adam_tehc, seoul) | creations, graduations, users | since 2024 | free plan is read-only since September 10, 2026; Analyst plan $65/month | second pipeline for counts |
| Allium (offered to the competition's teams, briefing October 29, 2026) | historical Solana index | 2024 → | free, time-limited | **the main source for nine months** |
| Blockworks analytics (`app.blockworks.com/projects/pump-fun/analytics/…`: Traders, Creators, Bonding Curve, Buybacks, Financials) | the judges' own numbers | — | rendered in the browser | the figure a judge will compare with |
| Bitquery (pump.fun cloud dataset) | Parquet of creations, migrations, swaps, pools; public one-day samples | one day (July 1, 2026 sample) | samples without a key; history paid | graduation on a pre-mania day |
| pump.fun's own API (`frontend-api-v3`) | trades per token | — | **redistribution forbidden by the terms of use** (Szwajcok et al., Appendix A) | spot checks only |
| Hugging Face, Kaggle, Flipside, Old Faithful | nothing specific to pump.fun; the full ledger ≈ 250 TB | — | — | no |

## The plan, measure by measure (October 30 → November 8)
| measure | source | calibration on the 16 days | before November 9? |
|---|---|---|---|
| active buyers per day | Allium (distinct signers with at least one curve buy, all quote tokens and SOL-quoted separately); Dune as a second pipeline; Blockworks "Traders" | 155,300 → 114,481; ±10 % on the level, same sign of slope within 5 points | yes, 2–3 h |
| creations and graduations | Allium or Dune; Szwajcok for 2024–25; Bitquery for July 1 | 700,261 / 2.08 %; 395,253 / 2.51 % | yes, 1–2 h |
| crowd median, 20–60 s | Allium: P&L per (address, token) = SOL received ÷ SOL paid − 1; one week per month if the query is costly | −17.4 % ± 2 points on the overlap, otherwise no extension | yes, with risk, 4–6 h |
| second buyer | approximate SQL (first buy outside the creator under 60 s) | 51.3 % | approximate version only |
| creators | creator taken from the creation event, sum of its swaps on its token | −28.8 % | yes, 2 h |
| everything, with the author's own tool | collector from October 5 to November 8 (≈ 35 days if the service is restarted; the local mirror stopped on October 21 at 13:41 UTC) | identical | yes, the cheapest |
| base rate 2024–25 | Szwajcok, 1 % sample | no overlap (ends January 14, 2026) | for the pitch |

Rules fixed in advance: the definitions and tolerances are in [`../../crosscheck/DEFINITIONS.md`](../../crosscheck/DEFINITIONS.md); the differences are published whatever they say; a measure is not extended if its calibration fails; past buyer counts are never inferred from fees (that would assume what is to be shown).

## What the paper says meanwhile
Two clocks. The public series carry revenue, fees, the take rate and the launchpad pie day by day since March 2024. The collector is a live reader started on October 4, so who lost, and how fast the crowd thinned, is measured over sixteen days. A one-week fall like the curve's −14 % happened in 7 of the last 40 weeks, so the thesis does not rest on one week: it rests on the composition (fewer new entrants, each remaining buyer paying more), on the same-chain control (LaunchLab −71 %), and on the public series for the level. The revenue stop (≥ $16M for four consecutive weeks) has been reached once in 138 weeks; the PUMP/SOL ratio doubled within 180 days in 32 % of the last year's windows, which is why the catastrophe stop is sized as it is.
