# Pendiente - Viaje con Inteligencia

## ⏰ SPRINT ACTUAL (Prioridades CRÍTICAS)

### 🔴 CRÍTICO - SEO Técnico
| # | Mejora | SEO | UX | Complejidad | Estado |
|--+------------------------------------------+-----+----+-------------+--------|
| 1 | Meta tags únicos por página /pais/[code] | 5 | 3 | B | ⏳ |
| 2 | Schema.org TravelAction + Place | 5 | 2 | B | ⏳ |
| 3 | Sitemap.xml dinámico + robots.txt | 4 | 1 | B | ⏳ |
| 4 | hreflang ES/EN/PT en <head> | 4 | 2 | B | ⏳ |

### 🟠 PRIORIDAD ALTA
| # | Mejora | SEO | UX | Complejidad | Estado |
|--+------------------------------------------+-----+----+-------------+--------|
| 5 | Blog activo (2 posts/semana, cola larga) | 5 | 4 | M | ⏳ |
| 6 | Stripe + auth funcional en /premium | 1 | 5 | A | ⏳ |
| 7 | Eliminar testimonio genérico, añadir UGC | 3 | 4 | B | ⏳ |
| 8 | Añadir 20+ países nuevos | 4 | 4 | M | ⏳ |

### 🟡 PRIORIDAD MEDIA
| # | Mejora | SEO | UX | Complejidad | Estado |
|--+------------------------------------------+-----+----+-------------+--------|
| 9 | Newsletter semanal de alertas de riesgo | 2 | 5 | M | ⏳ |
| 10 | API B2B para agencias (€99/mes) | 1 | 3 | A | ⏳ |
| 11 | Google Analytics 4 + Search Console | 3 | 1 | B | ⏳ |
| 12 | Programa afiliados (seguros, eSIM) | 2 | 3 | M | ⏳ |

### 🟢 BAJA/POSTERGADO
| # | Mejora | SEO | UX | Complejidad | Estado |
|--+------------------------------------------+-----+----+-------------+--------|
| 13 | App nativa React Native | 1 | 5 | A | ⏳ |
| 14 | Datos ACLED conflictos tiempo real | 3 | 5 | A | ⏳ |
| 15 | Partnerships aseguradoras (Mapfre/AXA) | 2 | 4 | A | ⏳ |

---

## 📋 ACCIONES SPRINT 1

### 1. Meta tags únicos por página /pais/[code]
- [x] Revisar src/app/pais/[codigo]/page.tsx
- [x] Añadir dynamic metadata por código de país
- [x] Title: "{país} - Requisitos, riesgo y consejos | Viaje con Inteligencia"
- [x] Description: extraer de datos del país
- ⏳ DONE ✅

### 2. Schema.org TravelAction + Place
- [x] Añadir JSON-LD para páginas de país
- [x] Tipo schema: Place + coordenadas, riesgo, moneda
- ⏳ DONE ✅

### 3. Sitemap.xml dinámico 
- [x] Creado src/app/sitemap.ts dinámico
- [x] Incluyen /pais/[code], /blog,static pages
- [x] Prioridades y changefreq por tipo
- ⏳ DONE ✅

### 4. hreflang ES/EN/PT
- [x] Añadidos link tags en layout.tsx
- ⏳ DONE ✅

---

## 📊 RESUMEN SPRINT 1
- ✅ Tareas críticas (1-4): COMPLETADAS
- ⚠️ Pendientes: 5-15

### 5. Blog activo
- [x] Posts nuevos: errores-visados, apps-viaje-esenciales-2026, presupuesto-viaje-economico
- [x] Total posts: 25 (antes 22)
- Target: 2 posts/semana
- ✅ COMPLETADO

### 6. Stripe + auth (PENDIENTE - Posponer)
- [x] Template variables STRIPE_* añadido en .env.local y .env.example
- [ ] CONFIGURAR en Vercel Dashboard: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY
- [ ] Probar flow completo de suscripción
- ⚠️ POSTERGADO: resolver posteriormente

### 7. UGC (Testimonios)
- [x] Testimonios ahora usan API /api/reviews real
- [x] mensaje "Sé el primero en compartir" si vacío
- ✅ COMPLETADO

### 8. Países nuevos
- [x] Añadidos 16 países nuevos: ng, gh, et, rw, tn, sn, bw, mu, bd, pk, fj, pg, ws, gt, jm, tt
- Total: 78 países (antes 62)
- ✅ COMPLETADO