import type { Metadata } from 'next';
import SkeletonPage from '@/components/SkeletonPage';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SkeletonPage title="Clima por País" />;
}
