import type { Metadata } from 'next';
import SentimentTrendsClient from './SentimentTrendsClient';

export const metadata: Metadata = {
  title: 'Tendencias de Sentimiento | Administración',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SentimentTrendsClient />;
}
