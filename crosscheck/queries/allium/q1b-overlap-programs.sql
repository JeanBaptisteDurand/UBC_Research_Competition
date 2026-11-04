-- q1b · Which programs carry the pump.fun curve swaps, per day, Oct 5-20, 2026 (Allium Explorer, solana.dex.trades)
-- Written on 2026-11-05, after q1 and before its own run. Reason: q1 matches the collector within 3-7 % on Oct 5-14,
-- then drifts to +20 % (Oct 15-18) and +45 % (Oct 19-20); the collector follows one program id.
-- route = 'direct' when the swap is not wrapped in another program, 'via <outer program>' otherwise (top outer programs only).
select to_char(date(block_timestamp), 'YYYY-MM-DD') as day, program_id,
  iff(outer_program_id is null or outer_program_id = program_id, 'direct', 'via other program') as route,
  count(*) as swaps,
  count(distinct iff(token_sold_mint = 'So11111111111111111111111111111111111111112', signer, null)) as buyers
from solana.dex.trades
where block_timestamp >= '2026-10-05 00:00:00' and block_timestamp < '2026-10-21 00:00:00'
  and protocol = 'pumpfun'
group by 1, 2, 3
order by 1, 4 desc
