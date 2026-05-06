'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { AlertTriangle, X } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface OsintAlertsBannerProps {
  countryName: string;
}

export default function OsintAlertsBanner({ countryName }: OsintAlertsBannerProps) {
  const [signals, setSignals] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!countryName || dismissed) return;

    const supabase = createBrowserClient(supabaseUrl, supabaseKey);

    supabase
      .from('osint_signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (!data) return;
        const relevant = data.filter((s: any) => {
          const text = `${s.location_name || ''} ${s.summary || ''}`.toLowerCase();
          return text.includes(countryName.toLowerCase());
        });
        if (relevant.length > 0) {
          setSignals(relevant);
        }
      });
  }, [countryName, dismissed]);

  if (signals.length === 0 || dismissed) return null;

  const urgencyColors: Record<string, string> = {
    critical: 'border-red-500 bg-red-500/10 text-red-200',
    high: 'border-orange-500 bg-orange-500/10 text-orange-200',
    medium: 'border-yellow-500 bg-yellow-500/10 text-yellow-200',
    low: 'border-blue-500 bg-blue-500/10 text-blue-200',
  };

  return (
    <div className="mb-6 relative">
      <div className={`rounded-xl p-4 border-l-4 ${urgencyColors['medium'] || urgencyColors['low']}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-base mb-1">⚠️ Sensores OSINT detectados</h3>
              <p className="text-sm opacity-90 mb-3">
                Hemos detectado {signals.length} señal(es) reciente(s) relacionadas con <strong>{countryName}</strong> desde redes sociales.
              </p>
              <div className="space-y-2">
                {signals.slice(0, 3).map((s, i) => (
                  <div key={i} className="text-sm bg-black/20 p-2 rounded">
                    <span className="opacity-75 font-medium uppercase text-xs mr-2">
                      [{s.urgency}]
                    </span>
                    {s.summary}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="p-1 hover:bg-white/10 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
