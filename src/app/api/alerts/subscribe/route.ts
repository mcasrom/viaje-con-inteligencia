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
      const { data: subscriptions } = await supabase
        .from('alert_preferences')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const enriched = (subscriptions || []).map((sub: any) => {
        const pais = paisesData[sub.country_code?.toLowerCase()];
        return {
          id: sub.id,
          country_code: sub.country_code,
          country_name: pais?.nombre || sub.country_code,
          country_emoji: pais?.bandera || '',
          nivel_riesgo: pais?.nivelRiesgo || null,
          alert_types: sub.alert_types,
          severity_min: sub.severity_min,
          frequency: sub.frequency,
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

    const { error } = await supabase!.from('alert_preferences')
      .delete()
      .eq('user_id', user.id)
      .eq('country_code', countryCode.toUpperCase());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}