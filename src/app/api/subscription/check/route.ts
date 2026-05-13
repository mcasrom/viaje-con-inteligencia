import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ premium: false, status: 'no_session' });
    }

    if (user.email === process.env.ADMIN_EMAIL) {
      return NextResponse.json({ premium: true, status: 'admin', trialEnd: null, email: user.email ?? null });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const isPremium = profile?.is_premium || profile?.subscription_status === 'active';
    const trialEnd = profile?.trial_end || null;
    const isTrialActive = trialEnd && new Date(trialEnd) > new Date();

    // Calcular status real: trial activo siempre tiene prioridad
    let status = isTrialActive ? 'trialing' : (profile?.subscription_status || 'none');
    if (!isTrialActive && trialEnd) status = 'trial_expired';

    return NextResponse.json({
      premium: isPremium,
      status,
      trialEnd,
      email: user.email,
    });
  } catch (err) {
    return NextResponse.json({ premium: false, status: 'error' });
  }
}
