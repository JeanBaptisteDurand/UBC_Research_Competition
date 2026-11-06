# F14 / Fig. 5 — le chemin daté vers la cible : événements publics (prints, unlocks, fin du rachat) et niveaux de la grille (p. 4).
# Lancer depuis research-competition/ : .venv/bin/python figures/fig14.py
# Événements = repères numérotés ①–④ posés au-dessus de l'axe des x (clé en haut du cadre) : aucun texte ne croise la ligne du stop.
from datetime import date
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt, matplotlib.dates as mdates, matplotlib.ticker as mt
INK='#1f2937'; RED='#b91c1c'; GREY='#9ca3af'; LIGHT='#e5e7eb'; DARK='#4b5563'; MUTED='#6b7280'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':8.5,'axes.edgecolor':INK,'axes.labelcolor':INK,'xtick.color':INK,'ytick.color':INK,'axes.spines.top':False,'axes.spines.right':False})
D=lambda y,m,d: date(y,m,d)
fig, ax = plt.subplots(figsize=(7.2, 2.3))
x0, x1 = D(2026,10,15), D(2027,5,12)
# niveaux de la grille et du plan (valeurs × 1000 = $ par jeton) — inchangés
path=[(D(2026,10,21),4.7),(D(2026,11,23),4.1),(D(2026,12,1),3.5),(D(2027,2,12),2.8),(D(2027,4,28),2.2)]
ax.plot([p[0] for p in path],[p[1] for p in path], color=INK, lw=1.5, ls='--', marker='o', ms=4.5, zorder=3)
lab=[(D(2026,10,21),4.7,'today: \\$0.0047',(-2,-8),'top','left'),
     (D(2026,11,23),4.1,'\\$0.0041 = last full week',(6,4),'bottom','left'),
     (D(2026,12,1),3.5,'1st third: \\$0.0035',(9,-7),'top','left'),
     (D(2027,2,12),2.8,'2nd third \\$0.0028\n(3.2× on base revenue)',(0,9),'bottom','center'),
     (D(2027,4,28),2.2,'balance: target \\$0.0022\n(2.6× on base)',(8,9),'bottom','right')]
for d,v,t,off,va,ha in lab: ax.annotate(t,(d,v),xytext=off,textcoords='offset points',ha=ha,va=va,fontsize=7.3,color=INK,zorder=4)
# zone d'entrée (les deux derniers tiers, sur rebond jusqu'au 16/11)
ax.fill_between([D(2026,10,21),D(2026,11,16)],5.5,6.0,color=GREY,alpha=0.35,lw=0,zorder=1)
ax.text(D(2026,10,21),6.15,'entry, last two thirds',fontsize=7,color=DARK,va='bottom',ha='left')
# stop catastrophe : ligne rouge pointillée, étiquette au-dessus, rien ne la traverse
ax.axhline(10.0,color=RED,lw=1,ls=':')
ax.text(D(2026,10,17),10.15,'catastrophe stop: PUMP/SOL ×2 from entry ≈ \\$0.0094–0.0106 (SOL flat)',va='bottom',fontsize=7,color=INK)
# événements publics : repères numérotés au-dessus de l'axe (prints en haut, offre en bas, pour ne jamais se chevaucher)
EV={'①':[D(2026,11,2),D(2026,11,9),D(2026,11,16),D(2026,11,23)], '②':[D(2026,12,1)],
    '③':[D(2026,11,12),D(2026,12,12),D(2027,1,12),D(2027,2,12),D(2027,3,12),D(2027,4,12)], '④':[D(2027,4,28)]}
for k,ds in EV.items():
    top = 1.35 if k in '①②' else 0.45
    for d in ds:
        ax.plot([d,d],[0,top],color=GREY,lw=0.8,zorder=2,solid_capstyle='butt')
        ax.text(d,top+0.08,k,ha='center',va='bottom',fontsize=8,color=DARK)
key=[(D(2026,10,17),9.0,'① weekly prints Nov 2, 9, 16, 23'),(D(2027,1,22),9.0,'② Nov monthly print (Dec 1)'),
     (D(2026,10,17),7.95,'③ unlocks: 6.875B on the 12th of each month (from Nov 12)'),(D(2027,1,22),7.95,'④ buyback programme ends Apr 28')]
for d,y,t in key: ax.text(d,y,t,ha='left',va='center',fontsize=6.8,color=DARK)
ax.set_xlim(x0,x1); ax.set_ylim(0,11.6); ax.set_ylabel('PUMP price ($)')
ax.yaxis.set_major_formatter(mt.FuncFormatter(lambda y,_: f'{y/1000:.4f}')); ax.set_yticks([2,4,6,8,10])
ax.xaxis.set_major_locator(mdates.MonthLocator()); ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
ax.set_title("The path, dated: public events and the grid's levels", loc='left', fontsize=10.5, fontweight='bold', color=INK, pad=8)
fig.text(0.012,0.012,"Levels: sensitivity grid (Investment proposal 1) and trade plan. Dates: DefiLlama weekly and monthly prints, Blockworks vesting schedule,\nbuyback policy (to Apr 28, 2027). The dashed line is a reading order, not a forecast of timing; any stop reading ends the path.",fontsize=6.8,color=MUTED,ha='left',va='bottom')
fig.subplots_adjust(left=0.11,right=0.985,top=0.875,bottom=0.215); fig.savefig('figures/fig5_path.png',dpi=220,bbox_inches='tight'); print('ok fig5_path.png')
