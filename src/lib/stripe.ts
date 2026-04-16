import Stripe from 'stripe';

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25.dahlia',
    })
  : null;

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not configured - Stripe features disabled');
}

export const PLANS = {
  monthly: {
    name: 'Premium Mensual',
    price: 499, // cents (4.99€)
    interval: 'month' as const,
    priceId: process.env.STRIPE_PRICE_MONTHLY || '',
  },
  yearly: {
    name: 'Premium Anual',
    price: 4999, // cents (49.99€)
    interval: 'year' as const,
    priceId: process.env.STRIPE_PRICE_YEARLY || '',
  },
};

export const PREMIUM_FEATURES = [
  { name: 'Bot IA conversacional', free: false },
  { name: 'Alertas en tiempo real', free: false },
  { name: 'Checklist completo', free: false },
  { name: 'Itinerario inteligente IA', free: false },
  { name: 'Análisis de gastos', free: false },
  { name: 'Acceso prioritario nuevos países', free: false },
  { name: 'Mapa riesgos básico', free: true },
  { name: 'Info embajadas', free: true },
  { name: 'Consejos generales', free: true },
];
