#!/bin/bash
echo "🏭 Switching to PRODUCTION MODE..."

# Stop dev process
pm2 stop louaab-frontend || true
pm2 delete louaab-frontend || true

# Build
echo "🔨 Building project..."
npm run build

# Start in Prod Mode
pm2 start npm --name "louaab-frontend" -- run start

echo "✅ Server is now in PRODUCTION MODE."
echo "   - Optimized for performance."
echo "   - Changes require a rebuild."
