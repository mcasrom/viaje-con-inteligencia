# Way Ahead

## Última sesión: 06 May 2026

### Completado
- **Chat IA página `/chat`** — UI completa tipo ChatGPT con sugerencias, markdown, y selector de modelo
- **Rate limiting** — 5 mensajes/día gratis vía localStorage, contador visual
- **Modelo dual** — Free: `llama-3.1-8b-instant` / Premium: `llama-3.1-70b-versatile`
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
