> *Working document from the author's lab. Written in French on 2026-10-07, before the paper; translated to English with an AI assistant for publication; every number is as in the original. Removed for publication: server names, a local network address, a server file path.*

# Robinhood: why we are not trading (watch of the evening of 06/10 → 07/10)

> Written as events unfolded. Read-only: no transaction, no stop or restart, no change to the bot.
> Times in UTC (Paris = UTC+2). Sources: bot logs on [removed for publication: server name] (read over ssh), raw chain logs
> collected by the lab (tunnel [removed for publication: local address]), balances read from the Mac by `curl` on the official RPC.

## 1. State of play at 22:30 UTC on 06/10

**The bot is running.** `moisson-rh` active since 21:27:08 UTC (2nd version of the 10000/5274o test), 0 restarts,
0 blocks behind the head.

Effective setting (`systemctl show`, override `zz-wallet-neuf.conf`, which takes precedence over `mises-reduites.conf` and
`test-1526.conf`): `FEES_VIVANTS=10000`, `TAILLES_JETON=5274`, `MISES_TIREES=0.06`, `ENTREE_S=20`,
`FLUX_FENETRE_S=60`, `FLUX_MAX=0.02`, `DETENTIONS=10000:110`, `AGE_MAX` = 45 s (code default), `PLACES=2` drawn at
random (f001, f002), `RAFALE=4/6`, `PERTE_MAX=1.00`.

So the bot buys a pool only if it is: native, no hook, fee 10000, 5,274-byte token, alive, ≥ 2 swaps,
aged 20 to 45 s, and if the sum of outside buys under $5 seen in the last 60 seconds stays
**under $0.02**.

**Its diag** (`diag.jsonl`, every 20 s) is a CUMULATIVE state of its pool map, not a throughput. At 22:29:
81 pools in the map, `mort 59` (liquidity withdrawal seen), `peuDeSwaps 16`, `feePasBlanc 2`, `tropVieux 0-3`,
`flux 0-3`, `retenus 0`. Reading: every 10000/5274 pool that reaches t+20 s alive goes to `flux` (an outsider
has already bought), then to `tropVieux` after 45 s, then to `mort`. None reaches `retenus`.

**What the bot has done since 21:17 UTC:**

| version | window | round trips | drained | result |
|---|---|---|---|---|
| 1st (3 s guard, entry t+18 s) | 21:17 → 21:26 | 4 | 4 in 0.4-0.8 s | −$0.32 |
| 2nd (60 s guard, entry t+20 s) | 21:27 → 22:30 | **1** | 0 within 3 s, but pool **dead 17.2 s after** our buy (21:54, f001, age 20.8 s) | −$0.06 + gas |

**Balances read from the Mac** (block 81,984,173, ETH at $2,695): f001 = 0.0018422 ETH = **$4.96** (nonce 104),
f002 = 0.0008702 ETH = **$2.35** (nonce 8). Total **$7.31**, against $7.71 at the start of the test at 21:17 and
$7.39 at the restart of 21:27. The loss cap ($1.00 below the peak) is not reached.

## 2. Why we are not trading: 17:00 → 22:33 UTC on 06/10

Data: PoolManager logs collected by the lab, hours 17 to 22 (341,553 lines, 0 unreadable, blocks
81,790,065 → 81,985,747 contiguous from one file to the next, 0.1022 s per block); transaction senders resolved
by the lab's enricher (372,708 transactions, 2 files joined to the exact block, 3 unresolved buys
in the family); bytecode size read by the lab (`jetons.jsonl`, 2 unknown tokens out of 783 native no-hook pools).
Code: `scratchpad/veille/ana.mjs`, `sn.mjs`.

### 2.1 Births by family and by hour (≥ 15 pools in 5.5 h)

| family (fee · hook · quote · bytes) | 17h | 18h | 19h | 20h | 21h | 22h (→22:33) | total |
|---|---|---|---|---|---|---|---|
| **10000 · no hook · native · 5274o** (the test under way) | 22 | 34 | 20 | 27 | 30 | 18 | **151** |
| 8388608 (dynamic fees) · hook `0x4e34…` (Doppler) · quote ≠ native (≥ 12 currencies, 4 native) · 44o | 96 | 72 | 107 | 40 | 98 | 32 | 445 |
| 500 · no hook · native · 4655o (closed on 01/10: trap) | 10 | 12 | 5 | 7 | 11 | 3 | 48 |
| 10000 · no hook · native · 4305o / 4306o / 4307o (sterile: one depositor, 0 swaps) | 12 | 12 | 12 | 12 | 12 | 6 | 66 |
| **2500 · no hook · native · 1526o** (our former family) | 17 | 17 | **0** | **0** | **0** | **0** | 35 |
| fees of 50 to 99 % (500000-989999), all quotes, including 146 "RobinSwap" 3248o | 27 | 49 | 60 | 59 | 97 | 16 | 308 |
| **native · no hook · 1770o, variable fees** (new lead, §4.2) | 7 | 15 | 8 | 16 | 12 | 5 | **63** |
| 10000 · no hook · native · 4173o | 1 | 19 | 1 | 0 | 0 | 0 | 21 |
| 10000 · no hook · native · 5987o | 0 | 11 | 1 | 2 | 1 | 0 | 15 |
| 100 · no hook · native · 3854o | 8 | 0 | 0 | 2 | 1 | 0 | 11 |

(+ 673 "families" with fewer than 3 births, 709 pools: the `100 · native` tier is scattered there across dozens of
sizes, and 1770o across a different tier for each pool. 1,718 pools born in total.)

**The 1526o family has not come back**: last pool born at 18:43:56 UTC, none at all in any tier until 22:33.

### 2.2 In 10000/5274o: there is almost nothing left to take at t+20 s

151 pools born from 17:02 to 22:30 (all with ≥ 130 s of history). "Free" = the bot's EXACT definition: alive,
≥ 2 swaps, and at an age of 20 to 45 s, outside buys under $5 cumulated since birth < $0.02.

| hour | born | dead before t+20 s | sniper already in at t+20 s | other outsiders $0.02-5 | **free** | free, dead before the exit |
|---|---|---|---|---|---|---|
| 17h | 22 | 0 | 20 | 0 | 2 | 0 |
| 18h | 34 | 5 | 26 | 10 | 4 | 2 |
| 19h | 20 | 0 | 20 | 0 | 0 | 0 |
| 20h | 27 | 5 | 17 | 1 | 5 | 1 |
| 21h | 30 | 6 | 25 | 1 | 1 | 1 (ours) |
| 22h | 18 | 0 | 18 | 1 | 0 | 0 |
| **total** | **151** | **16 (11 %)** | **126 (83 %)** | 13 | **12 (8 %)** | 4 |

- **The sniper `0x93b0…` got in before t+20 s in 83 % of the pools** (126/151; median buy age 14.0-16.8 s
  depending on the hour, $0.065). It is drained 2 times out of 133 buys: its position alone stays under the threshold.
- **11 % die before t+20 s**, 12 times out of 16 right after an outside buy under $5. The other small
  buyers of the family ($0.13-2.70, before 60 s) are drained every time: `0x3c88…` 5/5, `0xdd73…` 4/4,
  and four addresses going through the same contract `0x6505…`, 4/4.
- **That leaves 12 free pools in 5.5 h, ≈ 2 per hour.** But in 5 of them the sniper arrives LATE, at
  t+20.7-21.2 s (three times) or at 33-43 s: our $0.06 at t+20 s would have been stacked under its $0.065, i.e.
  $0.125 of outside position, which was drained 4 times out of 4 in the 1st version of the test. Free pools with NO
  sniper at all: 5 in 5.5 h (18:08, 18:28, 20:38 ×2, 21:52), < 1 per hour.
- The pools of this family die by themselves around 9 min (median age at death 525 s, p90 587 s): the withdrawal
  comes each time from a different new address (the pool's creator, nonce 3 → 5), not from a single operator.

**What happened to our single trade of the 2nd version** (pool `0x326a…`, born 21:52:11): we enter at
t+21.3 s ($0.06, f001). At t+37.4 s another bot, `0x42fd…` (nonce 6,849, through its contract `0x6505…`),
buys $0.196; at t+38.8 s the pool creator withdraws all the liquidity. Its position alone exceeded the threshold:
the pool would have died without us. We lose $0.06 and the gas.

**Floor replay of the 12 free pools** (entry at the first free age, exit +110 s, price of the last swap, without
simulating our impact): 8 at +78 / +182 % gross, 4 dead (−100 %). Removing the 5 where the sniper arrives late
(our entry would probably have got them drained), 3 winners remain (+101 %, +146 %, +182 %) and 2 dead out of 5:
at $0.06 and $0.0257 of gas per round trip (gas paid on dead pools too), +$0.004 in total on these 5 round trips, and
+$0.08 on the 12 counting the winners shared with the sniper. **≈ $0 per round trip, ≈ 2 round trips per hour: nothing.**

**Short answer: the bot is not trading because there is no free pool.** The sniper takes 83 % of the family's pools
before t+20 s, 11 % are killed before, and the rest (≈ 2/h) is contested by other bots, a single buy by any of which
is enough to get the pool drained. The filter does exactly what it was asked to do: it refuses to stack our stake on
the sniper's. The bot is not broken.

**The sniper, for its part, always wins** (native pools only, gas excluded): +$1.53 / +$1.09 / +$1.43 / +$1.35 / +$1.61 from
17h to 21h (22-31 pools per hour, 1 to 9 with no sale), i.e. ≈ +$0.7-1.0/h after ≈ $0.65/h of gas. 80 % of its
pools are in 5274o; the rest in `100 · native` (various sizes) and a few `10000` of other sizes.

## 3. The watch that continues: `labo/rh-veille/`

- `veille.mjs`: one round = a snapshot of the slice of births that follows the previous round's (≈ 15 min),
  judged with 150 s of hindsight (t+20 s entry + 110 s hold + margin). Slices contiguous from one round to the next
  (`etat.json` keeps the next block; beyond 30 min of delay, the skipped blocks are STATED in the line).
  Read-only: official RPC from the Mac by `curl` (6-7 requests per round, batches ≤ 20, an element without `result`
  counted as a refusal and never as zero; zero births triggers an unfiltered canary), bot state by `ssh`
  (files only, no RPC call from [removed for publication: server name]). `ESSAI=1 node veille.mjs` displays a round without writing anything.
- `boucle.sh`: 48 rounds, one every 15 min (12 h), launched on 06/10 at 22:41 UTC by
  `nohup caffeinate -i ./boucle.sh &` (caffeinate keeps the Mac from sleeping during the loop). PID in
  `boucle.pid`; stop: `kill $(cat labo/rh-veille/boucle.pid)`. Any errors in `veille.err`.
- **Reading `veille.log`**: each round = one JSON line (for scripts) followed by a summary each line of which begins
  with `│`. `grep '^│' labo/rh-veille/veille.log | tail -14` shows the latest round. The lines:
  - `bot`: active or not, round trips closed since the previous round (`VIDÉ` if withdrawal ≤ 3 s); `diag`: the bot's latest diag;
    `réglage`: the effective configuration (a change shows there); `soldes`: f001, f002, total and Δ;
  - `5274o`: born, dead before t+20 s, sniper before t+20 s, **FREE** (the bot's exact definition), of which without sniper;
  - `1770o`: the candidate family (§4): born, playable at t+20 s, replay t+20 → +80 s, result of trader `0xb4d4…`,
    outside buys ≥ $0.15 drained;
  - `familles`, `alertes` (**return of 1526o**, families never seen with ≥ 3 births), `tiers` (identified small outside
    buyers), `verdict`, `mesure` (requests, refusals: a round in error says so and does not count as zero).
- **Verified**: the first two rounds of the loop were written (22:40 and 22:56 UTC, contiguous slices
  81,980,042 → 81,988,817 → 81,997,738, 6-7 requests, 0 refusals, `veille.err` empty). The first round, recomputed on
  the collector's logs with the same definitions (`scratchpad/veille/controle.mjs`), gives exactly the same
  figures: 44 pools born, 8 in 5274o, sniper 8/8 before t+20 s, 0 free, same counts by family.
- **Corrected at 22:57 UTC**: rounds 1 and 2 saw only the BUYS of trader 1770o (Transfer PoolManager → it),
  not its SALES (Transfer it → PoolManager), and therefore counted as "lost" a trade sold at +111 % (pool
  `0xc913…`). The `1770o` line of the first two rounds is wrong on this point; corrected from the 3rd round
  (≈ 23:11 UTC), verified by replaying the slice of round 2 (`ESSAI=1 DE_BLOC=81988818 node veille.mjs`).

## 4. What could be traded on Robinhood right now

### 4.1 In 5274o: nothing beyond what the bot already does
- **No time slot left free by the sniper**: it got in before t+20 s in 20/22, 26/34, 20/20, 17/27,
  25/30 and 18/18 pools from 17h to 22h. What escapes it dies before t+20 s or is taken by other bots.
- Going in under it by stacking less (0.065 + x < threshold $0.10-0.125) requires x ≤ $0.03, i.e. gas of $0.026 at 87 %
  of the stake: losing by construction. Entering BEFORE it (≤ 13 s) would put us in its place, but it would stack
  its $0.065 on our stake and get us both drained. That would be a war against another trader. Not recommended.

### 4.2 NEW LEAD: the `native · no hook · 1770o` family with VARIABLE fees
**It was invisible until now, to all our tools.** Each pool there has its own fee tier (578 to 4,866 in
the evening, often 100 in the morning), tickSpacing 200. A tool that groups by tier therefore cuts it into hundreds of
one-pool "families", all under the headcount thresholds. Only the cross-sectional report of 04/10 shows a
crumb of it (`30000|1770o`, 8 pools). The 1,770-byte tokens have existed since 04/10 at 20:00.

Mechanics: a native pool, liquidity supplied by a new address through one of a few contracts (`0x3194…`,
`0x5e2d…`…), a dust of $0.01 at t+0.3 s (`0xe71a…`, the same one as in 5274o), then **a fleet
of about fifteen addresses that buy and sell $100-180 from t+5 s** (~200 swaps per pool), and a scheduled
withdrawal around **245-265 s**. Like 1526o before it disappeared: a volume ramp, of which we take the slope.

| period (06/10) | pools | /h | replay entry t+20 s → exit +60 s (mean · median · dead) | → +110 s | trader `0xb4d4…` after gas |
|---|---|---|---|---|---|
| 00-15 h | 98 | 1-18 (mostly 08-14 h) | +51 % · +56 % · 32/88 | +57 % · 32/88 | +$17.6 over 46 round trips (≈ 13 h) |
| 17-19 h | 22 | 7-15 | +46 % · +54 % · 7/20 | +39 % · 8/20 | +$2.6 over 18 round trips |
| 19-22 h 33 | 41 | 5-16 | **+38 % · +46 % · 4/37** | +24 % · 7/37 | +$2.0 over 31 round trips |

- **A third party really wins there**: `0xb4d4…` (nonce ~1,460, same public
  UniversalRouter as ours), $0.27 fixed at t+5-7 s, exit at 28-148 s. On 06/10: 95 round trips, ≈ **+$22 after gas**
  ($0.026/round trip), positive after gas 14 hours out of the 15 where it played, 22 % total losses (21/95). Its ROI per trade falls in the
  evening (≈ +200 % at 17-18h, +45-85 % afterwards). The 5274o sniper never goes there (0/63 in the evening).
- **The punisher exists, but its threshold is higher than in 5274o.** Withdrawal ≤ 3 s after an outside buy, age
  5-200 s, over the whole day:

  | buy | 1770o (161 pools) | 5274o (151 pools, 17-22h) |
  |---|---|---|
  | $0.02-0.15 | 1/42 | 7/141 |
  | $0.15-0.5 | **8/118 (6.8 %)** | **7/8** |
  | $0.5-1.5 | 5/11 | 8/8 |
  | $1.5-5 | 11/20 | 6/6 |
  | control (random instant) | 0.85-1.3 % | 0.62 % |

  The early deaths of 1770o mostly follow the fleet's large swaps: of the 21 pools dead before 130 s in the
  evening, 3 follow a buy of $1 to 2.7 (1.0 to 1.6 s after), 1 follows the trader's $0.27 (1.8 s after), the other 17
  nothing small.
- **Throughput for us**: 57 pools out of 63 in the evening are alive at t+20 s with ≥ 2 swaps, i.e. ≈ 10 per hour.
  Expectation in replay (exit +60 s, fees 0.06-0.49 % per side, gas $0.026): +$0.012/round trip at $0.10 and +$0.05 at
  $0.20 over the evening (+38 %), +$0.025 and +$0.075 over the day (+51 %). On ≈ 155 round trips per day (161 pools born on
  06/10 from 00h to 22h33, ~90 % playable): **≈ $2 to 12/day**, to be divided or multiplied by 3 (a replay is
  only an uncertain floor). Same order as the real trader (+$22/day with a stake of $0.27 and a 14 s head start).
- **Risks**: (1) our stake stacks on its $0.27 ($0.37-0.47 in total), at the top of the bracket where 6.8 % are
  drained, at the bottom of the one where it is 45 %; (2) the other bots of $0.13-1 (contract `0x6505…`, `0xe9d8…`,
  `0x0b41…`) go through there too; (3) the operator on Robinhood Chain has changed its setting three times in three days after
  our arrival; (4) 24-36 % of pools dead before the exit depending on the hour.

### 4.3 The rest: nothing
- **1526o**: absent since 18:43 UTC (§2.1). The watch will sound the alert if it returns.
- `100 · native` (all sizes except 1770o): 5.6 pools/h, the sniper in 20 out of 31, a faster sniper
  (`0x8dc6…`, t+4 s); replay +39 % median but 5 dead out of 16. Too thin.
- `500 · 4655o`: median replay −100 % (26 dead out of 47), the known trap. `4305/4306/4307o`: sterile. `4173o`,
  `5987o`: flat price. Fees of 50 to 99 % (308 pools): untradable.
- Doppler family (hook `0x4e34…`, quoted in tokenized stocks, WETH, USDG): ~80 pools/h, already judged RED on 06/10
  (`memes-cotes-en-actions.md`: 1.3 playable/h, flat price, 28 % with no sale). Not re-measured.

## 5. Recommendations (nothing has been applied)

1. **The 5274o test under way can stay as it is or be stopped: it is for the owner to choose.** It does no
   harm (≈ 2 opportunities per hour, loss cap at $1), but it will earn nothing: ≈ $0 per round trip in replay, and its
   only trade of the 2nd version was killed by another bot.
2. **If the owner wants to test 1770o** (on f002 alone, or f001 + f002 drawn at random as today), the following is needed:
   - `TAILLES_JETON=1770`, `FEES_VIVANTS=` (empty: fees vary with each pool); 6 pools out of 161 have fees
     above `feeMax` = 10,000 (10,900 to 29,400, in the morning) and will stay ignored, which is intended;
   - `ENTREE_S=20`, `FLUX_FENETRE_S=60`, `FLUX_MAX=0.30`: we accept the trader's $0.27 and the $0.01 dust,
     we refuse as soon as a second buyer is added;
   - `MISES_TIREES=0.06,0.10,0.20` with a seed: a stake drawn AT RANDOM measures the family's drain threshold
     in the same session (sheet `tirer-la-mise-au-hasard-pas-en-echelle`);
   - **a hold of ~60 s, which the current configuration DOES NOT ALLOW without touching the code or
     `chaines.json`.** Variable fees fall on Robinhood's `defaut` tier (`detentionS: 240` in
     [removed for publication: server file path]), beyond the scheduled withdrawal (245-265 s). `DETENTIONS` only takes exact tiers, and
     **`DETENTIONS=defaut:60` would be ignored SILENTLY** (the key becomes `NaN`). So either
     `robinhood.paliers.defaut.detentionS` must be set to 60, or `DETENTIONS` must be taught `defaut`. The family's fee=100 pools
     (34 out of 98 in the morning) take `DETENTION_100`, to be set to 60 too. The 100 tier closes by itself after
     3 drains in the first 20 trades (`essai100`);
   - keep `RAFALE=4/6` and `PERTE_MAX=1.00`.
3. **Judge this test by the balance, hour by hour, and compare it with trader `0xb4d4…` in the same hour**: the watch
   displays its result. If we are drained while it gets through, it is our stake (stacked on its own) that
   triggers it, not the family.
4. **The methodological lesson**: a family whose fees change with every pool is invisible to any tool that
   groups by tier. `rejouer.mjs`, `punisseur.mjs` and the radar should also group by (native, hook, token
   size), ignoring fees. Same class of error as the sheet `un-filtre-de-famille-rend-aveugle`.

## 6. Watch journal (first rounds)

| round (UTC) | births | 5274o born / sniper < 20 s / free | 1770o born · trader | bot | total f001+f002 |
|---|---|---|---|---|---|
| 22:40 | 22:23 → 22:38 | 8 / 8 / 0 | 2 (1770o line not yet tracked) | 0 round trips | $7.311 |
| 22:56 | 22:38 → 22:53 | 4 / 4 / 0 | 2 · 1 sold +111 %, 1 lost (pool dead at 67 s) — displayed wrongly by the watch, see §3 | 0 round trips | $7.313 |
| 23:11 | 22:53 → 23:08 | 8 / 8 / 0 | 1 · sold +48 % | 0 round trips | $7.319 |

The bot is not trading, as foreseen in §2. The watch continues until 07/10 around 10:40 UTC.
