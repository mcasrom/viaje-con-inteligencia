import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
const log = createLogger('AdminPulsoKeywords');

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('pulso_keywords')
    .select('*')
    .order('active', { ascending: false })
    .order('category')
    .order('keyword_es');

  if (error) {
    log.error('Error fetching keywords', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ keywords: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword_es, keyword_en, icon, category, used_in_detection, used_in_display, active } = body;

    if (!keyword_es) {
      return NextResponse.json({ error: 'keyword_es is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('pulso_keywords')
      .insert({
        keyword_es,
        keyword_en: keyword_en || '',
        icon: icon || '⚠️',
        category: category || 'general',
        used_in_detection: used_in_detection ?? true,
        used_in_display: used_in_display ?? true,
        active: active ?? true,
      })
      .select()
      .single();

    if (error) {
      log.error('Insert error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ keyword: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, keyword_es, keyword_en, icon, category, used_in_detection, used_in_display, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (keyword_es !== undefined) updates.keyword_es = keyword_es;
    if (keyword_en !== undefined) updates.keyword_en = keyword_en;
    if (icon !== undefined) updates.icon = icon;
    if (category !== undefined) updates.category = category;
    if (used_in_detection !== undefined) updates.used_in_detection = used_in_detection;
    if (used_in_display !== undefined) updates.used_in_display = used_in_display;
    if (active !== undefined) updates.active = active;

    const { data, error } = await supabaseAdmin
      .from('pulso_keywords')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      log.error('Update error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ keyword: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id param required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('pulso_keywords')
    .delete()
    .eq('id', parseInt(id));

  if (error) {
    log.error('Delete error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
