'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { 
  Search, Sparkles, Crown, Bell, Globe, Filter, 
  ChevronRight, AlertTriangle, Menu, X 
} from 'lucide-react';

const MapaInteractivo = dynamic(
  () => import('@/components/MapaInteractivo'),
  { ssr: false, loading: () => <div className="w-full h-screen bg-slate-900" /> }
);

// ============================================================
// TOP BAR (Flotante)
// ============================================================
function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 pt-4 flex items-start justify-between gap-4 pointer-events-auto">
        {/* Logo + Brand */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/50 px-4 py-3 flex items-center gap-3 shadow-xl">
          <Globe className="w-6 h-6 text-blue-400" />
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">Viaje con Inteligencia</h1>
            <p className="text-slate-400 text-[10px]">107 países · Datos MAEC</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/50 px-2 py-2 flex items-center gap-1 shadow-xl">
            <Link href="/clustering" className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Planificar IA
            </Link>
            <Link href="/alertas" className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm relative">
              <Bell className="w-4 h-4 text-amber-400" />
              Alertas
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Link>
            <Link href="/premium" className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm">
              <Crown className="w-4 h-4 text-amber-400" />
              Premium
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/50 p-3 shadow-xl text-white"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden max-w-7xl mx-auto px-4 mt-2 pointer-events-auto">
          <div className="bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/50 p-2 shadow-xl">
            <Link href="/clustering" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Planificar con IA
            </Link>
            <Link href="/alertas" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-amber-400" />
              Alertas MAEC
            </Link>
            <Link href="/premium" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Crown className="w-5 h-5 text-amber-400" />
              Premium
            </Link>
            <Link href="/paises" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Globe className="w-5 h-5 text-blue-400" />
              Todos los países
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// ============================================================
// PANEL LATERAL (Flotante) - Búsqueda + Filtros + Alertas
// ============================================================
function SidePanel() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(true);

  const alerts = [
    { country: 'México', text: 'Precaución por seguridad en varios estados', level: 'warning' },
    { country: 'Tailandia', text: 'Temporada de monzones activa', level: 'info' },
    { country: 'Francia', text: 'Huelgas de transporte en París', level: 'info' },
  ];

  return (
    <div className={`fixed left-4 top-24 z-40 transition-all duration-300 ${open ? 'w-72' : 'w-12'}`}>
      <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-xl overflow-hidden">
        {/* Toggle */}
        <button 
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between p-3 border-b border-slate-700/50 text-white hover:bg-slate-800"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" />
            {open && <span className="text-sm font-medium">Explorar</span>}
          </div>
          <ChevronRight className={`w-4 h-4 transition-transform ${open ? '' : 'rotate-180'}`} />
        </button>

        {open && (
          <div className="p-3 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar país..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Quick Filters */}
            <div className="space-y-2">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Filtrar por riesgo</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Seguro', color: 'bg-green-500' },
                  { label: 'Bajo', color: 'bg-yellow-500' },
                  { label: 'Medio', color: 'bg-orange-500' },
                  { label: 'Alto', color: 'bg-red-500' },
                ].map((f) => (
                  <button key={f.label} className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
                    <span className={`w-2.5 h-2.5 rounded-full ${f.color}`} />
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="space-y-2">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Bell className="w-3 h-3 text-amber-400" />
                Últimas alertas
              </div>
              <div className="space-y-2">
                {alerts.map((a, i) => (
                  <div key={i} className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        a.level === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <span className="text-white text-xs font-medium">{a.country}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-snug">{a.text}</p>
                  </div>
                ))}
              </div>
              <Link href="/alertas" className="block text-center text-blue-400 text-xs font-medium hover:text-blue-300">
                Ver todas las alertas →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// BOTTOM BAR (Flotante) - CTA Secundario
// ============================================================
function BottomBar() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/50 px-6 py-3 shadow-xl flex items-center gap-6">
        <Link 
          href="/paises" 
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
        >
          <Globe className="w-4 h-4 text-blue-400" />
          Ver países
        </Link>
        <div className="w-px h-4 bg-slate-700" />
        <Link 
          href="/clustering" 
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-semibold"
        >
          <Sparkles className="w-4 h-4" />
          Planificar viaje
        </Link>
        <div className="w-px h-4 bg-slate-700" />
        <Link 
          href="/dashboard/kpis" 
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
        >
          Estadísticas
        </Link>
      </div>
    </div>
  );
}

// ============================================================
// HOME (Mapa fullscreen)
// ============================================================
export default function Home() {
  return (
    <div className="fixed inset-0 bg-slate-950">
      {/* Top Bar */}
      <TopBar />

      {/* Side Panel */}
      <SidePanel />

      {/* Bottom Bar */}
      <BottomBar />

      {/* Map Background */}
      <div className="w-full h-full">
        <MapaInteractivo fullScreen />
      </div>
    </div>
  );
}
