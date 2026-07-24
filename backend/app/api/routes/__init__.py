from app.api.routes.beautify import router as beautify
from app.api.routes.code_beautifier import router as code_beautifier
from app.api.routes.formatter import router as formatter
from app.api.routes.reader import router as reader
from app.api.routes.tabulate import router as tabulate

__all__ = ["beautify", "code_beautifier", "formatter", "reader", "tabulate"]
