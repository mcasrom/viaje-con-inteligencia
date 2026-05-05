'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import ScraperStatus from './ScraperStatus';
import NewsletterSignup from './NewsletterSignup';

import { getGlobalStats } from '@/lib/global-stats';

const stats = getGlobalStats();

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
              Tu guía de viajes inteligentes. {stats.totalPaises} países con riesgo MAEC, Chat IA, comparador, KPIs y herramientas Premium.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Herramientas</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">Mi Dashboard</Link></li>
              <li><Link href="/" className="text-slate-400 hover:text-white transition-colors">KPIs Global</Link></li>
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
              <li><Link href="/coste" className="text-slate-400 hover:text-white transition-colors">Coste de Viaje</Link></li>
              <li><Link href="/checklist" className="text-slate-400 hover:text-white transition-colors">Checklist</Link></li>
              <li><Link href="/comparar" className="text-slate-400 hover:text-white transition-colors">Comparar</Link></li>
              <li><Link href="/rutas" className="text-slate-400 hover:text-white transition-colors">Rutas</Link></li>
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
              <li><Link href="/transparencia" className="text-slate-400 hover:text-white transition-colors">Transparencia</Link></li>
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
                <a href="https://mastodon.social/@viajeinteligencia" target="_blank" rel="me noreferrer" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.586-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.513-1.27-3.513-2.423 0-.178.026-.355.072-.526.279-1.018 1.117-2.325 3.012-2.325 2.337 0 3.562 1.874 3.812 2.593.052.148.096.297.133.447.417 1.768 1.593 3.274 3.99 3.274 1.173 0 2.054-.306 2.606-.759.594-.488.953-.971 1.304-1.748.28-.622.473-1.323.598-2.05.186-1.071.264-2.136.319-3.173.012-.221.014-.443.019-.665a10.17 10.17 0 0 1-.188 2.403c.463.27.87.574 1.214.909.8.78 1.35 1.72 1.566 2.84.26 1.394.216 2.78-.137 4.163-.53 2.074-2.155 3.64-4.496 4.351-1.04.323-2.107.46-3.213.416-1.482-.055-2.876-.404-4.113-.904-1.1-.444-2.055-1.073-2.824-1.93l-.011-.012A10.086 10.086 0 0 1 .934 9.23c-.016-.027-.028-.056-.037-.085-.031-.091-.062-.182-.084-.272-.036-.144-.055-.287-.055-.427 0-.157.022-.312.071-.459.239-.747 1.011-1.374 2.088-1.711L4.16 5.635c-.37.327-.683.726-.913 1.182a5.444 5.444 0 0 0-.48 1.373c-.05.264-.077.53-.077.8 0 .818.192 1.598.53 2.272.565 1.129 1.508 2.019 2.685 2.571.886.415 1.875.636 2.924.636 2.4 0 4.436-1.398 5.55-3.511a.046.046 0 0 0 .014-.037v-1.651c-.005-.012-.012-.026-.012-.038 0-.027.005-.053.017-.078.053-.114.097-.247.097-.402 0-.325-.168-.618-.433-.793a.038.038 0 0 0-.026-.008c.013-.093.024-.195.024-.305 0-.87-.333-1.684-.897-2.312-.613-.687-1.444-1.102-2.394-1.253-.142-.017-.283-.032-.422-.042z"/></svg>
                  Mastodon
                </a>
              </li>
              <li>
                <a href="https://twitter.com/viajeinteligencia" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  Twitter / X
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
