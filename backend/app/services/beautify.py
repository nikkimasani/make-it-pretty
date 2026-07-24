import re
import unicodedata

from app.utils.detection import detect_writing_direction

EMOJI_MAP: dict[str, str] = {
    "travel": "✈️",
    "vacation": "🏖️",
    "hotel": "🏨",
    "flight": "🛩️",
    "beach": "🏖️",
    "mountain": "⛰️",
    "map": "🗺️",
    "camera": "📷",
    "photo": "📸",
    "book": "📚",
    "read": "📖",
    "reading": "📖",
    "library": "📚",
    "write": "✍️",
    "writing": "✍️",
    "author": "✍️",
    "story": "📖",
    "poem": "📝",
    "code": "💻",
    "coding": "💻",
    "programming": "💻",
    "program": "💻",
    "software": "💻",
    "developer": "💻",
    "computer": "🖥️",
    "keyboard": "⌨️",
    "bug": "🐛",
    "debug": "🔍",
    "server": "🖥️",
    "database": "🗄️",
    "network": "🌐",
    "data": "📊",
    "algorithm": "🧮",
    "music": "🎵",
    "song": "🎵",
    "sing": "🎤",
    "singer": "🎤",
    "concert": "🎶",
    "guitar": "🎸",
    "piano": "🎹",
    "drum": "🥁",
    "food": "🍽️",
    "eat": "🍴",
    "eating": "🍴",
    "cook": "👨‍🍳",
    "cooking": "👨‍🍳",
    "chef": "👨‍🍳",
    "restaurant": "🍽️",
    "dinner": "🍝",
    "lunch": "🥪",
    "breakfast": "🥞",
    "coffee": "☕",
    "tea": "🍵",
    "water": "💧",
    "drink": "🥤",
    "wine": "🍷",
    "beer": "🍺",
    "cake": "🎂",
    "pizza": "🍕",
    "fruit": "🍎",
    "apple": "🍎",
    "nature": "🌿",
    "tree": "🌳",
    "flower": "🌸",
    "garden": "🌻",
    "forest": "🌲",
    "sun": "☀️",
    "sunny": "☀️",
    "rain": "🌧️",
    "snow": "❄️",
    "cloud": "☁️",
    "wind": "💨",
    "storm": "⛈️",
    "moon": "🌙",
    "star": "⭐",
    "sky": "🌌",
    "ocean": "🌊",
    "sea": "🌊",
    "river": "🏞️",
    "lake": "🏞️",
    "fish": "🐟",
    "bird": "🐦",
    "dog": "🐕",
    "cat": "🐈",
    "horse": "🐴",
    "heart": "❤️",
    "love": "❤️",
    "romance": "💕",
    "friend": "🤝",
    "friendship": "🤝",
    "family": "👨‍👩‍👧‍👦",
    "baby": "👶",
    "fire": "🔥",
    "light": "💡",
    "idea": "💡",
    "bulb": "💡",
    "phone": "📱",
    "call": "📞",
    "email": "📧",
    "mail": "📧",
    "message": "💬",
    "chat": "💬",
    "talk": "🗣️",
    "speech": "🗣️",
    "presentation": "📊",
    "meeting": "🤝",
    "calendar": "📅",
    "clock": "🕐",
    "time": "⏰",
    "alarm": "⏰",
    "watch": "⌚",
    "gift": "🎁",
    "present": "🎁",
    "party": "🎉",
    "celebration": "🎉",
    "birthday": "🎂",
    "wedding": "💒",
    "graduation": "🎓",
    "school": "🏫",
    "university": "🏛️",
    "college": "🏛️",
    "student": "🎓",
    "teacher": "👨‍🏫",
    "class": "📚",
    "lesson": "📖",
    "home": "🏠",
    "house": "🏠",
    "building": "🏢",
    "city": "🏙️",
    "town": "🏘️",
    "car": "🚗",
    "drive": "🚗",
    "driving": "🚗",
    "bike": "🚲",
    "bicycle": "🚲",
    "bus": "🚌",
    "train": "🚆",
    "plane": "✈️",
    "boat": "⛵",
    "ship": "🚢",
    "sport": "⚽",
    "football": "⚽",
    "soccer": "⚽",
    "basketball": "🏀",
    "tennis": "🎾",
    "swim": "🏊",
    "swimming": "🏊",
    "run": "🏃",
    "running": "🏃",
    "walk": "🚶",
    "walking": "🚶",
    "exercise": "🏋️",
    "gym": "🏋️",
    "yoga": "🧘",
    "health": "💚",
    "medical": "🏥",
    "hospital": "🏥",
    "doctor": "👨‍⚕️",
    "science": "🔬",
    "research": "🔬",
    "lab": "🧪",
    "experiment": "🧪",
    "money": "💰",
    "bank": "🏦",
    "shopping": "🛍️",
    "store": "🏪",
    "market": "🏪",
    "art": "🎨",
    "artist": "🎨",
    "paint": "🎨",
    "draw": "✏️",
    "dance": "💃",
    "dancing": "💃",
    "movie": "🎬",
    "film": "🎬",
    "theater": "🎭",
    "game": "🎮",
    "gaming": "🎮",
    "play": "🎮",
    "award": "🏆",
    "trophy": "🏆",
    "medal": "🥇",
    "victory": "🏆",
    "success": "✅",
    "fail": "❌",
    "failure": "❌",
    "error": "❌",
    "warning": "⚠️",
    "danger": "☢️",
    "safe": "🛡️",
    "security": "🔒",
    "lock": "🔒",
    "key": "🔑",
    "password": "🔑",
    "search": "🔍",
    "find": "🔎",
    "target": "🎯",
    "goal": "🎯",
    "start": "🚀",
    "launch": "🚀",
    "rocket": "🚀",
    "space": "🚀",
    "planet": "🪐",
    "world": "🌍",
    "globe": "🌍",
    "flag": "🚩",
    "check": "✅",
}

# Common English misspellings for fast lookup
COMMON_MISSPELLINGS: dict[str, str] = {
    "accomodate": "accommodate",
    "acheive": "achieve",
    "adress": "address",
    "alot": "a lot",
    "alright": "all right",
    "arguement": "argument",
    "athiest": "atheist",
    "begginer": "beginner",
    "beleive": "believe",
    "calender": "calendar",
    "camouflage": "camouflage",
    "catagory": "category",
    "cemetary": "cemetery",
    "changable": "changeable",
    "choosen": "chosen",
    "commitee": "committee",
    "commited": "committed",
    "comit": "commit",
    "concious": "conscious",
    "curiosity": "curiosity",
    "definately": "definitely",
    "definitly": "definitely",
    "dependant": "dependent",
    "desparate": "desperate",
    "despicable": "despicable",
    "develope": "develop",
    "dilema": "dilemma",
    "disappear": "disappear",
    "disapoint": "disappoint",
    "eigth": "eighth",
    "embarass": "embarrass",
    "enviroment": "environment",
    "equiped": "equipped",
    "exagerate": "exaggerate",
    "exellent": "excellent",
    "experiance": "experience",
    "extrordinarily": "extraordinarily",
    "facinating": "fascinating",
    "febuary": "february",
    "finaly": "finally",
    "foriegn": "foreign",
    "forseeable": "foreseeable",
    "fourty": "forty",
    "freind": "friend",
    "fulfill": "fulfil",
    "goverment": "government",
    "grammer": "grammar",
    "gratuitous": "gratuitous",
    "grief": "grief",
    "grievous": "grievous",
    "guard": "guard",
    "hankerchief": "handkerchief",
    "harrass": "harass",
    "hieght": "height",
    "hinderance": "hindrance",
    "humour": "humor",
    "idiosyncracy": "idiosyncrasy",
    "immediatly": "immediately",
    "independant": "independent",
    "inoculate": "inoculate",
    "inteligence": "intelligence",
    "jewellery": "jewelry",
    "judgement": "judgment",
    "knowlege": "knowledge",
    "legitimite": "legitimate",
    "liason": "liaison",
    "libary": "library",
    "lisence": "license",
    "maintainance": "maintenance",
    "millenium": "millennium",
    "mischevious": "mischievous",
    "mispell": "misspell",
    "morgage": "mortgage",
    "neccessary": "necessary",
    "occassion": "occasion",
    "ocurrence": "occurrence",
    "oppurtunity": "opportunity",
    "outragous": "outrageous",
    "paralel": "parallel",
    "parliament": "parliament",
    "perserverance": "perseverance",
    "pharoah": "pharaoh",
    "phenomenon": "phenomenon",
    "potatoe": "potato",
    "priviledge": "privilege",
    "professor": "professor",
    "pronounciation": "pronunciation",
    "publicly": "publicly",
    "pumpkin": "pumpkin",
    "purposefully": "purposefully",
    "recieve": "receive",
    "refering": "referring",
    "reguardless": "regardless",
    "remeber": "remember",
    "restaraunt": "restaurant",
    "rythm": "rhythm",
    "seperate": "separate",
    "sieze": "seize",
    "sincerly": "sincerely",
    "sollution": "solution",
    "sophmore": "sophomore",
    "speach": "speech",
    "successfull": "successful",
    "supercede": "supersede",
    "supposably": "supposedly",
    "surelly": "surely",
    "surprise": "surprise",
    "tatoo": "tattoo",
    "teacher": "teacher",
    "temperary": "temporary",
    "tomorrow": "tomorrow",
    "tommorow": "tomorrow",
    "truely": "truly",
    "unforeseen": "unforeseen",
    "unfortunatly": "unfortunately",
    "until": "until",
    "usally": "usually",
    "vacumn": "vacuum",
    "vegetable": "vegetable",
    "vegitables": "vegetables",
    "villian": "villain",
    "wednesday": "wednesday",
    "wierd": "weird",
    "written": "written",
    "yatch": "yacht",
    "yourselfs": "yourselves",
}


def process_text(
    content: str,
    grammar_check: bool = False,
    emoji_enrichment: bool = False,
) -> tuple[str, str, list[dict[str, int | str]]]:
    text = content

    text = _remove_bom(text)
    text = _unicode_normalize(text)
    text = _normalize_line_endings(text)
    text = _remove_control_chars(text)
    text = _normalize_trailing_whitespace(text)
    text = _remove_excessive_blank_lines(text)
    text = _collapse_multiple_spaces(text)

    suggestions: list[dict[str, int | str]] = []

    if grammar_check:
        suggestions = _check_grammar(text)

    if emoji_enrichment:
        text = _enrich_emoji(text)

    direction = detect_writing_direction(text)

    return text, direction, suggestions


def _remove_bom(text: str) -> str:
    return text.lstrip("\ufeff")


def _unicode_normalize(text: str) -> str:
    return unicodedata.normalize("NFC", text)


def _normalize_line_endings(text: str) -> str:
    return text.replace("\r\n", "\n").replace("\r", "\n")


def _remove_control_chars(text: str) -> str:
    return "".join(c for c in text if c in ("\n", "\t") or ord(c) >= 32)


def _remove_excessive_blank_lines(text: str) -> str:
    return re.sub(r"\n{3,}", "\n\n", text)


def _normalize_trailing_whitespace(text: str) -> str:
    return "\n".join(line.rstrip() for line in text.split("\n"))


def _collapse_multiple_spaces(text: str) -> str:
    lines = text.split("\n")
    result: list[str] = []
    for line in lines:
        stripped = line.lstrip()
        indent = line[: len(line) - len(stripped)]
        collapsed = re.sub(r" {2,}", " ", stripped)
        result.append(indent + collapsed)
    return "\n".join(result)


def _normalize_quotes(text: str) -> str:
    text = text.replace("\u201c", '"').replace("\u201d", '"')
    text = text.replace("\u2018", "'").replace("\u2019", "'")
    return text


def _check_grammar(text: str) -> list[dict[str, int | str]]:
    from spellchecker import SpellChecker

    spell = SpellChecker()
    suggestions: list[dict[str, int | str]] = []

    # 1. Double word detection
    for m in re.finditer(r"\b(\w+)\s+\1\b", text, re.IGNORECASE):
        word = m.group(1)
        suggestions.append(
            {
                "start": m.start(),
                "end": m.end(),
                "original": m.group(),
                "suggestion": word,
                "message": f'Repeated word "{word}"',
            }
        )

    # 2. Punctuation fixes
    for m in re.finditer(r"\s+\.", text):
        suggestions.append(
            {
                "start": m.start(),
                "end": m.end(),
                "original": m.group(),
                "suggestion": ".",
                "message": "Space before period",
            }
        )

    for m in re.finditer(r"\s+,", text):
        suggestions.append(
            {
                "start": m.start(),
                "end": m.end(),
                "original": m.group(),
                "suggestion": ", ",
                "message": "Space before comma",
            }
        )

    for m in re.finditer(r"\.{2,}(?!\.)", text):
        if m.end() - m.start() > 3:
            suggestions.append(
                {
                    "start": m.start(),
                    "end": m.end(),
                    "original": m.group(),
                    "suggestion": "...",
                    "message": "Ellipsis should be exactly three dots",
                }
            )

    # 3. Common misspellings
    for m in re.finditer(r"\b\w+\b", text):
        word = m.group()
        lower = word.lower()
        if lower in COMMON_MISSPELLINGS:
            fixed = COMMON_MISSPELLINGS[lower]
            if word[0].isupper():
                fixed = fixed[0].upper() + fixed[1:]
            suggestions.append(
                {
                    "start": m.start(),
                    "end": m.end(),
                    "original": word,
                    "suggestion": fixed,
                    "message": f'Possible misspelling of "{fixed}"',
                }
            )

    # 4. Spell checker for unknown words
    words_found = set()
    for m in re.finditer(r"\b[a-zA-Z]+\b", text):
        word = m.group()
        if len(word) <= 2:
            continue
        if word in words_found:
            continue
        if word.lower() in COMMON_MISSPELLINGS:
            continue
        if word[0].isupper():
            continue
        misspelled = spell.unknown([word])
        if misspelled:
            candidates = spell.candidates(word)
            if candidates:
                best = next(iter(candidates))
                words_found.add(word)
                suggestions.append(
                    {
                        "start": m.start(),
                        "end": m.end(),
                        "original": word,
                        "suggestion": best,
                        "message": f'Possible misspelling: "{word}" → "{best}"',
                    }
                )

    suggestions.sort(key=lambda s: s["start"])
    return suggestions


def _enrich_emoji(text: str) -> str:
    matched = set()
    replacements: list[tuple[int, str]] = []
    for m in re.finditer(r"\b(\w+)\b", text):
        word = m.group(1)
        key = _stem(word.lower())
        if key in EMOJI_MAP and key not in matched:
            matched.add(key)
            replacements.append((m.end(), " " + EMOJI_MAP[key]))
    replacements.sort(key=lambda x: x[0], reverse=True)
    result = list(text)
    for pos, emoji in replacements:
        result.insert(pos, emoji)
    return "".join(result)


def _stem(word: str) -> str:
    if word.endswith("ing") and len(word) > 4:
        base = word[:-3]
        if base in EMOJI_MAP:
            return base
        base_ed = base + "e"
        if base_ed in EMOJI_MAP:
            return base_ed
    if word.endswith("ed") and len(word) > 3:
        base = word[:-2]
        if base in EMOJI_MAP:
            return base
        if base + "e" in EMOJI_MAP:
            return base + "e"
    if word.endswith("s") and len(word) > 3 and not word.endswith("ss"):
        base = word[:-1]
        if base in EMOJI_MAP:
            return base
    if word.endswith("tion"):
        base = word[:-4]
        if base in EMOJI_MAP:
            return base
        if base + "e" in EMOJI_MAP:
            return base + "e"
    if word.endswith("ment"):
        base = word[:-4]
        if base in EMOJI_MAP:
            return base
    if word.endswith("ly") and len(word) > 3:
        base = word[:-2]
        if base in EMOJI_MAP:
            return base
    return word
