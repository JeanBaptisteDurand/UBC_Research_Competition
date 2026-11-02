# Lab measurement tools (read-only)

These are the exact scripts that produced the pump.fun and Arc numbers in the paper. They only *read* collected chain data; none of them trades.

| Script | What it measures | Used for |
|---|---|---|
| `solana-courbes.mjs` | pump.fun / LaunchLab funnel from the collector's hourly files: coverage (minutes, sources, canary), decoding checks (reserve chaining, constant-product formula, fees per token), throughput, second buyer, crowd P&L by entry age (strict = unsold remainder at zero; valued = at last marginal price), third-party round trips at the recipe's timing, exact-curve replay with our own impact, creator sell within 3 s of an outside buy vs matched control, hour-by-hour stability | Table 1 (pump.fun row), Fig. 10, Appendix B |
| `solana-recus.mjs` | per-transaction costs and identities read from `getTransaction` (priority fees, Jito tips, signer = `user` field) | execution-cost inputs (`--prio`) |
| `solana-sous-pop.mjs` | forward-walk search for a sub-population that would pay (rule chosen on the first half, judged on the second) | "no refuge" statement |
| `gagnants.mjs` + `topics.mjs` | EVM winners/crowd ranking: realised P&L per address with open positions at last curve price (zero if the pool was drained), LP/deployer addresses excluded, regular-winner test over three windows | Arc 17-day numbers (`data/arc-17d/`) |

Run example (pump.fun, one UTC day; ~2 GB RAM, ~100 s on a laptop):

```
DONNEES=<dir with YYYY-MM-DD/HH.jsonl.zst> node --max-old-space-size=18000 solana-courbes.mjs \
  --debut=2026-10-05T00:00 --fin=2026-10-06T00:00 --prio=44500 --prix-sol=120 \
  --sortie=2026-10-05.json --positions=2026-10-05.positions.jsonl
```

Comments are in French (the lab's working language); variable names too. The collector itself (the process that subscribes to the chain and writes the hourly files) is not published: the raw files it produces for the window are available on request.
