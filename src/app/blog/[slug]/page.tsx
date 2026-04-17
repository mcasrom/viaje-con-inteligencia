import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Share2, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getPostBySlug, getPostSlugs, getRelatedPosts } from '@/lib/posts';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    return { title: 'Post no encontrado' };
  }

  return {
    title: `${post.title} | Viaje con Inteligencia`,
    description: post.excerpt,
    keywords: post.keywords,
  };
}

export default async function ArticuloPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

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
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 md:p-10 border border-slate-700 mb-8">
            <div className="prose prose-invert prose-lg max-w-none
              prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white
              prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-code:text-blue-300 prose-code:bg-slate-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-slate-700 prose-pre:border prose-pre:border-slate-600
              prose-ul:text-slate-300 prose-ol:text-slate-300
              prose-li:marker:text-slate-500
              prose-blockquote:border-l-blue-500 prose-blockquote:text-slate-400
            ">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <Tag className="w-4 h-4 text-slate-400 mt-1" />
              {post.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-slate-700/50 text-slate-300 text-sm rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {(() => {
            const relatedPosts = getRelatedPosts(slug, 3);
            if (relatedPosts.length === 0) return null;
            return (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
                <h3 className="text-white font-semibold mb-4">📚 Artículos relacionados</h3>
                <div className="grid md:grid-cols-{Math.min(relatedPosts.length, 3)} gap-4">
                  {relatedPosts.map((related) => (
                    <Link key={related.slug} href={`/blog/${related.slug}`} className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                      <p className="text-blue-400 text-sm mb-1">{related.category}</p>
                      <p className="text-white font-medium">{related.title}</p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              ← Volver al blog
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
              Compartir
            </button>
          </div>
</article>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BlogPosting',
                headline: post.title,
                image: [post.image],
                datePublished: post.date,
                dateModified: post.date,
                author: {
                  '@type': 'Person',
                  name: post.author,
                },
                description: post.excerpt,
                keywords: post.keywords,
              }),
            }}
          />
        </main>
    </div>
  );
}
