'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, BookOpen, TrendingUp, Clock3, Tag, Flame, ChevronLeft, ChevronRight, Filter, ArrowUpDown, Search } from 'lucide-react';
import NewsletterSignup from '@/components/NewsletterSignup';

interface Post {
  slug: string;
  title: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
  image: string;
  keywords: string;
  excerpt: string;
  tags?: string[];
  views?: number;
}

function PostCard({ post }: { post: Post }) {
  const isPopular = (post.views || 0) >= 10;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-blue-500 transition-colors group"
    >
      <div className="h-32 bg-gradient-to-br from-blue-900/80 via-slate-900/90 to-purple-900/80 overflow-hidden relative">
        {post.image && post.image.trim() !== '' && (post.image.startsWith('http') || post.image.startsWith('/') || post.image.endsWith('.jpg') || post.image.endsWith('.png') || post.image.endsWith('.webp')) ? (
          <>
            <img 
              src={post.image} 
              alt={post.title}
              className="w-full h-full object-cover opacity-40 blur-[1px] scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <img src="/favicon.jpg" alt="" className="w-16 h-16 rounded-xl shadow-2xl border-2 border-white/20 object-contain" />
            </div>
          </>
        ) : (
          <>
            <img 
              src="/blog-header.jpg" 
              alt={post.title}
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <img src="/favicon.jpg" alt="" className="w-16 h-16 rounded-xl shadow-2xl border-2 border-white/20 object-contain" />
            </div>
          </>
        )}
        {isPopular && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
            <Flame className="w-3 h-3" />
            Popular
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">
            {post.category}
          </span>
        </div>
        <h2 className="text-base font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
          {post.title}
        </h2>
        <div className="flex items-center gap-4 text-slate-500 text-xs">
          <span className="flex items-center gap-1">
            <Clock3 className="w-3 h-3" />
            {post.date ? new Date(post.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '2026'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.readTime}
          </span>
          {post.views !== undefined && post.views > 0 && (
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3" />
              {post.views}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function BlogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const page = parseInt(searchParams.get('page') || '1');
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'recent';
  const tab = searchParams.get('tab') || 'recientes';

  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tab);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [page, category, sort, tab, searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: '50',
        category: category,
        sort: activeTab === 'populares' ? 'popular' : sort,
        search: searchQuery,
      });
      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error('Error fetching posts:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/posts/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
  };

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (key !== 'page') params.set('page', '1');
    router.push(`/blog?${params.toString()}`);
  };

  const switchTab = (newTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    params.set('page', '1');
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al mapa</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="relative mb-10 rounded-2xl overflow-hidden">
          <img 
            src={getDailyPhoto()} 
            alt="Viajes" 
            className="w-full h-48 md:h-64 object-cover opacity-40 grayscale-[30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
          <div className="absolute bottom-0 right-0 p-4 text-xs text-slate-500">
            Foto del día
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/30 text-blue-300 rounded-full text-sm font-medium mb-3 backdrop-blur-sm">
              <BookOpen className="w-4 h-4" />
              Blog de Viaje con Inteligencia
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Artículos para viajar smarter
            </h1>
            <p className="text-slate-300 max-w-2xl">
              Consejos prácticos, guías de destinos y análisis de riesgos para planificar tus viajes con seguridad.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-slate-800 rounded-xl border border-slate-700">
          <div className="flex items-center gap-1 p-1 bg-slate-700 rounded-lg">
            <button
              onClick={() => switchTab('recientes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'recientes' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock3 className="w-4 h-4" />
              Recientes
            </button>
            <button
              onClick={() => switchTab('populares')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'populares' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4" />
              Populares
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar posts..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length >= 2) {
                    updateParams('search', e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateParams('search', searchQuery);
                  }
                }}
                className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg text-sm border border-slate-600 focus:border-blue-500 w-48"
              />
            </div>
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={category}
              onChange={(e) => updateParams('category', e.target.value)}
              className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm border border-slate-600 focus:border-blue-500"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => updateParams('sort', e.target.value)}
              className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm border border-slate-600 focus:border-blue-500"
            >
              <option value="recent">Más recientes</option>
              <option value="oldest">Más antiguos</option>
            </select>
          </div>

          <span className="text-slate-400 text-sm ml-auto">
            {posts.length} artículos
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => updateParams('page', p.toString())}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  page === p
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No hay artículos en esta categoría.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post: Post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>

            
          </>
        )}

        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            ¿Quieres recibir alertas de seguridad?
          </h3>
          <p className="text-white/80 mb-6">
            Únete a nuestro canal de Telegram para recibir actualizaciones en tiempo real sobre riesgos de viaje.
          </p>
          <a
            href="https://t.me/ViajeConInteligenciaBot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Probar Bot IA
          </a>
        </div>

        <div className="mt-16">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              📋 Checklist Premium Gratis
            </h3>
            <p className="text-white/80 mb-6">
              Descarga nuestra guía gratuita con 80+ cosas esenciales para tu próximo viaje. 
             Incluye: documentos, sanidad, seguridad, dinero y más.
            </p>
            <Link
              href="/checklist"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-lg font-bold hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar Checklist
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <NewsletterSignup />
        </div>
      </main>

      <footer className="bg-slate-800 border-t border-slate-700 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} M.Castillo - Viaje con Inteligencia
          </p>
        </div>
      </footer>
    </div>
  );
}

// Fotos en /public/photos/ se añaden automáticamente
// Nombra: 1.jpg, 2.jpg, 3.jpg... (sin código necesario)
const MAX_PHOTOS = 4;
function getDailyPhoto() {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const idx = (dayOfYear % MAX_PHOTOS) + 1;
  return `/photos/${idx}.jpg`;
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <BlogContent />
    </Suspense>
  );
}
