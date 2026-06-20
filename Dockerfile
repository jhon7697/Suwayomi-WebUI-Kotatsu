# ============================================
# Kotatsu Web - Nginx + Suwayomi Server
# nginx serves Kotatsu UI, proxies API to Suwayomi
# ============================================

# Stage 1: Build Kotatsu WebUI
FROM node:24-alpine AS webui-builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
RUN pnpm install --frozen-lockfile || pnpm install --no-frozen-lockfile
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

# Stage 3: Runtime (Java + nginx)
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="kotatsu-web"
LABEL description="Kotatsu manga reader - nginx serves UI, Suwayomi handles API"

RUN apk add --no-cache tzdata curl tini nginx

RUN addgroup -g 1000 suwayomi && \
    adduser -u 1000 -G suwayomi -h /home/suwayomi -D suwayomi && \
    # Let suwayomi user run nginx
    mkdir -p /tmp/nginx-client-body /tmp/nginx-proxy /tmp/nginx-fastcgi /tmp/nginx-uwsgi /tmp/nginx-scgi && \
    chown -R suwayomi:suwayomi /tmp/nginx-* /var/lib/nginx /var/log/nginx

WORKDIR /home/suwayomi

COPY --from=server-fetcher /suwayomi-server.jar ./suwayomi-server.jar
COPY --from=webui-builder /app/build ./kotatsu-webui
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh && \
    chown -R suwayomi:suwayomi /home/suwayomi

EXPOSE 4567

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:${PORT:-4567} || exit 1

ENV TZ=UTC
ENV JAVA_OPTS="-Xmx512m"

USER suwayomi
ENTRYPOINT ["tini", "--"]
CMD ["/docker-entrypoint.sh"]
