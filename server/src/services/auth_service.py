from supabase import Client
from server.src.core import supabase
from src.schemas.auth_schema import SignUpRequest, SignInRequest
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

class AuthService:
    def __init__(self, Client: Client):
        self.client = Client
    
    async def sign_up(self, data: SignUpRequest):
        return self.client.auth.sign_up(
            {
                "email": data.email,
                "password": data.password
            }
        )
        
    async def sign_in(self, data: SignInRequest):
        return self.client.auth.sign_in_with_password(
            {
                "email": data.email,
                "password": data.password
            }
        )

auth_service = AuthService(supabase.supabase)

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        user_response = supabase.supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
        return user_response.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}"
        )