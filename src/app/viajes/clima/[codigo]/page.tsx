import type { Metadata } from 'next';
import SkeletonPage from '@/components/SkeletonPage';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://www.viajeinteligencia.com/viajes/clima' },
};

export default function Page() {
  return <SkeletonPage title="Clima por País" />;
}
