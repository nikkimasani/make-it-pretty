import io
from collections.abc import AsyncGenerator

CHUNK_SIZE = 10 * 1024 * 1024  # 10 MB threshold
BUFFER_SIZE = 1024 * 64  # 64 KB read chunks


def is_large_file(content: bytes) -> bool:
    return len(content) > CHUNK_SIZE


async def stream_large_content(
    content: bytes,
    chunk_size: int = BUFFER_SIZE,
) -> AsyncGenerator[bytes, None]:
    buf = io.BytesIO(content)
    while True:
        chunk = buf.read(chunk_size)
        if not chunk:
            break
        yield chunk


def estimate_compression_ratio(content: str) -> float:
    """Estimate how much compression would help (0.0 = no benefit, 1.0 = high benefit)."""
    if len(content) < 10000:
        return 0.0
    # Highly repetitive content compresses well
    lines = content.split("\n")
    if len(lines) < 2:
        return 0.0
    unique = len(set(lines))
    ratio = 1.0 - (unique / len(lines))
    return min(1.0, max(0.0, ratio))


def get_size_label(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes} B"
    if size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    return f"{size_bytes / (1024 * 1024):.1f} MB"
