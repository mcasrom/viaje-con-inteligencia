# Viaje con Inteligencia - Estado del Proyecto

## ✅ Completado

### URLs
- **Web:** https://viaje-con-inteligencia.vercel.app
- **Bot Telegram:** https://t.me/ViajeConInteligenciaBot
- **Admin-bot stats:** https://viaje-con-inteligencia.vercel.app/admin/bot-stats
- **Repo:** https://github.com/mcasrom/viaje-con-inteligencia

### Core Features
- Mapa de riesgos 95 países (target 100)
- KPIs Index con 6 capas interactivas (GPI, GTI, HDI, IPC, Sismos, MAEC)
- Detalle por país (embajadas, requisitos, qué hacer/no hacer)
- Checklist imprimible (8 categorías, 80+ items)
- Bot Telegram con comandos
- Panel admin alertas
- Clima (Open-Meteo API - 7 días)
- Dashboard con favoritos (Supabase)
- Footer con bio del autor (ES/EN/PT)

### Supabase
- Schema SQL ejecutado
- Auth configurado
- Redirect URLs configuradas

### SEO
- Favicon SVG personalizado
- Open Graph image (1200x630)
- Metadata completa
- Timestamps de actualización
- Google Search Console
- Vercel Analytics
- Speed Insights
- Sitemap multilingual
- Structured data JSON-LD
- Páginas /en /pt

### KPIs Index (Premium)
- 6 capas interactivas (GPI, GTI, HDI, IPC, Sismos, MAEC)
- Mapa Leaflet con colores dinámicos
- Filtros por región
- Tabla de datos filtrable
- Tiempo real para sismos (USGS API)

### Cron Jobs
- vercel.json configurado (3 jobs)
- CRON_SECRET en Vercel Dashboard
- Endpoint `/api/cron/status` para verificar
- Schedule: daily 6:00 UTC (scrape), 8:00 UTC (alerts), weekly lunes 8:00

### Chat IA (Premium)
- Groq integration (modelo llama-3.1-8b-instant)
- Prompt MAEC mejorado
- Generador itinerarios IA
- Perfil usuario (Supabase)
- Favoritos sincronizados

### Blog (25+ posts)
- Sistema de posts con estructura SEO
- Paginación (10/pág)
- Filtro por categoría
- Ordenar por fecha
- StarRating posts (1-5 estrellas)
- API posts/rate
- Contador vistas (Supabase)
- Badge "Popular"
- Pestaña Populares

### Reseñas Fotográficas
- Componente Gallery
- Grid visual posts
- Lightbox

### Mapa Interactivo
- Leaflet.js con marcadores por riesgo
- Popup con info país
- Mejora UI filtros

### Newsletter
- Telegram: posts blog + países riesgo
- Channel: @ViajeConInteligencia
- Frecuencia: cada lunes 8:00 UTC
- API + UI + Schema Supabase

### Integración MAEC
- Avisos última hora (Badge + scraper)
- Texto completo seguridad (Accordion)
- Fichas País PDF (botón descarga)
- Tel. emergencia 24h consular
- Legislación local
- Normas divisas
- Sistema auditoría scrapers (Dashboard)

---

## 🚀 Métricas Q2 2026

| Métrica | Actual | Target |
|---------|--------|--------|
| Visitantes/mes | ~500 | 10,000 |
| Países | 78 | 100 |
| Posts blog | 25+ | 50 |
| Usuarios Telegram | ~50 | 1,000 |
| Suscripciones | 0 | 100 |

---

## ⚠️ Pendientes

| # | Item | Prioridad |
|---|------|----------|
| 1 | Stripe + auth (config manual Vercel) | Alta |
| 2 | Añadir países Nordic (Noruega, Suecia, Dinamarca, Finlandia) | Media |
| 3 | Añadir países Eastern Europe (Estonia, Letonia, Lituania, Croacia, Eslovenia) | Media |
| 4 | Más países target 100 | Media |
| 5 | Programa afiliados | Media |
| 6 | Sitemap.xml dinámico | Baja |
| 7 | Corregir textos EN en páginas ES (refactor i18n) | Baja |
| 8 | Email profesional dominio propio | Baja |

---

## 📧 Contacto
- **M.Castillo:** mybloggingnotes@gmail.com
- **Telegram Bot:** @ViajeConInteligenciaBot

---

## 💾 Sistema de Backup

### GitHub Actions (Automático)
- **Frecuencia:** Cada domingo a las 8:00 UTC
- **Ubicación:** GitHub Releases (tag: backup-YYYY-MM-DD)
- **Rotación:** Mantiene últimos 8 backups
- **Contenido:** Código fuente comprimido + manifest

### Script Local (Manual)
```bash
./scripts/backup.sh
```

### Restauración
```bash
tar -xzf backup_YYYY-MM-DD_HHMMSS.tar.gz -C ~/viaje-con-inteligencia
cd ~/viaje-con-inteligencia && npm install
```

---

## 🔄 Cron Jobs (Vercel)

| Cron | Schedule (UTC) | Path | Función |
|------|----------------|------|---------|
| scrape-maec | 0 6 * * * (diario 6:00) | /api/cron/scrape-maec | Scraping completo MAEC 89 países → tabla scraper_logs |
| check-alerts | 0 8 * * * (diario 8:00) | /api/cron/check-alerts | Verificar alertas riesgo → tabla risk_alerts |
| weekly-digest | 0 8 * * 1 (lunes 8:00) | /api/cron/weekly-digest | Newsletter semanal (Telegram + Email) |

**Requisito:** Variable =CRON_SECRET= configurada en Vercel

**Verificación:**
- Vercel Dashboard → Functions Logs → =/api/cron/*=
- Supabase → tabla =scraper_logs=