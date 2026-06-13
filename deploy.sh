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
# 2. BUILD LIMPIO
# =========================
echo ">>> Build local..."
rm -rf .next
npm run build

# =========================
# 3. RSYNC BUILD
# =========================
echo ">>> Subiendo build al servidor..."

rsync -az --delete \
  --exclude="cache" \
  --exclude="dev" \
  -e "ssh -p 22" \
  .next/ deploy@178.105.80.193:/var/www/viajeinteligencia/.next/

rsync -az -e "ssh -p 22" \
  public/ deploy@178.105.80.193:/var/www/viajeinteligencia/public/

# =========================
# 4. RESTART SERVER (FIX REAL)
# =========================
echo ">>> Reiniciando PM2..."

ssh deploy@178.105.80.193 "
cd /var/www/viajeinteligencia &&
git fetch origin main &&
git reset --hard origin/main &&
git clean -fd &&
pm2 restart viajeinteligencia
"

# =========================
# 5. PURGA CLOUDFLARE
# =========================
echo ">>> Purgando Cloudflare..."

curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
  -H "X-Auth-Email: ${CF_EMAIL}" \
  -H "X-Auth-Key: ${CF_API_KEY}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}' && echo "Cache OK"

echo ">>> DEPLOY COMPLETADO OK"
