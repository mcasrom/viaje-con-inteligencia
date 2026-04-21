'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, AlertTriangle, Globe, Calendar, DollarSign, Shield, Check, X, Plane, Bot, Lock } from 'lucide-react';
import { getTodosLosPaises, getLabelRiesgo, NivelRiesgo, DatoPais } from '@/data/paises';

const paises = getTodosLosPaises();

const levelOrder: Record<NivelRiesgo, number> = {
  'sin-riesgo': 1,
  'bajo': 2,
  'medio': 3,
  'alto': 4,
  'muy-alto': 5,
};

const riskColors: Record<NivelRiesgo, string> = {
  'sin-riesgo': 'bg-green-500',
  'bajo': 'bg-yellow-500',
  'medio': 'bg-orange-500',
  'alto': 'bg-red-500',
  'muy-alto': 'bg-red-800',
};

export default function CompararPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [showLockedModal, setShowLockedModal] = useState(false);

  const togglePais = (codigo: string) => {
    if (selected.includes(codigo)) {
      setSelected(prev => prev.filter(c => c !== codigo));
    } else if (selected.length < 3) {
      setSelected(prev => [...prev, codigo]);
    } else {
      setError('Máximo 3 países');
      setTimeout(() => setError(''), 2000);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (selected.length < 2) {
      setError('Selecciona al menos 2 países');
      return;
    }

    setShowLockedModal(true);
  };

  const handlePremiumAnalyze = async () => {
    setAiLoading(true);
    setAiResult('Analizando comparación con IA...');

    const selectedData = selected
      .map(cod => paises.find(p => p.codigo === cod))
      .filter((p): p is DatoPais => Boolean(p))
      .map(p => ({
        codigo: p.codigo,
        nombre: p.nombre,
        bandera: p.bandera,
        nivelRiesgo: p.nivelRiesgo,
        capital: p.capital,
        moneda: p.moneda,
        tipoCambio: p.tipoCambio,
        idioma: p.idioma,
        zonaHoraria: p.zonaHoraria,
        voltaje: p.voltaje,
        conduccion: p.conduccion,
        ultimoInforme: p.ultimoInforme,
      }));

    try {
      const response = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countries: selectedData }),
      });

      const data = await response.json();
      setAiResult(data.comparison || data.error || 'Error al analizar');
    } catch (err) {
      setAiResult('Error de conexión');
    } finally {
      setAiLoading(false);
      setShowLockedModal(false);
    }
  };

  const getLevel = (riesgo: string) => levelOrder[riesgo as NivelRiesgo] || 0;

  const selectedPaises = selected.map(cod => paises.find(p => p.codigo === cod)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            <Scale className="inline w-8 h-8 mr-2 text-blue-400" />
            Comparar Destinos
          </h1>
          <p className="text-slate-400 text-lg">
            Compara riesgo, costes y requisitos entre países
          </p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="text-white font-medium mb-4">
            <Globe className="inline w-4 h-4 mr-2" />
            Selecciona países a comparar (máx. 3)
          </h2>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {paises.slice(0, 40).map(p => (
              <button
                key={p.codigo}
                onClick={() => togglePais(p.codigo)}
                disabled={!selected.includes(p.codigo) && selected.length >= 3}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selected.includes(p.codigo)
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50'
                }`}
              >
                {p.bandera} {p.nombre}
              </button>
            ))}
          </div>
          <Link href="/comparar" className="text-blue-400 text-sm hover:underline">
            Ver todos los países...
          </Link>

          {error && (
            <div className="mt-2 text-red-400 text-sm">{error}</div>
          )}
        </div>

        {selectedPaises.length >= 2 && (
          <button
            onClick={handleAnalyzeWithAI}
            disabled={aiLoading}
            className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Bot className="w-5 h-5" />
            {aiLoading ? 'Analizando...' : 'Análisis Inteligente con IA'}
          </button>
        )}

        {aiResult && (
          <div className="mt-6 bg-slate-700/50 rounded-xl p-5 border border-purple-500/30">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              Análisis de IA
            </h3>
            <div className="prose prose-invert max-w-none text-slate-300 text-sm whitespace-pre-wrap font-sans">
              {aiResult}
            </div>
          </div>
        )}

        {showLockedModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-yellow-500/50">
              <div className="text-center">
                <Lock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Función Premium</h3>
                <p className="text-slate-400 mb-6">
                  El análisis inteligente con IA es una función premium. Suscríbete para desbloquear esta y otras herramientas exclusivas.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handlePremiumAnalyze}
                    disabled={aiLoading}
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 rounded-lg font-bold hover:from-yellow-400 hover:to-orange-400"
                  >
                    Desbloquear Análisis IA
                  </button>
                  <Link
                    href="/premium"
                    className="block w-full py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600"
                  >
                    Ver Planes Premium
                  </Link>
                  <button
                    onClick={() => setShowLockedModal(false)}
                    className="block w-full py-2 text-slate-400 text-sm hover:text-white"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedPaises.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full bg-slate-800 rounded-2xl overflow-hidden">
              <thead>
                <tr className="bg-slate-700">
                  <th className="text-left p-4 text-slate-300 font-medium">Criterio</th>
                  {selectedPaises.map(p => (
                    <th key={p.codigo} className="text-center p-4">
                      <div className="text-3xl mb-1">{p?.bandera}</div>
                      <div className="text-white font-bold">{p?.nombre}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr>
                  <td className="p-4 text-slate-300 font-medium">Riesgo</td>
                  {selectedPaises.map(p => (
                    <td key={p?.codigo} className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-sm font-medium ${riskColors[p?.nivelRiesgo || 'sin-riesgo']}`}>
                        <AlertTriangle className="w-3 h-3" />
                        {getLabelRiesgo(p?.nivelRiesgo || 'sin-riesgo')}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-slate-300">Coste diario</td>
                  {selectedPaises.map(p => (
                    <td key={p?.codigo} className="p-4 text-center text-white">
                      {p?.tipoCambio}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-slate-300">Moneda</td>
                  {selectedPaises.map(p => (
                    <td key={p?.codigo} className="p-4 text-center text-white">
                      {p?.moneda}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-slate-300">Idioma</td>
                  {selectedPaises.map(p => (
                    <td key={p?.codigo} className="p-4 text-center text-white">
                      {p?.idioma}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-slate-300">Zona horaria</td>
                  {selectedPaises.map(p => (
                    <td key={p?.codigo} className="p-4 text-center text-white">
                      {p?.zonaHoraria}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-slate-300">Electricidad</td>
                  {selectedPaises.map(p => (
                    <td key={p?.codigo} className="p-4 text-center text-white">
                      {p?.voltaje}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-slate-300">Driving</td>
                  {selectedPaises.map(p => (
                    <td key={p?.codigo} className="p-4 text-center text-white">
                      <span className={`px-2 py-1 rounded text-xs ${p?.conduccion === 'derecha' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {p?.conduccion === 'derecha' ? '↔️ Derecha' : '↔️ Izquierda'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-slate-300">🛒 IPC (inflación)</td>
                  {selectedPaises.map(p => (
                    <td key={p?.codigo} className="p-4 text-center text-white">
                      {p?.indicadores?.ipc || '-'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-slate-300">💰 Coste vida</td>
                  {selectedPaises.map(p => (
                    <td key={p?.codigo} className="p-4 text-center text-white">
                      {p?.indicadores?.indicePrecios ? (
                        <span className={`px-2 py-1 rounded text-xs ${
                          p.indicadores.indicePrecios === 'Bajo' ? 'bg-green-500/20 text-green-400' :
                          p.indicadores.indicePrecios === 'Medio' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {p.indicadores.indicePrecios}
                        </span>
                      ) : '-'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-slate-300">Mejor época</td>
                  {selectedPaises.map(p => (
                    <td key={p?.codigo} className="p-4 text-center text-white text-sm">
                      {p?.ultimoInforme}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-slate-300">Embajada España</td>
                  {selectedPaises.map(p => (
                    <td key={p?.codigo} className="p-4 text-center">
                      {p?.contactos?.[0] ? (
                        <a href={`tel:${p?.contactos?.[0]?.telefono}`} className="text-blue-400 hover:underline text-sm">
                          {p?.contactos?.[0]?.telefono}
                        </a>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {selectedPaises.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedPaises.map(p => (
              <Link
                key={p.codigo}
                href={`/pais/${p.codigo}`}
                className="bg-slate-800 rounded-xl p-4 hover:bg-slate-700 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.bandera}</span>
                  <div>
                    <div className="text-white font-medium">{p.nombre}</div>
                    <div className="text-slate-400 text-sm">{p.capital}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <Plane className="w-4 h-4" />
                  <span>Ver detalle</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}