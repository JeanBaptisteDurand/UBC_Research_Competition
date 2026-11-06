# F12 — la chaîne alimentaire mesurée : P&L médian par main selon son nombre de positions (pump.fun, 16 jours).
# Lit data/pumpfun-16d/food-chain-published.json ; lancer depuis research-competition/ : .venv/bin/python figures/fig12.py
# Dessinée à la largeur imprimée (7.2 in) ; sources et définitions dans la légende du papier (plus de note en pied).
import json, pathlib
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
F = pathlib.Path('figures'); A = json.load(open('data/pumpfun-16d/food-chain-published.json'))
INK='#1f2937'; RED='#b91c1c'; GREY='#9ca3af'; LIGHT='#e5e7eb'; DARK='#4b5563'; MUTED='#6b7280'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':9.5,'axes.edgecolor':INK,'axes.labelcolor':INK,'xtick.color':INK,'ytick.color':INK,'axes.spines.top':False,'axes.spines.right':False,'legend.fontsize':8.5})
S = [s for s in A['segments'] if s['variant']=='nongrad']
short = ['1 position', '2–5', '6–20', '21–100', '101–500', '501–2,000', '> 2,000']
def ph(v): return f"{v:.0f} %" if v >= 2 else (f"{v:.1f} %" if v >= 0.1 else f"{v:.2f} %")
lab = [f"{short[i]}\n{ph(s['pctHands'])} of wallets" for i, s in enumerate(S)]
med = [s['median'] for s in S]
fig, ax = plt.subplots(figsize=(7.2, 2.6)); x = list(range(len(S)))
ax.bar(x, med, color=RED, width=0.62)
ax.axhline(0, color=INK, lw=0.8); ax.axhline(-2.5, color=GREY, lw=1.1, ls='--')
ax.text(4.5, 1.2, 'dashed line: round-trip curve fee ≈ −2.5 %', ha='center', va='bottom', fontsize=7.3, color=DARK)
for i, v in enumerate(med):
    t = f"{v:.0f} %".replace('-', '−')
    if v < -25: ax.text(i, v/2, t, ha='center', va='center', fontsize=9, color='white', fontweight='bold')   # inside the bar, far below the fee line
    else: ax.text(i, v-1.8, t, ha='center', va='top', fontsize=9, color=INK, fontweight='bold')              # under the bar end, below the fee line
ax.set_xticks(x); ax.set_xticklabels(lab, fontsize=7.5, linespacing=1.15); ax.set_xlim(-0.5, len(S)-0.5)
ax.set_ylabel('Median P&L (%)'); ax.set_ylim(min(med)-6, 8)
ax.set_xlabel('Addresses grouped by positions taken in 16 days (Oct 5–20, 2026); last three groups ≈ 6, 31 and 125+ a day', fontsize=8.5, labelpad=4)
ax.set_title('The food chain: one-off buyers lose 46 %, the heaviest hands 4 %', loc='left', fontsize=10.5, fontweight='bold', color=INK, pad=8)
fig.subplots_adjust(left=0.09, right=0.985, top=0.89, bottom=0.255)
fig.savefig(F/'fig3_food_chain.png', dpi=220, bbox_inches='tight'); plt.close(fig); print('ok fig3_food_chain.png')
