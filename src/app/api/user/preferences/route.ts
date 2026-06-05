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
  presupuesto: z.enum(['bajo', 'medio', 'alto', 'lujo', 'low', 'moderate', 'high']).optional(),
  preferred_categories: z.array(z.string()).optional(),
});

const QuerySchema = z.object({
  viajero_tipo: z.enum(['mochilero', 'lujo', 'familiar', 'aventura', 'negocios']).optional(),
  tolerancia_riesgo: z.enum(['baja', 'media', 'alta']).optional(),
  presupuesto: z.enum(['bajo', 'medio', 'alto', 'lujo', 'low', 'moderate', 'high']).optional(),
});

function normalizeBudget(val: string | undefined): string | undefined {
  if (!val) return val;
  const map: Record<string, string> = { low: 'bajo', moderate: 'medio', high: 'alto' };
  return map[val] || val;
}

function normalizeIncomingBody(raw: Record<string, unknown>) {
  const travelerRaw = (raw.viajero_tipo || raw.traveler_type || raw.profile) as string | undefined;
  const riskRaw = (raw.tolerancia_riesgo || raw.risk_tolerance) as string | undefined;
  const budgetRaw = normalizeBudget((raw.presupuesto || raw.budget_range || raw.budget) as string | undefined);

  const validTraveler = ['mochilero', 'lujo', 'familiar', 'aventura', 'negocios'].includes(travelerRaw || '') ? travelerRaw : undefined;
  const validRisk = ['baja', 'media', 'alta'].includes(riskRaw || '') ? riskRaw : undefined;
  const validBudget = ['bajo', 'medio', 'alto', 'lujo'].includes(budgetRaw || '') ? budgetRaw : undefined;

  return {
    viajero_tipo: validTraveler,
    tolerancia_riesgo: validRisk,
    presupuesto: validBudget,
    preferred_categories: raw.preferred_categories as string[] | undefined,
  };
}

function mapPrefsToDb(body: z.infer<typeof UserPreferencesSchema>) {
  const db: Record<string, unknown> = {};
  if (body.viajero_tipo) db.traveler_type = body.viajero_tipo;
  if (body.tolerancia_riesgo) db.risk_tolerance = body.tolerancia_riesgo;
  if (body.presupuesto) db.budget_range = normalizeBudget(body.presupuesto);
  if (body.preferred_categories !== undefined) db.preferred_categories = body.preferred_categories;
  return db;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    let user;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return apiError('No autenticado', undefined, 401);
      user = data.user;
    } catch {
      return apiError('No autenticado', undefined, 401);
    }

    const { searchParams } = new URL(request.url);
    const rawTraveler = searchParams.get('viajero_tipo');
    const rawRisk = searchParams.get('tolerancia_riesgo');
    const rawBudget = normalizeBudget(searchParams.get('presupuesto') || undefined);

    const validTraveler = ['mochilero', 'lujo', 'familiar', 'aventura', 'negocios'].includes(rawTraveler || '') ? rawTraveler : undefined;
    const validRisk = ['baja', 'media', 'alta'].includes(rawRisk || '') ? rawRisk : undefined;
    const validBudget = ['bajo', 'medio', 'alto', 'lujo'].includes(rawBudget || '') ? rawBudget : undefined;

    const queryResult = QuerySchema.safeParse({
      viajero_tipo: validTraveler,
      tolerancia_riesgo: validRisk,
      presupuesto: validBudget,
    });

    if (!queryResult.success) {
      log.error('Invalid query params:', queryResult.error);
      return apiError('Parámetros de consulta inválidos');
    }

    let query = supabase
      .from('alert_preferences')
      .select('*')
      .eq('user_id', user.id) as any;

    const filters = mapPrefsToDb(queryResult.data);
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value as string);
    }

    const { data, error } = await query.maybeSingle();

    if (error && error.code !== 'PGRST116') {
      log.error('Error fetching preferences:', error);
      // Return default prefs instead of 500 — DB error should not break UX
      return NextResponse.json({
        preferences: {
          traveler_type: 'mochilero',
          risk_tolerance: 'media',
          budget_range: 'medio',
          preferred_categories: [],
        },
        db_error: true,
      });
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
    let user;
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return apiError('No autenticado', undefined, 401);
      user = data.user;
    } catch {
      return apiError('No autenticado', undefined, 401);
    }

    let bodyRaw;
    try {
      bodyRaw = await request.json();
    } catch {
      return apiError('Cuerpo de la solicitud invalido', undefined, 400);
    }

    const normalized = normalizeIncomingBody(bodyRaw);

    const parsed = UserPreferencesSchema.safeParse(normalized);
    if (!parsed.success) {
      log.error('Invalid preferences body:', parsed.error);
      return apiError('Datos de preferencias invalidos');
    }

    const dbFields = mapPrefsToDb(parsed.data);

    const { data, error } = await supabase
      .from('alert_preferences')
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
      if (error.code === '23505') {
        return apiError('Preferencias ya existentes', undefined, 409);
      }
      return apiError('Error al guardar preferencias', undefined, 500);
    }

    log.info('Preferences saved for user:', user.id);
    return NextResponse.json({ preferences: data });
  } catch (err) {
    log.error('POST preferences error:', err);
    return apiError('Error interno', undefined, 500);
  }
}
