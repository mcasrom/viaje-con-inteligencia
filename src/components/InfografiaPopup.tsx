'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, BarChart3, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const POPUP_SEEN_KEY = 'infografia_popup_seen';

interface LatestInfografia {
  id: string;
  edition: number;
  title: string;
  week_start: string;
  gwi_score: number | null;
  image_url: string | null;
}

function formatDate(d: string) {
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  } catch { return d; }
}

export default function InfografiaPopup() {
  const [latest, setLatest] = useState<LatestInfografia | null>(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const seen = sessionStorage.getItem(POPUP_SEEN_KEY);
    if (seen) return;

    fetch('/api/infografias?latest=true')
      .then(r => r.json())
      .then(data => {
        if (data && data.id) {
          setLatest(data);
          // Only show if published within last 3 days
          const published = new Date(data.published_at);
          const now = new Date();
          const diffDays = (now.getTime() - published.getTime()) / (86400000);
          if (diffDays <= 3) {
            // Delay showing by 3 seconds
            setTimeout(() => {
              setShow(true);
              setDismissed(false);
              sessionStorage.setItem(POPUP_SEEN_KEY, 'true');
            }, 3000);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {show && latest && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 100, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 100, x: 20 }}
          className="fixed bottom-6 right-6 z-[1030] max-w-sm"
        >
          <div className="bg-slate-900 border border-blue-500/30 rounded-xl shadow-2xl shadow-blue-500/10 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/10 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono text-blue-400 font-bold tracking-wider">NUEVA INFOGRAFÍA</span>
              </div>
              <button onClick={handleDismiss} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-white mb-1">{latest.title}</p>
              <p className="text-xs text-slate-400 mb-3">
                {formatDate(latest.week_start)} • GWI: {latest.gwi_score?.toFixed(1) || '—'}
              </p>
              <Link
                href={`/infografias/${latest.id}`}
                onClick={handleDismiss}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ver informe semanal
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
