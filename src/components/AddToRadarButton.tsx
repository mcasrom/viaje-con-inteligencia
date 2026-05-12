'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Radar, Loader2, CheckCircle, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  countryCode: string;
  countryName: string;
}

export default function AddToRadarButton({ countryCode, countryName }: Props) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading || !user) { setLoading(false); return; }
    fetch('/api/user/watchlist')
      .then(r => r.json())
      .then(d => {
        const found = (d.watchlist || []).some((w: any) => w.country_code === countryCode);
        setInWatchlist(found);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, countryCode]);

  const handleClick = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (inWatchlist) {
        router.push('/dashboard/radar');
      } else {
        const res = await fetch('/api/user/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country_code: countryCode }),
        });
        if (res.ok) {
          setInWatchlist(true);
        }
      }
    } catch {} finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saving}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        inWatchlist
          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
          : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
      }`}
      title={inWatchlist ? 'Ver Mi Radar de Viaje' : `Añadir ${countryName} a Mi Radar`}
    >
      {saving ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : inWatchlist ? (
        <>
          <CheckCircle className="w-5 h-5" />
          <span>En tu Radar</span>
        </>
      ) : (
        <>
          <Radar className="w-5 h-5" />
          <span>Mi Radar</span>
        </>
      )}
    </button>
  );
}
