import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

interface PromoCode {
  code: string;
  type: 'percent' | 'months' | 'days';
  value: number;
  maxUses: number;
  usedCount: number;
  expiresAt?: string;
  description: string;
  active: boolean;
}

const PROMO_CODES: PromoCode[] = [
  {
    code: 'FREE7',
    type: 'days',
    value: 7,
    maxUses: 100,
    usedCount: 0,
    description: '7 días premium gratis',
    active: true,
  },
  {
    code: 'WELCOME30',
    type: 'days',
    value: 30,
    maxUses: 50,
    usedCount: 0,
    description: '30 días premium para nuevos usuarios',
    active: true,
  },
  {
    code: 'WELCOME60',
    type: 'days',
    value: 60,
    maxUses: 25,
    usedCount: 0,
    description: '60 días premium - Bienvenida',
    active: true,
  },
  {
    code: 'LAUNCH50',
    type: 'percent',
    value: 50,
    maxUses: 200,
    usedCount: 0,
    description: '50% descuento primera suscripción',
    active: true,
    expiresAt: '2026-06-30T00:00:00Z',
  },
];

export async function POST(req: NextRequest) {
  try {
    const { code, email, priceId } = await req.json();

    if (!code || !priceId) {
      return NextResponse.json({ error: 'Código y precio requeridos' }, { status: 400 });
    }

    const promo = PROMO_CODES.find(p => p.code.toUpperCase() === code.toUpperCase());

    if (!promo) {
      return NextResponse.json({ error: 'Código promocional no válido' }, { status: 400 });
    }

    if (!promo.active) {
      return NextResponse.json({ error: 'Código promocional expirado o inactivo' }, { status: 400 });
    }

    if (promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ error: 'Código promocional agotado' }, { status: 400 });
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Código promocional expirado' }, { status: 400 });
    }

    let discount = '';
    let trialDays = 0;

    if (promo.type === 'percent') {
      discount = `${promo.value}%`;
    } else if (promo.type === 'days') {
      trialDays = promo.value;
    }

    if (!stripe) {
      return NextResponse.json({ 
        error: 'Stripe no configurado' 
      }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ 
        price: priceId, 
        quantity: 1 
      }],
      success_url: 'https://viaje-con-inteligencia.vercel.app/dashboard?success=true&trial=true',
      cancel_url: 'https://viaje-con-inteligencia.vercel.app/free-trial?canceled=true',
      metadata: { 
        promoCode: promo.code,
        discount: discount || 'trial',
        trialDays: trialDays.toString(),
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ 
      url: session.url,
      promo: {
        code: promo.code,
        description: promo.description,
        discount,
        trialDays,
      }
    });
  } catch (error) {
    console.error('Promo code error:', error);
    return NextResponse.json({ error: 'Error al procesar código' }, { status: 500 });
  }
}

export async function GET() {
  const activeCodes = PROMO_CODES
    .filter(p => p.active && p.usedCount < p.maxUses)
    .map(p => ({
      code: p.code,
      description: p.description,
      type: p.type,
      value: p.value,
      remaining: p.maxUses - p.usedCount,
    }));

  return NextResponse.json({
    codes: activeCodes,
    stripe_configured: !!stripe,
  });
}