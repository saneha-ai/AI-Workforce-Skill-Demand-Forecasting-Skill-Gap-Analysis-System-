
import os
import shutil
from matcher import JobMatcher

def test_mlflow_integration():
    print("Testing MLflow Integration...")
    
    # Clean up previous runs if any
    if os.path.exists("mlruns"):
        print("Existing mlruns found.")
    
    try:
        matcher = JobMatcher()
        print("JobMatcher initialized.")
        
        matches = matcher.match_jobs(["python", "data science"])
        print(f"Matches found: {len(matches)}")
        
        if os.path.exists("mlruns"):
            print("SUCCESS: 'mlruns' directory created.")
            # Could add more granular checks here if needed
        else:
            print("FAILURE: 'mlruns' directory not found.")
            
    except Exception as e:
        print(f"Test failed with exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_mlflow_integration()
