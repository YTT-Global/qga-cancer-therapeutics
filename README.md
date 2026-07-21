# Quantum Genetic Algorithm (QGA) for Personalized Cancer Therapeutics

[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![NVIDIA CUDA-Q](https://img.shields.io/badge/quantum-CUDA--Q-76B900?style=flat-square)](https://developer.nvidia.com/cudaq)
[![Stack](https://img.shields.io/badge/stack-Python%20·%20React%20·%20Vite-blue?style=flat-square)](#tech-stack)

A research proof-of-concept exploring quantum-inspired combinatorial optimization for multi-drug cancer therapy selection: candidate drug combinations are encoded as qubits, sampled via NVIDIA CUDA-Q, and scored by a multi-objective clinical fitness engine (efficacy, drug-drug synergy, multi-organ toxicity, and hard genetic-safety constraints).

## Status

**Research / proof-of-concept — not a clinical tool.** Everything in this repo runs against a small, fixed mock dataset (4 drugs, one mock patient record). Nothing here has been clinically validated, reviewed by a regulatory body, or trained on real patient data, and it should not inform real treatment decisions. See [docs/features.md](docs/features.md#known-limitations) for the full, honest list of what's mocked versus real.

---

## The Core Problem

Matching a mutated tumor genome against a library of candidate drug combinations is a combinatorial problem — the number of possible combinations grows exponentially with the drug count. Classical, sequential search methods can get stuck in **local minima**, missing a better combination elsewhere in the search space. On top of that, drugs interact: some combinations amplify each other's effect (synergy), others compound toxicity in the same organ system. A useful answer has to search efficiently *and* respect hard safety constraints at the same time.

### The Approach

This repository implements a **Quantum Genetic Algorithm (QGA)**. Instead of searching combinations one at a time, it encodes each candidate drug as a qubit and applies quantum rotation gates (`Ry`), sampling the resulting state via NVIDIA CUDA-Q to get many candidate combinations from a single quantum circuit. Each sample is then scored by a **Multi-Objective Clinical Fitness Engine** (efficacy, synergy, and multi-organ toxicity), and the orchestration loop nudges toward whichever combination scores best over a few rounds.

Worth being precise about: the current orchestration loop (`src/agents/coordinator.py`) is a small hill-climb over rotation angles, not a full genetic algorithm with crossover/mutation/population selection — see [Known Limitations](docs/features.md#known-limitations) for the complete picture.

---

## Architecture Layout

```text
qga-cancer-therapeutics/
├── .github/                        # CI, deploy, issue/PR templates, dependabot, CodeQL
├── data/
│   ├── raw/gdsc_mock_curves.json    # Mock drug registry + synergy matrix
│   └── processors/genomic_parser.py # Empty placeholder — no real .vcf/.bam ingestion yet
├── src/
│   ├── agents/
│   │   ├── coordinator.py          # Pipeline orchestration (hill-climb, see Status)
│   │   └── compliance_agent.py     # Rule-based clinical justification report generator
│   └── quantum/
│       ├── engine.py               # CUDA-Q kernel + sampling
│       ├── fitness.py              # NumPy multi-objective fitness math
│       └── baseline.py             # Portable brute-force optimum (no GPU needed) — see docs/validation.md
├── scripts/compare_qga_vs_baseline.py # Runs the real pipeline against the baseline (needs GPU)
├── frontend/                       # React + Vite landing page (this is a static site, no live backend)
├── docs/
│   ├── features.md                 # Full feature + limitations reference
│   └── validation.md               # What's algorithmically validated vs. what clinical validation would require
├── tests/                          # pytest suite (covers fitness.py + baseline.py, portable without a GPU)
└── Dockerfile                      # NVIDIA CUDA-Q container for the full pipeline
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Quantum kernel | NVIDIA CUDA-Q (`Ry` rotation gates, `cudaq.sample`) |
| Classical fitness math | NumPy |
| Agent orchestration | Python 3.10 |
| Landing page | React + Vite + Tailwind CSS |
| Containerized runtime | Docker (NVIDIA CUDA-Q base image) |

---

## Mathematical Objective Function

The fitness score $F(x)$ of a candidate quantum bitstring $x$ is:

$$F(x) = \left( w_1 \cdot \text{Efficacy}(x) + w_2 \cdot \text{Synergy}(x) \right) - \left( w_3 \cdot \text{Toxicity}(x) + \text{Penalty}_{\text{ADME}}(x) \right)$$

* **Efficacy** ($w_1 = 0.40$): weighted baseline potency of each selected drug against the targeted mutation.
* **Synergy** ($w_2 = 0.40$, $x^T \cdot S \cdot x$): quadratic pairwise interaction — positive entries amplify, negative entries antagonize.
* **Toxicity** ($w_3 = 0.20$): cumulative stress across liver, kidney, and bone marrow; the candidate is rejected outright if any organ system crosses its threshold.
* **ADME Penalty**: score drops immediately to `-100.0` if a selected drug conflicts with the patient's inherited drug-metabolism (ADME) genetic profile.

---

## Quick Start

### Frontend landing page (no special hardware required)
```bash
cd frontend
npm install
npm run dev
```

### Fitness engine + tests (no special hardware required)
```bash
pip install numpy pytest
PYTHONPATH=src python -m pytest tests/ -v
```
This covers `ClinicalFitnessEngine`, which is pure NumPy and portable.

### Full pipeline including the quantum kernel (requires a Linux host with an NVIDIA GPU)
`src/quantum/engine.py` imports `cudaq`, which is only installable on NVIDIA Linux hardware or inside this container — there's currently no CPU-only mock for it (see [Known Limitations](docs/features.md#known-limitations)).

```bash
docker build -t qga-oncology-pipeline .
docker run --gpus all --rm qga-oncology-pipeline
```

---

## Validation

Nothing in this repo claims the QGA pipeline is clinically meaningful — see [Status](#status) above. But within its own small mock search space, you can actually check whether it finds the right answer: [`src/quantum/baseline.py`](src/quantum/baseline.py) brute-forces the true optimum classically (no GPU needed), and [`scripts/compare_qga_vs_baseline.py`](scripts/compare_qga_vs_baseline.py) runs the real quantum pipeline against it (needs a GPU) to report the gap. Full breakdown, including what algorithmic validation does and doesn't prove, in [docs/validation.md](docs/validation.md).

---

## Safety Logic

This project doesn't treat the fitness score as the final word. Once the quantum kernel returns a candidate combination, a rule-based **Medical Compliance Agent** re-checks it and outputs a structured **Clinical Justification Report** — `APPROVED` or `REJECTED_SAFETY_VIOLATION`, the recommended drug list, and a plain-language explanation of why. It's deterministic, rule-based logic over the same mock dataset described above, not a certified safety system — see [SECURITY.md](SECURITY.md) if you find a case where it approves something its own stated rules should reject.

---

## Documentation

- [docs/features.md](docs/features.md) — what's actually implemented, stage by stage, plus the full Known Limitations list
- [docs/validation.md](docs/validation.md) — software correctness vs. algorithmic validation vs. clinical/scientific validation, and what each actually requires
- [CONTRIBUTING.md](CONTRIBUTING.md) — how to set up each part of the project and submit changes
- [SECURITY.md](SECURITY.md) — how to report a vulnerability or a safety-logic bug

---

## Commercial Support

This is an open-source research project. If your team wants help integrating real genomic data feeds, connecting a production oncology database (GDSC/CCLE), scaling to multi-GPU clusters, or extending the algorithm beyond a proof-of-concept, YTT Global offers implementation consulting:

- Email: [accounts@ytt.global](mailto:accounts@ytt.global)
- LinkedIn: [YTT Global](https://www.linkedin.com/company/yttglobalservices)

---

## License

[MIT](LICENSE) © 2026 YTT Global
