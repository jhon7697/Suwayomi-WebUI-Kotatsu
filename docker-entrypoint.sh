#!/bin/sh
set -e

TACHIDESK_ROOT="/home/suwayomi/.local/share/Tachidesk"
WEBUI_TARGET="${TACHIDESK_ROOT}/webUI/Suwayomi-WebUI"
KOTATSU_SOURCE="/home/suwayomi/kotatsu-webui"
PORT="${PORT:-4567}"

echo "============================================"
echo "[Kotatsu] Kotatsu Web Startup"
echo "============================================"

mkdir -p "${TACHIDESK_ROOT}"

# Verify Kotatsu build exists
if [ ! -d "${KOTATSU_SOURCE}" ] || [ ! -f "${KOTATSU_SOURCE}/index.html" ]; then
    echo "[Kotatsu] ERROR: Kotatsu WebUI build not found!"
    ls -la "${KOTATSU_SOURCE}/" 2>/dev/null || echo "  (directory missing)"
    echo "[Kotatsu] Falling back to default Suwayomi WebUI"
    exec java ${JAVA_OPTS} -Dsuwayomi.server.port="${PORT}" -jar /home/suwayomi/suwayomi-server.jar
fi

FILE_COUNT=$(find "${KOTATSU_SOURCE}" -type f | wc -l)
echo "[Kotatsu] Kotatsu build verified: ${FILE_COUNT} files"

# ============================================
# Strategy: Start Suwayomi (it extracts default UI),
# then immediately replace with Kotatsu.
# The server serves static files from disk so
# replacing them takes effect immediately.
# ============================================

# Start Suwayomi in background
echo "[Kotatsu] Starting Suwayomi-Server in background..."
java ${JAVA_OPTS} \
    -Dsuwayomi.server.port="${PORT}" \
    -Dsuwayomi.server.webUIEnabled=true \
    -Dsuwayomi.server.webUIChannel=bundled \
    -Dsuwayomi.server.webUIUpdateCheckInterval=0 \
    -Dsuwayomi.server.initialOpenInBrowserEnabled=false \
    -Dsuwayomi.server.systemTrayEnabled=false \
    -jar /home/suwayomi/suwayomi-server.jar &

SERVER_PID=$!

# Wait for server to be ready (max 120 seconds)
echo "[Kotatsu] Waiting for server to start..."
TRIES=0
MAX_TRIES=120
while [ $TRIES -lt $MAX_TRIES ]; do
    if curl -sf "http://localhost:${PORT}/api/graphql" -X POST \
        -H "Content-Type: application/json" \
        -d '{"query":"{ aboutServer { name } }"}' > /dev/null 2>&1; then
        echo "[Kotatsu] ✓ Server is ready (took ${TRIES}s)"
        break
    fi
    
    # Check if server process died
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        echo "[Kotatsu] ERROR: Server process died"
        exit 1
    fi
    
    TRIES=$((TRIES + 1))
    sleep 1
done

if [ $TRIES -ge $MAX_TRIES ]; then
    echo "[Kotatsu] WARNING: Server didn't respond in ${MAX_TRIES}s, replacing WebUI anyway"
fi

# Small extra delay to ensure WebUI extraction is complete
sleep 2

# ============================================
# NOW replace the default WebUI with Kotatsu
# ============================================
echo "[Kotatsu] Replacing default Suwayomi WebUI with Kotatsu..."

if [ -d "${WEBUI_TARGET}" ]; then
    rm -rf "${WEBUI_TARGET}"
    echo "[Kotatsu] ✓ Removed default WebUI"
fi

cp -r "${KOTATSU_SOURCE}" "${WEBUI_TARGET}"

if [ -f "${WEBUI_TARGET}/index.html" ]; then
    echo "[Kotatsu] ✓ Kotatsu WebUI installed successfully!"
    echo "[Kotatsu] ✓ ${FILE_COUNT} files at ${WEBUI_TARGET}"
else
    echo "[Kotatsu] ERROR: Installation failed - index.html missing"
fi

# Write config to prevent future re-downloads
cat > "${TACHIDESK_ROOT}/server.conf" << 'CONF'
server {
    webUIEnabled = true
    webUIChannel = "bundled"
    webUIUpdateCheckInterval = 0
    initialOpenInBrowserEnabled = false
    systemTrayEnabled = false
}
CONF

echo "============================================"
echo "[Kotatsu] ✓ Kotatsu Web is live!"
echo "[Kotatsu] URL: http://0.0.0.0:${PORT}"
echo "============================================"

# Forward signals to server process
trap "kill $SERVER_PID 2>/dev/null" INT TERM

# Wait for server process
wait $SERVER_PID
