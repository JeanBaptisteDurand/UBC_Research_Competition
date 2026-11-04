PY ?= python3
.PHONY: check figures launchlab robustness foodchain all
check:        ## recompute the paper's numbers from this repository -> results/numbers.{csv,md}
	$(PY) check/check_numbers.py
figures:      ## redraw the paper's figures into figures/
	$(PY) scripts/figures.py && $(PY) scripts/fig2.py && $(PY) scripts/fig10.py && $(PY) scripts/fig12.py && $(PY) scripts/fig13.py && $(PY) scripts/fig14.py
launchlab:    ## same-chain control (LaunchLab swaps per day)
	$(PY) scripts/launchlab_control.py data/pumpfun-16d
robustness:   ## status C: needs data/pumpfun-16d/*.positions.jsonl (on request)
	$(PY) check/robustness_2060.py data/pumpfun-16d
foodchain:    ## status C: needs the per-position files
	$(PY) scripts/food_chain.py data/pumpfun-16d results/food_chain_recomputed.json
report:       ## regenerate the generated documents of docs/pumpfun/ from the data
	$(PY) scripts/report_pumpfun.py && $(PY) scripts/report_pumpfun_public.py
all: check figures launchlab report
