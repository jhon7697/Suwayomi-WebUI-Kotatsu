#!/bin/sh
set -e

PORT="${PORT:-4567}"
SUWAYOMI_PORT="4568"
DATA_DIR="/app/data"

echo "============================================"
echo "[Kotatsu] Starting Kotatsu Web"
echo "[Kotatsu] Public port: ${PORT}"
echo "[Kotatsu] Suwayomi API port: ${SUWAYOMI_PORT}"
echo "============================================"

# Verify WebUI build
if [ ! -f "/app/kotatsu-webui/index.html" ]; then
    echo "[Kotatsu] FATAL: Kotatsu WebUI build missing!"
    ls -la /app/kotatsu-webui/ 2>/dev/null || echo "  (directory not found)"
    exit 1
fi
echo "[Kotatsu] ✓ WebUI: $(find /app/kotatsu-webui -type f | wc -l) files"

# Suwayomi data directory
mkdir -p "${DATA_DIR}"

# Write nginx config
cat > /etc/nginx/http.d/default.conf << NGINXEOF
server {
    listen ${PORT};
    server_name _;

    root /app/kotatsu-webui;
    index index.html;

    client_max_body_size 100M;

    # All /api requests → Suwayomi
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

    # SPA fallback
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

echo "[Kotatsu] ✓ nginx config written"

# Start Suwayomi-Server in background (API-only, no WebUI)
echo "[Kotatsu] Starting Suwayomi-Server (API-only)..."
java ${JAVA_OPTS} \
    -Dsuwayomi.server.port="${SUWAYOMI_PORT}" \
    -Dsuwayomi.server.webUIEnabled=false \
    -Dsuwayomi.server.initialOpenInBrowserEnabled=false \
    -Dsuwayomi.server.systemTrayEnabled=false \
    -Dsuwayomi.server.rootDir="${DATA_DIR}" \
    -jar /app/suwayomi-server.jar &
SERVER_PID=$!

# Start nginx
echo "[Kotatsu] Starting nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Quick check
sleep 2
if kill -0 $NGINX_PID 2>/dev/null; then
    echo "[Kotatsu] ✓ nginx running (PID: ${NGINX_PID})"
else
    echo "[Kotatsu] ✗ nginx FAILED to start"
    cat /var/log/nginx/error.log 2>/dev/null
    exit 1
fi

if kill -0 $SERVER_PID 2>/dev/null; then
    echo "[Kotatsu] ✓ Suwayomi running (PID: ${SERVER_PID})"
else
    echo "[Kotatsu] ✗ Suwayomi FAILED to start"
    exit 1
fi

echo "============================================"
echo "[Kotatsu] ✓ Kotatsu Web is LIVE!"
echo "[Kotatsu]   http://0.0.0.0:${PORT}"
echo "============================================"

# Handle shutdown
trap "kill $NGINX_PID $SERVER_PID 2>/dev/null; exit 0" INT TERM

# Wait for either to exit
wait -n $SERVER_PID $NGINX_PID 2>/dev/null || wait $SERVER_PID
