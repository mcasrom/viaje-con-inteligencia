import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ premium: false, status: 'no_configured' });
  }

  try {
    const { data: { user }, error } = await supabase!.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ premium: false, status: 'no_session' });
    }

    const { data: profile } = await supabase!
      .from('profiles')
      .select('is_premium, subscription_status, trial_end')
      .eq('id', user.id)
      .single();

    const isPremium = profile?.is_premium || profile?.subscription_status === 'active';
    const trialEnd = profile?.trial_end || null;

    return NextResponse.json({
      premium: isPremium,
      status: profile?.subscription_status || 'none',
      trialEnd,
      email: user.email,
    });
  } catch (err) {
    return NextResponse.json({ premium: false, status: 'error' });
  }
}
