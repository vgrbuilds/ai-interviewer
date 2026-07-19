from pydantic import BaseModel
from typing import Optional

class ResumeUploadResponse(BaseModel):
    message: str
    resume_path: str
