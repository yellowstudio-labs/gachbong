#!/bin/bash
# ============================================
# Gạch Bông - Deploy Script
# Run from your local machine to deploy updates
# ============================================

set -e

# ---- Configuration ----
SERVER_USER="${DEPLOY_USER:-root}"
SERVER_HOST="${DEPLOY_HOST:?Set DEPLOY_HOST env var (e.g. export DEPLOY_HOST=your-server-ip)}"
APP_DIR="/var/www/gachbong"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "🚀 Deploying Gạch Bông..."
echo "   Server: $SERVER_USER@$SERVER_HOST"
echo "   Project: $PROJECT_DIR"

# ---- Step 1: Install dependencies ----
echo "📦 Installing dependencies..."
cd "$PROJECT_DIR"
npm ci

# ---- Step 2: Build ----
echo "🔨 Building production bundle..."
npm run build

# ---- Step 3: Verify build output ----
if [ ! -d "$PROJECT_DIR/dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "📊 Build output:"
du -sh "$PROJECT_DIR/dist"
ls -la "$PROJECT_DIR/dist"

# ---- Step 4: Deploy via rsync ----
echo "📤 Syncing to server..."
rsync -avz --delete \
    --exclude='.DS_Store' \
    "$PROJECT_DIR/dist/" \
    "$SERVER_USER@$SERVER_HOST:$APP_DIR/"

# ---- Step 5: Fix permissions on server ----
echo "🔧 Fixing permissions..."
ssh "$SERVER_USER@$SERVER_HOST" "sudo chown -R www-data:www-data $APP_DIR"

# ---- Step 6: Reload Nginx (just in case) ----
echo "🔄 Reloading Nginx..."
ssh "$SERVER_USER@$SERVER_HOST" "sudo systemctl reload nginx"

echo ""
echo "✅ Deployment complete!"
echo "   🌐 https://gachbong.yellowstudio.vn"
