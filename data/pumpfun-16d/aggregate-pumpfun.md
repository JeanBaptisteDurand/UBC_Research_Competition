# pump.fun/SOL — 16 jours (2026-10-05 → 2026-10-20), 384 h, outil `solana-courbes.mjs` inchangé, un passage par jour

- Couverture : 10 minute sans source sur 23040 ; canari pump.fun moyen 0.9941 (pire jour 0.9830).
- Lu : 68,043,427 transactions (dont ~1 h/25 lue deux fois → ≈ 65,321,690 distinctes) ; ~198,241 comptes lus par jour.
- Jetons nés : 395,253 = **1,029/h** ; gradués 9,916 = **2.5 %** ; sans aucun échange **12.4 %** (jour min 8.1 %, max 15.2 %).
- Second acheteur (60 s, créateur exclu) **51.3 %** ; strict 44.6 % ; strict et achats ≥ 0,01 SOL 41.8 %.
- Foule entrée 20-60 s, jetons non gradués : **1,691,317 positions, médiane -17.4 %**, pondérée par la mise -16.3 %, gagnants 25.2 % ; médiane par jour entre -25.6 % et -12.3 % ; **16/16 jours négatifs**.
- Foule tous âges, non gradués : 9,679,744 positions, médiane -13.3 %, gagnants 26.3 %.
- **Confiance** (20-60 s) : IC95 de la médiane [-17.5 % ; -17.3 %] ; moyenne -24.3 % IC95 [-24.4 % ; -24.3 %] ; positions perdantes 74.8 % ; test du signe : 16/16 jours négatifs (p = 1.5e-05), 384/384 heures (p = 2.5e-116).
- Main du créateur : payé 941,338 SOL, reçu 669,824 SOL → **-28.8 %** (ventes après graduation invisibles).
- Rejeu E=60/H=60 au prix marginal : médiane par jour entre -2.5 % et -2.5 % (les frais d'un aller-retour ≈ 2,5 %) ; net robuste à 0,01 SOL négatif 16/16 jours ; marche avant (2de moitié de chaque jour) entre -8.0 % et -6.9 %.
- Heure par heure : **384/384 heures** à médiane négative (robuste négative 384/384).
- Tiers au timing (meilleure case du jour) : robuste négative 16/16 jours ; meilleur robuste -9.4 %, meilleure médiane -3.0 %.
- Vente du créateur ≤ 3 s après un petit achat vs témoin : ×1.8 à ×4.6 (avec le slot de création ×4.7 à ×10.4).
- Témoin positif (gradués, prix naissance→fin de courbe) : ×14.70 à ×14.70 (théorie ×14,7).
- Adresses de la foule (pf|SOL, toutes positions) : 1,129,662 distinctes sur la fenêtre.
- Rétention des cohortes de NOUVELLES adresses (part revue le lendemain / dans les 7 jours) : 10-05 n=175,959 r1=31.2 % r7=60.8 % ; 10-06 n=118,629 r1=14.1 % r7=29.9 % ; 10-07 n=111,716 r1=9.9 % r7=23.1 % ; 10-08 n=98,780 r1=9.4 % r7=18.3 % ; 10-09 n=103,285 r1=7.5 % r7=15.4 % ; 10-10 n=42,810 r1=15.5 % r7=29.6 % ; 10-11 n=33,363 r1=16.3 % r7=30.2 % ; 10-12 n=98,451 r1=6.0 % r7=11.2 % ; 10-13 n=71,322 r1=7.0 % r7=12.7 %

| jour | jetons | /h | second ach. | gradués | sans éch. | pos. 20-60 s | médiane 20-60 s | gagnants | créateur | rejeu 60/60 méd. | tiers meilleur rob. | adresses actives | nouvelles (fenêtre) | nouvelles (vs 7 j préc.) | canari |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-10-05 | 35,757 | 1,506 | 52.7 % | 2.3 % | 15.2 % | 135,756 | -15.4 % | 26.6 % | -21.0 % | -2.5 % | -12.2 % | 175,959 | 175,959 | — | 1.000 |
| 2026-10-06 | 33,169 | 1,397 | 50.8 % | 2.5 % | 13.7 % | 128,327 | -16.0 % | 25.9 % | -30.5 % | -2.5 % | -13.6 % | 173,473 | 118,629 | — | 0.989 |
| 2026-10-07 | 32,926 | 1,386 | 50.9 % | 2.6 % | 14.7 % | 133,851 | -18.8 % | 24.6 % | -29.5 % | -2.5 % | -14.2 % | 182,903 | 111,716 | — | 1.000 |
| 2026-10-08 | 31,193 | 1,313 | 50.3 % | 2.5 % | 11.7 % | 120,861 | -17.5 % | 24.6 % | -29.0 % | -2.5 % | -12.0 % | 167,671 | 98,780 | — | 0.994 |
| 2026-10-09 | 28,379 | 1,195 | 53.2 % | 2.7 % | 8.9 % | 145,381 | -21.1 % | 24.3 % | -30.8 % | -2.5 % | -17.3 % | 176,666 | 103,285 | — | 0.996 |
| 2026-10-10 | 27,433 | 1,155 | 43.1 % | 2.5 % | 14.8 % | 98,518 | -12.3 % | 29.0 % | -35.4 % | -2.5 % | -13.4 % | 106,895 | 42,810 | — | 0.994 |
| 2026-10-11 | 24,075 | 1,014 | 48.2 % | 2.6 % | 14.7 % | 104,688 | -12.9 % | 28.0 % | -32.2 % | -2.5 % | -12.8 % | 104,792 | 33,363 | — | 1.000 |
| 2026-10-12 | 28,061 | 1,182 | 48.3 % | 2.4 % | 14.2 % | 132,711 | -21.0 % | 23.5 % | -21.1 % | -2.5 % | -15.8 % | 174,699 | 98,451 | 98,451 | 0.999 |
| 2026-10-13 | 22,954 | 966 | 53.4 % | 2.9 % | 9.9 % | 111,650 | -16.5 % | 25.6 % | -27.3 % | -2.5 % | -19.5 % | 138,335 | 71,322 | 72,409 | 0.999 |
| 2026-10-14 | 21,548 | 907 | 56.6 % | 2.9 % | 8.1 % | 114,344 | -18.6 % | 24.3 % | -31.3 % | -2.5 % | -17.3 % | 153,530 | 79,360 | 86,374 | 1.000 |
| 2026-10-15 | 19,151 | 806 | 54.6 % | 2.5 % | 10.0 % | 89,545 | -19.7 % | 23.8 % | -27.5 % | -2.5 % | -12.9 % | 125,046 | 44,050 | 65,484 | 0.996 |
| 2026-10-16 | 20,040 | 844 | 54.2 % | 2.4 % | 11.3 % | 90,855 | -18.3 % | 25.1 % | -25.3 % | -2.5 % | -12.6 % | 118,034 | 34,806 | 62,486 | 0.992 |
| 2026-10-17 | 18,859 | 794 | 50.0 % | 2.6 % | 11.9 % | 68,669 | -12.7 % | 27.7 % | -37.7 % | -2.5 % | -9.5 % | 80,271 | 24,427 | 27,886 | 0.988 |
| 2026-10-18 | 18,515 | 780 | 52.7 % | 2.3 % | 11.6 % | 75,110 | -14.0 % | 26.9 % | -27.7 % | -2.5 % | -9.4 % | 78,209 | 21,414 | 25,768 | 0.986 |
| 2026-10-19 | 16,456 | 693 | 54.5 % | 2.1 % | 10.9 % | 67,952 | -25.3 % | 21.7 % | -27.6 % | -2.5 % | -14.8 % | 107,945 | 34,143 | 54,879 | 0.989 |
| 2026-10-20 | 16,737 | 705 | 50.4 % | 2.1 % | 11.7 % | 73,099 | -25.6 % | 21.4 % | -28.7 % | -2.5 % | -18.1 % | 107,992 | 37,147 | 57,535 | 0.983 |
