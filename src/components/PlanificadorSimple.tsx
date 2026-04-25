'use client';

import { useState } from 'react';
import { Plane, Calendar, MapPin, Search, Loader2 } from 'lucide-react';

const photos = ['/photos/1.jpg', '/photos/2.jpg', '/photos/3.jpg', '/photos/4.jpg'];
const today = new Date();
const photoIndex = (today.getMonth() * 2 + today.getDate()) % photos.length;
const bgPhoto = photos[photoIndex];

export default function PlanificadorSimple() {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [fechas, setFechas] = useState('flexible');
  const [loading, setLoading] = useState(false);

  const handleAnalizar = async () => {
    if (!destino) return;
    setLoading(true);
    window.location.href = `/analisis?destino=${destino}&fecha=${fechas}`;
  };

  const paisesPopulares = [
    { code: 'jp', nombre: '🇯🇵 Japón' },
    { code: 'th', nombre: '🇹🇭 Tailandia' },
    { code: 'kr', nombre: '🇰🇷 Corea del Sur' },
    { code: 'id', nombre: '🇮🇩 Indonesia' },
    { code: 'vn', nombre: '🇻🇳 Vietnam' },
    { code: 'in', nombre: '🇮🇳 India' },
    { code: 'fr', nombre: '🇫🇷 Francia' },
    { code: 'it', nombre: '🇮🇹 Italia' },
    { code: 'es', nombre: '🇪🇸 España' },
    { code: 'pt', nombre: '🇵🇹 Portugal' },
    { code: 'mx', nombre: '🇲🇽 México' },
    { code: 'us', nombre: '🇺🇸 EEUU' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-lg shadow-blue-500/20 border border-blue-400/30 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: `url(${bgPhoto})` }}
        />
        <div className="relative z-10">
          <div className="text-center mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              ✈️ Planifica tu viaje en 30 segundos
            </h2>
            <p className="text-blue-100 text-sm">
              Selecciona tu destino y obtén análisis instantáneo
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-center justify-center">
            <div className="relative flex-1 w-full md:max-w-xs">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
              <select
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 rounded-xl font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">📍 ¿A dónde vas?</option>
                {paisesPopulares.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full md:max-w-xs">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
              <select
                value={fechas}
                onChange={(e) => setFechas(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 rounded-xl font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="flexible">📅 Fechas flexibles</option>
                <option value="ene">Enero 2026</option>
                <option value="feb">Febrero 2026</option>
                <option value="mar">Marzo 2026</option>
                <option value="abr">Abril 2026</option>
                <option value="may">Mayo 2026</option>
                <option value="jun">Junio 2026</option>
                <option value="jul">Julio 2026</option>
                <option value="ago">Agosto 2026</option>
                <option value="sep">Septiembre 2026</option>
                <option value="oct">Octubre 2026</option>
                <option value="nov">Noviembre 2026</option>
                <option value="dic">Diciembre 2026</option>
              </select>
            </div>

            <button
              onClick={handleAnalizar}
              disabled={!destino || loading}
              className="w-full md:w-auto px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Analizar
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-4 text-sm">
            <span className="text-blue-200">Destinos populares: </span>
            {paisesPopulares.slice(0, 4).map((p) => (
              <button
                key={p.code}
                onClick={() => setDestino(p.code)}
                className="px-2 py-1 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-xs"
              >
                {p.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}