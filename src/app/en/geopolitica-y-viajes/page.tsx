import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Globe, Shield, AlertTriangle, TrendingUp, Map, Users, Plane, Database, BookOpen, ArrowRight, ExternalLink, Flag, Radio, Activity, BarChart3, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Geopolitics and Travel | How Conflicts Affect Tourism',
  description: 'Analysis of geopolitical impact on travel: active conflicts, airspace closures, sanctions, GPI, GTI and how they affect the safety and cost of your destinations. 136 countries monitored.',
  robots: { index: false, follow: false },
    openGraph: {
    title: 'Geopolitics and Travel | Travel Intelligence',
    description: 'GPI, GTI, HDI indicators, active conflicts, airspace closures and OSINT alerts combined in a geopolitical analysis for travelers. 136 countries monitored.',
    url: 'https://www.viajeinteligencia.com/en/geopolitica-y-viajes',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Geopolitics and Travel | Travel Intelligence',
    description: 'How global conflicts affect the safety and cost of your travel. Active conflicts, airspace, sanctions and predictions.',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/en/geopolitica-y-viajes',
  },
  keywords: ['geopolitics travel', 'conflicts and tourism', 'geopolitical risk destination', 'airspace closure', 'travel sanctions', 'travel safety conflict', 'GPI travel', 'GTI tourism', 'geopolitical analysis traveler'],
};

const SECTIONS = [
  {
    id: 'geopolitics-travel',
    title: 'Geopolitics and Travel: An Inseparable Relationship',
    content: `Geopolitics largely determines the safety and cost of travel. A change in diplomatic relations can close airspace overnight. An economic sanction can spike local inflation. An armed conflict can turn a tourist destination into a risk zone in a matter of hours.

This platform continuously monitors geopolitical indicators that directly affect travelers: MAEC and US State Dept risk levels, airspace closures, active conflicts, economic sanctions and disruptive events.

The difference between traveling to a stable destination and one under geopolitical tension is not always obvious. Countries like Morocco, Turkey or Egypt have geopolitical risks that vary over time and that are crucial to know before booking.`,
  },
  {
    id: 'active-conflicts',
    title: 'Active Conflicts and Their Impact on Travel',
    content: `Armed conflicts have immediate and lasting effects on tourism. Airspace closure prevents flying to or over a country. Active fighting makes any visit unsafe. But the impact goes further: neighboring countries to a conflict zone also see reduced tourism, even if they are at peace.

The system automatically detects countries with closed or restricted airspace using OpenSky Network data. When a conflict country shows zero air traffic, an anomaly alert is generated. This has happened with Ukraine (Feb 2022), Russia (mutual closure with EU), Iran and Lebanon.

Additionally, conflicts affect oil prices, which is a key component of the Travel Cost Index (TCI). An escalation in the Middle East can spike flight costs globally. In 2026, instability on multiple fronts (Eastern Europe, Middle East, Horn of Africa) keeps Brent prices volatile.`,
  },
  {
    id: 'key-indicators',
    title: 'Key Geopolitical Indicators',
    content: `The Global Peace Index (GPI) measures peace in 163 countries across 23 indicators: internal and international conflicts, criminality, military spending and relations with neighbors. It is the reference indicator for assessing destination stability. Spain ranks high on the GPI; countries like Russia, Ukraine or Yemen rank at the bottom.

The Global Terrorism Index (GTI) quantifies the impact of terrorism. A country with high GTI is not necessarily unsafe for tourism (terrorism may be concentrated in non-tourist areas), but the index alerts to potential risk. Countries like Afghanistan, Iraq or Nigeria have very high GTI.

The Human Development Index (HDI) measures life expectancy, education and income. High HDI usually correlates with better health infrastructure and greater traveler safety. Nordic countries, Switzerland and Australia lead the ranking.

Inflation (CPI) is a geopolitical indicator that directly affects the traveler's wallet. High inflation makes accommodation, transport and food more expensive at the destination. Countries with runaway inflation (Argentina, Venezuela, Turkey) require more flexible budgets.

These indices are combined with MAEC levels, US State Dept and OSINT data to generate each country's composite risk score.`,
  },
  {
    id: 'airspace',
    title: 'Airspace and Travel Routes',
    content: `Airspace closure is one of the geopolitical consequences that most affects travelers. When a country closes its airspace due to conflict, airlines must reroute flights, lengthening travel times and increasing fuel costs.

The system monitors the airspace of 20 countries in conflict zones: Russia, Ukraine, Syria, Libya, Yemen, Afghanistan, Iraq, Somalia, Sudan, Iran, Israel and Lebanon. When an anomalous drop in air traffic is detected (below historical thresholds), it is recorded as an anomaly.

This data feeds the TCI: if there are active closures affecting routes to a destination, the cost index adjusts upward to reflect the greater access difficulty. For example, flying to Asia from Europe while avoiding Russian airspace adds hours and cost.`,
  },
  {
    id: 'sanctions',
    title: 'Sanctions and Travel Restrictions',
    content: `International sanctions can affect travelers in several ways: visa restrictions, direct flight bans, limitations on financial transactions and additional entry requirements.

Countries like Iran, North Korea, Venezuela or Russia have sanctions that affect Western travelers. Country pages include up-to-date information on visa requirements, entry restrictions and specific MAEC recommendations.

The system alerts when a country changes its MAEC risk level, which may reflect new sanctions or restrictions imposed by the EU or US. In 2026, the situation in countries like Nicaragua and Belarus remains dynamic, with periodic changes in recommendations.`,
  },
  {
    id: 'trends',
    title: 'Geopolitical Trends and Travel Planning',
    content: `Geopolitics does not only affect conflict destinations. Trade tensions between powers, migratory movements, diplomatic crises and government changes can alter the global travel landscape.

The platform enables informed travelers to make decisions with up-to-date data: check the risk level before booking, activate alerts for tense destinations, and use the travel radar to project how risk may evolve in coming months based on seasonality and geopolitical indicators.

For business travelers or expatriates, personalized alerts and GDELT sentiment analysis offer an additional window into a country's stability evolution. An abrupt change in tone_score can anticipate instability before official sources update their recommendations.`,
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    content: `Which countries are currently in active conflict? Ukraine, Syria, Yemen, Myanmar and Sudan have active armed conflicts. Israel and Lebanon are on high alert. Russia has restricted airspace for European airlines.

Is it safe to travel to a country neighboring a conflict zone? It depends on the country and distance to the conflict. Poland and Romania, neighbors of Ukraine, are safe. The Turkey-Syria border is a risk zone, but Istanbul is far from the conflict.

How do sanctions affect individual travelers? They may limit the use of international credit cards, prohibit direct flights, require special visas or restrict import/export of certain goods.

Do travel insurance companies cover conflict destinations? Generally no. Most insurers exclude countries with a do-not-travel advisory from MAEC or US State Dept. Always verify coverage before purchasing.

How often are geopolitical indicators updated? MAEC and US State Dept levels are updated daily. GPI, GTI, HDI and CPI are updated annually by their official sources. OSINT signals are processed every 6 hours.`,
  },
];

const INDICATORS = [
  { icon: Shield, name: 'GPI', desc: 'Global Peace Index', color: 'text-blue-400' },
  { icon: AlertTriangle, name: 'GTI', desc: 'Global Terrorism Index', color: 'text-red-400' },
  { icon: TrendingUp, name: 'HDI', desc: 'Human Development Index', color: 'text-emerald-400' },
  { icon: BarChart3, name: 'CPI', desc: 'Inflation by country', color: 'text-amber-400' },
  { icon: Radio, name: 'OSINT', desc: 'Open source signals', color: 'text-violet-400' },
  { icon: Globe, name: 'MAEC+US', desc: 'Dual diplomatic validation', color: 'text-indigo-400' },
];

const CONFLICT_MONITOR = [
  { code: 'RU', name: 'Russia', status: 'Restricted airspace' },
  { code: 'UA', name: 'Ukraine', status: 'Active conflict · Do not travel' },
  { code: 'IR', name: 'Iran', status: 'Very high · Active sanctions' },
  { code: 'IL', name: 'Israel', status: 'High · Active conflict' },
  { code: 'LB', name: 'Lebanon', status: 'Very high · Instability' },
  { code: 'SY', name: 'Syria', status: 'Extreme active conflict' },
  { code: 'YE', name: 'Yemen', status: 'Extreme active conflict' },
  { code: 'VE', name: 'Venezuela', status: 'Very high · Political crisis' },
];

const RELATED = [
  { href: '/en/analisis', label: 'Global Impact Analysis', desc: 'Conflicts, oil and tourism' },
  { href: '/en/predicciones', label: 'Risk Predictions', desc: 'Change probability by country' },
  { href: '/en/alertas', label: 'Geopolitical Alerts', desc: 'Risk change notifications' },
  { href: '/en/pulso-global', label: 'Global Pulse', desc: 'GDELT sentiment by country' },
  { href: '/en/mapa', label: 'Risk Map', desc: '136 countries with current MAEC level' },
  { href: '/en/transparencia', label: 'Transparency Center', desc: 'Sources and methodology' },
  { href: '/en/osint-para-viajeros', label: 'OSINT for Travelers', desc: 'Open source monitoring' },
  { href: '/en/travel-risk-intelligence', label: 'Travel Risk Intelligence', desc: 'Global travel intelligence overview' },
];

export default function EnGeopoliticaYViajesPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/en" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Globe className="w-5 h-5 text-rose-400" />
          <span className="text-xl font-bold text-white">Geopolitics & Travel</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            Geopolitics and Travel
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
            How conflicts, sanctions and global geopolitics affect 
            the safety and cost of your travel. Updated data, alerts 
            and predictive analysis for informed travelers.
          </p>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Article',
                  headline: 'Geopolitics and Travel | How Conflicts Affect Tourism',
                  description: 'Analysis of geopolitical impact on travel: active conflicts, airspace closures, sanctions and how they affect the safety and cost of your destinations.',
                  author: { '@type': 'Person', name: 'M. Castillo' },
                  publisher: { '@type': 'Organization', name: 'Viaje con Inteligencia' },
                  datePublished: '2026-05-27',
                  dateModified: '2026-05-27',
                  image: 'https://www.viajeinteligencia.com/preview_favicon.jpg',
                },
                {
                  '@type': 'FAQPage',
                  mainEntity: [
                    { '@type': 'Question', name: 'Which countries are currently in active conflict?', acceptedAnswer: { '@type': 'Answer', text: 'Ukraine, Syria, Yemen, Myanmar and Sudan have active armed conflicts. Israel and Lebanon are on high alert.' } },
                    { '@type': 'Question', name: 'Is it safe to travel to a country neighboring a conflict zone?', acceptedAnswer: { '@type': 'Answer', text: 'It depends on the country and distance to the conflict. Poland and Romania are safe; the Turkey-Syria border is a risk zone.' } },
                    { '@type': 'Question', name: 'How do sanctions affect individual travelers?', acceptedAnswer: { '@type': 'Answer', text: 'They may limit credit card use, prohibit direct flights, require special visas or restrict import/export of certain goods.' } },
                    { '@type': 'Question', name: 'Do travel insurance companies cover conflict destinations?', acceptedAnswer: { '@type': 'Answer', text: 'Generally no. Most insurers exclude countries with do-not-travel advisories. Always verify coverage before purchasing.' } },
                  ],
                },
              ],
            }),
          }}
        />

        <div className="grid md:grid-cols-3 gap-3 mb-12">
          {INDICATORS.map(s => (
            <div key={s.name} className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <span className="text-white font-medium text-sm">{s.name}</span>
                <p className="text-slate-500 text-xs">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Active Conflict Monitor
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {CONFLICT_MONITOR.map(c => (
              <Link key={c.code} href={`/pais/${c.code.toLowerCase()}`}
                className="flex items-center gap-3 bg-slate-800/80 rounded-lg p-3 hover:bg-slate-700/80 transition-colors group">
                <Flag className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm font-medium group-hover:text-rose-400 transition-colors">{c.name}</span>
                  <p className="text-slate-500 text-xs mt-0.5">{c.status}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {SECTIONS.map(section => (
            <section key={section.id} id={section.id} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-6">
              <h2 className="text-xl font-bold text-white mb-4">{section.title}</h2>
              {section.id === 'faq' ? (
                <div className="space-y-4">
                  {section.content.split('\n\n').filter(Boolean).map((p, i) => {
                    const qa = p.split('? ');
                    return qa.length > 1 ? (
                      <div key={i}>
                        <p className="text-white text-sm font-semibold mb-1">{qa[0]}?</p>
                        <p className="text-slate-300 text-sm leading-relaxed">{qa.slice(1).join('? ')}</p>
                      </div>
                    ) : (
                      <p key={i} className="text-slate-300 text-sm leading-relaxed">{p}</p>
                    );
                  })}
                </div>
              ) : (
                section.content.split('\n\n').filter(Boolean).map((p, i) => (
                  <p key={i} className="text-slate-300 text-sm leading-relaxed mb-3 last:mb-0">{p}</p>
                ))
              )}
            </section>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-rose-500/10 to-orange-500/10 rounded-xl border border-rose-500/20 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-rose-400" />
            Related Resources
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {RELATED.map(link => (
              <Link key={link.href} href={link.href}
                className="flex items-center gap-3 bg-slate-800/60 rounded-lg p-3 hover:bg-slate-700/60 transition-colors group">
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm font-medium group-hover:text-rose-400 transition-colors">{link.label}</span>
                  <p className="text-slate-500 text-xs mt-0.5">{link.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-300 text-sm font-medium mb-1">Important Notice</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Geopolitical situations change rapidly. Always check official 
                travel advisories (MAEC, US State Dept) before traveling, especially 
                to destinations with medium or high risk levels. Data is updated 
                daily but delays may occur.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/en" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
