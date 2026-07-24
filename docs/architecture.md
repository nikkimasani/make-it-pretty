# Architecture Guide

## Overview

Make It Pretty is a monorepo with two independent applications:

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Python 3.12 + FastAPI + Pydantic

The two communicate via REST over HTTP. The frontend proxies `/api/*` requests to the backend during development.

## Design Philosophy

### Organized by User Intent

The application is organized around five workspaces, each representing a user goal:

1. **Beautify** — Clean up natural text
2. **Format** — Beautify structured data
3. **Tabulate** — Interactive table rendering
4. **Reader** — Clean document extraction
5. **Code Beautifier** — Source code cleanup

File types may appear in multiple workspaces. This overlap is intentional.

### Local-First

Everything runs on the user's machine. No cloud services, no API keys, no external dependencies at runtime. The application must function completely offline.

### No Generative AI

All processing is deterministic. Rule-based NLP, parsing, and formatting only. No LLMs, no AI APIs, no machine learning.

### Options Philosophy

Only the **Beautify** workspace contains optional processing controls (Grammar Suggestions, Emoji Enrichment).

All other workspaces intentionally remain configuration-free.

This follows the project's philosophy: organized by user intent while remaining simple.

- **Format** — Structured data formatting is always desirable. No configuration needed.
- **Tabulate** — Table rendering is a single action. Upload and display.
- **Reader** — Document extraction is a single action. Input and read.
- **Code Beautifier** — Code cleanup is upload-only. Upload source files and get them formatted according to the detected language's conventions.

Adding configuration to these workspaces would violate the principle of simplicity. If a user wants to beautify text, they may want grammar or emoji options. If a user wants to format JSON or read an article, they just want it done with zero friction.

## Frontend Architecture

### Component Tree

```
App
└── AppShell
    ├── Sidebar (navigation)
    └── Routes
        ├── HomePage
        ├── BeautifyPage
        ├── FormatPage
        ├── TabulatePage
        ├── ReaderPage
        └── CodeBeautifierPage
```

### Component Categories

- **`components/ui/`** — Base primitives: Button, Card, Spinner, Badge, ToggleSwitch
- **`components/layout/`** — App shell, sidebar, header
- **`components/shared/`** — WorkspaceHeader, FileUpload, OutputPane, TextArea

### State Management

State is managed locally with React hooks (`useState`, `useCallback`). The `useApi` hook wraps fetch calls with loading/error state. No global state library is needed at this scale.

### Routing

React Router v6 with one route per workspace plus home.

## Backend Architecture

### Layer Structure

```
Route (api/routes/) → Service (services/) → Pure functions
     ↓
Model (models/) — Pydantic schemas
```

### REST Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/beautify/process` | Process text |
| POST | `/api/v1/beautify/upload` | Upload file |
| POST | `/api/v1/format/process` | Process data |
| POST | `/api/v1/format/upload` | Upload file |
| POST | `/api/v1/tabulate/upload` | Upload table |
| POST | `/api/v1/reader/process` | Process document/URL |
| POST | `/api/v1/reader/upload` | Upload document |
| POST | `/api/v1/code-beautifier/process` | Process code |
| POST | `/api/v1/code-beautifier/upload` | Upload code file |

### Service Layer

Business logic lives in `services/` modules, completely separate from routing. Services contain pure functions that transform input to output.

### Validation

- Frontend file picker filters by accepted extensions
- Backend validates content independently on every request
- Unsupported content returns HTTP 400 with a descriptive error

## Data Flow

1. User pastes content or uploads a file
2. Frontend sends content via POST to the appropriate endpoint
3. Backend validates and processes the content
4. Backend returns the transformed result
5. Frontend renders the result with appropriate UI

## Key Engineering Decisions

### Why TypeScript on the frontend?

The application manipulates many different data structures (JSON, XML, YAML, tables, documents, code). Type safety is extremely valuable for maintainability.

### Why FastAPI on the backend?

Python has the richest ecosystem for document processing, text processing, data parsing, and formatting. FastAPI integrates naturally with this ecosystem.

### Monorepo Structure

Frontend and backend are independent. They share only the repository root. This allows:
- Independent deployment
- Independent dependency management
- Clear separation of concerns
