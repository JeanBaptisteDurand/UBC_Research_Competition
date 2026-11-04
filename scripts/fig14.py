# F14 / Fig. 6 — le chemin daté vers la cible : événements publics (prints, unlocks, fin du rachat) et niveaux de la grille (p. 4).
# Lancer depuis research-competition/ : .venv/bin/python figures/fig14.py
from datetime import date
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt, matplotlib.dates as mdates
INK='#1f2937'; RED='#b91c1c'; GREY='#9ca3af'; LIGHT='#e5e7eb'; DARK='#4b5563'; MUTED='#6b7280'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':8.5,'axes.edgecolor':INK,'axes.labelcolor':INK,'xtick.color':INK,'ytick.color':INK,'axes.spines.top':False,'axes.spines.right':False})
D=lambda y,m,d: date(y,m,d)
fig, ax = plt.subplots(figsize=(7.2, 1.46))
x0, x1 = D(2026,10,15), D(2027,5,12); span=(x1-x0).days
f=lambda d: (d-x0).days/span
path=[(D(2026,10,21),4.7),(D(2026,11,23),4.1),(D(2026,12,1),3.5),(D(2027,2,12),2.8),(D(2027,4,28),2.2)]
ax.plot([p[0] for p in path],[p[1] for p in path], color=INK, lw=1.5, ls='--', marker='o', ms=4.5, zorder=3)
lab=[(D(2026,10,21),4.7,'today\n\\$0.0047',(-2,-9),'top','left'),(D(2026,11,23),4.1,'\\$0.0041 = last full week',(6,4),'bottom','left'),(D(2026,12,1),3.5,'1st third\n\\$0.0035',(0,-9),'top','center'),(D(2027,2,12),2.8,'2nd third \\$0.0028\n(3.2× on base revenue)',(0,9),'bottom','center'),(D(2027,4,28),2.2,'balance: target \\$0.0022\n(2.6× on base)',(0,9),'bottom','center')]
for d,v,t,off,va,ha in lab: ax.annotate(t,(d,v),xytext=off,textcoords='offset points',ha=ha,va=va,fontsize=7.3,color=INK)
ax.axhspan(5.5,6.0,xmin=f(D(2026,10,21)),xmax=f(D(2026,11,16)),color=LIGHT,zorder=1); ax.text(D(2026,10,17),6.2,'entry zone, last two thirds',fontsize=7,color=DARK,va='center')
ax.axhline(10.0,color=RED,lw=1,ls=':'); ax.text(D(2026,10,17),10.1,'catastrophe stop: PUMP/SOL ×2 from entry ≈ \\$0.0094–0.0106 (SOL flat)',va='bottom',fontsize=7,color=RED)
ev=[(D(2026,11,2),D(2026,11,12),'weekly prints\nNov 2, 9, 16, 23',7.7,'center'),(D(2026,12,1),D(2026,12,3),'Nov monthly\nprint (Dec 1)',7.7,'left'),(D(2027,1,12),D(2027,1,25),'unlocks: 6.875B on the 12th\nof each month (from Nov 12)',7.7,'center'),(D(2027,4,28),D(2027,4,20),'buyback programme\nends Apr 28',6.5,'center')]
for d,xt,t,y,ha in ev:
    ax.axvline(d,color=GREY,lw=0.7,ls=':'); ax.text(xt,y,t,ha=ha,va='bottom',fontsize=6.8,color=DARK)
for d in [D(2026,11,9),D(2026,11,16),D(2026,11,23),D(2026,11,12),D(2026,12,12),D(2027,2,12),D(2027,3,12),D(2027,4,12)]: ax.axvline(d,color=GREY,lw=0.7,ls=':')
ax.set_xlim(x0,x1); ax.set_ylim(0,11.6); ax.set_ylabel('PUMP price ($)')
import matplotlib.ticker as mt; ax.yaxis.set_major_formatter(mt.FuncFormatter(lambda y,_: f'{y/1000:.4f}')); ax.set_yticks([2,4,6,8,10])
ax.xaxis.set_major_locator(mdates.MonthLocator()); ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %Y'))
ax.set_title("The path, dated: public events and the grid's levels", loc='left', fontsize=10.5, fontweight='bold', color=INK, pad=8)
fig.text(0.01,0.01,"Levels: sensitivity grid (Investment proposal 1) and trade plan. Dates: DefiLlama weekly and monthly prints, Blockworks vesting schedule,\nbuyback policy (to Apr 28, 2027). The dashed line is a reading order, not a forecast of timing; any stop reading ends the path.",fontsize=6.8,color=MUTED,ha='left')
fig.subplots_adjust(left=0.1,right=0.99,top=0.88,bottom=0.3); fig.savefig('figures/fig5_path.png',dpi=220,bbox_inches='tight'); print('ok fig5_path.png')
