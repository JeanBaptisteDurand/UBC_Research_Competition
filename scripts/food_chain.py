#!/usr/bin/env python3
"""Food chain (Fig. 4, Appendix B): median strict P&L per position by how many positions each address took in the window.
Needs the per-position files <day>.positions.jsonl (status C, 3.9 GB, on request). Two passes: count positions per address,
then pool P&L per segment. Run:  python3 scripts/food_chain.py [data/pumpfun-16d] [out.json]"""
import json, glob, os, sys, statistics, array, collections
D = sys.argv[1] if len(sys.argv) > 1 else 'data/pumpfun-16d'
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(D, 'food_chain_recomputed.json')
FAM = 'pf|SOL'; FILES = sorted(glob.glob(os.path.join(D, '2026-10-*.positions.jsonl')))
if not FILES: sys.exit('no .positions.jsonl in ' + D + ' (status C: raw per-position files, on request)')
EDGES = [(1,1,'1 position'),(2,5,'2-5'),(6,20,'6-20'),(21,100,'21-100'),(101,500,'101-500'),(501,2000,'501-2,000'),(2001,10**9,'> 2,000')]
def seg(n): return next(i for i,(a,b,_) in enumerate(EDGES) if a <= n <= b)
def rows(f):
    with open(f) as fh:
        for line in fh:
            try: p = json.loads(line)
            except ValueError: continue
            if p.get('fam') == FAM: yield p
cnt_all = collections.Counter(); cnt_ng = collections.Counter(); days = collections.defaultdict(int)
for di, f in enumerate(FILES):
    for p in rows(f):
        u = p['u']; cnt_all[u] += 1; days[u] |= 1 << di
        if not p.get('gradue'): cnt_ng[u] += 1
# Segments are defined on ALL positions of the address (graduated tokens included); the 'nongrad' variant keeps the same
# segments but pools only positions on non-graduated tokens, with percentages relative to the all-token totals (as published)
# and, in addition, relative to the non-graduated totals (as drawn in Fig. 4).
res = {}; hands = [0]*len(EDGES)
for u, n in cnt_all.items(): hands[seg(n)] += 1
H = sum(hands)
for variant in ('all', 'nongrad'):
    pnl = [array.array('d') for _ in EDGES]; sol = [0.0]*len(EDGES); npos = [0]*len(EDGES)
    for f in FILES:
        for p in rows(f):
            if variant == 'nongrad' and p.get('gradue'): continue
            s = seg(cnt_all[p['u']]); pnl[s].append(p['strict']); sol[s] += p['paye']; npos[s] += 1
    P = sum(npos); SOL = sum(sol)
    if variant == 'all': P_all, SOL_all = P, SOL
    res[variant] = dict(hands=H, positions=P, sol=SOL, segments=[dict(label=l, hands=hands[i], pctHands=100*hands[i]/H, positions=npos[i], pctPositions=100*npos[i]/P_all, pctPositionsOfVariant=100*npos[i]/P, sol=sol[i], pctSol=100*sol[i]/SOL_all, pctSolOfVariant=100*sol[i]/SOL, median=100*statistics.median(pnl[i]) if len(pnl[i]) else None) for i,(a,b,l) in enumerate(EDGES)])
script = [u for u, n in cnt_all.items() if n > 100 and bin(days[u]).count('1') >= 10]
res['script_profile'] = dict(definition='> 100 positions and active on >= 10 of the days, all tokens', hands=len(script), pctHands=100*len(script)/len(cnt_all))
json.dump(res, open(OUT, 'w'), indent=1)
for v in ('all','nongrad'):
    print(v, res[v]['hands'], 'addresses,', res[v]['positions'], 'positions')
    for s in res[v]['segments']: print(f"  {s['label']:>10}: {s['pctHands']:5.2f} % of addresses, {s['pctPositions']:5.1f} % of positions ({s['pctPositionsOfVariant']:5.1f} % of the variant), {s['pctSol']:5.1f} % of SOL ({s['pctSolOfVariant']:5.1f} %), median {s['median']:+.1f} %")
print('script profile:', res['script_profile'])
