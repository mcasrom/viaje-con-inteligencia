<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Sprint Status

## SPRINT 33 - CRÍTICO (Completado 02/05/2026)
### ✅ Completado
- **Favoritos**: Fix eliminar, añadir, contador (Service Worker caching API, cache-busting)
- **Cuba**: Bloqueo total (page.tsx → 404, picker filtrado, favs filtrado, static params)
- **/rutas**: Suspense wrapper para useSearchParams
- **/blog**: Error boundary + loading.tsx

### ✅ NIVEL 2 (Completado)
1. **RSS URL unificado** - Reemplazado `vercel.app` por `NEXT_PUBLIC_SITE_URL` en checkout, promo, subscription, premium, dossier, telegram-bot
2. **Coherencia países** - Stats page consulta Supabase en tiempo real (`totalPaises` desde DB)
3. **GDPR notice newsletter** - Añadido enlace política de privacidad en formulario newsletter
4. **Eliminar "Próximamente"** - Ocultada sección de QuickAccess hasta implementar

### ✅ NIVEL 3 (Completado)
- **Añadir países MAEC alto riesgo faltantes** - Sudán, Afganistán, Yemen, Siria, Libia, Haití (106 países total, nivel `muy-alto`)
- **Documentar clustering ML públicamente** - README.md: sección dedicada con algoritmo K-Means, features (riskScore, IPC, distancia, arrivals), endpoints API, y código fuente
- Testimonios / prueba social
- España Premium itinerarios module
- **Fix itinerarios genéricos** - Reescrito `generateItinerary()` con 5 perfiles de preferencia (cultural, playa, naturaleza, familiar, gastronomia), 7-8 actividades/día con horarios, rutas multi-ciudad (35 países con ciudades específicas), activity pools de 15+ actividades por categoría, tips contextuales

## Sprint 35 - Reviews & Social Proof
### ✅ Completado
- **Reviews table** - Supabase migration (`sprint-35-reviews.sql`), RLS policies, seed data
- **API reviews** - Route actualizada para leer/escribir en Supabase
- **Testimonios UI** - Stats bar + carousel en homepage, trust badges en premium page
- **Premium page fix** - Corregido error JSX (extra `</div>` en línea 929)
- **Fix /destinos para países no-España** - Eliminadas rutas españolas para Marruecos, Francia, etc. Ahora muestra itinerario país-específico con días detallados, presupuesto, transporte, imprescindibles y tips. Países con itinerario: MA, FR, IT, PT, JP

## SEO Audit Fixes (02/05/2026)
### ✅ Completado
- **P1: Blog SSR** - Convertido blog/page.tsx de client-side a Server Component con datos iniciales SSR, BlogClient.tsx para interactividad
- **P1: Sitemap** - Eliminado public/sitemap.xml estático que colisionaba con dynamic sitemap.ts
- **P2: Idioma queNoHacer** - Traducidos ~80 strings en inglés a español en paises.ts

### ℹ️ Ya estaba correcto
- RSS footer ya usa dominio canónico (viajeinteligencia.com)
- Meta descriptions únicas por país ya implementadas
- Schema.org markup ya implementado (Article, FAQ, Breadcrumb, Place)
- "Próximamente" ya eliminado de home
- Contador países: 107 visibles (getTodosLosPaises), consistente en todas las páginas

### ⚡ Pendiente manual
- Enviar sitemap a Google Search Console (no es código)

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

## Way Ahead — Plan próximo día (04/05/2026)

### 🔥 Urgente
- [ ] **Mastodon token en Vercel**: Token configurado pero `scripts/publish-posts.mjs` tiene token hardcoded. Mover a env var y limpiar script.
- [ ] **Blog categories en frontmatter**: `Que-es-viaje-inteligencia.md` y `Como-encontrar-vuelos-baratos.md` NO tienen campo `category` → categoría vacía en cards del blog.
- [ ] **Submit sitemap a Google Search Console** (manual)

### 📊 Supabase / Data
- [ ] Ejecutar migration `supabase/sprint-35-reviews.sql` en Supabase Dashboard
- [ ] Enriquecer `queHacer` arrays: 13 países tienen 0 items, 16 tienen solo 4

### 🏗️ Features pendientes
- [ ] España Premium itinerarios module (Sprint 33 Level 3 #4)
- [ ] Schema.org markup en blog post pages (verificar server-side rendering para crawlers)
- [ ] Optimizar imágenes del blog (webp, lazy loading, alt text)

### 🧪 QA / Fixes
- [ ] Verificar blog search en producción (fix null tags/keywords)
- [ ] Verificar paginación blog: 2 páginas (50 + resto)
- [ ] Verificar posts con categorías vacías no rompen filtro de categorías

### 🔒 Seguridad
- [ ] Rotar tokens Mastodon si fueron commiteados (check git history)
- [ ] Mover tokens de `scripts/publish-posts.mjs` a `.env` local
