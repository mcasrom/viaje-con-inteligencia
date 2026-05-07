import { NextResponse } from 'next/server';
import { checkPremium } from '@/lib/premium-check';
import { compareCountries, CountryComparisonData } from '@/lib/groq-ai';

export async function POST(request: Request) {
  try {
    const premium = await checkPremium();
    if (!premium.isPremium) {
      return NextResponse.json({ error: 'Se requiere suscripción Premium', requires: 'premium' }, { status: 403 });
    }

    const { countries } = await request.json();

    if (!countries || !Array.isArray(countries) || countries.length < 2) {
      return NextResponse.json(
        { error: 'Se requieren al menos 2 países para comparar' },
        { status: 400 }
      );
    }

    if (countries.length > 3) {
      return NextResponse.json(
        { error: 'Máximo 3 países permitidos' },
        { status: 400 }
      );
    }

    const result = await compareCountries(countries as CountryComparisonData[]);

    return NextResponse.json({
      comparison: result,
      model: 'llama-3.1-8b-instant',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Compare AI error:', error);
    return NextResponse.json(
      { error: 'Error al comparar países' },
      { status: 500 }
    );
  }
}