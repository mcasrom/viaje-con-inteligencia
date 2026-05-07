import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, email, subscription_status, stripe_subscription_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ invoices: [], subscription: null });
    }

    const [invoices, subscription] = await Promise.all([
      stripe.invoices.list({
        customer: profile.stripe_customer_id,
        limit: 20,
      }),
      profile.stripe_subscription_id
        ? stripe.subscriptions.retrieve(profile.stripe_subscription_id)
        : Promise.resolve(null),
    ]);

    const formattedInvoices = invoices.data.map(inv => {
      const i = inv as any;
      return {
        id: inv.id,
        date: new Date(inv.created * 1000).toISOString(),
        amount: (inv.amount_paid || inv.total) / 100,
        currency: inv.currency,
        status: inv.status,
        hosted_invoice_url: inv.hosted_invoice_url,
        invoice_pdf: inv.invoice_pdf,
        description: inv.lines?.data[0]?.description || 'Suscripcion Premium',
        period_start: inv.lines?.data[0]?.period?.start
          ? new Date(inv.lines.data[0].period.start * 1000).toISOString()
          : null,
        period_end: inv.lines?.data[0]?.period?.end
          ? new Date(inv.lines.data[0].period.end * 1000).toISOString()
          : null,
      };
    });

    let formattedSubscription = null;
    if (subscription) {
      const sub = subscription as any;
      formattedSubscription = {
        status: subscription.status,
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        plan: subscription.items?.data[0]?.plan,
      };
    }

    return NextResponse.json({
      invoices: formattedInvoices,
      subscription: formattedSubscription,
      profile_status: profile.subscription_status,
    });
  } catch (err: any) {
    console.error('Billing history error:', err);
    return NextResponse.json({ error: err.message || 'Error al obtener facturas' }, { status: 500 });
  }
}
