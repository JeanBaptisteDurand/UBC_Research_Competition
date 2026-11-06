> *Working document from the author's lab. Written in French between 2026-10-10 and 2026-10-11, before the paper; translated to English with an AI assistant for publication; every number is as in the original. Removed for publication: one passage on an unrelated project.*

# Method audit — "why only Arc?" (10-11/10/2026)

The owner's question: "It's crazy that the only place in the whole blockchain where we take money is Arc.
There is a problem in our methodology, isn't there?"

How the audit was done:
- **Inventory**: 177 verdicts of the registry, 188 method errors drawn from memory, and Arc taken as the positive
  control. Notes `audit-2026-10-10/a1`, `a2`, `a3`.
- **Three hypotheses** tested: criterion and power (`b1`), late arrival (`b2`), errors hidden in the REDs
  (`b3`).
- **Counter-expertise**: a devil's advocate (`c1`) and a fact-checker (`c2`). These two agents were cut off
  by the session limit; I finished the job myself. I recomputed RAFALE and the Sharpe on the 6,713 round trips of the Arc
  journal, re-read the radar's state of 10/10 at 22:00 UTC, and checked 12 claims in the files.
- Read-only from end to end: no key, no transaction, nothing touched on the bots.

## 1. The answer in 10 lines

1. **Yes, there are real method flaws.** But they explain only a small part of the "only Arc".
2. **First, the rarity of Arc is largely real.** 129 verdicts out of 177 are market facts: it loses,
   nothing is born, it is already taken, or the signal died out. They are decided on criteria that Arc passes by a wide margin
   : throughput, second buyer, sign of the replay.
3. **The criterion is extreme**: 2-3 % of capital PER DAY, with bounded loss. Only throughput niches of
   tiny capacity can meet it. Any visible gain there is auctioned away within a few days. At that rate, finding
   only ONE niche is the most probable outcome — and this one is twice the target.
4. **First flaw: our decision rules were never tried on the only known answer, Arc.**
   - The RAFALE 4/6 stop guard would have cut it off 73 times in 13 days, from its 19th trade.
   - The rules written for BSC, Solana, Ethereum, the non-EVM chains, DBC and X Layer eliminate on the crowd and the
     punisher, two tests that come out failed on Arc.
5. **Second flaw: a false negative costs nothing visible, so nobody looks for it.** No RED has been
   systematically re-judged. The re-judging decided on 30/09 left no trace. The false negatives of October were
   found by you or by chance.
6. **Third flaw: we judge launchers late**, around D+30-38, often after their peak. The measured cost remains low
   ($1-4/day): where we arrived early (Pons, Robinhood, Base, BSC), we did not win more.
7. **A few verdicts have weak evidence or a wrong rationale** (6 out of 43 reports reopened). None hides a large
   gain.
8. **The counter-expertise knocks down several seductive "false negatives"**:
   - BSC: 76 % of small buys there are hit, against 5 % on Arc;
   - Robinhood 1526o: 5 reactive drains on OUR buy out of 6 losses;
   - Arc's early arm: already judged non-complementary at §427;
   - adding up the small leads: $6-9/day realistic, not 16.
9. **The leads that open up are few and small.** What the audit really brings back is a method that
   would not kill the NEXT Arc; it does not resurrect a gold mine.
10. **Bottom line: the method protects well against false hopes, badly against false negatives.** Fixing it costs almost
    nothing.

## 2. The real problems, ranked by impact

### P1 — The RAFALE 4/6 guard would kill any new Arc on its first day (STRONG confidence)
- **The fact.** Replayed on Arc's real journal (6,713 round trips from 28/09 to 10/10), the guard "4 total losses out of the
  last 6 round trips → stop" triggers **73 times in 13 days**, on 10 different days.
  - The first stop falls at the **19th round trip of the first day** (28/09 at 05:14 UTC).
  - Independent recomputation done three times (b1, c2, and me): same result.
  - Definition: `arc/bot-reel/moisson-multi.mjs` lines 185-191 and 852-858.
- **The cause is an IMPLEMENTATION flaw, not a flaw of principle.** Your rule of 06/10 says "stop the bot if we get drained
  in a block". The code counts every total loss, including the NORMAL death of a pool when the operator
  withdraws its liquidity at the scheduled time.
  - On Arc: 61 reactive drains (0.9 %) against about 1,150 pool deaths during the hold.
  - Counting only the reactive drains on OUR buy (≤ 3 s), the guard triggers only **4 times**. All 4 times
    fall on 28/09 between 19:18 and 19:50, during a real burst of counter-moves. Afterwards, zero in 12 days (c1
    §1.2).
- **What it costs.** On Arc this cost nothing: the bot there has its own cap. But any family with Arc's economics,
  which loses 7 to 36 % of its stakes per day through normal pool death, would be stopped on the first day. Arc's first 30
  round trips included 12 total losses, none reactive.
- **Fix** (your decision, since it is your rule): make the guard count what the rule names, the reactive
  drains ≤ 3 s after our buy; keep the stop and the human call.

### P2 — No positive control at the level of the DECISION (STRONG confidence; past impact low, future impact high)
- The lab's positive controls validate the TOOL ("does the tool find Arc?"), never the RULE ("would the rule
  accept Arc?").
- Two criteria that several rules treat as eliminatory are failed on Arc:
  - **the crowd**: median −22.4 % on 05/10, −4 to −7 % on 10/10;
  - **the punisher**: ×5.4 to ×7.2, and still ×4.4 at the pass of 10/10 at 22:00.
- The radar was recalibrated on Arc on 05/10: crowd as a share of winners, punisher not eliminatory. By contrast, the
  rules written in the reports keep these criteria as eliminatory:
  - BSC, Solana and Ethereum (05/10);
  - the non-EVM chains (07/10);
  - DBC and X Layer (08/10).
- At X Layer, the Arc control "passes" with 5.1 playable pools/h, whereas the rule requires 10 for GREEN: we validated
  the tool, not the rule (a3, b3).
- The radar's "Arc profile" alert is disabled (`labo/radar.mjs` line 71; the plist does not define it).
- **Past impact low**: most of the deaths are decided on throughput and second buyer, far from the threshold. **Future
  impact high**: a rule that kills Arc will kill the next one.
- **Fix**: run every rule and every guard IN FULL on Arc, journal and radar, before applying them
  elsewhere. A rule that turns Arc RED kills nothing.

### P3 — False negatives have no detector (STRONG confidence)
- 188 method errors recorded: 84 false positives, 60 false negatives (a2).
- **False positives show themselves**: lost money or the controls catch them, 16 out of 34 before money in October.
- **False negatives cost nothing visible.**
  - In October, 1 out of 22 was caught by money; 5 were caught by you, by the user or by chance.
  - They receive fewer systemic fixes: 43 % against 57 %.
- The Arc verdict survived at least four false negatives in September (16, 23, 24 and 25/09), and the Robinhood file was closed twice
  on the wrong family. Both were caught because we came back every day with real money. A
  chain judged in a single pass has no such net.
- **37 REDs out of 91 rest on less than 48 h of data** (61 % of the on-chain REDs), whereas two 6 h windows
  of the same day can differ by a factor of 7.
- The decision of 30/09 to re-judge every family judged negative before that date (replay too pessimistic ×2.2) left
  no trace in the registry.
- **Fix**:
  - re-judge every "single-pass" RED on a fresh window after one month;
  - three-state verdicts (ALIVE / DEAD / INCONCLUSIVE);
  - DEAD only if the upper bound of the interval falls below the useful effect.

### P4 — Gates without power declare "dead" on mere non-significance (MEDIUM confidence)
- The frozen rules of the announcement sales (nos. 12, 14, 15) write DEAD as soon as p ≥ 0.05 at n = 8-10 (f23b line 92).
  - Their power is only **24-27 %** if the effect is half that of the test, which the registry itself recommends
    assuming.
  - A true strategy would be declared dead 3 times out of 4, after 12 to 19 months of waiting.
- On the heavy-tailed arbitrage (1 % of opportunities make ~60 % of the value), a "median ≥ $10/day" gate was
  passed only 3 times out of 100 by a true strategy at +$10/day. This gate has never decided anything: the
  Flare trial did not take place.
- **Fix (free)**: write with each rule P(pass | useful effect) and P(pass | null effect). Below 80 % of
  power, conclude "inconclusive".
- **Conversely, the P&L gates are NOT too weak.** Arc passes them in one day: Sharpe 0.91 per round trip, 26
  positive half-days out of 26 (recomputed).

### P5 — The radar turns the unreadable into RED and does not flag its gaps (MEDIUM confidence)
- An unreadable measurement counts there as "missing" (`radar.mjs` lines 24-25).
- On BSC, the buyer-identification budget is at 0: no BSC DEX family can come out GREEN. Arc's
  mold comes out RED there "for lack of a readable crowd"; the radar itself writes "ORANGE if readable".
- **But here the RED is right for another reason**: 116 buys under $1 out of 153 are followed by a withdrawal
  in ≤ 3 s, i.e. 76 %, against 5 % on Arc at the same pass.
- No verdict has been issued for Base since 09/10 at 03:00, because of a collection gap, and no alert went out.
- **Fix**: publish "UNREADABLE" separately; alert if a family or a chain stays unreadable or without data
  for more than 24 h.

### P6 — We judge launchers after their peak (MEDIUM confidence; low cost)
- Median delay between a launcher's birth and our first judgment: D+30 to D+38. At least five REDs are
  findings of death, not measurements of the window: MegaPump, Launchy, Genius.fun, Tsunami, StonkFun.
- Arc is the only chain judged in its first two weeks.
- **But being early was not enough elsewhere**:
  - Pons, at D+10: the recipe loses, and more on peak days;
  - Arc's arbitrage: 178 contracts already there at D+1;
  - Robinhood 2500: the operator's defense switched on at D+4.1;
  - Base and BSC: a punisher from the first look.
- Quantifiable cost of the delay: $1 to 4/day. The only "day 1" deposit that counts is the opening of an Arc-type chain,
  about 0.2 to 0.3 per month [sic] (b2).
- **Fix**: date each verdict by the age of the market, judge bursts over 6 h, and prepare the day-1 kit
  for GIWA.

### P7 — Six verdicts with weak evidence or a wrong rationale (STRONG confidence on the finding, low gain)
- **Robinhood 5274o**: closed on buys of $1-20 (54/54 drained), whereas at our stake the rate was 2.9 %,
  like our family at 2.1 % (`robinhood.md` lines 29-30). The rationale is wrong, but the status remains right: 4/4 of our
  buys were drained at $0.06, and our ceiling would be about $4/day (the sniper occupies the slot).
- **Reversion after a large order**: closed whereas its Sharpe 2 control is found only 0 times out of 20. Rule 5
  of the protocol requires "undetermined" in this case.
- **Arbitrum**: the report says "at the margin" (≈ $124/day at the cap), the registry says "monopoly, Timeboost
  probable". The cause is inferred, not measured.
- **§415**: it justifies Arc's stake cap by "price impact". The Anvil fork contradicts it (round trip at
  −0.50 % from $0.01 to $50). The conclusion remains right through the real trials (0/7 drained at $0.10 against 3/4 at
  $0.20 on 27/09; 7/7 withdrawals between $0.12 and $0.18 in the archive). Only the sentence is wrong.
- **X Layer / Ignix**: curve not decoded, n = 19.
- (Kaia and Injective, flagged by b3, are NOT orphans: the daily watch measures them, at 0 to 0.04 pool/h.)

### P8 — The registry mixes market deaths with stops that are not measurements (STRONG confidence)
- The Robinhood families (closed by your rule of 05/10), the Robinhood liquidations (stopped by the safety
  filter) and the Robinhood arbitrage (judged NO by its own rule before the blocking) all appear as
  "deaths".
- **Fix**: a column that separates the four causes (market, your rule, safety filter, tool), with the
  measured expectation of each. You will thus see the price of each rule.

## 3. What is NOT a problem

- **The P&L gates** see Arc in a single day.
- **129 deaths out of 177 are market facts** decided on criteria that Arc passes by a wide margin:
  - throughput of 0 to 6 playable pools/h, for 10 required (Arc: 18-28);
  - second buyer 0 to 18 %, for 30 % required (Arc: 100 %);
  - replay at −2 to −16 % (Arc: +104 to +109 %).
- **The October tools have canaries and tool controls**: 37 robust on-chain verdicts out of the 43 whose
  report was reopened (b3).
- **The lab's errors lean rather toward OPTIMISM**:
  - arbitrage replays ×3 to ×50 too high;
  - constant-liquidity simulator;
  - [removed for publication: unrelated project];
  - one-sided sale journal.

  The radar's only documented decision error goes toward YES: Robinhood 1526o GREEN, then 5 of our buys drained out of
  11.
- **Competition is measured everywhere**:
  - 93-96 % of arbitrage is taken within the block on Ethereum, BSC and Base;
  - Convex returns 91.8 % of the premium to the block builder;
  - even a $34/day niche attracts 3-4 bots.

  Arc's entire niche is worth about $100-150/day, shared between us (~62), `0xe322…` (~25) and a few others.
- **The null hypothesis, quantified (c1 §2.3).** With L ≈ 0.5-1 niche ≥ $20/day present at a given instant, there is a 37 to
  61 % chance of finding none, and 30 to 37 % of finding exactly one. **Finding one niche that is twice
  the target is a GOOD result.**

## 4. The method fixes, from the cheapest to the most expensive

1. **Decision control (free)**: every rule and every guard is run IN FULL on Arc, journal and radar, before
   use. The existing rules are re-run on Arc and the registry's verdicts that depend on a criterion
   that comes out failed on Arc are annotated.
2. **RAFALE (free, your decision)**: count only the reactive drains ≤ 3 s after OUR buy, as your
   rule says. Stop and human call unchanged.
3. **Three-state verdicts (free)**: ALIVE / DEAD / INCONCLUSIVE, with the power written next to each
   rule. Start with the frozen rules of the announcement sales, before their first verdict.
4. **Registry (free)**:
   - a cause column (market, your rule, safety filter, tool);
   - the age of the market at judgment;
   - the note "inferred cause" when it is not measured;
   - a reopening as soon as a later sheet contradicts a justification (the case of §415).
5. **Radar (light)**:
   - UNREADABLE published separately;
   - alert on a collection gap or an unreadability of more than 24 h;
   - the "Arc profile" alert is your decision: it only notifies.
6. **Dated re-judging (light)**: every RED judged in a single pass is re-judged after one month on a fresh
   window. For the DEX families, the radar already does it every hour. For chains and launchers, the daily watch
   of the 226 networks already re-measures throughput.
7. **Day-1 kit (ready to use)** for GIWA or any chain flagged by the mainnet watch:
   - RPC and chainId verified;
   - code present at the PoolManager `0x8366…`;
   - bot not armed;
   - rule written in advance;
   - micro-budget granted in advance by you.

## 5. The verdicts to reopen (after counter-expertise)

| lead | why reopen it | inexpensive test (rule written in advance) | realistic gain | confidence |
|---|---|---|---|---|
| **Solana DBC outside the facade** | killed by a "third-party median > +20 %" bar that the Arc results miss by 24 to 42 points; throughput 88-111/h, second buyer 41-44 % | 24 h continuous read-only, bar calibrated on Arc (robust replay ≥ +5 % AND median > 0 on both halves, at $0.10; punisher read by path; Arc as control in the same window), then shadow | ~$2/day at $0.10; more only if a larger stake passes, which is not established | low (strict reading −3.2/−4.7 %, re-closed positions ≈ 0) |
| **Robinhood's first weeks** (01/07 → 15/08) | never looked at; it is the direct test of "a new chain is first a market open to all, before being taken by operators" | retrospective replay of 5 days (D+2, 7, 14, 30, 60): distinct creators, replay at $0.10, punisher; read-only | no direct $ (family closed); says what the day-1 kit is worth | low to medium |
| **Arbitrum** | the cause of death (Timeboost) is inferred | 1 day read-only: are the winners at B+1 the public holders of the express lane? If not, 2 days of shadow with Abstract's code | 0 to a few tens of $/day, without capital | low |
| **Reversion after a large order** | closed despite a missed control | redo on ≥ 72 h already collected, no verdict until the control is found at 80 % | probably low | low |
| **Dislocations** | the counter models from $22 to $404/day (05-09/10) without exact re-quoting | on the scheduled date (1 month, around 05/11): re-quote at the exact exchange (`labo/arb/reprix.mjs`) | unknown; probably overestimated (thin pools) | low |
| **Robinhood 5274o** | wrong rationale in the registry | correct the rationale (stake ≠ ours); no money | nil as long as your rule applies | — |

**What is not reopened (the counter-expertise knocked it down):**
- **BSC 1526o**: 76 % of small buys hit (against 5 % on Arc). The only path tolerated there is the
  operator's ramp, which your rule excludes.
- **Robinhood 1526o**: 5 reactive drains on our buy out of 6 losses; the mechanism is measured.
- **Arc's early arm** (entry at t+1 s, $0.04): `0xe322…` does win about +$28/day there (re-measured on
  10/10: +$27.7 and +$29.1 net on 08 and 09/10). But §427 had already shown that it is not complementary to our
  recipe:
  - it is present in 1,502 of our 1,503 pools and keeps its position when we buy;
  - the other early slots earn almost nothing (+$1.33 at 2-5 s, +$0.41 at 5-10 s, −$0.02 at 10-20 s, over
    3 days).
- **Adding up the small leads**: about $6-9/day realistic for 5 to 6 bots to maintain, not 16. The Abstract
  line is declining ($6.71 → $2.33/day).

**An open question that is worth a lot, but where everything says "no" for now**: raising Arc's stake. Revenue
would follow the stake if the wall allowed it. The real trials of 27/09 and the archive say no beyond $0.10-0.12 at
t+21 s.
- The bot contains a paired trial never launched (`BRAS_B`: entry at t+47 s, $0.20, under the $0.25 threshold that
  applies after 45 s).
- But the rare third-party positions entered after 45 s all lost (§427).
- It would be a real trial on Arc: **your decision**, and I do not recommend it as it stands.

## 6. Correction of what I said along the way

I presented Arc's "early arm" as a lead wrongly closed in September, at +$28/day. The historical fact is
true: on 27/09, an entry at t+15 s was tested with a stake too large for that age. But the lead had already been
re-judged on 09/10 (§427): it is non-complementary, and the slot is occupied. I had not re-read it before
announcing it. This is exactly the bias described by the sheet "a measurement without a positive control": getting carried away with what one
hopes to find.

## Appendices

### A. The 177 verdicts by reason (a1, reclassified by b1)

| class | number |
|---|---|
| MARKET fact (measured loss 62, no market 20, incumbents 16, signal died out 16, ≈ $0/day 12, miscellaneous 3) | 129 |
| CRITERION (wins but under the target, capital, account, unbounded loss) | 15 |
| TOOL (safety filter, tool) | 5 |
| DECISION (owner's rule…) | 3 |
| UNKNOWN (insufficient data, never measured) | 23 |
| WINS (Arc's recipe and its reactive exit) | 2 |

Evidence: real money 7 (Arc 4, Robinhood 2, BSC 1), shadow 3, historical test 58, census 41, replay 34,
documentary 16, mixed 14, paper 4.

### B. The death criteria tried on Arc (a3, corrected by c1)

| criterion | Would it have been failed on Arc? |
|---|---|
| throughput of playable pools/h, second buyer, sign of the replay, honeypot, volume | no (passed by a wide margin) |
| crowd entered at our timing (median) | **yes** (−22.4 % on 05/10; −4 to −7 % on 10/10) |
| punisher of third-party buys | **yes** (×4.4 to ×7.2) |
| RAFALE 4/6 guard as coded | **yes** (73 stops) — implementation flaw |
| short real trial (2 to 11 trades) | **yes** in September (13/13 at $2, 6/6 at $1, 3/4 at $0.20) — but at stakes that were too large |
| "a result that would beat the best actor is presumed false" | **yes** (clause of the BSC, Solana, Ethereum rules) |
| measurement unit too broad (chain or launcher instead of the family) | **yes** (16-17/09 and 25/09) |
| replay from before 30/09 (phantom losses) | **yes** (replay ×2.2 too pessimistic) |
| stake wall read in the logs | no (it kills nothing; it gave false green lights) |
