import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const [products, prices, subscriptions, balance] = await Promise.allSettled([
    stripe.products.list({ active: true }),
    stripe.prices.list({ active: true, expand: ['data.product'] }),
    stripe.subscriptions.list({ status: 'all', limit: 50 }),
    stripe.balance.retrieve(),
  ]);

  const result: any = {
    products: products.status === 'fulfilled' ? products.value.data.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      created: new Date(p.created * 1000).toISOString(),
    })) : [],
    prices: prices.status === 'fulfilled' ? prices.value.data.map(p => ({
      id: p.id,
      product: typeof p.product === 'string' ? p.product : (p.product as any)?.name || 'unknown',
      unit_amount: p.unit_amount,
      currency: p.currency,
      interval: p.recurring?.interval,
      created: new Date(p.created * 1000).toISOString(),
    })) : [],
    subscriptions: subscriptions.status === 'fulfilled' ? {
      total: subscriptions.value.data.length,
      active: subscriptions.value.data.filter(s => s.status === 'active').length,
      trialing: subscriptions.value.data.filter(s => s.status === 'trialing').length,
      canceled: subscriptions.value.data.filter(s => s.status === 'canceled').length,
      past_due: subscriptions.value.data.filter(s => s.status === 'past_due').length,
    } : {},
    balance: balance.status === 'fulfilled' ? {
      available: balance.value.available.map(b => ({ currency: b.currency, amount: b.amount / 100 })),
      pending: balance.value.pending.map(b => ({ currency: b.currency, amount: b.amount / 100 })),
    } : {},
  };

  return NextResponse.json(result);
}
