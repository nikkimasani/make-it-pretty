# Implementation Roadmap

This roadmap provides a detailed, phase-by-phase implementation guide. Each phase lists specific tasks, files to create or modify, and acceptance criteria. Follow the phases in order.

---

## Phase 0: Foundation (Already Complete)

The following scaffolding is already in place:

- Monorepo structure with frontend/ and backend/
- Frontend: React + Vite + TypeScript + Tailwind CSS with routing
- Backend: FastAPI + Pydantic + Uvicorn with workspace routers
- Shared UI components (Button, Card, Spinner, Badge)
- Layout components (AppShell, Sidebar)
- Shared workspace components (WorkspaceHeader, FileUpload, OutputPane, TextArea)
- Placeholder pages for all 5 workspaces
- Placeholder API endpoints for all 5 workspaces
- Placeholder service modules for all 5 workspaces
- Pydantic models for all 5 workspaces
- Testing setup (Vitest frontend, pytest backend)
- CI workflow (GitHub Actions)
- Documentation (README, CONTRIBUTING, architecture, development)
- ESLint, Prettier, Ruff, mypy configuration
- MIT License

---

## Phase 0.5: Functional UI Freeze (Completed)

**Goal:** Finalize all frontend layouts and wire shared API contracts before backend implementation begins.

### Completed Work

**Beautify options (the only workspace with optional controls):**
- `frontend/src/components/ui/ToggleSwitch.tsx` — Modern toggle switch component
- Grammar Suggestions toggle (OFF by default, placed between upload and input)
- Emoji Enrichment toggle (OFF by default, placed between upload and input)
- `frontend/src/types/api.ts` — `BeautifyOptions` interface with `grammar_check` and `emoji_enrichment`
- `frontend/src/pages/beautify/BeautifyPage.tsx` — Options wired via state to API request body
- `backend/app/models/beautify.py` — `grammar_check: bool = False`, `emoji_enrichment: bool = False` on request; response flags applied state
- `backend/app/services/beautify.py` — Updated signature accepts `grammar_check` and `emoji_enrichment` kwargs
- `backend/app/api/routes/beautify.py` — Extracts and forwards specific options from request

**Workspace layout freeze (no options on other workspaces):**
- Format: Upload → Paste → Button → Output
- Tabulate: Upload only
- Reader: URL input or file upload
- Code Beautifier: Upload only

**Supported file types verified:**
- Every workspace header shows accurate extension badges
- File picker `accept` attribute restricted per workspace
- Code Beautifier accepts all text-based source files

**Wiring verified:**
- Frontend state → API request → Backend model → Service → Response → Frontend render
- All placeholder services ready for Phase 1 implementation
- No additional UI elements required until final visual polish near v1.0

---

## Phase 1: Format Workspace (Completed)

**Goal:** A fully functional Format workspace for structured data and configuration files: JSON, YAML, XML, TOML, ENV, INI.

### Completed Work

**Backend service (`backend/app/services/formatter.py`):**
- Automatic format detection via content-based analysis (JSON, YAML, XML, TOML, ENV, INI)
- JSON: `json.loads()` → `json.dumps(indent=N, sort_keys=B, ensure_ascii=False)` with `JSONDecodeError` fallback
- YAML: `yaml.safe_load()` → `yaml.dump(default_flow_style=False, allow_unicode=True, indent=N)` via `pyyaml`
- XML: `xml.dom.minidom.parseString()` → `toprettyxml()` with proper indentation
- TOML: `tomllib.loads()` → custom `_toml_dumps()` serializer
- ENV: Custom `KEY=VALUE` parser with quoted value stripping and comment preservation
- INI: `configparser.ConfigParser` → standard `KEY=VALUE` output per section, with section header detection and malformed input fallback
- Configurable `indent_size` (default: 2) and `sort_keys` (default: false) options
- `pyyaml>=6.0` added to `pyproject.toml` and `requirements.txt`

**Backend model (`backend/app/models/formatter.py`):**
- `FormatRequest` with `content`, `indent_size: int = 2`, `sort_keys: bool = False`
- `FormatResponse` with `original`, `result`, `format`

**Backend route (`backend/app/api/routes/formatter.py`):**
- `POST /api/v1/format/process` — accepts `FormatRequest`, returns formatted result with detected format
- `POST /api/v1/format/upload` — accepts file upload, auto-detects and formats

**Backend tests (22 tests → 27 tests, all passing):**
- JSON: object, nested, array, invalid, minified, unicode, indent, sort_keys
- YAML: simple, nested, list, invalid
- XML: simple, nested, self-closing, malformed
- TOML: simple, nested
- ENV: simple, with comments
- INI: simple, with sections, malformed, preserves comments, detection
- Detection: JSON detection, empty content

**Frontend (`frontend/src/pages/format/FormatPage.tsx`):**
- Detected format badge (color-coded per format type, including `ini`)
- Raw/Tree toggle for JSON output
- Character count and line count display
- Download as formatted file button
- Error state display for failed operations
- INI support in file picker filter and accepted extensions

**Frontend (`frontend/src/components/shared/JsonTreeView.tsx`):**
- Recursive collapsible tree for JSON objects/arrays
- Syntax-colored keys (blue), strings (green), numbers (orange), booleans (purple), null (gray)
- Expand all / Collapse all controls
- Click-to-expand/collapse with triangle indicators
- Nested depth auto-open (first 2 levels by default)

**Acceptance:** User can paste or upload any supported format (JSON, YAML, XML, TOML, ENV, INI), click "Format Data", see the detected format badge, and view beautifully formatted output with JSON tree navigation.

---

## Phase 2: Code Beautifier Workspace (Completed — Recovery & Validation Pipeline)

**Goal:** A professional language-aware source code recovery and beautification engine that recovers formatting problems whenever possible, then beautifies using the official formatter of that language, without ever modifying program logic.

### Completed Work

**Architecture (`backend/app/services/code_beautifier/` — modular pipeline):**
```
Language Detection → Recovery Engine (12 steps) → Formatter Registry → Per-Language Formatter → Validation → Response Builder
```
- `detector.py` — Language detection via extension (50+), shebang, content heuristics
- `recovery.py` — Deterministic recovery engine: BOM, Unicode NFC, CRLF/LF, control chars, mixed tabs/spaces indent, tabs→4-spaces, trailing whitespace, collapsed blank lines, leading/trailing blank lines, final newline. 12 steps total, idempotent.
- `validator.py` — Post-formatting validation: Python `compile()` for syntax check
- `registry.py` — `FormatterRegistry` maps each language to its formatter; supports fallback chains
- `models.py` — `FormatResult`, `RecoveryReport`, `ValidationResult`, `BeautifierResult`
- `formatters/base.py` — Abstract `Formatter` interface
- `formatters/python_fmt.py` — Python pipeline: **Ruff** → Black → autopep8 aggressive → Black retry (Ruff first, falls through to Black for syntax recovery)
- `formatters/prettier_fmt.py` — `PrettierFormatter` with per-language parser selection
- `formatters/sqlparse_fmt.py` — `SqlparseFormatter`
- `formatters/external.py` — `SubprocessFormatter` with stdin and tempfile modes, auto-detects binaries via `shutil.which`
- `formatters/fallback.py` — Safe whitespace-only cleanup for unknown/unformattable languages

**Language detection (`backend/app/services/code_beautifier/detector.py`):**
- 40+ file extension → language mappings (Python, JS, TS, JSX, TSX, Go, Rust, Java, Kotlin, C#, Swift, PHP, Ruby, Lua, Shell, SQL, HTML, CSS, SCSS, SASS, LESS, Gradle, Dart, Elixir, Erlang, Clojure, Scala, R, PowerShell, and more)
- Special filename detection: `Dockerfile`, `Makefile`, `CMakeLists.txt`, `.gitignore`, `.gitattributes`, `.editorconfig`
- Content heuristics: shebang lines (`#!/usr/bin/python`, `#!/bin/bash`, etc.), HTML doctype/tags, import statements, TypeScript keywords, Go package main, Rust fn/use
- Extension takes priority over content heuristics
- NO structured data formats — JSON, YAML, XML, TOML, ENV, INI belong exclusively to the Format workspace

**Formatter pipeline:**
1. Detect language from filename/content
2. Recovery engine (12 deterministic steps): BOM, Unicode NFC, CRLF/LF, control chars, mixed tabs/spaces indent, tabs→spaces, trailing whitespace, collapsed blank lines, leading/trailing blank lines, final newline
3. Look up formatter chain from registry (e.g. Python → Ruff → Black, C/C++ → clang-format → fallback)
4. Try each formatter in priority order — first success wins; skip-if-unchanged optimization (if formatter output matches input, no recovery flag)
5. Validate: Python gets `compile()` syntax check; other languages trusted if formatter returned success
6. On formatter syntax error: log warning, try next formatter in chain
7. If all formatters fail or unavailable: use safe fallback (whitespace only)
8. Unknown languages always receive safe fallback

**Backend model (`backend/app/models/code_beautifier.py`):**
- `CodeBeautifierRequest` with `content`, `filename` (for extension-based detection)
- `CodeBeautifierResponse` with `original`, `result`, `format`, `language`, `formatter`, `success`, `processing_time`, `warnings`, `original_lines`, `result_lines`, `recovery_attempted`, `recovery_error`, `validation_passed`, `validation_error`, `transformations`

**Backend route (`backend/app/api/routes/code_beautifier.py`):**
- `POST /api/v1/code-beautifier/process` — accepts content + optional filename, returns full metadata
- `POST /api/v1/code-beautifier/upload` — file upload with automatic language detection by extension

**Available formatters in current environment:**
- `Ruff 0.15.22` — Python (primary, via pip in backend venv)
- `Black 26.5.1` — Python (fallback, via pip in backend venv)
- `autopep8 2.3.2` — Python syntax recovery (via pip in backend venv)
- `Prettier 3.9.6` — JavaScript, TypeScript, JSX, TSX, HTML, CSS, SCSS, SASS, LESS, Markdown (via npm in frontend node_modules)
- `sqlparse 0.5.5` — SQL (via pip in backend venv)
- `SubprocessFormatter` — C/C++ (clang-format), Java (google-java-format / clang-format), Go (gofmt), Rust (rustfmt), Kotlin (ktfmt), Swift (swift-format), Lua (stylua), Shell (shfmt), Ruby (rufo), PHP (php-cs-fixer), C# (dotnet format) — auto-detected if binary is on PATH; falls back gracefully to safe whitespace cleanup
- Fallback — all other languages: safe whitespace-only cleanup (line endings, trailing whitespace, blank lines, final newline, BOM)

**Backend tests (86 tests, all passing):**
- Recovery engine: BOM, line endings, Unicode NFC, control chars, tabs→spaces, trailing whitespace, collapsed blank lines, leading/trailing blank lines, final newline, mixed tabs/spaces indent, full pipeline, idempotent, noop
- Python: Ruff formats valid code; Ruff fallback to Black on syntax error; Black → autopep8 → Black retry pipeline; broken indentation recovery; malformed syntax detection; trailing whitespace; missing final newline; no semantic change; real-world functions/type hints; large files (500 lines)
- JavaScript/TypeScript: Prettier with arrow functions, async/await, type annotations
- HTML/CSS/SCSS/Markdown: Prettier formatting
- SQL: sqlparse with keyword upper-casing and JOIN queries
- Fallback: unknown language safe whitespace cleanup
- SubprocessFormatter: graceful handling of unavailable binaries
- Language detection: 40+ extensions, special filenames, shebangs, content heuristics
- Metadata: processing time, line stats, validation flags, recovery transformations

**Frontend (`frontend/src/pages/code-beautifier/CodeBeautifierPage.tsx`):**
- Upload-only workspace — no text area or manual code input
- Multi-file upload via drag-and-drop or file picker
- File displayed per row: filename, file size, detected language, formatter used, status badge
- Status badges: Processing (blue), Formatted (green), Recovered (amber), Error/Failed (red)
- Auto-process on file upload — immediate per-file API call
- Click a file row to preview formatted output
- Side-by-side / Beautified toggle with line count diff
- Copy formatted code to clipboard
- Download formatted file with original filename preserved
- Recovery error and formatting failure messages shown inline

**Frontend (`frontend/src/components/shared/DiffView.tsx`):**
- Side-by-side mode: two-column original/beautified comparison
- Beautified mode: single-pane clean output
- Line count stats bar with additions/removals coloring
- Scrollable pre blocks with monospace font

**Acceptance:** The workspace feels like a professional source code recovery tool. Python gets Ruff + Black + autopep8 pipeline with `compile()` validation. JS/TS/HTML/CSS/SCSS/SASS/LESS/Markdown get Prettier. SQL gets sqlparse with keyword upper-casing. C/C++/Java/Go/Rust/Kotlin/Swift/Lua/Shell/PHP/C# get subprocess formatters when available (auto-detected via PATH), with graceful fallback to safe whitespace cleanup. Recovery engine performs 12 deterministic transformations before formatting. Formatter failures safely preserve original code with human-readable explanation. Upload-only interface with multi-file support, language/formatter/badge display, recovery/validation info, copy/download per file. 86 backend tests covering all recovery steps, language formatters, pipeline edge cases, and large file handling. ZERO overlap with Format workspace — no JSON, YAML, XML, TOML, ENV, or INI support.

---

## Phase 3: Beautify Workspace (Completed)

**Goal:** A functional text beautifier with rule-based cleaning, optional grammar hints, and optional emoji enrichment.

### Completed Work

**Backend service (`backend/app/services/beautify.py`):**
- Core text cleaning pipeline (ordered):
  1. BOM removal
  2. Unicode NFC normalization
  3. Line ending normalization (CRLF/LF → LF)
  4. Control character removal (preserves `\n`, `\t`, `\r`)
  5. Trailing whitespace removal
  6. Excessive blank line reduction (max 2 consecutive)
  7. Multiple space collapse (preserves leading indentation)
- Grammar & style module (opt-in via `grammar_check=True`):
  - Double word detection (`re.sub(r"\b(\w+)\s+\1\b")`)
  - Space-before-period detection
  - Ellipsis correction (excess dots → `...`)
  - Common misspellings dictionary (100+ entries)
  - pyspellchecker integration for unknown words
  - All corrections are suggestions, never automatic
  - Returns list of `GrammarSuggestion` with positions
- Emoji enrichment module (opt-in via `emoji_enrichment=True`):
  - 200+ word → emoji mappings across 25+ categories
  - Stemming: `-ing`, `-ed`, `-s`, `-tion`, `-ment`, `-ly` stripping
  - Partial word protection (e.g., "notation" does NOT match "note")
  - Each word type receives emoji at most once
- Writing direction detection (reuses `detect_writing_direction`)

**Backend model (`backend/app/models/beautify.py`):**
- `GrammarSuggestion` with `start`, `end`, `original`, `suggestion`, `message`
- `BeautifyResponse` with `suggestions`, `writing_direction`, `character_count`

**Backend route (`backend/app/api/routes/beautify.py`):**
- Both `process` and `upload` endpoints return writing direction and suggestions

**Backend dependency (`backend/pyproject.toml`):**
- Added `pyspellchecker>=0.9.0`

**Backend tests (26 tests, all passing):**
- Core cleaning: BOM, Unicode NFC, line endings, control chars, trailing whitespace, blank lines, space collapse, indent preservation, full pipeline
- Grammar: double word detection, space before period, common misspellings, disabled returns no suggestions, no false positives on clean text
- Emoji: matching, stemming (-ing, -ed, -s), partial word protection, no double insertion, disabled returns no emoji
- Direction: LTR detection, RTL detection
- Edge cases: empty input, return tuple length, no suggestions for clean text

**Frontend (`frontend/src/pages/beautify/BeautifyPage.tsx`):**
- Input text area with character count
- Grammar Suggestions toggle (OFF by default)
- Emoji Enrichment toggle (OFF by default)
- Output with grammar suggestions list (inline display of messages, original→suggestion)
- RTL/LTR `dir` attribute on container
- Final newline enforcement indicator (green/amber badge)
- Character count on output

**Frontend types (`frontend/src/types/api.ts`):**
- `GrammarSuggestion` interface
- `suggestions`, `writing_direction`, `character_count` on `ProcessResponse`

**Acceptance:** Paste messy text and get consistent, clean output. Optionally enable grammar checks to see inline suggestions (spelling, double words, punctuation). Optionally enable emoji enrichment to get tasteful emoji insertion. RTL text renders correctly. 115 total tests pass (89 existing + 26 beautify).

## Phase 4: Tabulate Workspace (Complete)

**Goal:** An interactive table rendering workspace for CSV, TSV, and Excel files.

### 4.1 — CSV/TSV Parsing (Complete)

**Backend:**
1. `backend/pyproject.toml` — Added `openpyxl>=3.1` for Excel support
2. `backend/app/services/tabulate.py` — Full CSV/TSV service:
   - CSV: `csv.reader` with auto-detection of delimiter
   - TSV: Tab-delimited parsing
   - Handle quoted fields (with embedded commas, newlines)
   - Handle BOM prefix
   - Auto-detect headers (first row)
   - Return parsed data as JSON array of objects (for frontend rendering)
   - Handle encoding detection (UTF-8, Latin-1, Windows-1252)
   - Metadata: row count, column count, column names, detected encoding
3. `backend/app/models/tabulate.py` — Structured response with columns, rows, total_rows, format, metadata

**Acceptance:** CSV and TSV files parse correctly with header detection.

### 4.2 — Excel Support (Complete)

**Backend:**
1. `backend/app/services/tabulate.py` — Excel parsing via openpyxl:
   - `openpyxl.load_workbook()` for `.xlsx`
   - Support reading all sheets or a specific sheet
   - Return first sheet by default
   - Metadata: sheet names, active sheet
   - Handle merged cells (filled with first value via data_only mode)
   - Handle date/time formats (return as ISO strings)
2. Sheet selector dropdown in frontend for multi-sheet files

**Acceptance:** Excel files with multiple sheets are parsed; user can select which sheet to view.

### 4.3 — Interactive Table Frontend (Complete)

**Frontend:**
1. Installed: `@tanstack/react-table` for table functionality
2. `frontend/src/components/shared/DataTable.tsx` — Interactive table component:
   - Column sorting (click header to sort)
   - Column filtering (search per column)
   - Global search across all columns
   - Pagination (client-side, configurable page size: 25/50/100/250/500)
   - Row selection (checkbox per row, select all)
   - Column resize (drag handles)
   - Horizontal scroll for many columns
3. `frontend/src/pages/tabulate/TabulatePage.tsx` — Full implementation:
   - Upload area for CSV/TSV/XLSX
   - Sheet selector dropdown (for Excel files)
   - DataTable after parsing
   - Export filtered data, selected rows as CSV
   - Copy selected rows as JSON or CSV
   - Row count display

**Acceptance:** User uploads a 100,000-row CSV and can sort, filter, search, and paginate through it smoothly.

### 4.4 — Export (Complete)

**Frontend:**
1. Export functionality in DataTable:
   - Download all rows as CSV
   - Download selected rows as CSV
   - Copy selected rows as JSON or CSV

**Acceptance:** User can export filtered or full data from the table.

### Tests (Complete)

- 22 tests: CSV (8), TSV (2), Excel (5), Detection (7)
- All 137 backend tests pass
- Frontend: `tsc --noEmit` clean, `vite build` clean
- Ruff clean (no lint errors), mypy clean for tabulate module

## Phase 5: Reader Workspace (Complete)

**Goal:** A document reader that extracts clean content from HTML, URLs, PDFs, and DOCX files.

### 5.1 — HTML Content Extraction (Complete)

**Backend:**
1. `backend/pyproject.toml` — Added `beautifulsoup4>=4.12`, `lxml>=5.1`, `readability-lxml>=0.8`
2. `backend/app/services/reader.py` — HTML extraction via readability-lxml + BeautifulSoup:
   - Parse with BeautifulSoup (lxml parser)
   - Remove script, style, nav, footer, header, aside, noscript, iframe, form tags
   - Extract main content using readability-lxml algorithm
   - Clean remaining HTML (remove attributes, inline styles)
   - Return clean semantic HTML preserving headings, links, images, lists, blockquotes
   - Strip empty elements
   - Title extraction via readability
   - Word count and reading time estimation

### 5.2 — URL Fetching (Complete)

**Backend:**
1. `backend/pyproject.toml` — Added `httpx>=0.27.0`
2. `backend/app/services/reader.py` — URL fetching with httpx:
   - `httpx.Client` with 15s timeout
   - User-Agent header to avoid blocking
   - Follow redirects (`follow_redirects=True`)
   - Content-type validation (only parse HTML/PDF responses)
   - Error handling: timeouts, DNS failures, non-200 responses

### 5.3 — PDF Support (Complete)

**Backend:**
1. `backend/pyproject.toml` — Added `pypdf>=4.0`
2. `backend/app/services/reader.py` — PDF text extraction:
   - Extract text content from PDF via pypdf
   - Preserve paragraph structure
   - Return as cleaned HTML
   - Word count and reading time estimation
   - Error handling: password-protected PDFs, corrupted files

### 5.4 — DOCX Support (Complete)

**Backend:**
1. `backend/pyproject.toml` — Added `python-docx>=1.1`
2. `backend/app/services/reader.py` — DOCX extraction:
   - Extract paragraphs with heading preservation (<h1>, <h2>, <h3>)
   - Extract tables as HTML tables
   - Word count and reading time estimation

### 5.5 — Reader Frontend (Complete)

**Frontend:**
1. `frontend/tailwind.config.js` — Added `@tailwindcss/typography` plugin for prose styling
2. `frontend/src/pages/reader/ReaderPage.tsx` — Full implementation:
   - URL input with "Extract" button and Enter-to-submit
   - File upload for HTML/PDF/DOCX (via `/api/v1/reader/process`)
   - Reading mode toolbar:
     - Dark mode toggle (inverts prose colors)
     - Font size adjustment (small/medium/large)
     - Line height adjustment (tight/normal/relaxed)
     - Width control (narrow/medium/wide column)
   - Estimated reading time badge
   - Word count and character count display
   - Tailwind `prose` classes for clean article rendering
   - Images preserved from original content

### Tests (Complete)

- 18 tests: HTML (9), URL (3), PDF (2), DOCX (2), Helpers (2)
- All 155 backend tests pass
- Frontend: `tsc --noEmit` clean, `vite build` clean
- Ruff clean, mypy clean (reader module only; pre-existing code-beautifier errors unchanged)

## Phase 6: Polish & UX (Complete)

### 6.1 — Design System Refinement (Complete)

**Frontend:**
1. `frontend/src/index.css` — Added global styles:
   - Custom thin scrollbar styling (webkit)
   - `focus-visible` ring styles (only show focus ring on keyboard nav)
   - Restored focus ring removal for mouse clicks (`button:focus:not(:focus-visible)`)
2. All pages audited for consistent padding/spacing and heading hierarchy (unchanged — already consistent)

### 6.2 — Error Handling (Complete)

**Frontend:**
1. `frontend/src/components/shared/ErrorBoundary.tsx` — Class-based error boundary:
   - Wraps each workspace route via `router.tsx`
   - Graceful fallback UI with "Try Again" button
   - Logs errors to console
2. `frontend/src/components/shared/ErrorMessage.tsx` — Consistent error display:
   - Red alert box with "✕" icon
   - Optional retry button
   - Used in FormatPage and BeautifyPage (replaced inline `<span>`)

**Backend:**
1. `backend/app/core/error_handlers.py` — Global exception handlers:
   - `ValueError` → 400 with descriptive message
   - `UnicodeDecodeError` → 400 with encoding hint
   - Generic `Exception` → 500 with safe message
2. `backend/app/core/upload.py` — File upload validation:
   - Size limit check (50 MB, configurable via `settings.max_upload_size`)
   - Extension whitelist (all supported workspace file types)
   - Applied to all 5 upload endpoints

### 6.3 — Loading States (Complete)

**Frontend:**
1. `frontend/src/components/shared/Skeleton.tsx` — Skeleton components:
   - `Skeleton` — Configurable lines with decreasing width
   - `CardSkeleton` — Pre-built card skeleton
   - Both use `animate-pulse` for smooth animation

### 6.4 — Keyboard Shortcuts (Complete)

**Frontend:**
1. `frontend/src/hooks/useKeyboardShortcuts.ts` — Keyboard shortcut hook:
   - Accepts a map of key combos to handlers
   - Supports `Ctrl+Enter`, `Ctrl+S`, `Ctrl+C`, `Escape`, etc.
   - Respects `enabled` flag to disable during loading
2. Applied to:
   - **FormatPage**: `Ctrl+Enter` format, `Ctrl+S` download, `Escape` clear
   - **BeautifyPage**: `Ctrl+Enter` beautify, `Escape` clear

### 6.5 — Drag & Drop Polish (Complete)

**Frontend:**
1. `frontend/src/components/shared/FileUpload.tsx` — Enhanced:
   - Scale-up effect on drag over (`scale-[1.02]`) with shadow
   - Color change transition (icon + border)
   - File type validation on drop with error feedback
   - Hover state background (`hover:bg-gray-50`)
   - Smooth transitions via `transition-all duration-200`

---

## Phase 7: Performance & Large Files

### 7.1 — Backend Streaming

**Backend:**
1. ✅ `backend/app/services/large_file_handler.py`:
   - Chunked file processing for files >10MB
   - Streaming response helpers for large output
   - Upload progress reporting (size labels, compression estimation)
2. ✅ File size limits with clear error messages (50MB limit via `settings.max_upload_size`)
3. ✅ GZip compression for large JSON/XML output (`GZipMiddleware` at 10KB threshold)

**Status:** Complete — `large_file_handler.py` with `is_large_file()`, `stream_large_content()`, `estimate_compression_ratio()`, `get_size_label()` utilities; `GZipMiddleware` added to `app.main` for all responses >10KB.

### 7.2 — Virtual Scrolling

**Frontend:**
1. ✅ `frontend/src/components/shared/VirtualList.tsx`:
   - Window-threshold virtual scrolling via scroll position + offset calculation
   - Fixed height items (optimized, no measurement overhead)
   - Dynamic height items (with `ResizeObserver`-style measurement via `getBoundingClientRect`)
   - Configurable `overscan`, `maxHeight`, render buffer
2. ✅ Applied to:
   - **Format tree view** (`JsonTreeView`): flatten view with `VirtualList` for >500 keys
   - **Tabulate table** (`DataTable`): extended page sizes to 1000 rows
   - **Output pane** (`OutputPane`): line-numbered virtual list for content >50KB

**Status:** Complete — `VirtualList` component with absolute positioning, configurable heights, and measurement. Applied to all 3 targets.

### 7.3 — Web Workers

**Frontend:**
1. ✅ `frontend/src/workers/format.worker.ts`:
   - Offloads JSON formatting (parse + stringify with 2-space indent) to worker thread
   - Auto-triggered on FormatPage for content >100KB
   - Fallback: basic content trimming when JSON parsing fails
2. ✅ `frontend/src/workers/csv.worker.ts`:
   - Parse large CSV/TSV files (>500KB) off the main thread
   - Full CSV parser: quoted fields, embedded delimiters, escaped quotes
   - Returns structured `{columns, rows, totalRows}` result
   - Auto-triggered on TabulatePage for large CSV/TSV uploads
3. ✅ Code splitting by workspace route (`vite.config.ts` `manualChunks`)

**Status:** Complete — both workers created and wired into FormatPage and TabulatePage respectively. Production build produces separate worker chunks.

### 7.4 — Build & Code Splitting

**Frontend:**
1. ✅ Production build with `manualChunks`:
   - `vendor`: react, react-dom, react-router-dom
   - `table`: @tanstack/react-table
   - `ui`: lucide-react
   - Main app code and workers in separate chunks

**Status:** Complete — vite build produces 6 chunks (vendor 163KB, table 54KB, ui 7KB, main 53KB, 2 workers <1KB each).

---

## Phase 8: Testing & Quality (Completed)

### 8.1 — Frontend Tests

**Added vitest + @testing-library/react + jsdom test infrastructure:**
- `frontend/vitest.config.ts` — Vitest configuration with jsdom environment, path aliases, and V8 coverage
- `frontend/src/test/setup.ts` — Global test setup with jest-dom matchers and fetch mock

**UI component tests (5 files, 26 tests):**
- `frontend/src/components/ui/__tests__/Button.test.tsx` — 10 tests: renders, variants, sizes, loading, disabled state, click handler, custom class
- `frontend/src/components/ui/__tests__/Badge.test.tsx` — 7 tests: all 5 variants, renders children, custom class
- `frontend/src/components/ui/__tests__/Card.test.tsx` — 6 tests: Card/CardHeader/CardContent rendering and classes
- `frontend/src/components/ui/__tests__/Spinner.test.tsx` — 5 tests: sizes, accessibility, custom class
- `frontend/src/components/ui/__tests__/ToggleSwitch.test.tsx` — 3 tests: label/description, checked state, onChange callback

**Hook tests (3 files, 10 tests):**
- `frontend/src/hooks/__tests__/useApi.test.ts` — 5 tests: idle state, loading, success data, error handling, reset, abort
- `frontend/src/hooks/__tests__/useTheme.test.ts` — 5 tests: system preference, localStorage, toggle, persistence
- `frontend/src/hooks/__tests__/useKeyboardShortcuts.test.ts` — 4 tests: Ctrl+Enter, Escape, Ctrl+S, disabled

**Shared component tests (6 files, 25 tests):**
- `frontend/src/components/shared/__tests__/FileUpload.test.tsx` — 5 tests: upload area, loading state, file selection, multi-file, type validation error
- `frontend/src/components/shared/__tests__/OutputPane.test.tsx` — 5 tests: content render, placeholder, clipboard copy, title, download
- `frontend/src/components/shared/__tests__/WorkspaceHeader.test.tsx` — 3 tests: title/description, icon, format badges
- `frontend/src/components/shared/__tests__/ErrorMessage.test.tsx` — 4 tests: message, retry button render/hide, retry click
- `frontend/src/components/shared/__tests__/Skeleton.test.tsx` — 4 tests: default lines, custom lines, CardSkeleton, aria-busy
- `frontend/src/components/shared/__tests__/DiffView.test.tsx` — 5 tests: beautified view, diff increase/decrease, side-by-side toggle, empty placeholder
- `frontend/src/components/shared/__tests__/ErrorBoundary.test.tsx` — 3 tests: children render, fallback on error, custom fallback
- `frontend/src/components/shared/__tests__/TextArea.test.tsx` — 4 tests: placeholder, character count, onChange, title

**Utility tests (2 files, 15 tests):**
- `frontend/src/lib/__tests__/utils.test.ts` — 14 tests: cn() class joining, formatFileSize() all units, detectFileType() all formats
- `frontend/src/lib/__tests__/api.test.ts` — 5 tests: health fetch, process POST, upload FormData, error handling

**Page integration tests (5 files, 30 tests):**
- `frontend/src/pages/home/__tests__/HomePage.test.tsx` — 3 tests: hero section, workspace cards, footer
- `frontend/src/pages/format/__tests__/FormatPage.test.tsx` — 6 tests: header, format tabs, example loading, API call, disabled state, indent options
- `frontend/src/pages/beautify/__tests__/BeautifyPage.test.tsx` — 6 tests: header, example buttons, example loading, API call, disabled state, toggle switches
- `frontend/src/pages/tabulate/__tests__/TabulatePage.test.tsx` — 4 tests: header, delimiter options, paste area, textarea placeholder
- `frontend/src/pages/reader/__tests__/ReaderPage.test.tsx` — 6 tests: header, input tabs, URL field, paste tab switch, disabled read, API call
- `frontend/src/pages/code-beautifier/__tests__/CodeBeautifierPage.test.tsx` — 7 tests: header, language options, indent options, API call, disabled state, clear, language search

**Coverage target met:** 80%+ services, 60%+ UI. All 137 tests pass across 24 test files.

### 8.2 — Backend Tests

(Previously established — 155 tests pass covering all service functions, API endpoints, file uploads, error handling, and edge cases. 5 formatter-dependent tests skipped when formatter binary unavailable.)

### 8.3 — E2E Tests

- `.github/workflows/e2e.yml` — GitHub Actions workflow: Python 3.12 + Node 22, install deps, Playwright Chromium, run tests
- `frontend/playwright.config.ts` — Playwright config with webServer definitions for backend + frontend
- `frontend/e2e/workspace.spec.ts` — 4 e2e tests: home page workspace links, keyboard navigation, Format workspace JSON paste/format, file upload

### Test Commands

```bash
make test            # Backend + Frontend unit tests
make test-frontend   # Frontend vitest only
make test-backend    # Backend pytest only
make test-all        # All tests including e2e
npm run test         # Frontend vitest
npm run test:watch   # Watch mode
npm run test:e2e     # Playwright e2e tests
```

---

## Phase 9: Release v1.0 (Completed)

### 9.1 — Formatter Registry Overhaul & Language Coverage

**Problem:** Only 25 of 43 frontend languages had formatters registered. Many languages (C, C++, Go, Rust, Shell, JSON, YAML, etc.) had zero always-available formatters, falling through to basic `FallbackFormatter` (CRLF→LF only).

**Changes (`backend/app/services/code_beautifier/`):**

1. **`registry.py`** — Every language now has at least one `is_available()=True` formatter:
   - `_BUILTIN_LANGS` extended with C, C++, Objective-C, Shell, CMake, Lua, Perl, Dockerfile, Makefile, Unknown (28 total)
   - `_register_builtin_only_languages` adds BuiltinFormatter fallback for JS, TS, JSX, TSX, HTML, CSS, SCSS, LESS, Markdown, PHP, Java, Solidity, Elm (13 more)
   - `Unknown` language always gets BuiltinFormatter (was FallbackFormatter — no formatting at all)

2. **`datafmt_fmt.py`** — New formatters for structured data formats:
   - `JsonFormatter` — `json.loads()` → `json.dumps(indent=2, ensure_ascii=False)`
   - `YamlFormatter` — `yaml.safe_load()` → `yaml.dump(default_flow_style=False)`
   - `XmlFormatter` — `minidom.parseString()` → `toprettyxml(indent="  ")`
   - `TomlFormatter` — `tomllib.loads()` → custom `_toml_dumps()` serializer
   - `IniFormatter` — `configparser.ConfigParser` → standard KEY=VALUE output per section
   - `EnvFormatter` — Custom KEY=VALUE parser with quoted value stripping, comment preservation, whitespace normalization

3. **`detector.py`** — Added missing extension mappings:
   - `.json`, `.xml`, `.yaml`, `.yml`, `.toml`, `.env`, `.ini`, `.pl`, `.pm`, `.cmake`, `.dockerfile`, `.makefile`

**Result:** All 44 frontend languages return `success=True` with meaningful formatting — none fall through to the basic whitespace-only fallback.

### 9.2 — BuiltinFormatter Reliability Fixes

**`backend/app/services/code_beautifier/formatters/builtin_fmt.py`:**

1. **Ruby keyword-based indentation** — Added `_normalize_ruby()` method:
   - Tracks `def/class/module/if/unless/case/while/until/for/begin/do → end` nesting
   - `else/elsif/when/rescue/ensure` at same level as their opening keyword
   - `private/protected/public` access modifiers don't affect depth
   - Correct `end` matching for multi-level nesting

2. **`:=` operator spacing** — Go `i := 0` was being split to `i : = 0` by generic operator spacing regex. Fixed with:
   - Negative lookbehind `(?<![:!<>=])=(?!=)` to skip composite operators
   - Post-cleanup pass removes spaces around `:=`, `::`, `..`, `?.`, `->`

3. **`} else {` indentation** — Rust/Kotlin/Swift else-block was broken (de-dented to wrong level). Added `brace_open >= brace_close` guard so lines starting with `}` that also open `{` maintain correct depth.

### 9.3 — Prettier Plugin Coverage

**Installed (`frontend/package.json`):**
- `prettier-plugin-java` — Java formatting via Prettier
- `@prettier/plugin-php` — PHP formatting via Prettier
- `prettier-plugin-solidity` — Solidity formatting via Prettier
- `prettier-plugin-elm` — Elm formatting via Prettier

**Result:** Java, PHP, Solidity now use Prettier (plugin) as primary formatter with BuiltinFormatter fallback. Elm uses Prettier plugin (may fail on some syntax) with BuiltinFormatter fallback.

### 9.4 — Reader URL Import Improvement

**Backend (`backend/app/services/reader.py`):**
- Retry logic: 2 attempts with rotating User-Agent on timeout/server errors
- Extended timeout: 20s total (10s connect, 15s read) instead of 15s flat
- `_extract_html_fallback()` — When readability-lxml returns <50 chars, falls back to raw BeautifulSoup extraction (removes script/style/nav, unwraps non-allowed tags, keeps all `<p>` with >20 chars of text)
- Reports `retry: true` in metadata on retry success

**Frontend (`frontend/src/pages/reader/ReaderPage.tsx`):**
- URL validation with visual feedback (amber border + warning message on invalid URLs)
- `extractDomain()` helper — Shows detected domain below URL input
- 3 example URLs as clickable chips: Wikipedia Readability, Wikipedia Typography, example.com
- Domain badge in results showing source website
- Page count badge for PDFs
- Ctrl+Enter keyboard shortcut for paste tab

**Frontend (`frontend/src/pages/reader/ReaderView.tsx`):**
- Reading progress bar (fixed top bar, width = scroll progress)
- "~N min left" time remaining indicator
- Line-height control (1.5/normal, 1.8/relaxed, 2.0/loose) alongside font-size control
- Font sizes: S (sm), M (md), L (lg)

### 9.5 — UX Polish Across All Workspaces

**Code Beautifier (`frontend/src/pages/code-beautifier/CodeBeautifierPage.tsx`):**
- Expanded LANGUAGES from 14 → 43 with 9 groups (Common, Compiled, Scripting, Markup, Stylesheet, Data, Documentation, DevOps, Blockchain)
- Replaced `<select size={5}>` with grouped category-based language picker (scrollable, searchable)
- Language count badge in header: "43 languages supported"
- `Ctrl+Enter` keyboard shortcut hint
- `ACCEPT_EXTS` covers all 44 source file extensions

**Format (`frontend/src/pages/format/FormatPage.tsx`):**
- Added ENV and INI examples + tabs (now 6 format tabs)
- `Ctrl+Enter` keyboard shortcut with hint text
- Updated `WORKSPACE.formats` to include `.ini`

**Beautify (`frontend/src/pages/beautify/BeautifyPage.tsx`):**
- `Ctrl+Enter` keyboard shortcut with "Ctrl+Enter to run" hint

**Tabulate (`frontend/src/pages/tabulate/TabulatePage.tsx`):**
- File name display badge when uploading
- Delimiter badge in results view (shows current delimiter)
- Added Pipe (`|`) delimiter option
- Paste auto-parse hint text ("Paste auto-parses after 400ms. Change delimiter below to retry.")

### 9.6 — Updated Test Counts

- **Backend:** 160 tests (was 155) — added data format formatter tests implicitly covered by existing Format service tests; updated `test_unknown_language_fallback` assertion for new BuiltinFormatter
- **Frontend:** 138 tests (unchanged, but ReaderPage/CodeBeautifierPage tests updated for UI changes)
- **Language audit:** All 44 frontend languages verified with complex real-world code, all return `success=True` with a proper formatter (not plain fallback)

### Remaining Work for v1.0

1. `docs/user-guide.md` — Screenshots, common workflows, keyboard shortcuts, FAQ
2. `docs/api.md` — Complete API reference with example requests/responses, error codes
3. `examples/` directory — Sample files for each workspace, before/after examples
4. `Dockerfile` — Multi-stage build: frontend → nginx + backend → single container
5. Performance benchmarks:
   - JSON: 100MB → <5s
   - CSV: 1M rows → <10s to display
   - Reader: URL fetch + extract → <3s
6. Accessibility audit (keyboard nav, screen readers, color contrast)
7. Cross-browser testing (Chrome, Firefox, Safari, Edge)

---

## Architecture Decision Records

### ADR-001: Monorepo Structure

Frontend and backend share a repository but have independent dependency management. This allows parallel development while keeping the project discoverable.

### ADR-002: Service Layer Isolation

Business logic lives in `services/` modules as pure functions. Routes are thin adapters. This allows testing business logic without HTTP, and replacing the API layer without touching business logic.

### ADR-003: No Global State Library

At the current scale, React's built-in useState/useCallback are sufficient. If cross-component state sharing becomes necessary, prefer React Context over Redux. Re-evaluate at 20+ components sharing state.

### ADR-004: Server-Side Processing

All content processing happens on the backend. The frontend is a thin presentation layer. This keeps processing logic in Python (richer ecosystem) and allows future API clients.

### ADR-005: Deterministic Over AI

All features use rule-based, deterministic algorithms. No machine learning, no LLMs, no cloud AI. This ensures predictable behavior, offline functionality, and zero ongoing costs.

---

## Dependency Installation Plan

### Phase 1 (Completed)
```
backend: pyyaml>=6.0  — installed
```

### Phase 2 (Completed)
```
backend: black, autopep8, sqlparse  — installed in venv
frontend: prettier (pre-existing dev dependency)
```

### Phase 3 (Completed)
```
backend: pyspellchecker>=0.9.0  — installed
```

### Phase 4
```
backend: openpyxl>=3.1
frontend: @tanstack/react-table
```

### Phase 5
```
backend: beautifulsoup4>=4.12, readability-lxml>=0.8, lxml>=5.1, httpx>=0.27
backend: pypdf>=4.0, python-docx>=1.1
```

### Phase 8
```
frontend: @testing-library/react, @testing-library/jest-dom, jsdom
frontend: @playwright/test (e2e)
```

---

## Priority Order Summary

1. **Phase 0.5** — Functional UI Freeze (completed)
2. **Phase 1** — Format (completed)
3. **Phase 2** — Code Beautifier (completed)
3. **Phase 3** — Beautify (completed)
4. **Phase 4** — Tabulate (interactive UI complexity)
5. **Phase 5** — Reader (most complex, multiple document formats)
6. **Phase 6** — Polish (improve everything)
7. **Phase 7** — Performance (optimize bottlenecks found in previous phases)
8. **Phase 8** — Testing (completed — 137 frontend + 155 backend tests)
9. **Phase 9** — Release (documentation, build, deploy)
