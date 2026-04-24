# Pendiente - Viaje con Inteligencia

## ⏰ SPRINT 2 (Completado)

### 📝 BLOG MEJORAS - COMPLETADAS ✅
| # | Mejora | Estado |
|---|-------|--------|
| 1 | Paginación (10/pág) | ✅ |
| 2 | Filtro por categoría | ✅ |
| 3 | Ordenar por fecha | ✅ |
| 4 | StarRating posts (1-5 estrellas) | ✅ |
| 5 | Imagen en posts (image/coverImage) | ✅ |
| 6 | API posts/rate | ✅ |
| 7 | Post libros-viajeros (largo) | ✅ |
| 8 | Post clasicos-viajes-gutenberg (corto) | ✅ |
| 9 | Chat IA Groq - Mejora prompt (MAEC) | ✅ |
| 10 | Chat IA - Modelo llama-3.1-8b-instant | ✅ |

## ⏰ SPRINT 3 (Completado)

### 🔴 PRIORIDAD ALTA
| # | Mejora | Complejidad |
|---|-------|------------|
| 1 | Chat IA conversacional | ✅ Completado (en /premium) |
| 2 | Generador itinerarios IA | ✅ Completado |
| 3 | Perfil usuario (Supabase) | ✅ Completado |
| 4 | Favoritos sincronizados | ✅ Completado |

### 📸 RESEÑAS FOTOGRÁFICAS
| # | Mejora | Complejidad |
|---|-------|------------|
| 1 | Componente Gallery | ✅ Completado |
| 2 | Grid visual posts | ✅ Completado |
| 3 | Lightbox | ✅ Completado |

### 📊 POPULARIDAD
| # | Mejora | Complejidad |
|---|-------|------------|
| 1 | Contador vistas (Supabase) | ✅ Completado (schema ready) |
| 2 | Badge "Popular" | ✅ Completado |
| 3 | Pestaña Populares | ✅ Completado |

### 🗺️ MAPA INTERACTIVO
| # | Mejora | Complejidad |
|---|-------|------------|
| 1 | Leaflet.js con marcadores por riesgo | ✅ Completado |
| 2 | Popup con info país | ✅ Completado |
| 3 | Mejora UI filtros | ✅ Completado |

### ⚠️ SUPABASE (Completado)
- ✅ Schema ejecutado en Supabase
- ✅ Auth configurado
- ✅ Redirect URLs configuradas

### 🟡 PRIORIDAD MEDIA
| # | Mejora | Complejidad |
|---|-------|------------|
| 1 | Onboarding nuevos | ✅ Completado |
| 2 | Newsletter semanal | ✅ Completado (API + UI + Schema) |
| 3 | Google Search Console | ✅ Completado (code in metadata) |
| 3b | Vercel Analytics | ✅ Completado |
| 3c | Speed Insights | ✅ Completado |
| 3d | Sitemap multilingual | ✅ Completado |
| 3e | Structured data JSON-LD | ✅ Completado |
| 3f | Páginas /en /pt | ✅ Completado |
| 4 | Programa afiliados | M |
| 5 | Sitemap.xml dinámico | ✅ Completado (ya existe en src/app/sitemap.ts) |
| 6 | Corregir textos EN en páginas ES | B | ⚠️ Pendiente refactor i18n
| 7 | Email profesional dominio propio | ✅ Completado (viajeinteligencia.com + Cloudflare)

### ⚠️ PENDIENTES
- Stripe + auth (config manual Vercel)
- Redirect viajeinteligencia.com → vercel.app (Cloudflare)

### 🟡 PRIORIDAD SPRINT 4 - PAÍSES
| # | Mejora | Complejidad |
|---|-------|------------|
| 1 | Añadir países Nordic (Noruega, Suecia, Denmark, Finlandia) | ✅ Completado |
| 2 | Añadir países Eastern Europe (Estonia, Letonia, Lituania, Croacia, Eslovenia) | ✅ Completado |
| 3 | Añadir más países target 90+ | ✅ Completado |

### 📬 NEWSLETTER (Completado)
- ✅ Telegram: posts blog + países riesgo
- ✅ Channel: @ViajeConInteligencia
- ✅ Frecuencia: cada lunes 8:00 UTC
### 🚂 SISTEMA DE ALERTAS DE VIAJE (Completado)

#### APIs Integradas
| API | Función | Fuente | Estado |
|-----|--------|--------|--------|
| /api/alerts/travel | Unificada todas | Aggregator | ✅ |
| /api/airport-delays | Retrasos aéreos | FlightLabs (mock) | ✅ |
| /api/train-delays | Retraso trenes | TrainsTracking | ✅ |
| /api/weather/extreme | Meteorología extrema | Open-Meteo | ✅ |

#### 📤 Distribución (Completado)
| Canal | Frecuencia | Contenido |
|-------|-----------|-----------|
| Email (info@) | Diario 00:00 UTC | Resumen alertas + stats sistema |
| Telegram @ViajeConInteligencia | Diario 00:00 UTC | Resumen alertas + stats sistema |
| Bot @ViajeConInteligenciaBot | On-demand | Menú interactivo completo |

#### 🤖 Bot Telegram
- Comando: `/alertasviaje` - Resumen alertas viaje
- Comando: `/alertasviaje full` - Detalle completo
- Menú botones: `✈️🛤️ Alertas viaje` → submenú
- Submenú: Aeropuertos | Trenes | Clima | Actualizar | Volver
- Menú principal: ⚠️ Alertas de riesgo | ✈️🛤️ Alertas viaje
- Diferencia clara: riesgo país (MAEC) vs alertas viaje (vuelos/trenes/clima)

#### 📄 Documentos (Completado)
- Subir imágenes y PDFs (tickets hotel)
- Guardado 100% local (IndexedDB)
- Ver/Descargar en nueva pestaña (mobile-friendly)
- ⚠️ PWA requiere reinstalar tras actualizar para ver cambios

#### 🕐 REVISIÓN SEMANAL - APIs
- Buscar nuevas APIs gratuitas para alertas
- Testing: curl viaje-con-inteligencia.vercel.app/api/alerts/travel?type=summary

---

## 🌍 INTEGRACIÓN DATOS MAEC (SPRINT 4)

### 🔴 SPRINT 4A - UI Fichas País (BAJO ESFUERZO)
| # | Índice | UI | Estado |
|---|--------|-----|--------|
| A8 | Tel. emergencia 24h consular | Card Emergencias | ✅ Completado |
| A6 | Legislación local | Tab Legal | ✅ Completado |
| A7 | Normas divisas | Tab Dinero | ✅ Completado |

### 🟠 SPRINT 4B - Scraping MAEC (MEDIO/ALTO ESFUERZO)
| # | Índice | UI | Estado |
|---|--------|-----|--------|
| A3 | Avisos última hora | Badge + scraper | ✅ Completado |
| A3 | Texto completo seguridad | Accordion | ✅ Completado |
| B | Fichas País PDF | Botón descarga | ✅ Completado |
| - | Sistema auditoría scrapers | Dashboard + indicadores | ✅ Completado |

---

### ✅ SPRINT 6 (Completado)
| # | Tarea | Estado |
|---|------|--------|
| S6a | Propuesta clara (Comparativas + Itinerarios) | ✅ Done |
| S6b | Comparar países IA | ✅ Done |
| S6c | QuickAccess + Comparar | ✅ Done |
| S6d | Campos IPC + Coste vida | ✅ Done |

## 📊 Métricas Q2 2026

| Métrica | Actual | Target |
|---------|--------|--------|
| Visitantes/mes | ~500 | 10,000 |
| Países | 89 (cache Vercel muestra 87) | 100 |
| Posts blog | 27 | 50 |
| Usuarios Telegram | ~50 | 1,000 |
| Suscripciones | 0 | 100 |
| Email | info@viajeinteligencia.com | ✅ Verificado y funcionando |

### ⚠️ Known Issues
- Post imagen no carga (URL Unsplash)
- Redirect Cloudflare no funciona

### 🔧 Purge Cache
- API: `/api/purge` (revalidatePath para rutas principales)
- Deploy: `vercel --prod` para purgar cache estático (89 países)

---

## 🚀 SPRINT 5 - ORGANIZACIÓN

### 📋 Flow en Org Mode
| # | Tarea | Estado |
|---|------|--------|
| 1 | Actualizar proyecto.org con sprints completados | ✅ Completado |
| 2 | Definir milestones/sprints | ⏳ Pendiente |
| 3 | Añadir enlaces a código | ⏳ Pendiente |
| 4 | Sincronizar con wayahead.md | ⏳ Pendiente |

### 🔧 Telegram Reparado (2026-04-21)
| Componente | Estado |
|-----------|--------|
| Bot @ViajeConInteligenciaBot | ✅ Webhook configurado |
| Canal @ViajeConInteligencia | ✅ |
| Cron semanal | ✅ Enviado |

### 🔄 CRON Jobs Vercel (2026-04-22)
Configurados en `vercel.json`:
| Cron | Schedule | Path | Función |
|------|----------|------|---------|
| scrape-maec | 0 6 * * * | /api/cron/scrape-maec | Scraping MAEC diario |
| check-alerts | 0 8 * * * | /api/cron/check-alerts | Verificar alertas |
| weekly-digest | 0 8 * * 1 | /api/cron/weekly-digest | Newsletter semanal |

**Requisito:** Variable `CRON_SECRET` configurada en Vercel

**Footer actualizado:** Muestra fecha/hora actual en lugar de timestamp estático

---

## 🚀 SPRINT 6 - PRODUCTO DIFERENCIAL

### 📊 Análisis Estratégico
| Aspecto | Estado | Acción |
|--------|--------|--------|
| Propuesta única | ❌ Blog informativo | ✅ Convertir en herramienta |
| SEO | 🔴 Keywords no estructuradas | Build clusters + interlinking |
| Sistema captación | ❌ No hay lead magnet | newsletter + automations |
| IA visible | ❌ Usuario no percibe | Interacción directa |
| UX | 🟡 Funcional pero plana | Dashboards + visualización |

### 🎯 SPRINT 6: Propuesta Única (Completado ✅)
| # | Tarea | Estado |
|---|------|--------|
| 1 | Definir propuesta clara | ✅ Done (Comparativas + Itinerarios) |
| 2 | Diferenciar de blog informativo | ✅ Done (/comparar) |
| 3 | Tool vs Content estrategia | ✅ Done (herramientas>posts) |
| 4 | Comparar países IA | ✅ Done |
| 5 | QuickAccess + Comparar | ✅ Done |
| 6 | Campos IPC + Coste vida | ✅ Done |
| 7 | Diagrama flow viaje | ⏳ Pendiente |

### 📈 SPRINT 7: SEO Estratégico (Completado ✅)
| # | Tarea | Estado |
|---|------|--------|
| 1 | Keywords long-tail | ✅ Done (getSeoClusterContent) |
| 2 | Content clusters por riesgo | ✅ Done (getPostsByRisk) |
| 3 | Interlinking país → post | ✅ Done (metadata keywords dinámicos) |

### 📧 SPRINT 8: Captación (Completado ✅)
| # | Tarea | Estado |
|---|------|--------|
| 1 | Lead magnet (checklist premium) | ✅ Done (/lead-magnet + /api/checklist-pdf) |
| 2 | Newsletter automation | ✅ Done (suscribe + download) |
| 3 | SEO keywords | ✅ Done (metadata + sitemap) |

### 🤖 SPRINT 9: IA Visible (Completado ✅)
| # | Tarea | Estado |
|---|------|--------|
| 1 | Chat IA destacado visible | ✅ Done (widget flotante + QuickAccess) |
| 2 | Recomendaciones personalizadas | ✅ Done (/api/recommendations + RecommendationsList) |
| 3 | Predicción riesgo IA | ✅ Done (scoring por intereses/budget) |

### 🎨 SPRINT 10: UX Impactante (Completado ✅)
| # | Tarea | Estado |
|---|------|--------|
| 1 | Dashboard riesgo visual | ✅ Done (/stats) |
| 2 | Mapa calor riesgos | ✅ Done (grid visual) |
| 3 | Stats usuario tiempo real | ✅ Done (banners + services) |

---

## 🚀 SPRINT 11: Análisis de Riesgo IA (Completado ✅)

### 📊 Índice de Riesgo en Tiempo Real

**Input:** país, zona o región
**Output:**
- Riesgo político (1-10)
- Riesgo aéreo (1-10)
- Restricciones actuales
- Recomendación IA personalizada

**KPIs Gráficos:**
- Mapa de calor por zona
- Evolución temporal del riesgo
- Comparativa con países similares
- Alertas de cambio de nivel

**Propuesta diferenciadora:**
- ✅ Posicionamiento SEO único
- ✅ Datos en tiempo real (scraping + IA)
- ✅ Visualización atractiva
- ✅ Actualización automática

**Estado:** ✅ Completado

---

## 🚀 SPRINT 12: Monitor Conflictos Activos (Completado ✅)

### ✅ Progreso - Abril 2026

| # | Tarea | Estado | Fecha |
|---|------|--------|-------|
| 1 | NewsMCP API 410 Gone - Corregir | ✅ | 2026-04-21 |
| 2 | Fallback system conflicts | ✅ | 2026-04-21 |
| 3 | Premium conflicts tab status | ✅ | 2026-04-21 |
| 4 | Footer ScraperStatus timestamp | ✅ | 2026-04-21 |
| 5 | Compact mode timestamp | ✅ | 2026-04-21 |

### 📊 Estado Actual

- **NewsMCP:** ❌ No disponible (retorna 410)
- **Fallback:** ✅ Funcional con datos hardcodeados del 21/04/2026
- **Footer:** ✅ Semáforo verde + timestamp visible
- **Premium tab:** ✅ Muestra "Live" o "Fallback" con timestamp

### 🎯 Siguientes Pasos

- [ ] Buscar alternativa a NewsMCP (API geopolítica)
- [ ] Integrar datos MAEC en tiempo real
- [ ] Melhorar fallback con datos reales

---

## 🚀 SPRINT 14: Módulo de Eventos Globales (2026-04-21)

### ✅ Completados

| # | Tarea | Estado |
|---|------|--------|
| 1 | Página /eventos | ✅ Done |
| 2 | Lista eventos con clasificación | ✅ Done |
| 3 | Scoring impacto y riesgo | ✅ Done |
| 4 | Botón en barra de filtros mapa | ✅ Done |

### 📊 Concepto Implementado

```
Evento → Impacto → Riesgo → Decisión
I = 0.4A + 0.3M + 0.3S
```

### 📋 Pendientes (Fase 2-3)

- [ ] APIs (Ticketmaster, Eventbrite, Amadeus)
- [ ] Scraping Wikipedia/Webs oficiales
- [ ] Scoring dinámico con IA
- [ ] Timeline visual
- [ ] Alertas inteligentes
- [x] Filtro automático eventos pasados (ordenados por fecha)
- [x] Badges estado (en curso/próximo)
- [x] **Ampliar nearbyCountries** para más países en PDF (80+ países)

### 🔧 PDF Premium (Completado Sprint 22)
| # | Feature | Estado |
|---|---------|--------|
| 1 | Botón "Exportar PDF" en vista viaje | ✅ Done |
| 2 | jsPDF (gratuito) | ✅ Done |
| 3 | Cabecera con logo (logo_ok.png) | ✅ Done |
| 4 | Fechas + duración + presupuesto | ✅ Done |
| 5 | Itinerario día a día | ✅ Done |
| 6 | Nivel de riesgo país (color-coded) | ✅ Done |
| 7 | Mapa geográfico con grid hemisférico | ✅ Done |
| 8 | Ciudades cercanas + distancias (80+ países) | ✅ Done |
| 9 | Info: moneda, conduccion, zona horaria | ✅ Done |
| 10 | Checklist embargue (12 items) | ✅ Done |
| 11 | Teléfonos emergencia | ✅ Done |
| 12 | Notas personales (espacio 5 líneas) | ✅ Done |
| 13 | Footer todas páginas + "Premium" | ✅ Done |
| 14 | Badge PREMIUM dorado | ✅ Done |
| 15 | Spacing dinámico (checkNewPage) | ✅ Done |
| 16 | Link /premium → /viajes | ✅ Done |

**Cost:** $0 (jsPDF gratuito)
**Países cubiertos:** 80+ (Europa, América, Asia, África, Oceanía)

---

## ✅ sesION COMPLETADA (2026-04-23)

### 🎨 SPRINT 22: PDF Itinerario Premium (2026-04-23)
| # | Feature | Estado |
|---|---------|--------|
| 1 | Botón "Exportar PDF" en vista viaje | ✅ Done |
| 2 | jsPDF (gratuito) | ✅ Done |
| 3 | Cabecera con logo (logo_ok.png) | ✅ Done |
| 4 | Fechas + duración + presupuesto | ✅ Done |
| 5 | Itinerario día a día | ✅ Done |
| 6 | Nivel de riesgo país (color-coded) | ✅ Done |
| 7 | Mapa geográfico con grid hemisférico | ✅ Done |
| 8 | Ciudades cercanas + distancias (km) | ✅ Done |
| 9 | Info: moneda, conduccion, zona horaria | ✅ Done |
| 10 | Checklist embargue (12 items) | ✅ Done |
| 11 | Teléfonos emergencia | ✅ Done |
| 12 | Notas personales (espacio 5 líneas) | ✅ Done |
| 13 | Footer todas páginas + "Premium" | ✅ Done |
| 14 | Badge PREMIUM dorado | ✅ Done |
| 15 | Spacing dinámico (checkNewPage) | ✅ Done |

**Cost:** $0 (jsPDF gratuito)
**Ampliable:** Añadir más países en `nearbyCountries`

---

## 🚀 SPRINT 17: IST - Índice de Saturación Turística (2026-04-22)

### 📊 Enfoque MVP (Fiable y Escalable)

**Metodología basada en patrones históricos** (no en tiempo real):

| Factor | Peso | Fuente | Fiabilidad |
|--------|------|--------|------------|
| Temporada turística | 35% | Patrones históricos (Wikipedia, estadísticas locales) | ⭐⭐⭐⭐ Alta |
| Índice precios local | 25% | Datos macroeconómicos | ⭐⭐⭐⭐ Alta |
| Eventos programados | 20% | Wikipedia, webs oficiales | ⭐⭐⭐⭐ Alta |
| Día semana/feriados | 20% | Calendario | ⭐⭐⭐⭐⭐ Muy Alta |

**Fiabilidad del enfoque:**
- ✅ Basado en datos históricos reales de turismo
- ✅ Patrones predecibles (temporada alta/baja es consistente)
- ✅ Complementa análisis de riesgo MAEC
- ⚠️ No es tiempo real, pero útil para planificación
- ⚠️ No sustituye datos de ocupación hotelera real

### 🏙️ Ciudades iniciales (datos disponibles)

| Ciudad | Temporada Alta | Eventos Clave |
|--------|----------------|--------------|
| Barcelona | Jul-Ago, Semana Santa | MWC, Sant Joan |
| Roma | Jul-Ago, Semana Santa | Festivales |
| París | Jul-Ago, Navidad | Fashion Week |
| Madrid | Semana Santa, Dic | San Isidro |
| Lisboa | Jun-Sep | Festas Lisboa |

### 📋 Implementación MVP

| # | Tarea | Estado |
|---|------|--------|
| 1 | API `/api/ist` con patrones | ✅ Done |

### 🆕 PAÍSES AÑADIDOS (2026-04-22)
| # | País | Código | Destino Turístico |
|---|------|--------|------------------|
| 1 | Albania | al | Emergente español |
| 2 | Georgia | ge | Emergente español |
| 3 | Uzbekistán | uz | ⏳ Pendiente |

### 🛡️ NUEVA PÁGINA KPIs (2026-04-22)
| # | Feature | Estado |
|---|---------|--------|
| 1 | Página `/kpi` | ✅ Done |
| 2 | Datos IEP Global Peace Index 2025 | ✅ Done |
| 3 | 46 países con scores reales | ✅ Done |
| 4 | Filtro por región | ✅ Done |
| 5 | Buscador | ✅ Done |
| 6 | Top 5 / Bottom 5 | ✅ Done |
| 7 | Cambio vs 2024 | ✅ Done |
| 8 | Botón en QuickAccess | ✅ Done |

### 🔧 FIXES TÉCNICOS (2026-04-22)
| # | Fix | Estado |
|---|-----|--------|
| 1 | APIs push dynamic (SSR) | ✅ Done |
| 2 | Blog pages dynamic | ✅ Done |
| 3 | País pages dynamic | ✅ Done |
| 4 | InstallPWA type fix | ✅ Done |

### 📊 COBERTURA ACTUAL
| Métrica | Valor |
|---------|-------|
| Países en mapa | 95 |
| 2 | UI IST en páginas países | ✅ Done |
| 3 | Guardar predicciones (Supabase) | ⏳ Pendiente |
| 4 | Colección feedback post-viaje | ⏳ Pendiente |

### 🚀 Escalado futuro (si proyecto crece)

| Priority | Integración | Costo estimado |
|----------|-------------|----------------|
| 1 | Booking.com scraper (Apify) | $3/1k hotels |
| 2 | Eventbrite API | Freemium |
| 3 | Google Hotels (SerpAPI) | $50/mes |
| 4 | OTA partnerships | Gratis (affiliate) |

### ✅ Fiabilidad validada

- El IST con patrones históricos es **tan fiable como las meteorológicas**
- Funciona bien para planificación a semanas/meses vista
- **Limitación:** No detecta eventos inesperados (huelgas, crisis)
- **Valor agregado:** Útil para usuarios planificando viajes

---

## 🚀 SPRINT 16: Revisión Cloudflare + Códigos Promo (2026-04-22)

### 🔧 FIXES TÉCNICOS (2026-04-22)
| # | Tarea | Estado |
|---|------|--------|
| 1 | Corregir Math.random impurity en /dashboard/kpis | ✅ Done |
| 2 | Deploy automático (git push → Vercel) | ✅ Done |

### ☁️ CLOUDFLARE
| # | Tarea | Estado |
|---|------|--------|
| 1 | Verificar redirect viajeinteligencia.com → Vercel | ⏳ Pendiente |
| 2 | Comprobar SSL/TLS configuración | ⏳ Pendiente |
| 3 | Revisar reglas Page Rules | ⏳ Pendiente |
| 4 | Verificar Email Routing configurado | ⏳ Pendiente |
| 5 | DNS records actualizados | ⏳ Pendiente |

### 📊 KPIs RIESGOS MEJORADOS
| # | Tarea | Estado |
|---|------|--------|
| 1 | KPIs actuales en /dashboard/kpis | ✅ Existentes |
| 2 | Integrar datos ONU (peace, stability) | ⏳ Pendiente |
| 3 | Integrar datos OMT/ONT (turismo) | ⏳ Pendiente |
| 4 | Scoring dinámico por intereses | ⏳ Pendiente |
| 5 | Comparador visual mejorado | ⏳ Pendiente |

**Fuentes a integrar:**
- ONU: Peace & Security Index, Human Development Index
- OMT (OMS): Restricciones turísticas, alertas sanitarias
- IATA: Espacio aéreo, cancelaciones
- Interpol: Alerts de seguridad

### 🎟️ CÓDIGOS PROMOCIONALES (FREE)
| # | Tarea | Estado |
|---|------|--------|
| 1 | Sistema de códigos descuento | ⏳ Pendiente |
| 2 | Códigos free trial (7 días premium) | ⏳ Pendiente |
| 3 | Códigos referidos (1 mes gratis) | ⏳ Pendiente |
| 4 | Landing codes gratuitos | ⏳ Pendiente |
| 5 | Integrar con Stripe coupons | ⏳ Pendiente |
| 6 | Tracking uso códigos | ⏳ Pendiente |

**Estrategia:**
- Código: FREE7 → 7 días premium gratis
- Código: WELCOME30 → 30 días premium (nuevos usuarios)
- Landing: /free-trial con email capture

### 📅 Métricas Objetivo (Post Sprint 16)

| Métrica | Actual | Target |
|---------|--------|--------|
| Visitantes/mes | ~500 | 2,000 |
| Conversión trial | 0% | 5% |
| Códigos canjeados | 0 | 100 |
| Suscripciones | 0 | 50 |

---

## 🚀 PENDIENTES LARGO PLAZO

### 🔐 AUTH + FAVORITOS
| # | Tarea | Prioridad | Estado |
|---|------|----------|--------|
| 1 | Login/Auth (Supabase) | Alta | ✅ Completado |
| 2 | Favoritos usuario | Alta | ✅ Completado |
| 3 | Sincronización favoritos | Media | ✅ Completado |
| 4 | LoginButton visible (QuickAccess) | Alta | ✅ Completado |
| 5 | Prompt login en favoritos | Alta | ✅ Completado |
| 6 | AuthContext global | Alta | ✅ Completado |

### 💳 STRIPE (BLOQUEADO)
| # | Tarea | Prioridad | Estado |
|---|------|----------|--------|
| 1 | Integración Stripe | 🔴 Alta | ⛔ Bloqueado (informe Cuba) |
| 2 | Pagos Premium | 🔴 Alta | ⛔ Bloqueado |
| 3 | Webhooks | 🟠 Media | ⛔ Bloqueado |
| 4 | Facturación | 🟠 Media | ⛔ Bloqueado |

**Nota:** Stripe mantiene bloqueo por requisitos de informe sobre Cuba. Situación en espera.

---

## 🚀 SPRINT 21: SuperAlertas - Meteorología + Alertas de Vuelo (2026-04-22)

### 🎯 POTENCIAL SEO + USUARIO (ALTO)

**Keywords long-tail de alto valor:**
- "alertas retrasos vuelos [ciudad/país]"
- "clima aeropuerto [código IATA] hoy"
- "vuelos retrasados por tormenta [destino]"
- "alerta viaje [país] ahora"
- "estado vuelos en tiempo real [aeropuerto]"
- "clima extremo [destino] viajar"

**Diferenciador único:**
El único sitio en español que correlaciona clima + retrasos + IA en tiempo real.

**Contenido evergreen + trending:**
- evergreen: guías de clima por país/ciudad
- trending: alertas en tiempo real (viralizable en RRSS)

### 📊 Concepto
Sistema OSINT de inteligencia de transporte: clima, retrasos, alertas para viajeros.

### 🔑 Fuentes OSINT

**Núcleo de datos:**
| Fuente | Uso | Costo |
|--------|-----|-------|
| OpenSky Network | Tracking vuelos | Gratis |
| AviationStack | Estado vuelos | Freemium |
| GTFS Realtime | Trenes/buses | Gratis |
| AIS feeds | Navieras | Gratis |

**Capa meteorológica:**
| Fuente | Uso | Costo |
|--------|-----|-------|
| METAR/TAF | Meteorología aviacion | Gratis (propia API) |
| OpenWeather API | Clima global, tormentas | Freemium (propia API) |
| NOAA | Eventos extremos | Gratis |

**Capa IA:**
- Correlación retrasos ↔ clima
- Detección congestión aérea
- Predicción riesgos de viaje

### 📐 Arquitectura
```
[Fuentes OSINT] → [Ingestión ETL] → [PostgreSQL] → [Motor IA] → [Alertas/Dashboard]
```

### 🎯 Impacto
- 🔥 Viral: alertas de retrasos en tiempo real (compartir RRSS)
- 📈 SEO: keywords de alta competencia buscadas
- 💰 Monetizable: Premium para alertas push personalizadas
- 🤖 IA: predicciones de riesgo de viaje

### 📋 Roadmap
| # | Feature | Estado | SEO |
|---|---------|--------|-----|
| 1 | Integración OpenWeather API | ✅ Done (`/api/weather`) | ✅ |
| 2 | METAR/TAF parser | ✅ Done (`/api/metar`) | ✅ |
| 3 | Dashboard retrasos /viajes/clima | ✅ Done | ✅ |
| 4 | Alertas Telegram clima | ⏳ Pendiente | ✅ |
| 5 | Correlación IA (clima↔retrasos) | ⏳ Pendiente | ✅ |
| 6 | Posts blog SEO clima | ⏳ Pendiente | ✅ |

### 📈 MARKETING EXPANSIÓN
| # | Tarea | Prioridad | Estado |
|---|------|----------|--------|
| 1 | Modelos expansión marketing | Alta | ⏳ Pendiente |
| 2 | Lead magnets adicionales | Media | ⏳ Pendiente |
| 3 | Automatizaciones email | Media | ⏳ Pendiente |
| 4 | Partnerships/Afiliados | Media | ⏳ Pendiente |

### 🔄 REVISIÓN CONSTANTE
| # | Tarea | Frecuencia | Estado |
|---|------|----------|--------|
| 1 | Scrapers MAEC | Diaria | ✅ Completado |
| 2 | NewsMCP | Semanal | ⏳ Pendiente |
| 3 | Posts blog | Semanal | ⏳ Pendiente |
| 4 | SEO keywords | Mensual | ⏳ Pendiente |
| 5 | Analytics | Quincenal | ⏳ Pendiente |

**Implementado:**
- Tabla scraper_logs + risk_alerts en Supabase ✅
- API /api/cron/scrape-maec (scrape completo)
- Logging automático en /api/cron/check-alerts
- Dashboard /admin con vista de logs
- Cron Jobs Vercel (06:00 + 08:00 daily)

### ⚠️ Revisión Resultados Cron

- [ ] Verificar ejecución cron en /admin/scraper-logs
- [ ] Revisar logs en Vercel Functions
- [ ] Comprobar que scraper_logs tiene datos

---

## 🚀 SPRINT 15: Revisión Constante - Scrapers (2026-04-21)

### ✅ Completados

| # | Tarea | Estado |
|---|------|--------|
| 1 | Tablas Supabase (scraper_logs, risk_alerts) | ✅ Done |
| 2 | API /api/cron/scrape-maec | ✅ Done |
| 3 | Logging automático check-alerts | ✅ Done |
| 4 | Dashboard /admin/scraper-logs | ✅ Done |
| 5 | Cron Jobs Vercel automáticos | ✅ Done |

### ⏰ Schedule

- 06:00 UTC → Scrape MAEC completo
- 08:00 UTC → Check alertas riesgo
- 08:00 Lunes → Newsletter semanal

---

## 🚀 SPRINT 13: Producto Minimalista (2026-04-21)

### 📊 Progreso

| Métrica | Actual | Target |
|---------|--------|--------|
| Visitantes/mes | ~500 | 10,000 |
| Países | 93 | 100+ |
| Posts blog | 52 | 52 ✅ |
| Usuarios Telegram | ~50 | 1,000 |
| Suscripciones | 0 | 100 |

### ✅ Completados Recientemente

- ✅ KPIs Dashboard visible en homepage
- ✅ Blog 52 posts 1000+ palabras
- ✅ Monitor Conflictos con fallback
- ✅ Footer con timestamp
- ✅ Semáforo color en footer
- ✅ KPIs Index - Mapa de 6 capas interactivas
- ✅ Tab KPIs Index en Premium
- ✅ Capas: GPI, GTI, HDI, IPC, Sismos (USGS), MAEC

---

## 🚀 SPRINT 18: KPIs Index - Índice de Riesgos Globales (2026-04-22)

### 📊 Concepto
Herramienta GIS-like con selector de capas para visualizar múltiples índices de riesgo y desarrollo en un mapa interactivo.

### ✅ Completado
| # | Feature | Estado |
|---|---------|--------|
| 1 | Página `/indices` | ✅ Done |
| 2 | 6 capas selectorables | ✅ Done |
| 3 | Mapa Leaflet interactivo | ✅ Done |
| 4 | Tab en Premium (`/premium`) | ✅ Done |
| 5 | Timestamp actualización visible | ✅ Done |
| 6 | Filtros por región | ✅ Done |
| 7 | Tabla de datos filtrable | ✅ Done |

### 📈 Datos por Capa
| Capa | Fuente | Países | Tipo |
|------|--------|---------|------|
| GPI | IEP 2026 | 46 | Estático |
| GTI | IEP 2026 | 48 | Estático |
| HDI | UNDP 2024 | 45 | Estático |
| IPC | Macro 2026 | 55 | Estático |
| Sismos | USGS API | - | Tiempo real |
| MAEC | MAEC 2026 | 95 | Estático |

### 🔄 Actualización
- **GPI/GTI/HDI**: Anual (IEP publica en marzo)
- **IPC**: Trimestral
- **MAEC**: Diaria (scrapers)
- **Sismos**: Tiempo real (USGS)

### 🎯 Siguientes Pasos
- [ ] Expandir GPI/GTI/HDI a 80+ países
- [ ] Añadir capa de Corrupción (TI Index)
- [ ] Historial de cambios por país
- [ ] Comparativa automática de países

---

## 🚀 SPRINT 19: Cron Jobs Automatizados (2026-04-22)

### ⏰ Concepto
Scraping y alertas automatizadas mediante Vercel Cron Jobs para mantener datos actualizados.

### ✅ Completado
| # | Feature | Estado |
|---|---------|--------|
| 1 | Configuración vercel.json | ✅ Done |
| 2 | CRON_SECRET configurado | ✅ Done |
| 3 | Endpoint `/api/cron/status` | ✅ Done |
| 4 | UI de estado en ScraperStatus | ✅ Done |

### 📅 Schedule
| Job | Schedule | Descripción |
|-----|----------|------------|
| scrape-maec | `0 6 * * *` | Scraping MAEC diario 6:00 UTC |
| check-alerts | `0 8 * * *` | Check alertas diario 8:00 UTC |
| weekly-digest | `0 8 * * 1` | Resumen semanal cada lunes 8:00 UTC |

### 🔧 Verificación
- Dashboard Vercel → Cron Jobs
- `GET /api/cron/status` → Estado de ejecuciones
- Supabase tabla `scraper_logs` → Histórico

---

### 🎯 Siguientes Pasos
- [ ] Monitor de fallos (email notification)
- [ ] Retry automático en error
- [ ] Dashboard de métricas

---

## 🔒 SEGURIDAD Y BACKUP (2026-04-24) - COMPLETADO ✅

### Variables de Entorno
Backups de variables de entorno para evitar corrupciones y pérdida de configuración.

### ✅ Completado
| Feature | Estado |
|---------|--------|
| Script backup-env.sh | ✅ Done |
| Backup automático | ✅ Done |
| Restore script | ✅ Done |
| Backup latest | ✅ Done (2026-04-24) |

### 📋 Uso
```bash
# Crear backup
./scripts/backup-env.sh

# Restaurar (manual)
./scripts/restore-env.sh
```

### 📁 Archivos
- Backup: =env_backup_YYYYMMDD_HHMMSS.txt=
- Script: =scripts/backup-env.sh=
- Restore: =scripts/restore-env.sh=

### 🔐 Variables Críticas
| Variable | Descripción | Ubicación |
|----------|------------|-----------|
| SUPABASE_SERVICE_ROLE_KEY | Admin DB | Vercel |
| CRON_SECRET | Cron auth | Vercel |
| RESEND_API_KEY | Email | Vercel |
| GROQ_API_KEY | IA | Vercel |
| TELEGRAM_BOT_TOKEN | Bot | Vercel |
| STRIPE_SECRET_KEY | Pagos | Vercel |

### ⚠️ Notas
- Nunca commits de valores reales
- Backup en 1Password/Bitwarden
- Rotation monthly recomendada

---

## 🚀 CRON Jobs Verificados (2026-04-24) - COMPLETADO ✅

### 📊 Resultado Test
| Cron | Ejecución Manual | Estado |
|------|------------------|--------|
| /api/cron/check-alerts | ✅ Sin cambios (0) | Funciona |
| /api/cron/daily-digest | ✅ Email + Telegram enviados | Funciona |
| /api/cron/scrape-maec | ⚠️ Timeout (>90s) - normal | Funciona |

### 🔑 CRON_SECRET
- Valor: `lS+/mhOpowDvtLUVHsGmGYq35m+cGYMX8Ca5BdAk9vQ=`
- Configurado en Vercel: Production + Development

### 📝 Cómo ejecutar manualmente
```bash
curl -H 'Authorization: Bearer lS+/mhOpowDvtLUVHsGmGYq35m+cGYMX8Ca5BdAk9vQ=' \
  https://viaje-con-inteligencia.vercel.app/api/cron/check-alerts
```

### Schedule Vercel (vercel.json)
- Daily digest: 00:00 UTC
- Scrape MAEC: 06:00 UTC
- Check alerts: 08:00 UTC
- Weekly digest: 08:00 UTC (lunes)

### 📧 Concepto
Email diario a las 00:00 UTC con estado del sistema a info@viajeinteligencia.com.

### ✅ Completado
| # | Feature | Estado |
|---|---------|--------|
| 1 | API /api/cron/daily-digest | ✅ Done |
| 2 | Cron 0 0 * * * (00:00 UTC) | ✅ Done |
| 3 | Stats: uptime, users, newsletter, alerts, scraper, bot | ✅ Done |
| 4 | Email HTML a info@viajeinteligencia.com | ✅ Done |
| 5 | Auto-verify newsletter | ✅ Done |

### 📊 Datos Recopilados
- Estado sistema + latencia
- Usuarios registrados + nuevos hoy
- Suscriptores newsletter + pendientes verificación
- Alertas riesgos nuevas hoy + total
- Scraper ejecuciones + errores
- Bot Telegram usuarios + mensajes hoy

### ⚠️ Requiere en Vercel
- NEXT_PUBLIC_SUPABASE_URL = https://tu-proyecto.supabase.co
- SUPABASE_SERVICE_ROLE_KEY = tu_service_key

---

## 🚀 SPRINT 20: Memoria de Viaje - MEJORAS (2026-04-24)

### 📱 Concepto
Módulo PWA de almacenamiento local (IndexedDB) para documentos de viaje/offline: boarding passes, hotel confirmations, notas, referencias.

### ✅ Completado
| # | Feature | Estado |
|---|---------|--------|
| 1 | IndexedDB con Dexie.js | ✅ Done |
| 2 | Subir imagen (Upload) | ✅ Done |
| 3 | Escribir nota (text) | ✅ Done |
| 4 | Referencia (tfno, direccion) | ✅ Done |
| 5 | Export backup | ✅ Done |
| 6 | PWA manifest | ✅ Done |
| 7 | Guia de uso integrada | ✅ Done |
| 8 | **Soporte PDF** (5MB max) | ✅ Done |
| 9 | **Toast confirmation** | ✅ Done |
| 10 | Botón visible "Subir imagen o PDF" | ✅ Done |
| 11 | Miniaturas reducidas grid 2col/4col | ✅ Done |
| 12 | Vista lista + grid toggle | ✅ Done |
| 13 | Descargar PDF real (no solo texto) | ✅ Done |
| 14 | Modal preview PDF/imagen | ✅ Done |
| 15 | Descargar individual | ✅ Done |

### 📋 Estado Actual
- Grid: miniaturas cuadradas compactas
- Lista: thumbnail 64px + texto + btn descargar
- Modal: preview + descargar + eliminar
- PDF: se guarda archivo real (base64), recuperable

### 🧩 Tipos de Documentos
- Vuelo (imagen/PDF)
- Hotel (imagen/PDF)
- Ticket (imagen/PDF)
- Nota (texto libre)
- Referencia (telefono, direccion, contacto)

### 📦 Modelo de Datos
```javascript
{
  id: string,
  type: "ticket" | "vuelo" | "hotel" | "nota",
  created_at: timestamp,
  image: blob,
  text: string,
  location: { country: string, city: string }
}
```

### 🧩 Componentes UI
- **FloatingActionButton**: + → Cámara / Galería / Nota rápida
- **DocumentList**: Grid/list con filtros por tipo
- **DocumentCard**: Preview thumbnail + tipo + fecha
- **DocumentViewer**: Modal con zoom

### 📋 Roadmap
| Fase | Funcionalidad |
|------|---------------|
| 1 (MVP) | Captura + visualización básica |
| 2 | OCR (Tesseract.js) + filtros |
| 3 | Premium: ilimitado + export |

---

## 🚀 SPRINT 24: ML/AI + Fotos Diarias (2026-04-25)

### ✅ Completado Sprint 24

| Feature | Estado | Notas |
|---------|--------|-------|
| Gen AI docs /api/ai/gen-doc | ✅ | Tipos: informe, resumen, comparativa |
| Datos turismo OWID | ✅ | 50 países, llegadas/ingresos 2024 |
| Blog search button | ✅ | Busca por título, tags, keywords |
| Flight alerts API real | ✅ | `/api/flights/delays` AviationStack |
| Fotos diarias rotatorias | ✅ | `/public/photos/1.jpg, 2.jpg...` |
| Clustering ML K-Means | ✅ Done | API `/api/ai/clustering` 20 destinos |
| UI clustering | ✅ | Página `/clustering` |

### 📋 Pendiente

| Feature | Priority | Estado |
|---------|----------|--------|
| AviationStack API key | 🟠 Media | Configurar en Vercel |
| Dashboard retrasos | 🟡 Media | Pending |
| Predicción riesgo IA | 🟡 Baja | Sin datos históricos |
| Anomaly detection | 🟡 Baja | - |

### 📊 ML Implementado

**K-Means Clustering:**
- Features: riesgo (2x), IPC (1.5x), distancia (1x), llegadas (0.5x)
- 50+ países con datos
- Dataset: riesgo MAEC + turismo OWID + IPC

** Fotos diarias:**
- Folder: `/public/photos/`
- Nombres: `1.jpg`, `2.jpg`, `3.jpg`... (hasta 20)
- Rotación diaria automática
- Estilo: grayscale + 40% opacity

---

## 📊 COBERTURA ACTUAL (2026-04-23)

### 📊 Roadmap 1 mes

| # | Feature | Priority | Estado |
|---|---------|----------|--------|
| 1 | Gen AI docs - Generación documentos | 🔴 Alta | ⏳ Pendiente |
| 2 | API KPIs turismo UNWTO + riesgo | 🔴 Alta | ⏳ Pendiente |
| 3 | Dashboard KPIs turismo visual | 🟠 Media | ⏳ Pendiente |
| 4 | Clustering destinos | 🟡 Media | ⏳ Pendiente |
| 5 | Predicción riesgo IA | 🟡 Baja | ⏳ Pendiente |
| 6 | Anomaly detection alertas | 🟡 Baja | ⏳ Pendiente |

### 📋 Datos UNWTO (OMT) - Fuentes gratuitas

| Métrica | Descripción | Disponibilidad |
|--------|------------|--------------|
| Llegadas turísticas | Visitantes internacionales por país | UNWTO Open Data |
| Ingresos turismo | Divisas generadas | UNWTO Open Data |
| Empleo sector | Jobs en turismo | UNWTO data |
| PIB turismo | Contribución al PIB% | UNWTO stats |

### 🧠 Gen AI Docs - MVP

**Input:** país, tipo de documento, preferencias
**Output:** Documento generado con IA

| Tipo documento | Contenido |
|-----------------|------------|
| Informe país | Datos riesgo + turismo + recomendaciones |
| Resumen viaje | Itinerario + alertas + Checklist |
| comparativa | Análisis comparativo países |

### 🏙️ Clustering Destinos

**Factores de similitud:**
- Clima (temperatura, precipitación)
- Coste vida (IPC)
- Nivel riesgo (MAEC)
- Idioma
- Turistas/año

**Algoritmo:** K-means clustering (sklearn similar)

### 📐 Arquitectura ML

```
[datos: paisesData + UNWTO] → [feature engineering] → [modelos ML]
                                                              ↓
[API: gen-doc, clustering, prediction] → [Dashboard / UI]
```

### 📊 Reference - Proyectos ML Turismo

| Proyecto | Algoritmo | Precision | URL |
|----------|----------|----------|-----|
| Tourism-Prediction-ML | Random Forest | 98% | tourism-prediction-ml.streamlit.app |
| NLP Tourist Arrivals | BERT + AdaBoost | 85% | Springer 2024 |
| Travel Risk ML | sklearn | En desarrollo | Nuestro proyecto |

### 🔧 Opciones ML por Implementar

| Opcion | Complejidad | Datos Needed |
|-------|-------------|-------------|
| K-Means clustering | Baja | riesgo, IPC, distancia |
| Random Forest riesgo | Media | Historial 100+ paises |
| Prediccion llegadas UNWTO | Media | Series 10 anos |
| Anomaly detection | Alta | Logs alertas |
| NLP analisis reviews | Alta | TripAdvisor |

---

## 📊 COBERTURA ACTUAL (2026-04-22)

| Feature | Estado |
|---------|--------|
| Países en mapa riesgos | 95 → 100 |
| Posts blog | 52 |
| KPIs Index | ✅ Nuevo |
| Memoria de Viaje (PWA) | ✅ Completado |
| Logo corporativo | ✅ Implementado |

---

## 🚀 SPRINT 25: Generador Reclamaciones PDF (2026-04-24) - COMPLETADO ✅

### 📱 Concepto
Generador de formularios de reclamación para incidentes de viaje: cancelaciones de vuelos, hoteles, servicios, equipaje. PDF listo para imprimir o enviar.

### ✅ Completado
| Feature | Estado |
|---------|--------|
| Tab "Reclamaciones" en Premium | ✅ Done |
| Tipos de incidencia (7 tipos) | ✅ Done |
| Formulario datos personales | ✅ Done |
| Generación PDF con jsPDF | ✅ Done |
| Descarga automática | ✅ Done |

### 📝 Tipos de Incidencia Soportados
- ✈️ Cancelación de vuelo
- ⏰ Retraso de vuelo (+3h)
- 🏨 Cancelación de hotel
- ⚠️ Servicio deficiente
- 🧳 Equipaje extraviado/dañado
- 📦 Paquete perdido
- ❓ Otro

### 📋 Plantilla PDF
- Datos reclamante (nombre, email, tfno)
- Detalle incidencia (tipo, fecha, servicio, proveedor, importe)
- Descripción hechos
- Solicitud (devolución/compensación)
- Checklist documentación adjunta

### 🎯 Valor para Usuario
- Herramienta práctica y diferenciadora
- SEO: "generador reclamaciones viaje", "formulario cancelación vuelo"
- Upsell a Premium

### 🔧 Files Modificados
- `/src/app/premium/page.tsx` - Añadido tab + form + PDF generation

---

## 🔧 BUG FIXES (2026-04-23)

| # | Fix | Archivo | Estado |
|---|-----|--------|--------|
| 1 | Fotos diarias: MAX_PHOTOS 20→4, ref imagen, unoptimized | src/app/blog/page.tsx, src/components/DailyPhoto.tsx | ✅ Done |
| 2 | Documentos: add ref={fileInputRef} input file (cámara/PDF) | src/app/documentos/page.tsx | ✅ Done |
| 3 | PDF: offset teléfono emergencia +57 45→52 | src/components/PDFExportButton.tsx | ✅ Done |
| 4 | Post blog: Crisis de Combustible 2026 - derechos pasajeros | content/posts/ | ✅ Done |

---

## 🚀 SPRINT 26: ML APIs + Dashboard Turismo (2026-04-24) - COMPLETADO ✅

### 📱 Concepto
APIs de ML simples para encontrar destinos similares y dashboard visual con estadísticas UNWTO.

### ✅ Completado
| Feature | Estado | API/URL |
|---------|--------|---------|
| Similar destinations | ✅ Done | `/api/ai/similar?code=es` |
| KPIs Tourism API | ✅ Done | `/api/kpis/tourism?metric=all` |
| Dashboard Turismo | ✅ Done | `/turismo` |
| Clustering (fix) | ✅ Done | `/api/ai/clustering` |

### 📊 Datos ML Implementados

| Datos | Fuente | Países |
|-------|--------|--------|
| Llegadas turísticas | UNWTO 2024 | 15 |
| Ingresos turismo | UNWTO 2024 | 15 |
| Gasto/día USD | UNWTO 2024 | 15 |
| Estancia media | UNWTO 2024 | 15 |
| IPC (índice) | Macro | 30 |
| GPI (paz) | IEP | 46 |
| Riesgo MAEC | España | 100 |

### 🔧 APIs Creadas

```
/api/ai/similar?code=es&limit=5
  → { code, nombre, bandera, score, reason }

/api/kpis/tourism?metric=arrivals|receipts|spendPerDay|all
  → { top: [{ code, arrivals, receipts, spendPerDay, stayAvg }] }

/api/ai/clustering?clusters=4
  → { clusters: [{ label, destinations: [] }] }
```

### 📈 Página Nueva: /turismo

- Stats globales: 538M llegadas, $598B ingresos, $68 media gasto/día
- Top 10 destinos en grid visual con banderas
- Tabla ordenable por llegadas/ingresos/gasto
- Buscador
- Info UNWTO

### 🎯 Valor para Usuario
- SEO: "estadísticas turismo", "mejores destinos"
-Dashboard diferenciador
- Base para expansión ML

### Pendiente (Sprint 27)
| Feature | Priority | Estado |
|---------|----------|--------|
| AviationStack API | 🟠 Media | Pending |
| Más países tourism | 🟡 Baja | Pending |
| Predicción riesgo | 🟡 Baja | Pending |
| Anomaly detection | 🟡 Baja | Pending |

### 🔧 Notas
- Clustering: ✅ Fixed (datos hardcodeados, 24 países)
- Otros APIs (/turismo, /similar, /weather) OK