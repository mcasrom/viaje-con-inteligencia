'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Globe, Brain, FileText, Lock, Shield, ShieldCheck, Eye, Database,
  Calculator, TrendingUp, Route, Sparkles, Newspaper, Bell, Crown,
  Menu, X, BarChart3, ClipboardList, Navigation, ArrowRight,
  ChevronRight, Filter, Search, BookOpen
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useI18n } from '@/lib/i18n';
import { paisesData } from '@/data/paises';
import { TOTAL_PAISES } from '@/lib/constants';
import LanguageSelector from '@/components/LanguageSelector';
import OilPriceWidget from '@/components/OilPriceWidget';
import AirportDelaysWidget from '@/components/AirportDelaysWidget';
import PreferencesSelector from '@/components/PreferencesSelector';
import NewsletterPopup from '@/components/NewsletterPopup';
import NewsletterToast from '@/components/NewsletterToast';
import SloganPopup from '@/components/SloganPopup';
import InfografiaHomeCard from '@/components/InfografiaHomeCard';

const MapaInteractivo = dynamic(
  () => import('@/components/MapaInteractivo'),
  { ssr: false, loading: () => <MapFallback /> }
);

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
        <span className="text-slate-300 text-xs font-medium">Cargando mapa...</span>
      </div>
    </div>
  );
}

function HomeNavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useI18n();

  return (
    <header className="fixed top-16 left-0 right-0 z-[1010] pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 flex items-start justify-between gap-4 pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/50 px-4 py-2 flex items-center gap-3 shadow-xl">
          <img src="/logo.webp" alt="Viaje con Inteligencia" width="32" height="32" className="w-8 h-8 object-contain" />
          <div className="flex items-center gap-2">
            <div>
              <span className="text-white font-bold text-sm leading-tight">Viaje con Inteligencia</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[10px]">{TOTAL_PAISES} {t('topbar.countries')}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="flex items-center gap-1 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-400 font-medium">{t('topbar.updated')}</span>
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-blue-500/15 text-blue-400 text-[9px] font-bold rounded-full border border-blue-500/20">
              {t('topbar.maecLabel')}
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/50 px-2 py-1.5 flex items-center gap-1 shadow-2xl shadow-black/30">
            <Link href="/decidir" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all">
              <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">{t('topbar.decide')}</span>
            </Link>
            <div className="w-px h-5 bg-slate-700" />
            <Link href="/mapa" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all">
              <Globe className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">{t('topbar.map')}</span>
            </Link>
            <div className="w-px h-5 bg-slate-700" />
            <Link href="/blog" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all">
              <Newspaper className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">{t('topbar.blog')}</span>
            </Link>
            <Link href="/coste" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all">
              <Calculator className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">{t('topbar.cost')}</span>
            </Link>
            <Link href="/analisis" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all">
              <TrendingUp className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">{t('topbar.analysis')}</span>
            </Link>
            <Link href="/viajes/destacados" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all">
              <FileText className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">Destacados</span>
            </Link>
            <Link href="/itinerarios/espana" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-amber-400 hover:text-amber-300 rounded-xl hover:bg-amber-500/10 transition-all">
              <span className="text-lg">🇪🇸</span>
              <span className="text-[10px] font-medium">España</span>
            </Link>
            <div className="w-px h-5 bg-slate-700" />
            <Link href="/rutas/planificar" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all">
              <ArrowRight className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">{t('topbar.route')}</span>
            </Link>
            <Link href="/radius" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all">
              <Navigation className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">{t('topbar.radius')}</span>
            </Link>
            <div className="w-px h-5 bg-slate-700" />
            <Link href="/alertas" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all relative">
              <Bell className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">{t('topbar.alerts')}</span>
              <span className="absolute top-1 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </Link>
            <Link href="/premium" className="group flex flex-col items-center gap-0.5 px-4 py-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-all">
              <Crown className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">{t('topbar.premium')}</span>
            </Link>
            <div className="w-px h-5 bg-slate-700" />
            <LanguageSelector />
          </div>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/50 p-3 shadow-xl text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden max-w-7xl mx-auto px-4 mt-2 pointer-events-auto">
          <div className="bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/50 p-2 shadow-xl space-y-1">
            <Link href="/decidir" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Sparkles className="w-5 h-5 text-purple-400" />
              {t('mobile.decide30')}
            </Link>
            <Link href="/blog" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Newspaper className="w-5 h-5 text-cyan-400" />
              {t('mobile.blogOsint')}
            </Link>
            <Link href="/coste" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Calculator className="w-5 h-5 text-blue-400" />
              {t('mobile.tripCost')}
            </Link>
            <Link href="/analisis" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              {t('mobile.globalAi')}
            </Link>
            <Link href="/viajes/destacados" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <FileText className="w-5 h-5 text-green-400" />
              Itinerarios destacados
            </Link>
            <Link href="/radius" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Navigation className="w-5 h-5 text-cyan-400" />
              {t('mobile.smartRadius')}
            </Link>
            <Link href="/alertas" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-amber-400" />
              {t('mobile.maecAlerts')}
            </Link>
            <Link href="/dashboard/kpis" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              {t('mobile.dashboardKpis')}
            </Link>
            <Link href="/premium" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Crown className="w-5 h-5 text-amber-400" />
              {t('topbar.premium')}
            </Link>
            <div className="border-t border-slate-700 my-1" />
            <Link href="/paises" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <Globe className="w-5 h-5 text-blue-400" />
              {t('mobile.allCountries')}
            </Link>
            <Link href="/checklist" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <ClipboardList className="w-5 h-5 text-orange-400" />
              {t('mobile.checklist')}
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

function HomeSidePanel() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<{ country: string; text: string; level: 'warning' | 'info' }[]>([]);
  const [posts, setPosts] = useState<{ slug: string; title: string; date: string; category: string; readTime: string }[]>([]);

  useEffect(() => {
    const riskTexts: Record<string, string> = {
      'medio': t('alert.medium'),
      'alto': t('alert.high'),
      'muy-alto': t('alert.veryHigh'),
    };
    const realAlerts = Object.values(paisesData)
      .filter(p => ['medio', 'alto', 'muy-alto'].includes(p.nivelRiesgo))
      .slice(0, 5)
      .map(p => ({
        country: p.nombre,
        text: riskTexts[p.nivelRiesgo] || t('alert.fallback'),
        level: p.nivelRiesgo === 'muy-alto' || p.nivelRiesgo === 'alto' ? 'warning' as const : 'info' as const,
      }));
    setAlerts(realAlerts);
  }, []);

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

  const filteredCountries = search
    ? Object.values(paisesData).filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.codigo.includes(search.toLowerCase())
      ).slice(0, 8)
    : [];

  const tagColor = (category: string) => {
    const map: Record<string, string> = {
      'OSINT': 'bg-amber-500/20 text-amber-400',
      'ML': 'bg-purple-500/20 text-purple-400',
      'PAÍS': 'bg-blue-500/20 text-blue-400',
      'ANÁLISIS': 'bg-blue-500/20 text-blue-400',
      'MAEC': 'bg-green-500/20 text-green-400',
      'SEGURIDAD': 'bg-red-500/20 text-red-400',
    };
    return map[category] || 'bg-slate-500/20 text-slate-400';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try { return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }); }
    catch { return ''; }
  };

  return (
    <div className={`fixed left-4 top-28 z-[1005] transition-all duration-300 ${open ? 'w-72' : 'w-12'}`}>
      <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-xl overflow-hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between p-3 border-b border-slate-700/50 text-white hover:bg-slate-800 min-h-[44px]"
          aria-label={open ? t('aria.closePanel') : t('aria.openPanel')}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" />
            {open && <span className="text-sm font-medium">{t('panel.explore')}</span>}
          </div>
          <ChevronRight className={`w-4 h-4 transition-transform ${open ? '' : 'rotate-180'}`} />
        </button>

        {open && (
          <div className="p-3 space-y-4 max-h-[calc(100vh-10rem)] overflow-y-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('panel.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {filteredCountries.length > 0 && (
              <div className="space-y-1">
                {filteredCountries.map(p => (
                  <Link key={p.codigo} href={`/pais/${p.codigo}`} className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg px-3 py-2 transition-colors">
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
              <>
                <div className="space-y-2">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('panel.filterRisk')}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: t('panel.safe'), color: 'bg-green-500', risk: 'sin-riesgo' },
                      { label: t('panel.low'), color: 'bg-yellow-500', risk: 'bajo' },
                      { label: t('panel.medium'), color: 'bg-orange-500', risk: 'medio' },
                      { label: t('panel.high'), color: 'bg-red-500', risk: 'alto' },
                    ].map((f) => (
                      <Link key={f.label} href={`/paises?nivel=${f.risk}`}
                        className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${f.color}`} /> {f.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {alerts.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Bell className="w-3 h-3 text-amber-400" /> {t('panel.alertsTitle')}
                    </div>
                    <div className="space-y-2">
                      {alerts.map((a, i) => (
                        <div key={i} className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/30">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${a.level === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                            <span className="text-white text-xs font-medium">{a.country}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] leading-snug">{a.text}</p>
                        </div>
                      ))}
                    </div>
                    <Link href="/alertas" className="block text-center text-blue-400 text-xs font-medium hover:text-blue-300">{t('panel.viewAll')}</Link>
                  </div>
                )}

                <PreferencesSelector />

                <div className="space-y-2">
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('panel.tools')}</div>
                  <div className="space-y-1">
                    {[
                      { icon: <Calculator className="w-4 h-4 text-blue-400" />, label: t('tool.costCalc'), href: '/coste' },
                      { icon: <Route className="w-4 h-4 text-green-400" />, label: t('tool.safeRoutes'), href: '/rutas' },
                      { icon: <ClipboardList className="w-4 h-4 text-orange-400" />, label: t('tool.checklist'), href: '/checklist' },
                      { icon: <BarChart3 className="w-4 h-4 text-purple-400" />, label: t('tool.kpis'), href: '/dashboard/kpis' },
                      { icon: <Shield className="w-4 h-4 text-indigo-400" />, label: t('tool.insurance'), href: '/coste/seguros' },
                    ].map((tt, i) => (
                      <Link key={i} href={tt.href}
                        className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg px-3 py-2.5 transition-colors border border-transparent hover:border-slate-700"
                      >
                        {tt.icon} <span className="text-sm text-slate-300">{tt.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {posts.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-cyan-400" /> {t('panel.recentPosts')}
                      </div>
                      <Link href="/blog" className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-0.5">
                        {t('panel.all')} <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="space-y-1.5">
                      {posts.map((p, i) => (
                        <Link key={i} href={`/blog/${p.slug}`}
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomeBelowFold() {
  const { t } = useI18n();

  const riskCount = Object.values(paisesData).filter(
    p => p.nivelRiesgo === 'alto' || p.nivelRiesgo === 'muy-alto'
  ).length;

  return (
    <>
      <HomeSidePanel />

      <div id="mapa-global" className="relative w-full h-[70vh]">
        <MapaInteractivo fullScreen />
      </div>

      <section className="max-w-5xl mx-auto px-4 py-16 -mt-8 relative z-10">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{t('trust.title')}</h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">{t('trust.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: Globe, title: t('trust.officialData'), desc: t('trust.officialDataDesc'), color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { icon: Brain, title: t('trust.aiAssisted'), desc: t('trust.aiAssistedDesc'), color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { icon: FileText, title: t('trust.openMethod'), desc: t('trust.openMethodDesc'), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { icon: Lock, title: t('trust.privacy'), desc: t('trust.privacyDesc'), color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { icon: Shield, title: t('trust.independent'), desc: t('trust.independentDesc'), color: 'text-rose-400', bg: 'bg-rose-500/10' },
            ].map((item, i) => (
              <div key={i} className="text-center p-4 rounded-xl hover:bg-slate-700/30 transition-colors">
                <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <h3 className="text-white text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 pt-4 border-t border-slate-700/50">
            <Link href="/metodologia" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
              <ShieldCheck className="w-3.5 h-3.5" /> {t('trust.metodologia')}
            </Link>
            <span className="text-slate-700">·</span>
            <Link href="/transparencia" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
              <Eye className="w-3.5 h-3.5" /> {t('trust.transparencia')}
            </Link>
            <span className="text-slate-700">·</span>
            <Link href="/fuentes-osint" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
              <Database className="w-3.5 h-3.5" /> {t('trust.fuentes')}
            </Link>
            <span className="text-slate-700">·</span>
            <Link href="/seguridad" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
              <Lock className="w-3.5 h-3.5" /> {t('trust.seguridad')}
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pt-32 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{t('home.travelSafe')}</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">{t('home.subtitle2')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {[
            { icon: Globe, label: `${TOTAL_PAISES} ${t('home.countriesLink')}`, href: '/paises', color: 'text-blue-400' },
            { icon: Calculator, label: t('home.costCalc'), href: '/coste', color: 'text-blue-400' },
            { icon: TrendingUp, label: t('home.analysis'), href: '/analisis', color: 'text-amber-400' },
            { icon: Route, label: t('home.routes'), href: '/rutas', color: 'text-green-400' },
          ].map((item, i) => (
            <Link key={i} href={item.href} className="bg-slate-800/50 rounded-xl p-3 text-center hover:bg-slate-800 transition-colors border border-slate-700/50">
              <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-1.5`} />
              <span className="text-white text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-8">
          <OilPriceWidget />
          <AirportDelaysWidget />
        </div>

        <InfografiaHomeCard />

        <div className="max-w-3xl mx-auto mt-6">
          <p className="text-slate-400 text-sm text-center bg-slate-800/30 rounded-xl px-4 py-3 border border-slate-700/30">
            {t('home.riskSummary', { riskCount })}
          </p>
        </div>

        <div className="max-w-3xl mx-auto mt-12 border-t border-slate-800 pt-8">
          <h2 className="text-xl font-bold text-white mb-4">{t('home.seoTitle')}</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">{t('home.seoP1', { n: TOTAL_PAISES })}</p>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">{t('home.seoP2')}</p>
          <p className="text-slate-400 text-sm leading-relaxed">{t('home.seoP3')}</p>
        </div>

        <div className="max-w-3xl mx-auto mt-8 bg-gradient-to-r from-slate-800/50 to-slate-800/20 rounded-xl border border-slate-700/30 p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-slate-700">
              <Image src="/foto-autor.jpg" alt="Miguel Castillo" width={56} height={56}
                className="object-cover w-full h-full"
                style={{ objectPosition: 'center 20%' }} />
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-semibold text-sm">{t('about.title')}</h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">{t('about.text')}</p>
              <p className="text-slate-500 text-xs mt-1.5">{t('about.independent')}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Link href="/metodologia" className="text-xs text-blue-400 hover:text-blue-300">{t('about.metodologia')}</Link>
                <Link href="/manifiesto" className="text-xs text-blue-400 hover:text-blue-300">{t('about.manifiesto')}</Link>
                <Link href="/transparencia" className="text-xs text-blue-400 hover:text-blue-300">{t('about.transparencia')}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SloganPopup />
      <NewsletterToast />
      <NewsletterPopup />
    </>
  );
}
