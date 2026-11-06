> *Working document from the author's lab. Written in French on 2026-10-07 (night of 06 to 07/10), before the paper; translated to English with an AI assistant for publication; every number is as in the original. Removed for publication: server and file paths, a local network address, a key-directory setting, a wallet address.*

# Robinhood: the native · no hook · 1,770-byte family ("1770o")

> Written as events unfolded, during the night of 06 to 07/10/2026. Times in UTC (Paris = UTC+2).
> **Read-only**: no transaction, no service touched, no change to the bot or its configuration.
> All RPC calls come from the Mac (`curl`), none from [removed for publication: server name]. Nothing on Arc.
> Code: `labo/rh-1770o/`. Data: logs of the lab's collector (tunnel [removed for publication: local address]), extracted into
> `labo/rh-1770o/donnees/` (not versioned).

## Verdict

- **The family is real and readable before the buy**: `TAILLES_JETON=1770` is enough (328/328 pools, tickSpacing 200,
  variable fees from 100 to 40,000). 119 pools on 05/10, 173 on 06/10 (8-10/h from 12:00 to 24:00 UTC, almost nothing at night).
  One new address per pool creates, supplies and withdraws; a disposable volume machine (8,836 addresses, ≈ $110 per
  buy) pushes the price from t+4 s until the scheduled withdrawal at 265-275 s. No honeypot.
- **The wall is at $0.50 of HELD outside position** (99 % withdrawal within 60 s above it, ≈ control below
  $0.30, a signal of excess between $0.30 and $0.50). The trader + another outsider in at t+20 s: 44 % dead before
  t+80 s, against 24 % for the trader alone.
- **A single real winner**, `0xb4d4…`: +$53.23 after real gas in 50 h (220 positions, $0.27 at t+5 s, exit
  ≈ 50 s, 23 positive hours out of 29), verified against the balance. But **only ≈ +$0.5/h on the evening of 06/10**: the ramp
  flattened (+53 % from t+20 to t+80 s against +103-131 % before). All the other outsiders together: −$91.
- **For us**: at t+20 s the trader is already in 9 pools out of 10; the pools without it that the bot can buy are
  flat. All that remains is to enter behind it, alone, under the wall. Replay of 06/10: **from −$0.5 to +$7/day at $0.20, from
  +$1 to +$2.5/day at $0.10** depending on whether the operator reacts to our stacking or not — and ≈ 0 on the evening regime.
  The estimate of the watch ($2-12/day) was too high.
- **Buying before the trader (§ 7)**: it does not step aside, it stacks on us (93 % presence when someone
  came in before it). In replay, t+3 s at $0.10 does better than t+20 s (+$0.069/round trip corrected on 06/10, ≈ +$8/day), but
  ≈ 0 on the evening of 06/10. The replay cannot validate it, the wall before t+5 s is not measured, and the only real witness
  who enters early and holds (`0xf7b4…`, t+2.5 s) lost 81 % of its early positions. Feasible (the bot buys
  1.2 s after the requested age) with a 10-line patch (`MIN_SWAPS`).
- **Recommendation**: no production deployment. At most a **MEASUREMENT test** (stake drawn $0.10/$0.20, t+20 s,
  real hold ≈ 60 s, trader alone tolerated, fee-100 pools excluded), on **f002 alone** (guaranteed maximum loss $2.35,
  $2.45 cumulated with what was already spent, under $4), launched only if the watch shows the ramp is still alive.
  It requires a 64-line patch (`DETENTIONS=defaut:…` and `TIERS_GROS`), without which the hold and the guard
  would be silently wrong (§ 5).

## 0. Data and checks

- **Window**: 04/10 18:00 → 06/10 23:20 UTC, 54 hourly files of the collector (local cache when the size of the `.zst`
  is identical to that on the tunnel, otherwise the tunnel), extracted by `extraire.mjs`: Initialize, Swap and ModifyLiquidity
  of native no-hook pools, mints of the 1,770- and 5,274-byte tokens. Blocks **80,203,190 → 82,016,6xx**, no
  file in error (`zstd` code 0, 0 unreadable lines), jumps between files of 1 to 3 blocks (11 once, on 06/10 15:00)
  and **zero gaps** in the collector's `couverture.jsonl` over the whole range. The first download of
  `couverture.jsonl` was **truncated** by the 60 s timeout (6.5 MB instead of 37 MB): spotted, redone.
- **07/10 UTC had not yet begun** at the time of the measurement (23:46 UTC on 06/10, 01:46 in Paris). The "two
  windows" are therefore the whole of **05/10** and **06/10** (and their halves 00-12h / 12-24h), plus the evening of 04/10.
  The watch loop (`labo/rh-veille/`, left running) follows the family through the night.
- **Timestamping**: the collector's `s` field is missing on some ranges (e.g. 05/10 07:48-08:09); where it exists it
  agrees to the block with `eth_getBlockByNumber` (80,592,918 → 1,791,183,592 on both sides). Linear interpolation
  by block between anchors (0.1021 s per block).
- **Senders**: the lab's enricher covers 84.8 % of the family's 45,200 swaps (whole hours are missing:
  04/10 20:00 at 97 %, 06/10 14:00 at 90 %). The 6,931 missing transactions were resolved on the official RPC from the
  Mac (`resoudre.mjs`, batches of 20, 429s retried): **0 final refusals, 100 % of swaps attributed**.
- **ETH price**: Coinbase hourly candles ($2,690 to $2,731).
- **Known-answer control of the price formula**: the v4 constant-liquidity formula (`rejeu.mjs`), applied to
  the state of the previous swap, recovers the tokens received by **587 real buys < $5 to within 0.000 %** (p99). The pools
  are full-range (ticks −887,200 … 887,200), so liquidity is constant between two swaps.
- **Fees**: the `fee` field of the Swap logs differs from the pool's fees on 47 pools (3,947 swaps): it is the protocol
  share (+1,000 pips above 10,000, ≈ 1/4 to 1/6 of the fees below, e.g. 100 → 125, 3,055 → 3,565).
  All calculations use the fees **actually paid**, read in the logs, by direction.

## 1. The family itself

### 1.1 Identifying it before buying
**328 pools** from 04/10 20:32 to 06/10 23:16 UTC. All readable at the time of the Initialize and the first `eth_getCode`:

| criterion | value | selective? |
|---|---|---|
| quote currency | native (currency0 = 0x0) | no |
| hook | none | no |
| tickSpacing | **200** (328/328) | no: 2,955 native no-hook pools at 200 of which 1,279 in 5274o, 337 in 1475o… |
| token code size | **1,770 bytes** (328/328; 4 other 1770o tokens only, quoted in `0x5fc5…`, outside the family) | **yes, on its own** |
| fees | **variable, one tier per pool**, from 100 to 40,000 pips | no |
| liquidity range | full range, a single supply | — |

Two code variants (same size): fingerprint `41c35428…` (268 pools, Initialize called through the **launcher
`0x3194…`**, token minted to that launcher) and `ce10b753…` (60 pools, on 05/10
15:00-17:00 and 06/10 09:00-17:00, Initialize through a contract specific to each pool, token minted to that contract). **`TAILLES_JETON=1770`
is enough to identify the family; `FEES_VIVANTS` must not filter** (empty).

**Distribution of fees — and it changed regime from one day to the next:**

| fees (pips) | pools | 04/10 evening | 05/10 | 06/10 |
|---|---|---|---|---|
| 100 | 43 (13 %) | 0 | 0 | 43 |
| 101-2,500 | 59 (18 %) | 0 | 12 | 47 |
| 2,501-5,000 | 79 (24 %) | 0 | 6 | 73 |
| 5,001-10,000 | 62 (19 %) | 15 | 43 | 4 |
| 10,001-20,000 | 41 (12.5 %) | 12 | 24 | 5 |
| 20,001-40,000 | 44 (13 %) | 9 | 34 | 1 |

The **85 pools above 10,000** (2 to 8 % round trip in fees) are almost all from 04-05/10; on 06/10 there are
only 6 out of 173. The bot already ignores them at the Initialize (`feeMax` = 10,000 in `chaines.json`): this should be kept,
not because the replay judges them bad (they were even better, but over the period when everything was better) but
because at 2-4 % per side a flatter regime makes them losing by construction.

### 1.2 Who launches it
- **A new creator per pool**: 328 distinct addresses for 328 pools, at nonce 0 (268) or 1 (60). It is the same
  address that calls the Initialize (through the launcher), that supplies the liquidity through the **Uniswap PositionManager
  `0x58da…`**, and that withdraws 100 % of the liquidity (328/328). One supply, one withdrawal, nothing else.
- **A disposable volume machine**: 24,655 buys ≥ $5 (median ≈ $110) by **8,836 addresses**, of which 8,676 appear
  in a single pool only (median max nonce 3). It starts at t+4 s (p10 0.9 s, p90 5.3 s), makes ≈ 70 buys and
  ≈ 62 sells per pool, and its net swaps are **−578.7 ETH (≈ −$1.56M) in 50 h** — which the creator recovers at
  withdrawal. This is artificial volume (the same actor on both sides), not outside counterparties.
- **A dust** `0xe71a…` ($0.005 at t+0.3 s, 243 pools, the same as in 5274o).
- **The outsiders**: 45 addresses with a history (nonce 300+), median buy < $5, **551 buys in 50 h**. The $5 threshold
  separates two clouds with no overlap (median buy ≥ $5: median nonce 3-9; < $5: median nonce 318-372).
  Net swaps of ALL the outsiders together: **−0.010 ETH** in 50 h (trader `0xb4d4…` wins, the others lose).
- The 5274o sniper `0x93b0…` does not appear there.

### 1.3 Throughput
Births per hour (UTC):

| day | 00 01 02 03 04 05 06 07 08 09 10 11 | 12 13 14 15 16 17 18 19 20 21 22 23 | total | 00-12h | 12-24h |
|---|---|---|---|---|---|
| 04/10 | (not yet born) | 0 0 0 0 0 0 0 0 · 9 18 9 0 | 36 | — | 3.0/h (36 in 4 active hours) |
| 05/10 | 0 0 0 0 0 0 0 2 1 8 1 3 | 0 7 2 11 11 16 11 15 10 7 14 0 | **119** | 1.3/h | **8.7/h** |
| 06/10 | 2 3 0 0 0 1 0 0 7 12 18 16 | 14 14 11 0 5 7 15 8 16 12 9 3 | **173** | 4.9/h | **9.5/h** |

The family sleeps through the European night (00-08h UTC) and produces 8-10 pools/h in the afternoon and evening. Hours at zero:
9 on 05/10, 6 on 06/10.

### 1.4 Death clock
Age of the first (and only) withdrawal:

| pools | n | p10 | p25 | median | p75 | p90 |
|---|---|---|---|---|---|---|
| with no outside buy at all | 26 | 32 s | 266 s | **274 s** | 372 s | 972 s |
| of which 06/10 | 10 | 266 s | 266 s | **271 s** | 271 s | 972 s |
| with ≥ 1 outside buy | 302 | 21 s | 37 s | **167 s** | 247 s | 340 s |

The "natural" clock (no outsider) is a scheduled withdrawal around **265-275 s** on 06/10 (more scattered on 05/10).
But **106 pools out of 328 (32 %) die before 60 s**, almost all among those where outsiders hold something:
that is the counter-move (§ 2), not the clock.

### 1.5 Honeypots
**No sign of a honeypot.** 320/328 pools have at least one non-creator sale, 244/328 an outside sale; the 8
pools with no sale at all had 0 to 6 swaps (dead at once). Trader `0xb4d4…` sold 164 of its 220 positions;
its 56 losses are all pools withdrawn BEFORE its sale, not refused sales. The 58 pools "outside buy
with no outside sale" are withdrawals during the hold.

## 2. The drain threshold

Code: `seuil.mjs` (reaction within 3 s), `hasard.mjs` (delayed reaction), `presence.mjs`. "Outsider" = identity
(§ 1.2), "held position" = sum of outside buys not yet resold (pro rata to the tokens resold).

### 2.1 Within the 3 s that follow an outside buy (502 buys at age 3-200 s, 41 buyers, 05-06/10)
Matched control: for each buy, the family's pools born within ± 2 h, alive at the same age, with no outside buy within
± 3 s; share that dies in the following 3 s (median n controls 6 per buy).

| outside position held AFTER the buy | buys | drained ≤ 3 s | matched control |
|---|---|---|---|
| < $0.15 | 102 | 1 (1.0 %) | 0.22 % |
| $0.15-0.30 | 196 | 7 (3.6 %) | 0.11 % |
| $0.30-0.40 | 59 | 1 (1.7 %) | 0.90 % |
| $0.40-0.50 | 71 | **0 (0 %)** | 0.52 % |
| **$0.50-0.60** | 20 | **3 (15 %)** | 1.40 % |
| $0.60-1 | 13 | 6 (46 %) | ≈ 1 % |
| $1-2 | 12 | 8 (67 %) | ≈ 2 % |
| ≥ $2 | 29 | 11 (38 %) | ≈ 1 % |

By buy size the reading is the same ($0.15-0.30: 8/266 = 3.0 %; $0.30-0.50: 2/11; $0.5-1: 8/19;
$1-2: 8/12). The 218 buys of `0xb4d4…` ($0.27): 5 drained (2.3 %). The buys of other outsiders **while
the trader is in**: 9/100 (9 %).

### 2.2 DELAYED reaction: withdrawal risk within 60 s according to the position held (hazard second by second)
The trigger does not react only to the buy: it reads the position. For each live pool and each second
of age 5-200 s, position held and withdrawal in the following second; the **control is the "no outside
position" bracket**, at the same ages and in the same pools.

| position held | 5-30 s | 30-90 s | 90-200 s |
|---|---|---|---|
| **0 (control)** | 21 % (6 deaths / 1,543 pool-seconds) | 17 % (21/6,853) | 9 % (29/17,943) |
| $0-0.15 | 26 % (4/783) | 17 % (3/988) | 7 % (1/784) |
| $0.15-0.30 | 26 % (18/3,652) | 18 % (16/4,816) | 17 % (4/1,291) |
| $0.30-0.40 | 19 % (2/571) | 55 % (2/150) | 41 % (1/115) |
| $0.40-0.50 | 29 % (4/700) | 65 % (3/173) | 0 % (0/65) |
| **$0.50-0.60** | **99 %** (11/152) | **95 %** (2/41) | — |
| $0.60-1 | 98 % (4/63) | 77 % (3/123) | 42 % (1/111) |
| ≥ $1 | 99 % (11/138) | 81 % (11/399) | 61 % (6/382) |

**The wall is at $0.50 of outside position held.** Above it, the pool dies almost surely (median delay 0.5 to 1.6 s
depending on the bracket).
Between $0.30 and $0.50, nothing immediate but an excess of risk after 30 s (5 deaths out of 323 pool-seconds: few
events, to be taken as a signal, not as a measurement). Up to $0.30, no excess over the control.

Excess over the control, ages 15-100 s (our holding window), used to correct the replay: $0 → 0 %;
≤ $0.30 → +7 %/60 s; $0.30-0.40 → +12 %; $0.40-0.50 → +34 %; ≥ $0.50 → +99 %.

By day (buys, 3 s): the limit does not move ($0.6-1.5: 1/3, 3/6, 6/12 drained on 04, 05 and 06/10; ≤ $0.6:
0/66, 3/163, 9/219). On 06/10 after 16:00, even the trader's position alone ($0.15-0.30) dies at 30 % in 5-30 s
against 0 % for the control (8 deaths / 1,351 pool-seconds against 0/291): **on the evening of 06/10 the operator was more nervous.**

### 2.3 What this means for an entry at t+20 s
At t+20 s, depending on who is already in (pools alive at t+20 s), share that dies before t+80 s:

| already in at t+20 s | pools | dead before t+80 s | median position |
|---|---|---|---|
| nobody | 29 | 21 % | 0 |
| other outsiders, not the trader | 73 | 26 % | $0.05 |
| the trader alone | 101 | 24 % | $0.27 |
| **the trader + another** | 99 | **44 %** | $0.35 |

Only 3 of the 44 deaths in the last row follow a NEW outside buy of less than 3 s: it is the cumulated
position that kills, with a delay. **Our buy on top of the trader's produces exactly that last row**: $0.27 +
$0.20 = $0.47, just under the wall, in the bracket where the excess risk is of the order of +34 % per minute.
It is the same lesson as 5274o on 06/10 (the sniper $0.065 + us $0.06 = drained 4 times out of 4), with a higher wall.

## 3. The winners

### 3.1 `0xb4d4…`
Method: its 421 ERC-20 transfers (getLogs `[Transfer, from]` then `[Transfer, null, to]`, 61 ranges of
30,000 blocks, a PoolManager Swap canary in each batch, 0 refusals) linked to the Swaps by hash; real gas read in
the receipts of its 421 buys/sells ($0.0089/tx) and of its 466 approvals (ERC-20 `Approval` and Permit2 logs,
$0.0027/tx): **$0.0208 per position**. Code: `transferts-wallet.mjs`, `approbations.mjs`, `trader.mjs`.

**Two sources** (`ecart-solde.py`): over 13 slices of 150,000 blocks, change in ETH balance (drpc archive) =
swaps read − real gas to within ±0.0003 ETH, **except one slice** (06/10 18:55-23:00) where **exactly
0.022000 ETH** is missing: a round withdrawal of ≈ $59 to another address (its gains). Verified on 6 isolated transactions
(Δ balance = swap amount − gas, to the wei). The P&L below is therefore right; the balance alone would have distorted it.

| | value |
|---|---|
| 1770o positions | **220** in 50 h (≈ 67 % of pools), + 20 elsewhere (10 in 4655o, 2 in 5274o, 8 outside native-no-hook) |
| stake | $0.271 fixed (p10 0.269, p90 0.272) |
| entry | t+5.1 s (p10 4.3 s, p90 6.9 s) — just after the machine's first buy (t+4.1 s) |
| exit (sold) | t+51 s (p10 29 s, p90 115 s), a single sale, median hold 44 s |
| ROI | sold: +196 % median; all (total loss = −100 %): +123 % median, +97 % mean |
| total losses | 56/220 (25 %) — pool withdrawn before its sale |
| **P&L** | **+$57.81 before gas, +$53.23 after real gas** (+$0.24 per position) |
| by day | 04/10 evening +$3.29 (28 pos.) · **05/10 +$24.92** (68) · **06/10 +$25.02** (124) |
| positive hours after gas | **23 out of 29** |

Hour by hour (pool birth hour, after real gas):

| hour | pos. | entry | exit | median ROI | total losses | net $ |
|---|---|---|---|---|---|---|
| 04/10 20h | 5 | 4.3 s | 36 s | −100 % | 4 | −0.85 |
| 04/10 21h | 17 | 4.7 | 36 | +118 % | 1 | +4.75 |
| 04/10 22h | 6 | 4.7 | 32 | −100 % | 4 | −0.61 |
| 05/10 11-16h | 9 | 4.8-6.8 | 33-156 | +57 to +183 % | 4 | +0.45 |
| 05/10 17h | 7 | 4.6 | 33 | +135 % | 1 | +2.23 |
| 05/10 18h | 10 | 4.9 | 48 | +202 % | 0 | +4.64 |
| 05/10 19h | 13 | 4.8 | 57 | +194 % | 4 | +3.30 |
| 05/10 20h | 8 | 5.1 | 46 | +203 % | 0 | +4.43 |
| 05/10 21h | 7 | 5.2 | 35 | +280 % | 0 | +4.57 |
| 05/10 22h | 14 | 4.8 | 43 | +202 % | 3 | +5.29 |
| 06/10 00-05h | 5 | 8-39 | 51-88 | — | 2 | +1.14 |
| 06/10 08h | 7 | 5.1 | 42 | +206 % | 1 | +3.17 |
| 06/10 09h | 6 | 5.3 | 54 | +72 % | 3 | +0.47 |
| 06/10 10h | 10 | 5.3 | 39 | +215 % | 0 | +5.94 |
| 06/10 11h | 5 | 4.6 | 64 | +98 % | 2 | +0.75 |
| 06/10 12h | 14 | 5.1 | 35 | +206 % | 2 | +6.33 |
| 06/10 13h | 12 | 5.4 | 42 | +199 % | 4 | +3.26 |
| 06/10 16h | 5 | 3.3 | 56 | −100 % | 4 | −1.00 |
| 06/10 17h | 3 | 5.0 | 43 | +203 % | 0 | +1.69 |
| **06/10 18h** | 15 | 5.4 | **83** | **+32 %** | **7** | +1.00 |
| **06/10 19h** | 8 | 6.1 | **110** | +61 % | 0 | +1.07 |
| **06/10 20h** | 16 | 6.1 | **123** | +45 % | **6** | **−0.36** |
| **06/10 21h** | 8 | 6.7 | 85 | +76 % | 2 | +0.48 |
| **06/10 22h** | 7 | 6.0 | 116 | +65 % | 1 | +0.70 |
| 06/10 23h | 3 | 7.0 | 116 | +46 % | 1 | +0.12 |

**The seam ran dry on the evening of 06/10.** From 08:00 to 13:00 the trader earned +$3 to +$6 per full hour; from 18:00 to
23:00, +$0.5/h on average, median ROI divided by three, exit pushed back from ≈ 45 s to 85-123 s, more total losses.
The cause is visible in the price curve (`morts.mjs`): median price relative to t+5 s, live pools:

| period | t+20 s | t+60 s | t+80 s | t+120 s | from t+20 to t+80 s |
|---|---|---|---|---|---|
| 04/10 evening + 05/10 (155 pools) | ×1.55 | ×3.00 | ×3.15 | ×3.42 | **+103 %** |
| 06/10 00-16h (98) | ×1.89 | ×4.14 | ×4.36 | ×4.54 | **+131 %** |
| 06/10 16-24h (75) | ×1.22 | ×1.71 | ×1.87 | ×1.89 | **+53 %** |

The machine buys as many dollars per pool (≈ $8,500) but the slope is three times weaker: it resells earlier
or more regularly. Two things therefore degraded at the same time on the evening of 06/10: the ramp flattened,
and the tolerance for small positions fell (§ 2.2, the trader's position alone dies at 30 % in 5-30 s). I cannot
say whether this is a reaction to the trader or a new general setting; for us the effect is the same.

### 3.2 The other regular outsiders (swap P&L, gas $0.021/position)

| address | positions | stake | entry | exit | total losses | net after gas |
|---|---|---|---|---|---|---|
| `0x0b41…` | 67 (06/10) | $0.109 | 5.4 s | **15 s** | 7 | **+$2.27** |
| `0xf3ce…` | 17 (06/10) | $0.054 | 4.3 s | 66 s | 7 | +$2.02 |
| `0xc3c8…` | 82 (04-05/10) | $0.108 | 4.1 s | **15 s** | 6 | +$1.58 |
| `0xf7b4…` | 51 | $0.162 | 2.5 s | 59 s | **32** | −$3.76 |
| `0x858b…` | 20 | $0.065 | 8.9 s | 79 s | 16 | −$0.93 |
| `0x3155…` | 13 | **$0.50** | 19.6 s | — | 12 | −$5.36 |
| `0x9ff8…` | 6 | **$2.70** | 11.7 s | — | 5 | −$13.09 |
| 7 others at 3-7 positions ($0.11-2) | 29 | — | 12-65 s | — | 22 | −$17.22 |

**All the outsiders except `0xb4d4…` together: −$91.42 over 321 positions.** Only the very small stakes
($0.05-0.11) entered at t+4-5 s win, two of which exit as early as t+15 s; all those who stake ≥ $0.30 or
enter after 10 s lose. None of these winners earns more than a few dollars in two days.

## 4. The recipe for us

Code: `rejeu.mjs` (+ `donnees/rejeu*.txt`). **A replay is a floor and judges an entry badly**: it is used
to choose the EXIT, the STAKE and the POPULATION, and it is corrected by a reaction model (§ 2.2: excess hazard
according to the outside position held WITH our stake, integrated second by second over the hold — the other
outsiders arrive and leave as in the history). The two columns "raw" and "corrected" bracket the truth:
raw = the operator does not notice our stacking, corrected = it reacts as it reacted to the others.
Costs: fees actually paid, read in the logs, gas $0.026/round trip (measured on Robinhood; the trader pays $0.021).

### 4.1 The basic choice: stack on the trader, or avoid it
At t+20 s, in the fee tier the bot accepts (≤ 10,000), **the trader is already in 85 to 97 % of pools**
(fees 101-10,000). It avoids the fee-100 pools (7/43, variant `ce10`) and most of those above 10,000.

| population (E = 20 s, exit +60 s, M = $0.20) | n (50 h) | raw $/round trip | corrected $/round trip | 95 % CI corrected |
|---|---|---|---|---|
| everything, guard $0.35 (we stack on anyone) | 200 | +0.111 | +0.044 | [+0.010 ; +0.083] |
| without trader (guard $0.15 + no small buy ≥ $0.20), no fee cap | 63 | +0.149 | +0.122 | [+0.056 ; +0.191] |
| **the same at the bot's `feeMax` (≤ 10,000)** | **27** | +0.060 | **+0.034** | — |
| `ce10` variant / fee 100 alone (what "without trader" leaves the bot on 06/10) | 19-24 | +0.026 to +0.038 | **+0.010 to +0.021** | crosses 0 |

The nice "without trader" figure comes from the pools with fees 10,001-40,000 of 05/10, which the trader neglected and which the bot
ignores (`feeMax`); on 06/10 there are only 6 left. In what the bot can buy today, **avoiding the trader
amounts to playing the fee-100 pools, which are flat** (median death 118 s, 95 % CI crossing zero). Only one playable
recipe therefore remains: **enter behind the trader, alone, and stay under the $0.50 wall**.

### 4.2 The test setting and what it earns in replay
Population: 1770o, fees ≤ 10,000 and ≠ 100, alive at t+20 s, buys < $5 cumulated over 60 s < $0.30 (the trader alone
passes: 0.271 + 0.005 of dust; a second outsider refuses the pool) and none ≥ $0.30. Exit +60 s.

| window | pools played | round trips/day | M 0.10 raw → corrected ($/round trip) | M 0.20 raw → corrected ($/round trip) | total losses | $/day M 0.10 | $/day M 0.20 |
|---|---|---|---|---|---|---|---|
| 05/10 whole | 22 | 22 | +0.039 → +0.024 | +0.105 → +0.043 | 32 % | +0.5 to +0.9 | +0.9 to +2.3 |
| 05/10 12-24h | 21 | 42 | +0.039 → +0.024 | +0.104 → +0.040 | 33 % | | |
| **06/10 whole** | **83** | **85** | **+0.029 → +0.011** | **+0.085 → −0.006** | 24 % | **+0.9 to +2.5** | **−0.5 to +7.2** |
| 06/10 00-12h | 14 | 28 | +0.039 → +0.024 | +0.104 → +0.034 | 43 % | | |
| 06/10 12-24h | 69 | (6/h) | +0.027 → +0.008 | +0.081 → −0.014 | 20 % | | |
| **06/10 16-24h** | 61 | (8/h) | **+0.009 → −0.009** | **+0.044 → −0.042** | 21 % | ≈ 0 | **−0.3 to +0.35 $/h** |

- **Exit** (M 0.20, same guard but fee-100 included, n = 131 in 50 h, raw → corrected): +30 s +0.050 → +0.010 · +45 s +0.072 → +0.013 ·
  **+60 s +0.072 → +0.002** · +90 s +0.078 → −0.008 · +120 s +0.072 → −0.020 · +180 s +0.052 → −0.048. The raw is flat
  from 45 to 120 s, the corrected falls from 60 s (the longer we stay, the more time another outsider has to push us above
  the wall). **Target real hold: 50-60 s**, well before the scheduled withdrawal (265-275 s).
- **Stake**: $0.30 is excluded (0.27 + 0.30 = $0.57 > wall). $0.20 puts the position at $0.47, glued to the wall; $0.10 at
  $0.37. The raw favors $0.20 (diluted gas), the corrected favors $0.10: **it is exactly the variable to draw at
  random** (memory sheet `tirer-la-mise-au-hasard-pas-en-echelle`).
- **Fees actually paid**: 0.29 % per side on 06/10 (p10 0.11 %, p90 0.48 %), 0.57 % on 05/10; ≈ 0.6 % round trip.
  Gas weighs much more: 13 % of the stake at $0.20, 26 % at $0.10.
- **Entry**: t+20 s is the only instant the bot knows how to hold without a race. For information only (a replay does not
  validate an earlier entry; guard $0.35, no fee cap): t+8 s would give +0.21 raw / +0.10 corrected,
  t+5 s +0.27 / +0.13 — that is where the
  trader wins, but going there means entering at the same time as it (0.27 + us = $0.47-0.57) and contesting its place.

### 4.3 How much per day
**Honest range on the 06/10 regime: from −$0.5 to +$7/day at $0.20, from +$1 to +$2.5/day at $0.10, center
≈ $1-2/day**; on the evening regime of 06/10 (flattened ramp), **zero or negative**. The watch announced $2-12/day:
that was without counting (1) that our buy stacks on the trader's in 9 pools out of 10, (2) that the pools without
the trader that made up the average had fees > 10,000 and have disappeared, (3) the flattening of the evening.

### 4.4 Risks
1. **Our buy on top of the trader's produces the situation that kills** (two outsiders, $0.37-0.47): 44 % dead
   before t+80 s when two outsiders hold, against 24 % when the trader is alone. This is the unknown that decides everything,
   and only the real thing measures it.
2. **A third outsider** (`0x0b41…` or `0xc3c8…` at $0.11, `0xf7b4…` at $0.16) arriving after us pushes
   the position above $0.50: near-certain death in ≈ 1 s. The corrected replay includes it; the bot cannot
   prevent it (no reactive exit today).
3. **The ramp flattens** (+53 % from t+20 to t+80 on the evening of 06/10 against +103-131 % before) and the operator became more
   nervous in the evening (the trader's position alone dies at 30 % in 5-30 s). The trader itself now earns only
   ≈ $0.5/h there.
4. **The operator on Robinhood Chain adapted within ≈ 80 min** to each of our previous settings (04/10, 05/10, 06/10).
   The 1770o one is another launcher, but nothing says it will not do the same.
5. **We get in the way of the only winner**: if our buy gets its pools drained, it loses with us (which is also our
   best witness, § 5.3).
6. Expected total losses 20-30 % of trades even without reaction: a loss costs $0.126 ($0.10) or $0.226 ($0.20).

## 5. The bot setting to test it (NOT applied)

### 5.1 What the current code cannot do (verified, local code identical to the server's)
1. **The hold cannot be set for a variable-fee family.** Line 575:
   `det = P.detentions[fee] ?? (fee === 100 ? P.detention100 : pal(fee).detentionS)`. `DETENTIONS` accepts only exact
   tiers; **`DETENTIONS=defaut:60` becomes the key `NaN` and is ignored silently** (verified by isolating the
   line). **`DETENTION=60` is ignored too**: `P.detentionS` is read nowhere in the calculation. Without a patch, a
   1770o pool holds 240 s (the server's `defaut` tier), or 150 s / 60 s / 240 s if it happens to fall on 2500 / 500 /
   10000 — that is, right into the scheduled withdrawal.
2. **`tiersGros` = $0.20 comes only from `chaines.json`**: any pool where a buy < $5 ≥ $0.20 is in the flow window
   is discarded (diag `grosTiers`). With the 60 s window, **all of the trader's pools would be refused**; the
   `FLUX_MAX=0.30` proposed by the watch was not enough.
3. **Real hold ≠ `det`**: the sale leaves at `det − 14 s − (time elapsed since the buy receipt)`. Measured on the
   server journal: 150 s → **144 s** effective (n = 93), 110 s → **100 s** (n = 5). For ≈ 60 s real: `det` = 68.
4. Unchanged: `TAILLES_JETON=1770` (read at the Initialize by `eth_getCode`), `feeMax` = 10,000 (`chaines.json`
   default), `MISES_TIREES` takes precedence over the tiers' stakes (500 → $0.20, 2500 → $0.40), `ENTREE_S` takes precedence over the
   tiers.

### 5.2 The proposed diff — `labo/rh-1770o/moisson-multi-1770o.diff` (64 lines, `node --check` OK, NOT applied)
- `DETENTIONS` accepts `defaut:S`, which applies to every unlisted tier and **takes precedence over `chaines.json`**; any unreadable
  entry **refuses startup** (code 2) instead of being ignored. Tested: `defaut:68` → 68 s for 4200, 10000, 2500;
  `defaut:68,10000:110` → 110 s for 10000, 68 s elsewhere; `defaut:soixante` and `*:60` → refusal.
- `TIERS_GROS` as an environment variable (default: `chaines.json`), used in both places.
- The banner displays the effective "large third party" threshold and its source, and the `defaut` hold applied.

### 5.3 Environment variables — override [removed for publication: server file path]
**The name matters**: overrides apply in alphabetical order and the last one wins. `zz-test-1770o.conf`
would be read BEFORE `zz-wallet-neuf.conf` ("t" < "w") and the 5274o test would win silently. Hence `zzz-`. After
`daemon-reload`, **check** `systemctl show moisson-rh -p Environment` and then the banner ("large third party" and
"holds" lines).

```ini
[Service]
# 07/10 — 1770o MEASUREMENT TEST (report labo/rapports/chaines/robinhood-1770o-2026-10-07.md), replaces the 5274o test.
# Capped wallet: [removed for publication: key location] → maximum loss = its balance.
Environment=ECURIE=[removed for publication: key directory path]
Environment=PLACES=1
Environment=PLACES_AU_HASARD=0
Environment=TAILLES_JETON=1770
Environment=FEES_VIVANTS=
Environment=FEES_MORTS=100
Environment=GABARITS_MORTS=
Environment=ENTREE_S=20
Environment=FLUX_FENETRE_S=60
Environment=FLUX_MAX=0.30
Environment=TIERS_GROS=0.30
Environment=MISES_TIREES=0.10,0.20
Environment=MISES_GRAINE=20261007
Environment=NIVEAUX_MORTS=
Environment=DETENTIONS=defaut:68
Environment=RAFALE=4/6
Environment=PERTE_MAX=1.50
Environment=VIDES_MAX=0
```

`FEES_MORTS=100` rules out the flat variant (§ 4.1) and concentrates the budget on the single question. `PLACES=1`: at ≈ 6-8
accepted pools per hour and ≈ 70 s per round trip (approvals included), one slot misses ≈ 10 %; and a single
slot makes the loss cap exact (never two open positions).

### 5.4 $4 budget (owner's rule, ≈ $0.10 already spent) — guaranteed by construction
- **Funding**: no transfer needed. **f002 alone** ([removed for publication: wallet address], $2.346 at the watch round of 23:41):
  it needs at minimum max stake $0.20 + gas reserve $0.061 (read in the bot's journal: 450,000 units × (2 × baseFee + 0.01 gwei)) to start, and ≈ $2.0 to absorb the loss
  cap ($1.50) plus an overshoot of two round trips. f001 ($4.97) is **not** in the test's stable.
- **Hard bound, independent of the software**: the only key visible to the bot is f002's; it cannot lose more
  than its balance. **Worst case cumulated: 0.10 + 2.35 = $2.45 < $4**, even if all the safeguards fail (a crash and
  restart reset the `PERTE_MAX` peak and the `RAFALE` streak: that is why this bound is needed).
  Do not refill f002 during the test.
- **Software bounds** (exit with code 3 = no restart, `RestartPreventExitStatus=3` verified in the unit):
  `RAFALE=4/6` (4 total losses in the last 6 round trips → stop; at most 4 × 0.226 = $0.90 in the streak);
  `PERTE_MAX=1.50` below the peak, evaluated every 20 s with the position closed, overshoot of at most one or two round trips
  ($0.23-0.45) → **maximum software loss ≈ $1.95, i.e. ≤ $2.05 cumulated with the $0.10 already spent.**

### 5.5 Stop rule written in advance
1. **Start** only between 12:00 and 21:00 UTC, and only if the watch's `1770o` line shows, over the last 4
   rounds (1 h), ≥ 4 pools born and a median ROI of trader `0xb4d4…` ≥ +60 % (the ramp is alive). Otherwise, launch nothing.
2. **Automatic stops** (no intervention): `RAFALE` 4/6, `PERTE_MAX` $1.50, f002's balance.
3. **Decision point at 30 round trips or 24 h** (whichever comes first), judged **on f002's balance read from the Mac**
   (the balance wins over the journal):
   - **FINAL STOP** if our total losses ≥ 12/30 (40 %), or if f002's balance has fallen by more than $0.50.
   - **Contemporaneous control**: the trader's positions in the SAME hours, pools where we entered against pools
     where we did not (`trader.mjs`). If it loses at least twice as often when we are there
     (one-sided Fisher p < 0.05), it is our stacking that triggers it: **final stop**, even if the balance is positive.
   - **Stake**: if the $0.20 arm has at least twice the total losses of the $0.10 arm with ≥ 5 losses, we remove it
     (`NIVEAUX_MORTS=0.20`). First check the stake column in `moisson.jsonl`: both arms must exist.
   - **Continue** only if f002's balance is ≥ start + $0.30 and total losses ≤ 30 %; anything further
     (production, another wallet, a higher stake) goes back to the owner.
4. Never raise `PERTE_MAX`, refill f002 or change the setting during the test.

## 7. Buying before the trader?

The owner's question: `0xb4d4…` enters at t+5 s with $0.27; can we enter BEFORE it? Same data (05/10 and
06/10, 328 pools), same definitions. Code: `avant-trader.mjs`, `precoces-reels.mjs`, `avant-rejeu.mjs` (outputs in
`donnees/avant-*.txt`). Reminder: **a replay cannot validate an earlier entry, it can only rule it out.**

### 7.1 Does the trader avoid pools where someone entered before it? **No.**
Pools with fees 101-10,000 alive at t+5 s; "early outsider" = an outside buy ≥ $0.02 before t+5 s (in practice
`0xc3c8…` $0.08, `0xf7b4…` $0.16, `0x0b41…` $0.11).

| | pools | trader present | median entry | median stake |
|---|---|---|---|---|
| with an early outsider | 57 | **53 (93 %)** | 4.9 s | $0.271 |
| without (control) | 143 | 129 (90 %) | 5.4 s | $0.271 |

It enters AFTER the early outsider in 48 cases out of 53 and does not reduce its stake: **the outside position held just after
its buy is $0.38 (median).** Its trigger is the machine's first buy: it buys 0.8 s after
(p10 0.4 s, p90 1.6 s), **never before (220/220)**. Consequence: entering before it does not take its place, **its $0.27
stacks on our stake**. And this stacking costs:
- pools "early outsider + trader": **51 % dead before t+80 s** (27/53) against 35 % for "trader alone" (45/129),
  one-sided Fisher p = 0.033;
- the trader itself loses more when someone entered before it: 05/10 **26 % total losses against 7 %**
  (10/39 against 2/29, p = 0.043); 04/10 38 % against 14 %; 06/10 31 % against 28 % (13 against 111); overall 30 % against 23 %.

### 7.2 Does the wall depend on age? **Before t+4 s it is not measured; from t+5 s it is the same $0.50 wall.**
Outside buys by age, drained within 3 s, matched control (same age, ± 2 h, no outside buy within ± 3 s):

| age | buys | drained ≤ 3 s | control | < $0.15 | $0.15-0.30 | ≥ $0.30 | position after ≤ $0.30 | $0.30-0.50 | > $0.50 |
|---|---|---|---|---|---|---|---|---|---|
| 0-2 s | 13 | 0 | 0 % | 0/12 | 0/1 | — | 0/13 | — | — |
| 2-4 s | 84 | 0 | 0 % | 0/45 | 0/38 | 0/1 | 0/80 | 0/3 | 0/1 |
| 4-6 s | 252 | 6 (2 %) | 0 % | 2/67 | 3/184 | 1/1 | 4/169 | 1/78 | 1/5 |
| 6-10 s | 96 | 8 (8 %) | 0.4 % | 1/42 | 4/50 | 3/4 | 3/56 | 0/29 | **5/11** |
| 10-20 s | 43 | 7 (16 %) | 0.9 % | 0/11 | 0/6 | 7/26 | 0/10 | 0/5 | **7/28** |

Withdrawal risk within 30 s according to the position held (second by second; control = no position):

| position | 0-5 s | 5-10 s | 10-15 s | 15-30 s |
|---|---|---|---|---|
| 0 (control) | 0 % (0 / 1,289 pool-seconds) | 0 % (0/358) | 0 % (0/258) | 13 % (4/897) |
| $0-0.15 | 0 % (0/101) | 0 % (0/235) | 15 % (1/185) | 23 % (3/352) |
| $0.15-0.30 | 0 % (0/75) | 21 % (5/626) | 4 % (1/714) | 14 % (12/2,339) |
| $0.30-0.50 | **no data** (10 pool-seconds) | 27 % (4/381) | 0 % (0/354) | 11 % (2/537) |
| > $0.50 | **no data** (1 pool-second) | 93 % (2/23) | 85 % (4/64) | 91 % (22/270) |

**No withdrawal ever took place before t+5 s**, but almost nobody held more than $0.15 there: the absence of
early drains is an absence of MEASUREMENT, not an absence of a wall. The only case above the wall ($0.501 at t+3.8 s,
position $0.55, 05/10 16:54) survived until the machine started, then was withdrawn at t+10.3 s, once the
trader and two others had stacked on it ($1.05). A $1.50 at t+5.4 s died 1.3 s after. The operator does not strike
during the 0 to 5 s ramp; it strikes as soon as it is running, on the accumulated position.

### 7.3 Replay of an entry at t+2, t+3, t+4 s
Population: fees 101-10,000, pool alive, **no outside buy before us** (we are the first outsider), at
least one swap seen (the dust); buy at the real marginal price and liquidity of the instant; the trader and the others
arrive afterwards as in the history and their position is added to ours in the reaction correction (excess
hazard by age × position, integrated by 0.5 s; at ages 0-5 s, the brackets > $0.15 are borrowed from 5-15 s, for lack of
data). Net per round trip after real fees and $0.026 of gas, **corrected [raw]**, n:

| window | pools | M $0.06 t+3 → +60 s | M $0.10 t+3 → +45 s | **M $0.10 t+3 → +60 s** | M $0.20 t+3 → +60 s | ref. t+20 s, M $0.10 (§ 4.2) |
|---|---|---|---|---|---|---|
| 05/10 | 54 | +0.057 [+0.085] | +0.053 [+0.104] | **+0.091 [+0.158]** | +0.080 [+0.343] | +0.024 [+0.039] |
| 05/10 12-24h | 53 | +0.057 [+0.086] | +0.054 [+0.105] | +0.092 [+0.160] | +0.080 [+0.346] | +0.024 [+0.039] |
| 06/10 | 124 | +0.035 [+0.057] | +0.042 [+0.074] | **+0.069 [+0.112]** | +0.056 [+0.250] | +0.011 [+0.029] |
| 06/10 00-12h | 32 | +0.064 [+0.089] | +0.069 [+0.112] | +0.109 [+0.165] | +0.088 [+0.356] | +0.024 [+0.039] |
| 06/10 12-24h | 92 | +0.025 [+0.046] | +0.032 [+0.061] | +0.055 [+0.093] | +0.044 [+0.212] | +0.008 [+0.027] |
| **06/10 16-24h** | 66 | −0.002 [+0.015] | +0.007 [+0.029] | **+0.014 [+0.042]** | +0.021 [+0.109] | −0.009 [+0.009] |

- t+2 and t+4 s give almost the same as t+3 s (differences ≤ $0.01). The exit at +30 s is worse
  (+0.025 corrected at $0.10 on 06/10); **the quick exit in the style of `0xc3c8…` (t+3-4 → t+11-19 s) yields ≈ 0** (−0.006 to
  +0.005 corrected, +0.004 to +0.021 raw, on 06/10 at $0.10): the gain is made between t+15 and t+60 s, while the delayed
  counter-move strikes.
- At $0.10 the median position once the trader has arrived is $0.37 and exceeds $0.50 in 36 pools out of 182; at $0.20
  it is $0.47 and exceeds the wall in 73 out of 182. Historical total losses: 30 %. The $0.20 stake adds
  nothing once corrected; **$0.10 is the right stake**, $0.06 is eaten by gas.
- **On the evening of 06/10, the early entry also falls to ≈ 0** (+0.014 corrected, +0.042 raw): the flattening of the
  ramp affects all entries.

**But the REAL witnesses of an entry before the trader say the opposite of the replay:**

| outsider | entry | stake | exit | positions BEFORE the trader | total losses | net before gas |
|---|---|---|---|---|---|---|
| `0xf7b4…` | **t+2.5 s** | $0.16 | 59 s | 26 | **21 (81 %)** — 19/20 on 04/10, 2/4 on 05/10, 0/2 on 06/10 | **−$2.74** |
| `0xc3c8…` | t+4.1 s | $0.11 | **15 s** | 43 | 5 (12 %) | +$1.62 |
| `0x0b41…` | t+5.4 s | $0.11 | **15 s** | 10 | 0 | +$0.79 |

The one who enters early AND holds (`0xf7b4…`) gets drained; those who win a little exit at t+15 s, which the
replay does not make profitable for us (gas). Most of `0xf7b4…`'s losses are from 04/10, a day when everyone
lost (the trader too: −100 % median ROI at 20h and 22h); outside 04/10 only 6 early positions remain
(2 lost): **the real witness is unfavorable but too thin to settle the current regime.**

### 7.4 Feasibility: can the bot buy at t+2-4 s?
Measured on [removed for publication: server file path] (1,429 real round trips, 30/09 → 06/10), delay between the requested entry age
and the age of the buy block (log reading, `eth_getCode`, control `eth_call`, sending, inclusion):

| period (known setting) | n | min | p10 | median | p90 |
|---|---|---|---|---|---|
| `ENTREE_S=25`, 06/10 15:50-18:15 (pools eligible from the requested age) | 23 | 0.7 s | 0.8 s | **1.2 s** | 1.9 s |
| 20 s tier until 06/10 15:50 (with waiting for the flow guard) | 1,400 | 0.7 s | 1.3 s | 4.1 s | 7.5 s |

**Yes, technically**: with `ENTREE_S=2` the buy lands at t+2.7-3.9 s, before the trader (t+4.3-6.9 s) in most
pools, and almost always before or just at the machine's first buy (t+4.1 s median). Three settings
are necessary: `AGE_MAX=4.5` (otherwise we buy after it), `FLUX_MAX=0.02` (be the first outsider), and **the code requires
2 swaps before buying** (`if (p.n < 2)`), yet at t+3 s only 86 pools out of 328 have two → patch `MIN_SWAPS`
(`labo/rh-1770o/moisson-multi-1770o-precoce.diff`, 10 lines, on top of the first diff, `node --check` OK, NOT applied;
never 0 swaps, liquidity being known only at the first swap). The whole replay population has the dust or a
first swap at t+2 s: `MIN_SWAPS=1` does not reduce it.

### 7.5 Verdict
- **Entering before the trader does not take its place: it stacks on us** (93 % presence when someone is already
  there, stake unchanged), and the stacking increases deaths (51 % against 35 % before t+80 s, p = 0.033).
- **In replay it is better than t+20 s** ($0.10, t+3 → +60 s: +$0.069/round trip corrected on 06/10 over 124 pools, i.e.
  ≈ +$8/day corrected, +14 raw, against ≈ +$1/day at t+20 s) — **but ≈ 0 on the evening of 06/10**, and the replay cannot
  validate an earlier entry. The only real witness that enters early and holds lost 81 % of its early positions (mostly
  on 04/10, n = 6 outside that day). The wall before t+5 s is not measured.
- **Playable only as a measurement test**, in place of the t+20 s test of § 5 (a single process on the RPC), and
  only if the ramp is alive (same condition as § 5.5.1). It is the test with the best expectation in replay; it is
  also the one that gets in the trader's way the most (it loses more when we are ahead of it).

### 7.6 Setting of the small test (f002 alone, NOT applied)
After applying the two diffs, override [removed for publication: server file path] (same remark
on the name as in § 5.3, check `systemctl show` and the banner: "entry window" and "large third party" lines):

```ini
[Service]
# 07/10 — 1770o MEASUREMENT TEST, ENTRY BEFORE THE TRADER (report § 7). f002 alone, never refilled.
Environment=ECURIE=[removed for publication: key directory path]
Environment=PLACES=1
Environment=PLACES_AU_HASARD=0
Environment=TAILLES_JETON=1770
Environment=FEES_VIVANTS=
Environment=FEES_MORTS=100
Environment=GABARITS_MORTS=
Environment=ENTREE_S=2
Environment=AGE_MAX=4.5
Environment=MIN_SWAPS=1
Environment=FLUX_FENETRE_S=60
Environment=FLUX_MAX=0.02
Environment=MISES_TIREES=0.10
Environment=NIVEAUX_MORTS=
Environment=DETENTIONS=defaut:68
Environment=RAFALE=4/6
Environment=PERTE_MAX=1.00
Environment=VIDES_MAX=0
```

- Fixed stake $0.10 ($0.20 would make $0.47 as soon as the trader arrives, above the wall in 40 % of holds; drawing it at
  random would waste half the budget on an arm that the corrected replay does not favor). Hold `det` = 68 → ≈ 60 s
  real, exit around t+63 s.
- **Budget ($4 rule)**: maximum loss per round trip $0.126; `RAFALE=4/6` → at most $0.50 in a streak;
  `PERTE_MAX=1.00` → maximum software loss ≈ $1.25; **hard bound: f002's balance ($2.35), i.e. $2.45 cumulated
  with the $0.10 already spent, even if all the safeguards fail and even if this test follows the one of § 5** (f002
  is never refilled, the two tests share the same bound). No new funding needed.
- **Stop rule written in advance**: start only between 12:00 and 21:00 UTC if the watch shows the ramp alive
  (§ 5.5.1); automatic stops `RAFALE` and `PERTE_MAX` (code 3, no restart); **decision point at 30 round trips or
  24 h** judged on f002's balance read from the Mac: final stop if total losses ≥ 12/30 (the replay foresees 30 %,
  i.e. 9), or if the balance has fallen by more than $0.50, or if the trader loses at least twice as often in the
  pools where we entered before it as in the others of the same hours (one-sided Fisher p < 0.05); first check
  that the real buy age (`agePool` in `moisson.jsonl`) is indeed between 2.5 and 4.5 s and BEFORE the trader's,
  otherwise the test did not take place; continue only if the balance is ≥ start + $0.30 and total losses ≤ 30 %.

## 6. Scripts and files (`labo/rh-1770o/`)

| script | role |
|---|---|
| `rapatrier.sh` + `extraire.mjs` | hourly extraction of the collector's logs (Initialize, Swap, ModifyLiquidity of native no-hook pools, 1770o/5274o mints) + continuity check (`donnees/controle.jsonl`) |
| `charger.mjs`, `classes.mjs` | common loading (timestamping by block, senders, hourly ETH price); classes of actors by identity and outside position held |
| `resoudre.mjs` | missing senders on the official RPC (batches of 20, refusals counted) |
| `prix-eth.mjs` | Coinbase hourly candles |
| `explorer*.mjs`, `famille.mjs`, `morts.mjs`, `frais-trader.mjs`, `externes.mjs` | § 1, § 3.2, price curves |
| `seuil.mjs`, `hasard.mjs`, `presence.mjs` | § 2 (matched control, hazard by position, presence at t+20 s) |
| `transferts-wallet.mjs`, `approbations.mjs`, `trader.mjs`, `ecart-solde.py` | § 3.1 (transfers with canary, real gas, two sources) |
| `rejeu.mjs`, `frais-test.mjs` | § 4 (`RECETTE=1`, `VARIANTES=1`, `TEST=1 SANS100=1 FLUX_MAX=0.30 TIERS_GROS=0.30 FEE_MAX=10000`) |
| `moisson-multi-1770o.diff` | § 5.2, proposed patch, NOT applied |
| `avant-trader.mjs`, `precoces-reels.mjs`, `avant-rejeu.mjs` (`RAPIDE=1`, `MIN_LEVE=1`) | § 7 (avoidance, wall by age, real witnesses, t+2-4 s replay) |
| `moisson-multi-1770o-precoce.diff` | § 7.4, `MIN_SWAPS`, to be applied AFTER the first diff, NOT applied |

Outputs in `donnees/` (not versioned): `famille.txt`, `seuil-1770.txt`, `hasard.txt`, `morts.txt`, `externes.txt`,
`trader-b4d43149.txt`, `positions-b4d43149.json`, `rejeu*.txt`.

**Night of 06 to 07/10 (watch, rounds from 23:11 to 23:56 UTC)**: 1 to 4 1770o pools per quarter hour, trader sold at
+48 %, +123 %, +50 %, +115 % median ROI — the ramp keeps a little slope at night, on a very low throughput. To be re-read
in `labo/rh-veille/veille.log` (`1770o` line) before any decision on a test (§ 5.5, point 1).
