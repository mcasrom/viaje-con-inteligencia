import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let cachedInitError: Error | null = null;

function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase admin client: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key);
}

/** Lazy getter — solo falla cuando se usa, no al importar */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (cachedClient) return cachedClient;
  if (cachedInitError) return null;
  try {
    cachedClient = createAdminClient();
    return cachedClient;
  } catch (e) {
    cachedInitError = e as Error;
    return null;
  }
}

/** @deprecated Usa getSupabaseAdmin() para evitar falsos positivos */
export const supabaseAdmin = new Proxy<SupabaseClient>({} as SupabaseClient, {
  get(_, prop: string | symbol) {
    const client = getSupabaseAdmin();
    if (!client) {
      // Dev warning
      if (process.env.NODE_ENV === 'development') {
        console.warn('supabaseAdmin no disponible (SUPABASE_SERVICE_ROLE_KEY no configurada)');
      }
      return () => Promise.resolve({ data: null, error: new Error('Supabase admin not configured') });
    }
    return (client as any)[prop];
  },
});

export const isSupabaseAdminConfigured = () => !!getSupabaseAdmin();
