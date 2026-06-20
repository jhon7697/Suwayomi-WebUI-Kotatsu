#!/bin/sh
set -e

TACHIDESK_ROOT="/home/suwayomi/.local/share/Tachidesk"
WEBUI_TARGET="${TACHIDESK_ROOT}/webUI/Suwayomi-WebUI"
KOTATSU_SOURCE="/home/suwayomi/kotatsu-webui"

echo "============================================"
echo "[Kotatsu] Starting Kotatsu Web Setup"
echo "============================================"

# Create data directory
mkdir -p "${TACHIDESK_ROOT}/webUI"

# ============================================
# CRITICAL: Write server.conf BEFORE first start
# - webUIChannel must NOT be "bundled" (that extracts default UI from JAR)
# - webUIUpdateCheckInterval = 0 prevents downloading default UI
# - webUIFlavor = "Suwayomi-WebUI" matches our target directory
# ============================================
cat > "${TACHIDESK_ROOT}/server.conf" << 'CONF'
server {
    webUIEnabled = true
    webUIFlavor = "Suwayomi-WebUI"
    webUIChannel = "stable"
    webUIUpdateCheckInterval = 0
    initialOpenInBrowserEnabled = false
    systemTrayEnabled = false
}
CONF
echo "[Kotatsu] ✓ Server config written (auto-download DISABLED)"

# ============================================
# CRITICAL: Remove ANY existing WebUI and install Kotatsu
# This must happen EVERY startup to overwrite defaults
# ============================================
if [ -d "${WEBUI_TARGET}" ]; then
    rm -rf "${WEBUI_TARGET}"
    echo "[Kotatsu] ✓ Removed existing WebUI"
fi

# Verify our Kotatsu build exists
if [ ! -d "${KOTATSU_SOURCE}" ]; then
    echo "[Kotatsu] ERROR: Kotatsu WebUI build not found at ${KOTATSU_SOURCE}"
    exit 1
fi

FILE_COUNT=$(find "${KOTATSU_SOURCE}" -type f | wc -l)
echo "[Kotatsu] Source files: ${FILE_COUNT}"

cp -r "${KOTATSU_SOURCE}" "${WEBUI_TARGET}"
echo "[Kotatsu] ✓ Kotatsu WebUI installed (${FILE_COUNT} files)"

# Verify installation
if [ -f "${WEBUI_TARGET}/index.html" ]; then
    echo "[Kotatsu] ✓ index.html confirmed at ${WEBUI_TARGET}/index.html"
else
    echo "[Kotatsu] WARNING: index.html not found - listing directory:"
    ls -la "${WEBUI_TARGET}/" 2>/dev/null || echo "  (directory empty)"
fi

echo "============================================"
echo "[Kotatsu] Starting Suwayomi-Server"
echo "[Kotatsu] URL: http://0.0.0.0:${PORT:-4567}"
echo "============================================"

exec java \
    ${JAVA_OPTS} \
    -Dsuwayomi.server.port="${PORT:-4567}" \
    -Dsuwayomi.server.webUIEnabled=true \
    -Dsuwayomi.server.webUIFlavor="Suwayomi-WebUI" \
    -Dsuwayomi.server.webUIChannel="stable" \
    -Dsuwayomi.server.webUIUpdateCheckInterval=0 \
    -Dsuwayomi.server.initialOpenInBrowserEnabled=false \
    -Dsuwayomi.server.systemTrayEnabled=false \
    -jar /home/suwayomi/suwayomi-server.jar
