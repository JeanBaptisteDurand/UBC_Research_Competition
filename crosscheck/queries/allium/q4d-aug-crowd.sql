-- q4d · Same as q4 on Aug 1-16, 2026 (run only if q4 is within tolerance) (Allium Explorer, solana.dex.trades)
-- Written on 2026-11-05, before the first run. Definitions and tolerances: crosscheck/DEFINITIONS.md.
-- Creation proxy: the first pump.fun curve swap of a mint (the creator's buy sits in the create transaction),
-- kept only if the mint has no swap on the look-back day and its first price is near the curve's start
-- (about 2.8e-8 SOL per token; the filter keeps first prices below 4.5e-8).
-- Creator: signer of that first swap (an approximation; the collector reads the create instruction).
-- Positions: (buyer, token) pairs on tokens that did not reach PumpSwap in the window, first buy 20-60 s
-- after creation, creator excluded. P&L = SOL received / SOL paid - 1, unsold tokens at zero.
with base as (
  select block_timestamp as ts, block_slot, txn_index, signer, protocol,
    iff(token_sold_mint = 'So11111111111111111111111111111111111111112', token_bought_mint, token_sold_mint) as mint,
    iff(token_sold_mint = 'So11111111111111111111111111111111111111112', 1, -1) as side,
    iff(token_sold_mint = 'So11111111111111111111111111111111111111112', token_sold_amount, token_bought_amount) as sol,
    iff(token_sold_mint = 'So11111111111111111111111111111111111111112', token_bought_amount, token_sold_amount) as tok
  from solana.dex.trades
  where block_timestamp >= '2026-07-31 00:00:00' and block_timestamp < '2026-08-17 00:00:00'
    and protocol in ('pumpfun', 'pumpswap')
    and (token_sold_mint = 'So11111111111111111111111111111111111111112' or token_bought_mint = 'So11111111111111111111111111111111111111112')
),
first_swap as (
  select mint, ts as t0, signer as creator, sol / nullif(tok, 0) as p0
  from base where protocol = 'pumpfun'
  qualify row_number() over (partition by mint order by block_slot, txn_index) = 1
),
new_tokens as (
  select * from first_swap where t0 >= '2026-08-01 00:00:00' and p0 < 4.5e-8
),
graduated as (
  select distinct b.mint from base b join new_tokens n on b.mint = n.mint where b.protocol = 'pumpswap'
),
per_addr as (
  select b.mint, b.signer, (b.signer = n.creator) as is_creator,
    min(iff(b.side = 1, b.ts, null)) as first_buy,
    sum(iff(b.side = 1, b.sol, 0)) as paid,
    sum(iff(b.side = -1, b.sol, 0)) as received
  from base b join new_tokens n on b.mint = n.mint
  where b.protocol = 'pumpfun'
  group by 1, 2, 3
),
crowd as (
  select p.*, datediff('millisecond', n.t0, p.first_buy) as ms_after
  from per_addr p join new_tokens n on p.mint = n.mint
  where not p.is_creator and p.paid > 0
    and p.mint not in (select mint from graduated)
    and datediff('millisecond', n.t0, p.first_buy) >= 20000
    and datediff('millisecond', n.t0, p.first_buy) < 60000
)
select
  (select count(*) from new_tokens) as creations,
  (select count(*) from graduated) as graduations,
  (select count(*) from graduated) / nullif((select count(*) from new_tokens), 0) as graduation_rate,
  (select count(distinct p.mint) from per_addr p join new_tokens n on p.mint = n.mint
     where not p.is_creator and datediff('millisecond', n.t0, p.first_buy) < 60000)
    / nullif((select count(*) from new_tokens), 0) as second_buyer_60s,
  (select sum(received) / nullif(sum(paid), 0) - 1 from per_addr where is_creator) as creators_pnl,
  (select count(*) from crowd) as crowd_positions,
  (select median(received / paid - 1) from crowd) as crowd_median_pnl,
  (select avg(iff(received = 0, 1, 0)) from crowd) as crowd_never_sold_share
