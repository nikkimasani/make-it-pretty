# Cloudflare copy deployment

This branch is for the Cloudflare copy only. Do not merge it into `main`; keep the existing Vercel deployment as a separate preserved deployment.

## Cloudflare Pages frontend
- Build command: `cd frontend && npm ci && npm run build`
- Build output directory: `frontend/dist`
- Functions directory: `functions`
- Pages project: `make-it-pretty-cloudflare`

## Cloudflare Python backend
The FastAPI backend is staged as a native Cloudflare Python Worker rather than proxying Vercel.

Backend directory: `backend/`
Worker entrypoint: `backend/cloudflare_worker.py`
Worker config: `backend/wrangler.jsonc`
Worker project name: `make-it-pretty-api-cloudflare`

The Pages function at `functions/api/[[path]].js` forwards `/api/*` to the Cloudflare Python Worker using:

`PYTHON_API_ORIGIN=https://<assigned-worker-host>`

There is no Vercel backend origin configured on the Cloudflare branch.

## Python compatibility note
The existing FastAPI application and route structure are preserved. The dependency set includes document and formatting libraries such as `openpyxl`, `lxml`, `pypdf`, `python-docx`, `black`, and related tooling. Deploy the Python Worker first and validate all dependencies in Cloudflare's Python runtime.

If Cloudflare Python Workers reject a binary-heavy dependency, preserve feature parity by deploying the existing backend Dockerfile through Cloudflare Containers and point `PYTHON_API_ORIGIN` at that Cloudflare-hosted backend. Do not remove or silently disable an existing feature to force a Worker-only deployment.

## Verification
1. Python Worker `/api/v1/health` returns successfully.
2. Pages frontend loads and refreshes routes correctly.
3. Text beautification and grammar tools work.
4. Table/data formatting tools work.
5. Document parsing/upload endpoints work.
6. Code formatting workflows work.
7. `x-make-it-pretty-backend` reports `cloudflare-python-worker` when the Worker path is used.
8. No backend source, environment files, or secrets are exposed in the Pages output.
9. The existing Vercel project and `main` branch remain unchanged.

The Vercel deployment is retained as the original parallel version, not as a Cloudflare runtime dependency.
