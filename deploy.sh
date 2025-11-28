#!/usr/bin/env bash
set -euo pipefail
cd /root/louaab-project

BRANCH=main

echo [deploy] pulling ...
git fetch origin  && git checkout  && git pull origin 

echo [deploy] npm install (skip if up-to-date)...
npm install --no-audit --no-fund

echo [deploy] build front...
npm run build

echo [deploy] restart pm2...
pm2 restart louaab-backend || true
pm2 restart louaab-frontend

echo [deploy] done.
