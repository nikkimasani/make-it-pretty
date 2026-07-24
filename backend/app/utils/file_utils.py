import os

from app.core.config import settings


def get_upload_path(filename: str) -> str:
    os.makedirs(settings.upload_dir, exist_ok=True)
    return os.path.join(settings.upload_dir, filename)
