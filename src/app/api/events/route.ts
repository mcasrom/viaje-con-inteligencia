import { NextRequest, NextResponse } from 'next/server';
import { getEvents, getUpcomingEvents, getEventCategories } from '@/lib/events-fetch';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') || undefined;
    const category = searchParams.get('category') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const upcoming = searchParams.get('upcoming');
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const categories = searchParams.get('categories') === 'true';

    if (categories) {
      const cats = await getEventCategories();
      return NextResponse.json(cats);
    }

    if (upcoming === 'true') {
      const result = await getUpcomingEvents(country, days);
      return NextResponse.json(result);
    }

    const result = await getEvents({ country, category, startDate, endDate, limit, offset });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error interno' },
      { status: 500 }
    );
  }
}
