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
      model: 'mixtral-8x7b-32768',
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
