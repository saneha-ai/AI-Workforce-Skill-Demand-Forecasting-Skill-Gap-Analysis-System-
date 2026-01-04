print("DEBUG: Starting debugging...")
try:
    print("DEBUG: Importing dotenv...")
    from dotenv import load_dotenv
    load_dotenv()
    print("DEBUG: dotenv loaded.")

    print("DEBUG: Importing fastapi...")
    from fastapi import FastAPI
    print("DEBUG: fastapi imported.")

    print("DEBUG: Importing matcher...")
    from matcher import JobMatcher
    print("DEBUG: matcher imported.")

    print("DEBUG: Importing extractor...")
    from extractor import ResumeExtractor
    print("DEBUG: extractor imported.")

    print("DEBUG: Importing chatbot...")
    from chatbot import CareerChatbot
    print("DEBUG: chatbot imported.")
    
    print("DEBUG: Importing database...")
    from database import engine, Base
    print("DEBUG: database imported.")

    print("DEBUG: Importing auth...")
    from auth import router as auth_router
    print("DEBUG: auth imported.")
    
    print("DEBUG: Importing report_generator...")
    from report_generator import generate_company_report
    print("DEBUG: report_generator imported.")

    print("DEBUG: All imports successful. Importing main app...")
    import main
    print("DEBUG: main imported.")

except Exception as e:
    print(f"DEBUG: Exception during imports: {e}")
    import traceback
    traceback.print_exc()
