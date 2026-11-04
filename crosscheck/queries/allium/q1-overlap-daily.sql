-- q1 · Calibration on the overlap, Oct 5-20, 2026 (UTC days) (Allium Explorer, solana.dex.trades)
-- Written on 2026-11-05, before the first run. Definitions and tolerances: crosscheck/DEFINITIONS.md.
-- A buy is a swap whose token_sold_mint is wrapped SOL. A buyer is the signer of a buy.
with t as (
  select date(block_timestamp) as day, protocol, signer, token_sold_mint, token_bought_mint
  from solana.dex.trades
  where block_timestamp >= '2026-10-05 00:00:00' and block_timestamp < '2026-10-21 00:00:00'
    and protocol in ('pumpfun', 'raydium-launchlab')
)
select to_char(day, 'YYYY-MM-DD') as day, protocol,
  count(*) as swaps,
  count_if(token_sold_mint = 'So11111111111111111111111111111111111111112') as buys,
  count(distinct iff(token_sold_mint = 'So11111111111111111111111111111111111111112', signer, null)) as buyers,
  count(distinct signer) as signers,
  count(distinct iff(token_sold_mint = 'So11111111111111111111111111111111111111112', token_bought_mint, null)) as tokens_bought
from t group by 1, 2
union all
select 'Oct 5-20 distinct', protocol, count(*), count_if(token_sold_mint = 'So11111111111111111111111111111111111111112'),
  count(distinct iff(token_sold_mint = 'So11111111111111111111111111111111111111112', signer, null)), count(distinct signer),
  count(distinct iff(token_sold_mint = 'So11111111111111111111111111111111111111112', token_bought_mint, null))
from t group by 1, 2
order by 2, 1
