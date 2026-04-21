'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { paisesData, getLabelRiesgo, NivelRiesgo } from '@/data/paises';
import { AlertTriangle, ArrowRight, Globe, Search, ClipboardList, Star, BookOpen, RefreshCw, Clock, Gift, TrendingUp } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useI18n } from '@/lib/i18n';

const MapaInteractivo = dynamic(() => import('./MapaInteractivo'), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-slate-800 animate-pulse rounded-xl" />
});

const paises = Object.values(paisesData);
const continentes = ['Todos', ...new Set(paises.map(p => p.continente))];

interface CountryRatings {
  [key: string]: { average: number; count: number };
}

export default function MapaMundial() {
  const { t } = useI18n();
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinente, setSelectedContinente] = useState('Todos');
  const [selectedRiesgo, setSelectedRiesgo] = useState<NivelRiesgo | 'Todos'>('Todos');
  const [ratings, setRatings] = useState<CountryRatings>({});

  const beneficios = [
    { icon: '🛡️', text: 'Datos oficiales MAEC' },
    { icon: '🤖', text: 'Chat IA para viajes' },
    { icon: '✈️', text: '58 países analizados' },
    { icon: '📋', text: 'Checklist descargable' },
  ];

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (data.byCountry) {
          const ratingsMap: CountryRatings = {};
          Object.entries(data.byCountry).forEach(([country, count]) => {
            const countryReviews = data.reviews?.filter((r: any) => r.country === country) || [];
            if (countryReviews.length > 0) {
              const sum = countryReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
              ratingsMap[country] = {
                average: Math.round((sum / countryReviews.length) * 10) / 10,
                count: countryReviews.length,
              };
            }
          });
          setRatings(ratingsMap);
        }
      })
      .catch(console.error);
  }, []);

  const riesgoColors: Record<NivelRiesgo, { bg: string; text: string; border: string; light: string }> = {
    'sin-riesgo': { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500', light: 'bg-green-500/20' },
    'bajo': { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500', light: 'bg-yellow-500/20' },
    'medio': { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500', light: 'bg-orange-500/20' },
    'alto': { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500', light: 'bg-red-500/20' },
    'muy-alto': { bg: 'bg-red-900', text: 'text-red-900', border: 'border-red-900', light: 'bg-red-900/20' },
  };

  const filteredPaises = paises.filter(pais => {
    const matchesSearch = pais.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pais.capital.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesContinente = selectedContinente === 'Todos' || pais.continente === selectedContinente;
    const matchesRiesgo = selectedRiesgo === 'Todos' || pais.nivelRiesgo === selectedRiesgo;
    return matchesSearch && matchesContinente && matchesRiesgo;
  });

  const paisesSinRiesgo = paises.filter(p => p.nivelRiesgo === 'sin-riesgo').length;
  const paisesRiesgoBajo = paises.filter(p => p.nivelRiesgo === 'bajo').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/50 to-slate-900">
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🌍</span>
              <div>
                <h1 className="text-2xl font-bold text-white">Viaje con Inteligencia</h1>
                <p className="text-blue-400 text-sm font-medium">Riesgo Zero</p>
              </div>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400">
                  Datos MAEC: {new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
            
              <div className="flex items-center gap-2">
              <Link 
                href="/blog" 
                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden md:inline">{t('nav.blog')}</span>
              </Link>
              <Link 
                href="/relojes" 
                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden md:inline">Relojes</span>
              </Link>
              <Link 
                href="/checklist" 
                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white transition-colors"
              >
                <ClipboardList className="w-4 h-4" />
                <span className="hidden md:inline">{t('nav.checklist')}</span>
              </Link>
              <Link 
                href="/lead-magnet" 
                className="flex items-center gap-2 px-3 py-2 text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                <Gift className="w-4 h-4" />
                <span className="hidden md:inline">Gratis</span>
              </Link>
              <Link 
                href="/stats" 
                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden md:inline">Stats</span>
              </Link>
              <Link 
                href="/premium" 
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors font-medium"
              >
                <Star className="w-4 h-4" />
                <span>{t('nav.premium')}</span>
              </Link>
              <a
                href="https://t.me/ViajeConInteligenciaBot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span className="hidden lg:inline">{t('nav.telegramBot')}</span>
              </a>
              <LanguageSelector />
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar país..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors w-full"
                />
              </div>
              <select
                value={selectedContinente}
                onChange={(e) => setSelectedContinente(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {continentes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={selectedRiesgo}
                onChange={(e) => setSelectedRiesgo(e.target.value as NivelRiesgo | 'Todos')}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Todos">Todos</option>
                <option value="sin-riesgo">Sin riesgo</option>
                <option value="bajo">Riesgo bajo</option>
                <option value="medio">Riesgo medio</option>
                <option value="alto">Riesgo alto</option>
                <option value="muy-alto">Muy alto</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-6 mb-8 border border-blue-700/30">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">🌍 Viaje con Inteligencia</h2>
            <p className="text-blue-300 text-lg">Tu asistente de viaje inteligente. Planifica seguro, viaja smarter.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {beneficios.map((b, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700">
                <span className="text-xl">{b.icon}</span>
                <span className="text-slate-300 text-sm font-medium">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-3">📊 Mapa de Riesgos por País</h3>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Consulta el nivel de riesgo, requisitos de entrada y recomendaciones para cada destino. 
            Información actualizada según MAEC español.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{paisesSinRiesgo}</div>
            <div className="text-green-300 text-sm">Sin riesgo</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{paisesRiesgoBajo}</div>
            <div className="text-yellow-300 text-sm">Riesgo bajo</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">{paises.length}</div>
            <div className="text-blue-300 text-sm">Países</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">{continentes.length - 1}</div>
            <div className="text-purple-300 text-sm">Continentes</div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 mb-8 border border-slate-700">
          <div className="flex flex-wrap justify-center gap-6">
            {(['sin-riesgo', 'bajo', 'medio', 'alto', 'muy-alto'] as NivelRiesgo[]).map((riesgo) => (
              <div key={riesgo} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${riesgoColors[riesgo].bg}`}></div>
                <span className="text-slate-300 text-sm">{getLabelRiesgo(riesgo)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-2">🗺️ Mapa de Riesgos</h2>
            <p className="text-slate-400 text-sm">Consulta el nivel de riesgo, requisitos de entrada y recomendaciones para cada destino. Información actualizada según MAEC español.</p>
          </div>
          <MapaInteractivo />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-slate-400">
            Mostrando <span className="text-white font-medium">{filteredPaises.length}</span> países
            {selectedContinente !== 'Todos' && ` en ${selectedContinente}`}
            {selectedRiesgo !== 'Todos' && ` con ${getLabelRiesgo(selectedRiesgo as NivelRiesgo).toLowerCase()}`}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredPaises.map((pais) => (
            <Link
              key={pais.codigo}
              href={`/pais/${pais.codigo}`}
              className={`group relative bg-slate-800/70 rounded-xl p-4 border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 ${
                hoveredCountry === pais.codigo ? 'z-20' : ''
              } ${riesgoColors[pais.nivelRiesgo].border}`}
              onMouseEnter={() => setHoveredCountry(pais.codigo)}
              onMouseLeave={() => setHoveredCountry(null)}
            >
              {ratings[pais.codigo] && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-slate-900 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {ratings[pais.codigo].average}
                </div>
              )}
              <div className="text-center">
                <span className="text-4xl mb-2 block">{pais.bandera}</span>
                <h3 className="text-white font-semibold">{pais.nombre}</h3>
                <p className="text-slate-400 text-sm mb-2">{pais.capital}</p>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${riesgoColors[pais.nivelRiesgo].bg}`}>
                  <AlertTriangle className="w-3 h-3" />
                  <span>{getLabelRiesgo(pais.nivelRiesgo)}</span>
                </div>
              </div>
              {hoveredCountry === pais.codigo && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-slate-900 rounded-lg p-3 shadow-xl border border-slate-600 w-56 z-30">
                  <div className="text-center">
                    <span className="text-2xl">{pais.bandera}</span>
                    <h4 className="text-white font-bold mt-1">{pais.nombre}</h4>
                    <p className="text-slate-400 text-xs mt-1">{pais.continente}</p>
                    <div className="flex justify-center gap-4 mt-2 text-xs">
                      <span className="text-slate-500">{pais.idioma}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-500">{pais.prefijoTelefono}</span>
                    </div>
                    <p className="text-blue-400 text-xs mt-2 flex items-center justify-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      Ver detalles
                    </p>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {filteredPaises.length === 0 && (
          <div className="text-center py-16">
            <Globe className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl text-slate-400 mb-2">No se encontraron países</h3>
            <p className="text-slate-500">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </main>
    </div>
  );
}
