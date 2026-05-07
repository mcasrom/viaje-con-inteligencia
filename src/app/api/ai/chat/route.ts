import { NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/groq-ai';
import { checkPremium } from '@/lib/premium-check';

const PREMIUM_MODEL = 'llama-3.3-70b-versatile';

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000;

const requestCounts = new Map<string, { count: number; resetAt: number }>();

function getIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetAt: now + RATE_WINDOW_MS };
  }

  entry.count += 1;

  if (entry.count > RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: RATE_LIMIT - entry.count, resetAt: entry.resetAt };
}

export async function POST(request: Request) {
  try {
    const ip = getIp(request);
    const limit = checkRateLimit(ip);

    if (!limit.allowed) {
      const waitSec = Math.ceil((limit.resetAt - Date.now()) / 1000);
      return NextResponse.json({
        error: 'Rate limit exceeded',
        message: `Demasiadas solicitudes. Espera ${waitSec} segundos antes de intentar de nuevo.`,
        retryAfter: waitSec,
      }, { status: 429, headers: { 'Retry-After': String(waitSec) } });
    }

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
