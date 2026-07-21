import cudaq
from typing import List, Tuple
from quantum.fitness import ClinicalFitnessEngine

try:
    cudaq.set_target("nvidia")
except RuntimeError:
    cudaq.set_target("qpp-cpu")

@cudaq.kernel
def qga_evolution_kernel(num_drugs: int, rotation_angles: list[float]):
    qubits = cudaq.qvector(num_drugs)
    for i in range(num_drugs):
        ry(rotation_angles[i], qubits[i])

def run_quantum_generation(engine: ClinicalFitnessEngine, angles: List[float], adme_blacklist: List[int]) -> Tuple[str, float]:
    shots = 500
    counts = cudaq.sample(qga_evolution_kernel, engine.num_drugs, angles, shots_count=shots)
    
    best_candidate = "0" * engine.num_drugs
    highest_score = -999.0
    
    for bitstring, _ in counts.items():
        score = engine.evaluate(bitstring, adme_blacklist)
        if score > highest_score:
            highest_score = score
            best_candidate = bitstring
            
    return best_candidate, highest_score
