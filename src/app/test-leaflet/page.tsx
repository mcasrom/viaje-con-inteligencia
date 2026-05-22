import type { Metadata } from 'next';
import TestMap from './TestMap';

export const metadata: Metadata = {
  title: 'Leaflet Test - ViajeIA',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/test-leaflet',
  },
  robots: 'noindex',
};

export default function Page() {
  return <TestMap />;
}
