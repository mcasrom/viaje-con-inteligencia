'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Globe, Clock } from 'lucide-react';
import { ScraperStatus } from '@/lib/scraper/audit';

interface ScraperStatusDisplayProps {
  compact?: boolean;
}

export default function ScraperStatusDisplay({ compact = false }: ScraperStatusDisplayProps) {
  const [status, setStatus] = useState<ScraperStatus>('healthy');
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [conflictsStatus, setConflictsStatus] = useState<'live' | 'fallback'>('live');
  const [conflictsTimestamp, setConflictsTimestamp] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cronStatus, setCronStatus] = useState<any>(null);

  useEffect(() => {
    fetchAllStatus();
    const interval = setInterval(fetchAllStatus, 60000);
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const fetchAllStatus = async () => {
    try {
      const [scraperRes, conflictsRes, cronRes] = await Promise.all([
        fetch('/api/scraper-status'),
        fetch('/api/conflicts?limit=1'),
        fetch('/api/cron/status'),
      ]);
      
      const scraperData = await scraperRes.json();
      setStatus(scraperData.overall);
      setLastCheck(scraperData.lastCheck ? new Date(scraperData.lastCheck).toLocaleString('es-ES', { 
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
      }) : null);
      
      const conflictsData = await conflictsRes.json();
      setConflictsStatus(conflictsData.status || 'live');
      setConflictsTimestamp(conflictsData.lastRealUpdate || conflictsData.updated || null);
      
      const cronData = await cronRes.json();
      setCronStatus(cronData);
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-5" />;
  }

  const today = currentTime.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  const now = currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

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
        <span className="text-xs text-slate-400 ml-1">
          · {today} {now}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-lg ${cfg.bg} ${cfg.border} border`}>
      <div className="flex items-center gap-2">
        {cfg.icon}
        <span className={`font-medium ${cfg.text}`}>{cfg.label}</span>
      </div>
      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Actualizado: {today} {now}
      </p>
      {conflictsTimestamp && (
        <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
          <Globe className="w-3 h-3" />
          <span>MAEC: {new Date(conflictsTimestamp).toLocaleDateString('es-ES')}</span>
          <span className={`ml-1 px-1 rounded ${conflictsStatus === 'live' ? 'bg-green-500/30 text-green-400' : 'bg-yellow-500/30 text-yellow-400'}`}>
            {conflictsStatus === 'live' ? '● Live' : '⚠ Fallback'}
          </span>
        </div>
      )}
      {cronStatus && (
        <div className="mt-2 pt-2 border-t border-slate-700/50">
          <div className="text-xs text-slate-500 mb-1">Próximo scrape:</div>
          <div className="flex gap-2 text-xs">
            <span className={cronStatus.scrapeMaec?.status === 'healthy' ? 'text-green-400' : 'text-orange-400'}>
              MAEC: {cronStatus.scrapeMaec?.nextRun 
                ? new Date(cronStatus.scrapeMaec.nextRun).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                : 'pendiente'}
            </span>
            <span className={cronStatus.checkAlerts?.status === 'healthy' ? 'text-green-400' : 'text-orange-400'}>
              Alerts: {cronStatus.checkAlerts?.nextRun
                ? new Date(cronStatus.checkAlerts.nextRun).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                : 'pendiente'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}