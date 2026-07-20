from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.auth_api import router as auth_router
from src.api.candidate_api import router as candidate_router
from src.api.job_api import router as job_router
from src.api.interview_api import router as interview_router
from src.api.resume_api import router as resume_router

app = FastAPI(
    title="AI Interviewer API",
    description="Backend server for AI Interviewer application",
    version="1.0.0"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API Routers
app.include_router(auth_router)
app.include_router(candidate_router)
app.include_router(job_router)
app.include_router(interview_router)
app.include_router(resume_router)

@app.get("/")
async def root():
    return {"message": "AI Interviewer Server API is running"}
