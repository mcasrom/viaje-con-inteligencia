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

        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Viaje con Inteligencia</h3>
            <p className="text-slate-400 text-sm">
              Tu guía de viajes seguros. Mapa de riesgos según MAEC español.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Navegación</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-slate-400 hover:text-white transition-colors">Mapa Mundial</Link></li>
              <li><Link href="/relojes" className="text-slate-400 hover:text-white transition-colors">🌐 Relojes Mundiales</Link></li>
              <li><Link href="/alertas" className="text-slate-400 hover:text-white transition-colors">🔔 Alertas</Link></li>
              <li><Link href="/checklist" className="text-slate-400 hover:text-white transition-colors">Checklist</Link></li>
              <li><Link href="/comparar" className="text-slate-400 hover:text-white transition-colors">⚖️ Comparar</Link></li>
              <li><Link href="/pwa" className="text-slate-400 hover:text-white transition-colors">📱 Instalar App</Link></li>
              <li><Link href="/premium" className="text-slate-400 hover:text-white transition-colors">Premium</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/metodologia" className="text-slate-400 hover:text-white transition-colors">Metodología MAEC</Link></li>
              <li><Link href="/fuentes-osint" className="text-slate-400 hover:text-white transition-colors">📡 Fuentes OSINT</Link></li>
              <li><Link href="/legal" className="text-slate-400 hover:text-white transition-colors">Aviso Legal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:info@viajeinteligencia.com" className="text-slate-400 hover:text-white transition-colors">
                  info@viajeinteligencia.com
                </a>
              </li>
              <li>
                <a href="https://t.me/ViajeConInteligenciaBot" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  @ViajeConInteligenciaBot
                </a>
              </li>
              <li>
                <a href="https://www.viajeinteligencia.com/feed.xml" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
                  </svg>
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
              <p className="text-slate-500 text-sm">
                © {new Date().getFullYear()} <strong className="text-slate-400">M.Castillo</strong> - Viaje con Inteligencia
              </p>
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
