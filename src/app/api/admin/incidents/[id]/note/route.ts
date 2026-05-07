import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'DB not configured' }, { status: 500 });
  }

  const { id } = await params;
  const incidentId = parseInt(id);
  if (!incidentId || isNaN(incidentId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const body = await request.json();
  const { note } = body;

  if (note === undefined) {
    return NextResponse.json({ error: 'note field required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('incidents')
    .update({
      analyst_note: note || null,
      analyst_updated_at: new Date().toISOString(),
    })
    .eq('id', incidentId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, incident: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'DB not configured' }, { status: 500 });
  }

  const { id } = await params;
  const incidentId = parseInt(id);
  if (!incidentId || isNaN(incidentId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('incidents')
    .update({ analyst_note: null, analyst_updated_at: null })
    .eq('id', incidentId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
