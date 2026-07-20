import logging
from supabase import Client
from src.core.supabase import supabase
from src.schemas.auth_schema import SignUpRequest, SignInRequest
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

logger = logging.getLogger("auth_service")

class AuthService:
    def __init__(self, client: Client):
        self.client = client
    
    async def sign_up(self, data: SignUpRequest):
        try:
            res = self.client.auth.sign_up({
                "email": data.email,
                "password": data.password
            })
            session = res.session
            user = res.user
            
            token = session.access_token if session else None
            user_id = str(user.id) if user else None
            
            return {
                "access_token": token,
                "user_id": user_id,
                "email": user.email if user else data.email,
                "message": "User account created successfully"
            }
        except Exception as e:
            logger.error(f"Sign up error details: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
        
    async def sign_in(self, data: SignInRequest):
        try:
            res = self.client.auth.sign_in_with_password({
                "email": data.email,
                "password": data.password
            })
            session = res.session
            user = res.user
            if not session:
                raise HTTPException(status_code=401, detail="Invalid email or password")
            return {
                "access_token": session.access_token,
                "user_id": str(user.id) if user else None,
                "email": user.email if user else data.email
            }
        except Exception as e:
            logger.error(f"Sign in error details: {str(e)}")
            raise HTTPException(status_code=401, detail=str(e))

auth_service = AuthService(supabase)

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        user_response = supabase.auth.get_user(token)
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