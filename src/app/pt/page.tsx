import MapaMundial from '@/components/MapaMundial';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Viagem Inteligente | Mapa de Riscos MAEC - Risco Zero',
  description: 'Seu guia completo para viagens seguras. Mapa interativo de riscos por país segundo MAEC espanhol.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/pt',
  },
};

export default function HomePT() {
  return <MapaMundial />;
}