from supabase import Client, create_client
from src.core.config import settings
from dotenv import load_dotenv
load_dotenv()

if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError(
        "\n=======================================================\n"
        "ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server/.env!\n"
        "Please create a 'server/.env' file and add your Supabase & Gemini credentials.\n"
        "Refer to 'server/.env.example' for required variables.\n"
        "=======================================================\n"
    )

supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY,
)
