def detect_encoding(content: bytes) -> str:
    try:
        content.decode("utf-8")
        return "utf-8"
    except UnicodeDecodeError:
        try:
            content.decode("latin-1")
            return "latin-1"
        except UnicodeDecodeError:
            return "utf-8"


def detect_writing_direction(text: str) -> str:
    rtl_chars = 0
    ltr_chars = 0

    for char in text[:1000]:
        if "\u0590" <= char <= "\u05ff" or "\u0600" <= char <= "\u06ff":
            rtl_chars += 1
        elif "a" <= char <= "z" or "A" <= char <= "Z" or "\u4e00" <= char <= "\u9fff":
            ltr_chars += 1

    if rtl_chars > ltr_chars:
        return "rtl"
    return "ltr"
