'use client';

import { useMemo } from 'react';
import { Euro, Server, Globe, Cpu, Calendar, TrendingUp, ExternalLink } from 'lucide-react';

interface CostItem {
  id: string;
  concepto: string;
  categoria: string;
  icon: string;
  periodicidad: 'mensual' | 'anual';
  importe: number;
  desde: string;
  notas?: string;
}

const COSTOS: CostItem[] = [
  {
    id: 'dominio',
    concepto: 'viajeinteligencia.com',
    categoria: 'Infraestructura',
    icon: '🌐',
    periodicidad: 'anual',
    importe: 10,
    desde: '2026-05-01',
    notas: 'Registro y renovación dominio .com vía Cloudflare Registrar',
  },
  {
    id: 'opencode',
    concepto: 'OpenCode AI',
    categoria: 'Herramientas',
    icon: '🤖',
    periodicidad: 'mensual',
    importe: 10,
    desde: '2026-05-01',
    notas: 'Suscripción CLI asistente IA para desarrollo',
  },
  {
    id: 'hetzner',
    concepto: 'Servidor Cloud (Hetzner)',
    categoria: 'Infraestructura',
    icon: '🖥️',
    periodicidad: 'mensual',
    importe: 5,
    desde: '2026-05-01',
    notas: 'CX22 — 2 vCPU, 4GB RAM, 40GB SSD. Proxy Nginx + Node.js',
  },
];

const CATEGORIAS = ['Infraestructura', 'Herramientas'] as const;

function costeMensual(item: CostItem): number {
  return item.periodicidad === 'mensual' ? item.importe : +(item.importe / 12).toFixed(2);
}

function costeAnual(item: CostItem): number {
  return item.periodicidad === 'anual' ? item.importe : +(item.importe * 12).toFixed(2);
}

function mesesDesde(fecha: string): number {
  const start = new Date(fecha);
  const now = new Date();
  const diff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return Math.max(1, diff + 1);
}

export default function AdminCostes() {
  const now = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }, []);

  const totalMensual = useMemo(() => +COSTOS.reduce((s, c) => s + costeMensual(c), 0).toFixed(2), []);
  const totalAnual = useMemo(() => +COSTOS.reduce((s, c) => s + costeAnual(c), 0).toFixed(2), []);

  const desdeFecha = '1 de mayo de 2026';
  const mesesTranscurridos = mesesDesde('2026-05-01');

  const acumulado = useMemo(() => {
    return +COSTOS.reduce((s, c) => {
      if (c.periodicidad === 'mensual') return s + c.importe * mesesTranscurridos;
      return s + c.importe;
    }, 0).toFixed(2);
  }, []);

  const costesPorCategoria = useMemo(() => {
    const map: Record<string, { mensual: number; anual: number }> = {};
    for (const cat of CATEGORIAS) {
      const items = COSTOS.filter(c => c.categoria === cat);
      map[cat] = {
        mensual: +items.reduce((s, c) => s + costeMensual(c), 0).toFixed(2),
        anual: +items.reduce((s, c) => s + costeAnual(c), 0).toFixed(2),
      };
    }
    return map;
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Euro className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Transparencia Financiera</h1>
          </div>
          <a
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm"
          >
            ← Volver al panel
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Narrative */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-900/40 border border-emerald-700/40 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-2">Operación y Sostenibilidad</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Viaje con Inteligencia opera desde mayo de 2026 con una estructura de costes mínima y transparente.
                No hay inversores, no hay publicidad — todo el proyecto se financia directamente.
                Mantenemos cada servicio esencial para ofrecer inteligencia de viaje gratuita,
                con un modelo sostenible que prioriza herramientas open-source e infraestructura eficiente.
              </p>
            </div>
          </div>
        </section>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
            <p className="text-slate-400 text-xs mb-1">Coste mensual</p>
            <p className="text-3xl font-bold text-emerald-400">{totalMensual.toFixed(2)}€</p>
            <p className="text-slate-500 text-xs mt-1">/mes</p>
          </div>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
            <p className="text-slate-400 text-xs mb-1">Coste anual</p>
            <p className="text-3xl font-bold text-emerald-400">{totalAnual.toFixed(2)}€</p>
            <p className="text-slate-500 text-xs mt-1">/año</p>
          </div>
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
            <p className="text-slate-400 text-xs mb-1">Acumulado desde {desdeFecha}</p>
            <p className="text-3xl font-bold text-white">{acumulado.toFixed(2)}€</p>
            <p className="text-slate-500 text-xs mt-1">{mesesTranscurridos} meses de operación</p>
          </div>
        </div>

        {/* Full Cost Table */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-400" />
            <h2 className="text-white font-bold">Desglose detallado</h2>
            <span className="text-slate-500 text-sm ml-auto">Actualizado: {now}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-700/50">
                  <th className="text-left px-6 py-3 text-slate-400 font-medium">Servicio</th>
                  <th className="text-left px-6 py-3 text-slate-400 font-medium">Categoría</th>
                  <th className="text-left px-6 py-3 text-slate-400 font-medium">Periodicidad</th>
                  <th className="text-right px-6 py-3 text-slate-400 font-medium">Importe</th>
                  <th className="text-right px-6 py-3 text-slate-400 font-medium">/mes</th>
                  <th className="text-right px-6 py-3 text-slate-400 font-medium">/año</th>
                  <th className="text-left px-6 py-3 text-slate-400 font-medium">Desde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {COSTOS.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <div>
                          <p className="text-white font-medium">{item.concepto}</p>
                          {item.notas && <p className="text-slate-500 text-xs mt-0.5">{item.notas}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {item.periodicidad === 'mensual' ? 'Mensual' : 'Anual'}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-mono font-bold">
                      {item.importe.toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-400 font-mono">
                      {costeMensual(item).toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-400 font-mono">
                      {costeAnual(item).toFixed(2)}€
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(item.desde).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-emerald-900/20 border-t-2 border-emerald-700/50">
                  <td className="px-6 py-4" colSpan={3}>
                    <span className="text-white font-bold">TOTAL</span>
                  </td>
                  <td className="px-6 py-4 text-right text-white font-mono font-bold">
                    —
                  </td>
                  <td className="px-6 py-4 text-right text-emerald-300 font-mono font-bold text-base">
                    {totalMensual.toFixed(2)}€
                  </td>
                  <td className="px-6 py-4 text-right text-emerald-300 font-mono font-bold text-base">
                    {totalAnual.toFixed(2)}€
                  </td>
                  <td className="px-6 py-4" />
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Per Category */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-white font-bold mb-4">Costes por categoría</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIAS.map((cat) => {
              const c = costesPorCategoria[cat];
              return (
                <div key={cat} className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
                  <p className="text-slate-400 text-xs mb-1">{cat}</p>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-emerald-400 font-bold text-lg">{c.mensual.toFixed(2)}€</p>
                      <p className="text-slate-500 text-xs">/mes</p>
                    </div>
                    <div>
                      <p className="text-emerald-400 font-bold text-lg">{c.anual.toFixed(2)}€</p>
                      <p className="text-slate-500 text-xs">/año</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Evolution Timeline */}
        <section className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-400" />
            Proyección anual
          </h2>
          <div className="space-y-4">
            {[2026, 2027].map((year) => {
              const mesesYear = year === 2026 ? 8 : 12; // May-Dec 2026 = 8 months
              const total = +COSTOS.reduce((s, c) => {
                if (c.periodicidad === 'mensual') return s + c.importe * mesesYear;
                return s + c.importe;
              }, 0).toFixed(2);
              return (
                <div key={year} className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">{year}</p>
                    <p className="text-emerald-400 font-bold text-lg">{total.toFixed(2)}€</p>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (total / 200) * 100)}%` }}
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-1">
                    {year === 2026 ? 'Mayo — Diciembre (8 meses estimados)' : 'Enero — Diciembre (12 meses)'}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer Note */}
        <p className="text-slate-500 text-xs text-center pb-8 leading-relaxed">
          Todos los importes incluyen IVA donde aplica. Los servicios gratuitos (Supabase, Cloudflare Free Tier,
          GitHub Actions, Resend, Groq, OpenWeather, ip-api.com, Nominatim, Overpass API) no se reflejan en esta tabla.
          Revisado periódicamente como parte de la transparencia operativa del proyecto.
        </p>
      </main>
    </div>
  );
}
