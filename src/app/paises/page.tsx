'use client';

import { useState } from 'react';
import Link from 'next/link';
import { paisesData, getLabelRiesgo, NivelRiesgo } from '@/data/paises';
import { getGlobalStats } from '@/lib/global-stats';
import { AlertTriangle, Search, Globe, ArrowRight, MapPin, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

const paises = Object.values(paisesData);
const continentes = ['Todos', ...new Set(paises.map(p => p.continente))];
const stats = getGlobalStats();

const riesgoColors: Record<NivelRiesgo, { bg: string; text: string; border: string }> = {
  'sin-riesgo': { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500' },
  'bajo': { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500' },
  'medio': { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500' },
  'alto': { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500' },
  'muy-alto': { bg: 'bg-red-900', text: 'text-red-900', border: 'border-red-900' },
};

interface CountryCardProps {
  pais: typeof paises[0];
  riesgoColor: typeof riesgoColors['sin-riesgo'];
  hoveredCountry: string | null;
  onHover: (code: string | null) => void;
}

function CountryCard({ pais, riesgoColor, hoveredCountry, onHover }: CountryCardProps) {
  return (
    <Link
      href={`/pais/${pais.codigo}`}
      className={`group relative bg-slate-800/70 rounded-xl p-4 border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 ${
        hoveredCountry === pais.codigo ? 'z-20' : ''
      } ${riesgoColor.border}`}
      onMouseEnter={() => onHover(pais.codigo)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="text-center">
        <span className="text-4xl mb-2 block">{pais.bandera}</span>
        <h3 className="text-white font-semibold">{pais.nombre}</h3>
        <p className="text-slate-400 text-sm mb-2">{pais.capital}</p>
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${riesgoColor.bg}`}>
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
  );
}

export default function PaisesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinente, setSelectedContinente] = useState('Todos');
  const [selectedRiesgo, setSelectedRiesgo] = useState<NivelRiesgo | 'Todos'>('Todos');
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const filteredPaises = paises.filter(pais => {
    const matchesSearch = pais.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pais.capital.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesContinente = selectedContinente === 'Todos' || pais.continente === selectedContinente;
    const matchesRiesgo = selectedRiesgo === 'Todos' || pais.nivelRiesgo === selectedRiesgo;
    return matchesSearch && matchesContinente && matchesRiesgo;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900">
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              <div>
                <h1 className="text-xl font-bold text-white">Viaje con Inteligencia</h1>
                <p className="text-blue-400 text-sm">Directorio de países</p>
              </div>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/premium" className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-colors">
                Premium
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            <MapPin className="w-8 h-8 inline mr-2" />
            Directorio de Países
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-4">
            Explora todos los destinos del mundo con análisis de riesgo actualizado según MAEC español.
          </p>
          <p className="text-blue-400 text-sm flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Actualizado: {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{stats.seguroOBajo}</div>
            <div className="text-green-300 text-sm">Seguros o bajo riesgo</div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-orange-400">{stats.riesgoMedio}</div>
            <div className="text-orange-300 text-sm">Riesgo medio</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-red-400">{stats.altoOMuyAlto}</div>
            <div className="text-red-300 text-sm">Alto/muy alto</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">{stats.totalPaises}</div>
            <div className="text-blue-300 text-sm">Países analizados</div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 mb-8 border border-slate-700">
          <div className="flex flex-wrap justify-center items-center gap-6">
            {(['sin-riesgo', 'bajo', 'medio', 'alto', 'muy-alto'] as NivelRiesgo[]).map((riesgo) => (
              <div key={riesgo} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${riesgoColors[riesgo].bg}`}></div>
                <span className="text-slate-300 text-sm">{getLabelRiesgo(riesgo)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/70 rounded-xl p-4 mb-6 border border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar país o capital..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors w-full"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={selectedContinente}
                onChange={(e) => setSelectedContinente(e.target.value)}
                className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {continentes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={selectedRiesgo}
                onChange={(e) => setSelectedRiesgo(e.target.value as NivelRiesgo | 'Todos')}
                className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Todos">Todos los riesgos</option>
                <option value="sin-riesgo">Sin riesgo</option>
                <option value="bajo">Riesgo bajo</option>
                <option value="medio">Riesgo medio</option>
                <option value="alto">Riesgo alto</option>
                <option value="muy-alto">Muy alto</option>
              </select>
            </div>
          </div>
          <p className="text-slate-400 mt-3">
            Mostrando <span className="text-white font-medium">{filteredPaises.length}</span> países
            {selectedContinente !== 'Todos' && ` en ${selectedContinente}`}
            {selectedRiesgo !== 'Todos' && ` con ${getLabelRiesgo(selectedRiesgo as NivelRiesgo).toLowerCase()}`}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredPaises.map((pais) => (
            <CountryCard
              key={pais.codigo}
              pais={pais}
              riesgoColor={riesgoColors[pais.nivelRiesgo]}
              hoveredCountry={hoveredCountry}
              onHover={setHoveredCountry}
            />
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

      <footer className="bg-slate-900 border-t border-slate-800 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">
            Datos basados en recomendaciones oficiales MAEC español. Siempre verifica la información actualizada antes de viajar.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">Inicio</Link>
            <Link href="/premium" className="text-blue-400 hover:text-blue-300 text-sm">Premium</Link>
            <Link href="/blog" className="text-blue-400 hover:text-blue-300 text-sm">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}