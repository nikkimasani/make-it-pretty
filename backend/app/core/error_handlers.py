from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
        return JSONResponse(
            status_code=400,
            content={"detail": str(exc)},
        )

    @app.exception_handler(UnicodeDecodeError)
    async def unicode_error_handler(request: Request, exc: UnicodeDecodeError) -> JSONResponse:
        return JSONResponse(
            status_code=400,
            content={"detail": "File encoding not supported. Use UTF-8 or Latin-1 encoded files."},
        )

    @app.exception_handler(Exception)
    async def general_error_handler(request: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected error occurred. Please try again."},
        )
