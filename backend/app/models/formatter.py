from pydantic import BaseModel


class FormatRequest(BaseModel):
    content: str
    indent_size: int = 2
    sort_keys: bool = False
    tab_size: int | None = None


class FormatResponse(BaseModel):
    original: str
    result: str
    format: str
    processing_time: float = 0.0
