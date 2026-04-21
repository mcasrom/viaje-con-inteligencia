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
- ⚠️ Scraping MAEC no funcional (web institucional)

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

### 💳 STRIPE
| # | Tarea | Prioridad | Estado |
|---|------|----------|--------|
| 1 | Integración Stripe | Alta | ⏳ Pendiente |
| 2 | Pagos Premium | Alta | ⏳ Pendiente |
| 3 | Webhooks | Media | ⏳ Pendiente |
| 4 | Facturación | Media | ⏳ Pendiente |

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
| 1 | Scrapers MAEC | Diaria | ✅ Completado (logs + cron) |
| 2 | NewsMCP | Semanal | ⏳ Pendiente |
| 3 | Posts blog | Semanal | ⏳ Pendiente |
| 4 | SEO keywords | Mensual | ⏳ Pendiente |
| 5 | Analytics | Quincenal | ⏳ Pendiente |

**Implementado:**
- Tabla scraper_logs + risk_alerts en Supabase
- API /api/cron/scrape-maec (scrape completo)
- Logging automático en /api/cron/check-alerts
- Dashboard /admin con vista de logs

---

## 🚀 SPRINT 13: Producto Minimalista (2026-04-21)

### 📊 Progreso

| Métrica | Actual | Target |
|---------|--------|--------|
| Visitantes/mes | ~500 | 10,000 |
| Países | 89 | 100 |
| Posts blog | 52 | 52 ✅ |
| Usuarios Telegram | ~50 | 1,000 |
| Suscripciones | 0 | 100 |

### ✅ Completados Recientemente

- ✅ KPIs Dashboard visible en homepage
- ✅ Blog 52 posts 1000+ palabras
- ✅ Monitor Conflictos con fallback
- ✅ Footer con timestamp
- ✅ Semáforo color en footer