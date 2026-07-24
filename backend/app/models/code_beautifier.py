from pydantic import BaseModel


class CodeBeautifierRequest(BaseModel):
    content: str
    filename: str = ""
    tab_size: int | None = None


class CodeBeautifierResponse(BaseModel):
    original: str
    result: str
    format: str
    language: str = ""
    formatter: str = ""
    success: bool = True
    processing_time: float = 0.0
    warnings: list[str] = []
    original_lines: int = 0
    result_lines: int = 0
    recovery_attempted: bool = False
    recovery_error: str | None = None
    validation_passed: bool = True
    validation_error: str | None = None
    transformations: list[str] = []
