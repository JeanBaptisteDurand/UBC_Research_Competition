> *Working document from the author's lab. Written in French on 15 September 2026, before the paper; translated to English with an AI assistant for publication; every number is as in the original. Removed for publication: one local output path (1 line).*

# The September 9 break — verdict (15 September 2026)

Synthesis of six analyses and their skeptics, with added measurements to settle
what they left open. Strategy studied: buy at launch + 2 s, reference stake 5 mΞ, exit at the cap of 80 blocks, base filters (ETH pair, rank 0,
tax ≤ 300 bp, ratio ∈ [0.05; 0.50[, at least 5 buys before entry).

**Short answer.**

- **What broke is the demand that follows our entry**, not our tokens or our
  execution. In the 80 blocks (≈ 8 s) that follow our purchase, third-party buys
  went from **0.560 to 0.427 Ξ per token** (95% CI of the gap [−0.177; −0.091]).
  Across the whole ETH market, the equivalent window (blocks 21 to 80 after launch)
  loses 29% (CI [−0.136; −0.069] Ξ per launch). Everything shifted at once, in the
  night of 8 to 9 September (UTC).
- **The strategy was not winning by choosing its tokens.** It simply bought just ahead
  of that wave and resold inside it. Without the wave, the price no longer rises after
  entry. The raw rise over 80 blocks drops from 16.9% to 7.5%. The costs (≈ 6.5 points)
  have not moved: they now eat everything.
- **No setting tested restores an established net P&L above zero**: horizon,
  earlier entry, filters or stake. The tokens **set aside** by our filters broke as
  much as the kept ones. **We have to wait**, without real money, and watch
  the indicator of § 4.

Scripts: `src/tri/cassure/synth_*`. Outputs:
[removed for publication: personal local path]
Unless stated otherwise, the gaps are means of days. The 95% CIs come
from a bootstrap over days and the p-values from a permutation of the day label.

---

## 0. Three corrections before reading the numbers

**0.1 — The AFTER period now has 7 days, 5 of them complete.** 11 and
12/09 were missing. I rebuilt them, as well as the end of 10/09 (18:00–24:00) and the
start of 13/09 (0:00–2:00). Method: same code `moteur/population_horaire.mjs`,
block headers already collected in `TS2/entetes.jsonl`, local database, no RPC call.
- **Check**: a copy of this code (indexed query, restricted to the candidates of the
  pre-selection, `synth_temoin_ts3.mjs`), re-run on the TS3 range, returns the
  **16,102 TS3 tokens identically** (maximum roi gap 0, identical dh).
- **AFTER** = 09, 10, 11, 12, 13, 14 and 15/09, i.e. 7 days and 7,831 trades. The
  complete days are 09 → 13/09. 14/09 (14 h covered) and 15/09 (9 h) are
  partial.
- **BEFORE** = 25/08 → 08/09, i.e. 15 days and 14,163 trades.

In total: 22 days (the brief announced 21) and 21,994 tokens kept.

**0.2 — The `roi` field is already NET of gas.** In the decomposition by steps
(`decomposer_pnl.mjs`), going from m5 → m6 removes exactly **0.80 point**, i.e.
4.0e-5 Ξ / 5 mΞ. That is the gas of a **full round trip** according to the memo
"Pons gas is overestimated". Analyst 1 nevertheless removed a further 0.08 mΞ per
trade, and the skeptic took up this calculation without seeing it. All of analyst 1's
"nets" are therefore too low by 0.08 mΞ. His "−0.033 mΞ/trade after" is in
reality **+0.047** over his 5 days.

**0.3 — The brief's numbers are those of sub-population A2** (tokens without
`rej_a2`), and not of the base filters. On A2:
- BEFORE: **+496.4 mΞ/day**;
- 09/09: +241.6; 10/09: +41.4; 13/09 (2:00–23:00): −125.9.

The skeptic wrote that these numbers "do not match the files": this is the
explanation. The main analysis is on the base filters, because `rej_a2`
does not exist for the rebuilt days.

---

## 1. What changed, in order of solidity

### 1.1 Findings that hold

| # | Finding | BEFORE (15 d) | AFTER (7 d) | Gap, 95% CI | Source |
|---|---|---|---|---|---|
| 1 | **Net P&L per trade** at 5 mΞ | +0.518 mΞ | +0.006 mΞ | −0.512 [−0.667; −0.369], p = 0.0002 | `socle.txt` |
| 1b | … standardized on UTC hour | +0.543 | +0.014 | −0.529 [−0.726; −0.369] | |
| 1c | … on the 5 complete days | +0.518 | −0.021 | −0.539 [−0.712; −0.372] | |
| 1d | **Net P&L per day** | +471.9 mΞ | −18.3 mΞ | −490.1 [−708.1; −278.9], p = 0.003 | |
| 2 | **Raw price rise over 80 blocks** (step m0: no fees, no tax, no latency, no gas) | +16.94% | +7.46% | −9.48 pts [−13.23; −6.01], p = 0.001 (20 d) | `echelons.txt` |
| 2b | Total execution cost (m7 − m0) | −6.58 pts | −6.53 pts | unchanged (detail in § 2.3) | |
| 3 | **Third-party buys in the 80 blocks after our entry** (Ξ per token) | 0.560 | 0.427 | −0.134 [−0.177; −0.091], p = 0.001 | `post.txt` |
| 3b | … relative to the bundle's ETH | 0.768 | 0.551 | −0.217 [−0.287; −0.151] | |
| 3c | Share of tokens with **no** third-party buy after entry | 5.6% | 13.3% | +7.7 pts [+5.6; +9.7] | |
| 3d | Net third-party flow after entry (buys − sells) | +0.136 Ξ | +0.025 Ξ | −0.111 [−0.150; −0.073] | |
| 4 | **Whole market**: ETH bought between blocks 21 and 80 per ETH launch with ≥ 5 buys in blocks 0–20 | 0.350 | 0.248 | −0.102 [−0.136; −0.069], p = 0.0004 | `marche.txt` |
| 4b | … on all ETH launches | 0.108 | 0.077 | −0.031 [−0.049; −0.014] | |
| 5 | **Control: tokens set aside** by ratio or by buyers, same pre-selection on both sides | +0.559 mΞ/trade | +0.187 | −0.372 [−0.529; −0.215] (4 days after: 09–12/09) | `temoin.txt` |
| 5b | … tokens kept, same days | +0.518 | +0.012 | −0.506 [−0.693; −0.332] | |
| 6 | **Mean liquidation-value curve at +40 blocks** | +9.43% | −1.33% | −10.76 [−13.42; −7.94] (20 d) | `analyse_prix.txt` |
| 6b | Share of tokens **never** above the break-even level (400 blocks) | 15.9% | 30.3% | +14.4 [+11.4; +17.8] | |
| 6c | Median amplitude of the peak | 38.6% | 20.8% | −17.8 [−23.4; −11.4] | |
| 7 | Contribution of the **upper half** of outcomes (deciles 6–10) to the drop | — | — | −0.486 mΞ [−0.604; −0.363] | `forme.txt` |
| 7b | Contribution of the **lower half** (deciles 1–5) | — | — | −0.010 mΞ [−0.118; +0.097]: **noise** | |
| 8 | Share of winning trades | 51.0% | 38.5% | −12.5 [−16.0; −9.2] | `socle.txt` |
| 8b | Winners above +50%, per 100 trades | 16.9 | 8.3 | −8.7 [−11.0; −6.2] | |
| 8c | Doublers, per 100 trades | 4.38 | 1.92 | −2.47 [−3.93; −1.07] | |
| 8d | Median ROI | +1.5% | −3.7% | −5.2 [−7.0; −3.5] | |
| 8e | Mean gain when the trade wins | +45.4% | +33.9% | −11.5 [−15.9; −6.9] | `forme.txt` |

**Well-measured changes that do NOT explain the drop** (detail in § 2.3):

| Variable | BEFORE | AFTER | Gap, 95% CI | Source |
|---|---|---|---|---|
| Buys before entry | 11.60 | 13.40 | [+0.49; +2.99] | analyst 2, A2 |
| Distinct buyers | 10.81 | 12.93 | [+0.65; +3.41] | analyst 2, A2 |
| Distinct bundle blocks | 3.47 | 4.02 | [+0.29; +0.80] | analyst 2, A2 |
| Creator tax | 59.4 bp | 88.8 bp | [+17.1; +40.5] | analyst 2, A2 |
| Third-party buys in the decision block, just before our execution | 0.39 | 0.63 | [+0.11; +0.39] | `post.txt` |
| Share of post-entry sells made by bundle buyers | 47% | 57% | [+5.6; +14.1] pts | `post.txt` |

The rise in this last share is not a stronger sell: the ETH sold by the
bundle **falls**, from 0.304 to 0.255 Ξ ([−0.087; −0.015]).

Analyst 2's findings come from A2 over 20 days, and **no skeptic
examined them**: his `verdicts` field is empty. I re-checked part of them:
- the bundle's ETH does not move (0.792 → 0.809 Ξ, [−0.086; +0.118], noise);
- his conclusion "it is not selection" is confirmed by another path, the
  control (row 5).

I did not redo the rest (HHI, re-weighting at 0.7–8.2%, test of 07–08/09). These
numbers are taken over as they are.

**Volume.** Tokens kept per day: 944 → 1,119 (+175 [−283; +607], noise).
ETH launches per day on the market: 8,866 → 9,854 ([−1,412; +3,258], noise). The
flow of tokens has not dried up.

**Dating.** There is no CI here: a single step is not a sample of days.
- **Follow-on flow of the population**, 00:00–05:00 UTC slot: 0.734 on 07/09, 0.730 on
  08/09, then **0.486 on 09/09**. The ROI of the same slot goes from +11.9% and +18.5% to
  +4.8%.
- **Market indicator** (row 4): 0.345 on 08/09, **0.239 on 09/09**, then 0.215 to
  0.279 until 14/09.
- **Trend**: over the 15 BEFORE days, no slope announced the step
  (`datation.txt`).

The step falls between 08/09 at 18:00 and 09/09 at 6:00 UTC, and the flow does not
come back up afterwards.

### 1.2 What is refuted or corrected, and why

| An analysis's claim | Verdict | Quantified reason |
|---|---|---|
| "The strategy has fallen **below** break-even" (analyst 1) | **Refuted** | The AFTER level is **+0.006 mΞ/trade [−0.091; +0.100]** over 7 d, and −0.021 [−0.140; +0.102] over the 5 complete d. 3 days out of 7 are negative. The −0.033 came from gas counted twice (§ 0.2). What is established: we went from clearly above zero (BEFORE [+0.415; +0.642], 0 negative days out of 15) to **indistinguishable from zero**. |
| "It is first of all FREQUENCY: effect 1.8 times that of size (Shapley)" (analyst 1) | **Refuted** | Arithmetic error: −0.434 − 0.241 = −0.675, whereas the actual drop is −0.472. The "size of losses" term (+0.20 mΞ) was forgotten (`04_decompo.txt`). Above all, p·G + (1 − p)·L attributes to "frequency" what is a downward shift of the upper half. The exact decomposition by deciles places **all** of the drop in the upper half (row 7); the lower half does not move. |
| "The floor has clearly improved (mean loss −26.1 → −19.6%) and cushions 40% of the drop" | **Refuted on complete days** | It was an effect of the partial nights of 14 and 15/09: their D1 is −35% and −29%, against −57% to −58% on 11 and 12/09. Over the 5 complete days, the mean loss goes from −26.1 to −23.1% ([−0.5; +6.4], noise) and the share below −50% from 11.4 to 12.0% ([−2.4; +3.9], noise). |
| "The tail has become rarer but not narrower: the size of the doublers is intact" | **Not confirmed** | The "rarer" half holds (row 8c). Over 22 days, the mean size of a doubler goes from 1.63 to 1.44: the bootstrap CI [−0.35; −0.04] excludes zero, but the permutation gives p = 0.10. **Not settled**; "intact" is no longer defensible. |
| "Compression 44%, shift 56%" | **Abandoned** | It is neither a uniform shrinkage nor a uniform shift: the bottom of the distribution is unchanged and only the top is pulled down. |
| "Two breaks: frequency on 09/09, size on 10/09" | **Not established** | The measured mechanism (follow-on flow) only steps once: 0.449 on 09/09, then 0.434 on 10/09. The "second step" rests on a single day and about twenty doublers. |
| "−91%" | **Corrected** | With 7 days: +0.518 → +0.006, i.e. −99% at the cap of 80. This magnitude depends on the exit: at cap 160, the gap is −0.045 [−0.328; +0.239], noise, because this cap **never paid** (+0.145 mΞ/trade BEFORE). |
| "24.3 mΞ/day after", computed on incomplete days | **Replaced** | −18.3 mΞ/day over 7 days, including the complete 11–12/09. |
| "The roi field is raw" (analyst 1's blind spot) | **False** | The roi is net of all modeled costs, gas included (§ 0.2). |
| "The brief's numbers do not match the files" (skeptic) | **Explained** | They are those of A2 (§ 0.3). |

---

## 2. The mechanism

### 2.1 The most likely: the follow-on wave withdrew

What the strategy exploited, measured on the mean liquidation-value curve (20 days,
`analyse_prix.txt`):

| | liquidation ROI at entry block | at block +60 (≈ 6 s) | peak |
|---|---|---|---|
| **BEFORE** | −3.3% (the entry costs) | **+11.3%** | block 69, +11.0%; then −12.3% at block 400 |
| **AFTER** | −3.7% | −0.5% | block 130, +2.5% |

BEFORE, we bought **ahead of** a wave of third-party buys that pushed the price up by
~14 points in six seconds, and the cap of 80 blocks sold **inside** it. On 9 September,
this wave lost about a quarter of its volume (row 3), **across the whole market**
(row 4). In more detail:
- **upstream**, the buys **before** our entry do not fall (bundle 0.79 → 0.81 Ξ,
  noise), and neither does the market over blocks 0–20 (0.218 → 0.216 Ξ per launch,
  [−0.052; +0.046], noise);
- **third-party sells after entry do not rise** (0.424 → 0.402 Ξ,
  [−0.069; +0.023], noise);
- **only the buys that follow recede.**

Four independent measurements point the same way.

1. **The drop lies entirely in the price movement**: step m0 loses 9.5 points,
   the costs stay identical (row 2).
2. **The follow-on flow explains the drop.** If each AFTER day is re-weighted onto the
   BEFORE distribution of post-entry buyer flow (deciles frozen on BEFORE), the AFTER
   ROI rises from +0.12% to **+8.27%**, against +10.36% BEFORE. The re-weighting **closes
   80% of the gap**, and the residual of −2.09 points [−5.07; +0.66] is noise.
   In other words, at equal follow-on flow, a token behaves as before: the price
   response has not changed, it is the number of buyers that has fallen.
   *Caveat: this flow is observed after the decision. It is a mechanism, not a filter
   criterion.*
3. **The flow carries the P&L even inside the good regime.** The per-day Spearman
   correlation between flow and ROI is 0.81 over 22 days (p < 0.0001), and still
   **0.57 over the 15 BEFORE days alone** (p = 0.026). The weak days of BEFORE
   (30/08 → 01/09: flow 0.42–0.49 Ξ, P&L +0.15 to +0.34 mΞ/trade) are already
   days with a thinner wave.
4. **It is not our selection**: the tokens set aside break just as much (row 5). And
   the value added by the filters (kept − set aside, per day) does not change:
   −0.122 [−0.319; +0.091], noise.

**Who bought after us: a diffuse retreat, not a single actor** (`qui.txt`).
- **The 30 biggest post-entry buyers from 02 to 08/09**: −0.056 Ξ/token
  [−0.084; −0.031].
- **All the others**: −0.078 Ξ/token [−0.130; −0.025].
- **The address `0x4a86…`**, 2nd post-entry buyer
  BEFORE, did indeed stop: 22,501 buys on 06/09, then nothing significant
  after **07/09 around 17:00 UTC**. But the stop precedes the break by 31 hours, with no
  effect on 08/09 (+846 mΞ), and it only weighed 2 to 4% of the flow. It is not the
  cause.

### 2.2 Where did this demand go? Open question

Over blocks 81 to 600, the market buys +0.029 Ξ more per launch
([−0.016; +0.072], noise), and +0.072 Ξ for launches with a bundle
([−0.045; +0.182], noise). We **cannot** distinguish "the demand arrives later"
from "the demand has disappeared".

In both cases, it no longer produces an exploitable rise:
- the AFTER curve peaks at +2.5%;
- at cap 160, the AFTER level is +0.101 mΞ/trade [−0.018; +0.229].

### 2.3 Mechanisms that the data ELIMINATES

| Candidate mechanism | Test | Result | Verdict |
|---|---|---|---|
| **Execution and costs** | Steps m0 → m7 (20 d) | Total cost 6.58 → 6.53 pts. Entry slippage: Δ −0.35 [−0.96; +0.22]. Exit slippage: Δ +0.22 [−0.17; +0.56]. Revert: Δ +0.38 [−0.00; +0.78]. All noise, and the drop lies entirely in m0. | **Eliminated** |
| **Rise in the creator tax** | Step m5 − m4 | Costs 0.41 pt more [0.10; 0.72], i.e. **4% of the drop** | Real but marginal |
| **A faster competitor entering just before us** | ROI when entering at dh−4, −2, −1, 0, +1, +2, +4, +8 (20 d) | Gain from entering 4 blocks earlier: +5.31 pts BEFORE, +4.43 AFTER (Δ −0.88 [−2.30; +0.74], noise). The curve loses ~9.5 pts **at every offset**, from dh−4 (−10.3) to dh+8 (−6.0). There is indeed +0.24 more buy in the decision block, just before our execution, but its cost (entry slippage) is noise. | **Eliminated** |
| **Selection, bundle structure** | Re-weighting (analyst 2) and control of the tokens set aside | The re-weighting closes ≤ 8%. The tokens set aside lose −0.372 against −0.506 for the kept ones. | **Eliminated** |
| **More aggressive sellers, bundle unwinding faster** | Third-party sells in blocks 1–80 | 0.424 → 0.402 Ξ (noise). The ETH sold by the bundle **falls** (−0.049 [−0.087; −0.015]). | **Eliminated** |
| **Fewer launches, or dilution by more launches** | ETH launches per day, tokens kept per day | Noise in both cases (§ 1.1) | **Eliminated** |
| **Hourly composition, partial days** | Standardization, 5 complete days, 11–12/09 rebuilt | −0.529 and −0.539, CIs away from zero | **Eliminated** |
| **Different horizon in seconds** | Block time, dh | 0.101 s per block on both sides (80 blocks ≈ 8.1 s). dh 15.42 → 15.56 ([−0.04; +0.32], noise) | **Eliminated** |
| **Non-ETH pairs** | Base | 100% of tokens in ETH, before and after | **Eliminated** |
| **A large buyer who stops** | Address tracking | § 2.1: stop 31 h before the break, no effect, and diffuse retreat | **Eliminated as the sole cause** |
| **Our own bot** | Orders of magnitude | 5 mΞ per trade, against a drop of 134 mΞ per token in third-party flow | **Eliminated** |

---

## 3. What this implies: wait

The strategy positioned itself **ahead of a demand that it does not control**, and this
demand has not come back in 7 days (the follow-on flow stays between 0.399 and 0.449
from 09 to 15/09). No measured lever replaces it.

| Lever | AFTER measurement (7 d unless stated) | Why it is not an adaptation |
|---|---|---|
| **Exit horizon** (8 variants) | None has an established level above zero. Best: cap 160 at +0.101 [−0.018; +0.229]. s50_120: +0.093 [−0.021; +0.213]. tp50_s50_160: +0.084 [−0.009; +0.180]. Cap 40: −0.086 [−0.151; −0.008]. | The CIs contain zero, and the best variant is picked after the fact among 8. Cap 160 does not "withstand" the break: it was already paying nothing (+0.145 BEFORE, against +0.518 at cap 80). |
| **A2 + cap 160**, the configuration of the switch to real money (§ 119) | +0.138 [+0.006; +0.274] over 5 days (09, 10, 13, 14, 15/09, two of them partial) | The lower bound grazes zero, only 5 days, `rej_a2` absent for 11–12/09. And according to § 121, the real loss of the night of the 15th comes from execution: a backtest level of +0.14 mΞ leaves no margin. **Not established.** |
| **Entering earlier** | The relative advantage of being earlier is unchanged (§ 2.3) | At dh−4, the AFTER ROI is +5.36%. But this figure uses filters computed at dh, hence future information, and does not model the more expensive anti-snipe of the first blocks. Not executable as is. |
| **Filters** | The tokens set aside break like the kept ones (§ 1.1, row 5). No bundle variable separates the regimes (analyst 2). Best subgroup found: `ach ∈ ]7; 12]` (bounds frozen on BEFORE), **+0.142 [+0.069; +0.224]** mΞ/trade, +38.7 mΞ/day on 25% of tokens, same-size placebo p = 0.001. | Found **after** sweeping 50 cells (10 variables × 5 quintiles). The gain on the population (+0.136 mΞ/trade, i.e. +2.7 points of ROI) is **below the noise floor of 3.3 points** (memo "Noise floor"). It did not exist BEFORE (+0.508 against +0.518). **A hypothesis to watch, not a filter.** |
| **Larger stake** (gas weighs 0.8 pt at 5 mΞ) | At 20 mΞ, gas falls back to ≈ 0.2 pt, i.e. +0.6 pt | The AFTER level would go from +0.12% to ≈ +0.7% of ROI, with a CI ≈ [−1.2; +2.6]% that contains zero. Our own impact at 20 mΞ is not modeled here, and the capital exposed is multiplied by 4. |
| **Reduce costs** | The ≈ 6.5 pts break down as: curve fees 2.1–2.3, tax 1.3–1.7, slippage 1.4–1.8, gas 0.8, anti-snipe 0.2 | The curve fees and the tax belong to the protocol. Nothing to recover at this scale. |

**Direct answer: we have to wait.** No real money on this strategy as long as
the indicator of § 4 has not flipped.

The reason is not that the AFTER backtest loses money: it is **at zero**
(+0.006 [−0.091; +0.100]). The reason is that a zero expectation in backtest becomes
negative in real trading as soon as an execution cost is added, which § 121 observed.

On the research side, the current strategy has no setting left to dig into. Two leads
remain open:
- check the `ach ∈ ]7; 12]` hypothesis **walk-forward**;
- study the finding, outside the scope of the break, that the exact thresholds of the
  filters were **already** adding nothing BEFORE against the almost-kept tokens: kept − set aside
  = −0.046 mΞ/trade [−0.164; +0.074].

---

## 4. Recovery indicator

### 4.1 Definition

**Indicator: the net P&L per trade of the population backtest**, computed each day
on the tokens kept by the base filters: entry at + 2 s, cap 80, stake
5 mΞ, exit `roi` of `population_horaire.mjs`. It is computed without trading.

**Rule, with hysteresis:**
- a **complete day** counts at least 18 hours covered and 500 tokens kept.
  Otherwise, the state is unchanged: the standard error of a partial day reaches 0.1 mΞ;
- **switch real money back on** the day after **two consecutive complete days**
  at **≥ +0.25 mΞ/trade** (net ROI ≥ +5%);
- **switch off** the day after **any** complete day below +0.25 mΞ/trade.

**Why +0.25 mΞ.** It is half the BEFORE level (+0.518), and about 3
standard errors above zero for a complete day (0.05 to 0.08 mΞ). A per-day
line of P&L as a function of follow-on flow places the same threshold at a flow of
0.474 Ξ/token [0.419; 0.507] (`indicateur.txt`).

**Why two days to switch back on.**
- In the AFTER regime (complete days: mean −0.021, between-day standard deviation
  0.161), a single day crosses the threshold with a probability ≈ 4.6%, and two
  days in a row ≈ 0.2%.
- In the BEFORE regime (mean +0.475, standard deviation 0.160), a day falls below the
  threshold with a probability ≈ 7.9%.

**Mechanism check, non-blocking.** The follow-on flow (third-party buys in blocks 1
to 80 after entry) should go back above **≈ 0.50 Ξ/token**. If the
P&L rises without it, suspect a lucky day. Used alone as a rule, this flow
would have missed 4 days BEFORE (+1,462 mΞ).

**Daily computation without calling the RPC.** `population_horaire.mjs` can read the
timestamps from the bot's log (the "ts bloc" lines). Letting the bot run **as a dry
run** is therefore enough to supply the headers.

Fallback solution without headers: the **market indicator** (§ 1.1, row 4), computable
in SQL alone on `launches` and `trades`, threshold **0.30 Ξ** per launch. Its values from
25/08 to 15/09:
- BEFORE: .352 .358 .275 .384 .357 .258 .292 .280 .403 .449 .418 .403 .309 .365 .345;
- AFTER: .239 .279 .226 .247 .215 .236 .290.

As a "D−1 ≥ 0.30" rule, it would have switched real money off from 10/09, but also
during 4 days BEFORE.

### 4.2 What it would have given, day by day (22 days)

Initial state: off. The "Real money THIS day" column applies the decision taken on the
previous days.

| Day | Hours | Tokens | Indicator: backtest net P&L/trade (mΞ) ± s.e. | ≥ +0.25? | Check: follow-on flow (Ξ/token) | Day's P&L at 5 mΞ (mΞ) | Real money THIS day | State for next day |
|---|---|---|---|---|---|---|---|---|
| 25/08 | 16 | 73 | +1.191 ± 0.345 | (yes, incomplete day) | 0.553 | +86.9 | off | off |
| 26/08 | 18 | 88 | +0.485 ± 0.266 | (yes, incomplete day) | 0.522 | +42.7 | off | off |
| 27/08 | 24 | 188 | +0.392 ± 0.147 | (yes, incomplete day) | 0.421 | +73.6 | off | off |
| 28/08 | 24 | 234 | +0.563 ± 0.173 | (yes, incomplete day) | 0.552 | +131.7 | off | off |
| 29/08 | 19 | 455 | +0.388 ± 0.117 | (yes, incomplete day) | 0.557 | +176.5 | off | off |
| 30/08 | 24 | 836 | +0.149 ± 0.078 | no | 0.424 | +124.7 | off | off |
| 31/08 | 24 | 886 | +0.342 ± 0.081 | yes | 0.474 | +303.0 | off | off |
| 01/09 | 24 | 1,039 | +0.323 ± 0.078 | yes | 0.485 | +335.2 | off | **on** |
| 02/09 | 24 | 1,096 | +0.631 ± 0.105 | yes | 0.659 | +691.8 | **ON** | on |
| 03/09 | 24 | 1,447 | +0.611 ± 0.079 | yes | 0.687 | +884.2 | **ON** | on |
| 04/09 | 24 | 1,310 | +0.457 ± 0.076 | yes | 0.681 | +598.4 | **ON** | on |
| 05/09 | 24 | 1,831 | +0.505 ± 0.058 | yes | 0.620 | +924.4 | **ON** | on |
| 06/09 | 24 | 1,610 | +0.634 ± 0.065 | yes | 0.566 | +1,021.5 | **ON** | on |
| 07/09 | 24 | 1,605 | +0.522 ± 0.069 | yes | 0.611 | +837.1 | **ON** | on |
| 08/09 | 24 | 1,465 | +0.578 ± 0.075 | yes | 0.592 | +846.4 | **ON** | on |
| 09/09 | 24 | 1,158 | +0.212 ± 0.070 | **no** | 0.449 | +245.2 | **ON** | **off** |
| 10/09 | 24 | 1,223 | +0.029 ± 0.060 | no | 0.434 | +35.2 | off | off |
| 11/09 | 24 | 1,186 | −0.191 ± 0.055 | no | 0.399 | −226.2 | off | off |
| 12/09 | 24 | 1,642 | −0.001 ± 0.051 | no | 0.426 | −1.6 | off | off |
| 13/09 | 24 | 1,594 | −0.155 ± 0.047 | no | 0.404 | −246.5 | off | off |
| 14/09 | 14 | 778 | +0.055 ± 0.057 | (no, incomplete day) | 0.427 | +42.4 | off | off |
| 15/09 | 9 | 250 | +0.094 ± 0.097 | (no, incomplete day) | 0.446 | +23.6 | off | off |

**In-sample result (30/08 → 15/09).**

| Scenario | Backtest P&L |
|---|---|
| Always trade | +6,438.6 mΞ |
| Follow the rule | +6,048.9 mΞ |

The rule missed the late-August recovery (30/08 → 01/09, +762.9 mΞ), still traded on
09/09 (+245.2 mΞ), then switched everything off from 10/09 (−373.2 mΞ avoided).

**It therefore costs 390 mΞ in this backtest.** Two reasons: two days are needed to
switch back on, and the AFTER regime is at zero **in backtest**. Its value lies
elsewhere: not exposing real money to a zero expectation that execution turns
negative.

**Limits of the indicator.**
- The threshold is calibrated on these same 22 days, which contain **only one
  break and no recovery**. The rule has never been seen switching back on rightly after a
  dead regime.
- The first recovery will have to be judged with the flow check, and with a
  reduced stake.

---

## 5. What we still do not know

1. **Why the follow-on demand receded on 9 September.** On-chain, the retreat is
   diffuse and touches the whole market. No identifiable actor explains it. A cause
   off-chain (Pons interface, notification feed, end of a promotion, trade-copying
   service) would give exactly this profile, but **nothing in the data
   allows testing it**.
2. **Did the demand slide later or disappear?** Blocks 81–600: +0.029 Ξ per
   launch [−0.016; +0.072], noise (§ 2.2).
3. **Will it come back?** Seven days do not distinguish a lasting regime from a long
   trough. The last two (14 and 15/09) are partial and still below the threshold.
4. **The subgroup `ach ∈ ]7; 12]`**, at +0.142 [+0.069; +0.224] AFTER, is it real?
   It is below the noise floor and comes from an after-the-fact search. Only a
   walk-forward by date can tell.
5. **A2 + cap 160**, at +0.138 [+0.006; +0.274] over 5 days: `rej_a2` is missing
   for 11–12/09. Without it, impossible to extend to 7 days.
6. **Backtest → real gap after the break.** It is not measured here; § 121 says it is
   unfavorable. As long as it is not quantified with an interval, any backtest level
   below ~+0.25 mΞ must be read as negative in real trading.
7. **Remaining data gaps.**
   - 14/09 from 10:00 to 19:00;
   - 15/09 after 8:00;
   - the liquidation-value curve (`analyse_prix`) and the steps only cover 20 days,
     not 11–12/09;
   - the control of the tokens set aside only covers 4 AFTER days (09–12/09).
8. **Has the size of the doublers shrunk?** The bootstrap CI excludes zero, the
   permutation gives p = 0.10. Not settled.
9. **Did selection ever contribute anything?** Against the almost-kept tokens (same
   pre-selection), the kept ones do not do better BEFORE: −0.046 mΞ/trade
   [−0.164; +0.074]. This test only concerns the exact thresholds, beyond the
   pre-selection. It deserves a separate analysis, because it challenges the idea that
   the BEFORE advantage came from the filters.

---

### Scripts and outputs

**Scripts** (`src/tri/cassure/`):

| Script | Role |
|---|---|
| `synth_lib.py` | Common tools: loading, bootstrap by day, permutation |
| `synth_socle.py` | P&L over 22 days, levels, hourly standardization |
| `synth_echelons.py` | Cost steps and entry offsets |
| `synth_post_entree.sql`, `synth_post.py` | Flow after entry, re-weighting (mediation) |
| `synth_qui.py`, `synth_bot_arrete.sql` | Who bought after entry; stop of `0x4a86…` |
| `synth_marche.py` | Market control, windows 0–20, 21–80 and 81–600 |
| `synth_temoin_ts3.mjs`, `synth_prefiltre_10_13.sql`, `synth_temoin.py` | Control of the tokens set aside |
| `synth_forme.py` | Deciles, loss side, 6-hour dating |
| `synth_sousgroupes.py`, `synth_regles.py` | Subgroups and rules for putting money back |
| `synth_indicateur.py`, `synth_table_indicateur.py` | Recovery indicator and day-by-day table |
| `synth_a2.py` | Reconciliation with sub-population A2 |

**Outputs**: in `scratchpad/CASSURE/SYNTH/`, a `.txt` file of the same name per
script. Added to these are `pop_10_13_tout.json` (the reconstruction from 10/09 18:00 to
13/09 2:00, tokens set aside included) and `analyse_prix.txt` (re-run of
`analyse_prix.mjs` on the existing curve matrix).
