import json
from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from src.core.config import settings

class ExperienceItem(BaseModel):
    company: str
    role: str
    duration: Optional[str] = None
    description: Optional[str] = None

class ProjectItem(BaseModel):
    name: str
    description: Optional[str] = None
    tech_stack: Optional[List[str]] = Field(default_factory=list)

class SkillsSchema(BaseModel):
    languages: List[str] = Field(default_factory=list)
    frameworks: List[str] = Field(default_factory=list)
    databases: List[str] = Field(default_factory=list)
    tools: List[str] = Field(default_factory=list)

class EducationItem(BaseModel):
    degree: Optional[str] = None
    university: Optional[str] = None
    year: Optional[str] = None

class CandidateProfile(BaseModel):
    name: str = "Candidate"
    summary: Optional[str] = ""
    experience: List[ExperienceItem] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    skills: SkillsSchema = Field(default_factory=SkillsSchema)
    education: Optional[EducationItem] = None

class ResumeParserAgent:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash")

    async def parse_resume(self, file_bytes: bytes, filename: str) -> dict:
        prompt = (
            "Extract structured candidate profile details from the attached resume. "
            "Return concise, accurate facts in JSON matching the schema."
        )

        mime_type = "application/pdf" if filename.lower().endswith(".pdf") else "text/plain"
        
        if mime_type == "text/plain":
            try:
                text_content = file_bytes.decode("utf-8")
                parts = [f"{prompt}\n\nResume Text:\n{text_content}"]
            except Exception:
                parts = [prompt, types.Part.from_bytes(data=file_bytes, mime_type=mime_type)]
        else:
            parts = [prompt, types.Part.from_bytes(data=file_bytes, mime_type=mime_type)]

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=CandidateProfile,
            temperature=0.1,
        )

        response = self.client.models.generate_content(
            model=self.model,
            contents=parts,
            config=config,
        )

        try:
            return json.loads(response.text)
        except Exception:
            return CandidateProfile().model_dump()

resume_parser_agent = ResumeParserAgent()

