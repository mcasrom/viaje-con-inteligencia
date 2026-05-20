# Propuesta Sprint Captación — Usuarios, Colaboradores & Partners

**Contexto:** Producto funcional (137 países, OSINT 14 fuentes, ML predictivo, API B2B, alertas Telegram, radar de viaje). Tráfico y usuarios registrados: ~0. Sin métricas no hay feedback, ni tracción, ni validación.

**Target:** 100 usuarios registrados + 5 colaboradores activos + 2 partners estratégicos en 30 días.

---

## Índice

1. [Diagnóstico: por qué no hay usuarios](#1-diagnóstico)
2. [Eje A — Marketing directo (coste 0€)](#2-eje-a-marketing-directo)
3. [Eje B — Outreach orgánico](#3-eje-b-outreach-orgánico)
4. [Eje C — Partners estratégicos](#4-eje-c-partners)
5. [Eje D — Conversión y retención](#5-eje-d-conversión-y-retención)
6. [Hoja de ruta 30 días](#6-hoja-de-ruta)
7. [Métricas y decisiones](#7-métricas)
8. [Costes asociados](#8-costes)
9. [Trade-offs y riesgos](#9-trade-offs)

---

## 1. Diagnóstico: por qué no hay usuarios

| Problema | Evidencia | Impacto |
|----------|-----------|---------|
| Sin lead magnet | No hay nada a cambio de un email | Lista = 0 |
| Chat IA pide login | Fricción máxima para probar el producto | Conversión ~0% |
| Sin presencia en foros | 0 posts en Reddit, LosViajeros, foros | Tráfico orgánico = 0 |
| Sin outreach activo | Drafts sin publicar desde hace semanas | Outreach = 0 |
| Sin onboarding | Usuario se registra y no recibe ningún email | Abandono post-registro ~100% |
| Sin viralidad | No hay incentive para compartir | Crecimiento = 0 |

**Conclusión:** No es un problema de producto. Es un problema de distribución y conversión. El producto es funcional, pero nadie llega a él y quien llega no encuentra razón para quedarse.

---

## 2. Eje A — Marketing directo (coste 0€)

### A1. Lead magnet: Checklist de viaje seguro (PDF)

**Qué:** PDF descargable de 1 página con checklist visual de seguridad antes de viajar (documentación, salud, seguridad, contactos).
**Dónde:** Modal en `/checklist` + banner en homepage + sidebar blog.
**A cambio:** Email + nombre.
**Entrega:** Email automático vía Resend con link de descarga.
**Esfuerzo:** 2h (diseño PDF + página descarga + email automático).
**Métrica:** Emails capturados por día.

### A2. Free trial Chat IA sin registro

**Qué:** Permitir 3 preguntas en el Chat IA sin autenticación. Hoy redirige a login.
**Cómo:** Eliminar guard `requireAuth` en `ChatClient.tsx`, añadir contador en `localStorage`, mostrar "¿Quieres más? Regístrate gratis" al llegar al límite.
**Esfuerzo:** 4h (modificar ChatClient + localStorage + CTA post-límite).
**Métrica:** Tasa de conversión free trial → registro.

### A3. Landing «Colabora»

**Qué:** Página `/colaborar` con:
- "¿Escribes sobre viajes? Gana visibilidad y acceso anticipado"
- Byline y enlace a portfolio en cada artículo que publiquen
- Acceso beta a features antes que el público general
- Formulario de contacto simple (nombre, email, redes, cómo quiere colaborar)
**Esfuerzo:** 6h (página + formulario + email de notificación).
**Métrica:** Colaboradores inscritos por semana.

### A4. Afiliados manual (10%)

**Qué:** Página `/afiliados` explicando programa: 10% comisión en suscripciones premium referidas, cookie de 30 días, dashboard básico con enlace de afiliado único.
**Cómo:** Sin plataforma de afiliados (coste 0, manual al inicio). Tracking por `?ref=username` + cookie. Pago manual al alcanzar 50€.
**Esfuerzo:** 8h (página + sistema ref + dashboard básico).
**Métrica:** Afiliados registrados, referidos convertidos.

---

## 3. Eje B — Outreach orgánico

### B1. Publicar drafts existentes

| Draft | Plataforma | Estado | Tiempo |
|-------|-----------|--------|--------|
| `content/outreach/reddit-general-travel.mdx` | Reddit r/travel | Listo | 15min |
| `content/outreach/reddit-osint-global.mdx` | Reddit r/osinttools | Listo | 15min |
| `content/outreach/reddit-rv-living.mdx` | Reddit r/RVLiving | Listo | 15min |
| Reddit r/digitalnomad | Megathread | Pendiente redactar | 30min |
| `content/outreach/facebook-guru-viaje.mdx` | Facebook Gurú de Viaje | Listo | 15min |
| `content/outreach/facebook-comunidad-viajeros.mdx` | FB Comunidad Viajeros | Listo | 15min |

**Total:** ~2h. Publicar escalonado (1-2 por día) para no parecer spam.

### B2. X/Twitter — Hilo semanal

**Qué:** 1 hilo/semana con:
1. Predicción ML del país más riesgoso de la semana
2. 1 alerta activa (GDACS/USGS/WHO)
3. 1 país destacado con nivel de riesgo actual
4. CTA: "Prueba el radar gratis"

**Hashtags:** #TurismoSeguro #IATravel #ViajeInteligencia #OSINT
**Esfuerzo:** 1h/semana.
**Herramienta:** Publicación manual (sin scheduler).

### B3. Telegram canal — Contenido diario

**Qué:** 1 post diario en el canal rotando:
- Lunes: Alerta OSINT activa
- Martes: País destacado
- Miércoles: Predicción ML
- Jueves: Comparativa de costes
- Viernes: Novedades / changelog
- Sábado: Dato curioso OSINT
- Domingo: Resumen semanal

**Esfuerzo:** 30min/día (puede prepararse en batch semanal de 3h).
**Promoción:** Incluir link al canal en firma de foros, Reddit, y email.

### B4. Foros de viajeros

- **LosViajeros:** Crear hilo presentación del proyecto + responder dudas con firma
- **Foro de Viajeros:** Participar en hilos sobre seguridad, visados, destinos
- **Reddit r/SpainTravelers, r/travel:** Responder preguntas enlazando a fichas de país relevantes

**Regla:** 80% valor, 20% promoción directa. Si solo promocionas, te banean.
**Esfuerzo:** 2h/semana.

### B5. Email outreach a bloggers

**Lista target:**
- 5 bloggers viaje ES (Diario del Viajero, Los Viajeros, Viajablog, El Mundo Sobre Ruedas, Trotamundos)
- 5 bloggers LATAM (Viajeros Argentina, Turismo Chile, Blog de Viajes Colombia, etc.)
- 5 agencias pequeñas (viajes a medida, turismo aventura)

**Template:** Propuesta de valor:
- "Acceso gratuito a datos de seguridad en tiempo real para tus artículos"
- "Badge embed de nivel de riesgo para tu web"
- "Sin coste, sin registro obligatorio para tus lectores"

**Esfuerzo:** 4h (investigar contactos + personalizar + enviar).

---

## 4. Eje C — Partners

### C1. Aseguradoras de viaje

**Targets:** InterMundial, IATI Seguros, Allianz Travel, AXA.
**Propuesta:** Widget IRV embed gratuita para sus páginas de destino. La aseguradora ofrece un valor diferencial a sus clientes, nosotros ganamos backlink desde dominio .com relevante + tráfico referido.
**Formato:** Iframe `<script src="https://viajeinteligencia.com/widget/irv.js" data-country="XX">` que renderiza badge nivel de riesgo + recomendación de cobertura.
**Esfuerzo:** 16h (widget embed + página demo + email personalizado a 4 aseguradoras).
**Riesgo:** Las grandes req. contratos, compliance. Apuntar a las pequeñas/medianas primero.

### C2. Agencias de viajes pequeñas

**Target:** Agencias de viajes a medida (10-50 viajes/año), agencias de turismo aventura.
**Propuesta:** API B2B free tier para monitorizar destinos de sus clientes. Dashboard simple con lista de clientes y nivel de riesgo actual de sus destinos.
**Formato:** Invitación personalizada + demo 15min vía Google Meet.
**Esfuerzo:** 8h (identificar 10 agencias + email + 3 demos).
**Métrica:** Agencias activas en free tier.

### C3. Universidades

**Target:** Departamentos de Relaciones Internacionales, Turismo, Geografía.
**Propuesta:** Datos OSINT gratuitos para investigación/trabajos de fin de grado. A cambio: mención en paper, créditos, y difusión entre estudiantes.
**Formato:** Página `/investigacion` con dataset disponible y formulario de solicitud.
**Esfuerzo:** 4h (página + contacto con 3 universidades ES).
**Beneficio:** Largo plazo, backlinks .edu, credibilidad.

---

## 5. Eje D — Conversión y retención

### D1. Email onboarding automático

3 emails secuencia vía Resend, activados al registrarse:

| Día | Asunto | Contenido | CTA |
|-----|--------|-----------|-----|
| 1 | "Tu radar de viaje te espera" | Explicar radar + añadir 1 país | "Configurar radar" |
| 3 | "Alertas activas esta semana" | 3 alertas reales actuales | "Activar alertas" |
| 7 | "¿Qué predice la IA para tus destinos?" | Predicción ML del país que añadió | "Ver predicciones" |

**Esfuerzo:** 6h (diseñar emails + implementar trigger post-registro + métricas).
**Métrica:** Open rate, click rate, conversión a acciones.

### D2. Notificaciones de cambio de riesgo

**Qué:** Cuando el nivel MAEC de un país favorito cambia → email + notificación push web.
**Cómo:** Hook en `runMaecScrape()` del master cron que consulta `user_watchlist` y envía notificación via Resend + Webpush.
**Esfuerzo:** 8h (hook + email template + notificación web).
**Métrica:** Click rate en notificaciones, re-engagement.

### D3. Programa de referidos

**Qué:** Botón "Invitar a un amigo" en el dashboard. El referido obtiene 1 mes premium gratis. El referrer obtiene 1 mes gratis por cada amigo que se registre y añada un país al radar.
**Cómo:** Código de referido único por usuario, tracking por cookie + tabla `referrals`. Sin límite de referidos.
**Esfuerzo:** 12h (sistema de referidos + página de invitación + email + métricas).
**Métrica:** Ratio viral (referidos por usuario), conversión de referidos.

---

## 6. Hoja de ruta 30 días

| Semana | Eje | Acciones | Horas |
|--------|-----|---------|-------|
| Sem 1 | A + D | Lead magnet PDF + página descarga + email automático / Free trial Chat IA + CTA registro | 6h |
| Sem 1 | B | Publicar drafts Reddit (2) + Facebook (2) + crear hilo X | 3h |
| Sem 2 | A | Landing `/colaborar` + formulario | 6h |
| Sem 2 | B | Publicar drafts Reddit restantes + Telegram diario + foros | 8h |
| Sem 2 | D | Email onboarding (3 emails) + trigger post-registro | 6h |
| Sem 3 | A | Página `/afiliados` + sistema ref + dashboard | 8h |
| Sem 3 | C | Email outreach bloggers (10) + agencias (5) | 6h |
| Sem 3 | D | Notificaciones cambio riesgo + hook en master cron | 8h |
| Sem 4 | C | Widget IRV embed + email aseguradoras | 16h |
| Sem 4 | C | Demos agencias + landing `/investigacion` universidades | 8h |
| Sem 4 | D | Programa de referidos + botón invite | 12h |

**Total estimado:** 87h (≈ 11 días hábiles).

---

## 7. Métricas y decisiones

### Dashboard de captación (propuesto)

| Métrica | Fuente | Target 30 días |
|---------|--------|---------------|
| Emails capturados (lead magnet) | Resend logs | 200 |
| Usuarios registrados | Supabase `profiles` | 100 |
| Free trial → registro | localStorage + evento | >15% |
| Tasa apertura onboarding | Resend | >40% |
| Colaboradores activos | Form `/colaborar` | 5 |
| Afiliados registrados | DB afiliados | 10 |
| Partners activos | Contador manual | 2 |
| Referidos por usuario | DB `referrals` | >0.3 |
| Visitas orgánicas/día | Cloudflare Analytics | >100 |

### Decisión clave: ¿monetizar desde el día 1?

**Opción A (propuesta):** Todo gratis, sin paywall. Captar masa crítica primero. Monetizar después con premium/API.
- Ventaja: 0 fricción, máximo crecimiento
- Riesgo: 0 ingresos en 30 días

**Opción B:** Mantener paywall en features premium (alertas Telegram, predicciones avanzadas).
- Ventaja: Ingresos desde el día 1 si hay conversión
- Riesgo: Frena crecimiento, complica el mensaje

**Recomendación:** Opción A para el sprint. Cuando tengamos >500 usuarios, activar premium.

---

## 8. Costes asociados

| Concepto | Coste | Notas |
|----------|-------|-------|
| Resend (emails transaccionales) | 0€ (3000/mes gratis) | Sobra para este volumen |
| Telegram (bot + canal) | 0€ | Ya funciona |
| Reddit / Facebook / X | 0€ | Tiempo, no dinero |
| Widget IRV embed | 0€ | Desarrollo propio |
| Total | **0€** | Solo horas de desarrollo |

---

## 9. Trade-offs y riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Outreach sin respuesta | Alta | Bajo | Probar distintos canales, iterar messaging |
| Lead magnet no conversa | Media | Medio | A/B test en diseño y oferta |
| Free trial canibaliza registros | Baja | Medio | Añadir friction progresiva (pregunta extra cada vez) |
| Foros marcan como spam | Media | Alto | 80/20 regla, participar genuinamente |
| Widget IRV no interesa a aseguradoras | Alta | Bajo | Pasar a agencias, que tienen menos burocracia |
| Crecimiento 0 en 30 días | Media | Alto | Reevaluar: ¿el producto resuelve un problema real? |

---

*Documento abierto a discusión. Cada acción puede priorizarse, aplazarse o descartarse antes de empezar.*
