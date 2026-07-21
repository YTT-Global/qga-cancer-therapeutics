# QGA Cancer Therapeutics — Feature Reference

A complete, accurate account of what this project actually does today. Unlike the README (which pitches it), this document is meant to be checked against — every claim here is verified against the actual source, not aspirational. Where something is a known gap rather than a feature, it's listed as one in [Known Limitations](#known-limitations).

---

## What this is

A research proof-of-concept exploring a **Quantum Genetic Algorithm (QGA)** for optimizing multi-drug combination therapy selection in oncology. It encodes candidate drug combinations as qubits, samples them via NVIDIA CUDA-Q, scores each sample against a multi-objective clinical fitness function, and generates a plain-language justification report for the winning combination.

It is **not** a production clinical tool, a trained ML model, or a genomics data pipeline. There is no real patient data anywhere in this repo — everything runs against a small, fixed mock dataset.

---

## Pipeline stages

### 1. Drug registry and mock clinical dataset — `data/raw/gdsc_mock_curves.json`, `src/quantum/fitness.py`
A fixed 4-drug registry (`Dabrafenib`, `Trametinib`, `Alpelisib`, `Everolimus`) with:
- A base efficacy score per drug
- A 4×4 pairwise synergy matrix (positive = amplifying, negative = antagonistic)
- A toxicity profile per drug across three organ systems (liver, kidney, bone marrow), with fixed safety thresholds

### 2. Quantum sampling — `src/quantum/engine.py`
Each drug maps to one qubit. A CUDA-Q kernel applies `Ry` rotation gates per qubit, then `cudaq.sample(...)` samples the resulting circuit (500 shots), returning a distribution of candidate bitstrings — one bit per drug, `1` meaning "include this drug." The target backend is `"nvidia"` (GPU) with a fallback to `"qpp-cpu"` (CPU quantum simulator) if no GPU is available — this fallback only affects *where the simulation runs*, not whether `cudaq` itself is importable (see [Known Limitations](#known-limitations)).

### 3. Clinical fitness scoring — `ClinicalFitnessEngine.evaluate()` in `src/quantum/fitness.py`
For each sampled bitstring:
- Returns `-100.0` immediately if any selected drug is in the patient's `adme_blacklist` (their inherited drug-metabolism genes conflict with that drug)
- Returns `-50.0` if cumulative toxicity in any organ system exceeds its threshold
- Otherwise computes `score = 0.40·efficacy + 0.40·synergy − 0.20·mean_toxicity`, clipped to `[-100.0, 1.0]`

### 4. Orchestration — `src/agents/coordinator.py`
Runs 4 epochs against a single hardcoded mock patient record. Each epoch samples the quantum circuit with the current rotation angles, evaluates every returned bitstring, keeps the best-scoring one, and nudges the angles toward those bits (`+0.3` for included drugs, `-0.3` for excluded ones) for use in the next epoch's sampling.

### 5. Compliance reporting — `src/agents/compliance_agent.py`
Takes the final winning bitstring and turns it into a structured report: `patient_id`, `status` (`APPROVED` if the final score is positive, else `REJECTED_SAFETY_VIOLATION`), the recommended drug list, and a plain-English justification sentence.

### 6. Frontend — `frontend/`
A static, presentational React + Vite + Tailwind landing page (`frontend/src/App.jsx`) explaining the above, including a replayed (not live) console demo built from the real mock patient ID and drug names. It does not call any backend API — there is no live backend behind it.

### 7. Baseline validation — `src/quantum/baseline.py`
A portable, `cudaq`-free brute-force search that exhaustively evaluates every combination through `ClinicalFitnessEngine` and returns the true optimum. Exists to answer "does the quantum-sampled search actually find a good answer?" — a question nothing else in the pipeline checks. See [docs/validation.md](validation.md) for what this does and doesn't prove.

---

## Known Limitations

These are known, deliberate gaps — not bugs waiting to be reported as surprises. If you want to work on closing one of them, see [CONTRIBUTING.md](../CONTRIBUTING.md).

- **The dataset is small and fully mocked.** 4 drugs, one hardcoded patient, and synergy/toxicity numbers that aren't sourced from any real GDSC/CCLE dataset despite the file name `gdsc_mock_curves.json` — "mock" is accurate, not a placeholder waiting to be silently swapped for something real.
- **The search algorithm is a hill-climb, not a full genetic algorithm.** `coordinator.py`'s 4-epoch loop nudges rotation angles toward whichever single bitstring scored best each round. There's no crossover, mutation, or population of candidates carried between generations — despite the project name, this is closer to a quantum-assisted local search than a genetic algorithm in the textbook sense.
- **`data/processors/genomic_parser.py` is an empty file.** It's not imported anywhere. Real `.vcf`/`.bam` genomic ingestion, implied by the architecture but not built, would live here.
- **`cudaq` cannot be imported outside NVIDIA Linux GPU hardware (or the provided Docker container).** The `try/except` around `cudaq.set_target(...)` in `engine.py` only handles GPU-vs-CPU *target* selection — it assumes `cudaq` itself already imported successfully. There is currently no CPU-only mock/stub, so `src/quantum/engine.py` and `src/agents/coordinator.py` cannot run at all on a typical contributor machine without that hardware. `tests/test_quantum_engine.py` only exercises `ClinicalFitnessEngine`, which is pure NumPy and portable — it does not actually test the quantum kernel despite the filename.
- **`pydantic` is listed in `requirements.txt` but unused.** Patient data is parsed with plain `json.loads(...)` and no schema validation, despite `pydantic` being a declared dependency — this looks like planned-but-unbuilt input validation rather than a real feature.
- **This is not a validated clinical decision-support tool.** Nothing in this repository has undergone regulatory review, clinical trial validation, or safety certification. The `MedicalComplianceAgent`'s "compliance" checks are rule-based logic over mock data, not a substitute for real pharmacovigilance.
