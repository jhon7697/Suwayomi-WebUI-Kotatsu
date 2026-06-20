#!/bin/sh
set -e

PORT="${PORT:-4567}"
SUWAYOMI_PORT="4568"
DATA_DIR="/root/.local/share/Tachidesk"

echo "============================================"
echo "[Kotatsu] Starting Kotatsu Web"
echo "[Kotatsu] Public port: ${PORT}"
echo "[Kotatsu] Suwayomi API port: ${SUWAYOMI_PORT}"
echo "============================================"

# Verify WebUI build
if [ ! -f "/app/kotatsu-webui/index.html" ]; then
    echo "[Kotatsu] FATAL: WebUI build missing!"
    exit 1
fi
echo "[Kotatsu] ✓ WebUI: $(find /app/kotatsu-webui -type f | wc -l) files"

# Write Suwayomi server.conf
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
echo "[Kotatsu] ✓ server.conf → ${DATA_DIR}/server.conf"

# Write nginx config
# IMPORTANT: Connection header must be conditional — only "upgrade" for WebSocket
cat > /etc/nginx/http.d/default.conf << 'NGINXEOF'
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      '';
}

server {
    listen LISTEN_PORT;
    listen 4567;
    server_name _;

    root /app/kotatsu-webui;
    index index.html;

    client_max_body_size 100M;

    # API requests → Suwayomi (regular HTTP)
    location /api/ {
        proxy_pass http://127.0.0.1:SUWAYOMI_BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF

# Replace placeholders with actual port values
sed -i "s/LISTEN_PORT/${PORT}/g" /etc/nginx/http.d/default.conf
sed -i "s/SUWAYOMI_BACKEND_PORT/${SUWAYOMI_PORT}/g" /etc/nginx/http.d/default.conf

echo "[Kotatsu] ✓ nginx config written"

# Test nginx config
nginx -t 2>&1 || { echo "[Kotatsu] FATAL: nginx config invalid!"; cat /var/log/nginx/error.log 2>/dev/null; exit 1; }
echo "[Kotatsu] ✓ nginx config valid"

# Start nginx
nginx 2>&1 || { echo "[Kotatsu] FATAL: nginx failed!"; exit 1; }
echo "[Kotatsu] ✓ nginx started (ports: ${PORT}, 4567)"

# Quick health check
sleep 1
HTTP_CODE=$(curl -so /dev/null -w '%{http_code}' http://127.0.0.1:${PORT}/ 2>/dev/null || echo "000")
echo "[Kotatsu] ✓ nginx check: HTTP ${HTTP_CODE}"

echo "============================================"
echo "[Kotatsu] ✓ Kotatsu Web is LIVE!"
echo "[Kotatsu]   http://0.0.0.0:${PORT}"
echo "============================================"

# Start Suwayomi (foreground — keeps container alive)
exec java ${JAVA_OPTS} -jar /app/suwayomi-server.jar
