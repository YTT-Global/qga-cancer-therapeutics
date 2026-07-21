## What Changed

<!-- One or two sentences. -->

## Why

<!-- Link the issue this addresses, if there is one. -->

## How to Test

<!-- Exact steps a reviewer should follow to verify this works. -->

## Checklist

- [ ] `npm run build` passes, if `frontend/` was touched
- [ ] `PYTHONPATH=src python -m pytest tests/ -v` passes, if `src/quantum/fitness.py` or `src/agents/` was touched
- [ ] [docs/features.md](../docs/features.md) updated if this changes the mock dataset, the fitness weights, or the search algorithm's behavior
- [ ] No claims added that this is clinically validated or ready for real patient data — see [README.md](../README.md#status)
- [ ] PR is focused on one concern
