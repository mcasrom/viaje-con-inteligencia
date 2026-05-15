import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase-admin';
import { paisesData } from '@/data/paises';

export const dynamic = 'force-dynamic';

function createClientFromRequest(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        },
      },
    }
  );
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get('country');
  const userId = searchParams.get('userId');

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

  if (!country) {
    const supabase = createClientFromRequest(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      if (!isSupabaseAdminConfigured()) {
        return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 });
      }
      const { data: webSubs } = await supabaseAdmin!
        .from('alert_preferences')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      let tgSubs: any[] = [];
      const { data: profile } = await supabaseAdmin!
        .from('profiles')
        .select('telegram_id, telegram_username')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.telegram_id) {
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

      return NextResponse.json({
        subscriptions: enriched,
        ok: true,
        telegram_linked: !!profile?.telegram_id,
        telegram_username: profile?.telegram_username || null,
      });
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

    const supabase = createClientFromRequest(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 });
    }

    const { data: profile } = await supabaseAdmin!
      .from('profiles')
      .select('telegram_id')
      .eq('id', user.id)
      .maybeSingle();

    await supabaseAdmin!
      .from('alert_preferences')
      .delete()
      .eq('user_id', user.id)
      .eq('country_code', countryCode.toUpperCase());

    if (profile?.telegram_id) {
      await supabaseAdmin!
        .from('alert_preferences')
        .delete()
        .eq('telegram_chat_id', Number(profile.telegram_id))
        .eq('country_code', countryCode.toUpperCase())
        .is('user_id', null);
    }

    const insertData: Record<string, any> = {
      user_id: user.id,
      country_code: countryCode.toUpperCase(),
      alert_types: ['riesgo', 'clima', 'geopolitico', 'seguridad', 'salud', 'logistico'],
      severity_min: 'medium',
      frequency: 'inmediato',
    };
    if (profile?.telegram_id) {
      insertData.telegram_chat_id = Number(profile.telegram_id);
    }

    const { error } = await supabaseAdmin!.from('alert_preferences').insert(insertData);

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

    const supabase = createClientFromRequest(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 });
    }

    await supabaseAdmin!
      .from('alert_preferences')
      .delete()
      .eq('user_id', user.id)
      .eq('country_code', countryCode.toUpperCase());

    const { data: profile } = await supabaseAdmin!
      .from('profiles')
      .select('telegram_id')
      .eq('id', user.id)
      .single();

    if (profile?.telegram_id) {
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