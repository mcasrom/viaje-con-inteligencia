import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function requireAuth(request: NextRequest) {
  const ADMIN_PASSWORD = 'admin';
  const authHeader = request.headers.get('authorization');
  const cookie = request.cookies.get('admin_session')?.value;
  const url = new URL(request.url);
  const queryToken = url.searchParams.get('token');
  const provided = authHeader?.replace('Bearer ', '') || cookie || queryToken || '';
  return ADMIN_PASSWORD && provided === ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [closuresRes, routesRes, tciRes] = await Promise.all([
      supabase.from('airspace_closures').select('*').order('country_name'),
      supabase.from('affected_routes').select('*').order('fuel_surcharge_pct', { ascending: false }),
      supabase.from('tci_history').select('country_code, tci_value, conflict_surcharge, date').order('date', { ascending: true }),
    ]);

    const closures = closuresRes.data || [];
    const routes = routesRes.data || [];
    const tciHistory = tciRes.data || [];

    const activeClosures = closures.filter((c: any) => c.is_active);
    const activeRoutes = routes.filter((r: any) => r.is_active);

    const impactByCountry = activeRoutes.reduce((acc: Record<string, any>, route: any) => {
      if (!acc[route.destination_country]) {
        acc[route.destination_country] = { country: route.destination_country, routes: 0, avgSurcharge: 0, totalTimeExtra: 0 };
      }
      acc[route.destination_country].routes += 1;
      acc[route.destination_country].avgSurcharge += route.fuel_surcharge_pct;
      acc[route.destination_country].totalTimeExtra += route.time_extra_hours;
      return acc;
    }, {});

    Object.values(impactByCountry).forEach((c: any) => {
      c.avgSurcharge = Math.round((c.avgSurcharge / c.routes) * 10) / 10;
      c.totalTimeExtra = Math.round(c.totalTimeExtra * 10) / 10;
    });

    const tciWithConflict = tciHistory.filter((t: any) => t.conflict_surcharge && t.conflict_surcharge > 0);
    const conflictTCITrend = tciWithConflict.map((t: any) => ({
      date: t.date,
      country_code: t.country_code,
      tci_value: t.tci_value,
      conflict_surcharge: t.conflict_surcharge,
    }));

    return NextResponse.json({
      activeClosures: activeClosures.length,
      activeRoutes: activeRoutes.length,
      closures,
      routes,
      impactByCountry: Object.values(impactByCountry),
      conflictTCITrend,
      totalRoutesAffected: activeRoutes.length,
      maxSurcharge: Math.max(...activeRoutes.map((r: any) => r.fuel_surcharge_pct), 0),
      avgSurcharge: activeRoutes.length > 0
        ? Math.round((activeRoutes.reduce((sum: number, r: any) => sum + r.fuel_surcharge_pct, 0) / activeRoutes.length) * 10) / 10
        : 0,
    });
  } catch (error: any) {
    console.error('Airspace impact API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
