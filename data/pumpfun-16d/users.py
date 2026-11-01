#!/usr/bin/env python3
"""ÉCONOMIE D'UTILISATEURS de pump.fun — la 3e méthode de valorisation (base d'utilisateurs × revenu par utilisateur).

    python3 users.py            (depuis research-competition/)

Croise, jour par jour : nos adresses acheteuses actives / nouvelles sur pump.fun/SOL (aggregate-pumpfun.json) et le revenu
et les frais quotidiens du protocole (DefiLlama, data/raw/llama_pump_revenue.json et llama_pump_fees.json). Écrit
users.md + users.json. Ce que ça donne :
 1. revenu par acheteur actif-jour (ARPU-jour) et frais par acheteur actif-jour, jour par jour, moyenne et tendance ;
 2. tendance des NOUVEAUX entrants (ajustement log-linéaire sur les jours : pente hebdomadaire) et des actifs ;
 3. une valorisation « utilisateurs » : revenu annuel = acheteurs actifs par jour × ARPU-jour × 365, projeté avec la
    tendance observée des actifs (bornée) et le multiple courant de la table canonique → prix implicite. ILLUSTRATIF :
    16 points, extrapolation courte ; les hypothèses sont écrites et la sensibilité donnée.
Limites dites : nos adresses = acheteurs sur la COURBE pump.fun/SOL (pas PumpSwap, pas les cotations hors SOL) ; le
revenu DefiLlama couvre le protocole entier (courbe + PumpSwap + Terminal + mobile) : l'ARPU est donc un MAJORANT par
acheteur de courbe. Une adresse ≠ une personne (un robot a plusieurs adresses ; une « main » en regroupe déjà plusieurs).
"""
import json, math, datetime, statistics
A = json.load(open('data/pumpfun-16d/aggregate-pumpfun.json'))
rev = {datetime.datetime.fromtimestamp(int(t), datetime.timezone.utc).strftime('%Y-%m-%d'): float(v or 0) for t, v in json.load(open('data/raw/llama_pump_revenue.json'))['totalDataChart']}
fee = {datetime.datetime.fromtimestamp(int(t), datetime.timezone.utc).strftime('%Y-%m-%d'): float(v or 0) for t, v in json.load(open('data/raw/llama_pump_fees.json'))['totalDataChart']}
C = json.load(open('data/chiffres-papier.json')) if __import__('os').path.exists('data/chiffres-papier.json') else {}
MULT = float(C.get('multiple_MC_rev', 2.62)); OFFRE = float(C.get('offre_circ', 461.9e9))

J = [o['jour'] for o in A['parJour']]; act = A['adresses']['activesParJour']; nou = A['adresses']['nouvellesParJour']
n7 = A['adresses'].get('nouvelles7jParJour', {}); jet = {o['jour']: o['jetons'] for o in A['parJour']}
try: sol = {datetime.datetime.fromtimestamp(t / 1000, datetime.timezone.utc).strftime('%Y-%m-%d'): v for t, v in json.load(open('data/raw/cg_solana_20d.json'))['prices']}
except Exception: sol = {}
rows = []
for j in J:
    r, f = rev.get(j), fee.get(j)
    rows.append(dict(jour=j, actives=act[j], nouvelles=nou[j], revenu=r, frais=f,
                     arpuJour=(r / act[j]) if r is not None and act[j] else None, fraisParActif=(f / act[j]) if f is not None and act[j] else None))
ok = [x for x in rows if x['arpuJour'] is not None]
def pente_hebdo(vals):
    """ajustement log-linéaire ln(v) = a + b·t → variation par semaine (en %)"""
    pts = [(i, math.log(v)) for i, v in enumerate(vals) if v and v > 0]
    if len(pts) < 4: return None
    n = len(pts); sx = sum(p[0] for p in pts); sy = sum(p[1] for p in pts); sxx = sum(p[0] ** 2 for p in pts); sxy = sum(p[0] * p[1] for p in pts)
    b = (n * sxy - sx * sy) / (n * sxx - sx * sx)
    return math.exp(7 * b) - 1
moitie = len(J) // 2
def moy(vals):
    v = list(vals); return round(statistics.mean(v)) if v else None
res = dict(
    fenetre=dict(debut=J[0], fin=J[-1], jours=len(J), joursAvecRevenu=len(ok)),
    actifsMoyJour=moy(act[j] for j in J), nouvellesMoyJour=moy(nou[j] for j in J[1:]),
    actifs1reMoitie=moy(act[j] for j in J[:moitie]), actifs2deMoitie=moy(act[j] for j in J[moitie:]),
    nouvelles1reMoitie=moy(nou[j] for j in J[1:moitie]), nouvelles2deMoitie=moy(nou[j] for j in J[max(1, moitie):]),
    penteHebdoActifs=pente_hebdo([act[j] for j in J]), penteHebdoNouvelles=pente_hebdo([nou[j] for j in J[1:]]),
    # semaine contre semaine (7 jours pleins chacune, mêmes jours de la semaine) : la lecture la plus honnête sur 16 points
    semaine1=dict(jours=f'{J[1]}→{J[7]}', actifs=moy(act[j] for j in J[1:8]), jetons=moy(jet[j] for j in J[1:8]), revenu=moy(rev.get(j) for j in J[1:8] if rev.get(j) is not None), sol=moy(sol.get(j) for j in J[1:8] if sol.get(j) is not None)) if len(J) >= 15 else None,
    semaine2=dict(jours=f'{J[8]}→{J[14]}', actifs=moy(act[j] for j in J[8:15]), jetons=moy(jet[j] for j in J[8:15]), revenu=moy(rev.get(j) for j in J[8:15] if rev.get(j) is not None), sol=moy(sol.get(j) for j in J[8:15] if sol.get(j) is not None)) if len(J) >= 15 else None,
    nouvelles7=dict(premier=((J[8], n7.get(J[8])) if len(J) > 15 and n7.get(J[8]) is not None else None), dernier=((J[15], n7.get(J[15])) if len(J) > 15 and n7.get(J[15]) is not None else None)),   # même jour de semaine (J[8] → J[15], 7 jours d'écart)
    arpuJourMoy=statistics.mean(x['arpuJour'] for x in ok) if ok else None, arpuJourMed=statistics.median(x['arpuJour'] for x in ok) if ok else None,
    fraisParActifMoy=statistics.mean(x['fraisParActif'] for x in ok if x['fraisParActif'] is not None) if ok else None,
    revenuMoyJour=statistics.mean(x['revenu'] for x in ok) if ok else None, parJour=rows)
# valorisation « utilisateurs » : revenu annuel = actifs/jour × ARPU-jour × 365, avec la tendance des actifs projetée sur 6 mois (bornée à ±50 %)
if ok and res['penteHebdoActifs'] is not None:
    a0 = res['actifsMoyJour']; g = res['penteHebdoActifs']
    proj6m = a0 * max(0.5, min(1.5, (1 + g) ** 26))               # 26 semaines, borné : 16 points ne justifient pas plus
    a2 = res['semaine2']['actifs'] if res.get('semaine2') else a0
    for nom, actifs in [('aujourdhui', a0), ('niveauSemaine2', a2), ('tendance6mois', proj6m), ('moitieDesActifs', a0 * 0.5)]:
        rev_an = actifs * res['arpuJourMoy'] * 365
        res[f'valo_{nom}'] = dict(actifsParJour=round(actifs), revenuAnnuel=round(rev_an), mc=round(rev_an * MULT), prix=rev_an * MULT / OFFRE)
json.dump(res, open('data/pumpfun-16d/users.json', 'w'), indent=1, ensure_ascii=False)
pct = lambda x: '—' if x is None else f'{100*x:+.1f} %'
usd = lambda x: '—' if x is None else f'${x:,.0f}'
L = [f"# pump.fun — économie d'utilisateurs, {J[0]} → {J[-1]} ({len(J)} jours, {len(ok)} avec revenu DefiLlama)\n",
     f"- Acheteurs actifs par jour (courbe pump.fun/SOL, mains regroupées) : moyenne **{res['actifsMoyJour']:,}** ; 1re moitié {res['actifs1reMoitie']} → 2de moitié {res['actifs2deMoitie']} ; pente **{pct(res['penteHebdoActifs'])}/semaine** (log-linéaire).",
     f"- Nouvelles adresses « jamais vues dans la fenêtre » : moyenne {res['nouvellesMoyJour']}/jour — mesure qui décroît MÉCANIQUEMENT en début de fenêtre (le jour 1, tout le monde est nouveau) : NE PAS citer sa pente ; la mesure comparable est « nouveaux entrants stricts » ci-dessous.",
     f"- Revenu protocolaire par acheteur actif-jour (ARPU-jour, majorant) : moyenne **{usd(res['arpuJourMoy'])}**, médiane {usd(res['arpuJourMed'])} ; frais par acheteur actif-jour {usd(res['fraisParActifMoy'])} ; revenu moyen/jour {usd(res['revenuMoyJour'])}.",
     (f"- **Semaine contre semaine** ({res['semaine1']['jours']} → {res['semaine2']['jours']}) : acheteurs actifs/jour {res['semaine1']['actifs']:,} → {res['semaine2']['actifs']:,} (**{pct(res['semaine2']['actifs']/res['semaine1']['actifs']-1)}**) ; jetons créés/jour {res['semaine1']['jetons']:,} → {res['semaine2']['jetons']:,} ({pct(res['semaine2']['jetons']/res['semaine1']['jetons']-1)}) ; revenu/jour {usd(res['semaine1']['revenu'])} → {usd(res['semaine2']['revenu'])} ({pct(res['semaine2']['revenu']/res['semaine1']['revenu']-1)}) ; SOL moyen {usd(res['semaine1']['sol'])} → {usd(res['semaine2']['sol'])} ({pct(res['semaine2']['sol']/res['semaine1']['sol']-1) if res['semaine1']['sol'] and res['semaine2']['sol'] else '—'})." if res.get('semaine1') and res.get('semaine2') else "- (moins de 15 jours : pas de comparaison semaine contre semaine)"),
     (f"- Nouveaux entrants au sens strict (jamais vus dans les 7 jours précédents, défini à partir du 8e jour), même jour de semaine à 7 jours d'écart : {res['nouvelles7']['premier'][0][5:]} {res['nouvelles7']['premier'][1]:,} → {res['nouvelles7']['dernier'][0][5:]} {res['nouvelles7']['dernier'][1]:,} ({pct(res['nouvelles7']['dernier'][1]/res['nouvelles7']['premier'][1]-1)})." if res['nouvelles7']['premier'] and res['nouvelles7']['dernier'] else ""),
     "", "| jour | actifs | nouvelles | revenu $ | frais $ | ARPU-jour $ | frais/actif $ |", "|---|---|---|---|---|---|---|"]
dec = lambda v: '—' if v is None else f'{v:.2f}'
for x in rows: L.append(f"| {x['jour']} | {x['actives']:,} | {x['nouvelles']:,} | {usd(x['revenu'])} | {usd(x['frais'])} | {dec(x['arpuJour'])} | {dec(x['fraisParActif'])} |")
if 'valo_aujourdhui' in res:
    L += ["", f"## Méthode 3 — valorisation par les utilisateurs = DÉCOMPOSITION de la méthode 1 (revenu = acheteurs actifs × revenu par acheteur), même multiple {MULT:.2f}× MC/revenu annualisé, offre circulante {OFFRE/1e9:.1f} Md. Son information propre n'est pas une cible indépendante, c'est la TENDANCE des acheteurs. Contrôle d'identité : actifs moyens × ARPU-jour moyen × 365 = {res['valo_aujourdhui']['revenuAnnuel']/1e6:,.0f} M$ contre revenu moyen réel × 365 = {res['revenuMoyJour']*365/1e6:,.0f} M$ (écart = inégalité de Jensen : l'ARPU est plus haut les jours à moins d'acheteurs).", "",
          "| hypothèse | acheteurs actifs/jour | revenu annuel | capitalisation | prix implicite |", "|---|---|---|---|---|"]
    for nom, lib in [('aujourdhui', "aujourd'hui (actifs moyens sur 16 j × ARPU-jour × 365) — identité comptable, retombe près du spot par construction"), ('niveauSemaine2', 'niveau de la 2e semaine maintenu'), ('tendance6mois', 'tendance des actifs prolongée 6 mois (bornée ±50 %)'), ('moitieDesActifs', 'moitié des actifs (choc de type 2025) — équivaut à la méthode 1 à ~426 M$ de revenu, cohérent avec la base par construction')]:
        v = res[f'valo_{nom}']; L.append(f"| {lib} | {v['actifsParJour']:,} | {usd(v['revenuAnnuel'])} | {usd(v['mc'])} | ${v['prix']:.4f} |")
    L += ["", "Limites : ce n'est PAS une troisième méthode indépendante (même multiple, même revenu décomposé) ; 16 jours de points ; adresses de courbe seulement (PumpSwap et cotations hors SOL exclus) contre un revenu de protocole entier → ARPU majorant ; une adresse n'est pas une personne. La méthode sert de **troisième lecture** à côté du multiple sur revenu de base et du DCF inversé, pas de cible à elle seule."]
open('data/pumpfun-16d/users.md', 'w').write('\n'.join(L) + '\n'); print('\n'.join(L[:5]))
