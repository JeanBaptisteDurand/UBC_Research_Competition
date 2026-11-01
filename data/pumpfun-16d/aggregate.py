#!/usr/bin/env python3
"""AGRÉGER les sorties jour par jour de `solana-courbes.mjs` (famille pump.fun/SOL) en UNE fenêtre.

    python3 aggregate.py [dossier]          (par défaut : le dossier de ce script)

Lit <jour>.json (résultat complet de l'outil) et <jour>.positions.jsonl (une ligne par position de la foule) et écrit
aggregate-pumpfun.json + aggregate-pumpfun.md. Règles :
 - les jetons sont PARTITIONNÉS par jour de naissance (fenêtre 00:00 → 24:00 UTC) : aucune position n'est comptée deux fois ;
 - les médianes sont recalculées sur l'ensemble des positions (pas une médiane de médianes) ;
 - « transactions » : chaque jour lit aussi le fichier 00 h du lendemain pour fermer les positions → la somme des
   transactions lues SURCOMPTE d'environ 1 h sur 25 ; on publie la somme corrigée ×24/25 et on le dit ;
 - une adresse est « nouvelle » le premier jour où elle apparaît dans la fenêtre (borne basse : elle a pu exister avant).
"""
import json, sys, os, glob, statistics, collections

D = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
FAM = 'pf|SOL'
jours = sorted(os.path.basename(f)[:10] for f in glob.glob(f'{D}/20??-??-??.json'))
if not jours: sys.exit(f'aucun <jour>.json dans {D}')
if not glob.glob(f'{D}/*.positions.jsonl'): sys.exit('positions.jsonl missing: the published aggregate-pumpfun.json was computed from the per-position files (status C, on request); refusing to overwrite it with empty aggregates.')

def pct(x, n=1): return '—' if x is None else f'{100*x:+.{n}f} %'      # rendement (signé)
def pe(p): return f'p = {p:.1e}' if p else 'p non calculé : pas toutes négatives'
def part(x, n=1): return '—' if x is None else f'{100*x:.{n}f} %'      # part (non signée)
def med(a): return statistics.median(a) if a else None

par_jour, tot = [], collections.Counter()
strict_2060, strict_tous, paye_2060, pr_2060 = [], [], 0.0, 0.0
vus, nouvelles_par_jour, actives_par_jour, cohortes, ensembles = set(), {}, {}, {}, {}
heures_neg_med = heures_neg_rob = heures = 0
for j in jours:
    r = json.load(open(f'{D}/{j}.json'))
    t = r['familles'][FAM]['tout']
    r6060 = next((x for x in t['rejeu'] if x['E'] == 60 and x['H'] == 60), None)
    f2060 = next(x for x in t['fouleNonGradues'] if x['age'] == '20-60 s')
    meilleur_tiers = max(t['tiers'], key=lambda x: x['robuste'] if x['robuste'] is not None else -9)
    vc = t['venteCreateur']['créateur']; vcs = t['venteCreateur']['créateur + slot de création']
    cma = r['familles'][FAM].get('choixMarcheAvant', {})
    can = r['couverture']['canari']['pumpfun']
    for h in r['parHeure']:
        heures += 1
        if h['r6060']['mediane'] is not None and h['r6060']['mediane'] < 0: heures_neg_med += 1
        if h['r6060']['robuste'] is not None and h['r6060']['robuste'] < 0: heures_neg_rob += 1
    o = dict(jour=j, minutes=f"{r['couverture']['minutesLues']}/{r['couverture']['minutesAttendues']}", sansSource=r['couverture']['minutesSansSource'],
             canari=can['recues'] / can['attendues'] if can['attendues'] else None, txLues=r['lecture']['transactions'], comptesLus=r['lecture']['comptes'],
             jetons=t['jetons'], parHeure=t['parHeure'], second=t['secondAcheteur'], secondStrict=t['secondAcheteurStrict'], secondStrict001=t['secondStrict001'],
             gradues=t['gradues'], partGradues=t['gradues'] / t['jetons'], sansEchange=t['sansEchange'],
             createurPaye=t['mainCreateur']['payeSol'], createurRecu=t['mainCreateur']['recuSol'], createurPnl=t['mainCreateur']['pnl'],
             pos2060=f2060['positions'], paye2060=f2060['payeSol'], strict2060=f2060['strict'], med2060=f2060['medianeStrict'], gagnants2060=f2060['gagnants'], jamaisVendu2060=f2060['jamaisVendu'],
             posNonGradues=sum(x['positions'] for x in t['fouleNonGradues']),
             r6060MargMed=r6060['marginal']['mediane'] if r6060 else None, r6060MargRob=r6060['marginal']['robuste'] if r6060 else None,
             r6060Net001Rob=r6060['net']['0.01']['robuste'] if r6060 else None, r6060FluxPositif=r6060.get('fluxPositif') if r6060 else None,
             marcheAvant=dict(E=cma.get('E'), H=cma.get('H'), premiere=(cma.get('premiere') or {}).get('robuste'), seconde=(cma.get('seconde') or {}).get('robuste'), n2=cma.get('nSeconde')),
             tiersMeilleur=dict(E=meilleur_tiers['E'], H=meilleur_tiers['H'], n=meilleur_tiers['n'], moyenne=meilleur_tiers['moyenne'], robuste=meilleur_tiers['robuste'], mediane=meilleur_tiers['mediane']),
             venteCreateur=dict(apres=vc['apresAchat'], temoin=vc['temoin'], ratio=vc['apresAchat'] / vc['temoin'] if vc['temoin'] else None, apresSlot=vcs['apresAchat'], temoinSlot=vcs['temoin'], ratioSlot=vcs['apresAchat'] / vcs['temoin'] if vcs['temoin'] else None),
             temoinPositif=t['temoinPositif']['multiplePrixMed'], dureeSlot=r['dureeSlot'])
    par_jour.append(o)
    for k in ['jetons', 'gradues', 'txLues', 'pos2060', 'posNonGradues']: tot[k] += o[k]
    tot['heures'] += 24; tot['createurPaye'] += o['createurPaye']; tot['createurRecu'] += o['createurRecu']
    tot['second_w'] += o['second'] * o['jetons']; tot['secondStrict_w'] += o['secondStrict'] * o['jetons']; tot['secondStrict001_w'] += o['secondStrict001'] * o['jetons']
    tot['sansEchange_w'] += o['sansEchange'] * o['jetons']
    # positions : médianes recalculées sur l'ensemble, adresses actives / nouvelles
    act = set()
    fp = f'{D}/{j}.positions.jsonl'
    if os.path.exists(fp):
        with open(fp) as fh:
            for l in fh:
                try: p = json.loads(l)
                except ValueError: continue
                if p['fam'] != FAM: continue
                act.add(p['u'])
                if p.get('gradue'): continue
                strict_tous.append(p['strict'])
                if 20 <= p['age'] < 60: strict_2060.append(p['strict']); paye_2060 += p['paye']; pr_2060 += p['paye'] * p['strict']
    nouvelles_par_jour[j] = len(act - vus); actives_par_jour[j] = len(act); cohortes[j] = act - vus; ensembles[j] = act; vus |= act

# NOUVELLES « glissantes » : adresses du jour jamais vues dans les 7 jours PRÉCÉDENTS (définie à partir du 8e jour ; la
# mesure « jamais vue dans la fenêtre » décroît mécaniquement les premiers jours, celle-ci est comparable d'un jour à l'autre)
nouvelles7 = {}
for i, j in enumerate(jours):
    if i < 7: nouvelles7[j] = None; continue
    prec = set().union(*[ensembles[x] for x in jours[i - 7:i]])
    nouvelles7[j] = len(ensembles[j] - prec)
# rétention des COHORTES de nouvelles adresses : part revue dans les 1 / 7 jours suivants, et « jamais revue » dans la fenêtre
retention = []
for i, j in enumerate(jours):
    c = cohortes[j]
    if not c: continue
    suiv = jours[i + 1:]
    r1 = len(c & ensembles[suiv[0]]) / len(c) if suiv else None
    s7 = set().union(*[ensembles[x] for x in suiv[:7]]) if suiv else set()
    r7 = len(c & s7) / len(c) if len(suiv) >= 7 else None
    stout = set().union(*[ensembles[x] for x in suiv]) if suiv else set()
    retention.append(dict(jour=j, cohorte=len(c), r1=r1, r7=r7, joursSuivants=len(suiv), revueAvantFin=len(c & stout) / len(c) if suiv else None))

n = len(jours)
# INDICES DE CONFIANCE (demande de JB) : IC95 de la médiane par statistique d'ordre (exact, sans rééchantillonnage :
# rangs n/2 ± 1,96·√n/2), IC95 de la moyenne (normal, écart-type/√n), part de positions perdantes, test du signe sur
# les jours et sur les heures (p = 0,5^k pour k unités toutes négatives, unilatéral).
def ic_mediane(a):
    if len(a) < 100: return None
    s = sorted(a); k = len(s); h = 1.959964 * math.sqrt(k) / 2
    return [s[max(0, int(k / 2 - h))], s[min(k - 1, int(k / 2 + h))]]
def ic_moyenne(a):
    if len(a) < 100: return None
    m = statistics.fmean(a); sd = statistics.pstdev(a); e = 1.959964 * sd / math.sqrt(len(a)); return [m, m - e, m + e]
import math
icm2060 = ic_mediane(strict_2060); icmoy2060 = ic_moyenne(strict_2060); icmtous = ic_mediane(strict_tous)
jours_neg = sum(1 for o in par_jour if o['med2060'] < 0)
confiance = dict(
    foule2060=dict(n=len(strict_2060), ic95Mediane=icm2060, moyenne=icmoy2060[0] if icmoy2060 else None, ic95Moyenne=icmoy2060[1:] if icmoy2060 else None,
                   partPerdantes=sum(1 for x in strict_2060 if x < 0) / len(strict_2060) if strict_2060 else None),
    fouleTousAges=dict(n=len(strict_tous), ic95Mediane=icmtous),
    testSigneJours=dict(k=jours_neg, n=n, pUnilateral=0.5 ** n if jours_neg == n else None),
    testSigneHeures=dict(k=heures_neg_med, n=heures, pUnilateral=0.5 ** heures if heures_neg_med == heures else None),
    note='IC95 de la médiane par statistique d\'ordre ; IC95 de la moyenne par approximation normale ; test du signe unilatéral : probabilité d\'observer k/k unités négatives si la vraie médiane était nulle.')
agg = dict(
    confiance=confiance,
    fenetre=dict(debut=jours[0], fin=jours[-1], jours=n, heures=tot['heures'], outil='labo/solana-courbes.mjs (inchangé), un passage par jour 00:00→24:00 UTC'),
    couverture=dict(minutesSansSource=sum(o['sansSource'] for o in par_jour), canariMin=min(o['canari'] for o in par_jour), canariMoy=sum(o['canari'] for o in par_jour) / n),
    transactionsLues=tot['txLues'], transactionsCorrigees=round(tot['txLues'] * 24 / 25), comptesLusMoyJour=round(sum(o['comptesLus'] for o in par_jour) / n),
    jetons=tot['jetons'], lancementsParHeure=tot['jetons'] / tot['heures'],
    secondAcheteur=tot['second_w'] / tot['jetons'], secondAcheteurStrict=tot['secondStrict_w'] / tot['jetons'], secondStrict001=tot['secondStrict001_w'] / tot['jetons'],
    gradues=tot['gradues'], partGradues=tot['gradues'] / tot['jetons'], sansEchange=tot['sansEchange_w'] / tot['jetons'],
    sansEchangeMinMaxJour=[min(o['sansEchange'] for o in par_jour), max(o['sansEchange'] for o in par_jour)],
    createur=dict(payeSol=round(tot['createurPaye']), recuSol=round(tot['createurRecu']), pnl=(tot['createurRecu'] - tot['createurPaye']) / tot['createurPaye']),
    foule2060=dict(positions=len(strict_2060), medianeStrict=med(strict_2060), strictPondere=(pr_2060 / paye_2060) if paye_2060 else None, payeSol=round(paye_2060),
                   gagnants=sum(1 for x in strict_2060 if x > 0) / len(strict_2060) if strict_2060 else None,
                   medianeParJourMin=min(o['med2060'] for o in par_jour), medianeParJourMax=max(o['med2060'] for o in par_jour), joursNegatifs=sum(1 for o in par_jour if o['med2060'] < 0)),
    fouleTousAgesNonGradues=dict(positions=len(strict_tous), medianeStrict=med(strict_tous), gagnants=sum(1 for x in strict_tous if x > 0) / len(strict_tous) if strict_tous else None),
    rejeu6060=dict(margMedMin=min(o['r6060MargMed'] for o in par_jour), margMedMax=max(o['r6060MargMed'] for o in par_jour), joursNegatifsRob=sum(1 for o in par_jour if o['r6060Net001Rob'] < 0),
                   marcheAvantSecondeMin=min(o['marcheAvant']['seconde'] for o in par_jour if o['marcheAvant']['seconde'] is not None), marcheAvantSecondeMax=max(o['marcheAvant']['seconde'] for o in par_jour if o['marcheAvant']['seconde'] is not None)),
    heures=dict(total=heures, r6060MedianeNegative=heures_neg_med, r6060RobusteNegative=heures_neg_rob),
    tiers=dict(joursMeilleureCaseRobusteNegative=sum(1 for o in par_jour if o['tiersMeilleur']['robuste'] < 0), meilleurRobusteMax=max(o['tiersMeilleur']['robuste'] for o in par_jour), meilleureMedianeMax=max(o['tiersMeilleur']['mediane'] for o in par_jour)),
    venteCreateur=dict(ratioMin=min(o['venteCreateur']['ratio'] for o in par_jour), ratioMax=max(o['venteCreateur']['ratio'] for o in par_jour), ratioSlotMin=min(o['venteCreateur']['ratioSlot'] for o in par_jour), ratioSlotMax=max(o['venteCreateur']['ratioSlot'] for o in par_jour)),
    temoinPositifMin=min(o['temoinPositif'] for o in par_jour), temoinPositifMax=max(o['temoinPositif'] for o in par_jour),
    adresses=dict(distinctesFenetre=len(vus), activesParJour=actives_par_jour, nouvellesParJour=nouvelles_par_jour, nouvelles7jParJour=nouvelles7, retentionCohortes=retention),
    parJour=par_jour)
json.dump(agg, open(f'{D}/aggregate-pumpfun.json', 'w'), indent=1, ensure_ascii=False)

L = [f"# pump.fun/SOL — {n} jours ({jours[0]} → {jours[-1]}), {tot['heures']} h, outil `solana-courbes.mjs` inchangé, un passage par jour\n",
     f"- Couverture : {agg['couverture']['minutesSansSource']} minute sans source sur {tot['heures']*60} ; canari pump.fun moyen {agg['couverture']['canariMoy']:.4f} (pire jour {agg['couverture']['canariMin']:.4f}).",
     f"- Lu : {agg['transactionsLues']:,} transactions (dont ~1 h/25 lue deux fois → ≈ {agg['transactionsCorrigees']:,} distinctes) ; ~{agg['comptesLusMoyJour']:,} comptes lus par jour.",
     f"- Jetons nés : {agg['jetons']:,} = **{agg['lancementsParHeure']:,.0f}/h** ; gradués {agg['gradues']:,} = **{part(agg['partGradues'])}** ; sans aucun échange **{part(agg['sansEchange'])}** (jour min {part(agg['sansEchangeMinMaxJour'][0])}, max {part(agg['sansEchangeMinMaxJour'][1])}).",
     f"- Second acheteur (60 s, créateur exclu) **{part(agg['secondAcheteur'])}** ; strict {part(agg['secondAcheteurStrict'])} ; strict et achats ≥ 0,01 SOL {part(agg['secondStrict001'])}.",
     f"- Foule entrée 20-60 s, jetons non gradués : **{agg['foule2060']['positions']:,} positions, médiane {pct(agg['foule2060']['medianeStrict'])}**, pondérée par la mise {pct(agg['foule2060']['strictPondere'])}, gagnants {part(agg['foule2060']['gagnants'])} ; médiane par jour entre {pct(agg['foule2060']['medianeParJourMin'])} et {pct(agg['foule2060']['medianeParJourMax'])} ; **{agg['foule2060']['joursNegatifs']}/{n} jours négatifs**.",
     f"- Foule tous âges, non gradués : {agg['fouleTousAgesNonGradues']['positions']:,} positions, médiane {pct(agg['fouleTousAgesNonGradues']['medianeStrict'])}, gagnants {part(agg['fouleTousAgesNonGradues']['gagnants'])}.",
     f"- **Confiance** (20-60 s) : IC95 de la médiane [{pct(confiance['foule2060']['ic95Mediane'][0]) if confiance['foule2060']['ic95Mediane'] else '—'} ; {pct(confiance['foule2060']['ic95Mediane'][1]) if confiance['foule2060']['ic95Mediane'] else '—'}] ; moyenne {pct(confiance['foule2060']['moyenne'])} IC95 [{pct(confiance['foule2060']['ic95Moyenne'][0]) if confiance['foule2060']['ic95Moyenne'] else '—'} ; {pct(confiance['foule2060']['ic95Moyenne'][1]) if confiance['foule2060']['ic95Moyenne'] else '—'}] ; positions perdantes {part(confiance['foule2060']['partPerdantes'])} ; test du signe : {confiance['testSigneJours']['k']}/{confiance['testSigneJours']['n']} jours négatifs ({pe(confiance['testSigneJours']['pUnilateral'])}), {confiance['testSigneHeures']['k']}/{confiance['testSigneHeures']['n']} heures ({pe(confiance['testSigneHeures']['pUnilateral'])}).",
     f"- Main du créateur : payé {agg['createur']['payeSol']:,} SOL, reçu {agg['createur']['recuSol']:,} SOL → **{pct(agg['createur']['pnl'])}** (ventes après graduation invisibles).",
     f"- Rejeu E=60/H=60 au prix marginal : médiane par jour entre {pct(agg['rejeu6060']['margMedMin'])} et {pct(agg['rejeu6060']['margMedMax'])} (les frais d'un aller-retour ≈ 2,5 %) ; net robuste à 0,01 SOL négatif {agg['rejeu6060']['joursNegatifsRob']}/{n} jours ; marche avant (2de moitié de chaque jour) entre {pct(agg['rejeu6060']['marcheAvantSecondeMin'])} et {pct(agg['rejeu6060']['marcheAvantSecondeMax'])}.",
     f"- Heure par heure : **{agg['heures']['r6060MedianeNegative']}/{agg['heures']['total']} heures** à médiane négative (robuste négative {agg['heures']['r6060RobusteNegative']}/{agg['heures']['total']}).",
     f"- Tiers au timing (meilleure case du jour) : robuste négative {agg['tiers']['joursMeilleureCaseRobusteNegative']}/{n} jours ; meilleur robuste {pct(agg['tiers']['meilleurRobusteMax'])}, meilleure médiane {pct(agg['tiers']['meilleureMedianeMax'])}.",
     f"- Vente du créateur ≤ 3 s après un petit achat vs témoin : ×{agg['venteCreateur']['ratioMin']:.1f} à ×{agg['venteCreateur']['ratioMax']:.1f} (avec le slot de création ×{agg['venteCreateur']['ratioSlotMin']:.1f} à ×{agg['venteCreateur']['ratioSlotMax']:.1f}).",
     f"- Témoin positif (gradués, prix naissance→fin de courbe) : ×{agg['temoinPositifMin']:.2f} à ×{agg['temoinPositifMax']:.2f} (théorie ×14,7).",
     f"- Adresses de la foule (pf|SOL, toutes positions) : {agg['adresses']['distinctesFenetre']:,} distinctes sur la fenêtre.",
     "- Rétention des cohortes de NOUVELLES adresses (part revue le lendemain / dans les 7 jours) : " + (" ; ".join(f"{r['jour'][5:]} n={r['cohorte']:,} r1={part(r['r1'])} r7={part(r['r7'])}" for r in retention if r['r7'] is not None) or "(fenêtre trop courte)") + "\n",
     "| jour | jetons | /h | second ach. | gradués | sans éch. | pos. 20-60 s | médiane 20-60 s | gagnants | créateur | rejeu 60/60 méd. | tiers meilleur rob. | adresses actives | nouvelles (fenêtre) | nouvelles (vs 7 j préc.) | canari |",
     "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
for o in par_jour:
    n7 = nouvelles7[o['jour']]
    L.append(f"| {o['jour']} | {o['jetons']:,} | {o['parHeure']:,.0f} | {part(o['second'])} | {part(o['partGradues'])} | {part(o['sansEchange'])} | {o['pos2060']:,} | {pct(o['med2060'])} | {part(o['gagnants2060'])} | {pct(o['createurPnl'])} | {pct(o['r6060MargMed'])} | {pct(o['tiersMeilleur']['robuste'])} | {actives_par_jour[o['jour']]:,} | {nouvelles_par_jour[o['jour']]:,} | {('—' if n7 is None else f'{n7:,}')} | {o['canari']:.3f} |")
open(f'{D}/aggregate-pumpfun.md', 'w').write('\n'.join(L) + '\n')
print('\n'.join(L))
