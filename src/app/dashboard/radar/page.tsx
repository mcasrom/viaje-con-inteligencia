import RadarClient from '@/components/RadarClient';

export const metadata = {
  title: 'Mi Radar de Viaje | Viaje Inteligente',
  description: 'Monitoriza tus próximos destinos de un vistazo',
};

export default function RadarPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <RadarClient />
    </div>
  );
}
