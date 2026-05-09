# PLAN: Viajero Inteligente 2.0

## Objetivos
1. Eliminar datos hardcodeados → OSINT real
2. Auto-auditado con auto-gestión de errores + notificar admin@
3. Consolidar código
4. Optimizar UX sin abrumar (KPIs, no tablas)
5. Optimizar ML

---

## Prioridad 1: Consolidar código (pre-requisito)

| # | Tarea | Archivos | Esfuerzo | Estado |
|---|-------|----------|----------|--------|
| 1.1 | Eliminar `gpi.ts` (duplicado de `indices.ts`) | `src/data/gpi.ts` | 5 min | pendiente |
| 1.2 | Unificar logging estructurado (reemplazar `console.log`) | ~40+ archivos | 1 día | pendiente |
| 1.3 | Tipar todas las respuestas de API con Zod | ~30 rutas API | 2 días | pendiente |
| 1.4 | Mover datos estáticos (seguros.json, mochilero-premium) a Supabase | 2 archivos | 1 día | pendiente |

## Prioridad 2: OSINT real — reemplazar hardcoded data

| # | Tarea | Hardcoded reemplazado | Esfuerzo | Estado |
|---|-------|----------------------|----------|--------|
| 2.1 | Paises en Supabase — migrar `paises.ts` (~2000 líneas) a tabla `paises` con caché KV | `src/data/paises.ts` | 3 días | pendiente |
| 2.2 | Índices vivos — GPI (visionofhumanity.org), HDI (undp.org), IPC (IMF/WB APIs) | `src/data/indices.ts` | 1 día | pendiente |
| 2.3 | TCI real-time — Brent vía Yahoo, seasonality vía NOAA/Weather, airspace vía OpenSky | `src/data/tci-engine.ts` | 2 días | pendiente |
| 2.4 | Events — ya hay Supabase + Wikidata + GDELT; eliminar `events-fallback.ts` cuando live data sea fiable | `src/lib/events-fallback.ts` | ½ día | pendiente |

## Prioridad 3: Auto-auditado + auto-gestión de errores

| # | Tarea | Esfuerzo | Estado |
|---|-------|----------|--------|
| 3.1 | Sentry para error tracking en producción (plan gratuito) | ½ día | pendiente |
| 3.2 | Circuit breakers para APIs externas (GDELT, Groq, Yahoo, MAEC) | 1 día | pendiente |
| 3.3 | Webhook de alertas — N fallos consecutivos en scraper → email + Telegram | ½ día | pendiente |
| 3.4 | Healthcheck endpoint público (`/api/health`) | ½ día | pendiente |
| 3.5 | Auto-repair: Supabase vacío → Wikidata → GDELT antes de fallback | ya parcial | pendiente |

## Prioridad 4: ML real (no hand-rolled)

| # | Tarea | Esfuerzo | Estado |
|---|-------|----------|--------|
| 4.1 | Feature store en Supabase — tabla `ml_features` con país, fecha, features normalizados | 1 día | pendiente |
| 4.2 | Pipeline de entrenamiento semanal vía cron (scikit-learn via subprocess o API) | 2 días | pendiente |
| 4.3 | Modelo de predicción de riesgo con features históricas | 2 días | pendiente |

## Prioridad 5: UX — KPIs y experiencia sin abrumar

| # | Tarea | Esfuerzo | Estado |
|---|-------|----------|--------|
| 5.1 | Dashboard del viajero con KPIs: países visitados, alertas activas, próximos eventos, riesgo global | 1 día | pendiente |
| 5.2 | Feed inteligente en lugar de tablas — cards: "Tu viaje a Tailandia", "Alerta en Japón", "TCI bajó en Portugal" | 2 días | pendiente |
| 5.3 | Recomendaciones 1-click — perfil + presupuesto → destinos | 1 día | pendiente |
| 5.4 | Seguimiento de viaje — fechas → notificaciones pre/post viaje | 1 día | pendiente |

---

## Orden recomendado

1. **1.1 + 1.3** — consolidación rápida (½ día)
2. **2.2** — índices vivos (1 día) — alto impacto visible, bajo esfuerzo
3. **3.1 + 3.3** — Sentry + alertas (1 día) — seguridad para el resto
4. **2.1** — paises a Supabase (3 días) — el gran cambio
5. **5.1 + 5.2** — dashboard + feed (2 días) — UX visible
6. **4.1** — feature store (1 día) — base para ML real

## No recomendado (por ahora)
- Migrar `seguros.json` a API real — no hay API pública de aseguradoras
- Eliminar `events-fallback.ts` — buena red de seguridad

---

*Creado: 09 May 2026*
