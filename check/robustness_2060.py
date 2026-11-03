#!/usr/bin/env python3
# Robustness of the 20-60 s crowd median (Appendix A): strict vs valued at the last curve price, with/without never-sold
# positions, day by day. Same filter as aggregate.py (family pump.fun/SOL, non-graduated tokens, 20 <= entry age < 60 s).
# Needs the per-position files (status C). Run: python3 check/robustness_2060.py [data/pumpfun-16d]
# Robustesse de la médiane 20-60 s (pump.fun/SOL, non gradués, même filtre que aggregate.py : fam == 'pf|SOL') : strict vs valorisé (dernier prix de courbe), avec/sans positions jamais vendues, jour par jour.
import json, glob, os, statistics as st, sys
import sys
D=sys.argv[1] if len(sys.argv)>1 else 'data/pumpfun-16d'; out={}
def med(x): return st.median(x) if x else None
tot={'s':[], 'v':[], 's_sold':[], 'v_sold':[], 's_closed':[], 'all_s':[], 'all_v':[]}
rows=[]
for f in sorted(glob.glob(os.path.join(D,'2026-10-*.positions.jsonl'))):
    day=os.path.basename(f)[:10]; s=[];v=[];ss=[];vs=[];sc=[];n_never=0;n_closed=0;as_=[];av=[]
    with open(f) as fh:
        for line in fh:
            try: p=json.loads(line)
            except Exception: continue
            if p.get('fam') != 'pf|SOL': continue
            if p.get('gradue'): continue
            as_.append(p['strict']); av.append(p.get('valorise', p['strict']))
            a=p.get('age')
            if a is None or not (20 <= a < 60): continue
            s.append(p['strict']); v.append(p.get('valorise', p['strict']))
            never = (p.get('recu',0) or 0) == 0
            if never: n_never+=1
            else: ss.append(p['strict']); vs.append(p.get('valorise', p['strict']))
            if p.get('ferme'): n_closed+=1; sc.append(p['strict'])
    r=dict(jour=day, n=len(s), med_strict=med(s), med_valorise=med(v), part_jamais_vendu=n_never/len(s) if s else None,
           med_strict_hors_jamais_vendu=med(ss), med_valorise_hors_jamais_vendu=med(vs), part_fermees=n_closed/len(s) if s else None, med_strict_fermees=med(sc),
           all_n=len(as_), all_med_strict=med(as_), all_med_valorise=med(av))
    rows.append(r); print(json.dumps(r), flush=True)
    tot['s']+=s; tot['v']+=v; tot['s_sold']+=ss; tot['v_sold']+=vs; tot['s_closed']+=sc; tot['all_s']+=as_; tot['all_v']+=av
import math
def corr(a,b):
    ma,mb=sum(a)/len(a),sum(b)/len(b); num=sum((x-ma)*(y-mb) for x,y in zip(a,b)); den=math.sqrt(sum((x-ma)**2 for x in a)*sum((y-mb)**2 for y in b)); return num/den
agg=dict(n=len(tot['s']), med_strict=med(tot['s']), med_valorise=med(tot['v']), med_strict_hors_jamais_vendu=med(tot['s_sold']), med_valorise_hors_jamais_vendu=med(tot['v_sold']),
         part_jamais_vendu=1-len(tot['s_sold'])/len(tot['s']), med_strict_fermees=med(tot['s_closed']), part_fermees=len(tot['s_closed'])/len(tot['s']),
         all_n=len(tot['all_s']), all_med_strict=med(tot['all_s']), all_med_valorise=med(tot['all_v']),
         jours_negatifs_valorise=sum(1 for r in rows if r['med_valorise']<0), jours_negatifs_hors_jamais_vendu=sum(1 for r in rows if r['med_strict_hors_jamais_vendu']<0),
         corr_jamaisvendu_medstrict=corr([r['part_jamais_vendu'] for r in rows],[r['med_strict'] for r in rows]),
         corr_jamaisvendu_medhors=corr([r['part_jamais_vendu'] for r in rows],[r['med_strict_hors_jamais_vendu'] for r in rows]),
         corr_jamaisvendu_medvalorise=corr([r['part_jamais_vendu'] for r in rows],[r['med_valorise'] for r in rows]))
json.dump(dict(agregat=agg, parJour=rows), open(os.path.join(D,'robustesse-2060.json'),'w'), indent=1)
print('AGG', json.dumps(agg))
