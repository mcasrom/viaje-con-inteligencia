import { NextResponse } from 'next/server';
import { generateItinerary } from '@/lib/groq-ai';

export async function POST(request: Request) {
  try {
    const { destination, days, interests, budget } = await request.json();

    if (!destination) {
      return NextResponse.json({ error: 'Destination is required' }, { status: 400 });
    }

    const itinerary = await generateItinerary(
      destination,
      days || 7,
      interests || [],
      budget || 'moderado'
    );

    return NextResponse.json({
      destination,
      days: days || 7,
      itinerary,
      model: 'mixtral-8x7b-32768',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Itinerary generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate itinerary' },
      { status: 500 }
    );
  }
}
