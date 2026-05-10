import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let initAttempted = false;

function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase admin client: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key);
}

function getClient(): SupabaseClient | null {
  if (initAttempted) return cachedClient;
  initAttempted = true;
  try {
    cachedClient = createAdminClient();
  } catch {
    cachedClient = null;
  }
  return cachedClient;
}

/**
 * Proxy lazy de supabaseAdmin — no lanza al importar.
 * ⚠️ `if (!supabaseAdmin)` NO funciona (Proxy siempre truthy).
 * Usa `isSupabaseAdminConfigured()` para comprobar disponibilidad.
 */
export const supabaseAdmin = new Proxy<SupabaseClient>({} as SupabaseClient, {
  get(_, prop: string | symbol) {
    const client = getClient();
    if (!client) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('supabaseAdmin no disponible — SUPABASE_SERVICE_ROLE_KEY no configurada');
      }
      return () => Promise.resolve({ data: null, error: new Error('Supabase admin not configured') });
    }
    return (client as any)[prop];
  },
});

export function isSupabaseAdminConfigured(): boolean {
  return !!getClient();
}
