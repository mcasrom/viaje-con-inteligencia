# Pendiente - Viaje con Inteligencia

## Estrategia Crecimiento (FASE SIGUIENTE)

### SEO / Contenido
- [x] Blog: posts "viajar-barato-ia", "itinerarios-ia", "seguros-comparativa"
- [x] Post "libros para viajeros" (1500 palabras, tablas valoración, tags por interés)
- [ ] Más posts SEO (keywords long-tail)
- [ ] Cluster semántico (guías > comparativas > herramientas)

### Producto
- [ ] Chat IA conversacional (input tipo diálogo)
- [ ] Generador itinerarios dinámico
- [ ] Perfil usuario (preferencias guardadas)

### UX
- [ ] Onboarding guiado
- [ ] Guardado de viajes favoritos

### Monetización
- [ ] Freemium (funciones limitadas)
- [ ] Afiliación Booking/vuelos
- [ ] Plan premium (9.99€/mes)

### Comunidad
- [ ] Canal Telegram con alertas
- [ ] TikTok/YouTube (contenido)

## Supabase / Auth
- [x] Configurar Supabase (URL + anon key)
- [ ] EJECUTAR SCHEMA: scripts/temporal_complete_schema.sql
  - Ir a Supabase Dashboard > SQL Editor
  - Ejecutar script completo
- [ ] Verificar tablas creadas
- [ ] Login emailmgico (probar rate limit)

## Países (58 total)
- [x] Añadidos 17 nuevos países

## Posts blog (15 total)
- [x] Todos creados (+1000 palabras, tags SEO)
- [ ] VERIFICAR en producción (no aparecen en /blog?)

## Bot Telegram (parcialmente funcionando)
- [x] Mejorado búsqueda por nombre (con flags emoji)
- [x] Improved premium info
- [x] Alertas riesgo (detalladas por nivel MAEC)
- [x] Tipo cambio (6+ monedas)
- [x] Checklist detallado (categorías)
- [ ] Clima: mejora (añadir humedad, previsión 3 días, ropa recomendada)
- [ ] País buscar (solucionar bugs, búsqueda fuzzy)
- [ ] Añadir másinfo riesgo (enlaces MAEC)

## Premium/Stripe
- [x] Stripe integrado (falta credenciales en Vercel)

## SEO/Técnico
- [x] robots.txt, sitemap.xml
- [x] Schema.org JSON-LD
- [x] Favicon y preview image

## PWA (Progressive Web App)
- [x] manifest.json configurado
- [x] Service Worker básico
- [x] Página offline
- [x] instalable en móvil

## WEB UX/UI
- [x] Homepage hero mejorado (beneficios, modernas)
- [x] Página /pwa (instrucciones instalar)
- [x] Enlace PWA en footer