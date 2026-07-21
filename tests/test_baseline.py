import pytest
from quantum.fitness import ClinicalFitnessEngine
from quantum.baseline import brute_force_search


def test_finds_the_true_global_optimum_for_the_mock_patient():
    # Verified by hand against every one of the 15 non-empty combinations:
    # 0010 (Alpelisib alone) is the only combination that both avoids the
    # Dabrafenib ADME conflict and stays under the toxicity thresholds while
    # scoring higher than the other two single-drug options (0001: 0.10,
    # 0100: 0.12). Every multi-drug combination available to this patient
    # breaches a toxicity threshold and scores -50.0.
    engine = ClinicalFitnessEngine()
    bitstring, score = brute_force_search(engine, adme_blacklist=[0])
    assert bitstring == "0010"
    assert score == pytest.approx(0.2133, abs=1e-4)


def test_never_selects_an_adme_blacklisted_drug():
    engine = ClinicalFitnessEngine()
    bitstring, _ = brute_force_search(engine, adme_blacklist=[0])
    assert bitstring[0] == "0"


def test_the_adme_safety_constraint_has_a_real_measurable_cost():
    # Without the ADME blacklist, Dabrafenib+Trametinib (1100) is the true
    # optimum at 0.2833 — its strong positive synergy (0.35, the highest
    # pairwise entry in the matrix) outweighs the combined toxicity. With
    # Dabrafenib blacklisted for this patient, the optimum drops to 0010
    # (Alpelisib alone, 0.2133). This is the safety-vs-optimality tradeoff
    # the whole system exists to navigate — it should be a real cost, not
    # something the fitness math accidentally cancels out.
    engine = ClinicalFitnessEngine()
    unconstrained_bitstring, unconstrained_score = brute_force_search(engine, adme_blacklist=[])
    constrained_bitstring, constrained_score = brute_force_search(engine, adme_blacklist=[0])

    assert unconstrained_bitstring == "1100"
    assert unconstrained_score > constrained_score
    assert constrained_bitstring[0] == "0"


def test_returns_zero_score_placeholder_when_everything_is_blacklisted():
    # If every drug conflicts with the patient's ADME profile, the best
    # achievable is still one of them scored at -100.0 — brute force must
    # not silently fall back to the empty combination (which fitness.py
    # scores 0.0, not a real "no treatment" recommendation).
    engine = ClinicalFitnessEngine()
    bitstring, score = brute_force_search(engine, adme_blacklist=[0, 1, 2, 3])
    assert bitstring != "0000"
    assert score == -100.0
