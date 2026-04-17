# Viaje con Inteligencia - Estado del Proyecto

## ✅ Completado (Sprint 1)

### URLs
- **Web:** https://viaje-con-inteligencia.vercel.app
- **Bot Telegram:** https://t.me/ViajeConInteligenciaBot
- **Admin-bot stats:** https://viaje-con-inteligencia.vercel.app/admin/bot-stats
- **Repo:** https://github.com/mcasrom/viaje-con-inteligencia

### Core Features
- Mapa de riesgos 28 países
- Detalle por país (embajadas, requisitos, qué hacer/no hacer)
- Checklist imprimible (8 categorías, 80+ items)
- Bot Telegram con comandos
- Panel admin alertas
- Clima (Open-Meteo API - 7 días)
- Dashboard con favoritos (requiere Supabase)
- Footer con bio del autor (ES/EN/PT)

### SEO
- Favicon SVG personalizado
- Open Graph image (1200x630)
- Metadata completa
- Timestamps de actualización

### Blog
- Sistema de posts con estructura SEO
- Primer post: "Aduanas en el aeropuerto" (1000+ palabras)

### Páginas
- Home (/), País (/pais/[codigo])
- Premium (/premium) - 4.99€/mes, 19.99€/año
- Checklist (/checklist)
- Blog (/blog), Post (/blog/[slug])
- Dashboard (/dashboard)
- Legal (/legal), Metodología (/metodologia)

---

## 📋 Sprint 2 - Way Ahead

### 🔴 Prioridad Alta

#### 1. Supabase (Backend)
- [ ] Configurar proyecto Supabase
- [ ] Ejecutar schema SQL
- [ ] Activar variables en Vercel
- [ ] Probar login/registro
- [ ] Verificar favoritos

#### 2. Optimización Bot Telegram
- [ ] Revisar flujo de comandos
- [ ] Añadir inline keyboards
- [ ] Integrar weather API en bot
- [ ] Mensajes dinámicos con datos reales
- [ ] Botón de "Ver más"链接 a web

#### 3. Blog - Más contenido
- [ ] Post: Guía completa de visados
- [ ] Post: Seguro de viaje
- [ ] Post: Equipaje de mano
- [ ] Post: Derechos del viajero UE

### 🟡 Prioridad Media

#### 4. Expansión de países
- [ ] Añadir 10-15 países más (Latam, Asia)
- [ ] Actualizar coordenadas para clima

#### 5. Premium Features
- [ ] Página de gestión de suscripción
- [ ] Historial de alertas guardadas
- [ ] Configuración de notificaciones

#### 6. SEO Técnico
- [ ] Sitemap.xml dinámico
- [ ] Robots.txt
- [ ] Schema.org para posts
- [ ] Canonical URLs

### 🟢 Prioridad Baja

- [ ] App móvil (React Native)
- [ ] PWA (Progressive Web App)
- [ ] Newsletter integración
- [ ] Analytics avanzado

---

## 📝 Configuración Supabase (Pendiente)

```bash
# 1. Crear proyecto en https://supabase.com

# 2. Ejecutar en SQL Editor:
#    Copiar contenido de supabase-schema.sql

# 3. Variables en Vercel:
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# 4. Auth config en Supabase:
#    Authentication → Email → Activar
#    Site URL: https://viaje-con-inteligencia.vercel.app
#    Redirect: https://viaje-con-inteligencia.vercel.app/dashboard
```

---

## 🚀 Deploy

```bash
git clone https://github.com/mcasrom/viaje-con-inteligencia.git
cd viaje-con-inteligencia
npm install
npm run dev
```

---

## 📧 Contacto
- **M.Castillo:** mybloggingnotes@gmail.com
- **Telegram Bot:** @AlertasViajeroBot

---

## 💾 Sistema de Backup

### GitHub Actions (Automático)
- **Frecuencia:** Cada domingo a las 8:00 UTC
- **Ubicación:** GitHub Releases (tag: backup-YYYY-MM-DD)
- **Rotación:** Mantiene últimos 8 backups
- **Contenido:** Código fuente comprimido + manifest

### Script Local (Manual)
```bash
# Ejecutar backup manual
./scripts/backup.sh

# Configuración:
# - Directorio: ~/viaje-con-inteligencia-backups
# - Máximo backups: 8
# - Excluye: node_modules, .git, .env, .next
```

### Restauración
```bash
# Extraer backup
tar -xzf backup_YYYY-MM-DD_HHMMSS.tar.gz -C ~/viaje-con-inteligencia
cd ~/viaje-con-inteligencia && npm install
```

---

## 📊 Stats (Actualizar manualmente)

- Países: 28
- Posts blog: 7
- Usuarios bot: 1 (ver /admin/bot-stats)
- Backups disponibles: GitHub Releases
