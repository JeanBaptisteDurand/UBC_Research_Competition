> *Working document from the author's lab. Written in French on 2026-09-06, before the paper; translated to English with an AI assistant for publication; every number is as in the original. Removed for publication: nothing (third-party contract addresses are shortened to their first 6 characters).*

# Pons V2 — research report

> Source: external research supplied by the user on 2026-09-06.
> Values marked "verified by RPC" were cross-checked on-chain.

## Major preliminary correction

The project is **not** called "pons.fund" or "OpenPons". The Pons V2 launchpad
on Robinhood Chain is **pons / pons.family**, operated by **Pons Labs, LLC**, on
the domain **ponsfamily.com**. The domains in the initial brief are either dead
or occupied by unrelated projects. OpenPons is a distinct **third-party** project
that consumes the Pons V2 factory.

---

## (A) Official documentation

### A.1 — Official domains (verified)

| URL | HTTP | Content |
|---|---|---|
| `https://ponsfamily.com` | 200 (redirect → /launchpad) | Launchpad application, Next.js |
| `https://www.ponsfamily.com/launchpad/create` | 200 | Creation form, v2/v1 tabs |
| `https://docs.ponsfamily.com/` | 200 | V1 doc (Uniswap V3, no curve) |
| `https://docs.ponsfamily.com/v2` | 200 | **Complete V2 doc — the source of truth** |
| `https://docs.ponsfamily.com/sitemap.xml` | 200 | Lists only 2 URLs: `/` and `/v2` |
| `https://robinhoodchain.blockscout.com/` | 200 | The chain's explorer |
| `https://x.com/ponsdotfamily` | — | Official X account |

Contact: `contact@ponsfamily.com`. Copyright "© 2026 Pons Labs, LLC".

### A.2 — Domains in the brief: results (verified)

| Domain tested | Result |
|---|---|
| `pons.fund` | HTTP 200 but **unrelated** — "Pons Shares / $SHARES", a reward-cycles dashboard. `/create`, `/launch`, `/new`, `/launchpad` → 404. Its `/api/status` returns `{"project":{"name":"Pons Shares","ticker":"$SHARES",…,"ponsFamilyFeeBps":500}}` — a satellite project that references Pons Family without being the launchpad |
| `docs.pons.fund` | DNS does not exist |
| `app.pons.fund` | DNS does not exist |
| `api.pons.fund` | DNS does not exist |
| `openpons.xyz` | DNS does not exist |
| `openpons.fund` | DNS does not exist |
| `openpons.com` | 200, redirects to `github.com/openpons` — a 2025 org, 1 empty repo. Unrelated |
| `pons.xyz` | 200 — domain for sale on Spaceship |
| `robinhoodchain.com` | 200 — parking page. Not official |
| `docs.robinhood.com/chain` | 200 — official Robinhood Chain doc, **zero mention** of the Pons launchpad |
| `api.ponsfamily.com` | DNS does not exist (the API is at `www.ponsfamily.com/api/…`) |

### A.3 — What the V2 doc says

Source: `https://docs.ponsfamily.com/v2` (scraped in full).

**Deploying a token.** A single call to the factory. The creator chooses a
`launchConfigId` (which fixes supply, curve fees, phantom reserve, graduation
threshold, pool parameters) and a quote asset. The entire supply
is minted directly onto the curve — **nobody, creator included, holds any
tokens before opening**.

```solidity
struct TokenParams { string name; string symbol; string logo; string description;
  Socials socials; address creatorFeeRecipient; uint16 creatorTaxBps;
  bool buybackEnabled; bytes32 expectedEconomics; bytes32 salt; }
struct Socials { string twitter; string telegram; string discord; string website; string farcaster; }

function launchToken(TokenParams params, uint256 launchConfigId, address pairToken) payable
function launchToken(TokenParams params, uint256 launchConfigId, address pairToken, address[] snipeTaxExemptions) payable
function launchAndBuy(TokenParams params, uint256 launchConfigId, address pairToken,
                      uint256 quoteIn, uint256 minTokensOut, address recipient,
                      address[] snipeTaxExemptions) payable
```

Deterministic addresses via **CREATE2** (32-byte salt, namespaced by the initiating
wallet → vanity addresses possible, verifiable with
`predictLaunchAddresses`). `expectedEconomics` is an **economic pin**: obtained
via `previewLaunchEconomics()`, it makes the launch revert if the owner changes the
config in the meantime.

**Launch fee.** 0.0005 ETH, sent as `msg.value`. **Strict** equality
(`if (msg.value != launchFee) revert LaunchFeeNotPaid()`).

**Creator tax.** `creatorTaxBps` (uint16), chosen at creation, **immutable
afterwards**, capped by `maxCreatorTaxBps()`. Goes entirely to the creator, on
top of the standard trade fee. Hard ceiling: `MAX_CREATOR_TAX_CEILING_BPS =
1_000` (10 %), total sum bounded by `MAX_TOTAL_TRADE_FEE_BPS = 2_000` (20 %).
Error `CreatorTaxTooHigh`.

**Anti-snipe tax and exemptions.** Tax on **buys only** (selling is
never taxed), starting at 99 % and decaying exponentially to zero.
The terms are **snapshotted per launch** — a trading curve cannot
have its window modified after the fact. The proceeds are **not burned**: they join
the trading fees and are distributed normally.

Exemptions:
- **Automatic**: the launch address and the `creatorFeeRecipient`.
- **Declarative**: up to **32 addresses** (`MAX_SNIPE_TAX_EXEMPTIONS = 32`)
  passed at creation. Beyond that → `ExemptionListTooLong`. **Fixed at
  creation, cannot be added afterwards.**
- Via `launchAndBuy`, the `recipient` of the buy is exempted automatically.

To quote: read `currentSnipeTaxBps(recipient)` on the curve — **indexed on
the recipient of the tokens, not on the sender** (a trap for a router).

**Graduation to Uniswap v4.** Two phases. `graduate` empties the curve into
the factory (safe to trigger in the buy that crosses the threshold);
`createGraduatedPool` seeds the V4 pool and stays replayable so that the reserves
can never be stuck. Full-range position locked permanently
(`PonsV2LaunchLocker` exposes neither withdrawal nor arbitrary call). A fixed share of
the supply is reserved from the start to become the pool's liquidity. The singleton hook
`PonsV2MemeHook` takes a cut in `afterSwap` and converts the fees denominated in memecoin
back into the quote asset against the pool's liquidity,
under a configurable price-impact bound. **The pool itself charges no
fee of its own.** A buy exceeding the remainder: partial refund in the same
transaction, never at a unit price worse than the one accepted.

**Buyback vault.** `PonsV2BuybackVault` — the tokens bought back are **not
burned** but vested linearly over 5 years (`VESTING_DURATION = 5 * 365 days`),
with a weighted-average vesting clock. Optional, activated by the
creator alone (funded from their share; Pons can deactivate, never activate). If a
buyback is infeasible (insufficient liquidity / excessive price impact), it is
skipped and the money goes to the creator.

**Other.** Fee escrow in **claim** mode (no push); a separate balance per
quote asset. Post-launch creator controls limited to two things:
the fee-collection wallet (**3-day timelock**, 3-day execution window)
and the buyback on/off. **No mint, no freeze, no blacklist, no added tax.**

**Audits.** The doc states: "No audit has closed. Treat v2 as unaudited until
the reports are published here." Three audits under way: SB Security, Dingbats,
Pashov Audit Group.

### A.4 — On-chain verification (verified by RPC)

Factory `0x7eD5…`, chain id 4663:

| Call | Actual value |
|---|---|
| `launchFee()` | `500000000000000` = **0.0005 ETH** |
| `maxCreatorTaxBps()` | `1000` = **10 %** |
| `snipeTaxStartBps()` | `9900` = **99 %** |
| `snipeTaxSeconds()` | **3** |
| `launchEnabled()` | **true** |
| `canLaunch(<any addr>)` | **true** |
| `launchConfigCount()` | 1 |
| `launchForwarder()` | `0xe33E…` |
| `owner()` | `0x263e…` |

`getLaunchConfig(0)` → supply `1e27` (1 billion × 18 dec.), `curveFeeBps` 100
(1 %), `phantomQuote` 1.68 ETH, `graduationThreshold` 4.2 ETH, `poolFee` 0,
`tickSpacing` 200, `enabled` true.

`PonsV2MemeHook.currentFeePolicy()` → `protocolFeeShareBps` 3000 (30 %),
`buybackBurnBps` 5000 (50 %), `hookFeeBps` 100 (1 %),
`maxInternalPriceImpactBps` 300 (3 %).

**Three divergences between the doc and on-chain — the doc is out of date:**

1. The doc says the tax decays "across the first 5 seconds" ("~25 % at 1s,
   ~3 % at 2s"). On-chain `snipeTaxSeconds = 3`. The UI does display 3 s. **The doc
   is wrong.**
2. The doc says "Public launches are closed, so only whitelisted addresses can
   create a token for now". On-chain `launchEnabled() == true` and `canLaunch()`
   returns true for an arbitrary address: **public launches are
   open**.
3. The GitHub README describes the V2 anti-snipe as "Curve price impact + reserved
   pool allocation" — without mentioning the decaying tax. **Out of date.**

---

## (B) GitHub / public code

### B.1 — The official repository (verified)

`https://github.com/ponsdotdev/ponsfamily` — "Official repository for the
ponsfamily.com smart contracts". 144 ★, created 2026-07-19, last push
2026-08-27. Only repo of the `ponsdotdev` org.

```
contractsV2/src/v2/
  PonsV2LaunchFactory.sol      PonsV2BondingCurve.sol       PonsV2LaunchDeployer.sol
  PonsV2LauncherToken.sol      PonsV2BuybackVault.sol       PonsV2LaunchLocker.sol
  PonsV2GraduationGuard.sol    PonsV2GraduationExecutor.sol hooks/PonsV2MemeHook.sol
  interfaces/ILaunchpadV2.sol  interfaces/ILaunchpadV2Graduation.sol
  libraries/PonsV2BondingCurveMath.sol  libraries/PonsV2GraduationMath.sol
```

MIT license (except `PonsTickMath.sol` under GPL-2.0-or-later). Announced addresses:
V1 `0xA5aA…`, V2
`0x7eD5…`.

On the two names that do not exist as contracts:
- **`PonsV2LaunchAndBuy` is not a file in the repo.** It is the
  "Launch and buy" router deployed at `0xe33E…`
  (= `launchForwarder()`, verified on-chain), exposing `launchAndBuy(...)`.
- **`OpenPonsLaunchpad` does not belong to Pons** — see B.3.

Constants of `PonsV2LaunchFactory.sol`:

```
MAX_CURVE_FEE_BPS          = 1_000   // 10 %
MAX_CREATOR_TAX_CEILING_BPS= 1_000   // 10 %
MAX_TOTAL_TRADE_FEE_BPS    = 2_000   // 20 %
MAX_SNIPE_TAX_START_BPS    = 9_900   // 99 %
MAX_SNIPE_TAX_SECONDS      = 60
MAX_SNIPE_TAX_EXEMPTIONS   = 32
MIN_PAIR_TOKEN_DECIMALS    = 6
MIN_LAUNCH_SUPPLY          = 1 ether
CREATOR_FEE_RECIPIENT_TIMELOCK = 3 days
GRADUATION_RESCUE_DELAY        = 7 days
```

`PonsV2LaunchDeployer.sol`, metadata bounds: `MAX_NAME_LENGTH = 64`,
`MAX_SYMBOL_LENGTH = 16`, `MAX_LOGO_LENGTH = 512`,
`MAX_DESCRIPTION_LENGTH = 2048`, `MAX_SOCIAL_LENGTH = 256`.

**WARNING: flaw in the repository.** The repo is inconsistent with itself:
`PonsV2LaunchFactory.sol` contains 37 occurrences of "snipe" and calls
`PonsV2BondingCurve(curve).exemptFromSnipeTax(...)`, but the published
`PonsV2BondingCurve.sol` contains **zero** occurrences of "snipe" and
exposes neither `exemptFromSnipeTax` nor `currentSnipeTaxBps`. **As it stands the repo does not
compile.** The published factory is a more recent generation than the published
curve. For the exact tax-decay logic, use the **source
verified on-chain**, not GitHub.

### B.2 — Code search

`api.github.com/search/code` requires a token (absent). `grep.app` with no usable
JSON response. `search/repositories` on the 7 contract names →
`total_count: 0` for each (normal: this index only covers
names/descriptions/READMEs). The official repo was found by web search.
`github.com/pons-fund`, `/ponsfund`, `/ponsdotfund` → 404.

### B.3 — OpenPons: a third-party project, not to be confused (verified)

`https://github.com/OpenPonsPro/OpenPons` — TypeScript + Solidity, created and pushed
on **2026-09-03**. Site `https://openpons.pro` (200), X `@OpenPons`.

Explicit README: "Launch a token on Pons V2 … The launchpad reuses Pons
Family's factory and bonding curve rather than rebuilding them; what OpenPons
adds is where the fee goes and who can claim it." Principle: launch a token
backed by a public GitHub repo, whose creator fees feed a `GitVault`
claimable by the repo's admin through GitHub OAuth + an EIP-712 signature.

`contracts/src/OpenPonsLaunchpad.sol` declares an interface to the Pons V2
factory and cites `0x7eD5…` in a comment. **`OpenPonsLaunchpad` is therefore a third-party
wrapper, not a Pons contract.** Own contracts: `GitVault.sol`,
`OpenPonsDistributor.sol`, `V4Seller.sol`. Announced split: 10 % platform
first, then the project share to the GitVault, the rest to the deployer. The OpenPons pad
is declared closed until the official announcement is published.

Useful: this file contains an **independent transcription of the V2
factory's structs** (`LaunchParams`, `LaunchedToken` with `phase`, `sweptQuote`,
`sweptTokens`, `sweptAt`, `exists`).

### B.4 — Third-party ecosystem (verified)

| Repo | Description |
|---|---|
| `0xfnzero/pons-trade-sdk` | **Go SDK** for Pons v2: launches, launchAndBuy, curve quotes, swaps, fees, graduation, ABI calldata. 3 ★, created 2026-09-01 |
| `MEADGod/pons-docs` | Unofficial mirror/rewrite of the doc |
| `Phosphenq/bodkin` | "sniper terminal for pons v2 on Robinhood Chain" |
| `mesutgulecen/ponscli` | Unofficial CLI |
| `hoodly-agent/mcp-pons` | MCP server to drive Pons from an assistant |
| `argostroloji/ponsscan` | Drain-check dashboard / graduation radar |
| `ponsvitals/ponsvitals` | Launch survival registry |
| `Dipraise1/pons-volume-tracker` | Telegram launchpad-intelligence bot |
| `0xakhil/rh-burn-dashboard` | Multi-launchpad burn/buyback dashboard |
| `0xakhil/rh-eth-lock-dashboard` | Liquidity-lock comparison |
| `pons-v3p1/Pons-Volume-Bot` | Volume bot |

---

## (C) Deployment interface

### C.1 — The real form

`https://www.ponsfamily.com/launchpad/create` (200, scraped with JS rendering).
v2 / v1 selector at the top. Banner at the time of the scrape: "Degraded performance —
We are upgrading the backend ahead of a new rollout."

**Main fields**

| Field | Observed detail |
|---|---|
| Name | free (contract bound: 64 chars) |
| Ticker | free (contract bound: 16 chars) |
| Description | free (contract bound: 2048 chars) |
| Token image | "Choose image" (upload → IPFS; existing tokens have `ipfs://bafy…` logos) |
| X profile | fixed prefix `x.com/` |
| Telegram | fixed prefix `t.me/` |
| Paired asset | selector, ETH by default. "Graduates once the curve raises 4.2 ETH". A `/launchpad?tab=stocks` tab exists → stock-token pairs |
| Developer buy | amount in ETH — this is the `launchAndBuy` path |

**"Advanced" section**

| Field | Observed detail |
|---|---|
| Holder fee sharing | toggle. "Route this launch's creator fees to its holders, split pro-rata…" Default: fees to the creator wallet. **Absent from the V2 doc** — presumably a distributor contract passed as `creatorFeeRecipient` |
| Creator wallet | "Leave blank to use your connected wallet" (= `creatorFeeRecipient`, zero → caller) |
| Creator tax % | "Traders pay 1.00 % in total, up to 10 % of it yours." min 0, max 10 % |
| Snipe tax exemptions | "Buys in the launch second pay 99 %, decaying to zero across 3s. Declare the wallets your team opens with." (max 32) |

No visible "buyback" toggle although `buybackEnabled` is a parameter of
`TokenParams`. Either it appears after the wallet is connected, or the UI forces it.

**Cost bar / "Your token" panel**

```
ETH pair, ETH 0.0005 due
Launch fee      0.0005 ETH
Paired with     ETH
Trade fee       1.00 %
Launch window   99 % snipe tax, 3s
Graduation      4.2 ETH
Liquidity       Locked
```

Matches exactly `getLaunchConfig(0)` read on-chain.

### C.2 — Frontend API (verified)

No `api.ponsfamily.com`; the API is under `www.ponsfamily.com/api/…`. Two
confirmed endpoints:

- `…/api/pons-launches/graduations?catalog=1&v=12` → array of launches.
  Fields: `factory, token, deployer, pool, pairToken, transactionHash,
  blockNumber, launchedAt, initialBuyWei, name, symbol, logo, description,
  priceUsd, marketCapUsd, liquidityUsd, graduated, graduationProgressPct,
  pairedPrincipalEth, graduationThresholdEth, latestBuyAt, graduatedAt,
  graduatedBlockNumber…`
- `…/api/pons-v2-market/{token}/creator-fees` → `{token, feeEscrow, recipient,
  quoteAsset{address,symbol,decimals,isNative}, earnedForToken,
  claimableForWallet, sweepCount, nothingToClaim}`.

The doc insists: "**There is no pons API in the trust path**" — these endpoints
are for convenience, the truth is on-chain.

### C.3 — Deployed V2 addresses

```
Factory              0x7eD5…   verified by RPC
Meme hook            0xE5e7…   verified (currentFeePolicy)
Fee escrow           0xd3AF…   cross-checked via the creator-fees API
Buyback vault        0x42df…
Launch locker        0x2674…
Launch and buy       0xe33E…   verified: == launchForwarder()
Launch deployer      0x3711…
Graduation executor  0xC781…
Graduation guard     0xf569…
```

Network: Robinhood Chain, chain id **4663**, RPC
`https://rpc.mainnet.chain.robinhood.com`, explorer
`https://robinhoodchain.blockscout.com/`.

---

## Leads that yielded nothing (stated explicitly)

- `docs.pons.fund`, `app.pons.fund`, `api.pons.fund`, `openpons.xyz`,
  `openpons.fund`, `api.ponsfamily.com`, `pons.family`, `ponspad.com`,
  `launchonponspad.com`, `chain.robinhood.com`: **DNS does not exist**.
- `github.com/pons-fund`, `/ponsfund`, `/ponsdotfund`: **404**.
- GitHub code search on the 7 contract names: **0 results**.
- `docs.robinhood.com/chain`: online but does not document Pons.
- Solidity source of `PonsV2LaunchAndBuy`: **not published on GitHub**.
- Anti-snipe tax decay logic: **absent** from the published
  `PonsV2BondingCurve.sol` (repo out of sync).

## Points of caution

1. **Do not rely on the GitHub README or the V2 doc for numerical values**
   — 3 divergences confirmed against on-chain.
2. **The official repo does not compile as it stands.** For the exact mechanics of the
   curve and the tax, use the source verified on
   `robinhoodchain.blockscout.com`.
3. **V2 is unaudited** (3 audits under way, none closed), declared as such by the
   team.
4. Since `pons.fund` is a third-party project with the same name, any data collected from that
   domain would be off-topic.
