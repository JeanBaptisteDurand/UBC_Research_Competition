> *Working document from the author's lab. Written in French on 05/10/2026, before the paper; translated to English with an AI assistant for publication; every number is as in the original; numbers converted to US notation, dates DD/MM. Removed for publication: nothing, except that all third-party contract, program, deployer and token addresses are shortened to their first 6 characters followed by "…" (for EVM addresses, the first 6 hex characters after the `0x` prefix), and that 64-character event-topic hashes are likewise shortened. No full-length program IDs are printed. Session-relative working-folder names ([removed for publication: local path]) are kept as written. Bracketed notes marked "translator's note" or "[sic]" are additions by the translator.*

# Launchpad landscape — 5 October 2026

> READ-ONLY synthesis (no transaction, no key, no account). It takes up the work of six agents cut off
> by the session limit on 05/10 around 23:31-23:36 (Paris time): their notes and working files are in
> the session's [removed for publication: local path] ([removed for publication: local path], [removed for publication: local path]). Written as the work went on; all
> sections are finished (05/10/2026, ~22:40 UTC).
>
> **Conventions.** [translator's note: in the tables, "v" = volume and "f" = fees.]
> - **DL** = DefiLlama API read on 05/10/2026 at 20:59 UTC (`api.llama.fi/overview/fees` and `/overview/dexs`, detail in
>   [removed for publication: local path]). "24 h" = last day published by DefiLlama at that time;
>   "30 d" = rolling 30 days. DL **fees** are not volumes: on a tax-based ramp, they can exceed the volume.
> - **RPC** = count of `eth_getLogs` (or `getSignaturesForAddress` on Solana) read on a public RPC, on 05/10,
>   UTC window given. The RPC measurements of the cut-off agents are taken up with their exact window.
> - **Covered?** — *yes*: the launchpad's own events are decoded by our collector (`labo/topics.mjs`);
>   *partial*: the launchpad creates a standard Uniswap v2/v3/v4, Solidly, Algebra or PancakeSwap Infinity pool, so the
>   birth and the trades are seen at the DEX level, but not its own events (tax, internal curve, quote asset);
>   *no*: proprietary curve not decoded, or chain absent from our 35 EVM chains (Solana: pump.fun and LaunchLab only).
> - **Judgeable by the radar?** — the radar (`labo/rapports/radar.md`) judges only the collected EVM chains, and within them
>   the DEX families v2/v3/v4/Solidly (`rejouer.mjs`) and the four.meme/Flap curves of BSC and Robinhood
>   (`courbes.mjs`). It does NOT read: the Pons and SunPump curves, PancakeSwap v3/Infinity trades, the Flap curves
>   outside BSC/Robinhood, Ignix, nad.fun. On the evening of 05/10, only Arc, Base, BSC and Robinhood have measurable families
>   (≥ 10 playable pools/h); no verdict is possible on Robinhood ("not judgeable") for lack of resolved issuers (enricher lagging).

## 1. Robinhood Chain (4663) and Arc (5042) — summary (finished part)

Detail and sources: [`lanceurs-robinhood-arc.md`](lanceurs-robinhood-arc.md) (agent [agent id]) and RPC measurements
by the synthesis agent ([removed for publication: local path], `brouillon.txt`).

1. **Robinhood = Pons V2**: proprietary curve (threshold 4.2 ETH) then v4 pool with a 1% hook; **≈ 354 launches/h** measured
   (2,139 from 05/10 15:15 to 21:17 UTC); DL 30 d: $112M in fees, $1.90B in volume; anti-snipe tax 9,900 bps over 3 s
   read on the chain (the doc says "5 s"). Pons V1 and NOXA no longer launch anything (0 in ~22 h).
2. Around it: Flap (official portal, 138 launches/h), Doppler (30 to 59 pools/h depending on the measurement, quoted against a meme or
   a stock), Pools by Uniswap Labs
   (2.8/h), LetsCash (1/h), then about twenty small launchpads (StonkBrokers, Pez = Pons V2 clone, PAIR, Cook Market,
   o1 with anti-snipe 99%→1% over 20 s, Bags, Coinbarrel…) at 0-1 launches in 6 h. Gas subsidy ended on 29/09.
3. **Arc** (public since 16/09): Argus World (locked v4 position, 1-10% tax, "Portal 8" with anti-snipe surtax
   since 22/09; 1 launch/h), LIFT (16.8/h), Peach (8/h, DL volume **self-declared**, no trade seen on
   6 tokens followed for 50 min), FAZE (sniper tax 99% over ≤ 30 s), o1 (no more surtax since 15/09), Foci and SolonPad (Pons V2 clones).
4. Argus's DefiLlama adapter notes **ten Arc launchpads running forks of its code**.
5. No hack recorded on these two chains (`api.llama.fi/hacks`, 05/10).

| Launchpad | Chain | Mechanics | Launches/day | Volume / fees per day (DL) | Fees (schedule) | Public anti-snipe | Date | Covered? | Radar-judgeable? |
|---|---|---|---|---|---|---|---|---|---|
| Pons V2 | Robinhood | own curve → v4 fee 0 + hook | ≈ 8,500 (354/h) | v $13.8M; f $826k | curve 1% + hook 1%, 30% protocol | 9,900 bps decreasing over 3 s (RPC) | 05/10 15:15-21:17 UTC (RPC); DL 05/10 | **yes** (Pons topics) | no (Pons curve not read; volume indicator only) |
| Flap (RH portal) | Robinhood | Flap curve → Uniswap V2 | ≈ 3,300 (138/h) | f $2.6k (RH share) | see BSC | — | 05/10 20:15-21:15 UTC | **yes** | yes in principle; not judgeable for lack of issuers |
| Doppler (Squeeze, AGNT, Long.xyz…) | Robinhood | v4 multi-curve, dynamic-fee hook | ≈ 700 to 1,400 (30 `Initialize`/h via the hook, 05/10 20:20-21:20; 59 tokens/h in `robinhood.md`) | — | 1.1 to 2.5% depending on the integrator | Bankr: decrease over 14 s | 05/10 20:20-21:20 UTC | partial (DEX) | no (meme or stock quote asset, no price) |
| Pools (Uniswap Labs) | Robinhood | direct v4 with no hook 0.25% or "crowd" window | ≈ 70 (2.8/h) | f $9.4k | 0.25% (40% creator) | — | 05/10 15:15-21:17 UTC | partial (DEX) | yes (DEX family) |
| LetsCash | Robinhood | v4 + hook, 1-10% tax | ≈ 24 (1/h) | v $95k | 1-10% tax | none documented | same | partial | yes |
| NOXA / Pons V1 | Robinhood | direct v3 1% | 0 | f $12k / $25k (old pools) | 1% | block 0 closed, per-wallet caps | 05/10 (RPC ~22 h) | partial | — (inactive) |
| o1 | RH, Arc, Base, BSC, X Layer, Monad | single-sided v4 + hook | 0-4 in 6 h per chain | f $9.8k (all chains) | 1% (50/30/20) | 99%→1% over 20 s (no longer on Arc since 15/09) | 05/10 | partial | yes |
| Argus World (+ 10 forks) | Arc | whole supply in a locked v4 position, tax | ≈ 24 (1/h) | f $24k | 1-10%/side tax, 1% base (P8) | decreasing "first seconds" surtax (P8, parameters not read) | 05/10 15:17-21:17 UTC | partial (taxes outside the log) | yes (Arc = control chain) |
| LIFT V1/V2 | Arc | fixed supply in a locked v3/v4 position | ≈ 400 (16.8/h) | f $0.4k | hook fees (V2) | surtax (V2) | same | partial | yes |
| Peach | Arc | curve in the contract → v4 + hook | ≈ 190 (8/h) | v $599k (**self-declared**) | 1% | — | same | **no** | no |
| FAZE | Arc | own curve (BondingCurveV4) → v4 | 0 in 2 h | f $1k | 0.3-10% by choice | 99% linearly decreasing ≤ 30 s | same | no | no |
| Foci, SolonPad, Pez | Arc, RH | **Pons V2 clones** | 0-1 in 6 h | f ≤ $68 | as Pons V2 | as Pons V2 | same | yes (Pons topics) | no |

## 2. Base (8453) and Ethereum (1) — summary (finished part)

Detail and sources: [`lanceurs-base-ethereum.md`](lanceurs-base-ethereum.md) (agent [agent id]).

1. **Base: 6,089 v4 pools born in 24 h** (04/10 21:17 → 05/10 21:17 UTC, RPC measurement). The big issuers: Zora coins
   (1,731 creations/24 h; anti-snipe 99% → base fee in 10 s), Doppler (963 `Create`/24 h, including Bankr), clanker
   (211/24 h; recommended anti-snipe 80% → 5% in 30 s), flaunch (199/24 h, new PositionManager), BaseStonk (50/24 h).
2. Two unidentified families on Base: RWAB20/TaxRWAERC20 factories (107 pools/24 h) and a new hook per pool quoted in
   "mmETH" (~475 pools in 6 h).
3. **Ethereum: 863 v4 pools/24 h**, including Stockereum 270 (no. 1, anti-snipe 99% → fee in 20 s, still active); Legion
   (merit-based sales: 48.38M USDC committed on Jumper), Uniswap CCA (auctions, 213 on ETH since 10/07), Klik, moto.fun
   (28/09); 1776.MEME dead.
4. DefiLlama **underestimates** Zora (hook 2.6.0 absent), flaunch (old PositionManager), BaseStonk (V6B/V7 absent),
   CCA (v2.0.0 factory absent) and counts only one token for Umia.
5. Our sheets of 05/10 have already judged Base DEAD for the recipe (punisher 1627o [sic], honeypots); the Zora coins remain
   a clean terrain but with no flow at t+20 s.

| Launchpad | Chain | Mechanics | Launches/day | Volume / fees per day (DL) | Fees (schedule) | Public anti-snipe | Date | Covered? | Radar-judgeable? |
|---|---|---|---|---|---|---|---|---|---|
| ZORA Coins | Base | direct v4, single hook, Doppler multi-curve | 1,731 | v $8.1k (DL underestimates) | 1% (50% creator) | 99% → base in 10 s | 04-05/10 (RPC 24 h) | partial (DEX) | yes — 0 playable at t+20 s |
| Doppler (Bankr…) | Base | v4 multi-curve / auction | 963 | Bankr f 30 d: $0.94M (Base) | pool 0.7% + ≈ 1.1% taken by the hook | Bankr: decrease over 14 s, 2% max/wallet 5 min | same | partial | yes |
| clanker | Base (+ ETH, Arb, Unichain, Monad, RH) | single-sided v4 | 211 | f $10.5k | 1-3% + 20% to Clanker | 80% → 5% in 30 s (recommended) | same | partial | yes |
| flaunch | Base, RH | v4, hook = PositionManager, fixed price 5-30 min | 199 | f $5 (stale adapter) | creator share 0-100% | fixed-price fair launch; Game Mode | same | partial | yes |
| BaseStonk | Base, RH, Arc | v4 from block 1, quoted in stables/stocks | 50 | v $67k ($5.66M on 17/08) | 1% or 0-10% | toll ≤ 99%, window ≤ 30 min | same | partial | yes |
| Virtuals | Base, RH, Arc | VIRTUAL curve → Uniswap V2 at 42,000 VIRTUAL | 10 (Base) | f $13k (AI Agents category) | 1% | 99% → 1% over 0 s to 98 min | same | no (curve) | no |
| Umia | Base | CCA auction ~1 week → v4 USDC 1% | ≈ 0 (1 real sale) | v $317k (a single token) | 50% of fees to the protocol | auction | 26/08-02/09 | no | no |
| Stockereum | Ethereum | direct v4, ETH or stocks | 270 | absent from DL | 1-3% | 99% → fee in 20 s | 04-05/10 (RPC 24 h) | partial | yes — closed for the recipe |
| Legion, Uniswap CCA | Ethereum (+ Base) | sales / auctions | ≤ 3/day | $48.7M and $75k over 30 d (commitments) | 2.5-3% / levy | — | 29/09-05/10 | no | no |

## 3. BSC (56)

RPC measurements taken up from the cut-off BSC agent ([agent id], [removed for publication: local path] and `detail24.txt`):
24 h window = blocks 125,748,095 → 125,940,095 (**04/10 21:26:56 → 05/10 21:28:14 UTC**); 6 h window = blocks 125,894,356 →
125,942,356 (05/10 15:45 → 21:45 UTC). RPC `bsc-rpc.publicnode.com` / `rpc-bsc.48.club`; the 403 responses were retried
successfully (the script raises an error after 10 failures; it ran to the end). BSC block = 0.45 s (192,000 blocks in 24 h 01 min).
Topics verified by `cast keccak` on 05/10 (identical to `labo/topics.mjs`).

| Launchpad | Mechanics | Launches/day (RPC 24 h) | Volume / fees per day (DL) | Fees (schedule) | Public anti-snipe / safeguards | Covered? | Radar-judgeable? |
|---|---|---|---|---|---|---|---|
| **Flap** (Portal `0xe2cE6a…`, v5.23.1) | Constant-product curve with virtual reserves, supply 10⁹; graduation when 800M are sold (≈ 16 BNB or ≈ 10,000 USD1 on the current curve); taxed token → PancakeSwap **V2** only; untaxed → V3, otherwise V2 [FD] | **18,140 creations, 115 graduations** (`LaunchedToDEX`); 120 to 1,296 creations/h, trough 16:30-01:00 UTC | v **$27.6M** (DL point of 05/10, BSC $27.63M); f $1.47M | curve 1% + token tax added from the curve (since v5.4.0) + ≤ 0.3% protocol [FD] | optional **buy quota per `tx.origin`**, in bps of supply (v5.14.16) [FD]; GMGN reports configurable sell taxes up to 100% [DF] | **yes** (Flap topics) | **yes** (`courbes.mjs` + `flap-cotes.mjs`): RED on 05/10 (second buyer 11%, robust replay −11%) |
| **four.meme** (TokenManager2 `0x5c9520…`) | Curve → PancakeSwap (20% of supply + funds raised); quote assets BNB, USDT, USD1, UUSD, bStocks (NVDAb); "X Mode"; OpenFour (modular modes) [4M] | **9,588 creations, 2 graduations** (`LiquidityAdded`); 172 to 742/h | v $1.63M (DL point of 04/10); f $16k | 1% (min 0.001 BNB) [4M] | X Mode (30/10/2025): fees decreasing block by block after creation, parameters published as an image only (not read); creator buy in the creation tx [4M] | **yes** | **yes**: RED on 05/10 |
| **Genius.fun** (factories `0x78EAE9…`, `0x37eE8A…`) | **Pons V2 clone**: same `TokenLaunched`/`CurveBuy`/`CurveSell` topics (verified); graduation 15 BNB to **PancakeSwap Infinity CL** + hook [DF2, DL] | **82**; quote assets: GENIUS (its own token, threshold 30,000) 39, BNB (15 BNB) 20, BNCB 12, 10 others (including 9 tokenized stocks) | v $318k (05/10); $17.9M on 18/09; f $13.6k | up to 1.25% to the creator + 0.25% buyback [DF2] | "launch window" surtax included in `CurveBuy.fee` (parameters not read) [DL] | **yes** (Pons topics); graduated pool seen at DEX level (Infinity) | **no** (Pons curve and Infinity trades not read by the tools) |
| Loong (factory `0x60dDcE…`) | Fork of Genius v4.2; 1% per trade (0.70 creator) [DL] | 0 | f 0 ($3.8k on 29/09, then ≈ 0) | 1% | — | yes (Pons topics) | no |
| OpenFour (core `0xebe7b6…`) | Modular launch modes of four.meme (GoPlus Creator Incentives, Skill Royalty, Lista V2…) [4M] | 15 | — | 0.02% → 1% to the creator depending on market cap [4M] | — | **no** (`TokenCreated` with 20 fields not decoded) | no |
| o1 (`0xee3e86…`) | Uniswap v4 pool + hook | 1 (+ 3 by an unverified issuer `0x29cad9…`, in 6 h) | — | 1% | 99% → 1% over 20 s | partial (DEX v4) | yes (DEX family) |
| Binance Alpha | **Not a launchpad**: DL counts the fees of the Binance Alpha app (`FeeCollected`) | — | f $41k (05/10), of which BSC $36k | — | — | — | — |
| Meme Rush (Binance Wallet × four.meme) | four.meme launches reserved for verified Binance Wallet users (announced 09/10/2025): three-stage curve (New, Finalizing, Migrated), tokens non-transferable during "New" [MR]; 2026 status not verified | (within four.meme) | — | — | verified access | yes (via four.meme, not verified) | — |
| Holoworld, Lista Pre-IPO, CheesePad, FairyLaunch, hodl.dance, Luna.fun, Puppyfun, PinkSale | — | ≈ 0 | f 30 d ≤ $2.4k each (DL) | — | — | — | — |

**What the quote-asset and tax measurements say (Flap, 6 h, 2,208 creations).**
- **Quote asset**: BNB 1,105 (50%), then **tokenized stocks**: BNCB 463 (21%), SPCXB 134, QQQB 86, NVDAB 76, FXIon
  (Ondo) 76, DJTB 31, MRNAB 24…; KGST 62, ZEC 30. Names read by `symbol()`/`name()` at the RPC on 05/10 ~22:00 UTC:
  **BNCB = "CEA Industries", a tokenized stock, not a meme** — correction to `bsc.md` ("BNCB (a meme) 19%").
- **Tax**: 2,134 tokens out of 2,208 have a declared tax (`FlapTokenTaxSet`): 1% 876, **8.99% 525**, 3% 362, 2% 114,
  2.5% 103, 9-10% 140. On the curve, the tax is added to the 1% fee: a token at 8.99% costs ~10% per side.
- Migrator codes (`TokenMigratorSet`): 1 → 2,134 tokens, 3 → 74 (meaning of the codes not verified).

**DL trend (monthly).** Flap: volume $42M (May) → $131M (Jul.) → **$743M (Aug.)** → $584M (Sept.) → $142M from 1 to
5/10; fees $41.7M in September (against $12.4M in August: taxes are counted in fees). four.meme: volume
$270M (May) → $54M (Aug.) → **$33M (Sept.)**, fees $2.09M → $0.22M. Genius.fun: $50.4M in September of which $17.9M on
18/09, then $0.3-1.1M/day. Sources: `api.llama.fi/summary/{dexs,fees}/<slug>`, read on 05/10 ~21:00 UTC.

**Changes July-October 2026 (BSC).**
- **01/08: Flap overtakes pump.fun in daily revenue** ($1.18M against $1.10M for the whole Pump family), ×40 in two
  weeks, after the relaunch on Flap of 币安人生 at the end of July; four.meme down to ~$17k/day [DF, 03/08/2026].
- Flap: "BNB Stonks Szn" ($4M) for memes quoted in bStocks, in September [X @flapdotsh, search excerpt];
  official portals on Robinhood, Base (`0x0000BC…`), X Layer, Monad (doc read on 05/10) — **the "Flap clone" on Base
  noted in `base.md` is the official portal**.
- four.meme: taxed tokens (02/02/2026, Foresight News via Binance Square), Stock Meme (bStocks), OpenFour.
- **17/09: launch of Genius.fun** (press release, Cayman); Loong (fork) on 25-29/09, already shut down.

Sources: [FD] `docs.flap.sh` (pages `bonding-curve`, `list-on-dex`, `protocol-economics`, `prebond-tax`,
`v5.14.16-buy-quota`, `deployed-contract-addresses`, read on 05/10); [4M] `four-meme.gitbook.io` (how-it-works, OpenFour,
Stock Meme, product update #6) and `github.com/four-meme` (classic); [DF] thedefiant.io/news/defi/flap-overtakes-pump-fun-in-daily-revenue-with-1-18-million
(03/08/2026); [DF2] Genius.fun press release on thedefiant.io (17/09/2026); [DL] DefiLlama adapters (`helpers/genius-fun.ts`,
`fees/loong.ts`, `fees/binance-alpha.ts`); [MR] trustwallet.com/blog (Meme Rush), binance.com/en/support/announcement/detail/88a76504bdc045cabd9b7e14ef336540,
cryptopolitan.com/binance-wallet-meme-rush-early-token-access/, beincrypto.com/binance-wallet-meme-coin-market-expansion/.

## 4. Solana and SVM

Sources: our measurements of 04/10 23:00 → 05/10 18:00 UTC ([`solana.md`](solana.md), `logsSubscribe` collector, canary
100%); RPC probe by the cut-off Solana agent ([agent id]) on `api.mainnet-beta.solana.com`, 05/10 21:12-21:20 UTC
([removed for publication: local path]); DL (series read on 05/10 ~21:00 UTC); **Pine Analytics, "Raydium quarterly report Q3 2026",
published on 05/10/2026 17:51 UTC** (pineanalytics.substack.com/p/raydium-quarterly-report-q3-2026); public pump.fun
doc (github.com/pump-fun/pump-public-docs, dated commits). Slot measured: **0.2676 s** (not 0.4 s). The EVM radar does not cover
Solana; Solana has its own tool (`labo/solana-courbes.mjs`), which judged pump.fun and LaunchLab DEAD for the recipe on 05/10.
Columns common to the whole table: **radar-judgeable = no** (EVM radar only; judged outside the radar by
`solana-courbes.mjs` for pump.fun and LaunchLab); **dates** = DL point of 04/10 (05/10 for BONK.fun and DAMM v2), our measurements
of 04/10 23:00 → 05/10 18:00 UTC, probe of 05/10 21:12-21:20 UTC, Pine for September.

| Launchpad | Program | Mechanics | Launches/day | Volume / fees per day (DL) | Fees (schedule) | Public anti-snipe | Covered? |
|---|---|---|---|---|---|---|---|
| **pump.fun** | `6EF8rr…` | Constant-product curve with virtual reserves → PumpSwap; quote assets SOL, USDC (since 07/05/2026), PUMP, tokenized stocks; "mayhem" mode (fee-free agent `BwWK17…` that moves the reserves); "holder rewards" coins since 12/09/2026 | **≈ 34,000** (1,417/h over 19 h, ours); 1.0M in September (Pine) | v **$184M** (04/10); f $2.40M | dynamic fees depending on market cap (doc: "Monday 1 September", hence 2025); ≈ 2.5% per round trip (ours) | none at the protocol; creator buy in the creation tx | **yes** (logsSubscribe) |
| PumpSwap | `pAMMBa…` | pump.fun graduation AMM; **virtual** quote reserves since 15/07, **possibly negative since 30/09/2026** | (graduations: 3.4% of launches in Sept., Pine) | v **$398M** (04/10); f $5.16M | — | — | **partial** (pool creations only) |
| **StonkFun** (LaunchLab platform, fee holder `AvVCE7…`) | LaunchLab `LanMV9…` | Memes **quoted in tokenized stocks** (xStocks…), SOL, ZEC, wBTC, STONK; LaunchLab curve → **Raydium CPMM**, locked liquidity (Burn & Earn); reward tokens with 1-3% transfer tax [PI] | 149,085 in Sept. (≈ 5,000/d) [PI]; LaunchLab "other quote assets" 77.4/h on 05/10 (ours) | v **$17.3M** (04/10, curve); f $0.58M; Sept.: $921M on the curve + $1.89B in graduated pools [PI] | 1% platform on the curve + CPMM creator fee | — (transfer tax on some tokens) | **yes** (via LaunchLab) |
| **Raydium LaunchLab** (all) | `LanMV9…` | Curve configurable by the platform (19 parameters, Token-2022 quote asset, platform fee ≤ 500 bps since August 2026) → CPMM | 156,294 in Sept., 5,420 in Aug. [PI]; **91/h** on 05/10 (14.1 SOL + 77.4 others, ours) | v $7.5M (04/10); f $0.25M | 1.3% by default (0.25 protocol + 1 platform + creator) [DL] | — | **yes** |
| BONK.fun (+ Graphite, joint venture) | via LaunchLab | Historical LaunchLab platform | — | f $189k (05/10); **$8.43M in Sept.** (against $0.17M in Aug.), declared by `revenue.letsbonk.fun` | 1% platform | — | yes (via LaunchLab) |
| **Meteora DBC** (+ Jupiter Studio, Moonshot Create, Bags, EasyA Kickstart, Dynamito, Orynth, Trends, user.fun…) | `dbcij3…` | Curve configured by the partner → DAMM v1/v2 | not measured (≈ 7 successful tx per slot on the program) | v **$20.6M** (04/10); f $182k | defined by the partner | **fee scheduler / rate limiter** configurable per partner [MD] | **no** (events by self-CPI) |
| Meteora DAMM v2 | `cpamdp…` | Graduation AMM (DBC, Bags…) | — | v $10.1M (05/10) | — | fee scheduler possible | no |
| Rise.rich (Mayflower) | `AVMmmR…` | Launch with floor and borrowing | ≈ 380 tx/d on the program | v $56k (04/10); $108.6M in April, $2.1M in Sept. | 25% creator/floor, 75% team | — | no |
| Rapid Launch, Moonshot Create, Jupiter Studio, Bags (Solana), Ansem.io (on pump.fun), Squeeze (on LaunchLab), Archade | various | platforms on pump.fun, LaunchLab or DBC | low | f 30 d: Rapid Launch $160k, Moonshot $75k, Jupiter Studio $61k, Bags $405k, Ansem $47k ($1.92M in Aug.) | 1% most often | — | depending on the host program |
| Heaven, boop.fun, Believe, Orca Wavebreak, sendfun, Metaplex Genesis, keep.coffee, Popi, PigeonHouse, Dumpflow | various | — | ≈ 0 (last program tx: Wavebreak 30/09, Dumpflow 31/08, keep 25/08, Popi 28/07, PigeonHouse 17/04) | ≈ 0 | — | — | no |

**SVM outside Solana** (DL `overview/dexs/<chain>`, read on 05/10): Fogo $13.7k of DEX volume in 24 h (a single DEX, Valiant), Eclipse 0,
Soon / soonBase / svmBNB 0. **No measurable launch market.**

**Events: what `logsSubscribe` sees** (probe, 3 transactions per program): pump.fun, PumpSwap and LaunchLab
emit in the logs ("Program data") AND by self-CPI; Meteora DBC, DAMM v2 and sendfun **by self-CPI only** (invisible
to the logs: `getTransaction` or a Geyser stream is needed); Raydium CPMM/CLMM, Heaven, boop, Moonshot: logs.

**Throughput to absorb if we added a program** (probe of 05/10 21:20 UTC, 5,000 signatures per program, slot 0.2676 s;
median sizes of 2 to 8 transactions): PumpSwap **≈ 390 successful tx/s**, ~4.5 KB of logs/tx → ≈ 1.8 MB/s in logs;
DAMM v2 ≈ 113/s; Meteora DBC ≈ 26/s but ~13.8 KB per `getTransaction` (≈ 26 requests/s: out of reach of a public RPC);
LaunchLab ≈ 3.7/s; pump.fun ≈ 88/s. Snapshots of 7 s to 4 min: orders of magnitude, not averages.

**Changes July-October 2026 (Solana).**
- **05/09: StonkFun switches all its launches to LaunchLab**; LaunchLab goes from 119 launches on 4/09 to 5,098 on 6/09,
  6,214/day on average afterwards, peak 12,261 on 21/09; StonkFun = 149,085 of the 156,294 launches of September; the first 4
  days of October are 43% below the daily fees of September [PI]. **This explains LaunchLab's ×24 at DL.**
  (DL gives $743M of StonkFun volume in September against $370M for all of LaunchLab: the two adapters contradict each other;
  Pine gives $921M of StonkFun curve.)
- LaunchLab opened to third-party platforms (five updates from 17 to 31/08): Token-2022 quote asset, fees ≤ 500 bps [PI].
- pump.fun: USDC quote asset (07/05), PumpSwap virtual reserves (15/07), **"holder rewards" coins and end of cashback
  (12/09)**, negative virtual reserves (30/09) [PF].
- Ansem.io (17/08, already shut down), vibes.fun (16/09), Dynamito (18/09), user.fun (12/08): new and at ≈ 0 [DL].
- Pine (same report): pairs with a "tokenized stock" leg did $4.14B on Raydium in Q3; memes
  **quoted in stock** $1.71B against $30M in Q2.

Sources: [PI] Pine Analytics (above); [PF] github.com/pump-fun/pump-public-docs (commits of 07/05, 15/07, 12/09,
29/09/2026); [MD] github.com/MeteoraAg/dynamic-bonding-curve (README); [DL] adapters `fees/stonkfun.ts`,
`fees/launchlab`, `fees/letsbonk`, `fees/rise-launchpad.ts`, `fees/ansem-io`.

## 5. Other EVM chains

Sources: notes and files of the cut-off "other EVM" agent ([agent id], [removed for publication: local path]); measurements by
the synthesis agent ([removed for publication: local path]); our triage of 05/10 ([`triage-longue-traine.md`](triage-longue-traine.md),
windows of 12-48 h ending around 18:30-19:00 UTC); DL (`summary/{dexs,fees}` series, read on 05/10 ~21:00 UTC); public
launchpad APIs (Ignix, bot.fun); `eth_chainId` verified by me on 05/10 around 22:05 UTC on 14 public RPCs (all
matching). On these chains the radar sees **no mold with ≥ 10 playable pools/h** (evening of 05/10).

| Launchpad | Chain (id) | Mechanics | Launches/day | Volume / fees (DL) | Fees (schedule) | Public anti-snipe | Date | Covered? | Radar-judgeable? |
|---|---|---|---|---|---|---|---|---|---|
| **Ignix** (Manager `0x96b51c…`) | X Layer (196) | Own curve (`Trade` event with 10 fields), graduation at **85 OKB** → v2 pool (7,731) or v4 (292); per-token dividends and tax router; quote asset OKB **or tokenized stocks** (61% of the last 1,500 outside native) | **190 to 590** (15/09-05/10); 8,023 since 19/08, **65 graduated** (0.8%) | v Sept. $6.0M, $1.5M from 1 to 5/10; f Sept. $138k | — | — | API `api.ignix.bot/v1/launches` read on 05/10 ~21:20 UTC | **no** (curve; X Layer collected since 05/10) | no |
| Flap (Portal `0xb30D8c…`) | X Layer | Flap curve | **≈ 120/h** (05/10 20:15-21:15 UTC); triage of 05/10: 193/h, second buyer 0.2% ("creator spam") | v ≈ $8.5k (05/10) | 1% + tax | optional buy quota | 05/10 | yes (Flap topics) | no (quote asset unreadable: RPC capped at 100 blocks) |
| OkieLaunch, xdock.meme | X Layer | — | 0 logs in 2 h (triage) | 0 since 10/2025 and 06/2026 | — | — | 05/10 | — | — |
| **nad.fun V2** (curve `0x9f3832…`) | Monad (143) | Virtual-reserve curve (70,000 MON) in WMON or LVMON → **NadFun DEX** (Uniswap V2-type pairs, creator/protocol fees on top); creation fee 10 MON, graduation fee 1,000 MON | **≈ 26-36**: 1.1/h (triage, 12 h); 9 `Create` in 6 h (synthesis agent, wrongly labeled "graduations"); 24 in 21.8 h (cut-off agent, not rechecked) | V1: v Sept. $3.7M, f $88k; V2 series absent (error 400) | 1% protocol + 1% creator on the curve | **buy penalty 80/40/20/15/10/10/5% on blocks 0 to 6** (0 afterwards; ≈ 2 s), creator buy exempt [ND] | 05/10 | **no** (curve); graduated pairs: standard `PairCreated`, partial | no |
| Flap, NOXA, o1, clanker, Printr, MonLock (03/10), Monad Grid | Monad | — | 0 in 1 h (Flap, NOXA, o1, 05/10 20:15-21:15) | Flap Monad ≈ 0; o1 Monad f 30 d $6k | — | — | 05/10 | — | — |
| **Kumbaya** | **MegaETH (4326)**, ~10 ms blocks | "Social launchpad" + concentrated-liquidity DEX; curve then graduation [KU] | ≈ 2.6 pools/day on the DEX (0.11/h) [GT] | **DEX: $785k (24 h)**, $9.6M (30 d); $45M in June | — | — | DL 05/10; GT 05/10 ~21:30 | **no** (chain absent) | no |
| NOXA, basedbid, MegaPump (DL 23/09), Backed AAO | MegaETH | — | NOXA: 0 logs in 30 min (triage); MegaPump site offline (eth.limo with no content, 05/10) | ≈ 0 | — | — | 05/10 | no | no |
| **Tsunami** (factories `0x5934a5…`, `0x1fC165…`) | Ink (57073) | Curve → **Calamari** pool (v4 with hook) | **peak of 455 on 14/09**, then 1 to 2/day in early October (Blockscout logs up to 02/10 14:32 UTC) | v Sept. $4.06M, $36k from 1 to 5/10 | 1% platform, cap 5% [TS] | — | 02/10 | partial (Calamari pool = v4) | no |
| Sentry (V4 factory `0xcF44b1…`) | Ink, Robinhood | Direct v4 pool, locked liquidity; WETH and xStocks routers | ≈ 48 (2/h, triage) | f 30 d: Ink $55k, RH $61k | 1% to the router | — | 05/10 | partial (DEX) | yes (no mold ≥ 10/h) |
| LiquidLaunch, PerpMe, DexLaunch (`BondingCurvePad 0x16C100…`), HookOS, SpinUp, HyperPie | HyperEVM (999) | own curves or direct pools (PerpMe quoted on Project X) | **0 logs in 1-2 h** for LiquidLaunch, Alt Fun, HyperPie (triage) | LiquidLaunch v Sept. $251k ($3.6M in Aug.); HookOS and SpinUp ≈ 0 since Aug.-Sept. | — | — | 05/10 | no | no |
| **bot.fun** (factory `0x279dc5…`) | **Eden (714)**, gas in TIA | Virtual-reserve curve (3,071.84 TIA), graduation at 793.1M sold → in-house DEX | **≈ 12** (50 between 01/10 21:39 and 05/10 20:49 UTC), **0 graduated**; median 69 trades per token | v Sept. $289k; 30 d $253k | 1.25% (0.30 creator, 0.95 protocol) | — | API `bot.fun/api/v1`, 05/10 | no (chain absent) | no |
| Gate Fun | GateLayer (10088) | curve | — (0 logs in 6 h, triage) | v Sept. $35k | — | — | 05/10 | no | no |
| Bubble Curve | Shido (9008) (+ Monad) | curve, 79.31% of supply → Shido DEX | — | v Sept. $66k | — | transfers blocked before graduation | 05/10 | no | no |
| UniDerp; Arena Launch; DyorSwap; Durianfun, Junoswap; ZOO.FUN; Degen Express, HEDGEhog; Kensei; MoonPie; Adexto; Phos; Quainance; LuckyLaunch/AvaLove; Copump; Printr | Unichain; Avalanche; Plasma/Stable; KUB; Abstract; Sonic; Katana; Asset Chain; 0G; Xphere; Quai; Avalanche/RH; 9 chains; 8 chains | — | ≈ 0 | v Sept.: UniDerp $28k, Arena $39k, DyorSwap $19k ($1.6M in July), Durianfun $0.3k; the others 0 | — | — | 05/10 | depending on the chain | no |

**Chains outside our 35, RPC verified** (`eth_chainId` = expected, 05/10 ~22:05 UTC): Eden 714 `rpc.eden.gateway.fm`;
MegaETH 4326 `mainnet.megaeth.com/rpc`; GateLayer 10088 `gatelayer-mainnet.gatenode.cc`; Plasma 9745 `rpc.plasma.to`;
Stable 988 `rpc.stable.xyz`; Shido 9008 `evm.shidoscan.net`; KUB 96 `rpc.bitkubchain.io`; Asset Chain 42420
`mainnet-rpc.assetchain.org`; Intuition 1155 `rpc.intuition.systems`; Merlin 4200 `rpc.merlinchain.io`; 0G 16661
`evmrpc.0g.ai`; Morph 2818 `rpc.morphl2.io`; Sei 1329 `evm-rpc.sei-apis.com`; Xphere 20250217 `en-bkk.x-phere.com`.
BOT Chain = 677 (DexLaunch doc; RPC not tested).

**DEX pool birth rate per chain** (GeckoTerminal snapshot by the main agent, [removed for publication: local path],
last 20 pools, read between 21:10 and 21:57 UTC on 05/10; I did not call the API again): Solana 2,850/h, BSC 243/h,
Robinhood 164/h, Base 93/h, Arc 52/h, Ethereum 19/h, PulseChain 4.3/h, X Layer 1.6/h, HyperEVM 0.84/h, Arbitrum 0.68/h,
Cronos 0.58/h, Avalanche 0.52/h, Ink 0.39/h, Monad 0.25/h, MegaETH 0.11/h; **empty**: 0G, Abstract, ApeChain, Berachain,
BOT Chain, Celo, GateLayer, Hemi, and about a hundred others. GeckoTerminal does not index most proprietary curves
(Ignix, nad.fun, bot.fun), hence the gaps with the table rows.

**Changes July-October 2026 (other EVM).**
- **Ignix (X Layer)**: first launch on 19/08, listed at DL on 28/08; 8,023 launches as of 05/10 [API].
- **nad.fun V2** (Monad): listed at DL on 06/07; public per-block anti-snipe penalty [ND].
- **Tsunami** (Ink): first pool on 31/08, peak of 455 launches on 14/09, almost shut down at the end of September.
- **bot.fun** (Eden, TIA-gas chain): listed on 20/07.
- **MegaETH**: MegaPump (DL 23/09), Backed AAO (04/05); Kumbaya goes from $45M (June) to $7.4M (Sept.).
- De facto closures (0 since): Kensei (Katana) May 2026, MoonPie July, ZOO.FUN July, HookOS August, Printr August, SpinUp
  24/09, LiquidLaunch 30/09; DyorSwap ÷80 between July and September.
- Flap opens Morph (curve fee 2.5%) [FD].

Sources: [ND] github nad.fun (`nad_bc.md`, "NadFun V2 Bonding Curve Integration", table `snipingPenaltyTable`, and ABI
`BondingCurve.json`: topics `Create` `0xac11ce…`, `Graduate` `0xc0682a…`, `SnipingPenalty` `0x9cf337…` recomputed by
`cast keccak`); [TS] docs.tsunami.trade/overview/fees.md; [KU] Kumbaya documentation (GitBook, home page); [GT]
GeckoTerminal snapshot above; [FD] docs.flap.sh.

## 6. Non-EVM chains outside Solana

Sources: files of the cut-off non-EVM agent ([agent id], [removed for publication: local path]): Hyperliquid public `info` API
(read on 05/10 21:12:54 UTC), Sui GraphQL (Cetus `CreatePool` events), Emojicoin registry (Aptos, 05/10 21:23 UTC),
DL `summary/{dexs,fees}` series (read on 05/10 ~21:00 UTC); GeckoTerminal snapshot by the main agent (section 5). **Our collector holds none
of these chains and the radar can judge none of them** (except Tron, collected through its EVM JSON-RPC).

| Launchpad | Chain | Mechanics | Launches/day | Volume / fees (DL) | Fees | Date | Data access (read) |
|---|---|---|---|---|---|---|---|
| HIP-1 spot deployment | HyperCore (Hyperliquid) | 31 h gas auction for a ticker; **floor at 500 HYPE** (auction opened 05/10 06:00 UTC, current price = floor) | **≈ 0.1**: 28 deployments dated from 19/05 to 22/09, mostly **tokenized stocks** (NVDAX, SPYX, QQQX, TSLAX, AAPLX, CRCLX…); 503 tokens, 330 spot pairs | whole spot book: $88M/24 h | — | 05/10 | `info` API (`spotMeta`, `spotDeployState`, `tokenDetails`) |
| Alt Fun | Hyperliquid L1 | launches routed through a "Zap" contract | — | v May $41.0M → Aug. $9.1M → **Sept. $1.0M** | 0.75% (0.5 protocol, 0.25 creator) | 05/10 | DL adapter |
| Hfun, SpinUp, LiquidLaunch | Hyperliquid L1 / HyperEVM | — | ≈ 0 | Hfun 0 since Jan. 2026; SpinUp 0 since 24/09 | — | 05/10 | — |
| topblast.lol | TON | curve, 1% | — | v **$1.43M on 15/08**, ~$50-60k/d mid/late Sept., **$1.3k on 04/10**; f Sept. $14.6k | 1% | 04/10 | toncenter / tonapi |
| DeDust "Uranus" (meme module, `Meme`/`MemeFactory`) | TON | curve built into DeDust (2026 kit) | 9 of the last 20 TON pools indexed (GT); TON ≈ 2.2 pools/h all DEXs | DeDust $668k/24 h, STON.fi $1.9M/24 h | partner/referrer fee in bps | 05/10 | `@dedust` SDK (Uranus) |
| GasPump, Blum, BigPump, TON Pump, Wagmi, Grambo | TON | curves | 0 | GasPump 0 since 02/09/2026; Blum and BigPump since 31/10/2025; Grambo (27/06/2026) since mid-Sept. | — | 05/10 | — |
| sTONks | TON, Solana… | — | — | v May $7.7M → Sept. $92k | — | 05/10 | — |
| Cetus (pool creation) | Sui | CLMM pools, most against SUI | **≈ 77** (400 `CreatePool` from 30/09 15:02 to 05/10 19:48 UTC; 394 against SUI; one same sender = 18 of the last 40, one every 5 min) | Cetus $18M/24 h (Sui + Aptos) | — | 05/10 | **GraphQL or gRPC only**: the public Sui node JSON-RPC is withdrawn ("deprecated", response of 05/10) |
| Movepump, other Sui curves | Sui | — | — | DL series in error 400 | — | 05/10 | — |
| Emojicoin.fun | Aptos | emoji markets | 2,956 markets since inception; 711,346 cumulative trades | v Sept. $3.6k | — | 05/10 21:23 UTC | node REST API |
| Launchy | Starknet | curve → Ekubo pools | **70 tokens from 18/09 22:58 to 25/09 11:11 UTC, then 0** until 05/10 | f Sept.: $105 (+ $3.9k "Launchy Pools") | — | 05/10 | Starknet RPC |
| FirstLedger | XRP Ledger | launches on the XRPL AMM | ≈ 23 (0.96 pool/h, 20/20 FirstLedger, GT) | — | — | 05/10 | GT only (not verified) |
| Meme Cooking | Near | curve | — | v Sept. $9.9k | — | 05/10 | — |
| SunPump | Tron | curve → SunSwap v2 | ~4/day (`labo/topics.mjs`) | **f Aug. $64.6k, Sept. $42.0k** | — | 04/10 | **collected** (Tron EVM JSON-RPC) |
| MemeJob; Atmos Studio; KaspaCom LFG; RlyFun; WAX.FUN | Hedera; Supra; Kasplex/Igra; Radix; WAX | — | ≈ 0 | MemeJob $23/month in fees; Atmos $5.2k in Sept.; the others with no series | — | 05/10 | — |
| Odin.fun; Snek.fun | ICP (Bitcoin); Cardano | curves | not read | — | — | — | Odin: Cloudflare page; Snek: page read, no figures |
| Flashnet | Spark (Bitcoin) | **DEX and cross-swaps, not a launchpad** (doc: "Orchestra") | — | $83.5M/24 h; $2.52B/30 d | — | 05/10 | `flashnet.xyz` API |

**What changed in 2026 and could reopen a closed file**: nothing decisive. TON activity fell back to almost nothing (topblast
$1.3k on 04/10, GasPump shut down on 02/09); Sui has ~77 pool creations per day, a good part of them by one same bot;
launches on HyperCore are almost only tokenized stocks, at the auction floor; Launchy (Starknet) lasted one week.
Only infrastructure fact: **Sui's public JSON-RPC is withdrawn** — any future Sui measurement goes through GraphQL/gRPC.

## 7. News July-October 2026

**The overall figure.** DefiLlama lists 318 launchpads ("Launchpad" category, `protocols.json` read on 05/10 20:59 UTC);
**107 were listed since 1 July** (July 25, August 16, **September 59**, 1-5 October 7), including **41 on Robinhood
and 18 on Arc**, then Solana 5, Monad 4, Base 3, BSC 3, Ink 2, Avalanche 2, Hyperliquid 2, MegaETH 2. The 2026 wave is
EVM, on the two new chains (Robinhood opened on 01/07 according to Pine; Arc public on 16/09).

**The cross-cutting fact: memes quoted in TOKENIZED STOCKS.** Flap (≈ 40% of BSC launches over 6 h on 05/10, campaign
"BNB Stonks Szn"), StonkFun (149,085 LaunchLab launches in September), Ignix (61% outside OKB), Genius.fun (17/09), four.meme
"Stock Meme" (NVDAb), Pons V2 (NVDA, SPY, COIN…), Long.xyz (Doppler, Robinhood), pump.fun (free quote asset), BaseStonk, Hedge Fun
(22/09). On Raydium, memes quoted in stock go from $30M (Q2) to **$1.71B (Q3)** [Pine]. Our tools classify these
tokens as "no quote asset" or "other quote assets": this is our biggest blind spot (see § 8, point 4).

| Date (2026) | Chain | Event | Source |
|---|---|---|---|
| 01/07 | Robinhood | Chain opening | Pine, Raydium Q3 report |
| 06/07 → 20/07 | Monad, Eden | nad.fun V2 (listed DL 06/07; deployment dated 11/05 at the RPC by the cut-off agent), bot.fun (20/07) | DL `protocols.json` |
| 08-12/07 | Robinhood | clanker and Uniswap "Pools" factories (08/07), Doppler (10/07), Bags V1/V2 (10 and 12/07), Flap portal | `lanceurs-robinhood-arc.md` |
| 11/07 | Robinhood | **NOXA suspends its creations** (interface cut two days later) | Galaxy Research, 30/07 |
| 13/07 | Robinhood | Pons V1: 90/10 split then 70/30 within the day | Pons docs + RPC |
| 15/07 | Solana | PumpSwap: virtual quote reserves | github pump-public-docs |
| 23/07 | Solana | The STONK token starts trading | Pine |
| late July → 01/08 | BSC | Relaunch of 币安人生 on Flap; **Flap overtakes pump.fun in daily revenue on 01/08** ($1.18M) | The Defiant, 03/08 |
| 30/07 → 05/08 | Robinhood | First "Pools" (Uniswap Labs) launch on 30/07, public opening on 05/08 | same |
| 03/08 | Robinhood | **Pons V2** (curve → v4 with hook) | Bitquery, 04/09 |
| 05/08 | Robinhood | LetsCash: tax cap 90% → 10%, USDG quote asset | DL adapter + RPC |
| 16/08 → 03/10 | Base, RH, Arc | BaseStonk (Base 16/08, RH 04/09, B20 V6B 23/09, V7 03/10) | BaseStonk docs |
| 17/08 | Solana | Ansem.io (on pump.fun) — shut down in September | DL |
| 17-31/08 | Solana | LaunchLab opened to third-party platforms: Token-2022 quote asset, fees ≤ 500 bps, 19 curve parameters | Pine |
| 19/08 | X Layer | **Ignix**: first launch | Ignix API |
| 21-23/08 | Robinhood | StonkBrokers: V2 lanes, patch, curve factory closed | DL |
| 26/08 → 02/09 | Base | Umia: CCA auction, closing at the cap | Umia docs |
| 31/08 → 14/09 | Ink | Tsunami: first pool on 31/08, **455 launches on 14/09**, then 1-2/day | Blockscout Ink |
| 05/09 | Solana | **StonkFun switches to LaunchLab**: 119 LaunchLab launches on 4/09, 5,098 on 6/09, peak 12,261 on 21/09 | Pine |
| 05/09 | Ethereum, RH | Stockereum (factory), Pez Family v2 (Pons V2 clone) | `lanceurs-base-ethereum.md`, DL |
| 07-17/09 | Arc | Peach (07/09), LIFT V1 (08/09) and V2 (15/09), o1 (10/09, no more anti-snipe surtax from 15/09), Wonk (17/09) | `lanceurs-robinhood-arc.md` |
| 12/09 | Solana | **pump.fun: "holder rewards" coins, end of cashback** | github pump-public-docs; The Defiant; cryptobriefing |
| 14/09 | Robinhood | StonkBrokers Nightshades (anti-snipe pad 99% → 0 in 99 min) | DL |
| 16/09 | Arc | **Public opening of the chain** | crypto-economy.com, 15/09 |
| 17/09 | BSC | **Genius.fun** (Pons V2 clone → PancakeSwap Infinity; $17.9M volume on 18/09) | press release, The Defiant |
| 18-25/09 | Starknet | Launchy: 70 tokens, then nothing | Starknet RPC (cut-off agent) |
| 20/09 | BSC | MemeToro publishes launch contracts as open source | openpr.com (search excerpt) |
| 22/09 | Arc | Argus "Portal 8": 1% base, 30% to treasury, anti-snipe surtax | DL adapter + RPC |
| 23/09 | MegaETH | MegaPump (listed DL; site offline on 05/10) | DL |
| 25-29/09 | BSC | Loong (Genius fork): $3.8k in fees on 29/09, then ≈ 0 | DL |
| 28/09 | Ethereum | moto.fun | DL |
| 29/09 | Robinhood | **End of the gas subsidy**: chain fees −31%, Pons −43% in one week | cryptoticker.io (01/10) |
| 29/09 → 02/10 | Ethereum | Legion: Jumper sale (48.38M USDC committed) | Blockscout |
| 30/09 | Solana | PumpSwap: **negative** virtual reserves allowed | github pump-public-docs |
| 30/09 | Base | Network upgrade ("Cobalt", fork around 18:00 UTC) | coin-turk.com (single source, not cross-checked) |
| 01-04/10 | Solana | LaunchLab fees 43% below the daily average of September | Pine |
| 03/10 | Monad, multi | MonLock, Adexto, Fledgo listed ($0 in fees) | DL |

**De facto closures and shutdowns** (0 activity since): NOXA on Robinhood (11/07); Pons V1 (0 launches in ~22 h on 05/10);
StonkBrokers Safe Launch (fees $1.9M → $40k over 30 d); Kensei (Katana, May); MoonPie, ZOO.FUN (July); HookOS, Printr,
Dumpflow (August); GasPump (TON, 02/09); SpinUp (24/09); LiquidLaunch (30/09); Loong, Ansem.io, vibes.fun, Grambo (September);
Tsunami almost shut down; Peach with no trade observed outside creation (6 tokens followed for 50 min).

**Notable fee-schedule changes**: Pons V1 70/30 (13/07); LetsCash tax cap 10% (05/08); LaunchLab platform
fees up to 500 bps (August); pump.fun cashback removed in favor of "holder rewards" (12/09); o1 with no surtax on Arc
(15/09); Argus P8 30% to treasury + surtax (22/09); Flap: buy quota per `tx.origin` (v5.14.16, date not found) and 2.5%
curve fee on Morph; Bankr makes Robinhood its default chain (chat, networks, API).

## 8. To add first to our collection

Honest reminder: **no source shows a winning terrain for our recipe** outside our Arc and Robinhood families.
The priorities below are the places where throughput and a crowd exist and where **we are blind**; each must then
pass the radar rule (throughput ≥ 10 playable/h, second buyer ≥ 30%, crowd, honeypot, punisher) before any stake.
Set aside outright: what is already collected and judged DEAD (pump.fun, LaunchLab including StonkFun, four.meme, BSC Flap curves,
Base) and what has no throughput (nad.fun ~1/h, bot.fun ~12/day, Tsunami 1-2/day, TON, Sui, Aptos, HyperCore, Starknet).

### 1. Ignix (X Layer, 196) — two topics to add on a chain already collected
- **Why**: the only ramp of the long tail that has throughput — **190 to 590 launches/day** from 15/09 to 05/10 (API) — and
  a crowd in bursts (second buyer 32% during the weekday Asian bursts, 4% outside bursts; 290 to 525 actors/h;
  triage of 05/10). X Layer has been collected since 05/10 at DEX level: only the Manager's events are missing. No published
  anti-snipe tax; **punisher never measured**.
- **Against** (to keep in mind): third parties at the recipe's timing lost −9.9% there (robust, n = 19 only, 48 h); 61% of
  launches are quoted in tokenized stocks; 75% of the tokens of the last three days have fewer than 3 trades; 0.8% graduated.
- **To decode**, emitter `0x96b51c…` (Manager, DL adapter):
  - `Trade(address indexed token, address indexed trader, bool isBuy, uint256 grossQuoteAmount, uint256 netQuoteAmount,
    uint256 curveQuoteAmount, uint256 tokenAmount, uint256 platformFee, uint256 taxFee, uint128 collected)` =
    **`0xab74e5…`** (64-character topic hash shortened) — seen on the chain (3 receipts of 05/10, blocks 72,455,942,
    72,456,222 and 72,464,077; 3 topics, 8 data words);
  - creation = **`0x92caad…`** (64-character topic hash shortened) — seen in the same 3 receipts, just before
    the first `Trade`; **signature not identified** but layout read on the AGENT token's receipt (block 72,464,077):
    topic 1 = token, topic 2 = creator, topic 3 = **quote asset** (0 = native OKB); data: graduation threshold (85·10¹⁸),
    metadata URI, tax router, dividend tracker, template — all consistent with the public API
    `api.ignix.bot/v1/launches`. The quote asset is therefore read in the event, with no external call.
- **Cost**: RPC `rpc.xlayer.tech` capped at 100 blocks per `getLogs` (1 s blocks); ~15 `Trade`/h in off-peak hours
  (05/10 20:15-21:15 UTC), 1,100 to 3,200 trades/h in bursts (triage).

### 2. PumpSwap, pools under 40 minutes old (Solana) — for an "after graduation" recipe
- **Why**: this is ANOTHER recipe, not ours. pump.fun graduates ≈ 3.4% of ≈ 1.0M launches/month (Pine, September),
  i.e. **≈ 1,100 new pools per day (≈ 46/h)**; PumpSwap handles **$398M/day** (DL, 04/10); the pump.fun crowd exists
  (second buyer 51%, ours). On Pons, entering 10 s after graduation is the only entry point that was measured
  as winning (memory note "Enter 10 s after graduation", September) — before the collapse of the edge on 10/09.
  The collector already sees the birth of these pools (migrations), **not their trades**. No source on a punisher after
  graduation: to be measured.
- **Against**: the pump.fun curve is DEAD for our recipe (`solana.md`); since 30/09 the virtual quote reserves
  can be negative: price to be computed on the EFFECTIVE reserves (pump.fun doc).
- **To decode**, program `pAMMBa…` (public IDL `pump-fun/pump-public-docs`):
  `BuyEvent` = **`67f4521f2cf57777`** (seen in the logs AND by self-CPI, probe of 05/10 21:13 UTC); `SellEvent` = `3e2f370aa503dc2a`
  and `CreatePoolEvent` = `b1310cd2a076a774` (IDL, not observed in the sample of 3 transactions). ⚠ An Anchor discriminator is
  unique only per program: `bddb7fd34ee661ee` (`TradeEvent`) is emitted by both pump.fun and LaunchLab — filter by program.
- **Cost**: subscribing to the whole program = ≈ 390 successful transactions/s (~1.8 MB/s of logs). Cheaper: one `logsSubscribe`
  per new pool (`mentions` accepts only one address) for 40 min, i.e. ~30 simultaneous subscriptions.

### 3. Meteora DBC and DAMM v2 (Solana) — the biggest curve market that we do not see
- **Why**: **$20.6M/day** on the curve (DL, 04/10; $451M in September), about ten front ends (Bags, Jupiter Studio,
  Moonshot Create, EasyA Kickstart, Dynamito…); anti-snipe **public and non-reactive**: fee scheduler / rate
  limiter chosen by the partner in its configuration [MD]; at Meteora, most of the partners' revenue comes from
  trades AFTER the curve ($5.2M against $1.3M in Q1 2026, Pine, 21/04/2026) — the flow is in DAMM v2. Never measured by us.
- **Against**: launches/day unknown; events by self-CPI only (invisible to `logsSubscribe`).
- **To decode**, program `dbcij3…`: `EvtSwap` **`1b3c15d58aaabb93`** and `EvtSwap2`
  **`bd4233a826507599`** (seen by self-CPI, probe of 05/10 21:13 UTC), `EvtInitializePool` `e432f655cb428625` and `EvtCurveComplete`
  `e5e756549c864b18` (computed from `event.rs`, not observed); DAMM v2 `cpamdp…`,
  `EvtSwap2` `bd4233a826507599` (seen).
- **Cost**: ≈ 26 successful transactions/s on DBC and ≈ 113/s on DAMM v2, each to be read through `getTransaction` (~13.8 KB) or through a
  Geyser/gRPC stream — out of reach of a public RPC at 2 requests/s. Cheap prerequisite: count the `EvtInitializePool` on a
  sample of transactions to know the throughput before investing.

### 4. (cross-cutting) A price resolver for tokenized stocks — on families ALREADY collected
- **Why**: this is the novelty of the summer (§ 7) and our tools classify it "no quote asset": Flap BSC ≈ 40% of launches,
  Ignix 61%, Pons V2 (NVDA, SPY, COIN…), Long.xyz/Doppler on Robinhood, Genius.fun, BaseStonk, StonkFun. The CoinGecko price
  does not track these tokens; it has to be read on the chain (deepest pool against a stable or the native asset, or the
  issuer's oracle), in the same unit as the native asset.
- **Addresses verified on 05/10** (`symbol()`/`name()` at the BSC RPC): BNCB `0x4902c5…`
  (CEA Industries), SPCXB `0xbe9d15…` (SpaceX), QQQB `0x205812…`,
  NVDAB `0x02fca6…`, FXIon `0x9b8e98…` (Ondo), DJTB
  `0xf2ec50…`, MRNAB `0x5fd86d…`; GENIUS (Genius.fun token)
  `0x1f12b8…`.

### 5. (watch only) MegaETH (4326) / Kumbaya
- **Why later**: new chain outside our 35 (RPC `mainnet.megaeth.com/rpc`, `eth_chainId` verified on 05/10), ~10 ms blocks,
  Kumbaya DEX $785k/24 h (DL); "the DEX crowd exists" (4 pools out of 8 with 10-27 actors in 10 min, triage of 05/10). But **0.1 to
  0.3 births/h**. Proposed entry threshold, written before any measurement: ≥ 10 DEX births/h over 24 h.
- **To decode**: Kumbaya contracts not collected; if its DEX is a standard Uniswap v3 fork, our global topics would suffice (not verified).

## 9. Sources not read or partial

- **Taken up from the finished parts**: see the "Sources not read" sections of `lanceurs-robinhood-arc.md` (Argus docs behind
  an anti-bot; pools.xyz, pez.family, pair.fund, squeeze.run, frontier.fun rendered in JavaScript; cook.market 522, wonk.fun 502,
  tolly.fun with no DNS, foci.family Cloudflare, launch.o1.exchange 429; cryptorank.io 403) and of `lanceurs-base-ethereum.md`
  (moto.fun in JavaScript, ape.store FAQ collapsed, docs.klik.finance with no DNS, base.drpc.org refused).
- **four.meme "X Mode"**: the decreasing-fee schedule is published only as an image (product update #6) — not read.
- **Meme Rush**: all sources date from October 2025; none on its 2026 state.
- **Flap**: date of version v5.14.16 (buy quota) not found; the "BNB Stonks Szn" announcement is known only from a search
  excerpt (X account @flapdotsh).
- **MegaPump** (MegaETH): the site returns the empty eth.limo "contenthash" page; DL series in error 400 (also nad.fun V2,
  PerpMe, Movepump, KaspaCom LFG, Launchy Pools in volume).
- **NOXA**: `docs.noxa.fi/llms.txt` returns a 404 page (read by the cut-off agent); taken up from `lanceurs-robinhood-arc.md`.
- **Odin.fun** (ICP): Cloudflare page; **Snek.fun** (Cardano): page read, no figures; **Hedera MemeJob**: the mirror node
  returned only transactions from 2024.
- **Kumbaya**: JavaScript-only application (GitBook documentation read); contracts not collected.
- **Articles known only from their search excerpt** (not opened): cryptonews.net "PONS Launchpad Generates $21M Revenue in
  September"; cryptoast.fr "Uniswap mise sur PONS"; openpr.com (MemeToro, ARCLaunch); coin-turk.com (Base upgrade
  of 30/09); navi.trade "Pons vs pump.fun" ("both graduate roughly 1 % of launches").
- **GeckoTerminal**: not called by me; pool birth rates come from the main agent's snapshot (files
  [removed for publication: local path], 05/10 21:10-21:57 UTC).
- **Not measured, for lack of time or access**: Meteora DBC launches/day; Ignix punisher; signature of
  Ignix's creation event; Aptos block time (the cut-off agent had found 0.036 s and wanted to recheck it).

### Working files (session [removed for publication: local path] not versioned)
[removed for publication: local path]: `defillama-launchpads-2026-10-05.md`, `protocols.json`, `dexs.json`, `fees.json` (DL); `evm/adapters/`
(DL adapters); `evm/bsc/survey24.txt`, `detail24.txt` (BSC 24 h and 6 h); `evm/autres/ig_all.json` (Ignix API),
`tsu_logs.json` (Tsunami), `bf_new3.json` (bot.fun), `nad_bc.md` and `nad_bc_abi.json` (nad.fun); `evm/trame.txt` (measurements
by the synthesis agent); `solana/rpc/` (probe, throughputs, sizes) and `solana/pine_*.txt` (Pine reports); `nonevm/` (HyperCore,
Sui, Aptos, TON); `synthese/` (my scripts: `sym.py`, `chainid.py`).
