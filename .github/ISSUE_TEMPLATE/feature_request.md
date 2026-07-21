---
name: Feature request
about: Propose an improvement to the algorithm, frontend, or docs
title: ""
labels: enhancement
---

## Problem

<!-- What are you trying to do, and why can't the current project do it? -->

## Proposed Solution

<!-- A rough idea of how it could work. Doesn't need to be a full design. -->

## Component

<!-- Delete the ones that don't apply. -->
- [ ] Real genetic algorithm operators (crossover/mutation/population — the current coordinator is a hill-climb, see docs/features.md)
- [ ] Real genomic data ingestion (`.vcf`/`.bam` via `data/processors/genomic_parser.py`)
- [ ] Real GDSC/CCLE data integration (replacing the mock drug registry)
- [ ] CPU-only mock for the quantum kernel (so contributors without an NVIDIA GPU can run the full pipeline)
- [ ] Frontend / landing page
- [ ] CI/CD
- [ ] Other

## Alternatives Considered

<!-- Optional — anything else you thought about, and why this approach seems best. -->

---

Larger features (a real GA implementation, real data ingestion, a live backend) should be discussed here before a PR is opened — see [CONTRIBUTING.md](../../CONTRIBUTING.md).
