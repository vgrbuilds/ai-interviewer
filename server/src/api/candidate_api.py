from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from src.schemas.candidate_schema import CandidateCreate, CandidateUpdate, ChangePasswordRequest
from src.services.auth_service import get_current_user
from src.services.candidate_service import candidate_service
from src.services.resume_service import resume_service
from src.agents.resume_parser import resume_parser_agent

router = APIRouter(prefix="/candidates", tags=["Candidates"])

@router.get("/me")
async def read_me(current_user = Depends(get_current_user)):
    candidate = await candidate_service.get_candidate_by_user_id(current_user.id)
    if not candidate:
        candidate = await candidate_service.create_candidate(
            current_user.id,
            CandidateCreate(profile_jsonb={})
        )
    return {
        "email": current_user.email,
        "id": current_user.id,
        "candidate": candidate
    }

@router.post("/change-password")
async def change_password(request: ChangePasswordRequest, current_user = Depends(get_current_user)):
    await candidate_service.update_password(current_user.id, request.new_password)
    return {"message": "Password changed successfully"}

@router.post("/resume")
async def upload_resume(file: UploadFile = File(...), current_user = Depends(get_current_user)):
    file_content = await file.read()
    file_path = await resume_service.upload_resume(current_user.id, file.filename, file_content)
    
    parsed_profile = await resume_parser_agent.parse_resume(file_content, file.filename)
    
    candidate = await candidate_service.get_candidate_by_user_id(current_user.id)
    if not candidate:
        await candidate_service.create_candidate(
            current_user.id,
            CandidateCreate(profile_jsonb=parsed_profile, resume_path=file_path)
        )
    else:
        await candidate_service.update_candidate(
            current_user.id, 
            CandidateUpdate(profile_jsonb=parsed_profile, resume_path=file_path)
        )
    return {
        "message": "Resume uploaded and parsed successfully",
        "resume_path": file_path,
        "profile_jsonb": parsed_profile
    }

@router.delete("/profile")
async def delete_profile(current_user = Depends(get_current_user)):
    await candidate_service.delete_candidate(current_user.id)
    return {"message": "Profile and user deleted successfully"}
