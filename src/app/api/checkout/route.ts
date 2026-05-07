import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { priceId, email, trialDays } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Precio no configurado' }, { status: 400 });
    }

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
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.viajeinteligencia.com'}/dashboard?success=true&trial=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.viajeinteligencia.com'}/premium?canceled=true`,
    };

    if (email) {
      sessionConfig.customer_email = email;
    }

    if (trialDays && trialDays > 0) {
      sessionConfig.subscription_data = {
        trial_period_days: trialDays,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Error al procesar' }, { status: 500 });
  }
}
