import configparser
import json
import tomllib
import xml.dom.minidom as minidom
import xml.etree.ElementTree as ET

import yaml


def process_data(content: str, indent_size: int = 2, sort_keys: bool = False) -> tuple[str, str]:
    detected = _detect_format(content)

    if detected == "json":
        return _format_json(content, indent_size, sort_keys), "json"
    elif detected == "yaml":
        return _format_yaml(content, indent_size), "yaml"
    elif detected == "xml":
        return _format_xml(content, indent_size), "xml"
    elif detected == "toml":
        return _format_toml(content), "toml"
    elif detected == "env":
        return _format_env(content), "env"
    elif detected == "ini":
        return _format_ini(content), "ini"

    return content, detected or "text"


def _detect_format(content: str) -> str | None:
    stripped = content.strip()

    if not stripped:
        return None

    if stripped.startswith("{") or stripped.startswith("["):
        try:
            json.loads(stripped)
            return "json"
        except json.JSONDecodeError:
            pass

        if stripped.startswith("{"):
            return None

    if stripped.startswith("<") and ">" in stripped[:100]:
        try:
            ET.fromstring(stripped)
            return "xml"
        except ET.ParseError:
            return None

    try:
        tomllib.loads(stripped)
        return "toml"
    except Exception:
        pass

    if _looks_like_env(stripped):
        return "env"

    if _looks_like_ini(stripped):
        return "ini"

    try:
        yaml.safe_load(stripped)
        return "yaml"
    except yaml.YAMLError:
        pass

    return "text"


def _looks_like_env(text: str) -> bool:
    for line in text.split("\n"):
        line = line.strip()
        if line and not line.startswith("#"):
            if "=" not in line:
                return False
    return True


def _looks_like_ini(text: str) -> bool:
    has_section = False
    for line in text.split("\n"):
        line = line.strip()
        if not line or line.startswith("#") or line.startswith(";"):
            continue
        if line.startswith("[") and line.endswith("]"):
            has_section = True
        elif "=" in line and has_section:
            return True
    return False


def _format_ini(content: str) -> str:
    parser = configparser.ConfigParser(allow_no_value=False)
    try:
        parser.read_string(content)
    except configparser.Error:
        return content

    # Preserve comments by rebuilding from original lines
    original_lines = content.split("\n")
    formatted_lines: list[str] = []
    seen_sections: set[str] = set()
    default_items: list[tuple[str, str]] = []
    current_section: str | None = None

    for line in original_lines:
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or stripped.startswith(";"):
            formatted_lines.append(line)
        elif stripped.startswith("[") and stripped.endswith("]"):
            section_name = stripped[1:-1].strip()
            current_section = section_name
            if section_name in parser.sections() and section_name not in seen_sections:
                seen_sections.add(section_name)
                formatted_lines.append(stripped)
                for key, value in parser.items(section_name):
                    formatted_lines.append(f"{key}={value}")
        elif "=" in stripped and current_section is None:
            # Items before any section header (DEFAULT section)
            k, _, v = stripped.partition("=")
            default_items.append((k.strip(), v.strip()))
        elif "=" in stripped:
            # key=value lines already handled by section iteration
            continue

    # Prepend default section items if any
    if default_items:
        prefix = [f"{k}={v}" for k, v in default_items]
        formatted_lines = prefix + formatted_lines

    result = "\n".join(formatted_lines).strip()
    return result + "\n" if result else content


def _format_json(content: str, indent_size: int = 2, sort_keys: bool = False) -> str:
    try:
        parsed = json.loads(content)
        return json.dumps(parsed, indent=indent_size, sort_keys=sort_keys, ensure_ascii=False)
    except json.JSONDecodeError:
        return content


def _format_yaml(content: str, indent_size: int = 2) -> str:
    try:
        parsed = yaml.safe_load(content)
        if parsed is None:
            return content.rstrip("\n") + "\n"
        result: str = yaml.dump(
            parsed, default_flow_style=False, allow_unicode=True, indent=indent_size
        )
        return result
    except yaml.YAMLError:
        return content


def _format_xml(content: str, indent_size: int = 2) -> str:
    try:
        dom = minidom.parseString(content)
        result = dom.toprettyxml(indent=" " * indent_size)
        lines = [line for line in result.split("\n") if line.strip() or line == "\n"]
        result = "\n".join(lines)
        if result.startswith('<?xml version="1.0" ?>'):
            result = result[len('<?xml version="1.0" ?>') :].lstrip()
        return result
    except Exception:
        return content


def _format_toml(content: str) -> str:
    try:
        parsed = tomllib.loads(content)
        return _toml_dumps(parsed)
    except Exception:
        return content


def _toml_dumps(data: dict[str, object], indent: int = 0) -> str:
    lines: list[str] = []
    prefix = " " * indent
    for key, value in data.items():
        if isinstance(value, dict):
            lines.append(f"{prefix}[{key}]")
            lines.append(_toml_dumps(value, indent + 2))
        elif isinstance(value, list):
            dict_count = sum(1 for v in value if isinstance(v, dict))
            if dict_count == len(value) and dict_count > 0:
                for v in value:
                    if isinstance(v, dict):
                        lines.append(f"{prefix}[[{key}]]")
                        lines.append(_toml_dumps(v, indent + 2))
            else:
                non_dict = [v for v in value if not isinstance(v, dict)]
                if non_dict:
                    lines.append(f"{prefix}{key} = [{_toml_list_str(non_dict)}]")
        elif isinstance(value, bool):
            lines.append(f"{prefix}{key} = {str(value).lower()}")
        elif isinstance(value, (int, float)):
            lines.append(f"{prefix}{key} = {value}")
        elif isinstance(value, str):
            if "\n" in value:
                lines.append(f'{prefix}{key} = """{value}"""')
            else:
                lines.append(f'{prefix}{key} = "{value}"')
        else:
            lines.append(f"{prefix}{key} = {value}")
    return "\n".join(lines) + "\n" if lines else ""


def _toml_list_str(items: list[object]) -> str:
    parts: list[str] = []
    for item in items:
        if isinstance(item, str):
            parts.append(f'"{item}"')
        elif isinstance(item, bool):
            parts.append(str(item).lower())
        else:
            parts.append(str(item))
    return ", ".join(parts)


def _format_env(content: str) -> str:
    result: list[str] = []
    for line in content.split("\n"):
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            result.append(line)
            continue
        if "=" in stripped:
            key, _, value = stripped.partition("=")
            key = key.strip()
            value = value.strip()
            # Only strip matching outer quotes, preserve internal spaces
            if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
                value = value[1:-1]
            result.append(f"{key}={value}")
        else:
            result.append(stripped)
    return "\n".join(result) + "\n" if result else ""
