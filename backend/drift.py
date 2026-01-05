import numpy as np
from scipy.stats import ks_2samp

class DriftMonitor:
    def __init__(self, reference_data, p_val=0.05):
        """
        Initialize Drift Monitor using Kolmogorov-Smirnov (KS) Test (Scipy implementation).
        reference_data: Training data embeddings/vectors (The Baseline).
        """
        # Ensure data is dense (numpy array)
        if hasattr(reference_data, 'toarray'):
            reference_data = reference_data.toarray()
            
        self.reference_data = reference_data
        self.p_val = p_val
        self.n_features = reference_data.shape[1]
        
        print(f"DriftMonitor (Scipy): Initialized with {reference_data.shape[0]} samples and {self.n_features} features.")

    def check_drift(self, new_data):
        """
        Compare incoming 'new_data' against the reference set using Feature-wise KS Test.
        Returns drift status and metrics.
        """
        if hasattr(new_data, 'toarray'):
            new_data = new_data.toarray()
            
        n_new = new_data.shape[0]
        if n_new == 0:
             return {
                "is_drift": False,
                "p_value_avg": 1.0,
                "threshold": self.p_val,
                "message": "No new data to check.",
                "timestamp": str(np.datetime64('now'))
            }

        # Feature-wise KS Test
        p_values = []
        drifted_features = 0
        
        for i in range(self.n_features):
            # Extract feature column
            ref_feature = self.reference_data[:, i]
            new_feature = new_data[:, i]
            
            # Run KS Test
            # statistic, pvalue = ks_2samp(data1, data2)
            # ks_2samp handles different sample sizes fine.
            try:
                stat, p_val_feature = ks_2samp(ref_feature, new_feature)
            except Exception:
                p_val_feature = 1.0 # Fail safe
            
            p_values.append(p_val_feature)
            
            if p_val_feature < self.p_val:
                drifted_features += 1

        avg_p_val = float(np.mean(p_values)) if p_values else 0.0
        
        # Simple Aggregation Logic: 
        # If any feature drifted significantly? Or a percentage?
        # Alibi KSDrift often uses a correction (Bonferroni etc). 
        # Here we'll use a simple heuristic: if > 10% of features drift or avg p-val is very low.
        # But for strict compatibility with previous "is_drift" flag check:
        # Let's flag drift if ANY feature drifts, but maybe that's too sensitive.
        # Let's say if at least 1 feature drifts seriously.
        
        is_drift = drifted_features > 0
        
        # To be more robust vs noise, maybe require > 5% of features? 
        # For now, let's keep it sensitive.
        
        return {
            "is_drift": is_drift,
            "drifted_feature_count": drifted_features,
            "p_value_avg": avg_p_val,
            "threshold": self.p_val,
            "message": "Significant Drift Detected!" if is_drift else "Data Distribution Stable.",
            "timestamp": str(np.datetime64('now'))
        }

if __name__ == "__main__":
    # Test stub
    print("Testing DriftMonitor...")
    ref = np.random.normal(0, 1, (100, 5)) # 100 samples, 5 features
    monitor = DriftMonitor(ref)
    
    # Same distribution
    new_same = np.random.normal(0, 1, (50, 5))
    result_same = monitor.check_drift(new_same)
    print(f"Same Dist: {result_same['message']} (Drift: {result_same['is_drift']})")
    
    # Diff distribution
    new_diff = np.random.normal(2, 1, (50, 5)) # Mean shifted
    result_diff = monitor.check_drift(new_diff)
    print(f"Diff Dist: {result_diff['message']} (Drift: {result_diff['is_drift']})")
