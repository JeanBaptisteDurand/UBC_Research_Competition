> *Working document from the author's lab. Written in French on 11 October 2026, before the paper; translated to English with an AI assistant for publication; every number is as in the original. Removed for publication: nothing.*
>
> *Numbers converted to US notation for publication (decimal point, comma as thousands separator, "$" before the amount); dates in the text are DD/MM as in the original; "h" = hours, "s" = seconds, "o" = bytes (octets).*

# Arc: adaptive exit per factory — rule and criterion written BEFORE the measurement

Written on Sun Oct 11 11:11:03 UTC 2026 (`date -u`), before any calculation of the rule below. Read-only; no modification of the bot.

## The rule evaluated (a single one, fixed now)
For each position, at the moment of OUR buy (instant T):
- factory = the nonce of the pool's creator, read on the chain (creation tx) — "nonce 10" or "nonce 115-119";
- we look at the pools of the SAME factory born between T − 3 h and T − 400 s (their fate at 400 s is thus known at instant T,
  no look into the future) and keep the 20 most recent; if there are fewer than 10, "normal" regime;
- if more than 40 % of these pools died (first liquidity withdrawal) before 246 s of age — the age of our
  usual sale —, "episode" regime: sell 75 s after our buy; otherwise sell at 225 s as today.
Values set in advance: N = 20, threshold 40 %, episode exit 75 s (middle of the 45-90 s plateau seen on 11/10; 07/10 was
never looked at with this split). Known reference points: normal days 14-16 % (factory nonce 10) and 4-6 % (nonce 119) of pools
dead before our sale; episode of 11/10 60-66 %.

## Evaluation
Replay of the bot's REAL positions (`labo/arc-familles/sortie-positions.mjs`, convention "same block = sale won",
validated by the control to ±1 % on 08-10/10) over three windows: normal days (pools born from 08/10 to 10/10 18 h),
episode of 11/10 (0 h → 10 h, which served to choose 75 s: INSIDE the sample), episode of 07/10 (0 h → 14 h, OUTSIDE the
sample; before 10 h 40 the real bot did not yet have the reactive exit, the replay simulates it everywhere).

## Recommendation criterion to the owner
Recommend the rule only if, all at once:
1. normal days: cost against "always 225 s" ≥ −$1/day on EACH of the days 08, 09 and 10/10;
2. episode of 07/10 (outside the sample): gain > 0 over the window, and > 0 over the episode hours (3 h → 9 h);
3. episode of 11/10: gain > 0.
Otherwise: recommend waiting. In all cases, this is a modification of the Arc bot: the owner's decision.

## Result (measured after the rule, on 11/10 around 11 h 15 UTC)

Controls (replay at 225 s against the real, same positions, convention "same block = sale won"): 07/10 +2.5 % (n 155),
08/10 −0.1 %, 09/10 +0.4 %, 10/10 −0.1 % / −0.3 %, 11/10 −3.6 %. The replay is reliable on the three windows.

| period | positions | in "episode" | always 225 s | rule | gain |
|---|---|---|---|---|---|
| 07/10 (outside the sample, 06 h 40 → 14 h only) | 155 | 30 % | +$20.16 | +$19.96 | −$0.20 |
| 08/10 | 503 | 8 % | +$67.12 | +$66.53 | −$0.59 |
| 09/10 | 500 | 4 % | +$68.84 | +$68.07 | −$0.78 |
| 10/10 | 493 | 10 % | +$65.70 | +$64.21 | **−$1.49** |
| 11/10 (episode, 0 h → 10 h) | 229 | 90 % | +$12.94 | +$13.94 | +$1.00 (factory nonce 10 alone: +$5.17) |

**Verdict: the rule FAILS the criterion written in advance** (criterion 1: −$1.49 on 10/10 < −$1; criterion 2: −$0.20 on
07/10, and this test is incomplete — before 06 h 40 the bot's journal did not record the buy and sell blocks, so the core of
the 07/10 episode, 3 h → 6 h, cannot be replayed). Recommendation: wait; do not modify the bot.

Why it fails: its detector counts as "dead before our sale" the pools killed within the first 3-7 seconds
(crossing of the $0.06 threshold by the micro-shooters [sic: "micro-tireurs"]), where we never enter. During the episode of 11/10, half of the
pools of the factory nonce 115-119 died this way: the rule wrongly switched this healthy factory (≈ −$4), and it also triggers
false alarms on normal days. **NEW hypothesis, to be tested on the NEXT episode (not on this data):**
detect the episode on our own positions (loss rate per factory over 3 h, like the hourly watch of §438), which
see only pools alive at our entry. Even if perfect, a switch recovers only about +$5 per 10 h of episode,
whereas the episode costs about $1.5/h: it limits the damage, it does not cancel it.
