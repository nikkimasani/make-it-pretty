import re

from ..models import FormatResult
from .base import Formatter


class FallbackFormatter(Formatter):
    @property
    def name(self) -> str:
        return "fallback (safe cleanup)"

    def is_available(self) -> bool:
        return True

    def format(self, content: str) -> FormatResult:
        text = content
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        text = text.lstrip("\ufeff")
        text = "\n".join(line.rstrip() for line in text.split("\n"))
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = text.rstrip("\n")
        text = text + "\n"
        return FormatResult(success=True, content=text)
