import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { paisesData } from '@/data/paises';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get('country');

  // If user is authenticated and no country filter, return their subscriptions
  if (!country) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // 1. Get subscriptions linked to web user_id
      const { data: webSubs } = await supabase
        .from('alert_preferences')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // 2. Also get subscriptions linked via Telegram
      let tgSubs: any[] = [];
      const { data: profile } = await supabase
        .from('profiles')
        .select('telegram_id, telegram_username')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        // Try linking by telegram_id
        if (profile.telegram_id) {
          const { data: telegramSubs } = await supabase
            .from('alert_preferences')
            .select('*')
            .eq('telegram_chat_id', Number(profile.telegram_id))
            .is('user_id', null)
            .order('created_at', { ascending: false });
          tgSubs = telegramSubs || [];
        }

        // Also try linking by telegram_username match
        if (tgSubs.length === 0 && profile.telegram_username) {
          const { data: usernameSubs } = await supabase
            .from('alert_preferences')
            .select('*')
            .eq('telegram_username', profile.telegram_username)
            .is('user_id', null)
            .order('created_at', { ascending: false });
          tgSubs = usernameSubs || [];
        }
      }

      // 2b. Fallback: if user has no linked TG profile, try matching by email prefix as telegram_username
      if (tgSubs.length === 0 && user.email) {
        const tgName = user.email.split('@')[0];
        const { data: emailSubs } = await supabase
          .from('alert_preferences')
          .select('*')
          .eq('telegram_username', tgName)
          .is('user_id', null)
          .order('created_at', { ascending: false });
        tgSubs = emailSubs || [];
      }

      // 2c. Last fallback: show ALL telegram subscriptions with a warning
      if (tgSubs.length === 0) {
        const { data: anyTgSubs } = await supabase
          .from('alert_preferences')
          .select('*')
          .is('user_id', null)
          .not('telegram_chat_id', 'is', null)
          .order('created_at', { ascending: false })
          .limit(5);
        tgSubs = (anyTgSubs || []).map((s: any) => ({
          ...s,
          _unlinked: true,
        }));
      }

      // 3. Merge: web subs first, then tg subs not already present
      const seen = new Set((webSubs || []).map(s => s.country_code));
      const merged = [
        ...(webSubs || []),
        ...tgSubs.filter(s => !seen.has(s.country_code)),
      ];

      const enriched = merged.map((sub: any) => {
        const pais = paisesData[sub.country_code?.toLowerCase()];
        const source = sub.user_id ? 'web' : sub._unlinked ? 'telegram-no-vinculado' : 'telegram';
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

      return NextResponse.json({ subscriptions: enriched });
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
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ 
      error: 'Supabase no configurado',
      setup_needed: true 
    }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { countryCode, method, telegramId } = body;

    if (!countryCode) {
      return NextResponse.json({ error: 'Falta countryCode' }, { status: 400 });
    }

    const { data: { user } } = await supabase!.auth.getUser();
    const userId = user?.id || body.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Falta userId o sesión' }, { status: 400 });
    }

    // Delete existing preference for this user+country if any, then insert
    await supabase!.from('alert_preferences')
      .delete()
      .eq('user_id', userId)
      .eq('country_code', countryCode.toUpperCase());

    const { error } = await supabase!.from('alert_preferences').insert({
      user_id: userId,
      country_code: countryCode.toUpperCase(),
      alert_types: method || ['riesgo', 'clima', 'geopolitico', 'seguridad', 'salud', 'logistico'],
      severity_min: 'medium',
      frequency: 'inmediato'
    });

    if (error) {
      console.error('Subscribe error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Suscrito a alertas de ${countryCode}`
    });
  } catch (error) {
    console.error('Alerts subscribe error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const countryCode = searchParams.get('countryCode');

    if (!countryCode) {
      return NextResponse.json({ error: 'Falta countryCode' }, { status: 400 });
    }

    const { data: { user } } = await supabase!.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Delete both web and Telegram-linked subscriptions for this country
    await supabase!.from('alert_preferences')
      .delete()
      .eq('user_id', user.id)
      .eq('country_code', countryCode.toUpperCase());

    const { data: profile } = await supabase!
      .from('profiles')
      .select('telegram_id')
      .eq('id', user.id)
      .single();

    if (profile?.telegram_id) {
      await supabase!.from('alert_preferences')
        .delete()
        .eq('telegram_chat_id', Number(profile.telegram_id))
        .eq('country_code', countryCode.toUpperCase());
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}