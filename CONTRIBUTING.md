# Contributing to QGA Cancer Therapeutics

Thank you for your interest in contributing. This is a research proof-of-concept exploring quantum-inspired optimization for multi-drug cancer therapy selection — every contribution helps make the idea more rigorous or more honest about its current limits.

By participating in this project, you're expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Found a security or safety-logic issue instead of a regular bug? See [SECURITY.md](SECURITY.md) — please don't open a public issue for it.

---

## Before You Start

- Read the [README](README.md) to understand what the project does and, just as importantly, what it doesn't do yet
- Read [docs/features.md](docs/features.md), especially the **Known Limitations** section — it lists the mock dataset, the hill-climb-not-a-real-GA search, and the missing genomic ingestion path, so you don't rediscover them as "bugs"

---

## Ways to Contribute

| Type | Examples |
|---|---|
| Bug reports | Frontend build breaks, fitness math produces an unexpected score, CI fails |
| Feature requests | A real (non-toy) genetic algorithm operator set, real GDSC/CCLE data ingestion, a working `genomic_parser.py` |
| Code | Fix a bug, extend the fitness engine, improve the landing page, add tests |
| Docs | Clearer setup instructions, corrections to the math/architecture description |
| Testing | More coverage for `ClinicalFitnessEngine`, or a CPU-only mock for the quantum kernel so it's testable without an NVIDIA GPU |

---

## Reporting a Bug

1. Check existing issues to avoid duplicates
2. Open a new issue with:
   - **One-line summary** in the title
   - **Steps to reproduce** (exact commands or inputs)
   - **Expected behaviour** vs **actual behaviour**
   - **Environment** (OS, Python version, whether you have an NVIDIA GPU, Node version if frontend-related)

## Suggesting a Feature

Open an issue with the label `enhancement`. Describe the problem you're trying to solve, why the current code doesn't cover it, and a rough idea of how it could work. Large features (a real GA implementation, real genomic data ingestion, a live backend behind the frontend) should be discussed in an issue before a PR is opened.

---

## Development Setup

### Frontend (no special hardware required)
```bash
cd frontend
npm install
npm run dev
```
`npm run build` must succeed before any frontend PR is opened — this is checked in CI.

### Python — fitness engine and tests (no special hardware required)
```bash
pip install numpy pytest
PYTHONPATH=src python -m pytest tests/ -v
```
This covers `ClinicalFitnessEngine` (`src/quantum/fitness.py`), which is pure NumPy.

### Python — full pipeline including the quantum kernel (requires an NVIDIA GPU on Linux)
`src/quantum/engine.py` and `src/agents/coordinator.py` import `cudaq`, which is only installable on NVIDIA Linux hardware or inside the provided container:
```bash
docker build -t qga-oncology-pipeline .
docker run --gpus all --rm qga-oncology-pipeline
```
If you don't have that hardware, you can still contribute to everything except the quantum kernel itself — the fitness math, the compliance agent's report logic, and the frontend are all testable without it.

---

## Making a Pull Request

1. Fork the repo and create a branch from `main`
2. Make your change, keeping it focused on one concern
3. Run the relevant checks locally (frontend build, or `pytest`, depending on what you touched)
4. Open a PR using the template — link the issue it addresses if there is one
5. If you touched the mock dataset, the fitness weights, or the search algorithm's behavior, update [docs/features.md](docs/features.md) so the docs stay accurate

We'd rather merge something small and honest about its scope than something large that overclaims what it does.
