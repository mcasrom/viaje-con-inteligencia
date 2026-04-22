import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { subscription, paises_interes } = await request.json();

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Suscripción inválida' }, { status: 400 });
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user_agent: request.headers.get('user-agent') || '',
        paises_interes: paises_interes || [],
        updated_at: new Date().toISOString(),
        active: true,
      }, { onConflict: 'endpoint' });

    if (error) {
      console.error('[push/subscribe] Supabase error:', error);
      return NextResponse.json({ error: 'Error guardando suscripción' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[push/subscribe] Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json();
    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint requerido' }, { status: 400 });
    }

    await supabase
      .from('push_subscriptions')
      .update({ active: false })
      .eq('endpoint', endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[push/subscribe] DELETE error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
