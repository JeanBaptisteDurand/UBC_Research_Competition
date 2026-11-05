> *Working document from the author's lab. Written in French on 05/10/2026, before the paper; translated to English with an AI assistant for publication; every number is as in the original; numbers converted to US notation, dates DD/MM. Removed for publication: a personal local data path and a storage-server alias/path (2 passages, in the "Files" section); one third-party program ID shortened to its first 6 characters (`MAyhSm…`). The all-ones System Program ID (`1111…1111`, 32 characters) is a well-known public Solana program ID, kept in full as a public reference.*

# Solana — exploration sheet (pump.fun, Raydium LaunchLab)

> Question put to the chain: is there a crowd that loses, with enough flow AFTER our entry, that a small stake can follow
> it without being punished? Earlier closure (INVENTAIRE.md §3.1), carried by ONE single measurement: "pump.fun:
> 38,777 tokens/day but price drift −7.2% between t+20 and t+240 s, plus 2.47% fees". This sheet re-judges it with the
> full method of `bsc.md` (throughput, second buyer, crowd, third parties from receipts, walk-forward replay, punisher).

## Decision rule — written on 05/10/2026 at 17:53 UTC, BEFORE any yield measurement

Per program × quote asset (pump.fun/SOL, pump.fun/other quote assets, LaunchLab per quote configuration), a family
is **ALIVE** (→ dry run, then small real stake only with the owner's agreement) if and only if all FIVE
conditions hold:

1. **Throughput**: ≥ 10 playable tokens/h. *Playable at t+E* = born in the window, not yet graduated at t+E, ≥ 2 distinct
   third-party buyers before t+E (creator excluded), curve still alive (at least one trade in the 60 s preceding t+E).
2. **Second buyer**: ≥ 30% of tokens bought by ≥ 2 distinct accounts within 60 s, creator excluded. Also read as a
   **strict reading**: excluding accounts that bought AT the creation slot (bundled buys, presumed to be the creator's). If the
   two readings fall on either side of the threshold, the strict one decides.
3. **Third-party actors from receipts**: the REAL round trips of third parties at the recipe's timing (entry t+E ± 10 s for
   E ∈ {10, 20, 30, 45, 60}, position fully closed between +H/2 and +2H for H ∈ {60, 120, 180, 240, 300},
   small stake ≤ 0.1 SOL) have a robust mean (top 5% removed) ≥ +3% and a median > 0, on n ≥ 30, in at
   least one cell (E, H). P&L on the event flows, curve fees INCLUDED (paid = amount entered into the curve
   + protocol fees + creator fees; received = amount out − fees); Solana transaction fees NOT included
   here (subtracted in 4).
4. **Walk-forward replay**: the pair (E, H) chosen on the FIRST half of the window (split by DATE, at the middle
   of the covered window) keeps, on the second half, a robust mean > +5% NET at the target stake, with:
   - execution on the exact curve (constant product with virtual reserves, formula verified on the events before
     use), our own impact on the way in AND on the way out, curve fees measured on the events;
   - Solana execution costs: base fee 5,000 lamports per signature, 2 transactions per round trip, plus the
     priority fee and/or the Jito tip **measured** (median of what third parties doing our move pay, on a
     sample of transactions read at the RPC); if the measurement fails, 1·10⁻⁴ SOL per transaction assumed. The token
     account rent (~0.002 SOL) is assumed RETURNED when the account is closed in the sell transaction;
   - target stake: 0.01 SOL; also reported at 0.005, 0.05 and 0.1 SOL;
   - population: only the playable tokens (condition 1); a token that graduates during the hold exits at the last curve
     price, and their number is stated;
   - the announced $/day is divided by 3 ([[juger-une-chaine-le-second-acheteur]]).
5. **No punisher**: the share of creator sells within the 3 s (8 slots) following a small outside buy
   (≤ 0.1 SOL) does not exceed 3× the age-matched control (same tokens, instants with no outside buy). Read on the
   creator alone AND on "creator + creation-slot accounts"; the less favorable reading decides.

**DEAD** if 2, 3 or 5 clearly fails. **ON HOLD (dated)** if only throughput is missing. A result that would beat the
best actor in the market is presumed FALSE until proven otherwise ([[arc-le-mur-de-mise-est-entre-010-et-012]]).

**Search for a sub-population** (if the whole family fails): every filter is CHOSEN on the first half
(split by date) and JUDGED on the second, with conditions 3 and 4 (robust ≥ +5% net and median > 0, n ≥ 30) and a
throughput ≥ 10/h after the filter. The number of filters tried is written down. Reminder: "the state readable at entry is already in
the price" has been confirmed five times on Pons ([[pons-carnet-lisible-deja-dans-le-prix]]).

## Coverage (stated, not assumed)

- Window analyzed: **04/10 23:00 → 05/10 18:00 UTC (19 h)**, births up to 17:45 (15 min lookback); split by
  date at the middle, **08:22 UTC**. The preceding 2 h (04/10 20:58 → 23:00) are EXCLUDED: the collector was
  restarting there every ~12 min (memory leak, fixed since) — 2 minutes missing from the log, 8 minutes with less than
  30 s of connection.
- 1,140 minutes out of 1,140 logged, 0 without a source, 4 with a single source (the redundancy covers), 0 line lost to
  disk, 0 unreadable event. **Canary** (getSignaturesForAddress): pump.fun **53,123 / 53,123** signatures received
  (100%, 112 checks); LaunchLab **27,651 / 27,680** (99.9%, one check at 58.5% at 14:47).
- Read: 19 files, 3,278,822 lines, 3,222,245 transactions, 43 duplicates discarded, **8,952 multi-account transactions**.
- Out of scope, and stated: PumpSwap after graduation (only pool creations are collected), Meteora DBC/DAMM v2
  (events by self-CPI only, invisible in the logs).

## Checks done before computing figures (05/10)

- **Slot duration: 0.2676 s measured** (block timestamps over the window), not 0.4 s: 3 s = **11 slots**. The rule
  said "3 s (8 slots)" on the assumption of 0.4 s — it is the 3 s duration that was applied.
- **pump.fun formula verified on the events** (SOL family): 2,082,956 trades; 99.8% of consecutive pairs
  chain (state before = state after of the previous one); constant product with virtual reserves exact to 10⁻⁶ on
  98.9% of chained pairs — the rest are buys off by one rounding (median gap 2·10⁻⁶, p90 1·10⁻⁵: these
  instructions fix the tokens and compute the SOL, the reverse of my verification); buys that raise vq
  **1,088,224 / 1,088,224**, sells that lower it 967,750 / 968,044; k never decreases. The order in which lines arrive within
  a slot is NOT the execution order (two merged sources): it is rebuilt by this chaining.
- **Fees measured, not assumed**: 95 bp (protocol) + 30 bp (creator) on **1,839,922 / 1,839,922** SOL trades of
  more than 0.01 SOL → **1.25% per side, ~2.5% round trip**. From receipts (getTransaction, 300 third-party transactions):
  when nothing else moves (26 sells, 2 buys), the change in the account's balance = curve amount ± curve
  fees − transaction fee − tip, **to the lamport**; the others also pay the rent of a token account (buys) or ~1% platform fee (sells made through a
  trading bot).
- **Identity**: the `user` field is the SIGNER in 146/150 buys and 149/150 sells drawn at the recipe's timing.
  Exceptions: a POOLED account (`ARu4n5…`: 1,509 trades on 323 tokens in one hour, ~1% of trades, SOL balance
  unmoving — its "positions" aggregate several clients, low weight) and, in "mayhem" tokens, the agent
  (program PDA `MAyhSm…`, 59,709 SOL). A transaction with 12 signers selling for 6 accounts was found in
  the very first file: **co-signing** accounts are linked (union-find, 8,952 transactions; beyond 50 linked
  accounts — services have up to 1,619 — we stop linking) and treated as a single hand.
- **Amounts and decimals**: lamports (9 decimals); pump.fun tokens = Token-2022, 6 decimals, supply 10¹⁵, null mint
  authority, **no transfer-fee extension** (3/3 verified); event timestamp = `blockTime` (12/12).
- **Positive control with a known answer**: the **591 graduated tokens** of the window show **×14.70** between birth and
  the end of the curve (theory: (115/30)² = 14.7; median final vq 115.01 SOL); their buyers in the first 5 seconds
  are at **+176% marked-to-value** at the graduation price. The sign and scale of the P&L are therefore right.
- **Hand check**: a third-party position recomputed from the raw events = the tool to the lamport (−8.23%).
- **"Mayhem" mode: formula WRONG, replay INVALID.** The agent `BwWK17…` trades with no fees and moves the VIRTUAL
  reserves by several SOL for a 0.05 SOL trade (only 33.7% of pairs chain; the positive control
  returns ×0.02). For this family, only the FLOW measurements (crowd, third parties) are kept.
- **Non-SOL quote assets on pump.fun** (PUMP, USDC, tokenized stocks…): a separate family, P&L in quote-asset units,
  no third parties (a stake ≤ 0.1 SOL makes no sense there).
- **LaunchLab**: the event carries the state before AND after → chaining 142,012 ok / 346 ko, formula exact on 100%
  (max gap 1.7·10⁻⁵); fees 125 bp (0.25% protocol + 1% platform) on most, 575 / 375 / 100 bp elsewhere.
  **The quote asset is per pool** (read on the PoolState account, byte 237, for the 1,967 pools born since the start of
  collection): **only 15%
  in SOL**; the rest in tokenized stocks, SHIB, community tokens. Some base tokens are Token-2022 **with a transfer
  fee** (1% seen): a tax invisible in the events. The event does **not carry the buyer**: identities
  read from receipts (signer of each transaction).
- **Execution costs MEASURED from receipts** (300 third-party transactions at the recipe's timing, 11:00-12:00 UTC): median base fee +
  priority **30,000 lamports**; Jito tip in 14% of transactions; median fee + tip
  **56,926** (buys) / **42,045** (sells) lamports → **~0.0001 SOL per round trip** (≈ $0.012), i.e. 1% at
  0.01 SOL. Third parties pay ON TOP ~1% platform fee (trading bots) and a token account rent
  (~0.0015-0.002 SOL, recoverable): their true P&L is worse than the one, already negative, measured below.

## Results — 04/10 23:00 → 05/10 18:00 UTC (19 h), split by date at 08:22 UTC

Tools: `labo/solana-courbes.mjs` (curves, crowd, third parties, replay, punisher, hour by hour), `labo/solana-recus.mjs`
(costs and identities from receipts), `labo/solana-sous-pop.mjs` (walk-forward sub-populations). Target stake 0.01 SOL,
execution cost 0.000099 SOL per round trip (measured above), SOL at $120.

| family | tokens/h | playable/h (E=20 s) | second buyer (strict; strict and ≥ 0.01 SOL) | crowd entering 20-60 s, non-graduated tokens (strict / marked-to-value / median) | third parties at timing, best cell | replay, best cell (robust net at 0.01 SOL) and walk-forward | insider sell ≤ 3 s after a small buy (control) |
|---|---|---|---|---|---|---|---|
| **pump.fun / SOL** | **1,417** | **682** | **51.1%** (42.1%; 39.1%) | −15.0% / −10.9% / −15.3% (94,618 pos.) | E=10 s, H=120 s: n=10,765, mean **−2.2%** [CI95 −3.2; −1.1], robust **−11.4%**, median **−8.0%** | E=60, H=60: **−7.0%** (mean −4.2%, med. −3.5%); 1st half −7.0% → **2nd −7.0%** (n=7,272) | creator 3.7% (0.8%: **×4.6**); + creation slot 13.6% (2.2%: **×6.3**) |
| pump.fun / SOL "mayhem" | 347 | 122 | 52.7% (52.6%; 41.2%) | −16.4% / −11.8% / −20.6% | E=45 s, H=240 s: n=157, robust **−15.2%**, median **−4.8%** | **INVALID** (the agent moves the virtual reserves) | 4.3% (2.2%: ×2.0) |
| pump.fun / other quote assets | 162 | 44 | **29.5%** (24.7%; 19.5%) | +0.3% / +3.2% / −12.1% (4,832 pos.) | not measured (stake outside SOL) | E=45, H=60: marginal **−6.1%** (med. −2.6%); −5.2% → **−6.6%** | 2.4% (1.2%: ×2.0); + slot 10.1% (2.0%: **×5.0**) |
| LaunchLab / SOL ¹ | 14.1 | **5.7** | 57.1% (42.9%) | −57.9% strict, median −87.8% (364 pos.) | E=10 s, H=60 s: n=162, mean −0.8%, robust **−10.5%**, median **−8.7%** (no cell with n ≥ 30 positive) | E=60, H=60: **−12.3%** (med. −4.4%); −9.0% → **−13.6%** (n=88) | + slot 0: 5.4% (3.0%: ×1.8) |
| LaunchLab / other quote assets ¹ | 77.4 | 43 | 92.5% (71.3%) (draw of 80 pools) | −34.5% strict, median −23.2% (404 pos.) | E=10 s, H=60 s: n=149, mean +0.1%, robust **−10.1%**, median **−11.4%**; all cells negative in robust and median | E=60, H=60: marginal **−7.0%** (med. −2.5%); −6.8% → **−7.5%** (n=548) | + slot 0: **19.7%** (1.9%: **×10.4**) |

¹ LaunchLab: identities read from receipts (signer of each of the **12,126 transactions** of the first 700 seconds of the
224 pools quoted in SOL and of a draw of 80 others, births from 04/10 23:00 to 05/10 16:45; 0 failed reads).
P&L in quote-asset units; a position still open at 700 s counts in the strict sense (remainder = 0), which weighs down the
late ages. The LaunchLab replay covers the 19 h and the pools born at 17:00 (quote assets read after the fact).

**pump.fun / SOL in detail** (the only family that has throughput and a market):
- **The flow after entry does not exist for the median token.** In the replay, the net flow of third parties between t+E and
  t+E+H is positive for only 15 to 24% of playable tokens; its median is zero or negative and its mean negative
  in the 25 cells (−0.26 to −1.17 SOL). The replay at the marginal price has a median of **−2.5% = exactly the
  fees**: the median token no longer moves between t+E and t+E+H. All 25 cells (E, H) are negative, in simple mean as in robust; at 0.1 SOL
  (negligible fixed cost) the best robust is still −6.1%. With no fees at all, the robust marginal would remain
  ≈ −3.5%: it is not pump.fun's fee schedule that closes the door, it is the absence of buyers after us.
- **The crowd loses at every age except the very first**: entry 0-5 s ≈ at equilibrium (−0.7% strict, +4.4% marked-to-value,
  32.7% winners), then −14.6%, −15.0%, −15.5%, −17.8% (strict, non-graduated tokens). The graduated tokens
  (591 in 19 h, 2.2%) are the lottery that keeps the crowd going: +176% marked-to-value for their buyers in the first 5
  seconds, but their sells after graduation (PumpSwap) are invisible here.
- **The third parties who make our move lose**: 25 cells out of 25 negative in robust and median; the best
  simple mean (−2.2%, CI95 [−3.2; −1.1]) is significantly negative; without the dust (stakes ≥ 0.005 SOL): robust
  −11.2%, median −7.9%. And this BEFORE their transaction and platform fees.
- **The creator's hand loses too** on the curve (−23.9% strict on 17,841 tokens; its sells after graduation are
  invisible): on the pump.fun curve, it is the fees (2.5% per round trip) that take the money.
- **Insider sell after a buy**: the creator sells within the 3 s following a small outside buy 4.6 times more
  often than the control (same tokens, same age, no buy); with the creation-slot buyers, 6.3 times. A
  second control matched on ACTIVITY (instants following a third-party sell) brings the excess down to ×2.1 and ×2.4: most of it
  is selling WITHIN the flow rather than a targeted retaliation — but for a buyer it is the same thing: 13.6% of
  small buys are followed by an insider sell in under 3 s. The rule written in advance (control with no buy) fails.
- **Outside the rule, the "sniper" entry** (t+2 s, t+5 s, on tokens already having 2 third-party buyers): marginal
  mean −5.3 to −8.6%, robust −12.6 to −20.6%. No refuge earlier either.
- **Throughput and second buyer, for their part, pass by a wide margin**: 1,417 tokens/h, 657 to 719 playable/h, second buyer
  51.1% (39.1% even when counting only buys ≥ 0.01 SOL outside the creation slot). Solana has a market; that market
  does not pay late entry.

**Hour-by-hour stability** (births, pump.fun/SOL): all **19 hours** are negative — replay E=60/H=60 robust
−6.0 to −7.9%, mean −3.0 to −5.6%, median −3.5% EVERY hour; E=20/H=180 robust −11.0 to −15.6%. A trap seen along
the way: at 10:00 and 11:00 UTC, **52% of creations have no trade at all** (bursts of empty creations) and the second
buyer falls to 28.5%; a 2 h trial window placed there concluded "second buyer 27.5%, fails" — the
19 h window says 51%.

**Sub-populations, walk-forward** (`solana-sous-pop.mjs`, rule chosen on the 1st half, judged on the 2nd):
- pump.fun/SOL: **44 filters × 25 cells = 1,100 rules** (third-party buyers, net flow before E, price momentum, distance from
  the peak, creator sells and buy, buys at the creation slot, serial creator, address suffix, URI host,
  silence, hour, three combinations). **0 rules out of 1,055** (n ≥ 30) is positive in robust on the 1st half;
  **0** would meet the criterion on the 2nd even if chosen after the fact. The rule chosen ("price < ×1.1 since
  birth": the token where nothing happens, which loses "only" the fees) makes **−3.9%** on the 2nd half.
  Linear model (ridge, 26 features): top decile out of sample **−6.3 to −9.7%**. In simple mean (right tail
  included), 14 rules out of 1,045 are positive on the 1st half — all "URI at pump.mypinata.cloud",
  n ≈ 112 — and **none** on the 2nd (−9 to −19%).
- pump.fun/other quote assets: 0 rules hold; ridge +4 to +18% in sample → **−8 to −16%** out of sample.
- Sixth confirmation of [[pons-carnet-lisible-deja-dans-le-prix]]: what can be read at entry sorts nothing.

**The earlier closure is confirmed and widened**: the single measurement from the INVENTAIRE ("drift −7.2% between t+20 and
t+240 s, plus 2.47% fees") is found again (marginal replay E=20, H=240: mean −6.2% fees included, CI95
[−6.9; −5.4], robust −13.5%, median −5.4%), and it now holds at all timings, on third parties read from
receipts, walk-forward, hour by hour, and in all the sub-populations tried.

**LaunchLab in detail**: the place is small and worse than pump.fun. Quoted in SOL, 14 tokens/h of which **5.7
playable/h**; the REAL second buyer (signers read from receipts) passes (57.1%, strict 42.9%) but the crowd there loses
heavily (−52 to −58% strict between 5 and 60 s) and so do the third parties in all the cells where n ≥ 30. Quoted outside SOL
(tokenized stocks, SHIB, community tokens), the flow exists (92.5% second buyer in the draw) but
**the insider sells within the 3 s following 19.7% of outside buys, against 1.9% for the control: ×10.4, a punisher**
— family closed on that ground.

## Verdict (05/10/2026, 19:20 UTC) — by the rule written at 17:53

| family | 1 throughput | 2 second buyer | 3 third parties from receipts | 4 walk-forward replay | 5 punisher | verdict |
|---|---|---|---|---|---|---|
| **pump.fun / SOL** | ✓ 682/h | ✓ 51.1% (strict 42.1%) | **✗** robust −11.4%, median −8.0% (best cell) | **✗** −7.0% → −7.0% | **✗** ×4.6 (creator), ×6.3 (+ slot 0) | **DEAD** |
| pump.fun / SOL "mayhem" | ✓ 122/h | ✓ 52.7% | **✗** 25 cells out of 25 negative | not measurable (invalid formula) | ✓ ×2.0 | **DEAD** |
| pump.fun / other quote assets | ✓ 44/h | **✗** 29.5% (strict 24.7%) | not measured | **✗** −5.2% → −6.6% | **✗** ×5.0 (+ slot 0) | **DEAD** |
| LaunchLab / SOL | **✗** 5.7/h | ✓ 57.1% (strict 42.9%) | **✗** robust −10.5%, median −8.7% (n=162) | **✗** −9.0% → −13.6% | ✓ ×1.8 | **DEAD** |
| LaunchLab / other quote assets | ✓ 43/h | ✓ 92.5% (draw) | **✗** all cells negative (robust, median) | **✗** −6.8% → −7.5% | **✗ ×10.4** | **DEAD** (punisher) |

- **pump.fun is DEAD for our recipe**, and for the right reason: neither throughput (1,417 tokens/h) nor the second
  buyer (51%) is missing — it is the **flow after entry** that is missing. The median token no longer moves between t+E and
  t+E+H; the 2.5% curve fees do the rest; insiders sell into the buys. The crowd loses ~15% from
  5 s of age onward and only the tokens that will graduate (2.2%) pay it — a lottery, not a flow one can surf.
- **Nothing is ON HOLD.** Reopening indicator (to be re-measured with `solana-courbes.mjs`, same thresholds): on ≥ 6 h
  of data, marginal replay E=60/H=60 with median > 0 AND third-party net flow after entry positive for > 50% of
  playable tokens (today: median −2.5% = the fees, positive flow 15-24%). A change in the fee schedule would not be enough:
  with no fees at all, the robust marginal would remain ≈ −3.5%.
- **Execution**: not applicable. For the record, what it would cost: base fee + priority + tip ≈ 50,000 lamports
  per transaction (third-party median), ≈ 0.0001 SOL per round trip; a token account to create at purchase
  (~0.0015-0.002 SOL, returned at closing); version 1 transactions.

## What Solana taught the tool

- **The 2026 slot lasts 0.2676 s**, not 0.4 s ([[une-fenetre-en-blocs-nest-pas-portable]], again).
- **Version 1 transactions**: `getTransaction` without `maxSupportedTransactionVersion: 1` answers with an error that my
  first script read as "not found" (5 transactions out of 13). One more false "absent".
- **`api.mainnet-beta` throttles `getTransaction`** ("Too many requests for a specific RPC call", < 0.5 sustained reads/s);
  `solana-rpc.publicnode.com` serves 3.5 reads/s. The collector does not depend on it (canary via getSignaturesForAddress).
- **No order within the slot, no index within the transaction**: the order is rebuilt by chaining the reserves.
- **Bundles**: transactions with 12 signers sell for 6 accounts; without linking the co-signers, a single actor
  passes for a crowd.
- **Dust**: bots buy 0.0001 SOL ("bump"); the strict second buyer goes from 42.1% to 39.1% when counting only buys ≥ 0.01 SOL. It
  holds, but dust must always be counted separately.
- **Bursts of empty creations** (10:00-11:00 UTC: 52% of tokens with no trade): a short window can make the second
  buyer fail wrongly. Always read the second buyer hour by hour.
- **pump.fun is no longer a single family**: "mayhem" mode (a fee-free agent that moves the virtual reserves: the
  constant-product formula is WRONG there), non-SOL quote assets (PUMP, USDC, tokenized stocks). **Neither is LaunchLab**: 85%
  of pools quoted outside SOL, Token-2022 tokens with transfer fees invisible in the events.

## Bugs and traps found in the existing tools (not modified)

- **`labo/courbes.mjs` (EVM)** — punisher test: the control counts the instants of ALL tokens of the family, including
  those that never had a trade, instead of the same tokens as the buys treated; it is biased toward 0 and
  inflates the ratio. No effect on the BSC verdict (0.0% against 0.0%), but wrong elsewhere. Suggested fix: control
  restricted to tokens that received at least one small outside buy, plus a control matched on activity (instants that
  follow a third-party sell) — this is what `solana-courbes.mjs` does.
- **`labo/nonevm/solana-evenements.mjs`** — `pumpCreate` writes `qm = "11111111111111111111111111111111"` (the default key,
  which means SOL at pump.fun) on ALL SOL-quoted creations, because the test compares only against the WSOL mint: a naive reader
  would take every token for "quoted outside SOL". To be fixed by treating the null key as SOL.
- **Solana collector**: the `api.mainnet-beta` source reconnects about once a minute ("disconnections" = 1 per
  minute); the second source covers, and the canary confirms it (100%). To be watched if one of the two sources goes down.
- **My own tool, caught before use**: the confidence interval by resampling used a floating-point linear congruential
  generator that lost its low bits and looped in fewer than 20,000 draws; the displayed mean fell
  outside its own CI. Replaced by mulberry32, validated on a known answer (mean 0.5 → CI [0.487; 0.514]).

## Files

- Tools: `labo/solana-courbes.mjs`, `labo/solana-recus.mjs`, `labo/solana-sous-pop.mjs` (new; no existing
  `labo/*.mjs` file modified).
- Data: [removed for publication: personal local path] (rsync mirror of [removed for publication: storage server path], 482 MB: 21 h
  collected, 19 h analyzed). Intermediate outputs (JSON of results, per-token features, receipts) in the session's working
  directory, not versioned.
