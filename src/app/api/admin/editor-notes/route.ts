import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminPassword } from '@/lib/admin-auth';
import { createLogger } from '@/lib/logger';

const log = createLogger('EditorNotesAPI');

function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cookie = request.cookies.get('admin_session')?.value;
  const url = new URL(request.url);
  const queryToken = url.searchParams.get('token');
  const provided = authHeader?.replace('Bearer ', '') || cookie || queryToken || '';
  if (verifyAdminPassword(provided)) return true;
  const IS_DEV = process.env.NODE_ENV !== 'production';
  if (IS_DEV && cookie) return true;
  return false;
}

export async function GET(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!supabase) return NextResponse.json({ notes: [] });

  const month = request.nextUrl.searchParams.get('month');
  let query = supabase.from('editor_notes').select('*').order('month', { ascending: false });

  if (month) {
    query = query.eq('month', month);
  }

  const { data, error } = await query;
  if (error) {
    log.error('Error fetching editor notes', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notes: data || [] });
}

export async function POST(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!supabase) return NextResponse.json({ error: 'No database' }, { status: 500 });

  try {
    const body = await request.json();
    const { title, content, month, tags, author } = body;

    if (!title || !content || !month) {
      return NextResponse.json({ error: 'title, content, and month are required' }, { status: 400 });
    }

    const { data, error } = await supabase.from('editor_notes').insert({
      title,
      content,
      month,
      tags: tags || [],
      author: author || 'Editor',
    }).select().single();

    if (error) {
      log.error('Error creating editor note', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ note: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!supabase) return NextResponse.json({ error: 'No database' }, { status: 500 });

  try {
    const body = await request.json();
    const { id, title, content, month, tags, author, is_published } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (month !== undefined) updates.month = month;
    if (tags !== undefined) updates.tags = tags;
    if (author !== undefined) updates.author = author;
    if (is_published !== undefined) updates.is_published = is_published;

    const { data, error } = await supabase.from('editor_notes').update(updates).eq('id', id).select().single();

    if (error) {
      log.error('Error updating editor note', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ note: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!supabase) return NextResponse.json({ error: 'No database' }, { status: 500 });

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id query param required' }, { status: 400 });
  }

  const { error } = await supabase.from('editor_notes').delete().eq('id', id);
  if (error) {
    log.error('Error deleting editor note', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
