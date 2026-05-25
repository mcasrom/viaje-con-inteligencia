import type { Metadata } from 'next';
import NewsletterSignup from '@/components/NewsletterSignup';

export const metadata: Metadata = {
  title: 'Newsletter | Briefing Semanal - Viaje con Inteligencia',
  description: 'Lee el briefing semanal de Viaje con Inteligencia: alertas de riesgo, cambios IRV, destino destacado y análisis OSINT. Suscríbete gratis.',
  openGraph: {
    title: 'Briefing Semanal — Viaje con Inteligencia',
    description: 'Alertas de riesgo, cambios IRV y análisis semanal de destinos.',
    url: 'https://www.viajeinteligencia.com/newsletter',
    siteName: 'Viaje con Inteligencia',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Briefing Semanal — Viaje con Inteligencia',
    description: 'Alertas de riesgo, cambios IRV y análisis semanal de destinos.',
  },
};

async function getLatestNewsletter(): Promise<string | null> {
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data } = await supabase!
      .from('newsletter_history')
      .select('content, subject, sent_at')
      .order('sent_at', { ascending: false })
      .limit(1)
      .single();
    return data?.content || null;
  } catch {
    return null;
  }
}

export default async function NewsletterPage() {
  const content = await getLatestNewsletter();

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            Briefing Semanal
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Inteligencia de viaje, cada semana
          </h1>
          <p className="text-slate-400 text-base max-w-2xl">
            Alertas MAEC, cambios de riesgo, destinos recomendados y análisis OSINT.
            Todo lo que necesitas para decidir con datos, no con suposiciones.
          </p>
        </div>

        <div className="mb-10">
          <NewsletterSignup variant="blog" />
        </div>

        {content ? (
          <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-2xl p-12 text-center border border-slate-700">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No hay newsletter disponible aún
            </h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              El briefing semanal se publica los lunes. Suscríbete para recibirlo
              directamente en tu correo en cuanto esté listo.
            </p>
            <div className="max-w-md mx-auto">
              <NewsletterSignup variant="footer" />
            </div>
          </div>
        )}

        <div className="mt-10 text-center text-slate-600 text-xs">
          <p>
            ¿Ya estás suscrito?
            {' '}
            <a href="/api/newsletter/subscribe?action=unsubscribe&email=tu@email.com" className="underline hover:text-slate-400">
              Cancelar suscripción
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
