from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://recruitiq:recruitiq_secret@localhost:5432/recruitiq"
    gemini_api_key: str = ""
    demo_mode: bool = True
    cors_origins: str = "http://localhost:3000"
    upload_dir: str = "./uploads"
    chroma_persist_dir: str = "./chroma_data"
    max_upload_size_mb: int = 10
    rate_limit_per_minute: int = 60
    gemini_model: str = "gemini-2.0-flash"
    embedding_model: str = "text-embedding-004"

    @property
    def use_mock_ai(self) -> bool:
        return self.demo_mode and not self.gemini_api_key

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
