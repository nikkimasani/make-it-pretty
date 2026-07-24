from abc import ABC, abstractmethod

from ..models import FormatResult


class Formatter(ABC):
    @property
    @abstractmethod
    def name(self) -> str: ...

    @abstractmethod
    def is_available(self) -> bool: ...

    @abstractmethod
    def format(self, content: str) -> FormatResult: ...
