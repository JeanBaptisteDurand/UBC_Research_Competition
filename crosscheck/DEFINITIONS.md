# Cross-check definitions, fixed before the Allium briefing of October 29, 2026

*Written on October 26, 2026. The point of this file is that the definitions and the tolerances exist before the second pipeline is queried, so that no one, the author included, chooses them after seeing the result. Results, whatever they say, go to `crosscheck/results/` with the queries that produced them.*

## Universe
- Program: pump.fun bonding curve (the program the collector follows, `scripts/lab/topics.mjs` and `01-method-and-instrument.md`). PumpSwap is out of scope for the crowd measures (it is in scope for fees, via DefiLlama).
- Days: UTC calendar days. Overlap window for calibration: October 5–20, 2026 (16 days).
- Families: **SOL-quoted tokens** (the paper's universe) and **all launch modes** (SOL-quoted, "mayhem", other quote tokens), reported separately.

## Measures and their definitions
| measure | definition | the collector's value on the overlap | tolerance |
|---|---|---|---|
| active buyers per day | distinct signer addresses with at least one buy on the curve that day, creator buys included (the collector counts the creator's cluster apart only for P&L) | 155,300 (Oct 6–12) → 114,481 (Oct 13–19); 1,129,662 distinct over 16 days | level ±10 %; week-on-week change of the same sign and within 5 points of −26 % |
| creations per day | tokens created on the curve that day | 395,253 SOL-quoted / 700,261 all modes over 16 days | ±5 % |
| graduations per day | tokens whose curve completed that day (withdraw / migration event) | 2.51 % SOL-quoted, 2.08 % all modes | ±0.3 point |
| crowd median, 20–60 s | positions = (buyer, token) pairs on non-graduated tokens, first buy 20–60 s after creation, creator excluded; P&L = SOL received ÷ SOL paid − 1, unsold tokens at zero; median over positions | −17.4 % | ±2 points on the overlap; if outside, the measure is **not** extended and the gap is published |
| second buyer | share of tokens with at least one buy from an address other than the creator within 60 s of creation | 51.3 % (approximate version expected) | reported, not calibrated |
| creators' P&L | for each token, the creator's SOL paid and received on the curve | −28.8 % | ±5 points |
| LaunchLab swaps per day | swaps on Raydium LaunchLab, same days | 122,640 → 35,484 (−71 %) | ±10 % |

## Rules
1. Queries are written and saved before the first run; a change of query is a new file, the old one stays.
2. A calibration that fails is published with its gap; the series is then shown as "second pipeline, not calibrated", and the paper does not use it as evidence.
3. No measure is inferred from another (buyers are never derived from fees).
4. Known reasons for differences, to be quantified: signer vs. token-account definitions of a buyer, bundled transactions, failed transactions, the "mayhem" family, tokens that migrate within the day, coverage gaps of either pipeline (Kamat 2026).
5. The second pipeline's series over nine months, once calibrated, goes to `live/` and to `docs/pumpfun/` as a generated document, with the queries.
