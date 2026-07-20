from fastapi import APIRouter
from src.schemas.auth_schema import SignUpRequest, SignInRequest
from src.services.auth_service import auth_service


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup")
async def signup(request: SignUpRequest):
    return await auth_service.sign_up(request)


@router.post("/signin")
async def signin(request: SignInRequest):
    return await auth_service.sign_in(request)