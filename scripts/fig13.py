# F13 / Fig. 2 (corps, demi-largeur) — la réponse des opérateurs, mesurée : part de mes achats vidés avant ma vente
# (famille 1526o, Robinhood Chain, 4-6 oct.) et durée de vie des pools après mon achat vs sans moi (famille Arc, 11-12 oct.).
# Chiffres : journaux de bots + collecteur (voir 47 et annexe C). Lancer depuis research-competition/ : .venv/bin/python figures/fig13.py
# Dessinée à la largeur imprimée (flottant de 3.16 in) : rien ne dépasse le cadre de 3.55 in.
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
INK='#1f2937'; RED='#b91c1c'; BLUE='#1d4ed8'; GREEN='#15803d'; GREY='#9ca3af'; LIGHT='#e5e7eb'; DARK='#4b5563'; MUTED='#6b7280'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':8,'axes.edgecolor':INK,'axes.labelcolor':INK,'xtick.color':INK,'ytick.color':INK,'axes.spines.top':False,'axes.spines.right':False})
fig, (ax, bx) = plt.subplots(1, 2, figsize=(3.55, 2.35), gridspec_kw={'width_ratios': [1.12, 1]})
# --- gauche : part vidée
days = ['Oct 4', 'Oct 5', 'Oct 6']; drained = [0, 22, 63]; lab = ['0 of 134', '22 %', '10 of 16']
ax.bar(range(3), drained, color=BLUE, width=0.6)
for i, (v, l) in enumerate(zip(drained, lab)): ax.text(i, v+(17 if i == 1 else 5), l, ha='center', va='bottom', fontsize=7.2, color=INK, fontweight='bold')
ax.text(1, 22+3, 'after\n22:00', ha='center', va='bottom', fontsize=6.5, color=INK, linespacing=1.0)  # Oct 5: only buys after 22:00 (narrow, clear of the Oct 6 bar)
ax.set_xticks(range(3)); ax.set_xticklabels(days, fontsize=7.5); ax.set_xlim(-0.72, 2.6); ax.set_ylim(0, 95); ax.set_yticks([0, 20, 40, 60, 80])
ax.tick_params(labelsize=7.5); ax.set_ylabel('My buys drained\nbefore I could sell (%)', fontsize=7.5, labelpad=3)
ax.set_title('Robinhood Chain family', fontsize=8, color=DARK, loc='left', pad=4)
# --- droite : durée de vie des pools
x = [0, 1]; mine = [65, 96]; without = [213, 332]
bx.bar([i-0.19 for i in x], mine, width=0.36, color=GREEN, label='after my buy')
bx.bar([i+0.19 for i in x], without, width=0.36, color=LIGHT, edgecolor=GREY, label='no buy, same\nfamily, same day')
for i in x:
    bx.text(i-0.19, mine[i]+8, f'{mine[i]}', ha='center', fontsize=7.2, color=INK, fontweight='bold'); bx.text(i+0.19, without[i]+8, f'{without[i]}', ha='center', fontsize=7.2, color=DARK)
bx.set_xticks(x); bx.set_xticklabels(['Oct 11', 'Oct 12'], fontsize=7.5); bx.set_xlim(-0.5, 1.5); bx.set_ylim(0, 560); bx.set_yticks([0, 100, 200, 300, 400, 500])
bx.tick_params(labelsize=7.5); bx.set_ylabel('Pool life (seconds)', fontsize=7.5, labelpad=3)
bx.set_title('Arc family', fontsize=8, color=DARK, loc='left', pad=4)
bx.legend(loc='upper left', fontsize=6.5, frameon=False, handlelength=1.2, handletextpad=0.4, borderaxespad=0.15, labelspacing=0.35)
fig.suptitle('Drained: 0 of 134 buys, then 10 of 16', x=0.03, y=0.985, ha='left', va='top', fontsize=10.5, fontweight='bold', color=INK)
fig.text(0.03, 0.012, "Family = pools sharing one bytecode. Oct 5: n not logged.\nNothing changed on my side Oct 4–6. Source: bot journals, collector.", fontsize=6.5, color=MUTED, ha='left', va='bottom', linespacing=1.25)
fig.subplots_adjust(left=0.175, right=0.97, top=0.82, bottom=0.235, wspace=0.49)
fig.savefig('figures/fig2_operator_response.png', dpi=220, bbox_inches='tight'); print('ok fig2_operator_response.png')
