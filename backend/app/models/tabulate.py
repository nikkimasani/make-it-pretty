from pydantic import BaseModel


class TabulateResponse(BaseModel):
    columns: list[str]
    rows: list[dict[str, str]]
    total_rows: int
    format: str
    metadata: dict[str, object] = {}
