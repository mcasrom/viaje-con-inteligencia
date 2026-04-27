import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

async function getProfileByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, is_premium, subscription_status')
    .eq('email', email)
    .single();
  if (error) { console.error('[Webhook] Error por email:', error.message); return null; }
  return data;
}

async function getProfileByCustomerId(customerId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, email, is_premium, subscription_status')
    .eq('stripe_customer_id', customerId)
    .single();
  if (error) { console.error('[Webhook] Error por customer_id:', error.message); return null; }
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
    console.error('[Webhook] Signature failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[Webhook] Event: ${event.type}`);

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const customerEmail = session.customer_details?.email || session.customer_email;
        if (!customerEmail) { console.error('[Webhook] No email en session'); break; }
        const profile = await getProfileByEmail(customerEmail);
        if (!profile) { console.error('[Webhook] No perfil para:', customerEmail); break; }
        const { error } = await supabaseAdmin.from('profiles').update({
          subscription_status: 'active',
          is_premium: true,
          trial_end: null,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          updated_at: new Date().toISOString(),
        }).eq('id', profile.id);
        if (error) console.error('[Webhook] Error activando premium:', error.message);
        else console.log('[Webhook] ✅ Premium activado:', customerEmail);
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
        console.log(`[Webhook] ✅ Suscripción → ${sub.status}:`, profile.email);
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
        console.log('[Webhook] ✅ Cancelado:', profile.email);
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
        console.log('[Webhook] ⚠️ Pago fallido:', profile.email);
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
        console.log('[Webhook] ✅ Renovación OK:', profile.email);
        break;
      }

      default:
        console.log(`[Webhook] Ignorado: ${event.type}`);
    }
  } catch (err: any) {
    console.error('[Webhook] Error procesando evento:', err.message);
  }

  return NextResponse.json({ received: true });
}
