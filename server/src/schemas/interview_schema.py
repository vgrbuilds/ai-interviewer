from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID

class InterviewCreate(BaseModel):
    candidate_id: UUID
    job_id: UUID
    status: Optional[str] = "preparing"

class InterviewUpdate(BaseModel):
    status: Optional[str] = None
    question_sequence: Optional[List[UUID]] = None
    answer_sequence: Optional[List[UUID]] = None
    interview_report: Optional[Dict[str, Any]] = None
    interview_score: Optional[float] = None
    interview_feedback: Optional[str] = None

class InterviewResponse(BaseModel):
    id: UUID
    candidate_id: UUID
    job_id: UUID
    status: str
    question_sequence: Optional[List[UUID]] = None
    answer_sequence: Optional[List[UUID]] = None
    interview_report: Optional[Dict[str, Any]] = None
    interview_score: Optional[float] = None
    interview_feedback: Optional[str] = None
    created_at: datetime
    updated_at: datetime
