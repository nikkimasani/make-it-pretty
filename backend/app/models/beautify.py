from pydantic import BaseModel


class GrammarSuggestion(BaseModel):
    start: int
    end: int
    original: str
    suggestion: str
    message: str


class BeautifyRequest(BaseModel):
    content: str
    grammar_check: bool = False
    emoji_enrichment: bool = False


class BeautifyResponse(BaseModel):
    original: str
    result: str
    format: str
    grammar_check_applied: bool = False
    emoji_enrichment_applied: bool = False
    suggestions: list[GrammarSuggestion] = []
    writing_direction: str = "ltr"
    character_count: int = 0
    processing_time: float = 0.0
    warnings: list[str] = []
