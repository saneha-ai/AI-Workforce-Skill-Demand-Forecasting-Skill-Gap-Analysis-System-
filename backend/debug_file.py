import sys
import traceback
import os

with open("debug_result.txt", "w") as f:
    try:
        f.write(f"Python executable: {sys.executable}\n")
        f.write(f"CWD: {os.getcwd()}\n")
        
        f.write("Importing fastapi...\n")
        import fastapi
        f.write(f"FastAPI version: {fastapi.__version__}\n")
        
        f.write("Importing uvicorn...\n")
        import uvicorn
        
        f.write("Importing pandas...\n")
        import pandas as pd
        
        f.write("Importing multipart...\n")
        import python_multipart
        
        f.write("Importing pymupdf...\n")
        import fitz
        
        f.write("All imports successful.\n")
        
        # Test matcher
        from matcher import JobMatcher
        matcher = JobMatcher("c:/Users/vinit/OneDrive/Desktop/career_match12/dataset.csv")
        f.write(f"Matcher loaded. Rows: {len(matcher.df)}\n")
        
        f.write("Validation complete.\n")
        
    except Exception as e:
        f.write("EXCEPTION OCCURRED:\n")
        f.write(traceback.format_exc())
