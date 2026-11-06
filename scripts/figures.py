import json, math, pathlib
from datetime import datetime, timezone, date, timedelta
from collections import defaultdict
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
# Style commun : chaque figure est dessinée à la largeur imprimée (7.2 in pleine largeur, 3.55 in demi-largeur)
# pour que les polices (9.5 pt corps, 8 pt demi-largeur) restent lisibles sans réduction.
B = pathlib.Path('data/raw'); F = pathlib.Path('figures'); F.mkdir(exist_ok=True); (F/'extra').mkdir(exist_ok=True)
INK='#1f2937'; RED='#b91c1c'; BLUE='#1d4ed8'; GREEN='#15803d'; GREY='#9ca3af'; LIGHT='#e5e7eb'; DARK='#4b5563'; MUTED='#6b7280'
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':9.5,'axes.edgecolor':INK,'axes.labelcolor':INK,'xtick.color':INK,'ytick.color':INK,'axes.spines.top':False,'axes.spines.right':False,'legend.fontsize':8.5})
def day(ts): return datetime.fromtimestamp(int(ts), tz=timezone.utc).date()
def load(name): return json.load(open(B/name))
def monthly(chart):
    m = defaultdict(float)
    for ts,v in chart: m[day(ts).replace(day=1)] += float(v or 0)
    return dict(sorted(m.items()))
def weekly(chart):
    m = defaultdict(float)
    for ts,v in chart:
        d = day(ts); m[d - timedelta(days=d.weekday())] += float(v or 0)
    return dict(sorted(m.items()))
def daily_px(chart): return {datetime.fromtimestamp(ts/1000, tz=timezone.utc).date(): p for ts,p in chart}
def finish(fig, ax, title, source, fname, tsize=10.5, ssize=7.5, bottom=0.06, pad=10):
    ax.set_title(title, loc='left', fontsize=tsize, fontweight='bold', color=INK, pad=pad)
    fig.text(0.01, 0.01, source, fontsize=ssize, color=MUTED, ha='left', wrap=True)
    fig.tight_layout(rect=(0,bottom,1,1)); fig.savefig(F/fname, dpi=220, bbox_inches='tight'); plt.close(fig); print('ok', fname)

rev = load('llama_pump_revenue.json')['totalDataChart']; fees = load('llama_pump_fees.json')['totalDataChart']
pons = load('llama_pons_fees.json')['totalDataChart']; argus = load('llama_arguspad_fees.json')['totalDataChart']
pump_px = daily_px(load('cg_pump_chart.json')['prices']); pump_mc = daily_px(load('cg_pump_chart.json')['market_caps'])
mf, mr = monthly(fees), monthly(rev)

# ---------- F9 / Fig. 1 : trois pics, deux effondrements (revenu mensuel seul ; octobre partiel hachuré) ----------
months = [m for m in mr if m >= date(2024,3,1)]
full = [m for m in months if m < date(2026,10,1)]; part = [m for m in months if m >= date(2026,10,1)]
last_day = day(rev[-1][0])
fig, ax = plt.subplots(figsize=(7.2,1.65))
ax.bar(full, [mr[m]/1e6 for m in full], width=24, color=LIGHT, edgecolor=GREY, lw=0.6, label='Monthly revenue ($M)')
if part:
    ax.bar(part, [mr[m]/1e6 for m in part], width=24, color='white', edgecolor=GREY, lw=0.6, hatch='////', label=f'Oct 2026, {last_day.day} days (partial)')
    proj = mr[part[0]]/1e6*31/last_day.day
    ax.bar(part, [proj], width=24, fill=False, edgecolor=GREY, lw=0.8, ls=':', label=f'Oct at the {last_day.day}-day pace (≈ ${proj:.0f}M)')
    ax.text(date(2026,12,28), 122, f'Oct 1–{last_day.day}: ${mr[part[0]]/1e6:.0f}M\nat this pace ≈ ${proj:.0f}M', ha='right', va='bottom', fontsize=7, color=DARK)
ax.set_ylabel('$M per month'); ax.set_ylim(0, 178); ax.set_xlim(date(2024,2,1), date(2026,12,31))
for pk,lbl in [(date(2025,1,1),'1st peak'),(date(2025,9,1),'2nd peak')]: ax.text(pk, mr[pk]/1e6+3, lbl, ha='center', va='bottom', fontsize=7.5, color=RED, fontweight='bold')
ax.text(date(2026,9,1), mr[date(2026,8,1)]/1e6+8, '3rd peak (Aug–Oct)', ha='center', va='bottom', fontsize=7.5, color=RED, fontweight='bold')
for a,b,lbl,(tx,ty) in [(date(2025,1,1), date(2025,7,1), '−87 % in 6 months', (date(2025,6,5), 118)), (date(2025,9,1), date(2026,6,1), '−52 % in 9 months', (date(2026,2,1), 78))]:
    ax.annotate('', xy=(b, mr[b]/1e6+3), xytext=(a, mr[a]/1e6-2), arrowprops=dict(arrowstyle='->', color=RED, lw=1.3, shrinkA=0, shrinkB=0))
    ax.text(tx, ty, lbl, color=RED, fontsize=8.5, fontweight='bold', ha='center')

ax.xaxis.set_major_locator(mdates.MonthLocator(bymonth=[1,7])); ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %y'))
ax.legend(loc='upper left', bbox_to_anchor=(0.0, 1.02), frameon=False, ncol=1, fontsize=7.5)
finish(fig, ax, 'Three peaks, two collapses: −87 % and −52 % after the two prior peaks',
       f'Source: DefiLlama dailyRevenue, pump.fun parent protocol (launchpad, PumpSwap, Terminal, app), Mar 2024 – Oct {last_day.day}, 2026; October partial (hatched).', 'fig4_three_peaks.png')

# ---------- F6a / Fig. 3 : le péage bradé (demi-largeur) ----------
months = [m for m in mf if date(2025,1,1) <= m < date(2026,10,1)]
fig, ax = plt.subplots(figsize=(3.55,2.6))
ax.bar(months, [mf[m]/1e6 for m in months], width=24, color=LIGHT, edgecolor=GREY, lw=0.5, label='Fees paid by traders')
ax.bar(months, [mr[m]/1e6 for m in months], width=24, color=INK, label='Kept by pump.fun (revenue)')
ax.set_ylabel('$M per month', fontsize=8); ax.tick_params(labelsize=8)
ax2 = ax.twinx(); ax2.spines['right'].set_visible(True)
take = [100*mr[m]/mf[m] for m in months]
ax2.plot(months, take, color=RED, lw=1.8, marker='o', ms=2.5, label='Take rate (%)')
ax2.set_ylim(0,118); ax2.set_ylabel('Take rate (%)', color=RED, fontsize=8); ax2.tick_params(axis='y', colors=RED, labelsize=8)
ax2.annotate('100 %', (months[0], 100), xytext=(5,4), textcoords='offset points', color=RED, fontsize=8, fontweight='bold')
j7 = months.index(date(2025,7,1)); ax2.annotate(f'{take[j7]:.0f} % at the token launch', (months[j7], take[j7]), xytext=(6,7), textcoords='offset points', color=RED, fontsize=6.8, bbox=dict(fc='white', ec='none', alpha=0.85, pad=0.4))
ax2.annotate(f'{take[-1]:.0f} %', (months[-1], take[-1]), xytext=(5,-3), textcoords='offset points', color=RED, fontsize=8, fontweight='bold', ha='left')
ax.xaxis.set_major_locator(mdates.MonthLocator(bymonth=[1,7])); ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %y'))
h1,l1 = ax.get_legend_handles_labels(); h2,l2 = ax2.get_legend_handles_labels()
ax.legend(h1+h2, l1+l2, loc='upper center', bbox_to_anchor=(0.5,-0.2), fontsize=7, frameon=False, ncol=2)
finish(fig, ax, 'The toll cut: 100 % → 32 % of fees kept', 'Source: DefiLlama dailyFees vs dailyRevenue, pump.fun parent,\nJan 2025 – Sep 2026. Take rate = revenue / fees.', 'figD1_toll_cut.png', tsize=9.5, ssize=6.8, bottom=0.1)

# ---------- F6b / Fig. 4 : même horloge (demi-largeur) ----------
wf, wp, wa = weekly(fees), weekly(pons), weekly(argus)
wk = [w for w in wf if date(2026,6,22) <= w <= date(2026,10,12)]
fig, ax = plt.subplots(figsize=(3.55,2.6))
ax.plot(wk, [wf.get(w,0)/1e6 for w in wk], color=RED, lw=2, marker='o', ms=2.5, label='pump.fun (Solana)')
ax.plot(wk, [wp.get(w,0)/1e6 for w in wk], color=BLUE, lw=1.8, marker='s', ms=2.5, label='Pons (Robinhood Chain)')
ax.plot(wk, [wa.get(w,0)/1e6*10 for w in wk], color=GREEN, lw=1.4, marker='^', ms=2.5, ls='--', label='Argus World (Arc) ×10')
ax.set_ylabel('Weekly fees ($M)', fontsize=7.5); ax.tick_params(labelsize=8); ax.set_ylim(0, 66)
ax.annotate('Pons peak,\nweek of Aug 31', (date(2026,8,31), wp[date(2026,8,31)]/1e6), xytext=(-7,0), textcoords='offset points', ha='right', va='center', fontsize=7, color=INK)
ax.annotate('pump.fun peak,\n4 weeks later', (date(2026,9,28), wf[date(2026,9,28)]/1e6), xytext=(0,7), textcoords='offset points', ha='center', fontsize=7, color=INK)
wa_pk = max(wk, key=lambda w: wa.get(w,0)); ax.annotate(f'Argus peak\n${wa[wa_pk]/1e6:.1f}M (×10)', (wa_pk, wa[wa_pk]/1e6*10), xytext=(9,-2), textcoords='offset points', ha='left', va='center', fontsize=6.5, color=INK, linespacing=1.05)  # between the pump.fun and Pons lines (6/11); text in ink, not series colour
ax.xaxis.set_major_locator(mdates.MonthLocator()); ax.xaxis.set_major_formatter(mdates.DateFormatter('%b'))
ax.legend(loc='upper center', bbox_to_anchor=(0.5,-0.18), fontsize=7, frameon=False, ncol=2)
finish(fig, ax, 'Same clock: Pons, then Argus, then pump.fun', 'Source: DefiLlama dailyFees, weeks of Jun 22 – Oct 12, 2026 (week of\nOct 19 partial, excluded). Argus World scaled ×10 for visibility.', 'figD2_same_clock.png', tsize=9.5, ssize=6.8, bottom=0.1)

# ---------- F6c / Fig. 5 : le gâteau total des launchpads, toutes chaînes (inchangé sur le fond, polices agrandies) ----------
lp = json.load(open('data/launchpads-weekly-series.json'))
import collections as _c
wc = _c.defaultdict(float)
for _t,_v in load('llama_lp_pump.fun_fees.json')['totalDataChart']:
    _d = day(_t); wc[_d - timedelta(days=_d.weekday())] += _v
wk = [w for w in sorted(wf) if date(2026,6,1) <= w <= date(2026,10,12)]
top = ['Flap sh','Pons V2','StonkFun','LaunchLab','BONK.fun Launchpad','Argus World']
label_of = {'Flap sh':'Flap','BONK.fun Launchpad':'BONK.fun'}
colors = {'Flap sh':'#f59e0b','Pons V2':BLUE,'StonkFun':'#7c3aed','LaunchLab':'#0891b2','BONK.fun Launchpad':'#db2777','Argus World':GREEN}
def s(name, w): return lp.get(name,{}).get(w.isoformat(),0)/1e6
others = [sum(lp[n].get(w.isoformat(),0) for n in lp if n not in top and 'pump' not in n.lower())/1e6 for w in wk]
fig, ax = plt.subplots(figsize=(7.2,3.0))
bottom = [0]*len(wk)
layers = [('pump.fun launchpad (Solana)', [wc.get(w,0)/1e6 for w in wk], RED)] + [(label_of.get(n,n), [s(n,w) for w in wk], colors[n]) for n in top] + [('Other launchpads', others, GREY)]
for name, vals, col in layers:
    ax.bar(wk, vals, bottom=bottom, width=5.8, color=col, edgecolor='white', linewidth=0.3, label=name)
    bottom = [b+v for b,v in zip(bottom, vals)]
ax.set_ylabel('Weekly fees, $M')
# (6/11) share lines and right axis removed: that share series is contradicted by Blockworks and Allium; the figure shows the size of the pie only.
ax.annotate(f'peak ${max(bottom):.0f}M/wk', (wk[bottom.index(max(bottom))], max(bottom)), xytext=(12,-2), textcoords='offset points', fontsize=8.5, color=INK, va='center')

ax.xaxis.set_major_locator(mdates.MonthLocator()); ax.xaxis.set_major_formatter(mdates.DateFormatter('%b'))
ax.legend(loc='upper center', bbox_to_anchor=(0.5,-0.13), fontsize=7.5, frameon=False, ncol=4)
finish(fig, ax, 'Launchpad fees: −70 % from the peak week, −49 % since pump.fun\'s own', 'Source: DefiLlama dailyFees, 16 launchpads with >$0.3M fees/30d in October (all chains), pump.fun counted as its launchpad only;\nISO weeks 23–42 of 2026. Universe fixed on October fees (earlier casualties absent).', 'figD3_total_pie_share.png', pad=10)

# ---------- F7 / Table 1 (version image pour GitHub et les slides ; dans le PDF la table est en HTML, voir vision/layout.py) ----------
cols = ['Venue (chain)', 'Launches\nper hour', 'Second buyer\n≤ 60 s', 'Crowd median\nP&L', 'Operator pull or sell within\nseconds of an outside buy (× matched control)', 'Inorganic signature']
rows = [
 ('pump.fun (Solana), 16 days', '1,029', '51 %', '−17.4 %', '×1.8–4.6 (×2.1 controlled)', '12 % never trade; buyers −26 % w/w'),
 ('PumpSwap (post-graduation, 19 h)', '36–51 pools', '100 %', '−20.5 % night / +1.7 % day', 'none', 'virtual reserve counted in price'),
 ('LaunchLab (Raydium)', '91', '57 %', '−57.9 %', '×10.4', 'one deployer = 95 % of launches'),
 ('Zora', '138', '56 %', '−0.6 to −2 %', 'none (0 / 606)', 'one operator = 83 % of births'),
 ('Pons V2', '354', 'n/a', '−5.9 % (3rd-party)', '5 of 6 drained in 1.4 s', 'fees −43 % after gas subsidy ended'),
]
sb = {'51 %':.51,'100 %':1.0,'57 %':.57,'56 %':.56,'n/a':None}
pl = {'−17.4 %':-17.4,'−20.5 % night / +1.7 % day':-20.5,'−57.9 %':-57.9,'−0.6 to −2 %':-1.5,'−5.9 % (3rd-party)':-5.9}
fig, ax = plt.subplots(figsize=(9.6,2.7)); ax.axis('off')
tbl = ax.table(cellText=[list(r) for r in rows], colLabels=cols, loc='center', cellLoc='left', colWidths=[0.22,0.09,0.1,0.14,0.2,0.25])
tbl.auto_set_font_size(False); tbl.set_fontsize(8.2); tbl.scale(1, 1.5)
import matplotlib.colors as mcolors
greens = mcolors.LinearSegmentedColormap.from_list('g', ['#ffffff', '#86efac']); reds = mcolors.LinearSegmentedColormap.from_list('r', ['#ffffff', '#fca5a5'])
for (r,c), cell in tbl.get_celld().items():
    cell.set_edgecolor('#d1d5db'); cell.set_linewidth(0.5)
    if r == 0: cell.set_facecolor('#1f2937'); cell.get_text().set_color('white'); cell.get_text().set_fontweight('bold'); cell.set_height(cell.get_height()*1.7)
    elif c == 2 and sb.get(rows[r-1][2]) is not None: cell.set_facecolor(greens(sb[rows[r-1][2]]))
    elif c == 3 and pl.get(rows[r-1][3]) is not None: cell.set_facecolor(reds(min(1, -pl[rows[r-1][3]]/40)))
    if r == 1: cell.get_text().set_fontweight('bold')
finish(fig, ax, 'Five launchpads under the same scanner: the most organic venue still costs the crowd 17 % per position', "Source: author's read-only collector (35 EVM chains + Solana). pump.fun: 16 days, Oct 5–20, 2026 (1.69M positions); other venues: 5.7–22 h each, Oct 4–6. Green = organic demand; red = crowd loss.", 'extra/extra_scanner_table.png')

# ---------- F8 (non utilisée dans le papier) : offre circulante ----------
sup = {d: pump_mc[d]/pump_px[d] for d in sorted(pump_px) if pump_px[d] and d >= date(2026,3,1)}
fig, ax = plt.subplots(figsize=(7.2,3.0))
ax.step(list(sup), [v/1e9 for v in sup.values()], where='post', color=INK, lw=2)
ax.set_ylabel('Circulating supply (billions of PUMP)')
for d,txt in [(date(2026,4,30),'Burn −39 %'),(date(2026,6,26),'Unlock +18 %'),(date(2026,9,14),'Unlock +13 %')]:
    ax.axvline(d, color=RED, lw=0.8, ls='--'); ax.text(d, 600 if 'Burn' in txt else 470, ' '+txt, fontsize=8.5, color=RED, fontweight='bold')
ax.set_ylim(300,620); ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %y'))
finish(fig, ax, 'One burn, then +28 % of supply unlocked in five months', 'Source: CoinGecko daily market cap ÷ price (implied circulating supply), Mar 1 – Oct 21, 2026. Steps = CoinGecko update dates; official schedule: 82.5B cliff on 12 Jul 2026, then 6.875B on the 12th of each month to Jul 2029.', 'extra/extra_supply_steps.png')

# ---------- F1 (non utilisée dans le papier) : prix vs revenu hebdo, juin-oct 2026 ----------
wr = {k:v for k,v in weekly(rev).items() if date(2026,6,1) <= k <= date(2026,10,12)}
fig, ax = plt.subplots(figsize=(7.2,3.2))
ax.bar(list(wr), [v/1e6 for v in wr.values()], width=5.5, color=LIGHT, edgecolor=GREY, label='pump.fun weekly protocol revenue (left, $M)')
ax.set_ylabel('Weekly protocol revenue ($M)')
ax2 = ax.twinx(); ax2.spines['right'].set_visible(True)
pd_ = [d for d in sorted(pump_px) if date(2026,6,1) <= d <= date(2026,10,21)]
ax2.plot(pd_, [pump_px[d]*1000 for d in pd_], color=RED, lw=1.8, label='PUMP price (right, $ per 1,000 tokens)')
ax2.set_ylabel('PUMP price ($ per 1,000)', color=RED); ax2.tick_params(axis='y', colors=RED)
ax.xaxis.set_major_formatter(mdates.DateFormatter('%b')); ax.legend(loc='upper left', frameon=False); ax2.legend(loc='upper left', bbox_to_anchor=(0,0.9), frameon=False)
finish(fig, ax, 'The price tripled with a revenue spike — and revenue has turned', 'Sources: DefiLlama (pump.fun parent protocol), CoinGecko. Weekly, Jun 1 – Oct 12, 2026; week of Oct 19 partial, excluded.', 'extra/extra_price_vs_revenue.png')
