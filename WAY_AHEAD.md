# Way Ahead

## Última sesión: 06 May 2026

### Newsletter — Double Opt-in implementado
- **Antes**: `verified: true` inmediato, sin confirmación email
- **Ahora**: `verified: false` al suscribirse → email de confirmación con link → `verified: true` al hacer click
- **Rate limit**: 1 sub/email/hora vía localStorage
- **Unsubscribe**: Soporte doble — token-based (pendientes) y email-based (verificados con token borrado)
- **Weekly digest**: Ya filtra por `verified: true` — corregido unsubscribe link para verificados

### Reclamaciones — Página `/reclamaciones` creada
- **Gratis**: Plantilla genérica con campos básicos, copiar al portapapeles
- **Premium**: Documento formal con datos personales, fundamentos de derecho, referencias legales específicas por tipo (8 tipos de reclamación), sección de documentación adjunta
- Toggle Free/Premium en el formulario
- CTA para trial gratuito si no es Premium
- QuickAccess actualizado a `/reclamaciones`

### Sistema de Autenticación (Supabase Auth)

**Proveedor**: Supabase Auth (`@supabase/ssr`)

#### Métodos de registro/login

| Método | Función | Flujo | Estado |
|---|---|---|---|
| **Magic Link** | `signInWithOtp()` | Email → enlace mágico → redirect `/auth/callback?next=/dashboard` | ✅ Activo |
| **Email + Contraseña** | `signInWithPassword()` | Login directo con email + password | ✅ Activo |
| **Registro con contraseña** | `signUpWithPassword()` | Crea cuenta + redirect al callback | ✅ Activo |
| **Telegram** | `signInWithOtp()` (email fake `telegram_${id}@viaje-inteligencia.app`) | Bot envía OTP, login vía email falso | ✅ Activo |
| **Reset password** | `resetPasswordForEmail()` | Email con link → `/auth/callback?reset=true` | ✅ Activo |
| **Update password** | `updateUser({ password })` | Desde dashboard tras reset | ✅ Activo |

#### Componentes clave

| Archivo | Rol |
|---|---|
| `src/contexts/AuthContext.tsx` | Provider con `useAuth()` hook, expone todos los métodos |
| `src/components/LoginButton.tsx` | Modal flotante con toggle "Contraseña" / "Magic link" |
| `src/app/auth/callback/route.ts` | Server route handler para OAuth/magic link callback |

#### UI del LoginButton
- Modal con toggle 2 modos: **Con contraseña** (default) vs **Magic link**
- Campo email siempre visible, password solo en modo contraseña
- Link a `/free-trial` para nuevos usuarios
- Usuario logueado → botón de logout (icono o texto según variant)
- Variantes: `button` (default), `icon` (solo ícono User/LogOut)
- Sizes: `sm`, `md`, `lg`

#### Notas
- No hay Google OAuth, Apple, ni social login implementado
- Telegram usa truco de email fake + OTP de Supabase
- Redirect tras login siempre va a `/dashboard`
- Sesiones manejadas por Supabase (JWT + cookie SSR)

### Completado
- **Chat IA página `/chat`** — UI completa tipo ChatGPT con sugerencias, markdown, y selector de modelo
- **Rate limiting** — 5 mensajes/día gratis vía localStorage, contador visual
- **Modelo dual** — Free: `llama-3.1-8b-instant` / Premium: `llama-3.3-70b-versatile`
- **API `/api/ai/chat`** — Soporte para parámetro `model` dinámico
- **groq-ai.ts** — `chatWithAI()` acepta `model` en context
- **Premium page** — Nueva sección "Chat IA: Gratis vs Premium", FAQ actualizado con 2 preguntas nuevas
- **Widget AITravelAssistant** — Link actualizado a `/chat`
- **QuickAccess** — Chat IA apunta a `/chat`
- **`.env.example`** — Agregado `GROQ_API_KEY`

### Deployed
- Commit `d54a13a` pushed to `main`
- Vercel deployando

### Pendiente (próxima sesión)
1. **Verificar deploy** — Confirmar que `/chat` funciona en producción
2. **Probar Chat IA** — Enviar mensajes, verificar rate limit (5/día), markdown rendering
3. **Integrar con Stripe** — Detectar si usuario es Premium real para desbloquear modelo 70b (ahora cualquiera puede cambiar a "Premium" en UI sin backend check)
4. **Autenticación Supabase** — Vincular rate limit a usuario logueado (no solo localStorage)
5. **Historial de chat** — Guardar conversaciones en Supabase para usuarios Premium
6. **SEO** — Verificar que `/chat` aparece en Google Search Console
7. **Imagen optimization** — `logo.png` 1.8MB, fotos en `public/photos/` — comprimir o usar `<Image>`
8. **Admin dashboard** — Link `/chat` ahora existe, actualizar estado de "no-existe" a "activo"

### Notas técnicas
- `react-markdown@10.1.0` + `remark-gfm@4.0.1` ya instalados
- Groq free tier: ~30K tokens/min, suficiente para tráfico actual
- Rate limit actual es client-side (fácil de burlar). Necesita server-side enforcement cuando se integre Stripe
