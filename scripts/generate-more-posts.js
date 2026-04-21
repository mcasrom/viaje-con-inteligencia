#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const paises = [
  { codigo: 'us', nombre: 'Estados Unidos', slug: 'estados-unidos' },
  { codigo: 'mx', nombre: 'México', slug: 'mexico' },
  { codigo: 'ca', nombre: 'Canadá', slug: 'canada' },
  { codigo: 'ar', nombre: 'Argentina', slug: 'argentina' },
  { codigo: 'co', nombre: 'Colombia', slug: 'colombia' },
  { codigo: 'cl', nombre: 'Chile', slug: 'chile' },
  { codigo: 'br', nombre: 'Brasil', slug: 'brasil' },
  { codigo: 'jp', nombre: 'Japón', slug: 'japon' },
  { codigo: 'th', nombre: 'Tailandia', slug: 'tailandia' },
  { codigo: 'au', nombre: 'Australia', slug: 'australia' },
];

function template(pais) {
  return `---
title: "[RIESGO] ${pais.nombre}: ¿Es seguro viajar en 2026? Guía completa"
slug: "es-seguro-viajar-${pais.slug}"
date: "2026-04-21"
author: "M. Castillo"
category: "Destinos"
readTime: "8 min"
image: https://images.unsplash.com/photo-1564399579881-fc5e6d742d6a?w=800
keywords: "${pais.nombre.toLowerCase()} seguridad, riesgo viajar ${pais.nombre.toLowerCase()}, "${pais.nombre.toLowerCase()}" peligroso 2026"
excerpt: "Análisis actualizado de seguridad en ${pais.nombre}. Consejos y alertas para viajar seguro en 2026."
---

${pais.nombre} es un destino turístico importante. Conoce la situación de seguridad en 2026.

## Panorama de seguridad

${pais.nombre} tiene riesgo **bajo/medio** según el MAEC. Requiere precauciones normales.

### Destinos recomendados

- ✅ Capital y principales ciudades
- ✅ Zonas turísticas consolidadas
- ✅ Áreas seguras conocidas

---

## Precauciones

### Zona de riesgo medio

- Ciudades pequeñas fuera de rutas turísticas
- Áreas rurales remotas

### Consejos

1. Consultar alertas antes de viajar
2. Evitar zonas marginales
3. Mantener低调 (bajo perfil)

---

## Teléfonos de emergencia

| Servicio | Número |
|----------|-------|
| Emergencia | 112 |
| Policía local | --- |

---

## Conclusión

**${pais.nombre} requiere precaución** pero es visitable con precauciones normales.

Más información: [Viajar a ${pais.nombre}](/pais/${pais.codigo})
`;
}

const postsDir = path.join(process.cwd(), 'content/posts');

paises.forEach(pais => {
  const filepath = path.join(postsDir, 'es-seguro-viajar-' + pais.slug + '.md');
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, template(pais));
    console.log('✅ Creado:', pais.slug);
  }
});

console.log('\n✅ Completado');