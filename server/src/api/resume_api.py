from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from src.services.auth_service import get_current_user
from src.services.resume_service import resume_service
from src.services.candidate_service import candidate_service
from src.schemas.candidate_schema import CandidateCreate, CandidateUpdate

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...), current_user = Depends(get_current_user)):
    file_content = await file.read()
    file_path = await resume_service.upload_resume(current_user.id, file.filename, file_content)
    
    candidate = await candidate_service.get_candidate_by_user_id(current_user.id)
    if not candidate:
        await candidate_service.create_candidate(
            current_user.id,
            CandidateCreate(profile_jsonb={}, resume_path=file_path)
        )
    else:
        await candidate_service.update_candidate(
            current_user.id,
            CandidateUpdate(resume_path=file_path)
        )
    return {"message": "Resume uploaded successfully", "resume_path": file_path}

@router.get("/view")
async def view_resume(current_user = Depends(get_current_user)):
    candidate = await candidate_service.get_candidate_by_user_id(current_user.id)
    if not candidate or not candidate.get("resume_path"):
        raise HTTPException(status_code=404, detail="No resume found for candidate")
        
    url = await resume_service.get_resume_url(candidate["resume_path"])
    return {"resume_url": url, "resume_path": candidate["resume_path"]}

@router.delete("/delete")
async def delete_resume(current_user = Depends(get_current_user)):
    candidate = await candidate_service.get_candidate_by_user_id(current_user.id)
    if not candidate or not candidate.get("resume_path"):
        raise HTTPException(status_code=404, detail="No resume found to delete")
        
    file_path = candidate["resume_path"]
    await resume_service.delete_resume(file_path)
    
    await candidate_service.update_candidate(
        current_user.id,
        CandidateUpdate(resume_path="")
    )
    return {"message": "Resume deleted successfully"}