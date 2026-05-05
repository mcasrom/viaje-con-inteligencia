import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, trial_start, trial_end')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    if (profile.trial_end && new Date(profile.trial_end) > new Date()) {
      return NextResponse.json({ 
        error: 'Ya tienes un trial activo', 
        trialEnd: profile.trial_end 
      }, { status: 409 });
    }

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 7);

    await supabaseAdmin
      .from('profiles')
      .update({
        trial_start: now.toISOString(),
        trial_end: trialEnd.toISOString(),
        is_premium: true,
        updated_at: now.toISOString(),
      })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      trialEnd: trialEnd.toISOString(),
      message: 'Trial de 7 días activado',
    });
  } catch (err: any) {
    console.error('Trial activate error:', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
