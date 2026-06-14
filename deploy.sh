#!/bin/bash
set -e

source ~/.cf_env
cd ~/viaje-con-inteligencia

# =========================
# 1. CHECK GIT LOCAL
# =========================
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ ERROR: Hay cambios sin commitear"
  git status --short
  exit 1
fi

git fetch origin main --quiet

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
  echo "❌ ERROR: Falta git push a GitHub"
  exit 1
fi

echo "✅ Git OK"

# =========================
# 2. DEPLOY EN SERVIDOR (BUILD ALL REMOTO)
# =========================
echo ">>> Deploy en servidor..."

ssh deploy@178.105.80.193 "
set -e
cd /var/www/viajeinteligencia

git fetch origin main
git reset --hard origin/main
git clean -fd

npm install
npm run build

pm2 restart viajeinteligencia
"

# =========================
# 3. PURGA CLOUDFLARE
# =========================
echo ">>> Purgando Cloudflare..."

curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}' && echo "Cache OK"

echo ">>> DEPLOY COMPLETADO OK"
