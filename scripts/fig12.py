# F12 — la chaîne alimentaire mesurée : P&L médian par main selon son nombre de positions (pump.fun, 16 jours).
# Lit data/pumpfun-16d/food-chain-published.json ; lancer depuis research-competition/ : .venv/bin/python figures/fig12.py
import json, pathlib
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
F = pathlib.Path('figures'); A = json.load(open('data/pumpfun-16d/food-chain-published.json'))
INK='#1f2937'; RED='#b91c1c'; GREY='#9ca3af'; LIGHT='#e5e7eb'; DARK='#4b5563'; MUTED='#6b7280'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':9.5,'axes.edgecolor':INK,'axes.labelcolor':INK,'xtick.color':INK,'ytick.color':INK,'axes.spines.top':False,'axes.spines.right':False,'legend.fontsize':8.5})
S = [s for s in A['segments'] if s['variant']=='nongrad']
short = ['1 position', '2–5', '6–20', '21–100', '101–500', '501–2,000', '> 2,000']
def ph(v): return f"{v:.0f} %" if v >= 2 else (f"{v:.1f} %" if v >= 0.1 else f"{v:.2f} %")
NGS = sum(s['sol'] for s in S)
lab = [f"{short[i]}\n{ph(s['pctHands'])} of wallets\n{100*s['sol']/NGS:.0f} % of SOL" for i, s in enumerate(S)]
med = [s['median'] for s in S]
fig, ax = plt.subplots(figsize=(7.2, 1.5)); x = list(range(len(S)))
ax.bar(x, med, color=RED, width=0.62)
ax.axhline(0, color=INK, lw=0.8); ax.axhline(-2.5, color=GREY, lw=1.1, ls='--'); ax.text(4.5, 1.0, 'dashed line: round-trip curve fee ≈ −2.5 %', ha='center', va='bottom', fontsize=7.3, color=DARK)
for i, v in enumerate(med):
    if v < -25: ax.text(i, v/2, f"{v:.0f} %", ha='center', va='center', fontsize=9, color='white', fontweight='bold')
    else: ax.text(i, v-1.2, f"{v:.0f} %", ha='center', va='top', fontsize=9, color=INK, fontweight='bold')
ax.set_xticks(x); ax.set_xticklabels(lab, fontsize=7.8); ax.set_ylabel('Median P&L (%)'); ax.set_ylim(min(med)-6, 5)
ax.set_xlabel('Addresses grouped by positions taken in 16 days (Oct 5–20, 2026); last three groups ≈ 6, 31 and 125+ a day', fontsize=8.5)
ax.set_title('The food chain: one-off buyers lose 46 %, the heaviest hands 4 %', loc='left', fontsize=10.5, fontweight='bold', color=INK, pad=10)
NG = sum(s['positions'] for s in S)
fig.text(0.01, 0.01, f"Source: author's Solana collector, pump.fun/SOL, {NG:,} all-entry positions (non-graduated tokens) by {A['mains']:,} addresses, creator excluded (as in Table 1 and Fig. 3); bars = median P&L per position, unsold remainder = 0. % of SOL is relative to the SOL staked on non-graduated tokens; addresses with more than 100 positions place 62 % of it.", fontsize=7.5, color=MUTED, ha='left', wrap=True)
fig.tight_layout(rect=(0,0.12,1,1)); fig.savefig(F/'fig3_food_chain.png', dpi=220, bbox_inches='tight'); plt.close(fig); print('ok fig3_food_chain.png')
