# Validation

"Validation" means different things depending on what you're asking, and conflating them is exactly how a research demo ends up misrepresented as something clinically meaningful. This doc keeps them separate.

---

## 1. Software correctness

Covered by CI (`.github/workflows/ci.yml`): the portable Python test suite (`tests/`) and the frontend build (`npm run build`) both run on every push and PR. This tells you the code does what it's written to do — it says nothing about whether what it's written to do is a good idea.

## 2. Algorithmic validation — does the search actually find good answers?

This is the one question the project didn't answer at all until [`src/quantum/baseline.py`](../src/quantum/baseline.py) was added: for a search space this small (4 drugs → 15 non-empty combinations), you don't need a quantum computer to find the true optimum — you can just check all of them classically, in milliseconds, with plain NumPy.

- **`brute_force_search()`** exhaustively evaluates every combination through the exact same `ClinicalFitnessEngine` the quantum kernel is scored against, and returns the true global optimum. It requires no `cudaq` and no GPU, so it runs in CI as a normal `pytest` test (`tests/test_baseline.py`).
- **`scripts/compare_qga_vs_baseline.py`** runs the *actual* quantum pipeline (requires `cudaq`/GPU) against the same patient and reports the gap between what the QGA pipeline found and the true optimum. This is the real algorithmic validation question — "does the quantum-sampled hill-climb actually converge to the right answer, or just something plausible-looking?" — and it can only be answered on hardware that can run `cudaq`.

**A concrete finding from building this**: the landing page's earlier "simulated output" demo showed `[0110]` (Trametinib+Alpelisib) as an `APPROVED` result with a fabricated score of `0.4023`. Running the real fitness engine against it shows that combination actually scores **-50.0** — a toxicity threshold breach that the real compliance agent would reject. The demo numbers were invented, not computed, and they were wrong. This has been fixed (the demo now uses real, brute-force-verified numbers), but it's worth stating plainly: **fabricated example output in a medical-adjacent demo is exactly the kind of mistake this document exists to catch going forward.** If you add new example output anywhere in this repo, compute it from the real engine — don't write a plausible-looking number.

## 3. Clinical / scientific validation — is this medically meaningful?

**No, and nothing in this repository gets you there.** This is not a validation gap that more local testing closes. For this to mean anything clinically, at minimum it would need:

- **Real data**, not a 4-drug mock registry — see [Known Limitations](features.md#known-limitations) for what's mocked versus real today.
- **Clinical pharmacologist review of the safety rules.** The current ADME-conflict and toxicity-threshold logic is illustrative, not sourced from real pharmacogenomic guidelines. [PharmGKB](https://www.pharmgkb.org/)/[CPIC](https://cpicpgx.org/) publish real, curated gene-drug interaction guidelines that a real safety layer would need to be built against and reviewed by someone qualified to judge it.
- **Benchmarking against established standards of care** (e.g., NCCN combination-therapy guidelines) — not just against a classical brute-force search of the same toy dataset, which only proves the algorithm is internally consistent, not that its answers are good medicine.
- **IRB-approved trials on real, consented patient data**, with outcomes tracked against a control arm.
- **Regulatory classification and review** if this were ever positioned as decision support — in the US, that's Software as a Medical Device (SaMD) territory under FDA oversight, with a corresponding evidentiary bar.
- **Independent peer review**, published and reproducible, not a GitHub README's word for it.

None of this is a checklist this project intends to complete on its own — it's context for anyone deciding how much weight to put on anything this repository outputs. Treat every score, report, and "APPROVED" status in this codebase as what it is: the output of a small illustrative simulation, not a clinical judgment.
