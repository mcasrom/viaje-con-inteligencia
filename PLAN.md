# PLAN TOMORROW — 07 May 2026

## 🎯 Prioridad 1 — Newsletter (~2h)
- Resend integration
- Suscripción form en Home + Footer
- Primer email de bienvenida
- Endpoint `/api/newsletter/subscribe`

## 🎯 Prioridad 2 — Blog Posts (~3h)
- 3-5 posts reales indexables (no placeholder)
- Estructura `/blog/[slug]` con SEO
- OpenGraph + canonical URLs

## 🔧 Prioridad 3 — Fuentes OSINT RRSS
- Mastodon/ActivityPub (open, gratis)
- Telegram canales públicos de alertas
- Bluesky API (abierta)
- Evaluar Reddit coverage vs nuevas fuentes

## 🔧 Prioridad 4 — Consolidación Código
- Eliminar `/pt/page.tsx` y refs PT
- Limpiar `layout.tsx` (hrefLang pt)
- Limpiar `sitemap.ts` (pt)
- Limpiar `telegram/route.ts` (PT lang option)
- Eliminar `.bak` / archivos muertos
- Lint + TypeScript check
- Build + deploy final

## 🤖 Prioridad 5 — ML Real (Fase 1)
- Microservicio Python en Vercel Serverless
- scikit-learn para K-Means y Regresión Lineal real
- Reemplazar implementaciones manuales en TS
- Entrenar con datos INE + MAEC + petróleo
- Endpoints: `/api/ml/recommend`, `/api/ml/predict-tci`

## 📋 Backlog (después de arriba)
- Sitemap.xml + Robots.txt (~1h)
- PWA (~3h)
- Admin Dashboard OSINT (~2h)
- Analytics eventos (~1h)
- Favoritos/Guardar viajes (~4h)
- Itinerario IA descargable (~3h)
- Comparador visual (~5h)

## 🔬 ML Implementation Roadmap (para desarrollo futuro)
### Fase 1 — Rápido (1-2 días)
- Microservicio Python en Vercel Serverless Functions
- scikit-learn: K-Means + Regresión Lineal real
- Entrenar con datos INE + MAEC + petróleo
- Predecir: mejor destino, mejor fecha, riesgo real
- Reemplazar código manual de `clustering.ts` y `tci-engine.ts`

### Fase 2 — Medium (1 semana)
- K-Means con sklearn (mejor calidad de clusters)
- Random Forest para clasificar "destino ideal" por perfil
- Time series forecasting (Prophet o ARIMA) para TCI
- Feedback loop: corregir predicciones con datos reales

### Fase 3 — Advanced (2-3 semanas)
- Collaborative filtering basado en comportamiento de usuarios
- NLP para OSINT signals (sentiment analysis)
- Anomaly detection para crisis emergentes
- Sistema de recomendación híbrido

## 📊 Estado actual del ML en la web
| Feature | Técnica actual | Archivo | Problema |
|---|---|---|---|
| K-Means Clustering | K-Means custom TS | `src/data/clustering.ts` | Sin entrenamiento real |
| TCI Engine | Regresión lineal + MA | `src/data/tci-engine.ts` | Fórmulas fijas, no aprenden |
| Predicción petróleo | Regresión + EMA | `src/app/api/oil-ml-analysis/route.ts` | Sin modelo estadístico robusto |
| Recomendaciones | Scoring ponderado | `src/data/clustering.ts` | Sin ML real, solo reglas |
| INE Tourism | Regresión lineal | `src/app/api/ine/ml-clustering/route.ts` | Fallback a datos hardcoded |
| IST | Fórmula fija | `src/app/api/ist/route.ts` | No ajusta pesos por acierto |
| Cost Estimate | Stub vacío | `src/app/api/ml/cost-estimate/route.ts` | PLACEHOLDER |

## 🚫 Descartado por ahora
- Portugués (i18n PT) — baja prioridad para este sector
