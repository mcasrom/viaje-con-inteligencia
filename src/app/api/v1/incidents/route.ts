import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-v1-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { paisesData } from '@/data/paises';

export async function GET(request: NextRequest) {
  return apiHandler(request, async () => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const country = searchParams.get('country');
    const severity = searchParams.get('severity');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

    let query = supabaseAdmin
      .from('incidents')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) query = query.eq('type', type);
    if (country) query = query.eq('country_code', country.toUpperCase());
    if (severity) query = query.eq('severity', severity);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message, code: 'DB_ERROR' }, { status: 500 });
    }

    const incidents = (data || []).map(inc => ({
      id: inc.id,
      type: inc.type,
      title: inc.title,
      description: inc.description,
      country: inc.country_code,
      countryName: paisesData[inc.country_code?.toLowerCase()]?.nombre || inc.country_code,
      location: inc.location,
      severity: inc.severity,
      action: inc.action_verb,
      recommendation: inc.recommendation,
      source: inc.source,
      signalCount: inc.signal_count,
      detectedAt: inc.detected_at,
      expiresAt: inc.expires_at,
    }));

    return NextResponse.json({
      total: incidents.length,
      incidents,
      documentation: 'https://www.viajeinteligencia.com/api-endpoints',
    });
  }, '/v1/incidents');
}
