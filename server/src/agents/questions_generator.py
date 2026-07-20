import json
from typing import List, Dict, Any

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI

from src.core.config import settings

# Hardcoded JSON Format Instructions in Prompt (No Pydantic Schema required)
PROMPT_TEMPLATE = """
Interview Plan Blueprint:
{blueprint}

Task: Based on the blueprint, generate a JSON array of interview questions.
Each object in the JSON array MUST strictly match this format:
[
  {{
    "topics": ["Topic1", "Topic2"],
    "question_type": "technical",
    "question_str": "What is ...?",
    "difficulty": "medium"
  }}
]

Rules:
- question_type must be strictly either 'technical' or 'behavioral'.
- difficulty must be strictly either 'easy', 'medium', or 'hard'.
- Return ONLY the raw JSON array. Do not wrap in markdown codeblocks or extra commentary.
"""


class QuestionsGeneratorAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model=getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash"),
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.3,
        )
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert AI interviewer. Output only valid raw JSON arrays."),
            ("human", PROMPT_TEMPLATE)
        ])
        
        # LCEL pipeline using StrOutputParser
        self.chain = self.prompt | self.llm | StrOutputParser()

    async def generate_questions(self, blueprint: str) -> List[Dict[str, Any]]:
        """Generates a JSON list of question objects directly from prompt format instructions."""
        raw_text = await self.chain.ainvoke({"blueprint": blueprint})
        
        # Strip potential markdown formatting (```json ... ```)
        cleaned_text = raw_text.strip()
        if cleaned_text.startswith("```"):
            lines = cleaned_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned_text = "\n".join(lines).strip()

        try:
            questions = json.loads(cleaned_text)
            return questions if isinstance(questions, list) else []
        except Exception:
            return []

questions_generator_agent = QuestionsGeneratorAgent()