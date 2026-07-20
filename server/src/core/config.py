from pydantic_settings import BaseSettings, SettingsConfigDict


class settings:
    SUPABASE_URL:str
    SUPABASE_SERVICE_ROLE_KEY:str
    DATABASE_CONNECTION_STRING:str
    GEMINI_API_KEY:str
    GEMINI_MODEL:str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra= "ignore"
    )
