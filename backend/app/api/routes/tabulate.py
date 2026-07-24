from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.upload import validate_file_upload
from app.models.tabulate import TabulateResponse
from app.services import tabulate as service

router = APIRouter()


@router.post("/upload", response_model=TabulateResponse)
async def upload_file(
    file: UploadFile = File(...),
    sheet_name: str | None = Form(None),
) -> TabulateResponse:
    await validate_file_upload(file)
    content = await file.read()
    filename = file.filename or "unknown"
    try:
        rows_list, format_type, metadata = service.process_table(
            content, filename, sheet_name=sheet_name
        )
        column_names_val = metadata.get("column_names", [])
        columns: list[str] = column_names_val if isinstance(column_names_val, list) else []
        rows_val = metadata.get("rows", 0)
        total_rows: int = rows_val if isinstance(rows_val, int) else 0
        return TabulateResponse(
            columns=columns,
            rows=rows_list,
            total_rows=total_rows,
            format=format_type,
            metadata=metadata,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
