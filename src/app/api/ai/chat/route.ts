import { NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/groq-ai';

export async function POST(request: Request) {
  try {
    const { message, country, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const response = await chatWithAI(message, {
      country,
      previousMessages: history,
    });

    return NextResponse.json({
      response,
      model: 'llama-3.1-8b-instant',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat AI error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
