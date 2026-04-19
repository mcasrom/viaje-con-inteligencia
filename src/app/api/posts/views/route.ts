import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const VIEWS_FILE = path.join(process.cwd(), 'data', 'views.json');

function loadViews(): Record<string, number> {
  try {
    if (fs.existsSync(VIEWS_FILE)) {
      return JSON.parse(fs.readFileSync(VIEWS_FILE, 'utf8'));
    }
  } catch {}
  return {};
}

function saveViews(views: Record<string, number>) {
  const dir = path.dirname(VIEWS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(VIEWS_FILE, JSON.stringify(views, null, 2));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get('slug');
  
  const views = loadViews();
  
  if (slug) {
    return NextResponse.json({ views: views[slug] || 0 });
  }
  
  return NextResponse.json({ views });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { slug } = body;

  if (!slug) {
    return NextResponse.json({ error: 'Slug required' }, { status: 400 });
  }

  const views = loadViews();
  views[slug] = (views[slug] || 0) + 1;
  saveViews(views);

  return NextResponse.json({ views: views[slug] });
}
