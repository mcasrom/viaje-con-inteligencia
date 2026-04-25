import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        premium: false, 
        status: 'no_configured',
        message: 'Sistema de suscripciones no configurado' 
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    if (!authHeader) {
      return NextResponse.json({ 
        premium: false, 
        status: 'no_session',
        message: 'No has iniciado sesión' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ 
        premium: false, 
        status: 'invalid_session',
        message: 'Sesión inválida' 
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ 
        premium: false, 
        status: 'no_profile',
        message: 'Perfil no encontrado',
        user: user.id 
      });
    }

    const isPremium = profile.is_premium || profile.subscription_status === 'active';
    const subscriptionStatus = profile.subscription_status || 'none';
    const trialEnd = profile.trial_end;

    return NextResponse.json({
      premium: isPremium,
      status: subscriptionStatus,
      user: user.id,
      email: user.email,
      trialEnd,
      message: isPremium ? 'Acceso premium activo' : 'Acceso premium no activo',
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    return NextResponse.json({ 
      premium: false, 
      status: 'error',
      message: 'Error al verificar suscripción' 
    }, { status: 500 });
  }
}