'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Search, Sparkles, Crown, Bell, Globe, Filter, 
  ChevronRight, Menu, X, Calculator, Route, ClipboardList, BarChart3, 
  MessageCircle, Mail, Send, ShieldCheck, FileText, Scale, BookOpen,
  Newspaper, ChevronRight as Chevron, Navigation, TrendingUp
} from 'lucide-react';
import { paisesData } from '@/data/paises';

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
        <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/50 px-4 py-2 flex items-center gap-3 shadow-xl">
          <img src="/logo.png" alt="Viaje con Inteligencia" className="w-8 h-8 object-contain" />
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-white font-bold text-sm leading-tight">Viaje con Inteligencia</h1>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[10px]">107 países</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="flex items-center gap-1 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-400 font-medium">Datos actualizados</span>
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-blue-500/15 text-blue-400 text-[9px] font-bold rounded-full border border-blue-500/20">
              MAEC May 2026
            </span>
          </div>
        </div>

        {/* Desktop Nav — Dock pill */}
        <div className="hidden md:flex items-center gap-2">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/50 px-2 py-1.5 flex items-center gap-1 shadow-2xl shadow-black/30">
            <Link href="/decidir" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all">
              <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">Decidir</span>
            </Link>
            <div className="w-px h-5 bg-slate-700" />
            <Link href="/blog" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all">
              <Newspaper className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">Blog</span>
            </Link>
            <Link href="/coste" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all">
              <Calculator className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">Coste</span>
            </Link>
            <Link href="/analisis" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all">
              <TrendingUp className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">Análisis</span>
            </Link>
            <Link href="/rutas" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all">
              <Route className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">Rutas</span>
            </Link>
            <Link href="/radius" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all">
              <Navigation className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">Radius</span>
            </Link>
            <div className="w-px h-5 bg-slate-700" />
            <Link href="/alertas" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all relative">
              <Bell className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">Alertas</span>
              <span className="absolute top-1 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </Link>
            <Link href="/premium" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all">
              <Crown className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">Premium</span>
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
            <Link href="/decidir" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Decide en 30 seg
            </Link>
            <Link href="/blog" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Newspaper className="w-5 h-5 text-cyan-400" />
              Blog OSINT
            </Link>
            <Link href="/coste" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Calculator className="w-5 h-5 text-blue-400" />
              Coste del Viaje
            </Link>
            <Link href="/analisis" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Análisis Global ML
            </Link>
            <Link href="/rutas" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Route className="w-5 h-5 text-green-400" />
              Rutas Seguras
            </Link>
            <Link href="/radius" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Navigation className="w-5 h-5 text-cyan-400" />
              Radio Inteligente
            </Link>
            <Link href="/alertas" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-amber-400" />
              Alertas MAEC
            </Link>
            <Link href="/dashboard/kpis" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Dashboard KPIs
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
            <Link href="/checklist" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <ClipboardList className="w-5 h-5 text-orange-400" />
              Checklist Viaje
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
interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  readTime: string;
}

function useAlerts() {
  const [alerts, setAlerts] = useState<{ country: string; text: string; level: 'warning' | 'info' }[]>([]);

  useEffect(() => {
    const riskTexts: Record<string, string> = {
      'medio': 'Revisar recomendaciones antes de viajar',
      'alto': 'Viaje no esencial desaconsejado',
      'muy-alto': 'Evitar todo viaje — zona de conflicto',
    };
    const realAlerts = Object.values(paisesData)
      .filter(p => ['medio', 'alto', 'muy-alto'].includes(p.nivelRiesgo))
      .slice(0, 5)
      .map(p => ({
        country: p.nombre,
        text: riskTexts[p.nivelRiesgo] || 'Consultar advertencias',
        level: p.nivelRiesgo === 'muy-alto' || p.nivelRiesgo === 'alto' ? 'warning' as const : 'info' as const,
      }));
    setAlerts(realAlerts);
  }, []);

  return alerts;
}

function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch('/api/posts?page=1&perPage=5&sort=recent')
      .then(r => r.json())
      .then(data => {
        if (data.posts) {
          setPosts(data.posts.slice(0, 3).map((p: any) => ({
            slug: p.slug,
            title: p.title,
            date: p.date,
            category: p.category || 'ANÁLISIS',
            readTime: p.readTime || '5 min',
          })));
        }
      })
      .catch(() => {});
  }, []);

  return posts;
}

function tagColor(category: string) {
  const map: Record<string, string> = {
    'OSINT': 'bg-amber-500/20 text-amber-400',
    'ML': 'bg-purple-500/20 text-purple-400',
    'PAÍS': 'bg-blue-500/20 text-blue-400',
    'ANÁLISIS': 'bg-blue-500/20 text-blue-400',
    'MAEC': 'bg-green-500/20 text-green-400',
    'SEGURIDAD': 'bg-red-500/20 text-red-400',
  };
  return map[category] || 'bg-slate-500/20 text-slate-400';
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

function SidePanel() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(true);
  const alerts = useAlerts();
  const posts = useBlogPosts();

  const filteredCountries = search
    ? Object.values(paisesData).filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.codigo.includes(search.toLowerCase())
      ).slice(0, 8)
    : [];

  const tools = [
    { icon: <Calculator className="w-4 h-4 text-blue-400" />, label: 'ML Coste Viajes', href: '/coste' },
    { icon: <Route className="w-4 h-4 text-green-400" />, label: 'Rutas Seguras', href: '/rutas' },
    { icon: <ClipboardList className="w-4 h-4 text-orange-400" />, label: 'Checklist', href: '/checklist' },
    { icon: <BarChart3 className="w-4 h-4 text-purple-400" />, label: 'Dashboard KPIs', href: '/dashboard/kpis' },
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

            {/* Search results */}
            {filteredCountries.length > 0 && (
              <div className="space-y-1">
                {filteredCountries.map(p => (
                  <Link
                    key={p.codigo}
                    href={`/pais/${p.codigo}`}
                    className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg px-3 py-2 transition-colors"
                  >
                    <span className="text-sm">{p.bandera}</span>
                    <span className="text-xs text-slate-300">{p.nombre}</span>
                    <span className={`ml-auto w-2 h-2 rounded-full ${
                      p.nivelRiesgo === 'sin-riesgo' ? 'bg-green-500' :
                      p.nivelRiesgo === 'bajo' ? 'bg-emerald-500' :
                      p.nivelRiesgo === 'medio' ? 'bg-orange-500' :
                      p.nivelRiesgo === 'alto' ? 'bg-red-500' : 'bg-red-700'
                    }`} />
                  </Link>
                ))}
              </div>
            )}

            {/* Quick Filters */}
            {!search && (
              <div className="space-y-2">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Filtrar por riesgo</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Seguro', color: 'bg-green-500', risk: 'sin-riesgo' },
                    { label: 'Bajo', color: 'bg-yellow-500', risk: 'bajo' },
                    { label: 'Medio', color: 'bg-orange-500', risk: 'medio' },
                    { label: 'Alto', color: 'bg-red-500', risk: 'alto' },
                  ].map((f) => (
                    <Link
                      key={f.label}
                      href={`/paises?nivel=${f.risk}`}
                      className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${f.color}`} />
                      {f.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Alerts — datos reales de MAEC */}
            {!search && alerts.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Bell className="w-3 h-3 text-amber-400" />
                  Alertas MAEC activas
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
            )}

            {/* Tools Section */}
            {!search && (
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
            )}

            {/* Blog Section — datos reales de Supabase */}
            {!search && posts.length > 0 && (
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
                      href={`/blog/${p.slug}`}
                      className="block bg-slate-800/30 hover:bg-slate-800/60 rounded-lg px-3 py-2.5 transition-colors border border-transparent hover:border-slate-700/50"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${tagColor(p.category)}`}>{p.category}</span>
                        {p.date && <span className="text-slate-600 text-[9px]">{formatDate(p.date)}</span>}
                      </div>
                      <p className="text-xs text-slate-300 leading-snug line-clamp-2">{p.title}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
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
          href="/decidir" 
          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-semibold"
        >
          <Sparkles className="w-4 h-4" />
          Decide en 30 seg
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
