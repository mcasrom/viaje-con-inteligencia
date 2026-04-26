'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Map, Users, Globe, Target, RefreshCw, Sparkles, ChevronRight, Database, Eye, Info } from 'lucide-react';

const dataSources = [
  { name: 'paisesData', source: 'src/data/paises.ts', fields: ['nombre', 'continente', 'nivelRiesgo', 'ipc', 'banderas', 'coords'], type: 'principal', dynamic: false, note: 'static' },
  { name: 'MAEC', source: 'scraping diario', fields: ['nivelRiesgo'], type: 'riesgo', dynamic: true, note: 'cron 6:00 UTC' },
  { name: 'OpenStreetMap', source: 'OSM API', fields: ['faros', 'playas', 'parques', 'miradores'], type: 'geografico', dynamic: false, note: 'sin usar' },
  { name: 'Wikidata', source: 'wikidata.org', fields: ['patrimonio', 'faros', 'relaciones'], type: 'semantico', dynamic: false, note: 'sin usar' },
  { name: 'INE', source: 'ine.es', fields: ['turistas', 'densidad', 'estacionalidad'], type: 'turismo', dynamic: false, note: 'sin integrar' },
  { name: 'AEMET', source: 'aemet.es API', fields: ['temperatura', 'viento', 'estacion'], type: 'clima', dynamic: false, note: 'sin usar' },
  { name: 'travelAttributes', source: 'hardcoded (30)', fields: ['playa', 'cultural', 'naturaleza', 'familiar'], type: 'ml', dynamic: false, note: '⚠️ manual' },
];

interface Cluster {
  cluster: number;
  label: string;
  description: string;
  destinations: string[];
}

interface Destination {
  code: string;
  nombre: string;
  bandera: string;
  arrivals: number;
  receipts: number;
  riskScore: number;
  riskLevel: number;
  ipc: number;
  clima: string;
  idiomaEspanol: boolean;
  continente: string;
  distanciaES: number;
}

export default function ClusteringPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [nClusters, setNClusters] = useState(4);
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{maec?: string; clustering?: string}>({});

  useEffect(() => {
    fetchClustering();
    fetchLastUpdate();
  }, [nClusters]);

  const fetchLastUpdate = async () => {
    try {
      const res = await fetch('/api/cron/status');
      const data = await res.json();
      setLastUpdate({
        maec: data.lastScrapeMaec,
        clustering: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Error fetching status:', e);
    }
  };

  const fetchClustering = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ai/clustering?clusters=${nClusters}&features=true`);
      const data = await res.json();
      if (data.clusters) setClusters(data.clusters);
      if (data.destinations) setDestinations(data.destinations);
    } catch (e) {
      console.error('Error fetching clustering:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (n: number): string => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  const getClusterColor = (idx: number): string => {
    const colors = [
      'from-green-500 to-emerald-600',
      'from-blue-500 to-cyan-600', 
      'from-orange-500 to-amber-600',
      'from-purple-500 to-pink-600',
      'from-cyan-500 to-teal-600',
    ];
    return colors[idx % colors.length];
  };

  const selectedDestinations = selectedCluster !== null 
    ? destinations.filter(d => clusters[selectedCluster]?.destinations.includes(d.code))
    : [];

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-medium">Clustering ML</span>
          </div>
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center gap-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-sm transition-colors"
          >
            <Database className="w-4 h-4" />
            {showSources ? 'Ocultar fuentes' : 'Ver fuentes'}
          </button>
        </div>
      </header>

      {showSources && (
        <div className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Fuentes de datos OSINT:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {dataSources.map(ds => {
                const typeColors: Record<string, string> = {
                  principal: 'bg-blue-900/50 border-blue-700',
                  riesgo: 'bg-red-900/50 border-red-700',
                  geografico: 'bg-green-900/50 border-green-700',
                  semantico: 'bg-purple-900/50 border-purple-700',
                  topografico: 'bg-amber-900/50 border-amber-700',
                  clima: 'bg-cyan-900/50 border-cyan-700',
                  turismo: 'bg-orange-900/50 border-orange-700',
                  ml: 'bg-pink-900/50 border-pink-700',
                };
                return (
                  <div key={ds.name} className={`rounded-lg p-3 border ${typeColors[ds.type] || 'bg-slate-700'}`}>
                    <div className="flex items-center justify-between">
                      <div className="text-white font-medium text-sm">{ds.name}</div>
                      {ds.dynamic && <span className="text-green-400 text-xs">✓ live</span>}
                      {!ds.dynamic && ds.note?.includes('⚠️') && <span className="text-red-400 text-xs">⚠️</span>}
                    </div>
                    <div className="text-slate-400 text-xs">{ds.source}</div>
                    <div className="text-slate-500 text-xs mt-1">{ds.note}</div>
                  </div>
                );
              })}
            </div>
            <p className="text-slate-500 text-xs mt-3 flex items-center gap-2">
              <Info className="w-3 h-3" />
              distanciaES calculada via Haversine desde coordenadas GPS de paisesData
            </p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Agrupaciones de <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Destinos Similares</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Algoritmo K-Means agrupa destinos por similitud: seguridad, coste, distancia y turismo.
          </p>
          <p className="text-blue-400 text-sm mt-3 flex items-center justify-center gap-2">
            <Target className="w-4 h-4" />
            ML no-supervisado • 50+ países • 4 features
          </p>
          {lastUpdate.maec && (
            <p className="text-slate-500 text-xs mt-2">
              MAEC actualizado: {new Date(lastUpdate.maec).toLocaleString('es-ES')}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="text-slate-400">Número de grupos:</span>
          <div className="flex items-center gap-2">
            {[3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setNClusters(n)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  nClusters === n 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchClustering}
            disabled={loading}
            className="p-2 bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <RefreshCw className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Calculando clustering...</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {clusters.map((cluster, idx) => (
                <button
                  key={cluster.cluster}
                  onClick={() => setSelectedCluster(idx)}
                  className={`p-6 rounded-2xl border text-left transition-all hover:scale-105 ${
                    selectedCluster === idx
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getClusterColor(idx)} flex items-center justify-center mb-4`}>
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-bold mb-2">{cluster.label}</h3>
                  <p className="text-slate-400 text-sm mb-3">{cluster.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {cluster.destinations.slice(0, 5).map(code => {
                      const dest = destinations.find(d => d.code === code);
                      return dest ? (
                        <span key={code} className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                          {dest.bandera} {code}
                        </span>
                      ) : null;
                    })}
                    {cluster.destinations.length > 5 && (
                      <span className="text-xs text-slate-500">+{cluster.destinations.length - 5}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {selectedCluster !== null && (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">
                    {clusters[selectedCluster]?.label}
                  </h3>
                  <button 
                    onClick={() => setSelectedCluster(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    × Cerrar
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">País</th>
                        <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Seguridad</th>
                        <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">IPC</th>
                        <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Llegadas</th>
                        <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Distancia</th>
                        <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">ES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDestinations.map(dest => (
                        <tr key={dest.code} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 px-4">
                            <Link href={`/pais/${dest.code}`} className="flex items-center gap-2 text-white hover:text-purple-400">
                              <span className="text-2xl">{dest.bandera}</span>
                              <span>{dest.nombre}</span>
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-sm ${
                              dest.riskScore >= 80 ? 'bg-green-500/20 text-green-400' :
                              dest.riskScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {dest.riskScore}/100
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{dest.ipc}</td>
                          <td className="py-3 px-4 text-slate-300">{formatNumber(dest.arrivals)}</td>
                          <td className="py-3 px-4 text-slate-300">{formatNumber(dest.distanciaES)} km</td>
                          <td className="py-3 px-4">
                            {dest.idiomaEspanol ? (
                              <span className="text-green-400">✓</span>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}