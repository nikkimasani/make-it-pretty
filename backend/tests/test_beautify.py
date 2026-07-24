from app.services import beautify


def test_remove_excessive_blank_lines():
    result, _, _ = beautify.process_text("Hello\n\n\n\nWorld")
    assert result == "Hello\n\nWorld"


def test_normalize_line_endings():
    result, _, _ = beautify.process_text("Hello\r\nWorld\r\n")
    assert result == "Hello\nWorld\n"


def test_trailing_whitespace():
    result, _, _ = beautify.process_text("Hello   \nWorld  \n")
    assert result == "Hello\nWorld\n"


def test_remove_bom():
    result, _, _ = beautify.process_text("\ufeffHello")
    assert "\ufeff" not in result
    assert result.strip() == "Hello"


def test_unicode_normalize_nfc():
    composed = "\u00e9"
    decomposed = "\u0065\u0301"
    result, _, _ = beautify.process_text(decomposed)
    assert result == composed


def test_remove_control_chars():
    result, _, _ = beautify.process_text("Hello\x00World\x01\n")
    assert "HelloWorld" in result


def test_control_chars_preserve_newlines_tabs():
    result, _, _ = beautify.process_text("Hello\n\tWorld\n")
    assert "Hello\n\tWorld" in result


def test_collapse_multiple_spaces():
    result, _, _ = beautify.process_text("Hello    World\n")
    assert "Hello World" in result


def test_collapse_spaces_preserves_indent():
    result, _, _ = beautify.process_text("    Hello    World\n")
    assert "    Hello World" in result


def test_full_pipeline():
    messy = "\ufeffHello\r\n\n\n\n  World   \n  Foo  Bar  \n"
    result, _, _ = beautify.process_text(messy)
    assert "\ufeff" not in result
    assert "\r" not in result
    # Within-line double spaces should be collapsed (ignoring leading indent)
    lines = result.split("\n")
    for line in lines:
        stripped = line.lstrip()
        if stripped:
            assert "  " not in stripped, f"Found double spaces in: {repr(line)}"
    lines = result.rstrip("\n").split("\n")
    assert len([ln for ln in lines if ln.strip()]) > 0


def test_grammar_double_word():
    _, _, suggestions = beautify.process_text("the the quick brown fox", grammar_check=True)
    double_words = [s for s in suggestions if "Repeated word" in str(s["message"])]
    assert len(double_words) > 0


def test_grammar_space_before_period():
    _, _, suggestions = beautify.process_text("Hello . World", grammar_check=True)
    punct_fixes = [s for s in suggestions if "Space before period" in str(s["message"])]
    assert len(punct_fixes) > 0


def test_grammar_common_misspelling():
    _, _, suggestions = beautify.process_text("This is definately correct", grammar_check=True)
    misspellings = [s for s in suggestions if "definitely" in str(s.get("suggestion", ""))]
    assert len(misspellings) > 0


def test_grammar_disabled_returns_no_suggestions():
    _, _, suggestions = beautify.process_text("definately", grammar_check=False)
    assert len(suggestions) == 0


def test_emoji_enrichment():
    result, _, _ = beautify.process_text("I love music and code", emoji_enrichment=True)
    assert "🎵" in result
    assert "💻" in result


def test_emoji_enrichment_partial_word_no_match():
    result, _, _ = beautify.process_text("notation is important", emoji_enrichment=True)
    assert "📝" not in result  # "notation" should NOT match "note"


def test_emoji_enrichment_disabled():
    result, _, _ = beautify.process_text("I love music", emoji_enrichment=False)
    assert "🎵" not in result


def test_writing_direction_ltr():
    _, direction, _ = beautify.process_text("Hello world\n")
    assert direction == "ltr"


def test_writing_direction_rtl():
    _, direction, _ = beautify.process_text("مرحبا بالعالم\n")
    assert direction == "rtl"


def test_return_tuple_length():
    result = beautify.process_text("Hello", grammar_check=True, emoji_enrichment=True)
    assert len(result) == 3  # (text, direction, suggestions)


def test_empty_input():
    result, direction, suggestions = beautify.process_text("")
    assert result == ""
    assert direction == "ltr"
    assert len(suggestions) == 0


def test_emoji_enrichment_stemming_ing():
    result, _, _ = beautify.process_text("I am coding", emoji_enrichment=True)
    assert "💻" in result  # "coding" stems to "code"


def test_emoji_enrichment_stemming_ed():
    result, _, _ = beautify.process_text("I cooked dinner", emoji_enrichment=True)
    assert "👨‍🍳" in result or "🍽️" in result  # "cooked" or "dinner"


def test_emoji_enrichment_stemming_plural():
    result, _, _ = beautify.process_text("I love flowers", emoji_enrichment=True)
    assert "🌸" in result  # "flowers" stems to "flower"


def test_no_suggestions_when_no_issues():
    sentence = "The quick brown fox jumps over the lazy dog"
    _, _, suggestions = beautify.process_text(sentence, grammar_check=True)
    # Common words with no misspellings should not generate suggestions
    spelling_issues = [s for s in suggestions if "misspelling" in str(s.get("message", "")).lower()]
    assert len(spelling_issues) == 0


def test_emoji_no_double_insertion():
    result, _, _ = beautify.process_text("I love music and music is great", emoji_enrichment=True)
    # "music" should only get emoji once
    assert result.count("🎵") == 1
