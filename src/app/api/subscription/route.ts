import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const { priceId, userId } = await request.json();
  console.log('Subscription request, priceId:', priceId);
  
  if (!priceId) {
    return NextResponse.json({ error: 'Price ID required' }, { status: 400 });
  }

  if (!stripe) {
    console.log('Stripe not configured');
    return NextResponse.json({ error: 'Stripe not configured', setup_needed: true }, { status: 500 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/premium?canceled=true`,
      metadata: { userId: userId || 'anonymous' },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Subscription failed', details: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    plans: Object.entries(PLANS).map(([key, plan]) => ({ id: key, ...plan })),
    features: [
      { name: 'Bot IA conversacional', premium: true },
      { name: 'Alertas tiempo real', premium: true },
      { name: 'Checklist completo', premium: true },
      { name: 'Itinerario IA', premium: true },
      { name: 'Análisis gastos', premium: true },
      { name: 'Mapa riesgos básico', premium: false },
      { name: 'Info embajadas', premium: false },
    ],
    stripe_configured: !!process.env.STRIPE_SECRET_KEY,
  });
}