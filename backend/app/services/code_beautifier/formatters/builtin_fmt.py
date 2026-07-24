import re

from ..models import FormatResult
from .base import Formatter


class BuiltinFormatter(Formatter):
    CONFIGS: dict[str, dict[str, str | bool]] = {
        "Go": {"indent": "\t", "brace": "kr", "operator_spacing": True},
        "Rust": {"indent": "    ", "brace": "kr", "operator_spacing": True},
        "Kotlin": {"indent": "    ", "brace": "kr", "operator_spacing": True},
        "Swift": {"indent": "    ", "brace": "kr", "operator_spacing": True},
        "Scala": {"indent": "  ", "brace": "kr", "operator_spacing": True},
        "Dart": {"indent": "  ", "brace": "kr", "operator_spacing": True},
        "Ruby": {"indent": "  ", "brace": "kr", "operator_spacing": False},
        "PowerShell": {"indent": "    ", "brace": "kr", "operator_spacing": True},
        "Gradle": {"indent": "    ", "brace": "kr", "operator_spacing": True},
        "SASS": {"indent": "  ", "brace": "kr", "operator_spacing": True},
        "VisualBasic": {"indent": "    ", "brace": "kr", "operator_spacing": True},
        "R": {"indent": "  ", "brace": "kr", "operator_spacing": False},
        "Erlang": {"indent": "    ", "brace": "kr", "operator_spacing": False},
        "Elixir": {"indent": "  ", "brace": "kr", "operator_spacing": False},
        "Clojure": {"indent": "  ", "brace": "kr", "operator_spacing": False},
        "Lisp": {"indent": "  ", "brace": "kr", "operator_spacing": False},
        "C#": {"indent": "    ", "brace": "allman", "operator_spacing": True},
        "Lua": {"indent": "    ", "brace": "kr", "operator_spacing": True},
    }

    # Lines that should NOT decrease indent before them
    _NO_DEDENT_PREFIXES = (
        "else",
        "else if",
        "catch",
        "finally",
        "while",
        "when",
    )

    def __init__(self, language: str, name: str) -> None:
        self._language = language
        self._name = name
        default_cfg = {"indent": "    ", "brace": "kr", "operator_spacing": False}
        raw = self.CONFIGS.get(language, default_cfg)
        indent_val = raw.get("indent", "    ")
        self._indent_str: str = indent_val if isinstance(indent_val, str) else "    "
        brace_val = raw.get("brace", "kr")
        self._brace_style: str = brace_val if isinstance(brace_val, str) else "kr"
        spacing_val = raw.get("operator_spacing", False)
        self._operator_spacing: bool = spacing_val if isinstance(spacing_val, bool) else False

    @property
    def name(self) -> str:
        return self._name

    def is_available(self) -> bool:
        return True

    def format(self, content: str) -> FormatResult:
        try:
            formatted = self._normalize(content)
            return FormatResult(success=True, content=formatted)
        except Exception as e:
            return FormatResult(success=False, content=content, error=str(e))

    def _normalize(self, content: str) -> str:
        if self._language == "VisualBasic":
            return self._normalize_vb(content)
        if self._language == "Ruby":
            return self._normalize_ruby(content)
        return self._normalize_braces(content)

    def _normalize_vb(self, content: str) -> str:
        lines = content.split("\n")
        result: list[str] = []
        depth = 0

        for raw in lines:
            stripped = raw.strip()
            if not stripped:
                result.append("")
                continue

            stripped = self._normalize_spacing(stripped)
            lower = stripped.lower()
            first_word = lower.split()[0] if lower.split() else ""

            if first_word in ("end", "next", "loop"):
                depth = max(0, depth - 1)
            elif first_word in self._VB_SAME:
                depth = max(0, depth - 1)

            result.append(self._indent_str * depth + stripped)

            if first_word in self._VB_SAME:
                depth += 1
            elif first_word in ("end", "next", "loop"):
                pass
            elif lower.startswith(self._VB_OPENERS):
                depth += 1

        return "\n".join(result) + "\n" if result else content

    def _normalize_braces(self, content: str) -> str:
        lines = content.split("\n")
        result: list[str] = []
        depth = 0
        i = 0

        while i < len(lines):
            raw = lines[i]
            i += 1
            stripped = raw.strip()

            if not stripped:
                result.append("")
                continue

            stripped = self._normalize_spacing(stripped)

            if stripped.startswith(("//", "#", "--", "/*", "*", "'")):
                result.append(self._indent_str * depth + stripped)
                continue

            if stripped.startswith("/*") and "*/" not in stripped:
                result.append(self._indent_str * depth + stripped)
                while i < len(lines) and "*/" not in lines[i]:
                    s = lines[i].strip()
                    result.append(self._indent_str * depth + s if s else "")
                    i += 1
                if i < len(lines):
                    s = lines[i].strip()
                    result.append(self._indent_str * depth + s if s else "")
                    i += 1
                continue

            # Count braces in the relevant part of the line
            brace_open = stripped.count("{")
            brace_close = stripped.count("}")

            is_allman = self._brace_style == "allman"

            if self._starts_with_closing(stripped):
                if brace_open >= brace_close and brace_close > 0:
                    # "} else {" — starts with closing but opens new scope
                    indent_before = max(0, depth - brace_close)
                    net_open = brace_open - brace_close
                    depth += net_open
                else:
                    indent_before = max(0, depth - brace_close)
                    depth = max(0, depth - brace_close)
            elif brace_close > brace_open:
                if self._is_no_dedent(stripped):
                    indent_before = depth
                else:
                    indent_before = max(0, depth - (brace_close - brace_open))
                    depth = max(0, depth - (brace_close - brace_open))
            else:
                indent_before = depth

            if is_allman and "{" in stripped and stripped.strip() != "{":
                parts = self._split_allman_ast(stripped)
                for pi, part in enumerate(parts):
                    if pi == 0:
                        result.append(self._indent_str * indent_before + part)
                    elif part == "{":
                        result.append(self._indent_str * depth + "{")
                        depth += 1
                    else:
                        result.append(self._indent_str * depth + part)
            else:
                result.append(self._indent_str * indent_before + stripped)
                if brace_open > brace_close:
                    depth += brace_open - brace_close

        return "\n".join(result) + "\n" if result else content

    def _starts_with_closing(self, s: str) -> bool:
        s = s.lstrip()
        return s.startswith(("}", "]", ")"))

    def _is_no_dedent(self, s: str) -> bool:
        lower = s.lstrip().lower()
        for prefix in self._NO_DEDENT_PREFIXES:
            if lower.startswith(prefix):
                return True
        return bool(re.match(r"^}", s.lstrip()))

    _ALLMAN_KEYWORDS = (
        "class",
        "struct",
        "interface",
        "enum",
        "record",
        "if",
        "else",
        "for",
        "foreach",
        "while",
        "do",
        "catch",
        "finally",
        "try",
        "using",
        "lock",
        "fixed",
        "unsafe",
        "checked",
        "unchecked",
        "switch",
        "namespace",
    )

    # Visual Basic keyword-based indentation
    _VB_OPENERS = (
        "sub",
        "function",
        "module",
        "class",
        "structure",
        "interface",
        "enum",
        "namespace",
        "if",
        "for",
        "while",
        "do",
        "try",
        "using",
        "synclock",
        "with",
        "select",
        "property",
        "get",
        "set",
        "addhandler",
        "removehandler",
        "raiseevent",
    )
    _VB_CLOSERS = (
        "end sub",
        "end function",
        "end module",
        "end class",
        "end structure",
        "end interface",
        "end enum",
        "end namespace",
        "end if",
        "end while",
        "end try",
        "end using",
        "end synclock",
        "end with",
        "end select",
        "end property",
        "end get",
        "end set",
        "end addhandler",
        "end removehandler",
        "end raiseevent",
        "next",
        "loop",
        "end",
    )
    _VB_SAME = (
        "else",
        "elseif",
        "catch",
        "finally",
        "case",
    )

    _RUBY_INDENT = frozenset({
        "def", "class", "module", "if", "unless", "case", "while",
        "until", "for", "begin", "do",
    })
    _RUBY_DEDENT = frozenset({"end"})
    _RUBY_SAME = frozenset({"else", "elsif", "when", "rescue", "ensure"})
    _RUBY_MODIFIERS = frozenset({"if", "unless", "while", "until", "rescue"})

    def _normalize_ruby(self, content: str) -> str:
        lines = content.split("\n")
        result: list[str] = []
        depth = 0

        for raw in lines:
            stripped = raw.strip()
            if not stripped:
                result.append("")
                continue

            first = stripped.split()[0].lower() if stripped.split() else ""

            if first in self._RUBY_DEDENT:
                depth = max(0, depth - 1)

            if first in self._RUBY_SAME:
                depth = max(0, depth - 1)

            result.append(self._indent_str * depth + stripped)

            if first in self._RUBY_INDENT:
                depth += 1
            elif first in self._RUBY_SAME:
                depth += 1
            elif re.search(r'\bdo\b', stripped) and not stripped.startswith('end'):
                depth += 1
            elif first in ('private', 'protected', 'public'):
                pass

        return "\n".join(result) + "\n" if result else content

    def _split_allman_ast(self, s: str) -> list[str]:
        """Split at `{` only when it follows a keyword or closing paren."""
        parts: list[str] = []
        i = 0
        while i < len(s):
            ci = s.find("{", i)
            if ci == -1:
                rest = s[i:].strip()
                if rest:
                    parts.append(rest)
                break

            before = s[i:ci].rstrip()

            should_split = False
            if before.endswith(")"):
                should_split = True
            else:
                last_word = before.split()[-1] if before.split() else ""
                if last_word in self._ALLMAN_KEYWORDS:
                    should_split = True

            if should_split and before:
                parts.append(before)
                parts.append("{")
                i = ci + 1
            else:
                parts.append(s[i:].strip())
                break
        return parts

    def _normalize_spacing(self, s: str) -> str:
        if not self._operator_spacing:
            return s

        s = re.sub(r" {2,}", " ", s)
        # Operators (=> must come before = to avoid splitting => into = >)
        # > as comparison: >= only (bare > is too ambiguous with generics)
        s = re.sub(r"\s*(=>|>=|<=|!=|\+=|-=|\*=|/=|%=|&=|\|=|\^=|<<=?|>>=?)\s*", r" \1 ", s)
        # Handle = separately, but avoid :=, ==
        s = re.sub(r"(?<![:!<>=])=(?!=)", " = ", s)
        # Fix composite operators that got split
        s = re.sub(r"\s*(:=|::|\.\.|\?\.|->)\s*", r"\1", s)

        s = re.sub(r"\(\s+", "(", s)
        s = re.sub(r"\s+\)", ")", s)
        s = re.sub(r"\[\s+", "[", s)
        s = re.sub(r"\s+\]", "]", s)
        s = re.sub(r"\s+\{", " {", s)
        s = re.sub(r"\{(?!\s*\{)\s+", "{", s)
        s = re.sub(r"\s+\}", "}", s)
        s = re.sub(r"\}\s+else\s*\{?", "} else {", s)
        s = re.sub(r"\}else", "} else", s)
        s = re.sub(r"else\{", "else {", s)
        s = re.sub(r"\}\s+catch\s*\(?", "} catch (", s)
        s = re.sub(r"\}\s+finally\s*\{?", "} finally {", s)
        s = re.sub(r"\)\s*\{", ") {", s)
        s = re.sub(r"\)\s*else", ") else", s)
        s = re.sub(r"if\s*\(", "if (", s)
        s = re.sub(r"while\s*\(", "while (", s)
        s = re.sub(r"for\s*\(", "for (", s)
        s = re.sub(r"foreach\s*\(", "foreach (", s)
        s = re.sub(r"catch\s*\(", "catch (", s)
        s = re.sub(r"switch\s*\(", "switch (", s)
        s = re.sub(r"typeof\s*\(", "typeof (", s)

        s = s.strip()
        return s
