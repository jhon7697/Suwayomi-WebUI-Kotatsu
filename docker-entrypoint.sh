#!/bin/sh
set -e

PORT="${PORT:-4567}"
SUWAYOMI_PORT="4568"

echo "============================================"
echo "[Kotatsu] Starting Kotatsu Web"
echo "============================================"

# Create Suwayomi data dir
mkdir -p /home/suwayomi/.local/share/Tachidesk

# Write Suwayomi config — disable its WebUI entirely
cat > /home/suwayomi/.local/share/Tachidesk/server.conf << CONF
server {
    port = ${SUWAYOMI_PORT}
    webUIEnabled = false
    initialOpenInBrowserEnabled = false
    systemTrayEnabled = false
}
CONF

# Write nginx config — serve Kotatsu WebUI + proxy API to Suwayomi
cat > /tmp/nginx.conf << NGINXCONF
worker_processes auto;
pid /tmp/nginx.pid;
error_log /tmp/nginx-error.log warn;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    access_log /tmp/nginx-access.log;
    
    sendfile on;
    keepalive_timeout 65;
    client_max_body_size 100M;
    
    # Temp paths (running as non-root)
    client_body_temp_path /tmp/nginx-client-body;
    proxy_temp_path /tmp/nginx-proxy;
    fastcgi_temp_path /tmp/nginx-fastcgi;
    uwsgi_temp_path /tmp/nginx-uwsgi;
    scgi_temp_path /tmp/nginx-scgi;

    server {
        listen ${PORT};
        server_name _;

        # Serve Kotatsu WebUI static files
        root /home/suwayomi/kotatsu-webui;
        index index.html;

        # API & GraphQL → proxy to Suwayomi
        location /api/ {
            proxy_pass http://127.0.0.1:${SUWAYOMI_PORT};
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_connect_timeout 300s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
        }

        # GraphQL endpoint
        location /api/graphql {
            proxy_pass http://127.0.0.1:${SUWAYOMI_PORT};
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_connect_timeout 300s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
        }

        # WebSocket support for subscriptions
        location /api/graphql/subscription {
            proxy_pass http://127.0.0.1:${SUWAYOMI_PORT};
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
        }

        # Manga images/thumbnails
        location /api/v1/ {
            proxy_pass http://127.0.0.1:${SUWAYOMI_PORT};
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_cache_valid 200 7d;
        }

        # SPA fallback — serve index.html for all other routes
        location / {
            try_files \$uri \$uri/ /index.html;
        }
    }
}
NGINXCONF

# Verify Kotatsu WebUI exists
if [ -f "/home/suwayomi/kotatsu-webui/index.html" ]; then
    FILE_COUNT=$(find /home/suwayomi/kotatsu-webui -type f | wc -l)
    echo "[Kotatsu] ✓ WebUI verified: ${FILE_COUNT} files"
else
    echo "[Kotatsu] ✗ ERROR: index.html not found!"
    ls -la /home/suwayomi/kotatsu-webui/ 2>/dev/null || echo "  (directory missing)"
    exit 1
fi

# Start Suwayomi-Server in background (API only, no WebUI)
echo "[Kotatsu] Starting Suwayomi-Server (API on port ${SUWAYOMI_PORT})..."
java ${JAVA_OPTS} \
    -Dsuwayomi.server.port="${SUWAYOMI_PORT}" \
    -Dsuwayomi.server.webUIEnabled=false \
    -Dsuwayomi.server.initialOpenInBrowserEnabled=false \
    -Dsuwayomi.server.systemTrayEnabled=false \
    -jar /home/suwayomi/suwayomi-server.jar &

SERVER_PID=$!

# Start nginx (serves our Kotatsu WebUI)
echo "[Kotatsu] Starting nginx (Kotatsu WebUI on port ${PORT})..."
nginx -c /tmp/nginx.conf &
NGINX_PID=$!

echo "============================================"
echo "[Kotatsu] ✓ Kotatsu Web is live!"
echo "[Kotatsu]   WebUI:  http://0.0.0.0:${PORT}"
echo "[Kotatsu]   API:    http://0.0.0.0:${SUWAYOMI_PORT}"
echo "============================================"

# Handle shutdown gracefully
trap "kill $NGINX_PID $SERVER_PID 2>/dev/null; exit 0" INT TERM

# Wait for either process to exit
wait $SERVER_PID $NGINX_PID
