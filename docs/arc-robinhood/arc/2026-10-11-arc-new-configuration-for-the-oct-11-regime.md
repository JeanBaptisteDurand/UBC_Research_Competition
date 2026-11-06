> *Working document from the author's lab. Written in French on 11 October 2026, before the paper; translated to English with an AI assistant for publication; every number is as in the original. Removed for publication: one server name (1 passage).*
>
> *Numbers converted to US notation for publication (decimal point, comma as thousands separator, "$" before the amount); dates in the text are DD/MM as in the original; "h" = hours, "s" = seconds, "o" = bytes (octets).*

# Arc: new configuration for the 11/10 regime (factory "nonce 10" that became "nonce 3")

Rule written on Sun Oct 11 17:43:20 UTC 2026 (`date -u`), BEFORE measuring. Read-only; nothing is applied without the owner's agreement.

## What we compare (EXISTING settings of the bot, no code change)
- C0: the current configuration (all factories, hold 225 s);
- C1: `NONCE_CREATEUR_MIN=50` — buy only the pools whose creator has a nonce ≥ 50 (factory "nonce 115-119");
- C2: `GABARITS_MORTS` completed with the seeding templates specific to the nonce 3 / nonce 10 factories, IF they differ from those of
  the 115-119 factory (same effect as C1, but on another signal that the operator can change less easily… or more);
- C3: a shorter GLOBAL hold (60 to 180 s), for all factories.

## How we decide
1. Window of the current regime: pools born on 11/10 from 10 h to 17 h UTC; replay of the REAL positions (`sortie-positions.mjs`,
   convention "same block = sale won"), control within ±10 % required; gas counted at $0.0066 per round trip.
2. We keep the configuration with the best NET result over this window.
3. Any configuration that sets a factory aside must come with a RE-ARMING rule measured on the chain (life span of the
   pools of the factory set aside), since our own positions no longer show it; in normal times (08-10/10) this factory
   earns ≈ +$39/day gross: the cost of a forgotten filter is known in advance.
4. C3 must also be judged on the normal days (08-10/10), where any hold < 225 s lost 2 to $20/day (§438).

## Result (measured on 11/10 around 17 h 45 UTC)

Window: pools born on 11/10 from 10 h to 17 h UTC. Controls within ±3.5 % on each selection. The "nonce 10" factory gives way to
"nonce 3" at 13 h (same template 2,639,229 as the healthy factory: only the nonce separates them, C2 is impossible).

| configuration | gross replayed | gas ($0.0066/A-R) | net |
|---|---|---|---|
| C0 current (all factories, 225 s) | −$1.77 | −$1.50 | **−$3.27** |
| **C1 `NONCE_CREATEUR_MIN=50`** | +$6.98 | −$0.44 | **+$6.54** |
| C3 global hold 45 s | +$5.83 | −$1.50 | +$4.33 |
| C3 global hold 60 s | +$3.98 | −$1.50 | +$2.48 |
| (outside existing settings: 45 s for nonce 3/10, 225 s for 115-119) | +$11.22 | −$1.50 | +$9.72 |

Factories nonce 3 and 10 alone: −$8.75 at 225 s, +$4.24 at 45 s, +$1.87 at 60 s, negative at 90 s and beyond.
Factory 115-119 alone: +$6.98 at 225 s, less at any shorter hold.

**Configuration retained: C1.** No line of code, one systemd override file:
`/etc/systemd/system/moisson.service.d/zzzz-nonce-min-1110.conf` containing `Environment=NONCE_CREATEUR_MIN=50`, then
`daemon-reload` and a restart (the bot waits for its positions to be sold, TimeoutStopSec=300). Rollback: delete the
file, `daemon-reload`, restart. The filter also sets aside a pool whose nonce could not be read (code: "unreadable =
set aside"); on 11/10, the nonce is read at 100 %.

**Withdrawal rule** (written before use): `labo/arc-familles/horloge-usines.py` (on [removed for publication: server name]) reads each
factory's clock on the chain — control: 09/10 9 h-12 h, nonce 10 at 22 % and 115-119 at 5 %; on 11/10 15 h-18 h, nonce 3 at 86 % and
115-119 at 8 %. The Arc bot's hourly watch notifies "remove the filter?" when the factory set aside falls below 25 % three hourly readings
in a row (≥ 15 pools). A forgotten filter would cost ≈ +$39/day gross in normal times.
