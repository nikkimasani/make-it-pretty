from pydantic import BaseModel


class ReaderRequest(BaseModel):
    content: str
    options: dict[str, object] | None = None


class ReaderResponse(BaseModel):
    original: str
    result: str
    format: str
    title: str = ""
    word_count: int = 0
    reading_time_minutes: int = 0
    metadata: dict[str, object] = {}
