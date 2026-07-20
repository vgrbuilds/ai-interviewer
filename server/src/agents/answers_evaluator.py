import json
from typing import List, Dict, Any

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI

from src.core.config import settings

# Prompt Template instructing Gemini to return JSON with score and feedback
PROMPT_TEMPLATE = """
Candidate Q&A History:
{qa_history}

Task: Evaluate the candidate's overall interview performance based on the questions asked and answers provided.
Provide an overall numeric score between 0.0 and 10.0, and a concise summary feedback highlighting strengths and key areas for improvement.

Output Format:
Return ONLY a raw JSON object with fields "interview_score" and "interview_feedback":
{{
  "interview_score": 8.5,
  "interview_feedback": "The candidate demonstrated strong knowledge of core concepts..."
}}

Rules:
- interview_score must be a number between 0.0 and 10.0.
- interview_feedback must be a clear, constructive summary text.
- Return ONLY valid raw JSON. Do not wrap in markdown code blocks or add extra text.
"""


class AnswersEvaluatorAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model=getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash"),
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2,
        )
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert AI interview evaluator. Return only a raw JSON object."),
            ("human", PROMPT_TEMPLATE)
        ])
        
        # LCEL pipeline using StrOutputParser
        self.chain = self.prompt | self.llm | StrOutputParser()

    async def evaluate_answers(self, qa_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Evaluates a list of Q&A dicts and returns a dict with interview_score and interview_feedback."""
        raw_text = await self.chain.ainvoke({"qa_history": json.dumps(qa_history)})
        
        cleaned_text = raw_text.strip()
        if cleaned_text.startswith("```"):
            lines = cleaned_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned_text = "\n".join(lines).strip()

        try:
            res = json.loads(cleaned_text)
            return {
                "interview_score": float(res.get("interview_score", 0.0)),
                "interview_feedback": str(res.get("interview_feedback", "Evaluation failed."))
            }
        except Exception:
            return {
                "interview_score": 0.0,
                "interview_feedback": "Unable to parse evaluation response."
            }

answers_evaluator_agent = AnswersEvaluatorAgent()
