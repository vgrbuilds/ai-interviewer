from supabase import Client
from server.src.core import supabase
from src.schemas.interview_schema import InterviewCreate, InterviewUpdate

class InterviewService:
    def __init__(self, client: Client):
        self.client = client

    async def create_interview(self, data: InterviewCreate):
        response = self.client.table("interviews").insert({
            "candidate_id": str(data.candidate_id),
            "job_id": str(data.job_id),
            "status": data.status or "preparing"
        }).execute()
        return response.data[0] if response.data else None

    async def get_interview(self, interview_id: str):
        response = self.client.table("interviews").select("*").eq("id", interview_id).execute()
        if not response.data:
            return None
        return response.data[0]

    async def update_interview(self, interview_id: str, data: InterviewUpdate):
        update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items()}
        if not update_data:
            return await self.get_interview(interview_id)
        
        # Format UUIDs or elements if necessary, but Pydantic serialization handles lists/uuids.
        # However, list of UUIDs might need conversion to list of strings for standard JSON serialization.
        if "question_sequence" in update_data and update_data["question_sequence"] is not None:
            update_data["question_sequence"] = [str(x) for x in update_data["question_sequence"]]
        if "answer_sequence" in update_data and update_data["answer_sequence"] is not None:
            update_data["answer_sequence"] = [str(x) for x in update_data["answer_sequence"]]
            
        update_data["updated_at"] = "now()"
        response = self.client.table("interviews").update(update_data).eq("id", interview_id).execute()
        return response.data[0] if response.data else None

    async def delete_interview(self, interview_id: str):
        response = self.client.table("interviews").delete().eq("id", interview_id).execute()
        return response.data if response.data else None

    async def get_job_by_id(self, job_id: str):
        response = self.client.table("jobs").select("*").eq("id", job_id).execute()
        return response.data[0] if response.data else None

interview_service = InterviewService(supabase.supabase)
