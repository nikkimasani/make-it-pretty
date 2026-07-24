# syntax=docker/dockerfile:1

# Stage 1: Rust toolchain (for rustfmt)
FROM rust:1.84-slim-bookworm AS rust-builder
RUN rustup component add rustfmt

# Stage 2: Main backend image (Python + all formatters)
FROM python:3.12-slim AS backend

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    NODE_VERSION=22

# System dependencies + formatter toolchains
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libxml2-dev \
        libxslt1-dev \
        libcurl4-openssl-dev \
        curl \
        ca-certificates \
        gnupg \
        git \
        unzip \
        wget \
        clang-format \
        golang \
        openjdk-21-jre-headless \
        ruby-full \
        && \
    rm -rf /var/lib/apt/lists/*

# Swift toolchain (provides swift-format for Swift formatting)
RUN apt-get update && \
    apt-get install -y --no-install-recommends swiftlang && \
    rm -rf /var/lib/apt/lists/* && \
    ln -sf /usr/libexec/swift/bin/swift-format /usr/local/bin/swift-format && \
    swift-format --version

# Node.js 22 (for Prettier)
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

# .NET SDK (for dotnet format / C#)
RUN curl -fsSL https://dot.net/v1/dotnet-install.sh -o /tmp/dotnet-install.sh && \
    chmod +x /tmp/dotnet-install.sh && \
    /tmp/dotnet-install.sh --channel 9.0 --install-dir /usr/share/dotnet && \
    ln -s /usr/share/dotnet/dotnet /usr/local/bin/dotnet && \
    rm /tmp/dotnet-install.sh && \
    rm -rf /tmp/NuGet* /root/.dotnet /root/.nuget /root/.templateengine

WORKDIR /app

# Python dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Prettier + Node formatters at expected path
# prettier_fmt.py resolves: parents[5] / frontend / node_modules / .bin / prettier
# external.py resolves:    parents[5] / frontend / node_modules / .bin
RUN mkdir -p /app/frontend && \
    cd /app/frontend && \
    npm init -y --quiet && \
    npm install --save-dev \
        prettier@3.9.6 \
        prettier-plugin-java@2.10.3 \
        @prettier/plugin-php@0.25.0 \
        prettier-plugin-solidity@2.3.1 \
        prettier-plugin-elm@0.12.0

# shfmt (Shell formatter)
RUN curl -fsSLo /usr/local/bin/shfmt \
        https://github.com/mvdan/sh/releases/download/v3.8.0/shfmt_v3.8.0_linux_amd64 && \
    chmod +x /usr/local/bin/shfmt

# stylua (Lua formatter, subprocess/builtin fallback)
RUN curl -fsSL \
        https://github.com/JohnnyMorganz/StyLua/releases/download/v0.20.0/stylua-linux-x86_64.zip \
        -o /tmp/stylua.zip && \
    unzip -o /tmp/stylua.zip -d /usr/local/bin/ && \
    chmod +x /usr/local/bin/stylua && \
    rm /tmp/stylua.zip

# ktfmt (Kotlin formatter) — wrapper script using JRE
RUN curl -fsSL \
        https://github.com/facebook/ktfmt/releases/download/v0.52/ktfmt-0.52-jar-with-dependencies.jar \
        -o /usr/local/lib/ktfmt.jar && \
    (printf '#!/bin/sh\nexec java -jar /usr/local/lib/ktfmt.jar "$@"\n' > /usr/local/bin/ktfmt) && \
    chmod +x /usr/local/bin/ktfmt

# rustfmt (Rust formatter) from builder stage
COPY --from=rust-builder /usr/local/cargo/bin/rustfmt /usr/local/bin/rustfmt

# rufo (Ruby formatter)
RUN gem install rufo

# Copy application code
COPY backend/app /app/backend/app
COPY backend/tests /app/backend/tests
COPY backend/pyproject.toml /app/backend/pyproject.toml

# Upload directory
RUN mkdir -p /app/backend/uploads && chmod 777 /app/backend/uploads

# Non-root user
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

ENV PYTHONPATH=/app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
