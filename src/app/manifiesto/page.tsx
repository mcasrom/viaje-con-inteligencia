import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, TrendingUp, Zap, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Manifesto | Travel Intelligence - Viaje Inteligencia',
  description: 'Viaje Inteligencia is evolving into a travel intelligence platform focused on real-time situational awareness for travelers.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/manifiesto',
  },
};

export default function ManifiestoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-slate-700 ring-2 ring-blue-500/30">
              <Image src="/foto-autor.jpg" alt="Miguel Castillo" width={64} height={64}
                className="object-cover w-full h-full"
                style={{ objectPosition: 'center 20%' }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Miguel Castillo</h1>
              <p className="text-slate-400">Founder, Viaje Inteligencia</p>
            </div>
          </div>
        </div>

        {/* Title section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Travel Intelligence: A New Phase for Viaje Inteligencia</h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            The world is becoming more complex for travelers.
          </p>
        </div>

        {/* Opening statement */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 mb-10">
          <p className="text-slate-300 text-lg leading-relaxed mb-6">
            Geopolitical instability, health risks, climate events, and infrastructure disruptions are no longer rare exceptions — they are part of global travel reality.
          </p>
          <p className="text-slate-300 text-lg leading-relaxed">
            This is why Viaje Inteligencia is evolving.
          </p>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mt-6">
            <p className="text-white text-lg font-semibold leading-relaxed">
              Viaje Inteligencia is transitioning into a travel intelligence platform focused on real-time situational awareness for travelers.
            </p>
          </div>
        </div>

        {/* What we focus on */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">What we focus on</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Shield, label: 'Geopolitical risk analysis' },
              { icon: Eye, label: 'Travel disruption monitoring' },
              { icon: Shield, label: 'Health and safety advisories' },
              { icon: TrendingUp, label: 'Climate and infrastructure risks' },
              { icon: Zap, label: 'AI-powered travel intelligence' },
            ].map((item) => (
              <div key={item.label} className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
                <item.icon className="w-5 h-5 text-blue-400 mb-2" />
                <h3 className="text-white font-semibold text-sm">{item.label}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* What this means */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">What this means</h2>
          <p className="text-slate-300 leading-relaxed mb-6">
            Instead of only publishing travel content, Viaje Inteligencia now aims to provide:
          </p>
          <div className="space-y-3">
            {[
              'Clear, structured travel risk understanding',
              'Weekly intelligence briefings',
              'Real-time alerts for relevant events',
              'Visual risk maps and summaries',
              'Practical insights for smarter travel decisions',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                <p className="text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who this is for */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Who this is for</h2>
          <div className="flex flex-wrap gap-3">
            {['Digital nomads', 'Frequent travelers', 'Expats', 'Remote workers', 'Organizations with international mobility needs'].map((item) => (
              <span key={item} className="bg-blue-500/10 border border-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium">
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* Our direction */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20">
            <h2 className="text-2xl font-bold text-white mb-4">The direction</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-4">
              The objective is to help travelers understand risk before they travel, not after problems appear.
            </p>
            <p className="text-slate-400 leading-relaxed mb-4">
              This is not about fear.
            </p>
            <p className="text-blue-400 text-lg font-semibold">
              It is about awareness, preparation, and better decisions.
            </p>
          </div>
        </section>

        {/* Next step */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Next steps</h2>
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <p className="text-slate-300 text-lg leading-relaxed mb-4">
              Starting this week:
            </p>
            <ul className="space-y-3">
              {[
                'Weekly Travel Risk Briefings',
                'Real-time alerts via Telegram',
                'Visual global risk snapshots',
                'Structured travel intelligence updates',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-white text-xl font-bold">
                Welcome to the new phase of Viaje Inteligencia.
              </p>
              <p className="text-blue-400 text-lg font-semibold mt-1">
                Travel smarter. Stay aware.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Should you travel to this destination now?</h2>
            <p className="text-slate-400 mb-6 max-w-lg mx-auto">
              This is the question Viaje Inteligencia answers. With real data, not opinions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/osint" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                View live intelligence
              </Link>
              <Link href="/decidir" className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                Where should I go?
              </Link>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <div className="text-center border-t border-slate-700 pt-8">
          <p className="text-slate-500 text-sm">
            Travel smarter. Stay aware.
          </p>
          <p className="text-slate-600 text-xs mt-2">
            — Miguel Castillo, May 2026
          </p>
        </div>
      </div>
    </div>
  );
}
