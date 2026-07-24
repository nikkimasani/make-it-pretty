import json
import subprocess
import tempfile
from pathlib import Path

from ..models import FormatResult
from .base import Formatter

PRETTIER_PATH = str(
    Path(__file__).resolve().parents[5] / "frontend" / "node_modules" / ".bin" / "prettier"
)

NODE_MODULES = str(Path(__file__).resolve().parents[5] / "frontend" / "node_modules")


def _resolve_plugin_entry(plugin_name: str) -> str | None:
    pkg_path = Path(NODE_MODULES) / plugin_name / "package.json"
    if not pkg_path.exists():
        return None
    try:
        data = json.loads(pkg_path.read_text(encoding="utf-8"))
        exports = data.get("exports", {})
        if isinstance(exports, dict) and "." in exports:
            dot = exports["."]
            if isinstance(dot, str):
                return str(pkg_path.parent / dot)
            if isinstance(dot, dict):
                default = dot.get("default") or dot.get("import", {}).get("default")
                if default:
                    return str(pkg_path.parent / default)
        main = data.get("main")
        if main:
            return str(pkg_path.parent / main)
    except Exception:
        pass
    return None


class PrettierFormatter(Formatter):
    def __init__(self) -> None:
        self._parser: str = "babel"
        self._plugin: str | None = None

    def with_parser(self, parser: str) -> "PrettierFormatter":
        self._parser = parser
        return self

    def with_plugin(self, plugin: str) -> "PrettierFormatter":
        self._plugin = plugin
        return self

    @property
    def name(self) -> str:
        base = f"prettier ({self._parser})"
        if self._plugin:
            return f"prettier ({self._parser}, plugin)"
        return base

    def is_available(self) -> bool:
        if not Path(PRETTIER_PATH).exists():
            return False
        if self._plugin:
            return _resolve_plugin_entry(self._plugin) is not None
        return True

    def format(self, content: str) -> FormatResult:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".tmp", delete=False) as f:
            f.write(content)
            tmp = f.name

        try:
            cmd = [PRETTIER_PATH, "--parser", self._parser]
            if self._plugin:
                entry = _resolve_plugin_entry(self._plugin)
                if not entry:
                    msg = f"Cannot resolve plugin: {self._plugin}"
                    return FormatResult(success=False, content=content, error=msg)
                cmd.extend(["--plugin", entry])
            cmd.extend(["--write", tmp])

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30,
                cwd=str(Path(__file__).resolve().parents[5] / "frontend"),
            )
            if result.returncode != 0:
                err = result.stderr.strip() or f"prettier exited with code {result.returncode}"
                return FormatResult(success=False, content=content, error=err)

            formatted = Path(tmp).read_text(encoding="utf-8")
            return FormatResult(success=True, content=formatted)

        except subprocess.TimeoutExpired:
            return FormatResult(success=False, content=content, error="Formatting timed out")
        except Exception as e:
            return FormatResult(success=False, content=content, error=str(e))
        finally:
            Path(tmp).unlink(missing_ok=True)


PARSER_MAP: dict[str, str] = {
    "JavaScript": "babel",
    "TypeScript": "typescript",
    "JSX": "babel",
    "TSX": "typescript",
    "HTML": "html",
    "CSS": "css",
    "SCSS": "scss",
    "LESS": "less",
    "Markdown": "markdown",
    "Java": "java",
    "PHP": "php",
    "Solidity": "slang",
    "Elm": "elm",
}

PLUGIN_MAP: dict[str, str] = {
    "Java": "prettier-plugin-java",
    "PHP": "@prettier/plugin-php",
    "Solidity": "prettier-plugin-solidity",
    "Elm": "prettier-plugin-elm",
}
