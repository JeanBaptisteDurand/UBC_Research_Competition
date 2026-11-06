# Fig. A1: active buyers per day on the pump.fun curve, Feb-Nov 2026, second pipeline (Allium) against the collector.
# Run from the repository root: python scripts/figA1_allium.py
import csv, datetime as dt, re
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt, matplotlib.dates as mdates
INK='#1f2937'; RED='#b91c1c'; GREY='#9ca3af'; LIGHT='#e5e7eb'; DARK='#4b5563'; MUTED='#6b7280'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':8.5,'axes.edgecolor':INK,'axes.labelcolor':INK,'xtick.color':INK,'ytick.color':INK,'axes.spines.top':False,'axes.spines.right':False})
D = dt.date.fromisoformat
al = {D(r['day']): int(r['buyers']) for r in csv.DictReader(open('crosscheck/results/allium/q2-nine-months-daily.csv')) if r['protocol'] == 'pumpfun'}
col, inside = {}, False  # the collector's table "| day | active buyers | ..." in §10
for line in open('docs/pumpfun/03-sixteen-days-tick-level.md').read().split('\n'):
    if line.startswith('| day | active buyers |'): inside = True; continue
    if inside and not line.startswith('|'): break
    m = re.match(r'\| (10-\d\d) \| ([\d,]+) \|', line)
    if inside and m: col[D('2026-' + m.group(1))] = int(m.group(2).replace(',', ''))
days = sorted(al)
roll = [sum(al[d] for d in days[i-6:i+1]) / 7 for i in range(6, len(days))]
fig, ax = plt.subplots(figsize=(7.2, 2.3))
ax.plot(days, [al[d] / 1e3 for d in days], color=GREY, lw=0.8, label='Allium, daily')
ax.plot(days[6:], [v / 1e3 for v in roll], color=INK, lw=2, label='Allium, 7-day mean')
cd = sorted(col)
ax.plot(cd, [col[d] / 1e3 for d in cd], color=RED, lw=2, ls='--', label='my collector, Oct 5-20')
ax.axhline(155, color=DARK, lw=0.8, ls=':')
ax.text(D('2026-04-08'), 158, 'stop level in the paper: 7-day mean above 155,000 for two weeks', fontsize=7, color=DARK, va='bottom')
peak = max(range(len(roll)), key=lambda i: roll[i])
ax.annotate(f'7-day peak {roll[peak]/1e3:.0f}k', (days[6+peak], roll[peak]/1e3), xytext=(-70, 6), textcoords='offset points', fontsize=7.3, color=INK, arrowprops=dict(arrowstyle='-', color=MUTED, lw=0.6))
# last full Monday-Sunday week (Oct 26 - Nov 1): the trailing 7-day mean on Nov 1 is exactly that week's mean (121,639)
wk = D('2026-11-01'); wk_mean = sum(al[wk - dt.timedelta(days=k)] for k in range(7)) / 7
ax.plot([wk], [wk_mean/1e3], marker='o', ms=3.2, color=INK, zorder=4)
ax.annotate(f'{wk_mean/1e3:.0f}k, week of Oct 26', (wk, wk_mean/1e3), xytext=(D('2026-10-29'), 33), textcoords='data', ha='right', va='bottom', fontsize=7.3, color=INK, arrowprops=dict(arrowstyle='-', color=INK, lw=0.6, relpos=(1.0, 1.0), shrinkA=0, shrinkB=2))
ax.set_ylabel('buyers per day (thousands)'); ax.set_ylim(0, 240); ax.grid(axis='y', color=LIGHT, lw=0.6); ax.set_axisbelow(True)
ax.xaxis.set_major_locator(mdates.MonthLocator()); ax.xaxis.set_major_formatter(mdates.DateFormatter('%b'))
ax.legend(loc='lower left', bbox_to_anchor=(0.01, 0.015), frameon=False, fontsize=7.3, ncol=3, columnspacing=1.2, handlelength=1.8, borderaxespad=0)  # under the data: no daily value falls below 60k
ax.set_title('Buyers peaked the week of Sep 28, then fell four weeks in a row', loc='left', fontsize=10.5, fontweight='bold', color=INK, pad=8)
fig.text(0.01, 0.01, "Source: Allium (allium.so), solana.dex.trades, protocol 'pumpfun'; a buyer is the signer of a swap that sells SOL. Query q2 in crosscheck/queries/allium/.\n"
         "Collector: docs/pumpfun/03 §10. The two agree within 3-11 % to Oct 14, then the collector loses coverage (crosscheck/results/allium/README.md).", fontsize=6.6, color=MUTED, ha='left')
fig.subplots_adjust(left=0.08, right=0.975, top=0.86, bottom=0.27)
fig.savefig('figures/figA1_allium_nine_months.png', dpi=220, bbox_inches='tight'); print('ok figA1_allium_nine_months.png')
