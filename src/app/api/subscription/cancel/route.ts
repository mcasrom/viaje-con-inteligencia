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

    const subscription = await stripe.subscriptions.update(profile.stripe_subscription_id, {
      cancel_at_period_end: true,
    }) as any;

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada — seguirás teniendo acceso hasta el final del periodo de facturación',
      endsAt: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: true,
    });
  } catch (err: any) {
    console.error('Cancel subscription error:', err);
    return NextResponse.json({ error: err.message || 'Error al cancelar' }, { status: 500 });
  }
}
