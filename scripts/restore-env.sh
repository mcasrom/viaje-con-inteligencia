#!/bin/bash
# =============================================================================
# Restaurar Variables de Entorno desde Backup
# =============================================================================
# Este script restaura las variables de entorno desde un backup
# =============================================================================

PROJECT_DIR="/home/miguelc/viaje-con-inteligencia"
LATEST_BACKUP=$(ls -t "$PROJECT_DIR"/env_backup_*.txt 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No se encontró ningún archivo de backup"
    echo "   Busca en: $PROJECT_DIR/env_backup_*.txt"
    exit 1
fi

echo "=========================================="
echo "  Restaurar Variables de Entorno"
echo "=========================================="
echo ""
echo "📄 Backup encontrado: $LATEST_BACKUP"
echo ""

# Mostrar variables encontradas (sin valores sensibles)
echo "📋 Variables en el backup:"
grep -E "^[A-Z_]+=" "$LATEST_BACKUP" | grep -v "=https://" | grep -v "=eyJ" | grep -v "=sk_" | grep -v "=re_" | grep -v "=gsk_" | grep -v "=whsec_" | grep -v "=price_" | grep -v "=pk_" | grep -v "=12345" | grep -v "=TU_" | grep -v "=TU_" | sed 's/=.*/=***/' | head -20
echo ""

read -p "⚠️  Esto solo muestra el archivo. Las variables deben configurarse manualmente en Vercel. Enter para continuar..."

# Abrir el archivo para que el usuario pueda copiar
if command -v xdg-open &> /dev/null; then
    xdg-open "$LATEST_BACKUP"
elif command -v open &> /dev/null; then
    open "$LATEST_BACKUP"
else
    echo "📄 Archivo guardado en: $LATEST_BACKUP"
    echo "   Ábrelo para ver las variables a configurar"
fi

echo ""
echo "✅ Para configurar en Vercel:"
echo "   1. Ve a: Vercel Dashboard → Settings → Environment Variables"
echo "   2. Copia cada variable del backup"
echo "   3. Pega en el campo correspondiente"
echo "   4. Añade para Production environment"