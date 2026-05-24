'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { paisesData } from '@/data/paises';
import { useI18n } from '@/lib/i18n';

export default function HeroSearch() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof paisesData[keyof typeof paisesData][]>([]);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(
      Object.values(paisesData)
        .filter(p => p.nombre.toLowerCase().includes(q) || p.codigo.includes(q))
        .slice(0, 6)
    );
  }, [query]);

  return (
    <div className="relative max-w-lg mx-auto">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
      <input
        type="text"
        placeholder={t('hero.searchPlaceholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-600 rounded-2xl pl-12 pr-5 py-4 text-base text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-2xl"
        autoComplete="off"
        aria-label={t('hero.searchPlaceholder')}
      />

      {results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden">
          {results.map(p => (
            <Link
              key={p.codigo}
              href={`/pais/${p.codigo}`}
              className="flex items-center gap-3 px-4 py-3 text-slate-200 hover:bg-slate-800 transition-colors border-b border-slate-700/30 last:border-0"
            >
              <span className="text-lg">{p.bandera}</span>
              <span className="text-sm font-medium">{p.nombre}</span>
              <span className={`ml-auto w-2.5 h-2.5 rounded-full ${
                p.nivelRiesgo === 'sin-riesgo' ? 'bg-green-500' :
                p.nivelRiesgo === 'bajo' ? 'bg-emerald-500' :
                p.nivelRiesgo === 'medio' ? 'bg-orange-500' :
                p.nivelRiesgo === 'alto' ? 'bg-red-500' : 'bg-red-700'
              }`} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
