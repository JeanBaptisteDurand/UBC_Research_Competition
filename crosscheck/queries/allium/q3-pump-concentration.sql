-- q3 · Concentration of PUMP holdings, latest balances (Allium Explorer, solana.assets.spl_token_balances_latest)
-- Written on 2026-11-05, before the first run. Mint: pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn (PUMP).
-- Holders are owner addresses (token accounts summed per owner). Shares are of the sum of all balances.
-- The eight addresses below are the accounts Solscan labels as pump.fun's (custodian, Squads vaults, livestream
-- allocation; data/raw/solscan_pump_holders_2026-10-22.md); only their combined share is reported.
with h as (
  select address, sum(balance) as bal
  from solana.assets.spl_token_balances_latest
  where mint = 'pumpCmXqMfrsAkQ5r49WcJnRayYRqmXz6ae8H7H9Dfn' and balance > 0
  group by 1
),
r as (
  select address, bal, row_number() over (order by bal desc) as rk, sum(bal) over () as total
  from h
)
select count(*) as holders,
  max(total) as total_in_accounts,
  sum(iff(rk <= 10, bal, 0)) / max(total) as top10_share,
  sum(iff(rk <= 50, bal, 0)) / max(total) as top50_share,
  sum(iff(rk <= 100, bal, 0)) / max(total) as top100_share,
  sum(iff(rk <= 1000, bal, 0)) / max(total) as top1000_share,
  sum(iff(address in ('Cfq1ts1iFr1eUWWBm8eFxUzm5R3YA3UvMZznwiShbgZt', '8UhbNoBXmGoxJr2TeWW8wmSMoWmjS2rTT2tVJxzuTogC',
    '9pkFKCR1mdS31JxjKdtmWg2awZUg6vJUYVY722DAcXzv', 'BBvQteuawKB2UtExfevL8HYLjWWsgmWXsp922vFbvCfT',
    'GTeSSwovPiVirpvWJpThUWiLDSLsuApmJw621Yom3MhB', 'AvqFxKNrYZNvxsj2oWhLW8det68HzCXBqswshoD2TdT6',
    '85WTujfJ9meJq5hfjAeb5gftj7n8Q7QTsZJbRqMD5ERS', '8UHpWBnhYNeAQURWjAABp8vSrzfYa69o7sfi65vYLC42'), bal, 0)) / max(total) as pumpfun_labelled_share,
  sum(iff(rk <= 10 and address not in ('Cfq1ts1iFr1eUWWBm8eFxUzm5R3YA3UvMZznwiShbgZt', '8UhbNoBXmGoxJr2TeWW8wmSMoWmjS2rTT2tVJxzuTogC',
    '9pkFKCR1mdS31JxjKdtmWg2awZUg6vJUYVY722DAcXzv', 'BBvQteuawKB2UtExfevL8HYLjWWsgmWXsp922vFbvCfT',
    'GTeSSwovPiVirpvWJpThUWiLDSLsuApmJw621Yom3MhB', 'AvqFxKNrYZNvxsj2oWhLW8det68HzCXBqswshoD2TdT6',
    '85WTujfJ9meJq5hfjAeb5gftj7n8Q7QTsZJbRqMD5ERS', '8UHpWBnhYNeAQURWjAABp8vSrzfYa69o7sfi65vYLC42'), bal, 0)) / max(total) as top10_outside_pumpfun_share,
  count_if(rk > 1000) as holders_outside_top1000,
  sum(iff(rk > 1000, bal, 0)) / max(total) as outside_top1000_share
from r
