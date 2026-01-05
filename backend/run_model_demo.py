
import requests
import json
import time

BASE_URL = "http://localhost:8006"

def run_job_matching():
    print("\n--- Running Job Matching Model ---")
    url = f"{BASE_URL}/match_jobs"
    payload = {
        "skills": ["python", "machine learning", "data science", "sql", "pandas"]
    }
    print(f"Input Skills: {payload['skills']}")
    try:
        start = time.time()
        response = requests.post(url, json=payload)
        latency = time.time() - start
        
        if response.status_code == 200:
            matches = response.json().get("matches", [])
            print(f"Success! Found {len(matches)} matches in {latency:.2f}s.")
            for i, match in enumerate(matches[:3]):
                print(f"  {i+1}. {match['job_role']} ({match['company']}) - Score: {match['match_score']}%")
        else:
            print(f"Failed: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def run_drift_detection():
    print("\n--- Running Drift Detection Model ---")
    url = f"{BASE_URL}/debug_drift"
    # Simulating a batch of new data
    payload = {
        "skills_batch": [
            ["python", "java", "c++"], # Somewhat standard
            ["react", "node", "javascript"], # Web dev
            ["assembly", "fortran", "cobol"] # Outlier/Drift?
        ]
    }
    try:
        start = time.time()
        response = requests.post(url, json=payload)
        latency = time.time() - start
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success! Drift Check in {latency:.2f}s.")
            print(f"  Drift Detected: {result['is_drift']}")
            print(f"  Message: {result['message']}")
            print(f"  P-Value Avg: {result['p_value_avg']:.4f}")
        else:
            print(f"Failed: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Connecting to Model Server...")
    run_job_matching()
    run_drift_detection()
