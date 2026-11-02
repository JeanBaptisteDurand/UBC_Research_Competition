/* SOLANA — LECTURES AU REÇU (getTransaction), en LECTURE SEULE, ≤ 4 requêtes/s, recul sur 429.
 * Ce que les événements des courbes ne disent pas, et qu'il faut pourtant savoir avant de chiffrer quoi que ce soit :
 *
 *   --mode=couts : ce que paient RÉELLEMENT, en plus de la courbe, les tiers qui font notre geste sur pump.fun/SOL
 *       (achat à t+10..60 s, ≤ 0,1 SOL ; leur revente 30..600 s plus tard) : frais de base + priorité (meta.fee), prix de
 *       l'unité de calcul, pourboires Jito (comptes de pourboire connus), autres virements sortants (frais de plateforme,
 *       loyer de compte). Vérifie au passage : signataire = champ `user` ? variation de solde = montant de courbe ± frais ?
 *   --mode=ll-identite : l'événement LaunchLab ne porte PAS l'acheteur ; on lit le signataire de chaque échange des
 *       60 premières secondes des pools LaunchLab cotés en SOL → second acheteur RÉEL (et non plus un majorant).
 *   --mode=ll-tiers : signataires de TOUS les échanges des 700 premières secondes (pools LaunchLab cotés en SOL + un tirage
 *       des autres) → second acheteur réel, foule, tiers au timing, vente du créateur ; quatre requêtes en vol, débit
 *       plafonné globalement (--rps, 3,5 par défaut), reprise sur fichier.
 * RPC : `api.mainnet-beta` bride getTransaction (« Too many requests for a specific RPC call », < 0,5/s soutenu le 05/10) ;
 * `--rpc=https://solana-rpc.publicnode.com` tient 3,5/s. Transactions en VERSION 1 : maxSupportedTransactionVersion: 1,
 * sinon le nœud répond une erreur qu'un lecteur pressé prend pour « transaction introuvable ».
 *
 *   node solana-recus.mjs --mode=couts --fichiers=2026-10-05/11,2026-10-05/12 --n=150 --sortie=couts.jsonl
 *   node solana-recus.mjs --mode=ll-identite --debut=2026-10-04T23:00 --fin=2026-10-05T17:00 --ll-cotes=ll-cotes.json --sortie=ll-id.jsonl
 *   node solana-recus.mjs --mode=ll-tiers --rpc=https://solana-rpc.publicnode.com --ll-cotes=ll-cotes.json --n-autres=80 --sortie=ll-tiers.jsonl
 * `ll-cotes.json` : { pool: { base, cote } } lu sur les comptes PoolState (octets 205 et 237) par getMultipleAccounts.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline'

const arg = (k, d) => { const a = process.argv.find(x => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d }
const DIR = process.env.DONNEES ?? 'data/collector-hourly/solana'  /* hourly collector files (8.6 GB, on request) */
const RPC = arg('rpc', 'https://api.mainnet-beta.solana.com')
const MODE = arg('mode', 'couts'), SORTIE = arg('sortie', 'recus.jsonl'), N = Number(arg('n', 150))
const D = Number(arg('slot', 0.2669))                         /* durée de slot mesurée par solana-courbes.mjs */
const sleep = ms => new Promise(r => setTimeout(r, ms))
const JITO = new Set(['96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5', 'HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe', 'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
  'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49', 'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh', 'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
  'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL', '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT'])
const lignes = (f) => createInterface({ input: spawn('zstd', ['-dc', f]).stdout, crlfDelay: Infinity })
/* générateur pseudo-aléatoire à graine : un tirage reproductible */
/* mulberry32 (entiers 32 bits) : le congruentiel en flottants d'une première version perdait ses bits bas et bouclait vite */
let graine = Number(arg('graine', 20261005)) | 0
const alea = () => { graine = graine + 0x6D2B79F5 | 0; let t = Math.imul(graine ^ graine >>> 15, 1 | graine); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
const tirer = (a, n) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(alea() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b.slice(0, n) }

/* débit plafonné GLOBALEMENT (≤ 3,5 requêtes/s, toutes requêtes en vol confondues) : la latence du RPC public (~2 s)
 * n'est pas un débit ; plusieurs requêtes en vol, mais jamais plus de 3,5 départs par seconde */
const PAS = 1000 / Number(arg('rps', 3.5))
let prochain = 0
const jeton = async () => { const t = Math.max(Date.now(), prochain); prochain = t + PAS; const w = t - Date.now(); if (w > 0) await sleep(w) }
async function rpc(method, params) {
  for (let k = 0; k < 8; k++) {
    await jeton()
    try {
      const r = await fetch(RPC, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }), signal: AbortSignal.timeout(30000) })
      if (r.status === 429) { await sleep(2000 * (k + 1)); continue }
      const j = await r.json(); if (j.error) { if (/rate|limit|429/i.test(j.error.message)) { await sleep(2000 * (k + 1)); continue } return { erreur: j.error.message } }
      return { r: j.result }
    } catch (e) { await sleep(2000 * (k + 1)) }
  }
  return { erreur: 'abandon après 8 essais' }
}
const getTx = (sig) => rpc('getTransaction', [sig, { encoding: 'json', maxSupportedTransactionVersion: 1, commitment: 'confirmed' }])
function lireTx(t) {
  const m = t.transaction.message, keys = [...m.accountKeys, ...(t.meta.loadedAddresses?.writable ?? []), ...(t.meta.loadedAddresses?.readonly ?? [])]
  const nSig = m.header.numRequiredSignatures
  let prixCU = 0, limiteCU = null
  for (const ix of m.instructions) { if (keys[ix.programIdIndex] !== 'ComputeBudget111111111111111111111111111111') continue
    const b = Buffer.from(require58(ix.data)); if (b[0] === 3) prixCU = Number(b.readBigUInt64LE(1)); if (b[0] === 2) limiteCU = b.readUInt32LE(1) }
  const deltas = keys.map((k, i) => [k, (t.meta.postBalances[i] ?? 0) - (t.meta.preBalances[i] ?? 0)])
  return { keys, signataires: keys.slice(0, nSig), payeur: keys[0], frais: t.meta.fee, cu: t.meta.computeUnitsConsumed, prixCU, limiteCU, deltas, slot: t.slot }
}
/* décodage base58 des données d'instruction (format « json » de getTransaction) */
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
function require58(s) { let n = 0n; for (const c of s) n = n * 58n + BigInt(B58.indexOf(c)); const out = []; while (n > 0n) { out.unshift(Number(n & 255n)); n >>= 8n } for (const c of s) { if (c === '1') out.unshift(0); else break } return out }

if (MODE === 'couts') {
  const fichiers = arg('fichiers', '2026-10-05/11,2026-10-05/12').split(',').map(x => `${DIR}/${x}.jsonl.zst`)
  const nes = new Map(), achats = [], ventes = [], achatsPar = new Map()
  for (const f of fichiers) for await (const l of lignes(f)) {
    if (!l.includes('"p":"pf"')) continue
    const e = JSON.parse(l)
    if (e.e === 'C') { if (!e.mm && (!e.qm || e.qm === '11111111111111111111111111111111')) nes.set(e.m, { sl: e.sl, u: e.u, sig: e.sig }); continue }
    if (e.e !== 'T' || e.qm || e.mm) continue
    const n = nes.get(e.m); if (!n || e.u === n.u || e.sig === n.sig) continue
    const age = (e.sl - n.sl) * D
    if (e.a && age >= 10 && age <= 60 && e.sol + e.f + e.cf <= 1e8) { const x = { sig: e.sig, m: e.m, u: e.u, sl: e.sl, a: 1, sol: e.sol, f: e.f, cf: e.cf, age }; achats.push(x); achatsPar.set(`${e.m}|${e.u}`, x) }
    else if (!e.a) { const b = achatsPar.get(`${e.m}|${e.u}`); if (b) { const dt = (e.sl - b.sl) * D; if (dt >= 30 && dt <= 600) ventes.push({ sig: e.sig, m: e.m, u: e.u, sl: e.sl, a: 0, sol: e.sol, f: e.f, cf: e.cf, dt }) } }
  }
  const lot = [...tirer(achats, N), ...tirer(ventes, N)]
  console.log(`candidats : ${achats.length} achats, ${ventes.length} ventes → tirage ${lot.length}`)
  writeFileSync(SORTIE, '')
  const recus = {}
  for (const x of lot) {
    const { r, erreur } = await getTx(x.sig)
    if (!r) { appendFileSync(SORTIE, JSON.stringify({ ...x, erreur: erreur ?? 'introuvable' }) + '\n'); continue }
    const t = lireTx(r)
    const iu = t.keys.indexOf(x.u), dU = iu >= 0 ? t.deltas[iu][1] : null
    const courbe = x.a ? -(x.sol + x.f + x.cf) : (x.sol - x.f - x.cf)
    const jito = t.deltas.filter(([k, d]) => JITO.has(k) && d > 0).reduce((s, [, d]) => s + d, 0)
    /* autres virements reçus par des comptes qui ne sont ni le signataire ni des comptes de pump.fun connus de l'événement */
    const recoit = t.deltas.filter(([k, d]) => d > 0 && !JITO.has(k) && k !== x.u).map(([k, d]) => [k, d])
    for (const [k, d] of recoit) { const o = recus[k] ??= { n: 0, somme: 0 }; o.n++; o.somme += d }
    appendFileSync(SORTIE, JSON.stringify({ ...x, signataire: t.signataires.includes(x.u), payeur: t.payeur === x.u, nSig: t.signataires.length, frais: t.frais, cu: t.cu, prixCU: t.prixCU, limiteCU: t.limiteCU,
      jito, dU, courbe, ecart: dU !== null ? dU - courbe : null, recoit }) + '\n')
  }
  const L = readFileSync(SORTIE, 'utf8').trim().split('\n').map(l => JSON.parse(l)).filter(x => !x.erreur)
  const med = (a) => { if (!a.length) return null; const s = [...a].sort((p, q) => p - q); return s[s.length >> 1] }
  const q = (a, p) => { if (!a.length) return null; const s = [...a].sort((u, v) => u - v); return s[Math.min(s.length - 1, Math.floor(p * s.length))] }
  for (const [nom, S] of [['achats', L.filter(x => x.a)], ['ventes', L.filter(x => !x.a)]]) {
    const tot = S.map(x => x.frais + x.jito)
    console.log(`${nom} lus : ${S.length} · signataire = user ${S.filter(x => x.signataire).length} · payeur = user ${S.filter(x => x.payeur).length}`)
    console.log(`  meta.fee (base+priorité) lamports : p10 ${q(S.map(x => x.frais), .1)} · médiane ${med(S.map(x => x.frais))} · p90 ${q(S.map(x => x.frais), .9)}`)
    console.log(`  pourboire Jito : ${S.filter(x => x.jito > 0).length}/${S.length} transactions ; médiane quand présent ${med(S.filter(x => x.jito > 0).map(x => x.jito))}`)
    console.log(`  frais + Jito par transaction : p25 ${q(tot, .25)} · médiane ${med(tot)} · p75 ${q(tot, .75)} · p90 ${q(tot, .9)}`)
    const pay = S.filter(x => x.payeur && x.ecart !== null), hors = pay.map(x => x.ecart + x.frais + x.jito)
    console.log(`  user payeur : écart solde − courbe − frais − Jito (autres sorties : plateforme, loyer…) : médiane ${med(hors)} · p90 ${q(hors, .9)} ; nuls ${hors.filter(v => v === 0).length}/${hors.length}`)
    const rel = pay.map(x => -(x.ecart + x.frais + x.jito) / Math.abs(x.courbe)).filter(v => Number.isFinite(v))
    console.log(`  … rapportées au montant de courbe : médiane ${(100 * med(rel)).toFixed(2)} %`)
  }
  console.log('comptes recevant le plus souvent (hors user et Jito) :', Object.entries(recus).sort((a, b) => b[1].n - a[1].n).slice(0, 12).map(([k, o]) => `${k.slice(0, 8)}…×${o.n}`).join(' '))
}

async function enParallele(items, n, f) { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const x = items[i++]; await f(x) } })) }

if (MODE === 'll-tiers') {
  /* identité de TOUS les échanges des 700 premières secondes : pools LaunchLab cotés en SOL (tous) et un tirage de pools
   * cotés autrement ; puis second acheteur réel, tiers au timing, vente du créateur — comme pour pump.fun */
  const iso2s = (x) => Date.parse(x.endsWith('Z') ? x : x + 'Z') / 1000
  const DEBUT = iso2s(arg('debut', '2026-10-04T23:00')), FIN = iso2s(arg('fin', '2026-10-05T17:00'))
  const cotes = JSON.parse(readFileSync(arg('ll-cotes'), 'utf8')), NAUTRES = Number(arg('n-autres', 120))
  const SOLM = 'So11111111111111111111111111111111111111112'
  const fichiers = []
  for (const j of readdirSync(DIR).filter(x => /^\d{4}-\d\d-\d\d$/.test(x)).sort())
    for (const f of readdirSync(`${DIR}/${j}`).filter(x => /^\d\d\.jsonl(\.zst)?$/.test(x)).sort()) { const t0 = iso2s(`${j}T${f.slice(0, 2)}:00`); if (t0 + 3600 > DEBUT && t0 < FIN + 3600) fichiers.push(`${DIR}/${j}/${f}`) }
  const nes = new Map(), tr = new Map(); let calS = null, calSl = null
  for (const f of fichiers) for await (const l of (f.endsWith('.zst') ? lignes(f) : createInterface({ input: (await import('node:fs')).createReadStream(f), crlfDelay: Infinity }))) {
    if (calS === null && l.includes('"p":"pf"') && l.includes('"s":')) { const e = JSON.parse(l); if (e.s) { calS = e.s; calSl = e.sl } }
    if (!l.includes('"p":"ll"')) continue
    const e = JSON.parse(l)
    if (e.e === 'C') { nes.set(e.ps, { sl: e.sl, cr: e.cr, sig: e.sig, fam: cotes[e.ps]?.cote === SOLM ? 'SOL' : 'autres' }); continue }
    const n = nes.get(e.ps); if (!n) continue
    if ((e.sl - n.sl) * D > 700) continue
    ;(tr.get(e.ps) ?? tr.set(e.ps, []).get(e.ps)).push({ sig: e.sig, sl: e.sl, a: e.a, ai: e.ai, ao: e.ao, fee: e.pf + e.plf + e.cf + e.sf, st: e.st })
  }
  const dansFenetre = (ps) => { const n = nes.get(ps); const t = calS + (n.sl - calSl) * D; return t >= DEBUT && t <= FIN - 900 }
  const solP = [...nes.keys()].filter(ps => nes.get(ps).fam === 'SOL' && dansFenetre(ps))
  const autresP = tirer([...nes.keys()].filter(ps => nes.get(ps).fam === 'autres' && dansFenetre(ps) && (tr.get(ps)?.length ?? 0) >= 3), NAUTRES)
  const choisis = [...solP, ...autresP]
  const deja = new Map(existsSync(SORTIE) ? readFileSync(SORTIE, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)).filter(x => !x.erreur).map(x => [x.sig, x]) : [])
  const sigs = [...new Set(choisis.flatMap(ps => [nes.get(ps).sig, ...(tr.get(ps) ?? []).map(x => x.sig)]))].filter(s => !deja.has(s))
  console.log(`pools : ${solP.length} cotés SOL + ${autresP.length} tirés parmi les autres · transactions à lire : ${sigs.length} (déjà lues ${deja.size})`)
  let fait = 0
  await enParallele(sigs, 4, async (sig) => {
    const { r, erreur } = await getTx(sig)
    const o = r ? (() => { const t = lireTx(r); return { sig, signataires: t.signataires, payeur: t.payeur, frais: t.frais } })() : { sig, erreur: erreur ?? 'introuvable' }
    appendFileSync(SORTIE, JSON.stringify(o) + '\n'); if (!o.erreur) deja.set(sig, o)
    if (++fait % 500 === 0) console.log(`  ${fait}/${sigs.length}`)
  })
  /* analyses */
  const med = (a) => { if (!a.length) return null; const s = [...a].sort((p, q) => p - q); return s[s.length >> 1] }
  const moy = (a) => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null
  const rob = (a) => { if (a.length < 20) return moy(a); const s = [...a].sort((p, q) => p - q); return moy(s.slice(0, Math.floor(s.length * 0.95))) }
  const pct = (x) => x === null || x === undefined ? '—' : `${x >= 0 ? '+' : ''}${(100 * x).toFixed(1)} %`
  for (const [nomF, P] of [['LaunchLab/SOL', solP], ['LaunchLab/autres (tirage)', autresP]]) {
    let n = 0, second = 0, secondStrict = 0, lus = 0, total = 0
    const pos = [], vc = { nAch: 0, apresAch: 0, nTem: 0, apresTem: 0 }
    const W3 = Math.round(3 / D)
    for (const ps of P) {
      const ne = nes.get(ps), L = (tr.get(ps) ?? []).sort((a, b) => a.sl - b.sl); n++
      const idNe = deja.get(ne.sig), mainC = new Set([ne.cr, ...(idNe?.signataires ?? [])])
      const strict = new Set(mainC); for (const x of L) if (x.sl === ne.sl) for (const s of deja.get(x.sig)?.signataires ?? []) strict.add(s)
      const qui = (x) => { const t = deja.get(x.sig); total++; if (!t) return null; lus++; return t.payeur }
      const a1 = new Set(), a2 = new Set()
      for (const x of L) { if (!x.a || (x.sl - ne.sl) * D > 60) continue; const u = qui(x); if (!u || mainC.has(u)) continue; a1.add(u); if (!strict.has(u)) a2.add(u) }
      if (a1.size >= 2) second++; if (a2.size >= 2) secondStrict++
      /* positions (quote) : achat = ai payé (frais compris), reçu = ao (net de frais) ; jetons = ao (achat) / ai (vente) */
      const Pm = new Map()
      for (const x of L) { const u = deja.get(x.sig)?.payeur; if (!u || mainC.has(u)) continue
        const p = Pm.get(u) ?? Pm.set(u, { sl0: null, paye: 0, recu: 0, ach: 0, ven: 0, slV: null }).get(u)
        if (x.a) { p.sl0 ??= x.sl; p.paye += x.ai; p.ach += x.ao } else { p.recu += x.ao; p.ven += x.ai; p.slV = x.sl } }
      for (const p of Pm.values()) { if (p.sl0 === null || !p.paye) continue; const recu = p.ven > p.ach ? p.recu * p.ach / p.ven : p.recu
        pos.push({ age: (p.sl0 - ne.sl) * D, ferme: p.ven >= 0.95 * p.ach, det: p.slV !== null ? (p.slV - p.sl0) * D : null, r: (recu - p.paye) / p.paye, paye: p.paye }) }
      /* vente du créateur ≤ 3 s après un achat extérieur, témoin mêmes jetons sans achat extérieur */
      const ventesC = L.filter(x => !x.a && strict.has(deja.get(x.sig)?.payeur)).map(x => x.sl)
      let traite = false
      for (const x of L) { const age = (x.sl - ne.sl) * D; if (age < 10 || age > 120 || !x.a) continue; const u = deja.get(x.sig)?.payeur; if (!u || strict.has(u)) continue
        vc.nAch++; traite = true; if (ventesC.some(s => s > x.sl && s - x.sl <= W3)) vc.apresAch++ }
      if (traite) for (let age = 10; age <= 120; age += 10) { const s0 = ne.sl + Math.round(age / D)
        if (L.some(x => x.a && !strict.has(deja.get(x.sig)?.payeur) && x.sl <= s0 && s0 - x.sl <= W3)) continue
        vc.nTem++; if (ventesC.some(s => s > s0 && s - s0 <= W3)) vc.apresTem++ }
    }
    console.log(`\n── ${nomF} : ${n} pools · échanges identifiés ${lus}/${total} · second acheteur RÉEL ${pct(second / Math.max(1, n))} (strict ${pct(secondStrict / Math.max(1, n))})`)
    const AG = [[0, 5], [5, 20], [20, 60], [60, 300], [300, 1e9]]
    for (const [a, b] of AG) { const S = pos.filter(p => p.age >= a && p.age < b); const paye = S.reduce((s, p) => s + p.paye, 0)
      console.log(`   foule ${a}-${b >= 1e9 ? '∞' : b} s : ${S.length} positions · strict pondéré ${pct(paye ? S.reduce((s, p) => s + p.r * p.paye, 0) / paye : null)} · médiane ${pct(med(S.map(p => p.r)))} · gagnants ${pct(S.filter(p => p.r > 0).length / Math.max(1, S.length))}`) }
    for (const E of [10, 20, 30, 45, 60]) for (const H of [60, 120, 180, 240, 300]) {
      const S = pos.filter(p => p.ferme && Math.abs(p.age - E) <= 10 && p.det !== null && p.det >= H / 2 && p.det <= 2 * H).map(p => p.r)
      if (S.length >= 10) console.log(`   tiers E=${E} H=${H} : n=${S.length} moyenne ${pct(moy(S))} robuste ${pct(rob(S))} médiane ${pct(med(S))}`) }
    console.log(`   vente du créateur (élargie) ≤ 3 s après un achat extérieur : ${pct(vc.apresAch / Math.max(1, vc.nAch))} (n=${vc.nAch}) · témoin mêmes pools sans achat : ${pct(vc.apresTem / Math.max(1, vc.nTem))} (n=${vc.nTem})`)
  }
}

if (MODE === 'll-identite') {
  const iso2s = (x) => Date.parse(x.endsWith('Z') ? x : x + 'Z') / 1000
  const DEBUT = iso2s(arg('debut', '2026-10-04T23:00')), FIN = iso2s(arg('fin', '2026-10-05T17:00'))
  const cotes = JSON.parse(readFileSync(arg('ll-cotes'), 'utf8'))
  const fichiers = []
  for (const j of readdirSync(DIR).filter(x => /^\d{4}-\d\d-\d\d$/.test(x)).sort())
    for (const f of readdirSync(`${DIR}/${j}`).filter(x => /^\d\d\.jsonl\.zst$/.test(x)).sort()) { const t0 = iso2s(`${j}T${f.slice(0, 2)}:00`); if (t0 + 3600 > DEBUT && t0 < FIN + 3600) fichiers.push(`${DIR}/${j}/${f}`) }
  const nes = new Map(), lot = []
  let calS = null, calSl = null
  for (const f of fichiers) for await (const l of lignes(f)) {
    if (l.includes('"p":"pf"') && calS === null) { const e = JSON.parse(l); if (e.s) { calS = e.s; calSl = e.sl } }
    if (!l.includes('"p":"ll"')) continue
    const e = JSON.parse(l)
    if (e.e === 'C') { if (cotes[e.ps]?.cote === 'So11111111111111111111111111111111111111112') nes.set(e.ps, { sl: e.sl, cr: e.cr, sig: e.sig }); continue }
    const n = nes.get(e.ps); if (!n) continue
    const t = calS + (n.sl - calSl) * D; if (t < DEBUT || t > FIN - 900) continue
    if ((e.sl - n.sl) * D <= 60) lot.push({ sig: e.sig, ps: e.ps, sl: e.sl, a: e.a, ai: e.ai, ao: e.ao, slNe: n.sl, cr: n.cr })
  }
  const deja = new Set(existsSync(SORTIE) ? readFileSync(SORTIE, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l).sig) : [])
  const aFaire = [...new Map(lot.filter(x => !deja.has(x.sig)).map(x => [x.sig, x])).values()]
  console.log(`pools LaunchLab/SOL nés dans la fenêtre : ${new Set(lot.map(x => x.ps)).size} · échanges des 60 premières s : ${lot.length} · transactions à lire : ${aFaire.length} (déjà lues : ${deja.size})`)
  for (const x of aFaire) {
    const { r, erreur } = await getTx(x.sig)
    if (!r) { appendFileSync(SORTIE, JSON.stringify({ sig: x.sig, erreur: erreur ?? 'introuvable' }) + '\n'); continue }
    const t = lireTx(r)
    appendFileSync(SORTIE, JSON.stringify({ sig: x.sig, signataires: t.signataires, payeur: t.payeur, frais: t.frais }) + '\n')
  }
  /* second acheteur réel : ≥ 2 signataires distincts (créateur exclu) parmi les ACHATS des 60 premières s */
  const id = new Map(readFileSync(SORTIE, 'utf8').trim().split('\n').map(l => JSON.parse(l)).filter(x => !x.erreur).map(x => [x.sig, x]))
  const parPool = new Map(); for (const x of lot) (parPool.get(x.ps) ?? parPool.set(x.ps, []).get(x.ps)).push(x)
  let n = 0, second = 0, secondStrict = 0, lus = 0
  for (const [ps, L] of parPool) {
    n++; const cr = L[0].cr, slNe = L[0].slNe
    const crSig = new Set(); for (const x of L) if (x.sl === slNe) for (const s of id.get(x.sig)?.signataires ?? []) crSig.add(s)
    const a1 = new Set(), a2 = new Set()
    for (const x of L) { if (!x.a) continue; const t = id.get(x.sig); if (!t) continue; lus++
      const s = t.payeur; if (s === cr || t.signataires.includes(cr)) continue; a1.add(s); if (!crSig.has(s)) a2.add(s) }
    if (a1.size >= 2) second++; if (a2.size >= 2) secondStrict++
  }
  console.log(`second acheteur RÉEL (signataires distincts, créateur exclu, 60 s) : ${second}/${n} = ${(100 * second / Math.max(1, n)).toFixed(1)} % · strict (hors signataires du slot de création) : ${(100 * secondStrict / Math.max(1, n)).toFixed(1)} % · achats identifiés ${lus}`)
}
