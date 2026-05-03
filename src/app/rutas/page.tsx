import dynamic from 'next/dynamic';

const RutasClient = dynamic(() => import('./RutasClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function RutasPage() {
  return <RutasClient />;
}
