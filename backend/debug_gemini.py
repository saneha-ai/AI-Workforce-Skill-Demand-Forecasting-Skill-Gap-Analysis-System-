
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

print(f"DEBUG: API Key present: {bool(api_key)}")

if api_key:
    genai.configure(api_key=api_key)
    # Using the same model as in chatbot.py
    model_name = 'gemini-flash-latest'
    print(f"DEBUG: Testing model: {model_name}")
    
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hello, can you hear me?")
        print("SUCCESS: Response received:")
        print(response.text)
    except Exception as e:
        print("\nERROR DETAILS:")
        print(f"Type: {type(e)}")
        print(f"Message: {e}")
        # Print attributes if it's a Google API error
        if hasattr(e, 'args'):
            print(f"Args: {e.args}")
else:
    print("ERROR: GEMINI_API_KEY not found in environment variables.")
