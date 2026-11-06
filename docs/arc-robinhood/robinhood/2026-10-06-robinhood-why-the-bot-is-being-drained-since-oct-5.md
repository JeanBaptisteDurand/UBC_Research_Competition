> *Working document from the author's lab. Written in French on 2026-10-06, before the paper; translated to English with an AI assistant for publication; every number is as in the original. Removed for publication: one server name and file path.*

# Robinhood: why the bot has been getting drained since the evening of 05/10 (measured on 06/10)

> Family `v4|2500|no hook|native|1526o`, stake $0.20. Live bot stopped at 13:22 UTC on 06/10 (manual SIGTERM,
> no restart scheduled). Sources: the bot's journal ([removed for publication: server path]) and
> the PoolManager logs collected by the lab, from 04/10 13:00 to 06/10 13:55 UTC (49 hourly files, coverage
> checked: one truncated file, 05/10 16:00, was downloaded again). 434 of our buys recognised in the logs, against 422
> expected in the window. Code: `labo/rh-vidages/`.
> Definition of a drain, identical to the bot's: liquidity withdrawal within the 3 s that follow the buy.

## 1. The break is on 05/10 around 21:00-22:00 UTC, in the middle of a run, with no change on our side

| period (UTC) | our round trips | drained | net, gas included |
|---|---|---|---|
| 04/10 21:00 → 05/10 09:00 | 134 | **0 %** | positive |
| 05/10 12:00 → 22:00 | 108 | 5 % | +$7.73 |
| 05/10 22:00 → 06/10 08:00 | 122 | **22 %** | +$2.72 |
| 06/10 12:15 → 13:22 | 16 | **63 %** | −$1.27 |

The bot ran without interruption from 05/10 12:15 to 06/10 08:08, with the same setting. The only other small
regular trader of the family (`0xe9d8…`, $0.52 at t+16.7 s, its own contract `0x4f88…`) is drained **2 out of 2 at
21:00 on 05/10**, then hardly trades any more. The boundary is therefore in time and on the operator's side.

## 2. What separates the drained from the others: ENTRY AGE

| period | entry < 24 s | entry ≥ 24 s |
|---|---|---|
| 04/10 21:00 → 05/10 09:00 | 0/39 drained | 0/95 |
| 05/10 12:00 → 22:00 | 0/19 · +$0.113/round trip | 5/89 (6 %) · +$0.063/round trip |
| 05/10 22:00 → 06/10 08:00 | **16/22 (73 %) · −$0.139/round trip** | 11/100 (11 %) · **+$0.058/round trip** |
| 06/10 12:15 → | **10/11 (91 %) · −$0.185/round trip** | 0/5 · +$0.152/round trip |

Before the break, entering at t+20-24 s cost nothing. Since then it is almost always fatal. What loses money
today is not the stake, it is that **11 entries out of 16 were made before 24 s** (against 22 out of 122 during the night):
the `2500` tier has `entreeS: 20`.

Pool activity BEFORE our buy is the same for the drained and the spared: ~11 buys, ~$3,000, ~$400
in the 3 s that precede it. The drain delay remains mechanical, 3 to 19 blocks (0.3 to 2 s).

## 3. It is our buy that triggers it, not an event in the pool

- **Bot off (06/10 08:00-12:00)**: 1 drain out of 586 large third-party buys, 0 out of 122 small ones.
- **Contemporaneous control** (third parties in the same pool within ±3 s of our buys), night of 05 to 06: when we
  are drained, 29 neighbours out of 37 are drained with us; when we are not, 0 out of 201.
- **Pools where we did NOT buy**, same night: third parties at 20-35 s drained 0 out of 166.
- First withdrawals before 300 s, night of 05 to 06: 26 out of 56 immediately follow OUR buy.

## 4. The family's other buyers (sender resolved for 1,857 buys)

- **"Dust" fleet**: 26 addresses, $0.005-0.008, through our router, **one address per age bracket**
  (20.7 s, 22.5 s, 24.6 s… spaced ~2 s apart), 1 to 4 pools per hour, in hourly bursts. 0 drained out of 518. Same
  pattern at $0.05-0.14 by ~20 other addresses on 05/10 12:00-15:00 and 00:00-03:00. This is scripted, ARTIFICIAL volume, not
  traders; it has no hourly link with our drains.
- **Large buyers** through `0x1cba…` (~$340-400, nonces ~33,000, t+30-43 s): drained only when they are our
  neighbours.
- **Traders like us**: `0xe9d8…` (see §1); `0xc3e2…`, which appeared on 06/10 at 13:14, $1 at t+30 s,
  **drained 5 times out of 6** in 30 min; `0x0b41…` ($0.14, t+39 s) 2/9 on 06/10. Since 12:15 on 06/10, even outside
  our pools, 7 pools out of 16 with an outside buy are killed before 300 s: today's regime is harder on
  all outside buyers, not only on us.

## 5. What this implies

- The current setting (`entreeS 20`, $0.20) has been losing since 05/10 22:00 whenever early entries dominate.
- Entries ≥ 24 s have stayed positive (+$0.058/round trip over 100 round trips during the night, 11 % drained, below the break-even of
  ~19 %). But this is an observation, not an experiment: these entries are the ones where the bot waited for the flow
  to calm down. Forcing a late entry into a pool that was free at t+20 s has not been measured. And the operator has already
  changed its setting twice in 48 h (04/10: stake wall $0.50 → $0.20-0.30; 05/10 21:00-22:00: early window).
- Raising the entry age is a setting of our recipe, of the same nature as the stake cut of 04/10. But it answers a counter-move: **it is for the owner to decide**.

## Pitfalls met during the measurement
- The 05/10 16:00 file arrived TRUNCATED through the tunnel (10,682 blocks missing, ~19 min) with no error at all:
  always check that the last line can be read and that the blocks follow each other.
- The 04/10 13:00, 18:00 and 19:00 files have `s: 0` everywhere. The times are therefore interpolated by block between the timestamped
  lines. The bot journal's `t` is the CLOSING time of the round trip, not that of the buy: it is not an anchor.
- From the Mac, Node's `fetch` does not reach Robinhood's RPC (connection timeout) whereas curl does:
  `expediteurs.mjs` goes through curl.
