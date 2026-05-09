import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createLogger } from '@/lib/logger';
import { apiError } from '@/lib/api-schemas';
import { z } from 'zod';

const log = createLogger('UserPrefs');

export const dynamic = 'force-dynamic';

const UserPreferencesSchema = z.object({
  viajero_tipo: z.enum(['mochilero', 'lujo', 'familiar', 'aventura', 'negocios']).optional(),
  tolerancia_riesgo: z.enum(['baja', 'media', 'alta']).optional(),
  presupuesto: z.enum(['bajo', 'medio', 'alto']).optional(),
  preferred_categories: z.array(z.string()).optional(),
});

const QuerySchema = z.object({
  viajero_tipo: z.enum(['mochilero', 'lujo', 'familiar', 'aventura', 'negocios']).optional(),
  tolerancia_riesgo: z.enum(['baja', 'media', 'alta']).optional(),
  presupuesto: z.enum(['bajo', 'medio', 'alto']).optional(),
});

function mapPrefsToDb(body: z.infer<typeof UserPreferencesSchema>) {
  const db: Record<string, unknown> = {};
  if (body.viajero_tipo) db.traveler_type = body.viajero_tipo;
  if (body.tolerancia_riesgo) db.risk_tolerance = body.tolerancia_riesgo;
  if (body.presupuesto) db.budget_range = body.presupuesto;
  if (body.preferred_categories !== undefined) db.preferred_categories = body.preferred_categories;
  return db;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError('No autenticado', undefined, 401);

    const { searchParams } = new URL(request.url);
    const queryResult = QuerySchema.safeParse({
      viajero_tipo: searchParams.get('viajero_tipo'),
      tolerancia_riesgo: searchParams.get('tolerancia_riesgo'),
      presupuesto: searchParams.get('presupuesto'),
    });

    if (!queryResult.success) {
      log.error('Invalid query params:', queryResult.error);
      return apiError('Parámetros de consulta inválidos');
    }

    let query = supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id) as any;

    const filters = mapPrefsToDb(queryResult.data);
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value as string);
    }

    const { data, error } = await query.maybeSingle();

    if (error && error.code !== 'PGRST116') {
      log.error('Error fetching preferences:', error);
      return apiError(error.message, undefined, 500);
    }

    return NextResponse.json({
      preferences: data || {
        traveler_type: 'mochilero',
        risk_tolerance: 'media',
        budget_range: 'medio',
        preferred_categories: [],
      },
    });
  } catch (err) {
    log.error('GET preferences error:', err);
    return apiError('Error interno', undefined, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return apiError('No autenticado', undefined, 401);

    const body = await request.json();

    const parsed = UserPreferencesSchema.safeParse(body);
    if (!parsed.success) {
      log.error('Invalid preferences body:', parsed.error);
      return apiError('Datos de preferencias inválidos');
    }

    const dbFields = mapPrefsToDb(parsed.data);

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        traveler_type: dbFields.traveler_type || 'mochilero',
        risk_tolerance: dbFields.risk_tolerance || 'media',
        budget_range: dbFields.budget_range || 'medio',
        preferred_categories: dbFields.preferred_categories || [],
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      log.error('Error upserting preferences:', error);
      return apiError(error.message, undefined, 500);
    }

    log.info('Preferences saved for user:', user.id);
    return NextResponse.json({ preferences: data });
  } catch (err) {
    log.error('POST preferences error:', err);
    return apiError('Error interno', undefined, 500);
  }
}
