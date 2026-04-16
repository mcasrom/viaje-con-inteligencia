# Viaje con Inteligencia - Riesgo Zero

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0+-cyan)

Tu asistente de viajes seguros. Mapa interactivo de riesgos por país según MAEC español con información detallada sobre requisitos, embajadas, consejos y más.

## 🚀 Características

- **🗺️ Mapa de Riesgos**: 28 países con niveles de riesgo según MAEC
- **📋 Checklist Imprimible**: +80 items organizados por categorías
- **🤖 Bot Telegram**: @AlertasViajero para alertas en tiempo real
- **⭐ Premium**: Plan freemium con funciones avanzadas
- **📚 Metodología**: Explicación transparente de cómo se clasifican los riesgos

## 📁 Estructura del Proyecto

```
viaje-con-inteligencia/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Mapa mundial
│   │   ├── pais/[codigo]/page.tsx     # Detalle país
│   │   ├── checklist/page.tsx          # Checklist imprimible
│   │   ├── premium/page.tsx           # Pricing
│   │   ├── legal/page.tsx             # Disclaimer
│   │   ├── metodologia/page.tsx        # Metodología MAEC
│   │   ├── admin/alerts/page.tsx      # Panel control
│   │   └── api/
│   │       ├── telegram/route.ts       # Webhook bot
│   │       └── alerts/route.ts         # Envío alertas
│   ├── components/
│   │   └── MapaMundial.tsx
│   ├── data/
│   │   └── paises.ts                  # Datos países (28 países)
│   └── lib/
│       ├── telegram-bot.ts             # Lógica bot
│       └── telegram-channel.ts         # Envío canal
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

## 📊 Países Disponibles (28)

**Europa**: España, Francia, Alemania, Italia, Portugal, Reino Unido, Países Bajos, Suiza, Grecia, Turquía

**América**: Estados Unidos, Canadá, México, Cuba, Colombia, Perú, Brasil, Argentina, Chile

**Asia**: Japón, Corea del Sur, Tailandia, Vietnam, India, China, Singapur, EAU

**África**: Sudáfrica, Egipto, Marruecos, Kenia

**Oceanía**: Australia, Nueva Zelanda

## 📄 Roadmap

- [ ] Expandir a 50+ países
- [ ] Integración IA (GPT) para recomendaciones
- [ ] RSS feed del MAEC para alertas automáticas
- [ ] App móvil (React Native)
- [ ] Pasarela de pagos (Stripe)
- [ ] Panel de administración completo

## 📝 Notas

- Los datos de riesgos son orientativos y basados en MAEC
- Verificar siempre información oficial antes de viajar
- No substitutions for official government travel advisories

## 📧 Contacto

**M.Castillo** - mybloggingnotes@gmail.com

## 📄 Licencia

© 2026 M.Castillo. Todos los derechos reservados.

---

*Este proyecto es informativo. Los datos se basan en fuentes oficiales del MAEC español.*
