from .formatters.base import Formatter
from .formatters.builtin_fmt import BuiltinFormatter
from .formatters.datafmt_fmt import (
    EnvFormatter,
    IniFormatter,
    JsonFormatter,
    TomlFormatter,
    XmlFormatter,
    YamlFormatter,
)
from .formatters.external import SubprocessFormatter
from .formatters.fallback import FallbackFormatter
from .formatters.prettier_fmt import PARSER_MAP, PLUGIN_MAP, PrettierFormatter
from .formatters.python_fmt import BlackFormatter, RuffFormatter
from .formatters.sqlparse_fmt import SqlparseFormatter


class FormatterRegistry:
    def __init__(self) -> None:
        self._mapping: dict[str, list[Formatter]] = {}
        self._fallback = FallbackFormatter()
        self._register_all()

    def _register_all(self) -> None:
        self._register_python()
        self._register_prettier()
        self._register_sql()
        self._register_data_formats()
        self._register_subprocess_formatters()
        self._register_builtin_fallbacks()
        self._register_builtin_only_languages()

    def _register_python(self) -> None:
        self.register("Python", [RuffFormatter(), BlackFormatter()])

    def _register_prettier(self) -> None:
        for lang, parser in PARSER_MAP.items():
            if lang in PLUGIN_MAP:
                pf = PrettierFormatter().with_parser(parser).with_plugin(PLUGIN_MAP[lang])
            else:
                pf = PrettierFormatter().with_parser(parser)
            self.register(lang, [pf])

    def _register_sql(self) -> None:
        self.register("SQL", [SqlparseFormatter()])

    def _register_data_formats(self) -> None:
        self.register("JSON", [JsonFormatter()])
        self.register("YAML", [YamlFormatter()])
        self.register("TOML", [TomlFormatter()])
        self.register("XML", [XmlFormatter()])
        self.register("INI", [IniFormatter()])
        self.register("ENV", [EnvFormatter()])

    def _register_subprocess_formatters(self) -> None:
        self._register_subprocess("C", "clang-format", ["-style=file", "-i"])
        self._register_subprocess("C++", "clang-format", ["-style=file", "-i"])
        self._register_subprocess("Objective-C", "clang-format", ["-style=file", "-i"])
        self._register_subprocess("Shell", "shfmt", use_stdin=True)
        self._register_subprocess("CMake", "cmake-format", ["-i"])
        self._register_subprocess("Go", "gofmt", ["-w"])
        self._register_subprocess("Rust", "rustfmt")
        self._register_subprocess("Kotlin", "ktfmt")
        self._register_subprocess("Swift", "swift-format", use_stdin=True)
        self._register_subprocess("Ruby", "rufo", use_stdin=True)
        self._register_subprocess("C#", "dotnet", ["format"])

    _BUILTIN_LANGS: list[tuple[str, str]] = [
        ("Go", "gofmt"),
        ("Rust", "rustfmt"),
        ("Kotlin", "ktfmt"),
        ("Swift", "swift-format"),
        ("Ruby", "rufo"),
        ("C#", "dotnet format"),
        ("Lua", "stylua"),
        ("SASS", "SASS"),
        ("VisualBasic", "VisualBasic"),
        ("Scala", "scalafmt"),
        ("Dart", "dart format"),
        ("PowerShell", "powershell"),
        ("Gradle", "gradle"),
        ("R", "R"),
        ("Erlang", "Erlang"),
        ("Elixir", "Elixir"),
        ("Clojure", "Clojure"),
        ("Lisp", "Lisp"),
        ("C", "clang-format"),
        ("C++", "clang-format"),
        ("Objective-C", "clang-format"),
        ("Shell", "shfmt"),
        ("CMake", "cmake-format"),
        ("Perl", "Perl"),
        ("Dockerfile", "Dockerfile"),
        ("Makefile", "Makefile"),
        ("Unknown", "safe cleanup"),
    ]

    def _register_builtin_fallbacks(self) -> None:
        for lang, name in self._BUILTIN_LANGS:
            bf = BuiltinFormatter(language=lang, name=f"{name} (builtin)")
            existing = self.get_formatters(lang)
            self._mapping[lang] = existing + [bf]

    def _register_builtin_only_languages(self) -> None:
        builtin_only = [
            "JavaScript", "TypeScript", "JSX", "TSX", "HTML", "CSS",
            "SCSS", "LESS", "Markdown", "PHP", "Java", "Solidity", "Elm",
        ]
        for lang in builtin_only:
            existing = self.get_formatters(lang)
            bf = BuiltinFormatter(language=lang, name=f"{lang} (builtin)")
            self._mapping[lang] = existing + [bf]

    def _register_subprocess(
        self,
        language: str,
        binary: str,
        args: list[str] | None = None,
        *,
        use_stdin: bool = False,
    ) -> None:
        fmtr = SubprocessFormatter(
            name=binary,
            binary=binary,
            args=args or [],
            use_stdin=use_stdin,
        )
        self.register(language, [fmtr])

    def register(self, language: str, formatters: list[Formatter]) -> None:
        if language in self._mapping:
            self._mapping[language].extend(formatters)
        else:
            self._mapping[language] = formatters

    def get_formatters(self, language: str) -> list[Formatter]:
        return self._mapping.get(language, [])

    def get_fallback(self) -> Formatter:
        return self._fallback
