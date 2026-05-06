import { NextRequest, NextResponse } from 'next/server';
import { getRecommendations, findSimilarDestinations, TravelPreference, updateTourismData } from '@/data/clustering';
import { getINEData } from '@/data/ine-data';
import { getPaisPorCodigo, getTodosLosPaises } from '@/data/paises';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const favorites = searchParams.get('favorites')?.split(',').filter(Boolean) || [];
  const preferencia = (searchParams.get('preferencia') || 'cultural') as TravelPreference;
  const presupuesto = (searchParams.get('budget') || 'medio') as 'bajo' | 'medio' | 'alto';
  const duracion = parseInt(searchParams.get('duracion') || '7');
  const similar = searchParams.get('similar'); // código de país para similares

  // Load dynamic INE data if available
  const ineData = await getINEData();
  updateTourismData(ineData);

  // Modo similar: buscar destinos parecidos a uno dado
  if (similar) {
    const similares = findSimilarDestinations(similar, 6);
    const recommendations = similares.map(s => {
      const pais = getPaisPorCodigo(s.code);
      return {
        code: s.code,
        name: s.nombre,
        flag: s.bandera,
        risk: pais?.nivelRiesgo || 'bajo',
        capital: pais?.capital || '',
        score: Math.round(s.score * 100),
        reasons: [s.reason],
      };
    });
    return NextResponse.json({ recommendations, count: recommendations.length, mode: 'similar' });
  }

  // Modo recomendación por preferencias
  const results = getRecommendations({ preferencia, presupuesto, duracion, desdeES: true }, 10);

  // Si hay favoritos, boost a países del mismo continente
  const favoritePaises = favorites.map(f => getPaisPorCodigo(f)).filter(Boolean);

  const recommendations = results.map(r => {
    const pais = getPaisPorCodigo(r.destination);
    let score = r.score;
    const reasons = [...r.highlights];

    // Boost si comparte continente con favoritos
    if (favoritePaises.some(f => f?.continente === pais?.continente)) {
      score += 15;
      reasons.push(`Similar a tus favoritos`);
    }

    return {
      code: r.destination,
      name: pais?.nombre || r.destination,
      flag: pais?.bandera || '🌍',
      risk: pais?.nivelRiesgo || 'bajo',
      capital: pais?.capital || '',
      score,
      reasons: reasons.slice(0, 3),
      days: r.days,
      bestTime: r.bestTime,
    };
  }).sort((a, b) => b.score - a.score);

  return NextResponse.json({
    recommendations,
    count: recommendations.length,
    mode: 'ml',
    basedOn: { preferencia, presupuesto, duracion, favoritesCount: favorites.length },
  });
}
