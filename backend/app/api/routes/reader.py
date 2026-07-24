from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.upload import validate_file_upload
from app.models.reader import ReaderRequest, ReaderResponse
from app.services import reader as service

router = APIRouter()


@router.post("/process", response_model=ReaderResponse)
async def process_document(request: ReaderRequest) -> ReaderResponse:
    try:
        result, fmt, meta = service.process_document(request.content)
        title_val = meta.get("title", "")
        wc_val = meta.get("word_count", 0)
        rt_val = meta.get("reading_time_minutes", 0)
        return ReaderResponse(
            original=request.content,
            result=result,
            format=fmt,
            title=str(title_val) if not isinstance(title_val, str) else title_val,
            word_count=int(wc_val) if isinstance(wc_val, (int, float, str)) else 0,
            reading_time_minutes=int(rt_val) if isinstance(rt_val, (int, float, str)) else 0,
            metadata=meta,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/upload", response_model=ReaderResponse)
async def upload_file(file: UploadFile = File(...)) -> ReaderResponse:
    await validate_file_upload(file)
    content = await file.read()
    filename = file.filename or "document"
    try:
        result, fmt, meta = service.process_document(content, filename)
        original = content.decode("utf-8", errors="replace")
        title_val = meta.get("title", "")
        wc_val = meta.get("word_count", 0)
        rt_val = meta.get("reading_time_minutes", 0)
        return ReaderResponse(
            original=original,
            result=result,
            format=fmt,
            title=str(title_val) if not isinstance(title_val, str) else title_val,
            word_count=int(wc_val) if isinstance(wc_val, (int, float, str)) else 0,
            reading_time_minutes=int(rt_val) if isinstance(rt_val, (int, float, str)) else 0,
            metadata=meta,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
