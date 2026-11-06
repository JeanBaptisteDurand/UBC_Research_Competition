> *Working document from the author's lab. Written in French on 6 October 2026, before the paper; translated to English with an AI assistant for publication; every number is as in the original. Removed for publication: server names, hosting-provider name, and personal/server file paths (6 passages).*
>
> *Numbers converted to US notation for publication (decimal point, comma as thousands separator, "$" before the amount); dates in the text are DD/MM as in the original; "h" = hours, "s" = seconds, "o" = bytes (octets).*

# Arc: pool families and the operator's rules, family by family (measured on 06/10/2026)

> Report by a READ-ONLY agent (no transaction, no service touched, no RPC call from [removed for publication: server names] nor from the [removed for publication: hosting provider] instance). Calculations on the Mac, from the lab collector's data ([removed for publication: server name], `/data/chaines/arc`) brought back with `labo/rapatrier.sh arc`. Scripts: `labo/arc-familles/`.
> Written as I went along, finished on the evening of 06/10. Windows: R = 05/10 21 h → 06/10 21 h UTC, V = the 24 h before.
> **Verdict in §8.**

## 0. The question

Our real Arc bot (`arc/bot-reel/moisson.mjs`, [removed for publication: hosting provider]) plays the family `v4|2500|sans hook|natif|PoolManager|1526o`
(entry t+25-45 s, $0.10, exit +210-240 s; `feesVivants` whitelist = 100, 2500, 10000). Are there other families that can be exploited on recent data, and what are the operator's rules in each?

## 1. Method, window, coverage

**Data.** Lab collector, brought back on 06/10 at 21:11 UTC (188 MB): logs from 04/10 13:27 to 06/10 21:11 UTC.
Verification (`verifier.mjs`): 58 hourly files, last line readable everywhere, 0 unreadable lines, blocks
continuous from one file to the next, **0 gaps** in the union of the ranges of `couverture.jsonl` (blocks 24,227,100 →
24,621,970), **0 % of lines without a timestamp** (no interpolation needed).

**Two 24 h windows, cut by date** (`fenetre.sh`):
- **R (recent)**: 05/10 21:00 → 06/10 21:00 UTC — the reference window;
- **V (previous day)**: 04/10 21:00 → 05/10 21:00 UTC — replication (a family only counts if it holds in both).

**Pitfall encountered and fixed**: a window folder made of symbolic links to the `.jsonl.zst` files
is read EMPTY by the replay, because `zstd` ignores symbolic links (warning on stderr only): the
first replay had read only the 2 uncompressed hours (10,735 lines instead of 414,043, 92 pools instead of
1,935) and the positive control still PASSED (0.8 playable/h). `fenetre.sh` now copies the hourly files.

**Tools.**
1. `labo/rejouer.mjs` (entry t+20 s, then t+60 and t+120 s; stake $0.10; holds 60/150/210/300 s);
2. `recensement.mjs` (new): ALL pools born, not only the "playable" ones, followed for 1 h, each swap
   with its size in $ and the sender of its tx (taken from the collector's `tx/`); `familles.mjs` turns it into the table;
3. `canari-init.mjs`: all v4 `Initialize` events of the PoolManager, unfiltered, by day — the canary for "0 pools".

**Positive control of the replay: PASSES in both windows.** Family `v4|2500|sans hook|natif|1526o`, window R:
513 born, 491 playable (20.5/h), 22 already dead at t+20 s (excluded), median +150 s **+100 %**, +210 s **+130 %**,
total losses 13.2 % at +150 s and 15.3 % at +210 s, 0 % without a third-party sale. Window V: 501 born, 20.5 playable/h,
median +150 s +103.6 %, losses 12.4 %. Reminder: on Arc the replay is a FLOOR for ranking, not a revenue
([[arc-un-rejeu-est-un-plancher-pas-une-estimation]], i.e. a replay is a floor, not an estimate).

**Senders (`from`) resolved by the collector**: 99.1 to 100 % of the swaps of the 1526o family, all sizes (only
80 buys ≥ $5 out of 47,521 are missing in R); only 41 to 88 % in the hook family `10000|USDC|45o` (completed by RPC, see §6).

## 2. The families born on Arc (all pools, not only the playable ones)

### 2.1 The pitfall that hid two families from the replay

The replay (and the punisher, which reuses its keys) files a pool with a hook under `hook:<address>`. But **two
Arc launchpads deploy ONE HOOK PER TOKEN**: each pool becomes its own one-pool "family", and the
"≥ 3 playable" filter makes them disappear from the table. The replay of R showed only 4 families; grouped by
`hook*` + bytecode size, there are two more, one of them a real marketplace (2,391 buyers in 24 h).
That is [[un-filtre-de-famille-rend-aveugle]] (a family filter makes you blind) once again. `familles.mjs --hooks-groupes` groups them.

### 2.2 Table (window R, 05/10 21 h → 06/10 21 h; in parentheses, window V when it differs)

Columns: born/24 h; non-LP buys within 600 s; distinct buyers; share of pools with a SECOND distinct buyer; share
with at least one third-party sale; dead (cumulative withdrawal ≥ 90 % of the deposit) ≤ 300 s / ≤ 600 s;
median life; launcher (contract called by the Initialize tx) and number of distinct creators.

| family | born R (V) | buys ≠LP | buyers | 2nd buyer | third-party sales | dead ≤300/≤600 s | median life | launcher · creators |
|---|---|---|---|---|---|---|---|---|
| **v4 · 2500 · no hook · native · 1526o** | **515 (503)** | 49,491 | 196 | **100 %** | 98 % | 37 % / **100 %** | **334 s** (336) | ramp `0x6049…` · **515 creators, 1 pool each** |
| **v4 · 10000 · hook/token · USDC · 45o** | **123 (171)** | 28,790 | **2,391** (senders at ~45 %; 3,153 once everything is resolved) | 89 % | 90 % | **0 % / 0 %** (no withdrawal in 1 h) | — | pad `0xb021…` · 33 creators |
| v4 · dyn · hook/token · USDC · 5116o | **593 (23)** | 317 | 31 | 17 % | 21 % | 0 % / 0 % | — | pad `0xeed7…` · 586 creators — **born 06/10** |
| v3 · 10000 · no hook · USDC · 1479o | 358 (408) | 26 | 15 | 1 % | 3 % | 0 % | — | `0x3f29…` · 3 creators — spam, no market |
| v4 · dyn · hook `0xf0d6…` · USDC · 44o | 83 (54) | 0 | 0 | 0 % | 0 % | 0 % | — | `0x1487…` · 1 creator — spam, 0 swaps |
| v4 · 10000 · no hook · USDC · 3770o | 76 (230) | 0 | 0 | 0 % | 0 % | 0 % | — | `0x0752…` · 1 creator — spam, 0 swaps |
| v4 · 880000 / 890090 · no hook · USDC · 45o | 31+31 (97+97) | 51 | 7 | 13 % / 0 % | 0 % / 52 % | 0 % | — | ramp `0x6049…` · 1 creator — pool fee of **88-89 %**: trap |
| v4 · 3000 · no hook · native · 10344o | **0** (14) | (95) | (95) | (100 %) | **(0 %)** | (100 % / 100 %) | (101 s) | drain factory, **stopped on 06/10** |
| v4 · 0 · hook `0xeed2…` · native · 4676o | 5 (8) | 7 | 4 | 20 % | 80 % | 0 % | — | flat price, median volume $0.20 |
| others (≤ 3 pools/24 h each) | ~30 | — | — | — | — | — | — | nothing exploitable at this rate |

**Canary** (`canari-init.mjs`, all Initialize events unfiltered, by UTC calendar day): the native no-hook fee=2500 family
counts 277 / 492 / 461 births on 04 (partial, from 13 h 27), 05 and 06/10; **native no-hook fee=100:
0 on all three days**; native no-hook fee=10000: 1 / 5 / 3; native no-hook fee=3000: 0 / 14 / 0. The families
`fee=100 / 2964o` and `fee=10000 / 4361-4362o` of the 01/10 census no longer exist: **the 100 and 10000
tiers of the real bot's `feesVivants` have been empty since at least 04/10.**

## 3. Replay family by family (families grouped by `hook*`)

`rejeu-fam.mjs` redoes the recipe of `rejouer.mjs` on the census (buy at t+E, resell at t+E+H at the marginal price,
drain on the way = total loss, pool already dead at entry excluded, ≥ 2 swaps before entry) but with families
grouped by `hook*` and **the real LP fee read in each v4 Swap**. **Positive control**: on 1526o it returns the
figures of `rejouer.mjs` (R, t+20 s: 490 playable against 491; median +150 s +99.6 % against +100.0 %; +210 s
+129.7 % against +130.2 %; total losses 13.3 % against 13.2 %).
**A hook's own tax (RETURNS_DELTA) is not in the log**: for the hook families, these figures are
a priori an UPPER BOUND (1.25 % per leg measured in September on `USDC20 fee=10000 + hook`). Measured on the ledger
on 06/10 on `10000 · hook/token · 45o`: **only 0.01 %** (§6) — the figures for this family are therefore exact.

Medians (robust mean = without the best 5 % of trades), stake $0.10, two windows R / V:

| family | entry | playable/h R / V | +60 s | +150 s | +210 s | +300 s | total losses +210 s | no third-party sale |
|---|---|---|---|---|---|---|---|---|
| **2500 · native · 1526o** | t+20 s | 20.4 / 20.5 | +47 % / +46 % | +100 % / +103 % | **+130 % / +133 %** | +137 % / +142 % (mean +71 / +67 %) | 15.3 % / 14.7 % | 0 % |
| 2500 · native · 1526o | t+60 s | 19.4 / 19.3 | +31 % / +32 % | +69 % / +71 % | +85 % / +87 % | −100 % (med.) | 17.4 % / 14.9 % | 0 % |
| 2500 · native · 1526o | t+120 s | 18.5 / 18.4 | +20 % / +20 % | +40 % / +40 % | +36 % / +34 % (mean −8 %) | −100 % | 40.8 % / 40.7 % | 0 % |
| **10000 · hook/token · USDC · 45o** | t+20 s | 3.6 / 5.3 | −1.9 % / +3.2 % | −2.0 % / −2.0 % | −2.0 % / −2.0 % | −2.6 % / −2.1 % | 0 % | 4-13 % |
| same, robust mean | t+20 s | | −11.9 % / −10.9 % | −15.3 % / −12.1 % | — | −21.0 % / −11.1 % | | |
| 10000 · hook/token · USDC · 45o | t+60 s | 4.8 / 5.8 | −2.0 % / −2.0 % | −2.0 % / −2.0 % | −2.1 % / −2.0 % | −2.3 % / −2.0 % (rob. −12.5 / −7.4 %) | 0 % | 7-27 % |
| dyn · hook/token · USDC · 5116o | t+20 s | 23.0 / 0.8 | 0.0 % | 0.0 % | 0.0 % | 0.0 % | 0 % | **96-97 %** |
| v3 · 10000 · USDC · 1479o | t+20 s (`rejouer.mjs`) | 0.3 / 0.3 | −2.0 % | −2.0 % | −2.0 % | −2.0 % | 0 % | 71 % / 25 % |
| 880000 / 890090 · USDC · 45o | t+20 s (`rejouer.mjs`) | 0.2-0.5 | −178 % | −178 % | −178 % | −178 % | 17-60 % | 0 % |
| 3000 · native · 10344o (V only) | t+20 s (`rejouer.mjs`) | 0.6 | +19 % | **−100 %** | −100 % | −100 % | **78.6 %** | 21 % |

Reading:
- **1526o remains the only positive family**, and it is positive in both windows and in both halves of each
  window (R, +210 s: medians +130.7 % / +126.3 %). Entering later costs: from t+20 to t+60 s the +210 s median
  goes from +130 % to +85 %, and at t+120 s the +210 s hold overshoots the clock (40.8 % total losses).
- **`10000 · hook/token · USDC · 45o` does not pay a clock-based recipe**: median = −2.0 % exactly, that is
  the fees (1 % per side) on a price that has NOT moved; the robust mean is negative at t+20 and t+60 s (−6 to −25 %, except
  +1.5 % at +600 s in V; very early entries are treated in §6.1); the raw mean is positive only over the long run and only through a few tokens that take off, with halves that
  contradict each other (+600 s, t+20 s, R: medians −69.5 % / −2.8 %). Even before the hook's tax. No drain
  (locked liquidity: 0 withdrawals in 1 h over 294 pools) — it is not a drain trap, it is a market with no trend.
- **`dyn · hook/token · 5116o`** (pad `0xeed7…`, 23 pools on 05/10, **593 on 06/10**): flat price at 0.0 % at all
  holds, 96-99 % of pools without a single third-party sale. No market (median volume $0/pool). To be revisited if
  this pad finds buyers: it was born yesterday and is growing fast.
- The others: spam without swaps, pool fees at 88-89 % (trap), or drain factory (`3000/10344o`, stopped on 06/10).

## 4. The punisher, family 1526o (`punisseur-fin.mjs`)

`labo/punisseur.mjs` splits buys into < $1 / 1-$20 / ≥ $20; on Arc everything is decided between 0.03 and $0.25, hence
a fine-grained version. Classes: **fleet** = tx addressed to the launcher contract `0x43d8…` (147 addresses, median
buys $157, never sells through this path); **us** = our 16 known addresses; **third parties** = the rest. Drain =
liquidity withdrawal within the **6 blocks** (≈ 3 s) following the buy. On 1526o each pool has exactly one deposit
and one total withdrawal. Control = instants at a fixed age (3 s step) without a non-fleet buy in the preceding 6 blocks.

**Control**: withdrawal within 6 blocks at any instant before 300 s = **0.32 %** (136 / 42,297, R) and **0.29 %**
(125 / 42,501, V); after 300 s, 2.8 % / 3.2 % (that is the clock).

**Third-party buys, drained within 6 blocks** (R + V, all ages 0-400 s):

| buy size | age < 15 s | 15-45 s | ≥ 45 s | reading |
|---|---|---|---|---|
| < $0.02 | 0 / 1,106 | 0 / 3 | 0 / 6 | never |
| 0.02-$0.05 | 7 / 1,844 (0.4 %) | 0 / 5 | 0 / 7 | never (the snipers at t+1 s) |
| 0.08-$0.11 — **us** | — | **5 / 985 (0.5 %)** | — | our recipe |
| 0.08-$0.11 — third parties | 4 / 10 | 4 / 5 | **0 / 15** | dangerous before 45 s for the others |
| 0.11-$0.25 | — | 1 / 1 | 2 / 2 | n = 3: probable wall, not measurable here |
| 0.25-$1 | 11 / 11 | 5 / 5 | 16 / 16 | **always** |
| ≥ $1 | — | 29 / 29 | 95 / 96 | **always** (1 exception out of 125) |

**≥ $0.25: 156 drained out of 157 third-party buys (99.4 %) against 0.3 % for the control, a ratio of ×300.** The threshold is
at the same place as at the end of September ([[arc-le-mur-de-mise-est-entre-010-et-012]], i.e. the stake wall is between 0.10 and 0.12): nothing has moved on the stake side. Measuring by cumulative
FLOW over 6 blocks gives the same table (flow 0.05-$0.08 at t+0-5 s: 0 / 345 drained; ≥ $0.25:
100 %).

What I cannot explain with this data: at 0.08-$0.11 and t+15-45 s, our buys pass (5 / 985) and those
of third parties do not (4 / 5). n = 5, different paths (`0x9689…`, `0x4e3b…`, versus the UniversalRouter for us); the
bot also refuses any pool where a recent third-party flow would add to its stake, which third parties do not do. Not to be
transposed to another call path ([[arc-cest-le-chemin-dappel]], i.e. it is the call path).

**The clock** (withdrawal WITHOUT a non-fleet buy in the preceding 6 blocks): R n = 427, p10,269 s · p25,297 · **median
350 s** · p75,403 · p90,429; V n = 423, 274 / 305 / **350** / 400 / 432. All deaths combined: median 334 s (R) and
336 s (V). **The clock has risen again** (309-331 s on 01/10, 262 s on 28/09). Our exit (buy t+21 s + 201 s =
t+222 s) falls before the clock's p10.
**Triggered drains** (withdrawal preceded by a non-fleet buy within 6 blocks): 88 pools out of 515 in R (17 %),
80 out of 503 in V; median age 81 / 71 s; median flow 3.96 / $4.95; **we triggered 4 (R) and 1 (V)**.

## 5. Who wins in the 1526o family (`positions.mjs`, `sorties.mjs`)

P&L by real address (`from` of the tx), position by position, amounts read in the Swaps (no-hook family: the log
is exact). Senders resolved: 99.8 % (R) and 99.1 % (V) of swaps. Gas MEASURED on 12 receipts per address:
$0.00386/tx for `0xe322…`, $0.00253/tx for the others and for us.

**Positive control: PASSES.** The tool finds our bot from the logs alone: R 491 positions, +$57.97 net before
gas (ROI +118 %); the bot's journal ([removed for publication: server path]) says **492 A/R,
+$58.11, ROI +118.1 %, 4 drains** — the tool counts 4 as well. V: 494 positions, +$55.23 against 494 A/R and
+$56.73 in the journal (gap $1.5: one fee=10000 A/R and the window edge).

| address (path) | window | positions | stake | entry | hold | net after gas | ROI after gas | total losses | positive hours |
|---|---|---|---|---|---|---|---|---|---|
| **us** (UniversalRouter, 4 addresses) | R / V | 491 / 494 | $0.10 | t+21 s | 201 s | **+$54.2 / +$51.5** | +110 % / +104 % | 72 / 76 (15 %) | 24/24 and 24/24 (address w000) |
| `0xe322…` (contract `0x53de…`) | R / V | 513 / 503 | $0.0396 | **t+1 s** | 157-160 s | **+$28.7 / +$28.6** | **+141 % / +143 %** | 84 / 75 (16 %) | 24/24 and 24/24 |
| `0x2350…` (contract `0x43cd…`) | R / V | 244 / 249 | $0.029 | t+7-8 s | 186-189 s | +$6.5 / +$7.0 | +92 % / +96 % | **1 / 6 (≈ 1 %)** | 24/24 and 24/24 |
| `0x827a…` (same contract `0x43cd…`) | R / V | 91 / 231 | $0.029 | t+1 s | 61 s | +$2.9 / +$6.8 | +109 % / +102 % | 3 / 5 | stopped on 06/10 around 06 h |
| `0xe71a…` (contract `0x8702…`) | R / V | 510 / 501 | $0.005 | t+1 s | never sells | −$3.8 / −$3.7 | −148 % | 100 % | — (dust, not a trader) |
| **the crowd** excluding us and these 4 | R / V | ~1,000 | med. 4-$10 | 20-340 s | — | **−$2,965 / −$861 before gas** | **−97 % / −91 %** | almost 100 % | — |

Out of 45 (R) and 51 (V) buying addresses outside the fleet and outside us, **only 3 and 4 win**: the three above
(plus one isolated $0.10 position at +17 % in V). **All the winners stake ≤ $0.10.** Every buyer above
$0.25 is drained (§4): the crowd pays the operator, as on 03/10 ([[la-foule-darc-perd-notre-petite-mise-protege]], i.e. Arc's crowd loses, our small stake protects).

**The exit rule that separates `0x2350…` from the others: the REACTIVE EXIT.** It sells **1 block** (median, p90 2)
after a third-party buy ≥ $0.25 appears (or a non-fleet flow ≥ $0.25 over 6 blocks), i.e. **1 to 2 blocks
before** the liquidity withdrawal. Result: 30 reactive exits and **only 1 position caught** in R; 28 and 6 in V.
Us, with a clock-only exit: **0 reactive exits, 38 + 29 positions caught in R, of which 48 after a visible
trigger** (21 + 27), and 50 in V. Its other address (`0x827a…`, exit at 61 s) does the same (6 and 15
reactive exits). `0xe322…` does not do it (0 reactive, 16 % total losses) and compensates with the t+1 s entry.
What this would be worth to us, **not measured in real money**: ~48 positions/day that would go from a loss of $0.10 to
the value at the moment (often > $0.10), on the order of +5 to +$10/day, PROVIDED we sell in the block following
the trigger (the withdrawal arrives 1 to 2 blocks later: it is a latency race, not a setting).

## 6. The two hook families: who wins, and what the operator does

Senders: the collector resolved only 41-88 % of them in the `10000 · hook/token · 45o` family. The 53,564 missing
txs of window R were resolved from the Mac (`resoudre.mjs`, `eth_getTransactionByHash` in batches of 20,
blockdaemon + publicnode, **0 unresolved**); two-source check: 200 hashes already known to the collector re-resolved
by RPC → **200 agreements, 0 disagreements**. Final coverage **100 %** of the swaps of the first 30 minutes. Window V
was NOT resolved (102,055 txs): the winner figures for these families are on R only. Note: Arc nodes keep the tx index
only for ~1 day (a tx of 05/10 00 h returns `null` on 06/10 21 h) — window R
becomes unresolvable by RPC tomorrow.

**Hook tax, measured on the ledger** (`taxe-hook.mjs`, receipts of 26 swaps, ages 0 to 600 s): on the USDC side, what
the trader pays to the PoolManager = the log, **gap 0.00 %** (16 buys, including at t+2-7 s); on a sale,
the PoolManager pays 0.01 % of the amount to a third-party address (interface fee), and on a buy 0.01 % of the tokens goes
elsewhere. **Total cost ≈ 1 % LP fee per side + 0.01 %**: unlike September (1.25 %/leg), the logs of
this family are almost exact. No visible anti-snipe surtax.

### 6.1 `v4 · 10000 · hook/token · USDC · 45o` (pad `0xb021…`)

- **Rate**: 123 pools/24 h in R (171 in V), launched by **33 creators** (16 for the most active); token = minimal
  clone (45 bytes, a single implementation `6b3807…`); tickSpacing 200.
- **The creator buys first**: median **$2,500** per pool in the creation tx ($334,191 in 24 h), and resells
  as it goes ($193,562 within 30 min; age of its sales p10/med/p90 41 / 253 / 1,208 s).
- **Locked liquidity**: 125 deposits, **0 withdrawals** over 123 pools followed for 1 h (and 0 over 171 in V). So there is
  **no stake wall** in the Arc sense: no buy is "drained".
- **The operator's exit is the INSIDERS**: 63 addresses that buy for $0.01 and sell tokens received
  by transfer — **$92.80 bought, $108,013 cashed out** in 24 h, in 22 pools out of 123 (≈ 31 insiders per pool),
  sales weighted at t+520 / **1,282** / 1,510 s. `positions.mjs` detects them (tokens sold > 1.05 × tokens bought)
  and removes them from the ranking: without this filter, the family's "best traders" were them (+$12,091 for
  $0.13 staked).
- **Reaction to buys** (`reaction-createur.mjs`): a sale by the creator or an insider follows a crowd buy
  ≥ $1 within 6 blocks 1.4-1.5 % of the time, against 0.5 % for the control (×2.9) — a weak correlation (both follow
  activity), not a punishment.
- **The crowd** (3,090 addresses excluding insiders, 22,611 positions, $457,752 staked): **−49.3 % in cash received
  at 30 min, −3.3 % when marking at the last price** what is still held. 173 winning addresses.
- **The winners outside insiders are BIG accounts, not a recipe**: `0xc58b…` 13 positions of $50, entry
  t+96 s, hold ~21 min, +28.8 % (+$764); `0xe687…` +24.9 %; `0xfb65…` $69 at t+10 s, +10.7 %; three
  addresses coordinated through the contract `0x53de…` ($165 at t+6-8 s, resale at +35-42 s, +17 to +49 %, **2 positions
  each**). n ≤ 15 per address, a single window: nothing that looks like a regular winner at a small stake. The most
  active at a small stake (`0x6421…`, $2 at t+4 s, 58 positions) loses −8.7 %; the second operator of 1526o
  (`0x871e…`, contract `0x43cd…`, $1.50 at t+2 s) −4.1 %.
- **Replay** (§3): median −2.0 % (the fees) at all holds from 10 s to 20 min; with entry t+2 to t+15 s and
  hold +60/+120 s, the robust mean is **+15 to +25 % in R but −6 to −8 % in V**: it does not replicate.
  It is a lottery (a few tokens that take off make the mean), not an edge.

### 6.2 `v4 · dyn · hook/token · USDC · 5116o` (pad `0xeed7…`)

- **Rate**: 23 pools on 05/10, **593 on 06/10** (586 distinct creators: a public ramp, born this week).
- The creator buys **$4.50** at t+0 (599 buys) and resells (576 sales); 0 liquidity withdrawals (616 pools followed).
- Almost no market: 317 third-party buys in 24 h for 593 pools, 31 buyers, **96-99 % of pools without a single
  third-party sale**, flat price (replay 0.0 % at all holds).
- The only two regular buyers are snipers at t+4 s that resell at +11 s: `0x47fc…` ($0.28, 116
  positions, −1.8 %) and `0x8887…` ($0.47, 99 positions, −5.3 %). The crowd (32 addresses): −11.5 % cashed,
  −3.1 % marked. No creator reaction to buys (0 sales within 6 blocks after 283 buys).

**What the reactive exit would be worth to our bot** (`valeur-reactive.mjs`, counterfactual on the logs, NOT a real
measurement): our positions caught by a withdrawal AFTER a visible trigger are **51 in R and 59 in V** (staked
5.10 / $5.90, returned 0). Sold at the price of the last swap of the trigger block + 1: 3 / 4 missed (withdrawal already
passed), **+$8.55 (R) and +$8.94 (V) per day**; at block + 2: 19 / 25 missed, +5.7 / +$5.8. That is +11 to +16 % of
current revenue (~$54/day after gas), entirely dependent on latency (one block = 0.5 s).

## 7. The rules, family by family

### `v4 · 2500 · no hook · native · 1526o` — ramp `0x6049…` (our family) — ALIVE, the only one that pays
| rule | value (R / V) | evidence |
|---|---|---|
| rate | 515 / 503 pools per 24 h (21.5 / 21.0 per h), 491 playable at t+20 s | census + canary |
| who launches | 515 distinct creators, 1 pool each; template 2,639,229 at 100 %; token 1,526 B, unique fingerprint | logs |
| fees | 0.25 % per side, no hook (exact log) | logs |
| fleet | contract `0x43d8…`: 147 addresses, ~47,000 buys/day, median $157, t+29 to t+302 s | logs + tx |
| clock | withdrawal without trigger: median **350 s** (p10,269, p90,429-432); all deaths: 334-336 s; 100 % dead at 600 s | logs, n = 427 / 423 |
| stake wall (third parties) | age < 15 s: flow 0.05-$0.08 passes (0 / 345), 0.08-$0.15 drained 6 / 18; 15-45 s: $0.10 passes for us (5 / 985), drained 4 / 5 for other paths; ≥ 45 s: $0.10 passes (0 / 15); **≥ $0.25 drained 156 / 157 at any age** | logs, control 0.3 % |
| drains triggered by others | 17 % of pools (88 / 515, 80 / 503), median age 71-81 s | logs |
| honeypots | 0 % without a third-party sale | replay |
| winning recipe (OBSERVED at third parties and at us, real money) | (a) **ours**: $0.10, t+21 s, exit +201 s → +110 % after gas, +$54/day; (b) `0xe322…`: $0.04, **t+1 s**, exit ~+157 s → +141 %, +$28.7/day; (c) `0x2350…`: $0.029, t+8 s, exit ~+186 s **and reactive exit 1 block after a third-party buy ≥ $0.25** → +92 %, 1 % total losses | bot journal (control) + logs, 48 h, 24/24 h positive |

### `v4 · 10000 · hook/token · USDC · 45o` — pad `0xb021…` — ALIVE but WITH NO MEASURED EDGE
| rule | value | evidence |
|---|---|---|
| rate | 123 (R) / 171 (V) pools per 24 h, 5.1-7.1 playable/h from t+2 s | census |
| who launches | 33 creators; the creator buys ~$2,500 at t+0 and resells as it goes (median age 253 s) | logs + tx (100 %) |
| fees | 1 % LP per side + 0.01 % (hook tax measured on the ledger, 26 receipts) | receipts |
| liquidity | locked: 0 withdrawals over 294 pools → **no stake wall, no drain** | logs |
| operator's exit | insider networks (63 addresses, ~31 per pool, in 18 % of pools) that sell tokens received by transfer around t+21 min: $108,013 in 24 h | logs + tx |
| clock | none (the pool does not die) | — |
| honeypots | 2-13 % of positions without a third-party sale over the hold | replay |
| winning recipe | **none found**: median replay −2.0 % (the fees) everywhere; robust mean positive in R (+15 to +25 % at +60/+120 s after an entry at t+2-15 s) but negative in V (−6 to −8 %); crowd −3.3 % marked; winners = big accounts with n ≤ 15 | REPLAY (ceiling) + crowd P&L, R only |

### `v4 · dyn · hook/token · USDC · 5116o` — pad `0xeed7…` — BORN 06/10, NO MARKET
593 pools on 06/10 (23 on 05/10), 586 creators, creator buy $4.50 at t+0, 0 withdrawals, 96-99 % of pools without a
third-party sale, flat price, losing snipers (−1.8 % and −5.3 %). To be re-checked in a few days given its growth.

### Closed families (zero rate, no market, or traps)
- `v4 · 3000 · native · 10344o`: **drain factory** — 14 pools on 05/10, 100 % dead in ≤ 300 s (median life 101 s), 95
  buyers for 95 buys, **0 % third-party sales**, replay −100 % from +150 s. Stopped on 06/10 (0 pools). Already
  excluded from the bot (`feesVivants` whitelist).
- `v4 · 880000 / 890090 / 899800 · USDC · 45o` (ramp `0x6049…`, a single creator `0x6b6f…`, tickSpacing
  18,000): pool fee of **88-90 %** — trap, replay −178 %.
- `v3 · 10000 · USDC · 1479o` (`0x3f29…`, 3 creators, 358-408 pools/day), `v4 · dyn · hook 0xf0d6… · 44o`
  (`0x1487…`, 1 creator), `v4 · 10000 · USDC · 3770o` (`0x0752…`, 1 creator): single-operator spam, 0 to 26
  third-party buys per day.
- **native no-hook fee = 100 and fee = 10000** (the other tiers of the bot's whitelist): **0 and 1-5 pools per
  day** since 04/10 — empty.

## 8. Verdict

1. **There is no other exploitable family on Arc today than `2500 · native · no hook · 1526o`.** Over
   48 h (two 24 h windows, coverage 100 %, positive control passed in both), all the other families are
   either spam without swaps, or traps (fees 88-90 %, drain factory), or locked-liquidity markets
   with no edge that replicates (`10000 · hook/token · 45o`), or pads without buyers (`dyn · 5116o`).
2. **The 1526o deposit makes ~$100/day at small stakes, shared among four actors**: us (~54-$58), `0xe322…`
   (~$29), and the operator of contract `0x43cd…` (~9-$14 over two addresses). The crowd (45-51 addresses excluding us)
   loses 91-97 % of its stake there: every third-party buy ≥ $0.25 is drained.
3. **The 1526o rules have not moved on the stake side** (≥ $0.25 drained 156 / 157; $0.10 passes for us at t+21 s, 5 / 985)
   and **the clock has lengthened** (median 350 s against 309-331 s on 01/10).
4. **The real strategy is right on family, stake and entry, but not on exit** (§11): the bot
   captures almost all of the playable rate (492 A/R for 490 playable pools in R), +52-$55/day, positive 24 hours a day;
   its exit (≈ 201 s after the buy) is half a minute too early since the clock went back up
   (+4 to +$6/day at 225-235 s), and it has no reactive exit (+5 to +$9/day). The two add up (+9 to
   +$14/day in the replay at 225 s, i.e. +18 to +26 %).

**Recommendations for the Arc bot — for the owner to decide, NOT applied (instruction: read-only):**
- **R0 — effective hold 201 s → 225 s** (see §11, to be validated by the owner): +$4.4/day in R and in V,
  positive in 8 six-hour slices out of 8; beyond 250 s the gain reverses (clock cliff, p10,269 s).
- **R1 — reactive exit** (the strongest): sell in the block following a third-party buy ≥ $0.25 (or a non-fleet
  flow ≥ $0.25 over 6 blocks) in a pool where we hold a position. Observed at `0x2350…` (1 position caught
  out of 244); counterfactual for us **+5.7 to +$8.9/day** depending on whether we sell at +1 or +2 blocks. This is not a
  workaround of a protection aimed at us: it is fleeing a drain triggered by another buyer. Requires
  a block-level watch loop and a pre-signed sale; to be validated in real money on ~50 occurrences.
- **R2 — change nothing about the stake** ($0.10) or the t+21 s entry. The "t+1 s entry at $0.04" lead is paid by
  `0xe322…` (+141 %), but it would add to its own buy within the same 6 blocks (0.04 + 0.04 + the $0.029
  of `0x43cd…` ≈ $0.11 → the 0.08-$0.15 zone drained 6 / 18 before 15 s): it would probably get both drained.
  Not recommended.
- **R3 — whitelist**: the fee = 100 and fee = 10000 tiers of `feesVivants` have been empty since 04/10; keeping
  them costs nothing, but there is nothing to expect from them.
- **R4 — monitoring**: re-measure the pad `0xeed7…` (593 pools on 06/10, ×25 in one day) in a few days, and the
  `10000 · hook/token · 45o` family on a resolved V window before declaring it closed (today: no
  replicated edge).

## 9. What was not measured, and why
- **Nothing in real money**: no transaction (instruction). Third parties' recipes are observed in their
  real trades; the reactive exit for US is a counterfactual on the logs (the drain may also react to our sales —
  not tested).
- **Winners of the hook families on V**: senders unresolved (102,055 txs), and the nodes keep their index
  only for about a day.
- **Stake wall 0.11-$0.25 on 1526o**: n = 3 third-party buys in this band in 48 h (3 drained); the exact wall
  for OUR path remains that of the paired trial of 27/09 (between 0.10 and 0.12).
- **Why our buys at $0.10 and t+21 s pass (5 / 985) when those of third parties at the same size and the same age
  are drained (4 / 5)**: n = 5 on the third-party side, different paths; not settled.
- **1526o families beyond 400 s** and the effect of the time of day: not split out (the recipe exits at t+222 s,
  and our gains are positive 24 hours a day).
- Gas: measured on 12 receipts per address (0.0025-$0.0039/tx); our possible approval per position is counted
  as an upper bound (+1 tx).

## 10. Files
- Scripts: `labo/arc-familles/` — `verifier.mjs`, `fenetre.sh`, `canari-init.mjs`, `recensement.mjs`, `familles.mjs`,
  `qui-lance.mjs`, `rejeu-fam.mjs`, `chemins.mjs`, `punisseur-fin.mjs`, `positions.mjs`, `sorties.mjs`,
  `valeur-reactive.mjs`, `a-resoudre.mjs`, `resoudre.mjs`, `fusion.mjs`, `couverture-tx.mjs`, `taxe-hook.mjs`,
  `initie-b.mjs`, `reaction-createur.mjs`, `reel-bot.mjs` and `sortie-balayage.mjs` (§11).
- Raw outputs (erasable): [removed for publication: personal path]
  (replays, `pools-arc-24h*.json` censuses with senders, tables, the bot journal copied read-only).
- [removed for publication: server access detail]: the only read made was a read-only `scp` of the bot's journal `moisson.jsonl` (positive control); no
  RPC call from the servers, no production service or file modified.

## 11. Is Arc's real strategy the best one?

Owner's question, handled read-only from the copies made by the coordinator
(`scratchpad/arc-reel/`: systemd unit and overrides, `moisson.mjs` code identical to the repository, `moisson.jsonl`,
`inclusion.jsonl`). **No modification of the bot.** Setting in service since 03/10 17:01 UTC: `MISE=0.10`,
`AGE_MIN=20`, `AGE_MAX=45`, `DETENTION=210`, `PLACES=6`, `DEUXIEME=0`, `FEES_VIVANTS=100.2500.10000`.

### 11.1 The real result (bot journal, taken from the coordinator)

Gas counted at $0.0101/A-R (4 tx × $0.00253 measured on receipts):
- **1,591 A/R, +$163.89 after gas**; by day: 03/10 (partial) 142 A/R +$14.70 · 04/10,517 A/R +$48.03 ·
  05/10,484 A/R +$53.42 · 06/10,448 A/R +$47.74; **+$0.103/A-R**; 15.6 % total losses; 8 drains < 3 s.
- by tier: **fee 2500: 1,589 A/R, +$163.99**; fee 10000: 2 A/R, −$0.09; fee 100: 0 A/R.
- by UTC hour: **all 24 hours positive** (from +$0.074/A-R at 00 h to +$0.124 at 05 h); by calendar hour
  (`reel-bot.mjs`): 77 hours out of 77 positive, the worst at +$1.17.
- real entry age: p10 20.8 s, median 21.3 s; effective hold measured on the chain: **201 s** between the buy
  and the sale (age at sale 221-223 s) — the code subtracts ~9 s from `DETENTION=210` for latency.
- Cross-check: the gas actually logged in `inclusion.jsonl` (18,725 tx, 2.2·10⁻⁸ $/unit) comes to
  $12.65 in total, i.e. $0.0080/A-R and **+$167.32**: the coordinator's $0.0101/A-R is a prudent upper bound.

**Positive control of the sweep below**: the replay of the current exit (entry t+21 s, hold 201 s) on
window R gives **$53.5/day**; the real bot, over the same 24 h, did 492 A/R for +$58.11 gross, i.e.
**+$53.1 after gas** at $0.0101/A-R. Gap < 1 %, and total losses 14.6 % in the replay against 15.6 % in real. Since
the correction of 30/09 (already-dead pools excluded), the 1526o replay is no longer a floor: it is calibrated.

### 11.2 What is already optimal

| lever | current setting | verdict | evidence |
|---|---|---|---|
| family | 2500 · native · no hook · 1526o | **the only one that pays** (§2-§8) | 48 h logs, coverage 100 % |
| rate | 6 places, 20.8 A/R/h | **the bot takes everything**: 492 A/R in R for 490 playable pools (replay t+20 s); ~1.3 places occupied out of 6 | journal + replay |
| stake | $0.10 | **optimal**: ≥ $0.25 drained 156 / 157 (logs, §4); real trials of 02/10: double entry $0.20 kept 45 % losses against 12 % (Fisher p = 0.015), entry t+47 s at $0.20 4 losses out of 6, drains at +2/+3 blocks | real money + logs |
| entry | t+20-45 s (real t+21 s) | **keep**: entering later costs (replay, same window: t+60 s → +85 % at +210 s against +130 %); entering earlier cannot be judged by a replay, and the snipers already present put ~$0.075 in the first blocks (`0x53de…` 0.04 + `0x43cd…` 0.029 + `0x8702…` 0.005): adding $0.04 would make a flow of 0.08-$0.11, drained 2 / 7 before 5 s | replay (ceiling for entry) + logs |
| fee tiers 100 / 10000 | in the whitelist | **neutral**: 0 and 2 A/R in 77 h (−$0.09); neither gain nor cost | journal + canary |
| schedule | 24 h / 24 | **keep**: 24 hours out of 24 positive | journal |

### 11.3 What is not: THE EXIT (`sortie-balayage.mjs`)

The only setting that a replay judges well. Entry t+21 s, 492 A/R simulated in R and 494 in V, stake impact simulated on the
virtual reserves, fees read in the Swap, pool drained before the sale = total loss. $/day = ($0.10 × mean −
$0.0101) × 498 A/R/day (real rate). PAIRED gap = same pool, compared with the current exit (201 s), Student's t.

**Policy A — clock only** (what the bot does):

| effective hold | mean R / V | robust mean R / V | total losses R / V | halves (means) R · V | $/day R / V | paired gap vs 201 s (t) R / V |
|---|---|---|---|---|---|---|
| 150 s | +97 % / +93 % | +89 % / +86 % | 13.0 / 12.8 % | 92·102 · 87·99 % | 43.4 / 41.3 | −10.1 (−8.9) / −10.0 (−9.9) |
| 180 s | +109 % / +105 % | +100 % / +98 % | 14.2 / 13.8 % | 105·113 · 99·111 % | 49.1 / 47.3 | −4.4 (−5.9) / −4.0 (−5.9) |
| **201 s (current)** | +117 % / +113 % | +109 % / +105 % | 14.6 / 14.4 % | 113·121 · 107·119 % | **53.5 / 51.4** | — |
| 215 s | +123 % / +119 % | +114 % / +111 % | 15.0 / 14.6 % | 120·126 · 112·126 % | 56.2 / 54.2 | +2.8 (4.1) / +2.8 (5.4) |
| **225 s** | +126 % / +122 % | +117 % / +114 % | 15.2 / 14.6 % | 124·129 · 117·127 % | **57.8 / 55.8** | **+4.4 (5.4) / +4.4 (7.5)** |
| 235 s | +129 % / +125 % | +119 % / +117 % | 15.4 / 14.8 % | 127·131 · 118·132 % | 59.2 / 57.1 | +5.8 (6.1) / +5.7 (8.1) |
| 240 s | +126 % / +125 % | +116 % / +116 % | 17.1 / 15.4 % | 126·127 · 120·130 % | 57.9 / 57.0 | +4.4 (3.6) / +5.6 (6.6) |
| 250 s | +119 % / +115 % | +108 % / +107 % | 21.1 / 19.8 % | 112·125 · 111·120 % | 54.0 / 52.5 | +0.6 (0.3) / +1.1 (0.7) |
| 260 s | +106 % / +109 % | +93 % / +99 % | 26.6 / 23.5 % | 105·106 · 106·112 % | 47.5 / 49.1 | −5.9 (−2.6) / −2.2 (−1.2) |
| 270 s | +96 % / +99 % | +83 % / +89 % | 30.9 / 28.3 % | 99·93 · 92·105 % | 42.8 / 44.2 | −10.6 (−4.2) / −7.2 (−3.2) |
| 300 s | +70 % / +65 % | +56 % / +52 % | 42.1 / 41.9 % | 69·71 · 59·71 % | 29.9 / 27.3 | −23.6 (−7.8) / −24.0 (−8.1) |

By 6 h slices (paired gap vs 201 s, $/day, 8 slices across the two windows): **225 s positive 8 times out of 8**
(+1.5 to +6.2), 235 s 8 / 8 (+3.4 to +8.3), 240 s 8 / 8 (+1.0 to +7.7), 250 s 3 / 8, **260 s negative 7 times out of 8**
(down to −12.0).

**Reading.** The current exit was chosen on 03/10 when the median clock was 309 s; it is now
350 s (p10,269 s). The optimum is at **225-240 s** effective (+4.4 to +$5.8/day, i.e. +8 to +11 %), then a
**cliff**: the sale at t+21+250 s falls on the clock's p10, and every extra 10 s costs 3 to $7/day. The
risk is asymmetric, and the operator has already shortened its clock by 53 s in 24 h (28/09). **I recommend 225 s**
(sale around t+246 s, 23 s before the clock's p10), which takes 75-80 % of the maximum gain with the widest margin.
With the observed offset of ~9 s, this corresponds to `DETENTION` ≈ 234 in the setting (to be checked on the chain
after the change: the median age at sale should come out around 246 s). **240-270 s would NOT earn more**: 240 s is
at the level of 225 s with 2 more points of losses, 270 s loses 7 to $11/day.

### 11.4 What is missing: the reactive exit (policy B)

Same sweep, selling at the trigger block + D as soon as a third-party buy ≥ $0.25 (or a third-party flow ≥ $0.25
over 6 blocks) appears after our entry — 68 pools out of 492 (R) and 67 out of 494 (V) have one; if the withdrawal falls
at that block at the latest, the exit is counted as missed (−100 %).

| policy | hold | $/day R / V | total losses R / V | paired gap vs current setting R / V (t) |
|---|---|---|---|---|
| B, D = 1 block | 201 s | 62.1 / 59.2 | 4.9 / 4.5 % | +8.6 (6.8) / +7.9 (7.0) |
| B, D = 2 blocks | 201 s | 59.2 / 56.1 | 8.3 / 8.7 % | +5.7 (5.4) / +4.8 (5.2) |
| **B, D = 1 block** | **225 s** | 67.2 / 64.1 | 5.1 / 4.3 % | **+13.7 (10.0) / +12.7 (10.6)** |
| **B, D = 2 blocks** | **225 s** | 64.2 / 60.8 | 8.5 / 8.7 % | **+10.7 (8.9) / +9.4 (9.1)** |
| B, D = 1 block | 235 s | 68.8 / 65.8 | 5.1 / 4.3 % | +15.4 (11.1) / +14.4 (11.7) |

Positive in the 8 six-hour slices (B 225 s, D = 2: +4.2 to +$13.2/day). **D = 2 is the realistic estimate** for
the current bot, which polls the node every 400 ms: seeing the trigger block, then getting the sale included in the
next block, is 2 blocks; D = 1 assumes a subscription-based watch (`newHeads`) and an already-approved sale, as
`0x2350…` does (median 1 block). Level of evidence: **counterfactual on the logs**, not a real trial; it
assumes that our $0.10 sale changes nothing about the trigger (it is a sale, it does not add to the buy
flow) and it honestly counts the useless exits (1 buy ≥ $0.25 out of 157 is not followed by a drain).

### 11.5 Do the outside traders in our family do better?

In dollars, no: we take ~$54/day, `0xe322…` ~$29, the operator of contract `0x43cd…` ~9-$14 (§5).
In return on capital, two do better on a specific point:
- `0xe322…`: +141-143 % after gas against +104-110 % for us, by entering at **t+1 s at $0.04** and exiting
  around 157 s. This is not transposable: its stake and that of the other snipers of the first blocks add up in the
  trigger (§11.2), and the gain per pool is capped by the stake.
- `0x2350…`: +92-96 %, but **1 to 6 total losses out of 244-249 positions (≈ 1 %) against 15 % for us**, thanks to
  the reactive exit in 1 block. **It is the only transposable piece**, and it is §11.4.

### 11.6 The families the bot does not play

None would pay today (§8): `10000 · hook/token · 45o` has no edge replicated between R and V, `dyn ·
5116o` has no buyers, the rest is spam or traps.

### 11.7 Ranked recommendations — each **to be validated by the owner before any change**

| rank | change | expected gain ($/day, R / V) | risk | evidence | how to validate |
|---|---|---|---|---|---|
| 1 | **Exit at 225 s effective** (`DETENTION` ≈ 234) | **+4.4 / +4.4** (+8 %), 8 six-hour slices out of 8 | **low**: one variable, reversible; residual risk = the operator shortens its clock below ~250 s | exit replay, calibrated to < 1 % of real | track the median age at sale (≈ 246 s) and the clock's p10 (`punisseur-fin.mjs`); go back to 201 s if the p10 falls below ~255 s. A 50/50 paired trial would need ~840 A/R per arm (~3.5 days) for a t of 2 |
| 2 | **Reactive exit** (sell in the block following a third-party buy ≥ $0.25 or a flow ≥ $0.25/6 blocks) | **+4.8 to +8.6** alone; **+9.4 to +13.7 with rank 1** (+18 to +26 %) | **medium**: new code (block watch, immediate sale); a sale bug can cost more than the gain | counterfactual on logs + observed practice of `0x2350…` | ~68 triggers per day: over 1 day, count the reactive exits made BEFORE the withdrawal (target ≥ 80 % at D = 2) |
| 3 | Change nothing about the stake, the entry, the places | 0 | — (changing would be risky: two losing real trials on 02/10) | real money | — |
| 4 | Remove fee = 100 and fee = 10000 from `FEES_VIVANTS` | ≈ 0 (2 A/R in 77 h, −$0.09) | none | journal + canary | optional |

**Verdict on the question "do we have the best strategy?"**: on family, stake, entry and rate, yes —
no measured variant does better, and two lost in real money. On the exit, no: it is half a minute
too early since the clock went back up, and it does not react to third-party triggers. The two corrections are worth
together **+9 to +$14/day in the replay (+18 to +26 %)**, the first with no technical risk.

## 12. Can the reactive exit be done? (added by the coordinator, 06/10 ~23 h UTC, read-only)

Measured on window R (1526o, 515 pools) and on the chain (blockdaemon, from the Mac):

| question | measurement | consequence |
|---|---|---|
| delay from trigger buy → withdrawal | over 85 withdrawals preceded by a third-party buy ≥ $0.25: **1 block: 5 · 2: 26 · 3: 36 · 4: 10 · 5: 7 · 6: 1 · same block: 0** | in 94 % of cases we have at least 2 blocks (≈ 1 s) |
| recognizing the trigger in the log alone | the fleet goes 100 % through the UniversalRouter `0x4fca…` (47,406 buys, tx addressed to the launcher `0x43d8…`); the triggers go through ANOTHER router in 77 cases out of 85 | rule "buy ≥ $0.25 AND router ≠ UR" = 91 % of triggers, with no additional query; the 9 % that go through the UR are missed |
| our current reaction time | entry at age 20 s: included **1 block later in 29 %, 2 blocks in 70 %, 3 in 1 %** (1,336 entries since 03/10), and this path still contains an `eth_call` simulation that an emergency sale can skip | L ≤ 2 blocks in 99 % of cases |
| same block as the withdrawal: who gets through? | operator's withdrawal: tip **0.25 gwei** (59/60), position 0 of its block; in 85 withdrawal blocks, **68 better-paid tx placed BEFORE it, 0 after** ; our bot pays 2 gwei | a sale that lands in the withdrawal's block goes ahead of it |
| general block ordering on Arc | 55 blocks out of 89 strictly by effective tip; the 34 exceptions mix 0 gwei tx | the tip decides as soon as it is > 0 |

**Estimate**: success if our sale is included at the latest in the withdrawal's block, i.e. P(L ≤ gap) ≈ 0.06 × 0.29 +
0.94 × 0.99 ≈ **95 % of the detected triggers**, hence ≈ 86 % of all triggers. This is the "sale at block + 1" case of
§6 (+8.55 / +$8.94/day), minus the 9 % through the UR: **≈ +7.5 to +$8.5/day** for the reactive exit alone, and
≈ +12 to +$13/day with the hold at 225 s (the two complement each other: the longer you hold, the more the reactive exit helps).

**What needs to be coded** (nothing is done, owner's instruction): in `traiter(logs)`, if a HELD pool receives a buy
≥ $0.25 whose router is not the UR → IMMEDIATE sale of the known quantity (`jetons` from the buy receipt, without re-reading
the balance), WITHOUT an `eth_call` simulation, nonce in memory, tip ≥ 2 gwei, and cancellation of the clock sale.
The current sale path makes three sequential calls (balance, simulation, send): too slow for an emergency.

**Risks**: (1) the operator can adapt (withdrawal at +1 block, or in the same block) — it did so three times in three
days on Robinhood; (2) effect of our sales on its machine: not measured; (3) false triggers: 1 buy ≥ $0.25 out of
157 is not followed by a withdrawal, negligible cost. **Proposed measurement**: random draw PER POOL (reactive exit
armed in 50 % of pools) for ~2 days, to measure the real capture rate against a contemporaneous control before
generalizing it.
