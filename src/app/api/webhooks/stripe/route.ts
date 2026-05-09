import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

const log = createLogger('Stripe');

export const dynamic = 'force-dynamic';

async function getProfileByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, is_premium, subscription_status')
    .eq('email', email)
    .single();
  if (error) { log.error('Error por email', error.message); return null; }
  return data;
}

async function getProfileByCustomerId(customerId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, is_premium, subscription_status')
    .eq('stripe_customer_id', customerId)
    .single();
  if (error) { log.error('Error por customer_id', error.message); return null; }
  return data;
}

export async function POST(request: NextRequest) {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET)
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    log.error('Signature failed', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  log.info(`Event: ${event.type}`);

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const customerEmail = session.customer_details?.email || session.customer_email;
        if (!customerEmail) { log.error('No email en session'); break; }
        const profile = await getProfileByEmail(customerEmail);
        if (!profile) { log.error('No perfil para', customerEmail); break; }
        const { error } = await supabaseAdmin.from('profiles').update({
          subscription_status: 'active',
          is_premium: true,
          trial_end: null,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          updated_at: new Date().toISOString(),
        }).eq('id', profile.id);
        if (error) log.error('Error activando premium', error.message);
        else log.info('Premium activado', customerEmail);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        const profile = await getProfileByCustomerId(sub.customer);
        if (!profile) break;
        await supabaseAdmin.from('profiles').update({
          subscription_status: sub.status,
          is_premium: sub.status === 'active',
          updated_at: new Date().toISOString(),
        }).eq('id', profile.id);
        log.info(`Suscripción: ${sub.status}`, profile.email);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const profile = await getProfileByCustomerId(sub.customer);
        if (!profile) break;
        await supabaseAdmin.from('profiles').update({
          subscription_status: 'canceled',
          is_premium: false,
          updated_at: new Date().toISOString(),
        }).eq('id', profile.id);
        log.info('Cancelado', profile.email);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const profile = await getProfileByCustomerId(invoice.customer);
        if (!profile) break;
        await supabaseAdmin.from('profiles').update({
          subscription_status: 'past_due',
          is_premium: false,
          updated_at: new Date().toISOString(),
        }).eq('id', profile.id);
        log.info('Pago fallido', profile.email);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        if (invoice.billing_reason === 'subscription_create') break;
        const profile = await getProfileByCustomerId(invoice.customer);
        if (!profile) break;
        await supabaseAdmin.from('profiles').update({
          subscription_status: 'active',
          is_premium: true,
          updated_at: new Date().toISOString(),
        }).eq('id', profile.id);
        log.info('Renovación OK', profile.email);
        break;
      }

      default:
        log.info(`Ignorado: ${event.type}`);
    }
  } catch (err: any) {
    log.error('Error procesando evento', err.message);
  }

  return NextResponse.json({ received: true });
}
