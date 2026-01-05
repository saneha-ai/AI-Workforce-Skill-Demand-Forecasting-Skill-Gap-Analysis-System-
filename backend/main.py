from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import shutil
import os
from dotenv import load_dotenv

load_dotenv()

from matcher import JobMatcher
from extractor import ResumeExtractor
from chatbot import CareerChatbot
from database import engine, Base
from auth import router as auth_router

from report_generator import generate_company_report

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Career Mentor")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from prometheus_fastapi_instrumentator import Instrumentator

Instrumentator().instrument(app).expose(app)

app.include_router(auth_router)

# Initialize modules
# Ensure dataset path is correct relative to main.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "..", "dataset.csv")

from drift import DriftMonitor

matcher = JobMatcher(DATASET_PATH)
extractor = ResumeExtractor(known_skills=matcher.get_all_skills())
chatbot = CareerChatbot()

# Initialize Drift Monitor using Job Vectors as Reference
drift_monitor = None
try:
    if matcher.job_vectors is not None:
        drift_monitor = DriftMonitor(matcher.job_vectors)
    else:
        print("Warning: Job Vectors empty, Drift Monitor skipped.")
except Exception as e:
    print(f"Drift Init Error: {e}")

class SkillRequest(BaseModel):
    skills: List[str]

class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None

class ReportRequest(BaseModel):
    skills: List[str]
    matches: List[dict]

@app.get("/")
def read_root():
    return {"message": "AI Career Mentor API is running"}

@app.post("/upload_resume")
async def upload_resume(file: UploadFile = File(...)):
    try:
        # Save temp file
        temp_filename = f"temp_{file.filename}"
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Parse
        parsing_result = extractor.parse_resume(temp_filename)
        extracted_skills = parsing_result["skills"]
        
        # Match
        matches = matcher.match_jobs(extracted_skills)
        
        # Cleanup
        os.remove(temp_filename)
        
        return {
            "extracted_skills": extracted_skills,
            "matches": matches,
            "resume_text_preview": parsing_result["text"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/match_jobs")
def match_jobs_endpoint(request: SkillRequest):
    matches = matcher.match_jobs(request.skills)
    return {"matches": matches}

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    response = chatbot.get_response(request.message, request.context)
    return {"response": response}

@app.post("/generate_report")
def generate_report_endpoint(request: ReportRequest):
    # Pass matcher.df so we can look up dataset companies
    report = generate_company_report(request.skills, request.matches, matcher.df)
    return {"report": report}

class ExplainRequest(BaseModel):
    skills: List[str]
    job_role: str

@app.post("/explain_match")
def explain_match_endpoint(request: ExplainRequest):
    explanation = matcher.explain_match(request.skills, request.job_role)
    if "error" in explanation:
        raise HTTPException(status_code=404, detail=explanation["error"])
    return explanation

class DriftRequest(BaseModel):
    skills_batch: List[List[str]]

@app.post("/debug_drift")
def debug_drift_endpoint(request: DriftRequest):
    if not drift_monitor:
         raise HTTPException(status_code=503, detail="Drift Monitor not initialized")
         
    # Convert batch of skills -> Strings -> Vectors
    batch_strings = [" ".join(skills).lower() for skills in request.skills_batch]
    
    # Use existing vectorizer
    if not matcher.vectorizer:
        raise HTTPException(status_code=500, detail="Vectorizer not found")
        
    new_vectors = matcher.vectorizer.transform(batch_strings)
    
    # Check
    report = drift_monitor.check_drift(new_vectors)
    return report

if __name__ == "__main__":
    import uvicorn
    print("Starting process...")
    try:
        import uvicorn
        print("Uvicorn imported.")
        with open("server_startup.log", "w") as f:
            f.write("Starting server on port 8006...\n")
        print("About to run uvicorn...")
        uvicorn.run(app, host="0.0.0.0", port=8006)
    except Exception as e:
        print(f"Error: {e}")
        with open("server_error.log", "w") as f:
            f.write(str(e))

