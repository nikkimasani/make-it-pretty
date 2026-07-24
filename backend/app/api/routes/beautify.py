from fastapi import APIRouter, File, UploadFile

from app.core.upload import validate_file_upload
from app.models.beautify import BeautifyRequest, BeautifyResponse, GrammarSuggestion
from app.services import beautify as service


def _to_suggestion(s: dict[str, int | str]) -> GrammarSuggestion:
    return GrammarSuggestion(
        start=int(s["start"]),
        end=int(s["end"]),
        original=str(s["original"]),
        suggestion=str(s["suggestion"]),
        message=str(s["message"]),
    )


router = APIRouter()


@router.post("/process", response_model=BeautifyResponse)
async def process_text(request: BeautifyRequest) -> BeautifyResponse:
    import time
    start = time.monotonic()
    result, direction, suggestions = service.process_text(
        request.content,
        grammar_check=request.grammar_check,
        emoji_enrichment=request.emoji_enrichment,
    )
    elapsed = time.monotonic() - start
    return BeautifyResponse(
        original=request.content,
        result=result,
        format="text",
        grammar_check_applied=request.grammar_check,
        emoji_enrichment_applied=request.emoji_enrichment,
        suggestions=[_to_suggestion(s) for s in suggestions],
        writing_direction=direction,
        character_count=len(result),
        processing_time=elapsed,
    )


@router.post("/upload", response_model=BeautifyResponse)
async def upload_file(file: UploadFile = File(...)) -> BeautifyResponse:
    import time
    start = time.monotonic()
    await validate_file_upload(file)
    content = (await file.read()).decode("utf-8")
    filename = file.filename or ""
    ext = filename.split(".")[-1] if "." in filename else "text"
    result, direction, suggestions = service.process_text(content)
    elapsed = time.monotonic() - start
    return BeautifyResponse(
        original=content,
        result=result,
        format=ext,
        suggestions=[_to_suggestion(s) for s in suggestions],
        writing_direction=direction,
        character_count=len(result),
        processing_time=elapsed,
    )
