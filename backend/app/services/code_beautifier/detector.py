import re
from pathlib import PurePosixPath

EXTENSION_MAP: dict[str, str] = {
    ".py": "Python",
    ".pyi": "Python",
    ".pyw": "Python",
    ".js": "JavaScript",
    ".mjs": "JavaScript",
    ".cjs": "JavaScript",
    ".jsx": "JSX",
    ".ts": "TypeScript",
    ".mts": "TypeScript",
    ".cts": "TypeScript",
    ".tsx": "TSX",
    ".html": "HTML",
    ".htm": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".sass": "SASS",
    ".less": "LESS",
    ".sql": "SQL",
    ".go": "Go",
    ".rs": "Rust",
    ".sh": "Shell",
    ".bash": "Shell",
    ".zsh": "Shell",
    ".php": "PHP",
    ".rb": "Ruby",
    ".lua": "Lua",
    ".java": "Java",
    ".kt": "Kotlin",
    ".kts": "Kotlin",
    ".cs": "C#",
    ".swift": "Swift",
    ".c": "C",
    ".h": "C",
    ".cpp": "C++",
    ".hpp": "C++",
    ".cc": "C++",
    ".cxx": "C++",
    ".m": "Objective-C",
    ".mm": "Objective-C",
    ".gradle": "Gradle",
    ".ps1": "PowerShell",
    ".dart": "Dart",
    ".r": "R",
    ".lisp": "Lisp",
    ".clj": "Clojure",
    ".scala": "Scala",
    ".erl": "Erlang",
    ".ex": "Elixir",
    ".exs": "Elixir",
    ".sol": "Solidity",
    ".elm": "Elm",
    ".md": "Markdown",
    ".mdx": "Markdown",
    ".vb": "VisualBasic",
    ".json": "JSON",
    ".xml": "XML",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".toml": "TOML",
    ".env": "ENV",
    ".ini": "INI",
    ".pl": "Perl",
    ".pm": "Perl",
    ".cmake": "CMake",
    ".dockerfile": "Dockerfile",
    ".makefile": "Makefile",
    ".d": "D",
    ".hrl": "Erlang",
}

NAME_MAP: dict[str, str] = {
    "dockerfile": "Dockerfile",
    "makefile": "Makefile",
    "cmakelists.txt": "CMake",
    ".gitignore": "Git",
    ".gitattributes": "Git",
    ".editorconfig": "EditorConfig",
}

CONTENT_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"^#!\s*(?:/usr)?/bin/(?:env\s+)?(?:python|python3)\b", re.MULTILINE), "Python"),
    (re.compile(r"^#!\s*(?:/usr)?/bin/(?:env\s+)?node\b", re.MULTILINE), "JavaScript"),
    (re.compile(r"^#!\s*(?:/usr)?/bin/(?:env\s+)?bash\b", re.MULTILINE), "Shell"),
    (re.compile(r"^#!\s*(?:/usr)?/bin/(?:env\s+)?sh\b", re.MULTILINE), "Shell"),
    (re.compile(r"^#!\s*(?:/usr)?/bin/(?:env\s+)?ruby\b", re.MULTILINE), "Ruby"),
    (re.compile(r"^#!\s*(?:/usr)?/bin/(?:env\s+)?lua\b", re.MULTILINE), "Lua"),
    (re.compile(r"^#!\s*(?:/usr)?/bin/(?:env\s+)?deno\b", re.MULTILINE), "JavaScript"),
    (re.compile(r"^<!DOCTYPE\s+html", re.IGNORECASE | re.MULTILINE), "HTML"),
    (re.compile(r"^<html", re.IGNORECASE | re.MULTILINE), "HTML"),
    (re.compile(r"^(?:from\s+\S+\s+)?import\s+\S", re.MULTILINE), "Python"),
    (
        re.compile(r"^(?:export\s+)?(?:const|let|var|function|class|import)\s", re.MULTILINE),
        "JavaScript",
    ),
    (re.compile(r"^(?:interface|type|enum|namespace)\s", re.MULTILINE), "TypeScript"),
    (re.compile(r"^package\s+main\b", re.MULTILINE), "Go"),
    (re.compile(r"^fn\s+\w+", re.MULTILINE), "Rust"),
    (re.compile(r"^use\s+(?:std|serde|tokio|actix|axum)", re.MULTILINE), "Rust"),
]


def detect_language(content: str, filename: str = "") -> str:
    if filename:
        name = PurePosixPath(filename).name.lower()
        if name in NAME_MAP:
            return NAME_MAP[name]

        ext = PurePosixPath(filename).suffix.lower()
        if ext in EXTENSION_MAP:
            return EXTENSION_MAP[ext]

    for pattern, lang in CONTENT_PATTERNS:
        if pattern.search(content):
            return lang

    return "Unknown"
