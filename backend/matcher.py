import pandas as pd
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import math
import mlflow
import mlflow.sklearn
import shap



class JobMatcher:
    def __init__(self, dataset_path="c:/Users/vinit/OneDrive/Desktop/career_match12/dataset.csv"):
        self.dataset_path = dataset_path
        if not os.path.exists(self.dataset_path):
            # Fallback for relative path if absolute fails or for flexibility
            self.dataset_path = os.path.join(os.path.dirname(__file__), "dataset.csv")
        
        try:
            self.df = pd.read_csv(self.dataset_path)
            # Ensure required_skills is string and normalize
            self.df['required_skills'] = self.df['required_skills'].astype(str).str.lower()
            
            # Prepare TF-IDF Vectorizer
            # We treat the 'required_skills' column as our document corpus
            self.vectorizer = TfidfVectorizer(stop_words='english')
            self.job_vectors = self.vectorizer.fit_transform(self.df['required_skills'])
            
            # --- MLflow Initialization ---
            try:
                import json
                mlflow.set_experiment("CareerMatch_JobMatcher")
                with mlflow.start_run(run_name="Model_Initialization", nested=True):
                    mlflow.log_param("dataset_path", self.dataset_path)
                    mlflow.log_param("dataset_rows", len(self.df))
                    mlflow.log_param("vocabulary_size", len(self.vectorizer.get_feature_names_out()))
                    
                    # Log Artifact: Dataset Info
                    dataset_info = {
                        "columns": list(self.df.columns),
                        "shape": self.df.shape,
                        "sample_skills": self.vectorizer.get_feature_names_out()[:10].tolist()
                    }
                    info_file = "dataset_info.json"
                    with open(info_file, "w") as f:
                        json.dump(dataset_info, f, indent=2)
                    mlflow.log_artifact(info_file)
                    if os.path.exists(info_file):
                        os.remove(info_file)
            except Exception as e:
                print(f"MLflow Init Error: {e}")
            
        except Exception as e:
            print(f"Error loading dataset: {e}")
            self.df = pd.DataFrame()
            self.vectorizer = None

    def match_jobs(self, user_skills):
        """
        Matches user skills against the dataset using Cosine Similarity.
        user_skills: list of strings (e.g. ['python', 'sql'])
        Returns: list of dicts with job details and match score.
        """
        if self.df.empty or self.vectorizer is None:
            return []

        # Convert user skills list to a single string for vectorization
        user_skills_str = " ".join([s.lower() for s in user_skills])
        
        # Vectorize user skills
        user_vector = self.vectorizer.transform([user_skills_str])
        
        # Calculate Cosine Similarity
        # similaries is an array of shape (1, num_jobs)
        similarities = cosine_similarity(user_vector, self.job_vectors).flatten()
        
        results = []
        
        # Normalize user skills set for missing skills calculation (still useful context)
        user_skills_set = set([s.lower().strip() for s in user_skills])

        for index, row in self.df.iterrows():
            sim_score = similarities[index]
            
            # Convert similarity (0-1) to percentage (0-100)
            score = sim_score * 100
            
            # Jaccard/Set logic for 'Missing Skills' display (Vector doesn't tell us exactly WHAT is missing easily)
            job_skills_raw = row['required_skills']
            job_skills_list = [s.strip() for s in job_skills_raw.split(',')]
            job_skills_set = set(job_skills_list)
            
            matched = user_skills_set.intersection(job_skills_set)
            missing = job_skills_set - user_skills_set
            
            results.append({
                "job_role": row['job_role'],
                "match_score": round(score, 2),
                "matched_skills": list(matched),
                "missing_skills": list(missing),
                "required_skills": job_skills_list,
                "min_experience": row.get('min_experience', 'N/A'),
                "avg_salary": row.get('avg_salary', 'N/A'),
                "domain": row.get('domain', 'N/A'),
                "company": row.get('company', 'Confidential')
            })
            
        # Sort by score descending
        results.sort(key=lambda x: x['match_score'], reverse=True)
        
        top_matches = results[:5]

        # --- MLflow Logging ---
        try:
            with mlflow.start_run(run_name="Match_Request", nested=True):
                mlflow.log_param("user_skills_raw", str(user_skills))
                mlflow.log_param("num_skills_provided", len(user_skills))
                mlflow.log_metric("match_count", len(results))
                if top_matches:
                    mlflow.log_metric("top_match_score", top_matches[0]['match_score'])
                    avg_score = sum(m['match_score'] for m in top_matches) / len(top_matches)
                    mlflow.log_metric("avg_top5_score", avg_score)
                    
                    # Log Artifact: Match Results
                    import json
                    results_file = "match_results.json"
                    with open(results_file, "w") as f:
                        json.dump(top_matches, f, indent=2)
                    mlflow.log_artifact(results_file)
                    if os.path.exists(results_file):
                        os.remove(results_file)

        except Exception as e:
            print(f"MLflow Logging Error: {e}")

        return top_matches  # Return top 5 matches



    def get_all_skills(self):
        """
        Returns a set of all unique skills in the dataset.
        Useful for extraction vocabulary.
        """
        if self.df.empty:
            return set()
        
        all_skills = set()
        for skills_str in self.df['required_skills']:
            for s in skills_str.split(','):
                all_skills.add(s.strip())
        return all_skills

    def explain_match(self, user_skills, job_role):
        """
        Explains why user_skills matched with a specific job_role.
        Returns a list of contributing features (skills) and their SHAP/importance values.
        """
        if self.df.empty or self.vectorizer is None:
            return {"error": "Model not valid"}

        # Find the specific job vector
        job_row = self.df[self.df['job_role'] == job_role]
        if job_row.empty:
            return {"error": "Job not found"}
        
        job_idx = job_row.index[0]
        # Get density matrix row
        job_vec = self.job_vectors[job_idx].toarray().flatten()

        # Vectorize user skills
        user_skills_str = " ".join([s.lower() for s in user_skills])
        user_vec = self.vectorizer.transform([user_skills_str]).toarray().flatten()

        # Calculate Element-wise contribution (Linear SHAP for Cosine/Dot Product)
        # Contribution = User_TFIDF * Job_TFIDF
        contributions = user_vec * job_vec
        
        # Get Feature Names
        feature_names = self.vectorizer.get_feature_names_out()

        # Create list of (feature, value)
        explanation = []
        for i, val in enumerate(contributions):
            if val > 0: # Only positive contributions (matches)
                explanation.append({
                    "feature": feature_names[i],
                    "value": round(float(val), 4)
                })
        
        # Sort by impact
        explanation.sort(key=lambda x: x['value'], reverse=True)
        
        return {
            "job_role": job_role,
            "explanation": explanation,
            "base_value": 0.0 # Cosine baseline
        }
