import Link from 'next/link';
import { ArrowLeft, Database, Shield, Heart, Plane, Globe, AlertTriangle, Building2 } from 'lucide-react';

export const metadata = {
  title: 'Fuentes OSINT | Viaje con Inteligencia',
  description: 'Catálogo de fuentes OSINT utilizadas para análisis de riesgos de viaje',
};

export default function FuentesOSINTPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-400 font-medium mb-6">
            <Database className="w-5 h-5" />
            <span>Fuentes OSINT</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Catálogo de Fuentes OSINT</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Fuentes de datos abiertas utilizadas para el análisis de riesgos de viaje
          </p>
        </div>

        {/* Salud Pública */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-8 h-8 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Salud Pública, Pandemias y Enfermedades</h2>
          </div>
          
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Organismos ONU / OMS</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Fuente</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">URL</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Formato</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Frecuencia</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">WHO Disease Outbreak News</td>
                    <td className="py-3 px-4"><a href="https://www.who.int/emergencies/disease-outbreak-news" target="_blank" className="text-blue-400 hover:underline">who.int</a></td>
                    <td className="py-3 px-4">RSS + JSON</td>
                    <td className="py-3 px-4">Diaria</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">WHO Global Health Observatory</td>
                    <td className="py-3 px-4"><a href="https://www.who.int/data/gho" target="_blank" className="text-blue-400 hover:underline">who.int/data/gho</a></td>
                    <td className="py-3 px-4">API / CSV</td>
                    <td className="py-3 px-4">Mensual</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">PAHO (OPS)</td>
                    <td className="py-3 px-4"><a href="https://www.paho.org/en/epidemiological-alerts-and-updates" target="_blank" className="text-blue-400 hover:underline">paho.org</a></td>
                    <td className="py-3 px-4">RSS</td>
                    <td className="py-3 px-4">Semanal</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">ReliefWeb (OCHA)</td>
                    <td className="py-3 px-4"><a href="https://reliefweb.int" target="_blank" className="text-blue-400 hover:underline">reliefweb.int</a></td>
                    <td className="py-3 px-4">API JSON</td>
                    <td className="py-3 px-4">Continua</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Unión Europea</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Fuente</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">URL</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Formato</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">ECDC</td>
                    <td className="py-3 px-4"><a href="https://www.ecdc.europa.eu" target="_blank" className="text-blue-400 hover:underline">ecdc.europa.eu</a></td>
                    <td className="py-3 px-4">API / CSV</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">Copernicus EMS</td>
                    <td className="py-3 px-4"><a href="https://emergency.copernicus.eu" target="_blank" className="text-blue-400 hover:underline">emergency.copernicus.eu</a></td>
                    <td className="py-3 px-4">API / GeoTIFF</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">España - MAEC</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Fuente</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">URL</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Datos</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">MAEC (Ministerio AA.EE.)</td>
                    <td className="py-3 px-4"><a href="https://www.exteriores.gob.es/es/servicios/alertas" target="_blank" className="text-blue-400 hover:underline">exteriores.gob.es</a></td>
                    <td className="py-3 px-4">Niveles riesgo país, alertas viaje</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">EE.UU / Privadas</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Fuente</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">URL</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Formato</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">CDC Travelers' Health</td>
                    <td className="py-3 px-4"><a href="https://wwwnc.cdc.gov/travel" target="_blank" className="text-blue-400 hover:underline">cdc.gov/travel</a></td>
                    <td className="py-3 px-4">RSS / HTML</td>
                  </tr>
<tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">Eurostat Tourism</td>
                    <td className="py-3 px-4"><a href="https://ec.europa.eu/eurostat/web/tourism" target="_blank" className="text-blue-400 hover:underline">ec.europa.eu/tourism</a></td>
                    <td className="py-3 px-4">Turismo UE</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">IEP (Vision of Humanity)</td>
                    <td className="py-3 px-4"><a href="https://www.visionofhumanity.org" target="_blank" className="text-blue-400 hover:underline">visionofhumanity.org</a></td>
                    <td className="py-3 px-4">GPI (Paz), GTI (Terrorismo) - 46 países</td>
                  </tr>
<tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">UNWTO / UN Tourism</td>
                    <td className="py-3 px-4"><a href="https://www.unwto.org/tourism-statistics" target="_blank" className="text-blue-400 hover:underline">unwto.org</a> / <a href="https://www.unwto.org/unwto-tourism-recovery-tracker" target="_blank" className="text-blue-400 hover:underline">dashboard</a> / <a href="https://www.unwto.org/node/14904" target="_blank" className="text-blue-400 hover:underline">barometer</a></td>
                    <td className="py-3 px-4">Llegadas (102M Francia, 93.8M España), Ingresos ($215B USA, $106B España), Gasto/día, PIB turismo - 220 países</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">Macro</td>
                    <td className="py-3 px-4"><a href="https://macrotrends.net" target="_blank" className="text-blue-400 hover:underline">macrotrends.net</a></td>
                    <td className="py-3 px-4">IPC (Inflación) - 55 países</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">Open-Meteo</td>
                    <td className="py-3 px-4"><a href="https://open-meteo.com" target="_blank" className="text-blue-400 hover:underline">open-meteo.com</a></td>
                    <td className="py-3 px-4">Meteorología, alertas extremas</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">USGS</td>
                    <td className="py-3 px-4"><a href="https://earthquake.usgs.gov" target="_blank" className="text-blue-400 hover:underline">usgs.gov/earthquake</a></td>
                    <td className="py-3 px-4">Sismos en tiempo real</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-white">UNWTO / OMT</td>
                    <td className="py-3 px-4"><a href="https://www.unwto.org/tourism-statistics" target="_blank" className="text-blue-400 hover:underline">unwto.org</a></td>
                    <td className="py-3 px-4">Llegadas turísticas, ingresos, gasto/día, estancia media - 25 países</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Zonas Restringidas */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-8 h-8 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Espacios Cerrados y Zonas de Exclusión</h2>
          </div>
          
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Fuente</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Tipo de Información</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">NOTAM (FAA/ICAO)</td>
                    <td className="py-3 px-4">Zonas aéreas restringidas, TFRs</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">EUNAVFOR</td>
                    <td className="py-3 px-4">Zonas de conflicto marítimo</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3 px-4 font-medium text-white">IMO</td>
                    <td className="py-3 px-4">Alertas piratería, zonas marítimas</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-white">OFAC (US Treasury)</td>
                    <td className="py-3 px-4">Sanciones económicas</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-6">
          <p className="text-slate-300 text-sm">
            <strong className="text-white">Nota:</strong> Estas fuentes se utilizan para generar análisis y recomendaciones en Viaje con Inteligencia. 
            Los datos se actualizan con diferentes frecuencias. Verifica siempre las fuentes oficiales para decisiones de viaje críticas.
          </p>
        </div>
      </main>

      <footer className="bg-slate-800 border-t border-slate-700 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} M.Castillo - Viaje con Inteligencia | 
            <Link href="/legal" className="text-blue-400 hover:text-blue-300 ml-2">Aviso Legal</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
