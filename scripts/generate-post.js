#!/usr/bin/env node
/**
 * Generador de posts para el blog de Viaje con Inteligencia
 * 
 * Uso: node scripts/generate-post.js "Título del post" "categoría"
 * 
 * Formato del post generado:
 * - Frontmatter con todos los campos requeridos
 * - Estructura SEO optimizada
 * - Secciones recomendadas
 * 
 * Para añadir al proyecto.org:
 * - Documentar el formato
 * - Incluir checklist de campos obligatorios
 */

const fs = require('fs');
const path = require('path');

const CATEGORIES = {
  'tecnologia': 'Tecnología',
  'seguridad': 'Seguridad',
  'preparacion': 'Preparación del Viaje',
  'destinos': 'Destinos',
  'consejos': 'Consejos Prácticos',
  'seguros': 'Seguros'
};

const TEMPLATE = `---
title: "{title}"
description: "{description}"
date: "{date}"
slug: {slug}
image: {image}
author: Miguel Castillo
readingTime: {readingTime} minutos
tags: [{tags}]
categories: [{category}]
keywords: "{keywords}"
---

{content}`;

const CONTENT_TEMPLATE = `**Introducción**

Breve introducción al tema (2-3 párrafos). Explica por qué es relevante para los viajeros.

## Por qué es importante

Explica la relevancia del tema para viajeros. Incluye datos o estadísticas si es posible.

## Sección 1

Contenido detallado sobre el primer aspecto importante.

### Subsection

Más detalles si es necesario.

- Punto importante 1
- Punto importante 2
- Punto importante 3

## Sección 2

Otro aspecto relevante del tema.

| Aspecto | Detalle |
|---------|---------|
| Item 1 | Descripción |
| Item 2 | Descripción |
| Item 3 | Descripción |

## Sección 3

Información adicional o consejos prácticos.

## Conclusión

Resumen de los puntos clave y llamada a la acción.

---

¿Tienes preguntas sobre este tema? Pregunta en nuestro [bot de Telegram](https://t.me/ViajeConInteligenciaBot)`;

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function generatePost(title, category = 'consejos') {
  const date = new Date().toISOString().split('T')[0];
  const slug = slugify(title);
  const categoryLabel = CATEGORIES[category] || CATEGORIES.consejos;
  
  // Generate tags from title words
  const tags = title
    .toLowerCase()
    .split(' ')
    .filter(w => w.length > 3)
    .slice(0, 5)
    .join(', ');

  const content = TEMPLATE
    .replace('{title}', title)
    .replace('{description}', `Artículo sobre ${title.toLowerCase()}. Guía completa con consejos prácticos y información actualizada.`)
    .replace('{date}', date)
    .replace('{slug}', slug)
    .replace('{image}', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800')
    .replace('{readingTime}', '8')
    .replace('{tags}', tags)
    .replace('{category}', categoryLabel)
    .replace('{keywords}', `${title.toLowerCase()}, viaje, consejos, guía`)
    .replace('{content}', CONTENT_TEMPLATE);

  return content;
}

function savePost(title, category) {
  const postsDir = path.join(process.cwd(), 'content/posts');
  
  // Ensure posts directory exists
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  const content = generatePost(title, category);
  const slug = slugify(title);
  const filename = path.join(postsDir, `${slug}.md`);

  if (fs.existsSync(filename)) {
    console.log(`⚠️  El archivo ${filename} ya existe.`);
    console.log('   ¿Quieres sobrescribirlo? (s/n)');
    return;
  }

  fs.writeFileSync(filename, content);
  console.log(`✅ Post creado: ${filename}`);
  console.log(`   Título: ${title}`);
  console.log(`   Categoría: ${CATEGORIES[category] || CATEGORIES.consejos}`);
  console.log(`   Fecha: ${new Date().toISOString().split('T')[0]}`);
}

// CLI handling
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
📝 Generador de Posts - Viaje con Inteligencia

Uso: node scripts/generate-post.js "Título del post" [categoría]

Categorías disponibles:
  - tecnologia    → Tecnología
  - seguridad     → Seguridad  
  - preparacion   → Preparación del Viaje
  - destinos      → Destinos
  - consejos      → Consejos Prácticos
  - seguros       → Seguros

Ejemplos:
  node scripts/generate-post.js "Cómo elegir seguro de viaje" seguros
  node scripts/generate-post.js "Guía de visados para España" preparacion
  node scripts/generate-post.js "Mejores apps de viaje 2026" tecnologia

Después de crear el post:
1. Edita el archivo en content/posts/
2. Añade contenido específico y relevante
3. Revisa y actualiza las keywords SEO
4. Añade la imagen المناسبة (appropriate)
5. Actualiza proyecto.org con el nuevo post
  `);
  process.exit(0);
}

const title = args[0];
const category = args[1] || 'consejos';

savePost(title, category);