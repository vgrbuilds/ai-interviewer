from supabase import Client
from server.src.core import supabase
from fastapi import HTTPException

class ResumeService:
    def __init__(self, client: Client):
        self.client = client
        self.bucket_name = "resumes"

    async def upload_resume(self, user_id: str, filename: str, file_content: bytes) -> str:
        file_path = f"{user_id}/{filename}"
        try:
            self.client.storage.from_(self.bucket_name).upload(
                path=file_path,
                file=file_content,
                file_options={"x-upsert": "true", "content-type": "application/pdf"}
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload resume: {str(e)}")
        return file_path

    async def get_resume_url(self, file_path: str) -> str:
        try:
            response = self.client.storage.from_(self.bucket_name).create_signed_url(file_path, expires_in=3600)
            return response.get("signedURL") or response.get("signedUrl")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to retrieve resume URL: {str(e)}")

    async def delete_resume(self, file_path: str):
        try:
            self.client.storage.from_(self.bucket_name).remove([file_path])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to delete resume: {str(e)}")

resume_service = ResumeService(supabase.supabase)