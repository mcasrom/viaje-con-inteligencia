import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const admin = supabaseAdmin;
    if (!admin) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });
    }

    const { data, error } = await admin.from('score_weights').select('*').order('profile');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ weights: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = supabaseAdmin;
    if (!admin) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });
    }

    const body = await request.json();
    const { profile, riesgo, season, coste, perfil } = body;

    if (!profile || riesgo == null || season == null || coste == null || perfil == null) {
      return NextResponse.json({ error: 'Faltan campos: profile, riesgo, season, coste, perfil' }, { status: 400 });
    }

    const total = riesgo + season + coste + perfil;
    if (Math.abs(total - 1) > 0.01) {
      return NextResponse.json({ error: 'Los pesos deben sumar 1 (actual: ' + total.toFixed(2) + ')' }, { status: 400 });
    }

    const { error } = await admin.from('score_weights').upsert({
      profile,
      riesgo,
      season,
      coste,
      perfil,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'profile' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
