'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Map, Users, Globe, Target, RefreshCw, Sparkles, ChevronRight, Database, Eye, Info, Shield, DollarSign, Plane, TrendingUp, BookOpen, Cpu, Layers, Search, Brain } from 'lucide-react';

const dataSources = [
  { name: 'paisesData', source: 'src/data/paises.ts', fields: ['nombre', 'continente', 'nivelRiesgo', 'ipc', 'banderas', 'coords'], type: 'principal', dynamic: false, note: 'static' },
  { name: 'MAEC', source: 'scraping diario', fields: ['nivelRiesgo'], type: 'riesgo', dynamic: true, note: 'cron 6:00 UTC' },
  { name: 'INE/UNWTO', source: 'ine.es / unwto.org', fields: ['turistas', 'pernoctaciones', 'estanciaMedia'], type: 'turismo', dynamic: false, note: 'actualizado anualmente' },
  { name: 'OpenStreetMap', source: 'OSM API', fields: ['faros', 'playas', 'parques', 'miradores'], type: 'geografico', dynamic: false, note: 'planificado' },
  { name: 'Wikidata', source: 'wikidata.org', fields: ['patrimonio', 'faros', 'relaciones'], type: 'semantico', dynamic: false, note: 'planificado' },
  { name: 'travelAttributes', source: 'curado manual (61)', fields: ['playa', 'cultural', 'naturaleza', 'familiar'], type: 'ml', dynamic: false, note: 'en automatización' },
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
  const [totalDestinations, setTotalDestinations] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [nClusters, setNClusters] = useState(4);
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{maec?: string; clustering?: string}>({});
  const [activeTab, setActiveTab] = useState<'explicacion' | 'resultados'>('explicacion');

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
    setActiveTab('resultados');
    try {
      const res = await fetch(`/api/ai/clustering?clusters=${nClusters}&features=true`);
      const data = await res.json();
      if (data.clusters) setClusters(data.clusters);
      if (data.destinations) setDestinations(data.destinations);
      if (data.numDestinations) setTotalDestinations(data.numDestinations);
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
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {dataSources.map(ds => {
                const typeColors: Record<string, string> = {
                  principal: 'bg-blue-900/50 border-blue-700',
                  riesgo: 'bg-red-900/50 border-red-700',
                  geografico: 'bg-green-900/50 border-green-700',
                  semantico: 'bg-purple-900/50 border-purple-700',
                  turismo: 'bg-orange-900/50 border-orange-700',
                  ml: 'bg-pink-900/50 border-pink-700',
                };
                return (
                  <div key={ds.name} className={`rounded-lg p-3 border ${typeColors[ds.type] || 'bg-slate-700'}`}>
                    <div className="flex items-center justify-between">
                      <div className="text-white font-medium text-sm">{ds.name}</div>
                      {ds.dynamic && <span className="text-green-400 text-xs">✓ live</span>}
                      {!ds.dynamic && ds.note?.includes('planificado') && <span className="text-yellow-400 text-xs">📋</span>}
                    </div>
                    <div className="text-slate-400 text-xs">{ds.source}</div>
                    <div className="text-slate-500 text-xs mt-1">{ds.note}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* HERO - Qué es el Clustering */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm mb-6">
            <Cpu className="w-4 h-4" />
            Machine Learning no supervisado • K-Means • TypeScript
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            ¿Qué destinos son <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">realmente similares</span>?
          </h1>
          <p className="text-slate-400 max-w-3xl mx-auto text-lg">
            Nuestro algoritmo analiza <strong className="text-white">{totalDestinations} países</strong> en 4 dimensiones diferentes y los agrupa automáticamente según su perfil real, no por continente ni intuición.
          </p>
        </div>

        {/* LAS 4 DIMENSIONES */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Seguridad</h3>
            <p className="text-slate-400 text-sm mb-3">
              Nivel de riesgo MAEC invertido (0-100). Un 100 significa "sin riesgo", 0 es "muy-alto".
            </p>
            <div className="text-xs text-slate-500">
              <span className="text-green-400 font-mono">Peso: ×2.0</span> — La dimensión más importante
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Coste de vida</h3>
            <p className="text-slate-400 text-sm mb-3">
              IPC relativo a España. Índice de precios que indica qué tan caro es vivir allí como turista.
            </p>
            <div className="text-xs text-slate-500">
              <span className="text-blue-400 font-mono">Peso: ×1.5</span> — Clave para el presupuesto
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-4">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Distancia a España</h3>
            <p className="text-slate-400 text-sm mb-3">
              Kilómetros desde Madrid (fórmula Haversine). Normalizado sobre 15.000 km (máximo global).
            </p>
            <div className="text-xs text-slate-500">
              <span className="text-orange-400 font-mono">Peso: ×1.0</span> — Jet lag y coste vuelo
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Turismo</h3>
            <p className="text-slate-400 text-sm mb-3">
              Llegadas turísticas anuales (UNWTO/INE). Logarítmico: no es lo mismo 6M que 85M.
            </p>
            <div className="text-xs text-slate-500">
              <span className="text-purple-400 font-mono">Peso: ×0.5</span> — Infraestructura disponible
            </div>
          </div>
        </div>

        {/* CÓMO FUNCIONA */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Layers className="w-7 h-7 text-purple-400" />
            Cómo funciona el algoritmo
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-lg">1</div>
              <h4 className="text-white font-semibold">Extracción de features</h4>
              <p className="text-slate-400 text-sm">
                Para cada país se calculan 4 valores: seguridad (del MAEC), IPC (precios), distancia (GPS Haversine desde Madrid) y llegadas turísticas (UNWTO).
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-lg">2</div>
              <h4 className="text-white font-semibold">Normalización + pesos</h4>
              <p className="text-slate-400 text-sm">
                Todo se escala a [0,1] para evitar sesgos. Se aplican pesos: seguridad ×2 (prioridad), coste ×1.5, distancia ×1, turismo ×0.5.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-lg">3</div>
              <h4 className="text-white font-semibold">K-Means iterativo</h4>
              <p className="text-slate-400 text-sm">
                Se eligen K centroides al azar. Cada país se asigna al centroide más cercano (distancia euclidiana). Se recalculan centroides hasta convergencia (20 iteraciones máx).
              </p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-600">
            <p className="text-slate-300 text-sm font-mono">
              <span className="text-purple-400">→</span> El resultado: grupos de países que se parecen entre sí en estas 4 dimensiones, aunque estén en continentes diferentes.
            </p>
          </div>
        </div>

        {/* QUÉ SIGNIFICA CADA CLUSTER */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-cyan-400" />
            Cómo interpretar los clusters
          </h2>
          <p className="text-slate-400 mb-6">
            El algoritmo genera clusters automáticamente. El <strong className="text-white">label</strong> de cada grupo se deduce del perfil promedio de sus países. Con 4 clusters típicamente aparecen:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-2 shrink-0" />
                <div>
                  <h4 className="text-white font-medium">Europa cercana (segura + cara)</h4>
                  <p className="text-slate-400 text-sm">Distancia &lt;2.000 km, IPC alto, seguridad máxima. Francia, Alemania, Suiza. Ideales para escapadas rápidas con buen presupuesto.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 shrink-0" />
                <div>
                  <h4 className="text-white font-medium">Turismo masivo (playa + cultural)</h4>
                  <p className="text-slate-400 text-sm">Llegadas &gt;25M, buen equilibrio seguridad/precio. España, México, Tailandia. Destinos con infraestructura turística probada.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 shrink-0" />
                <div>
                  <h4 className="text-white font-medium">Aventura económica</h4>
                  <p className="text-slate-400 text-sm">IPC bajo, distancia media-larga, seguridad media-baja. India, Vietnam, Egipto. Más baratos pero requieren más preparación.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 shrink-0" />
                <div>
                  <h4 className="text-white font-medium">Larga distancia premium</h4>
                  <p className="text-slate-400 text-sm">Distancia &gt;10.000 km, IPC alto, seguridad alta. Australia, Nueva Zelanda, Canadá. Caros y lejanos pero seguros.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-blue-300 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>Los clusters varían según el número de grupos elegido (3, 4 o 5). El algoritmo se recalcula cada vez. No hay grupos fijos — se adapta a los datos disponibles.</span>
            </p>
          </div>
        </div>

        {/* TABS: Explicación / Resultados */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('explicacion')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'explicacion' 
                ? 'bg-purple-500 text-white' 
                : 'bg-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Explicación
          </button>
          <button
            onClick={() => {
              setActiveTab('resultados');
              if (!clusters.length) fetchClustering();
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'resultados' 
                ? 'bg-purple-500 text-white' 
                : 'bg-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Resultados
          </button>
        </div>

        {activeTab === 'explicacion' && (
          <div className="max-w-3xl mx-auto space-y-8 mb-12">
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-400" />
                ¿Para qué sirve esto?
              </h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex gap-2">
                  <span className="text-green-400">✓</span>
                  <span><strong className="text-white">Descubrir alternativas:</strong> Si te gusta Japón pero es caro, el clustering te muestra países con perfil similar pero más económicos.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400">✓</span>
                  <span><strong className="text-white">Planificar por perfil:</strong> No todos los destinos "baratos" son iguales. Algunos son baratos + seguros, otros baratos + aventureros.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400">✓</span>
                  <span><strong className="text-white">Transparencia:</strong> Puedes ver exactamente qué datos se usan y cómo se procesan. Nada de "caja negra".</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">Limitaciones</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex gap-2">
                  <span className="text-yellow-400">⚠</span>
                  <span>Las <strong className="text-white">llegadas turísticas</strong> son de 2019-2023 (últimos datos UNWTO). Algunos países post-pandemia pueden estar desactualizados.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-400">⚠</span>
                  <span>Solo se usan <strong className="text-white">4 dimensiones</strong>. El clustering no considera gastronomía, vida nocturna, clima estacional ni patrimonio UNESCO (planificado).</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-yellow-400">⚠</span>
                  <span>Los <strong className="text-white">atributos de viaje</strong> (playa, cultural, naturaleza, familiar) están curados manualmente para un subconjunto de países. Se trabaja en automatizar con OpenStreetMap.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'resultados' && (
          <>
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
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {clusters[selectedCluster]?.label}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                          {selectedDestinations.length} países en este grupo
                        </p>
                      </div>
                      <button 
                        onClick={() => setSelectedCluster(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        ✕ Cerrar
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
          </>
        )}
      </main>
    </div>
  );
}