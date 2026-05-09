# PLAN: Viajero Inteligente 2.0

## Objetivos
1. Eliminar datos hardcodeados → OSINT real
2. Auto-auditado con auto-gestión de errores + notificar admin@
3. Consolidar código
4. Optimizar UX sin abrumar (KPIs, no tablas)
5. Optimizar ML

---

## Prioridad 1: Consolidar código — ✅ COMPLETADO

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 1.1 | Eliminar `gpi.ts` (duplicado de `indices.ts`) | `src/data/gpi.ts` | 5 min | ✅ |
| 1.2 | Logger estructurado (createLogger + timestamps/levels) | ~30 archivos críticos | 1 día | ✅ |
| 1.3 | Zod en API routes (api-schemas.ts + validación) | ~7 rutas API | 2 días | ✅ |
| 1.4 | Datos estáticos (seguros.json, premium) a Supabase | 2 archivos + 2 APIs | 1 día | ✅ |

## Prioridad 2: OSINT real — reemplazar hardcoded data

| # | Tarea | Hardcoded reemplazado | Esfuerzo | Estado |
|---|-------|----------------------|----------|--------|
| 2.1 | Paises en Supabase — migrar `paises.ts` (~2000 líneas) a tabla `paises` con caché KV | `src/data/paises.ts` | 3 días | pendiente |
| 2.2 | Índices vivos — GPI/GTI/HDI/IPC desde Supabase + API | `src/data/indices.ts` | 1 día | ✅ |
| 2.3 | TCI real-time — Brent vía Yahoo, seasonality vía NOAA, airspace vía OpenSky | `src/data/tci-engine.ts` | 2 días | en progreso |
| 2.4 | Eliminar `events-fallback.ts` (cuando live data sea fiable) | `src/lib/events-fallback.ts` | ½ día | no recomendado |

**Nota 2.3 (TCI):** El análisis `/analisis` usa `tci-engine.ts` que tiene ~350+ valores hardcodeados:
- 29 precios Brent históricos (OIL_BRENT_HISTORY)
- 13 cierres de espacio aéreo + 15 rutas afectadas (fallback)
- 264 valores de estacionalidad (SEASONALITY_MAP)
- Mapeo de demanda extra por país (getDemandShiftAnalysis)
- Ya existe tabla `oil_price_history` en Supabase cron-alimentada
- Faltan tablas `airspace_closures` + `affected_routes` + `seasonality`

## Prioridad 3: Auto-auditado + auto-gestión de errores — ✅ COMPLETADO

| # | Tarea | Esfuerzo | Estado |
|---|-------|----------|--------|
| 3.1 | Sentry config files creados (needs SENTRY_DSN env) | ½ día | ✅ (falta env) |
| 3.2 | Circuit breakers para APIs externas (Groq integrado) | 1 día | ✅ |
| 3.3 | Webhook de alertas — trackFailure + Telegram + email | ½ día | ✅ |
| 3.4 | Healthcheck endpoint `/api/health` | ½ día | ✅ |
| 3.5 | Auto-repair: Supabase → Wikidata → GDELT → fallback | parcial | ✅ |

## Prioridad 4: ML real (no hand-rolled)

| # | Tarea | Esfuerzo | Estado |
|---|-------|----------|--------|
| 4.1 | Feature store en Supabase — tabla `ml_features` | 1 día | ✅ completado |
| 4.2 | Pipeline de entrenamiento semanal vía cron | 2 días | pendiente |
| 4.3 | Modelo de predicción de riesgo con features históricas | 2 días | pendiente |

## Prioridad 5: UX — KPIs y experiencia sin abrumar

| # | Tarea | Esfuerzo | Estado |
|---|-------|----------|--------|
| 5.1 | Dashboard del viajero con KPIs | 1 día | ✅ completado |
| 5.2 | Feed inteligente (cards en lugar de tablas) | 2 días | ✅ completado |
| 5.3 | Recomendaciones 1-click — perfil + presupuesto → destinos | 1 día | ✅ completado |
| 5.4 | Seguimiento de viaje — fechas → notificaciones | 1 día | pendiente |

## Bugs recientes corregidos (09 May)
- ShareTrip: usa getBrowserClient() (sesión SSR en cookies, no localStorage)
- send-invite API: envía email vía Resend al invitar por correo
- Eventos país: EventTimeline recibía nombre ("Alemania") en vez de código ("de")
- Documentos: caveat almacenamiento local exclusivo añadido

## Quick Wins — User Acquisition (09 May)
- **ShareButtons en país**: Botón compartir (WhatsApp/Telegram/Twitter/FB/LinkedIn/Email) en sticky header de todas las páginas de país
- **Internal links blog → país**: Añadidos enlaces `/pais/{code}` + `/checklist` a 17 posts "es-seguro-viajar-*" que no tenían ningún enlace interno
- **Newsletter popup landing**: Slide-in desde esquina inferior derecha a los 25s, ofrece Checklist PDF gratis a cambio de email. Dismissible, localStorage 7 días
- **@keyframes slide-up**: Añadida animación faltante en globals.css (usada por InstallPWA y NewsletterPopup)

---

## Orden recomendado (próximos pasos)

1. **2.3 TCI real-time** — migrar airspace_closures + affected_routes a Supabase (½ día, impacto alto en /analisis)
2. **5.1 + 5.2** — dashboard + feed (2 días) — UX visible para usuarios logueados
3. **2.1** — paises a Supabase (3 días) — el gran cambio, libera ~2000 líneas
4. **4.1** — feature store (1 día) — base para ML real

## No recomendado (por ahora)
- Migrar `seguros.json` a API real — no hay API pública de aseguradoras
- Eliminar `events-fallback.ts` — buena red de seguridad

---

*Creado: 09 May 2026 · Última actualización: 09 May 2026*
