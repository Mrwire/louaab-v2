#!/bin/bash
echo "🔄 Switching to DEV MODE..."

# Stop existing process
pm2 stop louaab-frontend || true
pm2 delete louaab-frontend || true

# Start in Dev Mode (with Turbopack for speed)
# We use --name to keep it identifiable
pm2 start npm --name "louaab-frontend" --cwd "/root/louaab-project" -- run dev

echo "✅ Server is now in DEV MODE."
echo "   - Changes will apply instantly when files are uploaded."
echo "   - Performance might be slower than Prod."
echo "   - Run ./switch-to-prod.sh to go back to production."
