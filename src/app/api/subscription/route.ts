import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { priceId, userId } = await req.json();
    
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID required' }, { status: 400 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 });
    }

    const baseUrl = 'https://viaje-con-inteligencia.vercel.app';
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://viaje-con-inteligencia.vercel.app/dashboard?success=true',
      cancel_url: 'https://viaje-con-inteligencia.vercel.app/premium?canceled=true',
      metadata: { userId: userId || 'anonymous' },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: 'Error', details: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    plans: PLANS,
    stripe_configured: !!stripe,
  });
}