from pydantic_settings import BaseSettings, SettingsConfigDict


class settings:
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra= "ignore"
    )
