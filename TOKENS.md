# TOKENS - Estado Actual del Proyecto

## ✅ CONFIGURADAS (funcionan)

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://nczkvsnuafkwtmgokiuo.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` |
| `TELEGRAM_BOT_TOKEN` | `8759369996:AAGsrx0...` |
| `TELEGRAM_CHANNEL_ID` | `-1003910098382` |
| `GROQ_API_KEY` | `gsk_o8CAie...` |
| `GNEWS_API_KEY` | `7c8abf27...` |
| `CRON_SECRET` | `lS+/mhOp...` |
| `NEXT_PUBLIC_BASE_URL` | `https://www.viajeinteligencia.com` |

---

## ⚠️ VACÍAS (las 11 que necesitan valor)

| Variable | Dónde encontrarla | Dónde ponerla |
|----------|-------------------|---------------|
| **`SUPABASE_SERVICE_ROLE_KEY`** | Supabase → Settings → API → `service_role` secret key | Vercel |
| **`MASTODON_ACCESS_TOKEN`** | Mastodon → Settings → Development → New Application → Access Token | Vercel |
| **`RESEND_API_KEY`** | Resend → API Keys → Create | Vercel |
| **`NEXT_PUBLIC_SITE_URL`** | `https://www.viajeinteligencia.com` (fijo) | Vercel |
| **`STRIPE_SECRET_KEY`** | Stripe → Developers → API keys → Secret key | Vercel |
| **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`** | Stripe → Developers → API keys → Publishable key | Vercel |
| **`STRIPE_WEBHOOK_SECRET`** | Stripe → Developers → Webhooks → endpoint signing secret | Vercel |
| **`STRIPE_PRICE_MONTHLY`** | Stripe → Products → monthly price ID | Vercel |
| **`STRIPE_PRICE_YEARLY`** | Stripe → Products → yearly price ID | Vercel |
| **`VAPID_EMAIL`** | email de contacto (ej: admin@viajeinteligencia.com) | Vercel |
| **`VAPID_PRIVATE_KEY`** | Generar con `web-push generate-vapid-keys` o en [web-push-codelab](https://web-push-codelab.glitch.me/) | Vercel |
| **`NEXT_PUBLIC_VAPID_PUBLIC_KEY`** | El public key que genera el mismo comando anterior | Vercel |

---

## 🔥 URGENTE (bloquea funcionalidad ahora)

| Variable | Impacto |
|----------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ Crear viajes, favoritos y todo lo que usa RLS |

**Lo demás puede esperar** — Stripe, Mastodon y VAPID son features futuras.

---

## 📋 Para Supabase (1 SQL, no es token)

Ejecutar en SQL Editor de Supabase:
```sql
ALTER TABLE public.trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;
```
Esto elimina el bloqueo RLS y soluciona el problema de "new row violates row-level security policy".
