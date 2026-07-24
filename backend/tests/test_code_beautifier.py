from app.services.code_beautifier import beautify_code, get_line_stats
from app.services.code_beautifier.detector import detect_language
from app.services.code_beautifier.recovery import recover

# ── Recovery Engine ──────────────────────────────────────────────


def test_recovery_normalize_line_endings():
    r = recover("a\r\nb\rc\n")
    assert "Normalized line endings" in r.transformations
    assert r.recovered == "a\nb\nc\n"


def test_recovery_remove_bom():
    r = recover("\ufeffhello")
    assert "Removed UTF-8 BOM" in r.transformations
    assert r.recovered == "hello\n"


def test_recovery_trailing_whitespace():
    r = recover("a   \nb  \n")
    assert "Removed trailing whitespace" in r.transformations
    assert r.recovered == "a\nb\n"


def test_recovery_collapse_blank_lines():
    r = recover("a\n\n\n\n\nb\n")
    assert "Collapsed excessive blank lines" in r.transformations
    assert r.recovered == "a\n\nb\n"


def test_recovery_tabs_to_spaces():
    r = recover("\ta\n")
    assert "Normalized tabs to spaces" in r.transformations
    assert r.recovered == "    a\n"


def test_recovery_leading_blank_lines():
    r = recover("\n\n\na\n")
    assert "Removed leading blank lines" in r.transformations
    assert r.recovered == "a\n"


def test_recovery_final_newline():
    r = recover("a")
    assert "Added final newline" in r.transformations
    assert r.recovered == "a\n"


def test_recovery_idempotent():
    r1 = recover("a\r\nb\rc\n\n\n  d\t\n")
    r2 = recover(r1.recovered)
    assert len(r2.transformations) == 0


def test_recovery_empty():
    r = recover("")
    assert r.recovered == "\n"


def test_recovery_noop():
    r = recover("hello\nworld\n")
    assert len(r.transformations) == 0
    assert r.recovered == "hello\nworld\n"


# ── Python ───────────────────────────────────────────────────────


def test_python_valid():
    code = "x={'a':1,'b':2}\n"
    result = beautify_code(code, filename="test.py")
    assert result.success
    assert result.language == "Python"
    assert result.formatter in ("ruff", "black")
    assert result.validation_passed
    assert result.processing_time > 0


def test_python_mixed_tabs_spaces():
    code = "def foo():\n\treturn 42\n"
    result = beautify_code(code, filename="test.py")
    assert result.success
    assert "    return 42" in result.result


def test_python_trailing_spaces():
    code = "x = 1   \ny = 2   \n"
    result = beautify_code(code, filename="test.py")
    assert result.success
    assert "   " not in result.result


def test_python_broken_indentation():
    code = "if True:\n    x = 1\n      y = 2\n"
    result = beautify_code(code, filename="test.py")
    assert result.success
    assert result.recovery_attempted
    assert "    y = 2" in result.result


def test_python_black_rejects_recovery_succeeds():
    code = "x=1\n  y=2\n"
    result = beautify_code(code, filename="test.py")
    assert result.success
    assert result.recovery_attempted


def test_python_syntax_unfixable():
    code = "def foo(:\n    pass\n"
    result = beautify_code(code, filename="test.py")
    assert not result.success
    assert result.recovery_attempted
    assert result.recovery_error is not None


def test_python_missing_final_newline():
    code = "x = 1"
    result = beautify_code(code, filename="test.py")
    assert result.success
    assert result.recovery_attempted


def test_python_no_semantic_change():
    code = "def add(a, b):\n    return a + b\n"
    result = beautify_code(code, filename="test.py")
    assert result.success
    assert "def add(a, b):" in result.result
    assert "return a + b" in result.result


# ── JavaScript ───────────────────────────────────────────────────


def test_javascript_prettier():
    code = "const x=1\n"
    result = beautify_code(code, filename="test.js")
    assert result.success
    assert result.language == "JavaScript"
    assert "prettier" in result.formatter
    assert "const x = 1;" in result.result


def test_typescript_prettier():
    code = 'const x:string="hello"\n'
    result = beautify_code(code, filename="test.ts")
    assert result.success
    assert result.language == "TypeScript"


def test_html_prettier():
    code = "<html><body><p>hello</p></body></html>\n"
    result = beautify_code(code, filename="test.html")
    assert result.success
    assert result.language == "HTML"
    assert "<body>" in result.result
    assert "  <p>" in result.result


def test_css_prettier():
    code = "body{margin:0}\n"
    result = beautify_code(code, filename="test.css")
    assert result.success
    assert result.language == "CSS"
    assert "body {" in result.result
    assert "  margin: 0;" in result.result


def test_scss_prettier():
    code = "$primary: #333;body{color:$primary}\n"
    result = beautify_code(code, filename="test.scss")
    assert result.success
    assert result.language == "SCSS"


def test_sql_sqlparse():
    code = "select * from users where id = 1\n"
    result = beautify_code(code, filename="test.sql")
    assert result.success
    assert result.language == "SQL"
    assert result.formatter == "sqlparse"
    assert "SELECT" in result.result
    assert "WHERE" in result.result


# ── Fallback ─────────────────────────────────────────────────────


def test_unknown_language_fallback():
    code = "some random text\nwith multiple lines\n"
    result = beautify_code(code, filename="test.xyz")
    assert result.success
    assert result.language == "Unknown"
    assert "builtin" in result.formatter or "fallback" in result.formatter
    assert "some random text" in result.result
    assert "with multiple lines" in result.result


# ── Detection ────────────────────────────────────────────────────


def test_detection_by_extension():
    for ext, lang in [
        (".py", "Python"),
        (".js", "JavaScript"),
        (".ts", "TypeScript"),
        (".html", "HTML"),
        (".css", "CSS"),
        (".go", "Go"),
        (".rs", "Rust"),
        (".sql", "SQL"),
        (".sh", "Shell"),
        (".java", "Java"),
        (".cpp", "C++"),
        (".rb", "Ruby"),
    ]:
        assert detect_language("", filename=f"test{ext}") == lang


def test_detection_by_shebang():
    assert detect_language("#!/usr/bin/env python\n") == "Python"
    assert detect_language("#!/usr/bin/env node\n") == "JavaScript"
    assert detect_language("#!/bin/bash\n") == "Shell"


def test_detection_by_content():
    assert detect_language("import os") == "Python"
    assert detect_language("const x = 1") == "JavaScript"
    assert detect_language("interface Foo {}") == "TypeScript"
    assert detect_language("<html>") == "HTML"


def test_detection_by_name():
    assert detect_language("", filename="Dockerfile") == "Dockerfile"
    assert detect_language("", filename="Makefile") == "Makefile"
    assert detect_language("", filename=".gitignore") == "Git"


# ── Metadata ─────────────────────────────────────────────────────


def test_get_line_stats():
    total, non_empty = get_line_stats("a\nb\nc\n")
    assert total == 4
    assert non_empty == 3


def test_processing_time_nonzero():
    result = beautify_code("x = 1\n", filename="test.py")
    assert result.processing_time > 0


def test_metadata_full():
    result = beautify_code("x = 1\n", filename="test.py")
    assert result.language == "Python"
    assert result.formatter in ("ruff", "black")
    assert result.success
    assert result.validation_passed
    assert result.validation_error is None


# ── Recovery: New Steps ──────────────────────────────────────────


def test_recovery_mixed_indent():
    r = recover("\t    mixed\n")
    assert "Fixed mixed tabs/spaces in indentation" in r.transformations


def test_recovery_trailing_blank_lines():
    r = recover("a\nb\n\n\n\n")
    assert "Removed trailing blank lines" in r.transformations
    assert r.recovered == "a\nb\n"


def test_recovery_trailing_blank_lines_only():
    r = recover("a\nb\n\n")
    assert "Removed trailing blank lines" in r.transformations
    assert r.recovered == "a\nb\n"


def test_recovery_trailing_blank_noop():
    r = recover("a\nb\n")
    assert "Removed trailing blank lines" not in r.transformations


def test_recovery_full_pipeline():
    r = recover("\ufeffa\r\nb  \n\n\n\n")
    assert "Removed UTF-8 BOM" in r.transformations
    assert "Normalized line endings" in r.transformations
    assert "Removed trailing whitespace" in r.transformations
    assert "Collapsed excessive blank lines" in r.transformations
    assert "Removed trailing blank lines" in r.transformations
    assert r.recovered == "a\nb\n"


# ── Ruff Formatter ───────────────────────────────────────────────


def test_ruff_formats_python():
    from app.services.code_beautifier.formatters.python_fmt import RuffFormatter

    f = RuffFormatter()
    assert f.is_available()
    assert f.name == "ruff"
    result = f.format("x=1\n")
    assert result.success
    assert "x = 1" in result.content


def test_ruff_falls_through_to_black_on_syntax_error():
    code = "x=1\n  y=2\n"
    result = beautify_code(code, filename="test.py")
    assert result.success
    assert result.formatter == "black"
    assert result.recovery_attempted


# ── Real-World Python ────────────────────────────────────────────


def test_python_class_decorator():
    code = "@dataclass\nclass Point:\nx:int=0\ny:int=0\n"
    result = beautify_code(code, filename="test.py")
    assert not result.success
    assert result.recovery_attempted


def test_python_complex_function():
    code = (
        "def process(items:list[int],callback=None)->list[int]:\n"
        "    result=[]\n"
        "    for i,item in enumerate(items):\n"
        "        val=callback(item)if callback else item\n"
        "        result.append(val)\n"
        "    return result\n"
    )
    result = beautify_code(code, filename="test.py")
    assert result.success
    assert "result.append(val)" in result.result


def test_python_malformed_mixed_whitespace():
    code = "\t    def foo():\n\t\t        pass\n"
    result = beautify_code(code, filename="test.py")
    assert result.success
    assert result.recovery_attempted


# ── Real-World JavaScript ────────────────────────────────────────


def test_javascript_arrow_function():
    code = "const add=(a,b)=>a+b\n"
    result = beautify_code(code, filename="test.js")
    assert result.success
    assert "prettier" in result.formatter
    assert "=>" in result.result


def test_javascript_async_function():
    code = "async function fetchData(url){const response=await fetch(url);return response.json()}\n"
    result = beautify_code(code, filename="test.js")
    assert result.success
    assert "async function fetchData" in result.result


# ── Real-World SQL ───────────────────────────────────────────────


def test_sql_join():
    code = (
        "select u.name, o.total from users u "
        "inner join orders o on u.id = o.user_id "
        "where o.total > 100 order by o.total desc\n"
    )
    result = beautify_code(code, filename="test.sql")
    assert result.success
    assert "SELECT" in result.result
    assert "INNER JOIN" in result.result


# ── Subprocess Formatters (availability-aware) ───────────────────


def test_subprocess_formatter_unavailable():
    from app.services.code_beautifier.formatters.external import SubprocessFormatter

    f = SubprocessFormatter("nonexistent", "this_tool_does_not_exist_xyz", [])
    assert not f.is_available()
    result = f.format("test\n")
    assert not result.success
    assert "not found" in (result.error or "")


def test_subprocess_formatter_name():
    from app.services.code_beautifier.formatters.external import SubprocessFormatter

    f = SubprocessFormatter("clang-format", "clang-format", ["-i"])
    assert f.name == "clang-format"


# ── End-to-End Pipeline Tests ────────────────────────────────────


def test_pipeline_recovery_and_validation():
    code = "x=1\ny=2\n"
    result = beautify_code(code, filename="test.py")
    assert result.success
    assert result.validation_passed
    assert result.validation_error is None


def test_pipeline_bom_crlf_trailing_ws():
    code = "\ufeffdef foo():\n    return 1  \r\n"
    result = beautify_code(code, filename="test.py")
    assert result.success
    assert result.recovery_attempted
    assert "return 1" in result.result


def test_pipeline_malformed_sql_preserved():
    code = "SELECCT * FORM users\n"
    result = beautify_code(code, filename="test.sql")
    assert result.success
    assert result.formatter == "sqlparse"
    keywords = result.result.lower()
    assert "selecct" in keywords
    assert "form" in keywords


def test_pipeline_empty_file():
    result = beautify_code("", filename="test.py")
    assert result.success


def test_pipeline_no_filename():
    result = beautify_code("x = 1\n")
    assert result.result is not None


# ── Large/Source Input ───────────────────────────────────────────


def test_large_python_file():
    lines = [f"x{i} = {i}\n" for i in range(500)]
    code = "".join(lines)
    result = beautify_code(code, filename="test.py")
    assert result.success


def test_large_html_file():
    paragraphs = "\n".join(f"<p>Paragraph {i}</p>" for i in range(200))
    code = f"<html><body>\n{paragraphs}\n</body></html>\n"
    result = beautify_code(code, filename="test.html")
    assert result.success


# ── C# Over-formatting Regression ───────────────────────────────


def test_csharp_string_interpolation_preserved():
    code = 'Console.Write($"{x + y}")'
    r = beautify_code(code, "test.cs")
    result = r.result.rstrip()
    assert "$" in result  # string interpolation preserved
    assert "{x + y}" in result or result == code


def test_csharp_allman_no_extra_braces():
    code = "if (x) { return 1; }"
    r = beautify_code(code, "test.cs")
    result = r.result.rstrip()
    lines = result.split("\n")
    assert lines[0] == "if (x)"
    assert lines[1] == "{"
    # Should NOT have two { lines
    assert lines.count("{") == 1


def test_csharp_object_initializer_not_broken():
    code = 'var d = new Dictionary<string, int> { {"a", 1} };'
    r = beautify_code(code, "test.cs")
    result = r.result.rstrip()
    assert "Dictionary" in result
    assert result.count("{") == result.count("}")


def test_csharp_array_initializer_not_broken():
    code = "int[] arr = { 1, 2, 3 };"
    r = beautify_code(code, "test.cs")
    result = r.result.rstrip()
    assert "arr" in result
    assert result.count("{") == result.count("}")


# ── VisualBasic ──────────────────────────────────────────────────


def test_visualbasic_module():
    code = "Module Program\n    Sub Main()\n    End Sub\nEnd Module"
    r = beautify_code(code, "test.vb")
    assert r.success
    result = r.result.rstrip()
    assert "Module Program" in result
    assert "Sub Main()" in result
    assert "End Sub" in result
    assert "End Module" in result


def test_visualbasic_keyword_indentation():
    code = 'If True Then\nMsgBox("ok")\nEnd If'
    r = beautify_code(code, "test.vb")
    assert r.success
    result = r.result.rstrip()
    lines = result.split("\n")
    # Match non-empty lines (skip blank)
    non_empty = [ln for ln in lines if ln.strip()]
    assert len(non_empty) >= 3


# ── Line Stats ───────────────────────────────────────────────────


def test_get_line_stats_empty():
    assert get_line_stats("") == (1, 0)


def test_get_line_stats_nonempty():
    assert get_line_stats("a\nb\nc\n") == (4, 3)
