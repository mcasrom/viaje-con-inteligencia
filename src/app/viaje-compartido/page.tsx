import { Suspense } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import SharedTripClient from './SharedTripClient';

export const dynamic = 'force-dynamic';

export default async function SharedTripPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Enlace inválido</h1>
          <p className="text-slate-400">No se encontró un token de viaje compartido.</p>
        </div>
      </div>
    );
  }

  // Fetch shared trip data server-side
  let sharedTrip = null;
  let tripData = null;
  let ownerData = null;

  try {
    const { data: shareData } = await supabaseAdmin
      .from('shared_trips')
      .select('*, trips(*)')
      .eq('share_token', token)
      .eq('is_active', true)
      .single();

    if (shareData && shareData.trips) {
      sharedTrip = shareData;
      tripData = shareData.trips;

      // Get owner info
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('username, email')
        .eq('id', shareData.user_id)
        .single();
      ownerData = profile;

      // Increment views
      await supabaseAdmin
        .from('shared_trips')
        .update({ views: (shareData.views || 0) + 1 })
        .eq('id', shareData.id);
    }
  } catch (error) {
    console.error('Error fetching shared trip:', error);
  }

  return (
    <Suspense>
      <SharedTripClient
        token={token}
        sharedTrip={sharedTrip}
        tripData={tripData}
        ownerData={ownerData}
      />
    </Suspense>
  );
}
