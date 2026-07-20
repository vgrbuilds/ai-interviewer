from typing import List
from fastapi import APIRouter, Depends, HTTPException
from src.schemas.job_schema import JobCreate, JobResponse
from src.services.auth_service import get_current_user
from src.services.job_service import job_service

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("", response_model=JobResponse)
async def create_job(request: JobCreate, current_user = Depends(get_current_user)):
    job = await job_service.create_job(request)
    if not job:
        raise HTTPException(status_code=500, detail="Failed to create job")
    return job

@router.get("", response_model=List[JobResponse])
async def list_jobs(current_user = Depends(get_current_user)):
    return await job_service.get_all_jobs()

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, current_user = Depends(get_current_user)):
    job = await job_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job