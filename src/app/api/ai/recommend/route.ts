import { NextRequest, NextResponse } from 'next/server';
import { getRecommendations, travelAttributes } from '@/data/clustering';
import { paisesData } from '@/data/paises';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const preferencia = searchParams.get('preferencia') as 'playa' | 'cultural' | 'naturaleza' | 'familiar' || 'cultural';
  const presupuesto = searchParams.get('presupuesto') as 'bajo' | 'medio' | 'alto' || 'medio';
  const duracion = parseInt(searchParams.get('duracion') || '7');
  const desdeES = searchParams.get('desdeES') !== 'false';
  const limit = parseInt(searchParams.get('limit') || '3');

  try {
    const recommendations = getRecommendations({
      preferencia,
      presupuesto,
      duracion,
      desdeES,
    }, limit);

    const enriched = recommendations.map(r => {
      const pais = paisesData[r.destination.toLowerCase()];
      return {
        ...r,
        nombre: pais?.nombre || r.destination,
        bandera: pais?.bandera || '🏳️',
        nivelRiesgo: pais?.nivelRiesgo || 'bajo',
      };
    });

    return NextResponse.json({
      preferencia,
      presupuesto,
      duracion,
      recommendations: enriched,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al calcular recomendaciones' },
      { status: 500 }
    );
  }
}