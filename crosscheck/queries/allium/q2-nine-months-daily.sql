-- q2 · Daily activity on the Solana launchpads and on PumpSwap, Feb 1 - Nov 3, 2026 (UTC days) (Allium Explorer, solana.dex.trades)
-- Written on 2026-11-05, before the first run. Launchpad protocols named from q0.
-- One row per protocol. "series" packs the days as day,swaps,buys,buyers,tokens_bought,sol_volume separated by ";".
-- A buy is a swap whose token_sold_mint is wrapped SOL. SOL volume = SOL paid on buys + SOL received on sells.
with d as (
  select date(block_timestamp) as day, protocol,
    count(*) as swaps,
    count_if(token_sold_mint = 'So11111111111111111111111111111111111111112') as buys,
    count(distinct iff(token_sold_mint = 'So11111111111111111111111111111111111111112', signer, null)) as buyers,
    count(distinct iff(token_sold_mint = 'So11111111111111111111111111111111111111112', token_bought_mint, null)) as tokens_bought,
    sum(iff(token_sold_mint = 'So11111111111111111111111111111111111111112', token_sold_amount, iff(token_bought_mint = 'So11111111111111111111111111111111111111112', token_bought_amount, 0))) as sol_volume
  from solana.dex.trades
  where block_timestamp >= '2026-02-01 00:00:00' and block_timestamp < '2026-11-04 00:00:00'
    and protocol in ('pumpfun', 'pumpswap', 'raydium-launchlab', 'meteora-dbc', 'dexscreener-moonshot', 'heaven-amm')
  group by 1, 2
)
select protocol, count(*) as days,
  listagg(to_char(day, 'YYYY-MM-DD') || ',' || swaps || ',' || buys || ',' || buyers || ',' || tokens_bought || ',' || round(sol_volume), ';')
    within group (order by day) as series
from d group by 1 order by 1
