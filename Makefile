.PHONY: frontend backend dev-frontend dev-backend dev install-frontend install-backend install lint format typecheck test clean

# Development
dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev:
	$(MAKE) dev-backend & $(MAKE) dev-frontend

# Installation
install-frontend:
	cd frontend && npm install

install-backend:
	cd backend && pip install -r requirements.txt

install:
	$(MAKE) install-frontend
	$(MAKE) install-backend

# Lint and format
lint-frontend:
	cd frontend && npx eslint src/ --ext .ts,.tsx

lint-backend:
	cd backend && ruff check app/ tests/

lint:
	$(MAKE) lint-frontend
	$(MAKE) lint-backend

format-frontend:
	cd frontend && npx prettier --write "src/**/*.{ts,tsx,css}"

format-backend:
	cd backend && ruff format app/ tests/

format:
	$(MAKE) format-frontend
	$(MAKE) format-backend

# Type checking
typecheck-frontend:
	cd frontend && npx tsc --noEmit

typecheck-backend:
	cd backend && mypy app/

typecheck:
	$(MAKE) typecheck-frontend
	$(MAKE) typecheck-backend

# Testing
test-frontend:
	cd frontend && npm test

test-frontend-cov:
	cd frontend && npm run test:coverage

test-frontend-watch:
	cd frontend && npm run test:watch

test-e2e:
	cd frontend && npx playwright test

test-e2e-ui:
	cd frontend && npx playwright test --ui

test-backend:
	cd backend && pytest -v

test:
	$(MAKE) test-backend
	$(MAKE) test-frontend

test-all:
	$(MAKE) test-backend
	$(MAKE) test-frontend
	$(MAKE) test-e2e

# Cleanup
clean:
	rm -rf frontend/node_modules frontend/dist
	rm -rf backend/**/__pycache__ backend/.pytest_cache
	rm -rf .pytest_cache .mypy_cache .ruff_cache
