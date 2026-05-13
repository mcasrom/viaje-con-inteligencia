import { createSupabaseServerClient } from './supabase-server';
import { supabaseAdmin } from './supabase-admin';

export interface PremiumCheck {
  isPremium: boolean;
  status: string;
  userId: string | null;
  email: string | null;
}

export async function checkPremium(): Promise<PremiumCheck> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { isPremium: false, status: 'no_session', userId: null, email: null };
    }

    const isAdmin = user.email === process.env.ADMIN_EMAIL;
    if (isAdmin) {
      return { isPremium: true, status: 'admin', userId: user.id, email: user.email };
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_premium, subscription_status, trial_end')
      .eq('id', user.id)
      .single();

    const isPremium = profile?.is_premium || profile?.subscription_status === 'active';

    if (!isPremium && profile?.trial_end) {
      const trialActive = new Date(profile.trial_end) > new Date();
      if (trialActive) {
        return { isPremium: true, status: 'trialing', userId: user.id, email: user.email || null };
      }
    }

    return {
      isPremium: isPremium || false,
      status: profile?.subscription_status || 'none',
      userId: user.id,
      email: user.email || null,
    };
  } catch {
    return { isPremium: false, status: 'error', userId: null, email: null };
  }
}
