<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Sprint Status

## Sprint 37 - Enriquecimiento de Datos (Completado 03/05/2026)
### ✅ Completado
- **queHacer países alto riesgo** - SD, AF, YE, SY, LY, HT: de 4 a 8-9 items cada uno

## Sprint 36 - Transparencia Operativa (Completado 03/05/2026)
### ✅ Completado
- **Página /transparencia** - Server Component con estado en tiempo real de fuentes de datos y crons
- **API cron/status** - Verificada, tabla `scraper_logs` responde correctamente
- **Footer enlace** - Añadido "Transparencia" en sección Legal + Info
- **UI mejorada** - Textos "Programado" y "Sin ejecutar aún" para estado inicial, horarios visibles

## Sprint 35 - Reviews & Social Proof (Completado 02/05/2026)
### ✅ Completado
- **Reviews table** - Supabase migration (`sprint-35-reviews.sql`), RLS policies
- **API reviews** - Route actualizada para leer/escribir en Supabase
- **Testimonios UI** - Stats bar + carousel en homepage, trust badges en premium page
- **Fix /destinos para países no-España** - Eliminadas rutas españolas para MA, FR, IT, PT, JP

## SEO Audit Fixes (02/05/2026)
### ✅ Completado
- **P1: Blog SSR** - Convertido blog/page.tsx a Server Component con BlogClient.tsx
- **P1: Sitemap** - Eliminado public/sitemap.xml estático
- **P2: Idioma queNoHacer** - Traducidos ~80 strings en inglés a español

## Sprint 33 - Críticos (Completado)
### ✅ Completado
- **Favoritos**: Fix eliminar, añadir, contador
- **Cuba**: Bloqueo total (404, picker, favs, static params)
- **/rutas**: Suspense wrapper para useSearchParams
- **/blog**: Error boundary + loading.tsx
- **RSS URL unificado** - Dominio canónico en todas las URLs
- **Coherencia países** - Stats dinámico desde Supabase
- **Fix itinerarios genéricos** - 5 perfiles, 35 países, activity pools

## Technical Notes
- Supabase URL: `https://nczkvsnuafkwtmgokiuo.supabase.co`
- Service Worker: `public/sw.js` v4 (no cachea `/api/` ni auth headers)
- Auth cookie: formato `base64-` requiere decode en API routes
- Singleton Supabase client: `src/lib/supabase-browser.ts`
- Branch `dev` existe para development, `main` es producción
- Blog posts: frontmatter soporta `image`, `excerpt`, `description`, `tags`, `keywords`
- Featured posts en /blog: primeros 2 posts se muestran como cards grandes con imagen
- Homepage order: Planificador → "Qué es Viaje Inteligencia" CTA → MapaMundial → Memoria → KPIs → Checklist → Newsletter → Testimonios

### ✅ Completado
- **Reviews migration**: Tabla `reviews` creada en Supabase con RLS policies. Seed data eliminado (reseñas no reales borradas).
- **Social publish log**: Tabla `social_publish_log` creada para tracking de posts publicados.
- **Admin dashboard**: Acciones para disparar crons y publicar posts en redes sociales.
- **Tokens limpios**: Env vars en Vercel, .env.local en gitignore, script lee de env.
- **Blog categories**: 3 posts sin categoría → añadidas (Estrategia, Ahorro, Seguridad).
- **Homepage CTA**: Post destacado "Qué es Viaje Inteligencia" primero en home.

## Way Ahead — Plan próximo día

### 📊 Data
- [ ] Verificar que crons MAEC se ejecuten mañana a las 6:00 AM (primer run tras añadir CRON_SECRET)

### 🏗️ Features
- [ ] España Premium itinerarios module
- [ ] Schema.org server-side en blog posts (mover de client useEffect a server component)
- [ ] Imágenes blog → webp + lazy loading

### 🔧 Ops
- [ ] Verificar ejecución de crons en admin dashboard tras primer run automático
- [ ] Monitorizar página /transparencia para confirmar que muestra datos reales tras cron

### 🧪 QA
- [ ] Verificar posts publicados a social desde admin dashboard
- [ ] Verificar blog search + paginación en producción

### ⚡ Pendiente manual
- [ ] Enviar sitemap a Google Search Console
