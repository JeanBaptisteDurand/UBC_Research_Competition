#!/usr/bin/env python3
# Level-B export (status B files): crowd_20-60s.csv.gz (one row per 20-60 s position, no address) and
# active_buyers_by_day_ids.csv.gz (addresses replaced by integer ids). Needs the per-position files (status C).
# Niveau B pour le repo public : la foule 20-60 s (pump.fun/SOL, non gradués) sans adresse, et les acheteurs actifs par jour sous identifiants entiers.
import json, glob, os, gzip, csv
import sys
D=sys.argv[1] if len(sys.argv)>1 else 'data/pumpfun-16d'; OUT=sys.argv[2] if len(sys.argv)>2 else D
ids={}; n1=n2=0
with gzip.open(os.path.join(OUT,'crowd_20-60s.csv.gz'),'wt',newline='') as f1, gzip.open(os.path.join(OUT,'active_buyers_by_day_ids.csv.gz'),'wt',newline='') as f2:
    w1=csv.writer(f1); w1.writerow(['day','age_s','paid_sol','strict_pnl','valued_pnl','never_sold','closed'])
    w2=csv.writer(f2); w2.writerow(['day','buyer_id'])
    for fp in sorted(glob.glob(os.path.join(D,'2026-10-*.positions.jsonl'))):
        day=os.path.basename(fp)[:10]; seen=set()
        with open(fp) as fh:
            for line in fh:
                try: p=json.loads(line)
                except Exception: continue
                if p.get('fam')!='pf|SOL': continue
                u=p['u']
                if u not in seen:
                    seen.add(u); i=ids.setdefault(u,len(ids)+1); w2.writerow([day,i]); n2+=1
                a=p.get('age')
                if p.get('gradue') or a is None or not (20<=a<60): continue
                w1.writerow([day, round(a,1), round(p['paye'],4), round(p['strict'],4), round(p.get('valorise',p['strict']),4), int((p.get('recu',0) or 0)==0), int(bool(p.get('ferme')))]); n1+=1
print('rows crowd', n1, 'rows buyers', n2, 'distinct ids', len(ids))
