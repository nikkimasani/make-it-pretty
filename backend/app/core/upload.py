from fastapi import HTTPException, UploadFile

from app.core.config import settings


async def validate_file_upload(file: UploadFile) -> None:
    content = await file.read()
    await file.seek(0)

    if len(content) > settings.max_upload_size:
        max_mb = settings.max_upload_size // (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {max_mb} MB.",
        )

    filename = file.filename or ""
    if "." not in filename:
        return

    ext = filename.rsplit(".", 1)[-1].lower()
    allowed = {
        "txt", "md", "html", "htm", "pdf", "docx",
        "json", "yaml", "yml", "xml", "toml", "env", "ini",
        "csv", "tsv", "xlsx", "xls",
        "py", "js", "ts", "jsx", "tsx", "java", "kt", "go", "rs",
        "cpp", "c", "h", "cs", "vb", "swift", "rb", "php", "lua",
        "sh", "bash", "zsh", "ps1", "sql",
        "css", "scss", "sass", "less", "gradle", "dart",
    }
    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: .{ext}",
        )
