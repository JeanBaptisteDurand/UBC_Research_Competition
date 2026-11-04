# Allium queries

Second pipeline for the cross-check defined in `../../DEFINITIONS.md`. The queries run in Allium Explorer, Academic plan, on the table `solana.dex.trades`. Each file was committed before its first run. A changed query is a new file, and the old one stays.

On this table a buy on a curve is a trade whose `token_sold_mint` is wrapped SOL. The buyer is the trade's `signer`. The curve is `protocol = 'pumpfun'`, the pool after graduation is `protocol = 'pumpswap'`, and LaunchLab is `protocol = 'raydium-launchlab'`.

| file | what it measures | window |
|---|---|---|
| `q0-protocols-one-day.sql` | Solana DEX protocols by number of swaps, to name the launchpads | Oct 6, 2026 |
| `q1-overlap-daily.sql` | swaps, buys, buyers and signers per day on the pump.fun curve and on LaunchLab, plus distinct buyers over the 16 days | Oct 5–20, 2026 |
| `q4-overlap-crowd.sql` | creations, graduations, second buyer, creators' P&L and the crowd median (20–60 s) | Oct 5–20, 2026, with Oct 4 read as look-back |
| `q4b/c/d-*.sql` | the same query on three earlier fortnights, run only if `q4` falls within the tolerance | Feb 1–16, May 1–16, Aug 1–16, 2026 |

The results are published as aggregates only, under "Source: Allium" (https://allium.so), as Allium's academic terms ask. No row per address leaves the Explorer.
