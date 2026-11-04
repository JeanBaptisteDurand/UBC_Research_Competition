# F13 / Fig. 2 (corps, demi-largeur) — la réponse des opérateurs, mesurée : part de mes achats vidés avant ma vente
# (famille 1526o, Robinhood Chain, 4-6 oct.) et durée de vie des pools après mon achat vs sans moi (famille Arc, 11-12 oct.).
# Chiffres : journaux de bots + collecteur (voir 47 et annexe C). Lancer depuis research-competition/ : .venv/bin/python figures/fig13.py
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
INK='#1f2937'; RED='#b91c1c'; BLUE='#1d4ed8'; GREEN='#15803d'; GREY='#9ca3af'; LIGHT='#e5e7eb'; DARK='#4b5563'; MUTED='#6b7280'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':8,'axes.edgecolor':INK,'axes.labelcolor':INK,'xtick.color':INK,'ytick.color':INK,'axes.spines.top':False,'axes.spines.right':False})
fig, (ax, bx) = plt.subplots(1, 2, figsize=(3.55, 2.35), gridspec_kw={'width_ratios': [1.05, 1], 'wspace': 0.55})
# --- gauche : part vidée
days = ['Oct 4', 'Oct 5', 'Oct 6']; drained = [0, 22, 63]; lab = ['0 of 134', '22 %\n(after 22:00)', '10 of 16']
ax.bar(range(3), drained, color=BLUE, width=0.6)
for i, (v, l) in enumerate(zip(drained, lab)): ax.text(i, v+7, l, ha='center', va='bottom', fontsize=7.2, color=INK, fontweight='bold')
ax.set_xticks(range(3)); ax.set_xticklabels(days, fontsize=7.5); ax.set_ylim(0, 95); ax.set_ylabel('My buys drained\nbefore I could sell (%)', fontsize=7.5)
ax.set_title('Robinhood Chain family', fontsize=8, color=DARK, loc='left')
# --- droite : durée de vie des pools
x = [0, 1]; mine = [65, 96]; without = [213, 332]
bx.bar([i-0.19 for i in x], mine, width=0.36, color=GREEN, label='after my buy')
bx.bar([i+0.19 for i in x], without, width=0.36, color=LIGHT, edgecolor=GREY, label='no buy, same family, same day')
for i in x:
    bx.text(i-0.19, mine[i]+8, f'{mine[i]} s', ha='center', fontsize=7.2, color=INK, fontweight='bold'); bx.text(i+0.19, without[i]+8, f'{without[i]} s', ha='center', fontsize=7.2, color=DARK)
bx.set_xticks(x); bx.set_xticklabels(['Oct 11', 'Oct 12'], fontsize=7.5); bx.set_ylim(0, 500); bx.set_ylabel('Pool life (seconds)', fontsize=7.5)
bx.set_title('Arc family', fontsize=8, color=DARK, loc='left')
bx.legend(loc='upper left', fontsize=6.3, frameon=False, handlelength=1.2, borderaxespad=0.1, labelspacing=0.3)
fig.suptitle('How the operators responded to my bots', x=0.01, ha='left', fontsize=9.5, fontweight='bold', color=INK)
fig.text(0.01, 0.01, "Family = pools sharing one contract bytecode. Oct 5: n not logged. Source: my bot\njournals and collector, Oct 4–12, 2026; nothing changed on my side Oct 4–6 (Appendix C).", fontsize=6.3, color=MUTED, ha='left')
fig.subplots_adjust(left=0.16, right=0.985, top=0.80, bottom=0.3)
fig.savefig('figures/fig2_operator_response.png', dpi=220, bbox_inches='tight'); print('ok fig2_operator_response.png')
