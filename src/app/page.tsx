'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { 
  Search, Sparkles, Crown, Bell, Globe, Filter, 
  ChevronRight, Menu, X, Calculator, Route, ClipboardList, BarChart3, 
  MessageCircle, Mail, Send, ShieldCheck, FileText, Scale, BookOpen,
  Newspaper, ChevronRight as Chevron
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
            <Link href="/blog" className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm">
              <Newspaper className="w-4 h-4 text-cyan-400" />
              Blog OSINT
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
          <div className="bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/50 p-2 shadow-xl space-y-1">
            <Link href="/clustering" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Planificar con IA
            </Link>
            <Link href="/blog" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Newspaper className="w-5 h-5 text-cyan-400" />
              Blog OSINT
            </Link>
            <Link href="/alertas" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-amber-400" />
              Alertas MAEC
            </Link>
            <Link href="/coste" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Calculator className="w-5 h-5 text-blue-400" />
              Coste del Viaje
            </Link>
            <Link href="/premium" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Crown className="w-5 h-5 text-amber-400" />
              Premium
            </Link>
            <div className="border-t border-slate-700 my-1" />
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
// PANEL LATERAL (Flotante)
// ============================================================
function SidePanel() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(true);

  const alerts = [
    { country: 'México', text: 'Precaución por seguridad en varios estados', level: 'warning' },
    { country: 'Tailandia', text: 'Temporada de monzones activa', level: 'info' },
    { country: 'Francia', text: 'Huelgas de transporte en París', level: 'info' },
  ];

  const tools = [
    { icon: <Calculator className="w-4 h-4 text-blue-400" />, label: 'ML Coste Viajes', href: '/coste' },
    { icon: <Route className="w-4 h-4 text-green-400" />, label: 'Rutas Seguras', href: '/rutas' },
    { icon: <ClipboardList className="w-4 h-4 text-orange-400" />, label: 'Checklist', href: '/checklist' },
    { icon: <BarChart3 className="w-4 h-4 text-purple-400" />, label: 'Dashboard KPIs', href: '/dashboard/kpis' },
  ];

  const posts = [
    { 
      tag: 'OSINT', 
      tagColor: 'bg-amber-500/20 text-amber-400', 
      title: 'Viajar a Turquía en 2026: riesgo real vs percepción', 
      href: '/blog/turquia-2026',
      date: '28 May' 
    },
    { 
      tag: 'ML', 
      tagColor: 'bg-purple-500/20 text-purple-400', 
      title: 'Cuánto cuesta viajar a Japón: modelo ML desglosado', 
      href: '/blog/coste-japon-ml',
      date: '22 May' 
    },
    { 
      tag: 'PAÍS', 
      tagColor: 'bg-blue-500/20 text-blue-400', 
      title: 'Tailandia 2026: visado, riesgo y coste real', 
      href: '/blog/tailandia-2026',
      date: '15 May' 
    },
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
          <div className="p-3 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
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

            {/* Tools Section */}
            <div className="space-y-2">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Herramientas</div>
              <div className="space-y-1">
                {tools.map((t, i) => (
                  <Link 
                    key={i}
                    href={t.href}
                    className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg px-3 py-2.5 transition-colors border border-transparent hover:border-slate-700"
                  >
                    {t.icon}
                    <span className="text-sm text-slate-300">{t.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Blog Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-cyan-400" />
                  Últimos análisis
                </div>
                <Link href="/blog" className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-0.5">
                  Todos <Chevron className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-1.5">
                {posts.map((p, i) => (
                  <Link 
                    key={i}
                    href={p.href}
                    className="block bg-slate-800/30 hover:bg-slate-800/60 rounded-lg px-3 py-2.5 transition-colors border border-transparent hover:border-slate-700/50"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${p.tagColor}`}>{p.tag}</span>
                      <span className="text-slate-600 text-[9px]">{p.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug line-clamp-2">{p.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// BOTTOM BAR (Flotante)
// ============================================================
function BottomBar() {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
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
          href="/coste" 
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
        >
          <Calculator className="w-4 h-4 text-blue-400" />
          Coste viaje
        </Link>
      </div>
    </div>
  );
}

// ============================================================
// FOOTER OVERLAY (Flotante)
// ============================================================
function FooterOverlay() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
      <div className="bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pt-6 pb-2 pointer-events-auto">
        <div className="max-w-7xl mx-auto px-4">
          {/* Legal & Contact Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
            {/* Legal */}
            <div className="flex items-center gap-4">
              <Link href="/privacidad" className="hover:text-slate-300 transition-colors flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Privacidad
              </Link>
              <Link href="/cookies" className="hover:text-slate-300 transition-colors flex items-center gap-1">
                <FileText className="w-3 h-3" /> Cookies
              </Link>
              <Link href="/aviso-legal" className="hover:text-slate-300 transition-colors flex items-center gap-1">
                <Scale className="w-3 h-3" /> Aviso Legal
              </Link>
            </div>

            {/* Contact */}
            <div className="flex items-center gap-4">
              <a 
                href="https://wa.me/34600000000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-green-400 transition-colors flex items-center gap-1"
              >
                <MessageCircle className="w-3 h-3" /> WhatsApp
              </a>
              <a 
                href="mailto:contacte@viajeconinteligencia.es" 
                className="hover:text-blue-400 transition-colors flex items-center gap-1"
              >
                <Mail className="w-3 h-3" /> Contacto
              </a>
              <a 
                href="https://t.me/ViajeConInteligenciaBot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors flex items-center gap-1"
              >
                <Send className="w-3 h-3" /> Telegram
              </a>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="text-center text-[9px] text-slate-600 mt-1">
            © {new Date().getFullYear()} Viaje con Inteligencia. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
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

      {/* Footer */}
      <FooterOverlay />

      {/* Map Background */}
      <div className="w-full h-full">
        <MapaInteractivo fullScreen />
      </div>
    </div>
  );
}
