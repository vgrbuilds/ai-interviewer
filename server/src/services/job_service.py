from supabase import Client
from server.src.core import supabase
from src.schemas.job_schema import JobCreate

class JobService:
    def __init__(self, client: Client):
        self.client = client

    async def create_job(self, data: JobCreate):
        response = self.client.table("jobs").insert({
            "company_name": data.company_name,
            "job_role": data.job_role,
            "job_description": data.job_description,
            "job_skills": data.job_skills
        }).execute()
        return response.data[0] if response.data else None

    async def get_job(self, job_id: str):
        response = self.client.table("jobs").select("*").eq("id", job_id).execute()
        if not response.data:
            return None
        return response.data[0]

job_service = JobService(supabase.supabase)
