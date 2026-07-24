# Development Guide

## Prerequisites

- Node.js 22+
- Python 3.12+
- npm 10+

## Setup

### 1. Clone and install

```bash
git clone <repo-url> make-it-pretty
cd make-it-pretty

# Install frontend
cd frontend && npm install

# Install backend
cd ../backend && pip install -r requirements.txt
```

### 2. Start development servers

**Terminal 1 — Backend:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

The frontend is available at `http://localhost:5173`. API requests are proxied to `http://localhost:8000`.

## Available Commands

### Frontend

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build |
| `npm test` | Run vitest tests |

### Backend

| Command | Purpose |
|---------|---------|
| `uvicorn app.main:app --reload --port 8000` | Development server with hot reload |
| `pytest -v` | Run tests |
| `ruff check app/` | Lint Python code |
| `ruff format app/` | Format Python code |
| `mypy app/` | Type check Python code |

### Root-level Makefile

| Command | Purpose |
|---------|---------|
| `make dev` | Start both servers |
| `make lint` | Run all linters |
| `make format` | Format all code |
| `make typecheck` | Run all type checkers |
| `make test` | Run all tests |

## Adding a New Workspace

1. **Frontend:** Create `src/pages/<workspace>/WorkspacePage.tsx`
2. **Frontend:** Add route in `src/router.tsx`
3. **Frontend:** Add config to `src/types/workspace.ts`
4. **Backend:** Create `app/api/routes/<workspace>.py`
5. **Backend:** Create `app/services/<workspace>.py`
6. **Backend:** Create `app/models/<workspace>.py`
7. **Backend:** Register router in `app/main.py`

## Functional UI Freeze Milestone

As of Phase 0.5, all frontend layouts are considered **functionally complete**.

No UI redesign should occur until all backend implementation phases are complete. Only functional additions directly required by backend integration are allowed (e.g., new response fields needing display).

This freeze includes:
- Workspace page layouts (upload, input, process, output flow)
- Toggle switches for Beautify options
- File picker restrictions per workspace
- API contracts (request/response models)

After the freeze, development should focus exclusively on:
1. Backend service implementation
2. Connecting backend logic to existing frontend controls
3. Testing

The final visual polish phase (Phase 6 in roadmap) is the designated time for UI refinement.

## Code Conventions

### Frontend

- React functional components with TypeScript
- Props interfaces defined above component
- Named exports for components
- Barrel exports from `index.ts` files
- Tailwind CSS for styling (no CSS modules)

### Backend

- Pydantic models for request/response validation
- Services as pure functions (no classes unless necessary)
- Routes are thin — no business logic
- Async routes for I/O operations
