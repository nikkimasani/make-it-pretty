import time

from .detector import detect_language
from .models import BeautifierResult, FormatResult
from .recovery import recover
from .registry import FormatterRegistry
from .validator import ValidationResult, validate

_registry = FormatterRegistry()
_formatter_cache: dict[str, tuple[bool, float]] = {}
CACHE_TTL = 30.0  # seconds before re-checking formatter availability


def beautify_code(content: str, filename: str = "") -> BeautifierResult:
    start = time.perf_counter()
    warnings: list[str] = []

    language = detect_language(content, filename)

    recovery_report = recover(content)
    recovered = recovery_report.recovered

    formatters = _registry.get_formatters(language)

    result: FormatResult | None = None
    formatter_name = "fallback (safe cleanup)"
    any_formatter_tried = False

    for fmt in formatters:
        if not _is_formatter_available(fmt):
            warnings.append(f"{fmt.name} is not available")
            continue

        any_formatter_tried = True
        fmt_result = fmt.format(recovered)
        formatter_name = fmt.name

        if fmt_result.success:
            if fmt_result.content == recovered:
                fmt_result.recovery_attempted = False
            result = fmt_result
            break
        else:
            if fmt_result.error:
                warnings.append(f"{fmt.name}: {fmt_result.error}")
            result = fmt_result

    if not any_formatter_tried:
        from .formatters.fallback import FallbackFormatter

        fb = FallbackFormatter()
        fb_result = fb.format(recovered)
        result = FormatResult(success=True, content=fb_result.content)
        formatter_name = "fallback (safe cleanup)"

    final = result if result else FormatResult(success=True, content=recovered)

    validation = (
        validate(final.content, language) if final.success else ValidationResult(valid=True)
    )

    if not validation.valid and final.success:
        warnings.append(f"Validation: {validation.error}")

    elapsed = time.perf_counter() - start
    elapsed_ms = round(elapsed * 1000, 2)

    return BeautifierResult(
        success=final.success and validation.valid,
        original=content,
        result=final.content,
        language=language,
        formatter=formatter_name,
        processing_time=elapsed_ms,
        warnings=warnings,
        recovery_attempted=(len(recovery_report.transformations) > 0 or final.recovery_attempted),
        recovery_error=final.error if not final.success else None,
        validation_passed=validation.valid,
        validation_error=validation.error,
        transformations=recovery_report.transformations,
    )


def _is_formatter_available(fmt: object) -> bool:
    from .formatters.base import Formatter

    if not isinstance(fmt, Formatter):
        return False
    key = fmt.name
    now = time.monotonic()
    if key in _formatter_cache:
        cached, expires = _formatter_cache[key]
        if now < expires:
            return cached
    available = fmt.is_available()
    _formatter_cache[key] = (available, now + CACHE_TTL)
    return available


def clear_formatter_cache() -> None:
    _formatter_cache.clear()


def get_line_stats(content: str) -> tuple[int, int]:
    lines = content.split("\n")
    non_empty = sum(1 for line in lines if line.strip())
    total = len(lines)
    return total, non_empty
