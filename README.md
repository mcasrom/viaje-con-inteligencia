# Viaje con Inteligencia - Riesgo Zero

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0+-cyan)

Tu asistente de viajes seguros. Mapa interactivo de riesgos por país según MAEC español con información detallada sobre requisitos, embajadas, consejos y más.

## 🚀 Características

- **🗺️ Mapa de Riesgos**: 106+ países con niveles de riesgo según MAEC
- **🤖 Clustering ML**: Algoritmo K-Means personalizado en TypeScript que agrupa destinos por riesgo, turismo, IPC y distancia a España
- **📋 Checklist Imprimible**: +80 items organizados por categorías
- **🤖 Bot Telegram**: @ViajeConInteligenciaBot para alertas en tiempo real
- **⭐ Premium**: Plan freemium con funciones avanzadas (Stripe)
- **📚 Metodología**: Explicación transparente de cómo se clasifican los riesgos
- **🔔 Alertas automáticas**: Cron jobs que escanean MAEC diariamente
- **📊 Dashboard personal**: Favoritos, alertas y estadísticas

## 🤖 Machine Learning: Clustering K-Means

La plataforma implementa un **algoritmo K-Means** desde cero en TypeScript (sin dependencias externas de ML) para agrupar destinos turísticos.

### Cómo funciona

1. **Extracción de features**: Para cada país se calculan 4 dimensiones:
   - `riskScore` (1-5): Nivel de riesgo MAEC normalizado
   - `ipc`: Índice de precios al consumo relativo a España
   - `distanciaES`: Distancia en km desde España (haversine)
   - `arrivals`: Llegadas turísticas anuales (datos UNWTO/INE)

2. **Normalización**: Todas las features se escalan a [0,1] para evitar sesgos por magnitud.

3. **K-Means**: Implementación iterativa con:
   - Inicialización aleatoria de centroides
   - Asignación por distancia euclidiana
   - Actualización de centroides hasta convergencia
   - 4 clusters por defecto (configurable 3-5)

4. **Resultados**: Los clusters revelan patrones como "destinos seguros y caros", "aventura económica", etc.

### Páginas públicas

- **[/clustering](https://viaje-con-inteligencia.vercel.app/clustering)**: Visualización interactiva de clusters
- **[/api/ai/clustering](https://viaje-con-inteligencia.vercel.app/api/ai/clustering)**: API que devuelve clusters y destinos
- **[/api/ai/similar](https://viaje-con-inteligencia.vercel.app/api/ai/similar)**: Encuentra destinos similares a uno dado

### Código fuente

- `src/data/clustering.ts` - Algoritmo K-Means + datos de turismo
- `src/app/api/ai/clustering/route.ts` - Endpoint API
- `src/app/clustering/page.tsx` - UI interactiva

> **Nota**: Las features de viaje (playa, cultural, naturaleza, familiar) están hardcodeadas para 61 países. Se planea integrar datos de OpenStreetMap y Wikidata para automatizar.

## 📁 Estructura del Proyecto

```
viaje-con-inteligencia/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Mapa mundial (MapaMundial)
│   │   ├── pais/[codigo]/page.tsx     # Detalle país
│   │   ├── dashboard/page.tsx         # Panel usuario (favoritos, alertas)
│   │   ├── clustering/page.tsx        # Visualización ML K-Means
│   │   ├── stats/page.tsx             # Estadísticas globales
│   │   ├── checklist/page.tsx         # Checklist imprimible
│   │   ├── premium/page.tsx           # Pricing (Stripe)
│   │   ├── blog/                      # Blog posts
│   │   ├── rutas/                     # Rutas temáticas (vino, etc.)
│   │   ├── legal/page.tsx             # Disclaimer y privacidad
│   │   ├── metodologia/page.tsx        # Metodología MAEC
│   │   ├── admin/alerts/page.tsx      # Panel control
│   │   └── api/
│   │       ├── ai/clustering/route.ts  # API clustering ML
│   │       ├── ai/similar/route.ts     # Destinos similares
│   │       ├── telegram/route.ts       # Webhook bot
│   │       ├── alerts/route.ts         # Envío alertas
│   │       ├── checkout/route.ts       # Stripe checkout
│   │       ├── cron/                  # Cron jobs (MAEC scraping)
│   │       └── subscription/route.ts   # Gestión suscripciones
│   ├── components/
│   │   ├── MapaMundial.tsx            # Mapa principal
│   │   ├── MapaInteractivo.tsx        # Leaflet map
│   │   └── NewsletterSignup.tsx       # Formulario newsletter
│   ├── data/
│   │   ├── paises.ts                  # Datos países (106+ países)
│   │   └── clustering.ts              # K-Means + features turismo
│   └── lib/
│       ├── supabase-browser.ts        # Supabase cliente (singleton)
│       ├── supabase-server.ts         # Supabase server-side
│       ├── telegram-bot.ts            # Lógica bot
│       └── telegram-channel.ts        # Envío canal
├── .env.local                         # Variables entorno (crear)
├── package.json
└── README.md
```

## 🛠️ Instalación y Desarrollo

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-user/viaje-con-inteligencia.git
cd viaje-con-inteligencia

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables entorno
cat > .env.local << 'EOF'
TELEGRAM_BOT_TOKEN=tu_token_aqui
TELEGRAM_CHANNEL_ID=tu_channel_id_aqui
EOF

# 4. Ejecutar desarrollo
npm run dev

# 5. Abrir http://localhost:3000
```

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo local
npm run build        # Build producción
npm run start        # Iniciar producción
npm run lint         # Verificar código
```

## 🔐 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram | `123456789:ABCdefGHI...` |
| `TELEGRAM_CHANNEL_ID` | ID del canal | `-1001234567890` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Key anónima Supabase | `eyJ...` |
| `STRIPE_SECRET_KEY` | Clave secreta Stripe | `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave pública Stripe | `pk_test_...` |
| `STRIPE_PRICE_ID` | ID del precio subscription | `price_...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (solo server) | `eyJ...` |

## 🚢 Despliegue

### Opción 1: Vercel (Más fácil)

1. Fork este repositorio en GitHub
2. Ir a [vercel.com](https://vercel.com)
3. "Import Project" → seleccionar repo
4. Añadir variables entorno
5. Deploy automático en cada push

### Opción 2: DigitalOcean VPS

```bash
# Conectar por SSH
ssh root@tu-ip

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clonar y desplegar
git clone https://github.com/tu-user/viaje-con-inteligencia.git
cd viaje-con-inteligencia
npm install
npm run build

# PM2 para gestión
npm install -g pm2
pm2 start npm --name "viaje-inteligencia" -- start
pm2 save
pm2 startup

# Nginx + SSL
apt install nginx certbot python3-certbot-nginx
certbot --nginx -d viajeconinteligencia.com
```

### Opción 3: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 🤖 Configuración Telegram

```bash
# Configurar webhook para recibir mensajes
curl -F "url=https://tu-dominio.com/api/telegram" \
  https://api.telegram.org/bot<TOKEN>/setWebhook

# Verificar webhook
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

## 🌍 Países Disponibles (106+)

**Europa (44)**: España, Francia, Alemania, Italia, Portugal, Reino Unido, Países Bajos, Suiza, Grecia, Turquía, y más...

**Asia (20+)**: Japón, Corea del Sur, Tailandia, Vietnam, India, China, Singapur, EAU, Filipinas, Indonesia, y más...

**América (20+)**: Estados Unidos, Canadá, México, Colombia, Perú, Brasil, Argentina, Chile, Ecuador, Venezuela, y más...

**África (12+)**: Sudáfrica, Egipto, Marruecos, Kenia, Nigeria, Tanzania, Senegal, y más...

**Oceanía (4)**: Australia, Nueva Zelanda, Fiyi, Papúa Nueva Guinea

**Alto riesgo (muy-alto)**: Sudán, Afganistán, Yemen, Siria, Libia, Haití (desaconsejado viajar)

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, Leaflet
- **Backend**: Next.js API Routes, Vercel Cron Jobs
- **Database**: Supabase (PostgreSQL + Auth)
- **Payments**: Stripe Checkout
- **ML**: K-Means custom (TypeScript, sin dependencias)
- **Alertas**: Telegram Bot API + Webhooks

## 📄 Roadmap

### Completado ✅
- [x] Mapa de riesgos con 106+ países
- [x] Clustering ML K-Means personalizado
- [x] Integración IA (GPT) para recomendaciones
- [x] RSS feed del MAEC para alertas automáticas
- [x] Pasarela de pagos (Stripe)
- [x] Panel de administración completo
- [x] Supabase Auth + Database
- [x] Blog con contenido SEO
- [x] Dashboard personal con favoritos
- [x] Bot Telegram con alertas

### En progreso 🚧
- [ ] Automatizar features de clustering con OpenStreetMap/Wikidata
- [ ] España Premium itinerarios module
- [ ] Testimonios / prueba social

### Futuro 📋
- [ ] App móvil (React Native)
- [ ] Clustering con más dimensiones (clima, gastronomía, etc.)
- [ ] Integración datos AEMET en tiempo real

## 📝 Notas

- Los datos de riesgos son orientativos y basados en MAEC (Ministerio de Asuntos Exteriores español)
- El clustering ML utiliza datos de UNWTO/INE para turismo y cálculo haversine para distancias
- Verificar siempre información oficial antes de viajar
- Cuba está excluida del sitio por riesgos legales relacionados con administración US

## 📧 Contacto

**M.Castillo** - mybloggingnotes@gmail.com

## 📄 Licencia

© 2026 M.Castillo. Todos los derechos reservados.

---

*Este proyecto es informativo. Los datos se basan en fuentes oficiales del MAEC español.*
