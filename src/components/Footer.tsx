'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import ScraperStatus from './ScraperStatus';

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
              <li><Link href="/pwa" className="text-slate-400 hover:text-white transition-colors">📱 Instalar App</Link></li>
              <li><Link href="/premium" className="text-slate-400 hover:text-white transition-colors">Premium</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/metodologia" className="text-slate-400 hover:text-white transition-colors">Metodología MAEC</Link></li>
              <li><Link href="/legal" className="text-slate-400 hover:text-white transition-colors">Aviso Legal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:mybloggingnotes@gmail.com" className="text-slate-400 hover:text-white transition-colors">
                  mybloggingnotes@gmail.com
                </a>
              </li>
              <li>
                <a href="https://t.me/ViajeConInteligenciaBot" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  @ViajeConInteligenciaBot
                </a>
              </li>
            </ul>
          </div>
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
