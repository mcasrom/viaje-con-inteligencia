#!/bin/bash

FILE="src/app/dashboard/page.tsx"

cat << 'EOF' > $FILE
export default function Dashboard() {
  return (
    <div>
      <h1>Travel Intelligence</h1>

      <nav>
        <a href="/dashboard/radar">Radar</a>
        <a href="/comparar">Comparar</a>
        <a href="/mapa">Mapa</a>
        <a href="/alertas">Alertas</a>
        <a href="/decidir">Decidir</a>
        <a href="/indices">Índices</a>
        <a href="/blog">Blog</a>
      </nav>
    </div>
  );
}
EOF

echo "OK dashboard actualizado"
