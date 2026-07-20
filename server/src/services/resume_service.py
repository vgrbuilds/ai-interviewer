from supabase import Client
from src.core.supabase import supabase

class ResumeService:
    def __init__(self, client: Client):
        self.client = client
        self.bucket_name = "resumes"

    async def upload_resume(self, candidate_id: str, file_name: str, file_bytes: bytes) -> str:
        """Uploads a candidate resume to the Supabase storage bucket 'resumes'."""
        path = f"{candidate_id}/{file_name}"
        response = self.client.storage.from_(self.bucket_name).upload(
            path=path,
            file=file_bytes,
            file_options={"upsert": "true"}
        )
        return path

    async def get_resume_url(self, resume_path: str) -> str:
        """Generates a signed URL for reading/downloading the candidate resume (valid for 1 hour)."""
        response = self.client.storage.from_(self.bucket_name).create_signed_url(resume_path, 3600)
        return response.get("signedUrl")

    async def delete_resume(self, resume_path: str):
        """Deletes candidate resume from the storage bucket."""
        return self.client.storage.from_(self.bucket_name).remove([resume_path])

resume_service = ResumeService(supabase)