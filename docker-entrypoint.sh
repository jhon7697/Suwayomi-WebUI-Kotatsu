#!/bin/sh
set -e

PORT="${PORT:-4567}"
SUWAYOMI_PORT="4568"

# Running as root → data dir is /root/.local/share/Tachidesk
DATA_DIR="/root/.local/share/Tachidesk"

echo "============================================"
echo "[Kotatsu] Starting Kotatsu Web"
echo "[Kotatsu] Public port: ${PORT}"
echo "[Kotatsu] Suwayomi API port: ${SUWAYOMI_PORT}"
echo "============================================"

# Verify WebUI build
if [ ! -f "/app/kotatsu-webui/index.html" ]; then
    echo "[Kotatsu] FATAL: WebUI build missing!"
    ls -la /app/kotatsu-webui/ 2>/dev/null
    exit 1
fi
echo "[Kotatsu] ✓ WebUI: $(find /app/kotatsu-webui -type f | wc -l) files"

# Write server.conf to CORRECT location (where Suwayomi actually reads it)
mkdir -p "${DATA_DIR}"
cat > "${DATA_DIR}/server.conf" << CONF
server {
    port = ${SUWAYOMI_PORT}
    webUIEnabled = false
    webUIUpdateCheckInterval = 0
    initialOpenInBrowserEnabled = false
    systemTrayEnabled = false
}
CONF
echo "[Kotatsu] ✓ server.conf written to ${DATA_DIR}/server.conf"
echo "[Kotatsu]   port=${SUWAYOMI_PORT}, webUIEnabled=false"

# Write nginx config (listen on PORT + 4567 as fallback)
cat > /etc/nginx/http.d/default.conf << NGINXEOF
server {
    listen ${PORT};
    listen 4567;
    server_name _;

    root /app/kotatsu-webui;
    index index.html;

    client_max_body_size 100M;

    # All /api requests → Suwayomi backend
    location /api/ {
        proxy_pass http://127.0.0.1:${SUWAYOMI_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # SPA fallback — all other routes serve index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF
echo "[Kotatsu] ✓ nginx config written (listen ${PORT}, proxy to ${SUWAYOMI_PORT})"

# Test nginx config
nginx -t 2>&1 || { echo "[Kotatsu] FATAL: nginx config invalid!"; exit 1; }
echo "[Kotatsu] ✓ nginx config test passed"

# Start nginx first (so Railway sees a listener immediately)
echo "[Kotatsu] Starting nginx..."
nginx 2>&1
NGINX_STATUS=$?
if [ $NGINX_STATUS -ne 0 ]; then
    echo "[Kotatsu] FATAL: nginx failed to start (exit code: $NGINX_STATUS)"
    cat /var/log/nginx/error.log 2>/dev/null
    exit 1
fi
echo "[Kotatsu] ✓ nginx started (listening on ${PORT} and 4567)"

# Quick verify nginx is actually serving files
sleep 1
HTTP_CODE=$(curl -so /dev/null -w '%{http_code}' http://127.0.0.1:${PORT}/ 2>/dev/null || echo "000")
echo "[Kotatsu] ✓ nginx health check: HTTP ${HTTP_CODE}"
if [ "$HTTP_CODE" = "000" ]; then
    echo "[Kotatsu] WARNING: nginx not responding on port ${PORT}"
    cat /var/log/nginx/error.log 2>/dev/null
fi

# Start Suwayomi-Server (foreground — keeps container alive)
echo "[Kotatsu] Starting Suwayomi-Server..."
echo "============================================"
echo "[Kotatsu] ✓ Kotatsu Web is LIVE!"
echo "[Kotatsu]   http://0.0.0.0:${PORT}"
echo "============================================"

exec java ${JAVA_OPTS} \
    -jar /app/suwayomi-server.jar
