import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST() {
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
      .select('stripe_subscription_id, email')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_subscription_id) {
      return NextResponse.json({ error: 'No tienes suscripción activa' }, { status: 404 });
    }

    const subscription = await stripe.subscriptions.cancel(profile.stripe_subscription_id, {
      invoice_now: false,
    }) as any;

    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'canceled',
        is_premium: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada',
      endsAt: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
    });
  } catch (err: any) {
    console.error('Cancel subscription error:', err);
    return NextResponse.json({ error: err.message || 'Error al cancelar' }, { status: 500 });
  }
}
