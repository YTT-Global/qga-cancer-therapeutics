"""Compares the QGA pipeline's result against the true global optimum.

Requires cudaq (NVIDIA Linux GPU, or the project's Docker container) since it
runs the actual quantum kernel via quantum.engine.run_quantum_generation —
unlike tests/test_baseline.py, which only exercises the portable classical
fitness math. Run with:

    PYTHONPATH=src python3 scripts/compare_qga_vs_baseline.py

or inside the container:

    docker run --gpus all --rm qga-oncology-pipeline "python3 scripts/compare_qga_vs_baseline.py"
"""

import json

from quantum.fitness import ClinicalFitnessEngine
from quantum.engine import run_quantum_generation
from quantum.baseline import brute_force_search

# Same mock patient as agents/coordinator.py — kept in sync manually since
# this script is meant to answer "how close does the QGA pipeline get to the
# real optimum for the same patient", not to exercise a different scenario.
MOCK_PATIENT_VCF = """
{
    "patient_id": "PT-A77B9",
    "oncology_mutations": ["BRAF-V600E", "MET-Amplification"],
    "inherited_adme_defects": ["Dabrafenib"]
}
"""

DRUG_NAMES = ["Dabrafenib", "Trametinib", "Alpelisib", "Everolimus"]


def main():
    patient = json.loads(MOCK_PATIENT_VCF)
    engine = ClinicalFitnessEngine()

    adme_blacklist = []
    if "Dabrafenib" in patient["inherited_adme_defects"]:
        adme_blacklist.append(0)

    true_bitstring, true_score = brute_force_search(engine, adme_blacklist)

    quantum_angles = [3.14159 / 4.0] * engine.num_drugs
    epochs = 4
    qga_bitstring, qga_score = "0" * engine.num_drugs, -999.0

    for epoch in range(epochs):
        qga_bitstring, qga_score = run_quantum_generation(engine, quantum_angles, adme_blacklist)
        for i in range(engine.num_drugs):
            quantum_angles[i] += 0.3 if qga_bitstring[i] == "1" else -0.3

    def drug_list(bitstring):
        return [name for name, bit in zip(DRUG_NAMES, bitstring) if bit == "1"]

    gap = true_score - qga_score

    print(f"Patient: {patient['patient_id']}")
    print(f"True global optimum   : {true_bitstring}  {drug_list(true_bitstring)}  score={true_score:.4f}")
    print(f"QGA pipeline result   : {qga_bitstring}  {drug_list(qga_bitstring)}  score={qga_score:.4f}")
    print(f"Gap (optimum - QGA)   : {gap:.4f}")
    print(f"Found the true optimum: {qga_bitstring == true_bitstring}")


if __name__ == "__main__":
    main()
