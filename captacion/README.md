# Captación — Seguimiento

**Inicio:** 20 May 2026
**Target:** 100 usuarios registrados + 5 colaboradores + 2 partners en 30 días

## Dashboard

| Métrica | Actual | Target 30d | Fuente |
|---------|--------|------------|--------|
| Usuarios registrados | 0 | 100 | Supabase `profiles` |
| Emails capturados | 0 | 200 | Resend |
| Free trial → registro | — | >15% | localStorage |
| Colaboradores activos | 0 | 5 | Form `/colaborar` |
| Afiliados registrados | 0 | 10 | DB afiliados |
| Partners activos | 0 | 2 | Manual |
| Chat IA preguntas/día | — | >50 | API logs |
| Visitas orgánicas/día | 0 | >100 | Cloudflare |

## Acciones

| # | Acción | Eje | Inicio | Fin | Horas | Estado |
|---|--------|-----|--------|-----|-------|--------|
| A2 | Free trial Chat IA (3 preguntas sin login) | A | 20 May | 20 May | 4h | ✅ |
| A1 | Lead magnet PDF checklist viaje seguro | A | 20 May | 20 May | 3h | ✅ |
| A3 | Landing `/colaborar` + formulario + API + footer | A | 20 May | 20 May | 5h | ✅ |
| B1 | Post FB "Formación Turismo IES Tirant lo Blanc" | B | 20 May | 20 May | 30min | ✅ |
| B2 | Post r/digitalnomadlife | B | 20 May | 20 May | 15min | ✅ |
| D1 | Email onboarding (3 emails) | D | — | — | 6h | Pendiente |
| A4 | Página `/afiliados` | A | — | — | 8h | Pendiente |
| B2 | Hilo X semanal | B | — | — | 1h/sem | Pendiente |
| B3 | Telegram contenido diario | B | — | — | 30min/día | Pendiente |
| B4 | Foros viajeros | B | — | — | 2h/sem | Pendiente |
| B5 | Email outreach bloggers | B | — | — | 4h | Pendiente |
| C1 | Widget IRV embed aseguradoras | C | — | — | 16h | Pendiente |
| C2 | API free tier agencias | C | — | — | 8h | Pendiente |
| C3 | Landing `/investigacion` universidades | C | — | — | 4h | Pendiente |
| D2 | Notificaciones cambio riesgo | D | — | — | 8h | Pendiente |
| D3 | Programa referidos | D | — | — | 12h | Pendiente |

## Notas

- Todas las acciones son coste 0€ (solo horas de desarrollo)
- 20 May: Sprint Captación día 1. Completados A1, A2, A3, B1 (FB), B2 (Reddit). Pendiente: B4, B5, A4, C1-3, D2-3
- r/osinttools primer post (sesión anterior) → 2.5k views. Próximo post técnico en ~7 días
- D1 (email onboarding): templates 3 emails, trigger post-registro, procesamiento en master cron. Sin ejecutar SQL migration (pendiente)
- queHacer: rellenado para CF, SO, SS (3 países africanos sin recomendaciones)
