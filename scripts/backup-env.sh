#!/bin/bash
# =============================================================================
# Backup de Variables de Entorno - Viaje con Inteligencia
# =============================================================================
# Este script crea un backup de las variables de entorno del proyecto
# Útil para mantener un registro de las variables configuradas
# =============================================================================

PROJECT_DIR="/home/miguelc/viaje-con-inteligencia"
BACKUP_FILE="$PROJECT_DIR/env_backup_$(date +%Y%m%d_%H%M%S).txt"

echo "=========================================="
echo "  Backup de Variables de Entorno"
echo "=========================================="
echo ""

# Variables a documentar (ordenadas por categoría)
cat > "$BACKUP_FILE" << 'EOF'
# =============================================================================
# BACKUP DE VARIABLES DE ENTORNO
# Viaje con Inteligencia
# Fecha: DATE_PLACEHOLDER
# =============================================================================
# ⚠️  INSTRUCCIONES:
# 1. Este archivo contiene TODAS las variables necesarias
# 2. Rellena los valores desde tu gestor de secretos (1Password, Bitwarden, etc.)
# 3. NO subas este archivo a GitHub (está en .gitignore)
# 4. Configura las variables en Vercel Dashboard
# =============================================================================

EOF

# Reemplazar fecha
sed -i "s/DATE_PLACEHOLDER/$(date +%Y-%m-%d\ %H:%M:%S)/" "$BACKUP_FILE"

# Añadir secciones
cat >> "$BACKUP_FILE" << 'EOF'

# =============================================================================
# 🔧 CORE - SUPABASE
# =============================================================================
# Obtener de: Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...ANON_KEY...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...SERVICE_KEY...

# =============================================================================
# 🔐 CRON JOBS
# =============================================================================
# Generar con: openssl rand -base64 32
CRON_SECRET=TU_CRON_SECRET_AQUI

# =============================================================================
# 📧 EMAIL - RESEND
# =============================================================================
# Obtener de: https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxx

# URL base del sitio
APP_BASE_URL=https://www.viajeinteligencia.com

# =============================================================================
# 📱 TELEGRAM
# =============================================================================
# Obtener de: @BotFather
TELEGRAM_BOT_TOKEN=1234567890:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw

# ID del canal (buscar en Telegram: @username_to_id_bot)
TELEGRAM_CHANNEL_ID=-1003764932977

# =============================================================================
# 🤖 AI - GROQ
# =============================================================================
# Obtener de: https://console.groq.com/keys
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx

# =============================================================================
# 💳 STRIPE (PAGOS)
# =============================================================================
# Obtener de: Stripe Dashboard → Developers → API Keys
# NOTA: Los valores de Stripe comienzan con sk_live_, pk_live_, whsec_, price_
# Introduce los valores reales desde tu gestor de contraseñas
STRIPE_SECRET_KEY=sk_live_XXXXX
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXX

# Obtener de: Stripe Dashboard → Webhooks
STRIPE_WEBHOOK_SECRET=whsec_XXXXX

# Obtener de: Stripe Dashboard → Products
STRIPE_PRICE_MONTHLY=price_XXXXX
STRIPE_PRICE_YEARLY=price_XXXXX

# =============================================================================
# ☁️ CLOUDFLARE (Opcional)
# =============================================================================
CF_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CF_EMAIL=tu@email.com
CF_ZONE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CF_DOMAIN=viajeinteligencia.com

# =============================================================================
# ✈️ APIS EXTERNAS (Opcional)
# =============================================================================
# AviationStack: https://aviationstack.com
AVIATIONSTACK_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx

# FlightLabs: https://flightlabs.com
FLIGHTLABS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx

# GNews: https://gnews.io
GNEWS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx

# OpenWeather: https://openweathermap.org/api
OPENWEATHER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx

# =============================================================================
# 📲 PWA PUSH NOTIFICATIONS (Opcional)
# =============================================================================
# Generar con: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U
VAPID_PRIVATE_KEY=UUxI4O8-FbRouAf7-7OTt9GH4o-7r8-h8dI5p7i7ZMw
VAPID_EMAIL=mailto:tu@email.com

# =============================================================================
# 🌐 URL DEL SITIO
# =============================================================================
NEXT_PUBLIC_SITE_URL=https://www.viajeinteligencia.com
NEXT_PUBLIC_URL=https://viaje-con-inteligencia.vercel.app

EOF

echo "✅ Backup creado: $BACKUP_FILE"
echo ""

# Verificar que el backup se creó
if [ -f "$BACKUP_FILE" ]; then
    echo "📄 Contenido del backup:"
    echo "   - $(wc -l < "$BACKUP_FILE") líneas"
    echo ""
    echo "⚠️  ACCIONES RECOMENDADAS:"
    echo "   1. Copia el contenido a tu gestor de contraseñas"
    echo "   2. Configura las variables en Vercel Dashboard"
    echo "   3. Guarda este backup en un lugar seguro"
    echo ""
    echo "🔒 Este archivo está ignorado por Git (ver .gitignore)"
else
    echo "❌ Error al crear el backup"
    exit 1
fi