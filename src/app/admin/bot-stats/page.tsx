'use client';

import { useState } from 'react';

interface BotStats {
  totalUsers?: number;
  recentUsers?: any[];
  commandCounts?: Record<string, number>;
}

export default function BotStatsPage() {
  const [stats, setStats] = useState<BotStats | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bot-stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Estadísticas del Bot</h1>
      
      <button
        onClick={loadStats}
        disabled={loading}
        className="bg-blue-600 px-4 py-2 rounded-lg mb-6"
      >
        {loading ? 'Cargando...' : 'Actualizar'}
      </button>

      {stats && (
        <div className="space-y-4">
          <div className="bg-slate-800 p-4 rounded-lg">
            <p className="text-slate-400">Usuarios totales:</p>
            <p className="text-3xl font-bold">{stats.totalUsers || 0}</p>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg">
            <p className="text-slate-400 mb-2">Comandos:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.commandCounts || {}).map(([cmd, count]) => (
                <span key={cmd} className="bg-slate-700 px-3 py-1 rounded">
                  {cmd}: {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-slate-500 mt-4">
        Nota: Los datos se guardan en Supabase (tablas bot_stats, bot_commands)
      </p>
    </div>
  );
}