'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import ScraperStatus from './ScraperStatus';
import NewsletterSignup from './NewsletterSignup';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <span className="text-2xl">👤</span>
            {t('footer.aboutProject')}
          </h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            {t('footer.bio.p1')}
          </p>
          <p className="text-slate-400 text-sm leading-relaxed mt-2">
            {t('footer.bio.p2')}
          </p>
          <p className="text-slate-400 text-sm leading-relaxed mt-2">
            {t('footer.bio.p3')}
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Viaje con Inteligencia</h3>
            <p className="text-slate-400 text-sm">
              Tu guía de viajes inteligentes. 100 países con riesgo MAEC, Chat IA, comparador, KPIs y herramientas Premium.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Herramientas</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">Mi Dashboard</Link></li>
              <li><Link href="/indices" className="text-slate-400 hover:text-white transition-colors">KPIs Global</Link></li>
              <li><Link href="/documentos" className="text-slate-400 hover:text-white transition-colors">Mis Documentos</Link></li>
              <li><Link href="/viajes" className="text-slate-400 hover:text-white transition-colors">Mis Viajes</Link></li>
              <li><Link href="/lead-magnet" className="text-slate-400 hover:text-white transition-colors">Checklist Premium</Link></li>
              <li><Link href="/premium" className="text-slate-400 hover:text-white transition-colors">Premium</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Explorar</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-slate-400 hover:text-white transition-colors">Mapa Mundial</Link></li>
              <li><Link href="/blog" className="text-slate-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/checklist" className="text-slate-400 hover:text-white transition-colors">Checklist</Link></li>
              <li><Link href="/comparar" className="text-slate-400 hover:text-white transition-colors">Comparar</Link></li>
              <li><Link href="/relojes" className="text-slate-400 hover:text-white transition-colors">Relojes</Link></li>
              <li><Link href="/eventos" className="text-slate-400 hover:text-white transition-colors">Eventos</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Legal + Info</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/metodologia" className="text-slate-400 hover:text-white transition-colors">Metodología MAEC</Link></li>
              <li><Link href="/fuentes-osint" className="text-slate-400 hover:text-white transition-colors">Fuentes OSINT</Link></li>
              <li><Link href="/legal" className="text-slate-400 hover:text-white transition-colors">Aviso Legal</Link></li>
              <li><Link href="/kpi" className="text-slate-400 hover:text-white transition-colors">Índice de Paz</Link></li>
              <li><Link href="/stats" className="text-slate-400 hover:text-white transition-colors">Estadísticas</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Comunidad</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:info@viajeinteligencia.com" className="text-slate-400 hover:text-white transition-colors">
                  Email
                </a>
              </li>
              <li>
                <a href="https://t.me/ViajeConInteligenciaBot" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  Bot Telegram
                </a>
              </li>
              <li>
                <a href="https://t.me/ViajeConInteligencia" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  Canal Telegram
                </a>
              </li>
              <li>
                <a href="https://github.com/mcasrom/viaje-con-inteligencia" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="/pwa" className="text-slate-400 hover:text-white transition-colors">
                  📱 Instalar App (PWA)
                </a>
              </li>
              <li>
                <a href="https://www.viajeinteligencia.com/feed.xml" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  RSS Feed
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-white mb-3">Newsletter</h4>
          <NewsletterSignup variant="footer" />
        </div>

        <div className="pt-6 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Viaje con Inteligencia" className="h-12 opacity-80" />
              <div>
                <p className="text-slate-500 text-sm">
                  © {new Date().getFullYear()} <strong className="text-slate-400">M.Castillo</strong>
                </p>
              </div>
              <ScraperStatus compact />
            </div>
            <p className="text-slate-600 text-xs text-center md:text-right max-w-xl">
              {t('footer.dataSource')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
