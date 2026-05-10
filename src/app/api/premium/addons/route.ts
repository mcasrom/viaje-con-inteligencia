import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { createLogger } from '@/lib/logger';
import { apiError } from '@/lib/api-schemas';
import { z } from 'zod';

const log = createLogger('Premium');

const AddonSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  tipo: z.string(),
  features: z.array(z.string()),
});

const AddonListSchema = z.array(AddonSchema);

export async function GET() {
  try {
    if (!isSupabaseAdminConfigured()) {
      const { ONE_TIME_BUNDLES } = await import('@/data/mochilero-premium');
      return NextResponse.json(AddonListSchema.parse(
        Object.entries(ONE_TIME_BUNDLES).map(([id, b]) => ({ id, ...b }))
      ));
    }

    const { data, error } = await supabaseAdmin
      .from('premium_addons')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      log.error('Error fetching addons:', error);
      return apiError('Error al obtener addons', undefined, 500);
    }

    return NextResponse.json(AddonListSchema.parse(data || []));
  } catch (err) {
    log.error('Addons error:', err);
    return apiError('Error interno', undefined, 500);
  }
}
