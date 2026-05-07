import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-v1-auth';
import { paisesData, getLabelRiesgo, getColoresRiesgo, type NivelRiesgo } from '@/data/paises';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country } = await params;
  return apiHandler(request, async (_, ip) => {
    const codigo = country.toLowerCase();

    const pais = paisesData[codigo];
    if (!pais) {
      return NextResponse.json({
        error: 'Country not found',
        code: 'COUNTRY_NOT_FOUND',
        message: `No data for country code: ${codigo}. Use ISO 3166-1 alpha-2 code (e.g. "es", "fr").`,
      }, { status: 404 });
    }

    const colores = getColoresRiesgo(pais.nivelRiesgo);
    const riskNum: Record<string, number> = { 'sin-riesgo': 1, 'bajo': 2, 'medio': 3, 'alto': 4, 'muy-alto': 5 };

    // Get recent incidents for this country
    const { data: incidents } = await supabaseAdmin
      .from('incidents')
      .select('type, title, severity, created_at')
      .eq('country_code', codigo.toUpperCase())
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get latest prediction
    const { data: predictions } = await supabaseAdmin
      .from('risk_predictions')
      .select('*')
      .eq('country_code', codigo)
      .order('predicted_at', { ascending: false })
      .limit(1);

    return NextResponse.json({
      country: {
        code: codigo,
        name: pais.nombre,
        capital: pais.capital,
        continent: pais.continente,
        flag: pais.bandera,
        coordinates: pais.mapaCoordenadas,
      },
      risk: {
        level: pais.nivelRiesgo,
        label: getLabelRiesgo(pais.nivelRiesgo),
        score: riskNum[pais.nivelRiesgo] || 0,
        lastUpdated: pais.ultimoInforme,
        colors: {
          bg: colores.bg,
          text: colores.text,
        },
      },
      activeIncidents: (incidents || []).map(i => ({
        type: i.type,
        title: i.title,
        severity: i.severity,
        detectedAt: i.created_at,
      })),
      prediction: predictions?.[0] ? {
        riskScore: predictions[0].risk_score,
        probabilityUp7d: predictions[0].probability_up_7d,
        probabilityUp14d: predictions[0].probability_up_14d,
        probabilityUp30d: predictions[0].probability_up_30d,
        topFactors: predictions[0].top_factors,
        predictedAt: predictions[0].predicted_at,
      } : null,
      source: 'Ministerio de Asuntos Exteriores (MAEC) - Gobierno de España',
      documentation: 'https://www.viajeinteligencia.com/api-endpoints',
    });
  }, `/v1/risk/${country}`);
}
