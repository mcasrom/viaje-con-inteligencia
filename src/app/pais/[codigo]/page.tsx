import { getTodosLosPaises } from '@/data/paises';
import { getPostsPagination } from '@/lib/posts';
import DetallePaisClient from './DetallePaisClient';

export function generateStaticParams() {
  return getTodosLosPaises().map(p => ({ codigo: p.codigo }));
}

export async function generateMetadata({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const pais = getTodosLosPaises().find(p => p.codigo === codigo);
  return {
    title: `${pais?.nombre || codigo} — Riesgo, Visado y Consejos | Viaje Inteligencia`,
    description: `Ficha completa de ${pais?.nombre}: nivel de riesgo MAEC, visado, clima, transporte, POIs y recomendaciones IA.`,
    alternates: {
      canonical: `https://www.viajeinteligencia.com/pais/${codigo}`,
    },
  };
}

export default async function PaisPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const pais = getTodosLosPaises().find(p => p.codigo === codigo);

  if (!pais) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">País no encontrado</h1>
          <a href="/" className="text-blue-400 hover:underline">Volver al mapa →</a>
        </div>
      </div>
    );
  }

  const { posts: relatedPosts } = getPostsPagination(1, 3, { category: pais.nombre, sort: 'recent' });

  return <DetallePaisClient pais={pais} relatedPosts={relatedPosts} />;
}
