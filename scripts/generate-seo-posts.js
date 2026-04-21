#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const postsDir = path.join(process.cwd(), 'content/posts');

const paises = [
  { codigo: 'de', nombre: 'Alemania', slug: 'alemania' },
  { codigo: 'pt', nombre: 'Portugal', slug: 'portugal' },
  { codigo: 'nl', nombre: 'Países Bajos', slug: 'paises-bajos' },
  { codigo: 'be', nombre: 'Bélgica', slug: 'belgica' },
  { codigo: 'ch', nombre: 'Suiza', slug: 'suiza' },
  { codigo: 'at', nombre: 'Austria', slug: 'austria' },
  { codigo: 'gr', nombre: 'Grecia', slug: 'grecia' },
  { codigo: 'cz', nombre: 'República Checa', slug: 'republica-checa' },
];

const template = (pais) => `---
title: "[RIESGO] ${pais.nombre}: ¿Es seguro viajar en 2026? Guía completa"
slug: "es-seguro-viajar-${pais.slug}"
date: "2026-04-21"
author: "M. Castillo"
category: "Destinos"
readTime: "7 min"
image: https://images.unsplash.com/photo-1564399579881-fc5e6d742d6a?w=800
keywords: "${pais.nombre.toLowerCase()} seguridad, riesgo viajar ${pais.nombre.toLowerCase()}, "${pais.nombre.toLowerCase()}" peligroso 2026"
excerpt: "Análisis actualizado de seguridad en ${pais.nombre}. Consejos y alertas para viajar seguro."
---

${pais.nombre} es un destino turístico popular. Conoce la situación de seguridad en 2026.

## Panorama de seguridad

${pais.nombre} tiene riesgo **bajo** según el MAEC. Es un destino generalmente seguro.

### Destinos seguros

- ✅ Capital y principales ciudades
- ✅ Zonas turísticas principales
- ✅ Áreas rurales recomendadas

---

## Consejos prácticos

### Antes de viajar

- [ ] Consultar alertas MAEC
- [ ] Contratar seguro de viaje
- [ ] Registrar en consular.maec.es

### Durante el viaje

- ✅ Mantener documentos seguros
- ✅ Usar transporte oficial
- ✅ Estar atento a zonas concurridas

---

## Teléfonos de emergencia

| Servicio | Número |
|----------|-------|
| Emergencia | 112 |
| Policía | --- |

---

## Conclusión

**${pais.nombre} es seguro** para turismo con precauciones normales.

Más información: [Viajar a ${pais.nombre}](/pais/${pais.codigo})
`;

paises.forEach(pais => {
  const filename = `es-seguro-viajar-${pais.slug}.md`;
  const filepath = path.join(postsDir, filename);
  
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, template(pais));
    console.log('✅ Creado:', filename);
  } else {
    console.log('⏭️ Ya existe:', filename);
  }
});

console.log('\n✅ Completado');