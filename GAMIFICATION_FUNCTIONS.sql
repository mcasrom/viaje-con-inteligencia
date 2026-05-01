-- SPRINT 34 PARTE 2: FUNCIONES
-- Ejecutar DESPUES de GAMIFICATION_SCHEMA.sql

CREATE OR REPLACE FUNCTION get_user_total_points(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $_$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(points) FROM user_activity WHERE user_id = p_user_id),
    0
  );
END;
$_$;

CREATE OR REPLACE FUNCTION get_user_level(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $_$
DECLARE
  total_points INTEGER;
  level_name VARCHAR(50);
  level_icon VARCHAR(10);
  next_level_points INTEGER;
  progress_percent FLOAT;
BEGIN
  total_points := get_user_total_points(p_user_id);
  
  IF total_points >= 500 THEN
    level_name := 'Oraculo';
    level_icon := '🔮';
    next_level_points := 500;
    progress_percent := 100;
  ELSIF total_points >= 150 THEN
    level_name := 'Guia';
    level_icon := '🧭';
    next_level_points := 500;
    progress_percent := ((total_points - 150)::FLOAT / 350) * 100;
  ELSE
    level_name := 'Explorador';
    level_icon := '🔍';
    next_level_points := 150;
    progress_percent := (total_points::FLOAT / 150) * 100;
  END IF;
  
  RETURN jsonb_build_object(
    'total_points', total_points,
    'level_name', level_name,
    'level_icon', level_icon,
    'next_level_points', next_level_points,
    'progress_percent', LEAST(progress_percent, 100)
  );
END;
$_$;
