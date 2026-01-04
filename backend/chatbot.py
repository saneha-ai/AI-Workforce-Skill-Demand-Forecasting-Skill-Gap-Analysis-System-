
import os
import google.generativeai as genai

MASTER_SYSTEM_PROMPT = """
You are an AI Career Mentor Chatbot for the "Antigravity" platform.
Your role is to guide users in their career journey using their profile, skills, location, and job preferences.

Your core responsibilities:
1. Answer user queries about jobs, skills, resumes, and interviews.
2. Analyze the user's skillset and suggest career paths.
3. Provide job recommendations based on top skills and dataset roles.
4. Explain missing skills and create a learning roadmap.
5. If location is provided, show nearby jobs within 50km radius.
6. Follow the user's chat history to provide contextual responses.

RULES:
- Always reply in an encouraging, clear and professional tone.
- Avoid hallucination. If unsure, ask for clarification.
- Reference only the dataset skills & roles when making recommendations.
- Ask questions if input is incomplete.
- Never provide medical, political or personal financial advice.
- Keep every response short and actionable (6-10 lines max).

RESPONSE FORMAT:
**
"Here’s what I found 👇"
- Extracted Skills → [ ]
- Best Matched Roles → Role (score%)
- Nearby Job Options → if location available
- Missing Skills → [ ]
- Roadmap → Step 1, Step 2, Step 3
**
Add motivational closing line: 
"You're doing great — let’s move one step at a time 🚀"

CONTEXT MEMORY RULE:
If user shares skills or resume once, remember it for future replies in this session.

If user uploads a resume, do:
- Extract skills
- Skill gaps
- Strong points
- Suggest job roles

If user asks:
"Where should I start?"
Respond with:
"Tell me your top 3 skills, current city, and target job role."

If user asks for companies:
Match role → skills → suggest companies known to hire for them.
"""

class CareerChatbot:
    def __init__(self):
        self.system_prompt = MASTER_SYSTEM_PROMPT
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = None
        
        if self.api_key:
            genai.configure(api_key=self.api_key)
            # Use 'gemini-flash-latest' for better stability/quota management
            self.model = genai.GenerativeModel('gemini-flash-latest')

    def get_response(self, user_message, context=""):
        msg_lower = user_message.lower().strip()

        # --- 1. LOCAL INTENT DETECTION (Save API Calls) ---
        
        # Intent: Starting out
        if msg_lower in ["where should i start?", "how do i start?", "start"]:
            return "Tell me your top 3 skills, current city, and target job role."

        # Intent: Resume Upload Help
        if "upload" in msg_lower and "resume" in msg_lower:
            return "You can upload your resume using the 'Start Analysis' button on the dashboard or the upload section above. Once uploaded, I can give you specific career advice!"

        # Intent: Company Recommendations (Simplified Local Check)
        if "companies" in msg_lower and "recommend" in msg_lower:
            return "I can definitely help with that! If you have processed your resume, check the 'Career Strategy' report at the bottom of the dashboard for detailed company recommendations."

        # --- 2. AI GENERATION (Fallback to LLM) ---
        if not self.model:
            # Try reloading key in case it was set after init
            self.api_key = os.getenv("GEMINI_API_KEY")
            if self.api_key:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-flash-latest')
            else:
                return "⚠️ **API Key Missing**: Please set the `GEMINI_API_KEY` environment variable."

        try:
            # Construct prompt with context
            full_prompt = f"{self.system_prompt}\n\n=== CONTEXT ===\n{str(context)}\n\n=== USER MESSAGE ===\n{user_message}"
            
            response = self.model.generate_content(full_prompt)
            return response.text
            
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg:
                return "📉 **High Traffic**: I'm receiving too many requests right now. Please wait 1 minute and try again."
            return f"❌ **AI Error**: {error_msg}"
