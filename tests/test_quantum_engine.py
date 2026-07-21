import pytest
from quantum.fitness import ClinicalFitnessEngine

def test_adme_blacklist_constraint():
    engine = ClinicalFitnessEngine()
    score = engine.evaluate(bitstring="1100", adme_blacklist=[0])
    assert score == -100.0

def test_empty_combination():
    engine = ClinicalFitnessEngine()
    score = engine.evaluate(bitstring="0000", adme_blacklist=[])
    assert score == 0.0
