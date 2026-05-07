import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function generateAPIKey(): string {
  return `vci_${crypto.randomBytes(24).toString('hex')}`;
}

export async function POST(request: NextRequest) {
  const cookie = request.cookies.get('admin_session')?.value;
  if (cookie !== '1') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const key = generateAPIKey();
    const { data, error } = await supabaseAdmin.from('api_keys').insert({
      name,
      key,
      active: true,
      rate_limit: 100,
    }).select('id, name, key, rate_limit, created_at').single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ key: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ keys: data });
}

export async function PATCH(request: NextRequest) {
  const cookie = request.cookies.get('admin_session')?.value;
  if (cookie !== '1') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, active, rate_limit } = await request.json();
    const updates: Record<string, any> = {};
    if (active !== undefined) updates.active = active;
    if (rate_limit !== undefined) updates.rate_limit = rate_limit;

    const { error } = await supabaseAdmin.from('api_keys').update(updates).eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
