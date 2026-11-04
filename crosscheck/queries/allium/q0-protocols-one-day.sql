-- q0 · Solana DEX protocols by swaps on one day, to name the launchpads (Allium Explorer, solana.dex.trades)
-- Written on 2026-11-05, before the first run.
select project, protocol, count(*) as swaps, count(distinct signer) as signers
from solana.dex.trades
where block_timestamp >= '2026-10-06 00:00:00' and block_timestamp < '2026-10-07 00:00:00'
group by 1, 2
order by swaps desc
limit 80
