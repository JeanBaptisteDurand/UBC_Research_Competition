# The bots (Sep 23 – Oct 13, 2026): what is published here, and what is not

**What ran.** Small automated buyers on launchpad pools on four chains (Arc, Robinhood Chain, Base, BSC), 53 working addresses, $56–122 of external capital. The recipe came from an exact-state replay of factory pools: buy $0.10–0.20 of a pool 20–45 seconds after birth, sell 110–240 seconds later, before the operator drains it.

**What happened.** Balances went from about $41 (Sep 25) to about $804 (Oct 13); net of capital in, +$682 to +$748 for the campaign. Earlier September tests on Pons (Robinhood Chain) lost about 0.26 ETH (≈ $700). Overall, from early September to Oct 13: about zero (−$20 to +$50). The operators adapted within days: on Robinhood Chain the share of my buys drained before I could sell went 0 % → 22 % → 63 % (Oct 4–6); on Arc, pools of the family I was buying died 65 s after my buy against 213 s without me (Oct 11), 96 s vs 332 s the next day. Everything was stopped on Oct 13 and swept to one public vault.

**Published here**
- `reconciliation.csv` — the money, line by line, on-chain where possible (Appendix C of the paper).
- `sweeps.md` — the four sweep transactions to the vault (public).
- `../data/bots-daily.csv` — the day-by-day table behind Fig. 2 and Fig. C1 (births per day, net dollars, pool life with and without my buy, share of my buys drained).

**Not published**
- The trading code (key management, signing, RPC and server configuration) and the raw per-trade journals: they would expose the working wallets and the keys' environment. A per-trade export with wallet labels instead of addresses may be added after the competition.
- The pre-registered rule files (dated Sep 9 and Oct 2, 2026) are kept privately and can be shown on request.

Status of the bot numbers in the paper: **B** where `bots-daily.csv` carries them (they are typed from the journals, not recomputed by a script), **A (on-chain)** for the vault balance and the four sweeps.
