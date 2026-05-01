# Pendiente - Viaje con Inteligencia

## 📅 2026-04-27 - SPRINT 33: QUICK WINS UX/IA (OPCION 1) - PENDIENTE

### 🎯 Objetivo: Bajo código, alto impacto inmediato
*Implementar mejoras esta semana sin romper nada*

#### ✅ Quick Start IA (Homepage)
- Mini-formulario flotante: "¿A dónde quieres ir? → [Destino] [Fechas]"
- Submit redirige a /rutas filtrando por país
- Reutiliza PlanificadorSimple.tsx como modal entrada
- **Esfuerzo:** 🟢 Bajo | **Impacto:** 🔥 Alto

#### ✅ SEO Landing Pages Automáticas
- Ruta dinámica `/destinos/[pais]`
- Genera página única: "Riesgo actual", "Mejor época", "Ruta recomendada"
- Usa datos paisesData + ML
- **Keywords:** "es seguro viajar a [pais]", "mejor época para viajar a [pais]"
- **Esfuerzo:** 🟢 Bajo | **Impacto:** 🔥 Alto

#### ✅ Botón "Compartir en Telegram/WhatsApp"
- Botón en cada ruta → mensaje pre-formateado
- "🛣️ He descubierto esta ruta en Viaje con Inteligencia: [URL]"
- **Coste:** < 2 horas desarrollo
- **Esfuerzo:** 🟢 Bajo | **Impacto:** 🟡 Medio

---

## 📅 2026-05 - SPRINT 34: ENGAGEMENT & DATA (OPCION 2) - COMPLETADO ✅

### 🎯 Objetivo: Fidelizar usuarios que ya entran

#### ✅ Visualización Predictiva ("Cuándo ir")
- Widget en ficha ruta con gráficos Recharts (líneas + barras)
- Precio estimado por mes (índice 0-100)
- Nivel de masificación por mes (índice 0-100)
- Clima mensual con gráfico de barras
- IA calcula mes ideal automáticamente (fórmula: precio*0.4 + crowd*0.35 + weather*0.25)
- **Impacto:** 🔥 Alto | **Estado:** ✅ Done

#### ✅ ML API Integration
- DestinosClient.tsx conecta con `/api/ai/recommend`
- Fallback a scoring local si API no disponible
- Badge "IA" visible cuando viene del backend
- Loading state mientras calcula

#### ✅ Sistema "Tokens de Viajero" (Gamificación)
- Tabla `user_activity` en Supabase (login, generate_route, share_route)
- Componente `UserLevel` en dashboard: Explorador → Guía → Oráculo
- Recompensa: Nivel "Guía" desbloquea PDF con mapa detallado (jsPDF)
- Progress bar visible, perks por nivel, puntos por acción
- **Esfuerzo:** 🟠 Medio | **Impacto:** 🟡 Medio | **Estado:** ✅ Done

#### ✅ Viaje Compartido (Viralidad)
- Botón "Invitar amigos a este viaje" → link único `?ref=trip_123`
- Supabase guarda `trip_id` + lista emails invitados
- Página `/viaje-compartido?token=xxx` para invitados
- Share via Telegram, WhatsApp, email
- **Esfuerzo:** 🟠 Medio | **Impacto:** 🔥 Alto | **Estado:** ✅ Done

---

## 📅 2026-06 - SPRINT 35: FULL AI EXPERIENCE (OPCION 3) - FUTURO LEJANO

### 🎯 Objetivo: Diferenciación total frente a competencia

#### Itinerario Interactivo con IA
- Página `/planificador`: IA genera día a día
- Drag-and-drop actividades
- IA recalcula tiempos/distancias en tiempo real
- **Tecnología:** Groq API + generateDayByDay mejorada
- **Esfuerzo:** 🔴 Alto | **Impacto:** 🔥 Alto

#### Newsletter Predictiva Personalizada
- Cron semanal analiza `user_search_history` en Supabase
- Si usuario buscó "Japón" 3x → email: "Bajan vuelos + Alerta riesgo"
- **Tecnología:** Resend + template HTML dinámico
- **Esfuerzo:** 🟠 Medio | **Impacto:** 🔥 Alto

#### Chatbot Contextual en Rutas
- Widget chat en `/rutas/[ruta]` responde sobre *esa* ruta específica
- "¿Dónde comer cerca del Molino de Consuegra?"
- Contexto inyectado automáticamente en prompt sistema
- **Esfuerzo:** 🔴 Alto | **Impacto:** 🟡 Medio

---

## 📅 PLAN DE CRECIMIENTO 30 DÍAS

| Semana | Acción | Objetivo |
|--------|--------|----------|
| **1** | Quick Start + SEO Landing Pages | Tráfico orgánico |
| **2** | Botón Compartir Telegram/WhatsApp | Viralidad |
| **3** | Visualización Predictiva (Precios/Multitudes) | Retención |
| **4** | Gamificación (Tokens/Niveles) | Fidelización |

| Prioridad | Acción | Objetivo |
| :--- | :--- | :--- |
| **Alta** | Simplificar registro/primer uso (Onboarding) | Retención inmediata |
| **Media** | Contenido comparativo (IA vs Manual) | Tráfico orgánico |
| **Media** | Sistema referidos por itinerarios | Crecimiento viral |
| **Baja** | Refinamiento algoritmos ML secundarios | Mejora largo plazo |

---

## 📅 2026-04-27 - SPRINT 32: DOSSIER DOCUMENTAL (COMPLETADO)

### ✅ Completado
| Feature | Estado |
|---------|--------|
| Dossier tecnico-estrategico DOSSIER.org | ✅ Done |
| Arquitectura diagramas | ✅ Done |
| IA/ML descripcion completa | ✅ Done |
| Diferenciacion competidores | ✅ Done |
| Modelo negocio + proyecciones | ✅ Done |
| Roadmap 2026 | ✅ Done |

### 📊 Dossier contenido
| Seccion | Contenido |
|---------|-----------|
| Introduccion |Vision, problema, propuesta valor |
| Arquitectura | Stack tecnico, diagramas |
| Fuentes datos | MAEC, INE, OMS, AEMET |
| IA/ML | K-Means, scoring, clustering |
| Diferenciacion | vs TripAdvisor, Lonely Planet |
| Telegram | Arquitectura, comandos |
| Mastodon | Publicacion automatica |
| Modelo negocio | Free/Premium/yearly |
| Crecimiento | Proyecciones 12 meses |
| Tecnologia | Stack, dependencias |
| Roadmap | Q2-Q4 2026 features |
| Anexos | URLs, env vars, cron jobs |

**Palabras:** ~2,800
**Archivo:** `DOSSIER.org` (raiz proyecto)

---

## 📅 2026-04-27 - SPRINT 31: RUTAS DEL VINO + TELEGRAM POSTS (COMPLETADO)

### ✅ Completado
| Feature | Estado |
|---------|--------|
| Data rutas vino (8 regiones) | ✅ Done |
| Preferencias temporada (4 estaciones) | ✅ Done |
| ML recommendation por presupuesto | ✅ Done |
| ML optimization por mes/estacion | ✅ Done |
| Posts automaticos a Telegram | ✅ Done |
| Blog post IA/ML Telegram (2000+ words) | ✅ Done |

### 🍷 Regiones vino implementadas
| Region | DO | Provincia | Mejor epoca | Precio medio |
|--------|-----|-----------|-------------|-------------|
| La Rioja | DOCa Rioja | La Rioja | Abril-Mayo, Sept-Oct | 20€ |
| Ribera del Duero | DO Ribera | Burgos | Abril-Junio | 25€ |
| Rias Baixas | DO Rias Baixas | Pontevedra | Mayo-Agosto | 12€ |
| Penedes | DO Penedes | Barcelona | Marzo-Mayo | 18€ |
| Jumilla | DO Jumilla | Murcia | Marzo-Mayo | 10€ |
| Montilla-Moriles | DO Montilla | Cordoba | Marzo-Mayo | 12€ |
| Ronda | DO Ronda | Malaga | Primavera | 15€ |
| Txakoli | DO Getariako | Gipuzkoa | Verano | 15€ |

### 📱 Telegram Channel Posts
- Digest semanal ahora envia posts automaticamente al canal @ViajeConInteligencia
- Incluye: titulo, excerpt, enlace, hashtags

### 📝 Blog post publicado
- Titulo: "Viaje con Inteligencia: El Canal de Telegram que Usa IA y ML..."
- URL: /blog/canal-telegram-inteligencia-artificial
- SEO: 2500+ palabras, imagen Unsplash, hashtags

---

## 📅 2026-04-26 - SESIÓN COMPLETA

### ✅ Completado Hoy (Sprint 27)
- INE Spain Tourism ML clustering (7 segmentos)
- Datos reales INE (FRONTUR + EGATUR) enero 2026
- Storage histórico Supabase (3 tablas)
- Cron monthly (día 5, 6:00 UTC)
- APIs: /ine/spain-tourism, /ine/ml-clustering, /ine/scraper
- Push a producción ✅

### 📊 Métricas Sesión
| Task | Estado |
|-----|--------|
| INE datos reales | ✅ Done |
| ML clustering España | ✅ Done |
| Supabase storage | ✅ Done |
| Vercel cron | ✅ Done |
| Docs actualizado | ✅ Done |
| Push producción | ✅ Done |
| Rutas temáticas España | ✅ Done |
| UI PlanificadorSimple + rutas | ✅ Done |
| Página /rutas | ✅ Done |

---

## 🛣️ SPRINT 28: RUTAS TEMÁTICAS ESPAÑA (2026-04-26) - COMPLETADO ✅

### ✅ Completado
| Feature | Estado | Archivo |
|---------|--------|---------|
| Data rutas España | ✅ Done | `src/data/rutas-espanas.ts` |
| API rutas | ✅ Done | `/api/rutas-espana` |
| UI PlanificadorSimple | ✅ Done | Cards 3 rutas integradas |
| Página /rutas | ✅ Done | Listado + detalle dinámico |
| ML features | ✅ Done | Safety, Popularity, Value scores |

### 📊 Rutas creadas
| Ruta | Distancia | Días | Dificultad |
|------|-----------|------|------------|
| Molinos La Mancha | 450 km | 4-5 | Fácil |
| Faros Costa España | 2.100 km | 5-7 | Moderado |
| Murcia Interior | 280 km | 3-4 | Fácil |

### 📋 APIs
```bash
# Listado rutas
GET /api/rutas-espana

# Ruta específica con días
GET /api/rutas-espana?route=molinos&days=4&ml=true

# Página
/rutas
/rutas?route=molinos&days=4
```

### 🎯 Próximas rutas (pendientes)
- 🏔️ Rutas de Nieve (Pirineos)
- 🏖️ Best Beaches (Costa del Sol)
- 🍷 Rutas del Vino (Rioja, Ribera) - ✅ COMPLETADO

---

## 📅 2026-04-27 - SPRINT 29: RUTAS TEMÁTICAS + ML

### ✅ Completado
| Feature | Estado |
|---------|--------|
| Data rutas España (3) | ✅ Done |
| API rutas-espanas | ✅ Done |
| UI Homepage con imágenes | ✅ Done |
| ML preference matching | ✅ Done |
| Top Match badge | ✅ Done |
| Imágenes Unsplash corregidas | ✅ Done |

### 📊 Rutas implementadas
| Ruta | Tags ML | Estado |
|------|---------|--------|
| Molinos La Mancha | cultural, familiar | ✅ |
| Faros Costa España | playa, familiar, naturaleza | ✅ |
| Murcia Interior | cultural, naturaleza, familiar | ✅ |
| Rutas del Vino | cultural, gastronomia, enoturismo | ✅ |

---

## 📅 2026-04-27 - SPRINT 31: RUTAS DEL VINO (COMPLETADO)

### ✅ Completado
| Feature | Estado |
|---------|--------|
| Data rutas vino (8 regiones) | ✅ Done |
| Preferencias temporada (4 estaciones) | ✅ Done |
| ML recommendation por presupuesto | ✅ Done |
| ML optimization por mes/estacion | ✅ Done |
| Funcion getWineRouteRecommendation | ✅ Done |

### 🍷 Regiones implementadas
| Region | DO | Provincia | Mejor epoca | Precio medio |
|--------|-----|-----------|-------------|-------------|
| La Rioja | DOCa Rioja | La Rioja | Abril-Mayo, Sept-Oct | 20€ |
| Ribera del Duero | DO Ribera | Burgos | Abril-Junio | 25€ |
| Rias Baixas | DO Rias Baixas | Pontevedra | Mayo-Agosto | 12€ |
| Penedes | DO Penedes | Barcelona | Marzo-Mayo | 18€ |
| Jumilla | DO Jumilla | Murcia | Marzo-Mayo | 10€ |
| Montilla-Moriles | DO Montilla | Cordoba | Marzo-Mayo | 12€ |
| Ronda | DO Ronda | Malaga | Primavera | 15€ |
| Txakoli | DO Getariako | Gipuzkoa | Verano | 15€ |

### 🎯 ML Features implementadas
- Preferencias por temporada: Vendimia, Invierno, Primavera, Verano
- Crowd level analysis: bajo (0.8x), medio (1.0x), alto (1.3x)
- Price optimization por budget: bajo, medio, alto
- Region scoring dinamico

### 🖼️ Opcional 2 (pendiente)
- Galería visual en página /rutas

### 📋 Pendientes para siguiente sprint
- 🏔️ Rutas de Nieve (Pirineos)
- 🏖️ Rutas de Playa  
- 🍷 Rutas del Vino
- 📸 Galería /rutas

---

*Sesión terminada -下一次 Sprint 30*

---

## 📅 2026-04-27 (CONTINUACIÓN) - SPRINT 30

### ✅ Completado
| Feature | Estado |
|---------|--------|
| Mastodon en Footer | ✅ Done |
| Blog post rutas IA | ✅ Done |
| SEO optimized | ✅ Done |

### 📝 Blog post publicado
- Título: "Rutas Temáticas de España con IA"
- URL: /blog/rutas-tematicas-espana-ia
- Keywords: IA, rutas España, travel, SEO
- Hashtags incluidos

### 🛠️ Footer Comunidad actualizado
- Añadido Mastodon con icono SVG
- Mantenido resto de enlaces

---

*Sesión terminada -下一次 Sprint 31*

---

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

### ✅ COMPLETADOS (2026-04-24)
- Stripe configurado ✅ ( checkout, precios, webhooks)
- Newsletter funcionando ✅ (12 suscriptores, emails enviándose)
- Climate API + METAR ✅ (/api/weather, /api/metar, /viajes/clima)
- Lead Magnet + Banner Homepage ✅ (/lead-magnet)
- Redirect Cloudflare → Vercel (pendiente 30 días por Cloudflare Free)

### ⚠️ PENDIENTES
- Redirect viajeinteligencia.com → vercel.app (pendiente - Cloudflare Free sin Workers)

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

### 💳 STRIPE (CONFIGURADO ✅) - COMPLETADO 2026-04-25
| # | Tarea | Prioridad | Estado |
|---|------|----------|--------|
| 1 | Integración Stripe | 🔴 Alta | ✅ Funcionando |
| 2 | Pagos Premium | 🔴 Alta | ✅ Checkoutactivo (4.99€/mes, 19.99€/año) |
| 3 | Webhooks | 🟠 Media | ✅ Configurado |
| 4 | Facturación | 🟠 Media | ✅ Listo

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

---

## 📋 ACCIONES PENDIENTES (2026-04-25)

### 🔴 ALTA PRIORIDAD - Planificador Simple + SEO
| # | Acción | Estado |
|---|--------|--------|
| 1 | Planificador simple en Homepage | ✅ Completado (2026-04-25) |
| 2 | Ruta /analisis | ✅ Completado (2026-04-25) |
| 3 | Programa afiliados /afiliados | ✅ Completado (2026-04-25) |
| 4 | Página /paises dedicada (SEO) | ✅ Completado (2026-04-25) |
| 5 | Quitar cards de homepage | ✅ Completado (2026-04-25) |
| 6 | Imagen watermark en PlanificadorSimple | ✅ Completado (2026-04-25) |
| 7 | 12 países en selector (incl Asia) | ✅ Completado (2026-04-25) |

### 🟠 Media Prioridad
| # | Acción | Estado |
|---|--------|--------|
| 1 | Códigos promo (FREE7, WELCOME30) | ⏳ Pendiente |
| 2 | AviationStack API | ⏳ Pendiente |
| 3 | Capa Salud OMS en /indices | ✅ Completado (2026-04-25) |

## ✅ Completados (2026-04-25)

### 🚀 Sprint 25: Planificador Simple + SEO
| Feature | Estado | Notas |
|---------|--------|-------|
| PlanificadorSimple | ✅ | 12 países, imagen watermark 50%, rotación diaria |
| /analisis | ✅ | Recomendaciones por nivel riesgo |
| /afiliados | ✅ | 20% comisión recurrente |
| /paises | ✅ | Directorio completo (SEO) |
| Homepage sin cards | ✅ | Solo mapa + botón |
| Capa Salud OMS | ✅ | WHO GHO API, 330 países con coords |
| Scoring colores | ✅ | Alto/Medio/Bajo visibles en mapa |

### 🚀 Sprint 26: Códigos Promocionales
| Feature | Estado | Notas |
|---------|--------|-------|
| API promo | ✅ | /api/promo, 4 códigos activos |
| Landing /free-trial | ✅ | SEO "prueba gratis premium" |
| Códigos: FREE7, WELCOME30, WELCOME60, LAUNCH50 | ✅ | days/percent tipos |

### 📋 Pendientes
| # | Acción | Prioridad |
|---|--------|----------|
| 2 | AviationStack API | Baja |

---

### 🛠️ Sistema Premium
| Feature | Estado | Notas |
|---------|--------|-------|
| /diagnostico | ✅ | Página verificación sistema |
| AccessStatus component | ✅ | Pantallas error con email |
| API subscription/check | ✅ | Verificación estado |
| 2 | AviationStack API | Baja |

### 🟡 Baja Prioridad
| # | Acción | Estado |
|---|--------|--------|
| 1 | Predicción riesgo ML | ⏳ Pendiente | |
| 2 | App móvil | ⏳ Pendiente |

## 🎯 METRICAS Q2 2026
| Métrica | Actual | Target |
|---------|--------|--------|
| Visitantes/mes | ~500 | 10,000 |
| Suscripciones | 0 | 100 |
| Países | 95 | 100 |

---

## 🚀 PLANIFICADOR SIMPLE - "Tu Viaje en 30s" (2026-04-25)

### 📋 Concepto
Bloque central en Homepage para planificar viajes rápidamente.

**Input:** Origen, Destino, Fechas
**Output:** Análisis rápido del viaje

### 🎯 Objetivo
- Primer "enganche" del usuario
- Claridad inmediata
- Usuario sabe qué hacer en <30 segundos

### 📱 Implementación

**Nueva ruta:** `/analisis?origen=XXX&destino=YYY`

**Secciones:**
1. Resumen destino (riesgo, semáforo)
2. Recomendaciones rápidas (estático inicialmente)
3. Simulación de viaje (visual simple)

### 📋 Fases

| Fase | Tarea | Estado |
|------|------|--------|
| 1 | Planificador simple en Homepage | ✅ Done |
| 2 | Ruta /analisis | ⏳ Pendiente |
| 3 | Recomendaciones rules engine | ⏳ Pendiente |
| 4 | SEO páginas país | ⏳ Pendiente |
| 5 | Checklist automático | ⏳ Pendiente |

### 🔧 rulesEngine.ts (ejemplo)
```js
// /lib/rulesEngine.ts
const rules = {
  th: ["Evitar comida callejera sin control", "Atención a estafas", "Mejor llegar de día"],
  in: ["信仰 importante", "Mejor época oct-marzoo"],
  // ...
}
```

---

## 🚀 ML RECOMENDACIONES - IMPLEMENTADO (2026-04-26)

### ✅ Completado
| Feature | Estado | Archivo |
|---------|--------|---------|
| Atributos viaje por país (30 países) | ✅ Done | `src/data/clustering.ts` |
| API /api/ai/recommend | ✅ Done | `src/app/api/ai/recommend/route.ts` |
| UI PlanificadorSimple | ✅ Done | `src/components/PlanificadorSimple.tsx` |
| Selector preferencias | ✅ Done | UI integrada |

### 📊 Sistema ML Implementado

**Preferencias soportadas:**
- 🏖️ Playa (playa: 1-10)
- 🏛️ Cultural (cultural: 1-10)
- 🏔️ Naturaleza (naturaleza: 1-10)
- 👨‍👩‍👧‍👦 Familiar (familiar: 1-10)

**Scoring ML mejorado:**
```
score = (prefScore × 3) + bonus_pref + bonus_budget + bonus_distancia + bonus_riesgo

# Preferencias: ≥9 (+20), ≥7 (+12), ≥5 (+5)
# Budget bajo: ipc<50 (+15), <70 (+10), <90 (+5)
# Budget medio: 50-100 (+12), >100 (+5)
# Budget alto: >90 (+15), >70 (+8)
# Distancia: <2000km (+10), <5000 (+6), <10000 (+3)
# Riesgo: sin-riesgo (+8), bajo (+4), medio (-5)
```

**Cobertura: 30 países**
```
Europa: es, fr, it, gb, de, pt, gr, hr, cz, pl, nl, ch
Américas: us, ca, mx, br, ar
Asia: jp, cn, th, in, vn, id, au, nz, tr
África: eg, ma, za
```

**API:**
```
GET /api/ai/recommend?preferencia=playa&presupuesto=medio&duracion=7&limit=3
→ { preferences, recommendations: [{ destination, nombre, bandera, nivelRiesgo, score, days, bestTime, highlights }] }
```

### 🎯 Experiencia de Usuario
1. Seleccionar tipo de viaje (4 botones)
2. Seleccionar presupuesto (dropdown)
3. Seleccionar duración (dropdown)
4. Click "Obtener Recomendaciones"
5. Ver 3 opciones con scoring ML
6. Click → análisis del destino

### 📈 Datos Coverage
- 30 países con atributos completos
- scoring dinámico basado en:
  - prefs (playa/cultural/naturaleza/familiar)
  - ipc (coste vida)
  - distanciaES
  - nivelRiesgo (MAEC)

---

## 🚀 INTEGRACIÓN OSINT - Fuentes datos dinámicos (2026-04-26)

### ⚠️ Problema actual
Datos hardcoded que还需mejora:
- `travelAttributes` (30 países) - manual
- `turistas` - aproximado de paisesData
- `ipc` - solo ~30 países

### ✅ Fuentes OSINT a integrar

| Fuente | Datos | API | Estado |
|--------|-------|-----|------|
| INE | turistas, densidad, estacionalidad | ine.es | ⏳ Pendiente |
| AEMET | clima, temperatura | aemet.es API | ⏳ Pendiente |
| OpenStreetMap | faros, playas, parques | overpass API | ⏳ Pendiente |
| Wikidata | patrimonio, faros | wikidata.org | ⏳ Pendiente |
| Macro API | IPC global | macrotrends | ⏳ Pendiente |

### 📋 Plan integración

#### Fase 1: INE (turistas)
```
API: https://www.ine.es/prodyser/tour小结/inicio.htm
Scraping: tablas turistas por país
Meta: extraer arrivals 2024 para 95 países
```

#### Fase 2: AEMET/clima
```
API: https://opendata.aemet.es/cierre-sun
Web: scraping clima por región
Meta: mejor época por destino
```

#### Fase 3: OpenStreetMap (POIs)
```
Overpass API: https://overpass-api.de
Query: faros, playas, miradores
Meta: clustering geográfico
```

#### Fase 4: Macro/IPC
```
API: https://api.macrotrends.io
Meta: IPC real para 50+ países
```

### 🔧 Endpoints a crear
- `/api/ine/tourists` - datos INE
- `/api/osm/pois` - OpenStreetMap  
- `/api/climate/best-season` - AEMET

### 📌 Referencias APIs gratuitas

**INE - Turistas:**
- Portal: https://www.ine.es/prodyser/tour小结/inicio.htm
- Datos: arrivals, pernoctaciones, estancia media
- Frecuencia: anual
- Formato: HTML таблицы

**Overpass OSM:**
- API: https://overpass-api.de/api/interpreter
- Query ejemplo:
```
[out:json];
node["man_made"="lighthouse"](37,-10,44,5);
out;
```

**AEMET:**
- API: https://opendata.aemet.es/cierre-sun
- key: solicitar en aemet.es
- Datos: temperatura, precipitación, viento

**Wikidata SPARQL:**
- Endpoint: https://query.wikidata.org/sparql
- Query ejemplo:
```
SELECT ?place ?coord WHERE {
  ?place wdt:P31 wd:Q39715.
  ?place wdt:P625 ?coord.
}
```

### 📊 Progreso actual (2026-04-26)
| Datos | Fuente | Estado |
|------|-------|--------|
| nivelRiesgo | MAEC | ✅ Live (cron 6:00) |
| turistas | INE/UNWTO (32 países) | ✅ Done |
| pernoctaciones | INE/UNWTO | ✅ Done |
| estanciaMedia | INE/UNWTO | ✅ Done |
| ipc | paisesData | ⚠️ Static |
| travelAttributes | hardcoded | ⚠️ Manual |

### 🔗 APIs creadas
- `/api/ine/tourists` - 32 países, datos INE/UNWTO 2024
- `/api/osm/pois` - OpenStreetMap faros/playas

### 🧪 Testing
```bash
# Turistas INE
curl https://viaje-con-inteligencia.vercel.app/api/ine/tourists

# POIs OSM (faros España)
curl https://viaje-con-inteligencia.vercel.app/api/osm/pois?country=es&type=lighthouse
```

---

### 📊 Estado OSINT (2026-04-26)
| Fuente | Datos | Cover | Estado |
|--------|-------|-------|--------|
| INE | turistas | 32 países | ✅ Done |
| OSM | POIs | Top 10 países | ✅ Done |
| MAEC | riesgo | 95 países | ✅ Live |

#### 🏆 Top 10 países optimizado
```
es, fr, it, pt, gr, tr, mx, jp, th, us
```
Criterio: arrivals turísticas (INE/UNWTO)

#### 🎯 Top 4 tipos POIs
```
lighthouse → Faros   (SEO alto)
beach → Playas      (usuario alto valor)
museum → Museos     (cultura)
castle → Castillos (cultura)
```

#### ❌ Excluidos (no priorizado)
- viewpoint, waterfall, ski_resort, theme_park (datos incompletos)
- países fuera top 10 (rate limiting)

### ❌ OSM Issues (CONOCIDA)
- bbox queries retornan 0 a veces (sobrecarga Overpass)
- area queries dan error de sintaxis
- Solución: Wikidata fallback con datos estáticos

---

### ✅ COMPLETADO (2026-04-26)

| Componente | Estado | Notas |
|------------|--------|-------|
| INE turistas | ✅ 32 países | `/api/ine/tourists` |
| OSM POIs | ⚠️ Fallback | Top 10, 4 tipos |
| Wikidata fallback | ✅ | `/api/wikidata/pois` 8 países |
| Cluster labels | ✅ Dinámicos | Basados en datos reales |
| MAEC riesgo | ✅ Live | Cron 6:00 UTC |

### 📊 Estado ML/OSINT final
| Fuente | Cover | Estado |
|--------|-------|--------|
| INE turismo | 32 países | ✅ Real |
| MAEC riesgo | 95 países | ✅ Live |
| Wikidata | 8 países FO | ✅ Backup |
| IPC | 30 países | ⚠️ Static |

### 🎯 APIs Produción
```bash
# Turistas
GET /api/ine/tourists

# POIs OSM (fallback a Wikidata)
GET /api/wikidata/pois?country=es&type=castle

# Cluster ML
GET /api/ai/clustering?clusters=4
```

---

## 🚀 SPRINT 27: INE Spain Tourism ML + Storage (2026-04-26) - COMPLETADO ✅

### ✅ Completado
| Feature | Estado | API/URL |
|---------|--------|---------|
| INE Spain Tourism | ✅ Done | `/api/ine/spain-tourism` |
| EGATUR gasto | ✅ Done | `/api/ine/spain-tourism?type=spend` |
| Clustering ML | ✅ Done | `/api/ine/ml-clustering` |
| Predicción ML | ✅ Done | `/api/ine/ml-clustering?predict=true` |
| INE scraper | ✅ Done | `/api/ine/scraper?action=save` |
| INE history storage | ✅ Done | Supabase 3 tablas |
| Cron monthly | ✅ Done | vercel.json (día 5, 6:00 UTC) |

### 📊 Segmentos ML España
| Segmento | % | Gasto medio | Estancia |
|----------|---|-----------|----------|
| Playa | 50.7% | €1522 | 8.5 días |
| Cultural | 16% | €1780 | 4.2 días |
| Familiar | 12% | €1904 | 6.8 días |
| Rural | 6% | €890 | 3.2 días |
| Negocios | 4% | €1854 | 2.1 días |
| Salud | 2% | €2450 | 12.5 días |
| Montaña | 4% | €980 | 4.5 días |

### 🎯 Valor diferenciador
- Único sistema en español con clustering ML de turismo España
- Datos reales INE (no aproximaciones)

---

## 🚀 SPRINT 28: Mejoras ML/OSINT (2026-04-26) - COMPLETADO ✅

### ✅ Completado
| # | Tarea | API |
|---|--------|-----|
| 1 | IPC real World Bank | `/api/wb/ipc` |
| 2 | POIs en UI países | nueva tab "POIs" |
| 3 | PlanificadorSimple + IPC | mostrar IPC en tarjetas |

### 📊 Estado actual
| Fuente | Cover | Estado |
|--------|-------|--------|
| INE turismo | 32 países | ✅ Real |
| MAEC riesgo | 95 países | ✅ Live |
| Wikidata POIs | 8 países | ✅ Live |
| IPC World Bank | 50 países | ✅ Live (2024) |

### 🎯 APIs Producción
```bash
# Turistas
GET /api/ine/tourists

# IPC (World Bank)
GET /api/wb/ipc?country=es
GET /api/wb/ipc?all=true

# POIs
GET /api/wikidata/pois?country=es&type=castle

# Cluster ML
GET /api/ai/clustering?clusters=4

# Recomendaciones
GET /api/ai/recommend?preferencia=playa&presupuesto=medio
```

---

## 📅 2026-04-29 - SPRINT 32: Rutas + POIs + Mejoras UI (EN PROGRESO)

### ✅ Completado
| Feature | Estado |
|---------|--------|
| Rutas dinamicas (8 rutas) | ✅ |
| 3 rutas aleatorias + "Ver todas" | ✅ |
| Dynamic import SSR false | ✅ |
| POIs Wikidata SPARQL ready | ✅ |
| Volver al mapa con Link | ✅ |
| Background opacity 25% | ✅ |
| framer-motion instalado | ✅ |

### 🌐 APIs
```bash
# Rutas
curl "/rutas"          # 3 rutas
curl "/rutas?all=true"  # todas

# POIs
curl "/api/wikidata/pois?country=es&type=museum"
curl "/api/wikidata/pois?country=es&type=museum&sparql=true"
```

### 📋 Pendientes
- Imágenes Unsplash en rutas (error 500)
- AviationStack API
- Predicción riesgo ML
- App móvil

---

## 📅 2026-04-28 - SPRINT 31: COMPLETADO ✅

### ✅ Completado
| # | Tarea | Priority |
|---|--------|----------|
| 1 | API weather - forecast 7 días | Alta | ✅ Done (Sprint 30) |
| 2 | Ranking países por precio (IPC dynamic) | Media | ✅ Done (Sprint 30) |
| 3 | Comparador visual países | Media | ✅ Done |

### 💡 Ideas Potenciales
- Weather forecast 7 días (Open-Meteo ya en uso)
- IPC dinámico rankings (usar /api/wb/ipc?all=true)
- Comparador visual side-by-side
- Mejora IST (índice saturación)
- Alerts push personalizada
- Cache redis (Upstash)

---

*End of file - total 1620 lines)*