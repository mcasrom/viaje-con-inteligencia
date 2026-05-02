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

### 📋 PENDIENTE - NIVEL 2 (próximo sprint)
1. **RSS URL unificado** - Buscar `vercel.app` en src/, reemplazar con `NEXT_PUBLIC_SITE_URL`
2. **Coherencia países 88 vs 101** - Stats page consulta Supabase en tiempo real, no hardcodeado
3. **GDPR notice newsletter** - Añadir política privacidad en formulario newsletter (footer)
4. **Eliminar "Próximamente"** - Ocultar sección de homepage hasta implementar

### 📋 NIVEL 3 (medio plazo)
- Añadir países MAEC alto riesgo faltantes (Sudan, Afganistán, Yemen, Siria, Libia, Haití)
- Testimonios / prueba social
- Documentar clustering ML públicamente
- España Premium itinerarios module

## Technical Notes
- Supabase URL: `https://nczkvsnuafkwtmgokiuo.supabase.co`
- Service Worker: `public/sw.js` v4 (no cachea `/api/` ni auth headers)
- Auth cookie: formato `base64-` requiere decode en API routes
- Singleton Supabase client: `src/lib/supabase-browser.ts`
- Branch `dev` existe para development, `main` es producción
