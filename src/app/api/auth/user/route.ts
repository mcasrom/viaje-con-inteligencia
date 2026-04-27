import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Si no hay trial_start → iniciar trial de 7 días
    if (profile && !profile.trial_start) {
      const now = new Date().toISOString();
      const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await supabaseAdmin
        .from('profiles')
        .update({ trial_start: now, trial_end: trialEnd })
        .eq('id', user.id);
      profile.trial_start = now;
      profile.trial_end = trialEnd;
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        ...profile,
      }
    });
  } catch (err) {
    console.error('Auth user error:', err);
    return NextResponse.json({ user: null });
  }
}
