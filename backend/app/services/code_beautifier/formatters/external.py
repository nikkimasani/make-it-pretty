import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from ..models import FormatResult
from .base import Formatter

NPM_BIN = str(Path(__file__).resolve().parents[5] / "frontend" / "node_modules" / ".bin")


def _find_binary(name: str) -> str | None:
    path = shutil.which(name)
    if path:
        return path
    npm_path = Path(NPM_BIN) / name
    if npm_path.exists():
        return str(npm_path)
    venv_bin = str(Path(sys.executable).parent / name)
    if Path(venv_bin).exists():
        return venv_bin
    return None


class SubprocessFormatter(Formatter):
    def __init__(
        self,
        name: str,
        binary: str,
        args: list[str],
        *,
        use_stdin: bool = False,
    ) -> None:
        self._name = name
        self._binary = binary
        self._args = args
        self._use_stdin = use_stdin

    @property
    def name(self) -> str:
        return self._name

    def _resolve_binary(self) -> str | None:
        return _find_binary(self._binary)

    def is_available(self) -> bool:
        return self._resolve_binary() is not None

    def format(self, content: str) -> FormatResult:
        binary = self._resolve_binary()
        if not binary:
            return FormatResult(success=False, content=content, error=f"{self._binary} not found")

        if self._use_stdin:
            return self._format_stdin(binary, content)
        return self._format_tempfile(binary, content)

    def _format_stdin(self, binary: str, content: str) -> FormatResult:
        try:
            result = subprocess.run(
                [binary, *self._args],
                input=content,
                capture_output=True,
                text=True,
                timeout=30,
            )
            if result.returncode != 0:
                msg = result.stderr.strip() or (
                    f"{self._binary} exited with code {result.returncode}"
                )
                return FormatResult(success=False, content=content, error=msg)

            return FormatResult(success=True, content=result.stdout)
        except subprocess.TimeoutExpired:
            return FormatResult(success=False, content=content, error="Formatting timed out")
        except Exception as e:
            return FormatResult(success=False, content=content, error=str(e))

    def _format_tempfile(self, binary: str, content: str) -> FormatResult:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".tmp", delete=False) as f:
            f.write(content)
            tmp = f.name

        try:
            result = subprocess.run(
                [binary, *self._args, tmp],
                capture_output=True,
                text=True,
                timeout=30,
            )
            if result.returncode != 0:
                err = (
                    result.stderr.strip() or f"{self._binary} exited with code {result.returncode}"
                )
                return FormatResult(success=False, content=content, error=err)

            formatted = Path(tmp).read_text(encoding="utf-8")
            return FormatResult(success=True, content=formatted)

        except subprocess.TimeoutExpired:
            return FormatResult(success=False, content=content, error="Formatting timed out")
        except Exception as e:
            return FormatResult(success=False, content=content, error=str(e))
        finally:
            Path(tmp).unlink(missing_ok=True)
