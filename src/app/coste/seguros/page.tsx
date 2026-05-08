import { Suspense } from 'react';
import SegurosForm from './SegurosForm';

export default function SegurosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Cargando...</div>
      </div>
    }>
      <SegurosForm />
    </Suspense>
  );
}
