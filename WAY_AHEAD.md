# Way Ahead

## Última sesión: 28 May 2026 — Early Bird Daily Admin Digest

> **Último deploy verificado:** OK ✅ (commit `920505d`, early bird endpoint funcional)
>
> **Sprint activo:** Admin awareness tools
>
> **Logros día (28 May):**
>
> ### Early Bird — Resumen diario para admin
> - ✅ **Librería `src/lib/early-bird.ts`**: Construye digest con incidentes (24h), cambios MAEC (48h), alertas sentimiento (24h). Formato markdown con emojis por severidad.
> - ✅ **Route `/api/cron/early-bird`**: Endpoint protegido con `CRON_SECRET`, importa y ejecuta `buildEarlyBirdDigest` + `sendEarlyBirdDigest`.
> - ✅ **Envío dual**: Telegram (canal admin) + Email (Resend a `info@viajeinteligencia.com`).
> - ✅ **Cron servidor**: `0 7 * * *` UTC — se ejecuta 1h después del master cron (06:00) para tener datos frescos.
> - ✅ **Test live verificado**: `{"status":"ok","message":"Early bird digest sent"}` — digest enviado correctamente.
> - ✅ **Commit**: `920505d` — deployado y funcional.
>
> ### Estado post-deploy
> | Componente | Estado |
> |------------|--------|
> | Early Bird lib | ✅ `src/lib/early-bird.ts` |
> | Early Bird route | ✅ `/api/cron/early-bird` |
> | Cron servidor | ✅ 07:00 UTC |
> | Telegram | ✅ Enviado |
> | Email | ✅ Enviado (Resend) |
> | PM2 | online, 0 reinicios |

## Última sesión: 27 May 2026 — Deploy fix + OpenGraph + Cloudflare WAF

> **Último deploy verificado:** OK ✅ (commit `ff23d30`, deploy GH Actions funcional)
>
> **Sprint activo:** Server stability + UX fixes
>
> **Logros día (27 May):**
>
> ### Deploy fix — build corrupto
> - ✅ **Causa**: Archivos untracked en servidor (`src/app/api/admin/paises/sync/`, `src/app/api/seo/ping-google/`, `src/app/en/geopolitica-y-viajes/`, `src/app/en/osint-para-viajeros/`) bloquearon `git pull`, `.next` quedó inconsistente con código
> - ✅ **Fix**: `rm -rf` untracked + `git pull` + `rm -rf .next` + rebuild limpio + PM2 restart
> - ✅ **Commit**: `6e9b84c` → deployado manualmente tras fallo de GH Actions
>
> ### OpenGraph `type: 'place'` invalid — fichas de país rotas
> - ✅ **Bug**: `src/app/pais/[codigo]/page.tsx:32` usaba `openGraph.type: 'place'` — Next.js 16 rechaza este tipo, lanzaba `Error: Invalid OpenGraph type: place` (digest `1720759795@E237`)
> - ✅ **Síntoma**: Fichas de país mostraban "Algo salió mal — Ha ocurrido un error al cargar la página del país"
> - ✅ **Fix**: Cambiado `type: 'place'` → `type: 'website'`
> - ✅ **Commit**: `ff23d30` — deployado manualmente tras fallo de GH Actions (mismo problema de untracked files)
>
> ### Cloudflare WAF — regla bloqueando usuarios reales
> - ✅ **Bug**: Regla "Filtro Scrapers y Bots Streamlit" bloqueaba `Firefox/151.0 + Ubuntu` — patrón de usuario real muy común (2.85% del tráfico, 876 requests)
> - ✅ **Síntoma**: 502 Bad Gateway para usuarios con Firefox en Ubuntu
> - ✅ **Fix**: Eliminada regla antigua. Creada nueva WAF custom rule solo para bots reales: `TLM-Audit-Scanner`, `l9scan`, `/_stcore/` → managed_challenge
> - ✅ **API**: Cloudflare rulesets API — PUT `http_request_firewall_custom` con expresión corregida
>
> ### Commits del día
> | Commit | Descripción |
> |--------|-------------|
> | `ff23d30` | fix: opengraph type 'place' invalid en pais/[codigo]/page.tsx |
> | `6e9b84c` | fix: cron catchup whitespace bug, model training await, early-bird dead cron, health check script, auth on cron endpoints |
>
> ### Estado post-fixes
> | Página | Estado |
> |--------|--------|
> | Homepage | 200 |
> | Ficha país (ES) | 200 |
> | Blog | 200 |
> | API Health | 200 — healthy |
> | PM2 | online, 0 reinicios |
> | Cloudflare WAF | solo bots bloqueados |
>
> ### 🔐 Credenciales consolidadas — Todos los sistemas protegidos

**Fuente única:** `/etc/nginx/.htpasswd` (compartido por todos los subdominios protegidos)

| Subdominio | Servicio | Auth |
|---|---|---|
| `status.viajeinteligencia.com` | Uptime Kuma + GoAccess | ✅ htpasswd |
| `security.viajeinteligencia.com` | SIEG Security (fail2ban) | ✅ htpasswd |
| `viajeinteligencia.com` | App principal | ❌ público |
| `gc.motors.viajeinteligencia.com` | GC Motors | ❌ público |
| `georisk.viajeinteligencia.com` | GeoRisk | ❌ público |

**Credenciales únicas:**
- **Usuario:** `status`
- **Password:** `ViajeIntel2026!Monitor`

**Gestión:**
```bash
# Cambiar password
sudo htpasswd /etc/nginx/.htpasswd status

# Añadir nuevo usuario
sudo htpasswd /etc/nginx/.htpasswd <usuario>

# Eliminar usuario
sudo htpasswd -D /etc/nginx/.htpasswd <usuario>

# Recargar nginx tras cambio
sudo nginx -t && sudo systemctl reload nginx
```

### Status subdomain protegido con password
> - ✅ **Problema**: `status.viajeinteligencia.com/trafico.html` (GoAccess) y `/dashboard` (Uptime Kuma) accesibles públicamente sin autenticación
> - ✅ **Fix**: nginx `auth_basic` con htpasswd en `/etc/nginx/sites-enabled/status`
> - ✅ **Verificación**: sin auth → 401, con auth → 200

## Sesión actual (25 May tarde/noche) — GSC Fixes + Server stability consolidación
>
> ### Contenido
> - ✅ **Post Ebola creado**: `content/posts/ebola-turismo-internacional-crisis-sanitaria-africa.md` — 430+ líneas con SEO, frontmatter, enlaces ecosistema. Commit `eb2682a`
> - ✅ **Fact-checking OSINT + OMS**: Verificadas todas las afirmaciones vs WHO DON, CDC HAN. PHEIC confirmada DG Tedros 16 Mayo. Datos corregidos: 8 confirmados, 246 sospechosos, 80 muertes. Commit `eb2682a`
> - ✅ **Cronología Ebola virus mayo 2026**: Tabla con hitos reales 5-25 May (en vez de cronología del ecosistema). Commit `b1e5713`
> - ✅ **Imagen mapa riesgo OMS**: `public/screenshot-oms-riesgos-2026.png` al inicio del post. Commit `101e2fa`
> - ✅ **Ebola data en paises-data.json**: 3 referencias CD/CG/UG actualizadas. Commit `eb2682a`
> - ✅ **Nota editor insertada**: Newsletter #39 + Posts RRSS via Supabase REST
>
> ### Server stability — FIX DEFINITIVO
> - ✅ **Causa raíz #1**: `cron-catchup.ts` hardcodeaba `localhost:3001` → ECONNREFUSED en cada request SSR. Eliminado del layout (commit `abceeb7`)
> - ✅ **Causa raíz #2**: `deploy.yml` usaba `pm2 startOrReload` que NO relee config del archivo si el proceso ya existe en `dump.pm2`. Cambiado a `pm2 delete + pm2 start` (commit `abceeb7`)
> - ✅ **Causa raíz #3**: `ecosystem.config.js` con `args: "start -- --port 3000"` incorrecto. Sincronizado con `.cjs` (commit `abceeb7`)
> - ✅ **Build corrupto**: `.next` de solo 1.9MB tras deploy previo (build falló silenciosamente). Rebuildeado manualmente: 676 rutas, 80s
> - ✅ **Deploy GH Actions verificado**: Push dummy `b45ddf9` → build + delete + start + save → PID 192494, 0 reinicios, todas las rutas 200
> - ✅ **PM2 save**: Config persistida tras cada deploy
>
> ### SSH
> - **Usuario/IP**: `deploy@178.105.80.193`
> - **CWD**: `/var/www/viajeinteligencia`
> - **PM2**: `pm2 delete <app> && pm2 start ecosystem.config.cjs --only <app> && pm2 save`
> - **Regla**: Si se toca `ecosystem.config.cjs` en git, el deploy workflow ya forza delete+start automáticamente. No tocar manualmente.
>
> ### Observaciones
> - Post editorial verificado contra datos OMS reales. Cronología del virus (no del ecosistema) en el post
> - PHEIC declarada bajo art. 12 RSI (nueva clasificación pandemia). 1ª vez que DG declara PHEIC antes de convocar al Comité de Emergencia
> - No hay vacuna ni tratamiento aprobado para cepa Bundibugyo
> - Server estable tras los 4 fixes. Último deploy automático verificado funcional

## Sesión actual (25 May tarde/noche) — GSC Fixes + Server stability consolidación

> **Último deploy verificado:** ✅ (commit `18162af`, PID 198785, port 3000)

### Logros adicionales del día

#### Newsletter link
- ✅ Enlace `/newsletter` añadido a Footer (sección Recursos) y TopBar (entre Radar y LanguageSelector). Commits `b7005f7`

#### Fix overflow mapa interactivo PremiumRiskMap
- ✅ El mapa funcionaba pero los tiles Leaflet se desbordaban del contenedor y tapaban la toolbar de selección/comparación
- **Fix:** `overflow-hidden` en wrapper del mapa + `relative z-10` en toolbar. Commit `f0bb0dd`

#### Google Search Console — Diagnóstico + Fixes
- ✅ **9 Page with redirect** (Failed): Cloudflare Page Rule creada para redirect único HTTP→HTTPS+WWW (antes doble redirect 301→308). Commit vía API Cloudflare
- ✅ **2 Redirect error** (Failed): Causa = middleware 500 previo. URLs `/blog/como-encontrar-vuelos-baratos` y `viajeinteligencia.com/blog` ya funcionan OK hoy
- ✅ **45 Alternative canonical** (Not Started): Fix principal — `/viajes/clima/{code}` tenía canonical al homepage por herencia del layout raíz. Creado `layout.tsx` en `[codigo]/` con canonical a `/pais/{code}`. Commit `b63cc83`
- ✅ **1 Blocked by robots.txt**: Dato de 13 May — robots.txt actual NO lo bloquea. Sin acción
- ✅ **5 Crawled not indexed**: 3/5 son XML/assets (no aplica), 2/5 son contenido real que necesita tiempo. Sin acción urgente
- ✅ **44 Excluded by noindex**: Intencional (blog filters/pagination). Correcto
- ✅ **198 Discovered not indexed**: Normal para site de 2 semanas. IndexNow ya activo, 488 URLs enviadas

#### X-Robots-Tag noindex
- ✅ Añadido `X-Robots-Tag: noindex` vía `next.config.ts` para `/feed.xml`, `/sitemap.xml`, `/_next/static/*`. Commit `18162af`
- **Motivo:** Google crawleaba el RSS feed y fuentes .woff2 como si fueran páginas

#### PM2 verificado
- ✅ 0 reinicios, port 3000, script directo a next/bin, args correctos

### Commits del día
| Commit | Descripción |
|--------|-------------|
| `abceeb7` | Fixes server stability (cron-catchup, deploy.yml pm2 delete+start, ecosystem.config sync) |
| `eb2682a` | Post Ebola + fact-checking OMS + paises-data.json |
| `b1e5713` | Cronología real virus Ebola (no del ecosistema) |
| `101e2fa` | Screenshot mapa riesgo OMS |
| `b7005f7` | Newsletter link footer + TopBar |
| `f0bb0dd` | Fix overflow mapa + z-index toolbar |
| `b63cc83` | Canonical viajes/clima/{code} → /pais/{code} |
| `18162af` | X-Robots-Tag noindex for feed/sitemap/static |

### Estado GSC post-fixes
| Categoría | Antes | Ahora | Acción |
|-----------|-------|-------|--------|
| Page with redirect | 9 (Failed) | ✅ Fix deployado | Esperar recrawleo |
| Redirect error | 2 (Failed) | ✅ URLs OK | Esperar recrawleo |
| Alternative canonical | 45 (Not Started) | ✅ Fix deployado | Esperar recrawleo |
| Blocked by robots.txt | 1 | ✅ Ya no bloqueado | Esperar recrawleo |
| Crawled not indexed | 5 | ⏳ 3 normales + 2 tiempo | Esperar |
| noindex | 44 | ✅ Intencional | Sin acción |
| Discovered not indexed | 198 | ⏳ Normal site nuevo | IndexNow + tiempo |
| Server error (5xx) | 0 | ✅ 0 | Confirmado estable |

### Técnico
- Cloudflare Page Rule creada: redirect `viajeinteligencia.com/*` → `https://www.viajeinteligencia.com/$1` (301). Eliminadas 3 reglas disabled previas (cache .jpg/.webp/_next/static)
- Always Use HTTPS ON + SSL Strict
- Host redirect en `next.config.ts` se mantiene como fallback para accesos directos HTTPS sin WWW

## 25 May 2026 — Sprint Rendimiento + Cloudflare Analytics + Stripe Audit + Outreach

> **Último deploy verificado:** OK ✅ (commit `7b42309`)
>
> **Sprint activo:** Rendimiento LCP + CF Analytics + Outreach
>
> **Logros día (25 May):**
>
> ### Mañana — Diagnóstico y Fixes
> - ✅ **Cloudflare Analytics reparado**: Token API reemplazado (el anterior tenía permisos `[]`). Query GraphQL reescrita: usaba `httpRequests1hGroups` con 7 días (límite 3d) + 3 bloques `viewer` (solo 1 permitido) + campo `clientRequestPath` inexistente en plan Free. Cambiado a `httpRequests1dGroups` con single viewer. **Datos verificados en Supabase**: 69.424 req, 13.264 page views, 5.355 uniques, 56 países, 1.47 GB
> - ✅ **Cron CF Analytics**: Cambiado de "solo domingos" a "ejecuta si no hay datos de la semana actual". Si falla un día, reintenta al siguiente sin esperar 7 días
> - ✅ **Stripe audit**: Integración completa verificada — checkout LIVE, webhook 5 eventos, portal facturación, trials 7d, página premium operativa con precios reales (4.99€/mes, 19.99€/año)
>
> ### Mediodía — Rendimiento LCP
> - ✅ **HeroSearch dinámico**: Cambiado a `dynamic(() => import(...))` — saca ~380 KB de `paises-data.json` del bundle JS inicial
> - ✅ **HomeBelowFold dinámico**: `dynamic()` con `ssr:true` — 7 componentes hijos se cargan como chunk separado, el HTML se sigue sirviendo en SSR
> - ✅ **Footer dinámico**: `dynamic()` con `ssr:true` — no bloquea el hero
> - ✅ **Init functions fire-and-forget**: Las 7 llamadas a Supabase en `layout.tsx` ya no bloquean el render (TTFB ya no espera)
> - **Impacto estimado**: LCP de 6.2s → ~2.5-3.5s en Moto G4 / Slow 4G
>
> ### Tarde — África + Outreach
> - ✅ **Sprint África**: Verificado. Los 17 países grandes africanos (Malí, Níger, Chad, Burkina Faso, etc.) ya estaban en la BD. Solo faltan 12 microestados/territorios sin cobertura MAEC (Cabo Verde, Gambia, Seychelles, etc.) — baja prioridad
> - ✅ **Drafts outreach listos**: 4 Reddit + 2 Facebook en `content/outreach/`. Contenido actualizado con señales de seguridad de la semana
>
> ### Deploy
> - `7b42309` — perf + CF analytics + cron fixes. Push a main, GitHub Actions desplegando

## 24 May 2026 — Sprint UX + Lead Magnet + ML Post + Estabilidad + Groq Retry + Telegram Vincular + API Self-Service

> **Último deploy verificado:** OK ✅ (commit `b52df69`)
>
> **Sprint activo:** UX + Lead Magnet + Indexación Google + Contenido + Estabilización Groq
>
> **Logros día (24 May):**
>
> **Mañana:**
> - ✅ **Hero inglés `/en`**: Server-rendered con H1 "Is it safe to travel to...?" + CTAs en inglés
> - ✅ **Fix `/reporte-riesgo` cache**: Cache-Control no-cache + fetch no-store. Bug "solo private window" corregido
> - ✅ **Sync paises a Supabase**: Somalia, RCA, Sudán del Sur con `queHacer` correcto
> - ✅ **Fix esquema SQL incidents**: Añadido `detected_at` a schemas canónicos + explícito en incident-detector
> - ✅ **Footer iconos**: Telegram, GitHub, Email (Mail), RSS añadidos. Columna Comunidad reordenada con iconos consistentes
> - ✅ **Fix comparador seguros**: Zod schema rechazaba nombres de país (exigía código ISO 2 chars). Relajado min(2).max(50)
> - ✅ **Blog post ML**: Publicado "Cómo entrenamos una IA para predecir riesgos de viaje en 136 países"
> - ✅ **RRSS automatizado**: Post del ML blog a Mastodon, Bluesky y Telegram
> - ✅ **X/Twitter**: Post manual del ML blog
> - ✅ **Outreach calendar**: X/Twitter marcado como completado
>
> **Tarde (sprint técnico):**
> - ✅ **Crontab servidor + catchup**: Crontab Hetzner verificado + catchup al startup (si pasó 06:00 UTC, lanza cron automáticamente). Infografía #20 generada y publicada a RRSS
> - ✅ **Descarga infografía**: Botón "Descargar" en detalle y listado de infografías (enlace directo a WebP en Supabase Storage)
> - ✅ **Foto autor en manifiesto**: Círculo "M" reemplazado por `foto-autor.jpg` en `/manifiesto` (mismo estilo que homepage)
> - ✅ **Groq retry con backoff**: Utilidad `withGroqRetry()` aplicada a los 9 módulos con llamadas a Groq (osint-sensor, events-groq, infografia, weekly-risk, newsletter, gen-doc, ai-assistant, reddit-generate, telegram). Backoff 1s→16s, 5 retries, jitter ±20%
> - ✅ **Timeout news sentiment**: 180s→300s
> - ✅ **Telegram vincular mejorado**: Botón "🔗 Vincular cuenta" en menú principal del bot, comando `/desvincular` (elimina `telegram_id` de profiles), badge "Telegram vinculado ✓" en dashboard y alertas
> - ✅ **API self-service**: Formulario email → API Key gratis al instante en `/precio-api` (1.000 req/mes, sin Stripe, sin registro). Tier Free actualizado de 100→1.000 req/mes
> - ✅ **Stripe sin cambios**: Se descarta crear nuevos productos en Stripe. API Pro (4.99€) funciona con checkout existente. Enterprise solo contacto email. Stripe no se toca más

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

## 📊 MONITOREO — Uptime Kuma

| Dato | Valor |
|------|-------|
| URL | `https://status.viajeinteligencia.com/dashboard` |
| Puerto | `3002` (localhost) |
| Contenedor | Docker: `louislam/uptime-kuma:latest` |
| Estado | ✅ Healthy (up 19h+) |
| Monitores | 6 (viajeinteligencia, georisk, georisk-api, georisk-next, gc-motors, kuma propio) |

## 📈 TRÁFICO — GoAccess

| Dato | Valor |
|------|-------|
| URL | `https://status.viajeinteligencia.com/trafico.html` |
| Actualización | Cada 15 min (cron) |
| Datos | Visitantes únicos, páginas, países, rutas, user agents, códigos HTTP |

```bash
# Ver estado
curl -sS -o /dev/null -w "%{http_code}" "https://status.viajeinteligencia.com/dashboard"

# Ver contenedor
sudo docker ps | grep uptime-kuma
```

---

## ⚠️ LECCIÓN CRÍTICA — DEPLOY OOM HETZNER (20 May 2026)

**Bug:** El despliegue fallaba en el paso `npm run build` remoto. El VPS (2GB RAM) se quedaba sin memoria durante el build de Next.js.

**Fix:**
1. Añadir swap de 2GB en el workflow (`sudo fallocate -l 2G /swapfile && sudo swapon /swapfile`)
2. Pasar `NODE_OPTIONS=--max-old-space-size=1536` en el comando `npm run build`
3. Swap se elimina automáticamente al reiniciar el VPS (no persistente)

**Código añadido a `deploy-hetzner.yml`:**
```yaml
- name: Build Next.js
  run: |
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    NODE_OPTIONS="--max-old-space-size=1536" npm run build
    sudo swapoff /swapfile
    sudo rm /swapfile
```

**Regla:** Hetzner CX22 (2GB RAM) necesita swap para builds de Next.js. Si el deploy falla sin error claro, asumir OOM primero.

---

## ⚠️ LECCIÓN CRÍTICA — CRON ASYNC + TIMEOUT CLOUDFLARE (20 May 2026)

**Bug:** `/api/cron/master` devolvía 504 Gateway Timeout porque Cloudflare Workers limita a 100s. GitHub Actions cron esperaba respuesta HTTP — al recibir 504 lo marcaba como fallo.

**Fix:**
1. Refactorizar el cron handler: retorno **202 Accepted** inmediato
2. El procesamiento real se ejecuta asíncronamente en `runCronAsync()` (sin `await`)
3. `PHASE1_TIMEOUT_MS` subido de 150s a 240s
4. GitHub Actions workflow `.github/workflows/cron.yml` acepta HTTP 202 como éxito

**Regla:** Cualquier endpoint que pueda exceder 100s debe usar async + retorno 202. Cloudflare Workers limita a 100s por request.

---

## ⚠️ LECCIÓN CRÍTICA — RLS EN SUPABASE (20 May 2026)

**Bug:** 4 tablas (`osint_word_trends`, `seguros_catalog`, `seguros_perfiles`, `user_watchlist`) no tenían RLS habilitado. Los datos eran accesibles públicamente a través de la API anónima de Supabase.

**Fix:** Ejecutar `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + políticas de lectura/escritura para cada tabla. `supabase/fix_rls_tables.sql`.

**Regla:** Toda tabla nueva en Supabase debe tener RLS + policies antes del primer deploy. Supabase envía alertas de seguridad — resolver antes de 24h.

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

### Lo conseguido en esta sesión (20 May — Sprint Captación día 1 + infra/ML)

| # | Entregable | Detalle |
|---|------------|---------|
| 1 | **Captación A1-A4, B1-B3, D1-D2** | Lead magnet, trial Chat IA, /colaborar, /afiliados, FB, Reddit, LinkedIn, Telegram diario, email onboarding, notificaciones cambio riesgo |
| 2 | **Cron async fix** | Retorno 202 inmediato + `runCronAsync()` en background. Evita 504 Cloudflare (100s timeout). `PHASE1_TIMEOUT_MS=240000` |
| 3 | **Word frequency anomaly detection** | `src/lib/word-trends.ts` — extrae palabras de OSINT 24h, z-score vs baseline 7d, persiste en `osint_word_trends`. Anomalías → Telegram alert. Integrado en master cron 5e/8 |
| 4 | **Sentimiento integrado en scoring heurístico** | `computeRiskScore()` escala con `avg_tone_7d`, `tone_trend_7d`, `negative_ratio_7d`, `tone_volatility_7d`. `computeProbability()` refleja umbrales. `buildFeatureVector()` corregido: 25 features |
| 5 | **Deploy OOM fix** | Swap 2GB + `NODE_OPTIONS=--max-old-space-size=1536` en build remoto. Hetzner CX22 (2GB RAM) ya no falla en npm run build |
| 6 | **RLS fix** | 4 tablas sin RLS (`osint_word_trends`, `seguros_catalog`, `seguros_perfiles`, `user_watchlist`) ahora con policies. Resuelto aviso crítico Supabase |
| 7 | **Extras día 1** | Sitemap fix (route handler dinámico), robots.txt limpiado, queHacer 3 países (CF, SO, SS), analytics gráficos admin |

### Lo conseguido en esta sesión (22 May — RRSS + Risk History API + Retention)

| # | Entregable | Detalle |
|---|------------|---------|
| 1 | **RRSS lanzamiento** | Bluesky, Mastodon, Telegram, X. Tono OSINT/data-driven. Admin calendario actualizado. |
| 2 | **OSINT boost eliminado** | `useIncidentBoost.ts` borrado. `applyBoost` eliminado de todas las referencias. OSINT solo contextual (banner, timeline). |
| 3 | **Outbreak override eliminado** | `fetchActiveOutbreakCountries()` borrado. Riesgo sanitario exclusivamente WHO. |
| 4 | **Risk history endpoint** | `/api/v1/risk/{country}/history`, parámetro `?days=30-90`. Auth via API Key. |
| 5 | **Retention policy 90 días** | `cleanupOldRecords()` en master cron. Documentado en metodología, transparencia y ecosistema. |
| 6 | **Deploy** | Commits `acfce27`, `440d4a0` → main. Build OK. CI verde. |

### Lo conseguido en la sesión anterior (21 May — Homepage EN + Incident boost OSINT)

| # | Entregable | Detalle |
|---|------------|---------|
| 1 | **Homepage EN (`/en`)** | Refactor i18n completo. ~80 keys, `t()` con params. `/en` renderiza homepage moderna. |
| 2 | **SentimentClimate bug fix** | `location_name` null para 4/6 fuentes. Filter por countryCode vía `ilike` en Supabase. |
| 3 | **ML scoring corregido** | RIESGO_SCORE bajo 85/alto 15, seasonScore 100/67/33/0, stretch 1.5x. Rango típico ~50-95. |
| 4 | **Timestamp bug -42826 min** | 4 funciones `timeAgo` con guardas `isNaN()` + `diff < 0`. MAEC fecha normalizada a ISO. |
| 5 | **España filtrada clustering** | `filter(d.code !== 'es')` en `getRecommendations()`. |
| 6 | **Middleware fix** | Matcher restringido, try/catch en getUser(). Googlebot ya no recibe 5xx. |
| 7 | **Fix 500 /viaje-coste** | Migrado a next.config.ts redirect (308). Pages eliminados. |
| 8 | **Fix 500 /api/pais/xx/osint** | Early return con array vacío para códigos inválidos. |
| 9 | **noindex premium pages** | /clustering e /itinerario con `robots: { index: false }`. |
| 10 | **Deploy** | Commits `896b866` → main. CI verde.

### Lo conseguido en la sesión anterior (19 May — sesión 4)

| # | Entregable | Detalle |

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

## FUNCIONALIDADES COMPLETADAS (25)

| # | Funcionalidad | Endpoint | Estado |
|---|---------------|----------|--------|
| 1 | Mapa riesgo interactivo | `/` | ✅ Leaflet + MAEC 137 paises |
| 2 | Calculadora costes TCI | `/coste` | ✅ Petroleo + conflictos |
| 3 | Blog 61 articulos | `/blog` | ✅ Paginacion, busqueda, grid/list |
| 4 | Chat IA viajes | `/chat` | ✅ Groq 8b free / 70b premium |
| 5 | OSINT automatico | `/api/cron/master` | ✅ 73 fuentes, async 202 |
| 6 | Detector incidentes | `incident-detector.ts` | ✅ 10 tipos, clustering |
| 7 | Newsletter semanal | `newsletter-generator.ts` | ✅ Groq + HTML, double opt-in |
| 8 | Pagina OSINT publica | `/osint` | ✅ Incidentes + notas + ratings |
| 9 | Sistema valoraciones | `/api/data-ratings` | ✅ Generico, cualquier entidad |
| 10 | Notas analista | `/admin/incidents` | ✅ Admin panel + API |
| 11 | Cron master unificado | `/api/cron/master` | ✅ ~97s async, 8 tareas |
| 12 | Auth Supabase | `/auth/*` | ✅ Magic link + password + Telegram |
| 13 | Dashboard usuario | `/dashboard` | ✅ Favoritos, trips, perfil |
| 14 | Reclamaciones | `/reclamaciones` | ✅ 8 tipos, gratis/premium |
| 15 | Rutas tematicas Espana | `/rutas` | ✅ K-Means + preferencias |
| 16 | Comparador paises | `/comparar` | ✅ Lado a lado |
| 17 | Selector destinos | `/decidir` | ✅ Internacional 107 + Espana 20 |
| 18 | Transparencia operativa | `/transparencia` | ✅ Estado + fuentes + metricas |
| 19 | Manifiesto fundador | `/manifiesto` | ✅ Historia + compromisos |
| 20 | SEO + sitemap | `sitemap.ts` | ✅ Route handler dinamico |
| 21 | ML Cost Estimate | `/api/ml/cost-estimate` | ✅ IPC + atributos viaje |
| 22 | Word frequency anomaly | `word-trends.ts` | ✅ Z-score + Telegram alert |
| 23 | Sentimiento en scoring | `ml-risk-predictor.ts` | ✅ 5 features en heuristico |
| 24 | RLS fix 4 tablas | — | ✅ osint_word_trends, seguros*, user_watchlist |
| 25 | Deploy con swap | `.github/workflows/` | ✅ OOM fix Hetzner CX22 |
| 26 | Homepage EN | `/en` | ✅ Refactor i18n, ~80 keys, `t()` con params |
| 27 | SentimentClimate country filter | `sentiment-climate/route.ts` | ✅ Filter por countryCode vía `ilike` |
| 28 | Risk History API | `/api/v1/risk/{country}/history` | ✅ 30-90d histórico MAEC via API Key |
| 29 | Retention policy 90d | `cron/master/route.ts` | ✅ Auto-cleanup, docs en metodologia/transparencia |
| 30 | RRSS lanzado | Bluesky, Mastodon, Telegram, X | ✅ Tono OSINT/data-driven |
| 31 | Admin AI Assistant | `/admin/ai-assistant` | ✅ 4 modos (SEO, posts, meta, free) con Groq |
| 32 | Manifiesto EN | `/manifiesto` | ✅ Travel Intelligence manifesto |
| 33 | Bias disclaimer | `BiasDisclaimer.tsx` | ✅ Badge en mapa + fichas país |
| 34 | Contexto geopolítico | 27 países en `paises-data.json` | ✅ Notas sesgo diplomático |
| 35 | Zoom móvil + gesture | Leaflet gesture handling | ✅ Sin scroll accidental |
| 36 | África 17 países | GA, GQ, MG, ML, NE, TD... | ✅ Todos en data + índices |
| 37 | Stripe API Pro webhook | `/api/webhooks/stripe` | ✅ provisionApiProKey + email |
| 38 | Admin API Leads | `/admin/api-leads` | ✅ CRUD + status badges |
| 39 | GoAccess tráfico | `status.viajeinteligencia.com/trafico.html` | ✅ Cada 15min |
| 40 | Uptime Kuma | `status.viajeinteligencia.com/dashboard` | ✅ 6 monitores |
| 41 | Early Bird digest | `/api/cron/early-bird` | ✅ Daily 07:00 UTC, Telegram + Email admin |

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

9. **Version ingles** — i18n Next.js, traducir UI + contenido ✅ Completado (homepage `/en` con i18n, ~80 keys)
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
| **Sprint 5+** | Comunidad → Calendarios → Aseguradoras → Escala |

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
- **NUNCA crear nuevos endpoints cron para tareas del pipeline principal** — añadir tareas a `master/route.ts`
- **Excepción**: Endpoints cron separados OK para herramientas admin independientes (ej. `early-bird` a las 07:00, 1h después del master)
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

### 🔴 Sprint Captación — Usuarios, Colaboradores & Partners (prioridad: MUY ALTA)
**Problema:** La plataforma tiene producto funcional (137 países, OSINT, ML, alertas, API B2B) pero apenas tráfico orgánico ni usuarios registrados. Sin usuarios no hay feedback, ni métricas, ni tracción.

**Objetivo:** Generar los primeros 100 usuarios registrados + 5 colaboradores activos + 2 partners estratégicos en 30 días.

#### Marketing directo (coste 0€)
- [x] **Lead magnet checklist**: Ofrecer "Checklist de viaje seguro" PDF descargable a cambio de email en `/checklist`. Construir lista desde 0.
- [x] **Free trial sin registro**: Dejar que usuarios usen el Chat IA 3 preguntas sin loguearse (hoy pide login). Reduce fricción. Medir conversión a registro.
- [x] **Landing "Colabora"**: Página `/colaborar` con call to action claro: byline, enlace portfolio, acceso anticipado a features beta.
- [x] **Programa de afiliados manual**: 10% comisión en suscripciones premium para bloggers de viajes que refieran tráfico. Página `/afiliados` con dashboard básico.

#### Outreach orgánico
- [x] **Publicar drafts Reddit (4) + Facebook (2)**: Ya existen en `content/outreach/`. Publicar esta semana.
- [ ] **X/Twitter**: Hilo semanal con 1 predicción ML + 1 alerta activa. Usar hashtags #TurismoSeguro #IATravel.
- [x] **Telegram canal**: Contenido diario (alerta del día, país destacado). Promocionar en foros de viajeros.
- [ ] **LosViajeros / Foro de Viajeros**: Post con firma, responder dudas sobre seguridad en destinos.
- [ ] **Email outreach**: 10 bloggers de viajes (ES) + 5 agencias (LATAM) con propuesta de valor y demo gratuita.

#### Partners estratégicos
- [ ] **Aseguradoras de viaje**: Proponer widget IRV embed para web de seguros (ej: InterMundial, IATI). Ellos ganan diferenciación, nosotros ganamos backlinks + tráfico.
- [ ] **Agencias de viajes**: API B2B free tier para que agencias pequeñas monitoricen destinos de sus clientes. Onboarding 1:1.
- [ ] **Universidades**: Programa de investigación OSINT/turismo para estudiantes de relaciones internacionales o turismo. Data gratuita a cambio de papers/mención.

#### Conversión y retención
- [x] **Email onboarding**: Serie 3 emails automáticos al registrarse (día 1: radar de viaje, día 3: alertas, día 7: predicciones ML).
- [x] **Notificación push**: País favorito cambia de nivel de riesgo → email + notificación web.
- [ ] **Compartir con amigos**: Botón "Invita a un amigo" en dashboard que da 1 mes premium gratis por cada registro referido.

### 🟢 Sprint Colaboradores (prioridad: media)
**Email creado:** `colabs@viajeinteligencia.com`

Idea: reclutar colaboradores (redactores de contenido, traductores, community managers) para escalar el proyecto sin coste. Posibles acciones:
- Landing page "Colabora con nosotros" con beneficios (byline, enlace a portfolio, acceso anticipado a features)
- Programa de afiliados para bloggers de viajes
- Contribuciones OSINT (crowdsourcing de alerts locales)
- Traducciones comunitarias (inglés, portugués, francés)

**Pendiente de diseñar en el sprint correspondiente.**

### 🟢 Sprint API B2B Stripe — ⚠️ Parcial (27 May 2026)
- [x] Checkout Stripe en tiers Pro (4.99€/mes, 19.99€/año) — webhook `provisionApiProKey()` provisiona API key + email ✅
- [x] Rate limiting server-side por tier (monthly caps: free=3K, starter=10K, pro=50K) ✅
- [ ] Starter tier no visible en UI `/precio-api` — existe en SQL/webhook pero no como compra
- [ ] Rate limiting per-second — hoy solo monthly aggregate, falta sliding window o token bucket
- [ ] Enterprise flow: webhook no maneja tier enterprise

### 🟢 Sprint África — ✅ COMPLETADO (27 May 2026)
**Motivación:** La página `/geopolitica-y-viajes` tiene un monitor de conflictos con 8 países para enlazar a fichas. Conflictos ya existen en paises-data.json.

**Completado:**
- ✅ África (17): GA, GQ, MG, ML, NE, TD, ZM, ZW, BJ, BF, BI, MW, NA, SL, LR, DJ, ER — todos en `paises-data.json` + GPI/GTI/HDI/IPC
- ✅ LATAM/Asia (3): UY, PY, NP
- ✅ RU, UA, IR, IL, LB, SY, YE,VE — ya existen y links `<Link>` activos en conflict monitor

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

## PENDIENTES REALES (verificado 27 May 2026 — auditoría)

### 🔴 Indexación Google
- [ ] Esperar 3-7 días tras deploy de fixes 500 (middleware) para ver primeras URLs en Google
- [ ] Verificar `site:www.viajeinteligencia.com` diariamente
- [ ] Googlebot activo (17 hits/24h) pero 0 URLs indexadas por historial 5xx
- [ ] Solicitar recrawleo en Google Search Console
- [ ] Enviar sitemap.xml a Google Search Console manualmente

### 🔴 Stripe / Monetización API — ⚠️ Parcial
- [x] Stripe webhook para API Pro: provisiona API key tras pago 4.99€ ✅
- [x] Starter tier (€2.99, 3K req) en UI `/precio-api` + Stripe price creado + webhook ✅
- [x] Rate limiting per-second: sliding window 2/5/20/100 req/s por tier ✅
- [ ] Stripe Enterprise flow — webhook no maneja tier enterprise

### 🟡 Admin / Infra
- [x] Admin API Leads page — `/admin/api-leads` con fetch + status badges + update ✅
- [ ] Migrar `paisesData` hardcodeado a Supabase para edición desde admin
- [ ] Monitorear que no entren incidentes mal clasificados (Groq ahora pide country_code)

### 🟡 Content / SEO
- [x] Version EN de pillar pages ES — `/en/osint-para-viajeros` + `/en/geopolitica-y-viajes` ✅
- [ ] Newsletter con sentimiento semanal — integrar `tone_score` en el HTML del digest

### 🟡 Marketing
- [ ] Publicar Reddit (4 drafts) + Facebook (2 drafts) desde `content/outreach/` — drafts listos, requiere login manual
- [ ] Email outreach a bloggers/agencias (5-10 emails)

### 🟡 ML / Data — ⚠️ Parcial
- [x] Código validación temporal CV existe (`ml-validate.ts`) pero usa split 80/20 sintético, no walk-forward real
- [x] Backtesting contra cambios MAEC reales — `outcomesAvailable7d/14d/30d` ahora compara predicciones vs historial real ✅
- [ ] Aumentar cobertura OSINT: backfill de `tone_score` vía Groq en señales existentes sin sentiment

### 🟢 África — 17 países ✅ COMPLETADO
- [x] GA, GQ, MG, ML, NE, TD, ZM, ZW, BJ, BF, BI, MW, NA, SL, LR, DJ, ER — todos en `paises-data.json` + GPI/GTI/HDI/IPC

---

## VALORACIÓN DE MADUREZ DEL PROYECTO (24 May 2026)

Evaluación honesta del estado actual del proyecto en cada dimensión:

### 🟡 Producto — Beta temprana
- Core funcional (mapa riesgo 136 países, fichas país, radar viajero, comparador, chat IA, blog)
- Lead magnet semanal operativo con resumen AI + email automático
- Stripe Live integrado (checkout, webhooks, provision API keys) pero 0 clientes conocidos
- UX mejorando (hero server-rendered, LCP ~2.5s, topbar optimizada)
- **Problema**: sin usuarios reales dando feedback, no hay validación de producto-mercado

### 🟠 ML — Prototipo / Académico
- 4 Random Forest models, 136 países, 25 features, entrenamiento diario (~157s)
- R² riskScore MAE 0.56, probUp7d 0.0018, max deviation 5.89 (2 países desviados)
- **⚠️ Estas métricas son sobre training data, no test set**. Código de validación temporal CV existe (`ml-validate.ts`) pero usa split 80/20 sintético, no walk-forward real
- **⚠️ Sin backtesting**: `outcomesAvailable7d` hardcodeado a 0 — las predicciones nunca se comparan contra cambios MAEC reales
- Transparencia operativa en blog post publicado (métricas reales, no infladas)

### 🟡 SEO / Indexación — En mejora (post-fixes)
- Dominio ~34 días, servidor estable desde 24 May (sin 5xx)
- GSC: 304 not indexed (de los cuales 198 discovered-waiting, normal), 0 5xx
- Fixes aplicados: canonical /viajes/clima, redirect único HTTP→WWW, X-Robots-Tag en assets
- IndexNow configurado (488 URLs enviadas), sitemap dinámico
- Contenido server-rendered para Googlebot implementado
- **Riesgo**: sandboxing de Google para dominios jóvenes. Indexación llegará con contenido nuevo semanal + tiempo

### 🟡 Contenido — Bueno para la edad del proyecto
- 3+ blog posts/semana (alertas, guías OSINT, ML transparency)
- 3 pillar pages SEO (travel-risk-intelligence, osint-para-viajeros, geopolitica-y-viajes)
- Lead magnet semanal con Groq AI
- Newsletter con doble opt-in y reporte automático
- **Falta**: versión EN del contenido (solo homepage traducida), más posts satélite por pillar

### 🟠 Presencia Social — Construyendo desde cero
- Telegram canal activo (contenido diario automático)
- Bluesky + Mastodon publicando (posts semanales automáticos vía admin)
- X/Twitter manual (OAuth no disponible para plan gratis)
- Reddit drafts listos pero sin publicar
- Facebook bloqueado
- **Realidad**: seguidores cercanos a 0 en todas las plataformas. Outreach orgánico tomará meses

### 🟢 Estabilidad Técnica — Sólida
- CI verde en cada push, deploy automático Hetzner VPS
- Sin 5xx en producción (middleware corregido)
- Cache AeroDataBox en memoria reduce llamadas API ~85→<10%
- Caché correcta de navegador en reporte-riesgo (fix applied)
- Healthcheck endpoint monitorea 4 tablas
- Load VPS ~0.10, RAM 754M/3.7G, uptime 7d+

### 🟠 Monetización — MVP sin tracción
- Stripe Live: checkout, webhooks, provision API keys Pro funcional
- API pública v1 con 4 endpoints (risk, tci, incidents, countries) y rate limiting por tier
- 0 transacciones conocidas. Sin métricas de conversión porque no hay tráfico

### 🟡 Datos / Pipeline OSINT — Construyendo base sólida
- 73 fuentes OSINT (GDELT, USGS, GDACS, ReliefWeb, WHO, RSS, Reddit)
- Pipeline diario: señales → clasificación Groq → detección incidentes → alertas
- ~11 días de datos diarios acumulados, creciendo
- Backfill de tone_score pendiente para señales históricas sin sentimiento
- **Para ML útil**: necesitamos 30+ días de datos para validación temporal CV

### Resumen
| Dimensión | Estado | Confianza |
|-----------|--------|-----------|
| Producto | 🟡 Beta temprana | Media |
| ML | 🟠 Prototipo | Baja (sin validación real) |
| SEO/Indexación | 🔴 Crítica | Baja (dominio joven) |
| Contenido | 🟡 Bueno | Alta |
| Social | 🟠 Construyendo | Baja |
| Técnica | 🟢 Sólida | Alta |
| Monetización | 🟠 MVP sin tracción | Baja |
| Datos/OSINT | 🟡 Construyendo | Media-Alta |

**Veredicto:** Proyecto con base técnica sólida y contenido decente, pero atrapado en el hueco del dominio joven + 0 tracción. El ML promete pero no está validado. La prioridad real debería ser conseguir tráfico orgánico (blog + outreach) para empezar a tener usuarios que validen el producto. Sin indexación de Google ni tracción social, el resto es irrelevante.

---

## 26 May 2026 — 🔴 INCIDENTE CRÍTICO: Build roto en servidor

> **⚠️ ESTAMOS ROMPIENDO EL TRABAJO DE UN MES**

### Causa
El build de Next.js 16.2.6 en el VPS (Node v22.22.2, 3.7GB RAM) falla con SIGBUS:
- `npm run build` → SIGBUS en fase "Collecting page data"
- `--experimental-build-mode=compile` → build OK, pero `next start` crashea con SIGBUS al servir
- Build local (Node v24.15.0) funciona, pero rsync del `.next` al servidor también produce SIGBUS al arrancar
- El servidor NO puede buildear ni servir el `.next` actual

### Impacto
- Deploy automático (GH Actions) roto — commit `f5d80c2` no desplegado
- Servidor sirviendo commit antiguo `b36eb7f` (sin manifiesto, sin Reporte→Informe)
- Toque manual para arreglar temporalmente (build en local + rsync + arranque) no funcionó
- 92 reinicios del proceso viajeinteligencia en PM2 por el crash continuo

### Resolución
- ✅ Swap aumentado de 4GB a **8GB** (`sudo swapoff /swapfile && sudo fallocate -l 8G /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`)
- ✅ Servicios no críticos parados temporalmente para liberar RAM durante el build
- ✅ Build exitoso con `--experimental-build-mode=compile`
- ✅ Todos los servicios restaurados: viajeinteligencia (40min uptime, 0 reinicios), georisk, georisk-api, georisk-next, gc-motors
- ✅ Manifiesto nuevo sirviendo desde `viajeinteligencia.com/manifiesto` (200 OK)
- ✅ Recursos finales: RAM 2.5GB disponible, Swap 8GB sin uso, CPU 87% idle, Disco 52%

*Actualizado: 26 May 2026 (tarde) — crisis resuelta, swap 8GB estable*

---

## 27 May 2026 — Sprint Cambios acumulados (Starter tier + EN Pillars + ML backtesting + Rate limiting)

> **Último deploy verificado:** ✅ (commit `4de6b1f`, PM2 PID 355323, port 3000)
>
> **Sprint activo:** Refuerzo monetización + contenido EN + ML + infra

### Logros del día

#### 1. Starter API tier (€2.99/mes)
- ✅ Stripe price creado: `price_1TbcHG1yXjIoL1LjI2Lnae1p`
- ✅ Añadido a UI `/precio-api` entre Free y Pro con 3,000 req/mes, 3 API keys
- ✅ Webhook ya soportaba `api_starter` → solo faltaba UI
- ✅ Env var `STRIPE_API_STARTER_PRICE_ID` añadida a `.env.local`, `.env.production`, `.env.example`

#### 2. EN Pillar Pages
- ✅ `/en/osint-para-viajeros` — traducción completa del contenido OSINT para viajeros
- ✅ `/en/geopolitica-y-viajes` — traducción completa de geopolítica + viajes
- ✅ FAQ schema en ambos, metadata, OG tags, interlinking a páginas EN existentes

#### 3. ML Backtesting
- ✅ `ml-validate.ts` ahora consulta `risk_predictions` de últimos 30 días
- ✅ Compara `probability_up_7d/14d/30d` contra cambios reales en `maec_risk_history`
- ✅ `outcomesAvailable7d/14d/30d` ya no hardcodeados a 0
- ✅ Logging de precisión: "Outcomes 7d: X/Y correct (Z%)"

#### 4. Outreach drafts
- ✅ 6 drafts verificados listos en `content/outreach/` (4 Reddit + 2 Facebook)
- ⏳ Pendiente publicación manual (requiere login a cuentas)

#### 5. Per-second rate limiting
- ✅ Sliding window en memoria por `api_key_id`
- ✅ Límites: free=2, starter=5, pro=20, enterprise=100 req/s
- ✅ `Retry-After` header en respuesta 429
- ✅ Refactor: `rateLimitResponse()` helper + aplicado a 5 endpoints v1

### Incidencias
- **Build Turbopack**: App router `/precio-api` daba 500 tras deploy vía GitHub Actions ("client reference manifest does not exist"). Solución: rebuild local en servidor (`rm -rf .next && npm run build`). **Causa raíz: no es Turbopack**, es que el workflow de deploy hacía `npm install --omit=dev` antes de `npm run build`, omitiendo TypeScript y tipos (devDependencies). Build fallaba silenciosamente → .next incompleto → 500 en app routes. Fijo cambiando a `npm install` + `npm prune --omit=dev` post-build.

### Commits del día
| Commit | Descripción |
|--------|-------------|
| `0f258a9` | Starter tier (€2.99, 3K req) + Stripe price |
| `64f29a8` | EN pillar pages (OSINT + Geopolitics) |
| `b742ff7` | ML backtesting contra cambios MAEC reales |
| `bbe1f7f` | Per-second sliding window rate limit |
| `4de6b1f` | WAYAHEAD updates |
| `d5ba52c` | WAYAHEAD 27 May sprint log |
| `f405efd` | Newsletter sentiment + sitemap priorities + Google ping + admin paises JSON editor/sync |
| `051aaf9` | Ecosistema: rutas clicleables (LayerCard + freemium table) |
| `e5182ea` | **fix: deploy workflow** — `npm install` (con devDeps) antes del build, `npm prune --omit=dev` después |

### No-code changes
- **Newsletter sentimiento**: Test enviado a info@viajeinteligencia.com (edición #39). Sección "📊 Sentimiento OSINT" ya incluida en HTML digest con avg_tone, barra colorizada, signal_count, risk_level.
- **Sitemap priorities**: Añadidas prioridades 0.85-0.9 para /en/*, /travel-risk-intelligence, /osint-para-viajeros, /geopolitica-y-viajes, /ecosistema, /mapa, /reporte-riesgo, /infografias, /precio-api, /newsletter
- **Google ping**: `GET /api/seo/ping-google` notifica Google + Bing IndexNow
- **Admin paises**: Editor JSON completo por país (botón `</>`) + "Sync desde JSON" (recarga desde paises-data.json)
- **Ecosistema precios**: Nueva sección "💰 Precios" con los 4 tiers (Gratuito/Starter/Pro/Enterprise) + nota Premium usuario
- **Deploy workflow fix**: El build ahora incluye devDependencies; se eliminan post-build con `npm prune --omit=dev`. Los 2 workflows (CI + Deploy) pasan en verde.

> **Último deploy verificado:** ✅ (commit `c223f21`, PM2 PID 287813, port 3000)

### Logros del día

#### Opción 6 — Disclaimer visual de sesgo
- ✅ **Componente `BiasDisclaimer.tsx`** creado: badge interactivo ⚠️ "Sesgo" que abre modal explicativo sobre posibles sesgos diplomáticos del MAEC
- ✅ **Badge en mapa**: añadido a `MapaInteractivo.tsx` (junto al selector de capas) y `/mapa` (top bar)
- ✅ **Badge en ficha país**: junto al nivel de riesgo en hero + versión inline en pestaña legal/MAEC
- ✅ Enlace a `/transparencia#sesgos` desde el modal y badge

#### Opción 4 — Zoom táctil preciso + gesture handling
- ✅ **`leaflet-gesture-handling`** instalado: evita scroll accidental al hacer scroll sobre el mapa en móvil
- ✅ **Zoom controls más grandes**: 40×40px en todos los dispositivos
- ✅ **Margen inferior extra** en móvil (60px) para no solaparse con UI
- ✅ CSS importado en `globals.css`

#### Opción 2 — Contexto geopolítico
- ✅ **27 países** con nota de contexto geopolítico en `paises-data.json`:
  - Norte de África: MA, DZ, EG, TN, LY
  - Oriente Medio: IL, IR, SY, LB, SA, AE, QA
  - América: VE, CU, US, MX, CO
  - Europa/Asia: RU, CN, TR, UA, BD, MM
  - África subsahariana: ZA, ML, NE, BF
- ✅ Cada nota explica posibles sesgos diplomáticos en las alertas MAEC
- ✅ Visible en ficha país como texto informativo junto al badge de riesgo

### Commits del día
| Commit | Descripción |
|--------|-------------|
| `c223f21` | Bias disclaimer + mobile zoom + geopolitical context (27 countries) |
| `6f81813` | Fix: badge sesgo más visible (bold, borde grueso, sombra, ambar claro) |

### Técnico
- Deploy: rsync directo al VPS + build con swap 8GB + PM2 restart
- Build verificado: 676 rutas, OK
- Todos los endpoints 200
## 27 May 2026 — Sprint EN Phase 1 & 2 (i18n + Rutas EN + Middleware + hreflang)

> **Último deploy verificado:** ✅ (commit pendiente, PM2 PID 316494, port 3000)

### Logros del día

#### Phase 1 — Ruta EN multi-país + i18n UI
- ✅ **`src/data/nombres-en.ts`**: 137 nombres de país en inglés (auto-generado de `paises-data.json`)
- ✅ **`/en/pais/[codigo]/page.tsx`**: Ruta EN completa con SEO, Schema.org TouristDestination, Twitter cards y Open Graph en inglés
- ✅ **`DetallePaisClient.tsx`**: tabs, labels de secciones (Info/Economía/Localización), campos (Idioma/Población/PIB/Moneda/etc.), riesgos, presupuesto, perfiles → todo traducido vía `useI18n().t()`
- ✅ **`src/lib/i18n/index.tsx`**: 54 nuevas claves de traducción (`pais.tab.*`, `pais.budget.*`, `pais.info.*`, `pais.maec.*`, `pais.emergency.*`, `pais.reviews.*`, `pais.ist.*`, `pais.riskDesc.*`)

#### Phase 2 — Middleware + SEO i18n
- ✅ **`src/middleware.ts`**: Detecta `Accept-Language: en` en primera visita sin cookie → redirige a `/en`. Fija cookie `locale=en` al navegar por `/en`. Cookie tiene prioridad sobre Accept-Language.
- ✅ **hreflang alternates**: `alternates.languages` con `es`/`en` añadido a root layout, `/pais/[codigo]`, y `/en/pais/[codigo]`
- ✅ **Matcher expandido**: de 4 rutas específicas a patrón universal excluyendo assets estáticos

### Build
- Compilación limpia (sin errores TS), 676+ rutas, middleware compilado como Proxy
- Todas las rutas 200 OK: `/`, `/en`, `/pais/es`, `/en/pais/es`

### Commits del día
| Commit | Descripción |
|--------|-------------|
| (pendiente) | EN Phase 1: ruta /en/pais/[codigo] + i18n pais keys + English country names |
| (pendiente) | EN Phase 2: middleware i18n + hreflang alternates |

### Técnico
- Build: 72s + 69s (dos builds), sin errores
- Deploy: PM2 restart, PID 316494, 0 reinicios
- Todos los endpoints 200
