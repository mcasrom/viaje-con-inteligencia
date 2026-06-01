#!/bin/bash
set -e
cd /var/www/viajeinteligencia
git reset --hard HEAD
git pull
rm -rf .next
TURBOPACK=0 NODE_OPTIONS="--max-old-space-size=4096" npm run build
pm2 restart viajeinteligencia
echo Deploy completado OK
