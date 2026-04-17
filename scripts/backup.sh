#!/bin/bash
# ===========================================
# Viaje con Inteligencia - Script de Backup
# ===========================================
# Uso: ./scripts/backup.sh
# ===========================================

set -e

# Configuración
BACKUP_DIR="${HOME}/viaje-con-inteligencia-backups"
PROJECT_DIR="${HOME}/viaje-con-inteligencia"
MAX_BACKUPS=8
DATE=$(date +%Y-%m-%d_%H%M%S)

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW} Viaje con Inteligencia - Backup${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Crear directorio de backups
mkdir -p "$BACKUP_DIR"

# Verificar que existe el proyecto
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}Error: No se encontró el proyecto en $PROJECT_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}📁 Directorio de backups: $BACKUP_DIR${NC}"
echo -e "${GREEN}📅 Fecha: $(date)${NC}"
echo ""

# Crear backup
BACKUP_FILE="backup_${DATE}.tar.gz"
cd "$PROJECT_DIR"

echo -e "${YELLOW}▶ Creando backup...${NC}"

tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.next' \
    --exclude='.vercel' \
    --exclude='*.log' \
    --exclude='.env*' \
    --exclude='coverage' \
    --exclude='.cache' \
    -czf "${BACKUP_DIR}/${BACKUP_FILE}" .

# Ver tamaño
SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
echo -e "${GREEN}✅ Backup creado: ${BACKUP_FILE} (${SIZE})${NC}"

# Guardar metadata
cat > "${BACKUP_DIR}/backup_${DATE}_info.txt" << EOF
Backup de Viaje con Inteligencia
Fecha: $(date)
Archivo: ${BACKUP_FILE}
Tamaño: ${SIZE}
Proyecto: ${PROJECT_DIR}
EOF

echo -e "${GREEN}📋 Metadata guardada${NC}"

# Rotación: eliminar backups antiguos
echo ""
echo -e "${YELLOW}🔄 Verificando rotación de backups...${NC}"

# Contar backups
BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/backup_*.tar.gz 2>/dev/null | wc -l)
echo "Backups actuales: ${BACKUP_COUNT}"

if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    echo -e "${YELLOW}Eliminando backups antiguos (máximo: ${MAX_BACKUPS})...${NC}"
    
    # Ordenar por fecha y eliminar los más antiguos
    ls -t "${BACKUP_DIR}"/backup_*.tar.gz | tail -n +$((MAX_BACKUPS + 1)) | while read -r old_backup; do
        echo -e "${RED}🗑️  Eliminando: $(basename "$old_backup")${NC}"
        rm -f "$old_backup"
        
        # También eliminar metadata asociada
        base=$(basename "$old_backup" .tar.gz)
        rm -f "${BACKUP_DIR}/${base}_info.txt"
    done
fi

# Mostrar estado final
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} Estado final de backups:${NC}"
echo -e "${GREEN}========================================${NC}"
ls -lh "${BACKUP_DIR}"/backup_*.tar.gz 2>/dev/null || echo "Sin backups"

# Calcular espacio usado
SPACE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo ""
echo -e "${GREEN}💾 Espacio usado en backups: ${SPACE}${NC}"

echo ""
echo -e "${GREEN}✅ Backup completado${NC}"
