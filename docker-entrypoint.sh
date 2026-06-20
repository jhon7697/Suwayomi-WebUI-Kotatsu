#!/bin/sh
set -e

TACHIDESK_ROOT="/home/suwayomi/.local/share/Tachidesk"
WEBUI_TARGET="${TACHIDESK_ROOT}/webUI/Suwayomi-WebUI"
KOTATSU_SOURCE="/home/suwayomi/kotatsu-webui"

# ============================================
# Replace Suwayomi default WebUI with Kotatsu
# This runs every startup to ensure our UI
# is always in place (even if volume was reset)
# ============================================

mkdir -p "${TACHIDESK_ROOT}/webUI"

# Remove any existing/default Suwayomi WebUI
if [ -d "${WEBUI_TARGET}" ]; then
    rm -rf "${WEBUI_TARGET}"
    echo "[Kotatsu] Removed default Suwayomi WebUI"
fi

# Copy Kotatsu WebUI into position
cp -r "${KOTATSU_SOURCE}" "${WEBUI_TARGET}"
echo "[Kotatsu] Installed Kotatsu WebUI"

# Write server config (prevents re-download of default WebUI)
cat > "${TACHIDESK_ROOT}/server.conf" << 'CONF'
server {
    webUIEnabled = true
    webUIChannel = "bundled"
    webUIUpdateCheckInterval = 0
    initialOpenInBrowserEnabled = false
    systemTrayEnabled = false
}
CONF
echo "[Kotatsu] Server config written"

echo "[Kotatsu] Starting on http://0.0.0.0:${PORT:-4567}"

exec java \
    ${JAVA_OPTS} \
    -Dsuwayomi.server.port="${PORT:-4567}" \
    -jar /home/suwayomi/suwayomi-server.jar
