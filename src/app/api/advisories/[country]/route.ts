import { NextRequest, NextResponse } from 'next/server';
import { paisesData } from '@/data/paises';
import { DATOS_HARDCODEADOS } from '@/data/fuentes/datos-hardcodeados';
import { FUENTES_META } from '@/data/fuentes/metadata';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { AdvisoryFuente, FuenteId } from '@/data/fuentes/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country } = await params;
  const codigo = country.toLowerCase();
  const pais = paisesData[codigo];

  if (!pais) {
    return NextResponse.json({ error: 'Country not found' }, { status: 404 });
  }

  const fuentes: AdvisoryFuente[] = [];

  // 1. MAEC from paises-data.json
  fuentes.push({
    id: 'maec' as const,
    nombre: FUENTES_META['maec'].nombre,
    siglas: FUENTES_META['maec'].siglas,
    bandera: FUENTES_META['maec'].bandera,
    pais: pais.nombre,
    nivelRiesgo: pais.nivelRiesgo,
    nivelOriginal: '',
    url: `https://www.exteriores.gob.es/es/recomendaciones-viaje/Paginas/${pais.nombre.replace(/\s+/g, '')}.aspx`,
    resumen: null,
    actualizado: pais.ultimoInforme,
  });

  // 2. US State Dept from Supabase
  const { data: usData } = await supabaseAdmin
    .from('external_risk')
    .select('risk_level, risk_label, summary, fetched_at')
    .eq('source', 'us_state_dept')
    .eq('country_code', codigo)
    .maybeSingle();

  const usLevelMap: Record<number, 'sin-riesgo' | 'bajo' | 'medio' | 'alto' | 'muy-alto'> = {
    1: 'sin-riesgo',
    2: 'bajo',
    3: 'alto',
    4: 'muy-alto',
  };

  if (usData) {
    fuentes.push({
      id: 'us-state-dept' as const,
      nombre: FUENTES_META['us-state-dept'].nombre,
      siglas: FUENTES_META['us-state-dept'].siglas,
      bandera: FUENTES_META['us-state-dept'].bandera,
      pais: pais.nombre,
      nivelRiesgo: usData.risk_level ? (usLevelMap[usData.risk_level] ?? null) : null,
      nivelOriginal: usData.risk_label || `Level ${usData.risk_level}`,
      url: `https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/${pais.nombre.replace(/\s+/g, '-').toLowerCase()}-travel-advisory.html`,
      resumen: usData.summary,
      actualizado: usData.fetched_at,
    });
  }

  // 3. UK FCDO, Canada, Australia from hardcoded data
  const hardcoded = DATOS_HARDCODEADOS[codigo];
  if (hardcoded) {
    for (const [id, dato] of Object.entries(hardcoded)) {
      if (dato) {
        const meta = FUENTES_META[id as FuenteId];
        fuentes.push({
          id: id as FuenteId,
          nombre: meta.nombre,
          siglas: meta.siglas,
          bandera: meta.bandera,
          pais: pais.nombre,
          nivelRiesgo: dato.nivelRiesgo,
          nivelOriginal: dato.nivelOriginal,
          url: dato.url,
          resumen: dato.resumen,
          actualizado: dato.actualizado,
        });
      }
    }
  }

  return NextResponse.json({ pais: pais.nombre, codigo, fuentes });
}
