'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { getPaisPorCodigo, getLabelRiesgo, NivelRiesgo } from '@/data/paises';

interface Recommendation {
  code: string;
  name: string;
  flag: string;
  risk: string;
  capital: string;
  score: number;
  reasons: string[];
}

interface RecommendationsListProps {
  favorites: string[];
}

export default function RecommendationsList({ favorites = [] }: RecommendationsListProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (favorites.length > 0) {
          params.set('favorites', favorites.join(','));
        }
        const res = await fetch(`/api/recommendations?${params}`);
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [favorites.join(',')]);

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Generando recomendaciones...</span>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-slate-300 mb-2">Añade países a favoritos</p>
          <p className="text-slate-500 text-sm">
            Te mostraremos recomendaciones personalizadas basadas en tus preferencias.
          </p>
        </div>
      </div>
    );
  }

  const riesgoColors: Record<string, string> = {
    'sin-riesgo': 'bg-green-500',
    'bajo': 'bg-yellow-500',
    'medio': 'bg-orange-500',
    'alto': 'bg-red-500',
    'muy-alto': 'bg-red-800',
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {recommendations.slice(0, 6).map((rec) => {
        const pais = getPaisPorCodigo(rec.code);
        if (!pais) return null;

        return (
          <Link
            key={rec.code}
            href={`/pais/${rec.code}`}
            className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-yellow-500/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{rec.flag}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-yellow-400 transition-colors">
                  {rec.name}
                </h3>
                <p className="text-slate-400 text-sm flex items-center gap-2">
                  {rec.capital}
                  <span className={`px-2 py-0.5 rounded text-xs ${riesgoColors[rec.risk]} text-white`}>
                    {getLabelRiesgo(rec.risk as NivelRiesgo)}
                  </span>
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-yellow-400" />
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {rec.reasons.slice(0, 2).map((reason, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                  {reason}
                </span>
              ))}
            </div>
          </Link>
        );
      })}
    </div>
  );
}