# ============================================
# Kotatsu Web - Suwayomi Server + Kotatsu WebUI
# ============================================

# Stage 1: Build Kotatsu WebUI
FROM node:24-alpine AS webui-builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
RUN pnpm install --frozen-lockfile || pnpm install --no-frozen-lockfile
COPY . .
RUN pnpm build && \
    echo "[Kotatsu] WebUI build output:" && \
    ls -la build/ && \
    echo "[Kotatsu] Files count: $(find build -type f | wc -l)"

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
    echo "Downloading: $DOWNLOAD_URL" && \
    curl -L -o /suwayomi-server.jar "$DOWNLOAD_URL"

# Stage 3: Runtime
FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="kotatsu-web"
LABEL description="Kotatsu manga reader - Suwayomi Server with Kotatsu WebUI"

RUN apk add --no-cache tzdata curl tini

RUN addgroup -g 1000 suwayomi && \
    adduser -u 1000 -G suwayomi -h /home/suwayomi -D suwayomi

WORKDIR /home/suwayomi

# Copy server JAR and Kotatsu WebUI build
COPY --from=server-fetcher /suwayomi-server.jar ./suwayomi-server.jar
COPY --from=webui-builder /app/build ./kotatsu-webui

# Copy entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Fix ownership (NO VOLUME declaration — let entrypoint handle everything)
RUN chown -R suwayomi:suwayomi /home/suwayomi

EXPOSE 4567

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:4567 || exit 1

ENV TZ=UTC
ENV JAVA_OPTS="-Xmx512m"

USER suwayomi
ENTRYPOINT ["tini", "--"]
CMD ["/docker-entrypoint.sh"]
