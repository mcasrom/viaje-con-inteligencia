'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { ScraperStatus } from '@/lib/scraper/audit';

interface ScraperStatusDisplayProps {
  compact?: boolean;
}

export default function ScraperStatusDisplay({ compact = false }: ScraperStatusDisplayProps) {
  const [status, setStatus] = useState<ScraperStatus>('healthy');
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/scraper-status');
      const data = await res.json();
      setStatus(data.overall);
      setLastCheck(data.lastCheck ? new Date(data.lastCheck).toLocaleString('es-ES') : null);
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span className="text-sm">Verificando...</span>
      </div>
    );
  }

  const config = {
    healthy: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      border: 'border-green-500/30',
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'Sistema OK',
    },
    warning: {
      bg: 'bg-orange-500/20',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      icon: <AlertTriangle className="w-4 h-4" />,
      label: 'Advertencia',
    },
    error: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/30',
      icon: <XCircle className="w-4 h-4" />,
      label: 'Error detectado',
    },
  };

  const cfg = config[status];

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${cfg.bg} ${cfg.border} border`}>
        {cfg.icon}
        <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-lg ${cfg.bg} ${cfg.border} border`}>
      <div className="flex items-center gap-2">
        {cfg.icon}
        <span className={`font-medium ${cfg.text}`}>{cfg.label}</span>
      </div>
      {lastCheck && (
        <p className="text-xs text-slate-400 mt-1">
          Última verificación: {lastCheck}</p>
      )}
    </div>
  );
}