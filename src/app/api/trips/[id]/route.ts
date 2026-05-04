import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getAuthenticatedClient(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/sb-[a-z]+-auth-token=([^;]+)/);
  if (match) {
    try {
      const decoded = JSON.parse(decodeURIComponent(match[1]));
      return createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${decoded.access_token}` } },
      });
    } catch { /* invalid cookie */ }
  }

  return null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = await getAuthenticatedClient(request);
  if (!client) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;
  const { data, error } = await client.from('trips').select('*').eq('user_id', user.id).eq('id', id).single();
  if (error || !data) return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404 });

  return NextResponse.json({ trip: data });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = await getAuthenticatedClient(request);
  if (!client) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { data, error } = await client.from('trips').update({ ...body, updated_at: new Date().toISOString() }).eq('user_id', user.id).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ trip: data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = await getAuthenticatedClient(request);
  if (!client) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;
  const { error } = await client.from('trips').delete().eq('user_id', user.id).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
