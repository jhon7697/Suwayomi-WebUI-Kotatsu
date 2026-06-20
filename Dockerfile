# ============================================
# Kotatsu Web - Nginx + Suwayomi Server
# ============================================

# Stage 1: Build Kotatsu WebUI
FROM node:24-alpine AS webui-builder
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
RUN corepack install && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build && \
    test -f build/index.html || (echo "BUILD FAILED: no index.html" && exit 1) && \
    echo "Build OK: $(find build -type f | wc -l) files"

# Stage 2: Download Suwayomi-Server
FROM eclipse-temurin:21-jre-alpine AS server-fetcher
RUN apk add --no-cache curl jq
ARG SUWAYOMI_VERSION=latest
RUN if [ "$SUWAYOMI_VERSION" = "latest" ]; then \
      DOWNLOAD_URL=$(curl -s https://api.github.com/repos/Suwayomi/Suwayomi-Server/releases/latest \
        | jq -r '.assets[] | select(.name | endswith(".jar")) | .browser_download_url' | head -1); \
    else \
      DOWNLOAD_URL=$(curl -s "https://api.github.com/repos/Suwayomi/Suwayomi-Server/releases/tags/v${SUWAYOMI_VERSION}" \
        | jq -r '.assets[] | select(.name | endswith(".jar")) | .browser_download_url' | head -1); \
    fi && \
    curl -L -o /suwayomi-server.jar "$DOWNLOAD_URL"

# Stage 3: Runtime
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="kotatsu-web"
LABEL description="Kotatsu manga reader - nginx serves UI, Suwayomi handles API"

RUN apk add --no-cache tzdata curl tini nginx && \
    mkdir -p /run/nginx /var/log/nginx /tmp/nginx && \
    chown -R root:root /run/nginx /var/log/nginx /tmp/nginx

WORKDIR /app

COPY --from=server-fetcher /suwayomi-server.jar ./suwayomi-server.jar
COPY --from=webui-builder /app/build ./kotatsu-webui
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 4567

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
    CMD curl -sf http://localhost:${PORT:-4567}/ || exit 1

ENV TZ=UTC
ENV JAVA_OPTS="-Xmx512m"

# Run as root — nginx needs it on Alpine
ENTRYPOINT ["tini", "--"]
CMD ["/docker-entrypoint.sh"]
