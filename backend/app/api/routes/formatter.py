from fastapi import APIRouter, File, UploadFile

from app.core.upload import validate_file_upload
from app.models.formatter import FormatRequest, FormatResponse
from app.services import formatter as service

router = APIRouter()


@router.post("/process", response_model=FormatResponse)
async def process_data(request: FormatRequest) -> FormatResponse:
    import time
    start = time.monotonic()
    indent = request.tab_size if request.tab_size is not None else request.indent_size
    result, detected_format = service.process_data(
        request.content,
        indent_size=indent,
        sort_keys=request.sort_keys,
    )
    elapsed = time.monotonic() - start
    return FormatResponse(
        original=request.content,
        result=result,
        format=detected_format,
        processing_time=elapsed,
    )


@router.post("/upload", response_model=FormatResponse)
async def upload_file(file: UploadFile = File(...)) -> FormatResponse:
    await validate_file_upload(file)
    content = (await file.read()).decode("utf-8")
    result, detected_format = service.process_data(content)
    return FormatResponse(
        original=content,
        result=result,
        format=detected_format,
    )
