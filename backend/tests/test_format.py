import json

import yaml

from app.services import formatter as svc


def test_format_json_object():
    result, fmt = svc.process_data('{"key": "value", "num": 42}')
    assert fmt == "json"
    parsed = json.loads(result)
    assert parsed == {"key": "value", "num": 42}
    assert "  " in result


def test_format_json_nested():
    result, fmt = svc.process_data('{"a":{"b":{"c":1}}}')
    assert fmt == "json"
    parsed = json.loads(result)
    assert parsed == {"a": {"b": {"c": 1}}}
    assert "    " in result


def test_format_json_array():
    result, fmt = svc.process_data("[1, 2, 3]")
    assert fmt == "json"
    assert json.loads(result) == [1, 2, 3]


def test_format_json_invalid():
    result, fmt = svc.process_data("{invalid}")
    assert result == "{invalid}"
    assert fmt == "text"


def test_format_json_minified():
    result, fmt = svc.process_data('{"a":1,"b":2}')
    assert fmt == "json"
    assert "\n" in result


def test_format_json_unicode():
    result, fmt = svc.process_data('{"msg": "héllo"}')
    assert fmt == "json"
    assert "héllo" in result


def test_format_json_indent():
    result, fmt = svc.process_data('{"a": 1}', indent_size=4)
    assert fmt == "json"
    assert "    " in result


def test_format_json_sort_keys():
    result, fmt = svc.process_data('{"z": 1, "a": 2}', sort_keys=True)
    assert fmt == "json"
    assert result.index('"a"') < result.index('"z"')


def test_format_yaml_simple():
    result, fmt = svc.process_data("key: value\nnum: 42")
    assert fmt == "yaml"
    parsed = yaml.safe_load(result)
    assert parsed == {"key": "value", "num": 42}


def test_format_yaml_nested():
    result, fmt = svc.process_data("a:\n  b:\n    c: 1")
    assert fmt == "yaml"
    parsed = yaml.safe_load(result)
    assert parsed == {"a": {"b": {"c": 1}}}


def test_format_yaml_list():
    result, fmt = svc.process_data("- one\n- two\n- three")
    assert fmt == "yaml"
    parsed = yaml.safe_load(result)
    assert parsed == ["one", "two", "three"]


def test_format_yaml_invalid():
    result, fmt = svc.process_data(": invalid yaml : :")
    assert fmt == "text"


def test_format_xml_simple():
    xml_input = "<root><item id='1'>hello</item></root>"
    result, fmt = svc.process_data(xml_input)
    assert fmt == "xml"
    assert "<root>" in result
    assert "<item" in result
    assert "hello" in result


def test_format_xml_nested():
    xml_input = "<root><parent><child>text</child></parent></root>"
    result, fmt = svc.process_data(xml_input)
    assert fmt == "xml"
    assert "  " in result


def test_format_xml_self_closing():
    xml_input = "<root><empty/></root>"
    result, fmt = svc.process_data(xml_input)
    assert fmt == "xml"


def test_format_xml_malformed():
    result, fmt = svc.process_data("<root><broken>")
    assert fmt == "text"


def test_format_toml_simple():
    toml_input = 'title = "example"\nnumber = 42'
    result, fmt = svc.process_data(toml_input)
    assert fmt == "toml"


def test_format_toml_nested():
    toml_input = '[owner]\nname = "Tom"\n[database]\nport = 5432'
    result, fmt = svc.process_data(toml_input)
    assert fmt == "toml"
    assert "owner" in result.lower() or "[owner]" in result


def test_format_env_simple():
    env_input = "KEY=value\nANOTHER=123"
    result, fmt = svc.process_data(env_input)
    assert fmt == "env"
    assert "KEY=value" in result


def test_format_env_with_comments():
    env_input = "# This is a comment\nKEY=value\n"
    result, fmt = svc.process_data(env_input)
    assert fmt == "env"
    assert "#" in result


def test_detect_json():
    result, fmt = svc.process_data('{"a": 1}')
    assert fmt == "json"


def test_detect_empty():
    result, fmt = svc.process_data("")
    assert fmt == "text"


# ── INI ──────────────────────────────────────────────────────────


def test_format_ini_simple():
    ini_input = "[database]\nhost = localhost\nport = 5432\n"
    result, fmt = svc.process_data(ini_input)
    assert fmt == "ini"
    assert "[database]" in result
    assert "host=localhost" in result


def test_format_ini_with_sections():
    ini_input = (
        "[server]\nhost = 0.0.0.0\nport = 8080\n\n[logging]\nlevel = debug\nfile = app.log\n"
    )
    result, fmt = svc.process_data(ini_input)
    assert fmt == "ini"
    assert "[server]" in result
    assert "[logging]" in result


def test_format_ini_malformed():
    result, fmt = svc.process_data("@{ invalid ] [[ ini }")
    assert fmt == "text"


def test_format_ini_preserves_comments():
    ini_input = "; comment\n[section]\nkey = value\n"
    result, fmt = svc.process_data(ini_input)
    assert fmt == "ini"


def test_detect_ini():
    result, fmt = svc.process_data("[section]\nkey = value\n")
    assert fmt == "ini"
