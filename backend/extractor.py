import re
import fitz  # PyMuPDF

class ResumeExtractor:
    def __init__(self, known_skills=None):
        """
        known_skills: A set/list of skills to look for (vocabulary).
        If None, extraction will be less accurate (just simple patterns).
        """
        self.known_skills = set([s.lower() for s in known_skills]) if known_skills else set()

    def extract_text_from_pdf(self, pdf_path):
        try:
            doc = fitz.open(pdf_path)
            text = ""
            for page in doc:
                text += page.get_text()
            return text
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return ""

    def extract_skills_from_text(self, text):
        """
        Simple keyword-based extraction using the dataset vocabulary.
        """
        text_lower = text.lower()
        extracted = []
        
        if not self.known_skills:
            # Fallback simple extraction if no vocab (not ideal)
            return []

        for skill in self.known_skills:
            # Use regex to match whole words/phrases to avoid partial matches (e.g., 'c' in 'score')
            # Escape regex special chars in skill names like 'c++'
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                extracted.append(skill)
        
        return list(set(extracted))

    def parse_resume(self, pdf_path):
        text = self.extract_text_from_pdf(pdf_path)
        skills = self.extract_skills_from_text(text)
        
        return {
            "text": text[:1000] + "...", # Preview
            "skills": skills
        }
