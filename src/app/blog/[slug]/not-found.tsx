import Link from 'next/link';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function BlogNotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-700">
          <FileQuestion className="w-10 h-10 text-slate-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Artículo no encontrado</h1>
        <p className="text-slate-400 max-w-md mb-8">
          El artículo que buscas no existe o ha sido movido.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al blog
        </Link>
      </div>
    </div>
  );
}
