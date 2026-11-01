#!/bin/bash
# RE-CALCUL JOUR PAR JOUR de la fenêtre pump.fun avec l'outil du labo (solana-courbes.mjs), SANS le modifier.
# Un jour = fenêtre 00:00 → 24:00 UTC (l'outil lit aussi le fichier 00 h du lendemain pour fermer les positions
# nées avant 23:45). Un processus à la fois : ~2 Go de RAM et ~80-110 s par jour sur le Mac (mesuré le 21/10).
#   ./run-days.sh 2026-10-05 2026-10-20        (bornes incluses)
# Chaque jour est calculé DÈS QUE ses 24 fichiers horaires + le 00 h du lendemain sont rapatriés (le miroir rsync
# écrit sous un nom temporaire puis renomme : un fichier au nom final est complet). Sorties dans ce dossier :
# <jour>.json (résultat complet), <jour>.positions.jsonl (une ligne par position de la foule), <jour>.log (affichage
# de l'outil + temps + mémoire). Un jour déjà calculé (json présent) est sauté.
set -uo pipefail
ICI=$(cd "$(dirname "$0")" && pwd)
LABO=${LABO:-scripts/lab}   # the lab tools of this repository
export DONNEES=${DONNEES:-data/collector-hourly/solana}   # hourly collector files (on request)
DEBUT=${1:-2026-10-05}; FIN=${2:-2026-10-20}
complet() { [ "$(ls "$DONNEES/$1" 2>/dev/null | grep -c '^[0-9][0-9]\.jsonl\.zst$')" -eq 24 ] && [ -s "$DONNEES/$2/00.jsonl.zst" ]; }
j=$DEBUT
while [[ "$j" < "$FIN" || "$j" == "$FIN" ]]; do
  lendemain=$(date -u -j -f %Y-%m-%d -v+1d "$j" +%Y-%m-%d)
  if [ -s "$ICI/$j.json" ]; then echo "$j : déjà fait"; else
    n=0; until complet "$j" "$lendemain"; do [ $((n % 10)) -eq 0 ] && echo "$j : attente du miroir ($(ls "$DONNEES/$j" 2>/dev/null | grep -c zst)/24 h) $(date -u +%H:%M:%S)"; n=$((n+1)); sleep 60; done
    echo "$j : départ $(date -u +%H:%M:%S)"
    ( cd "$LABO" && /usr/bin/time -l node --max-old-space-size=18000 solana-courbes.mjs \
        --debut="${j}T00:00" --fin="${lendemain}T00:00" --prio=44500 --prix-sol=120 \
        --sortie="$ICI/$j.json" --positions="$ICI/$j.positions.jsonl" ) > "$ICI/$j.log" 2>&1
    echo "$j : fin $(date -u +%H:%M:%S) · $(grep -E 'maximum resident' "$ICI/$j.log" | awk '{printf "%.1f Go", $1/1073741824}') · $(grep -E '^ *[0-9.]+ real' "$ICI/$j.log" | awk '{print $1 " s"}') · $(grep -E 'lecture :' "$ICI/$j.log" | cut -c1-80)"
  fi
  j=$lendemain
done
echo "TERMINÉ $(date -u +%H:%M:%S)"
