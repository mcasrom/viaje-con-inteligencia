#!/bin/bash
echo "📊 Stats del Bot Telegram - Viaje con Inteligencia"
echo "=================================================="
echo ""

STATS_FILE="telegram-stats.json"

if [ -f "$STATS_FILE" ]; then
  echo "📈 Usage Stats:"
  cat "$STATS_FILE" | python3 -m json.tool 2>/dev/null || cat "$STATS_FILE"
else
  echo "❌ No stats file found. El bot no ha registrado ningún /start aún."
  echo "   Los stats se crean cuando alguien usa /start"
fi

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