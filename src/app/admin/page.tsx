'use client';

import Link from 'next/link';
import { Activity, Bot, Bell, Shield, ArrowRight } from 'lucide-react';

export default function AdminPage() {
  const sections = [
    {
      href: '/admin/scraper-logs',
      icon: Activity,
      title: 'Scraper Logs',
      description: 'Historial de scraping MAEC y监控系统',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      href: '/admin/bot-stats',
      icon: Bot,
      title: 'Telegram Bot',
      description: 'Estadísticas del bot de Telegram',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      href: '/admin/alerts',
      icon: Bell,
      title: 'Alertas',
      description: 'Configuración de alertas de riesgo',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-400" />
            Panel de Administración
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-6 mb-8 border border-purple-700/30">
          <h2 className="text-2xl font-bold text-white mb-2">Panel Admin</h2>
          <p className="text-slate-300">
            Gestiona scrapers, bot y configuraciones del sistema.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.href}
                href={section.href}
                className="bg-slate-800/70 rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-colors group"
              >
                <div className={`w-12 h-12 ${section.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${section.color}`} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                  {section.title}
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors ml-auto" />
                </h3>
                <p className="text-slate-400 text-sm">
                  {section.description}
                </p>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}