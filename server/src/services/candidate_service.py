from supabase import Client
from src.core.supabase import supabase
from src.schemas.candidate_schema import CandidateCreate, CandidateUpdate

class CandidateService:
    def __init__(self, client: Client):
        self.client = client

    async def get_candidate_by_id(self, candidate_id: str):
        response = self.client.table("candidates").select("*").eq("id", candidate_id).execute()
        if not response.data:
            return None
        return response.data[0]

    async def get_candidate_by_user_id(self, user_id: str):
        response = self.client.table("candidates").select("*").eq("user_id", user_id).execute()
        if not response.data:
            return None
        return response.data[0]

    async def get_user_email(self, user_id: str):
        user_response = self.client.auth.admin.get_user_by_id(user_id)
        if user_response and user_response.user:
            return user_response.user.email
        return None

    async def create_candidate(self, user_id: str, data: CandidateCreate):
        response = self.client.table("candidates").insert({
            "user_id": user_id,
            "profile_jsonb": data.profile_jsonb,
            "resume_path": data.resume_path
        }).execute()
        return response.data[0] if response.data else None

    async def update_candidate(self, user_id: str, data: CandidateUpdate):
        update_data = {}
        if data.profile_jsonb is not None:
            update_data["profile_jsonb"] = data.profile_jsonb
        if data.resume_path is not None:
            update_data["resume_path"] = data.resume_path
        
        if not update_data:
            return await self.get_candidate_by_user_id(user_id)
            
        update_data["updated_at"] = "now()"
        response = self.client.table("candidates").update(update_data).eq("user_id", user_id).execute()
        return response.data[0] if response.data else None

    async def delete_candidate(self, user_id: str):
        return self.client.auth.admin.delete_user(user_id)

    async def update_password(self, user_id: str, new_password: str):
        return self.client.auth.admin.update_user_by_id(user_id, {"password": new_password})

candidate_service = CandidateService(supabase)