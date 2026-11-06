> *Working document from the author's lab. Written in French on 7 September 2026, before the paper; translated to English with an AI assistant for publication; every number is as in the original. Removed for publication: nothing.*

# Do we win?

*7 September 2026, after validating the dry run against the backtest.*

## The number not to believe

The full chronological simulation, over 6,852 trades and eight days, announces
**+47.3 Ξ, i.e. 5.9 Ξ per day**. That number is false, and here is why.

Broken down by exit gate:

| exit gate | trades | P&L | does the bot have it? |
|---|---|---|---|
| −2% pullback | 5,965 | +23.03 Ξ | **yes** |
| exit at time `T` | 867 | +18.55 Ξ | no |
| guard at 85% of the threshold | 20 | +5.76 Ξ | no |

**Half of the gain comes from two rules that the live bot does not apply.** It only has
the −2% pullback and the graduation.

Worse for the `T` exit: **the `t0_wf_tr` table stops at d=200 blocks**, i.e. twenty
seconds. But `tSortie` is d19+150, about 165 blocks — and **76% of tokens have less than
165 blocks of data**. These 867 "exits" are not sales: they are
positions valued at the edge of the dataset, on tokens that were still rising.
It is paper, not money.

> Consequence to remember for all future research: **this data can say nothing
> about a strategy that holds for more than twenty seconds.**

## The defensible number

Keeping only the rule actually implemented — the −2% pullback:

| | latency 0.20 s | latency 0.50 s |
|---|---|---|
| trades | 5,965 | 5,965 |
| winners | 54% | 54% |
| **per trade** | **+3.86%** | **+3.01%** |
| P&L over 8 days | +23.03 Ξ | +17.94 Ξ |
| per day | 2.88 Ξ | 2.25 Ξ |
| **worst drawdown** | **−3.12 Ξ** | **−3.46 Ξ** |

And the live dry run, on **46 real trades**: **+1.70% per trade**, 48% of
winners, +0.0781 Ξ. Same order of magnitude, about half — and 46 trades do not
let us distinguish 1.7% from 3.0% when the low decile is −58% and the high
decile +60%.

## What really blocks us

**Capital.** The worst drawdown from a peak is **−3.46 Ξ**. With 0.3 Ξ in hand,
we are liquidated long before reaching the positive expectation. We need **6 to 7 Ξ
of capital** to absorb the variance of this strategy — twenty times what is
configured today.

**Volume.** 860 tokens per day pass the filter, and the simulation takes
almost all of them: only 2 missed for lack of room out of 6,854. The gain is therefore a
volume gain, not a selection gain — 3% per trade repeated 860 times a day. The
infrastructure has to hold this pace without faltering.

**Variance.** 54% winners and a low decile at −58%: half of the trades lose,
and the losses are deep. This is not a strategy to be judged on a single day.

## Answer

Yes, the expectation is positive and it is consistent between the backtest and live —
around **+2 to +3% per trade**, on about **860 trades per day**.

No, not with 0.3 Ξ. At that size the −3.5 Ξ drawdown liquidates the account before
the expectation has time to play out.

And no, we cannot yet settle it: 46 real trades prove nothing against such a
standard deviation. We need several thousand trades in dry run before asserting
anything.

## To do before going further

1. **Re-collect the trades beyond d=200 blocks.** Without that, no exit strategy
   longer than twenty seconds is testable — and the `T` and
   `garde85` exits are together worth +24 Ξ in the simulation, so it is worth the detour.
2. **Implement the guard at 85% of the threshold in the bot** — 20 trades for +5.76 Ξ, that is
   the best ratio in the whole table. But first verify it on untruncated data.
3. **Decide where the bundle is measured**: live reserve at t+2 s (what the bot does) or
   sum of the logs at the start of the band (what the research does). This is the last source
   of disagreement between the two, and it only shows up on tokens sitting on the
   15% and 35% boundaries.
