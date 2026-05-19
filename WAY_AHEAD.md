# Way Ahead

## Última sesión: 19 May 2026 — Sprint Chromium fix + OSINT gap + países críticos África

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

## 🌍 PAÍSES CRÍTICOS DE ÁFRICA CENTRAL — PENDIENTES (19 May 2026)

**Detonante:** Brote de Ebola Bundibugyo en RDC y Uganda (PHEIC 17 May 2026). El sistema NO detectó el brote porque:
1. WHO RSS feed roto (404) → reemplazado por ReliefWeb
2. `ebola` y enfermedades clave no estaban en keywords → añadidas
3. RDC y Uganda NO existían en nuestra base de datos → añadidos

**Países africanos críticos que siguen faltando (priorizar):**

| Código | País | Motivo |
|--------|------|--------|
| AO | Angola | Frontera RDC, petróleo, turismo |
| CM | Camerún | África Central, seguridad |
| CI | Côte d'Ivoire | Economía creciente, turismo |
| CG | República del Congo | Frontera RDC, brotes |
| CF | República Centroafricana | Conflicto activo |
| GA | Gabón | África Central |
| GQ | Guinea Ecuatorial | Hispanohablante, petróleo |
| MG | Madagascar | Destino turístico único |
| ML | Malí | Conflicto Sahel |
| NE | Níger | Conflicto Sahel |
| TD | Chad | Conflicto, frontera Sudán |
| SO | Somalia | Conflicto, ya en conflictZones |
| SS | Sudán del Sur | Conflicto, nuevo país |
| ZM | Zambia | Turismo (Victoria Falls) |
| ZW | Zimbabue | Turismo, inestabilidad |
| BJ | Benín | África Occidental |
| BF | Burkina Faso | Conflicto Sahel |
| BI | Burundi | Frontera RDC |
| MW | Malaui | África Austral |
| NA | Namibia | Turismo, frontera Angola |
| SL | Sierra Leona | África Occidental |
| LR | Liberia | África Occidental |
| DJ | Yibuti | Estratégico, cuerno África |
| ER | Eritrea | Cuerno África |

**Acción:** Añadir en próximos sprints. Priorizar países con: conflicto activo, brotes sanitarios, frontera con RDC/UG, o relevancia turística.

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

### Lo conseguido en esta sesión (19 May — sesión 2)

| # | Entregable | Detalle |
|---|------------|---------|
| 1 | **Chromium map fix** | SW saltaba unpkg.com por CSP connect-src → leaflet-css-loader colgado. Fix: try-catch + timeout + SW skip unpkg |
| 2 | **OSINT gap Ebola** | WHO RSS feed 404 (meses roto) → ReliefWeb. Añadidas keywords ebola, cholera, marburg, nipah, zika, pandemic, pheic. GDELT limit 30→50 |
| 3 | **Países críticos** | Añadidos RDC (CD) muy-alto y Uganda (UG) alto con fichas, embajadas, índices |
| 4 | **Build fix** | /alertas page hacía fetch a producción en build estático → timeout 60s. Cambiado a force-dynamic |

---

## SISTEMA ACTUAL — Arquitectura

### Cron Master (UNICO en Vercel Hobby)
- **Horario**: 06:00 UTC diario, ~95s ejecucion
- **Fase 1 (paralelo)**: MAEC scrape 26 paises (90s) + Airspace OSINT (30s) + Oil price (15s)
- **Fase 2 (dependencias)**: Risk alerts (30s) + Flight costs/TCI 107 paises (60s)
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
| 1 | Mapa riesgo interactivo | `/` | ✅ Leaflet + MAEC 107 paises |
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

*Actualizado: 07 May 2026 — sesion finalizada*
