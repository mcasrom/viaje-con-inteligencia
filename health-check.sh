#!/bin/bash
BASE="https://www.viajeinteligencia.com"
KEY="vci_apifree_pj8iqKqPYpnf0dbqfcd_IX2Fy6yPZ8VO"
UA="Mozilla/5.0"

check() {
  local name=$1 url=$2
  shift 2
  code=$(curl -s -o /dev/null -w "%{http_code}" -H "User-Agent: $UA" "$@" "$url")
  if [ "$code" = "200" ]; then
    echo "✅ $name ($code)"
  else
    echo "❌ $name ($code)"
  fi
}

echo "=== SALUD ECOSISTEMA $(date '+%d/%m %H:%M') ==="
echo ""
echo "--- APIs públicas ---"
check "Health"          "$BASE/api/health"
check "Scraper status"  "$BASE/api/scraper-status"
check "Conflicts"       "$BASE/api/conflicts?limit=1"
check "Incidents v1"    "$BASE/api/v1/incidents"   -H "X-API-Key: $KEY" -H "User-Agent: Mozilla/5.0"
check "Risk ES"         "$BASE/api/v1/risk/es"     -H "X-API-Key: $KEY" -H "User-Agent: Mozilla/5.0"
check "Sitemap"         "$BASE/sitemap.xml"
check "Robots"          "$BASE/robots.txt"
check "Feed"            "$BASE/feed.xml"

echo ""
echo "--- Páginas clave ---"
check "Homepage"        "$BASE/"
check "Blog"            "$BASE/blog"
check "Clustering"      "$BASE/clustering"
check "Checklist"       "$BASE/checklist"
check "Premium"         "$BASE/premium"
check "Metodologia"     "$BASE/metodologia"
check "OSINT"           "$BASE/osint-para-viajeros"
