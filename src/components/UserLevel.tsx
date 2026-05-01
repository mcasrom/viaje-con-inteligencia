'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, TrendingUp, Award } from 'lucide-react';

interface UserLevelData {
  total_points: number;
  level_name: string;
  level_icon: string;
  next_level_points: number;
  progress_percent: number;
}

const LEVEL_CONFIG: Record<string, { color: string; bg: string; perks: string[] }> = {
  Explorador: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    perks: ['Acceso a rutas básicas', 'Guardar favoritos'],
  },
  Guía: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    perks: ['PDF con mapa detallado', 'Rutas ilimitadas', 'Exportar itinerarios'],
  },
  Oráculo: {
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    perks: ['Todas las perks Guía', 'Recomendaciones IA prioritarias', 'Acceso anticipado a features'],
  },
};

const POINTS_REWARD: Record<string, { points: number; label: string }> = {
  login: { points: 1, label: 'Iniciar sesión' },
  generate_route: { points: 10, label: 'Generar ruta' },
  share_route: { points: 5, label: 'Compartir ruta' },
  add_favorite: { points: 3, label: 'Añadir favorito' },
  view_country: { points: 2, label: 'Explorar país' },
  export_pdf: { points: 8, label: 'Exportar PDF' },
};

function trackActivity(action: string, metadata: Record<string, any> = {}) {
  if (!supabase) return;

  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) return;

    supabase.from('user_activity').insert({
      user_id: user.id,
      action,
      points: POINTS_REWARD[action]?.points || 1,
      metadata,
    });
  });
}

export function UserLevelBadge({ compact = false }: { compact?: boolean }) {
  const [levelData, setLevelData] = useState<UserLevelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const fetchLevel = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('get_user_level', { p_user_id: user.id });
      if (!error && data) {
        setLevelData(data as UserLevelData);
      }
      setLoading(false);
    };

    fetchLevel();
  }, []);

  if (loading || !levelData) return null;

  const config = LEVEL_CONFIG[levelData.level_name] || LEVEL_CONFIG['Explorador'];

  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${config.color}`}>
        <span className="text-sm">{levelData.level_icon}</span>
        <span className="text-xs font-bold">{levelData.total_points}pts</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center gap-3 mb-3">
        <div className={`text-3xl ${config.color}`}>{levelData.level_icon}</div>
        <div>
          <h3 className={`font-bold text-lg ${config.color}`}>Nivel {levelData.level_name}</h3>
          <p className="text-slate-400 text-sm">{levelData.total_points} puntos</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Progreso al siguiente nivel</span>
          <span>{Math.round(levelData.progress_percent)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              levelData.level_name === 'Oráculo' ? 'bg-purple-500' :
              levelData.level_name === 'Guía' ? 'bg-emerald-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${levelData.progress_percent}%` }}
          />
        </div>
      </div>

      {/* Perks */}
      <div className="space-y-1">
        {config.perks.map((perk, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{perk}</span>
          </div>
        ))}
      </div>

      {/* How to earn more */}
      <div className="mt-4 pt-3 border-t border-slate-700">
        <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Cómo ganar puntos
        </h4>
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(POINTS_REWARD).slice(0, 4).map(([action, data]) => (
            <div key={action} className="text-xs text-slate-400 flex justify-between">
              <span>{data.label}</span>
              <span className="text-emerald-400 font-medium">+{data.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { trackActivity, POINTS_REWARD };
