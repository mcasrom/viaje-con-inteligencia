import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Globe, AlertTriangle, Users, TrendingUp, MapPin, Calendar, Eye, Star, Heart, Bell } from 'lucide-react';
import { getTodosLosPaises, getLabelRiesgo, NivelRiesgo } from '@/data/paises';

export const metadata: Metadata = {
  title: 'Estadísticas Globales | Viaje con Inteligencia',
  description: 'Estadísticas de riesgos por países, continentes y más. Datos actualizados del MAEC español.',
};

export default async function StatsPage() {
  const paises = getTodosLosPaises();
  const totalPaises = paises.length;
  
  const riesgoStats = paises.reduce((acc, p) => {
    acc[p.nivelRiesgo] = (acc[p.nivelRiesgo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const continenteStats = paises.reduce((acc, p) => {
    if (!acc[p.continente]) {
      acc[p.continente] = { total: 0, sinRiesgo: 0, bajo: 0, medio: 0, alto: 0, muyAlto: 0 };
    }
    acc[p.continente].total++;
    if (p.nivelRiesgo === 'sin-riesgo') acc[p.continente].sinRiesgo++;
    else if (p.nivelRiesgo === 'bajo') acc[p.continente].bajo++;
    else if (p.nivelRiesgo === 'medio') acc[p.continente].medio++;
    else if (p.nivelRiesgo === 'alto') acc[p.continente].alto++;
    else if (p.nivelRiesgo === 'muy-alto') acc[p.continente].muyAlto++;
    return acc;
  }, {} as Record<string, { total: number; sinRiesgo: number; bajo: number; medio: number; alto: number; muyAlto: number }>);

  const riskColors: Record<NivelRiesgo, { bg: string; text: string; bar: string }> = {
    'sin-riesgo': { bg: 'bg-green-500', text: 'text-green-400', bar: 'bg-green-500' },
    'bajo': { bg: 'bg-yellow-500', text: 'text-yellow-400', bar: 'bg-yellow-500' },
    'medio': { bg: 'bg-orange-500', text: 'text-orange-400', bar: 'bg-orange-500' },
    'alto': { bg: 'bg-red-500', text: 'text-red-400', bar: 'bg-red-500' },
    'muy-alto': { bg: 'bg-red-900', text: 'text-red-600', bar: 'bg-red-900' },
  };

  const riskOrder: NivelRiesgo[] = ['sin-riesgo', 'bajo', 'medio', 'alto', 'muy-alto'];
  const paisesSinRiesgo = riesgoStats['sin-riesgo'] || 0;
  const paisesRiesgoBajo = riesgoStats['bajo'] || 0;
  const paisesRiesgoMedio = riesgoStats['medio'] || 0;
  const paisesRiesgoAlto = (riesgoStats['alto'] || 0) + (riesgoStats['muy-alto'] || 0);

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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-400" />
            Estadísticas Globales
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Datos actualizados sobre riesgos por país según el Ministerio de Asuntos Exteriores español.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
            <Globe className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">{totalPaises}</div>
            <div className="text-slate-400 text-sm">Países analizados</div>
          </div>
          <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/30 text-center">
            <AlertTriangle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-green-400">{paisesSinRiesgo + paisesRiesgoBajo}</div>
            <div className="text-green-300 text-sm">Seguros o bajo riesgo</div>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-6 border border-orange-500/30 text-center">
            <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-orange-400">{paisesRiesgoMedio}</div>
            <div className="text-orange-300 text-sm">Riesgo medio</div>
          </div>
          <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/30 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-red-400">{paisesRiesgoAlto}</div>
            <div className="text-red-300 text-sm">Alto/muy alto riesgo</div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Eye className="w-6 h-6 text-blue-400" />
            Distribución Global de Riesgos
          </h2>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex flex-wrap gap-4 mb-6">
              {riskOrder.map((risk) => {
                const count = riesgoStats[risk] || 0;
                const percentage = Math.round((count / totalPaises) * 100);
                return (
                  <div key={risk} className="flex-1 min-w-[150px]">
                    <div className="flex justify-between text-sm mb-1">
                      <span className={riskColors[risk].text}>{getLabelRiesgo(risk)}</span>
                      <span className="text-slate-400">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${riskColors[risk].bar} rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-400" />
            Riesgos por Continente
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(continenteStats).map(([continente, stats]) => {
              const safePct = Math.round((stats.sinRiesgo / stats.total) * 100);
              return (
                <div key={continente} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white text-lg">{continente}</h3>
                    <span className="text-slate-400 text-sm">{stats.total} países</span>
                  </div>
                  <div className="space-y-2">
                    {riskOrder.map((risk) => {
                      const count = risk === 'sin-riesgo' ? stats.sinRiesgo 
                        : risk === 'bajo' ? stats.bajo 
                        : risk === 'medio' ? stats.medio 
                        : risk === 'alto' ? stats.alto 
                        : stats.muyAlto;
                      const pct = Math.round((count / stats.total) * 100);
                      if (count === 0) return null;
                      return (
                        <div key={risk} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${riskColors[risk].bg}`} />
                          <span className="text-slate-400 text-sm flex-1">{getLabelRiesgo(risk)}</span>
                          <span className="text-slate-300 text-sm">{count}</span>
                          <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${riskColors[risk].bar} rounded-full`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Seguridad general</span>
                    <span className={`font-bold ${
                      safePct >= 70 ? 'text-green-400' : 
                      safePct >= 40 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {safePct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            Mapa de Calor de Riesgos
          </h2>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {riskOrder.map((risk) => (
                <div key={risk} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-full">
                  <div className={`w-3 h-3 rounded-full ${riskColors[risk].bg}`} />
                  <span className="text-slate-300 text-sm">{getLabelRiesgo(risk)}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {paises.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((pais) => (
                <Link
                  key={pais.codigo}
                  href={`/pais/${pais.codigo}`}
                  className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-700 transition-colors"
                  title={`${pais.nombre}: ${getLabelRiesgo(pais.nivelRiesgo)}`}
                >
                  <span className="text-2xl">{pais.bandera}</span>
                  <div className={`w-2 h-2 rounded-full mt-1 ${riskColors[pais.nivelRiesgo].bg}`} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              Cobertura Global
            </h3>
            <ul className="space-y-3 text-slate-300">
              <li className="flex justify-between">
                <span>Total países</span>
                <span className="font-bold text-white">{totalPaises}</span>
              </li>
              <li className="flex justify-between">
                <span>Continentes</span>
                <span className="font-bold text-white">{Object.keys(continenteStats).length}</span>
              </li>
              <li className="flex justify-between">
                <span>Con embajadas</span>
                <span className="font-bold text-white">{paises.filter(p => p.contactos.length > 0).length}</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Alertas Activas
            </h3>
            <ul className="space-y-3 text-slate-300">
              <li className="flex justify-between">
                <span>Sin riesgo</span>
                <span className="font-bold text-green-400">{paisesSinRiesgo}</span>
              </li>
              <li className="flex justify-between">
                <span>Riesgo bajo</span>
                <span className="font-bold text-yellow-400">{paisesRiesgoBajo}</span>
              </li>
              <li className="flex justify-between">
                <span>Riesgo medio</span>
                <span className="font-bold text-orange-400">{paisesRiesgoMedio}</span>
              </li>
              <li className="flex justify-between">
                <span>Alto riesgo</span>
                <span className="font-bold text-red-400">{paisesRiesgoAlto}</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Servicios
            </h3>
            <ul className="space-y-3 text-slate-300">
              <li className="flex justify-between">
                <span>Blog posts</span>
                <span className="font-bold text-white">27+</span>
              </li>
              <li className="flex justify-between">
                <span>Usuarios Telegram</span>
                <span className="font-bold text-white">50+</span>
              </li>
              <li className="flex justify-between">
                <span>Checklist items</span>
                <span className="font-bold text-white">80+</span>
              </li>
              <li className="flex justify-between">
                <span>Actualización</span>
                <span className="font-bold text-white">{new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm">
            Datos basados en recomendaciones del MAEC español • Actualizado: {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </main>
    </div>
  );
}