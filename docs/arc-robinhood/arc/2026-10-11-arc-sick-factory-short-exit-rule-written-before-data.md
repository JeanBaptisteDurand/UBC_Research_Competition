> *Working document from the author's lab. Written in French on 11 October 2026, before the paper; translated to English with an AI assistant for publication; every number is as in the original. Removed for publication: nothing.*
>
> *Numbers converted to US notation for publication (decimal point, comma as thousands separator, "$" before the amount); dates in the text are DD/MM as in the original; "h" = hours, "s" = seconds, "o" = bytes (octets).*

# Arc: the sick factory with a short exit — rule written BEFORE the night's data

Written on Sun Oct 11 21:06:47 UTC 2026 (`date -u`). Read-only; nothing is applied without the owner's agreement.

## What we already know (INSIDE the sample, 11/10 12 h → 19 h 12 UTC)
Factory "nonce 3" (the former "nonce 10"), 124-125 positions, bot entry at t+21 s, stake $0.10:
30 s +$4.68 · 45 s +4.20 to +$4.30 · 60 s +1.44 to +$1.73 · 90 s −$3.8 · 110 s −$5.8 · 225 s −7.4 to −$7.7 (gross).
Tool for SYNTHETIC positions (`labo/arc-familles/sortie-synthetique.mjs`) validated on the bot's real positions:
healthy factory +$7.21 simulated against +$7.23 real (−0.4 %), sick factory −$7.69 against −$7.75 (−0.8 %).

## The OUTSIDE-the-sample test
Window: pools born from 11/10 19 h 12 to 12/10 07 h 00 UTC (the bot no longer buys the sick factory: synthetic positions).
Selection: creators with nonce ≤ 49 (any low-nonce factory, in case the operator changes addresses again).

## Criterion (fixed now)
Propose to the owner a short exit for the sick factory (code to modify: hold specific to nonces < 50) ONLY if:
1. window control: synthetic against real on the HEALTHY factory (where the bot buys) within ±10 %;
2. the better of the 30 s or 45 s exits earns more than the gas: mean gross > +$0.0066 per position, and ≥ +$5/day net
   extrapolated to the window's birth rate;
3. this same exit is positive on EACH half of the window (19 h 12 → 01 h 06, then 01 h 06 → 07 h 00).
Otherwise: keep the filter, and propose nothing.
