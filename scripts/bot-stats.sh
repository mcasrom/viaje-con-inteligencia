#!/bin/bash
echo "📊 Stats del Bot Telegram - Viaje con Inteligencia"
echo "=================================================="
echo ""

curl -s "https://viaje-con-inteligencia.vercel.app/api/bot-stats" 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "⚠️ API no disponible (verificar si Supabase está configurado)"

echo ""
echo "📝 Comandos disponibles:"
echo "   /start    - Iniciar bot"
echo "   /pais     - Info de país"
echo "   /chat     - Chat con IA"
echo "   /alertas  - Ver riesgos"
echo "   /cambio   - Tipos de cambio"
echo "   /checklist"
echo "   /premium"
echo "   /lang     - Cambiar idioma"
echo "   /help     - Esta ayuda"