import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { paisesData } from '@/data/paises';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get('country');
  const userId = searchParams.get('userId');

  // If userId is provided explicitly (from client), use admin client
  if (userId) {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(userId)) {
      return NextResponse.json({ alerts: [], ok: true });
    }
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 });
    }
    const { data: subs, error } = await supabaseAdmin!
      .from('alert_preferences')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const enriched = (subs || []).map((sub: any) => {
      const pais = paisesData[sub.country_code?.toLowerCase()];
      return {
        id: sub.id,
        country_code: sub.country_code,
        country_name: pais?.nombre || sub.country_code,
        country_emoji: pais?.bandera || '',
        nivel_riesgo: pais?.nivelRiesgo || null,
        alert_types: sub.alert_types,
        severity_min: sub.severity_min,
        source: 'web',
        created_at: sub.created_at,
      };
    });

    return NextResponse.json({ alerts: enriched, ok: true });
  }

  // If no country filter, return authenticated user's subscriptions
  if (!country) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: webSubs } = await supabase
        .from('alert_preferences')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Also get Telegram-linked subscriptions via profile
      let tgSubs: any[] = [];
      const { data: profile } = await supabase
        .from('profiles')
        .select('telegram_id, telegram_username')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.telegram_id && isSupabaseAdminConfigured()) {
        const { data: telegramSubs } = await supabaseAdmin!
          .from('alert_preferences')
          .select('*')
          .eq('telegram_chat_id', Number(profile.telegram_id))
          .is('user_id', null)
          .order('created_at', { ascending: false });
        tgSubs = telegramSubs || [];
      }

      const seen = new Set((webSubs || []).map(s => s.country_code));
      const merged = [
        ...(webSubs || []),
        ...tgSubs.filter(s => !seen.has(s.country_code)),
      ];

      const enriched = merged.map((sub: any) => {
        const pais = paisesData[sub.country_code?.toLowerCase()];
        const source = sub.user_id ? 'web' : 'telegram';
        return {
          id: sub.id,
          country_code: sub.country_code,
          country_name: pais?.nombre || sub.country_code,
          country_emoji: pais?.bandera || '',
          nivel_riesgo: pais?.nivelRiesgo || null,
          alert_types: sub.alert_types,
          severity_min: sub.severity_min,
          source,
          created_at: sub.created_at,
        };
      });

      return NextResponse.json({ subscriptions: enriched, ok: true });
    }

    return NextResponse.json({
      message: 'Usa /api/alerts/subscribe?country=ES',
      metodos: ['telegram', 'email']
    });
  }

  const pais = Object.values(paisesData).find(p => p.codigo === country.toLowerCase());

  if (!pais) {
    return NextResponse.json({ error: 'País no encontrado' }, { status: 404 });
  }

  return NextResponse.json({
    country: pais.codigo,
    nombre: pais.nombre,
    nivelRiesgo: pais.nivelRiesgo,
    ultimoInforme: pais.ultimoInforme,
    emoji: pais.bandera
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countryCode, method } = body;

    if (!countryCode) {
      return NextResponse.json({ error: 'Falta countryCode' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await supabase
      .from('alert_preferences')
      .delete()
      .eq('user_id', user.id)
      .eq('country_code', countryCode.toUpperCase());

    const { error } = await supabase.from('alert_preferences').insert({
      user_id: user.id,
      country_code: countryCode.toUpperCase(),
      alert_types: method || ['riesgo', 'clima', 'geopolitico', 'seguridad', 'salud', 'logistico'],
      severity_min: 'medium',
      frequency: 'inmediato'
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Suscrito a alertas de ${countryCode}` });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const countryCode = searchParams.get('countryCode');

    if (!countryCode) {
      return NextResponse.json({ error: 'Falta countryCode' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await supabase
      .from('alert_preferences')
      .delete()
      .eq('user_id', user.id)
      .eq('country_code', countryCode.toUpperCase());

    const { data: profile } = await supabase
      .from('profiles')
      .select('telegram_id')
      .eq('id', user.id)
      .single();

    if (profile?.telegram_id && isSupabaseAdminConfigured()) {
      await supabaseAdmin!
        .from('alert_preferences')
        .delete()
        .eq('telegram_chat_id', Number(profile.telegram_id))
        .eq('country_code', countryCode.toUpperCase());
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}