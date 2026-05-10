import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { createLogger } from '@/lib/logger';
import { apiError } from '@/lib/api-schemas';
import { z } from 'zod';

const log = createLogger('Indices');

const QuerySchema = z.object({
  tipo: z.enum(['gpi', 'gti', 'hdi', 'ipc']).optional(),
  pais: z.string().length(2).optional(),
});

async function getHardcoded(tipo?: string, pais?: string) {
  const { GPI_DATA, GTI_DATA, HDI_DATA, IPC_DATA } = await import('@/data/indices');
  const all: Record<string, any[]> = {
    gpi: GPI_DATA.map(d => ({ tipo: 'gpi', codigo_pais: d.code.toLowerCase(), nombre_pais: d.country, valor: d.score, rank: d.rank, cambio: d.change, region: d.region })),
    gti: GTI_DATA.map(d => ({ tipo: 'gti', codigo_pais: d.code.toLowerCase(), nombre_pais: d.country, valor: d.score, rank: d.rank, cambio: d.change, region: d.region })),
    hdi: HDI_DATA.map(d => ({ tipo: 'hdi', codigo_pais: d.code.toLowerCase(), nombre_pais: d.country, valor: d.score, rank: d.rank, cambio: d.change, region: d.region })),
    ipc: IPC_DATA.map(d => {
      const numeric = parseFloat(String(d.ipc).replace('%', ''));
      return { tipo: 'ipc', codigo_pais: d.code.toLowerCase(), nombre_pais: d.country, valor: numeric, nivel: d.nivel, region: d.region };
    }),
  };

  let result = Object.values(all).flat();
  if (tipo) result = all[tipo] || [];
  if (pais) result = result.filter(r => r.codigo_pais === pais.toLowerCase());
  return result;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const parsed = QuerySchema.safeParse(params);

    const tipo = parsed.success ? parsed.data.tipo : undefined;
    const pais = parsed.success ? parsed.data.pais : undefined;

    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json(await getHardcoded(tipo, pais));
    }

    let query = supabaseAdmin.from('indices').select('*');
    if (tipo) query = query.eq('tipo', tipo);
    if (pais) query = query.eq('codigo_pais', pais.toLowerCase());
    query = query.order('rank', { ascending: true });

    const { data, error } = await query;

    if (error || !data) {
      log.warn('Supabase indices query failed, using fallback:', error?.message);
      return NextResponse.json(await getHardcoded(tipo, pais));
    }

    return NextResponse.json(data);
  } catch (err) {
    log.error('Indices error:', err);
    return apiError('Error interno', undefined, 500);
  }
}
