import importlib.util
import shutil
import subprocess
import sys
from pathlib import Path

from ..models import FormatResult
from .base import Formatter


def _find_binary(name: str) -> str | None:
    path = shutil.which(name)
    if path:
        return path
    venv_bin = str(Path(sys.executable).parent / name)
    if Path(venv_bin).exists():
        return venv_bin
    return None


class BlackFormatter(Formatter):
    @property
    def name(self) -> str:
        return "black"

    def is_available(self) -> bool:
        return importlib.util.find_spec("black") is not None

    def format(self, content: str) -> FormatResult:
        import black

        try:
            mode = black.Mode()
            formatted = black.format_str(content, mode=mode)
            return FormatResult(success=True, content=formatted)
        except black.InvalidInput:
            pass
        except Exception as e:
            return FormatResult(
                success=False,
                content=content,
                error=f"Unexpected Black failure: {e}",
            )

        try:
            import autopep8  # type: ignore[import-untyped]

            recovered = autopep8.fix_code(
                content,
                options={"aggressive": 2, "max_line_length": 88},
            )
        except Exception as e:
            return FormatResult(
                success=False,
                content=content,
                error=f"autopep8 recovery failed: {e}",
            )

        try:
            mode = black.Mode()
            formatted = black.format_str(recovered, mode=mode)
            return FormatResult(success=True, content=formatted, recovery_attempted=True)
        except black.InvalidInput as e:
            return FormatResult(
                success=False,
                content=content,
                error=f"Syntax error after recovery: {e}",
                recovery_attempted=True,
            )


class RuffFormatter(Formatter):
    @property
    def name(self) -> str:
        return "ruff"

    def is_available(self) -> bool:
        return _find_binary("ruff") is not None

    def format(self, content: str) -> FormatResult:
        binary = _find_binary("ruff")
        if not binary:
            return FormatResult(success=False, content=content, error="ruff not found")
        try:
            result = subprocess.run(
                [binary, "format", "-"],
                input=content,
                capture_output=True,
                text=True,
                timeout=30,
            )
            if result.returncode != 0:
                err = result.stderr.strip() or f"ruff exited with code {result.returncode}"
                return FormatResult(success=False, content=content, error=err)
            return FormatResult(success=True, content=result.stdout)
        except subprocess.TimeoutExpired:
            return FormatResult(success=False, content=content, error="Formatting timed out")
        except Exception as e:
            return FormatResult(success=False, content=content, error=str(e))
