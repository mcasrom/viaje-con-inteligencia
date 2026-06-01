#!/bin/bash
set -e
cd /var/www/viajeinteligencia
git reset --hard HEAD
git pull
rm -rf .next
NODE_OPTIONS="--max-old-space-size=4096" npx next build
pm2 restart viajeinteligencia
echo Deploy completado OK
source ~/.bash_profile 2>/dev/null; curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}' && echo "Cache purgado OK"
