# Security Policy

This is a research proof-of-concept, not a deployed clinical system — but it deals with medical/oncology-adjacent logic, so we still take security and correctness reports seriously rather than treating it as "just a demo."

## Supported Versions

There is no versioned release yet. Security fixes land on `main`.

## Reporting a Vulnerability

**Do not open a public GitHub issue for a security vulnerability.** Email `accounts@ytt.global` directly instead, with:

- A description of the issue and its impact
- Steps to reproduce (exact commands, inputs, or code samples)
- Which component is affected (the Python quantum/fitness core, the agent orchestration layer, or the React frontend)

You should receive an acknowledgement within 5 business days.

## Scope

In scope: `src/quantum/`, `src/agents/`, `frontend/`, `Dockerfile`, and the GitHub Actions workflows.

A few things worth knowing up front rather than reported as surprises — these are tracked, known gaps rather than undiscovered vulnerabilities. See [docs/features.md](docs/features.md#known-limitations) for the full list, but the most relevant ones for security review are:

- The drug registry, synergy matrix, toxicity thresholds, and patient record are all hardcoded mock data — there is no real patient data ingestion path to worry about today.
- `MedicalComplianceAgent` is a rule-based report generator over a small fixed dataset, not a validated safety system. **If you find an input that makes it report `APPROVED` for a combination that should score as unsafe under its own stated rules (ADME conflict, toxicity threshold breach), that is exactly the kind of report we want** — logic bugs in safety-adjacent code are treated as security-relevant here even though nothing here touches real patients.
- The frontend is a static, presentational landing page with no backend API calls and no user input handling — its attack surface is limited to standard static-site concerns (dependency vulnerabilities, XSS in any future dynamic content).

## What Happens After a Report

1. We confirm the issue and determine severity.
2. A fix is developed and tested against the existing test suite plus a regression test for the specific issue.
3. Public disclosure happens after the fix is merged, coordinated with you.
