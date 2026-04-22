-- Verificar RLS habilitado en todas las tablas
-- Ejecutar después del fix

SELECT 
  tablename, 
  CASE WHEN rowsecurity THEN '✅ Habilitado' ELSE '❌ Deshabilitado' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT IN ('pg_statistic', 'pg_exttable', 'pg_foreign_table', 
                    'spatial_ref_sys', 'geometry_columns', 'geography_columns',
                    'raster_columns', 'raster_overviews')
ORDER BY tablename;