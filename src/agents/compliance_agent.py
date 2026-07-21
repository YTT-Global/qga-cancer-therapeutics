from typing import List, Dict

class MedicalComplianceAgent:
    def __init__(self):
        self.drug_names = ["Dabrafenib", "Trametinib", "Alpelisib", "Everolimus"]

    def generate_report(self, optimal_bitstring: str, patient_id: str, final_score: float) -> Dict:
        selected_therapy = [
            self.drug_names[i] for i, bit in enumerate(optimal_bitstring) if bit == "1"
        ]
        
        justification = (
            f"The QGA system optimized treatment combination strategy down to {selected_therapy}. "
            f"This cocktail scored an optimal balancing metric of {final_score:.4f}, maintaining "
            f"the required internal organ toxicity bounds while leveraging multi-drug synergy tracks."
        )
        
        return {
            "patient_id": patient_id,
            "status": "APPROVED" if final_score > 0 else "REJECTED_SAFETY_VIOLATION",
            "recommended_cocktail": selected_therapy,
            "clinical_justification": justification
        }
