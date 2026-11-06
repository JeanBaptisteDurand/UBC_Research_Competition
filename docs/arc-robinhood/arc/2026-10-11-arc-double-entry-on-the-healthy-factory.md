> *Working document from the author's lab. Written in French on 11 October 2026, before the paper; translated to English with an AI assistant for publication; every number is as in the original. Removed for publication: nothing.*
>
> *Numbers converted to US notation for publication (decimal point, comma as thousands separator, "$" before the amount); dates in the text are DD/MM as in the original; "h" = hours, "s" = seconds, "o" = bytes (octets).*

# Arc: the double entry on the healthy factory — a false negative from 02/10, and the proposed trial

Written on Sun Oct 11 21:55:18 UTC 2026 (`date -u`). Read-only; nothing is applied without the owner's agreement.

## The false negative
On 02/10 (15 h 18 → 17 h 17 UTC), a real "double entry" trial ($0.10 at t+21 s then $0.10 at t+47 s from another
place, $0.20 kept) had concluded: "keeping $0.20 triples the total-loss rate (45 % against 12 %)". The nonce of each pool's
creator, retrieved from the RPC (`thirdweb`/`drpc` keep the history; `rpc.mainnet.arc.io` does not), separates two factories:

| 02/10 afternoon | positions | total losses | gross per position |
|---|---|---|---|
| healthy factory (nonce 73-84), single entry $0.10 | 44 | 11 % | +$0.083 |
| **healthy factory, double entry** | **12** | **8 % (1/12), 0 reactive drains** | **+$0.176** |
| factory "nonce 3" (the sick one of 11/10), double entry | 8 | 100 % | −$0.200 |
| healthy factory, $0.20 at once at t+21 s | 3 | 100 %, 3 reactive drains | −$0.200 |

All the losses of the double entry came from the factory "nonce 3". The "$0.10" cap remains true for ONE buy; two
buys of $0.10 separated by 26 s did not trigger it on the healthy factory. (Lesson: "a wall measured before sorting is worthless".)

## What the validated simulation says (`labo/arc-familles/sortie-synthetique.mjs --nonce-min=50 --age-min=47`)
Second buy of $0.10 at t+47 s, healthy factory: +$0.081 per pool (08-10/10, n 665), +$0.081 (night of 10 to 11/10, n 143),
+$0.084 (11/10 12-19 h, n 65) selling 200 s later; +0.072 to +$0.075 at 225 s (the bot's current setting). The tool's control on
the first entry: −7.3 %, −3.8 %, −0.4 %. The simulation does NOT see an operator reaction to our second buy.

## The proposed trial (existing settings, no line of code)
Override `DEUXIEME=47` + `DEUXIEME_PROBA=0.5` (draw per pool: half of the pools get the second entry — time-paired
comparison), filter `NONCE_CREATEUR_MIN=50` kept.
- IMMEDIATE STOP if: 3 reactive drains (≤ 3 s after OUR buy) in the double-entry pools; or cumulative gross of the second
  entries < −$2; or, after ≥ 20 pairs, total-loss rate of the double-entry pools > that of the single-entry pools + 20 points.
- SUCCESS after ≥ 60 pools per arm: second entries at ≥ +$0.04 gross on average AND first entries of the double-entry
  pools no worse than those of the single-entry pools (difference > −$0.02).
- Maximum cost of the trial: the stop rule bounds it at ≈ $2.

## The conduct question (to the owner)
The double entry stays under the operator's threshold by splitting the stake over a second place. The rule of 05/10 (reinstated on
07/10) forbids "settings (stake, entry age…) invented to answer a retaliation", and disguise. The code dates from
02/10 and the healthy factory showed no retaliation to this gesture, but it is for the owner to say whether this trial is allowed.
