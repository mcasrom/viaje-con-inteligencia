import MapaMundial from '@/components/MapaMundial';
import Testimonios from '@/components/Testimonios';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Travel Smart | MAEC Travel Risk Map - Risk Zero',
  description: 'Your complete guide to safe travel. Interactive travel risk map by country according to Spanish MAEC. Embassies, requirements, tips.',
  authors: [{ name: 'M.Castillo' }],
  creator: 'M.Castillo',
  publisher: 'Viaje con Inteligencia',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/en',
  },
  openGraph: {
    title: 'Travel Smart | MAEC Travel Risk Map - Risk Zero',
    description: 'Interactive travel risk map by country. Official MAEC data, embassy contacts, visa requirements, and safety recommendations for every destination.',
    url: 'https://www.viajeinteligencia.com/en',
    siteName: 'Viaje con Inteligencia',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/preview_favicon.jpg',
        width: 1200,
        height: 630,
        alt: 'Viaje con Inteligencia - Travel Risk Map',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Smart | MAEC Travel Risk Map - Risk Zero',
    description: 'Interactive travel risk map by country. Official MAEC data, embassy contacts, and safety recommendations.',
    creator: '@ViajeIntel2026',
    images: ['/preview_favicon.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomeEN() {
  return <MapaMundial />;
}
