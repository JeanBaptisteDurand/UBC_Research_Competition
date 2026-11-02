/* PUBLIC EVENT SIGNATURES: the 64-hex constants below are keccak-256 hashes of public EVM event signatures
 * (e.g. Transfer, PairCreated), not keys or secrets. */
/* TOPICS PARTAGÉS par le collecteur, l'enrichisseur, le tableau de bord et le rejeu — UNE seule source.
 *
 * Chacun est VÉRIFIÉ sur une chaîne où il abonde, sauf mention contraire. Un topic faux rend un zéro
 * CONFIANT que rien ne détecte ([[topics-v4-verifies-contre-la-chaine]]). Le nom court sert de clé
 * à l'histogramme par TYPE écrit dans la couverture : c'est lui qui rend visible l'arrêt PARTIEL d'un
 * flux (la collecte des swaps v4 de ponsmeta s'est arrêtée seule vers le 17/09, deux semaines avant le
 * reste, et personne ne l'a vu parce que le tableau de bord comptait par chaîne, pas par type). */
export const DEX = {
  /* Uniswap et forks — vérifiés */
  v2Cree:  '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9', /* v2 PairCreated */
  v3Cree:  '0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118', /* v3 PoolCreated */
  v4Init:  '0xdd466e674ea557f56295e2d0218a125ea4b4f0f6f3307b95f85e6110838d6438', /* v4 Initialize */
  v2Swap:  '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
  v3Swap:  '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67', /* aussi Algebra et Slipstream */
  v4Swap:  '0x40e9cecb9f5f1f1c5b9c97dec2917b7ee92e57ba5563708daca94dd84ad7112f',
  v2Sync:  '0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1', /* Sync(uint112,uint112), PAS celui de solidly */
  v3Mint:  '0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde',
  v3Burn:  '0x0c396cd989a39f4459b5fa1aed6a9a8dcdbc45908acfd67e028cd568da98982c',
  v4Liq:   '0xf208f4912782fd25c7f114ca3723a2d5dd6f3bcc3ac8db5af63baa85f711d5ec', /* v4 ModifyLiquidity */
  /* Solidly (Aerodrome, Velodrome) — vérifiés sur Base le 04/10 */
  solSwap: '0xb3e2773606abfd36b5bd91394b3a54d1398336c65005baf7bf7a05efeffaf75b',
  solCree: '0x2128d88d14c80cb081c1252a5acff7a264671bf199ce226b53788fb26065005e',
  clCree:  '0xab0d57f0df537bb25e80245ef7748fa62353808c54d6e528a9dd20887aed9ac2', /* Slipstream / CL PoolCreated */
  solSync: '0xcf2aa50876cdfbb541206f89af0ee78d44a2abf8d328e37fa4917f982149848a', /* Sync(uint256,uint256) */
  solBurn: '0x5d624aa9c148153ab3446c1b154f660ee7701e549fe9b62dab7171b1c80e6fa2',
  /* v2 Mint : VÉRIFIÉ le 04/10 dans nos propres données — 4 089 logs/h sur Optimism, 364 sur Base,
   * 1 topic indexé (sender) + 2 mots (amount0, amount1) : la structure standard. */
  v2Mint:  '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f',
  v2Burn:  '0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496',
  /* NON VÉRIFIÉS — aucun log sur l'heure échantillonnée des 32 chaînes (créations rares) : à confirmer
   * par leur premier log. Tant qu'ils ne sont pas vus, un zéro sur eux ne prouve RIEN. */
  solPaire:  '0xc4805696c66d7cf352fc1d6bb633ad5ee82f6cb577c453024b6e0eb8306c6fc9', /* solidly PairCreated (anciens forks) */
  algPool:   '0x91ccaa7a278130b65168c3a0c8d3bcae84cf5e43704342bd3ec0b59e59c036db', /* Algebra Pool */
  algCustom: '0x8a5f030f5fc13b04a1e4ef7c47177e3d76b0e80e1d9be9843db37caa5b7b9b8f', /* Algebra CustomPool */
  /* AJOUTÉS le 04/10, vérifiés sur des logs réels décodés (agent de vérification Tron/BSC, puis keccak recalculé) :
   * ⚠ SunSwap v3 (Tron) a un PoolCreated DIFFÉRENT d'Uniswap (un uint256 en plus) : avec le seul topic Uniswap,
   * le collecteur rendait un zéro CONFIANT sur les créations v3 de Tron. */
  sunV3Cree: '0x20a108faf9dc51ca2b459a109d08568e65a9cb87569b6b3a334c275d504ff94f', /* PoolCreated(address,address,uint24,int24,address,uint256) */
  /* PancakeSwap v3 : Swap avec protocolFeesToken0/1 en plus → autre topic ; les 5 premiers mots sont ceux de v3 */
  pcsV3Swap: '0x19b47279256b2a23a1665c810c8d55a1758940ee09377d4f8d26497a3577dc83',
  /* PancakeSwap Infinity (BSC) : CLPoolManager 0xa0ffb9c1…, BinPoolManager 0xc697d289… — ModifyLiquidity a le MÊME
   * topic que v4 : on distingue par l'émetteur */
  infClInit:  '0x426cc62fe6a33a40ba2788c2c87a9c34ee4582b95bc9fa5a7bb7ae70b750b99c', /* Initialize(id,c0,c1,hooks,fee,parameters,sqrtP,tick) */
  infClSwap:  '0x04206ad2b7c0f463bff3dd4f33c5735b0f2957a351e4f79763a4fa9e775dd237', /* Swap(id,sender,a0,a1,sqrtP,L,tick,fee,protocolFee) */
  infBinInit: '0xddfde5903015c0eb1671976c6c8f760f1328bec57f15286b6bdab2f955cab9c9',
  infBinSwap: '0x3e8aae37f890eb1f9d63dd4d2062f3f0be757848a0f0760e4f3e53dad556e861',
  infBinMint: '0x7b6bc49b385af8644341f07a67cd976bf9daf2bdd5d71668e651a3a792e318e1',
  infBinBurn: '0x16d40aa4e497175b58e47cbf101544758de8c01d92a760c738943044c758df8a',
}
/* LAUNCHPAD PONS — topics de l'ancien collecteur (src/chain.mjs), REVÉRIFIÉS sur Robinhood le 04/10 :
 * sur 60 000 blocs, TokenLaunched 439 (3 émetteurs : l'usine Pons 0x7ed598bc et DEUX AUTRES,
 * 0x95c87ce5 et 0x04e2343d, même signature), CurveBuy 9 858 (574 courbes), CurveSell 7 811,
 * FeesSwept 1 605, PoolGraduated/Locked/Swept/CurveCompleted/Refunded/PoolRegistered 4 chacun.
 * Sur ARC : 0 log sur 20 000 blocs (canari : 1 698 swaps v4 sur la même plage) — le launchpad Argus
 * n'émet PAS ces signatures. Comme la liste est globale, tout clone sur une autre chaîne sort tout
 * seul : c'est la veille « chaîne n°3 » (alerte dans etat.json et le journal).
 * ⚠ Les pools gradués Pons sont v4 fee 0, tickSpacing 200, hook memeHook 0xe5e7… : ce n'est PAS la
 * famille v4|2500|sans hook qui paie nos bots. */
export const PONS = {
  TokenLaunched:  '0x8d4aad4953d0ca700d468f3753aa14432d1b35b43ec6409f051fb6aa43a89607',
  PoolGraduated:  '0x0a44ef75df69c534f43cd6c1aa3ef8983065fe5fe79ef9e79f6494e6f258c259',
  GradLocked:     '0xa0a18f5bf205becee8b268d7cf69addab8548ae8ef361791464cf0e0e17c1361', /* GraduationTokensPermanentlyLocked */
  LaunchSwept:    '0xcdb72f157fd3666758a6ce201387ffb52038c7562e4fff352828da1096c4b6b4',
  CreatorFeeRcpt: '0x308c390ed1ab5873392818e036cabdf408bc8ad042fbaead3108954ff75ba980', /* CreatorFeeRecipientUpdated */
  CurveBuy:       '0xec36bf571f136799e8dc0b0b8bea4b04d8bd3d43de838aab0d5fc21d4cbfc455',
  CurveSell:      '0x8113d738abdcb6b38357e9d53a54a7157861a09031b453651f0fe7fe151f59df',
  CurveCompleted: '0xf8d37a90738ae063b8b8058b66f5880cf3cf7ab0c5d4fa78219696591dfbfb67',
  CurveRefunded:  '0xa69e8258ccc7b9bbb70ab953fc2d1062b4ee28b8ca827534097e1732e87b0262', /* CurveBuyRefunded */
  FeesSwept:      '0x9f4cd7c4ed99d08a797804560c9c5d71d2cf7e101f2e3b5e7d1ca8a24c370e4f',
  PoolRegistered: '0x01bf263a1db1652580721573296e1a1fa70b3d4c87f61d02a69c4e1109d2d573',
}
/* AUTRES LAUNCHPADS À COURBE — vérifiés sur des logs réels décodés le 04/10 (aucun paramètre indexé chez four.meme
 * et Flap : tout est dans les données). Chacun a sa chaîne d'origine ; vu ailleurs = clone, alerte. */
export const LAUNCHPADS = {
  sunpump: { maison: 'tron', topics: {          /* proxy 0xc22dd1b7…, migre vers SunSwap v2 (~4 jetons/jour : marché quasi mort) */
    sunpumpCree:  '0x1ff0a01c8968e3551472812164f233abb579247de887db8cbb18281c149bee7a', /* TokenCreate(address,uint256,address) */
    sunpumpAchat: '0x63abb62535c21a5d221cf9c15994097b8880cc986d82faf80f57382b998dbae5', /* TokenPurchased(token↑,buyer↑,trx,fee,tokens,reserve) */
    sunpumpVente: '0x9387a595ac4be9038bbb9751abad8baa3dcf219dd9e19abb81552bd521fe3546', /* TokenSold(token↑,seller↑,trx,fee,tokens) */
    sunpumpLance: '0x2ab676eef3f76f1bd4e765a352c6cd81e62702f7ad3d363291c8b60582a45250' } }, /* TokenLaunched(token↑) */
  fourmeme: { maison: 'bsc', topics: {          /* TokenManager2 0x5c952063… ; cotation BNB, USDT, USD1… à résoudre jeton par jeton */
    fourCree:  '0x396d5e902b675b032348d3d2e9517ee8f0c4a926603fbc075d3d282ff00cad20',
    fourAchat: '0x7db52723a3b2cdd6164364b3b766e65e540d7be48ffa89582956d8eaebe62942', /* TokenPurchase(token,account,price,amount,cost,fee,offers,funds) */
    fourVente: '0x0a5575b3648bae2210cee56bf33254cc1ddfbc7bf637c0af2ac18b14fb1bae19',
    fourLiq:   '0xc18aa71171b358b706fe3dd345299685ba21a5316c66ffa9e319268b033c44b0' } }, /* LiquidityAdded : la graduation */
  flap: { maison: 'bsc', topics: {              /* Portal 0xe2ce6ab8… — second launchpad actif de BSC */
    flapCree:  '0x504e7f360b2e5fe33cbaaae4c593bc55305328341bf79009e43e0e3b7f699603',
    flapAchat: '0xa800a2038683844fac66747f771bfdfae862eb28b16bcfa387afa9fbacce8ff7', /* TokenBought(ts,token,buyer,amount,eth,fee,postPrice) */
    flapVente: '0x03a4693e592f5e75dc7c136acb39b146d2b4966c0e509c34f362dee02b3b861a',
    flapDex:   '0x6e4f47630b8745b8cacbd44f42a8a33e7eea7cc08ef22fc7630f4f385784ff7d' } },
  pons: { maison: 'robinhood', topics: {} },   /* rempli ci-dessous avec PONS */
}

/* LE SIGNAL DE NAISSANCE UNIVERSEL : tout mint ERC-20 depuis 0x0, quelle que soit la rampe. Requête
 * SÉPARÉE (filtre en position 1). Vérifié sur Base : 2 927 mints de 248 émetteurs en 800 s. */
export const TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
export const ZERO32 = '0x' + '0'.repeat(64)
LAUNCHPADS.pons.topics = PONS
const TOUS_LP = Object.values(LAUNCHPADS).flatMap(l => Object.entries(l.topics))
export const TOPICS = [...new Set([...Object.values(DEX), ...TOUS_LP.map(x => x[1])])]
export const NOM = Object.fromEntries([...Object.entries(DEX), ...TOUS_LP].map(([k, v]) => [v, k]))
/* topic → { launchpad, maison } pour la veille des clones */
export const ORIGINE_LP = Object.fromEntries(Object.entries(LAUNCHPADS).flatMap(([lp, l]) => Object.values(l.topics).map(t => [t, { lp, maison: l.maison }])))
NOM[TRANSFER] = 'mint20'
export const NON_VERIFIES = new Set(['solPaire', 'algPool', 'algCustom'])
export const NON_VERIFIES_SIGNE = new Set(['infClSwap'])   /* sens du delta Infinity supposé = v4 (delta du trader), non vérifié */
export const CREATIONS = new Set(['v2Cree', 'v3Cree', 'v4Init', 'solCree', 'clCree', 'solPaire', 'algPool', 'algCustom', 'sunV3Cree', 'infClInit', 'infBinInit',
  'TokenLaunched', 'sunpumpCree', 'fourCree', 'flapCree'])
export const SWAPS = new Set(['v2Swap', 'v3Swap', 'v4Swap', 'solSwap', 'pcsV3Swap', 'infClSwap', 'infBinSwap'])
export const LIQUIDITE = new Set(['v2Sync', 'solSync', 'v3Mint', 'v3Burn', 'v4Liq', 'v2Mint', 'v2Burn', 'solBurn', 'infBinMint', 'infBinBurn'])
/* échanges sur COURBE : toujours résolus (émetteur réel), c'est le cœur des marchés de lancement */
export const COURBE = new Set(['CurveBuy', 'CurveSell', 'sunpumpAchat', 'sunpumpVente', 'fourAchat', 'fourVente', 'flapAchat', 'flapVente'])

const adr = (h) => '0x' + h.slice(-40).toLowerCase()
const mot = (d, i) => d.slice(2 + i * 64, 2 + (i + 1) * 64)
/* CLÉ DU POOL ET JETONS d'un événement de création — même logique partout (collecteur, rejeu). */
export function creation(e) {
  const n = NOM[e.k[0]], d = e.d
  switch (n) {
    case 'v4Init':  return { n, cle: e.k[1].toLowerCase(), t0: adr(e.k[2]), t1: adr(e.k[3]), mgr: e.a.toLowerCase() }
    case 'v3Cree':  return { n, cle: adr(mot(d, 1)), t0: adr(e.k[1]), t1: adr(e.k[2]), mgr: e.a.toLowerCase() }
    /* SunSwap v3 : VÉRIFIÉ le 04/10 sur le log réel du bloc 86736580 (tx 0x827d8f59…) : token0, token1, fee (3000)
     * indexés ; données = tickSpacing (60), pool, index du pool (570) → pool en mot 1, comme v3 */
    case 'sunV3Cree': return e.k.length >= 4 ? { n, cle: adr(mot(d, 1)), t0: adr(e.k[1]), t1: adr(e.k[2]), mgr: e.a.toLowerCase() } : null
    case 'infClInit': case 'infBinInit': return { n, cle: e.k[1].toLowerCase(), t0: adr(e.k[2]), t1: adr(e.k[3]), mgr: e.a.toLowerCase() }
    case 'v2Cree':  return { n, cle: adr(mot(d, 0)), t0: adr(e.k[1]), t1: adr(e.k[2]), mgr: e.a.toLowerCase() }
    case 'solCree': return { n, cle: adr(mot(d, 0)), t0: adr(e.k[1]), t1: adr(e.k[2]), mgr: e.a.toLowerCase() }
    case 'clCree':  return { n, cle: adr(mot(d, 0)), t0: adr(e.k[1]), t1: adr(e.k[2]), mgr: e.a.toLowerCase() }
    case 'algPool': return { n, cle: adr(mot(d, 0)), t0: adr(e.k[1]), t1: adr(e.k[2]), mgr: e.a.toLowerCase() }
    case 'algCustom': return e.k.length >= 4 ? { n, cle: adr(mot(d, 0)), t0: adr(e.k[2]), t1: adr(e.k[3]), mgr: e.a.toLowerCase() } : null
    /* Velodrome v1 : `stable` N'EST PAS indexé → pair en mot 1 ; certaines versions l'indexent → mot 0 */
    case 'solPaire': return e.k.length >= 4 ? { n, cle: adr(mot(d, 0)), t0: adr(e.k[1]), t1: adr(e.k[2]), mgr: e.a.toLowerCase() }
                                            : { n, cle: adr(mot(d, 1)), t0: adr(e.k[1]), t1: adr(e.k[2]), mgr: e.a.toLowerCase() }
    /* Pons : le « pool » de la phase courbe est le contrat de courbe propre au jeton (émetteur des CurveBuy) */
    /* 06/10 16:25 UTC : 0x059c45db… émet la même signature avec 3 topics seulement (bloc 81769564) — ce n'est
     * pas l'usine Pons, et lire k[3] faisait planter TOUTE la collecte de Robinhood en boucle pendant 2 h. */
    case 'TokenLaunched': return e.k.length >= 4 ? { n, cle: adr(e.k[2]), t0: adr(mot(d, 0)), t1: adr(e.k[1]), mgr: e.a.toLowerCase(), deployeur: adr(e.k[3]) } : null
    /* courbes sans pool propre : la clé est le jeton (les achats le portent dans leurs données) */
    case 'sunpumpCree': return { n, cle: adr(mot(d, 0)), t0: '0x0000000000000000000000000000000000000000', t1: adr(mot(d, 0)), mgr: e.a.toLowerCase() }
    case 'fourCree': return { n, cle: adr(mot(d, 1)), t0: '0x0000000000000000000000000000000000000000', t1: adr(mot(d, 1)), mgr: e.a.toLowerCase() }
    case 'flapCree': return { n, cle: adr(mot(d, 3)), t0: '0x0000000000000000000000000000000000000000', t1: adr(mot(d, 3)), mgr: e.a.toLowerCase() }
  }
  return null
}
/* clé du pool touché par un événement de vie (swap, liquidité) */
export const clePool = (e) => {
  const n = NOM[e.k[0]]
  if (n === 'v4Swap' || n === 'v4Liq' || n === 'infClSwap' || n === 'infBinSwap' || n === 'infBinMint' || n === 'infBinBurn') return e.k[1].toLowerCase()
  return e.a.toLowerCase()
}
