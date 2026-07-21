import numpy as np
from typing import List

class ClinicalFitnessEngine:
    def __init__(self):
        self.num_drugs = 4
        self.base_efficacy = np.array([0.80, 0.45, 0.70, 0.35], dtype=np.float32)
        
        self.synergy_matrix = np.array([
            [0.00,  0.35, -0.20,  0.00],
            [0.35,  0.00,  0.10,  0.45],
            [-0.20, 0.10,  0.00,  0.05],
            [0.00,  0.45,  0.05,  0.00]
        ], dtype=np.float32)
        
        self.toxicity_profiles = np.array([
            [0.2, 0.5, 0.1, 0.3],
            [0.4, 0.1, 0.3, 0.1],
            [0.1, 0.3, 0.6, 0.2]
        ], dtype=np.float32)
        
        self.toxicity_thresholds = np.array([0.75, 0.75, 0.75], dtype=np.float32)
        self.weights = {"efficacy": 0.40, "synergy": 0.40, "toxicity": 0.20}

    def evaluate(self, bitstring: str, adme_blacklist: List[int]) -> float:
        x = np.array([int(bit) for bit in bitstring], dtype=np.float32)
        if np.sum(x) == 0:
            return 0.0
            
        for idx in adme_blacklist:
            if x[idx] == 1.0:
                return -100.0
                
        raw_efficacy = np.dot(self.base_efficacy, x) / np.sum(x)
        total_synergy = 0.5 * np.dot(x.T, np.dot(self.synergy_matrix, x))
        
        cumulative_toxicity = np.dot(self.toxicity_profiles, x)
        if np.any(cumulative_toxicity > self.toxicity_thresholds):
            return -50.0  
            
        mean_toxicity = np.mean(cumulative_toxicity)
        
        score = (
            (self.weights["efficacy"] * raw_efficacy) +
            (self.weights["synergy"] * total_synergy) -
            (self.weights["toxicity"] * mean_toxicity)
        )
        return float(np.clip(score, -100.0, 1.0))
