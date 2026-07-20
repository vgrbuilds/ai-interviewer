import json
from typing import Dict, Any
from langchain_core.tools import tool
from src.services.interview_service import interview_service
from src.services.candidate_service import candidate_service

# 1. LangChain Tool Function (Async)
@tool
async def get_interview_context(interview_id: str) -> Dict[str, Any]:
    """Asynchronously fetches job details (role, description) and candidate profile JSON for an interview ID."""
    interview = await interview_service.get_interview(interview_id)
    if not interview:
        raise ValueError(f"Interview session with ID {interview_id} not found")
        
    job = await interview_service.get_job_by_id(interview["job_id"])
    candidate = await candidate_service.get_candidate_by_id(interview["candidate_id"])
    
    return {
        "job_role": job.get("job_role", "") if job else "",
        "job_description": job.get("job_description", "") if job else "",
        "candidate_profile": candidate.get("profile_jsonb", {}) if candidate else {}
    }