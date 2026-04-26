'use client';

import { useState, useEffect } from 'react';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'trial_expired'
  | 'canceled'
  | 'none'
  | 'no_session'
  | 'no_configured'
  | 'error';

export interface SubscriptionInfo {
  premium: boolean;
  status: SubscriptionStatus;
  trialEnd: string | null;       // ISO string desde Supabase
  daysLeft: number | null;       // días restantes si está en trial
  trialExpired: boolean;
  email?: string;
  loading: boolean;
  error: string | null;
}

export function useSubscription(): SubscriptionInfo {
  const [info, setInfo] = useState<SubscriptionInfo>({
    premium: false,
    status: 'none',
    trialEnd: null,
    daysLeft: null,
    trialExpired: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        // Obtenemos el token de sesión de Supabase para pasarlo al endpoint
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

        let authHeader = '';
        if (supabaseUrl && supabaseKey) {
          const client = createClient(supabaseUrl, supabaseKey);
          const { data: { session } } = await client.auth.getSession();
          if (session?.access_token) {
            authHeader = `Bearer ${session.access_token}`;
          }
        }

        const res = await fetch('/api/subscription/check', {
          headers: authHeader ? { Authorization: authHeader } : {},
          cache: 'no-store',
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // Calcular días restantes si hay trial_end
        let daysLeft: number | null = null;
        let trialExpired = false;

        if (data.trialEnd) {
          const now = new Date();
          const end = new Date(data.trialEnd);
          const diff = end.getTime() - now.getTime();
          daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
          trialExpired = diff <= 0;
        }

        // Determinar status enriquecido
        let status: SubscriptionStatus = data.status || 'none';
        if (data.trialEnd && !data.premium) {
          status = trialExpired ? 'trial_expired' : 'trialing';
        }

        if (!cancelled) {
          setInfo({
            premium: data.premium ?? false,
            status,
            trialEnd: data.trialEnd ?? null,
            daysLeft,
            trialExpired,
            email: data.email,
            loading: false,
            error: null,
          });
        }
      } catch (err: any) {
        if (!cancelled) {
          setInfo(prev => ({
            ...prev,
            loading: false,
            error: err.message || 'Error al verificar suscripción',
          }));
        }
      }
    }

    fetchStatus();
    return () => { cancelled = true; };
  }, []);

  return info;
}
