# AGENTS.md — Viaje con Inteligencia

## PAUSED STATE (13 May 2026)
- **Itinerarios públicos (destacados)** (43d4309): Sistema completo con columna `is_public` + `slug` en trips. Página `/viajes/destacados` con grid + OG tags. Toggle Publicar en detalle del viaje.
- **Newsletter environment** (cc55527 + 0d96286 + 4f9b464): Suscripción doble opt-in ✅, generación semanal con Groq + template profesional ✅, batch send a suscriptores vía Resend ✅, descarga HTML ✅, botón "Enviar ahora" en admin ✅. Fix: columna `verified` (no `confirmed`) en master cron. Fix: `/api/newsletter/announcement` ahora envía a todos los suscriptores verificados (ya no solo Telegram).
- **Intereses personalizados** (9b1ec0c): Input libre + "Add" en creación de viaje además de tags predefinidos.
- **RandomForest ML**: 4 modelos (risk_score, prob_up_7d/14d/30d), R²=0.967-0.995. Comparación diaria vía cron. MAE: riskScore=0.94, probUp7d=0.5%.
- **Deviaciones grandes actuales**: Camboya (+9 riskScore, RF más alto), Afganistán (+8.5pp probUp7d, RF cree que riesgo máximo aún puede escalar), Venezuela (-6 riskScore), Colombia (+5 riskScore).

## PAUSED STATE (07 May 2026 — Resumed 07 May)
- **Master cron v2** (58bf127): Deployed, runs in ~89s. MAEC 26 countries, OSINT 7 signals inserted, newsletter weekly digest ready for Monday test.
- **Sentiment analysis** (5c5500a): GDELT tone adjusts urgency (<-5 → up 1 level, <-10 → up 2). 3 new RSS feeds (AP, BBC Breaking, Sky News). Sentiment badges in OSINT dashboard.
- **Landing page 70vh black screen fix** (2ea1ca1): SVG world map fallback with 40 risk dots shows instantly during map loading. CTA moved inside map container (z-[1020]) — visible during loading AND after map renders.
- **OSINT dashboard** (67c1453): Source badges (GDACS, USGS, GDELT, RSS, Reddit) + sentiment score display.
- **Admin dashboard cron triggers** (5c5500a): Fixed from 7 dead routes to 2 functional buttons (Master Cron + OSINT Sensor).
- **Chat IA FALTA fix** (82f3f39): Updated admin dashboard to show Chat IA as "existe".
- **Newsletter**: Weekly digest implemented (Groq + HTML template). Runs Mondays via master cron.
- **All API keys** saved in `.env.local`.

## Active Plan (Week 08 May — Real Data Migration)
### Day 1 ✅ — POIs reales desde OSM (08 May)
- Created `/api/pois` unified endpoint using OSM Overpass API with area ISO filter (all 205 countries)
- Added 12 POI types: museum, heritage, beach, lighthouse, nature, viewpoint, castle, archaeological + tourism-disruptive: airport, border, police, hospital
- `DetallePaisClient.tsx` updated to use `/api/pois` with new categories: "Turísticos" (all) and "Disrupción" (airport/border/police/hospital)
- Removed `pois-fallback.ts` (223 lines hardcoded) and old `wikidata/pois` route

### Day 2 ✅ — Eventos disruptivos reales (08 May)
- Updated IST route to query real events from Supabase `events` table (Wikidata+GDELT) per country/month
- Added minimal inline fallback (16 critical annual events) for when Supabase has no data yet
- Rewrote `/eventos` page to fetch from `/api/events` (real time, 365-day window) instead of hardcoded list
- Events page now shows: category badges, impact level, source attribution, and links to country pages
- Removed `eventos-globales.ts` (74 lines hardcoded with 51 events)

### Day 3 ✅ — TCI con datos reales (08 May)
- `/api/oil-price` ahora consulta Supabase `oil_price_history` (datos reales del cron EIA/Yahoo) como fuente primaria
- Fallback automático a datos hardcode en tci-engine.ts cuando Supabase no tiene datos
- EUR/USD desde Frankfurter API (gratis, sin API key)

### Day 4 ✅ — ML perfil de viajero en POIs (08 May)
- API `/api/pois` acepta `?profile=mochilero|lujo|familiar|aventura|negocios` y devuelve POIs scoreados por relevancia (0-100)
- 5 perfiles con pesos distintos para cada tipo de POI (museum, beach, nature, airport...)
- UI en `DetallePaisClient`: selecto de perfil visible en pestaña POIs, badges de relevancia en cada POI
- POIs ordenados por relevancia al perfil activo

### Day 5 ✅ — User preferences persistentes (08 May)
- Creada tabla `user_preferences` en Supabase (SQL: `supabase/user_preferences.sql`)
- Creado `/api/user/preferences` (GET/POST) para leer y guardar preferencias
- Creado `PreferencesSelector` componente en SidePanel: selector tipo viajero, tolerancia riesgo, presupuesto
- `DetallePaisClient` conectado: carga perfil viajero desde preferencias al iniciar sesión, guarda al cambiar perfil
- Perfil viajero persistido en Supabase afecta el scoring de POIs

### Day 6 ✅ — Alternativas ML cuando hay disrupción (08 May)
- Creado `/api/alternatives?country={code}` endpoint: detecta disrupción (eventos high-impact/protestas desde Supabase), llama a `findSimilarDestinations()` y filtra por riesgo igual o menor
- Integrado en `DetallePaisClient`: al seleccionar pestaña "Disrupción" en POIs, se muestran destinos alternativos más seguros con % de compatibilidad
- Alternativas ordenadas por similitud (riesgo, coste, distancia, turismo) usando clustering ML existente

### Day 7 ✅ — Tests, caching, pulido, deploy (08 May)
- Creada tabla `pois_cache` en Supabase con TTL 6h (SQL: `supabase/pois_cache.sql`)
- `/api/pois` refactorizado: quita edge runtime, consulta cache antes de OSM, guarda respuesta en cache
- Smoke tests: `src/test-smoke.ts` ejecutable con `npm test` (verifica POIs, alternativas, oil, IST)
- Pulido: eliminados archivos muertos (`pois-fallback.ts`, `eventos-globales.ts`, `test-api.ts`)
- `npm test` añadido a `package.json`

## Week Complete ✅ — 7 días de migración a datos reales completados

## Project
- **Framework**: Next.js 16 + App Router, TypeScript
- **Deploy**: Vercel (auto-deploy on `main` push)
- **UI**: Tailwind CSS, lucide-react, react-markdown
- **AI**: Groq API (`llama-3.1-8b-instant` free, `llama-3.3-70b-versatile` premium)
- **Auth/DB**: Supabase (users, trips, favorites)
- **Payments**: Stripe (not fully integrated yet)
- **Email**: Resend
- **Bot**: Telegram

## Key Commands
```bash
npm run dev          # dev server
npm run build        # production build
npm run start        # production server
```

## Architecture
- **Server pages**: `page.tsx` exports metadata, wraps Client component
- **Client components**: `*Client.tsx` — `'use client'` directive
- **AI routes**: `/api/ai/chat`, `/api/ai/itinerary`, `/api/ai/risk`, `/api/ai/compare`, etc.
- **Data**: `src/data/paises.ts` — 107 países con riesgo MAEC
- **Z-index**: TopBar `z-[1010]`, SidePanel `z-[1005]`, Leaflet `z-[400-1000]`

## Newsletter Architecture Design (Pending Discussion)
### Concept: Newsletter Autónomo
**Arquitectura:**
Trigger (GitHub Actions / Anomaly) → Data (MAEC+USGS+GDACS) → LLM Groq (content generation) → Personalization (Supabase profiles) → Send (Resend + Telegram) → Analytics (newsletter_logs)

**Newsletter Types:**
| Type | Frequency | Content | Audience |
|---|---|---|---|
| Digest Semanal | Monday 08:00 | Top 3 MAEC changes + 1 destination | All free users |
| Risk Alert | Event-driven | Country changed level → impact | Users with favorites |
| Premium Monthly | 1st of month | Deep analysis + ML predictions | Premium only |
| Destination Month | 15th of month | Full profile: cost+risk+weather | All |

**Provider:** Resend (3,000 emails/mo free, native Next.js SDK, React Email support)

**Components to build:**
1. React Email template (`@react-email/components`) — personalized with `{{nombre}}`, `{{pais}}`, `{{riesgo_favorito}}`
2. `/api/newsletter/send` route — batch send via Resend (100 per call)
3. `newsletter-generator.ts` — Groq LLM generates destination descriptions (40-50 words, no fluff)
4. GitHub Actions scheduler (free alternative to Vercel cron limits)
5. `newsletter_logs` table in Supabase (opens, clicks tracking)

**Status:** Architecture defined, not yet implemented. Need to decide what's viable vs not.

## CRON Incident (07 May 2026)
- Vercel Hobby allows ONLY 1 cron job. Had 7 crons configured — only 1 was running, rest were silently ignored.
- `/admin/osint/` showed no new data because `osint-sensor` cron never ran.
- **Fix**: Consolidated ALL crons into single `/api/cron/master` route (runs at 06:00 UTC):
  1. MAEC scrape
  2. Risk alerts check
  3. Flight costs / TCI calculation
  4. Airspace OSINT sync
  5. News sentiment (GDELT + RSS + Groq classification)
  6. Oil price fetch (Yahoo Finance)
  7. Daily digest (Telegram + email)
  8. Weekly digest (Mondays only, newsletter subscribers)
- **Rule**: NEVER create new cron endpoints. Add tasks to `master/route.ts` instead.

## Logros 12 May 2026 — Radar de Viaje
- **Fix visual**: Al añadir un país al radar, aparece al instante (optimistic update) sin esperar al servidor. Antes se quedaba la pantalla vacía aunque el guardado funcionaba.
- **Gráfico de proyección de riesgo**: Nuevo timeline interactivo (Recharts) que muestra 12 meses de evolución del riesgo para cada país del radar, ajustado por estacionalidad turística.
- **Marcadores de viaje**: Si el usuario asigna fechas a un país, aparece una línea vertical ✈ en el mes del viaje para comparar el riesgo proyectado.
- **Leyenda narrativa**: Explicación de 3 puntos para que cualquier usuario entienda el gráfico sin tecnicismos.
- **Soporte multiplataforma**: Probado en Chromium, Firefox, ventana normal e incógnito.
- **Limpieza**: `supabase/.temp/` añadido a `.gitignore`.

## Referencia Completa del Radar

### Propósito
Permitir al usuario monitorizar de un vistazo el riesgo de sus próximos destinos, con proyección temporal y alertas contextuales.

### Arquitectura
| Componente | Archivo | Rol |
|---|---|---|
| API CRUD | `src/app/api/user/watchlist/route.ts` | GET/POST/DELETE watchlist |
| API Timeline | `src/app/api/user/watchlist/timeline/route.ts` | Proyección riesgo 12 meses |
| API Search | `src/app/api/v1/countries/search/route.ts` | Búsqueda de países |
| Página Radar | `src/app/dashboard/radar/page.tsx` | Server wrapper + metadata |
| Cliente Radar | `src/components/RadarClient.tsx` | UI completa (lista, add form, delete) |
| Gráfico Timeline | `src/components/RadarTimelineChart.tsx` | Recharts line chart |
| Botón Añadir | `src/components/AddToRadarButton.tsx` | Botón en ficha de país |
| BD | `supabase/user_watchlist.sql` | Tabla user_watchlist (sin FK) |

### UX Flow
1. Usuario navega a `/dashboard/radar` o hace clic en "Radar" desde TopBar/Footer/ficha de país
2. Si no está logueado → CTA "Inicia Sesión"
3. Si está logueado → ve sus países o empty state "Tu radar está vacío"
4. "Añadir País" → formulario con buscador (mín 2 chars, debounce 300ms), fechas opcionales, notas
5. Al guardar → optimistic update (aparece al instante) + refetch en background
6. Cada card muestra: bandera, nombre, región, nivel riesgo, fechas viaje, notas
7. Gráfico debajo: líneas por país con proyección 12 meses ajustada por estacionalidad
8. En `/pais/[codigo]`: botón "Mi Radar"/"En tu Radar" en header

### Modelo de Proyección
```
riesgo_score = riesgo_base + ((estacionalidad - 100) / 100 × 0.5)
```
- riesgo_base: 1 (sin-riesgo) a 5 (muy-alto) desde MAEC + US State Dept
- estacionalidad: índice 0-150 desde SEASONALITY_MAP (hardcode + Supabase)
- El score se redondea al entero más cercano para el label

### API Endpoints
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/user/watchlist` | Sesión | Lista países + enrich con paisesData |
| POST | `/api/user/watchlist` | Sesión | Añade/actualiza país (límite 20) |
| DELETE | `/api/user/watchlist?id=X` | Sesión | Elimina por id o country |
| GET | `/api/user/watchlist/timeline` | Sesión | Proyección 12 meses por país |
| GET | `/api/v1/countries/search?q=...` | No | Busca países (min 2 chars) |

### Puntos de Entrada (Navegación)
- TopBar: link "Radar" (visible siempre, redirige a login si no autenticado)
- Footer > Herramientas: "Mi Radar"
- Dashboard: card "Mi Radar" en grid de acceso rápido
- Ficha de país: botón "Mi Radar" / "En tu Radar" en header
- URL directa: `/dashboard/radar`

### Métricas Sugeridas (para implementar con analytics)
| Métrica | Evento | Dónde |
|---|---|---|
| Páginas vistas radar | page_view | `/dashboard/radar` |
| País añadido | radar_add | POST watchlist |
| País eliminado | radar_remove | DELETE watchlist |
| Gráfico visto | chart_view | TimelineChart mount |
| Click en card país | radar_country_click | Card → `/pais/[codigo]` |
| Add desde ficha país | radar_add_from_country | AddToRadarButton click |

### Promoción (Redes Sociales)
**Público objetivo:** Viajeros frecuentes, mochileros, expats, nómadas digitales.
**Canales:** X, Telegram (@ViajeConInteligenciaBot canal), Mastodon.
**Tono:** Práctico, data-driven, útil para decidir destinos.
**Post base** (copiar-pegar):
```
🧭 Viaje Inteligente — Tu Radar de Viaje ahora con proyección de riesgo.

Añade los países que tienes en mente y ve cómo evoluciona su nivel de riesgo mes a mes. ¿Planeas viajar en agosto? El gráfico te dice si ese mes sube o baja la alerta respecto a la media.

✅ País añadido → se ve al instante
📈 12 meses de proyección por estacionalidad
✈️ Tus fechas de viaje marcadas en el gráfico

Pruébalo en viajeinteligencia.com/dashboard/radar

#ViajeInteligente #traveltech #travelrisk #viajarseguro
```
**Variantes:**
- Telegram: mismo texto, sin hashtags
- Mastodon: mismo texto, con #ViajeInteligente
- X: acortado a 280 chars si es necesario

### Tests (smoke)
```
curl -s "https://www.viajeinteligencia.com/api/v1/countries/search?q=es"
# → 200, array con países
```
Para probar authenticated endpoints se necesita sesión válida (vía browser).

## Recent Work (07 May 2026)
- Created master cron consolidating 7 jobs into 1 (`src/app/api/cron/master/route.ts`)
- Newsletter: double opt-in flow restored, RESEND_API_KEY saved in `.env.local` + Vercel
- Added `src/app/api/cron/master/route.ts` — single entry point for all daily automation
- Eurostat integration attempted and abandoned (SDMX v2 too complex, timeout issues)
- OSINT sensor already implemented: `/admin/osint/` + `src/lib/osint-sensor.ts` + `src/app/api/cron/osint-sensor/route.ts`
  - Scrapes Reddit RSS (r/travel, r/solotravel, r/digitalnomad), GDACS, USGS, GDELT
  - Classifies signals with Groq (category, urgency, first-person detection)
  - Saves to `osint_signals` table in Supabase

## 13 May 2026 — Itinerarios públicos + Newsletter download
### Itinerarios públicos (destacados)
- **Feature**: Sistema completo de itinerarios públicos. Cualquier viaje con itinerario IA se puede marcar como público con 1 clic.
- **Arquitectura**:
  - Columna `is_public` (boolean) + `slug` (text UNIQUE) en tabla `trips`
  - PATCH `/api/trips/[id]` auto-genera slug al marcar `is_public: true`
  - GET `/api/trips/public` — lista pública (sin auth)
  - `/viajes/destacados` — grid público con extractos
  - `/viajes/destacados/[slug]` — página completa con OG tags para redes
  - Toggle "Publicar" en detalle del viaje (`/viajes/[id]`)
  - Enlace en footer + enlace "Ver itinerarios destacados" en Mis Viajes
- **Pendiente**: Ejecutar `supabase/trips_public.sql` en Supabase SQL Editor para crear las columnas.

### Newsletter — envío real a suscriptores (13 May fixes)
- **Bug fix**: `getSubscribers()` en master cron consultaba columna `confirmed` (inexistente) → ahora usa `verified` (0d96286). Sin esto el digest semanal nunca encontraba suscriptores.
- **Anuncio reescrito**: `/api/newsletter/announcement` ahora:
  - Usa `collectNewsletterData()` + `buildWeeklyEmailHtml()` de `newsletter-generator.ts` para template profesional con stats, alertas, destino destacado, Q&A
  - Obtiene suscriptores verificados y envía batch vía Resend con 300ms de separación
  - Guarda en `newsletter_history` con `recipients_count` real
  - Sigue enviando posts a Telegram
- **Admin**: Botón "Enviar newsletter ahora" en dashboard que dispara `/api/newsletter/announcement` con loading state y resultado JSON.
- **Commits**: `0d96286`, `4f9b464`

## Way Ahead (próximos pasos)
1. **Esperar data histórica**: MAEC risk history necesita 7/14/30 días acumulados para validar predicciones RF contra cambios reales de riesgo. Sin data, no hay validación posible.
2. **Monitorear deviations**: La comparación RF vs heurístico corre cada día vía cron. Verificar que no aparezcan nuevos países con deviation grande. Los 4 actuales están documentados — no requieren acción inmediata.
3. **Expandir features RF**: Tasas de cambio, clima/estacionalidad, datos de visados — mejorarían precisión pero requieren nuevas fuentes de datos.
4. **Probar envío newsletter manual**: Desde admin dashboard, botón "Enviar newsletter ahora". Verificar que llega a los 16 suscriptores. Después, esperar al lunes para confirmar el trigger automático del cron.
5. **Newsletter visor en admin**: Ver HTML del newsletter generado antes de enviar (vista previa).
6. **Tracking aperturas/clics**: Resend soporta tracking nativo. Activar flag y guardar métricas en `newsletter_history`.
7. **Landing page CTA**: Verificar que el CTA sigue visible tras carga del mapa (fix previo con z-index). Pendiente de confirmación visual.
8. **Vercel Hobby limit**: Solo 1 cron schedule. Master cron ejecuta todo secuencialmente. Si algún sub-task empieza a fallar por timeout, considerar migrar a plan Pro o GitHub Actions.

## Recurring Tasks
- **Daily (post-deploy)**: Verify `/api/cron/train-models` completes successfully (R² > 0.95, < 300s).
- **Daily (post-deploy)**: Verify `/api/cron/compare-models` — check no new countries with large RF vs heuristic deviation (>5 points riskScore, >5% probUp).
- **Weekly**: Review `maec_risk_history` data accumulation. Once 30+ days of history exist, run temporal CV on `/api/cron/validate-models` and compare RF predictions against actual risk changes.
- **Weekly**: Update AGENTS.md ML summary with latest comparison/validation metrics.

## False Positives (Audit Tools)
- `@mybloggingnotes` links — old cached content, removed from live site
- WhatsApp number — not present in current codebase
- Duplicate emails — audit tool cache issue
