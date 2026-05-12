import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { generateTripSlug } from '@/lib/slug';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;
  const { data, error } = await supabase.from('trips').select('*').eq('user_id', user.id).eq('id', id).single();
  if (error || !data) return NextResponse.json({ error: 'Viaje no encontrado' }, { status: 404 });

  return NextResponse.json({ trip: data });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  if (body.is_public === true) {
    const { data: current } = await supabase.from('trips').select('name, destination, slug').eq('user_id', user.id).eq('id', id).single();
    if (current && !current.slug) {
      body.slug = generateTripSlug(current.name, current.destination);
      let attempts = 0;
      while (attempts < 10) {
        const { data: existing } = await supabase.from('trips').select('id').eq('slug', body.slug).neq('id', id).maybeSingle();
        if (!existing) break;
        attempts++;
        body.slug = `${generateTripSlug(current.name, current.destination)}-${attempts}`;
      }
    }
  }

  const { data, error } = await supabase.from('trips').update({ ...body, updated_at: new Date().toISOString() }).eq('user_id', user.id).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ trip: data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { id } = await params;
  const { error } = await supabase.from('trips').delete().eq('user_id', user.id).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
