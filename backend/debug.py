import sys
import traceback
import os

print(f"Python executable: {sys.executable}")
print(f"CWD: {os.getcwd()}")

try:
    print("Importing fastapi...")
    from fastapi import FastAPI
    print("Importing uvicorn...")
    import uvicorn
    print("Importing pandas...")
    import pandas as pd
    print("Importing matcher...")
    from matcher import JobMatcher
    print("All imports successful.")
    
    print("Initializing components...")
    # Fix path logic to match main.py
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATASET_PATH = os.path.join(BASE_DIR, "..", "dataset.csv")
    print(f"Dataset path: {DATASET_PATH}")
    
    matcher = JobMatcher(DATASET_PATH)
    print(f"Dataset loaded. Rows: {len(matcher.df)}")
    if not matcher.df.empty:
        print(f"Columns: {list(matcher.df.columns)}")
    else:
        print("Dataset is empty or failed to load.")

except Exception:
    traceback.print_exc()
