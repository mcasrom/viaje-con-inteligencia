'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, Tag, Eye, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import StarRating from '@/components/StarRating';
import ShareButtons from '@/components/ShareButtons';

interface Post {
  slug: string;
  title: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
  image: string;
  keywords: string | string[];
  excerpt: string;
  content: string;
  tags?: string[];
  description?: string;
}

function BlogPostRating({ slug }: { slug: string }) {
  const [average, setAverage] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/posts/rate?slug=${slug}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        setAverage(data.average || 0);
        setUserRating(data.userRating || 0);
        setCount(data.count || 0);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug]);

  const handleRate = async (value: number) => {
    setError('');
    const res = await fetch('/api/posts/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, rating: value }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Error al valorar');
      return;
    }
    const data = await res.json();
    setAverage(data.average || 0);
    setUserRating(data.userRating || 0);
    setCount(data.count || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 justify-center">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-5 h-5 bg-slate-700 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <StarRating initialRating={average} onRate={handleRate} size="md" />
        <span className="text-slate-400 text-sm">
          {count > 0 ? `(${count} valoraciones)` : 'Sin valoraciones'}
        </span>
      </div>
      {userRating > 0 && (
        <span className="text-yellow-400 text-xs">Tu valoración: {userRating}/5</span>
      )}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

function BlogPostViews({ slug }: { slug: string }) {
  const [views, setViews] = useState(0);
  const countedRef = useRef(false);

  useEffect(() => {
    fetch(`/api/posts/views?slug=${slug}`)
      .then(res => res.json())
      .then(data => setViews(data.views || 0))
      .catch(() => {});
    
    if (!countedRef.current) {
      const sessionKey = `viewed_${slug}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, '1');
        countedRef.current = true;
        fetch('/api/posts/views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        }).catch(() => {});
      }
    }
  }, [slug]);

  return (
    <span className="flex items-center gap-1 text-slate-400 text-sm">
      <Eye className="w-4 h-4" />
      {views.toLocaleString()} vistas
    </span>
  );
}

function OptimizedImage({ src, alt, title }: { src: string; alt: string; title?: string }) {
  const isRemote = src.startsWith('http') || src.startsWith('//');
  const hasRemotePattern = isRemote && (
    src.includes('unsplash.com') ||
    src.includes('images.unsplash.com') ||
    src.includes('cdn.') ||
    src.includes('i.imgur.com') ||
    src.includes('i.ytimg.com')
  );

  if (hasRemotePattern) {
    return (
      <figure className="my-8">
        <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden">
          <Image
            src={src}
            alt={alt || title || ''}
            fill
            className="object-contain"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          />
        </div>
        {(alt || title) && (
          <figcaption className="text-center text-slate-500 text-sm mt-2 italic">
            {alt || title}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className="my-8">
      <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center">
        {src.startsWith('/') ? (
          <Image
            src={src}
            alt={alt || title || ''}
            fill
            className="object-contain"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          />
        ) : (
          <img
            src={src}
            alt={alt || title || ''}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        )}
      </div>
      {(alt || title) && (
        <figcaption className="text-center text-slate-500 text-sm mt-2 italic">
          {alt || title}
        </figcaption>
      )}
    </figure>
  );
}

export default function BlogPostPage({ post }: { post: Post }) {
  if (!post) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Post no encontrado</h1>
          <Link href="/blog" className="text-blue-400 hover:text-blue-300">
            ← Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/blog" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al blog</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <article>
          <div className="text-center mb-6">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-2">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-slate-400 text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
              <BlogPostViews slug={post.slug} />
            </div>
            <div className="mt-2 flex items-center justify-center gap-3">
              <BlogPostRating slug={post.slug} />
              <ShareButtons title={post.title} description={post.excerpt || post.description} size="sm" />
            </div>
          </div>

          <div className="mt-8">
            {post.image && post.image.trim() !== '' ? (
              <div className="rounded-2xl overflow-hidden relative w-full h-48 md:h-64">
                <Image src={post.image} alt={post.title} fill className="object-cover opacity-80 grayscale-[20%]" loading="lazy" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden relative w-full h-48 md:h-64">
                <Image src="/blog-header.jpg" alt={post.title} fill className="object-cover opacity-80 grayscale-[20%]" loading="lazy" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            )}
          </div>

          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({ src, alt, title }) => {
                  if (!src || typeof src !== 'string') return null;
                  return <OptimizedImage src={src} alt={alt || ''} title={typeof title === 'string' ? title : undefined} />;
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-700">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-slate-400" />
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-full hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

      <footer className="bg-slate-800 border-t border-slate-700 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Link href="/blog" className="text-blue-400 hover:text-blue-300">
            ← Volver al blog
          </Link>
        </div>
      </footer>
    </div>
  );
}