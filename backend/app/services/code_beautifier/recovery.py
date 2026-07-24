import unicodedata

from .models import RecoveryReport


def recover(content: str) -> RecoveryReport:
    text = content
    transformations: list[str] = []

    cleaned, changed = _remove_bom(text)
    if changed:
        transformations.append("Removed UTF-8 BOM")
    text = cleaned

    cleaned, changed = _normalize_unicode(text)
    if changed:
        transformations.append("Normalized Unicode (NFC)")
    text = cleaned

    cleaned, changed = _normalize_line_endings(text)
    if changed:
        transformations.append("Normalized line endings")
    text = cleaned

    cleaned, changed = _remove_control_chars(text)
    if changed:
        transformations.append("Removed invisible control characters")
    text = cleaned

    cleaned, changed = _fix_mixed_indentation(text)
    if changed:
        transformations.append("Fixed mixed tabs/spaces in indentation")
    text = cleaned

    cleaned, changed = _normalize_tabs(text)
    if changed:
        transformations.append("Normalized tabs to spaces")
    text = cleaned

    cleaned, changed = _remove_trailing_whitespace(text)
    if changed:
        transformations.append("Removed trailing whitespace")
    text = cleaned

    cleaned, changed = _collapse_excessive_blank_lines(text)
    if changed:
        transformations.append("Collapsed excessive blank lines")
    text = cleaned

    cleaned, changed = _remove_leading_blank_lines(text)
    if changed:
        transformations.append("Removed leading blank lines")
    text = cleaned

    cleaned, changed = _remove_trailing_blank_lines(text)
    if changed:
        transformations.append("Removed trailing blank lines")
    text = cleaned

    cleaned, changed = _ensure_final_newline(text)
    if changed:
        transformations.append("Added final newline")
    text = cleaned

    return RecoveryReport(
        original=content,
        recovered=text,
        transformations=transformations,
    )


def _remove_bom(text: str) -> tuple[str, bool]:
    if text.startswith("\ufeff"):
        return text[1:], True
    return text, False


def _normalize_unicode(text: str) -> tuple[str, bool]:
    normalized = unicodedata.normalize("NFC", text)
    return normalized, normalized != text


def _normalize_line_endings(text: str) -> tuple[str, bool]:
    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    return normalized, normalized != text


def _remove_control_chars(text: str) -> tuple[str, bool]:
    cleaned = "".join(
        ch
        for ch in text
        if ch == "\n" or ch == "\t" or ch == "\r" or ord(ch) >= 32 or ch == "\ufeff"
    )
    return cleaned, cleaned != text


def _normalize_tabs(text: str) -> tuple[str, bool]:
    if "\t" not in text:
        return text, False
    lines = text.split("\n")
    expanded: list[str] = []
    for line in lines:
        expanded_line = ""
        for ch in line:
            if ch == "\t":
                spaces = 4 - (len(expanded_line) % 4)
                expanded_line += " " * spaces
            else:
                expanded_line += ch
        expanded.append(expanded_line)
    return "\n".join(expanded), True


def _fix_mixed_indentation(text: str) -> tuple[str, bool]:
    lines = text.split("\n")
    changed = False
    fixed: list[str] = []
    for line in lines:
        stripped = line.lstrip()
        if not stripped:
            fixed.append(line)
            continue
        leading = line[: len(line) - len(stripped)]
        if "\t" in leading and " " in leading:
            fixed_line = ""
            for ch in leading:
                if ch == "\t":
                    spaces = 4 - (len(fixed_line) % 4)
                    fixed_line += " " * spaces
                else:
                    fixed_line += ch
            fixed.append(fixed_line + stripped)
            changed = True
        else:
            fixed.append(line)
    return "\n".join(fixed), changed


def _remove_trailing_whitespace(text: str) -> tuple[str, bool]:
    lines = text.split("\n")
    cleaned = [line.rstrip() for line in lines]
    joined = "\n".join(cleaned)
    return joined, joined != text


def _collapse_excessive_blank_lines(text: str) -> tuple[str, bool]:
    import re

    cleaned = re.sub(r"\n{3,}", "\n\n", text)
    return cleaned, cleaned != text


def _remove_leading_blank_lines(text: str) -> tuple[str, bool]:
    stripped = text.lstrip("\n")
    return stripped, stripped != text


def _remove_trailing_blank_lines(text: str) -> tuple[str, bool]:
    lines = text.split("\n")
    if not lines:
        return text, False
    if len(lines) == 1:
        return text, False
    has_trailing_newline = lines[-1] == ""
    body = lines[:-1] if has_trailing_newline else lines[:]
    cut = len(body)
    while cut > 0 and body[cut - 1] == "":
        cut -= 1
    if cut == len(body):
        return text, False
    kept = body[:cut]
    if has_trailing_newline:
        kept.append("")
    return "\n".join(kept), True


def _ensure_final_newline(text: str) -> tuple[str, bool]:
    if text == "":
        return "\n", True
    stripped = text.rstrip("\n")
    if stripped == text:
        return text + "\n", True
    if stripped + "\n" != text:
        return stripped + "\n", True
    return text, False
