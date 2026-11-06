> *Working document from the author's lab. Written in French on 5 October 2026 (updated 7 October 2026), before the paper; translated to English with an AI assistant for publication; every number is as in the original. Removed for publication: server and host names, IP addresses, personal file paths, key and secret locations, a firewall rule, and mentions of two unrelated projects.*

# Complete dossier — the operation, the infrastructure, the angles, the traps

> Written on 5 October 2026, **updated on the evening of the 5th** after the chain-by-chain exploration (§275 → §290: BSC, Base,
> Solana, Ethereum, Robinhood, the Zora coins, 29 long-tail chains, and the quant study of volume/BTC/indicators),
> then **on 7 October around 11:30 UTC**: what is running with real money today (§1 bis), Arc redeployed on 07/10 (§382),
> Robinhood Chain moved to the 5274o family (§366-§368), the Flare robot in ghost mode (§379).
> Synthesis document: what we do, with what, where, what remains to be explored, and above all **the methodological traps**
> we fell into and must beware of. It summarizes more detailed documents already in the repository
> (`ETAT.md`, `labo/ETAT-LABO.md`, the `labo/rapports/chaines/*.md` and `labo/rapports/quant/` notes, the history
> `git log` §1→§290) and the memory notes ([removed for publication: personal path], index
> in `MEMORY.md`).
>
> **Contains no private key or connection string.** Secrets live outside this file (see §9).

---

## 1. One-page summary

**What we do.** On recent blockchains with a "launchpad" (a ramp that launches tokens
on-chain), operators constantly create new pools, deposit liquidity in them,
let the crowd push the price up for a few minutes, then withdraw the liquidity.
Our bots spot a precise **family** of pools (recognizable by the bytecode of the ramp and of the
token), buy a **small amount** ($0.10–0.20) shortly after birth, and resell 2–4 min
later, before the withdrawal. The gain comes from the rise created by the buyers who arrive between
our purchase and our sale.

**Where it wins today (07/10).**
- **Arc** (chain 5042): ~**$50/day** over the 72 h preceding 07/10 (from ~$36 on the bad night of 06 to 07 to ~$58),
  verified on on-chain balances. Since the redeployment of 07/10 at 10:40 UTC: 12 round trips, 0 drained, +$2.24 in the log in 37 min.
- **Robinhood Chain** (4663): the family that paid (1526o) **has not been born since 06/10 around 18:50 UTC**. A real test
  is running on the 5274o family at $0.06: $7.50 paid in on 06/10, $9.04 in balance on 07/10 at 11:28 UTC (+$1.54 in ~14 h, open positions not counted).
  It is positive, but too small to be a source of revenue.
- **The total (= everything except the funding vault): $579.50** on 07/10 at 11:28 UTC (Arc $445.03, Robinhood $117.92,
  Base $16.49, BSC $0.05), across 53 addresses ([removed for publication: personal path]), native only, open positions not
  counted. It was $510.42 on 05/10 at 15:50 UTC. The vault `0x7d85bF7a82470837A1d832e4fa503a7ebF20ca97` is separate: ~$2,074
  across three chains (0.7276 ETH on Robinhood Chain, 95.27 USDC on Base, 0.0055 ETH on Ethereum).

**The fragility, and why this dossier exists.** We only had two sources of revenue (Pons/Arc,
Robinhood) and we now have almost only one. Pons (the historical source) has lost its volume;
we are being attacked by the Robinhood Chain operator. We need **new sources**, hence the research
server. Most of the new leads turned out **dead** (see §5) — which is information,
not a failure: each death was established cleanly.

**The central lesson.** Revenue does not come from a clever setting (stake, timing). It comes from a
**real imbalance in the market**: a crowd that loses and a small position that surfs on it without
moving it. When that imbalance disappears (volume gone, operator defending itself), **no
setting recreates it**. This is the common thread of almost all the memory notes.

---

## 1 bis. What is running now (read on 07/10 at 11:15-11:25 UTC)

### With REAL money (money committed)

| what | where | since | setting | money | read / stop |
|---|---|---|---|---|---|
| **Arc bot** | [removed for publication: server name], `moisson.service`, code `moisson.mjs` (md5 `728450ca`) + `sortie-reactive.mjs` (md5 `6fe0a967`) | 07/10 10:40:53 UTC, 0 restarts | family `v4\|2500\|natif\|sans hook\|1526o`; stake $0.10; entry t+20-45 s; exit at 225 effective s (`DETENTION=234`); **reactive exit in 100% of pools**; creator nonce logged (measurement only, no filter armed); 6 slots; `PERTE_MAX=20` | $59.58 at start: f101 5.00 · f102 5.00 · w002 43.75 · w003 3.13 · w004 1.44 · w012 1.26; at 11:28 UTC: f101 6.31 · f102 6.13 (12 round trips, 0 drained, +$2.24 in the log) | log `moisson.jsonl`; `sudo systemctl restart moisson` is safe (the bot waits for the sale of its positions, ≤ 300 s); rollback `moisson.mjs.avant-nonce-0710` |
| **Robinhood Chain bot (test)** | [removed for publication: server name], `moisson-rh.service`, code `moisson-multi.mjs` (md5 `6f1e6010`), logs `moisson-robinhood/` | 07/10 20:33:01 UTC on this server (06/10 21:27 → 07/10 20:32 on the previous server, stopped cleanly and disabled, +$2.77 in the slot balance) | family `v4\|10000\|natif\|sans hook\|5274o`; stake $0.06; entry t+20 s; holding 110 s; 2 slots drawn at random; `PERTE_MAX=1.00`; `RAFALE=4/6` (total stop, code 3); override `zz-wallet-neuf.conf` | $7.50 paid in on 06/10; $9.04 on 07/10 at 11:28 UTC (f001 5.50 · f002 3.54, open positions not counted), i.e. +$1.54; at 11:00: 70 round trips, 56 won, 14 total losses, +$1.35 in the log | loss budget of the Robinhood Chain tests: **$4 cumulative**, intact |

**Set aside (out of play)**: w000 ($196.74) and w001 ($178.12) on Arc, read on 07/10 at 11:28 UTC. Their keys are kept [removed for publication: key location],
where the bot can no longer see them. They count in the total. They are not put back into play without the owner's agreement.

### Without money committed

| what | where | since | what it does |
|---|---|---|---|
| **Robinhood Chain watch** | Mac, `labo/rh-veille/boucle.sh` (nohup + caffeinate, not launchd) | 06/10 22:41 UTC | read-only, one pass every 15 min; last pass 11:18 UTC, 0 errors; no new free family (1770o taken by another trader) |
| **Flare robot, GHOST MODE** | Mac, launchd `com.labo.robot-flare`, `fantome.mjs` | 07/10 09:47 UTC (restarted 11:15) | no key, no signature, nothing sent: it computes what it would have done; contract tested 7/7 on a local copy, **not deployed**; report `labo/rapports/chaines/robot-flare-fantome.md` |
| **Paper quant strategies** | `labo/quant/papier.py` | 06/10 | BTC > MM50, low volatility against altcoins, Aster/Binance funding spread; frozen: Upbit/Binance delistings, announced listing |
| **Lab collection** | research server | — | read-only, see §3.2 |

### Stopped

- **BSC** (05/10): the operator drains our buys in < 2 s.
- **Robinhood Chain, family 1526o** (06/10): early entries drained at 73-91% from the evening of 05/10, then the family stopped
  being born around 18:50 UTC on 06/10.
- **Robinhood Chain, family 1770o** (07/10): not launched; another trader takes 9 pools out of 10.

---

## 2. The terrain and the strategy

### 2.1 The life cycle of a launchpad pool
1. The operator **launches** a token: deploys the contract, creates an exchange pool, deposits the liquidity.
2. Buyers arrive in the **first seconds to minutes** and push the price along the curve.
3. After **2 to 11 min** (depending on the chain and the operator), the liquidity is **withdrawn**: the pool dies.

Measured: on Arc the crowd of buyers **loses ~$47 per position** at the median. The market is
largely negative-sum for late entrants. Our edge is to enter early, small, and to
exit before the withdrawal.

### 2.2 Our recipe (what the bot does)
- **Family detection**: we do not rely on a single factory but on broad signatures —
  same **ramp bytecode** and **token size** (e.g. 1,526 bytes on Arc/Robinhood Chain),
  pool fee, orientation (native/quote), presence or absence of a hook.
- **Entry**: ~20–45 s after birth, if the pool has ≥ 2 swaps and real liquidity.
- **Stake**: $0.10–0.20. **The stake cap IS the edge**, not a constraint — a large
  stake gets drained; a small one passes under the defense's radar.
- **Holding**: 110–240 s, set on the **median life of the FAMILY** (not of the chain). Arc: 225 s since the evening of 06/10
  (201 s before). Robinhood Chain 5274o: 110 s.
- **Exit**: sale of the **real balance** (never a predicted amount), early exit if the liquidity leaves. On Arc, since
  07/10, a **reactive exit** sells immediately when the pool shows signs of an imminent withdrawal (§381: 2 sales
  saved out of 2, 0 false alarms in 3 h of paired trial; `bilan-reactif.mjs` classifies each sale).

### 2.3 The chains
| Chain | ID | Block | Native | Status |
|---|---|---|---|---|
| **Arc** | 5042 | 0.5075 s | USDC (the ERC-20 `0x3600…` is a **mirror** of the native — never add them) | **Active, ~$50/day** |
| **Robinhood Chain** | 4663 | ~0.101 s | ETH | **Real test 5274o at $0.06** (1526o switched off on 06/10) |
| **Base** | 8453 | — | ETH | Trap: a "punisher" drains third-party buys |
| **BSC** | 56 | 0.45 s | BNB | **Closed** on 05/10: operator drains our buys in < 2 s |
| Pons (hist.) | — | — | ETH/USDG/stocks | Historical source, volume gone, on standby |

### 2.4 Link Pons ↔ Arc ↔ Robinhood Chain
The private PoolManager of Robinhood Chain (`0x8366…`) **is** the poolManager of the Pons launchpad;
our family (v4, fee 2500, native, no hook, token 1526 b) = the Pons graduations. **Argus** on
Arc is a clone of Pons. In other words, the three chains run the same mechanics.

---

## 3. The infrastructure

### 3.1 The servers for REAL (where the bots run)
- **Arc bot server** ([removed for publication: host, address and user]): runs the **Arc bot**
  (`moisson.service`, code and logs in the bot's home folder, overrides in
  `/etc/systemd/system/moisson.service.d/`). Machine **SHARED with Argus** (an outside SIGTERM has
  already cost 14 h of measurement). **Strict constraint: we do NOTHING else on it except running
  the real bot.** The Pons snipe CLI is not there (see the second server below). Firewall: [removed for publication: firewall rule].
- **First Robinhood Chain server** ([removed for publication: host and address]): ran the **Robinhood Chain bot** until 07/10 20:32 UTC
  (`moisson-rh.service`, now stopped and DISABLED; code, keys and logs left in place for a rollback)
  and the **BSC** trial (stopped,
  `moisson-bsc.service`). The Robinhood Chain feed goes through the official RPC; a
  probe that hammers the same RPC from the same IP brings the bot down with 429s — **moderate the calls**.
- **Second Robinhood Chain server** ([removed for publication: host, address and alias]): runs the **Robinhood Chain bot** since 07/10
  20:33 UTC (`moisson-rh.service`, node v22, code `moisson-rh/`, test keys
  `f001/f002`, logs `moisson-robinhood/`). Robinhood Chain RPC
  at 0.13-0.20 s against 0.30-0.58 s from the first server. Also hosts: [removed for publication: unrelated projects], the
  **sequencer feed relay** `relais-flux-pons.service` (socat :8443 → Robinhood Chain feed, used from the Arc bot server — do not
  touch it), the **Pons CLI** (main vault copied, branch `embuscade-tranches`).

### 3.2 The RESEARCH server (collection + storage)
- **Research server** ([removed for publication: host and address], Debian 12): **1 TB of disk, 1 vCPU, 2 GB of RAM WITHOUT
  swap**. It **collects and stores; it does not compute** (too weak). SSH **by key only**
  since 05/10 (password disabled). **No private key must ever reach it** (the lab reads the
  chain, it signs nothing). See note `serveur-stockage-labo`.
  - `collecteur.service`: **35 EVM chains** (X Layer added on 05/10) + Tron, ~51 event types (Uniswap v2/v3/v4,
    Solidly, Algebra, PancakeSwap v3/Infinity, SunSwap, launchpads Pons/SunPump/four.meme/Flap),
    + ERC-20 mints, + Transfers of tokens less than 24 h old. Writes `<day>/<HH>.jsonl` + `couverture.jsonl`.
    **Since §275 (05/10)**: hard timeout on each RPC call and a **watchdog** (`CHIEN_S` = 900 s: a loop without a pass
    stops the process and says so, systemd restarts it, resumption at the cursor) — six chains had stayed frozen for 18 h without
    an alert. The dashboard now judges freshness on COVERAGE ("FROZEN!"), no longer on `etat.json`.
  - `collecteur-solana.service`: pump.fun + Raydium LaunchLab (logsSubscribe), canary at 100%.
  - `enrichir.service`: timestamping, real issuer (tx.from), **bytecode size and simhash**.
  - `compacter.timer`: zstd every 15 min.
  - State on 05/10: **11.3 M logs, 0 coverage gaps, 14% of disk** (~2.1 GB/day).
  - Dashboard: `node tableau.mjs`, run on the research server.

### 3.3 The Mac ↔ storage bridge (the "smart system")
- The **Mac computes** (10 cores, 24 GB), the **VPS stores**. We never copy everything: `rapatrier.sh`
  makes a **selective mirror** in a local erasable cache ([removed for publication: personal path]).
- Read bridge: **nginx on `localhost:8088`** on the storage side (GET/HEAD, JSON autoindex) +
  **launchd SSH tunnel** on the Mac side (`com.labo.tunnel-stockage`). **DuckDB + httpfs** on the Mac reads
  the Parquet files via partial HTTP requests (Range). `/archives/` is **refused** by nginx.

### 3.4 The Pons database (historical)
- Local Postgres in Docker ([removed for publication: unrelated project name]; port **5433**, database `ponsmeta`). ~655 k
  launches, ~10 k graduations, 30 M+ curve trades.
- Exported as **Parquet** in a local folder ([removed for publication: personal path]): `launches`, `trades`, `swaps`,
  `graduations`, `pools`, `block_ts`, `pair_tokens`, `wallet_funding`, `tx_resolve`.
- Local collector `com.pons.collecte` (launchd, [removed for publication: personal path])
  which keeps it up to date, + the daily **recovery indicator** (§5.1).

### 3.5 The Mac
- The repository ([removed for publication: personal path]; branch `campagne-totale-12sept`). **Warning: this folder
- [removed for publication: key storage location]

---

## 4. The tools (by use)

### 4.1 The real thing (`arc/bot-reel/`)
- `moisson.mjs` (Arc), `moisson-multi.mjs` (Robinhood Chain, multi-chain), `bsc/moisson-bsc.mjs` (BSC, stopped):
  the bots. `signeur.mjs`: transaction signing (type 2, verifies the signature before sending).
- `sortie-reactive.mjs` (pure module of Arc's reactive exit), `test-sortie-reactive.mjs` (7 assertions + replay on
  492 real positions), `bilan-reactif.mjs` (classifies each reactive sale: saved / too late / false alarm, and compares
  to the control). Scripts of the 07/10 deployment: `deploiement-0710/`.
- `tout-largent.mjs` (and a temporary copy, `final.mjs`): **money counting** (finds the keys itself,
  deduplicates by address, refuses a total on a failed read, no mirror ERC-20 on Arc).
- `journal-vs-chaine.mjs`: **checks the bot's log against on-chain balances** at the
  historical block (archive nodes required: blockdaemon for Arc, drpc for Robinhood Chain).
- `pont-across.mjs`, `bsc/pont-bsc-vers-arc.mjs`: bridges between chains via the Across API.
- **Free** measurement probes (read-only): `sonde-mur.mjs`, `flux-par-famille.mjs`,
  `pnl-foule.mjs` (real P&L of the crowd, identity = tx.from), `riposte-famille.mjs`,
  `courbe-famille.mjs`, `capacite.mjs`, `horloge-operateur.mjs`, `recensement-croise.mjs`,
  `profil-horaire.mjs`, `detention-rh.mjs`, `qui-deploie.mjs`, `chemin-famille.mjs`.

### 4.2 Research (`labo/`, deployed by `./deployer-labo.sh` to the research server)
- `collecteur.mjs`, `topics.mjs`, `enrichir.mjs`, `compacter.sh`, `valider-rpc.mjs`,
  `verifier-topics.mjs`: the collection.
- `tableau.mjs`: dashboard (batches, gaps, lag, stops by event type).
- `rapatrier.sh` / `analyser-tout.sh`: the Mac↔storage bridge and the analysis loop.
- `rejouer.mjs`: replay of a recipe, family by family. `foule.mjs`: real P&L of the crowd by
  entry age. `gagnants.mjs`: who wins, by address and by operator. `naissances.mjs`:
  **universal launchpad detector** (mints by recipient AND by bytecode mold, simhash).
  `financement.mjs`: origin of funds through historical state. `parquet.mjs`: decoded tables.
  `rapport-transversal.mjs`: the multi-chain report.
- **Added on 05/10 (chain-by-chain exploration)**: `courbes.mjs` (four.meme/Flap curves: throughput, second buyer, crowd,
  third parties at the timing, replay, creator sales) and `flap-cotes.mjs` (Flap quotes PER token); `punisseur.mjs` (withdrawals
  REACTIVE to buys against a paired control, by size and by router — positive control: families 1627o on Base and 5274o on Robinhood Chain);
  `tri-*.mjs` (where a chain's money goes), `solana-*.mjs`, `zora-*.mjs`, `ethereum/` (the agents' tools). Fixes: P&L
  on the BOUGHT tokens only (`gagnants`, `foule`, `courbes`), dynamic fees read from the v4 Swap (`rejouer`), CoinGecko
  price one address per request (`rejouer`).
- **Quant** (`labo/quant/`, data in a local folder): volume ↔ strategies on Pons, BTC ↔ launches, listed
  memes ↔ BTC, funding carry, and the **indicator lab** (26 hourly indicators, composites, walk-forward
  prediction) — report `labo/rapports/quant/2026-10-05-volume-btc-et-degens.md`.

### 4.3 The SQL censuses (local folder, DuckDB on the Mac)
- `pons-traders.sql` (v3, the right one): census of regular winners.
- `simulateur-courbe.sql`: the **exact curve simulator** (validated to 1e-14 against the CLI).
- `copie-{1,2,3}-*.sql`: **walk-forward** copying (ranking on the past, contemporaneous control).
- `snipe-population.sql`, `taxe-par-bloc.sql`, `surtaxe-paliers.sql`: the population replays.
- Persistent database `copie.duckdb`.

---

## 5. The angles — what lives, what is dead, what remains

### 5.1 Alive
- **Arc, family `v4|2500|sans hook|natif|1526o`**: ~$50/day. Setting on 07/10: entry t+20–45 s, $0.10,
  exit 225 s + reactive exit, six slots (§1 bis). **Throughput** (round trips per hour) decides more than the yield per round trip.
- **Robinhood Chain, family `v4|10000|sans hook|natif|5274o`**: real test since the evening of 06/10, +$1.54 in balance in ~14 h
  on $7.50. The 1526o family, which paid until 05/10, has not been born since 06/10 around 18:50 UTC.
- **Pons recovery indicator**: two thresholds written in advance (P&L/trade ≥ +0.25 mΞ over 2 days +
  post-entry buy flow ≥ 0.5 Ξ/token) that will say when Pons becomes playable again. **RED** on 05/10.

### 5.2 Dead (established cleanly — do not return to it without a new reason)
- **Copying the winners** (Pons): flat walk-forward (+0.22% at best). Choosing after the fact
  manufactured 4–9 imaginary points.
- **Pons population snipe**: negative at every reachable block on recent data.
- **Sorting tokens at purchase** (progress, buyers, reputation): the state readable at entry
  **is already in the price** (confirmed 5 times). Buyer reputation predicts the flow but the
  filter loses.
- **BSC, Base**: "punisher" — the operator drains bots' buys (20/22 on BSC, 2/2 for us).
- **Hyperliquid**: closed on 4 angles. **Arc, second family**: none exists. **fee=10000/500/100
  on Robinhood Chain**: reactive drains or sterile family.
- **Sandwich on Arc**: nothing to aim at. **Liquidity rent**: goes 100% back to the providers.
- **Chain-by-chain exploration of the evening of 05/10** (notes `labo/rapports/chaines/`, decision rule written BEFORE each
  measurement) — **everything is dead for our recipe**, and almost always for the same reason: no flow AFTER entry.
  - **BSC** (§276, §283, §284): the four.meme and Flap curves on BSC are dead (second buyer 6-9%, third parties at the timing at a loss, confirmed
    over 28 h); all DEX families negative except the 1526o mold, already punished.
  - **Base** (§277): 1627o punisher (positive control of `punisseur.mjs`), 3553o and 2964o honeypots; **Zora coins**
    (§289): clean terrain (locked liquidity, no tax or punisher) but ~$160/h of buys, median coin motionless.
  - **Solana** (§281): pump.fun is a real market (682 playable/h, 51% second buyer) that does not pay late
    entry (third parties at the timing −8% median, walk-forward replay −7%); LaunchLab worse.
  - **Ethereum** (§286): Stockereum takes 1-3% outside the log, replay −6 to −14%; v2 3670o punisher.
  - **Robinhood Chain** (§282): no new family; 5274o drains 54/54 buys of $1-20 within ≤ 3 s.
  - **Long tail** (§279): 29 chains + recent chains, no exploitable crowd on any of them; the Ignix launchpad on X Layer comes close in
    Asian bursts but our move loses ~10% there.
- **Quant of 05/10** (§278, §280, §285, §288): more volume on Pons = WORSE late recipes (daily ρ −0.79); BTC does not
  drive launches; no memes ↔ BTC strategy survives (the only one with Sharpe > 1 falls to 0.12 over 2019-2022);
  63 indicator relationships survive but none makes a strategy positive after the break of 10/09.
- **CRCL gap on Arc**: unverifiable on 05/10 (hook pool mute for 31 h, free pool 27× shallower, key lost).

### 5.3 To watch (nothing is alive, but these are the conditions that would make it alive)
- **The radar** (agent under construction on the evening of 05/10): every hour, on every family of every chain, the
  yield of the recipe, the second buyer, the crowd, the punisher and the honeypots; positive control = Arc 1526o.
- **Momentum after a Pons graduation**: it wins when the PREVIOUS DAY was heavy (ρ +0.36; +0.46 to +1.11%/round trip after a
  previous day of ~13,500 Ξ, −0.30 to −0.70% after a quiet previous day). Pons does 2-4 k Ξ/day in early October: to watch beyond
  ~10,000 Ξ/day (indicator requested from the radar).
- **Funding carry** (Sharpe 2-8 in a bull market, +1.1%/year today): regime indicator, bounded by capital.
- **On dated standby**: X Layer / Ignix (bursts), Monad / nad.fun (good crowd, 1 token/h), MegaETH (0.3 pool/h), the
  Doppler launcher on Robinhood Chain (meme against meme, not measured).
- **To redo with the corrected tools**: the winner rankings of the 04/10 report (including the "coordinated
  operation" on BSC); add to the collector the topics filtered BY ISSUER (Ignix, nad.fun) so that the radar sees them.

> Note (update): on the evening of 05/10, all this exploration was carried out by the assistant in read-only mode, without
> interruption — market research works.

---

## 6. The TRAPS — what made us believe false things

> This is the most useful section. Each line is an error actually made, often several
> times. Reference in brackets = memory note.

### 6.1 Counting the money
- **Arc's ERC-20 doubles the fortune**: `0x3600…` is a mirror of the native. Never add them. [compter-largent-trois-pieges]
- **`find` that fails with a bare `catch` throws away its valid stdout**: read `e.stdout`. [compter-largent-trois-pieges]
- **A tool that does not search the stables misses keys**; $15 dormant and forgotten. Refuse a total if 0 addresses were read.
- **The bot's log only counts one side**: +$6.78 announced, −$14.84 in the wallet. **Only the balance counts.** [journal-de-vente-ne-compte-quun-cote]

### 6.2 Replay / backtest (error source no. 1)
- **A replay RANKS, it does not predict.** It is a **floor** where we measured it (3–6× below real on Arc) and a **CEILING** where the drains react to our buy. [arc-un-rejeu-est-un-plancher-pas-une-estimation]
- **Quoting at the last price known from the logs = FROZEN price** → announced +198% where the real result was −18.9%. Use the **historical state** (eth_call at block) or the exact simulator. [letat-historique-existe-et-change-tout, simulateur-liquidite-constante-ment]
- **The constant-liquidity simulator lies** (factor 30 on narrow pools). **Our own size** moves the price by ~10% on the way in AND on the way out: ignoring its impact overstated by 18 points. [marche-a-blanc-doit-executer-sur-la-courbe]
- **A replay must exclude pools ALREADY DEAD before our entry** (17% counted as total loss: factor 2.2). [un-rejeu-doit-exclure-les-pools-deja-morts]
- **A free "flat" exit** inflated a holding from +6% to +35%. [backtest-sortie-a-plat-gratuite]
- **Selling what we do not have**: the dry run sold at 1e9 what it bought at 1.5e9. The supply must be real on both sides. [pons-offre-reelle-des-deux-cotes]
- **A window in BLOCKS is not portable**: 6 blocks = 3 s on Arc, 0.6 s on Robinhood Chain → 4 responses missed out of 11, conclusion reversed. [une-fenetre-en-blocs-nest-pas-portable]
- **A backtest that beats the best actor in the market is WRONG.** [arc-le-mur-de-mise-est-entre-010-et-012]
- **ETH pairs only**: the USDG/stock tokens inflated the losses by 40%. [pons-backtest-paires-hors-eth]
- **Align the exit definition** between backtest and dry run (roi = 3 sales ≠ 80 blocks ≠ pure cap). [pons-sortie-backtest-vs-dryrun]

### 6.3 Decoding the chain
- **Sign of v4 Swaps = the TRADER's point of view** (the opposite of v3): negative = buy. The "pool's point of view" comment in the old decoder was WRONG. [uniswap-v4-signe-du-log-swap, signe-swaps-v4-base-pons]
- **`topics[2]` of a Swap = the ROUTER, not the buyer.** The real buyer is `tx.from`. Grouping by topics[2] mixed everyone together. [ecran-pnl-de-la-foule]
- **A wrong topic returns a CONFIDENT zero** that nothing detects. Check the topics against the chain. [topics-v4-verifies-contre-la-chaine]
- **A v4 swap succeeds WITHOUT liquidity** (status 0x1, zero amounts). A success proves no exchange. [swap-v4-reussit-sans-liquidite]
- **v4 Initialize**: currency0/1 are in the **topics**, not in data. Decoded from data = wrong.
- **Average rate ≠ marginal rate**: comparing a large swap to a small one manufactures a rise that does not exist. [taux-moyen-nest-pas-taux-marginal]

### 6.4 The collector (silent failures)
- **A rate-limited RPC returns "zero logs"**: the collector writes a gap without saying so. Canary: ask for ALL the logs without a filter before concluding. [collecteur-panne-rpc-silencieuse, un-zero-confiant-se-verifie-par-un-canari]
- **The cursor must advance ONLY AFTER a successful write**: otherwise 34% of the flow disappears. [refus-detecte-mais-curseur-avance]
- **A partial batch taken for a success**, a range in livelock, a population filtered at birth. [collecteur-trois-pannes-muettes]
- **A family filter at load time makes you blind**: 810 pools out of 1005 thrown away, backtest returns "nothing" instead of "I cannot see". [un-filtre-de-famille-rend-aveugle]
- **The denominator must only count what is READ**: 4 slices refused out of 6 → rate 3× too low. [denominateur-compte-ce-qui-est-lu]

### 6.5 Controls and statistics
- **A control must be CONTEMPORANEOUS**: a p=5e-8 compared two disjoint windows. [un-temoin-doit-etre-contemporain]
- **Pair by DAY**: global control → 0/20; good control → p=0.341. The gap IS the lesson. [temoin-aleatoire-apparie-par-jour]
- **Draw the stake at RANDOM, not on a ladder**: only a simultaneous draw sees the market drift. [tirer-la-mise-au-hasard-pas-en-echelle]
- **Competition of 1** (Robinhood Chain) → pair in TIME, not in space. [un-temoin-par-place-exige-de-la-concurrence]
- **A measurement without a positive control is not a measurement**: 15 errors, none failed, all went in the direction of the hypothesis. [une-mesure-sans-temoin-positif-nest-pas-une-mesure]
- **A wall measured BEFORE the sort is worth nothing**: a new sort invalidates the earlier thresholds. [un-mur-mesure-avant-le-tri-ne-vaut-rien]
- **Choosing the winners AFTER THE FACT manufactures yield**: validate walk-forward, judge the ABSOLUTE yield. [copier-les-gagnants-en-marche-avant]
- **Below ~3.3 points it is noise**; equal weights per day kill the power. [pons-plancher-de-bruit-et-ponderation]

### 6.6 Real execution, gas
- **The tip/gas must NOT be hard-coded**: 2 gwei is $0.0049 on Arc and $0.64 on Robinhood Chain (×87). [arc-plancher-de-frais-et-gaz]
- **`send` and `sweep` do not reserve the same gas**: send fails where sweep passes. [send-et-sweep-ne-reservent-pas-le-meme-gaz]
- **Read the balance BEFORE the purchase**: a v4 round trip = 4 transactions; measuring between two forgets some. [lire-le-solde-avant-lachat]
- **The RPC batch is serialized**: 4.3 blocks of spread vs 0 for pre-signed parallel sends. [pons-lot-rpc-est-serialise]
- **Holding is set on the median life of the FAMILY, not of the chain**: fee=500 died before our exit. [robinhood-la-famille-fee10000 / §réel]
- **Our sales failed 72% of the time because of the ENCODER**, not the market. [arc-ventes-echouaient-encodeur]
- **The stake cap is the EDGE**: the crowd puts in $146 and loses $47; our $0.10 protects us. [la-foule-darc-perd-notre-petite-mise-protege]

### 6.7 Servers, keys, tools
- **Neither cron nor launchd from the macOS Documents folder** (macOS/TCC): 193 silent failures with code 126/126. The watch must live in the macOS Library folder. [pons-cron-macos-ne-tient-pas]
- **A systemd service does not inherit `HOME`**: the usable log went into an "undefined" folder. [un-service-systemd-nherite-pas-de-home]
- **scp fails silently on a running binary**: go through `mv`, verify with a canary. [deployer-le-bot-pons]
- **Only one process per VPS**: otherwise we rate-limit ourselves and the measurements lie. [pons-un-seul-processus]
- **`pgrep` sees itself**: wait on the EFFECT, not on the process. [pgrep-se-voit-lui-meme]
- **SSH: always send output to a FILE in the background**, never wait in the foreground (otherwise code 137). [ssh-sortie-fichier, jamais-attendre-en-avant-plan]
- **A circuit breaker must PAUSE, not die**: it switched off a winning bot twice. And a safeguard calibrated on noise kills the revenue. [un-coupe-circuit-doit-pauser-pas-mourir, un-garde-fou-calibre-sur-le-bruit-supprime-le-revenu]
- **`DUREE_MIN=0` ≠ unlimited**; a setting can be **silently ignored** (check the column you are varying). [duree-min-zero-ne-veut-pas-dire-sans-limite, un-reglage-ignore-en-silence]
- **pg_restore 15 does not read a v16 dump** (false "0 tables"). ASOF on 30 M rows → 16 GB of temp: `SET max_temp_directory_size`.
- **Secrets in migration**: a hand-written exclusion list always forgets one → `--exclude-from` a SINGLE list + screening by name AND by content afterwards. [serveur-stockage-labo]

### 6.8 Reasoning traps
- **First transfer ≠ provenance**: a dust sprayer manufactures a false common ancestor. [premier-virement-nest-pas-provenance]
- **The factory signature proves nothing**: judge a chain by the share of pools that have a SECOND buyer. [juger-une-chaine-le-second-acheteur]
- **Price depends on FLOW, not on time**: on a curve, silence = unchanged, not unknown. [arc-prix-depend-du-flux-pas-du-temps]
- **On Arc, the confounder**: it was the call path / the nonce, not the stake. Always look for the confounder. [arc-cest-le-nonce-pas-la-mise, arc-cest-le-chemin-dappel]
- **"Nobody pays for volume"**: everything that pays pays for CAPITAL. [personne-ne-paie-pour-du-volume]

---

### 6.9 Paid off on the evening of 05/10 (each one returned a clean-looking table)
- **A heartbeat is not progress**: six chains frozen for 18 h, the dashboard said "ok, lag 32 s" because a timer
  was rewriting `etat.json`. Judge a collection on what it WROTE. [un-battement-nest-pas-une-progression]
- **Free CoinGecko = one address per request**: the grouped request returned an error, cached as an answer →
  45% of the Base pools "without a quote" (the Zora coins). An error is never cached.
- **The quote is PER TOKEN** on Flap (often against a MEME) and by suffix on four.meme (…4444 USDT, …ffff BNB):
  assuming BNB made the crowd "pay" 10 billion dollars. [bsc-courbes-mortes]
- **Selling more than was bought** (allocations, transfers) manufactured "winners": +258,708% on BSC, +$4,700 on
  Ethereum (actually +$248 / +$64 / −$317). P&L on the BOUGHT tokens only. [ethereum-et-zora-morts]
- **A control that counts pools or tokens without any trade** is pulled toward 0 and inflates all the reports (×2 on Robinhood Chain).
- **`pgrep -f <pattern>` sees itself** — two wait loops ran empty; the study had never started.
- **Ranking is not winning**: an indicator can order the hours in both halves and never make a strategy
  positive when the LEVEL changes (filtered snipe: +0.5..+1.35% before 10/09, −0.1..−1.3% after).
- **A Sharpe > 1 on five events** (capitulation: 5/5) does not survive an independent period (2019-2022: 9/18, 0.12).
- **The keys of a promising lead live in the repository, not in /tmp**: the CRCL gap became unverifiable for lack of a key.

---

## 7. The method (what we learned to do)
1. **Measure for free first** (read-only: probes, P&L of the crowd) before any spending.
2. **Dry run** that executes on the curve (eth_call), then **small real** capped ($2–4).
3. **Verify against the chain**: the on-chain balance, never the bot's log alone.
4. **Contemporaneous control + walk-forward** for any yield claim.
5. **Write the thresholds BEFORE** measuring (pre-registered decision rule).
6. **State the coverage** and refuse to conclude under a warning that gets lost.
7. **One variable at a time**; look for the confounder.

---

## 8. Operating constraints (hard rules)
- **Arc bot server**: nothing other than running the real bot. Do not disturb the Arc bot.
- **On Arc, nothing is modified (bot, settings, server) without talking to the owner first** (06/10).
- **w000 and w001 stay out of play** without the owner's agreement (07/10).
- **Test spending: $2 to $4 maximum**, all tests combined. **Robinhood Chain: $4 of cumulative loss at most** on the
  test wallets (06/10); the `PERTE_MAX` of a test never exceeds the remaining budget.
- **Drained in bulk → stop** (06/10): every real bot carries the `RAFALE` guard (4 total losses out of 6 round trips = total stop,
  code 3, with no automatic restart). After such a stop, we do not restart without the owner.
- What was launched during the suspension of 06/10 is reviewed with the owner (Robinhood Chain 5274o test).
- **Never print a private key. Never a key on the storage server.**
- **A manual `systemctl stop` must not be undone by `Restart=always`** (use a resumption timer).
- **Do not delete** `logos/` (done, verified) nor the local `ponsmeta` database without explicit agreement.
- `moisson.mjs` on the Arc bot server must stay **bit-for-bit identical** except for a deliberate deployment (md5 `728450ca` since 07/10).
- **SSH: every long command goes to the background toward a file**, read afterwards. Waiting in the foreground killed the session twice
  on 06/10 (code 137).

## 9. Where the secrets are (not their content)
- [removed for publication: secret locations] (production Arc keys, trial keys, BSC keys).
- [removed for publication: secret locations] (the stable the bot reads, and the reserve out of play). **f101 and f102 exist only on the Arc bot server.**
- [removed for publication: secret locations] (Robinhood Chain test wallets).
- [removed for publication: secret locations] (other key files).
- [removed for publication: secret locations] (Postgres connection).
- **All these paths are excluded from any copy to the storage server** (a single exclusion list).

## 10. To resume
- General state: `ETAT.md`. Lab: `labo/ETAT-LABO.md`. Multi-chain report: `labo/rapports/`.
- What is running with real money: **§1 bis** of this dossier. Register of findings: `TROUVAILLES.md`.
- Detailed journal: `git log` (§1 → §382), one commit per measurement/fix.
- Memory: `MEMORY.md` (index of ~180 notes) in the memory folder.
- Money: `node arc/bot-reel/tout-largent.mjs`. Lab health: `node tableau.mjs` on the research server.
