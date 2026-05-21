-- Fix 1: Set explicit search_path on SECURITY DEFINER functions
-- Resolves: function_search_path_mutable warnings
ALTER FUNCTION public.get_user_level(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_user_total_points(uuid) SET search_path TO 'public';
ALTER FUNCTION public.handle_new_user() SET search_path TO 'public';

-- Fix 2: Revoke EXECUTE from anon on trigger function (no public access needed)
-- Resolves: anon_security_definer_function_executable for handle_new_user
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Note: password_hibp_enabled (leaked password protection) requires Pro Plan+
-- Project is on free tier, so this warning is accepted as a plan limitation
