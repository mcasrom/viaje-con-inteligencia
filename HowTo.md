# Viaje con Inteligencia - How To (Gestor)

*Documentación interna para gestión del proyecto*
*Versión 1.0 - Abril 2026*

## 🌐 URLs del Proyecto

| Servicio | URL | Notas |
|----------|-----|-------|
| Web | https://viaje-con-inteligencia.vercel.app | Producción |
| Repo | https://github.com/mcasrom/viaje-con-inteligencia | Código fuente |
| Bot Telegram | https://t.me/ViajeConInteligenciaBot | @AlertasViajero |
| Canal Telegram | @AlertasViajero | Alertas automática |

---

## 🚀 Despliegue

### Desarrollo local
```bash
cd viaje-con-inteligencia
npm run dev
# Acceder a http://localhost:3000
```

### Verificar código antes de push
```bash
npm run check    # lint + build
npm run build    # solo build
npm run lint     # solo lint
```

### Desplegar a producción
```bash
git add .
git commit -m "descripción de cambios"
git push origin main
# Vercel despliega automáticamente
```

---

## 📝 Gestión de Posts

### Crear nuevo post
```bash
# Opción 1: Usar script generador
node scripts/generate-post.js "Título del post" categoria

# Categorías: tecnologia, seguridad, preparacion, destinos, consejos, seguros
```

### Formato del post (Markdown)
```yaml
---
title: "Título SEO"
description: "Descripción meta (150-160 caracteres)"
date: "2026-04-18"
slug: slug-url-limpia
image: https://images.unsplash.com/... ?w=800
author: Miguel Castillo
readingTime: X minutos
tags: [tag1, tag2, tag3]
categories: [Categoría]
keywords: "keyword1, keyword2, keyword3"
---

Contenido en Markdown...
```

### Checklist nuevo post
- [ ] Título SEO-friendly (60 chars max)
- [ ] Description meta (150-160 chars)
- [ ] slug URL limpia
- [ ] Imagen Unsplash optimizada (?w=800)
- [ ] 5-10 keywords separadas por comas
- [ ] 1000+ palabras de contenido
- [ ] Tablas si hay datos comparativos
- [ ] Links internos a otros posts
- [ ] Imagen del post en /content/posts/

---

## 🌍 Gestión de Países

### Datos en: `src/data/paises.ts`

### Añadir país
1. Copiar estructura de país existente
2. Completar campos obligatorios:
   - código (2 letras ISO)
   - nombre
   - capital
   - continente
   - nivelRiesgo
   - contactos (embajada)

### Clasificaciones de continente
- Europa
- Norteamérica
- Caribe
- Sudamérica
- Asia
- Oriente Medio
- África
- Oceanía

### Niveles de riesgo
- sin-riesgo
- bajo
- medio
- alto
- muy-alto

---

## 📊 Métricas Objetivo (Q2 2026)

| Métrica | Actual | Target |
|---------|--------|--------|
| Visitantes/mes | ~500 | 10,000 |
| Países en mapa | 58 | 100 |
| Posts blog | 15 | 100 |
| Usuarios Telegram | ~50 | 1,000 |
| Suscripciones | 0 | 100 |

---

## 🤖 Bot Telegram

### Acceso
- **Bot**: @ViajeConInteligenciaBot
- **Canal**: @AlertasViajero
- **Admin**: @mybloggingnotes

### Comandos disponibles
```
/start       - Bienvenida e introducción
/alertas     - Riesgos de viaje por nivel
/buscar [país] - Info país específico
/ayuda       - Lista de comandos
/contact     - Contactar administrador
```

### Gestión del Bot

#### Iniciar bot localmente (desarrollo)
```bash
# Requiere TOKEN en .env.local
node -r ts-node/register src/lib/telegram-bot.ts
# O usar el webhook en producción
```

#### Configurar webhook (producción)
```bash
# El webhook se configura automáticamente al desplegar
# API endpoint: /api/telegram
# URL completa: https://viaje-con-inteligencia.vercel.app/api/telegram
```

#### Enviar mensaje manual
```bash
# Usar el panel admin
# https://viaje-con-inteligencia.vercel.app/admin/alerts
```

### Variables entorno
```
TELEGRAM_BOT_TOKEN=TOKEN_REMOVED
TELEGRAM_CHANNEL_ID=-1003764932977
CRON_SECRET=lS+/mhOpowDvtLUVHsGmGYq35m+cGYMX8Ca5BdAk9vQ=
```

### Funciones del bot

#### getAlertasRiesgo()
- Muestra países por nivel de riesgo
- Incluye fecha de actualización
- Fuente: MAEC

#### getDetallePais(codigo)
- Información completa del país
- Nivel de riesgo actual
- Enlaces útiles

### Mantenimiento del bot
- [ ] VerificarTOKEN activo
- [ ] Probar comandos /start, /alertas, /buscar
- [ ] Revisar mensajes en canal
- [ ] Actualizar comandos en BotFather si hay cambios

### Solución problemas bot

| Problema | Solución |
|----------|----------|
| Bot no responde | Verificar TOKEN en Vercel |
|Webhookerror | Reconfigurar con BotFather |
| Canal no recibe mensajes | Verificar TELEGRAM_CHANNEL_ID |
| Mensajes duplicados | Revisar código webhook |

### BotFather - Comandos útiles
```
/setcommands - Actualizar lista de comandos
/setdescription - Descripción del bot
/setabout - Información sobre el bot
```

---

## 💳 Pagos (Stripe)

### Configuración
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_YEARLY=price_...
```

### Planes
- Premium Mensual: 4.99€/mes
- Premium Anual: 19.99€/año

### Gestionar suscripciones
1. Acceder a Stripe Dashboard: https://dashboard.stripe.com
2. Verificar-webhook: https://viaje-con-inteligencia.vercel.app/api/webhooks/stripe

### Facturación
- [ ] Revisar transacciones en Stripe
- [ ] Configurar facturas automáticas
- [ ] Verificar webhooks

---

## 💎 Premium y Funcionalidades IA

### Página Premium
- **URL**: https://viaje-con-inteligencia.vercel.app/premium
- **Planes**: 4.99€/mes o 19.99€/año

### Features disponibles
- [ ] Chat IA (Groq - funciona sin configurar)
- [ ] Planificador itinerarios IA
- [ ] Análisis de gastos IA ← Nuevo
- [ ] Mapa de seísmos en tiempo real
- [ ] Monitor de conflictos

### API de IA
- **Endpoint**: /api/ai/chat
- **Proveedor**: Groq (groq.com)
- **Modelo**: llama-3.1-70b-versatile
- **Key**: GROQ_API_KEY en .env.local

### Gestión Premium
- [ ] Revisar suscripciones en Stripe
- [ ] Verificar funcionamiento chat IA
- [ ] Actualizar prompts si es necesario

---

## 🆘 Problemas Comunes

### Build falla
```bash
# Ver errores específicos
npm run build

# Limpiar cache
rm -rf .next
npm run build
```

### No carga posts blog
- Verificar formato frontmatter (fechas con comillas)
- Ejecutar `npm run build`

### Bot no responde
- Verificar TOKEN en .env.local
- Comprobar webhook en BotFather

---

## 🔍 SEO y Google Search

### Configuración básica (ya implementada)

- [x] Meta tags (title, description, keywords)
- [x] OpenGraph tags
- [x] Robots.txt
- [x] Sitemap.xml
- [x] Schema.org JSON-LD
- [x] Canonical URLs

### Indexar en Google

1. **Google Search Console**
   - Ir a https://search.google.com/search-console
   - Añadir propiedad: `viaje-con-inteligencia.vercel.app`
   - Verificar con DNS o HTML tag

2. **Sitemap**
   - URL: `https://viaje-con-inteligencia.vercel.app/sitemap.xml`
   - Añadir en Search Console

3. **Verificar robots.txt**
   ```
   User-agent: *
   Allow: /
   Sitemap: https://viaje-con-inteligencia.vercel.app/sitemap.xml
   ```

### Hashtags como señales (banderas visuales)

Usar en meta keywords y contenido:
```html
<meta name="keywords" content="viaje seguro, riesgo país, mejores destinos, seguros viaje, mapa mundial, alertas viaje, mochilaero, backpacker,..." />
```

### SEO Posts Blog

- [ ] Añadir más posts (target: 100)
- [ ] Optimizar imágenes con alt text
- [ ] Internal linking entre posts
- [ ] Backlinks de calidad

---

## 📞 Contactos Útiles

- **Bot Telegram**: @ViajeConInteligenciaBot
- **Email**: mybloggingnotes@gmail.com
- **GitHub Issues**: Para bugs/feature requests

---

*Documento vivo - actualizar según evoluciona el proyecto*