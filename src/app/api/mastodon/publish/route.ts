import { NextRequest, NextResponse } from 'next/server';

const MASTODON_URL = 'mastodon.social';

function getToken(): string | undefined {
  return process.env.MASTODON_ACCESS_TOKEN;
}

export async function GET() {
  const token = getToken();
  return NextResponse.json({
    status: 'ok',
    tokenConfigured: !!token,
    endpoint: 'POST with { text: "message" } to publish',
  });
}

export async function POST(request: NextRequest) {
  const token = getToken();
  
  if (!token) {
    return NextResponse.json({ 
      error: 'MASTODON_ACCESS_TOKEN not configured',
      setup: 'Add MASTODON_ACCESS_TOKEN to Vercel Environment Variables'
    }, { status: 500 });
  }

  try {
    const { text, visibility = 'public' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const response = await fetch(`https://${MASTODON_URL}/api/v1/statuses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: text, visibility }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: 'Mastodon error', details: error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, id: data.id, url: data.url });
  } catch (error) {
    console.error('Mastodon error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}