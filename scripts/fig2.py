# F2 / Fig. C1 (annexe C) — une famille d'usines vue de l'intérieur : naissances/jour, P&L net des bots, part de mes achats vidés.
# Data: the author's bot journals and lab reports, reconciled to on-chain balances (bots/reconciliation.csv). Run from the repository root.
from datetime import date, datetime, timedelta
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt, matplotlib.dates as mdates
INK='#1f2937'; RED='#b91c1c'; BLUE='#1d4ed8'; GREEN='#15803d'; GREY='#9ca3af'; LIGHT='#e5e7eb'; MUTED='#6b7280'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':9,'axes.edgecolor':INK,'axes.spines.top':False,'axes.spines.right':False,'legend.fontsize':8})
D = lambda m,d: date(2026,m,d)
T = lambda d: datetime(d.year, d.month, d.day)   # a date + timedelta(hours=…) stays a date: shift datetimes instead (6/11 fix: the two families now sit side by side, as intended)
births_rh = {D(10,4):133, D(10,5):300, D(10,6):274, D(10,7):0, D(10,9):247}
births_arc = {D(10,4):277, D(10,5):492, D(10,6):461, D(10,7):532, D(10,8):522, D(10,9):520, D(10,10):351}
pnl_arc_avg = {D(10,3):41, D(10,4):41, D(10,5):41, D(10,6):41}
pnl_arc = {D(10,7):51.8, D(10,8):67.2, D(10,9):68.6, D(10,10):47.8, D(10,11):25, D(10,12):-0.4}
pnl_rh = {D(10,5):10.5, D(10,6):-1.4, D(10,7):2.8, D(10,8):1.3, D(10,9):-0.3}
drained_rh = {D(10,4):0, D(10,5):22, D(10,6):63}
events = [(D(10,6),'1526o family:\nlast pool 18:44 ',1,'right'),(D(10,7),' my Arc bots\n redeployed',0,'left'),(D(10,9),'1526o back; my bot\nstops on its own rule',1,'left'),(D(10,13),'All bots stopped,\nwallets swept ',0,'right')]
x0, x1 = D(10,2), D(10,14)
fig, axes = plt.subplots(3,1, figsize=(7.2,4.4), sharex=True, gridspec_kw={'height_ratios':[1.25,1,0.85], 'hspace':0.14})
ax = axes[0]
ax.bar([T(d)-timedelta(hours=5) for d in births_arc], births_arc.values(), width=0.4, color=GREEN, label='Factory family on Arc — new pools per day')
ax.bar([T(d)+timedelta(hours=5) for d in births_rh], births_rh.values(), width=0.4, color=BLUE, label='Factory family 1526o on Robinhood Chain — new pools per day')
# label above the bars, right of the y-axis; a vertical leader drops into the gap above the Oct 6 Robinhood Chain bar (crosses no bar)
ax.annotate('274 → 0 overnight', xy=(T(D(10,6))+timedelta(hours=5), 280), xytext=(T(D(10,6))+timedelta(hours=5), 590), textcoords='data', color=INK, fontsize=8.5, fontweight='bold', ha='right', va='bottom', bbox=dict(boxstyle='square,pad=0.1', fc='white', ec='none'), arrowprops=dict(arrowstyle='-', color=INK, lw=0.6, relpos=(1.0, 0.0), shrinkA=0, shrinkB=0))
for d,txt,row,ha in events:
    y = 810 if row == 0 else 930
    ax.plot([d],[y-25], marker='v', color=INK, ms=4, clip_on=False); ax.text(d, y, txt, fontsize=7.5, color=INK, ha=ha, va='bottom')
ax.set_ylabel('Births / day'); ax.set_ylim(0, 770); ax.legend(loc='upper right', fontsize=7.5, borderaxespad=0.2, frameon=True, facecolor='white', edgecolor='none', framealpha=1)   # white ground: the event lines stop at the legend
ax = axes[1]
ax.bar(list(pnl_arc_avg), pnl_arc_avg.values(), width=0.8, color=LIGHT, edgecolor=RED, hatch='//', label='My Arc bots, net \\$/day (Oct 3–6: 4-day average, \\$164 total)')
ax.bar(list(pnl_arc), pnl_arc.values(), width=0.8, color=RED, label='My Arc bots, net \\$/day')
ax.plot(list(pnl_rh), pnl_rh.values(), color=BLUE, marker='s', ms=4, lw=1, label='Robinhood Chain test bot, net \\$/day (\\$7.50 of capital)')
ax.axhline(0, color=INK, lw=0.6); ax.set_ylabel('Bot P&L (\\$/day)'); ax.set_ylim(-8, 125); ax.legend(loc='upper left', frameon=False, fontsize=7.5)
ax = axes[2]
ax.plot(list(drained_rh), drained_rh.values(), color=BLUE, marker='o', ms=5, lw=1.5, label='Robinhood Chain: share of my buys drained before I could sell (%)')
for d,v in drained_rh.items():   # last label to the right of its point, clear of the legend
    ax.annotate(f'{v} %', (d,v), xytext=(7,-1) if v == max(drained_rh.values()) else (0,6), textcoords='offset points', ha='left' if v == max(drained_rh.values()) else 'center', va='center' if v == max(drained_rh.values()) else 'baseline', fontsize=8.5, color=INK, fontweight='bold')
ax.set_ylim(-5,130); ax.set_ylabel('Drained (%)'); ax.legend(loc='upper left', fontsize=7.5, frameon=True, facecolor='white', edgecolor='none', framealpha=1)
ax.text(D(10,8), 40, 'Arc, Oct 11–12: pools died 65 s after my buy\nvs 213 s without me (96 s vs 332 s the next day)', fontsize=8, color=INK, bbox=dict(boxstyle='round,pad=0.3', fc='white', ec=GREY, lw=0.5))
for a in axes:
    for d,_,_,_ in events: a.axvline(d, color=GREY, lw=0.7, ls=':')
axes[2].set_xlim(x0, x1); axes[2].set_xticks([D(10,k) for k in range(2, 13, 2)]); axes[2].xaxis.set_major_formatter(mdates.DateFormatter('%d %b'))   # no tick label on the right edge (it widened the PNG)
axes[0].set_title('Two factory families from inside, Oct 2 – Oct 13, 2026', loc='left', fontsize=10.5, fontweight='bold', color=INK, pad=62)
fig.text(0.01, 0.005, "Source: author's bot journals and lab reports, reconciled to on-chain balances (Appendix C). Days without a reported value are blank.", fontsize=7.5, color=MUTED)
fig.subplots_adjust(left=0.085, right=0.975, top=0.86, bottom=0.13, hspace=0.14); fig.savefig('figures/figC1_family_lifecycle.png', dpi=220, bbox_inches='tight'); print('ok F2')
