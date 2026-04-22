import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-api-key');
    if (authHeader !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { title, body, url, pais_codigo } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'title y body requeridos' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('active', true);

    if (pais_codigo) {
      query = query.contains('paises_interes', [pais_codigo]);
    }

    const { data: suscriptores, error } = await query;

    if (error) {
      console.error('[push/send] Supabase error:', error);
      return NextResponse.json({ error: 'Error leyendo suscriptores' }, { status: 500 });
    }

    if (!suscriptores || suscriptores.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'Sin suscriptores' });
    }

    if (!process.env.VAPID_EMAIL || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return NextResponse.json({ error: 'WebPush no configurado' }, { status: 503 });
    }

    const webpush = (await import('web-push')).default;
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const payload = JSON.stringify({
      title,
      body,
      url: url || 'https://www.viajeinteligencia.com',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    });

    let sent = 0;
    let failed = 0;

    for (const sub of suscriptores) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
        sent++;
      } catch (err: any) {
        failed++;
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .update({ active: false })
            .eq('endpoint', sub.endpoint);
        }
      }
    }

    return NextResponse.json({ success: true, sent, failed, total: suscriptores.length });

  } catch (error) {
    console.error('[push/send] Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}