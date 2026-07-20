from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class JobCreate(BaseModel):
    company_name: Optional[str] = None
    job_role: str
    job_description: str
    job_skills: Optional[Dict[str, Any]] = None

class JobResponse(BaseModel):
    id: UUID
    company_name: Optional[str] = None
    job_role: str
    job_description: str
    job_skills: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
