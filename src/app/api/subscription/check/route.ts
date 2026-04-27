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

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const isPremium = profile?.is_premium || profile?.subscription_status === 'active';
    const trialEnd = profile?.trial_end || null;

    // Calcular status real
    let status = profile?.subscription_status || 'none';
    if (!isPremium && trialEnd) {
      const isTrialActive = new Date(trialEnd) > new Date();
      status = isTrialActive ? 'trialing' : 'trial_expired';
    }

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
