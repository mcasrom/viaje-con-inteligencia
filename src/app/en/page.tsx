import MapaMundial from '@/components/MapaMundial';
import Testimonios from '@/components/Testimonios';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Travel Smart | MAEC Travel Risk Map - Risk Zero',
  description: 'Your complete guide to safe travel. Interactive travel risk map by country according to Spanish MAEC. Embassies, requirements, tips.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/en',
  },
};

export default function HomeEN() {
  return <MapaMundial />;
}