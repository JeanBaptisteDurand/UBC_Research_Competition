# Same-chain control for "the crowd is thinning": LaunchLab (Raydium) swaps per day, read from the collector's
# daily JSON (key verificationsLaunchLab.echanges), week Oct 6-12 vs Oct 13-19. Run from the repository root:
#   python3 scripts/launchlab_control.py [data/pumpfun-16d]
import glob, json, os, sys
d = sys.argv[1] if len(sys.argv) > 1 else 'data/pumpfun-16d'
v = {os.path.basename(f)[:10]: json.load(open(f))['verificationsLaunchLab']['echanges'] for f in sorted(glob.glob(os.path.join(d, '2026-10-*.json')))}
w1 = [v[k] for k in v if '2026-10-06' <= k <= '2026-10-12']; w2 = [v[k] for k in v if '2026-10-13' <= k <= '2026-10-19']
m1, m2 = sum(w1) / len(w1), sum(w2) / len(w2)
print(f'LaunchLab swaps/day: Oct 6-12 {m1:,.0f} ({len(w1)} days) | Oct 13-19 {m2:,.0f} ({len(w2)} days) | change {100 * (m2 / m1 - 1):+.1f} %')
