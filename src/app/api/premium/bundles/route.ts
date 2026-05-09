import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createLogger } from '@/lib/logger';
import { apiError } from '@/lib/api-schemas';
import { z } from 'zod';

const log = createLogger('Premium');

const BundleSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  intervalo: z.string(),
  tipo: z.string(),
  features: z.array(z.record(z.string(), z.any())),
});

const BundleListSchema = z.array(BundleSchema);

export async function GET() {
  try {
    if (!supabaseAdmin) {
      const { MOCHILERO_BUNDLE, VIP_ACCESS } = await import('@/data/mochilero-premium');
      return NextResponse.json(BundleListSchema.parse([
        { id: 'mochilero-pro', ...MOCHILERO_BUNDLE },
        { id: 'mochilero-vip', ...VIP_ACCESS },
      ]));
    }

    const { data, error } = await supabaseAdmin
      .from('premium_bundles')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      log.error('Error fetching bundles:', error);
      return apiError('Error al obtener paquetes', undefined, 500);
    }

    return NextResponse.json(BundleListSchema.parse(data || []));
  } catch (err) {
    log.error('Bundles error:', err);
    return apiError('Error interno', undefined, 500);
  }
}
