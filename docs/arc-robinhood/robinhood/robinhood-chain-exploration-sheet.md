> *Working document from the author's lab. Written in French on 2026-10-05, before the paper; translated to English with an AI assistant for publication; every number is as in the original. Removed for publication: nothing.*

# Robinhood Chain (4663): exploration sheet (families other than the one our bots trade)

> Our bot already runs there on the family `v4|2500|no hook|native|0x8366…|1526o` ($0–20/day, hourly defense by the
> operator; memory sheets robinhood-*). Question of this sheet: is there, on our main chain, ANOTHER family where a
> small stake follows a crowd without being punished? Already closed: `v4|10000|5274o` (reactive drains),
> `3248o` (honeypots), `fee=500|4655o` (three real negative measurements), v2/v3 (spam: 3 % second buyer).

## Decision rule
Identical to `bsc.md` (written on 05/10 at 17:45 UTC, before any measurement): throughput ≥ 10 playable pools/h; second buyer ≥ 30 %;
real crowd at 20-60 s not losing at the median (`foule.mjs`); replay > +5 % net (÷3 before believing it); no punisher
(`punisseur.mjs`, ratio < 3× the control). Target stake: $0.20. POSITIVE CONTROL expected: the 1526o family must come out of the
replay as a winner (it is the one that pays) and the punisher must see the operator's known defense in it.

## Launchers seen at creation and identified on 05/10
- `0xeb7c…` (59 tokens/h): 44-byte proxy tokens launched by `launch(...)` on `0x1eef…` (13-field creation
  structure = **Doppler**); v4 pool on our PoolManager `0x8366…`, dynamic fees, hook `0x4e34…`,
  **quoted against a meme** ("Artificial Inu" `0x2e8c…1e18`, coming out of the same launcher; the tokens all end
  in `1e18`). Meme against meme: entering requires holding the quote meme.
- `0x2660…` (115 tokens/h): clone of **Flap**; ~1 buy per token created (collector watch).

## Results: 29.7 h (04/10 ~13:00 → 05/10 ~19:00 UTC), coverage 100 %, 15,141 pools born

Replay (`rejouer.mjs`, entry t+20 s, stake $0.20): **POSITIVE CONTROL PASSES**: our family 1526o: 11.3 playable/h,
median +75 % at +120 s, 16.4 % total losses. Punisher (`punisseur.mjs`, withdrawal ≤ 3 s after a buy against a
control at the same age without a buy), 1,318 pools of 4 families:

| family (mold) | playable/h | replay median +120 s | buys < $1 drained ≤ 3 s | buys $1-20 drained ≤ 3 s | control | verdict |
|---|---|---|---|---|---|---|
| `v4|10000|5274o` | 23.0 | +123 % | 2.9 % (×175) | **54/54 = 100 % (×5,990, p=1e-154)** | 0.02 % | CLOSED (punisher; POSITIVE CONTROL of the tool) |
| `v4|2500|1526o` (our bots) | 11.3 | +75 % | 2.1 % (×124) | 11.1 % (×653) | 0.02 % | the known defense (stake wall $0.20-0.30) |
| `v4|500|4655o` | 6.1 | +149 % | 2.0 % (×25) | 1.5 % (×19) | 0.08 % | CLOSED (three real negative measurements) |
| `v2|3000|WETH|3857o` | 4.0 | +126 % | **30.9 % (×588)** | 2.0 % | 0.05 % | DEAD (punisher + 42 % of round trips with no third-party sale: honeypot) |

In all four families, the router `0x8876…` is almost never punished (0.4 to 1.0 %): it is the path of the
operator's fleet.

Doppler (`0xeb7c…`, 59 tokens/h): quoted against the meme "Artificial Inu", hence "without a quote" for the replay (1,426 pools
of this type); not measured further: meme against meme, entry would require carrying the risk of the quote meme.

## Verdict (05/10/2026, 22:00 UTC)
**No new family on Robinhood Chain.** The replay ranks the known families exactly; those that dominate it are
punishers or honeypots, and the punisher test now shows it in the logs (100 % of the $1-20 buys
drained within 3 s on 5274o). Our family 1526o remains the only playable one, under the known hourly defense.
