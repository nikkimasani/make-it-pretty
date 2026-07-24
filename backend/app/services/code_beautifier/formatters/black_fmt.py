import importlib.util

from black import InvalidInput as BlackInvalidInput

from ..models import FormatResult
from .base import Formatter


class BlackFormatter(Formatter):
    @property
    def name(self) -> str:
        return "black"

    def is_available(self) -> bool:
        return importlib.util.find_spec("black") is not None

    def format(self, content: str) -> FormatResult:
        try:
            import black

            mode = black.Mode()
            formatted = black.format_str(content, mode=mode)
            return FormatResult(success=True, content=formatted)
        except BlackInvalidInput as e:
            return FormatResult(success=False, content=content, error=f"Syntax error: {e}")
        except Exception as e:
            return FormatResult(success=False, content=content, error=str(e))


class Autopep8Formatter(Formatter):
    @property
    def name(self) -> str:
        return "autopep8"

    def is_available(self) -> bool:
        return importlib.util.find_spec("autopep8") is not None

    def format(self, content: str) -> FormatResult:
        try:
            import autopep8  # type: ignore[import-untyped]

            formatted = autopep8.fix_code(content)
            return FormatResult(success=True, content=formatted)
        except Exception as e:
            return FormatResult(success=False, content=content, error=str(e))
