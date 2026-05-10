import { NextRequest, NextResponse } from 'next/server';
import { getRecommendations, RecomendarRequest } from '@/lib/recommendation-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countries, preferences, prompt } = body;

    if (!countries || !Array.isArray(countries) || countries.length < 2) {
      return NextResponse.json(
        { error: 'Se requieren al menos 2 países' },
        { status: 400 }
      );
    }

    if (countries.length > 6) {
      return NextResponse.json(
        { error: 'Máximo 6 países permitidos' },
        { status: 400 }
      );
    }

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Se requieren preferencias (safety, cost, development)' },
        { status: 400 }
      );
    }

    const cleanedPrefs = {
      safety: typeof preferences.safety === 'number' ? preferences.safety : 0.5,
      cost: typeof preferences.cost === 'number' ? preferences.cost : 0.5,
      development: typeof preferences.development === 'number' ? preferences.development : 0.5,
    };

    const req: RecomendarRequest = {
      countries: countries.map((c: string) => c.toLowerCase()),
      preferences: cleanedPrefs,
      prompt: typeof prompt === 'string' ? prompt.trim() : undefined,
    };

    const result = await getRecommendations(req);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Recomendar API error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
