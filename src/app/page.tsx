'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Search, Sparkles, Crown, Bell, Globe, Filter, 
  ChevronRight, Menu, X, Calculator, Route, ClipboardList, BarChart3, 
  BookOpen, Newspaper, ChevronRight as Chevron, Navigation, TrendingUp, Shield, ArrowRight
} from 'lucide-react';
import { paisesData } from '@/data/paises';
import { TOTAL_PAISES } from '@/lib/constants';
import LanguageSelector from '@/components/LanguageSelector';
import OilPriceWidget from '@/components/OilPriceWidget';
import AirportDelaysWidget from '@/components/AirportDelaysWidget';
import PreferencesSelector from '@/components/PreferencesSelector';
import NewsletterPopup from '@/components/NewsletterPopup';
import InfografiaHomeCard from '@/components/InfografiaHomeCard';

const MapaInteractivo = dynamic(
  () => import('@/components/MapaInteractivo'),
  { ssr: false, loading: () => <MapFallback /> }
);

// ============================================================
// SSR FALLBACK — SVG world map with risk dots (instant visual)
// ============================================================
const RISK_DOT_POSITIONS = [
  { cx: 20, cy: 35, r: 6, color: '#22c55e' },
  { cx: 18, cy: 45, r: 5, color: '#eab308' },
  { cx: 25, cy: 55, r: 4, color: '#eab308' },
  { cx: 30, cy: 60, r: 6, color: '#22c55e' },
  { cx: 28, cy: 65, r: 4, color: '#eab308' },
  { cx: 27, cy: 52, r: 4, color: '#f97316' },
  { cx: 24, cy: 48, r: 3, color: '#f97316' },
  { cx: 48, cy: 28, r: 3, color: '#22c55e' },
  { cx: 50, cy: 30, r: 4, color: '#22c55e' },
  { cx: 52, cy: 32, r: 3, color: '#22c55e' },
  { cx: 50, cy: 26, r: 3, color: '#22c55e' },
  { cx: 54, cy: 28, r: 3, color: '#22c55e' },
  { cx: 53, cy: 24, r: 3, color: '#22c55e' },
  { cx: 60, cy: 38, r: 4, color: '#dc2626' },
  { cx: 58, cy: 40, r: 3, color: '#dc2626' },
  { cx: 62, cy: 42, r: 4, color: '#991b1b' },
  { cx: 58, cy: 44, r: 3, color: '#dc2626' },
  { cx: 55, cy: 50, r: 4, color: '#22c55e' },
  { cx: 58, cy: 46, r: 4, color: '#dc2626' },
  { cx: 60, cy: 52, r: 4, color: '#991b1b' },
  { cx: 54, cy: 48, r: 3, color: '#dc2626' },
  { cx: 52, cy: 50, r: 3, color: '#f97316' },
  { cx: 72, cy: 35, r: 5, color: '#dc2626' },
  { cx: 75, cy: 30, r: 4, color: '#f97316' },
  { cx: 78, cy: 28, r: 5, color: '#22c55e' },
  { cx: 82, cy: 28, r: 4, color: '#22c55e' },
  { cx: 80, cy: 38, r: 4, color: '#22c55e' },
  { cx: 74, cy: 42, r: 4, color: '#f97316' },
  { cx: 76, cy: 44, r: 3, color: '#dc2626' },
  { cx: 85, cy: 62, r: 5, color: '#22c55e' },
  { cx: 88, cy: 58, r: 3, color: '#22c55e' },
  { cx: 58, cy: 22, r: 6, color: '#dc2626' },
  { cx: 55, cy: 26, r: 4, color: '#dc2626' },
];

function MapFallback() {
  return (
    <div className="relative w-full h-[70vh] bg-slate-900 overflow-hidden">
      <svg viewBox="0 0 100 80" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`vg-${i}`} x1={i * 5} y1="0" x2={i * 5} y2="80" stroke="#1e293b" strokeWidth="0.3" />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={`hg-${i}`} x1="0" y1={i * 5} x2="100" y2={i * 5} stroke="#1e293b" strokeWidth="0.3" />
        ))}
        {RISK_DOT_POSITIONS.map((dot, i) => (
          <g key={i}>
            <circle cx={dot.cx} cy={dot.cy} r={dot.r + 2} fill={dot.color} opacity="0.2" />
            <circle cx={dot.cx} cy={dot.cy} r={dot.r} fill={dot.color} opacity="0.7" />
          </g>
        ))}
      </svg>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <span className="text-slate-300 text-xs font-medium">Cargando mapa interactivo...</span>
      </div>
    </div>
  );
}

// ============================================================
// TOP BAR (Flotante)
// ============================================================
function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-16 left-0 right-0 z-[1010] pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 flex items-start justify-between gap-4 pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/50 px-4 py-2 flex items-center gap-3 shadow-xl">
          <img src="/logo.png" alt="Viaje con Inteligencia" className="w-8 h-8 object-contain" />
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-white font-bold text-sm leading-tight">Viaje con Inteligencia</h1>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[10px]">{TOTAL_PAISES} países</span>
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
            <div className="w-px h-5 bg-slate-700" />
            <Link href="/rutas/planificar" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all">
              <ArrowRight className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">Ruta</span>
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
            <div className="w-px h-5 bg-slate-700" />
            <LanguageSelector />
          </div>
        </div>

        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/50 p-3 shadow-xl text-white"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

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
            <div className="border-t border-slate-700 my-1" />
            <div className="px-4 py-2">
              <LanguageSelector />
            </div>
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
  const [open, setOpen] = useState(false);
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
    { icon: <Shield className="w-4 h-4 text-indigo-400" />, label: 'Seguro Viaje', href: '/coste/seguros' },
  ];

  return (
    <div className={`fixed left-4 top-28 z-[1005] transition-all duration-300 ${open ? 'w-72' : 'w-12'}`}>
      <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-xl overflow-hidden">
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
          <div className="p-3 space-y-4 max-h-[calc(100vh-10rem)] overflow-y-auto">
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

            {!search && <PreferencesSelector />}

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
// SINGLE CTA BUTTON — visible during loading & after map loads
// ============================================================
function PrimaryCTA() {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1020]">
      <Link
        href="/decidir"
        className="flex items-center gap-2 sm:gap-3 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl sm:rounded-2xl hover:opacity-90 transition-all shadow-2xl shadow-purple-500/25 text-sm sm:text-base font-semibold group"
      >
        <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
        Decide tu viaje en 30 segundos
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

// ============================================================
// HOME (Mapa 70vh dominante + contenido debajo)
// ============================================================
export default function HomeClient() {
  return (
    <div className="min-h-screen bg-slate-950">
      <TopBar />
      <SidePanel />

      <div className="relative w-full h-[70vh] pt-24 pb-24">
        <MapaInteractivo fullScreen />
        <PrimaryCTA />
      </div>

      <section className="max-w-7xl mx-auto px-4 pt-32 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Viaja informado, viaja seguro
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Mapa interactivo con datos oficiales MAEC, análisis ML y herramientas inteligentes para planificar tu viaje.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <Link href="/paises" className="bg-slate-800/50 rounded-xl p-3 text-center hover:bg-slate-800 transition-colors border border-slate-700/50">
            <Globe className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
            <span className="text-white text-xs font-medium">{TOTAL_PAISES} Países</span>
          </Link>
          <Link href="/coste" className="bg-slate-800/50 rounded-xl p-3 text-center hover:bg-slate-800 transition-colors border border-slate-700/50">
            <Calculator className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
            <span className="text-white text-xs font-medium">ML Coste</span>
          </Link>
          <Link href="/analisis" className="bg-slate-800/50 rounded-xl p-3 text-center hover:bg-slate-800 transition-colors border border-slate-700/50">
            <TrendingUp className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
            <span className="text-white text-xs font-medium">Análisis</span>
          </Link>
          <Link href="/rutas" className="bg-slate-800/50 rounded-xl p-3 text-center hover:bg-slate-800 transition-colors border border-slate-700/50">
            <Route className="w-5 h-5 text-green-400 mx-auto mb-1.5" />
            <span className="text-white text-xs font-medium">Rutas</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-8">
          <OilPriceWidget />
          <AirportDelaysWidget />
        </div>

        <InfografiaHomeCard />

        <div className="max-w-3xl mx-auto mt-6">
          <p className="text-slate-400 text-sm text-center bg-slate-800/30 rounded-xl px-4 py-3 border border-slate-700/30">
            {Object.values(paisesData).filter(p => p.nivelRiesgo === 'alto' || p.nivelRiesgo === 'muy-alto').length} países en riesgo alto o muy alto — consulta las alertas activas antes de viajar
          </p>
        </div>

        <div className="max-w-3xl mx-auto mt-12 border-t border-slate-800 pt-8">
          <h2 className="text-xl font-bold text-white mb-4">Mapa de Riesgos de Viaje con Inteligencia Artificial</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            <strong className="text-slate-300">Viaje con Inteligencia</strong> es la primera plataforma que combina el índice de riesgo MAEC español con análisis de Machine Learning para {TOTAL_PAISES} países. Nuestro <strong className="text-slate-300">índice IRV</strong> (Indicador de Riesgo de Viaje) cruza 16 KPIs — desde seguridad y terrorismo hasta coste de vida e inflación — para darte una puntuación única y actualizada.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            El motor de <strong className="text-slate-300">clustering ML</strong> agrupa destinos según tu perfil: presupuesto, tipo de viaje y preferencias. El <strong className="text-slate-300">Chat IA</strong> con Groq te da recomendaciones personalizadas en segundos. El sistema <strong className="text-slate-300">OSINT</strong> monitoriza 73+ fuentes en tiempo real: GDELT, USGS, GDACS, Reddit y RSS.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            Herramientas adicionales: calculadora de coste de viaje ajustada al petróleo, rutas temáticas de España, alertas de cambio de riesgo MAEC, generador de reclamaciones para aerolíneas y dashboard con KPIs globales de 6 índices internacionales.
          </p>
        </div>
      </section>
      <NewsletterPopup />
    </div>
  );
}
