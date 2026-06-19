# ============================================
# Kotatsu Web - Suwayomi Server + Kotatsu WebUI
# Multi-stage Docker build
# ============================================

# Stage 1: Build the WebUI
FROM node:24-alpine AS webui-builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files first for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
RUN pnpm install --frozen-lockfile || pnpm install --no-frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

# Stage 2: Download Suwayomi-Server
FROM eclipse-temurin:21-jre-alpine AS server-fetcher

RUN apk add --no-cache curl jq

# Download latest Suwayomi-Server release
ARG SUWAYOMI_VERSION=latest
RUN if [ "$SUWAYOMI_VERSION" = "latest" ]; then \
      DOWNLOAD_URL=$(curl -s https://api.github.com/repos/Suwayomi/Suwayomi-Server/releases/latest \
        | jq -r '.assets[] | select(.name | endswith(".jar")) | .browser_download_url' | head -1); \
    else \
      DOWNLOAD_URL=$(curl -s "https://api.github.com/repos/Suwayomi/Suwayomi-Server/releases/tags/v${SUWAYOMI_VERSION}" \
        | jq -r '.assets[] | select(.name | endswith(".jar")) | .browser_download_url' | head -1); \
    fi && \
    echo "Downloading: $DOWNLOAD_URL" && \
    curl -L -o /suwayomi-server.jar "$DOWNLOAD_URL"

# Stage 3: Final runtime image
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="kotatsu-web"
LABEL description="Kotatsu-style manga reader - Suwayomi Server with Kotatsu WebUI"

# Install runtime dependencies
RUN apk add --no-cache \
    tzdata \
    curl \
    tini

# Create app user
RUN addgroup -g 1000 suwayomi && \
    adduser -u 1000 -G suwayomi -h /home/suwayomi -D suwayomi

WORKDIR /home/suwayomi

# Copy Suwayomi-Server JAR
COPY --from=server-fetcher /suwayomi-server.jar ./suwayomi-server.jar

# Copy built WebUI
COPY --from=webui-builder /app/build ./webui

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create data directories
RUN mkdir -p /home/suwayomi/.local/share/Tachidesk && \
    chown -R suwayomi:suwayomi /home/suwayomi

# Server config directory
VOLUME ["/home/suwayomi/.local/share/Tachidesk"]

# Suwayomi-Server default port
EXPOSE 4567

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:4567/api/v1/settings/about || exit 1

ENV TZ=UTC
ENV JAVA_OPTS="-Xmx512m"

USER suwayomi

ENTRYPOINT ["tini", "--"]
CMD ["/docker-entrypoint.sh"]
