from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class CandidateCreate(BaseModel):
    profile_jsonb: Dict[str, Any]
    resume_path: Optional[str] = None

class CandidateUpdate(BaseModel):
    profile_jsonb: Optional[Dict[str, Any]] = None
    resume_path: Optional[str] = None

class CandidateResponse(BaseModel):
    id: UUID
    user_id: UUID
    profile_jsonb: Dict[str, Any]
    resume_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class ChangePasswordRequest(BaseModel):
    new_password: str
