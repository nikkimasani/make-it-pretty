# Contributing

Thank you for your interest in **Make It Pretty**! We welcome contributions from developers of all skill levels.

## Code of Conduct

This project is committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Be respectful, constructive, and kind.

## How to Contribute

### Reporting Issues

Before opening an issue, please:

- Search [existing issues](https://github.com/your-org/make-it-pretty/issues) to avoid duplicates
- Clearly describe the problem, including steps to reproduce
- Include your environment: OS, Python version (`python --version`), Node version (`node --version`)
- If suggesting a feature, explain the **problem** you're solving, not just the solution

### Pull Requests

1. **Fork** the repository
2. **Create a branch**: `git checkout -b type/description`
   - Use prefixes: `fix/`, `feat/`, `docs/`, `refactor/`, `test/`, `chore/`
   - Example: `fix/json-tree-infinite-loop`, `feat/svg-export`
3. **Make your changes** — keep them focused and atomic
4. **Run quality checks** before committing:

   ```bash
   make lint         # ESLint + Ruff
   make typecheck    # TypeScript + mypy
   make test         # pytest + vitest
   ```

5. **Write a clear commit message** following [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   type(scope): description

   - bullet list of changes
   - each change explained briefly
   ```
6. **Push** and open a pull request targeting `main`
7. In the PR description, explain **what** changed and **why**

### Before You Start

Read [`docs/architecture.md`](docs/architecture.md) to understand the project structure and design decisions. This will help your PR align with the project's philosophy.

## Development Setup

See the [README](README.md#installation) for detailed setup instructions for both Linux and Windows.

## Design Philosophy

Before contributing a feature, ensure it aligns with the project's core principles:

| Principle | Description |
|-----------|-------------|
| **Local-first** | Everything must work offline with no cloud dependencies |
| **No AI** | All processing is deterministic, rule-based, and predictable |
| **No telemetry** | User data never leaves their machine |
| **Beauty** | Every output should look refined |
| **Readability** | Content must be easy to process |

Features that violate these principles will not be accepted.

## Code Style

| Area | Tool / Convention |
|------|-------------------|
| Frontend formatting | Prettier (defaults) |
| Frontend linting | ESLint with TypeScript rules |
| Backend formatting | Ruff (`ruff format app/`) |
| Backend linting | Ruff (`ruff check app/`) |
| Backend types | mypy strict mode |
| Components | PascalCase, named exports |
| Functions/variables | camelCase (TS), snake_case (Python) |
| Modules | One responsibility per module, keep them small |

## Testing

- All new features must include tests
- Backend: `pytest` in `backend/`
- Frontend: `vitest` in `frontend/`
- E2E: Playwright in `frontend/` (requires `npx playwright install chromium`)
- Run the full suite before submitting: `make test`

## Questions?

Open a [discussion](https://github.com/your-org/make-it-pretty/discussions) or ask in your pull request.
