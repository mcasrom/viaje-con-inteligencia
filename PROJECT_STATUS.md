# Viaje con Inteligencia - Estado del Proyecto

## ✅ Completado

### URLs
- **Web:** https://viaje-con-inteligencia.vercel.app
- **Bot Telegram:** https://t.me/AlertasViajeroBot  
- **Canal:** @AlertasViajero
- **Repo:** https://github.com/mcasrom/viaje-con-inteligencia

### Credenciales (en variables de entorno Vercel)
- **Telegram Token:** `TELEGRAM_BOT_TOKEN`
- **Channel ID:** `TELEGRAM_CHANNEL_ID`

### Funcionalidades
- Mapa de riesgos 28 países
- Detalle por país (embajadas, requisitos, qué hacer/no hacer)
- Checklist imprimible (8 categorías, 80+ items)
- Bot Telegram con comandos
- Panel admin alertas
- Páginas: Premium, Legal, Metodología MAEC
- Disclaimer y aviso legal
- Footer con copyright M.Castillo

### Webhook Telegram
Configurado: `https://viaje-con-inteligencia.vercel.app/api/telegram`

---

## 📋 Para Continuar

```bash
# Clonar repo
git clone https://github.com/mcasrom/viaje-con-inteligencia.git
cd viaje-con-inteligencia
npm install

# Desarrollo
npm run dev

# Hacer cambios, guardar
git add . && git commit -m "tu cambio"
git push
# Vercel despliega automáticamente
```

---

## 🚀 Posibles Mejoras

- [ ] Añadir más países (50+)
- [ ] Integrar IA para recomendaciones
- [ ] Sistema de pagos Stripe para Premium
- [ ] RSS feed MAEC para alertas automáticas
- [ ] App móvil
- [ ] Traducciones (EN, PT, FR)

---

## 📝 Tareas Supabase (pendientes de configurar)

### Paso 1: Crear proyecto en supabase.com
1. Ir a https://supabase.com y crear nuevo proyecto
2. Esperar a que termine el setup (2-3 min)

### Paso 2: Ejecutar schema
1. En Supabase Dashboard → SQL Editor
2. Copiar contenido de `supabase-schema.sql`
3. Ejecutar

### Paso 3: Añadir variables en Vercel
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### Paso 4: Configurar Auth en Supabase
1. Authentication → Providers → Email: activar
2. Authentication → URL Configuration:
   - Site URL: https://viaje-con-inteligencia.vercel.app
   - Redirect URLs: https://viaje-con-inteligencia.vercel.app/dashboard

---

## 📊 Funcionalidades implementadas hoy

### Dashboard (/dashboard)
- Login/registro por email (magico)
- Lista favoritos con clima
- Botón favorito en páginas de país

### API Auth
- /api/auth/user - Usuario actual
- /api/auth/login - Enviar enlace mágico
- /api/auth/logout - Cerrar sesión
- /api/auth/favorites - CRUD favoritos

### Clima (Open-Meteo - gratis, sin API key)
- Widget en páginas de país (7 días)
- Widget compacto en favoritos del dashboard

### SEO
- Favicon SVG personalizado
- Open Graph image (1200x630)
- Metadata actualizada

### Footer / About
- Bio del autor con traducciones ES/EN/PT
- Enlace a metodología MAEC

---

## 📝 Blog - Posts planificados

### Requisitos para posts SEO:
- [ ] Mínimo **1000 palabras** por post
- [ ] Keywords en título, primer párrafo, H2/H3
- [ ] Meta description atractiva (150-160 chars)
- [ ] Enlaces internos a otras páginas del sitio
- [ ] Datos estructurados (JSON-LD)
- [ ] Imágenes con alt text optimizado

### Posts en preparación:
- [🔄] **Aduanas en viajes internacionales** - Guía completa de declaración y restricciones

### Ideas para futuros posts:
- [ ] Guía completa de visados por país
- [ ] Seguro de viaje: qué saber antes de contratar
- [ ] Cómo actuar ante emergencias en el extranjero
- [ ] Equipaje de mano: normas actualizadas por airline
- [ ] Consejos para evitar estafas turísticas
- [ ] Moneda y tipos de cambio: guía práctica
- [ ] Roaming internacional: opciones para no pagar de más
- [ ] Derechos del viajero en la UE

---

## 📧 Contacto
- **M.Castillo:** mybloggingnotes@gmail.com
- **Autor:** M.Castillo
