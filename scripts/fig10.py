# F10 — pump.fun jour par jour (16 jours) : médiane de la foule ; adresses acheteuses actives par jour (collecteur + Allium).
# (Lancements/h retirés le 6/11 : la série du collecteur sous-compte en 2e semaine. Sources dans la légende du papier.)
# F11 — rétention à 7 jours des cohortes de nouveaux entrants (annexe B).
# Lit data/pumpfun-16d/aggregate-pumpfun.json (sortie de data/pumpfun-16d/agreger.py). Lancer depuis research-competition/ :
#   .venv/bin/python figures/fig10.py
import csv, json, pathlib
from datetime import date
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
F = pathlib.Path('figures'); A = json.load(open('data/pumpfun-16d/aggregate-pumpfun.json'))
INK='#1f2937'; RED='#b91c1c'; GREY='#9ca3af'; LIGHT='#e5e7eb'; DARK='#4b5563'; MUTED='#6b7280'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':9.5,'axes.edgecolor':INK,'axes.labelcolor':INK,'xtick.color':INK,'ytick.color':INK,'axes.spines.top':False,'axes.spines.right':False,'legend.fontsize':8.5})
P = A['parJour']; n = len(P)
jours = [date.fromisoformat(o['jour']) for o in P]; lab = [d.strftime('%d') for d in jours]
med = [100*o['med2060'] for o in P]
act = [A['adresses']['activesParJour'][o['jour']] for o in P]
# second pipeline: Allium's count of the same days (crosscheck/results/allium/q1-overlap-daily.csv)
AL = {r['day']: int(r['buyers']) for r in csv.DictReader(open('crosscheck/results/allium/q1-overlap-daily.csv')) if r['protocol'] == 'pumpfun' and r['day'][:4] == '2026'}
al = [AL[o['jour']]/1000 for o in P]
fig, (ax, bx) = plt.subplots(2, 1, figsize=(7.2, 2.1), sharex=True, gridspec_kw={'height_ratios': [1.2, 1]})
x = list(range(n))
bars = ax.bar(x, med, color=RED, width=0.72)
ax.axhline(0, color=INK, lw=0.8); fee = ax.axhline(-2.5, color=GREY, lw=1.1, ls='--')
for i, v in enumerate(med): ax.text(i, 0.6, f'{v:.0f}'.replace('-', '−'), ha='center', va='bottom', fontsize=7, color=INK)
ax.set_ylim(min(med)-3, 6); ax.set_yticks([-20, -10, 0])
ax.legend([bars, fee], ['median P&L, buyers entering 20–60 s after launch', 'round-trip curve fee ≈ −2.5 %'], loc='lower left', bbox_to_anchor=(0.0, 1.0), fontsize=7.8, frameon=False, ncol=2, columnspacing=1.6, handlelength=1.3, handletextpad=0.5, borderaxespad=0.2, borderpad=0.1)
ak = [a/1000 for a in act]
bx.bar(x, ak, color=LIGHT, edgecolor=GREY, width=0.72)
bx.plot(x, al, color=INK, lw=1.4, marker='o', ms=2.8)
w1 = sum(al[1:8])/7; w2 = sum(al[8:15])/7            # Oct 6–12 et Oct 13–19, compte Allium
bx.text(0.004, 0.83, f'Line, Allium: {w1:.0f}k → {w2:.0f}k a day (Oct 6–12 → 13–19), −{100*(1-w2/w1):.0f} % w/w. Bars: my collector.', transform=bx.transAxes, ha='left', va='baseline', fontsize=7.4, color=INK, fontweight='bold')
bx.text(0.996, 0.83, 'Source: Allium (allium.so)', transform=bx.transAxes, ha='right', va='baseline', fontsize=6.3, color=MUTED)
bx.set_ylim(0, 280); bx.set_yticks([0, 100, 200]); bx.set_xticks(x); bx.set_xticklabels(lab); bx.set_xlabel('October 2026 (UTC days)', fontsize=8.5, labelpad=2)
# one-line y-labels on two short panels: same x, top label raised and bottom label lowered so they never meet
ax.set_ylabel('Median P&L (%)', fontsize=8); bx.set_ylabel('Buyers (k/day)', fontsize=8)
ax.yaxis.set_label_coords(-0.062, 0.62); bx.yaxis.set_label_coords(-0.062, 0.30)
ax.set_title(f"{n} days, {A['foule2060']['joursNegatifs']} negative medians — and the crowd thins", loc='left', fontsize=10.5, fontweight='bold', color=INK, pad=17)
fig.subplots_adjust(left=0.085, right=0.985, top=0.83, bottom=0.2, hspace=0.12); fig.savefig(F/'fig1_pumpfun_16_days.png', dpi=220, bbox_inches='tight'); plt.close(fig); print('ok fig1_pumpfun_16_days.png', round(w1), round(w2))

# ---- F11 (annexe B) : rétention des cohortes de nouveaux entrants ----
R = [r for r in A['adresses'].get('retentionCohortes', []) if r.get('r7') is not None and r['jour'] != P[0]['jour']]
if R:
    fig, ax = plt.subplots(figsize=(7.2, 2.6)); xx = list(range(len(R)))
    ax.bar(xx, [100*r['r7'] for r in R], color=LIGHT, edgecolor=GREY, width=0.7, label='seen again within 7 days')
    ax.bar(xx, [100*r['r1'] for r in R], color=DARK, width=0.7, label='seen again the next day')
    for i, r in enumerate(R): ax.text(i, 100*r['r7']+0.8, f"{100*r['r7']:.0f} %", ha='center', fontsize=8, color=INK); ax.text(i, -4.8, f"n = {r['cohorte']/1000:.0f}k", ha='center', fontsize=7.5, color=DARK)
    ax.set_xticks(xx); ax.set_xticklabels([date.fromisoformat(r['jour']).strftime('%d') for r in R]); ax.set_xlabel('Cohort: day of first appearance in the window, October 2026 (UTC)')
    ax.set_ylabel('Share of the cohort (%)'); ax.set_ylim(-7.5, max(100*r['r7'] for r in R)*1.4); ax.axhline(0, color=INK, lw=0.6)
    ax.set_xlim(-0.6, len(R)-0.4); ax.legend(loc='upper center', fontsize=8, frameon=False, ncol=2)
    ax.set_title("Most new buyers do not come back: 7-day retention by cohort", loc='left', fontsize=10.5, fontweight='bold', color=INK, pad=10)
    fig.text(0.01, 0.01, "Source: author's Solana collector, pump.fun/SOL, cohorts of buyers not seen earlier in the window (Oct 6–13; the Oct 5 cohort is excluded because on day 1 every buyer is 'new'); n = cohort size.", fontsize=7.5, color=MUTED, ha='left', wrap=True)
    fig.tight_layout(rect=(0,0.15,1,1)); fig.savefig(F/'figB1_cohort_retention.png', dpi=220, bbox_inches='tight'); plt.close(fig); print('ok figB1_cohort_retention.png')
