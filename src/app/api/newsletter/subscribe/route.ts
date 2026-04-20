import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, name, source } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
    }

    const verifyToken = crypto.randomUUID();
    
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        { email, name, verify_token: verifyToken, source: source || 'web' },
        { onConflict: 'email' }
      );

    if (error) {
      console.error('Newsletter subscribe error:', error);
      return NextResponse.json({ error: 'Error al suscribir' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Te has suscrito correctamente' 
    });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const action = searchParams.get('action');

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  if (action === 'verify' && token) {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ verified: true, verify_token: null })
      .eq('verify_token', token);

    if (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
    }

    return NextResponse.redirect(new URL('/?newsletter=verified', request.url));
  }

  if (action === 'unsubscribe' && token) {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ verified: false, unsubscribed_at: new Date().toISOString() })
      .eq('verify_token', token);

    if (error) {
      return NextResponse.json({ error: 'Error al cancelar' }, { status: 400 });
    }

    return NextResponse.redirect(new URL('/?newsletter=unsubscribed', request.url));
  }

  return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
}