# Method and instrument

*Written from Appendix A and E of the paper. The code is in `scripts/lab/` (JavaScript, read-only) and `data/pumpfun-16d/aggregate.py`.*

## 1. The collector
A read-only subscriber to Solana's public RPC websockets (two sources, each checked against the other) that records every transaction of the programs it follows, hour by hour, in compressed JSON lines. For pump.fun it follows the bonding-curve program and Raydium LaunchLab's. Each hour's file carries a coverage record: minutes with no source, minutes with one source, duplicates, bundles, and a **canary** that compares the number of program transactions received with the number the chain reports for a sample of slots. Over the sixteen days: 10 minutes without a source out of 23,040; canary ≥ 0.98 every day for pump.fun.

## 2. The lab tool (`solana-courbes.mjs`)
Runs once per UTC day on the 24 hourly files plus the first hour of the next day (to close positions born late in the day). It:
1. **Rebuilds the bonding curve** of every token from its swaps and checks each swap against the curve formula: a buy must move the price up and a sell down, and the reconstructed price must match the on-chain virtual reserves (relative deviation reported; 95–98 % of swaps verified exactly, the rest being swaps the formula cannot reproduce because of a state change in the same slot).
2. **Builds positions**: for each buyer and token, the SOL paid, the SOL received, the entry age (seconds since the token's birth), whether the position was closed, and two P&L figures: **strict** (unsold tokens counted at zero) and **valued** (unsold tokens priced at the last curve price seen).
3. **Separates families**: tokens quoted in SOL (`pf|SOL`, the paper's universe), pump.fun's "mayhem" variant, other quote tokens, and LaunchLab.
4. **Excludes the creator's cluster**: the creator's own buys and sells are kept apart (`mainCreateur`); the "second buyer" is a buy from outside that cluster.
5. **Replays recipes**: for a grid of entry ages E and holding times H, the exact-state replay of a small buy at E seconds after birth sold H seconds later, at the marginal price and net of the costs of a real buy of 0.005 to 0.1 SOL (`rejeu`); the same for the first seconds (`sniper`); and the real third-party buys at each (E, H) (`tiers`).
6. **Runs the controls**: the positive control (graduated tokens must multiply their price by (115/30)² ≈ 14.7 from birth to the end of the curve: the tool finds ×14.70 every day), the out-of-sample test (the best replay cell is chosen on the first half of the day and judged on the second), and the matched control for the creator's sales (how often the creator sells within 3 s of an outside buy, against the same tokens at the same age with no outside buy).
7. **Writes** `<day>.json` (everything above), `<day>.positions.jsonl` (one line per position, 3.9 GB over 16 days, on request) and a log with time and memory.

`aggregate.py` pools the 16 days: medians are recomputed over all positions (not medians of medians), tokens are partitioned by day of birth so that no position is counted twice, and the active and new buying addresses are counted per day. `check/robustness_2060.py` and `scripts/food_chain.py` read the per-position files for the variants and the food chain; `scripts/export_level_b.py` produces the two compact files that let anyone recompute the headline numbers without the 3.9 GB.

## 3. Definitions used in the paper
- **Launch**: a token minted on the curve. **Graduation**: the curve fills and the token moves to PumpSwap. **No trade**: a token that never saw a swap.
- **Second buyer**: at least one buy within 60 s from an address outside the creator's cluster (strict: not a known bundle or sniper pattern; variants with a minimum size of 0.01 and 0.05 SOL).
- **The crowd**: third-party buyers; **the crowd proper**: entries 20–60 s after birth, on tokens that did not graduate that day (the universe of the −17.4 %).
- **Strict P&L**: SOL received ÷ SOL paid − 1, unsold tokens at zero, curve fees included (0.95 % per swap plus 0.30 % creator fee; a round trip costs ≈ 2.5 %). **Valued P&L**: unsold tokens at the last curve price.
- **Active buyer**: an address with at least one curve buy that day. **New entrant**: an address not seen in the previous 7 days (defined from day 8). **Retention**: share of a day's new entrants seen again the next day or within 7 days.
- **Address**: one wallet. Merging co-signing wallets was tested on the food-chain run and changed nothing (same count, 1,129,662).
- **Same-chain control**: Raydium LaunchLab's swaps per day, read by the same collector on the same days.

## 4. What the instrument misses
- Sales after graduation on PumpSwap are invisible: P&L on graduated tokens and creators' P&L are lower bounds.
- Solana transaction, priority and trading-bot fees are not deducted: the crowd's true P&L is worse than shown.
- Bots, snipers and wash trades are not filtered out of the crowd; if anything they make its median less negative.
- An address is not a person.
- Sixteen days are one regime; consecutive days are not independent, so day-level sign tests are indicative. The daily medians (−12.3 % to −25.6 %) are the honest spread.
- The graduation rate measured (2.5 %) is above the literature's 0.6–1.0 % for 2024–2025 (Marino et al. 2026; Szwajcok et al. 2026): a mania month and a different perimeter (SOL-quoted tokens only).
- Kamat (2026) shows that two collectors can see almost disjoint token sets, which is why coverage is reported for every day.
