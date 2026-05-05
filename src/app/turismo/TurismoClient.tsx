'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, BarChart3, Globe, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';

const TOURISM_DATA = [
  { rank: 1, country: 'Francia', code: 'fr', arrivals: 102000000, receipts: 77000000000, spendPerDay: 75, stayAvg: 7, region: 'Europa' },
  { rank: 2, country: 'España', code: 'es', arrivals: 93800000, receipts: 106000000000, spendPerDay: 85, stayAvg: 8, region: 'Europa' },
  { rank: 3, country: 'EE.UU.', code: 'us', arrivals: 72400000, receipts: 215000000000, spendPerDay: 150, stayAvg: 10, region: 'Norteamérica' },
  { rank: 4, country: 'China', code: 'cn', arrivals: 64900000, receipts: 55000000000, spendPerDay: 60, stayAvg: 8, region: 'Asia' },
  { rank: 5, country: 'Italia', code: 'it', arrivals: 57800000, receipts: 58700000, spendPerDay: 80, stayAvg: 7, region: 'Europa' },
  { rank: 6, country: 'Turquía', code: 'tr', arrivals: 60600000, receipts: 56300000, spendPerDay: 50, stayAvg: 9, region: 'Europa' },
  { rank: 7, country: 'México', code: 'mx', arrivals: 45000000, receipts: 28000000, spendPerDay: 45, stayAvg: 8, region: 'Latinoamérica' },
  { rank: 8, country: 'Reino Unido', code: 'gb', arrivals: 41800000, receipts: 84500000, spendPerDay: 95, stayAvg: 7, region: 'Europa' },
  { rank: 9, country: 'Alemania', code: 'de', arrivals: 37500000, receipts: 48000000, spendPerDay: 90, stayAvg: 6, region: 'Europa' },
  { rank: 10, country: 'Grecia', code: 'gr', arrivals: 36000000, receipts: 20000000, spendPerDay: 55, stayAvg: 8, region: 'Europa' },
  { rank: 11, country: 'Japón', code: 'jp', arrivals: 36900000, receipts: 54700000, spendPerDay: 100, stayAvg: 9, region: 'Asia' },
  { rank: 12, country: 'Tailandia', code: 'th', arrivals: 45000000, receipts: 46000000, spendPerDay: 45, stayAvg: 10, region: 'Asia' },
  { rank: 13, country: 'Austria', code: 'at', arrivals: 32000000, receipts: 25000000, spendPerDay: 85, stayAvg: 7, region: 'Europa' },
  { rank: 14, country: 'Portugal', code: 'pt', arrivals: 29000000, receipts: 22000000, spendPerDay: 50, stayAvg: 7, region: 'Europa' },
  { rank: 15, country: 'Países Bajos', code: 'nl', arrivals: 20000000, receipts: 18000000, spendPerDay: 80, stayAvg: 6, region: 'Europa' },
];

const FLAGS: Record<string, string> = {
  fr: '🇫🇷', es: '🇪🇸', us: '🇺🇸', cn: '🇨🇳', it: '🇮🇹', tr: '🇹🇷', mx: '🇲🇽', gb: '🇬🇧', de: '🇩🇪', gr: '🇬🇷', jp: '🇯🇵', th: '🇹🇭', at: '🇦🇹', pt: '🇵🇹', nl: '🇳🇱',
};

export default function TurismoClient() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'arrivals' | 'receipts' | 'spendPerDay'>('arrivals');
  const [filteredData, setFilteredData] = useState(TOURISM_DATA);

  useEffect(() => {
    let data = [...TOURISM_DATA];
    if (search) {
      data = data.filter(p => p.country.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()));
    }
    data.sort((a, b) => {
      if (sortBy === 'arrivals') return b.arrivals - a.arrivals;
      if (sortBy === 'receipts') return b.receipts - a.receipts;
      return b.spendPerDay - a.spendPerDay;
    });
    setFilteredData(data);
  }, [search, sortBy]);

  const totalArrivals = TOURISM_DATA.reduce((sum, p) => sum + p.arrivals, 0);
  const totalReceipts = TOURISM_DATA.reduce((sum, p) => sum + p.receipts, 0);
  const avgSpend = Math.round(TOURISM_DATA.reduce((sum, p) => sum + p.spendPerDay, 0) / TOURISM_DATA.length);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">Estadísticas Turísticas</h1>
          </div>
          <p className="text-slate-400">UNWTO / OMT 2024</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Globe className="w-4 h-4" /> Llegadas
            </div>
            <div className="text-2xl font-bold text-blue-400">{(totalArrivals / 1000000).toFixed(0)}M</div>
            <div className="text-xs text-slate-500">visitantes</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <DollarSign className="w-4 h-4" /> Ingresos
            </div>
            <div className="text-2xl font-bold text-green-400">${(totalReceipts / 1000000000).toFixed(0)}B</div>
            <div className="text-xs text-slate-500">USD</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <TrendingUp className="w-4 h-4" /> Gasto/día
            </div>
            <div className="text-2xl font-bold text-yellow-400">${avgSpend}</div>
            <div className="text-xs text-slate-500">USD medio</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <Calendar className="w-4 h-4" /> Estancia
            </div>
            <div className="text-2xl font-bold text-purple-400">{Math.round(TOURISM_DATA.reduce((s, p) => s + p.stayAvg, 0) / TOURISM_DATA.length)}</div>
            <div className="text-xs text-slate-500">días media</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 mb-8 border border-blue-500/30">
          <div className="flex items-start gap-4">
            <Globe className="w-12 h-12 text-blue-400 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold mb-4">🌍 Top 15 Destinos Turísticos 2024</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {TOURISM_DATA.slice(0, 10).map((pais, i) => (
                  <div key={pais.code} className="bg-slate-800/50 rounded-lg p-3 text-center hover:bg-slate-700/50 transition-colors">
                    <div className="text-3xl mb-2">{FLAGS[pais.code] || '🌍'}</div>
                    <div className="font-semibold text-sm">{pais.country}</div>
                    <div className="text-xs text-blue-400">{(pais.arrivals / 1000000).toFixed(1)}M</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar destino..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('arrivals')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === 'arrivals' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                <Globe className="w-4 h-4 inline mr-1" />
                Llegadas
              </button>
              <button
                onClick={() => setSortBy('receipts')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === 'receipts' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                <DollarSign className="w-4 h-4 inline mr-1" />
                Ingresos
              </button>
              <button
                onClick={() => setSortBy('spendPerDay')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === 'spendPerDay' ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Gasto/día
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">#</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">País</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Llegadas</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Ingresos</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Gasto/día</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Estancia</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((pais) => (
                  <tr key={pais.code} className="border-t border-slate-700 hover:bg-slate-700/50">
                    <td className="px-4 py-3 font-medium">{pais.rank}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{FLAGS[pais.code] || '🌍'}</span>
                        <Link href={`/pais/${pais.code}`} className="hover:text-blue-400">{pais.country}</Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-blue-400">{(pais.arrivals / 1000000).toFixed(1)}M</td>
                    <td className="px-4 py-3 text-green-400">${(pais.receipts / 1000000000).toFixed(0)}B</td>
                    <td className="px-4 py-3 text-yellow-400">${pais.spendPerDay}</td>
                    <td className="px-4 py-3 text-purple-400">{pais.stayAvg} días</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mt-8">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Acerca de las Estadísticas
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Datos del Barómetro Mundial del Turismo de la Organización Mundial del Turismo (UNWTO/OMT).
            Cifras de 2024 basadas en arrivadas internacionales, ingresos por turismo y gasto medio diario.
          </p>
          <div className="flex gap-4 text-sm text-slate-500">
            <span>Fuente: UNWTO 2024</span>
            <span>•</span>
            <a href="https://www.unwto.org" target="_blank" className="text-blue-400 hover:underline">unwto.org</a>
          </div>
        </div>
      </div>
    </div>
  );
}
