'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';

export function useRequirePremium() {
  const { premium, loading } = useSubscription();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !premium) {
      router.push('/premium?redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [premium, loading, router]);

  return { isPremium: premium, loading };
}
