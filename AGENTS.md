<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Sprint Status

## SPRINT 33 - CRÍTICO (Completado 02/05/2026)
### ✅ Completado
- **Favoritos**: Fix eliminar, añadir, contador (Service Worker caching API, cache-busting)
- **Cuba**: Bloqueo total (page.tsx → 404, picker filtrado, favs filtrado, static params)
- **/rutas**: Suspense wrapper para useSearchParams
- **/blog**: Error boundary + loading.tsx

### ✅ NIVEL 2 (Completado)
1. **RSS URL unificado** - Reemplazado `vercel.app` por `NEXT_PUBLIC_SITE_URL` en checkout, promo, subscription, premium, dossier, telegram-bot
2. **Coherencia países** - Stats page consulta Supabase en tiempo real (`totalPaises` desde DB)
3. **GDPR notice newsletter** - Añadido enlace política de privacidad en formulario newsletter
4. **Eliminar "Próximamente"** - Ocultada sección de QuickAccess hasta implementar

### ✅ NIVEL 3 (Completado)
- **Añadir países MAEC alto riesgo faltantes** - Sudán, Afganistán, Yemen, Siria, Libia, Haití (106 países total, nivel `muy-alto`)
- **Documentar clustering ML públicamente** - README.md: sección dedicada con algoritmo K-Means, features (riskScore, IPC, distancia, arrivals), endpoints API, y código fuente
- Testimonios / prueba social
- España Premium itinerarios module

## Technical Notes
- Supabase URL: `https://nczkvsnuafkwtmgokiuo.supabase.co`
- Service Worker: `public/sw.js` v4 (no cachea `/api/` ni auth headers)
- Auth cookie: formato `base64-` requiere decode en API routes
- Singleton Supabase client: `src/lib/supabase-browser.ts`
- Branch `dev` existe para development, `main` es producción
