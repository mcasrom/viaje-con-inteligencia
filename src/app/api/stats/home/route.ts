import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
export const revalidate = 3600;
export async function GET() {
  try {
    const [subsRes, alertsRes, lastAlertRes] = await Promise.all([
      supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
      supabase.from('risk_alerts').select('id', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]),
      supabase.from('risk_alerts').select('created_at').order('created_at', { ascending: false }).limit(1).single(),
    ]);
    const lastUpdate = lastAlertRes.data?.created_at ? new Date(lastAlertRes.data.created_at) : new Date();
    const diffMs = Date.now() - lastUpdate.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    const diffM = Math.floor(diffMs / 60000);
    const updatedAgo = diffH > 0 ? `hace ${diffH}h` : `hace ${diffM}min`;
    return NextResponse.json({ subscribers: subsRes.count || 0, alertsToday: alertsRes.count || 0, updatedAgo });
  } catch {
    return NextResponse.json({ subscribers: 0, alertsToday: 0, updatedAgo: 'hoy' });
  }
}
