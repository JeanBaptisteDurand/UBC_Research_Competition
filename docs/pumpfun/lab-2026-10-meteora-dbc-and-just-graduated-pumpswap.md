> *Working document from the author's lab. Written in French on 07/10/2026 and 08/10/2026, before the paper; translated to English with an AI assistant for publication; every number is as in the original; numbers converted to US notation, dates DD/MM. Removed for publication: nothing, except that third-party addresses (pools, programs, authorities, deployers, token mints, config and fee-claimer accounts) and third-party transaction signatures are shortened to their first 6 characters followed by "…". No full-length program IDs are printed.*

# Solana — Meteora DBC and "just graduated" PumpSwap: would a small stake pay there?

> Question: would our recipe (buy ~$0.10 of a new token between t+25 and t+45 s, resell at t+240 s; on Arc, median gain
> +92% per trade because buyers ARRIVE AFTER us) pay on two Solana launch markets that the lab has never measured:
> **(A) the Meteora DBC curves** (Dynamic Bonding Curve, ~$20.6M/day on the
> curve on 04/10, about ten front ends: Bags, Jupiter Studio, Moonshot…) and **(B) PumpSwap pools less than
> 40 minutes old**, i.e. the pump.fun tokens that have just GRADUATED (an "after graduation" recipe,
> distinct from ours). READ-ONLY: no key, no wallet, no transaction. Written as the work went on,
> one section per step, each with its `date -u` time. Code: `labo/solana-dbc/`; heavy data in the
> session's working directory ([removed for publication: local path]), not versioned.

**Verdict (08/10/2026, 14:49 UTC, detail in § 4)** — over 12.2 h covered, two halves: **just-graduated PumpSwap RED**
(third parties entering at t0+5…45 s: median −20.5% at night, +1.7% by day; −26% / −4% net at $1); **Meteora DBC RED**
(−23% / −7%; punisher ×14 / ×8 carried by the co-signed front end `ANppuX…`, −45% / −21%); DBC outside the co-signed front end:
+7.9% / +6.9% median, below the +20% bar (the only positive signal, to be confirmed over 24 h with a rule written in advance
before any money). Costs: DBC ~0.6% round trip at $1; PumpSwap 2.2% pool + 0.1 to 5.7% network at $1.
**Viable stake: none.**

## 0. Decision rule — written on 07/10/2026 at 22:15 UTC, BEFORE any measurement

Read before writing (and not redone): `solana.md` (pump.fun and LaunchLab DEAD on 05/10: third parties at the timing lose
−8% in median), `paysage-launchpads-2026-10.md` § 4 and § 8.2-8.3, the rule of `lanceurs-non-evm.md` (07/10), whose
form this one reuses so that the verdicts remain comparable. Only "measurement" looked at before writing: the
number of PumpSwap pool creations in the 05/10 cache (39 to 89 per hour), to know whether (B) has throughput.

**Units judged.**
- (A) *family* = Meteora DBC pools × quote asset (native SOL/WSOL; USDC; the rest — memes, stocks — set aside and
  COUNTED). Sub-families = **front ends** (Bags, Jupiter Studio, Moonshot…), identified by the pool's DBC configuration
  (`config` account, its `fee_claimer` / partner), judged with the same rule when n allows, otherwise "insufficient n".
- (B) *family* = PumpSwap pools created by a **pump.fun migration** (graduation), quoted in WSOL. PumpSwap pools
  created by hand and non-SOL quote assets are set aside and COUNTED.

**Window**: ≥ 12 h continuous, coverage stated and verified, split into two halves BY DATE at the middle of the window;
a token belongs to the half of its birth (A) or of its graduation (B); 10 min lookback after the last
birth retained.

**Definitions**
- *t0*: (A) the slot of the transaction that creates the DBC pool; (B) the slot of the migration (graduation) transaction
  that creates the PumpSwap pool. Age = (slot − slot0) × MEASURED slot duration (0.2676 s on 05/10, to be re-measured).
- *Actor*: the signer; the co-signers of one same transaction are linked (union-find, ≤ 50 linked accounts) and
  treated as ONE hand (lesson of the 12-signer transactions in `solana.md`). The fee payer counts.
- *Creator*: (A) the signer of the pool creation and its cluster; (B) the token's `coin_creator` and its cluster, and
  the pump.fun migration crank. *Strict reading*: additionally excluded are any account that buys AT the slot of t0
  (bundled buys presumed to be the creator's, or block bots) and dust buys < 0.001 SOL (≈ $0.2). If the
  broad and strict readings fall on either side of a threshold, **the strict one decides**.
- *Playable*: (A) born in the window, quoted in SOL (or USDC for its family), **still on its curve at t+25 s** (no
  end of curve or migration before), and at least one third-party buy (strict reading) before t+25 s; (B) graduated in the
  window, quoted in WSOL, liquidity still in place at t0+5 s (a PumpSwap pool coming from pump.fun has its LP tokens burned at
  migration: to VERIFY, not to assume; any liquidity withdrawal on a young pool is counted). Tokens already
  dead at entry are excluded and counted separately ([[un-rejeu-doit-exclure-les-pools-deja-morts]]).
- *Second buyer*: (A) share of pools born (family quote asset) bought by **≥ 2 distinct third-party actors within
  60 s**; (B) share of graduated pools that receive **at least one buy from a third-party actor within 60 s** after t0 (the
  owner's proposal) — and, shown alongside, at least one third-party buy AFTER our entry (t0+5…45 s → t0+60 s),
  because it is that flow that pays.
- *Recipe timing*, fixed here and not touched afterwards: (A) FIRST buy of the token by the actor at **t+15…45 s**
  (the window of the 07/10 rule; t+25…45 s shown alongside); (B) first buy on the pool at **t0+5…45 s** (covers
  the entry at +10 s measured on Pons, [[pons-entree-10-secondes]], and the Arc window); sub-windows shown for
  description only, never to choose.
- *Third parties at the timing* (decisive): positions of third-party actors who entered at the timing above with a stake ≤ $20, who sell
  between t+60 and t+480 s (B: t0+60…t0+480 s). Realized P&L = proceeds of sells made before t+480 s − total cost of the
  buys (curve/pool fees included, read in the event, verified from receipts on a sample). The **unsold remainder**
  at t+480 s is valued by an EXACT sell on the curve / pool at t+480 s (fees included) — a curve token or a token with burned-LP pool
  remains sellable, to be verified — AND, in strict reading, counted **zero**; if the two readings fall on either side of a
  threshold, the strict one decides. Also shown: (i) positions fully closed between t+60 and t+480 s;
  (ii) all entrants at the timing, sellers or not. For (B), an actor who already held the token (bought on the curve)
  cannot sell more than what he bought on the pool: his sells are counted pro rata, capped at the quantity bought.
- *Net of real fees*: P&L % − (execution cost of a round trip at stake S) / S. Cost = base fee (5,000
  lamports per signature, 2 transactions) + priority fee and/or Jito tip **typical for entering in 1-2 slots, MEASURED from
  receipts** on third parties doing our move + platform fee if there is one outside the curve; the token account
  rent is tied-up capital, returned at closing (verified, not assumed). Computed at **$0.10, $1, $2 and $10**;
  the color is read **at $1**, the figure at $0.10 is always given; the *viable stake* is the smallest of the four at
  which the P&L thresholds hold.

**Color of a family**
- **GREEN** if, on EACH of the two halves: (1) ≥ 30 playable tokens/h; (2) second buyer (strict) ≥ 30%;
  (3) third parties at the timing: n ≥ 30, realized P&L **median > +20%** and **mean > +10%**, net at $1; (4) no punisher:
  the share of creator sells (broad reading, then creator + buyers of the t0 slot) within the 3 s following a
  small outside buy (≤ $20) does not exceed 3× the matched control (same tokens, same age, instants with no outside
  buy); (5) no hidden tax: cost of a round trip (curve/pool fees + network) < 10% at $1, and nothing in
  the token (Token-2022 transfer fee, transfer hook, freeze authority) that prevents or taxes resale.
- **ORANGE** if the P&L conditions (3) hold on only ONE half (2, 4, 5 holding), OR if everything holds on both
  halves except throughput, which is between 10 and 30 playable/h.
- **RED** otherwise.
- **INCONCLUSIVE** (≠ red) if the reading is not valid — canary failing, positive control not found, coverage
  < 95% — or if throughput and second buyer pass but n < 30 third-party positions at the timing in a half: we lengthen
  the window instead of concluding.
- Announced $/day (green or orange family) = playable/h × 24 × capturable share (hold 240 s, 3 slots) × stake ×
  net median P&L, **divided by 3** ([[juger-une-chaine-le-second-acheteur]]), at the viable stake and at $1.

**Validity of the reading (before any figure)**: (a) positive control — find by hand, from receipts, 3 known
transactions per family (a creation, a buy, a sell) and their amounts, to the lamport; (b) canary before any zero —
the same query without a filter on the same window must return data; (c) coverage — transactions received /
transactions expected (getSignaturesForAddress on a sample of pools), and gaps stated.

**Measurements shown in addition, not entering the color**: crowd P&L by entry age; third-party net flow after
our entry (share of tokens where it is positive, [[pons-flux-apres-entree-est-le-revenu]]); replay of the recipe on the
real price path (entry t+30 s / t0+10 s, exit +240 s, our impact and exact fees) — a replay is a
FLOOR and serves only for sign and comparison ([[arc-un-rejeu-est-un-plancher-pas-une-estimation]]).

**Adjustments to the rule proposed by the owner, and why** (all made before measuring):
1. *Form of the 07/10 rule reused* (strict reading, playable = alive at t+25 s, INCONCLUSIVE distinct from
   RED, throughput 10-30/h → ORANGE, punisher and hidden tax eliminatory): same reasons as on 07/10, and so that the
   colors of all the lab's families can be compared.
2. *Color read at $1, four stakes computed*: on Solana, a transaction that must land in 1-2 slots costs
   on the order of 10⁻⁴ SOL (measured on pump.fun on 05/10) — i.e. ~10% of a $0.10 stake ROUND TRIP, before any curve
   fee. The owner's question ("at what stake does the recipe become possible again?") requires the table.
3. *Unsold remainder valued AND counted zero*: on a curve (A) or a burned-LP pool (B), nobody can withdraw the
   liquidity; counting zero for a token still sellable would be wrong in the other direction. The strict one decides when they
   diverge, as elsewhere.
4. *Timing of (B) widened to t0+5…45 s*: a single test, written in advance, that covers both known points (+10 s measured
   on Pons, +25…45 s on Arc), rather than two tests of which we would keep the best.
5. *Third-party stake ≤ $20* (and not ≤ 0.1 SOL): the owner's target tolerates up to $20 per trade.

## 0 bis. Collection — launched on 07/10/2026 at 22:36 UTC (planned end ≥ 08/10 11:00 UTC)

`labo/solana-dbc/collecteur.mjs`, ONE process for all RPC hosts, in the background, to
[removed for publication: local path]. Reconnaissance done before (probes of 1 to 5 min, 7-minute pilot discarded afterwards):

- **DBC**: ≈ 10-15 successful transactions/s on the program, ≈ 60 KB/s of logs; in the logs, only instruction NAMES
  (`Swap2`, `Swap2WithTransferHook`, `InitializeVirtualPoolWithToken2022`, `MigrationDammV2`…), no amount.
  ≈ 3 to 10 pool creations per minute. Plan retained: subscription to the whole program (every creation is seen there), reading
  of the creation from receipts, then **harvest at t0+620 s** via `getSignaturesForAddress(pool)` (the canonical index, no WebSocket
  gap) and `getTransaction` of each successful transaction of the first 600 seconds.
- **PumpSwap**: graduation is a **permissionless** `MigrateV2` instruction (several bots launch it at the same
  time; only one creates the pool); it always mentions the authority `39azUY…` → subscription to that address
  (+ polling every 30 s, catch-up and canary). Each new WSOL-quoted pool is followed for 50 min by `logsSubscribe` (two
  sources until t0+12 min, a single one afterwards: a hot pool outputs more than 100 trades/min, ~1 MB/s per source at peak).
  The first minute is completed from receipts at t0+75 s. Canaries at t0+9 min and t0+30 min (last 1,000 signatures of the pool).
- **Hosts** (read-only, no paid key): WebSocket api.mainnet-beta + rpc.solanatracker.io/public; HTTP publicnode
  (3/s), solanavibestation (1.6/s), solanatracker (1.5/s), leorpc "FREE" (1.6/s), api.mainnet-beta (0.3/s), with
  exponential backoff on 429 (seen at 2-2.5/s on three hosts during the pilot, hence these rates). History depth of
  `getTransaction` measured: ≥ 8 h on publicnode and solanavibestation, 2.2-4.5 h on the other two — a late harvest
  therefore remains possible several hours afterwards.
- **PumpSwap formula verified on 13,134 trades of the pilot**: constant product on the reserves BEFORE the trade, with an
  effective quote Q = WSOL reserve + **virtual reserve** (≈ 17.6 SOL per pool since 15/07); exact sell on
  6,562/6,562; buy to within a few ppm. Fee schedule read in the events: LP 0.20% + protocol 0.05% + creator
  0.75-0.95% per side (≈ 1.0-1.2% per side) on most pools; a second schedule 0.02 + 0.93 + 0.30% (1.25%).

## 2 a. PumpSwap positive control, from receipts — 07/10/2026, 22:40 UTC

Four known transactions of the pool `7WnYD8…` (token `GhYhCb…`, graduated at slot
454,358,543), re-read via `getTransaction` and compared by hand with the events decoded from the logs:

| transaction | decoded event | what the chain moved | verdict |
|---|---|---|---|
| migration `5Q9seA…` (slot 454,358,543) | CreatePool: 206,900,000,000,000 tokens, 84,990,359,061 lamports | pool token vault +206,900,000,000,000; WSOL: pool vault +67,405,853,772 **and** account `BkHuTj…` +17,584,505,289 — sum 84,990,359,061 | exact |
| buy `5c9WeL…` (`buy_exact_quote_in`, 0.05 SOL) | base 32,287,544,101; q 50,000,000; q_lp 49,530,400; creator 444,884; protocol 24,716 | buyer +32,287,544,101 tokens; pool vault +49,530,400; creator +444,884; protocol 12,358 + 12,358 | exact |
| buy `26tESa…` (`buy`, fixed output) | base 450,203,855,929; q_user 700,331,265; q_lp 693,753,758; creator 6,231,322; protocol 346,185 | buyer +450,203,855,929 tokens; vault +693,753,758; creator +6,231,322; protocol 173,093 + 173,092 | exact |
| sell `4QKqSt…` (2.35 SOL) | base 1,168,530,183,053; q_user 2,352,616,226; q_nolp 2,375,226,095; creator 21,419,875 | seller −1,168,530,183,053 tokens, WSOL +2,352,616,226; vault −2,375,226,095; creator +21,419,875 | exact |

What the control teaches, beyond the validity of the decoder:
- **the "virtual reserve" is not in the pool**: at migration, 17.58 SOL of the 84.99 go to a separate account
  (`BkHuTj…`) but remain counted in the price (Q = vault + 17.58 SOL). The REAL liquidity of a just-graduated pool is
  therefore ~67 SOL; no effect at our stakes.
- **the buyer's outlay is not the same field depending on the instruction**: `buy_exact_quote_in` → `quote_amount_in` (all
  inclusive), `buy` → `user_quote_amount_in` (all inclusive). The analysis takes the larger of the two (verified: exact relations
  on 9,949 buys of the pilot).
- on the wallet side, the buyer ALSO pays network fees, the rent of his accounts (returned at closing) and, when
  he goes through a trading bot, ~1% platform fee (sell above: −24.7M lamports of native SOL on top of the
  WSOL received) — costs specific to THESE actors; ours are counted separately (§ 1).
- in the slot following graduation, a sell of **174M tokens (17% of supply) for 125.7 SOL** (`5YdRVj…`): holders
  of the curve sell as soon as the pool opens. This is what the punisher test measures.

## 2 b. DBC positive control, from receipts — 07/10/2026, 22:55 UTC

Pool `B156QX…` (config `HKu5TW…`, Token-2022 token `5DTTus…` with a transfer
hook), three transactions re-read via `getTransaction` and compared by hand with the events decoded from the inner
instructions (self-CPI, tag `e445a52e51cb9a1d`):

| transaction | decoded event | what the chain moved | verdict |
|---|---|---|---|
| creation `4Fk369…` (slot 454,358,440) | EvtInitializePool: pool `B156QX…`, config `HKu5TW…`, creator `Eb6AzY…`, token `5DTTus…` (signer), type Token-2022 | pool token vault +1,000,000,000,000,000 (the whole supply); pool account created | exact |
| buy `3XYSrn…` (+36 slots) | in 25,000,000 = net 24,750,000 + fee 200,000 + protocol 50,000 (1.00%); out 1,192,588,560,506 | buyer +1,192,588,560,506 tokens; WSOL vault +25,000,000; buyer −26,619,240 lamports = 25,000,000 + 80,000 network fees + 1,539,240 deposit (account created by the hook, returned at the sell) | exact |
| sell `2zkCr5…` (+37 slots) | in 5,813,674,773,303; out 119,551,279; fee 966,072 + 241,517 (1.00%) | seller −5,813,674,773,303 tokens; +121,010,519 lamports = 119,551,279 − 80,000 fees + 1,539,240 deposit returned | exact |

Over all the receipts of the first harvest (175 single-actor trades): token change = event amount on
**175/175**; `in − in_net = fee + protocol + referral` on 61/61 buys; on the SOL side, the remaining gap
is exactly the deposit of 1,539,240 lamports (paid at the buy, returned at the sell).

What the control teaches:
- **on this front end, EVERY trade is co-signed by the platform** (`ANppuX…`, also the config's `fee_claimer`; seen
  on the trades of 97 distinct payers). Two consequences: (1) linking co-signers into one hand would melt
  all its clients into a single actor — the analysis therefore excludes from the links any key that co-signs for ≥ 5 payers ("service key"); (2) **a bot that calls the program directly cannot trade these pools** without the
  platform's signature: they are playable only through its interface.
- a pool can be created AND migrated in the same slot (`BmMkjQ…`: the curve is filled from creation) — counted separately
  ("end of curve before t+25 s"), never playable.

## 1. Real costs of a round trip on Solana — first reading on 07/10/2026 at 23:00 UTC (updated in § 4)

What is certain from now on (read from the chain, not assumed):
- **base fee**: 5,000 lamports per signature; our transaction has only one → 10,000 lamports round trip
  ($0.0012 at SOL at $116, Binance price recorded by the collector).
- **rents** (`getMinimumBalanceForRentExemption`, 07/10 22:52): SPL token account 1,488,440 lamports, Token-2022 token
  account 1,513,840 — the rent has dropped 27% since the 05/10 measurement (2,039,280). It is tied-up CAPITAL
  ($0.17-0.18 per open position), returned at account closing; seen to the lamport in the controls (§ 2a, 2b).
- **priority fees needed**: `getRecentPrioritizationFees` on three young pools, last 150 slots: the minimum
  inclusion price is **zero in 71 to 99% of slots**; at the 90th percentile of the hottest pool, 0.82 lamport per compute
  unit, i.e. ~0.0001 SOL for a ~120,000 CU transaction. Entering in 1-2 slots therefore costs almost nothing in
  calm times, and ~0.0001 SOL at peak.
- **what third parties doing our move pay** (first PumpSwap receipts, 108 buys and 39 sells drawn in the
  first minutes of graduated pools): fee + tip per transaction, buy at t0+5…45 s: p25 5,000, **median
  9,000**, p75 107,000, p90 1,055,000 lamports; sell: median 30,000, p75 138,000. Jito tip: 6 buys out of 108.
- **pool fees** (read in each event): just-graduated PumpSwap ≈ 1.0-1.25% per side (LP 0.20 + protocol 0.05 +
  creator 0.75-0.95%) → **~2.0-2.5% round trip**; DBC: from 0.25% to 3% per side depending on the partner's config
  (`cliff_fee_numerator` read on 14 configs: 0.25%, 1%, 2%, 3%), with no scheduled decay on those.
- **platform fees**: zero if the program is called directly; third parties going through a trading bot
  pay ~1% more (seen from receipts). **Exception**: the DBC transfer-hook front end whose every trade is co-signed
  by the platform is not accessible by direct call (§ 2b).

Network cost of a round trip (third-party median / p75 "enter fast"), at SOL at $116:

| stake | median (~39,000 lamports) | p75 (~245,000 lamports) | + PumpSwap pool fees (~2.2%) |
|---|---|---|---|
| $0.10 | 4.5% | 28% | 6.7% / 30% |
| $1 | 0.45% | 2.8% | 2.7% / 5.0% |
| $2 | 0.23% | 1.4% | 2.4% / 3.6% |
| $10 | 0.05% | 0.28% | 2.2% / 2.5% |

First conclusion on costs: **at $0.10, the recipe survives only if we accept entering without priority** (≈ 5%
network fees, plus pool fees); at the price of a fast entry, ~$1 is needed for the network to weigh less than 3%.
On Solana, the useful stake therefore starts around **$1-2**, and it is the POOL fees (2-6% round trip) that dominate
after that, not the network. Figures redone on the full window in § 4.

## 0 ter. What was actually collected — established on 08/10/2026 at 10:58 UTC

The collector did NOT die with the session: launched detached at 22:48 UTC (PID [n], parent 1), it was still running at
10:47. But two failures, both silent, made it partial:

1. **HTTP scheduler blocked from 23:27 to 10:52 UTC (684 minutes without a single request)**, without a single error in the log.
   Cause, found in the code: a `getTransaction` returned "null" by all FIVE hosts (transaction seen "confirmed"
   then dropped) had no eligible host left; put back at the head of the queue, it blocked all the others. The
   priority queue swelled to 2,380 tasks. Consequence: from 23:25, **no** DBC creation read from receipts,
   no DBC harvest, no first-minute completion or PumpSwap canary. Fixed (a host that is merely busy lets the next task
   through; no eligibility → abandonment counted) and relaunched at 10:55 UTC.
2. **Both WebSockets cut from 06:45 to 10:17 UTC** (201 + 10 minutes, `wsEtat` at 0 on both sources, resumed
   by itself at 10:17; coverage gap of 3 min at 10:05) — network failure of the Mac, not of the hosts (both went down
   together and came back together).

**What is usable**:

| stream | range covered | gaps | state |
|---|---|---|---|
| PumpSwap, trades via WebSocket (decoded logs) | 07/10 22:48 → 08/10 06:45, then 10:17 → ongoing | 06:45-10:17; restarts at 10:53 and 10:55 (~1 min, pools resumed) | 2,058,364 event lines, 432 pools; 330 MB compressed |
| PumpSwap, first minute from receipts | 22:48 → 23:25 (46 pools) | everything else | **historical catch-up in progress** (353 pools: `getSignaturesForAddress` bounded to [migration, anchor t0+90 s] then reading from receipts what the WebSocket did not deliver) |
| DBC, creations (instruction names via WebSocket) | same ranges as PumpSwap | same gaps | 2,591 creations seen; 215 read from receipts before the blockage |
| DBC, harvest of the first 600 seconds | 22:48 → 23:25 only | everything else | **historical catch-up in progress**: reading from receipts the 2,324 remaining creations, then harvest of one pool in 12 (sampled by address hash) with `getSignaturesForAddress(pool, before = a DBC transaction ~10 min later, until = the creation)` — foreign bound accepted by the node, verified |

The public nodes keep history long enough for this catch-up: publicnode and solanavibestation serve a
12 h-old transaction (verified at 10:52), solanatracker and leorpc less than 4.5 h (they refuse old bounds:
"Transaction … not found", "Internal JSON-RPC error" → set aside for these reads).

**Canaries available before the failure**: DBC stream (whole program) 828/828, 923/923, 745/745 = **100%**; PumpSwap
(window t0+90 s → t0+9 min, 36 pools) **16,302 / 16,844 = 96.8%** — the misses concentrate around the reconnections
of one source (the second source, solanatracker, delivers ~25% fewer messages than api.mainnet-beta and does not always
cover). First minute: 56,446 / 62,532 (90.3%) received by WebSocket, **the rest read from receipts** — hence the importance
of the catch-up. A retroactive canary (one pool in 8, the whole window t0+90 s → t0+12 min, against the index of signatures
received) runs with the catch-up.

**Window retained (deviation from the rule, declared)**: the rule asked for "≥ 12 h continuous". The Mac's network failure cuts the
coverage into two segments: S1 = 07/10 22:48 → 08/10 06:45 (8 h) and S2 = 08/10 10:17 → 14:15 (≥ 4 h, ongoing).
The 12 h are reached in covered hours, not continuously; the halves are split by date at the middle of the covered hours
(≈ 04:45). No window choice is made in view of the results; S1 alone is shown alongside. If a family
came out GREEN, it would be declared INCONCLUSIVE until a continuous 12 h window had confirmed it.

## 2 c. Decoding from receipts, generalized — 08/10/2026, 11:07 UTC

The by-hand control (§ 2a, 2b) covers only 7 transactions; `labo/solana-dbc/verifier.mjs` redoes the same comparison
on ALL collected receipts (every transaction with a single trade and a single human signer):

| family | check | n | exact to the lamport/unit |
|---|---|---|---|
| DBC / SOL | buy: signer's token Δ = event `out` | 2,658 | 2,654 (99.8%) |
| DBC / SOL | sell: token Δ = −`in` | 3,008 | 3,008 |
| DBC / SOL | buy: SOL+WSOL Δ + network fees = −`in` | 2,658 | 1,551 exact; the rest = rent of a created account (1,539,240 or 2,039,280) |
| DBC / SOL | sell: SOL+WSOL Δ + network fees = `out` | 3,008 | 2,480 exact; the rest = deposit returned (1,539,240) |
| PumpSwap | buy (`buy_exact_quote_in`): token Δ = `base` | 313 | 313 |
| PumpSwap | sell: token Δ = −`base` | 202 | 202 |
| PumpSwap | sell: SOL+WSOL Δ + fees = `user_quote_amount_out` | 202 | 110 exact; the rest = bots' platform fees and rents |

**Error caught by this check, before any DBC figure**: on DBC pools WITHOUT a transfer hook, each trade
emits TWO events, `EvtSwap` (old form) AND `EvtSwap2` — seen on 3,397 transactions out of 3,397. The first
tally therefore counted every buy and every sell twice (and came out at "−59%" at the timing). Fixed: only
`EvtSwap2` is kept when present. The hook front end emits only `EvtSwap2WithTransferHook`.

Other facts established from receipts:
- **DBC fees taken sometimes in the quote asset, sometimes in TOKENS**: depending on the config (`collect_fee_mode`), the buy pays its fees
  on the input (SOL) or on the output (tokens). Identified by `in − in_net = fee`; the rate is computed in the right unit.
- **service key**: a single co-signer is seen with ≥ 5 distinct payers, `ANppuX…` (252 payers) — the transfer-hook
  front end (config `HKu5TW…`, 17% of the catch-up's DBC pools). Never linked to actors.
- **PumpSwap co-signers**: 26 transactions out of 1,113 receipts sampled (2.3%) have several signers: the event's `user` field
  suffices as identity; no co-signing service.
- **slot duration**: 0.2685 s (timestamp/slot regression on 300,000 PumpSwap trades), 0.2679 s (DBC receipts) — the
  05/10 measurement (0.2676 s) holds.
- **order within the slot**: 2,131,616 PumpSwap trades out of 2,153,707 chain exactly (reserves after = reserves before
  of the next), 99.0%; the rest opens a slot with no predecessor received.

## 2 d. Two checks of the analysis tool itself — 08/10/2026, 11:14 UTC

- **P&L engine, known answer**: on the PumpSwap pool `DTW4c6…` (graduated on 07/10 at 23:19), an
  independent recomputation in Python, from the raw events alone, of the third-party positions entered at t0+5…45 s and selling between
  t0+60 and t0+480 s gives **n = 95, median −73.344%, mean −66.211%**; `analyse-ps.mjs` restricted to this pool returns
  **exactly** the same figures.
- **PumpSwap hidden taxes**: 6 graduated tokens drawn at random (one of them "mayhem") — no freeze authority, no mint
  authority, no transfer-fee extension or hook (Token-2022 with metadata only, or SPL).
  0 liquidity withdrawals on the pools followed (the LP tokens are burned at migration: `Burn` instruction seen in the
  migration transaction).
- **Measurement trap caught**: the first retroactive canary compared all the successful signatures of the pool to those that
  carried a decoded trade; it announced 2.7% coverage on one pool. Re-read from receipts, a sample of the "missing" ones from
  the first minute contains **49 trades out of 630 transactions (7.8%)**: the others mention the pool without trading on it
  (bots that probe, abandoned routes — successful but empty). The coverage that matters, that of TRADES, is measured
  by `canari-ps.mjs` (sample re-read from receipts), § 3.

## 3. Measurements — PROVISIONAL (08/10/2026, 11:24 UTC; historical catch-up in progress — SUPERSEDED by § 4, kept for the record)

Outputs: `analyse-ps.mjs`, `analyse-dbc.mjs`, color applied mechanically by `verdict.mjs`. SOL price: $115.9
(Binance, median of the collector's readings). Here on what has already been re-read from receipts: 68 decisive PumpSwap pools (first
minute completed, window t0 → t0+480 s covered), 24 DBC/SOL pools sampled and harvested in full.

**(B) Just-graduated PumpSwap, WSOL-quoted** — 44.5 graduations/h covered; 100% of pools receive a third-party buy within
60 s (median 40 distinct buyers); no liquidity withdrawal; **no punisher** (creator sell ≤ 3 s after a
small buy: 0.28% against 0.78% for the same-age control, ×0.36; with the graduation-slot buyers ×1.14).
Third parties entered at t0+5…45 s, stake ≤ $20 (median $6.8), sellers between t0+60 and t0+480 s: **n = 1,233, median −16.2%,
mean −12.2% [CI95 −15.4; −9.1], 39.5% winners** (strict reading −18.7% / −14.4%); closed positions −12.0%;
all entries −18.4%. Every sub-window is negative: 5-15 s −14.8%, 15-25 s −16.2%, 25-45 s −18.2%. The crowd
loses at ALL entry ages (from −2.5% to −15.9% in median, 30 to 45% winners). Excluding "mayhem": −16.8%.
Floor replay (buy t0+10 s, sell +240 s, on the real reserves): median +0.2%, mean −15% — the median pool does not
move, the left tail is heavy. Net of our costs at $1: median −20.4%.

**(A) DBC, SOL-quoted** — ~303 creations/h on the program (instruction names from the WebSocket), 93% in SOL, ~180 playable/h;
strict second buyer 58-75%. Third parties entered at t+15…45 s, sellers between t+60 and t+480 s: n = 189 (half 1), **median
−32.9%, mean −27.6%** (strict −43.0% / −35.0%). **Punisher** on the co-signed front end `ANppuX…`: the creator sells
within the 3 s following 16.3% of small outside buys, against 0.22% at same-age instants with no buy (×74) — but
18.9% at instants following an outside sell (×0.86): he sells IN the flow, not as a targeted retaliation; the written rule
(same-age control) classifies it as a punisher.

These provisional figures already point in the same direction as pump.fun and LaunchLab on 05/10; the verdict is pronounced
only in § 4, on the full window and both halves.

## 5. What this file taught the tool — 08/10/2026, 11:32 UTC

- **A scheduler must never put back at the head of the queue a task that no host can serve**: a single
  `getTransaction` "not found" everywhere (transaction seen "confirmed" then dropped) blocked ALL reads
  for 11 h, without a single error — the requests-per-minute counter was the only signal (at 0 for 684 minutes).
  Same family as [[un-zero-confiant-se-verifie-par-un-canari]]: a living process is not a process that works.
- **DBC emits each trade TWICE** (EvtSwap + EvtSwap2) on pools without a hook: without deduplication, everything counts
  double. Caught by the to-the-lamport comparison with balances, not by the plausibility of the result.
- **`getSignaturesForAddress` accepts a foreign `before` bound** (a transaction that does not mention the address): this is
  what makes the historical reading of an old pool bounded to its window. Nodes with short history refuse old bounds
  with misleading messages ("Transaction … not found", "Internal JSON-RPC error").
- **A canary must count TRADES, not transactions**: on PumpSwap, 92% of the successful transactions that mention
  a young pool do not trade on it (bots that probe); counting them as "lost" fabricated a coverage of 2.7%.
- **PumpSwap's "virtual reserve" (≈ 17.6 SOL) is deposited in a separate account** at migration and counted in the
  price; the real liquidity of a just-graduated pool is ~67 SOL.
- **`MigrateV2` is permissionless**: 2 to 4 bots launch it for each graduation, only one creates the pool (the others
  succeed empty).
- **A DBC front end has every trade co-signed by the platform** (`ANppuX…`, transfer-hook tokens): its pools
  can be traded only through its interface.
- **The rent of a token account has dropped**: 1,488,440 lamports (SPL) / 1,513,840 (Token-2022) on 08/10, against 2,039,280
  measured on 05/10.

**Coverage of PumpSwap TRADES, segment S1 (corrected canary, 08/10 11:33 UTC)**: 15 pools sampled (one in eight,
spread over S1), all the successful transactions between their anchors t0+90 s and t0+12 min, and a sample of 40 "missing" ones
per pool re-read from receipts. On the 14 pools followed from graduation: 19,245 trades received, ~64 estimated lost —
**coverage ≈ 99.7%** (the 15th, graduated one minute before the collector started and caught up by polling, is covered
only at 78%: excluded from any decisive measurement by the minute-by-minute coverage rule).

## 1 bis. Real costs of a round trip — final figures, 08/10/2026, 12:17 UTC

`labo/solana-dbc/couts.mjs`, on the window's receipts (SOL at $115.74, median of the collector's Binance readings):

| what third parties doing our move pay (network fees + tip, per transaction) | p25 | **median** | p75 | p90 | Jito tip |
|---|---|---|---|---|---|
| DBC, buy at t+15…45 s (n = 2,806) | 5,514 | **5,514** | 15,161 | 80,000 | 0.4% of buys |
| DBC, sell at t+60…480 s (n = 3,911) | 5,410 | **6,213** | 13,111 | 80,000 | — |
| PumpSwap, buy at t0+3…60 s (n = 846) | 8,001 | **107,000** | 405,000 | 405,000 | 9.3% of buys |
| PumpSwap, sell at t0+3…600 s (n = 432) | 17,000 | **305,000** | 405,000 | 405,000 | — |

(in lamports; a buy transaction consumes ~64,000 CU on DBC, ~116,000 CU on PumpSwap). The MINIMUM inclusion price
read via `getRecentPrioritizationFees` on young pools (last 150 slots) is **zero in 30 to 100% of slots**;
p75 to p90 of the hottest pool: 100,000 to 667,000 micro-lamports/CU, i.e. ~12,000 to 80,000 lamports for a buy. PumpSwap's
third parties therefore pay for the race, not for inclusion.

| cost of a round trip, in % of the stake | $0.10 | $1 | $2 | $10 |
|---|---|---|---|---|
| minimal network (2 × 5,000 lamports) | 1.2% | 0.12% | 0.06% | 0.01% |
| network at the DBC third-party median (11,727 lamports) | 1.4% | 0.14% | 0.07% | 0.01% |
| network at the PumpSwap third-party median (412,000 lamports) | **48%** | 4.8% | 2.4% | 0.5% |
| network at the PumpSwap p75, "enter fast" (810,000 lamports) | **94%** | 9.4% | 4.7% | 0.9% |
| + DBC pool fees (0.25% per side in median, 1% at p90; up to ~50% in the first 15 seconds on a few configs with declining fees) | +0.5% | +0.5% | +0.5% | +0.5% |
| + PumpSwap pool fees (1.10% per side in median: LP 0.20 + protocol 0.05 + creator 0.85) | +2.2% | +2.2% | +2.2% | +2.2% |
| token account rent (tied-up capital, returned at closing) | $0.17-0.18 | same | same | same |

**At what stake does the recipe become possible again on the COSTS side?** On DBC, from $0.10 (~2% round trip, pool fees
included) — the DBC crowd does not buy priority. On PumpSwap, at $0.10 only by giving up the race (base fees:
1.2% + 2.2% pool); to enter at the third parties' pace, **≥ $2** is needed (≤ 5% round trip) and ~$10 for
the network to become negligible. These costs are NOT what closes the two families (§ 4): the third parties' P&L, before
our costs, is already under the thresholds.

**Coverage of PumpSwap trades, segment S2 (corrected canary, 08/10 12:35 UTC)**: 8 pools sampled between 10:17 and
12:15; 25,715 trades received, ~820 estimated lost (96.9%). The losses ALL come from the two pools graduated at 10:48
and 10:50, whose window overlaps the collector's restarts (10:53, 10:55) — excluded from decisive measurements by the
minute-by-minute coverage rule; the other six are covered at **100%**. Catch-up finished: PumpSwap at 12:27
(122 pools, one in three of S1), DBC at 12:41 (555 creations: one pool in 24 harvested, one in 4 read for the map of
front ends); additional DBC harvest launched at 12:42 (`recolte-sup.mjs`, 73 pools sampled by hash in the second
half of the window, through the collector's proxy).

## 4. Final measurements and verdict — 08/10/2026, 14:48 UTC

**Window**: 07/10 22:48 → 08/10 14:45 UTC, **12.22 h covered** (S1 22:48 → 06:45 continuous, S2 10:17 → 14:45;
gap from 06:45 to 10:17, Mac network failure; restart minutes removed). Halves split by date at the middle of the covered
hours: **04:55 UTC**. Collection stopped cleanly at 14:46. SOL at $115.29 (Binance median). Analyses
rerun under the 08/10 memory constraint (`--max-old-space-size=1500`, streaming reads, a single heavy process):
`final.sh` → `analyse-ps.mjs`, `analyse-dbc.mjs`, `couts.mjs`, `verdict.mjs` (rule applied mechanically). Valid reading:
controls to the lamport (§ 2a-2c), P&L engine recomputed by hand (§ 2d), trade canaries 99.7% (S1) and 100% (S2 outside
restarts), DBC stream canary 100%.

### (B) Just-graduated PumpSwap, WSOL-quoted → **RED**

565 WSOL-quoted graduations seen (44 other quote assets set aside), 319 decisive pools (first minute completed from receipts,
window t0 → t0+480 s covered; 211 outside the catch-up sample, 35 poorly covered), 3.12M trades.

| criterion | half 1 (22:48 → 04:55) | half 2 (04:55 → 14:45) |
|---|---|---|
| (1) playable/h | 50.8 ✓ | 36.0 ✓ |
| (2) at least one third-party buyer within 60 s | 100% ✓ (median 25 buyers) | 100% ✓ (98% still AFTER our entry) |
| (3) third parties entered at t0+5…45 s, ≤ $20 (median $5.8), sellers at t0+60…480 s | n = 2,178: **median −20.5%, mean −20.3%** [CI95 −22.5; −18.0], 37% winners; net at $1: −26.2% | n = 2,119: **median +1.7%, mean −3.9%** [−6.1; −1.9], 53% winners; net at $1: −4.0% |
| … strict reading (remainder = 0) | −23.7% / −22.9% | −2.8% / −10.5% |
| (4) punisher (creator; + graduation-slot buyers), same-age control | ×0.76; ×1.42 ✓ | ×0.48; ×1.25 ✓ |
| (5) round trip at $1 (pool 2.2% + third-party median network) | 7.9% ✓ | 7.9% ✓ |

- **On S1 alone (8 h continuous, halves at 02:47)**: −15.9% then −21.6% median → RED too.
- No entry sub-window passes: 5-15 s −14.2% / +7.1%; 15-25 s −19.5% / −1.3%; 25-45 s −23.7% / +0.7%.
- **Per pool** (each pool weighs one): median of medians +0.1% / +3.8%; 52-58% of pools with positive median, 13-16%
  above +20%. **Per hour**: at night (22:00-04:00 UTC) from −44% to 0%, six hours out of seven below −13%; by day
  (05:00-14:00) from −12% to +14%.
- **Crowd**: loses or breaks even at all entry ages (medians −14% to +1.5%; 30 to 53% winners).
- Floor replay (buy t0+10 s, sell +240 s): median +0.5%, mean −14.5%. Third-party net flow positive for 63% of
  pools (graduation-slot buyers excluded from this flow) — it is not enough to lift the median price.
- Excluding "mayhem" (243 pools): median −7.6% over the whole window. No liquidity withdrawal. No transfer tax.
- **Probable reading, not measured here**: graduation opens the exit to the curve holders (whose buys on the curve
  are not collected); the entry at +10 s that paid on Pons (before 10/09) does not pay here.

### (A) Meteora DBC → **RED** (family, and every front end that can be judged)

3,607 creations seen via WebSocket (291.7/h), 1,901 read from receipts (sample), 92.7% SOL-quoted; 216 SOL pools harvested IN
FULL and drawn at random (address hash 1/12, creation-signature hash 1/24, and 73 from the additional
harvest), 33,881 transactions re-read from receipts.

| criterion | DBC/SOL half 1 | DBC/SOL half 2 |
|---|---|---|
| (1) playable/h | 154 ✓ | 123 ✓ |
| (2) strict second buyer ≤ 60 s | 50.0% ✓ | 48.3% ✓ |
| (3) third parties entered at t+15…45 s, ≤ $20 (median $1.2-1.6), sellers at t+60…480 s | n = 323: **median −23.3%, mean −23.2%** [−27.0; −19.2] | n = 188: **median −6.7%, mean −8.0%** [−11.9; −3.7] |
| (4) punisher, same-age control (creator; + slot 0) | **×13.9**; ×3.4 ✗ (activity control ×1.2) | **×8.0**; ×3.6 ✗ (×0.65) |
| (5) round trip at $1 (pool 0.5% + network 0.14%) | 0.6% ✓ | 0.6% ✓ |

By front end (share of SOL creations read, playable/h, and what decides):

| front end | share | playable/h | third parties at the timing (n, median) | color |
|---|---|---|---|---|
| **co-signed `ANppuX…`** (transfer-hook tokens, every trade co-signed by the platform) | 16% | 47 | n = 311: **−44.8% / −21.1%**; punisher ×18.8 / ×8.0 | **RED** (and not tradable by direct call) |
| bags.fun (multiple `fee_claimer` configs, "…BAGS" tokens) | 8% | 4.5 | 0 positions: second buyer 8-15% | RED (no crowd) |
| generic "met-dbc" partners (~80 configs, each ≤ 6%) | 76% | ≤ 15 each | n ≤ 27 per partner | insufficient n one by one → see below |
| USDC; other quote assets | 1.3%; 6.0% | 7; 0-14 | n ≤ 11 | RED (throughput) |

**DBC/SOL OUTSIDE the co-signed front end** (grouping decided AFTER seeing the co-signing mechanism, not the P&Ls — to be treated
as a hypothesis) → **RED by the rule**, but it is the only positive signal in the file:
- playable/h 111 / 88 ✓; second buyer 44% / 41% ✓; punisher ×0.9 / ×9.7 (absolute rates 0.05% and 0.19%; activity
  control ×0.98);
- third parties at the timing (median stake $12, n = 121 / 79): **median +7.9% / +6.9%, mean +12.1% / +14.3%**, 78% / 87% winners
  — **below the +20% median threshold** on both halves; strict reading −3.2% / −4.7%; fully
  closed positions +0.4% / +1.4%;
- per pool: 82% / 100% of pools with positive median, median of medians +7.1% / +7.8%; replay at our size (entry
  t+30 s, exit +240 s, marginal price, observed fees): median +7.4% / +9.6%, mean +11.3% / +6.1%;
- crowd entering at 15-45 s: +4% median, 80% winners; at 5-15 s: −36% (anti-sniper fees [sic: "frais anti-tireurs"] of some configs).
- **Order of magnitude, IF this +7% held** (it is not established): 3 slots × 240 s ≈ 45 round trips/h out of ~99 playable/h;
  at $1: 45 × 24 × 7.2% ≈ $78/day gross, **~$26/day after ÷3**; at $0.10: ~$2/day after ÷3. That is ~13 times less
  per trade than the Arc recipe (+92%), and the strict reading as well as the closed positions say ~0.

### Costs and viable stake
See § 1 bis, redone over the whole window at 14:47: network 1.2% (base fee) to 57% (PumpSwap third-party median,
494,000 lamports the round trip) of a $0.10 stake, 0.1-5.7% at $1, 0.01-0.6% at $10; pool 0.5% (DBC) and 2.2% (PumpSwap) round trip. **Viable stake: none** — no family
is green or orange; costs are not what closes (DBC is playable from $0.10 on the cost side, PumpSwap from $2).

### Recommendation
1. **Just-graduated PumpSwap: close.** Night loses −20% in median, day breaks even; no entry timing saves it.
   Reopening indicator (same tool, ≥ 12 h): median of third parties entered at t0+5…45 s > +5% on BOTH halves.
2. **Meteora DBC: close the family; never touch the co-signed front end `ANppuX…`** (creator who sells in the flow
   ×19, −45%, and operator protection). For the rest (partners without co-signing), the +7% / 80% winners signal
   does not pass the written bar; if it interests the owner, the only clean next step is a **continuous 24 h window,
   rule written in advance** on this subset (co-signed front end excluded by mechanism), bar to be decided BEFORE
   (keep +20%, or lower it to ~+5% net since the costs there are 0.6% at $1) — no money before.

**Costs over the whole window (14:47 UTC, `couts.mjs`)** — update of § 1 bis: DBC, third-party buy at t+15…45 s
median 5,514 lamports (n = 4,413), sell 6,213 (n = 5,854), Jito 0.5%; PumpSwap, buy median 105,001 (n = 1,950), sell
389,001 (n = 1,004), Jito 10%; round trip at the PumpSwap third-party median **494,000 lamports = $0.057 → 57% of a $0.10
stake, 5.7% at $1, 2.9% at $2, 0.6% at $10** (at the p75 "enter fast": 93% / 9.3% / 4.7% / 0.9%); base fees
alone: 1.2% / 0.12% / 0.06% / 0.01%. PumpSwap fee schedule per side over 3,293 trades: median 1.10% (p25 1.05%, p75 1.20%).

## 6. Files — 08/10/2026, 14:49 UTC

- Code (new files, `labo/solana-dbc/`): `collecteur.mjs` (collection + historical catch-up + local RPC proxy),
  `decodeurs.mjs`, `sonde.mjs`, `examiner.mjs`, `verifier.mjs`, `index-ps.mjs`, `canari-ps.mjs`, `frais-recents.mjs`,
  `facades.mjs`, `compter-dbc.mjs`, `recolte-sup.mjs`, `analyse-ps.mjs`, `analyse-dbc.mjs`, `punisseur.mjs`, `couts.mjs`,
  `verdict.mjs`, `final.sh`.
- Data (not versioned, 453 MB compressed): [removed for publication: local path]; final outputs:
  [removed for publication: local path] (`ps-final.json`, `dbc-final.json`, `couts-final.txt`, `verdict-final.txt`).
  Regenerable intermediates deleted (pilot, first run, signature index).
