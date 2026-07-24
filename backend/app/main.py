from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.api.routes import (
    beautify,
    code_beautifier,
    formatter,
    reader,
    tabulate,
)
from app.core.config import settings
from app.core.error_handlers import register_error_handlers

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/docs",
    redoc_url=None,
)

register_error_handlers(app)

app.add_middleware(GZipMiddleware, minimum_size=10000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(f"{settings.api_v1_prefix}/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "version": settings.app_version}


app.include_router(beautify, prefix=f"{settings.api_v1_prefix}/beautify", tags=["Beautify"])
app.include_router(formatter, prefix=f"{settings.api_v1_prefix}/format", tags=["Format"])
app.include_router(tabulate, prefix=f"{settings.api_v1_prefix}/tabulate", tags=["Tabulate"])
app.include_router(reader, prefix=f"{settings.api_v1_prefix}/reader", tags=["Reader"])
app.include_router(
    code_beautifier,
    prefix=f"{settings.api_v1_prefix}/code-beautifier",
    tags=["Code Beautifier"],
)
