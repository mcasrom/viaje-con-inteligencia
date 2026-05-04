<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Sprint Status

## Sprint 44 - Imágenes en Reseñas (Completado 04/05/2026)
### ✅ Completado
- **API `/api/reviews/upload`** — Recibe imagen, optimiza con sharp (resize 800px + WebP 80%), sube a Supabase Storage bucket `review-images`
- **Testimonios.tsx** — Drag & drop + file picker, preview, upload + review en un paso. Cards muestran imagen cuando existe `image_url`
- **Reviews.tsx** — Mismo soporte de imágenes en formulario por país
- **API reviews** — GET y POST incluyen campo `image_url`
- **DB** — Columna `image_url TEXT` añadida a tabla `reviews`
- **⚠️ Pendiente manual**: Ejecutar SQL en Supabase (ver sección "Acciones Supabase" abajo)

### 📁 Archivos nuevos/modificados
- `src/app/api/reviews/upload/route.ts` — Nuevo endpoint upload
- `supabase/sprint-44-review-images.sql` — Migration SQL
- `src/app/api/reviews/route.ts` — Añadido `image_url` a select e insert
- `src/components/Testimonios.tsx` — Selector de imagen + visualización
- `src/components/Reviews.tsx` — Selector de imagen + visualización

## Sprint 43 - Formulario de Reseñas en Testimonios (Completado 04/05/2026)
### ✅ Completado
- **Formulario modal** — Nombre, país (selector dinámico ~106 países desde `paises.ts`), rating ⭐, comentario
- **Selector países dinámico** — Usa `getTodosLosPaises()`, orden alfabético es, Cuba excluida
- **Testimonios.tsx** — Botón "Escribir Reseña", backdrop click + Escape para cerrar, animación éxito

## Sprint 42 - Fix Navegación /rutas (Completado 04/05/2026)
### ✅ Completado
- **"Volver a rutas"** — Usa `router.push('/rutas')` en lugar de `<Link>` para evitar problemas con useSearchParams

## Sprint 41 - Imágenes Temáticas Rutas (Completado 04/05/2026)
### ✅ Completado
- **Imágenes Unsplash en /rutas** - 10 rutas con imagen de fondo en cards grid + hero detail
- **Optimización**: `w=1200&q=80` para carga rápida, lazy loading en grid

## Sprint 41 - Rutas Temáticas /rutas (Completado 04/05/2026)
### ✅ Completado
- **Ruta Segovia Medieval** - 4 días, 180km, 12 paradas (Alcázar, Pedraza, Puebla, La Granja, San Frutos). Gráficos IA con mes ideal (Abr), más tranquilo (Feb), evitar (Ago)
- **Ruta Buceo Mediterráneo** - 5 días, 5 zonas (Cabo de Palos, Medas, Cabo de Creus, Tabarca, Formentera). Gráficos IA con mes ideal (May/Jun), evitar (Ago)
- **10 rutas totales** en /rutas con predicción IA de precio/afluencia/clima

## Sprint 40 - Rutas España Detalladas (Completado 04/05/2026)
### ✅ Completado
- ~~Rutas en blog~~ (movidas a /rutas en Sprint 41)

## Sprint 39 - Optimización Imágenes Blog (Completado 03/05/2026)
### ✅ Completado
- **Imágenes blog → next/image** - Lazy loading, optimización automática WebP/AVIF, sizes responsive
- **Post cards y featured posts** - Todas las imágenes optimizadas con next/image

## Sprint 38 - Schema.org Server-Side (Completado 03/05/2026)
### ✅ Completado
- **Schema.org server-side** - Article + BreadcrumbList en Server Component, eliminado useEffect client-side
- **BreadcrumbList schema** - Añadido para mejor navegación en Google Search

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

### ⚡ Pendiente manual (URGENTE)
- [ ] Ejecutar `supabase/sprint-44-review-images.sql` en Supabase SQL Editor
- [ ] Verificar que bucket `review-images` se creó correctamente y es público
- [ ] Probar subir una reseña con imagen desde homepage

### 📊 Data
- [ ] Verificar que crons MAEC se ejecuten mañana a las 6:00 AM (primer run tras añadir CRON_SECRET)

### 🏗️ Features
- [ ] España Premium itinerarios module

### 🔧 Ops
- [ ] Verificar ejecución de crons en admin dashboard tras primer run automático
- [ ] Monitorizar página /transparencia para confirmar que muestra datos reales tras cron

### 🧪 QA
- [ ] Verificar posts publicados a social desde admin dashboard
- [ ] Verificar blog search + paginación en producción
- [ ] Probar upload de imagen en reseñas (Testimonios + país)

### ⚡ Pendiente manual
- [ ] Enviar sitemap a Google Search Console

---

## Acciones Supabase — Sprint 44

### Paso 1: Ir al SQL Editor
1. Abrir https://app.supabase.com/project/nczkvsnuafkwtmgokiuo/sql
2. Click en "New Query"

### Paso 2: Ejecutar el SQL
Copiar y pegar el contenido de `supabase/sprint-44-review-images.sql` (o ejecutar estas queries):

```sql
-- 1. Añadir columna image_url
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Crear bucket review-images (público, máx 5MB, JPG/PNG/WebP)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-images',
  'review-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS policies
CREATE POLICY "Review images are public"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-images');

CREATE POLICY "Service role can upload review images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'review-images');

CREATE POLICY "Users can delete review images"
ON storage.objects FOR DELETE
USING (bucket_id = 'review-images');
```

### Paso 3: Verificar
1. Ir a **Storage** → Debería aparecer bucket `review-images`
2. Verificar que el toggle **Public** está activado
3. Ir a **Table Editor** → `reviews` → Debería aparecer columna `image_url`
4. Probar subir una reseña con imagen desde la web
