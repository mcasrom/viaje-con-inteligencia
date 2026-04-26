import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ premium: false, status: 'no_session' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, subscription_status, trial_start, trial_end')
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
    console.error('Subscription check error:', err);
    return NextResponse.json({ premium: false, status: 'error' });
  }
}
