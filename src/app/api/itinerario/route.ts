import { NextRequest, NextResponse } from 'next/server';
import { generateItinerary } from '@/lib/groq-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, days, interests, budget } = body;

    if (!destination || !days) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: destination, days' },
        { status: 400 }
      );
    }

    const itinerary = await generateItinerary(
      destination,
      days,
      interests || [],
      budget || 'moderate'
    );

    return NextResponse.json({ itinerary });
  } catch (error) {
    console.error('Itinerary API error:', error);
    return NextResponse.json(
      { error: 'Error al generar itinerario' },
      { status: 500 }
    );
  }
}