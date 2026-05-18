import type { Metadata } from 'next';
import TestMap from './TestMap';

export const metadata: Metadata = {
  title: 'Leaflet Test - ViajeIA',
  robots: 'noindex',
};

export default function Page() {
  return <TestMap />;
}
