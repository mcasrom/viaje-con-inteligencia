#!/bin/bash

echo "=== Estado actual ==="
git status

echo ""
echo "=== Cambios pendientes ==="
git diff --stat

echo ""
read -p "Mensaje del commit: " mensaje

if [ -z "$mensaje" ]; then
    echo "Cancelado: mensaje vacío"
    exit 1
fi

git add -A
git commit -m "$mensaje"
git push