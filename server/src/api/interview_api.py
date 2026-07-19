from fastapi import APIRouter, Depends, HTTPException
from src.schemas.interview_schema import InterviewCreate, InterviewResponse
from src.schemas.candidate_schema import CandidateCreate
from src.services.auth_service import get_current_user
from src.services.interview_service import interview_service
from src.services.candidate_service import candidate_service

router = APIRouter(prefix="/interviews", tags=["Interviews"])

@router.post("", response_model=InterviewResponse)
async def create_interview(request: InterviewCreate, current_user = Depends(get_current_user)):
    candidate = await candidate_service.get_candidate_by_user_id(current_user.id)
    if not candidate:
        candidate = await candidate_service.create_candidate(
            current_user.id,
            CandidateCreate(profile_jsonb={})
        )
    
    # Overwrite the candidate_id in the request to match the authenticated candidate
    request.candidate_id = candidate["id"]
    
    interview = await interview_service.create_interview(request)
    if not interview:
        raise HTTPException(status_code=500, detail="Failed to create interview session")
    return interview

@router.get("/{interview_id}", response_model=InterviewResponse)
async def read_interview(interview_id: str, current_user = Depends(get_current_user)):
    interview = await interview_service.get_interview(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found")
        
    candidate = await candidate_service.get_candidate_by_user_id(current_user.id)
    if not candidate or str(interview["candidate_id"]) != str(candidate["id"]):
        raise HTTPException(status_code=403, detail="Not authorized to access this interview session")
        
    return interview

@router.get("/{interview_id}/report")
async def read_report(interview_id: str, current_user = Depends(get_current_user)):
    interview = await interview_service.get_interview(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found")
        
    candidate = await candidate_service.get_candidate_by_user_id(current_user.id)
    if not candidate or str(interview["candidate_id"]) != str(candidate["id"]):
        raise HTTPException(status_code=403, detail="Not authorized to access this report")
        
    return {
        "status": interview["status"],
        "interview_score": interview["interview_score"],
        "interview_feedback": interview["interview_feedback"],
        "interview_report": interview["interview_report"]
    }

@router.get("/{interview_id}/job")
async def view_job(interview_id: str, current_user = Depends(get_current_user)):
    interview = await interview_service.get_interview(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found")
        
    candidate = await candidate_service.get_candidate_by_user_id(current_user.id)
    if not candidate or str(interview["candidate_id"]) != str(candidate["id"]):
        raise HTTPException(status_code=403, detail="Not authorized to access this job information")
        
    job = await interview_service.get_job_by_id(interview["job_id"])
    if not job:
        raise HTTPException(status_code=404, detail="Job related to the interview not found")
        
    return job
