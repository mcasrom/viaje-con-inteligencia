# Variables de Entorno - Viaje con Inteligencia

## ⚠️ IMPORTANTE - LEER PRIMERO

Este documento lista TODAS las variables de entorno necesarias para el proyecto.
**Guarda este archivo en un lugar seguro** - no subas valores reales a GitHub.

---

## 📋 LISTADO COMPLETO DE VARIABLES

### 🔧 OBLIGATORIAS (Core)

| Variable | Descripción | Ejemplo | Dónde obtenerla |
|----------|-------------|---------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | `https://xxxxx.supabase.co` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anon de Supabase | `eyJhbGciOiJIUz...` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (admin) | `eyJhbGciOiJIUz...` | Supabase Dashboard → Settings → API |
| `CRON_SECRET` | Secret para ejecutar cron jobs | `generar con openssl rand -base64 32` | Generar localmente |

### 📧 EMAIL (Newsletter + Alerts)

| Variable | Descripción | Ejemplo | Dónde obtenerla |
|----------|-------------|---------|-----------------|
| `RESEND_API_KEY` | API key de Resend | `re_123456789` | https://resend.com → API Keys |
| `APP_BASE_URL` | URL base del sitio | `https://www.viajeinteligencia.com` | Tu dominio |

### 📱 TELEGRAM (Bot + Canal)

| Variable | Descripción | Ejemplo | Dónde obtenerla |
|----------|-------------|---------|-----------------|
| `TELEGRAM_BOT_TOKEN` | Token del bot | `1234567890:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw` | @BotFather |
| `TELEGRAM_CHANNEL_ID` | ID del canal | `-1003764932977` | Canal de Telegram |

### 🤖 AI (Groq - Chatbot)

| Variable | Descripción | Ejemplo | Dónde obtenerla |
|----------|-------------|---------|-----------------|
| `GROQ_API_KEY` | API key de Groq | `gsk_xxxxx` | https://console.groq.com/keys |

### 💳 STRIPE (Pagos - Premium)

| Variable | Descripción | Ejemplo | Dónde obtenerla |
|----------|-------------|---------|-----------------|
| `STRIPE_SECRET_KEY` | Clave secreta Stripe | `sk_live_xxxxx` | Stripe Dashboard → Developers → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave pública | `pk_live_xxxxx` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Secret para webhooks | `whsec_xxxxx` | Stripe Dashboard → Webhooks |
| `STRIPE_PRICE_MONTHLY` | ID precio mensual | `price_xxx` | Stripe Dashboard → Products |
| `STRIPE_PRICE_YEARLY` | ID precio anual | `price_xxx` | Stripe Dashboard → Products |

### ☁️ CLOUDFLARE (Dominio)

| Variable | Descripción | Valor esperado |
|----------|-------------|----------------|
| `CF_API_KEY` | API Key Cloudflare | Tu API key |
| `CF_EMAIL` | Email de Cloudflare | tu@email.com |
| `CF_ZONE_ID` | Zone ID de la cuenta | Zone ID |
| `CF_DOMAIN` | Dominio principal | `viajeinteligencia.com` |

### ✈️ APIS EXTERNAS (Opcional)

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `AVIATIONSTACK_API_KEY` | Estado de vuelos | https://aviationstack.com |
| `FLIGHTLABS_API_KEY` | Datos de vuelos | https://flightlabs.com |
| `GNEWS_API_KEY` | Noticias | https://gnews.io |
| `OPENWEATHER_API_KEY` | Clima | https://openweathermap.org/api |

### 📲 PWA (Push Notifications)

| Variable | Descripción | Cómo generarla |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Clave pública VAPID | `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Clave privada VAPID | Del mismo comando |
| `VAPID_EMAIL` | Email para VAPID | `mailto:tu@email.com` |

---

## 🚀 CÓMO CONFIGURAR EN VERCEL

1. Ve a: **Vercel Dashboard → Proyecto → Settings → Environment Variables**

2. Añade cada variable en formato `KEY=VALUE`

3. **Importante:** Para producción, añade las variables en el scope **"Production"**

---

## 🔄 SCRIPTS ÚTILES

### Generar CRON_SECRET
```bash
openssl rand -base64 32
```

### Generar claves VAPID
```bash
npx web-push generate-vapid-keys
```

### Listar variables actuales (local)
```bash
cd /home/miguelc/viaje-con-inteligencia
grep -r "process\.env\." src --include="*.ts" | grep -oP "process\.env\.\K[A-Z_]+" | sort -u
```

---

## 📝 NOTAS

- Las variables que empiezan por `NEXT_PUBLIC_` son públicas y se exponen al cliente
- Las variables sin `NEXT_PUBLIC_` son solo del servidor
- `CRON_SECRET` debe ser igual en Vercel y en cualquier cliente que quiera ejecutar los cron jobs manualmente
- El proyecto usa un `.env.example` como referencia - los valores reales deben estar en Vercel

---

*Última actualización: 2026-04-24*

curl -H "Authorization: Bearer TU_CRON_SECRET" \
  https://viaje-con-inteligencia.vercel.app/api/cron/daily-digest
