import { NextResponse } from 'next/server';
import { analyzeRisk } from '@/lib/groq-ai';

export async function POST(request: Request) {
  try {
    const { country, recentEvents } = await request.json();

    if (!country) {
      return NextResponse.json({ error: 'Country is required' }, { status: 400 });
    }

    const analysis = await analyzeRisk(country, recentEvents || []);

    return NextResponse.json({
      country,
      analysis,
      model: 'mixtral-8x7b-32768',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Risk analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze risk' },
      { status: 500 }
    );
  }
}
