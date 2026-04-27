import { NextRequest, NextResponse } from 'next/server';
import { 
  thematicRoutes, 
  getRouteById, 
  generateDayByDay,
  ThemeRoute,
  DurationOption,
  ThematicRoute 
} from '@/data/rutas-espanas';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const routeId = searchParams.get('route') as ThemeRoute | null;
  const days = parseInt(searchParams.get('days') || '3') as DurationOption;
  const includeML = searchParams.get('ml') === 'true';

  try {
    if (routeId) {
      const route = getRouteById(routeId);
      
      if (!route) {
        return NextResponse.json(
          { error: 'Ruta no encontrada', availableRoutes: Object.keys(thematicRoutes) },
          { status: 404 }
        );
      }

      const dayByDay = generateDayByDay(routeId, days);

      const response: any = {
        route,
        itinerary: dayByDay,
        summary: {
          totalLocations: route.locations.length,
          totalDistance: route.totalDistance,
          totalDrivingTime: route.totalDrivingTime,
          days,
          cost: route.avgDailyCost,
        },
        timestamp: new Date().toISOString(),
      };

      if (includeML) {
        response.ml = {
          recommendation: generateMLRecommendation(route, days),
          bestSegments: getBestSegments(route, days),
          riskAssessment: generateRiskAssessment(route),
        };
      }

      return NextResponse.json(response);
    }

    const allRoutes = Object.values(thematicRoutes).map(r => ({
      id: r.id,
      name: r.name,
      shortName: r.shortName,
      category: r.category,
      totalDistance: r.totalDistance,
      totalDrivingTime: r.totalDrivingTime,
      difficulty: r.difficulty,
      bestSeason: r.bestSeason,
      avgDailyCost: r.avgDailyCost,
      mlFeatures: r.mlFeatures,
    }));

    return NextResponse.json({
      routes: allRoutes,
      count: allRoutes.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Rutas España API error:', error);
    return NextResponse.json(
      { error: 'Error al procesar rutas' },
      { status: 500 }
    );
  }
}

function generateMLRecommendation(route: ThematicRoute, days: number): string {
  const scores = route.mlFeatures;
  const combinedScore = (scores.popularityScore + scores.safetyScore + scores.valueScore) / 3;
  
  let recommendation = '';
  if (combinedScore > 8.5) {
    recommendation = 'Recomendación alta: ruta muy equilibrada.';
  } else if (combinedScore > 7.5) {
    recommendation = 'Recomendación media-alta: buena opción para el tiempo indicado.';
  } else {
    recommendation = 'Ruta recomendable para amantes de destinos menos crowded.';
  }

  if (route.difficulty === 'facil') {
    recommendation += ' Ideal para familias.';
  } else if (route.difficulty === 'dificil') {
    recommendation += ' Se requiere experiencia en conducción.';
  }

  return recommendation;
}

function getBestSegments(route: ThematicRoute, days: number) {
  const segmentsPerDay = Math.ceil(route.segments.length / days);
  return route.segments.slice(0, segmentsPerDay * days).slice(0, days).map(s => ({
    name: s.name,
    distance: s.distance,
    drivingTime: s.drivingTime,
    locations: s.locations.slice(0, 2),
  }));
}

function generateRiskAssessment(route: ThematicRoute) {
  return {
    security: route.mlFeatures.safetyScore / 10,
    roadSafety: route.difficulty === 'facil' ? 0.95 : route.difficulty === 'moderado' ? 0.85 : 0.75,
    weather: 'variable según temporada',
    recommendation: route.bestSeason.join(', '),
  };
}