from .models import ValidationResult


def validate(content: str, language: str) -> ValidationResult:
    if language == "Python":
        return _validate_python(content)

    return ValidationResult(valid=True, error=None)


def _validate_python(content: str) -> ValidationResult:
    try:
        compile(content, "<beautified>", "exec")
        return ValidationResult(valid=True)
    except SyntaxError as e:
        return ValidationResult(valid=False, error=f"Syntax error: {e}")
