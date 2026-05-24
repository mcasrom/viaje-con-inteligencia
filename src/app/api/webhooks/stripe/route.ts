import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateApiKey, hashApiKey } from '@/lib/api-auth';

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

async function provisionApiProKey(email: string, maxRequests = 10000) {
  const planName = maxRequests >= 50000 ? 'Enterprise' : maxRequests >= 10000 ? 'Pro' : 'Starter';
  const planLabel = planName;

  const { data: existing } = await supabaseAdmin
    .from('api_keys')
    .select('id, tier')
    .ilike('name', `%${email}%`)
    .limit(1);

  const keyData = existing && existing.length > 0 ? existing[0] : null;

  if (keyData) {
    if (keyData.tier === planName.toLowerCase()) {
      log.info(`API ${planLabel}: ${email} ya es ${planName}`);
      return true;
    }
    const { error } = await supabaseAdmin
      .from('api_keys')
      .update({ tier: planName.toLowerCase(), monthly_limit: maxRequests })
      .eq('id', keyData.id);
    if (error) { log.error('Error upgrade key', error.message); return false; }
    log.info(`API ${planLabel}: key ${keyData.id} upgrade to ${planName} for ${email}`);
    return true;
  }

  const { key, prefix, hash } = generateApiKey(`API ${planName}`);
  const { error } = await supabaseAdmin.from('api_keys').insert({
    name: `${planName} - ${email}`,
    key_hash: hash,
    key_prefix: prefix,
    tier: planName.toLowerCase(),
    monthly_limit: maxRequests,
  });

  if (error) { log.error('Error create key', error.message); return false; }
  log.info(`API ${planLabel}: new key created for ${email}`);

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Viaje Inteligente API <api@viajeinteligencia.com>',
      to: email,
      subject: `Tu API Key ${planName} — Viaje Inteligente`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#3b82f6;">API Key ${planName} activada ✅</h2>
        <p>Gracias por suscribirte al plan ${planName}.</p>
        <p>Tu API Key es:</p>
        <pre style="background:#1e293b;color:#fbbf24;padding:16px;border-radius:8px;font-size:14px;">${key}</pre>
        <p style="color:#64748b;font-size:13px;">Guárdala. Solo la verás una vez por email.</p>
        <hr style="border-color:#334155;margin:24px 0;">
        <p style="font-size:13px;color:#94a3b8;">
          Documentación: <a href="https://www.viajeinteligencia.com/api-endpoints" style="color:#3b82f6;">viajeinteligencia.com/api-endpoints</a><br>
          Límite: ${maxRequests.toLocaleString()} requests/mes<br>
          Soporte: <a href="mailto:info@viajeinteligencia.com" style="color:#3b82f6;">info@viajeinteligencia.com</a>
        </p>
      </div>`,
    });
    log.info(`API ${planLabel}: email sent to ${email}`);
  } catch (e: any) {
    log.error(`API ${planLabel}: email failed for ${email}`, e.message);
  }

  return true;
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

        if (session.metadata?.type === 'api_pro' || session.metadata?.type === 'api_starter') {
          const planLabel = session.metadata?.type === 'api_starter' ? 'Starter' : 'Pro';
          const maxRequests = session.metadata?.type === 'api_starter' ? 1000 : 10000;
          const ok = await provisionApiProKey(customerEmail, maxRequests);
          if (ok) log.info(`API ${planLabel} activado: ${customerEmail}`);
          else log.error(`API ${planLabel} falló: ${customerEmail}`);
          break;
        }

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
