/* LES COURBES DE SOLANA — pump.fun et Raydium LaunchLab, collectées par `nonevm/collecteur-solana.mjs` (logsSubscribe)
 * et jamais analysées au-delà d'une seule mesure (« dérive −7,2 % entre t+20 et t+240 s », INVENTAIRE.md §3.1).
 * Imite `courbes.mjs` (EVM) sans le modifier. Règle de décision : `rapports/chaines/solana.md`, écrite AVANT la mesure.
 *
 *   DONNEES=<hourly files dir> node --max-old-space-size=14000 solana-courbes.mjs \
 *       --debut=2026-10-04T23:00 --fin=2026-10-05T18:00 [--coupe=<ISO>] [--prix-sol=120] [--prio=44500] \
 *       [--ll-cotes=ll-cotes.json] [--sortie=f.json] [--positions=f.jsonl] [--jetons=traits.jsonl]
 *   (--prio : priorité + pourboire par transaction, MESURÉS par `solana-recus.mjs --mode=couts` ; --jetons : traits à
 *    l'entrée pour `solana-sous-pop.mjs`). ~4 min pour 19 h sur le Mac.
 * Résultat du 05/10 (fiche `rapports/chaines/solana.md`) : toutes les familles MORTES pour la recette.
 *
 * Ce que l'outil mesure, par famille (pump.fun/SOL, pump.fun/SOL « mayhem », pump.fun/autres cotations ; LaunchLab/SOL
 * et LaunchLab/autres cotations, ces deux-là sans identité d'acheteur — l'événement LaunchLab ne la porte pas) :
 *  0. la COUVERTURE (minutes, sources, canari getSignaturesForAddress) — dite, jamais supposée ;
 *  1. les VÉRIFICATIONS du décodage sur les événements eux-mêmes : chaînage des réserves (état avant = état après de
 *     l'échange précédent), formule du produit constant à réserves virtuelles, sens achat/vente, frais par jeton ;
 *  2. le débit, les jetons JOUABLES, le SECOND ACHETEUR (lecture large : créateur et cosignataires exclus ; stricte :
 *     aussi les acheteurs du slot de création) — le test qui distingue un marché d'une usine ;
 *  3. le P&L RÉEL de la foule par âge d'entrée, sur les flux de l'événement (frais de courbe compris) — STRICT (reste
 *     non vendu = 0) et VALORISÉ (reste au dernier prix marginal, moins les frais) ;
 *  4. les ALLERS-RETOURS DE TIERS au timing de la recette (entrée t+E ± 10 s, position refermée entre +H/2 et +2H,
 *     mise ≤ 0,1 SOL) : ce que d'autres ont réellement encaissé en faisant notre geste ;
 *  5. le REJEU au prix marginal sur la courbe EXACTE (produit constant, k = vq·vt), notre impact à l'aller ET au retour,
 *     frais de courbe du jeton, coûts d'exécution Solana (base 5 000 lamports + priorité, 2 transactions) ;
 *  6. la VENTE DU CRÉATEUR dans les 3 s suivant un petit achat extérieur, contre un témoin apparié par âge.
 *
 * PIÈGES déjà payés sur Solana, et leur parade ici :
 *  - le slot dure ~0,267 s (mesuré le 05/10), PAS 0,4 s : toute fenêtre est en SECONDES, convertie par la durée de slot
 *    mesurée sur la fenêtre ([[une-fenetre-en-blocs-nest-pas-portable]]) ;
 *  - l'ordre des lignes dans un slot n'est pas l'ordre d'exécution (deux sources fusionnées) : on le reconstruit par le
 *    chaînage des réserves ;
 *  - une transaction à plusieurs signataires vend pour PLUSIEURS comptes (« bundle » de 12 portefeuilles vu le 04/10) :
 *    ces comptes sont liés (union-find) et traités comme une seule main ;
 *  - le mode « mayhem » de pump.fun : un agent (BwWK17…) échange sans frais sur une courbe différente → famille à part,
 *    agent exclu de la foule ; les cotations hors SOL (PUMP, USDC, actions tokenisées…) → familles à part.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, createWriteStream, createReadStream } from 'node:fs'
import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline'

const arg = (k, d) => { const a = process.argv.find(x => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d }
const DIR = process.env.DONNEES ?? 'data/collector-hourly/solana'  /* hourly collector files (8.6 GB, on request) */
const iso2s = (x) => Date.parse(x.endsWith('Z') ? x : x + 'Z') / 1000
const DEBUT = iso2s(arg('debut', '2026-10-04T23:00')), FIN = iso2s(arg('fin', '2026-10-05T17:00'))
const COUPE = arg('coupe', null) ? iso2s(arg('coupe')) : Math.round((DEBUT + FIN - 900) / 2)
const PRIX_SOL = Number(arg('prix-sol', 120))
const BASE_LAMPORTS = 5000                                  /* frais de base par signature */
const PRIO = Number(arg('prio', 100000))                     /* priorité + pourboire par transaction (lamports) : MESURÉ à part */
const COUT_AR = 2 * (BASE_LAMPORTS + PRIO) / 1e9             /* SOL par aller-retour */
const MISES = [0.005, 0.01, 0.05, 0.1], MISE_VISEE = 0.01
const RECUL = 900
const LL_COTES = arg('ll-cotes', null)
const SOL_MINT = 'So11111111111111111111111111111111111111112', NUL = '11111111111111111111111111111111'
const AGENT_MAYHEM = 'BwWK17cbHxwWBKZkUYvzxLcNQ1YVyaFezduWbtm2de6s'
const med = (a) => { if (!a.length) return null; const s = Float64Array.from(a).sort(); return s[s.length >> 1] }
const moy = (a) => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null
const moyRobuste = (a) => { if (a.length < 20) return moy(a); const s = Float64Array.from(a).sort(); return moy(Array.from(s.subarray(0, Math.floor(s.length * 0.95)))) }
/* intervalle de confiance de la MOYENNE par rééchantillonnage. Générateur mulberry32 (entiers 32 bits) : une première
 * version avec un congruentiel en flottants perdait ses bits bas, bouclait en moins de 20 000 tirages, et rendait des
 * intervalles qui ne contenaient même pas la moyenne — attrapé parce que la moyenne affichée sortait de son propre IC */
const mulberry = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
const ic95 = (a, B = 1000) => { if (a.length < 10) return null; const n = a.length, m = [], u = mulberry(12345)
  for (let b = 0; b < B; b++) { let t = 0; for (let i = 0; i < n; i++) t += a[Math.floor(u() * n)]; m.push(t / n) }
  m.sort((x, y) => x - y); return [m[Math.floor(0.025 * B)], m[Math.floor(0.975 * B)]] }
const pct = (x) => x === null || x === undefined || Number.isNaN(x) ? '—' : `${x >= 0 ? '+' : ''}${(100 * x).toFixed(1)} %`
const isoS = (t) => new Date(t * 1000).toISOString().slice(0, 16).replace('T', ' ')

/* ── 0. couverture ── */
const COUV = readFileSync(`${DIR}/couverture.jsonl`, 'utf8').trim().split('\n').map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
const minutes = COUV.filter(x => !x.canari && x.t >= DEBUT && x.t < FIN)
const canaris = COUV.filter(x => x.canari && x.t >= DEBUT && x.t < FIN + 600)
const couverture = { minutesAttendues: Math.round((FIN - DEBUT) / 60), minutesLues: minutes.length,
  minutesSansSource: minutes.filter(m => !Object.values(m.connecte ?? {}).some(v => v >= 30)).length,
  minutesUneSource: minutes.filter(m => Object.values(m.connecte ?? {}).filter(v => v >= 30).length === 1).length,
  perdusDisque: minutes.reduce((s, m) => s + (m.perdusDisque ?? 0), 0), illisibles: minutes.reduce((s, m) => s + (m.illisibles ?? 0), 0), canari: {} }
for (const c of canaris) { const p = c.programme.startsWith('6EF8') ? 'pumpfun' : 'launchlab'; const o = couverture.canari[p] ??= { controles: 0, erreurs: 0, attendues: 0, recues: 0, pire: 1 }
  if (c.erreur) { o.erreurs++; continue } o.controles++; o.attendues += c.attendues; o.recues += c.recues; if (c.taux !== null && c.taux < o.pire) o.pire = c.taux }

/* ── 1. lecture ── */
const fichiers = []
for (const j of readdirSync(DIR).filter(x => /^\d{4}-\d\d-\d\d$/.test(x)).sort())
  for (const f of readdirSync(`${DIR}/${j}`).filter(x => /^\d\d\.jsonl(\.zst)?$/.test(x)).sort()) {
    const t0 = iso2s(`${j}T${f.slice(0, 2)}:00`)
    if (t0 + 3600 > DEBUT && t0 < FIN + 3600) fichiers.push(`${DIR}/${j}/${f}`)
  }
const lignes = (f) => createInterface({ input: f.endsWith('.zst') ? spawn('zstd', ['-dc', f]).stdout : createReadStream(f), crlfDelay: Infinity })
const users = new Map(), uNom = [], parent = []
const uid = (s) => { let i = users.get(s); if (i === undefined) { i = uNom.length; users.set(s, i); uNom.push(s); parent.push(i) } return i }
const racine = (i) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i] } return i }
const unir = (a, b) => { a = racine(a); b = racine(b); if (a !== b) parent[Math.max(a, b)] = Math.min(a, b) }
const hache = (s) => { let h1 = 0x811c9dc5, h2 = 0x01000193; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 16777619); h2 = Math.imul(h2 ^ c, 2246822519) } return (h1 >>> 0) * 2097152 + ((h2 >>> 0) >>> 11) }
const vuesSig = new Set()
const PF = new Map(), LL = new Map()                          /* mint → jeton ; pool → pool */
const calib = new Map()                                        /* tranche de 200 slots → [slot, s] (pour slot → heure) */
let sigCourante = null, sigDoublon = false, usersTx = [], nTx = 0, doublons = 0, nLignes = 0, bundles = 0
const finTx = () => { if (usersTx.length > 1) { const d = [...new Set(usersTx)]; if (d.length > 1) { bundles++; for (let k = 1; k < d.length; k++) unir(d[0], d[k]) } } usersTx = [] }
let ordre = 0
for (const f of fichiers) for await (const l of lignes(f)) {
  if (!l || l.length < 20) continue
  nLignes++
  const e = JSON.parse(l)
  if (e.sig !== sigCourante) { finTx(); sigCourante = e.sig; const h = hache(e.sig); sigDoublon = vuesSig.has(h); if (sigDoublon) doublons++; else { vuesSig.add(h); nTx++ } }
  if (sigDoublon) continue
  ordre++
  if (e.p === 'pf') {
    if (e.s) { const k = Math.floor(e.sl / 200); if (!calib.has(k)) calib.set(k, [e.sl, e.s]) }
    if (e.e === 'T') {
      const j = PF.get(e.m) ?? PF.set(e.m, { mint: e.m, tr: [] }).get(e.m)
      const u = uid(e.u); usersTx.push(u)
      j.tr.push({ sl: e.sl, k: ordre, a: e.a, u, sol: e.sol, tok: e.t, f: e.f, cf: e.cf, vq: e.vq, vt: e.vt, tx: nTx, q: e.qm ? 1 : 0, mm: e.mm ? 1 : 0, ix: e.ix })
    } else if (e.e === 'C') {
      const j = PF.get(e.m) ?? PF.set(e.m, { mint: e.m, tr: [] }).get(e.m)
      j.ne = { sl: e.sl, s: e.s, u: uid(e.u), cr: uid(e.cr), nom: e.nom, sym: e.sym, uri: e.uri, mm: e.mm ? 1 : 0, qm: e.qm && e.qm !== NUL && e.qm !== SOL_MINT ? e.qm : null, tp: e.tp, vq0: e.vq, vt0: e.vt, tx: nTx }
    } else if (e.e === 'F') { const j = PF.get(e.m); if (j) j.fin ??= e.sl }
    else if (e.e === 'M') { const j = PF.get(e.m); if (j) j.migr ??= e.sl }
  } else if (e.p === 'll') {
    if (e.e === 'T') {
      const p = LL.get(e.ps) ?? LL.set(e.ps, { ps: e.ps, tr: [] }).get(e.ps)
      p.tr.push({ sl: e.sl, k: ordre, a: e.a, ai: e.ai, ao: e.ao, fee: e.pf + e.plf + e.cf + e.sf, pf: e.pf, plf: e.plf, cf: e.cf, sf: e.sf,
        vb: e.vb, vq: e.vq, rbb: e.rbb, rqb: e.rqb, rba: e.rba, rqa: e.rqa, st: e.st, tbs: e.tbs, sig: e.sig, tx: nTx })
    } else if (e.e === 'C') { const p = LL.get(e.ps) ?? LL.set(e.ps, { ps: e.ps, tr: [] }).get(e.ps); p.ne = { sl: e.sl, cr: e.cr, cfg: e.cfg, dec: e.dec, nom: e.nom, sym: e.sym, uri: e.uri, sig: e.sig } }
  }
}
finTx()

/* ── slot → heure : durée de slot mesurée sur la fenêtre ── */
const cal = [...calib.values()].sort((a, b) => a[0] - b[0])
const calF = cal.filter(([, s]) => s >= DEBUT && s <= FIN)
const D = (calF.at(-1)[1] - calF[0][1]) / (calF.at(-1)[0] - calF[0][0])                 /* secondes par slot */
const heureSlot = (sl) => { let lo = 0, hi = cal.length - 1; if (sl <= cal[0][0]) return cal[0][1] + (sl - cal[0][0]) * D; if (sl >= cal[hi][0]) return cal[hi][1] + (sl - cal[hi][0]) * D
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cal[m][0] <= sl) lo = m; else hi = m } return cal[lo][1] + (sl - cal[lo][0]) * D }
const slotHeure = (t) => { let lo = 0, hi = cal.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cal[m][1] <= t) lo = m; else hi = m } return Math.round(cal[lo][0] + (t - cal[lo][1]) / D) }
const S = (sec) => Math.round(sec / D)                                                       /* secondes → slots */
const W3 = S(3)

/* composantes de cosignataires : une « main » ; au-delà de 50 comptes, c'est un service, on ne lie pas à travers */
const taille = new Map(); for (let i = 0; i < uNom.length; i++) { const r = racine(i); taille.set(r, (taille.get(r) ?? 0) + 1) }
const main = (u) => { const r = racine(u); return taille.get(r) > 50 ? u : r }
const grosses = [...taille.values()].filter(x => x > 1).sort((a, b) => b - a)
const agent = users.get(AGENT_MAYHEM)

/* ── 2. pump.fun : ordre dans le slot par chaînage, vérifications ── */
const verif = { echanges: 0, chaines: 0, formuleOk: 0, ecartRelMax: 0, sensAchatHausse: 0, sensAchatBaisse: 0, sensVenteBaisse: 0, sensVenteHausse: 0, kBaisse: 0, horsChaine: 0 }
const bps = new Map(), cbps = new Map()
function ordonner(tr) {
  tr.sort((x, y) => x.sl - y.sl || x.k - y.k)
  const out = []; let i = 0
  while (i < tr.length) {
    let j = i; while (j < tr.length && tr[j].sl === tr[i].sl) j++
    if (j - i === 1) { out.push(tr[i]); i = j; continue }
    const g = tr.slice(i, j), pris = new Array(g.length).fill(false)
    let prec = out.at(-1)
    for (let n = 0; n < g.length; n++) {
      let c = -1
      if (prec) for (let q = 0; q < g.length; q++) { if (pris[q]) continue; const x = g[q]; const vqB = x.a ? x.vq - x.sol : x.vq + x.sol; if (vqB === prec.vq) { c = q; break } }
      if (c < 0) { /* tête de groupe : celui dont l'état avant n'est l'état après d'aucun autre */
        for (let q = 0; q < g.length && c < 0; q++) { if (pris[q]) continue; const x = g[q]; const vqB = x.a ? x.vq - x.sol : x.vq + x.sol
          if (!g.some((y, r) => r !== q && !pris[r] && y.vq === vqB)) c = q }
        if (c < 0) c = pris.indexOf(false)
      }
      pris[c] = true; out.push(g[c]); prec = g[c]
    }
    i = j
  }
  return out
}
const verifFam = {}
const familleDe = (j) => j.ne.mm ? 'pf|SOL|mayhem' : j.ne.qm ? 'pf|autres cotations' : 'pf|SOL'
const jetons = []
for (const j of PF.values()) {
  if (!j.ne) continue
  const tNe = j.ne.s ?? heureSlot(j.ne.sl)
  if (tNe < DEBUT || tNe > FIN - RECUL) continue
  j.tNe = tNe; j.fam = familleDe(j); j.tr = ordonner(j.tr)
  /* vérifications de la formule, PAR FAMILLE (en mode « mayhem », l'agent déplace les réserves virtuelles : à vérifier, pas à supposer) */
  { const vf = verifFam[j.fam] ??= { paires: 0, chainees: 0, formuleOk: 0 }; let p0 = null
    for (const x of j.tr) { if (p0) { vf.paires++; const vqB = x.a ? x.vq - x.sol : x.vq + x.sol, vtB = x.a ? x.vt + x.tok : x.vt - x.tok
      if (vqB === p0.vq && vtB === p0.vt) { vf.chainees++; const att = x.a ? Number(BigInt(x.sol) * BigInt(vtB) / BigInt(vqB + x.sol)) : Number(BigInt(x.tok) * BigInt(vqB) / BigInt(vtB + x.tok)); const obs = x.a ? x.tok : x.sol; if (Math.abs(att - obs) / Math.max(1, obs) < 1e-6) vf.formuleOk++ } } p0 = x } }
  let prec = null
  for (const x of j.tr) {
    if (j.fam === 'pf|SOL') {
      verif.echanges++
      if (x.sol > 1e7) { const b = Math.round(x.f / x.sol * 1e4), c = Math.round(x.cf / x.sol * 1e4); bps.set(b, (bps.get(b) ?? 0) + 1); cbps.set(c, (cbps.get(c) ?? 0) + 1) }
      if (prec) {
        const vqB = x.a ? x.vq - x.sol : x.vq + x.sol, vtB = x.a ? x.vt + x.tok : x.vt - x.tok
        if (vqB === prec.vq && vtB === prec.vt) {
          verif.chaines++
          const att = x.a ? Number(BigInt(x.sol) * BigInt(vtB) / BigInt(vqB + x.sol)) : Number(BigInt(x.tok) * BigInt(vqB) / BigInt(vtB + x.tok))
          const obs = x.a ? x.tok : x.sol, ec = Math.abs(att - obs) / Math.max(1, obs)
          if (ec < 1e-6) verif.formuleOk++; if (ec > verif.ecartRelMax && ec < 1) verif.ecartRelMax = ec
          if (x.a) { if (x.vq > prec.vq) verif.sensAchatHausse++; else verif.sensAchatBaisse++ } else { if (x.vq < prec.vq) verif.sensVenteBaisse++; else verif.sensVenteHausse++ }
          if (BigInt(x.vq) * BigInt(x.vt) < BigInt(vqB) * BigInt(vtB)) verif.kBaisse++
        } else verif.horsChaine++
      }
      prec = x
    }
  }
  /* frais du jeton (bps, médiane sur ses échanges SOL de plus de 0,01 SOL) */
  const fr = j.tr.filter(x => x.sol > 1e7).map(x => (x.f + x.cf) / x.sol)
  j.frais = fr.length ? med(fr) : 0.0125
  /* main du créateur : créateur, bénéficiaire des frais, cosignataires ; lecture stricte : + acheteurs du slot de création */
  const mc = new Set([main(j.ne.u), main(j.ne.cr)])
  for (const x of j.tr) if (x.tx === j.ne.tx) mc.add(main(x.u))
  j.mainCreateur = mc
  const strict = new Set(mc); for (const x of j.tr) if (x.sl === j.ne.sl && x.a) strict.add(main(x.u))
  j.mainStricte = strict
  jetons.push(j)
}

/* ── 3. analyses pump.fun ── */
const AGES = [[0, 5], [5, 20], [20, 60], [60, 300], [300, 1e9]]
const ES = [10, 20, 30, 45, 60], HS = [60, 120, 180, 240, 300]
const dernierAvant = (tr, sl) => { let lo = 0, hi = tr.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (tr[m].sl <= sl) { r = m; lo = m + 1 } else hi = m - 1 } return r }
const exclu = (j, u) => j.mainCreateur.has(main(u)) || u === agent
function positions(j) {
  const P = new Map(), dern = j.tr.at(-1), pFin = dern ? dern.vq / dern.vt : 0
  for (const x of j.tr) {
    if (exclu(j, x.u)) continue
    const p = P.get(x.u) ?? P.set(x.u, { u: x.u, sl0: null, paye: 0, recu: 0, achete: 0, vendu: 0, slV: null, nA: 0, nV: 0 }).get(x.u)
    if (x.a) { p.sl0 ??= x.sl; p.paye += x.sol + x.f + x.cf; p.achete += x.tok; p.nA++ }
    else { p.recu += x.sol - x.f - x.cf; p.vendu += x.tok; p.slV = x.sl; p.nV++ }
  }
  const out = []
  for (const p of P.values()) {
    if (p.sl0 === null || p.paye <= 0) continue
    const recu = p.vendu > p.achete ? p.recu * p.achete / p.vendu : p.recu
    const reste = Math.max(0, p.achete - p.vendu)
    out.push({ u: p.u, age: (p.sl0 - j.ne.sl) * D, paye: p.paye / 1e9, recu: recu / 1e9, ferme: p.vendu >= 0.99 * p.achete,
      strict: (recu - p.paye) / p.paye, valorise: (recu + reste * pFin * (1 - j.frais) - p.paye) / p.paye,
      detention: p.slV !== null ? (p.slV - p.sl0) * D : null, nA: p.nA, nV: p.nV })
  }
  return out
}
function jouable(j, E) {
  const slE = j.ne.sl + S(E)
  if (j.fin !== undefined && j.fin <= slE) return null
  const i = dernierAvant(j.tr, slE); if (i < 0) return null
  const ach = new Set(); for (let q = 0; q <= i; q++) { const x = j.tr[q]; if (x.a && !exclu(j, x.u)) ach.add(main(x.u)) }
  if (ach.size < 2) return null
  if (j.tr[i].sl < slE - S(60)) return null
  return i
}
function rejeu(j, E, H) {
  const i = jouable(j, E); if (i === null) return null
  const e = j.tr[i], slX = j.ne.sl + S(E + H)
  let k = dernierAvant(j.tr, slX), gradue = false
  if (j.fin !== undefined && j.fin <= slX) { gradue = true; k = dernierAvant(j.tr, j.fin) }
  const x = j.tr[k], fr = j.frais
  const res = { gradue }
  for (const m of MISES) {
    const solIn = m * 1e9 / (1 + fr), tok = solIn * e.vt / (e.vq + solIn)
    const kX = x.vq * x.vt, brut = kX / (x.vt - tok) - x.vq
    const net = brut * (1 - fr) * (gradue ? 0.99 : 1) / 1e9 - COUT_AR
    res[m] = net / m - 1
  }
  res.marginal = (x.vq / x.vt) / (e.vq / e.vt) * (1 - fr) / (1 + fr) - 1
  /* flux après l'entrée : SOL net des tiers entré dans la courbe entre E et E+H */
  let flux = 0, nAch = 0; for (let q = i + 1; q <= k; q++) { const y = j.tr[q]; if (exclu(j, y.u)) continue; flux += y.a ? y.sol : -y.sol; if (y.a) nAch++ }
  res.flux = flux / 1e9; res.nAch = nAch
  return res
}
/* traits lisibles À L'ENTRÉE (t+E) et issues pour chaque H — matière de la recherche de sous-population (solana-sous-pop.mjs) */
const JET = arg('jetons', null) ? createWriteStream(arg('jetons')) : null
const createurs = new Map()                      /* main du créateur → naissances (pour le rang « en série ») */
for (const j of [...jetons].sort((a, b) => a.ne.sl - b.ne.sl)) { const c = main(j.ne.u); const l = createurs.get(c) ?? createurs.set(c, []).get(c); j.rangSerie = l.length; l.push(j.ne.sl) }
function traits(j, E) {
  const i = jouable(j, E); if (i === null) return null
  const slE = j.ne.sl + S(E), e = j.tr[i]
  const ach = new Set(); let volA = 0, volV = 0, nA = 0, nV = 0, devA = 0, devV = 0, pic = 0, nCreaSlot = new Set()
  for (let q = 0; q <= i; q++) { const x = j.tr[q], p = x.vq / x.vt; if (p > pic) pic = p
    if (x.sl === j.ne.sl && x.a) nCreaSlot.add(main(x.u))
    if (exclu(j, x.u)) { if (j.mainCreateur.has(main(x.u))) { if (x.a) devA += x.sol; else devV += x.sol } continue }
    if (x.a) { ach.add(main(x.u)); volA += x.sol; nA++ } else { volV += x.sol; nV++ } }
  let hote = ''; try { hote = new URL(j.ne.uri).hostname.replace(/^www\./, '') } catch { hote = j.ne.uri ? 'invalide' : 'vide' }
  const out = { m: j.mint, tNe: j.tNe, E, heure: new Date(j.tNe * 1000).getUTCHours(), nAch: ach.size, nA, nV, volA: volA / 1e9, volV: volV / 1e9, devA: devA / 1e9, devV: devV / 1e9,
    prixRel: (e.vq / e.vt) / (j.ne.vq0 / j.ne.vt0), depuisPic: (e.vq / e.vt) / pic, vqE: e.vq / 1e9, silence: (slE - e.sl) * D, bundle: nCreaSlot.size,
    hote, pump: j.mint.endsWith('pump') ? 1 : 0, serie: j.rangSerie, frais: j.frais, nomLong: (j.ne.nom ?? '').length, sym: j.ne.sym }
  for (const H of HS) { const r = rejeu(j, E, H); if (r) { out[`n${H}`] = r[MISE_VISEE]; out[`m${H}`] = r.marginal; out[`f${H}`] = r.flux; out[`g${H}`] = r.gradue ? 1 : 0 } }
  return out
}
const resultat = { genere: new Date().toISOString(), fenetre: [isoS(DEBUT), isoS(FIN)], coupe: isoS(COUPE), dureeSlot: D, fenetre3s: W3, couverture,
  lecture: { fichiers: fichiers.length, lignes: nLignes, transactions: nTx, doublons, bundles, comptes: uNom.length, plusGrossesMains: grosses.slice(0, 8) },
  prixSol: PRIX_SOL, prioLamports: PRIO, coutARSol: COUT_AR, verifications: verif, verificationsParFamille: verifFam, fraisBps: [...bps].sort((a, b) => b[1] - a[1]).slice(0, 6), fraisCreateurBps: [...cbps].sort((a, b) => b[1] - a[1]).slice(0, 8), familles: {} }
const familles = new Map(); for (const j of jetons) (familles.get(j.fam) ?? familles.set(j.fam, []).get(j.fam)).push(j)
const POS = arg('positions', null) ? createWriteStream(arg('positions')) : null
for (const [fam, L0] of familles) {
  const parties = [['1re moitié', L0.filter(j => j.tNe < COUPE), (COUPE - DEBUT) / 3600], ['2de moitié', L0.filter(j => j.tNe >= COUPE), (FIN - RECUL - COUPE) / 3600], ['tout', L0, (FIN - RECUL - DEBUT) / 3600]]
  const R = resultat.familles[fam] = {}
  for (const [nomP, L, h] of parties) {
    const o = R[nomP] = { jetons: L.length, parHeure: +(L.length / h).toFixed(1) }
    let second = 0, secondStrict = 0, gradues = 0, ech = [], ventesTiers = 0, second001 = 0, second005 = 0
    for (const j of L) {
      const lim = j.ne.sl + S(60), a1 = new Set(), a2 = new Set(), a3 = new Set(), a4 = new Set()
      for (const x of j.tr) { if (x.sl > lim) break; if (!x.a || exclu(j, x.u)) continue; a1.add(main(x.u)); if (!j.mainStricte.has(main(x.u))) a2.add(main(x.u))
        /* sensibilité (non pré-enregistrée) : la poussière (robots de « bump » à 0,0001 SOL) ne fait pas un marché */
        if (!j.mainStricte.has(main(x.u)) && x.sol >= 1e7) a3.add(main(x.u)); if (!j.mainStricte.has(main(x.u)) && x.sol >= 5e7) a4.add(main(x.u)) }
      if (a1.size >= 2) second++; if (a2.size >= 2) secondStrict++; if (a3.size >= 2) second001++; if (a4.size >= 2) second005++
      if (j.fin !== undefined) gradues++
      if (j.tr.some(x => !x.a && !exclu(j, x.u))) ventesTiers++
      ech.push(j.tr.length)
    }
    Object.assign(o, { secondAcheteur: second / Math.max(1, L.length), secondAcheteurStrict: secondStrict / Math.max(1, L.length), secondStrict001: second001 / Math.max(1, L.length), secondStrict005: second005 / Math.max(1, L.length), gradues, echangesMed: med(ech), venteTiers: ventesTiers / Math.max(1, L.length) })
    o.jouablesParHeure = Object.fromEntries(ES.map(E => [E, +(L.filter(j => jouable(j, E) !== null).length / h).toFixed(1)]))
    /* foule */
    const pos = []; for (const j of L) for (const p of positions(j)) { p.j = j; pos.push(p) }
    if (POS && nomP === 'tout') for (const p of pos) POS.write(JSON.stringify({ fam, m: p.j.mint, tNe: p.j.tNe, u: uNom[p.u], age: +p.age.toFixed(2), paye: p.paye, recu: p.recu, ferme: p.ferme, detention: p.detention, strict: p.strict, valorise: p.valorise, gradue: p.j.fin !== undefined ? 1 : 0 }) + '\n')
    const tableFoule = (P) => AGES.map(([a, b]) => { const Sg = P.filter(p => p.age >= a && p.age < b), paye = Sg.reduce((s, p) => s + p.paye, 0)
      return { age: `${a}-${b >= 1e9 ? '∞' : b} s`, positions: Sg.length, payeSol: Math.round(paye),
        strict: paye ? Sg.reduce((s, p) => s + p.strict * p.paye, 0) / paye : null, valorise: paye ? Sg.reduce((s, p) => s + p.valorise * p.paye, 0) / paye : null,
        medianeStrict: med(Sg.map(p => p.strict)), gagnants: Sg.filter(p => p.strict > 0).length / Math.max(1, Sg.length), jamaisVendu: Sg.filter(p => p.recu === 0).length / Math.max(1, Sg.length) } })
    o.fouleNonGradues = tableFoule(pos.filter(p => p.j.fin === undefined))
    o.fouleGradues = tableFoule(pos.filter(p => p.j.fin !== undefined))
    /* témoin positif à réponse connue : un jeton gradué a parcouru toute la courbe (prix ×(vq_fin/vq_0)² ≈ ×14,7 pour
     * 30 → 115 SOL virtuels) ; ses tout premiers acheteurs doivent GAGNER, sinon le signe du P&L est faux */
    const G = L.filter(j => j.fin !== undefined && j.tr.length)
    o.temoinPositif = { gradues: G.length, multiplePrixMed: med(G.map(j => { const k = dernierAvant(j.tr, j.fin); const x = j.tr[k]; return (x.vq / x.vt) / (j.ne.vq0 / j.ne.vt0) })),
      vqFinMedSol: med(G.map(j => j.tr[dernierAvant(j.tr, j.fin)].vq / 1e9)) }
    o.sansEchange = L.filter(j => !j.tr.length).length / Math.max(1, L.length)
    o.foule = AGES.map(([a, b]) => { const Sg = pos.filter(p => p.age >= a && p.age < b), paye = Sg.reduce((s, p) => s + p.paye, 0)
      return { age: `${a}-${b >= 1e9 ? '∞' : b} s`, positions: Sg.length, payeSol: Math.round(paye),
        strict: paye ? Sg.reduce((s, p) => s + p.strict * p.paye, 0) / paye : null, valorise: paye ? Sg.reduce((s, p) => s + p.valorise * p.paye, 0) / paye : null,
        medianeStrict: med(Sg.map(p => p.strict)), gagnants: Sg.filter(p => p.strict > 0).length / Math.max(1, Sg.length), jamaisVendu: Sg.filter(p => p.recu === 0).length / Math.max(1, Sg.length),
        dansGradues: Sg.filter(p => p.j.fin !== undefined).length / Math.max(1, Sg.length) } })
    /* témoin positif : la main du créateur gagne-t-elle ? (flux SOL net de la main du créateur, frais compris) */
    let cPaye = 0, cRecu = 0, nC = 0
    for (const j of L) { let p = 0, r = 0; for (const x of j.tr) { if (!j.mainCreateur.has(main(x.u))) continue; if (x.a) p += x.sol + x.f + x.cf; else r += x.sol - x.f - x.cf } if (p > 0) { cPaye += p; cRecu += r; nC++ } }
    o.mainCreateur = { jetons: nC, payeSol: +(cPaye / 1e9).toFixed(1), recuSol: +(cRecu / 1e9).toFixed(1), pnl: cPaye ? (cRecu - cPaye) / cPaye : null }
    /* tiers au timing (mises en SOL : familles cotées en SOL seulement) */
    o.tiers = []
    if (fam !== 'pf|autres cotations') for (const E of ES) for (const H of HS) {
      const Sg = pos.filter(p => p.ferme && Math.abs(p.age - E) <= 10 && p.detention !== null && p.detention >= H / 2 && p.detention <= 2 * H && p.paye <= 0.1)
      if (Sg.length < 10) continue
      const r = Sg.map(p => p.strict)
      const exclusGradues = pos.filter(p => !p.ferme && p.j.fin !== undefined && Math.abs(p.age - E) <= 10 && p.paye <= 0.1).length
      const sansPoussiere = Sg.filter(p => p.paye >= 0.005).map(p => p.strict)
      o.tiers.push({ E, H, n: Sg.length, moyenne: moy(r), ic95: ic95(r), robuste: moyRobuste(r), mediane: med(r), gagnants: r.filter(x => x > 0).length / r.length, miseMed: med(Sg.map(p => p.paye)), exclusGradues,
        sansPoussiere: { n: sansPoussiere.length, moyenne: moy(sansPoussiere), robuste: moyRobuste(sansPoussiere), mediane: med(sansPoussiere) } })
    }
    /* rejeu */
    o.rejeu = []
    const enSol = fam !== 'pf|autres cotations'
    for (const E of ES) for (const H of HS) {
      const r = []; for (const j of L) { const x = rejeu(j, E, H); if (x) r.push(x) }
      if (r.length < 10) continue
      const v = (m) => r.map(x => x[m])
      o.rejeu.push({ E, H, n: r.length, parHeure: +(r.length / h).toFixed(1), gradues: r.filter(x => x.gradue).length,
        marginal: { moyenne: moy(v('marginal')), ic95: ic95(v('marginal')), robuste: moyRobuste(v('marginal')), mediane: med(v('marginal')) },
        net: enSol ? Object.fromEntries(MISES.map(m => [m, { moyenne: moy(v(m)), ic95: m === MISE_VISEE ? ic95(v(m)) : null, robuste: moyRobuste(v(m)), mediane: med(v(m)), gagnants: v(m).filter(x => x > 0).length / r.length }]))
          : Object.fromEntries(MISES.map(m => [m, { moyenne: moy(v('marginal')), robuste: moyRobuste(v('marginal')), mediane: med(v('marginal')), gagnants: v('marginal').filter(x => x > 0).length / r.length }])),
        fluxApresMoySol: moy(v('flux')), fluxApresMedSol: med(v('flux')), fluxPositif: v('flux').filter(x => x > 0).length / r.length, achatsApresMed: med(v('nAch')) })
    }
    if (JET && nomP === 'tout') for (const j of L) for (const E of ES) { const t = traits(j, E); if (t) JET.write(JSON.stringify({ fam, ...t }) + '\n') }
    /* vente du créateur ≤ 3 s après un petit achat extérieur, contre un témoin apparié par âge SUR LES MÊMES JETONS (ceux qui
     * ont reçu au moins un petit achat extérieur entre 10 et 120 s) ; second témoin, apparié en ACTIVITÉ : les instants qui
     * suivent une VENTE de tiers (même jeton, même plage d'âge, sans achat extérieur dans les 3 s qui précèdent) */
    const vc = {}
    for (const [lect, cle] of [['créateur', 'mainCreateur'], ['créateur + slot de création', 'mainStricte']]) {
      let nAch = 0, apresAch = 0, nTem = 0, apresTem = 0, nAct = 0, apresAct = 0
      for (const j of L) {
        const G = j[cle], ventes = j.tr.filter(x => !x.a && G.has(main(x.u))).map(x => x.sl)
        let traite = false
        const achatExt = (x) => x.a && !G.has(main(x.u)) && x.u !== agent
        for (const x of j.tr) { const age = (x.sl - j.ne.sl) * D; if (age < 10 || age > 120) continue
          if (achatExt(x) && x.sol + x.f + x.cf <= 1e8) { nAch++; traite = true; if (ventes.some(s => s > x.sl && s - x.sl <= W3)) apresAch++ } }
        if (!traite) continue
        for (let age = 10; age <= 120; age += 10) { const s0 = j.ne.sl + S(age)
          if (j.tr.some(x => achatExt(x) && x.sl <= s0 && s0 - x.sl <= W3)) continue
          nTem++; if (ventes.some(s => s > s0 && s - s0 <= W3)) apresTem++ }
        for (const x of j.tr) { const age = (x.sl - j.ne.sl) * D; if (age < 10 || age > 120 || x.a || G.has(main(x.u)) || x.u === agent) continue
          if (j.tr.some(y => achatExt(y) && y.sl <= x.sl && x.sl - y.sl <= W3)) continue
          nAct++; if (ventes.some(s => s > x.sl && s - x.sl <= W3)) apresAct++ }
      }
      vc[lect] = { apresAchat: apresAch / Math.max(1, nAch), nAchats: nAch, temoin: apresTem / Math.max(1, nTem), nTemoin: nTem, temoinActivite: apresAct / Math.max(1, nAct), nTemoinActivite: nAct }
    }
    o.venteCreateur = vc
  }
}
POS?.end(); JET?.end()
/* stabilité HEURE PAR HEURE (pump.fun/SOL) : débit, second acheteur, rejeu (E=60, H=60 et E=20, H=180) — un résultat qui ne
 * tient que quelques heures n'est pas un résultat ; et le second acheteur varie avec la part de créations « à vide » */
resultat.parHeure = []
{ const L = jetons.filter(j => j.fam === 'pf|SOL'), H0 = Math.floor(DEBUT / 3600)
  for (let h = H0; h * 3600 < FIN - RECUL; h++) {
    const Lh = L.filter(j => Math.floor(j.tNe / 3600) === h); if (!Lh.length) continue
    let sec = 0; for (const j of Lh) { const lim = j.ne.sl + S(60), a1 = new Set(); for (const x of j.tr) { if (x.sl > lim) break; if (x.a && !exclu(j, x.u)) a1.add(main(x.u)) } if (a1.size >= 2) sec++ }
    const r1 = Lh.map(j => rejeu(j, 60, 60)).filter(Boolean).map(x => x[MISE_VISEE]), r2 = Lh.map(j => rejeu(j, 20, 180)).filter(Boolean).map(x => x[MISE_VISEE])
    resultat.parHeure.push({ heure: isoS(h * 3600).slice(11, 13), jetons: Lh.length, sansEchange: Lh.filter(j => !j.tr.length).length / Lh.length, second: sec / Lh.length,
      r6060: { n: r1.length, robuste: moyRobuste(r1), moyenne: moy(r1), mediane: med(r1) }, r20180: { n: r2.length, robuste: moyRobuste(r2), moyenne: moy(r2), mediane: med(r2) } })
  } }

/* ── 4. LaunchLab : vérifications, débit, second acheteur APPROCHÉ (transactions distinctes), rejeu sur la courbe ── */
const cotesLL = LL_COTES && existsSync(LL_COTES) ? JSON.parse(readFileSync(LL_COTES, 'utf8')) : {}
const vll = { echanges: 0, chaineOk: 0, chaineKo: 0, formuleOk: 0, ecartRelMax: 0, fraisAchatOk: 0, fraisVenteOk: 0, kBaisse: 0, bps: new Map() }
const pools = []
for (const p of LL.values()) {
  if (!p.ne) continue
  const tNe = heureSlot(p.ne.sl); if (tNe < DEBUT || tNe > FIN - RECUL) continue
  p.tNe = tNe; const c = cotesLL[p.ps]?.cote; p.fam = c === undefined ? 'll|cotation inconnue' : c === SOL_MINT ? 'll|SOL' : 'll|autres cotations'
  /* ordre exact : l'événement porte l'état AVANT et APRÈS */
  p.tr.sort((x, y) => x.sl - y.sl || x.k - y.k)
  { const out = []; let i = 0
    while (i < p.tr.length) { let j = i; while (j < p.tr.length && p.tr[j].sl === p.tr[i].sl) j++
      const g = p.tr.slice(i, j), pris = new Array(g.length).fill(false); let prec = out.at(-1)
      for (let n = 0; n < g.length; n++) {
        let c = prec ? g.findIndex((y, q) => !pris[q] && y.rqb === prec.rqa && y.rbb === prec.rba) : -1
        if (c < 0) c = g.findIndex((y, q) => !pris[q] && !g.some((z, r) => r !== q && !pris[r] && z.rqa === y.rqb && z.rba === y.rbb))
        if (c < 0) c = pris.indexOf(false)
        pris[c] = true; out.push(g[c]); prec = g[c] }
      i = j }
    p.tr = out }
  let prec = null
  for (const y of p.tr) {
    vll.echanges++
    if (prec) { if (y.rqb === prec.rqa && y.rbb === prec.rba) vll.chaineOk++; else vll.chaineKo++ }
    const Qb = y.vq + y.rqb, Bb = y.vb - y.rbb, Qa = y.vq + y.rqa, Ba = y.vb - y.rba
    if (y.a) { const net = y.ai - y.fee; if (Qa - Qb === net) vll.fraisAchatOk++
      const att = Number(BigInt(Bb) - (BigInt(Qb) * BigInt(Bb) + BigInt(Qb + net) - 1n) / BigInt(Qb + net)); const ec = Math.abs(att - y.ao) / Math.max(1, y.ao); if (ec < 1e-6) vll.formuleOk++; if (ec > vll.ecartRelMax && ec < 1) vll.ecartRelMax = ec
      if (y.ai > 1e6) { const b = Math.round(y.fee / y.ai * 1e4); vll.bps.set(b, (vll.bps.get(b) ?? 0) + 1) } }
    else { const brut = Qb - Qa; if (brut - y.fee === y.ao) vll.fraisVenteOk++
      const att = Number(BigInt(Qb) - (BigInt(Qb) * BigInt(Bb) + BigInt(Bb + y.ai) - 1n) / BigInt(Bb + y.ai)); const ec = Math.abs(att - brut) / Math.max(1, brut); if (ec < 1e-6) vll.formuleOk++; if (ec > vll.ecartRelMax && ec < 1) vll.ecartRelMax = ec }
    if (BigInt(Qa) * BigInt(Ba) < BigInt(Qb) * BigInt(Bb)) vll.kBaisse++
    prec = y
  }
  const fr = p.tr.filter(y => y.a && y.ai > 1e6).map(y => y.fee / y.ai); p.frais = fr.length ? med(fr) : 0.0125
  pools.push(p)
}
resultat.verificationsLaunchLab = { ...vll, bps: [...vll.bps].sort((a, b) => b[1] - a[1]).slice(0, 6) }
const famLL = new Map(); for (const p of pools) (famLL.get(p.fam) ?? famLL.set(p.fam, []).get(p.fam)).push(p)
function jouableLL(p, E) {
  const slE = p.ne.sl + S(E), i = dernierAvant(p.tr, slE); if (i < 0) return null
  if (p.tr[i].st !== 0) return null                                                  /* courbe close (migration) */
  const tx = new Set(); for (let q = 0; q <= i; q++) if (p.tr[q].a && p.tr[q].sl !== p.ne.sl) tx.add(p.tr[q].tx)
  if (tx.size < 2) return null
  if (p.tr[i].sl < slE - S(60)) return null
  return i
}
for (const [fam, L0] of famLL) {
  const R = resultat.familles[fam] = {}
  for (const [nomP, L, h] of [['1re moitié', L0.filter(p => p.tNe < COUPE), (COUPE - DEBUT) / 3600], ['2de moitié', L0.filter(p => p.tNe >= COUPE), (FIN - RECUL - COUPE) / 3600], ['tout', L0, (FIN - RECUL - DEBUT) / 3600]]) {
    const o = R[nomP] = { jetons: L.length, parHeure: +(L.length / h).toFixed(1) }
    let sec = 0; for (const p of L) { const lim = p.ne.sl + S(60); const tx = new Set(p.tr.filter(y => y.a && y.sl <= lim && y.sl !== p.ne.sl).map(y => y.tx)); if (tx.size >= 2) sec++ }
    o.secondAcheteurMajorant = sec / Math.max(1, L.length)                         /* transactions distinctes hors slot de création : MAJORANT */
    o.jouablesParHeure = Object.fromEntries(ES.map(E => [E, +(L.filter(p => jouableLL(p, E) !== null).length / h).toFixed(1)]))
    o.echangesMed = med(L.map(p => p.tr.length))
    o.rejeu = []
    for (const E of ES) for (const H of HS) {
      const r = []
      for (const p of L) {
        const i = jouableLL(p, E); if (i === null) continue
        const e = p.tr[i], k = dernierAvant(p.tr, p.ne.sl + S(E + H)), x = p.tr[k]
        const Qe = e.vq + e.rqa, Be = e.vb - e.rba, Qx = x.vq + x.rqa, Bx = x.vb - x.rba
        const res = {}
        const unite = 1e9                                                            /* SOL : 9 décimales ; autres cotations : rapport seulement */
        for (const m of MISES) { const qIn = m * unite * (1 - p.frais), tok = qIn * Be / (Qe + qIn), kX = Qx * Bx, brut = kX / (Bx - tok) - Qx
          res[m] = (brut * (1 - p.frais) / unite - (fam === 'll|SOL' ? COUT_AR : 0)) / m - 1 }
        res.marginal = (Qx / Bx) / (Qe / Be) * (1 - p.frais) ** 2 - 1
        r.push(res)
      }
      if (r.length < 10) continue
      const v = (m) => r.map(x => x[m])
      o.rejeu.push({ E, H, n: r.length, parHeure: +(r.length / h).toFixed(1), marginal: { robuste: moyRobuste(v('marginal')), mediane: med(v('marginal')) },
        net: Object.fromEntries(MISES.map(m => [m, { robuste: moyRobuste(v(m)), mediane: med(v(m)), gagnants: v(m).filter(x => x > 0).length / r.length }])) })
    }
  }
}

/* HORS RÈGLE, pour information : l'entrée de « sniper » (t+2 s, t+5 s) — le seul âge où la foule est à l'équilibre ; il
 * suppose d'atterrir dans les tout premiers slots (course aux pourboires), ce que notre recette ne fait pas */
resultat.sniper = []
{ const L = jetons.filter(j => j.fam === 'pf|SOL')
  for (const E of [2, 5]) for (const H of [60, 120, 300]) { const r = L.map(j => rejeu(j, E, H)).filter(Boolean)
    resultat.sniper.push({ E, H, n: r.length, marginalMoy: moy(r.map(x => x.marginal)), marginalRob: moyRobuste(r.map(x => x.marginal)), marginalMed: med(r.map(x => x.marginal)), net01: moyRobuste(r.map(x => x[0.1])) }) } }
/* condition 4 : (E, H) choisi sur la 1re moitié (robuste net à la mise visée), jugé sur la 2de */
for (const [fam, R] of Object.entries(resultat.familles)) {
  const a = R['1re moitié']?.rejeu ?? [], b = R['2de moitié']?.rejeu ?? []
  if (!a.length) continue
  const best = [...a].sort((x, y) => y.net[MISE_VISEE].robuste - x.net[MISE_VISEE].robuste)[0]
  const juge = b.find(x => x.E === best.E && x.H === best.H)
  R.choixMarcheAvant = { E: best.E, H: best.H, premiere: best.net[MISE_VISEE], seconde: juge ? juge.net[MISE_VISEE] : null, nSeconde: juge?.n ?? 0, parHeureSeconde: juge?.parHeure ?? 0 }
}

/* ── 5. affichage ── */
const c = couverture
console.log(`\n═══ COURBES SOLANA · ${isoS(DEBUT)} → ${isoS(FIN)} UTC · coupe ${isoS(COUPE)} · slot ${D.toFixed(4)} s (3 s = ${W3} slots) · SOL ${PRIX_SOL} $`)
console.log(`  couverture : ${c.minutesLues}/${c.minutesAttendues} minutes · sans source ${c.minutesSansSource} · une source ${c.minutesUneSource} · perdus disque ${c.perdusDisque} · illisibles ${c.illisibles}`)
for (const [p, o] of Object.entries(c.canari)) console.log(`  canari ${p} : ${o.recues}/${o.attendues} signatures reçues (${pct(o.recues / o.attendues)}) sur ${o.controles} contrôles, pire ${pct(o.pire)}, ${o.erreurs} contrôle(s) en erreur`)
console.log(`  lecture : ${fichiers.length} fichiers, ${nLignes} lignes, ${nTx} transactions, ${doublons} doublons écartés, ${bundles} transactions multi-comptes (bundles), ${uNom.length} comptes ; plus grosses mains ${grosses.slice(0, 5).join(', ')}`)
console.log(`  coût d'exécution supposé : 2 × (5 000 + ${PRIO}) lamports = ${COUT_AR.toFixed(6)} SOL par A/R (${(COUT_AR * PRIX_SOL).toFixed(4)} $)`)
const v = verif
console.log(`  VÉRIF pump.fun/SOL : ${v.echanges} échanges, ${v.chaines} chaînés (état avant = après du précédent) ; formule exacte ${pct(v.formuleOk / v.chaines)} (écart relatif max ${v.ecartRelMax.toExponential(2)}) ; sens achat↑ ${v.sensAchatHausse}/${v.sensAchatHausse + v.sensAchatBaisse} vente↓ ${v.sensVenteBaisse}/${v.sensVenteBaisse + v.sensVenteHausse} ; k qui baisse ${v.kBaisse}`)
for (const [f, x] of Object.entries(verifFam)) console.log(`  formule par famille — ${f} : ${x.paires} paires consécutives, ${pct(x.chainees / Math.max(1, x.paires))} chaînées, formule exacte sur ${pct(x.formuleOk / Math.max(1, x.chainees))} des chaînées`)
console.log(`  frais protocole (bps : échanges) ${JSON.stringify(resultat.fraisBps)} · créateur ${JSON.stringify(resultat.fraisCreateurBps)}`)
const w = resultat.verificationsLaunchLab
console.log(`  VÉRIF LaunchLab : ${w.echanges} échanges, chaînage ${w.chaineOk} ok / ${w.chaineKo} ko ; formule ${pct(w.formuleOk / w.echanges)} (écart max ${w.ecartRelMax.toExponential(2)}) ; frais achat ${w.fraisAchatOk}, vente ${w.fraisVenteOk} ; k qui baisse ${w.kBaisse} ; frais bps ${JSON.stringify(w.bps)}`)
for (const [fam, R] of Object.entries(resultat.familles)) for (const [nomP, o] of Object.entries(R)) {
  if (nomP === 'choixMarcheAvant') continue
  if (fam.startsWith('ll')) {
    console.log(`\n── ${fam} · ${nomP} : ${o.jetons} jetons (${o.parHeure}/h) · second acheteur MAJORANT (tx distinctes) ${pct(o.secondAcheteurMajorant)} · jouables/h ${JSON.stringify(o.jouablesParHeure)} · échanges/jeton méd. ${o.echangesMed}`)
    const rr = [...o.rejeu].sort((a, b) => b.net[MISE_VISEE].robuste - a.net[MISE_VISEE].robuste).slice(0, 5)
    for (const x of rr) console.log(`   rejeu E=${x.E} H=${x.H} n=${x.n} (${x.parHeure}/h) marginal ${pct(x.marginal.robuste)}/${pct(x.marginal.mediane)} · net 0,01 SOL ${pct(x.net[0.01].robuste)} méd ${pct(x.net[0.01].mediane)} · 0,1 SOL ${pct(x.net[0.1].robuste)}`)
    continue
  }
  console.log(`\n── ${fam} · ${nomP} : ${o.jetons} jetons (${o.parHeure}/h) · second acheteur ${pct(o.secondAcheteur)} (strict ${pct(o.secondAcheteurStrict)} ; strict et achats ≥ 0,01 SOL ${pct(o.secondStrict001)}, ≥ 0,05 SOL ${pct(o.secondStrict005)}) · gradués ${o.gradues} · échanges/jeton méd. ${o.echangesMed} · vente de tiers ${pct(o.venteTiers)}`)
  console.log(`   jouables/h par E : ${JSON.stringify(o.jouablesParHeure)} · main du créateur : ${o.mainCreateur.jetons} jetons, payé ${o.mainCreateur.payeSol} SOL, reçu ${o.mainCreateur.recuSol} SOL (${pct(o.mainCreateur.pnl)})`)
  console.log(`   jetons sans aucun échange ${pct(o.sansEchange)} · TÉMOIN POSITIF : ${o.temoinPositif.gradues} gradués, prix ×${o.temoinPositif.multiplePrixMed?.toFixed(2)} de la naissance à la fin de courbe (attendu ≈ ×14,7), vq final méd. ${o.temoinPositif.vqFinMedSol?.toFixed(2)} SOL`)
  for (const [titre, T] of [['foule, jetons NON gradués', o.fouleNonGradues], ['foule, jetons GRADUÉS (ventes après graduation invisibles : strict pessimiste, valorisé optimiste)', o.fouleGradues]]) {
    console.log(`   ${titre}\n   âge        positions  payé SOL   strict  valorisé  médiane  gagnants  jamais vendu`)
    for (const f of T) console.log(`   ${f.age.padEnd(9)} ${String(f.positions).padStart(9)} ${String(f.payeSol).padStart(9)} ${pct(f.strict).padStart(8)} ${pct(f.valorise).padStart(9)} ${pct(f.medianeStrict).padStart(8)} ${pct(f.gagnants).padStart(8)} ${pct(f.jamaisVendu).padStart(10)}`) }
  const tt = [...o.tiers].sort((a, b) => b.robuste - a.robuste).slice(0, 6)
  if (tt.length) { console.log('   TIERS au timing (refermé, ≤ 0,1 SOL)     n  moyenne  robuste  médiane  gagnants  mise méd.')
    for (const x of tt) console.log(`   E=${String(x.E).padStart(2)} s H=${String(x.H).padStart(3)} s ${String(x.n).padStart(21)} ${pct(x.moyenne).padStart(8)} ${pct(x.robuste).padStart(8)} ${pct(x.mediane).padStart(8)} ${pct(x.gagnants).padStart(8)} ${x.miseMed.toFixed(4).padStart(8)} SOL  IC95 moyenne [${pct(x.ic95?.[0])} ; ${pct(x.ic95?.[1])}] · non refermés car gradués ${x.exclusGradues} · sans poussière (≥ 0,005 SOL) n=${x.sansPoussiere.n} rob ${pct(x.sansPoussiere.robuste)} méd ${pct(x.sansPoussiere.mediane)}`) }
  const rr = [...o.rejeu].sort((a, b) => b.net[MISE_VISEE].robuste - a.net[MISE_VISEE].robuste).slice(0, 6)
  if (rr.length) { console.log('   REJEU courbe exacte          n    /h  gradués  marginal(rob/méd)   net 0,005 / 0,01 / 0,05 / 0,1 SOL (robuste)   méd 0,01  gagn.  flux après (moy/méd SOL, >0)')
    for (const x of rr) console.log(`   E=${String(x.E).padStart(2)} s H=${String(x.H).padStart(3)} s ${String(x.n).padStart(10)} ${String(x.parHeure).padStart(5)} ${String(x.gradues).padStart(7)}  ${pct(x.marginal.robuste)}/${pct(x.marginal.mediane)}   ${MISES.map(m => pct(x.net[m].robuste)).join(' / ')}   ${pct(x.net[0.01].mediane)} ${pct(x.net[0.01].gagnants)}  ${x.fluxApresMoySol.toFixed(3)}/${x.fluxApresMedSol.toFixed(3)} ${pct(x.fluxPositif)}  moyenne 0,01 ${pct(x.net[0.01].moyenne)} IC95 [${pct(x.net[0.01].ic95?.[0])} ; ${pct(x.net[0.01].ic95?.[1])}]`) }
  for (const [lect, x] of Object.entries(o.venteCreateur)) console.log(`   vente ${lect} ≤ 3 s après un petit achat extérieur : ${pct(x.apresAchat)} (n=${x.nAchats}) · témoin mêmes jetons, même âge, sans achat : ${pct(x.temoin)} (n=${x.nTemoin}) · témoin d'activité (après une vente de tiers) : ${pct(x.temoinActivite)} (n=${x.nTemoinActivite})`)
}
console.log('\n── pf|SOL, HORS RÈGLE : entrée de sniper (rejeu marginal, sans coût ; net robuste à 0,1 SOL)')
for (const x of resultat.sniper) console.log(`   E=${x.E} s H=${x.H} s n=${x.n} : marginal moyenne ${pct(x.marginalMoy)} robuste ${pct(x.marginalRob)} médiane ${pct(x.marginalMed)} · net 0,1 SOL robuste ${pct(x.net01)}`)
console.log('\n── pf|SOL heure par heure (naissance, UTC) : jetons · sans échange · second acheteur · rejeu E=60/H=60 (n, robuste, moyenne, médiane) · rejeu E=20/H=180')
for (const x of resultat.parHeure) console.log(`   ${x.heure} h ${String(x.jetons).padStart(6)} ${pct(x.sansEchange).padStart(8)} ${pct(x.second).padStart(8)}   ${String(x.r6060.n).padStart(5)} ${pct(x.r6060.robuste).padStart(8)} ${pct(x.r6060.moyenne).padStart(8)} ${pct(x.r6060.mediane).padStart(8)}   ${String(x.r20180.n).padStart(5)} ${pct(x.r20180.robuste).padStart(8)} ${pct(x.r20180.moyenne).padStart(8)} ${pct(x.r20180.mediane).padStart(8)}`)
for (const [fam, R] of Object.entries(resultat.familles)) if (R.choixMarcheAvant) { const c = R.choixMarcheAvant; console.log(`\n▶ ${fam} — marche avant : (E=${c.E} s, H=${c.H} s) choisi sur la 1re moitié (robuste ${pct(c.premiere.robuste)}, méd ${pct(c.premiere.mediane)}) → 2de moitié : robuste ${pct(c.seconde?.robuste)}, méd ${pct(c.seconde?.mediane)}, n=${c.nSeconde} (${c.parHeureSeconde}/h) à ${MISE_VISEE} SOL`) }
const SO = arg('sortie', null); if (SO) { writeFileSync(SO, JSON.stringify(resultat, (k, v) => v instanceof Map ? [...v] : v, 1)); console.log(`\n→ ${SO}`) }
