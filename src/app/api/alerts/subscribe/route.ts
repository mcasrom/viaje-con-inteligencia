import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get('country');
  
  if (!country) {
    return NextResponse.json({
      message: 'Usa /api/alerts/subscribe?country=ES',
      metodos: ['telegram', 'email']
    });
  }

  const paisesData = await import('@/data/paises');
  const pais = Object.values(paisesData.paisesData).find(p => p.codigo === country.toLowerCase());
  
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
    const { userId, countryCode, method, telegramId } = body;

    if (!userId || !countryCode) {
      return NextResponse.json({ error: 'Faltan userId o countryCode' }, { status: 400 });
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
    const userId = searchParams.get('userId');
    const countryCode = searchParams.get('countryCode');

    if (!userId || !countryCode) {
      return NextResponse.json({ error: 'Faltan userId o countryCode' }, { status: 400 });
    }

    const { error } = await supabase!.from('alert_preferences')
      .delete()
      .eq('user_id', userId)
      .eq('country_code', countryCode.toUpperCase());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}