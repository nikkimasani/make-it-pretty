# syntax=docker/dockerfile:1

# ============================================================
# Stage 1: Build the frontend with Vite
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /build

# Copy dependency manifests first for layer caching
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy source code
COPY frontend/ ./

# Build
RUN npm run build

# ============================================================
# Stage 2: Serve with nginx
# ============================================================
FROM nginx:1.27-alpine AS frontend

# Copy custom nginx config (includes API proxy to backend)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend from builder stage
COPY --from=builder /build/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:80/ || exit 1
