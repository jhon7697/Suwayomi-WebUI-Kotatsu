#!/bin/bash
# ============================================
# Kotatsu Web - VPS Quick Install Script
# Run as root on Ubuntu/Debian VPS
# ============================================

set -e

echo "🦞 Kotatsu Web - VPS Installer"
echo "================================"

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "[1/4] Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    echo "[1/4] Docker already installed ✓"
fi

# Install Docker Compose plugin if not present
if ! docker compose version &> /dev/null; then
    echo "[2/4] Installing Docker Compose..."
    apt-get update && apt-get install -y docker-compose-plugin
else
    echo "[2/4] Docker Compose already installed ✓"
fi

# Create app directory
APP_DIR="/opt/kotatsu-web"
echo "[3/4] Setting up $APP_DIR..."
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Clone or pull the repo
if [ -d ".git" ]; then
    git pull
else
    git clone https://github.com/YOUR_USERNAME/kotatsu-web.git .
fi

# Build and start
echo "[4/4] Building and starting..."
docker compose up -d --build

echo ""
echo "============================================"
echo "🦞 Kotatsu Web is running!"
echo "   URL: http://$(hostname -I | awk '{print $1}'):4567"
echo ""
echo "   Commands:"
echo "   - View logs:    docker compose logs -f"
echo "   - Stop:         docker compose down"
echo "   - Restart:      docker compose restart"
echo "   - Update:       git pull && docker compose up -d --build"
echo "============================================"
