/* LES ADRESSES QUI GAGNENT RÉGULIÈREMENT — l'approche « par le profit » : au lieu de deviner des stratégies, on
 * trouve ceux qui gagnent et on démonte leur MÉCANISME (jamais l'arnaque : pas de rug, pas de manipulation).
 *   node --max-old-space-size=600 gagnants.mjs --chaine=arc [--fenetre=600] [--budget=40000] [--temoins=0x…,0x…]
 *        [--rejeu=/data/rapports/rejeu-arc.json] [--json=/data/rapports/gagnants-arc.json] [--familles=k1;k2]
 *
 * RÈGLES (chacune a déjà faussé une conclusion) :
 *  - l'acteur est le `from` de la TRANSACTION, jamais topics[2] (dans un Swap v4 c'est le ROUTEUR) ;
 *  - P&L RÉALISÉ = reçu − payé en monnaie de cotation, frais de pool compris (ils sont dans les montants des swaps) ;
 *    une position jamais refermée vaut 0 si le pool est mort, sinon elle est valorisée au dernier prix marginal :
 *    les deux chiffres sont donnés SÉPARÉMENT (strict / valorisé). Exiger une position refermée exclurait les victimes ;
 *  - « régulier » = ≥ 20 $/jour (au prorata) dans au moins 2 fenêtres sur 3, pas un coup chanceux ;
 *  - le P&L de LIQUIDITÉ n'est pas du trading : une adresse qui a ajouté ou retiré de la liquidité dans ces pools
 *    (déployeur, rug) est marquée LP et sortie du classement des traders ;
 *  - TÉMOIN POSITIF : nos propres wallets doivent sortir gagnants réguliers (Arc), sinon le recensement est faux ;
 *  - le dénominateur compte ce qui est LU : part des échanges dont l'émetteur est résolu, affichée ; < 90 % → rien
 *    n'est publié. Le gaz n'est PAS déduit (estimé à part : gp × ~150 000 par transaction).
 */
import { readFileSync, readdirSync, existsSync, createReadStream, appendFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline'
import { NOM, creation, clePool } from './topics.mjs'
import { execFileSync } from 'node:child_process'
/* lit un fichier de lignes, brut ou compressé (.zst) — les fichiers journaliers tx/ et blocs/ sont compressés après 20 min */
const lireLignes = (f) => f.endsWith('.zst') ? execFileSync('zstd', ['-dc', f], { maxBuffer: 1 << 30 }).toString('utf8').split('\n') : readFileSync(f, 'utf8').split('\n')

const arg = (k, d) => { const a = process.argv.find(x => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d }
const CH = arg('chaine'); if (!CH) { console.error('--chaine requis'); process.exit(2) }
const DIR = `${process.env.DONNEES ?? '/data/chaines'}/${CH}`
const CONF = JSON.parse(readFileSync(new URL('./chaines-collecte.json', import.meta.url).pathname, 'utf8'))[CH]
const FEN = Number(arg('fenetre', 600)), BUDGET = Number(arg('budget', 40000))
const TEMOINS = (arg('temoins', '') || '').split(',').filter(Boolean).map(x => x.toLowerCase())
const FAMS = arg('familles', null)?.split(';')
/* pools morts-nés (moins de N échanges dans la fenêtre) écartés : sur Base et BSC, des milliers de pools par heure
 * n'ont qu'un ou deux échanges ; les résoudre coûterait l'essentiel du budget pour presque aucun P&L. Dit en sortie. */
const SW_MIN_POOL = Number(arg('swaps-min-pool', 1))
const Z = '0x0000000000000000000000000000000000000000', Q96 = 2 ** 96
const sleep = ms => new Promise(r => setTimeout(r, ms))
const u = (d, i) => BigInt('0x' + (d.slice(2 + i * 64, 66 + i * 64) || '0'))
const s256 = (d, i) => { let v = u(d, i); if (v >= 1n << 255n) v -= 1n << 256n; return v }
const adr = (h) => '0x' + h.slice(-40).toLowerCase()
const med = (a) => { const b = a.filter(Number.isFinite).sort((x, y) => x - y); return b.length ? b[b.length >> 1] : NaN }
const RPCS = (CONF.enr ?? CONF.rpc.map(r => r.url ?? r)).filter(x => !/drpc\.org|1rpc\.io/.test(x))
/* paquet ADAPTATIF : mainnet.base.org refuse plus de 10 appels par paquet (« maximum 10 calls in 1 batch ») ; sans
 * adaptation, chaque paquet de 25 échouait 8 fois de suite et le recensement de Base aurait pris des heures */
let tailleLot = 25
async function groupe(appels) {
  if (appels.length > tailleLot) { const out = []; for (let i = 0; i < appels.length; i += tailleLot) out.push(...await groupe(appels.slice(i, i + tailleLot))); return out }
  for (let essai = 0; essai < 8; essai++) {
    try {
      const r = await fetch(RPCS[essai % RPCS.length], { method: 'POST', headers: { 'content-type': 'application/json' }, signal: AbortSignal.timeout(45000),
        body: JSON.stringify(appels.map((c, i) => ({ jsonrpc: '2.0', id: i, method: c[0], params: c[1] }))) })
      if (r.status === 429) throw new Error('429')
      const t = await r.text(); let j; try { j = JSON.parse(t) } catch { throw new Error('non JSON') }
      if (!Array.isArray(j)) { if (/batch|calls|too many|size/i.test(t) && tailleLot > 5) { tailleLot = Math.max(5, Math.floor(tailleLot / 2)); return groupe(appels) } throw new Error('lot refusé') }
      const m = new Map(); for (const x of j) m.set(x.id, x.error ? null : x.result)
      return appels.map((_, i) => m.get(i) ?? null)
    } catch (e) { await sleep(/429/.test(e.message) ? 3000 * (essai + 1) : 1500) }
  }
  return appels.map(() => null)
}
/* 0. monnaies de cotation et prix : sortie du rejeu (même détection), sinon natif seul */
let RJ = null; try { RJ = JSON.parse(readFileSync(arg('rejeu', `${process.env.RAPPORTS ?? '/data/rapports'}/rejeu-${CH}.json`), 'utf8')) } catch {}
const COTES = new Map((RJ?.cotes ?? [{ a: Z, lib: 'natif', type: 'natif', dec: 18 }]).map(c => [c.a, c]))
const PRIX_NATIF = RJ?.prixNatif ?? null
const prix$ = (c) => c.type === 'stable' ? 1 : c.type === 'natif' ? PRIX_NATIF : c.type === 'prix' ? c.prix : null
const META = new Map()
for (const f of [`${DIR}/jetons.jsonl`, `${process.env.CACHE ?? '/data/cache'}/code-${CH}.jsonl`]) if (existsSync(f))
  for (const l of readFileSync(f, 'utf8').split('\n')) { if (!l) continue; try { const x = JSON.parse(l); META.set(x.a, { ...(META.get(x.a) ?? {}), ...x }) } catch {} }
/* 1. passe : pools jeunes, leurs échanges et leur liquidité dans la fenêtre de lancement */
const fichiers = []
for (const j of readdirSync(DIR).filter(x => /^\d{4}-\d\d-\d\d$/.test(x)).sort())
  for (const f of readdirSync(`${DIR}/${j}`).filter(x => /^\d\d\.jsonl(\.zst)?$/.test(x)).sort((a, b) => a.slice(0, 2) === b.slice(0, 2) ? (b.endsWith('.zst') ? 1 : -1) : a < b ? -1 : 1)) fichiers.push(`${DIR}/${j}/${f}`)
const COUV = readFileSync(`${DIR}/couverture.jsonl`, 'utf8').trim().split('\n').map(l => { try { return JSON.parse(l) } catch { return null } }).filter(x => x && x.tsA && !x.departAvance).sort((a, b) => a.a - b.a)
const tsI = (b) => { let lo = 0, hi = COUV.length - 1; if (b >= COUV[hi].a) return COUV[hi].tsA; if (b <= COUV[0].a) return COUV[0].tsA
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (COUV[m].a <= b) lo = m; else hi = m } return COUV[lo].tsA + (b - COUV[lo].a) * (COUV[hi].tsA - COUV[lo].tsA) / Math.max(1, COUV[hi].a - COUV[lo].a) }
const T0 = COUV[0].tsA, T1 = COUV.at(-1).tsA
const P = new Map()
let vus = new Set(), vusAvant = new Set()
for (const f of fichiers) {
  const flux = f.endsWith('.zst') ? spawn('zstd', ['-dc', f]).stdout : createReadStream(f)
  for await (const l of createInterface({ input: flux, crlfDelay: Infinity })) {
    if (!l) continue
    const p0 = l.indexOf('"k":["'); const n = NOM[l.slice(p0 + 6, p0 + 72)]; if (!n || n === 'mint20') continue
    let e; try { e = JSON.parse(l) } catch { continue }
    const id = e.b * 100000 + e.i; if (vus.has(id) || vusAvant.has(id)) continue; vus.add(id); if (vus.size > 300000) { vusAvant = vus; vus = new Set() }
    const t = e.s ?? tsI(e.b), d = e.d
    const c = creation(e)
    if (c) {
      if (P.has(c.cle) || c.n === 'TokenLaunched' || /^(sunpump|four|flap)/.test(c.n)) continue
      const q = COTES.has(c.t0) && !COTES.has(c.t1) ? 0 : COTES.has(c.t1) && !COTES.has(c.t0) ? 1 : -1
      if (q < 0) continue
      const fiche = { ...c, ne: t, q, cote: COTES.get(q === 0 ? c.t0 : c.t1), actif: q === 0 ? c.t1 : c.t0, sw: [], liq: [], syncs: [], ajout: 0, retrait: 0, mort: null, hook: Z, fee: 3000, proto: c.n }
      if (c.n === 'v4Init') { fiche.proto = 'v4'; fiche.fee = Number(u(d, 0)); fiche.hook = adr(d.slice(2 + 128, 2 + 192)); if (fiche.fee & 0x800000) fiche.fee = 'dyn' }
      else if (c.n === 'v3Cree' || c.n === 'sunV3Cree') { fiche.proto = 'v3'; fiche.fee = Number(BigInt(e.k[3])) }
      else if (c.n === 'v2Cree') fiche.proto = 'v2'
      else if (c.n === 'solCree') { fiche.proto = BigInt(e.k[3]) ? 'sol-stable' : 'sol-volatil'; fiche.fee = BigInt(e.k[3]) ? 500 : 3000 }
      else if (c.n === 'clCree') { fiche.proto = 'cl'; fiche.fee = 'ts' + Number(BigInt.asIntN(24, BigInt(e.k[3]))) }
      else if (c.n === 'infClInit') { fiche.proto = 'inf-cl'; fiche.hook = adr(d.slice(2, 66)); fiche.fee = Number(u(d, 1)) }
      P.set(c.cle, fiche); continue
    }
    const p = P.get(clePool(e)); if (!p || t > p.ne + FEN) continue
    if (n === 'v4Swap' || n === 'v3Swap' || n === 'pcsV3Swap' || n === 'infClSwap') {
      let a0 = s256(d, 0), a1 = s256(d, 1); if (n === 'v4Swap' || n === 'infClSwap') { a0 = -a0; a1 = -a1 }   /* delta du TRADER → perspective POOL */
      const aq = p.q === 0 ? a0 : a1, at = p.q === 0 ? a1 : a0
      p.sw.push({ t, x: e.x, achat: aq > 0n, q: Number(aq > 0n ? aq : -aq), j: Number(at > 0n ? at : -at), sp: Number(u(d, 2)) })
    } else if (n === 'v2Swap' || n === 'solSwap') {
      const i0 = u(d, 0), i1 = u(d, 1), o0 = u(d, 2), o1 = u(d, 3)
      const qIn = p.q === 0 ? i0 : i1, qOut = p.q === 0 ? o0 : o1, jIn = p.q === 0 ? i1 : i0, jOut = p.q === 0 ? o1 : o0
      const achat = qIn > 0n && jOut > 0n
      p.sw.push({ t, x: e.x, achat, q: Number(achat ? qIn : qOut), j: Number(achat ? jOut : jIn) })
    } else if (n === 'v2Sync' || n === 'solSync') p.syncs.push([t, Number(u(d, 0)), Number(u(d, 1))])
    else if (n === 'v4Liq') { const dl = s256(d, 2); p.liq.push({ t, x: e.x, sens: dl > 0n ? 1 : -1 }); if (dl > 0n) p.ajout += Number(dl); else { p.retrait += Number(-dl); if (p.ajout > 0 && p.retrait >= 0.9 * p.ajout) p.mort ??= t } }
    else if (n === 'v3Mint' || n === 'v2Mint') { p.liq.push({ t, x: e.x, sens: 1 }); if (n === 'v3Mint') p.ajout += Number(u(d, 1)) }
    else if (n === 'v3Burn' || n === 'v2Burn' || n === 'solBurn') { p.liq.push({ t, x: e.x, sens: -1 }); if (n === 'v3Burn') { p.retrait += Number(u(d, 0)); if (p.ajout > 0 && p.retrait >= 0.9 * p.ajout) p.mort ??= t } }
  }
}
vus = vusAvant = null
for (const p of P.values()) {                                 /* mort v2/solidly : réserve de cotation < 10 % du max */
  let mx = 0
  for (const s of p.syncs.sort((a, b) => a[0] - b[0])) { const r = p.q === 0 ? s[1] : s[2]; if (r > mx) mx = r; else if (mx > 0 && r < 0.1 * mx) { p.mort = p.mort === null ? s[0] : Math.min(p.mort, s[0]); break } }
  const oc = META.get(p.actif)?.octets
  p.famille = `${p.proto}|${p.fee}|${p.hook === Z ? 'sans hook' : 'hook:' + p.hook.slice(0, 8)}|${p.cote.lib}|${p.mgr.slice(0, 8)}|${oc === undefined ? '?' : oc}o`
}
const pools = [...P.values()].filter(p => p.ne >= T0 && p.ne + FEN <= T1 && p.sw.length >= SW_MIN_POOL && (!FAMS || FAMS.some(f => p.famille.startsWith(f))))
/* 2. émetteurs réels : enrichisseur, cache, puis réseau (budget) */
const TX = new Map()
const lireTx = (f) => { if (existsSync(f)) for (const l of lireLignes(f)) { if (!l) continue; try { const x = JSON.parse(l); if (x.f) TX.set(x.x, x) } catch {} } }
if (existsSync(`${DIR}/tx`)) for (const f of readdirSync(`${DIR}/tx`).filter(x => /\.jsonl(\.zst)?$/.test(x))) lireTx(`${DIR}/tx/${f}`)
lireTx(`${process.env.CACHE ?? '/data/cache'}/tx-${CH}.jsonl`)
const voulus = [...new Set(pools.flatMap(p => [...p.sw.map(s => s.x), ...p.liq.map(s => s.x)]))]
const manquants = voulus.filter(x => !TX.has(x))
const aDemander = manquants.slice(0, BUDGET)
mkdirSync(process.env.CACHE ?? '/data/cache', { recursive: true })
/* RÉSOLUTION PARALLÈLE : sur le Mac l'IP n'est pas celle du collecteur, on peut aller plus vite (35 tx/s en série, des
 * heures pour 60 000 émetteurs). 4 paquets en vol, répartis sur les RPC de la chaîne ; un 429 ralentit tout le monde. */
const PARALLELE = Number(process.env.PARALLELE ?? 4)
let pause = Number(process.env.PAUSE_MS ?? 150), iPaquet = 0
const paquets = []; for (let i = 0; i < aDemander.length; i += 25) paquets.push(aDemander.slice(i, i + 25))
async function ouvrier(k) {
  for (;;) {
    const paquet = paquets[iPaquet++]; if (!paquet) return
    const r = await groupeSur(RPCS[(k + iPaquet) % RPCS.length], paquet.map(x => ['eth_getTransactionByHash', [x]]))
    const lignes = []
    paquet.forEach((x, j) => { const t = r[j]; if (t?.from) { const o = { x, f: t.from.toLowerCase(), to: t.to?.toLowerCase() ?? null, n: parseInt(t.nonce, 16), gp: t.gasPrice ? parseInt(t.gasPrice, 16) : null, ...(t.maxPriorityFeePerGas ? { pf: parseInt(t.maxPriorityFeePerGas, 16) } : {}) }; TX.set(x, o); lignes.push(JSON.stringify(o)) } })
    if (lignes.length) appendFileSync(`${process.env.CACHE ?? '/data/cache'}/tx-${CH}.jsonl`, lignes.join('\n') + '\n')
    await sleep(pause)
  }
}
/* un paquet sur UN RPC donné ; taille de paquet PROPRE À CHAQUE RPC (mainnet.base.org : 10 max ; une taille globale
 * faisait découper aussi les paquets des RPC qui en acceptent 25), 429 → pause doublée pour tous */
const tailleParRpc = new Map()
async function groupeSur(url0, appels, essai0 = 0) {
  const url = RPCS[(RPCS.indexOf(url0) + essai0) % RPCS.length], tl = tailleParRpc.get(url) ?? 25
  if (appels.length > tl) { const out = []; for (let i = 0; i < appels.length; i += tl) out.push(...await groupeSur(url, appels.slice(i, i + tl))); return out }
  for (let essai = 0; essai < 6; essai++) {
    const u = essai ? RPCS[(RPCS.indexOf(url) + essai) % RPCS.length] : url
    if (appels.length > (tailleParRpc.get(u) ?? 25)) return groupeSur(u, appels)
    try {
      const r = await fetch(u, { method: 'POST', headers: { 'content-type': 'application/json' }, signal: AbortSignal.timeout(45000),
        body: JSON.stringify(appels.map((c, i) => ({ jsonrpc: '2.0', id: i, method: c[0], params: c[1] }))) })
      if (r.status === 429) { pause = Math.min(5000, pause * 2); throw new Error('429') }
      const t = await r.text(); let j; try { j = JSON.parse(t) } catch { throw new Error('non JSON') }
      if (!Array.isArray(j)) { if (/batch|calls|too many|size/i.test(t) && (tailleParRpc.get(u) ?? 25) > 5) { tailleParRpc.set(u, Math.max(5, Math.floor((tailleParRpc.get(u) ?? 25) / 2))); return groupeSur(u, appels) } throw new Error('lot refusé') }
      pause = Math.max(Number(process.env.PAUSE_MS ?? 150), pause * 0.95)
      const m = new Map(); for (const x of j) m.set(x.id, x.error ? null : x.result)
      return appels.map((_, i) => m.get(i) ?? null)
    } catch (e) { await sleep(/429/.test(e.message) ? pause * 2 : 1000) }
  }
  return appels.map(() => null)
}
await Promise.all(Array.from({ length: PARALLELE }, (_, k) => ouvrier(k)))
const nSw = pools.reduce((s, p) => s + p.sw.length, 0), nRes = pools.reduce((s, p) => s + p.sw.filter(x => TX.has(x.x)).length, 0)
const couv = nSw ? nRes / nSw : 0
/* 3. LP / déployeurs : ont ajouté ou retiré de la liquidité dans ces pools, ou les ont créés */
const LP = new Set()
for (const p of pools) for (const l of p.liq) { const t = TX.get(l.x); if (t) LP.add(t.f) }
/* 4. positions (adresse × pool) */
const fenetres = [T0, T0 + (T1 - T0) / 3, T0 + 2 * (T1 - T0) / 3, T1]
const fenDe = (t) => t < fenetres[1] ? 0 : t < fenetres[2] ? 1 : 2
const ADR = new Map()
for (const p of pools) {
  const p$ = prix$(p.cote), dec = p.cote.dec ?? 18
  if (!p$) continue
  const fin = p.ne + FEN, mortAvantFin = p.mort !== null && p.mort <= fin
  /* dernier prix MARGINAL dans la fenêtre : réserves du dernier Sync (v2/solidly) ou √P du dernier swap (v3/v4) */
  let prixUnit = 0
  const lastSync = p.syncs.filter(s => s[0] <= fin).at(-1)
  if (lastSync) prixUnit = p.q === 0 ? lastSync[1] / lastSync[2] : lastSync[2] / lastSync[1]
  else { const ls = p.sw.filter(s => s.sp && s.t <= fin).at(-1); if (ls) { const pr = (ls.sp / Q96) ** 2; prixUnit = p.q === 0 ? 1 / pr : pr } }
  const pos = new Map()
  for (const s of p.sw) {
    const tx = TX.get(s.x); if (!tx) continue
    const o = pos.get(tx.f) ?? { qIn: 0, qOut: 0, jIn: 0, jOut: 0, achat1: null, vente1: null, nA: 0, nV: 0, to: new Map(), gp: [], pf: [], n: [] }
    if (s.achat) { o.qIn += s.q; o.jIn += s.j; o.achat1 ??= s.t; o.nA++ } else { o.qOut += s.q; o.jOut += s.j; o.vente1 ??= s.t; o.nV++ }
    if (tx.to) o.to.set(tx.to, (o.to.get(tx.to) ?? 0) + 1)
    if (tx.gp) o.gp.push(tx.gp); if (tx.pf !== undefined) o.pf.push(tx.pf); if (tx.n !== undefined) o.n.push(tx.n)
    pos.set(tx.f, o)
  }
  for (const [w, o] of pos) {
    const A = ADR.get(w) ?? { strict: [0, 0, 0], valo: [0, 0, 0], positions: 0, gagnantes: 0, ouvertes: 0, fam: new Map(), age: [], detention: [], mise: [], to: new Map(), gp: [], pf: [], n: [], volume: 0 }
    const k = fenDe(o.achat1 ?? o.vente1)
    const reste = Math.max(0, o.jIn - o.jOut)
    /* P&L sur les SEULS jetons ACHETÉS (05/10, signalé par l'agent Ethereum) : un compte qui revend des jetons reçus sans les
     * avoir achetés (allocation, transfert d'un autre portefeuille) affichait ce produit comme un gain — les « gagnants tardifs »
     * d'Ethereum à +4 700 $ faisaient en réalité +248, +64 et −317 $. Un vendeur PUR (aucun achat) n'a pas de P&L de trading. */
    const qOutEff = !o.nA ? 0 : o.jOut > o.jIn && o.jOut > 0 ? o.qOut * o.jIn / o.jOut : o.qOut
    const strict = o.nA ? (qOutEff - o.qIn) / 10 ** dec * p$ : 0
    const valo = strict + (!o.nA || mortAvantFin ? 0 : reste * prixUnit * (1 - (typeof p.fee === 'number' ? p.fee / 1e6 : 0)) / 10 ** dec * p$)
    A.strict[k] += strict; A.valo[k] += valo
    if (o.nA) { A.positions++; if (qOutEff > o.qIn) A.gagnantes++; if (o.jOut < 0.99 * o.jIn) A.ouvertes++
      A.fam.set(p.famille, (A.fam.get(p.famille) ?? 0) + 1); A.age.push(o.achat1 - p.ne); if (o.vente1) A.detention.push(o.vente1 - o.achat1)
      A.mise.push(o.qIn / o.nA / 10 ** dec * p$) }
    A.volume += (o.qIn + o.qOut) / 10 ** dec * p$
    for (const [c, m] of o.to) A.to.set(c, (A.to.get(c) ?? 0) + m)
    A.gp.push(...o.gp); A.pf.push(...o.pf); A.n.push(...o.n)
    ADR.set(w, A)
  }
}
/* 5. régularité et distribution */
const dureeFenH = (T1 - T0) / 3 / 3600
const seuilFen = 20 * dureeFenH / 24                        /* 20 $/jour au prorata d'une fenêtre */
const lignes = [...ADR].map(([w, A]) => ({ w, ...A, total: A.strict.reduce((s, x) => s + x, 0), totalValo: A.valo.reduce((s, x) => s + x, 0),
  fenGagnantes: A.strict.filter(x => x >= seuilFen).length, lp: LP.has(w) }))
const traders = lignes.filter(x => !x.lp && x.positions > 0)
const gagnants = traders.filter(x => x.total > 0), perdants = traders.filter(x => x.total < 0)
const tri = [...traders].sort((a, b) => b.total - a.total)
const dec10 = tri.slice(0, Math.max(1, Math.ceil(tri.length / 10)))
const reguliers = traders.filter(x => x.fenGagnantes >= 2).sort((a, b) => b.total - a.total)
/* ARCHÉTYPES (retour du recensement sur l'historique Pons, 05/10) : (A) le créateur qui achète son propre lancement —
 * écarté ici comme LP/déployeur ; (B) les flottes de snipers, entrée 0-10 s, détention 15-60 s : une COURSE DE VITESSE ;
 * (C) l'entrée TARDIVE, 1 à 5 min après la naissance, détention de quelques minutes : gagner SANS course de vitesse —
 * c'est elle qu'on cherche sur les autres chaînes ; entre les deux, l'entrée « intermédiaire » (nos bots : t+20 s). */
const archetype = (age, det) => !Number.isFinite(age) ? '?' : age <= 10 ? 'B vitesse' : age >= 60 ? 'C tardif' : 'intermédiaire'
/* 5 bis. OPÉRATEURS : un opérateur répartit son activité sur plusieurs wallets (les nôtres : 4 adresses actives sur Arc,
 * ~49 $/jour à elles quatre, mais une seule passe le seuil par adresse). On regroupe par SIGNATURE — contrat appelé
 * principal, pourboire médian, mise médiane et âge d'entrée médian arrondis. HEURISTIQUE : deux opérateurs distincts
 * qui passent par le même routeur public avec les mêmes réglages seraient fusionnés ; c'est dit dans la sortie. */
const arrondi = (v, pas) => Number.isFinite(v) ? Math.round(v / pas) * pas : 'na'
const signature = (x) => { const to = [...x.to].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '?'
  return `${to}|tip${arrondi(med(x.pf) / 1e9, 0.5)}|mise${arrondi(Math.log10(Math.max(1e-4, med(x.mise))), 0.25)}|age${arrondi(med(x.age), 10)}` }
const OPS = new Map()
for (const x of traders) { const k = signature(x); const o = OPS.get(k) ?? { k, w: [], strict: [0, 0, 0], positions: 0, age: [], detention: [], mise: [] }; o.w.push(x.w); x.strict.forEach((v, i) => o.strict[i] += v); o.positions += x.positions; o.age.push(...x.age); o.detention.push(...x.detention); o.mise.push(...x.mise); OPS.set(k, o) }
const operateurs = [...OPS.values()].filter(o => o.w.length > 1).map(o => ({ ...o, total: o.strict.reduce((s, v) => s + v, 0), fenGagnantes: o.strict.filter(v => v >= seuilFen).length }))
const opsReguliers = operateurs.filter(o => o.fenGagnantes >= 2).sort((a, b) => b.total - a.total)
/* 6. profil : contrats appelés et LEUR taille de bytecode (deux adresses qui appellent le même moule = souvent le même opérateur) */
const contrats = [...new Set(reguliers.slice(0, 25).flatMap(x => [...x.to.keys()]))]
const tailleContrat = new Map()
for (let i = 0; i < contrats.length; i += 20) { const r = await groupe(contrats.slice(i, i + 20).map(c => ['eth_getCode', [c, 'latest']])); contrats.slice(i, i + 20).forEach((c, k) => tailleContrat.set(c, r[k] ? (r[k].length - 2) / 2 : null)) }
/* activité sur les autres chaînes (dans ce que le labo a résolu) */
const autres = new Map()
const cibles = new Set([...reguliers.slice(0, 25).map(x => x.w), ...TEMOINS])
for (const c of readdirSync(process.env.DONNEES ?? '/data/chaines')) {
  if (c === CH) continue
  const d = `${process.env.DONNEES ?? '/data/chaines'}/${c}/tx`; if (!existsSync(d)) continue
  for (const f of readdirSync(d).filter(x => /\.jsonl(\.zst)?$/.test(x))) for (const l of lireLignes(`${d}/${f}`)) { const i = l.indexOf('"f":"'); if (i < 0) continue; const w = l.slice(i + 5, i + 47); if (cibles.has(w)) { const s = autres.get(w) ?? new Map(); s.set(c, (s.get(c) ?? 0) + 1); autres.set(w, s) } }
}
/* 7. sortie */
const usd = (v) => Number.isFinite(v) ? (v >= 0 ? '+' : '') + v.toFixed(2) + ' $' : '—'
const fmt = (x) => `[${archetype(med(x.age), med(x.detention))}] ${x.w} · strict ${usd(x.total)} (fenêtres ${x.strict.map(v => usd(v)).join(' / ')}) · valorisé ${usd(x.totalValo)} · ${x.positions} positions (${(x.gagnantes / Math.max(1, x.positions) * 100).toFixed(0)} % gagnantes, ${x.ouvertes} restées ouvertes)` +
  ` · ${(x.positions / ((T1 - T0) / 3600) * 24).toFixed(0)} coups/jour · mise méd. ${usd(med(x.mise))} · entrée méd. t+${med(x.age).toFixed(0)} s · détention méd. ${Number.isFinite(med(x.detention)) ? med(x.detention).toFixed(0) + ' s' : '—'}` +
  ` · gaz méd. ${med(x.gp) ? (med(x.gp) / 1e9).toFixed(3) + ' gwei' : '—'}${x.pf.length ? ' (pourboire ' + (med(x.pf) / 1e9).toFixed(3) + ')' : ''} · nonce ${x.n.length ? Math.min(...x.n) + '→' + Math.max(...x.n) : '—'}`
console.log(`\n═══ GAGNANTS · ${CH} · ${((T1 - T0) / 3600).toFixed(1)} h (3 fenêtres de ${dureeFenH.toFixed(1)} h, seuil ${seuilFen.toFixed(2)} $ par fenêtre = 20 $/jour) · ${pools.length} pools jeunes (≥ ${SW_MIN_POOL} échanges) · fenêtre de lancement ${FEN} s`)
console.log(`    émetteurs résolus : ${nRes}/${nSw} échanges (${(couv * 100).toFixed(1)} %) · demandés au réseau ${aDemander.length}/${manquants.length} manquants · prix natif ${PRIX_NATIF ?? '?'} $ · gaz NON déduit`)
const sortie = { chaine: CH, heures: (T1 - T0) / 3600, fenetre: FEN, couverture: couv, pools: pools.length, adresses: traders.length, lp: LP.size }
if (nSw === 0) console.log(`    aucun échange dans des pools jeunes actifs (≥ ${SW_MIN_POOL} échanges) : rien à classer — ce n'est PAS un défaut de couverture (${P.size} pools nés au total)`)
else if (couv < 0.9) console.log(`    ⚠ ÉMETTEURS RÉSOLUS < 90 % : AUCUN CLASSEMENT PUBLIÉ (augmenter --budget ou attendre l'enrichisseur)`)
else {
  const somme = (a) => a.reduce((s, x) => s + x.total, 0)
  console.log(`    ${traders.length} adresses de trading (${LP.size} adresses LP/déployeur écartées) · ${gagnants.length} gagnent (${usd(somme(gagnants))}), ${perdants.length} perdent (${usd(somme(perdants))}) · décile supérieur : ${usd(somme(dec10))} (${dec10.length} adresses)`)
  console.log(`    GAGNANTS RÉGULIERS (≥ 20 $/jour au prorata dans ≥ 2 fenêtres sur 3) : ${reguliers.length}`)
  for (const x of reguliers.slice(0, 15)) {
    console.log(`  · ${fmt(x)}`)
    console.log(`      familles : ${[...x.fam].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f, n]) => `${f} ×${n}`).join(' · ')}`)
    console.log(`      contrats appelés : ${[...x.to].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c, n]) => `${c} (${tailleContrat.get(c) ?? '?'} o) ×${n}`).join(' · ')}${autres.has(x.w) ? ` · vu aussi sur : ${[...autres.get(x.w)].map(([c, n]) => c + ' ×' + n).join(', ')}` : ''}`)
  }
  sortie.reguliers = reguliers.slice(0, 50).map(x => ({ w: x.w, archetype: archetype(med(x.age), med(x.detention)), total: x.total, valo: x.totalValo, fen: x.strict, positions: x.positions, gagnantes: x.gagnantes, coupsJour: x.positions / ((T1 - T0) / 3600) * 24,
    mise: med(x.mise), age: med(x.age), detention: med(x.detention), gp: med(x.gp), pf: med(x.pf), familles: [...x.fam].sort((a, b) => b[1] - a[1]).slice(0, 5),
    contrats: [...x.to].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([c, n]) => ({ c, n, octets: tailleContrat.get(c) ?? null })), autresChaines: autres.has(x.w) ? Object.fromEntries(autres.get(x.w)) : {} }))
  sortie.distribution = { gagnants: gagnants.length, perdants: perdants.length, sommeGagnants: somme(gagnants), sommePerdants: somme(perdants), decile: somme(dec10) }
  console.log(`\n    OPÉRATEURS RÉGULIERS (wallets regroupés par signature : contrat appelé, pourboire, mise, âge d'entrée — heuristique) : ${opsReguliers.length}`)
  for (const o of opsReguliers.slice(0, 10)) console.log(`  · [${archetype(med(o.age), med(o.detention))}] entrée méd. t+${med(o.age).toFixed(0)} s · détention méd. ${Number.isFinite(med(o.detention)) ? med(o.detention).toFixed(0) + ' s' : '—'} · mise méd. ${usd(med(o.mise))} · ${o.w.length} wallets · strict ${usd(o.total)} (fenêtres ${o.strict.map(v => usd(v)).join(' / ')}) · ${o.positions} positions · ${o.positions ? (o.positions / ((T1 - T0) / 3600) * 24).toFixed(0) : 0} coups/jour · signature ${o.k}\n      ${o.w.slice(0, 6).join(', ')}${o.w.length > 6 ? ' …' : ''}`)
  sortie.operateurs = opsReguliers.slice(0, 30).map(o => ({ signature: o.k, wallets: o.w, total: o.total, fen: o.strict, positions: o.positions, archetype: archetype(med(o.age), med(o.detention)), age: med(o.age), detention: med(o.detention), mise: med(o.mise) }))
}
if (TEMOINS.length) {
  console.log(`\n    TÉMOINS (nos wallets) :`)
  sortie.temoins = {}
  for (const w of TEMOINS) {
    const x = lignes.find(y => y.w === w)
    if (!x) { console.log(`  · ${w} : AUCUNE position vue dans les pools jeunes de la fenêtre`); sortie.temoins[w] = null; continue }
    console.log(`  · ${x.fenGagnantes >= 2 ? 'RÉGULIER' : 'non régulier'}${x.lp ? ' (LP !)' : ''} ${fmt(x)}`)
    sortie.temoins[w] = { regulier: x.fenGagnantes >= 2, total: x.total, valo: x.totalValo, fen: x.strict, positions: x.positions }
  }
  const tw = lignes.filter(y => TEMOINS.includes(y.w)), tot = tw.reduce((s, y) => s + y.total, 0), fenT = [0, 1, 2].map(i => tw.reduce((s, y) => s + y.strict[i], 0))
  console.log(`  → ENSEMBLE des témoins : strict ${usd(tot)} sur ${((T1 - T0) / 3600).toFixed(1)} h = ${usd(tot / ((T1 - T0) / 3600) * 24)}/jour · fenêtres ${fenT.map(v => usd(v)).join(' / ')} → ${fenT.filter(v => v >= seuilFen).length >= 2 ? 'RÉGULIER (en tant qu\'opérateur)' : 'non régulier'}`)
  const sigs = new Set(tw.map(signature)); console.log(`    signatures des témoins : ${[...sigs].join(' ; ')}`)
}
if (arg('json', null)) writeFileSync(arg('json'), JSON.stringify(sortie))
