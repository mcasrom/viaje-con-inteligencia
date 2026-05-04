<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Sprint Status

## Sprint 48 - TCI Inteligente con ML + Histórico + Conflicto Aéreo (Completado 04/05/2026)
### ✅ Completado
- **Histórico TCI semanal** — Cron diario almacena snapshots en `tci_history` (Supabase)
- **Gráfico de evolución 12 semanas** — Componente Recharts en `/viaje-coste/[codigo]`
- **Predicción ML** — Regresión lineal + media móvil → predicción próxima semana y mes con % confianza
- **Índice de conflicto aéreo** — 10 espacios aéreos cerrados (RU, UA, SY, LY, YE, AF, IQ, SO, SD, IR) + 10 rutas afectadas desde MAD con desvíos
- **Badge de impacto** — Sobrecoste %, horas extra, ruta alternativa en destinos afectados (JP +18.5%, KR +16%, CN +15%)
- **Volatilidad** — Clasificación baja/media/alta basada en desviación estándar
- **Mejor semana para reservar** — Análisis de patrones estacionales con % ahorro estimado
- **Tendencias 4 y 12 semanas** — Direcciones (up/down/stable) con cambio numérico
- **⚠️ Pendiente manual**: Ejecutar `supabase/sprint-48-ml-tci.sql` en Supabase SQL Editor

### 📁 Archivos nuevos/modificados
- `src/data/tci-engine.ts` — Añadido: AIRSPACE_CLOSURES, AFFECTED_ROUTES, analyzeTCITrend(), getConflictImpact()
- `src/app/api/cron/flight-costs/route.ts` — Añadido: insert en tci_history + conflict_surcharge
- `src/app/viaje-coste/[codigo]/page.tsx` — Añadido: mlAnalysis y conflict props
- `src/app/viaje-coste/[codigo]/ViajeCosteClient.tsx` — Reescrito: gráfico Recharts, predicción ML, badge conflicto
- `supabase/sprint-48-ml-tci.sql` — Nuevo: tci_history, airspace_closures, affected_routes + seed data

### 🧠 Algoritmo ML
```
Predicción = (TCI_actual × 0.6) + (regresión_lineal × 0.2) + (media_móvil_4sem × 0.2)
Confianza = R²_12sem × 60 + R²_4sem × 30 + 15 (rango 45-95%)
Volatilidad = std_dev < 3 → baja, < 7 → media, ≥ 7 → alta
```

## Sprint 47 - Páginas SEO /viaje-coste (Completado 04/05/2026)
### ✅ Completado
- **Listado `/viaje-coste`** — Todos los países por región, top baratos/caros, leyenda colores
- **Detalle `/viaje-coste/[codigo]`** — 106 páginas SEO con metadata, Schema.org, presupuesto, FAQ
- **Presupuesto estimado** — 3 niveles (mochilero, medio, lujo) ajustado por región y TCI
- **FAQ automático** — 5 preguntas por país con FAQPage Schema.org
- **Alternativas** — Destinos más baratos/caros en la misma región
- **Sitemap** — Añadidas 106 rutas /viaje-coste/[codigo] + /viaje-coste
- **Footer** — Enlace "Coste de Viaje" en sección Explorar
- **Cuba bloqueado** — 404 en generateStaticParams y page

### 📁 Archivos nuevos/modificados
- `src/app/viaje-coste/page.tsx` — Nuevo listado
- `src/app/viaje-coste/[codigo]/page.tsx` — Nuevo detalle server component
- `src/app/viaje-coste/[codigo]/ViajeCosteClient.tsx` — Componente cliente
- `src/app/sitemap.ts` — Añadidas entradas viaje-coste
- `src/components/Footer.tsx` — Añadido enlace
- `src/data/tci-engine.ts` — Funciones getCheapestDestinations, getMostExpensiveDestinations

## Sprint 46 - TCI Frontend + Cron Flight Costs (Completado 04/05/2026)
### ✅ Completado
- **API `/api/flight-costs`** — GET con query params: `country`, `sort=cheapest|expensive|oil`, `limit`
- **Cron `/api/cron/flight-costs`** — Autenticado con CRON_SECRET, calcula TCI todos los países, fetch petróleo EIA
- **Componente `TravelCostIndex`** — Badge de tendencia, valor TCI con color, recomendación, desglose de 5 factores
- **Integración DetallePaisClient** — Widget TCI en páginas de país (antes de Reviews)
- **Admin dashboard** — Nuevo trigger "Flight Costs TCI", stats incluyen último run
- **Vercel cron** — Schedule diario 05:00 UTC
- **⚠️ Pendiente manual**: Ejecutar `supabase/sprint-45-flight-costs.sql` en Supabase SQL Editor

### 📁 Archivos nuevos/modificados
- `src/app/api/flight-costs/route.ts` — Nuevo endpoint público
- `src/app/api/cron/flight-costs/route.ts` — Nuevo cron job
- `src/components/TravelCostIndex.tsx` — Componente TCI
- `src/app/pais/[codigo]/DetallePaisClient.tsx` — Integración widget
- `src/app/admin/dashboard/page.tsx` — Añadido trigger y stats
- `src/app/api/admin/stats/route.ts` — Añadido flightCosts status
- `vercel.json` — Añadido schedule cron flight-costs
- `supabase/sprint-45-flight-costs.sql` — Migration SQL (pendiente ejecución)

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
- [ ] Ejecutar `supabase/sprint-48-ml-tci.sql` en Supabase SQL Editor (tablas tci_history, airspace_closures, affected_routes)
- [ ] Ejecutar `supabase/sprint-44-review-images.sql` (aún pendiente desde sprint 44)
- [ ] Disparar cron flight-costs manualmente para poblar tci_history
- [ ] Verificar gráfico TCI + predicción ML en producción

### 📊 Data
- [ ] Seed inicial oil_price_history con datos históricos Brent
- [ ] Calibrar TCI contra precios reales (flytrippers, blogs) para ajustar pesos
- [ ] Tras 2 semanas de cron: verificar que predicciones ML se ajustan a datos reales

### 🏗️ Features
- [ ] España Premium itinerarios module

### 🧪 QA
- [ ] Verificar FAQ Schema en Google Rich Results Test
- [ ] Verificar badge de conflicto aéreo en Japón/China/Corea
- [ ] Verificar que gráfico 12 semanas se actualiza tras primer cron

### 🔧 Ops
- [ ] Enviar sitemap a Google Search Console tras deploy
- [ ] Monitorizar crons en admin dashboard

---

## Acciones Supabase — Sprint 48

### Paso 1: Ir al SQL Editor
1. Abrir https://app.supabase.com/project/nczkvsnuafkwtmgokiuo/sql
2. Click en "New Query"

### Paso 2: Ejecutar el SQL
Copiar y pegar el contenido de `supabase/sprint-48-ml-tci.sql`:

```sql
-- 1. Histórico diario TCI
CREATE TABLE IF NOT EXISTS tci_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  country_code TEXT NOT NULL,
  tci_value NUMERIC(6,2),
  tci_trend TEXT,
  demand_idx NUMERIC(6,2),
  oil_idx NUMERIC(6,2),
  seasonality_idx NUMERIC(6,2),
  ipc_idx NUMERIC(6,2),
  risk_idx NUMERIC(6,2),
  oil_price_usd NUMERIC(8,2),
  conflict_surcharge NUMERIC(4,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, country_code)
);

-- 2. Espacio aéreo cerrado por conflictos
CREATE TABLE IF NOT EXISTS airspace_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  closure_date DATE NOT NULL,
  reason TEXT,
  severity TEXT DEFAULT 'high',
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Rutas afectadas
CREATE TABLE IF NOT EXISTS affected_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_iata TEXT NOT NULL,
  destination_iata TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  closed_airspace TEXT NOT NULL,
  detour_km NUMERIC(8,1),
  fuel_surcharge_pct NUMERIC(5,2),
  time_extra_hours NUMERIC(4,1),
  alternative_route TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS
ALTER TABLE tci_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE airspace_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE affected_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TCI history public read" ON tci_history FOR SELECT USING (true);
CREATE POLICY "Airspace closures public read" ON airspace_closures FOR SELECT USING (true);
CREATE POLICY "Affected routes public read" ON affected_routes FOR SELECT USING (true);
```

### Paso 3: Verificar
1. Ir a **Table Editor** → Deberían aparecer `tci_history`, `airspace_closures`, `affected_routes`
2. Disparar cron `/api/cron/flight-costs` desde admin dashboard
3. Verificar que `tci_history` se llena con datos

---

## Acciones Supabase — Sprint 45

### Paso 1: Ir al SQL Editor
1. Abrir https://app.supabase.com/project/nczkvsnuafkwtmgokiuo/sql
2. Click en "New Query"

### Paso 2: Ejecutar el SQL
Copiar y pegar el contenido de `supabase/sprint-45-flight-costs.sql`:

```sql
-- 1. Tabla cache TCI
CREATE TABLE IF NOT EXISTS flight_tci_cache (
  country_code TEXT PRIMARY KEY,
  tci_value NUMERIC NOT NULL,
  tci_trend TEXT,
  demand_idx NUMERIC,
  oil_idx NUMERIC,
  seasonality_idx NUMERIC,
  ipc_idx NUMERIC,
  risk_idx NUMERIC,
  recommendation TEXT,
  last_calculated TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla historial precio petróleo
CREATE TABLE IF NOT EXISTS oil_price_history (
  date TEXT PRIMARY KEY,
  price_usd NUMERIC NOT NULL,
  source TEXT DEFAULT 'EIA',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS
ALTER TABLE flight_tci_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE oil_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TCI cache public read"
ON flight_tci_cache FOR SELECT USING (true);

CREATE POLICY "Oil history public read"
ON oil_price_history FOR SELECT USING (true);
```

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
