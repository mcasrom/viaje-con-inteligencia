'use client';

import { useI18n } from '@/lib/i18n';
import { Globe, ChevronDown } from 'lucide-react';

const PRIMARY_LOCALES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
] as const;

export default function LanguageSelector() {
  const { locale, setLocale } = useI18n();
  const current = PRIMARY_LOCALES.find(l => l.code === locale) || PRIMARY_LOCALES[0];

  return (
    <div className="relative group">
      <button className="flex items-center gap-1.5 px-2 py-1.5 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800">
        <span className="text-sm">{current.flag}</span>
        <span className="text-xs font-medium hidden sm:inline">{current.name}</span>
        <ChevronDown className="w-3 h-3 text-slate-500" />
      </button>
      <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[1020] min-w-[160px] overflow-hidden">
        {PRIMARY_LOCALES.map((loc) => (
          <button
            key={loc.code}
            onClick={() => setLocale(loc.code as any)}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700 transition-colors flex items-center gap-2 ${
              locale === loc.code ? 'text-blue-400 bg-slate-700/50' : 'text-slate-300'
            }`}
          >
            <span>{loc.flag}</span>
            <span>{loc.name}</span>
            {locale === loc.code && <span className="ml-auto text-blue-400">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
