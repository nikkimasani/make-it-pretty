from fastapi import APIRouter, File, UploadFile

from app.core.upload import validate_file_upload
from app.models.code_beautifier import CodeBeautifierRequest, CodeBeautifierResponse
from app.services.code_beautifier import beautify_code, get_line_stats

router = APIRouter()


@router.post("/process", response_model=CodeBeautifierResponse)
async def process_code(request: CodeBeautifierRequest) -> CodeBeautifierResponse:
    result = beautify_code(request.content, filename=request.filename)
    orig_total, _ = get_line_stats(request.content)
    res_total, _ = get_line_stats(result.result)
    return CodeBeautifierResponse(
        original=request.content,
        result=result.result,
        format=result.language.lower() if result.language != "Unknown" else "code",
        language=result.language,
        formatter=result.formatter,
        success=result.success,
        processing_time=result.processing_time,
        warnings=result.warnings,
        original_lines=orig_total,
        result_lines=res_total,
        recovery_attempted=result.recovery_attempted,
        recovery_error=result.recovery_error,
        validation_passed=result.validation_passed,
        validation_error=result.validation_error,
        transformations=result.transformations,
    )


@router.post("/upload", response_model=CodeBeautifierResponse)
async def upload_file(file: UploadFile = File(...)) -> CodeBeautifierResponse:
    await validate_file_upload(file)
    content = (await file.read()).decode("utf-8")
    filename = file.filename or ""
    ext = filename.split(".")[-1] if "." in filename else "code"
    result = beautify_code(content, filename=filename)
    orig_total, _ = get_line_stats(content)
    res_total, _ = get_line_stats(result.result)
    return CodeBeautifierResponse(
        original=content,
        result=result.result,
        format=ext,
        language=result.language,
        formatter=result.formatter,
        success=result.success,
        processing_time=result.processing_time,
        warnings=result.warnings,
        original_lines=orig_total,
        result_lines=res_total,
        recovery_attempted=result.recovery_attempted,
        recovery_error=result.recovery_error,
        validation_passed=result.validation_passed,
        validation_error=result.validation_error,
        transformations=result.transformations,
    )
