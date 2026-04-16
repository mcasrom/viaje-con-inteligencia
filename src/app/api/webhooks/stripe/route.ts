import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('[Webhook] Missing signature or secret');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe!.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[Webhook] Event type: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('[Webhook] Checkout completed:', session.id);
      console.log('[Webhook] Customer:', session.customer);
      console.log('[Webhook] Subscription:', session.subscription);
      break;

    case 'customer.subscription.created':
      const subscription = event.data.object;
      console.log('[Webhook] Subscription created:', subscription.id);
      console.log('[Webhook] Status:', subscription.status);
      break;

    case 'customer.subscription.updated':
      const updated = event.data.object;
      console.log('[Webhook] Subscription updated:', updated.id);
      console.log('[Webhook] Status:', updated.status);
      break;

    case 'customer.subscription.deleted':
      const deleted = event.data.object;
      console.log('[Webhook] Subscription canceled:', deleted.id);
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('[Webhook] Payment succeeded:', invoice.id);
      break;

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('[Webhook] Payment failed:', failedInvoice.id);
      break;

    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
