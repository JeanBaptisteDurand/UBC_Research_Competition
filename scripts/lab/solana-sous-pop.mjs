/* SOLANA — RECHERCHE D'UNE SOUS-POPULATION où le flux après l'entrée paierait, en MARCHE AVANT (coupe par DATE).
 * Lit les traits À L'ENTRÉE écrits par `solana-courbes.mjs --jetons=…` (une ligne par jeton jouable × E) et :
 *  1. essaie une LISTE FIXE de filtres simples (écrite ici, avant de regarder la seconde moitié), sur toutes les cases (E, H) ;
 *     choisit la meilleure règle sur la PREMIÈRE moitié (moyenne robuste nette à 0,01 SOL, n ≥ 30) et la JUGE sur la seconde ;
 *  2. un modèle linéaire (ridge, traits standardisés sur la 1re moitié seulement) : décile du haut jugé sur la 2de moitié.
 * Critère de succès (rapports/chaines/solana.md) : 2de moitié robuste ≥ +5 % net, médiane > 0, n ≥ 30, débit ≥ 10/h.
 *   node solana-sous-pop.mjs --jetons=jetons.jsonl --coupe=2026-10-05T08:22:30 --fam='pf|SOL' --heures-a=9.375 --heures-b=9.375
 *   [--cle=m]  : juger sur le rendement MARGINAL (sans mise ni coût) — obligatoire pour les cotations hors SOL, où une mise
 *              exprimée en SOL n'a pas de sens (première version : unités fausses, « population −51,8 % »).
 * Résultat du 05/10 (19 h) : pump.fun/SOL 0 règle sur 1 100 ne tient ; pump.fun/autres cotations 0 non plus.
 */
import { readFileSync } from 'node:fs'
const arg = (k, d) => { const a = process.argv.find(x => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d }
const iso2s = (x) => Date.parse(x.endsWith('Z') ? x : x + 'Z') / 1000
const COUPE = iso2s(arg('coupe')), FAM = arg('fam', 'pf|SOL'), CLE = arg("cle", "n")
const HA = Number(arg('heures-a', 1)), HB = Number(arg('heures-b', 1))
const med = (a) => { if (!a.length) return null; const s = Float64Array.from(a).sort(); return s[s.length >> 1] }
const moy = (a) => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null
const rob = (a) => { if (a.length < 20) return moy(a); const s = Float64Array.from(a).sort(); return moy(Array.from(s.subarray(0, Math.floor(s.length * 0.95)))) }
const pct = (x) => x === null || x === undefined || Number.isNaN(x) ? '—' : `${x >= 0 ? '+' : ''}${(100 * x).toFixed(1)} %`
const L = readFileSync(arg('jetons'), 'utf8').trim().split('\n').map(l => JSON.parse(l)).filter(x => x.fam === FAM)
const A = L.filter(x => x.tNe < COUPE), B = L.filter(x => x.tNe >= COUPE)
const ES = [10, 20, 30, 45, 60], HS = [60, 120, 180, 240, 300]
/* hôtes d'URI les plus fréquents, comptés sur la 1re moitié SEULEMENT */
const hotes = Object.entries(A.reduce((o, x) => (o[x.hote] = (o[x.hote] ?? 0) + 1, o), {})).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([h]) => h)
const FILTRES = [
  ['tous', () => true],
  ...[3, 5, 10, 20].map(k => [`acheteurs tiers ≥ ${k}`, x => x.nAch >= k]),
  ...[0.5, 1, 2, 5].map(v => [`flux net tiers avant E ≥ ${v} SOL`, x => x.volA - x.volV >= v]),
  ['flux net tiers avant E < 0', x => x.volA - x.volV < 0],
  ...[1.1, 1.3, 1.6, 2].map(r => [`prix ≥ ×${r} depuis la naissance`, x => x.prixRel >= r]),
  ['prix < ×1,1 depuis la naissance', x => x.prixRel < 1.1],
  ['au pic (≥ 0,9 du max)', x => x.depuisPic >= 0.9], ['décroché (< 0,7 du max)', x => x.depuisPic < 0.7],
  ['créateur n\'a rien vendu', x => x.devV === 0], ['créateur a vendu', x => x.devV > 0],
  ['achat du créateur ≥ 0,5 SOL', x => x.devA >= 0.5], ['pas d\'achat du créateur', x => x.devA === 0],
  ['slot de création ≥ 3 acheteurs', x => x.bundle >= 3], ['slot de création ≤ 1 acheteur', x => x.bundle <= 1],
  ['1er jeton du créateur', x => x.serie === 0], ['créateur en série (≥ 5)', x => x.serie >= 5],
  ['adresse en …pump', x => x.pump === 1], ['adresse sans …pump', x => x.pump === 0],
  ...hotes.map(h => [`URI chez ${h}`, x => x.hote === h]),
  ['actif (dernier échange ≤ 2 s)', x => x.silence <= 2], ['aucune vente de tiers avant E', x => x.nV === 0],
  ...[[0, 6], [6, 12], [12, 18], [18, 24]].map(([a, b]) => [`né entre ${a} h et ${b} h UTC`, x => x.heure >= a && x.heure < b]),
  ['acheteurs ≥ 5 et créateur n\'a rien vendu', x => x.nAch >= 5 && x.devV === 0],
  ['prix ≥ ×1,3 et au pic', x => x.prixRel >= 1.3 && x.depuisPic >= 0.9],
  ['flux net ≥ 1 SOL et aucune vente de tiers', x => x.volA - x.volV >= 1 && x.nV === 0],
]
const regles = []
for (const [nom, f] of FILTRES) for (const E of ES) for (const H of HS) {
  const a = A.filter(x => x.E === E && x[`${CLE}${H}`] !== undefined && f(x)).map(x => x[`${CLE}${H}`])
  const b = B.filter(x => x.E === E && x[`${CLE}${H}`] !== undefined && f(x)).map(x => x[`${CLE}${H}`])
  regles.push({ nom, E, H, nA: a.length, robA: rob(a), medA: med(a), moyA: moy(a), nB: b.length, robB: rob(b), medB: med(b), moyB: moy(b), parHeureB: b.length / HB })
}
console.log(`\n═══ SOUS-POPULATIONS ${FAM} · 1re moitié ${A.length} (jeton × E) · 2de ${B.length} · ${FILTRES.length} filtres × ${ES.length * HS.length} cases = ${regles.length} règles essayées`)
const valides = regles.filter(r => r.nA >= 30).sort((x, y) => y.robA - x.robA)
console.log('   les 12 meilleures règles sur la 1re moitié (robuste net à 0,01 SOL), et ce qu\'elles deviennent sur la 2de :')
console.log('   règle                                           E    H    n A   robuste A  méd. A  |  n B  robuste B  méd. B  moyenne B   /h B')
for (const r of valides.slice(0, 12)) console.log(`   ${r.nom.padEnd(46).slice(0, 46)} ${String(r.E).padStart(3)} ${String(r.H).padStart(4)} ${String(r.nA).padStart(6)} ${pct(r.robA).padStart(9)} ${pct(r.medA).padStart(8)}  | ${String(r.nB).padStart(4)} ${pct(r.robB).padStart(9)} ${pct(r.medB).padStart(8)} ${pct(r.moyB).padStart(9)} ${r.parHeureB.toFixed(1).padStart(6)}`)
/* lecture COMPLÉMENTAIRE (non pré-enregistrée) : classement par la moyenne SIMPLE, queue droite comprise — ce qu'une
 * stratégie qui prend tout encaisserait si aucun coup rare ne la faisait seul ; jugée de même sur la 2de moitié */
const parMoy = regles.filter(r => r.nA >= 100).sort((x, y) => y.moyA - x.moyA)
console.log('   complément — les 6 meilleures règles par MOYENNE SIMPLE sur la 1re moitié (n ≥ 100), et la 2de :')
for (const r of parMoy.slice(0, 6)) console.log(`   ${r.nom.padEnd(46).slice(0, 46)} ${String(r.E).padStart(3)} ${String(r.H).padStart(4)} ${String(r.nA).padStart(6)} moyenne A ${pct(r.moyA).padStart(8)} | n B ${String(r.nB).padStart(5)} moyenne B ${pct(r.moyB).padStart(8)} robuste B ${pct(r.robB).padStart(8)} méd B ${pct(r.medB)}`)
console.log(`   règles à moyenne simple > 0 sur la 1re moitié : ${parMoy.filter(r => r.moyA > 0).length}/${parMoy.length} ; encore > 0 sur la 2de : ${parMoy.filter(r => r.moyA > 0 && r.moyB > 0).length}`)
const choisie = valides[0]
const ok = choisie && choisie.nB >= 30 && choisie.robB >= 0.05 && choisie.medB > 0 && choisie.parHeureB >= 10
console.log(`\n▶ règle CHOISIE sur la 1re moitié : « ${choisie?.nom} », E=${choisie?.E} s, H=${choisie?.H} s → 2de moitié robuste ${pct(choisie?.robB)}, médiane ${pct(choisie?.medB)}, n=${choisie?.nB}, ${choisie?.parHeureB.toFixed(1)}/h : ${ok ? 'CRITÈRE TENU' : 'CRITÈRE NON TENU'}`)
const posA = valides.filter(r => r.robA > 0), posAB = posA.filter(r => r.nB >= 30 && r.robB > 0)
console.log(`   règles positives (robuste) sur la 1re moitié : ${posA.length}/${valides.length} ; parmi elles, encore positives sur la 2de : ${posAB.length}`)
console.log(`   règles qui tiendraient le critère sur la 2de moitié SI on les avait choisies (n'importe laquelle, sans marche avant) : ${regles.filter(r => r.nB >= 30 && r.robB >= 0.05 && r.medB > 0 && r.parHeureB >= 10).length}`)

/* modèle linéaire (ridge) : toutes les combinaisons des traits, standardisés sur la 1re moitié seulement */
const TR = ['nAch', 'nA', 'nV', 'volA', 'volV', 'devA', 'devV', 'prixRel', 'depuisPic', 'vqE', 'silence', 'bundle', 'pump', 'serie', 'nomLong', 'E']
const vec = (x) => [...TR.map(k => Number(x[k]) || 0), ...hotes.map(h => x.hote === h ? 1 : 0), Math.log1p(Math.max(0, x.volA)), Math.log(Math.max(1e-3, x.prixRel))]
for (const H of [60, 120, 180, 240]) {
  const a = A.filter(x => x[`${CLE}${H}`] !== undefined), b = B.filter(x => x[`${CLE}${H}`] !== undefined)
  if (a.length < 200 || b.length < 200) continue
  const XA = a.map(vec), p = XA[0].length
  const mu = Array.from({ length: p }, (_, k) => moy(XA.map(r => r[k]))), sd = Array.from({ length: p }, (_, k) => Math.sqrt(moy(XA.map(r => (r[k] - mu[k]) ** 2))) || 1)
  const Z = (r) => r.map((v, k) => (v - mu[k]) / sd[k])
  const ZA = XA.map(Z), yA = a.map(x => Math.max(-1, Math.min(2, x[`${CLE}${H}`])))   /* cible écrêtée : quelques ×10 ne doivent pas faire le modèle */
  /* (Z'Z + λI) w = Z'y, résolu par Gauss */
  const lam = 10, M = Array.from({ length: p }, () => new Array(p + 1).fill(0))
  for (let i = 0; i < ZA.length; i++) for (let k = 0; k < p; k++) { M[k][p] += ZA[i][k] * yA[i]; for (let l = 0; l < p; l++) M[k][l] += ZA[i][k] * ZA[i][l] }
  for (let k = 0; k < p; k++) M[k][k] += lam
  for (let c = 0; c < p; c++) { let piv = c; for (let r = c + 1; r < p; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r; [M[c], M[piv]] = [M[piv], M[c]]
    for (let r = 0; r < p; r++) { if (r === c || !M[c][c]) continue; const f = M[r][c] / M[c][c]; for (let l = c; l <= p; l++) M[r][l] -= f * M[c][l] } }
  const w = M.map((r, k) => r[p] / (r[k] || 1)), b0 = moy(yA)
  const score = (x) => b0 + Z(vec(x)).reduce((s, v, k) => s + v * w[k], 0)
  const sB = b.map(x => [score(x), x[`${CLE}${H}`]]).sort((u, v) => v[0] - u[0]), sA = a.map(x => [score(x), x[`${CLE}${H}`]]).sort((u, v) => v[0] - u[0])
  const dec = (s) => s.slice(0, Math.max(1, Math.floor(s.length / 10))).map(u => u[1])
  console.log(`   ridge H=${H} s : décile du haut 1re moitié (en échantillon) robuste ${pct(rob(dec(sA)))} méd ${pct(med(dec(sA)))} · 2de moitié (hors échantillon) robuste ${pct(rob(dec(sB)))} méd ${pct(med(dec(sB)))} n=${dec(sB).length} · population 2de ${pct(rob(b.map(x => x[`${CLE}${H}`])))}`)
}
