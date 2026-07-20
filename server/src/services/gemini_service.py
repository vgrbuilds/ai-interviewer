from google import genai
from src.core.config import settings

class geminiService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = settings.GEMINI_MODEL or "gemini-flash-latest"
    async def generate(self,prompt):
        response = self.client.models.generate_content(model = self.model , contents= prompt)
        return response.text 
    
