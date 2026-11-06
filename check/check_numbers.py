#!/usr/bin/env python3
"""Recompute the paper's headline numbers from the files in this repository and print PASS/FAIL.
Status A = from public API responses in data/raw/ · B = from the published collector outputs (data/pumpfun-16d/) ·
C = needs the raw per-position files (on request). Run from the repository root:  python3 check/check_numbers.py
Writes results/numbers.csv and results/numbers.md."""
import json, csv, gzip, os, glob, math, statistics, random, datetime as dt, collections
R = 'data/raw'; S = 'data/pumpfun-16d'; rows = []
def add(cid, claim, paper, value, status, tol=0.02, fmt=None):
    ok = None
    if isinstance(paper, (int, float)) and isinstance(value, (int, float)):
        ok = abs(value - paper) <= tol * max(abs(paper), 1e-12)
    elif value is not None and paper is not None: ok = (value == paper)
    rows.append((cid, claim, paper, value, status, 'PASS' if ok else ('ERR' if value is None else 'FAIL')))
def load(name):
    with open(os.path.join(R, name)) as f: return json.load(f)
def daily(name):
    return {dt.datetime.fromtimestamp(t, dt.timezone.utc).date(): float(v or 0) for t, v in load(name)['totalDataChart']}
def monthly(d):
    m = collections.defaultdict(float)
    for k, v in d.items(): m[(k.year, k.month)] += v
    return m
def weekly(d):
    w = collections.defaultdict(float)
    for k, v in d.items(): w[k - dt.timedelta(days=k.weekday())] += v
    return w
try:
    rev, fees = daily('llama_pump_revenue.json'), daily('llama_pump_fees.json'); mr, mf = monthly(rev), monthly(fees); wr = weekly(rev)
    last = max(rev); d30 = [k for k in rev if last - dt.timedelta(days=29) <= k <= last]
    r30 = sum(rev[k] for k in d30); f30 = sum(fees.get(k, 0) for k in d30)
    add('A1', 'Take rate Jan 2025 = 100 %', 100, 100 * mr[(2025, 1)] / mf[(2025, 1)], 'A')
    add('A2', 'Take rate Jul 2025 (token launch) = 58 %', 58, 100 * mr[(2025, 7)] / mf[(2025, 7)], 'A', 0.02)
    add('A3', 'Take rate Sep 2026 = 32 %', 32, 100 * mr[(2026, 9)] / mf[(2026, 9)], 'A', 0.02)
    add('A4', 'Take rate trailing 30 days = 35 %', 35, 100 * r30 / f30, 'A', 0.02)
    add('A5', 'Revenue trailing 30 days = $68.7M', 68.7, r30 / 1e6, 'A')
    add('A6', 'Fees trailing 30 days = $194.7M', 194.7, f30 / 1e6, 'A')
    add('A7', 'Run-rate revenue = $836M/yr', 836, r30 / 1e6 * 365 / 30, 'A')
    base = sum(mr[(2026, m)] for m in range(2, 7)) / 5 * 12 / 1e6
    add('A8', 'Base revenue Feb-Jun 2026 average = $398M/yr', 398, base, 'A')
    add('A9', 'June 2026 trough = $319M/yr', 319, mr[(2026, 6)] * 12 / 1e6, 'A')
    ttm = sum(v for (y, m), v in mr.items() if (2025, 10) <= (y, m) <= (2026, 9)) / 1e6; prev = sum(v for (y, m), v in mr.items() if (2024, 10) <= (y, m) <= (2025, 9)) / 1e6
    add('A10', 'Trailing 12 months revenue = $465M, -38 % on the year before', 465, ttm, 'A'); add('A10b', 'Prior 12 months = $753.5M', 753.5, prev, 'A')
    add('A11', 'Peak month Jan 2025 -> Jul 2025 = -87 %', -87, 100 * (mr[(2025, 7)] / mr[(2025, 1)] - 1), 'A', 0.02)
    add('A12', 'Sep 2025 -> Jun 2026 = -52 %', -52, 100 * (mr[(2026, 6)] / mr[(2025, 9)] - 1), 'A', 0.02)
    add('A13', 'Peak week (Sep 28, 2026) = $17.9M', 17.9, wr[dt.date(2026, 9, 28)] / 1e6, 'A')
    l7 = sum(rev[k] for k in rev if last - dt.timedelta(days=6) <= k <= last) / 1e6
    add('A14', 'Last full 7 days to Oct 20 = $14.0M', 14.0, l7, 'A')
    add('A15', 'Weekly revenue, week of Aug 24 -> week of Aug 31, 2026 = -39 %', -39, 100 * (wr[dt.date(2026, 8, 31)] / wr[dt.date(2026, 8, 24)] - 1), 'A', 0.03)
    coin = load('cg_pump_coin.json')['market_data']; tot, circ = coin['total_supply'], coin['circulating_supply']
    add('A16', 'Burned to date = 17.3 % of the 1,000B max supply', 17.3, 100 * (1 - tot / 1e12), 'A')
    mc = load('cg_pump_chart.json')['market_caps'][-1][1]; px = load('cg_pump_chart.json')['prices'][-1][1]
    mult = mc / (r30 * 365 / 30); add('A17', 'Multiple = 2.6x market cap / run-rate revenue', 2.62, mult, 'A', 0.02)
    tgt = mult * base * 1e6 / circ; add('A18', 'Target = $0.00226 (2.62x base revenue / circulating)', 0.00226, tgt, 'A', 0.02)
    add('A19', 'Price Oct 21, 2026 = $0.00474', 0.00474, px, 'A', 0.01)
    add('A20', 'Target = -54 % from $0.00474 (rounded $0.0022)', -54, 100 * (0.0022 / px - 1), 'A', 0.02)
    fr = sorted(load('binance_pump_funding.json'), key=lambda x: x['fundingTime']); tmax = fr[-1]['fundingTime']; rates = [float(x['fundingRate']) for x in fr if x['fundingTime'] >= tmax - 30 * 86400 * 1000]
    add('A21', 'Binance funding, last 30 days, annualised (settled every 4 h, 6 a day) = +8.25 %/yr', 8.25, 100 * statistics.mean(rates) * 6 * 365, 'A', 0.05)
    lps = {os.path.basename(f)[9:-10]: weekly(daily(os.path.basename(f))) for f in glob.glob(os.path.join(R, 'llama_lp_*_fees.json'))}
    def pie(w): return sum(lps[n].get(w, 0) for n in lps) / 1e6
    def share(w): return 100 * lps['pump.fun'].get(w, 0) / 1e6 / pie(w)
    add('A22', 'Launchpad pie (launchpads only, 16 venues), week of Jun 1 = $6.5M', 6.5, pie(dt.date(2026, 6, 1)), 'A', 0.05)
    add('A23', 'Pie, week of Sep 7 = $85M', 85.3, pie(dt.date(2026, 9, 7)), 'A', 0.03)
    add('A24', 'Pie, week of Oct 12 = $26M (-70 % from peak)', 25.8, pie(dt.date(2026, 10, 12)), 'A', 0.03)
    add('A25', 'pump.fun launchpad share Jun 1 / Sep 7 / Oct 12 = 83 / 10 / 52 % (DefiLlama split; dropped from the paper on Nov 6, see crosscheck/)', 83, share(dt.date(2026, 6, 1)), 'A', 0.02); add('A25b', '... Sep 7 = 10 %', 10.5, share(dt.date(2026, 9, 7)), 'A', 0.05); add('A25c', '... Oct 12 = 52 %', 52, share(dt.date(2026, 10, 12)), 'A', 0.02)
    bd = load('llama_pump_fees.json')['totalDataChartBreakdown']; w1 = collections.defaultdict(float); w2 = collections.defaultdict(float)
    for t, d in bd:
        day = dt.datetime.fromtimestamp(t, dt.timezone.utc).date()
        for chain, prods in d.items():
            for prod, v in prods.items():
                if dt.date(2026, 10, 6) <= day <= dt.date(2026, 10, 12): w1[prod] += v
                elif dt.date(2026, 10, 13) <= day <= dt.date(2026, 10, 19): w2[prod] += v
    add('A26', 'PumpSwap fees week on week (Oct 6-12 -> 13-19) = -18 %', -18, 100 * (w2['PumpSwap'] / w1['PumpSwap'] - 1), 'A', 0.05)
    add('A27', 'Curve fees week on week = -14 %', -14, 100 * (w2['pump.fun'] / w1['pump.fun'] - 1), 'A', 0.05)
    add('A28', 'Daily revenue Tue Oct 6 -> Tue Oct 20 = -24 %', -24, 100 * (rev[dt.date(2026, 10, 20)] / rev[dt.date(2026, 10, 6)] - 1), 'A', 0.05)
except Exception as e: rows.append(('A', 'public-data block failed', None, repr(e)[:80], 'A', 'ERR'))
# ---- B: collector outputs ----
try:
    days = sorted(glob.glob(os.path.join(S, '2026-10-*.json'))); J = {}
    for f in days:
        with open(f) as fh: J[os.path.basename(f)[:10]] = json.load(fh)
    T = {d: j['familles']['pf|SOL']['tout'] for d, j in J.items()}
    f2060 = {d: next(x for x in t['fouleNonGradues'] if x['age'] == '20-60 s') for d, t in T.items()}
    add('B1', '16 days of data', 16, len(J), 'B', 0)
    add('B2', '20-60 s positions = 1,691,317', 1691317, sum(x['positions'] for x in f2060.values()), 'B', 0)
    meds = [100 * f2060[d]['medianeStrict'] for d in sorted(f2060)]
    add('B3', 'Daily medians all negative (16/16)', 16, sum(1 for m in meds if m < 0), 'B', 0)
    add('B4', 'Daily median range -12.3 % .. -25.6 %', -25.6, min(meds), 'B', 0.02); add('B4b', '... max -12.3 %', -12.3, max(meds), 'B', 0.02)
    random.seed(0); boots = sorted(statistics.mean(random.choices(meds, k=16)) for _ in range(10000))
    add('B5', 'Bootstrap CI of the mean of daily medians = [-19.8 ; -16.0]', -19.8, boots[250], 'B', 0.03); add('B5b', '... upper -16.0', -16.0, boots[9749], 'B', 0.03)
    add('B6', 'Mean of daily medians = -17.9 %', -17.9, statistics.mean(meds), 'B', 0.02)
    tok = {d: t['jetons'] for d, t in T.items()}; grad = {d: t['gradues'] for d, t in T.items()}
    add('B7', 'Tokens launched = 395,253', 395253, sum(tok.values()), 'B', 0); add('B8', 'Launches per hour = 1,029', 1029, sum(tok.values()) / (24 * len(J)), 'B', 0.01)
    add('B9', 'Creations Tue Oct 6 -> Tue Oct 20 = -50 %', -50, 100 * (tok['2026-10-20'] / tok['2026-10-06'] - 1), 'B', 0.03)
    add('B10', 'Graduations Oct 6 -> Oct 20 = 837 -> 359 (-57 %)', -57, 100 * (grad['2026-10-20'] / grad['2026-10-06'] - 1), 'B', 0.03)
    ll = {d: j['verificationsLaunchLab']['echanges'] for d, j in J.items()}
    w1 = statistics.mean(ll[d] for d in ll if '2026-10-06' <= d <= '2026-10-12'); w2 = statistics.mean(ll[d] for d in ll if '2026-10-13' <= d <= '2026-10-19')
    add('B11', 'LaunchLab swaps/day -71 % week on week (collector; Allium -54 %, appendix only)', -71, 100 * (w2 / w1 - 1), 'B', 0.02)
except Exception as e: rows.append(('B', 'collector block failed', None, repr(e)[:80], 'B', 'ERR'))
try:
    s_all = []; v_all = []; s_sold = []; paid = 0.0; pw = 0.0; never = 0; n = 0
    with gzip.open(os.path.join(S, 'crowd_20-60s.csv.gz'), 'rt') as f:
        for r in csv.DictReader(f):
            st = float(r['strict_pnl']); va = float(r['valued_pnl']); p = float(r['paid_sol']); n += 1
            s_all.append(st); v_all.append(va); paid += p; pw += p * st
            if r['never_sold'] == '1': never += 1
            else: s_sold.append(st)
    add('B12', 'Crowd median, strict = -17.4 % (from crowd_20-60s.csv.gz)', -17.4, 100 * statistics.median(s_all), 'B', 0.01)
    add('B13', 'Crowd median, valued at last curve price = -15.4 %', -15.4, 100 * statistics.median(v_all), 'B', 0.01)
    add('B14', 'Crowd median excluding never-sold positions = -12.2 %', -12.2, 100 * statistics.median(s_sold), 'B', 0.01)
    add('B15', 'Never-sold share = 11.2 %', 11.2, 100 * never / n, 'B', 0.02)
    add('B16', 'Stake-weighted crowd P&L = -16.3 % on 902,471 SOL', -16.3, 100 * pw / paid, 'B', 0.01); add('B16b', '... SOL staked = 902,471', 902471, paid, 'B', 0.005)
except Exception as e: rows.append(('B12', 'crowd file block failed', None, repr(e)[:80], 'B', 'ERR'))
try:
    act = collections.Counter()
    with gzip.open(os.path.join(S, 'active_buyers_by_day_ids.csv.gz'), 'rt') as f:
        for r in csv.DictReader(f): act[r['day']] += 1
    w1 = statistics.mean(act[d] for d in act if '2026-10-06' <= d <= '2026-10-12'); w2 = statistics.mean(act[d] for d in act if '2026-10-13' <= d <= '2026-10-19')
    add('B17', 'Active buyers/day Oct 6-12 = 155,300', 155300, w1, 'B', 0.005); add('B17b', '... Oct 13-19 = 114,481', 114481, w2, 'B', 0.005); add('B18', 'Active buyers -26 % week on week (collector; the body uses the Allium count, -16 %)', -26, 100 * (w2 / w1 - 1), 'B', 0.03)
    add('B19', 'Active buyers Tue Oct 6 -> Tue Oct 20 = -38 % (collector; not in the paper)', -38, 100 * (act['2026-10-20'] / act['2026-10-06'] - 1), 'B', 0.03)
    ids = set()
    with gzip.open(os.path.join(S, 'active_buyers_by_day_ids.csv.gz'), 'rt') as f:
        for r in csv.DictReader(f): ids.add(r['buyer_id'])
    add('B20', 'Distinct buying addresses over 16 days = 1,129,662', 1129662, len(ids), 'B', 0)
except Exception as e: rows.append(('B17', 'buyers file block failed', None, repr(e)[:80], 'B', 'ERR'))
for cid, claim in [('C1', 'Food chain by address (Fig. 3): needs the per-position files -> scripts/food_chain.py (author\'s run: results/food_chain_recomputed.json)'), ('C2', 'Pool life 65 s vs 213 s after my buy (Arc, Oct 11-12): bot journals, aggregated in data/bots-daily.csv'), ('C3', 'Share of my buys drained 0 % -> 22 % -> 63 % (Robinhood Chain, Oct 4-6): bot journals'), ('C4', 'Arc 17 days: 93 % of 7,160 trading addresses end negative (data/arc-17d/winners-arc-17d.json, output of scripts/lab/gagnants.mjs)')]:
    rows.append((cid, claim, None, None, 'C', 'NOT RUN'))
os.makedirs('results', exist_ok=True)
with open('results/numbers.csv', 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['id', 'claim', 'paper_value', 'recomputed', 'status', 'result']); w.writerows(rows)
with open('results/numbers.md', 'w') as f:
    f.write('| id | claim in the paper | paper | recomputed | status | result |\n|---|---|---|---|---|---|\n')
    for cid, claim, p, v, st, res in rows: f.write(f"| {cid} | {claim} | {p if p is not None else ''} | {round(v, 4) if isinstance(v, float) else (v if v is not None else '')} | {st} | {res} |\n")
for r in rows: print(f"{r[5]:7} {r[0]:4} {r[1][:70]:70} paper={r[2]} got={round(r[3],4) if isinstance(r[3], float) else r[3]}")
print('PASS', sum(1 for r in rows if r[5] == 'PASS'), 'FAIL', sum(1 for r in rows if r[5] == 'FAIL'), 'ERR', sum(1 for r in rows if r[5] == 'ERR'), 'NOT RUN', sum(1 for r in rows if r[5] == 'NOT RUN'))
