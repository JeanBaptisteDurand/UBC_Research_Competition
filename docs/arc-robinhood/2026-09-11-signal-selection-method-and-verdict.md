> *Working document from the author's lab. Written in French on 11 September 2026, before the paper; translated to English with an AI assistant for publication; every number is as in the original. Removed for publication: nothing.*

# Signal-selection method, and verdict — 11 September 2026

A campaign of 13 agents: 4 web research passes on methodology, 4 local measurements,
4 skeptics, 1 synthesis. This document replaces the previous ones on the subject.

**Short answer**: a path to a *somewhat* better filter exists and has been measured
(+4.4 points of ROI per trade). A path to a *much* better filter does not — not with
the sample size we have.

---

## 1. The hard constraint, finally quantified

We do not have 4,321 observations, and we do not have 28 days either.

Days range from 1 trade to 597, coefficient of variation 1.34. The effective number
of clusters (Carter-Schnepel-Steigerwald) is **G\* = 10.0**, and Kish's effective
sample size gives the same thing: **10.01**. The ten days with more than 100 trades
carry **94%** of the trades.

Direct consequence, and it changes how everything is read: the "+6.22% over 28 days"
is in reality **+6.55% over ten days in September** (4,056 trades) against **+1.40%
over the 17 days in August** (265 trades).

The strongest claim this data supports is not +6.22% but the Ibragimov-Müller test on
the days with ≥ 100 trades: **+5.00 points, t = 3.17 against a Student distribution
with 9 degrees of freedom, p = 0.011**.

---

## 2. A correction to my own rule

I repeated all day: "the effective sample size is the number of days".
**That is true for the interval around a global mean, and destructive for a paired
test.**

| to test a paired within-day contrast | standard error | power at +5 pt |
|---|---:|---:|
| mean of the 28 daily differences, equal weights | 7.00 pt | **9%** |
| inverse-variance weighting | **1.46 pt** | **88%** |

A day with 3 trades should not weigh as much as a day with 597. I applied the right
rule in the wrong place, and that probably buried real signals.

---

## 3. The noise floor of the procedure itself

The most useful number of the campaign. A **randomly drawn** variable, paired by day,
at the same rejection rate, already returns:

- **+1.42 points** at the median, with P(> 0) = 95%
- **+3.30 points** at its 95th percentile, over 2,000 draws

**Any gain below 3.3 points is indistinguishable from the noise of the method.** It is
not zero that has to be beaten, it is 3.3.

And with 24 trials, the expected maximum t under the null hypothesis is 1.98: at a
paired standard error of 1.46 pt, **the search manufactures +2.9 points of apparent ROI
for free on the best variable**, even if none is worth anything.

---

## 4. The decision procedure: A, B and C simultaneously

**A — SIZE.** Paired contrast within each day, inverse-variance weighted. Thresholds:
gain ≥ **+4.0 points** AND **t ≥ 3.1**, against a Student and not a normal (at 500
effective trials, Šidák is 3.71 under the normal but **4.29 at 27 degrees of freedom**
— the 0.58 pt gap exceeds most of our effects).

**B — CONTROL.** Permutation of ROI within each day, on the **studentized** statistic
— under dependence, permuting the raw statistic can get the sign wrong. p ≤ 0.05,
permutation floor (b+1)/(m+1), never 0. And the 3.3-point noise floor has to be
exceeded, not zero.

**C — ROBUSTNESS AND ECONOMICS.** Four conditions: a jackknife removing **two** days
and not one (removing 09-06 and 09-08 drops the double sort from 0.757 to 0.351 pt);
same sign on both sides of 10 September; threshold as a **causal rolling quantile**,
never as a level; and above all the decision criterion is **P&L per day**, not ROI per
trade — at 3 slots and 8.1 s of holding time, capacity is ~1,300 trades per hour for
~13 eligible tokens per hour at the peak: **capital is never the constraint, throughput
is.**

### What we did wrong, and what the literature documents

| error | the number |
|---|---|
| counting in trades | standard error 0.74 pt instead of 1.43 — precision overstated by a factor of ~21 |
| global control instead of paired | 0/20 against p = 0.341 |
| picking the BEST cell | −14.84 pt out of sample, p = 0.99. Rejecting the WORST: +2.16 pt, p = 0.0025 |
| leaving our 484 tokens in the population | gain 10.54 → 7.41 pt, CI [1.6; 18.0] → [−6.1; 15.3] |
| splitting by count instead of by date | thirds −1.52 / −13.56 / −0.10 against −3.05 / −8.70 / −3.34 |
| variable with memory and no settlement delay | reputation updated at launch instead of +83 blocks: 1.70 → 1.62 pt |

### What does NOT apply to us

- **Interactions in the strict sense.** Gelman's rule of 16: we would need
  **160 equivalent days**, i.e. five months. Detection floor ≈ 15 points.
  To be explicitly abandoned. *(This downgrades my own finding from this morning:
  `nbAcheteurs × d19` at 14.3 points is BELOW this floor.)*
- **Gradient boosting, causal forests.** Expected signal 2-6 pt against a standard
  deviation of 48 pt, i.e. R² ≈ 0.5‰. A tree picks its split on 10 effective days:
  this is exactly the failure mode of the rival snipers (1.80 → 0.32 pt when one day
  is removed).
- **SHAP, H-statistic.** The figure will be beautiful, convincing and empty.
- **Conditional mutual information.** Systematic positive bias.
- **Optimized weights between signals.** Local evidence already in hand: daily
  walk-forward +5.72% against +6.28% fixed.

---

## 5. The verdict of the measurements

### Dead

- **19:00 – 23:00 slot**: paired gap **−0.04 pt, p = 0.555, rank 15/24** on the
  decontaminated dense regime.
- **Hourly profile in general**: correlation between the two halves of the calendar
  **r = 0.014**, mixed-hours control r = 0.010.
- **All free social signals**: link to a status (+0.28 pt, t = 0.76),
  no website (+4.03 pt but −66.7% of throughput → P&L 0.0232 Ξ/day), Twitter
  presence, number of channels, handle reuse (non-monotone gradient).
- **Marginal contribution of co-occurrence given reputation**: **+1.08 pt,
  CI [−6.4; 6.2]** — below the noise floor.
- **Depth-2 tree**: +4.04 pt but keeps 53% of trades → 0.125 Ξ/day
  against 0.1476 for the reference. It loses money in absolute terms.

### Alive: a single signal, and only through its LOW end

**The causal reputation of recipients (column `recipient`), used as a REJECTION of the
low quantile.**

- **+4.38 pt, 95% CI [2.3; 6.1]** over the whole period, without our 484 tokens.
  Strictly out of sample and decontaminated: **+6.35 pt**.
- Monotone gradient: out-of-sample quintiles **−11.7 | 2.5 | 0.8 | 4.9 | 20.9%**.
- **Confirmed on real money, which had never happened before**: on 138 real trades,
  the low tercile returns **−20.12% in real terms against −8.65% in simulation**. The
  low end reproduces, and it is *worse* in reality. The "low reputation AND high
  familiarity" cell returns **−24.16%** on 38 real trades.
- **The high end does not reproduce**: high tercile +9.21% real against +28.20%
  simulated.

**So: reject the low end, never select the high end.** This corrects my reading of
yesterday — I had concluded "does not reproduce" on seeing the inverted U, whereas it
is the lower half that reproduces, and that is the exploitable one.

---

## 6. The arithmetic, without complacency

Today: 150 × 0.005 × 6.2% = **0.047 Ξ/day**.

With reputation as a rejection, keeping 56-61% of throughput:

- at the most conservative figure (+4.38 pt): **0.044 Ξ/day**, i.e. **−5%**
- at the decontaminated out-of-sample figure (+6.35 pt): **0.058 Ξ/day**, i.e. **+24%**

**The honest range runs from −5% to +24%, and it contains zero.** Consistent with the
P&Ls measured directly: 0.1476 → 0.1627 Ξ/day for reputation alone,
0.1476 → 0.0929 for reputation AND co-occurrence (−37%).

**No known sort doubles the P&L. None.**

How long to settle it: the detectable effect is 4.4 pt at 10 days,
3.0 pt at 20, 2.4 pt at 30. **Three weeks are enough for a claim at
+5 points; they will never be enough for +2 points.**

---

## 7. The next thing, and only one

**A single rule, pre-registered by a timestamped hash before looking, then measured
only once**: reject the tokens whose recipients' causal reputation is in the low
quantile — threshold as a causal rolling quantile over the 300 strictly earlier
tokens, counter updated with a settlement delay of 83 blocks, population purged of
our 484 tokens.

Evaluation: paired within-day contrast, inverse-variance weighted, criterion =
**P&L per day at 0.005 Ξ**, studentized permutation control, thresholds A ≥ +4.0 pt
and t ≥ 3.1, B p ≤ 0.05 above the 3.3 pt floor, C stable sign and two-day jackknife.

The biggest unpaid degree of freedom in the dossier: reputation at threshold 0.40
(keeps 56-61%) gives +4.4 pt, whereas "reject the low tercile" (keeps 67%)
gives +1.72 pt over the same 9 days. **Nobody has swept this threshold properly**,
and it is what separates a P&L at −5% from a P&L at +24%.

Launch nothing else before this one has delivered its verdict: the budget at
28 days is about **30 independent trials** to keep the expected maximum
below t = 2.

---

## 8. The threshold sweep, and the robustness checks — 11 September, 16:45

The unpaid degree of freedom is now paid. Full sweep of the rejection threshold,
on 4,005 decontaminated tokens (our 316 set aside), 28 days, with a settlement delay
of 83 blocks and a causal rolling-quantile threshold over 300 tokens.

| share rejected | kept | ROI/trade | paired gap | t | **P&L/day** | vs reference | 95th floor |
|---|---:|---:|---:|---:|---:|---:|---:|
| no rejection | 100% | 6.66% | — | — | 0.0476 Ξ | — | — |
| 5% | 96% | 7.43% | 23.08 | **8.06** | 0.0510 | +7.2% | 8.52 |
| 10% | 93% | 7.81% | 16.54 | 7.41 | 0.0518 | +8.8% | 5.54 |
| 20% | 86% | 8.41% | 12.59 | 6.97 | 0.0519 | +8.9% | 4.53 |
| **25%** | 83% | **8.94%** | 12.29 | **7.14** | **0.0528** | **+10.9%** | 3.11 |
| 35% | 76% | 9.66% | 11.92 | 7.37 | 0.0524 | +10.0% | 3.11 |
| 50% | 66% | 10.57% | 10.71 | 7.36 | 0.0496 | +4.2% | 2.91 |

**A plateau, not a peak**: t stays between 6.7 and 8.1 over the whole sweep, and
each threshold exceeds its own noise floor by a factor of 2.7 to 4. ROI per trade
climbs cleanly from 6.66 to 10.57%; **P&L per day** peaks at 25% rejection, then the
throughput that is cut eats the gain.

### C1 — Two-day jackknife

378 pairs of days removed, one pair at a time:

- median gain **+10.8%**
- **worst case +6.5%** (removing 2 and 8 September)
- best case +22.5%
- **0 pairs out of 378 make the gain negative**

No pair of days carries the result. This is the check that had killed the double sort
(0.757 → 0.351 pt); here it does not move.

### C2 — On both sides of 10 September

- up to 09/09: 27 days, **+10.9%**
- from 10/09: **1 single day**, +2.0%

The "after" side contains only one day because the cache stops at 10 September.
**This check is therefore not conclusive** — it will become so when collection is up
to date, which is the next data job.

### C3 — d19 adds nothing

| rule | kept | P&L/day | vs reference |
|---|---:|---:|---:|
| reputation alone | 83% | 0.0528 Ξ | **+10.9%** |
| d19 alone | 79% | 0.0449 Ξ | **−5.7%** |
| both | 65% | 0.0470 Ξ | −1.3% |

`d19` does have a real gradient **within** the tokens already kept by reputation —
terciles at 5.81 / 9.45 / 11.55% — but using it to reject destroys more throughput
than it adds in return. **To be set aside as a filter.** And this morning's finding
(`nbAcheteurs × d19` at 14.3 pts) falls below the interaction detection floor anyway
(≈ 15 pts at 10 effective days).

### Where we stand

**The causal reputation of recipients, as a rejection of the low 25% quantile, is the
only signal that passes all the checks**: monotone gradient, plateau on the
threshold, t ≈ 7, exceeds the noise floor by a factor of 4, survives the two-day
jackknife, and reproduces on real money through its low end (low tercile at −20.12%
real against −8.65% simulated).

Its contribution: **0.0476 → 0.0528 Ξ/day, i.e. +10.9%.** Real, measured, robust — and
small. It does not solve the bankroll problem.

**Next data job**: catch up `trades` and `t0_*` beyond
10 September to make check C2 conclusive, and to be able to validate on
days that nothing has seen yet.

---

## 9. Validation on new data — 11 September, 19:30

Collection catch-up finished: +19,639 launches, +355,796 trades, cache
rebuilt at **89,530 tokens up to block 60,406,552**. Check C2, inconclusive until now,
can finally be run.

### The gain holds, and rises slightly

On 4,347 tokens and 29 days: **+12.1%** of P&L per day (against +10.9%).
Two-day jackknife: 406 pairs, worst case **+7.3%**, **0 negative pairs**.

### But C2 says something else

| | days | without rejection | with rejection | gain |
|---|---:|---:|---:|---:|
| up to 09/09 | 27 | +0.0490 Ξ/day | +0.0544 | **+10.9%** |
| from 10/09 | 2 | **−0.0601 Ξ/day** | −0.0600 | **−0.2%** |

### The decline is real, and it is not a data artifact

| day | tokens | ROI | P&L |
|---|---:|---:|---:|
| 06/09 | 591 | +12.6% | +0.373 Ξ |
| 07/09 | 597 | +10.3% | +0.307 Ξ |
| 08/09 | 489 | +9.3% | +0.228 Ξ |
| 09/09 | 261 | +1.4% | +0.019 Ξ |
| 10/09 | 183 | −4.1% | −0.038 Ξ |
| 11/09 | 192 | **−8.6%** | −0.082 Ξ |

Verified: the last day has 192 tokens with a median flow depth of
**945 blocks** and only 6% under 100 blocks. The exit window is largely
covered — this is not the truncated-exit trap.

### What this changes

**Correction to yesterday's reading.** I had presented the trough as an
**oscillation**, pointing to the one of 30 August – 2 September that recovered.
Six days of monotone decline, from +12.6% to −8.6%, look more like an
**erosion**. Four consecutive days down, two of them clearly negative.

**And the filter does not save it.** +10.9% on the 27 days where the strategy
works, **−0.2% on the two where it does not**. A filter improves
a strategy that works; it does not resurrect a dead strategy. That is the limit of
this entire line of research, and it is now measured.

**Practical consequence**: condition no. 1 of the resumption rule
(`REPRISE-ARGENT-REEL.md`) — "backtest ROI positive three days in a row,
mean > +4%" — is **not met**, and is moving further away. No reason to put real money
back.

---

## 10. Two corrections — 11 September, 20:10

### The filter did NOT fail on the trough: it was not tested there

In the previous pass I wrote that the reputation filter brought nothing
(−0.2%) on the last two days, and I drew from it "a filter only improves a strategy
that works". **That is false.**

The column that gives it away: on those two days the filter **keeps 100%** of the
tokens — it rejects nothing. Check:

| table | last block |
|---|---:|
| `trades` (where `recipient` comes from) | **59,264,597** |
| backtest cache | 60,406,552 |

A gap of **1.14 million blocks, about 32 hours**. Reputation is computed from
`trades.recipient`: it does not exist for 9, 10 and 11 September. Yesterday's
collection catch-up had launched `backfill.mjs` and `collecter.mjs`, but
**not `src/trades.mjs`** — this is debt no. 3 on the list, never paid. Catch-up
under way.

What the filter gives where it has data:

| period | without rejection | with rejection | contribution | kept |
|---|---:|---:|---:|---:|
| past trough 30/08 – 01/09 | −3.2% | −2.3% | **+1.0 pt** | 83% |
| good days 03/09 – 08/09 | +8.5% | +11.0% | **+2.4 pts** | 83% |
| current trough 10/09 – 11/09 | −6.4% | −6.4% | −0.0 pt | **100%** ← no data |

On the past trough, the only one where it could express itself, **it contributed
+1.0 point** — less than on the good days, but not nothing.

### Trough or erosion: too early to say

I leaned toward "erosion" in the previous pass. The full series says otherwise:

| | days | mean ROI | what followed |
|---|---:|---:|---|
| past trough 30/08 → 01/09 | 3 | −4.4% | **recovered** to +6.3% on 03/09 |
| current trough 10/09 → 11/09 | 2 | −6.4% | unknown |

The current trough is **shorter** than the one that recovered. What is unprecedented
is the descent of **six consecutive days** (06/09 → 11/09), the longest in the
history — but the previous trough also had three days of descent before
rebounding. **It is too early to choose between a trough and an erosion.**

### The sequencer feed re-bans itself

The 403 came back at 16:42. The sequence is unambiguous:

```
16:42:43  flux n°1 interrompu après 483 lancements : EOF
16:42:44  flux n°1 interrompu : refus HTTP 403
16:42:45  flux n°1 interrompu : refus HTTP 403
```

A normal EOF, then a reconnection **every second**: two seconds are enough to
trigger the one-hour ban. The bot then retries ~220 times per hour, which keeps it
banned in a loop.

And so it was not my restart of 14:57 that was at fault: **D1 had absorbed
36 EOFs in 22 hours without a single 403**. The endpoint has presumably tightened its
limit today.

**Necessary fix, not applied**: an exponential backoff on the feed
reconnection, in `internal/watch/feed.go`. That is a change to the binary,
therefore outside what I do without agreement. In the meantime, the bot runs in
degraded mode over WebSocket — about 70 ms less margin, but the `calcul` channel was
finding 2.7 times more launches.

---

## 11. The verdict, with the data finally complete — 11 September, 20:45

`src/trades.mjs --global --from 59264598` inserted **1,474,992 trades** and brought
the table to block 60,524,011, beyond the cache. Reputation now has data
over the whole period, including the current trough.

### The gain, day by day

| day | without rejection | with rejection | contribution | kept |
|---|---:|---:|---:|---:|
| 07/09 | +10.3% | +14.0% | +3.7 pts | 82% |
| 08/09 | +9.3% | +13.5% | +4.2 pts | 83% |
| 09/09 | +1.4% | +4.4% | +2.9 pts | 77% |
| 10/09 | −4.1% | −3.0% | +1.1 pt | 89% |
| **11/09** | **−8.6%** | **−3.6%** | **+5.0 pts** | 68% |

### By period

| period | without | with | contribution |
|---|---:|---:|---:|
| past trough 30/08 – 01/09 | −3.2% | −2.3% | +1.0 pt |
| good days 03/09 – 08/09 | +8.5% | +11.0% | +2.4 pts |
| **current trough 09/09 – 11/09** | −3.2% | **−0.2%** | **+3.0 pts** |

**The filter helps MORE during the trough than during the good days.** My sentence
from the previous pass — "a filter only improves a strategy that works" — was
not only untested, it is **false**.

### The checks, redone

| | result |
|---|---|
| overall gain | **0.0415 → 0.0490 Ξ/day, +18.0%** |
| 2-day jackknife | 406 pairs, worst case **+10.2%**, **0 negative pairs** |
| on the 2 negative days | loss **reduced by 60%** (−0.0601 → −0.0240 Ξ/day) |
| `d19` | still set aside: −3.2% alone, +6.1% combined against +18.0% for reputation alone |

### The methodological lesson

Three times today I concluded too quickly on this signal, and each time the cause
was a **missing data point, not a flaw in the signal**:

1. "does not reproduce on our real trades" → it was the HIGH end that did not
   reproduce, the LOW end did;
2. "brings nothing on the trough" → `trades` stopped 32 hours too early;
3. the figure itself went from +10.9% to +18.0% once the debt was paid.

**The sign that should have alerted me: "keeps 100%".** A filter that rejects nothing
has not failed, it has not run. To be checked systematically before concluding.

---

## 12. The engine becomes consistent with the method — 11 September, 21:30

The threshold sweep redone with the complete data **confirms the optimum at 25%**
(so it had not moved): t between **7.0 and 8.45** over the whole sweep, gain
between +13% and +18% from 10% to 50% rejection. The exact choice of threshold hardly
matters, which is exactly what we want in order not to overfit.

### Three corrections to the engine, each because it was killing the good signal

1. **The inverse-variance-weighted paired contrast** replaces the comparison of two
   bootstrap intervals with equal weights. Days range from 1 to 597 tokens: with equal
   weights the standard error is 7.00 points and the power 9%; weighted, 1.46 points
   and 88%.
2. **The t is read against a Student**, at the number of usable days, threshold 3.1 —
   not against a normal (at 500 effective trials, Šidák is 4.29 at 27 df against
   3.71 under the normal).
3. **Test BOTH SIDES of the gradient.** This was the most serious flaw: the engine
   only tested selection of the high end. Yet a gradient can be exploitable through
   its low end without being so through its high end — which is precisely the case
   here.

### The engine's verdict, on 27 variables

| variable | rho | high-end selection | low-end rejection | placebo | verdict |
|---|---:|---:|---:|---:|---|
| **reputation** | **0.89** | +3.4 · t 2.00 | **+9.2 · t 5.85** | **0.000** | **ALIVE** |
| d19 | 0.67 | +2.4 · t 1.68 | +3.8 · t 2.67 | 0.003 | fragile |
| logoDejaVu | 0.68 | +1.7 · t 0.89 | +1.6 · t 0.84 | 0.023 | fragile |
| ratioBundle, volumeEth | −0.70 | −5.0 · t −3.00 | −4.4 · t −3.21 | 0.630 | fragile |

**1 alive, 4 fragile, 22 dead.**

The asymmetry is confirmed by a test path independent of the sweep's:
**t = 2.00 when selecting the high end against t = 5.85 when rejecting the low end**.
That is exactly what the real money said — low tercile at −20.12% real against −8.65%
simulated, high tercile that does not reproduce.

### The cost of the banned feed, quantified

The dry run made **25 trades in the hour when the feed was working**, then
4 to 9 per hour once the ban set in — **a factor of 5 on throughput**. Over
50 trades it stands at −1.31% ± 3.3, consistent with the declining regime of the
backtest.

The fix remains the same and is not applied: an exponential backoff on the feed
reconnection, in `internal/watch/feed.go`. That is the binary.
