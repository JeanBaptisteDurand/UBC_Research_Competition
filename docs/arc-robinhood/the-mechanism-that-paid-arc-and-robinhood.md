> *Working document from the author's lab. Written in French on 21 October 2026, before the paper; translated to English with an AI assistant for publication; every number is as in the original. Removed for publication: one personal file path.*
>
> *Numbers converted to US notation for publication (decimal point, comma as thousands separator, "$" before the amount); dates in the text are DD/MM as in the original; "h" = hours, "s" = seconds, "o" = bytes (octets).*

# The mechanism that paid on Arc and on Robinhood

> Core of the paper (JB's decision of 21/10: full disclosure, in the first person — the strategy no longer pays).
> Sources: [removed for publication: personal path]`DOSSIER-COMPLET.md` (§1, §2, §5, §6), `PONS-V2-RECHERCHE.md`, `TROUVAILLES.md`. Copies in `sources/`.

## 1. The life cycle of a factory pool (DOSSIER-COMPLET §2.1)
1. The operator **launches** a token: deploys the contract, creates a pool, deposits the liquidity.
2. Buyers arrive within the **first seconds to minutes** and push the price along the curve.
3. After **2 to 11 min** (depending on chain and operator), the liquidity is **withdrawn**: the pool dies.

Measured: on Arc, the crowd loses **~$47 per position at the median**. A market that is largely negative-sum for late entrants.

## 2. Our recipe (DOSSIER-COMPLET §2.2)
- **Family detection** by broad signatures: same **ramp bytecode**, **token size** (e.g. 1,526 bytes on Arc/Robinhood), pool fee, orientation (native/quote), presence/absence of a hook.
- **Entry**: ~20–45 s after birth, if ≥ 2 swaps and real liquidity.
- **Stake**: 0.10–$0.20. **The stake cap IS the edge**: a large stake gets drained, a small one passes under the radar.
- **Hold**: 110–240 s, set to the **median life of the FAMILY** (Arc: 225 s; Robinhood 5274o: 110 s).
- **Exit**: sale of the real balance; on Arc, a **reactive exit** when the pool shows signs of an imminent withdrawal.
- **Source of the gain**: the rise created by the buyers who arrive between our buy and our sale.

## 3. One machine, three chains (DOSSIER-COMPLET §2.4)
Robinhood's private PoolManager (`0x8366…`) **is** the poolManager of the Pons launchpad; our family (v4, fee 2500, native, no hook, 1526 o token) = the Pons graduations. **Argus on Arc is a clone of Pons.**

## 4. Results in real money
- **Arc** (chain 5042): ~**$50/day** over the 72 h before 07/10, verified on on-chain balances.
- **Robinhood** (4663): the 1526o family paid until 05/10, then **stopped being born on 06/10 around 18:50 UTC**. 5274o test: +$1.54 in ~14 h.
- **Total** as of 07/10: **$579.50** (Arc 445.03 · Robinhood 117.92 · Base 16.49 · BSC 0.05) across 53 addresses, + vault ~$2,074.
- Today: **the strategy no longer pays** (JB, 21/10).

## 5. What the mechanism reveals (the publishable results)
- **Wealth transfer**: on Arc, **−9.0 M$ for 3,443 addresses in ~118 h; 243 winners share +22.6 k$** (≈ 400:1), over 247,185 swaps, 100 % of the issuers identified (TROUVAILLES:428). ⚠️ to be specified: realized or marked-to-market, and exact scope.
- **Operator defense ("punisher")**: on Arc, drain within ≤ 3 s for 89.8 % of the buys through one router, 100 % through two others, 0.4 % through the in-house fleet (T:118). Pools dead **65 s** after our buy versus 213 s without us (T:170).
- **Half-life**: a family is born, pays, gets defended, dies (1526o stopped on 06/10; Pons lost its volume). "When the imbalance disappears, no tuning recreates it" (DOSSIER-COMPLET §1).
- **"Nobody pays for volume"**: everything that pays pays for capital (DOSSIER-COMPLET §6.8).

## 6. Pons V2 (the Robinhood Chain launchpad) — key facts (PONS-V2-RECHERCHE.md)
- Operated by **Pons Labs, LLC** (ponsfamily.com), GitHub repository created on 19/07/2026.
- Trade fee 1 %; graduation at **4.2 ETH**; anti-snipe tax **99 % decaying to 0 in 3 s** (the docs say 5 s: outdated); public launches open (the docs say closed: outdated).
- v4 hook: 30 % protocol share, 50 % buyback; buyback vault **vested over 5 years** (not burned).
- **Unaudited** (declared by the team, 3 audits in progress). The official repository **does not compile** (factory and curve out of sync).
- `/launchpad?tab=stocks` tab: memes **listed against tokenized stocks**.
- Open third-party ecosystem: sniper terminal (`bodkin`), MCP, drain-check, and a public **"Pons-Volume-Bot"** (manufactured-volume tooling).
- ⚠️ **A PONS token exists** (CoinGecko, 21/10: 192 M$, −71 % since the 05/09 ATH, Binance + Hyperliquid perps). To cross-check: launch date, exact link with Pons Labs.

## 7. Method pitfalls to put forward (credibility)
The lab documented its own mistakes (DOSSIER-COMPLET §6): frozen log price (+198 % reported vs −18.9 % real), constant-liquidity simulator (factor 30), router mistaken for the buyer (`topics[2]` ≠ `tx.from`), a "successful" v4 swap without liquidity, a rate-limited collector writing confident zeros, non-contemporaneous controls… **Showing them proves rigor** (pre-registered decision rules, controls, walk-forward).
