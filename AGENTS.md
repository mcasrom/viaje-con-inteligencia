# AGENTS.md — Viaje con Inteligencia

## Slogans / Taglines (SEO)
- **ES**: "Viaje con Inteligencia: Tu radar de seguridad global impulsado por IA."
- **EN**: "Smart Traveler: AI-Driven Global Risk Radar for the Conscious Explorer."

## Hashtags (posts + redes)
- `#TurismoSeguro` `#IATravel` `#RiesgoGeopolitico` `#ViajeroSmart`
- Tradicionales: `#ViajeInteligencia` `#SmartTravel` `#TravelTech` `#IAViajes`
- Usar 1-2 de la primera línea + 2-3 de la segunda por post

## ⚙️ Observaciones Técnicas
- **Speed Insights (Vercel)**: Desactivado por consumo excesivo de recursos. Esto NO afecta a los despliegues — los builds y deployments son independientes de Speed Insights. Si un deploy no se refleja, el problema es de build failure o cache de ISR, no de Speed Insights.
- **Blog sort**: Actualizado a fecha-primero (featured solo como tiebreaker en misma fecha). Commit `91a5b6a`. Ya no necesita `featured: true` en posts nuevos — el más reciente aparece primero automáticamente.
- **Blog UX**: Category cards visuales (como sección de metodología en `/coste`) + lista colapsada por defecto (solo 3 posts). "Mostrar todos" expande con búsqueda + paginación. Commit `f359da3`.

## SOS Botón Emergencia — Marketing & Presencia
- **Footer**: Añadir enlace al Modo Emergencia en el footer del site (sección Herramientas o Comunidad). El botón flotante está implementado (`src/components/SOSButton.tsx`), pero no hay enlace de texto en el footer para usuarios que no quieren interactuar con el botón flotante. Pendiente.
- **Newsletter**: Incluir el Modo Emergencia en todas las newsletters dentro de la sección de contactos/emergencias. Texto sugerido: "🆘 ¿Emergencia en tu destino? Usa nuestro Modo Emergencia con geolocalización, teléfonos locales y contacto consular — botón rojo ⚠️ abajo a la izquierda en viajeinteligencia.com"
- **Marketing / Outreach**: El Modo Emergencia es un diferenciador real frente a webs de viaje genéricas. Destacar en: landing page, lead magnet, posts de redes sociales. Tema: "seguridad inmediata sin apps, sin registro, sin API keys".

## ⚠️ Observaciones Permanentes SEO / Indexado
- **robots.txt**: Actualmente permite crawling de páginas principales pero deshabilita `/api/`, `/dashboard/`, `/viajes/`. Revisar periódicamente que no haya bloqueos no intencionados. Si se añaden secciones públicas nuevas, verificar que no estén incluidas en `Disallow`.
- **`/en` noindex**: Verificar siempre que `index: true` se mantenga en `/en/page.tsx` si se quiere tráfico internacional. Las páginas `en` solo cubren homepage — el resto del site (blog, países) no tiene versión inglesa.
- **Slugs de blog**: Deben ser siempre lowercase. Tras renombrar `Como-encontrar-vuelos-baratos` y `Que-es-viaje-inteligencia`, verificar que new posts no tengan mayúsculas en el filename.

## PAUSED STATE (16 May 2026 — Sprint Migraciones + Trip Risk Score)
### Logros
- **Login fix + Alertas persistence**: Toast notification invisible (nunca se renderizaba). POST subscribe devolvía 400 por `alert_types` mal formado (string vs array). Dashboard no mostraba suscripciones (faltaba fallback `data.alerts`). Todo corregido y verificado.
- **Migración airports**: Creado `src/lib/airports-db.ts` con `getMainAirport()` y `getAirportCoordinates()` DB-first + fallback. `cost-estimate/route.ts` actualizado.
- **Migración indices**: `recommendation-engine.ts` usa `getGPI/getGTI/getHDI/getIPC` de `@/lib/indices`. `kpi/page.tsx` fetch desde `/api/indices`. Ya había API + tabla `indices` poblada.
- **Migración paises**: Datos extraídos de `paises.ts` (6360→245 líneas) a `paises-data.json` (111 países, 87 emergencies). DB warm-up asíncrono al arrancar. 42 consumidores siguen igual — cero cambios.
- **Migraciones completadas**: Todos los targets listados ya estaban migrados con init files + DB fallback:
  - `tci-engine.ts` → `lib/seasonality-init.ts` sobreescribe `SEASONALITY_MAP` desde Supabase. Engine computacional (no datos).
  - `clustering.ts` → `lib/clustering-init.ts` sobreescribe `travelAttributes` y llama `updateTourismData()` desde Supabase. Engine computacional.
  - `seguros.json` → `lib/seguros-init.ts` + `lib/seguros-data.ts` + API route `/api/seguros/catalog`. DB-first, JSON como fallback.
  - `rutas-espanas.ts` → `lib/rutas-init.ts` + `lib/rutas-db.ts` cargan rutas desde Supabase `thematic_routes`.
  - `mochilero-premium.ts` → API `/api/premium/bundles` y `/api/premium/addons` usan DB-first con fallback.
  - `ine-data.ts` → Llama directamente a `supabaseAdmin.from('ine_tourism_history')`, fallback hardcode.
  - `tourism.ts` → `lib/tourism-db.ts` con DB-first + fallback. Consumidores ya importan de `@/lib/tourism-db`.
- **Blog rating verificado**: `BlogPostRating` SÍ se renderiza en producción HTML (loading skeleton visible en SSR). API `/api/posts/rate` devuelve datos válidos. La "desaparición" era un falso positivo de grep (búsqueda del nombre de función en vez de elementos renderizados).
- **Footer SOS**: Enlace "Modo Emergencia" ahora dispara evento `open-sos` que abre el panel SOS (`SOSButton.tsx`). Ya no hace scroll-to-top sin sentido.
- **Newsletter + Modo Emergencia**: Nueva sección "🆘 Modo Emergencia — ayuda inmediata" en el HTML del digest semanal. Incluye 5 bullet points de funcionalidades + CTA rojo.
- **Admin UI Países**: Nueva página `/admin/paises` con tabla searchable/filtrable, edición inline (nombre, capital, continente, riesgo, visible), API `PUT /api/admin/paises` con validación Zod y auto-invalidate de cache.
- **Speed Insights**: Desactivado (excedía límite 23K/10K).
- **Trip Risk Score**: Nueva tabla "Análisis de seguridad" en detalle de viaje (`/viajes/[id]`). API `GET /api/trips/[id]/risk-score` con scoring ponderado por país + mes + perfil. Tabla visual con 4 dimensiones (riesgo, temporada, coste, perfil) y score global. Lógica extraída a `src/lib/trip-risk-score.ts` y compartida con `/api/ml/score`.

### Pendientes para próximo sprint
1. **ML**: Esperar ~25 días para validación temporal CV. Mejorar features RF.
2. **Vinculación Telegram**: Probar flujo completo `/vincular` → bot confirma.
3. **SloganPopup homepage** ✅ — Implementado.
4. **Infografía semanal riesgos** ✅ — Se genera los domingos vía master cron. Página `/infografias` con listado, detalle, GWI, popup en homepage. Slogans ES/EN bajo cabecera.
5. **Outreach**: X/Twitter, Reddit, foros de viajeros.
6. **Footer SOS** ✅ — Ya existe en Footer.tsx.
7. **Newsletter Modo Emergencia** ✅ — Ya incluido en newsletter-generator.ts.
8. **API retrasos vuelos en Reclamaciones**: Integrar FlightLabs (RapidAPI) en formulario de reclamaciones para verificar retraso real por nº vuelo + fecha. Pendiente: registrar cuenta en RapidAPI + FlightLabs, obtener `X-RapidAPI-Key`. Una vez lista, integrar endpoint `/api/flights/verify-delay` y autocompletar campo retraso en ReclamacionesClient.
9. **Score personalizado por país (ML)** ✅ — API `/api/ml/score` + componente `ScoreBadge` + selectores visuales de perfil y presupuesto en cabecera de ficha de país. Guarda a localStorage y `/api/user/preferences`. Pendiente: afinar pesos con datos reales.
10. **Sentimiento GDELT público** ✅ — Badge de tone_score visible en `/osint` (sección "Sentimiento GDELT") y en `OsintAlertsBanner` de fichas de país. Nueva API pública `/api/osint/signals`. Schema SQL actualizado.
11. **Admin calendario** ✅ — Página `/admin/calendario` con calendario mensual + notas del editor + timeline. API CRUD `/api/admin/editor-notes`.
12. **Publicado RRSS 15 May**: Bluesky ✅, Mastodon ✅, Telegram ❌ (fallo local, funciona en Vercel), X ✅ (manual). Revisar resultados.
13. **Trip Risk Score en viajes** ✅ — API `/api/trips/[id]/risk-score` con scoring por país+mes+perfil. Tabla visual en detalle de viaje con 4 dimensiones y score global. Lógica compartida en `src/lib/trip-risk-score.ts`. Pendiente: comparador de itinerarios (side-by-side Florencia vs Génova).

### Tareas a observar / backlog
1. **Groq para GDELT/RSS** — Clasificación semántica con Groq en vez de solo keywords para mejorar precisión de urgencia en señales OSINT
2. **Widget "Clima de viaje" en ficha de país** — Badge emocional (😊/😐/😟) basado en media de `tone_score` últimos 7 días para ese país
3. **Newsletter con sentimiento** — Incluir "🇪🇬 Egipto: sentimiento negativo esta semana (-6.2)" en el digest semanal
4. **Tendencias semanales de sentimiento** — Página o widget en admin con "países con mayor caída de sentimiento" (delta semanal de tone_score)
5. **Alertas de sentimiento** — Notificar cuando un país cruza umbral de negatividad (ej. tone_score < -7)
6. **Persistir tone_score en incidents** — Al clusterizar señales → incidentes, conservar el tone_score medio para mostrarlo en tarjetas de incidente
7. **Resultados RRSS 15 May** — Analizar engagement de Bluesky/Mastodon/X/Telegram
8. **Análisis frecuencia de palabras** — Tabla `osint_word_trends` para detectar spikes anómalos de términos (hantavirus, brotes, etc.) por comparación con media de 7 días
9. **Groq para toda señal OSINT** — Aplicar `classifySignal()` también a GDELT y RSS (hoy solo Reddit usa Groq; el resto usa keywords)

## PAUSED STATE (13 May 2026 — Sprint 13 May PM — Irán + Newsletter multicanal + Alertas web)
- **Irán añadido a paises.ts**: Entrada completa con embajada en Teherán, visa VOA, riesgo muy-alto, emergencias. Añadido a GPI, GTI, HDI, IPC indices — ya visible en mapa de KPIs. Referencias hardcode actualizadas (106+ → 108+).
- **Newsletter multicanal**: Nueva `social-publisher.ts` con `buildNewsletterSummary()` + publicación automática a Telegram canal, Mastodon, BlueSky y suscriptores Telegram. Integrado en `runWeeklyDigest()` del master cron. Sección "📱 Alertas activas" incluida en el HTML del newsletter.
- **Alertas web en dashboard**: Nueva sección "Alertas activas" en `/dashboard` que muestra suscripciones unificadas (web + Telegram). Cancelación desde la web elimina ambas. GET/DELETE `/api/alerts/subscribe` ahora usa sesión auth.
- **Alertas activas unificadas**: GET api mergea `user_id` + `telegram_chat_id` subscriptions cuando el perfil tiene `telegram_id` vinculado. Badge "Telegram" en las que vienen del bot.
- **Newsletter test enviado**: Edición #37 enviado a info@viajeinteligencia.com vía Resend (ID: 27af5e31). Sección Telegram visible en el HTML.

## PAUSED STATE (13 May 2026 — Sprint 13 May PM)
- **Alertas personalizadas vía Telegram**: Nuevo sistema completo:
  - Tabla `alert_preferences` en Supabase con soporte user_id + telegram_chat_id
  - `subscribeToCountry()`, `unsubscribeFromCountry()`, `unsubscribeAll()`, `getMySubscriptions()` en `telegram-channel.ts` con persistencia real en DB
  - Botón "🔔 Alertas personalizadas" en menú principal del bot
  - Comandos `/suscribir`, `/mis-alertas`, `/cancelar-alerta` + menú de gestión
  - Flujo: seleccionar país → suscribirse → recibe notificaciones cuando se detectan incidentes
- **Incident notifier** (`incident-notifier.ts`): Nueva función `notifySubscribers()` ejecutada tras `detectAndCreateIncidents()` en master cron (fase 5c/8). Busca incidentes recientes (5min), los matchea con suscripciones por país + severidad mínima + tipo de alerta, envía mensajes Telegram a cada suscriptor.
- **Thresholds ajustados**: protest expiry 12→24h, añadidas recomendaciones para travel_advisory y security_threat, expandido mapa de extracción de países (30+ países añadidos), signal cap 20→30.
- **Build fixes**: imports rotos en telegram route restaurados, type error de withTimeout manejado con type guard.

## PAUSED STATE (13 May 2026 — Sprint 13 May AM)
- **Admin premium bypass**: `checkPremium()` + `/api/subscription/check` devuelven `isPremium: true, status: 'admin'` si `user.email === ADMIN_EMAIL`. Env vars `ADMIN_EMAIL=mcasrom@gmail.com` en `.env.local` y `.env.vercel`.
- **Newsletter preview/tracking**: Endpoint `/api/newsletter/preview` + botón Vista Previa (Eye icon) en admin dashboard. Envío batch con `open_tracking: true` + `click_tracking: true` vía Resend API directa.
- **Blog post author**: Footer `*M. Castillo — ViajeInteligencia*` añadido a `content/posts/como-usar-ia-planificar-viajes-2026.md`.
- **GitHub Actions cron**: Workflow `.github/workflows/cron.yml` diario 06:00 UTC. Reemplaza Vercel cron (eliminado `crons` de `vercel.json`).
- **Cron fixes**: events fire-and-forget (29→17 países), us_state_dept timeout 20→30s, model_training/incidents Telegram summary trata resultados sin `status` como OK. Error detail en resumen Telegram. Duración 161s→~97s.
- **Compartir desde Chat IA**: Botón + formulario inline en `ChatClient.tsx`. Crea trip público via `POST /api/trips` con `is_public: true`. Link copiable.
- **Admin ML page**: `/admin/ml` con métricas último entrenamiento + tabla histórica 30 registros + narrativa explicativa. Link en admin dashboard.
- **Build fix**: `premium-check.ts` type error (`user.email ?? null`).
- **Deviaciones ML**: MAE riskScore=0.82, probUp7d=0.53%, desviación máx=7.28, 4 países con desviación.

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
- **Data**: `src/data/paises.ts` — 111 países (110 visibles + 1 oculta: Cuba) con riesgo MAEC
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

## Aviation OSINT Sprint (14 May 2026)
- **`src/data/airports.ts`**: Nueva base de datos OSINT con 90+ aeropuertos principales por país (IATA, coordenadas, ciudad). Fuente: OpenFlights/OurAirports (datos públicos). Incluye `getMainAirport()` y `getAirportCoordinates()`.
- **`src/app/api/ml/cost-estimate/route.ts`**: `estimateFlightCost()` reescrita. Ya NO usa valores hardcode por continente (Europa=100€, Asia=600€...). Ahora calcula con:
  - Distancia haversine real entre aeropuertos de origen y destino
  - Precio actual del petróleo Brent (factor de ajuste)
  - Estacionalidad turística del país destino
  - Multiplicador por presupuesto (bajo/medio/alto/luxury)
  - Coste mínimo de 29€
  - Fallback: continentes si faltan coordenadas de aeropuerto
- **`src/lib/opensky.ts`**: Nueva integración OpenSky Network (gratis, sin API key). Obtiene recuento de vuelos activos en el espacio aéreo de 20+ países en zonas de conflicto. Incluye `getAirspaceStatuses()`, `detectAnomalousAirspace()` con bounding boxes por país.
- **`src/app/api/cron/master/route.ts`**: `runAirspaceOsint()` ahora consulta OpenSky para países en conflicto (RU, UA, SY, LY, YE, AF, IQ, SO, SD, IR, IL, LB). Logea anomalías (espacio aéreo con 0 vuelos) en tabla `opensky_logs`.
- **`src/app/api/aviation/airspace/route.ts`**: Nuevo endpoint GET. Modos: `?mode=status` (vuelos activos por país), `?mode=anomalies` (solo países con 0 vuelos), `?codes=RU,UA,IR` (filtrar).
- **`supabase/opensky_logs.sql`**: Tabla para persistir datos OpenSky con índices por país y timestamp.

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

## Outreach Calendar

| Día | Plataforma | Acción | Estado |
|-----|-----------|--------|--------|
| Día 1 | Telegram canal | Versión larga | ✅ #74 |
| Día 1 | BlueSky | Versión corta | ✅ 3mlrcpyn5dy22 |
| Día 1 | Mastodon | Versión media | ✅ 116569531941028335 |
| Día 1 | X/Twitter | Versión corta | ⏳ manual (OAuth) |
| Día 2 | Reddit r/SideProject | Versión inglés | ⏳ (pendiente crear cuenta) |
| Día 2 | Reddit r/digitalnomad | Participar megathread | ⏳ (pendiente crear cuenta) |
| Día 3 | LosViajeros | Post foro + firma | ⏳ |
| Día 3 | Foro de Viajeros | Post foro + firma | ⏳ |
| Día 4 | Facebook grupos (Gurú de Viaje, Comunidad Viajeros) | Versión media | ⏳ |
| Día 5 | Email bloggers/agencias | Outreach 5-10 | ⏳ |

## Next Steps

1. **📢 Outreach** — Reddit (r/SideProject, r/digitalnomad), foros de viajeros (LosViajeros, Foro de Viajeros), Facebook grupos
2. **✈️ FlightLabs en Reclamaciones** — Registrar RapidAPI + FlightLabs, crear endpoint `/api/flights/verify-delay`
3. **🤖 ML temporal** — Esperar ~22 días para validación temporal CV. Expandir features RF (tasas de cambio, clima, visados)
4. **🎯 Afinar pesos ScoreBadge** — Ajustar pesos de riesgo/season/coste/perfil con datos reales de uso
5. **🔗 Vinculación Telegram** — Probar flujo completo `/vincular` → bot confirma
6. **📊 Resultados RRSS 15 May** — Analizar engagement de Bluesky/Mastodon/X/Telegram
7. **🧭 Comparador de itinerarios** — Página o modal para comparar 2+ viajes lado a lado con tabla de scores (riesgo, temporada, coste, perfil). Ej: "5 días Florencia vs 5 días Génova". Usar `/api/trips/[id]/risk-score` por cada viaje.

## Recurring Tasks
- **Daily (post-deploy)**: Verify `/api/cron/train-models` completes successfully (R² > 0.95, < 300s).
- **Daily (post-deploy)**: Verify `/api/cron/compare-models` — check no new countries with large RF vs heuristic deviation (>5 points riskScore, >5% probUp).
- **Weekly**: Review `maec_risk_history` data accumulation. Once 30+ days of history exist, run temporal CV on `/api/cron/validate-models` and compare RF predictions against actual risk changes.
- **Weekly**: Update AGENTS.md ML summary with latest comparison/validation metrics.

## False Positives (Audit Tools)
- `@mybloggingnotes` links — old cached content, removed from live site
- WhatsApp number — not present in current codebase
- Duplicate emails — audit tool cache issue
