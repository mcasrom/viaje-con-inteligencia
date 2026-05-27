import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Globe, Newspaper, Shield, AlertTriangle, Database, TrendingUp, MessageSquare, Bell, ExternalLink, ArrowRight, BookOpen, Radio, Users, Search, Activity, HelpCircle, MapPin, Clock, Bug } from 'lucide-react';

export const metadata: Metadata = {
  title: 'OSINT for Travelers | Open Source Intelligence for Safe Travel',
  description: 'Complete guide to OSINT applied to travel: how to monitor geopolitical risks, natural disasters, health outbreaks and safety using open sources and AI analysis. 136 countries, 14 sources.',
  openGraph: {
    title: 'OSINT for Travelers | Travel Intelligence',
    description: 'Learn to use open sources to monitor risks, incidents and safety in your travel destinations. 14 OSINT sources, alerts and predictive analysis.',
    url: 'https://www.viajeinteligencia.com/en/osint-para-viajeros',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OSINT for Travelers | Travel Intelligence',
    description: 'Learn to use open sources to monitor risks in your destinations. Early warnings with GDELT, Reddit, USGS and more.',
  },
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/en/osint-para-viajeros',
  },
  keywords: ['OSINT travelers', 'open source intelligence travel', 'travel risk monitoring', 'GDELT travelers', 'OSINT travel alerts', 'travel safety intelligence'],
};


const SECTIONS = [
  {
    id: 'what-is-osint',
    title: 'What is OSINT for Travelers?',
    content: `OSINT (Open Source Intelligence) is the discipline of collecting and analyzing information from publicly available sources to obtain actionable intelligence. Applied to travel, it means systematically monitoring risk signals in your destinations using open data.

The platform automates this process: 14 OSINT sources are continuously monitored, signals are classified by type and urgency, and incidents are automatically detected when multiple sources converge on the same event.

The key difference between OSINT for travelers and traditional official recommendations is speed. While an official advisory may take days to update after an incident, OSINT signals can detect the event in minutes. The challenge lies in filtering noise and validating information — precisely what we automate with AI.`,
  },
  {
    id: 'key-sources',
    title: 'Key OSINT Sources for Travelers',
    content: `GDELT (Global Database of Events, Language, and Tone) monitors news media in 100+ languages and assigns a tone_score to each article. When sentiment toward a country turns negative, it can be an early indicator of instability. GDELT processes millions of articles daily and is the primary source for global sentiment analysis.

Reddit (r/travel, r/solotravel, r/digitalnomad) provides first-hand experiences from travelers on the ground. The system classifies these signals with AI (Groq/Llama 3.1) to detect incidents reported by the community. Unlike news, Reddit captures the real-time perception of those actually traveling.

USGS monitors earthquakes in real time. Every significant seismic event is cross-referenced with affected countries to generate automatic alerts. We use the USGS Earthquake Hazards feed with location, depth and magnitude data.

GDACS (Global Disaster Alert and Coordination System) from the UN provides natural disaster alerts: cyclones, floods, tsunamis and volcanic eruptions. It is the most authoritative source for large-scale disasters.

WHO Disease Outbreak News is the most recent addition. It provides official epidemic outbreak alerts (Ebola, Marburg, Nipah, monkeypox, cholera) with data from the World Health Organization. Critical for early detection of health threats.

OpenSky Network enables airspace monitoring. A sudden drop in air traffic over a country may indicate airspace closure due to conflict — something that has occurred in Ukraine, Russia, Iran and Lebanon in recent years.

ReliefWeb from the UN provides humanitarian emergency reports, complementing GDACS with more detailed analysis of complex crises.`,
  },
  {
    id: 'how-it-works',
    title: 'How the System Works',
    content: `The OSINT pipeline operates 24/7 in four phases:

Collection captures signals from all sources every 6 hours (Reddit, RSS, WHO) or in real time (GDELT, USGS, GDACS). Each signal includes location, timestamp and content. RSS sources (AP, BBC Breaking, Sky News, Reuters World) provide breaking news with global coverage.

Classification uses keyword algorithms for GDELT and RSS (zero cost) and Groq AI for Reddit (first-hand experience detection). Each signal receives a category (security, health, weather, transport, conflict) and an urgency level. The GDELT tone_score is preserved and compared with Groq classification for cross-validation.

Incident detection groups matching signals: if 2+ sources report the same event type in the same location, an incident is created with automatically assigned severity. The more independent sources converge, the higher the confidence in the incident.

Notification sends alerts to users subscribed to that country via web or Telegram, with incident details, sources and recommendations. Alerts are prioritized by severity: critical ones (active conflicts, major disasters) are sent immediately; informational ones are grouped in the daily digest.`,
  },
  {
    id: 'incident-types',
    title: 'Types of Incidents Detected',
    content: `The system detects multiple types of incidents, each with different expiration thresholds:

Security incidents: protests, violence, kidnappings, terrorism. Expire between 12 and 72 hours depending on severity. Protests can escalate quickly, which is why the system monitors their evolution every 6 hours.

Natural incidents: earthquakes, hurricanes, floods, eruptions. Follow the real event cycle. A hurricane may be active for days; an isolated earthquake is archived after 24 hours without aftershocks.

Travel incidents: transport strikes, airport closures, health outbreaks. Updated as the situation evolves. Health outbreaks (like Ebola) have continuous monitoring while the WHO maintains the alert.

Each incident can receive an analyst note (via admin panel) and community rating (1-5 stars) to improve information quality. Ratings help calibrate automatic severity: if users report that a protest was peaceful, the system adjusts its weight.`,
  },
  {
    id: 'sentiment-analysis',
    title: 'GDELT Sentiment Analysis',
    content: `The GDELT tone_score measures news sentiment toward a country on a scale from -10 (extremely negative) to +10 (extremely positive). The system calculates 7-day and 30-day moving averages and detects trends.

When sentiment crosses negative thresholds, the urgency of associated alerts is automatically increased. An alert with very negative sentiment can escalate from informational to urgent.

Sentiment alerts are generated when: the 7-day average drops below -5 (informational alert), below -8 (caution), or when sentiment volatility exceeds 30% in a week. Volatility is important: a country may have neutral sentiment but if it fluctuates sharply, it indicates instability.

The tone_score is cross-referenced with other sources. If GDELT shows negative sentiment toward a country and simultaneously there are Reddit signals of travelers reporting incidents, alert confidence increases significantly.`,
  },
  {
    id: 'practical-applications',
    title: 'Practical Applications for Travelers',
    content: `Before booking a flight, check the public OSINT feed to see if there are active incidents at your destination. If traveling to areas with alerts, use the SOS button with geolocation to find emergency phone numbers, consular contacts and nearby hospitals.

During your trip, activate personalized alerts for your destinations. You will receive Telegram or dashboard notifications when relevant incidents are detected. You can subscribe to specific countries from the Telegram bot menu with /suscribir.

After your trip, share your experience by rating incidents you witnessed. Your rating helps other travelers get a more accurate picture and improves the automatic classification system.

For frequent travelers, the travel radar allows monitoring multiple destinations simultaneously with 12-month risk projection, adjusted for seasonality and geopolitical events.`,
  },
  {
    id: 'limitations',
    title: 'Limitations of Automated OSINT',
    content: `Automated OSINT has limitations that are important to understand:

False positives: not all signals are accurate. A social media rumor, a sensationalist news story or a GDELT error can generate unnecessary alerts. The clustering system requires multiple sources to create an incident, which reduces noise but does not eliminate it completely.

Uneven geographic coverage: GDELT has better coverage in countries with free and digitalized press. Countries with internet censorship or state-controlled media generate fewer signals, which can create a false sense of security.

Latency: although OSINT sources are faster than official ones, there is still a lag between a real event and its reflection in data. An earthquake appears on USGS in minutes; a protest may take hours to appear on Reddit or GDELT.

For these reasons, always cross-check alerts with official sources (MAEC, US State Dept) before making critical travel decisions.`,
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    content: `What is the difference between OSINT and traditional news? Traditional news goes through an editorial filter that introduces delay. OSINT captures raw signals from multiple sources, including social media and sensor data, without intermediate editing. It is faster but requires validation.

Does the system detect all incidents in a country? No. The system detects incidents that generate signals in its sources. An incident that does not appear on GDELT, Reddit, RSS, USGS, GDACS, WHO or ReliefWeb will not be detected. Coverage improves with each added source.

Can I trust automatic alerts? Alerts are an early warning system, not forensic verification. When you receive an alert, open the OSINT feed, check the original sources, and cross-reference with official sources before taking action.

How much does OSINT access cost? The public OSINT feed and country pages are free. Personalized Telegram alerts and the advanced dashboard require a premium subscription.

How often are sources updated? GDELT and USGS are queried every 6 hours. Reddit and RSS on the same cycle. WHO DON is queried similarly. The master cron runs daily at 06:00 UTC.`,
  },
];

const SOURCES_LIST = [
  { icon: Newspaper, name: 'GDELT', desc: 'Global news sentiment', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: MessageSquare, name: 'Reddit', desc: 'Traveler experiences', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Globe, name: 'RSS (AP, BBC, Reuters)', desc: 'Global breaking news', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: Activity, name: 'USGS', desc: 'Live earthquakes', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { icon: Shield, name: 'GDACS (UN)', desc: 'Natural disasters', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: Radio, name: 'OpenSky', desc: 'Airspace monitoring', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Database, name: 'WHO DON', desc: 'Epidemic outbreaks', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { icon: Globe, name: 'ReliefWeb', desc: 'Humanitarian emergencies', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: Bug, name: 'OSINT clustering', desc: 'AI + incident detection', color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

const RELATED = [
  { href: '/en/osint', label: 'Public OSINT Feed', desc: 'Active incidents with GDELT sentiment' },
  { href: '/en/fuentes-osint', label: 'All Sources', desc: 'Complete list with source descriptions' },
  { href: '/en/pulso-global', label: 'Global Pulse', desc: 'Real-time sentiment by country' },
  { href: '/en/alertas', label: 'Custom Alerts', desc: 'Subscribe to countries for notifications' },
  { href: '/en/metodologia', label: 'Analysis Methodology', desc: 'How signals are processed and classified' },
  { href: '/en/transparencia', label: 'System Limitations', desc: 'What the OSINT system can and cannot detect' },
  { href: '/en/travel-risk-intelligence', label: 'Travel Risk Intelligence', desc: 'Global travel intelligence overview' },
  { href: '/en/geopolitica-y-viajes', label: 'Geopolitics & Travel', desc: 'Conflicts, sanctions and airspace' },
];

export default function EnOsintParaViajerosPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/en" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Radio className="w-5 h-5 text-emerald-400" />
          <span className="text-xl font-bold text-white">OSINT for Travelers</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            OSINT for Travelers
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
            How open sources are used to monitor risks in your destinations. 
            Early warnings, sentiment analysis and automatic incident detection 
            so you travel informed.
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
                  headline: 'OSINT for Travelers | Open Source Intelligence for Safe Travel',
                  description: 'Complete guide to OSINT applied to travel: how to monitor geopolitical risks, natural disasters, health outbreaks and safety using open sources and AI analysis.',
                  author: { '@type': 'Person', name: 'M. Castillo' },
                  publisher: { '@type': 'Organization', name: 'Viaje con Inteligencia' },
                  datePublished: '2026-05-27',
                  dateModified: '2026-05-27',
                  image: 'https://www.viajeinteligencia.com/preview_favicon.jpg',
                },
                {
                  '@type': 'FAQPage',
                  mainEntity: [
                    { '@type': 'Question', name: 'What is the difference between OSINT and traditional news?', acceptedAnswer: { '@type': 'Answer', text: 'OSINT captures raw signals from multiple sources without intermediate editing. It is faster but requires validation.' } },
                    { '@type': 'Question', name: 'Does the system detect all incidents in a country?', acceptedAnswer: { '@type': 'Answer', text: 'No. It detects incidents that generate signals on GDELT, Reddit, RSS, USGS, GDACS, WHO or ReliefWeb. Coverage improves with each added source.' } },
                    { '@type': 'Question', name: 'Can I trust automatic alerts?', acceptedAnswer: { '@type': 'Answer', text: 'Alerts are an early warning system, not forensic verification. We recommend cross-checking with official sources before acting.' } },
                    { '@type': 'Question', name: 'How much does OSINT access cost?', acceptedAnswer: { '@type': 'Answer', text: 'The public OSINT feed and country pages are free. Personalized Telegram alerts require a premium subscription.' } },
                  ],
                },
              ],
            }),
          }}
        />

        <div className="grid md:grid-cols-3 gap-3 mb-12">
          {SOURCES_LIST.map(s => (
            <div key={s.name} className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <span className="text-white font-medium text-sm">{s.name}</span>
                <p className="text-slate-500 text-xs">{s.desc}</p>
              </div>
            </div>
          ))}
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

        <div className="mt-12 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20 p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Related Resources
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {RELATED.map(link => (
              <Link key={link.href} href={link.href}
                className="flex items-center gap-3 bg-slate-800/60 rounded-lg p-3 hover:bg-slate-700/60 transition-colors group">
                <div className="flex-1 min-w-0">
                  <span className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">{link.label}</span>
                  <p className="text-slate-500 text-xs mt-0.5">{link.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-300 text-sm font-medium mb-1">Limitations of Automated OSINT</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Automated OSINT does not replace human verification. Signals may contain 
                false positives (rumors, outdated news, disproportionate media coverage). 
                The clustering system aggregates multiple sources to reduce noise, but 
                always cross-check critical alerts with official sources.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
