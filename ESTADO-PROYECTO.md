# ESTADO DEL PROYECTO — 07 May 2026

---

## LO CONSEGUIDO

### Fase 1 — Completada ✓

| # | Funcionalidad | Estado | Notas |
|---|---------------|--------|-------|
| 1 | Mapa de riesgo interactivo | ✅ | Leaflet + MAEC 110 países |
| 2 | Calculadora de costes TCI | ✅ | Ajustado a petróleo + conflictos |
| 3 | Blog con 61 artículos | ✅ | Paginación, búsqueda, categorías, grid/list |
| 4 | Chat IA de viajes | ✅ | Groq dual (8b free / 70b premium) |
| 5 | Sistema OSINT automático | ✅ | 73 fuentes: Reddit, GDELT, USGS, RSS |
| 6 | Detector de incidentes | ✅ | Clustering señales → 10 tipos incidentes |
| 7 | Newsletter semanal | ✅ | Groq + HTML template, double opt-in |
| 8 | Página pública /osint | ✅ | Incidentes + recomendaciones + notas analista |
| 9 | Sistema de valoraciones | ✅ | Rating genérico para cualquier entidad |
| 10 | Notas de analista | ✅ | Admin panel + API REST |
| 11 | Cron master unificado | ✅ | ~95s, 8 tareas en paralelo, Vercel Hobby |
| 12 | Auth Supabase | ✅ | Magic link + password + Telegram |
| 13 | Dashboard usuario | ✅ | Favoritos, trips, perfil |
| 14 | Reclamaciones | ✅ | 8 tipos, plantillas gratis/premium |
| 15 | Rutas temáticas España | ✅ | K-Means + preferencias |
| 16 | Comparador de países | ✅ | Lado a lado con indicadores |
| 17 | Página /decidir | ✅ | Internacional (107) + España (20) |
| 18 | Transparencia operativa | ✅ | Estado sistema + fuentes + métricas |
| 19 | Manifiesto fundador | ✅ | /manifiesto + blog + newsletter |
| 20 | SEO + sitemap | ✅ | 60+ posts indexados, metadata |

### Infraestructura

| Métrica | Valor |
|---------|-------|
| Cron optimizado | ~95s (antes 150s, -37%) |
| Coste operativo | ~€0/mes (Hobby + Groq free) |
| Deploy | Automático en push a main |
| Fuentes activas | 73+ (MAEC, USGS, GDACS, GDELT, Reddit, RSS, Yahoo) |
| Países cubiertos | 107 con riesgo + TCI |
| Incidentes detectados | 10 tipos con expiración automática |
| Artículos blog | 61 publicados |

### Documentación

| Fichero | Contenido |
|---------|-----------|
| `guia-usuario.org` | Funcionalidades para el viajero + diagramas PlantUML |
| `guia-gestor.org` | Arquitectura, cron, DB schema, troubleshooting + diagramas |
| `analisis-ejecutivo.org` | Propuesta de valor, métricas, monetización, roadmap + diagramas |

---

## OPCIONES PENDIENTES — Priorizadas

### 🔴 ALTA PRIORIDAD — Impacto inmediato

#### 1. ML Predictivo — Predecir cambios de riesgo
**Problema**: Ahora reaccionamos a cambios MAEC. Deberíamos anticiparlos.
**Solución**:
- Modelo de clasificación que cruce: historial MAEC + señales OSINT + precio petróleo + estacionalidad
- Features: `irv_history_30d`, `osint_signal_count_7d`, `oil_price_change`, `season_index`, `gdacs_events_nearby`, `gti_country_score`
- Output: probabilidad de cambio de nivel MAEC en próximos 7/14/30 días
**Tech**: Python scikit-learn (RandomForest o XGBoost) → exportar como API serverless
**Coste**: ~€0 (Vercel serverless + modelo pre-entrenado)
**Tiempo**: 2-3 sprints
**Impacto**: Diferenciador único vs competencia

#### 2. Chat IA — Mejoras críticas
**Problema actual**:
- Rate limit client-side (localStorage, fácil de burlar)
- Sin historial de conversaciones
- Sin contexto de usuario (favoritos, trips, alertas)
- Sin capacidad de generar itinerarios detallados

**Mejoras**:
| Mejora | Descripción | Complejidad |
|--------|-------------|-------------|
| Rate limit server-side | Vincular a usuario/session IP, no localStorage | Baja |
| Historial conversaciones | Guardar en Supabase, recuperar por usuario | Media |
| Contexto personalizado | El chat sabe tus favoritos, trips, alertas activas | Media |
| Generador itinerarios | Output estructurado: día a día con costes, horarios, transporte | Alta |
| Tool use | El chat puede consultar mapa, calculadora, OSINT en tiempo real | Alta |
| Voz | Speech-to-text + text-to-speech para móvil | Media |

#### 3. Stripe — Monetización real
**Problema**: No hay forma de cobrar. Premium es un toggle en UI sin backend check.
**Solución**:
- Stripe Checkout para suscripción mensual (€4.99)
- Webhook → actualizar perfil usuario en Supabase
- Proteger rutas premium: chat 70b, dashboard avanzado, alertas personalizadas
**Tiempo**: 1 sprint

#### 4. API Pública — B2B
**Problema**: Empresas (agencias, aseguradoras) no pueden consultar nuestros datos programáticamente.
**Solución**:
- `/api/v1/risk/{country}` → IRV + MAEC + trend
- `/api/v1/incidents` → incidentes activos filtrables
- `/api/v1/tci/{country}` → Travel Cost Index + desglose
- API keys + rate limiting + billing
**Tech**: Next.js API routes + Supabase `api_keys` table
**Coste**: €0 para empezar, escalar con Stripe billing
**Tiempo**: 2 sprints

---

### 🟡 MEDIA PRIORIDAD — Crecimiento

#### 5. PWA — App móvil
**Problema**: Los viajeros usan móvil en ruta, no desktop.
**Solución**:
- Manifest + service worker (Next.js PWA plugin)
- Offline: mapa de riesgo cacheado, últimas alertas
- Push notifications: alertas de riesgo en tiempo real
- Icon homescreen, splash screen
**Tiempo**: 1-2 sprints

#### 6. Dashboard Premium personalizado
**Problema**: Dashboard actual es genérico. Premium quiere personalizado.
**Solución**:
- Widget de favoritos con alertas activas
- Gráfico IRV histórico (últimos 30/60/90 días)
- Resumen de trips pasados con valoraciones
- Newsletter archive con todos los briefings
- Exportar datos (CSV, PDF)
**Tiempo**: 2 sprints

#### 7. Integración aerolíneas — Datos reales vuelos
**Problema**: TCI usa estimaciones. Datos reales de vuelos mejorarían precisión.
**Solución**:
- FlightLabs API o AviationStack (ya tenemos keys)
- Precio real de vuelos SP→destino
- Delays, cancelaciones en tiempo real
- Impacto en TCI: reemplazar estimación por dato real
**Tiempo**: 1 sprint

#### 8. Comunidad de viajeros
**Problema**: Las valoraciones actuales son anónimas. Perfiles generarían engagement.
**Solución**:
- Perfiles públicos (avatar, países visitados, valoraciones)
- Favoritos compartidos
- "Viajeros que visitaron X también fueron a Y"
- Leaderboard: más países visitados, mejores valoraciones
**Tiempo**: 2-3 sprints

---

### 🟢 BAJA PRIORIDAD — Escala futura

#### 9. Versión en inglés
**Mercado**: Global, no solo hispanohablante.
**Solución**:
- i18n Next.js (`next-intl`)
- Traducir UI + contenido blog (Groq para traducción automática)
- Dominio: viajeintelligence.com o viajeinteligencia.com/en
**Tiempo**: 3-4 sprints

#### 10. Partnerships aseguradoras
**Modelo**: B2B revenue share.
**Solución**:
- API de riesgo para cotización automática de seguros
- Widget embebible en webs de aseguradoras
- Revenue: €X por consulta o % por póliza vendida
**Tiempo**: Negociación + 1 sprint técnico

#### 11. Integración calendarios
**Problema**: Usuario planea viaje en Google Calendar pero no recibe alertas proactivas.
**Solución**:
- OAuth Google Calendar → detectar viajes futuros
- 7 días antes: email con briefing del destino
- 48h antes: alerta de incidentes activos
**Tiempo**: 1-2 sprints

#### 12. ML Clustering avanzado — Recomendaciones inteligentes
**Problema**: K-Means actual usa 4 clusters fijos. Puede mejorar.
**Solución**:
- Más features: presupuesto, clima preferido, tipo de viaje, duración
- Modelos: K-Means + DBSCAN + recomendación colaborativa
- "Viajeros como tú también fueron a..."
- Personalización por perfil de usuario
**Tiempo**: 2 sprints

---

## MATRIZ DE DECISIÓN

| Opción | Impacto | Complejidad | Coste | Tiempo | ROI |
|--------|---------|-------------|-------|--------|-----|
| 1. ML Predictivo | 🔴 Alto | 🟡 Media | €0 | 2-3 sprints | Muy alto |
| 2. Chat IA mejoras | 🔴 Alto | 🟡 Media | €0-50/mes | 1-2 sprints | Alto |
| 3. Stripe | 🔴 Alto | 🟢 Baja | 2.9% + €0.25 | 1 sprint | Muy alto |
| 4. API Pública | 🟡 Medio | 🟡 Media | €0 | 2 sprints | Alto |
| 5. PWA | 🟡 Medio | 🟢 Baja | €0 | 1 sprint | Medio |
| 6. Dashboard Premium | 🟡 Medio | 🟡 Media | €0 | 2 sprints | Medio |
| 7. Aerolíneas datos | 🟡 Medio | 🟢 Baja | €0 (APIs free) | 1 sprint | Medio |
| 8. Comunidad | 🟢 Bajo | 🟡 Media | €0 | 2-3 sprints | Bajo |
| 9. Versión inglés | 🟢 Bajo | 🔴 Alta | €0 | 3-4 sprints | Largo plazo |
| 10. Aseguradoras | 🟢 Bajo | 🟡 Media | Negociación | Variable | Alto si cierra |
| 11. Calendarios | 🟢 Bajo | 🟡 Media | €0 | 1-2 sprints | Bajo |
| 12. ML Clustering | 🟢 Bajo | 🔴 Alta | €0 | 2 sprints | Medio |

---

## SECUENCIA RECOMENDADA

### Sprint 1 (Inmediato)
1. **Stripe** — Habilitar monetización real
2. **Chat IA rate limit server-side** — Proteger API
3. **Chat IA historial** — Guardar conversaciones

### Sprint 2
4. **ML Predictivo** — Empezar data collection + feature engineering
5. **API Pública v1** — Endpoints básicos con auth

### Sprint 3
6. **PWA** — Manifest + service worker + push notifications
7. **Chat IA contexto personalizado** — Vincular con favoritos/trips

### Sprint 4
8. **ML Predictivo v2** — Entrenar modelo + deploy API
9. **Dashboard Premium** — Widgets personalizados

### Sprint 5+
10. **Comunidad** → **Calendarios** → **Aseguradoras** → **Inglés**

---

*Generado automáticamente — 07 May 2026*
