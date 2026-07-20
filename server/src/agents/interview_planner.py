import json
from typing import Dict, Any
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from src.tools.get_interview_context import get_interview_context
from src.core.config import settings

# Prompt format to generate the plan
PLAN_FORMAT = """
=== INTERVIEW PLAN & STRATEGY ===
Focus Areas:
- [Key Focus Area 1]
- [Key Focus Area 2]

Question Strategy & Sequence:
1. Topic: [Topic Name] | Type: [Technical/Behavioral] | Difficulty: [Easy/Medium/Hard]
   Rationale: [Short reason for selecting this question]
2. Topic: [Topic Name] | Type: [Technical/Behavioral] | Difficulty: [Easy/Medium/Hard]
   Rationale: [Short reason for selecting this question]
3. Topic: [Topic Name] | Type: [Technical/Behavioral] | Difficulty: [Easy/Medium/Hard]
   Rationale: [Short reason for selecting this question]
4. Topic: [Topic Name] | Type: [Technical/Behavioral] | Difficulty: [Easy/Medium/Hard]
   Rationale: [Short reason for selecting this question]
5. Topic: [Topic Name] | Type: [Technical/Behavioral] | Difficulty: [Easy/Medium/Hard]
   Rationale: [Short reason for selecting this question]
"""


#LangChain Agent Class
class InterviewPlannerAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model=getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash"),
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2,
        )
        
        self.prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                "You are an expert AI interview planner. Analyze the candidate profile and job requirements "
                "to create a concise, 5-question interview strategy manual. Be token-efficient."
            ),
            (
                "human",
                "Job Role: {job_role}\n"
                "Job Description: {job_description}\n"
                "Candidate Profile: {candidate_profile}\n\n"
                "Output the interview plan strictly following this format:\n"
                f"{PLAN_FORMAT}"
            )
        ])
        
        # LangChain Expression Language (LCEL) chain pipeline
        self.chain = self.prompt | self.llm | StrOutputParser()

    async def generate_plan(self, interview_id: str) -> str:
        # Step 1: Execute LangChain context tool asynchronously
        context = await get_interview_context.ainvoke({"interview_id": interview_id})
        
        # Step 2: Run LangChain LCEL chain pipeline
        plan_text = await self.chain.ainvoke({
            "job_role": context["job_role"],
            "job_description": context["job_description"],
            "candidate_profile": json.dumps(context["candidate_profile"])
        })
        
        return plan_text

interview_planner_agent = InterviewPlannerAgent()
