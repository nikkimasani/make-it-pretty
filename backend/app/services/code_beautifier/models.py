from dataclasses import dataclass, field


@dataclass
class FormatResult:
    success: bool
    content: str
    error: str | None = None
    recovery_attempted: bool = False


@dataclass
class RecoveryReport:
    original: str
    recovered: str
    transformations: list[str] = field(default_factory=list)


@dataclass
class ValidationResult:
    valid: bool
    error: str | None = None


@dataclass
class BeautifierResult:
    success: bool
    original: str
    result: str
    language: str
    formatter: str
    processing_time: float
    warnings: list[str] = field(default_factory=list)
    recovery_attempted: bool = False
    recovery_error: str | None = None
    validation_passed: bool = True
    validation_error: str | None = None
    transformations: list[str] = field(default_factory=list)
