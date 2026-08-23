# Cloudflare copy deployment

This branch is for the Cloudflare copy only. Do not merge it into `main`; keep the existing Vercel deployment live.

## Cloudflare Pages settings
- Build command: `cd frontend && npm ci && npm run build`
- Build output directory: `frontend/dist`
- Functions directory: `functions`

## Backend bridge
The frontend remains on Cloudflare Pages while `/api/*` is proxied by `functions/api/[[path]].js` to the existing Python/FastAPI backend on Vercel.

Default backend origin:
`https://make-it-pretty.vercel.app`

Optional Cloudflare environment variable:
`VERCEL_API_ORIGIN=https://make-it-pretty.vercel.app`

This avoids rewriting the Python backend before the Cloudflare frontend is verified and preserves the Vercel deployment as a working fallback.

## Verification
1. App shell and routing load directly and on refresh.
2. Text formatting tools work.
3. Table/data tools work.
4. Document parsing endpoints work through `/api/*`.
5. Code formatting and file workflows work.
6. No backend source or environment files are present in the published Pages output.

Keep Vercel active after the Cloudflare frontend is verified.
