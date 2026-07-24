import importlib.util

from ..models import FormatResult
from .base import Formatter


class SqlparseFormatter(Formatter):
    @property
    def name(self) -> str:
        return "sqlparse"

    def is_available(self) -> bool:
        return importlib.util.find_spec("sqlparse") is not None

    def format(self, content: str) -> FormatResult:
        try:
            import sqlparse

            formatted = sqlparse.format(
                content,
                reindent=True,
                keyword_case="upper",
                identifier_case="lower",
                strip_comments=False,
            )
            return FormatResult(success=True, content=formatted)
        except Exception as e:
            return FormatResult(success=False, content=content, error=str(e))
