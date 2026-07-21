from itertools import product
from typing import List, Tuple

from quantum.fitness import ClinicalFitnessEngine


def brute_force_search(engine: ClinicalFitnessEngine, adme_blacklist: List[int]) -> Tuple[str, float]:
    """Exhaustively evaluates every non-empty drug combination and returns the
    true global optimum under ClinicalFitnessEngine's rules.

    This exists to answer a question the rest of the pipeline never does on
    its own: does the quantum-sampled search actually find the best available
    combination, or just a locally-good one? For a small registry (engine.num_drugs
    qubits, so 2**num_drugs - 1 non-empty combinations) this brute force is
    exact and near-instant — pure NumPy/stdlib, no cudaq or GPU required.
    """
    best_bitstring = "0" * engine.num_drugs
    best_score = -999.0

    for bits in product("01", repeat=engine.num_drugs):
        bitstring = "".join(bits)
        if bitstring == "0" * engine.num_drugs:
            continue
        score = engine.evaluate(bitstring, adme_blacklist)
        if score > best_score:
            best_score = score
            best_bitstring = bitstring

    return best_bitstring, best_score
