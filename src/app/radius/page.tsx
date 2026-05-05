import RadiusExplorer from './RadiusExplorer';

export const metadata = {
  title: 'Radio Inteligente — Descubre destinos con scoring IA',
  description: 'Encuentra destinos seguros, con buen clima y POIs cerca de cualquier punto del mundo.',
  alternates: {
    canonical: 'https://www.viajeinteligencia.com/radius',
  },
};

export default function RadiusPage() {
  return <RadiusExplorer />;
}
