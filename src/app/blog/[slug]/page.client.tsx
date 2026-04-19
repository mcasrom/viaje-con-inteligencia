'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import StarRating from '@/components/StarRating';

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
  content: string;
  tags?: string[];
}

function BlogPostRating({ slug }: { slug: string }) {
  const [rating, setRating] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/posts/rate?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        setRating(data.average || 0);
        setCount(data.count || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleRate = async (value: number) => {
    await fetch('/api/posts/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, rating: value }),
    });
    setRating(value);
    setCount(prev => prev + 1);
  };

  if (loading) return null;

  return (
    <div className="flex items-center gap-3">
      <StarRating initialRating={rating} onRate={handleRate} size="md" />
      {count > 0 && (
        <span className="text-slate-400 text-sm">
          ({count})
        </span>
      )}
    </div>
  );
}

export default function BlogPostPage({ post }: { post: Post }) {
  const params = useParams();
  const slug = params.slug as string;

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
          <div className="text-center mb-12">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-6 mb-4">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-6 text-slate-400">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
            </div>
            <div className="mt-4">
              <BlogPostRating slug={slug} />
            </div>
          </div>

          {post.image && (
            <div className="mb-12 rounded-2xl overflow-hidden">
              <img src={post.image} alt={post.title} className="w-full h-64 md:h-96 object-cover" />
            </div>
          )}

          <div className="prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-700">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-slate-400" />
                {post.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-full">
                    {tag}
                  </span>
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