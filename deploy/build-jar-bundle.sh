#!/bin/bash
# ============================================
# Kotatsu Web - JAR Bundle Builder
# Creates a standalone bundle with Suwayomi-Server + Kotatsu WebUI
# Requirements: Node.js 24+, pnpm, curl, Java 21+
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_DIR/dist-bundle"

echo "🦞 Building Kotatsu Web JAR Bundle"
echo "===================================="

# Step 1: Build WebUI
echo "[1/3] Building WebUI..."
cd "$PROJECT_DIR"
pnpm install --frozen-lockfile || pnpm install
pnpm build

# Step 2: Download Suwayomi-Server
echo "[2/3] Downloading latest Suwayomi-Server..."
mkdir -p "$BUILD_DIR"

DOWNLOAD_URL=$(curl -s https://api.github.com/repos/Suwayomi/Suwayomi-Server/releases/latest \
    | grep -oP '"browser_download_url":\s*"\K[^"]+\.jar' | head -1)

echo "  → $DOWNLOAD_URL"
curl -L -o "$BUILD_DIR/suwayomi-server.jar" "$DOWNLOAD_URL"

# Step 3: Bundle WebUI into output
echo "[3/3] Bundling..."
cp -r "$PROJECT_DIR/build" "$BUILD_DIR/webui"

# Create run script
cat > "$BUILD_DIR/run.sh" << 'RUNEOF'
#!/bin/bash
# Kotatsu Web - Run Script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TACHIDESK_DIR="${TACHIDESK_DIR:-$HOME/.local/share/Tachidesk}"
WEBUI_DIR="$TACHIDESK_DIR/webUI/Suwayomi-WebUI"

# Link WebUI
mkdir -p "$(dirname "$WEBUI_DIR")"
[ -d "$WEBUI_DIR" ] && [ ! -L "$WEBUI_DIR" ] && rm -rf "$WEBUI_DIR"
[ ! -L "$WEBUI_DIR" ] && ln -sf "$SCRIPT_DIR/webui" "$WEBUI_DIR"

echo "🦞 Starting Kotatsu Web on http://localhost:${PORT:-4567}"
exec java \
    ${JAVA_OPTS:--Xmx512m} \
    -Dsuwayomi.server.webUIEnabled=true \
    -Dsuwayomi.server.webUIFlavor=Custom \
    -Dsuwayomi.server.webUIInterface=browser \
    -Dsuwayomi.server.port="${PORT:-4567}" \
    -Dsuwayomi.server.systemTrayEnabled=false \
    -jar "$SCRIPT_DIR/suwayomi-server.jar"
RUNEOF
chmod +x "$BUILD_DIR/run.sh"

# Create Windows run script
cat > "$BUILD_DIR/run.bat" << 'BATEOF'
@echo off
echo Starting Kotatsu Web on http://localhost:4567
java -Xmx512m -Dsuwayomi.server.webUIEnabled=true -Dsuwayomi.server.webUIFlavor=Custom -Dsuwayomi.server.webUIInterface=browser -Dsuwayomi.server.port=4567 -Dsuwayomi.server.systemTrayEnabled=false -jar "%~dp0suwayomi-server.jar"
BATEOF

echo ""
echo "============================================"
echo "🦞 Bundle ready at: $BUILD_DIR"
echo ""
echo "   Contents:"
echo "   - suwayomi-server.jar (Suwayomi Server)"
echo "   - webui/ (Kotatsu WebUI)"
echo "   - run.sh (Linux/Mac launcher)"
echo "   - run.bat (Windows launcher)"
echo ""
echo "   To run: cd $BUILD_DIR && ./run.sh"
echo "============================================"
