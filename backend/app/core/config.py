from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Make It Pretty"
    app_version: str = "0.1.0"
    api_v1_prefix: str = "/api/v1"
    debug: bool = True
    max_upload_size: int = 50 * 1024 * 1024  # 50 MB
    upload_dir: str = "uploads"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
