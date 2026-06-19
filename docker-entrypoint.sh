#!/bin/sh
set -e

TACHIDESK_ROOT="/home/suwayomi/.local/share/Tachidesk"
WEBUI_DIR="${TACHIDESK_ROOT}/webUI/Suwayomi-WebUI"

# Link our built Kotatsu WebUI into Suwayomi's expected location
mkdir -p "$(dirname "$WEBUI_DIR")"
if [ ! -L "$WEBUI_DIR" ] && [ ! -d "$WEBUI_DIR" ]; then
    ln -sf /home/suwayomi/webui "$WEBUI_DIR"
    echo "[Kotatsu] Linked custom WebUI"
elif [ -d "$WEBUI_DIR" ] && [ ! -L "$WEBUI_DIR" ]; then
    rm -rf "$WEBUI_DIR"
    ln -sf /home/suwayomi/webui "$WEBUI_DIR"
    echo "[Kotatsu] Replaced default WebUI with Kotatsu"
fi

# Disable auto WebUI updates so our custom UI persists
export SUWAYOMI_WEBUI_UPDATE_CHECK_INTERVAL=0

echo "[Kotatsu] Starting Suwayomi-Server..."
echo "[Kotatsu] WebUI: http://localhost:4567"

exec java \
    ${JAVA_OPTS} \
    -Dsuwayomi.server.webUIEnabled=true \
    -Dsuwayomi.server.webUIFlavor=Custom \
    -Dsuwayomi.server.webUIInterface=browser \
    -Dsuwayomi.server.port="${PORT:-4567}" \
    -Dsuwayomi.server.systemTrayEnabled=false \
    -jar /home/suwayomi/suwayomi-server.jar
