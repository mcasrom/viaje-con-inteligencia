#!/bin/bash

# ===========================================
# Script de despliegue - Viaje con Inteligencia
# ===========================================

set -e

echo "🚀 Iniciando despliegue..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar dependencias
command -v node >/dev/null 2>&1 || { echo -e "${RED}Error: Node.js no está instalado${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}Error: npm no está instalado${NC}"; exit 1; }

echo -e "${GREEN}✓${NC} Dependencias verificadas"

# Instalar dependencias si node_modules no existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
    npm install
    echo -e "${GREEN}✓${NC} Dependencias instaladas"
fi

# Verificar variables entorno
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️ Archivo .env.local no encontrado${NC}"
    echo "Creando archivo de ejemplo..."
    cat > .env.local.example << 'EOF'
TELEGRAM_BOT_TOKEN=tu_token_aqui
TELEGRAM_CHANNEL_ID=-1003764932977
EOF
    echo -e "${YELLOW}Crea .env.local con tus credenciales${NC}"
fi

# Build
echo -e "${YELLOW}🔨 Ejecutando build...${NC}"
npm run build

echo -e "${GREEN}✓${NC} Build completado"

# Verificar si es producción o desarrollo
if [ "$1" = "prod" ]; then
    echo -e "${YELLOW}🚀 Iniciando en modo producción...${NC}"
    npm run start
else
    echo -e "${YELLOW}🧪 Iniciando en modo desarrollo...${NC}"
    echo "Ejecuta: npm run dev"
fi

echo -e "${GREEN}✨ Despliegue completado!${NC}"
