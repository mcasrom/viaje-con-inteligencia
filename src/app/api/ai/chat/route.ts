import { NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/groq-ai';
import { checkPremium } from '@/lib/premium-check';

const PREMIUM_MODEL = 'llama-3.1-70b-versatile';

export async function POST(request: Request) {
  try {
    const { message, country, history, model } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const requestedModel = model || 'llama-3.1-8b-instant';
    const isPremiumModel = requestedModel === PREMIUM_MODEL;

    if (isPremiumModel) {
      const check = await checkPremium();
      if (!check.isPremium) {
        return NextResponse.json({
          error: 'Premium required',
          requires: 'premium',
          message: 'El modelo 70b requiere suscripción Premium. Actualiza tu plan para desbloquearlo.',
        }, { status: 403 });
      }
    }

    const response = await chatWithAI(message, {
      country,
      previousMessages: history,
      model: requestedModel,
    });

    return NextResponse.json({
      response,
      model: requestedModel,
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
