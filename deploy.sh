#!/bin/bash
set -e
source ~/.cf_env
cd ~/viaje-con-inteligencia

# Comprobar que no hay cambios sin commitear
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ ERROR: Hay cambios sin commitear. Haz git add + git commit + git push antes de deployar."
  git status --short
  exit 1
fi

# Comprobar que el local está sincronizado con origin
git fetch origin main --quiet
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
if [ "$LOCAL" != "$REMOTE" ]; then
  echo "❌ ERROR: Hay commits locales sin pushear a GitHub. Haz git push antes de deployar."
  exit 1
fi

echo "✅ Git limpio y sincronizado con GitHub"
echo ">>> Build local..."
npm run build
echo ">>> Subiendo .next al servidor..."
rsync -az --delete -e "ssh -p 22" .next/ deploy@178.105.80.193:/var/www/viajeinteligencia/.next/
echo ">>> Reiniciando PM2..."
ssh deploy@178.105.80.193 "cd /var/www/viajeinteligencia && git stash && git pull && git stash drop && pm2 restart viajeinteligencia"
echo ">>> Purgando Cloudflare..."
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}' && echo "Cache purgado OK"
echo ">>> Deploy completado OK"
