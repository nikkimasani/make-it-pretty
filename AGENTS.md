# Agent Guide

## Commands

### Frontend
- `npm run dev` - Start development server (port 5173)

### Backend
- `uvicorn app.main:app --reload --port 8000` - Start backend server

### Lint & Format
- `make lint` - Run all linters
- `make format` - Format all code
- `make typecheck` - Run type checking

### Test
- `make test` - Run all tests
- `make test-frontend` - Run frontend tests
- `make test-backend` - Run backend tests

## Architecture

Monorepo with frontend (React/Vite/TypeScript/Tailwind) and backend (Python/FastAPI/Pydantic).

Five workspaces: Beautify, Format, Tabulate, Reader, Code Beautifier.

Each workspace has its own route (frontend), router (backend), service (backend), and models (backend).
