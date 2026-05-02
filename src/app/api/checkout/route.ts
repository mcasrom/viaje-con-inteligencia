import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

const PROMO_CODES: Record<string, { 
  type: 'trial' | 'percent';
  value: number;
  description: string;
}> = {
  'FREE7': { type: 'trial', value: 7, description: '7 días premium gratis' },
  'WELCOME30': { type: 'trial', value: 30, description: '30 días premium' },
  'WELCOME60': { type: 'trial', value: 60, description: '60 días premium' },
  'LAUNCH50': { type: 'percent', value: 50, description: '50% descuento' },
};

export async function POST(req: NextRequest) {
  try {
    const { priceId, promoCode, email } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Precio no configurado' }, { status: 400 });
    }

    if (!promoCode || !PROMO_CODES[promoCode.toUpperCase()]) {
      return NextResponse.json({ error: 'Código promocional inválido' }, { status: 400 });
    }

    const promo = PROMO_CODES[promoCode.toUpperCase()];

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 });
    }

    const sessionConfig: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ 
        price: priceId, 
        quantity: 1 
      }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.viajeinteligencia.com'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.viajeinteligencia.com'}/free-trial?canceled=true`,
      metadata: { 
        promoCode: promoCode.toUpperCase(),
        promoDescription: promo.description,
      },
      allow_promotion_codes: true,
    };

    if (email) {
      sessionConfig.customer_email = email;
    }

    if (promo.type === 'trial' && promo.value > 0) {
      sessionConfig.subscription_data = {
        trial_period_days: promo.value,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Error al procesar' }, { status: 500 });
  }
}