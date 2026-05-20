# Way Ahead

## Última sesión: 20 May 2026 — Sprint 5: Tono solo-founder + blog interlinking + conflict monitor links + Sprint Performance doc

> **Último deploy verificado:** OK ✅ — push a main con fixes de tono, interlinking y conflict monitor

---

## 🔐 SERVIDOR HETZNER — Acceso SSH

| Dato | Valor |
|------|-------|
| IPv4 | `178.105.80.193/32` |
| IPv6 | `2a01:4f8:1c1e:92d2::/64` |
| Usuario | `deploy` |
| Puerto | `22` |
| Clave | `~/.ssh/id_rsa` (local) |
| Path app | `/var/www/viajeinteligencia` |
| PM2 | `pm2 startOrReload ecosystem.config.cjs --update-env` |

**Comandos útiles:**
```bash
# Transferir .env.production (excluido del rsync por seguridad)
scp .env.production deploy@178.105.80.193:/var/www/viajeinteligencia/

# Forzar recarga de env vars
ssh deploy@178.105.80.193 "cd /var/www/viajeinteligencia && pm2 restart viajeinteligencia --update-env && pm2 save"

# Ver logs
ssh deploy@178.105.80.193 "pm2 logs viajeinteligencia --lines 50"

# Health check
curl -s http://178.105.80.193:3001/api/health
```

**Regla:** `.env*` está excluido del rsync por seguridad. Cualquier cambio en vars de entorno requiere `scp` manual + `pm2 restart --update-env`.

---

## ⚠️ LECCIÓN CRÍTICA — DEPLOY PATH MISMATCH (19 May 2026)

**Bug:** El workflow de GitHub Actions (`deploy-hetzner.yml`) rsync enviaba los archivos a un directorio pero PM2 servía desde otro.

**Detalle:**
- `rsync` → `/var/www/viajeinteligencia/` ✔️
- Pero tras debugging resultó que el path real donde PM2 leía era distinto al de rsync
- El build nuevo NUNCA se estaba ejecutando — el servidor seguía con el binario anterior
- Síntoma: `curl /dashboard/seguros` devolvía 307 redirect a `/premium` (JS bundle viejo sin los cambios)

**Fix:** Verificar que `ecosystem.config.cjs` apunte EXACTAMENTE al mismo path que `rsync`. Comprobar:
1. `ecosystem.config.cjs` → `cwd: '/var/www/viajeinteligencia'`
2. `deploy-hetzner.yml` → `rsync ... /var/www/viajeinteligencia/`
3. Tras deploy: `pm2 describe viajeinteligencia` para ver el `cwd` real
4. Si hay duda: `pm2 delete viajeinteligencia && pm2 start ecosystem.config.cjs`

**Regla:** Si un deploy parece no reflejarse, NO asumir cache. Verificar path de PM2 primero. Hacer `curl -s http://localhost:3001/api/health | grep "version"` (o revisar si el JS bundle tiene los cambios nuevos).

---

## ✅ SPRINT SALUD — Health OSINT Pipeline (completado 19 May 2026)

**Objetivo:** Que el sistema detecte automáticamente brotes epidémicos (Ebola, Marburg, Nipah, etc.) desde fuentes oficiales.

**Logrado:**
1. ✅ **WHO Disease Outbreak News API** (`/api/hubs/diseaseoutbreaknews`) como fuente en `fetchAllPosts()`
2. ✅ **Groq para clasificar señales WHO** — todas las fuentes no-autoritativas (incluyendo WHO) pasan por `classifySignal()` con Groq
3. ✅ **Países añadidos:** RDC (CD), Uganda (UG), Angola (AO), Camerún (CM), Costa de Marfil (CI), Congo (CG), RCA (CF), Somalia (SO), Sudán del Sur (SS) — todos con fichas completas, embajadas, e índices
4. ✅ **extractCountryCode() expandido** con 50+ nuevas entradas africanas + nombres usados por WHO (Regionscountries como "Democratic Republic of the Congo", "Uganda")
5. ✅ **Pipeline completo:** WHO DON → `fetchAllPosts()` → `runNewsSentiment()` → Groq classification → `osint_signals` → `detectAndCreateIncidents()` → `notifySubscribers()`

**Pendiente opcional:**
- ProMED-mail (si RSS sigue vivo, redundante con WHO DON + ReliefWeb + GDELT)

---

## 🐛 CADENA DE FALLOS — Ebola no detectado (rastreo completo)

**Síntoma:** Brote Ebola Bundibugyo RDC/Uganda declarado PHEIC 17 May 2026. El sistema nunca creó un incidente `health_outbreak`.

### Búsqueda de causas (orden de descubrimiento en sesión 19 May)

| # | Bug | Archivo/Lugar | Cómo se descubrió | Fix | Verificación |
|---|-----|--------------|-------------------|-----|-------------|
| 1 | **WHO RSS feed 404** (meses roto) | `fetchNewsRSS()` | Se sabía, WAY_AHEAD lo anota | Reemplazado por `fetchWhoDon()` + ReliefWeb | WHO DON API devuelve datos actuales |
| 2 | **Keywords ebola/pheic ausentes** | `NEWS_KEYWORDS` + `TRAVEL_KEYWORDS` | Se sabía | Añadidas en sesión previa | GDELT ahora busca ebola |
| 3 | **RDC/Uganda no existían** | `paises-data.json` + `indices.ts` | Se sabía | Añadidos CD, UG + 7 más | 120 países total |
| 4 | **API no devuelve `Regionscountries`** | `fetchWhoDon()` línea 283 | Probamos API real desde SSH: campo ausente | Extraer location de `OverrideTitle` | Señal WHO con `location_name: "Democratic Republic of the Congo & Uganda"` |
| 5 | **CHECK constraint solo `rss`/`reddit`** | Supabase `osint_signals_source_check` | Cron mostraba `signals_inserted: 0` aunque `processed: 21`. Error log: "violates check constraint" | `ALTER TABLE` para incluir `gdacs`,`usgs`,`gdelt`,`who` | Siguiente cron: 21 signals insertados |
| 6 | **`slice(0,30)` cortaba WHO** | `runNewsSentiment()` línea 397 | WHO posts al final del array por `Promise.allSettled`. RSS llenaba el cupo de 30 | Priorizar WHO/GDELT/GDACS/USGS + cap 30→50 | WHO señal #1 en osint_signals |
| 7 | **`'congo'` matchea antes que `'democratic republic of the congo'`** | `extractCountryCode()` | Incidente creado con `country_code: 'cg'` en vez de `cd` | Ordenar claves multi-word primero | Fix verificado en build |

### Lecciones aprendidas

1. **CHECK constraints en Supabase** — Al añadir nuevos `source` values, verificar siempre que la constraint los permita. Error silencioso: batch insert falla → one-by-one falla → `signals_inserted: 0` sin alerta.
2. **`slice(0,30)` como bottleneck silencioso** — En `Promise.allSettled` el orden de resultados importa. Fuentes nuevas al final del array pueden no procesarse nunca si el cap se llena.
3. **`extractCountryCode()` con Object.entries** — El orden de inserción en el objeto dicta prioridad de match. Claves genéricas como `'congo'` matchean antes que `'democratic republic of the congo'`.
4. **Siempre verificar API real vs documentación** — `Regionscountries` no existe en la respuesta real de WHO DON a pesar de estar documentado.

---

## 🌍 PAÍSES CRÍTICOS DE ÁFRICA CENTRAL — PENDIENTES (19 May 2026)

**Detonante:** Brote de Ebola Bundibugyo en RDC y Uganda (PHEIC 17 May 2026). El sistema NO detectó el brote porque:
1. WHO RSS feed roto (404) → reemplazado por ReliefWeb
2. `ebola` y enfermedades clave no estaban en keywords → añadidas
3. RDC y Uganda NO existían en nuestra base de datos → añadidos

**Países africanos críticos que siguen faltando (priorizar):**

| Código | País | Motivo | Estado |
|--------|------|--------|--------|
| AO | Angola | Frontera RDC, petróleo, turismo | ✅ Añadido |
| CM | Camerún | África Central, seguridad | ✅ Añadido |
| CI | Côte d'Ivoire | Economía creciente, turismo | ✅ Añadido |
| CG | República del Congo | Frontera RDC, brotes | ✅ Añadido |
| CF | República Centroafricana | Conflicto activo | ✅ Añadido |
| GA | Gabón | África Central | ❌ |
| GQ | Guinea Ecuatorial | Hispanohablante, petróleo | ❌ |
| MG | Madagascar | Destino turístico único | ❌ |
| ML | Malí | Conflicto Sahel | ❌ |
| NE | Níger | Conflicto Sahel | ❌ |
| TD | Chad | Conflicto, frontera Sudán | ❌ |
| SO | Somalia | Conflicto, ya en conflictZones | ✅ Añadido |
| SS | Sudán del Sur | Conflicto, nuevo país | ✅ Añadido |
| ZM | Zambia | Turismo (Victoria Falls) | ❌ |
| ZW | Zimbabue | Turismo, inestabilidad | ❌ |
| BJ | Benín | África Occidental | ❌ |
| BF | Burkina Faso | Conflicto Sahel | ❌ |
| BI | Burundi | Frontera RDC | ❌ |
| MW | Malaui | África Austral | ❌ |
| NA | Namibia | Turismo, frontera Angola | ❌ |
| SL | Sierra Leona | África Occidental | ❌ |
| LR | Liberia | África Occidental | ❌ |
| DJ | Yibuti | Estratégico, cuerno África | ❌ |
| ER | Eritrea | Cuerno África | ❌ |

> **17 países restantes para próximos sprints.** Prioridad: Malí, Níger, Chad, Burkina Faso (conflicto Sahel), Zambia, Zimbabue (turismo), Gabón, Guinea Ecuatorial (frontera).

---

## 🛡️ CAVEAT DEL SEGURO — Políticas a localStorage (19 May 2026)

**Problema:** Almacenar pólizas de seguro en Supabase/server crea responsabilidad legal (datos sensibles del usuario, RGPD, posible consideración de datos de salud).

**Decisión:** Las pólizas de seguro viven SOLO en localStorage del navegador.
- Eliminadas rutas API: `src/app/api/seguros/alerts/`, `/monitor/`, `/policies/`
- `runInsuranceMonitor()` comentado en master cron (ya no hay datos server-side que monitorizar)
- `SegurosPremiumClient.tsx` reescrito para usar localStorage
- Homepage: texto actualizado → *"Tus pólizas de seguro solo en tu navegador"*

**Regla:** NO volver a implementar server-side storage de datos de seguro sin asesoría legal explícita.

---

## RESUMEN EJECUTIVO

**Fase 1 completada.** 21 funcionalidades entregadas, coste operativo ~€0/mes, deploy automatico en cada push a main.

### Lo conseguido en esta sesión (19 May — sesión 4)

| # | Entregable | Detalle |
|---|------------|---------|
| 1 | **Debug cadena de fallos Ebola** | 7 bugs encadenados impedían detección. Identificados y corregidos todos (ver tabla abajo) |
| 2 | **CHECK constraint Supabase** | `osint_signals_source_check` solo permitía `rss`/`reddit`. GDACS/USGS/GDELT/WHO rechazados en silencio desde el inicio. Fix: ALTER TABLE |
| 3 | **WHO DON location parse** | API real no tiene campo `Regionscountries`. Fix: extraer location de `OverrideTitle` |
| 4 | **Prioridad WHO en news sentiment** | `slice(0,30)` cap cortaba WHO por estar al final del array. Fix: priorizar WHO/GDELT/GDACS/USGS, cap 30→50 |
| 5 | **Congo country code mismatch** | `'congo'` matcheaba antes que `'democratic republic of the congo'` → incidente asignado a CG en vez de CD. Fix: orden multi-word primero |
| 6 | **120 países (+7 nuevos)** | Angola, Camerún, Costa de Marfil, Congo, RCA, Somalia, Sudán del Sur con fichas completas, embajadas, índices |
| 7 | **Contadores actualizados** | 57 hardcoded references de 107/108/110/111 actualizadas a 120 en toda la app y docs |
| 8 | **WHO DON en fuentes públicas** | Añadido a `/fuentes-osint`, `/metodologia`, `/transparencia`, `/ecosistema`, `ECOSISTEMA.md` |
| 9 | **Pipeline verificado** | 21 señales insertadas, 5 incidentes nuevos, WHO Ebola DON con `category:salud`, `location:Democratic Republic of the Congo & Uganda` |

---

## SISTEMA ACTUAL — Arquitectura

### Cron Master (UNICO en Vercel Hobby)
- **Horario**: 06:00 UTC diario, ~95s ejecucion
- **Fase 1 (paralelo)**: MAEC scrape 26 paises (90s) + Airspace OSINT (30s) + Oil price (15s)
- **Fase 2 (dependencias)**: Risk alerts (30s) + Flight costs/TCI 120 paises (60s)
- **Fase 3 (OSINT)**: News sentiment 73 fuentes (90s) + Incident detection (15s)
- **Fase 4 (comunicacion)**: Daily digest Telegram/email (30s) + Weekly digest lunes (30s)

### Fuentes de datos activas
| Fuente | Tipo | Frecuencia | Uso |
|--------|------|------------|-----|
| MAEC | Riesgo oficial | Diario | Mapa riesgo + alertas |
| USGS | Terremotos | Tiempo real | OSINT signals |
| GDACS | Desastres naturales | 24h | OSINT signals |
| GDELT | Noticias globales | Continuo | OSINT + sentiment |
| Reddit RSS | Experiencias viajeros | 6h | OSINT + Groq clasificacion |
| RSS (10 fuentes) | Noticias internacionales | 6h | OSINT + keywords |
| Yahoo Finance | Precio petroleo | Diario | TCI calculo |
| INE/UNWTO | Estadisticas turismo | Mensual | IST calculo |

### Incidentes — Pipeline automatico
1. OSINT sensor recolecta señales de 5 fuentes
2. Clasificacion: keywords (GDELT/RSS, 0 coste) + Groq (Reddit)
3. Detector agrupa 2+ señales mismo tipo+ubicacion = incidente
4. Recomendacion automatica segun tipo + severidad
5. Nota analista (manual via `/admin/incidents` o API)
6. Valoracion comunidad (estrellas 1-5)
7. Expiracion automatica segun tipo (12h-168h)

### Indicadores propios
| Indicador | Escala | Factores |
|-----------|--------|----------|
| IRV (Indice Riesgo Viaje) | 0-100 | MAEC 40%, geopolitica 20%, sanidad 15%, transporte 10%, idioma 10%, saturacion 5% |
| TCI (Travel Cost Index) | Index | Petroleo, cierres aereos, IPC pais, estacion |
| IST (Indice Saturacion Turistica) | Index | Llegadas 35%, pernoctaciones 25%, estancia 20%, ratio turistas 20% |

---

## FUNCIONALIDADES COMPLETADAS (21)

| # | Funcionalidad | Endpoint | Estado |
|---|---------------|----------|--------|
| 1 | Mapa riesgo interactivo | `/` | ✅ Leaflet + MAEC 120 paises |
| 2 | Calculadora costes TCI | `/coste` | ✅ Petroleo + conflictos |
| 3 | Blog 61 articulos | `/blog` | ✅ Paginacion, busqueda, grid/list |
| 4 | Chat IA viajes | `/chat` | ✅ Groq 8b free / 70b premium |
| 5 | OSINT automatico | `/api/cron/master` | ✅ 73 fuentes |
| 6 | Detector incidentes | `incident-detector.ts` | ✅ 10 tipos, clustering |
| 7 | Newsletter semanal | `newsletter-generator.ts` | ✅ Groq + HTML, double opt-in |
| 8 | Pagina OSINT publica | `/osint` | ✅ Incidentes + notas + ratings |
| 9 | Sistema valoraciones | `/api/data-ratings` | ✅ Generico, cualquier entidad |
| 10 | Notas analista | `/admin/incidents` | ✅ Admin panel + API |
| 11 | Cron master unificado | `/api/cron/master` | ✅ ~95s, 8 tareas |
| 12 | Auth Supabase | `/auth/*` | ✅ Magic link + password + Telegram |
| 13 | Dashboard usuario | `/dashboard` | ✅ Favoritos, trips, perfil |
| 14 | Reclamaciones | `/reclamaciones` | ✅ 8 tipos, gratis/premium |
| 15 | Rutas tematicas Espana | `/rutas` | ✅ K-Means + preferencias |
| 16 | Comparador paises | `/comparar` | ✅ Lado a lado |
| 17 | Selector destinos | `/decidir` | ✅ Internacional 107 + Espana 20 |
| 18 | Transparencia operativa | `/transparencia` | ✅ Estado + fuentes + metricas |
| 19 | Manifiesto fundador | `/manifiesto` | ✅ Historia + compromisos |
| 20 | SEO + sitemap | `sitemap.ts` | ✅ 60+ posts indexados |
| 21 | ML Cost Estimate | `/api/ml/cost-estimate` | ✅ IPC + atributos viaje |

---

## OPCIONES PENDIENTES — Priorizadas

### 🔴 ALTA PRIORIDAD

#### 1. ML Predictivo — Predecir cambios riesgo
**Que**: Modelo clasificacion que cruce historial MAEC + OSINT + petroleo + estacionalidad
**Output**: Probabilidad cambio nivel MAEC en 7/14/30 dias
**Tech**: Python scikit-learn (RandomForest/XGBoost) → API serverless
**Tiempo**: 2-3 sprints | **Coste**: €0

#### 2. Chat IA — Mejoras criticas
- [ ] Rate limit server-side (actual localStorage, facil de burlar)
- [ ] Historial conversaciones (guardar en Supabase)
- [ ] Contexto personalizado (favoritos, trips, alertas activas)
- [ ] Generador itinerarios (output estructurado dia a dia)
- [ ] Tool use (consultar mapa, calculadora, OSINT en tiempo real)
- [ ] Voz (speech-to-text + text-to-speech)
**Tiempo**: 1-2 sprints

#### 3. Stripe — Monetizacion real
**Que**: Checkout €4.99/mes + webhook → perfil Supabase + proteger rutas premium
**Tiempo**: 1 sprint | **Coste**: 2.9% + €0.25/transaction

#### 4. API Publica — B2B
**Que**: `/api/v1/risk/{country}`, `/api/v1/incidents`, `/api/v1/tci/{country}` con API keys + rate limiting
**Tiempo**: 2 sprints | **Coste**: €0

### 🟡 MEDIA PRIORIDAD

5. **PWA** — Manifest + service worker + push notifications (1-2 sprints)
6. **Dashboard Premium** — Widgets personalizados, graficos IRV historico, export CSV/PDF (2 sprints)
7. **Datos reales aerolineas** — FlightLabs/AviationStack para precios reales (1 sprint)
8. **Comunidad viajeros** — Perfiles publicos, favoritos compartidos, leaderboard (2-3 sprints)

### 🟢 BAJA PRIORIDAD

9. **Version ingles** — i18n Next.js, traducir UI + contenido (3-4 sprints)
10. **Partnerships aseguradoras** — API riesgo para cotizacion automatica, widget embebible (variable)
11. **Integracion calendarios** — Google Calendar OAuth, alertas pre-viaje (1-2 sprints)
12. **ML Clustering avanzado** — K-Means + DBSCAN + recomendacion colaborativa (2 sprints)

---

## SECUENCIA RECOMENDADA

| Sprint | Entregables | Objetivo |
|--------|-------------|----------|
| **Sprint 1** | Stripe + Chat IA rate limit + Chat IA historial | Monetizar + proteger API |
| **Sprint 2** | ML Predictivo (data + features) + API Publica v1 | Anticipar riesgo + B2B |
| **Sprint 3** | PWA + Chat IA contexto personalizado | Movil + engagement |
| **Sprint 4** | ML Predictivo v2 (entrenar + deploy) + Dashboard Premium | Prediccion real + UX premium |
| **Sprint 5+** | Comunidad → Calendarios → Aseguradoras → Ingles | Escala |

---

## DOCUMENTACION ENTREGADA

| Fichero | Contenido | Formato |
|---------|-----------|---------|
| `ESTADO-PROYECTO.md` | Status completo + 12 opciones + matriz decision + secuencia | Markdown |
| `guia-usuario.org` | Funcionalidades para viajero + diagramas PlantUML | Org-mode (PDF) |
| `guia-gestor.org` | Arquitectura, cron, DB schema, troubleshooting + diagramas | Org-mode (PDF) |
| `analisis-ejecutivo.org` | Propuesta valor, metricas, monetizacion, roadmap + diagramas | Org-mode (PDF) |

---

## NOTAS TECNICAS

### Stack
- Next.js 16 + App Router + TypeScript
- Tailwind CSS + Lucide icons + ReactMarkdown
- Groq API: `llama-3.1-8b-instant` (free), `llama-3.3-70b-versatile` (premium)
- Supabase: PostgreSQL + Auth + RLS
- Resend: 3,000 emails/mes gratis
- **Hosting**: Hetzner VPS (migrado desde Vercel Hobby)
- **Deploy**: GitHub Actions → rsync → PM2 (`/var/www/viajeinteligencia`)
- Telegram: Bot alertas

### Reglas arquitectonicas
- **NUNCA crear nuevos endpoints cron** — añadir tareas a `master/route.ts`
- **Clasificacion OSINT con keywords** para GDELT/RSS (0 coste API)
- **Groq solo para Reddit** (first-person detection necesita contexto)
- **Server pages** = `page.tsx` con metadata + wrap client component
- **Client components** = `*Client.tsx` con `'use client'` directive

### Known issues
- Logo.png 1.8MB — comprimir
- Fotos en `public/photos/` — usar `<Image>`
- Rate limit Chat IA es client-side — necesita server-side con Stripe
- INE API (`servicios.ine.es/wstempus`) devuelve 404 — fallback data usada

---

## ✅ SPRINT CLOUDFLARE ANALYTICS (19 May 2026)

### Background
El cron 8f/8 existía (`cloudflare-analytics.ts`) pero NUNCA obtenía datos reales por país porque `fetchGraphql()` solo consultaba `httpRequests1hGroups` sin `countryMap`. `countries: []`, `topPaths: []`, `statusCodes: {}` — todo vacío.

### Cambios
1. **`cloudflare-analytics.ts`**: `fetchGraphql()` ahora hace 3 consultas en 1 (aliases GraphQL):
   - `hourly`: `httpRequests1hGroups` (totales, SSL, threats) — igual que antes
   - `daily`: `httpRequests1dGroups` con `countryMap` (requests por país en 7 días)
   - `paths`: `httpRequests1hGroups` con `clientRequestPath` (top 20 rutas)
2. **`buildSummary()`**: Tabla ASCII de 15 países con notas explicativas (AU=desarrollo, US=crawlers, ES=residencia)
3. **Admin panel**: Nueva página `/admin/analytics` con tabla de tráfico por país, cards de resumen, top paths, histórico semanal, y leyenda interpretativa
4. **API**: `GET /api/admin/analytics` — sirve `cloudflare_analytics` ordenado por semana

### Notas
- `paths` query no está 100% optimizada (pide path como dimensión en 168 filas horarias, agrega en cliente). Suficiente para 1 vez/semana.
- Crawlers se estima como ~60% del tráfico de US+IE+DE+NL+GB (data centers).

### Lecciones
1. **`countryMap` no es dimensión** — está en `sum.countryMap`, no en `dimensions`. Fácil de pasar por alto en la documentación de Cloudflare GraphQL.
2. **Tres queries en paralelo con aliases** evita hacer 3 llamadas HTTP separadas.
3. El cron ya existía pero daba datos vacíos — nadie lo había verificado.

---

## ✅ SPRINT SEO PILLAR PAGES (19 May 2026)

### Background
Las 3 pillar pages existían pero eran demasiado cortas (~800-1200 palabras cada una). Necesitaban expansión a 3000-5000 palabras con FAQ schema, interlinking a posts satélite y tono solo-founder.

### Cambios

**`/travel-risk-intelligence` (EN pillar):**
- 3 secciones nuevas: OSINT, Sistema de alertas, Comparativa con fuentes alternativas
- FAQ sección con 6 preguntas visibles + JSON-LD schema
- Features grid expandido de 6→9 cards
- Links a 3 posts satélite del blog

**`/osint-para-viajeros` (ES pillar):**
- 2 secciones nuevas: Limitaciones del OSINT, Preguntas frecuentes
- Fuentes grid expandido de 6→9 (WHO DON, ReliefWeb, clustering)
- FAQ schema JSON-LD + FAQ visible renderizado

**`/geopolitica-y-viajes` (ES pillar):**
- FAQ sección nueva con 5 preguntas
- Contenido expandido con ejemplos concretos
- Links a 4 posts satélite

### Cambios generales
- **Tono solo-founder**: reemplazados todos los "nuestra/nuestro" por formas impersonales
- **Verbos 1ª persona plural eliminados**: "monitorizamos"→"se monitoriza", etc.
- **Interlinking**: cada pillar enlaza a las otras 2 + 3-4 posts satélite
- **Build**: verificado sin errores

---

## SPRINTS PENDIENTES

### 🟢 Sprint Colaboradores (prioridad: media)
**Email creado:** `colabs@viajeinteligencia.com`

Idea: reclutar colaboradores (redactores de contenido, traductores, community managers) para escalar el proyecto sin coste. Posibles acciones:
- Landing page "Colabora con nosotros" con beneficios (byline, enlace a portfolio, acceso anticipado a features)
- Programa de afiliados para bloggers de viajes
- Contribuciones OSINT (crowdsourcing de alerts locales)
- Traducciones comunitarias (inglés, portugués, francés)

**Pendiente de diseñar en el sprint correspondiente.**

### 🟢 Sprint API B2B Stripe (prioridad: media-alta)
- Integrar checkout Stripe en tiers Starter/Pro/Enterprise
- Webhook para actualizar `api_keys.tier` al confirmar pago
- Rate limiting server-side por tier

### 🟢 Sprint África — 28 países pendientes (prioridad: alta)
**Motivación:** La página `/geopolitica-y-viajes` tiene un monitor de conflictos con 8 países para enlazar a fichas. Conflictos ya existen en paises-data.json.

**Pendientes:**
- África (17): GA, GQ, MG, ML, NE, TD, ZM, ZW, BJ, BF, BI, MW, NA, SL, LR, DJ, ER
- LATAM/Asia (3): UY, PY, NP
- **Completado (20 May):** RU, UA, IR, IL, LB, SY, YE, VE ya existen y links `<Link>` activos en conflict monitor

### 🟢 Sprint Performance Mobile — Lighthouse 74→90+ (prioridad: alta)
**Motivación:** Lighthouse en Moto G Power da 74 rendimiento, LCP 5.9s. Urgente para Core Web Vitals y usuarios móviles.

**Pendientes:**
- Reducir JS no usado (~211 KiB) — lazy load Leaflet, Recharts, Chat IA
- Mejorar LCP (5.9s → <2.5s) — hero image optimizada, preload, render-blocking resources
- FCP (1.7s → <1.5s)
- Accesibilidad (90→100) — aria-labels en botones, heading order, dialog names
- Best Practices (88→100) — errores consola, imágenes baja resolución
- Optimizar imágenes: WebP/AVIF, caché lifetimes
- DOM size, CLS, image delivery

### 🟢 Sprint SEO Pillar Pages (prioridad: completada)
- `/travel-risk-intelligence` (EN), `/osint-para-viajeros`, `/geopolitica-y-viajes`
- Interlinking con blog existente
- Schema Article + FAQ

### 🟢 Sprint Outreach (prioridad: baja)
- Publicar drafts de Reddit (4) y Facebook (2) desde `content/outreach/`
- Email outreach a bloggers/agencias

---

## COMANDOS UTILES

```bash
npm run dev                    # Dev server
npm run build                  # Production build
npm run lint                   # Linting
npm run check                  # Full check

# Test cron
curl -s -H "Authorization: Bearer $CRON_SECRET" \
  "https://www.viajeinteligencia.com/api/cron/master" | python3 -m json.tool

# Deploy
git add -A && git commit -m "msg" && git push
```

---

## PENDIENTES GENERALES (sin priorizar)

### Stripe billing B2B
- Checkout Stripe en tiers Starter/Pro/Enterprise
- Webhook para actualizar `api_keys.tier` al confirmar pago
- Rate limiting server-side por tier

### Chat IA
- Rate limit server-side
- Modal "Quiero esto para aquí" leads → admin page

### SEO / Content
- Schema Article (no solo FAQ) en pillar pages
- Posts satélite dedicados por pillar (3-5 más cada uno)
- Versión EN de pillar pages ES
- Añadir `/ecosistema` a sitemap.xml

### ML / Data
- Validación temporal CV (~25 días de datos)
- Widget "Clima de viaje" en ficha de país (tone_score badge)
- Newsletter con sentimiento semanal
- Tendencias semanales de sentimiento (página admin)
- Alertas de sentimiento (umbral tone_score)
- Análisis frecuencia de palabras (osint_word_trends)

### Infra / Admin
- Admin API Leads page (solicitudes de api_plan_requests)
- FlightLabs integration en Reclamaciones (verificar retraso real)
- Vinculación Telegram verification (flujo completo)

### Marketing
- Publicar Reddit (4 drafts) + Facebook (2 drafts)
- Email outreach a bloggers/agencias
- Añadir enlace Modo Emergencia en footer (texto, no solo botón flotante)

---

*Actualizado: 20 May 2026*
