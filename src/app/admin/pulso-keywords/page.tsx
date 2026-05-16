import type { Metadata } from 'next';
import PulsoKeywordsAdmin from './PulsoKeywordsAdmin';

export const metadata: Metadata = {
  title: 'Keywords del Pulso Global | Administración',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PulsoKeywordsAdmin />;
}
