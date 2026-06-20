# ============================================
# Kotatsu Web - Suwayomi Server + Kotatsu WebUI
# Multi-stage Docker build
# ============================================

# Stage 1: Build the Kotatsu WebUI
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
LABEL description="Kotatsu-style manga reader powered by Suwayomi Server with Tachiyomi extensions"

RUN apk add --no-cache tzdata curl tini

RUN addgroup -g 1000 suwayomi && \
    adduser -u 1000 -G suwayomi -h /home/suwayomi -D suwayomi

WORKDIR /home/suwayomi

# Copy Suwayomi-Server JAR
COPY --from=server-fetcher /suwayomi-server.jar ./suwayomi-server.jar

# Copy built Kotatsu WebUI (source copy — entrypoint places it correctly)
COPY --from=webui-builder /app/build ./kotatsu-webui

# Pre-install Kotatsu WebUI into where Suwayomi expects its WebUI
# This ensures our UI is there BEFORE the server starts
RUN mkdir -p /home/suwayomi/.local/share/Tachidesk/webUI/Suwayomi-WebUI && \
    cp -r ./kotatsu-webui/* /home/suwayomi/.local/share/Tachidesk/webUI/Suwayomi-WebUI/

# Write server config that disables WebUI auto-download/update
RUN mkdir -p /home/suwayomi/.local/share/Tachidesk && \
    printf 'server {\n\
    webUIEnabled = true\n\
    webUIChannel = "bundled"\n\
    webUIUpdateCheckInterval = 0\n\
    initialOpenInBrowserEnabled = false\n\
    systemTrayEnabled = false\n\
}\n' > /home/suwayomi/.local/share/Tachidesk/server.conf

# Copy entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Fix ownership
RUN chown -R suwayomi:suwayomi /home/suwayomi

VOLUME ["/home/suwayomi/.local/share/Tachidesk"]
EXPOSE 4567

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:4567/api/v1/settings/about || exit 1

ENV TZ=UTC
ENV JAVA_OPTS="-Xmx512m"

USER suwayomi
ENTRYPOINT ["tini", "--"]
CMD ["/docker-entrypoint.sh"]
