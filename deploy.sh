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
# 2. BUILD LOCAL
# =========================
echo ">>> Build local..."
npm run build
echo "✅ Build OK"

# =========================
# 3. RSYNC .next AL SERVIDOR
# =========================
echo ">>> Sincronizando .next con servidor..."
ssh deploy@178.105.80.193 "rm -rf /var/www/viajeinteligencia/.next"
rsync -az --delete .next/ deploy@178.105.80.193:/var/www/viajeinteligencia/.next/
echo "✅ Rsync OK"

# =========================
# 4. SYNC package.json + instalar si hace falta
# =========================
rsync -az package.json deploy@178.105.80.193:/var/www/viajeinteligencia/
ssh deploy@178.105.80.193 "cd /var/www/viajeinteligencia && npm install --omit=dev --silent"

# =========================
# 5. RESTART PM2
# =========================
ssh deploy@178.105.80.193 "pm2 restart viajeinteligencia"
echo "✅ PM2 OK"

# =========================
# 6. PURGA CLOUDFLARE
# =========================
echo ">>> Purgando Cloudflare..."
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}' && echo "Cache OK"

echo ">>> DEPLOY COMPLETADO OK"
