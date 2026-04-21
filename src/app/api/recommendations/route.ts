import { NextRequest, NextResponse } from 'next/server';
import { getPaisPorCodigo, getTodosLosPaises } from '@/data/paises';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const favorites = searchParams.get('favorites')?.split(',').filter(Boolean) || [];
  const interests = searchParams.get('interests')?.split(',').filter(Boolean) || [];
  const budget = searchParams.get('budget') || 'moderate';
  const riskPreference = searchParams.get('risk') || 'all';

  const allCountries = getTodosLosPaises();
  const riskLevels: Record<string, number> = {
    'sin-riesgo': 0,
    'bajo': 1,
    'medio': 2,
    'alto': 3,
    'muy-alto': 4,
  };

  let filtered = allCountries;

  if (riskPreference !== 'all') {
    const maxRisk = riskLevels[riskPreference] || 4;
    filtered = allCountries.filter(p => riskLevels[p.nivelRiesgo] <= maxRisk);
  }

  const recommendations = filtered
    .map(country => {
      let score = 0;
      const reasons: string[] = [];

      if (favorites.includes(country.codigo)) {
        score += 50;
        reasons.push('En tus favoritos');
      } else if (favorites.length > 0) {
        const favoriteCountries = favorites.map(f => getPaisPorCodigo(f)).filter(Boolean);
        const sameContinent = favoriteCountries.filter(f => f?.continente === country.continente);
        if (sameContinent.length > 0) {
          score += 20;
          reasons.push(`Similar a ${sameContinent[0]?.nombre}`);
        }
      }

      if (interests.length > 0) {
        const interestLower = interests.map(i => i.toLowerCase());
        if (interestLower.some(i => country.queHacer.some(q => q.toLowerCase().includes(i)))) {
          score += 15;
          reasons.push('Coincide con tus intereses');
        }
      }

      if (country.nivelRiesgo === 'sin-riesgo' || country.nivelRiesgo === 'bajo') {
        score += 10;
        reasons.push('Riesgo bajo');
      }

      if (budget === 'low' && country.indicadores.indicePrecios === 'bajo') {
        score += 10;
        reasons.push('Económico');
      } else if (budget === 'high' && country.indicadores.indicePrecios === 'alto') {
        score += 10;
        reasons.push('Premium');
      }

      return { country, score, reasons };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(r => ({
      code: r.country.codigo,
      name: r.country.nombre,
      flag: r.country.bandera,
      risk: r.country.nivelRiesgo,
      capital: r.country.capital,
      score: r.score,
      reasons: r.reasons,
    }));

  return NextResponse.json({
    recommendations,
    count: recommendations.length,
    basedOn: {
      favoritesCount: favorites.length,
      interests,
      budget,
      riskPreference,
    },
  });
}