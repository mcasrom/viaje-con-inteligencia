import { supabaseAdmin, isSupabaseAdminConfigured } from './supabase-admin';
import { paisesData as paisesFallback, DatoPais } from '@/data/paises';
import { createLogger } from './logger';

const log = createLogger('PaisesDB');

let cachedPaises: Record<string, DatoPais> | null = null;
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000;

export async function getPaisesData(): Promise<Record<string, DatoPais>> {
  if (cachedPaises && Date.now() - lastFetch < CACHE_TTL) {
    return cachedPaises;
  }

  if (!isSupabaseAdminConfigured()) {
    return paisesFallback;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('paises')
      .select('codigo, data');

    if (error || !data || data.length === 0) {
      return paisesFallback;
    }

    const paises: Record<string, DatoPais> = {};
    for (const row of data) {
      paises[row.codigo] = { ...(row.data as DatoPais), codigo: row.codigo };
    }

    cachedPaises = paises;
    lastFetch = Date.now();
    return paises;
  } catch {
    return paisesFallback;
  }
}

export async function getPaisData(codigo: string): Promise<DatoPais | undefined> {
  const all = await getPaisesData();
  return all[codigo.toLowerCase()];
}

export function invalidateCache(): void {
  cachedPaises = null;
  lastFetch = 0;
}

export async function syncPaisesToSupabase(): Promise<{ inserted: number; errors: number }> {
  if (!isSupabaseAdminConfigured()) {
    log.warn('Supabase admin no configurado, saltando sync paises');
    return { inserted: 0, errors: 0 };
  }

  const entries = Object.entries(paisesFallback);
  let inserted = 0;
  let errors = 0;

  for (const [codigo, data] of entries) {
    const { error } = await supabaseAdmin
      .from('paises')
      .upsert({
        codigo: codigo.toLowerCase(),
        data,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'codigo' });

    if (error) {
      errors++;
    } else {
      inserted++;
    }
  }

  invalidateCache();
  log.info(`Sync paises: ${inserted} insertados, ${errors} errores`);
  return { inserted, errors };
}
