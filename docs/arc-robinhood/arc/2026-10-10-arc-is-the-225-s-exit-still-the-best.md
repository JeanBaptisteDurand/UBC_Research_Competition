> *Working document from the author's lab. Written in French on 10 October 2026, before the paper; translated to English with an AI assistant for publication; every number is as in the original. Removed for publication: server names and a server file path (4 passages).*
>
> *Numbers converted to US notation for publication (decimal point, comma as thousands separator, "$" before the amount); dates in the text are DD/MM as in the original; "h" = hours, "s" = seconds, "o" = bytes (octets).*

# Arc: is the 225 s hold still the best one? (08, 09, 10/10)

Written on Sat Oct 10 16:20:27 UTC 2026 (`date -u`), BEFORE any measurement. Read-only: nothing is modified on the bot or on [removed for publication: server name].

## 0. Decision rule (written before measuring)

- Family: `v4|2500|sans hook|natif|1526o`, stake $0.10, reactive exit armed (third-party buy ≥ $0.25 outside the router 0x4fca…) in ALL scenarios.
- Mandatory positive control: the replay at the current hold (DETENTION=234, effective ≈ 225 s) must find the REAL result of the bot's journal (sum of recuUsd − engage, excluding gas) within ±10 % on EACH of the days 08, 09 and 10/10 (UTC; 10/10 up to the last collected hour). If it fails on one day: no verdict, we stop.
- Holds compared: 180, 200, 225, 250, 275, 300 s.
- We PROPOSE a hold X ≠ 225 s only if, against 225 s:
  1. the mean gain is ≥ +$3/day;
  2. the gain is > 0 on EACH of the days 08, 09 and 10/10 (split by date);
  3. the gain is > 0 on EACH half-day (00-12 h and 12-24 h UTC) of these three days.
  If several X pass, we keep the one with the highest mean gain. Otherwise: KEEP 225 s.
- Pitfalls applied: pool drained before our entry = excluded; pool dead before our exit = total loss of the stake (no flat exit); end of the market read in ModifyLiquidity; constant price between two swaps; no extrapolation beyond $0.10.
- Gas: identical for all holds (≈ 4 transactions per A/R); recounted only if the frequency of the reactive exit changes.

## Data and method

- Raw logs `[removed for publication: server name]:/data/chaines/arc/` brought back into the Mac's cache (07/10 23 h → 10/10 16:39 UTC, 66 hours, 0 duplicates),
  window by `labo/arc-familles/fenetre.sh`, census by `recensement.mjs --suivi=1200`: 4,265 pools born, 1,413 in the family.
- Bot journal: read-only copy of `moisson.jsonl` [removed for publication: server path] (6,578 A/R on 10/10 16:34 UTC). Nothing was modified on [removed for publication: server name].
- Tool: `labo/arc-familles/sortie-positions.mjs` (new). It replays the **bot's real positions** (1,341 positions on
  pools born on 08, 09 and 10/10; 0 buys not found in the logs, 0 pools already drained at entry, 100 % armed with the reactive exit):
  entry = the real block and tokens of our buy (read in the Swap), simulated exit at block `buy + round(H / 0.50745 s)` or,
  if a trigger falls before, at trigger block + d. Trigger = the bot's exact rule (`sortie-reactive.mjs`): flow of buys
  whose router ≠ UR `0x4fca…` cumulated over 6 blocks ≥ $0.25, strictly after our buy. Value = sale of the real tokens on
  the virtual reserves L/√P, L·√P of the last Swap before the sale (fees read in the Swap). Liquidity withdrawal before the sale
  = 0 (total loss). Real delay of the bot from trigger → sale (journal, 08-10/10): 1 block 50 times, 2 blocks 110 times, 3-7 blocks 11 times.
- Control of the evaluator: our 1,207 real sales replayed on the state before the sale → median gap 0.00 % (p10 −0.12 %, p90 +1.41 %).
- Day = UTC date of the pool's birth (≈ buy − 21 s). 10/10 covers 16.5 h; the $/day are scaled to 24 h.

## 1. Operator's clock (creation → first liquidity withdrawal)

"On time" = no non-UR buy ≥ $0.25 cumulated in the 6 blocks before the withdrawal (non-triggered death).
"Alive at 45 s" = pools still alive after our entry window (only those count for the exit).

| day (UTC) | pools | triggered withdrawals | on time, alive at 45 s: p10 / p25 / med | am p10 / med | pm p10 / med | all withdrawals alive at 45 s: p10 / med | dead before 246 s |
|---|---|---|---|---|---|---|---|
| 08/10 | 522 | 97 | 262 / 297 / 348 s | 276 / 354 | 190 / 340 | 141 / 331 | 18.1 % |
| 09/10 | 520 | 72 | 263 / 293 / 341 s | 263 / 345 | 265 / 338 | 148 / 331 | 18.0 % |
| 10/10 (→16 h) | 351 | 46 | 263 / 291 / 340 s | 258 / 336 | 274 / 356 | 127 / 332 | 17.3 % |

All on-time deaths combined (including pools killed before 45 s): p10,228 / 225 / 198 s, median 347 / 338 / 338 s.
Hour by hour (on-time deaths), the median oscillates between 234 and 395 s on the 08th, 281 and 386 s on the 09th, 292 and 394 s on the 10th, with no
trend; the very low hourly p10s (4-12 s, e.g. 08/10 23 h, 09/10 15-16 h and 22-23 h, 10/10 02 h, 04 h, 10 h) are pools killed
at birth, before our entry. **The clock has not moved since 06/10** (med 350 s, p10,269 s): median ≈ 340 s, p10 ≈ 263 s.
Our clock sale falls at ≈ 21 + 225 = 246 s of age, i.e. ≈ 17 s below the p10.

## 2. Positive control: replay at 225 s against the bot's REAL result

Gross = Σ(recuUsd − engage), same positions, excluding gas.

| day | n | real | replay 225 s (d=1) | gap | replay (d=2) | gap | replay (d=2, withdrawal at the sale block = sale goes through) | gap |
|---|---|---|---|---|---|---|---|---|
| 08/10 | 505 | +$67.22 | +$67.12 | −0.1 % | +$65.86 | −2.0 % | +$67.14 | −0.1 % |
| 09/10 | 500 | +$68.57 | +$68.82 | +0.4 % | +$66.75 | −2.7 % | +$68.84 | +0.4 % |
| 10/10 | 336 | +$47.77 | +$47.34 | −0.9 % | +$45.66 | −4.4 % | +$47.72 | −0.1 % |

Total losses real / replay (d=1): 41/41, 40/39, 23/25. Each half-day is also within ±5 % (d=2: −1.2 to −4.9 %).
**Control PASSED** (±10 % required, ±1 % obtained) under all three conventions. Journal by closing day, for the record: 08/10 +$67.37,
09/10 +$68.38, 10/10 +$47.99 (up to 16:34 UTC).

By-product: the same replay WITHOUT the reactive exit gives +55.90 / +58.45 / +$41.15 (106 / 97 / 59 total losses) → the reactive
exit is worth ≈ +$8.3/day over these three days.

## 3. Hold sweep (reactive exit armed), same 1,341 positions

Gain against 225 s, in $ over the period (convention d=2, withdrawal at the sale block = loss; the two other conventions give
the same signs to within ±$0.7/day):

| period | n | 180 s | 200 s | 225 s (gross) | 250 s | 275 s | 300 s |
|---|---|---|---|---|---|---|---|
| 08/10 | 505 | −6.12 | −2.59 | +65.86 | −2.39 | −11.28 | −24.08 |
| 09/10 | 500 | −4.13 | −0.44 | +66.75 | −1.82 | −16.90 | −27.75 |
| 10/10 (16.5 h) | 336 | −4.49 | −2.78 | +45.66 | −3.47 | −11.39 | −19.15 |
| 08/10 am / pm | | −3.98 / −2.13 | −2.10 / −0.50 | 35.93 / 29.93 | −1.03 / −1.37 | −5.00 / −6.29 | −13.13 / −10.96 |
| 09/10 am / pm | | −1.97 / −2.16 | −0.05 / −0.39 | 33.88 / 32.87 | −0.38 / −1.45 | −8.08 / −8.82 | −13.69 / −14.06 |
| 10/10 am / pm | | −3.27 / −1.22 | −1.82 / −0.95 | 32.48 / 13.18 | −2.53 / −0.94 | −9.28 / −2.11 | −14.37 / −4.79 |
| **mean $/day** | | **−5.6** | **−2.4** | 0 | **−3.1** | **−14.9** | **−26.6** |
| paired gap per position, t | | t = −6.5 | t = −2.8 | | t = −3.2 | t = −10.0 | t = −14.8 |

Fine grid around 225 s (mean $/day against 225 s; d=1 / d=2 / d=2 sale goes through):
220 s −0.3 / −0.2 / −0.5 · 230 s +0.6 / +0.5 / +0.3 · **235 s +1.3 / +1.3 / +1.0** · 240 s +0.8 / +0.8 / +0.5 · 250 s −3.0 / −3.1 / −2.9.
235 s is positive on every day and every half-day (paired t = 3.6 in d=2, 2.8 in sale-goes-through) but remains **below the +$3/day threshold**.
It sells at ≈ 256 s of age, ≈ 7 s from the clock's p10 (263 s) — and on the afternoon of 08/10 this p10 was at 190 s; beyond 250 s
the yield collapses (−$15/day at 275 s). The possible gain (+$1.3/day) is small next to the risk (a clock drop
of 10-20 s, already seen twice, would cost more).

Capacity: at 225 s, at most 4 simultaneous positions and 1 entry out of 1,341 beyond 3 places; at 300 s, 8 entries. Throughput
is not limiting in the range studied.

## 4. Gas

Unchanged: an A/R costs the same ≈ 4 transactions whatever the hold, and the share of reactive sales hardly moves
(12.8 % at 225 s, 13.3 % at 235 s, 14.8 % at 300 s; a reactive sale replaces the clock sale, it does not add to it).

## Verdict

**KEEP 225 s (DETENTION=234).** No hold passes the rule written before the measurement: 180, 200, 250, 275 and 300 s lose
(−2.4 to −$26.6/day, every day); the only visible improvement, 235 s, earns +1.0 to +$1.3/day (positive every day and
every half-day) but remains below +$3/day and reduces the margin on the clock from 17 to 7 s. Control passed to within ±1 %.
Clock stable since 06/10 (median ≈ 340 s, p10 ≈ 263 s for pools alive at 45 s). To be revisited if the clock's p10
falls below ≈ 250 s or rises beyond ≈ 290 s.
