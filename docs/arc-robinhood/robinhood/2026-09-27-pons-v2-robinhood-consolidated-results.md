> *Working document from the author's lab. Written in French between 2026-09-21 and 2026-09-27 (the file holds the 21 September state and the 27 September update), before the paper; translated to English with an AI assistant for publication; every number is as in the original. Removed for publication: network-access and hosting details (including IP ranges), personal file paths.*

# Pons V2 / Robinhood Chain — consolidated state as of 21 September 2026

> **This is the most recent document.** It replaces any earlier summary. The detail of the
> measurements lives in `CHANTIER-FILTRE.md` §115 to §130; this file gives the state, the
> figures that decide, and what remains to be done.

---

## UPDATE OF 21 SEPTEMBER — the bot works again, and volume has not come back

**1. The four days of downtime came from a missing header, not from a breakdown.** The feed
requires `permessage-deflate` (RFC 7692) and rejects with **HTTP 400** the clients that do not
offer it. Our hand-written WebSocket client sent no extension header at all. Fixed, proven by three local tests (including context resumption beyond the
32 KB dictionary — the only possible proof, since probing the server would extend the
ban), deployed and **verified in production on 21/09 at 18:08**: feed at 10 msg/s and
204 KB/s, `secondes.txt` restarting, and a first buy (`ROCKET`) after four days.
Cost: four days of measurement lost for good, since the timestamping is written only by
this feed.

**2. Volume has not come back up.** After the drop of the 16th (113 → 35 M$), a rebound to ~49 then
**five days of plateau between 42 and 50 M$** — half the pre-Arc level. And this is
not specific to Pons: daily volume across the whole chain went from 1.57 to **1.04 G$** in four days
(−34 %), while Solana's stays stable. Pons keeps its 2nd place worldwide, but StonkFun
went from 15 to 39 M$.

**3. The recent days are worse, not better** (462 tokens dated by the RPC for lack of
timestamping): **−0.014 mΞ per trade** on the 18th–19th, average flow down from 0.45 to **0.31 Ξ**, and
the share of tokens receiving ≥ 0.5 Ξ from 29 % to **21.6 %**. The reputation filter (§129)
improves both days (18/09 −0.020 → −0.010 · 19/09 −0.013 → **+0.025**) but its
effect has melted away and nothing is significant on this sample: neither refuted nor confirmed.

**4. The collection was no longer running.** The agent had run **only once in two days**:
a 6 h interval practically never fires on a Mac that chains 987 watch cycles,
and the database had fallen 50 h behind while the indicator believed it was measuring.
Moved to 30 min, stale lock released, and the round is abandoned if another session is collecting.

**5. [removed for publication: network access details]**
>
> Capital: **0.047 Ξ ≈ $112**. Real money: **stopped since 16 September.**
> Paper trading: active, stake 2 mΞ, A2 disarmed but traced, cap 160 blocks.

---

## 1. The verdict, on one page

The bot's strategy — buy 2 seconds after launch on the bonding curve,
resell 160 blocks (16.2 s) later — **stopped paying on 9 September 2026** and has
not come back. It is not a problem of execution or tuning: it is the demand
arriving **after** our entry that has receded.

| | before 9/09 | today |
|---|---|---|
| P&L per trade (full population, stake 2 mΞ) | **+0.518 mΞ** | +0.008 to +0.066 mΞ |
| buyer flow in the 80 blocks after entry | 0.560 Ξ/token | 0.44 to 0.45 Ξ |
| what that is worth per day (~180 trades) | **+$186** | +$8 to +$34 |

For the record, the day-to-day dispersion is **±$43/day**: in the current regime,
the expectation is drowned in noise and one bad day costs 20 % of the treasury.
**This is the central fact, and it does not depend on any of our decisions.**

---

## 2. The mechanism, once and for all

Our P&L **is** the money of third parties arriving after us. Measured on 1,220 eligible
trades of 15–16 September:

| flow after our entry | trades | P&L per trade |
|---|---|---|
| 0 – 0.05 Ξ | 429 (35 %) | **−0.380 mΞ** |
| 0.10 – 0.20 Ξ | 114 | +0.004 ← **break-even at 0.13 Ξ** |
| 0.40 – 0.80 Ξ | 196 | +0.245 |
| > 1.6 Ξ | 80 | +0.88 |

**29.3 % of eligible tokens still receive ≥ 0.5 Ξ and pay +0.50 mΞ per trade
(+25 % of the stake).** The market is therefore not empty: we do not know how to single out these 29 %.

WARNING: the indicator's 0.50 Ξ threshold bears on the **mean** of the flow. It is a marker of
regime, not a floor of exploitability — do not re-read this figure as "the market is
dead".

---

## 3. What is measured and CLOSED — do not return to it

| lead | result | where |
|---|---|---|
| **Exit horizon** | 160 blocks is already the optimum: 20 blocks −0.061 · 80 +0.014 · **160 +0.024** · 320 +0.002 · 640 −0.029 · 1,600 −0.260. Holding longer worsens the dependence on tails. | §125 |
| **Waiting for confirmed demand** | A single cell beats immediate entry per trade (+10 blocks, 0.10 Ξ confirmed: +0.065) but on 4× fewer trades: **+19.2 mΞ against +30.0**. Everywhere else waiting costs. The curve rises with demand. | §125 |
| **Post-graduation entry** | Dead on the same 9 September, on a disjoint population: +10.8 % (3→9 Sept) → −0.0 % (9→11) → **−5.5 %** (15→17, 108 trades). Graduations: 496/day on the 8th → 91 on the 16th. | §125 |
| **Predicting the flow from the order book** | The signal exists (out-of-sample AUC **0.730**, shuffled-label control 0.362) but does not pay: top decile +0.232 then **−0.122**. Aiming at "positive P&L" gives 0.589 then **0.413**, below chance. What is readable in the book is already in the price. | §126 |
| **Changing launchpad** | We are **1st worldwide by fees** (49 % of the fees of 152 pads over 30 days, against 18.6 % at pump.fun) and 2nd by volume. The first non-Solana one after us, Flap.sh (BSC), makes 3.5× less — and has **no anti-snipe band**, so our advantage does not exist there. | §125 |
| **Going to Arc** | Arc's DEX volume is 24× smaller than Robinhood's (64 M$ against 1.57 G$ per 24 h) and has already fallen back 70–85 % since its opening on the 16th. | §125 |
| **Labeled smart money (GMGN)** | Of 15,327 recent launches, **7** (0.05 %) have a labeled wallet among the buyers of the first 40 blocks. It does not play the launch band. | §128 |
| **Raising the stake** | Forbidden by instruction, and in any case measured as losing. | §119 |

**What the literature says** (review of three axes on 18/09): our model **beats the published
state of the art** — 0.730 against 0.464 (arXiv:2607.02823) and 0.573 AUPRC with 122 variables
(arXiv:2602.13480). Our failure is therefore not a lack of variables: **no additional
feature will repair §126**. Moreover 43.2 % of the losing trades of Ethereum snipers
are lost to fees alone (ACM TOIT 2025) — for us gas eats 83 % of the gross,
so any lead under ~2 % gross per trade is dead in advance. And the 10–60 s horizon, ours,
is covered by **no publication**.

---

## 4. What is OPEN — the only two leads

### 4.1 Buyer reputation: who buys, not how much *(found on 18/09)*

This is **the first attributable advantage since the break**. Strict causal walk-forward
(history 13→15 Sept, test 15→18; the table is read before being enriched).

| variable | AUC on "this token will receive ≥ 0.5 Ξ" |
|---|---|
| mean reputation of known buyers | **0.811** |
| best buyer present | **0.817** |
| their mere count *(the bot's current filter)* | 0.668 |

Coverage **99.1 %**. From the 1st to the 5th quintile, the share of tokens reaching 0.5 Ξ goes from
**4.0 % to 57.6 %**, the mean flow from 0.094 to **1.086 Ξ**.

The ranking does **not** make money (quintile 1 −0.143, quintile 3 +0.196, quintile 5
+0.044) — same mechanism as in §126. **What works is discarding the bottom:**

| we discard | remaining | P&L/trade | 95 % CI |
|---|---|---|---|
| nothing | 1,237 | +0.017 | [−0.013 ; +0.067] |
| **40 % of the bottom** | **743** | **+0.083** | **[+0.033 ; +0.148]** |

All three days improve and **17 September, losing at −0.074, becomes +0.036**.
Decisive control: the order-book model applied the same way gives **−0.034** against
**+0.086** — it harms where identity helps.

**What blocks, and it is all the work:** the bot must know **who** buys at the moment of
deciding. Its mere *count* correlates only at **0.45** with the chain (it decides before the
entry block and falls back 970 times per session on the flow alone, which underestimates); identifying
addresses behind routers is harder still — the `recipient` column matches 2 to
3× better than `wallet`. **This is workstream number one, and it is entirely on our side.**

### 4.2 No-hook pools — a population we were throwing away at birth

Our collector classified each pool by its launchpad hook and **discarded the rest without
a trace**. The neighboring session measures there, on our chain: buying a token's **first quote**,
no hook, **fees ≤ 1 %**, at **t+20 s**, resale +80 s — 314 opportunities in 6 h,
**+$17.77 per $100 trade**, median +12.88, 62.4 % winners, matched control
**+$0.07** (t = 8.64), removing the 5 best leaves +15.36. ~1,250 opportunities/day,
1.2 simultaneous positions: **our treasury is enough**.

Two lessons that contradict our strategy: **entering early loses** (t+4 s: median
+$0.22) and the fee filter is vital — 38.9 % of these pools are born at ≥ 10 % fees,
16.9 % at ≥ 90 %.

WARNING: **Not proven, by their own admission**: their simulator resells at the observed market price,
which does not include their own buy, and **no real transaction was sent**. This is
exactly the family of bug that has lied to us twice (free flat exit, then a frozen
offer: +2.7 points of imaginary P&L per trade). **Independent verification required, impact
paid on both sides, before any real money.**

---

## 5. Operational state on 19 September, 15:00 UTC

| | |
|---|---|
| **Sequencer feed** | **DOWN since 17/09 19:44** — `wss://feed.mainnet.chain.robinhood.com` answers 520 from two independent networks. Robinhood outage: the chain produces blocks normally. |
| **Bot** | Alive, and **it is not trading**: it refuses to enter blind, as requested. Last buy on 17/09 at 19:44. |
| **Timestamping** | Stopped at the same second: `secondes.txt` is written only by this feed. **Without it, no more dating of entries — the indicator is blind.** Fallback written and validated (`horo_secours.mjs`, **120/120 exact to the block** via the RPC), **not yet plugged into the indicator**. |
| **Database** | **Catching up, 19 h behind.** Each pass stopped at the ceiling of known launches and caught up only ~62,000 blocks when 6 h produce 214,000: the lag accumulated while the indicator believed it was measuring. Fixed on 19/09 — collection loops until fewer than 20,000 blocks remain. WARNING: never start a collection by hand while the agent is running: two simultaneous `trades.mjs` hammer the RPC the bot depends on. |
| **Agents** | Five, all loaded: `veille` (5 min), `collecte` (6 h), `indicateur` (9:30), `reputation` (30 min, blocked by TCC), `gmgn` (150 s). |
| **GMGN** | Collection active: 9,386 trades, **927 labeled wallets**, 19,199 search snapshots. It is a stream, not an archive — nothing can be caught up. |

### The failures crossed on 17–19 September, all invisible until we looked for them

1. **`com.pons.veille` had disappeared from launchd**, plist intact — the bot stayed dead 14 h.
2. **Nothing was collecting the swaps**: the indicator ran on a database 24.6 h old.
3. **Alive ≠ useful**: the bot wrote its trace every second while discarding 235 decisions
   out of 300 for lack of flow. The probe believed it healthy.
4. **Postgres killed by the memory manager** (`work_mem` at 256 MB, 7.6 GB container) —
   lowered to 64 MB.
5. [removed for publication: network access details]
6. **The mutual guard had never repaired anything** in two days — it swallowed its errors.

All fixed, with alert and trace. The guard has since repaired for real
(`com.pons.collecte avait disparu — RÉARMÉ`).

[removed for publication: network access details]

---

## 6. The rule for returning to real money

The indicator runs every morning at 9:30 and writes to
[removed for publication: personal file path].

**GREEN = two consecutive full days at ≥ +0.25 mΞ per trade.** Nothing else
reopens real money — neither a hunch, nor a single good day.

| day | coverage | trades | P&L/trade | flow |
|---|---|---|---|---|
| 14/09 | 17 % | 405 | +0.046 | 0.381 |
| 15/09 | 95 % | 867 | +0.008 | 0.444 |
| 16/09 | 84 % | 351 | +0.066 | 0.451 |

**RED.** We are at a tenth of the threshold. *(The following days are missing: the timestamping
stopped with the feed.)*

---

## 7. The method traps — what saved us, and what lied to us

1. **Test "discard the bottom" BEFORE "select the top".** I declared prediction
   dead on the 17th by testing only the second form; the first gave the only advantage
   we have. This is the third time this project has relearned this lesson.
2. **Always run the shuffled-label control.** It was worth 0.36 in §126 —
   without it, an AUC of 0.73 remained suspect.
3. **An AUC is not a result.** Always demand the decile's P&L.
4. **Never interpolate to date an entry.** An anchor every 33 min shifts by
   +5 blocks at the median; even at 8 blocks of distance, only 57 % of entries are exact. Only
   `PONS_HORO` or `horo_secours.mjs` are authoritative.
5. **The verdict is read at DAY level.** Counting in trades overestimates precision by a
   factor of ~21.
6. **A filter that silently rejects a whole population shows up nowhere** — this is
   how we ignored the no-hook pools for weeks.
7. **Never sum `quote_amount` across all pairs**: 55 % of pairs are not
   in ETH. This error made me announce −90 % of volume where it was −44 %.
8. **`lower(token)` in a WHERE defeats the index** on 23.7 M rows: 17 s per batch against
   0.53 s. Addresses are already lowercase in the database.

---

## 8. What to do, in order

1. **Make buyer identification reliable at the moment of decision.** This is what
   turns §129 into a strategy. Trace the count *and the addresses* on the BUYS (one
   line in the Go code), understand why the bot falls back on the flow alone, aim for a
   correlation ≥ 0.85 with the chain. Half a day of Go, a day of paper trading.
2. **Independently verify the no-hook pools**, impact paid on both sides. If the
   +$17.77 holds, it is the first serious thing since 9 September — and it does not
   depend on the return of the feed.
3. **Plug `horo_secours.mjs` into the indicator**, so that it keeps measuring during
   feed outages. Half an hour.
4. **Let the rest run**, which costs nothing: paper trading, watch, collection,
   indicator, GMGN.

**Proposed end date: 9 October 2026.** If on that date the indicator is still
red and neither of the two open leads has held, the honest conclusion will be that there is
nothing left here, and it will have to be said plainly.

---

*Full detail: `CHANTIER-FILTRE.md` §115–§129 · project memory in
[removed for publication: personal file path]*

---

# UPDATE OF 27 SEPTEMBER — THE FOUR LEVERS ARE CLOSED

*This file is the most recent. It replaces RESULTATS-2026-09-21.*

## The question asked: "Pons V2, we really find nothing?"

Answer measured on the four full days 22→25/09: **no, and we now know
why**, with a figure for each of the four possible ways of winning.

## 1. The entry instant — read on the chain, no longer assumed

Factory `0x7eD5…`: `snipeTaxStartBps` = 9900, `snipeTaxSeconds` = 3, decay by
binary shift on whole seconds.

| entry | total fees | mΞ/trade (22,559 matched tokens) |
|---|---|---|
| t+0 s | **100.00 %** | zero tokens received — dead by construction |
| t+1 s | 7.18 % | −0.1555 |
| **t+2 s (the bot)** | **1.19 %** | **−0.0913** |
| t+3 s | 1.00 % | −0.1038 |
| t+4 s | 1.00 % | −0.1129 |

Matched gap t+1 vs t+2: **−0.064 mΞ, t = −26, negative all four days.**

The control says exactly where the money goes: entering one second earlier does bring a
price advantage of **+0.056 mΞ** — but the surtax to obtain it costs **0.120 mΞ**. One
second of pump is worth 2.8 % of the stake, the access costs 6.0 %. The ratio never
reverses. **t+2 s is not an inherited setting: it is a measured optimum.**

## 2. The exit — the oracle loses all the same

An oracle that enters at t+2 s at the true fees then **sells at the high of the window**, cheating
on latency and on the visibility of sells:

| population | current rule | exit oracle |
|---|---|---|
| all of Pons (22,589 tokens) | −0.0962 | **−0.0122** ← still loses |
| what the bot trades (1,914) | −0.1340 | +0.1667 |

On the whole population, **81 % of tokens do not cover their round-trip fees
even when sold at the top**. On the bot's filtered population, the oracle is
positive — but the best achievable exit ever measured is worth −0.113. The 0.28 mΞ
gap is entirely information posterior to the decision.

## 3. Selection, variable by variable — three failures already recorded

AUC 0.73 (flow amount), 0.81 but **inverted** on the first new day (buyer reputation),
0.63 (number of buyers). Decile P&L: zero or negative every time.

## 4. Selection, all variables combined — the last test, failed

15 variables readable before entry, logistic regression, training 22–23/09,
test 24–25/09, criterion written in advance (decile ≥ +0.10 mΞ/trade on each of the two
days).

| | AUC | decile 24/09 | decile 25/09 |
|---|---|---|---|
| model | 0.555 / 0.546 | **−0.2483** | **−0.0862** |
| shuffled-label control | 0.494 / 0.480 | −0.1604 | −0.1326 |

The top decile is negative both days and, on 24/09, **worse than the whole
population**. The shuffled control does just as well.

## What this proves

The deposit exists — sorting perfectly would be worth **+0.63 mΞ/trade** — and it is
entirely locked inside information that cannot be had at the moment of deciding.

**The central law, in its strongest form: what is readable in the book before
entry is already in the price paid, and not only variable by variable, but in
any linear combination of these variables.**

## State

| | |
|---|---|
| Pons V2, 22/09 → 25/09 | **−0.111 · −0.103 · −0.206 · −0.150 mΞ/trade** |
| Recovery indicator | **RED all four days** |
| Capital | 0.0303 Ξ, intact — no real-money resumption |
| Scripts | `bande_snipe.mjs`, `lire_bande.mjs`, `oracle.mjs`, `lire_oracle.mjs`, `modele_combine.mjs` |
