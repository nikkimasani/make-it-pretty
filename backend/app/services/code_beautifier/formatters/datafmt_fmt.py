import json
import re
from io import StringIO
from xml.dom import minidom

from ..models import FormatResult
from .base import Formatter


class JsonFormatter(Formatter):
    @property
    def name(self) -> str:
        return "json (builtin)"

    def is_available(self) -> bool:
        return True

    def format(self, content: str) -> FormatResult:
        try:
            parsed = json.loads(content)
            formatted = json.dumps(parsed, indent=2, ensure_ascii=False, sort_keys=False) + "\n"
            return FormatResult(success=True, content=formatted)
        except json.JSONDecodeError as e:
            return FormatResult(success=False, content=content, error=f"Invalid JSON: {e}")
        except Exception as e:
            return FormatResult(success=False, content=content, error=str(e))


class YamlFormatter(Formatter):
    @property
    def name(self) -> str:
        return "yaml (builtin)"

    def is_available(self) -> bool:
        try:
            import yaml
            return True
        except ImportError:
            return False

    def format(self, content: str) -> FormatResult:
        try:
            import yaml
            parsed = yaml.safe_load(content)
            formatted = yaml.dump(parsed, default_flow_style=False, allow_unicode=True, sort_keys=False)
            return FormatResult(success=True, content=formatted)
        except yaml.YAMLError as e:
            return FormatResult(success=False, content=content, error=f"Invalid YAML: {e}")
        except Exception as e:
            return FormatResult(success=False, content=content, error=str(e))


class TomlFormatter(Formatter):
    @property
    def name(self) -> str:
        return "toml (builtin)"

    def is_available(self) -> bool:
        return True

    def format(self, content: str) -> FormatResult:
        try:
            import tomllib
            parsed = tomllib.loads(content)
            formatted = _toml_dumps(parsed) + "\n"
            return FormatResult(success=True, content=formatted)
        except tomllib.TOMLDecodeError as e:
            return FormatResult(success=False, content=content, error=f"Invalid TOML: {e}")
        except Exception as e:
            return FormatResult(success=False, content=content, error=str(e))


def _toml_dumps(obj: dict, prefix: str = "") -> str:
    """Simple TOML serializer for common types."""
    lines: list[str] = []
    tables: list[tuple[str, dict]] = []
    for key, val in obj.items():
        if isinstance(val, dict):
            tables.append((key, val))
        elif isinstance(val, list):
            if val and all(isinstance(v, dict) for v in val):
                for item in val:
                    if isinstance(item, dict):
                        tables.append((key, item))
            else:
                lines.append(f"{key} = {_toml_val(val)}")
        else:
            lines.append(f"{key} = {_toml_val(val)}")
    text = "\n".join(lines)
    if text:
        if prefix:
            text = f"[{prefix}]\n" + text
        text += "\n"
    for key, tbl in tables:
        sub = _toml_dumps(tbl, prefix=f"{prefix}.{key}" if prefix else key)
        if sub.strip():
            text += "\n" + sub
    return text.rstrip("\n")


def _toml_val(val) -> str:
    if isinstance(val, bool):
        return str(val).lower()
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, str):
        escaped = val.replace('"', '\\"')
        return f'"{escaped}"'
    if isinstance(val, list):
        items = ", ".join(_toml_val(v) for v in val)
        return f"[{items}]"
    return str(val)


class XmlFormatter(Formatter):
    @property
    def name(self) -> str:
        return "xml (builtin)"

    def is_available(self) -> bool:
        return True

    def format(self, content: str) -> FormatResult:
        try:
            dom = minidom.parseString(content)
            formatted = dom.toprettyxml(indent="  ")
            lines = [l for l in formatted.split("\n") if l.strip() or l == "\n"]
            result = "\n".join(lines)
            return FormatResult(success=True, content=result)
        except Exception as e:
            return FormatResult(success=False, content=content, error=f"Invalid XML: {e}")


class IniFormatter(Formatter):
    @property
    def name(self) -> str:
        return "ini (builtin)"

    def is_available(self) -> bool:
        return True

    def format(self, content: str) -> FormatResult:
        try:
            import configparser
            parser = configparser.ConfigParser()
            parser.read_string(content)
            buf = StringIO()
            parser.write(buf)
            formatted = buf.getvalue()
            return FormatResult(success=True, content=formatted)
        except configparser.Error as e:
            return FormatResult(success=False, content=content, error=f"Invalid INI/ENV: {e}")
        except Exception as e:
            return FormatResult(success=False, content=content, error=str(e))


class EnvFormatter(Formatter):
    @property
    def name(self) -> str:
        return "env (builtin)"

    def is_available(self) -> bool:
        return True

    def format(self, content: str) -> FormatResult:
        try:
            lines = content.split("\n")
            result: list[str] = []
            for line in lines:
                stripped = line.strip()
                if not stripped or stripped.startswith("#"):
                    result.append(stripped)
                    continue
                if "=" in stripped:
                    key, _, val = stripped.partition("=")
                    key = key.strip()
                    val = val.strip().strip("'\"").strip()
                    if " " in val or "=" in val:
                        val = f'"{val}"'
                    result.append(f"{key}={val}")
                else:
                    result.append(stripped)
            return FormatResult(success=True, content="\n".join(result) + "\n")
        except Exception as e:
            return FormatResult(success=False, content=content, error=str(e))
